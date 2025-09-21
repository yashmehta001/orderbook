import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OrderBookRepository } from '../repository/orderBook.repository';
import { LoggerService } from '../../utils/logger/WinstonLogger';
import { CreateBuyOrderReqDto, CreateOrderBookReqDto } from '../dto';
import { OrderSideEnum } from '../../core/config';
import { CreateSellOrderReqDto } from '../dto/requests/sell-order.dto';
import { OrderBookEntity } from '../entities/orderbook.entity';
import { UserService } from '../../users/services/users.service';
import { OrderHistoryService } from '../../orderHistory/services/orderHistory.service';
import { v4 as uuid } from 'uuid';
import { CustomError, NotFoundException } from '../../core/errors';
@Injectable()
export class OrderbookService {
  constructor(
    @Inject(OrderBookRepository)
    private readonly orderBookRepository: OrderBookRepository,

    private readonly logger: LoggerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly orderHistoryService: OrderHistoryService,
  ) {}

  static logInfo = 'Service - OrderBook:';

  async createOrder(userId: string, orderInfo: CreateOrderBookReqDto) {
    this.logger.info(
      `${OrderbookService.logInfo} Create Order for userId: ${userId}`,
    );
    const order = await this.orderBookRepository.save(userId, orderInfo);
    this.logger.info(
      `${OrderbookService.logInfo} Created Order for userId: ${userId}`,
    );
    return order;
  }

  async getOrderBooks(
    userId: string,
    stockName: string = '',
    side?: OrderSideEnum,
  ) {
    this.logger.info(
      `${OrderbookService.logInfo} Fetching OrderBooks for stockName: ${stockName}`,
    );
    const rawOrderBooks = await this.orderBookRepository.getOrderBooks(
      userId,
      stockName,
      side,
    );
    const grouped = {
      BUY: [] as { price: number; quantity: number; stockName: string }[],
      SELL: [] as { price: number; quantity: number; stockName: string }[],
    };

    rawOrderBooks.forEach((row) => {
      const side = row.side as OrderSideEnum;
      grouped[side].push({
        price: parseFloat(row.price),
        quantity: parseInt(row.quantity),
        stockName: row.stockName,
      });
    });
    this.logger.info(
      `${OrderbookService.logInfo} Fetched OrderBooks for stockName: ${stockName}`,
    );
    return grouped;
  }

  async getOrdersByUserId(
    userId: string,
    side?: OrderSideEnum,
    stockName?: string,
  ) {
    this.logger.info(
      `${OrderbookService.logInfo} Fetching Orders for userId: ${userId}`,
    );
    const orders = await this.orderBookRepository.getOrdersByUserId(
      userId,
      stockName,
      side,
    );
    this.logger.info(
      `${OrderbookService.logInfo} Fetched Orders for userId: ${userId}`,
    );
    return orders;
  }

  async deleteOrder(userId: string, id: string) {
    try {
      this.logger.info(
        `${OrderbookService.logInfo} Deleting Order id: ${id} for userId: ${userId}`,
      );
      const order = await this.orderBookRepository.getOrderById(id, userId);
      if (!order) {
        this.logger.warn(
          `${OrderbookService.logInfo} Not Found! Order with id: ${id}`,
        );
        throw new NotFoundException();
      }
      await this.orderBookRepository.bulkRemoveOrders([id]);
      this.logger.info(
        `${OrderbookService.logInfo} Deleted Order id: ${id} for userId: ${userId}`,
      );
      return;
    } catch (error) {
      this.logger.warn(
        `${OrderbookService.logInfo} ${error.message} for id: ${id}`,
      );
      throw error;
    }
  }

  // ToDo: Add transactions
  async sellOrder(userId: string, orderInfo: CreateSellOrderReqDto) {
    this.logInit('SELL', userId, orderInfo);

    const existingBuyOrders = await this.orderBookRepository.getOrderList(
      userId,
      orderInfo,
    );
    const { trades, ordersToRemove, ordersToUpdate, remainingQuantity } =
      await this.matchOrders({
        initiatorId: userId,
        orderInfo,
        oppositeOrders: existingBuyOrders,
        isSell: true,
      });
    await this.applyOrderBookUpdates(ordersToRemove, ordersToUpdate);

    const remainingOrder = await this.saveRemainingOrder(
      userId,
      orderInfo,
      remainingQuantity,
    );

    await this.processFundsForSell(userId, trades, orderInfo.price);

    const { totalQuantity, totalFunds } = this.summarizeTrades(trades);

    await this.recordOrderHistory(
      userId,
      orderInfo,
      remainingOrder?.id,
      totalQuantity,
    );

    this.logComplete('SELL', userId, orderInfo, remainingQuantity);

    return {
      totalStockSold: totalQuantity,
      fundsAdded: totalFunds,
      trades,
      remainingOrder,
    };
  }

  async buyOrder(userId: string, orderInfo: CreateBuyOrderReqDto) {
    this.logInit('BUY', userId, orderInfo);

    if (
      !(await this.validateBalance(
        userId,
        -orderInfo.price * orderInfo.quantity,
      ))
    ) {
      throw new CustomError('Insufficient Balance');
    }

    const existingSellOrders = await this.orderBookRepository.getOrderList(
      userId,
      orderInfo,
    );

    const id = uuid();
    const { trades, ordersToRemove, ordersToUpdate, remainingQuantity } =
      await this.matchOrders({
        initiatorId: userId,
        orderInfo,
        oppositeOrders: existingSellOrders,
        isSell: false,
        orderId: id,
      });

    await this.applyOrderBookUpdates(ordersToRemove, ordersToUpdate);

    const remainingOrder = await this.saveRemainingOrder(
      userId,
      orderInfo,
      remainingQuantity,
      id,
    );

    await this.processFundsForBuy(userId, trades);

    const { totalQuantity, totalFunds } = this.summarizeTrades(trades);

    this.logComplete('BUY', userId, orderInfo, remainingQuantity);

    return {
      totalStockBought: totalQuantity,
      fundsSpent: totalFunds,
      trades,
      remainingOrder,
    };
  }

  async validateBalance(userId: string, updateFunds: number): Promise<boolean> {
    if (updateFunds > 0) return true;

    const { funds } = await this.userService.profile(userId);
    const presentBuyOrders = await this.getOrdersByUserId(
      userId,
      OrderSideEnum.BUY,
    );

    const pledged = presentBuyOrders.reduce(
      (sum, o) => sum + (o?.price ?? 0) * (o?.quantity ?? 0) * -1,
      0,
    );

    return funds + updateFunds + pledged >= 0;
  }

  /* -------------------------------------------------------------------------- */
  /*                              PRIVATE HELPERS                               */
  /* -------------------------------------------------------------------------- */

  private async matchOrders(params: {
    initiatorId: string;
    orderInfo: CreateBuyOrderReqDto | CreateSellOrderReqDto;
    oppositeOrders: OrderBookEntity[];
    isSell: boolean;
    orderId?: string;
  }) {
    const { initiatorId, orderInfo, oppositeOrders, isSell, orderId } = params;
    let remainingQuantity = orderInfo.quantity;
    const trades: any[] = [];
    const ordersToRemove: string[] = [];
    const ordersToUpdate: { id: string; quantity: number }[] = [];

    for (const opposite of oppositeOrders) {
      if (remainingQuantity <= 0) break;

      const availableQty = opposite.quantity;
      const tradeQty = Math.min(remainingQuantity, availableQty);

      const trade = isSell
        ? this.buildSellTrade(opposite, initiatorId, orderInfo, tradeQty)
        : this.buildBuyTrade(
            opposite,
            initiatorId,
            orderInfo,
            tradeQty,
            orderId!,
          );

      trades.push(trade);

      await this.recordTradeHistory(
        isSell,
        initiatorId,
        opposite,
        orderInfo,
        tradeQty,
        orderId,
      );

      if (availableQty <= remainingQuantity) {
        ordersToRemove.push(opposite.id);
      } else {
        ordersToUpdate.push({
          id: opposite.id,
          quantity: availableQty - tradeQty,
        });
      }

      remainingQuantity -= tradeQty;
    }

    return { trades, ordersToRemove, ordersToUpdate, remainingQuantity };
  }

  private buildSellTrade(
    opposite: OrderBookEntity,
    sellerId: string,
    orderInfo: CreateSellOrderReqDto,
    qty: number,
  ) {
    return {
      buyOrderId: opposite.id,
      buyerId: opposite?.user?.id,
      sellUserId: sellerId,
      stockName: orderInfo.stockName,
      price: orderInfo.price,
      quantity: qty,
    };
  }

  private buildBuyTrade(
    opposite: OrderBookEntity,
    buyerId: string,
    orderInfo: CreateBuyOrderReqDto,
    qty: number,
    orderId: string,
  ) {
    return {
      buyUserId: buyerId,
      sellOrderId: opposite.id,
      sellerId: opposite?.user?.id,
      stockName: orderInfo.stockName,
      price: opposite.price,
      quantity: qty,
      id: orderId,
    };
  }

  private async recordTradeHistory(
    isSell: boolean,
    initiatorId: string,
    opposite: OrderBookEntity,
    orderInfo: CreateBuyOrderReqDto | CreateSellOrderReqDto,
    quantity: number,
    orderId?: string,
  ) {
    if (quantity<=0) return 
    if (isSell) {
      await this.orderHistoryService.createOrderHistory({
        ...opposite,
        price: orderInfo.price,
        quantity,
      });
    } else {
      await this.orderHistoryService.createOrderHistory({
        ...opposite,
        quantity,
      });
      await this.orderHistoryService.createOrderHistory({
        ...orderInfo,
        user: { id: initiatorId },
        id: orderId?? uuid(),
        quantity,
        price: opposite.price,
      });
    }
  }

  private async applyOrderBookUpdates(
    remove: string[],
    update: { id: string; quantity: number }[],
  ) {
    if (remove.length > 0)
      await this.orderBookRepository.bulkRemoveOrders(remove);
    if (update.length > 0)
      await this.orderBookRepository.bulkUpdateQuantities(update);
  }

  private async saveRemainingOrder(
    userId: string,
    orderInfo: CreateBuyOrderReqDto | CreateSellOrderReqDto,
    remainingQuantity: number,
    id?: string,
  ) {
    if (remainingQuantity <= 0) return null;
    return this.orderBookRepository.save(
      userId,
      { ...orderInfo, quantity: remainingQuantity },
      id,
    );
  }

  private async processFundsForSell(
    sellerId: string,
    trades: any[],
    price: number,
  ) {
    const sellerCredit = trades.reduce((sum, t) => sum + t.quantity * price, 0);
    await this.userService.updateFunds(sellerId, sellerCredit);

    const buyerDebits: Record<string, number> = {};
    for (const { buyerId, quantity, price: tradePrice } of trades) {
      buyerDebits[buyerId] =
        (buyerDebits[buyerId] || 0) - quantity * tradePrice;
    }

    for (const [buyerId, deltaFunds] of Object.entries(buyerDebits)) {
      await this.userService.updateFunds(buyerId, deltaFunds);
    }
  }

  private async processFundsForBuy(buyerId: string, trades: any[]) {
    const sellerCredits: Record<string, number> = {};
    let buyerDebit = 0;

    for (const { sellerId, quantity, price } of trades) {
      const total = quantity * price;
      buyerDebit -= total;
      sellerCredits[sellerId] = (sellerCredits[sellerId] || 0) + total;
    }

    await this.userService.updateFunds(buyerId, buyerDebit);

    for (const [sellerId, delta] of Object.entries(sellerCredits)) {
      await this.userService.updateFunds(sellerId, delta);
    }
  }

  private async recordOrderHistory(
    userId: string,
    orderInfo: CreateSellOrderReqDto,
    orderId: string | undefined,
    totalQuantity: number,
  ) {
    if (totalQuantity<=0) return 
    await this.orderHistoryService.createOrderHistory({
      id: orderId ?? uuid(),
      ...orderInfo,
      user: { id: userId },
      quantity: totalQuantity,
    });
  }

  private summarizeTrades(trades: any[]) {
    return {
      totalQuantity: trades.reduce((sum, t) => sum + t.quantity, 0),
      totalFunds: trades.reduce((sum, t) => sum + t.quantity * t.price, 0),
    };
  }

  private logInit(type: 'BUY' | 'SELL', userId: string, info: any) {
    this.logger.info(
      `${OrderbookService.logInfo} ${type} order init | userId=${userId} | stock=${info.stockName} | qty=${info.quantity} | price=${info.price}`,
    );
  }

  private logComplete(
    type: 'BUY' | 'SELL',
    userId: string,
    info: any,
    remaining: number,
  ) {
    this.logger.info(
      `${OrderbookService.logInfo} ${type} order complete | userId=${userId} | filled=${info.quantity - remaining} | remaining=${remaining}`,
    );
  }
}
