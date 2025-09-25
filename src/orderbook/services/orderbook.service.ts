import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OrderBookRepository } from '../repository/orderBook.repository';
import { LoggerService } from '../../utils/logger/WinstonLogger';
import {
  CreateBuyOrderReqDto,
  CreateOrderBookReqDto,
  IBuyTrade,
  IOrderBook,
  ISellTrade,
  IStockTradeSummary,
  ITrade,
} from '../dto';
import { errorMessages, OrderSideEnum } from '../../core/config';
import { CreateSellOrderReqDto } from '../dto/requests/sell-order.dto';
import { OrderBookEntity } from '../entities/orderbook.entity';
import { UserService } from '../../users/services/users.service';
import { OrderHistoryService } from '../../orderHistory/services/orderHistory.service';
import { v4 as uuid } from 'uuid';
import { CustomError, NotFoundException } from '../../core/errors';
import { DataSource, EntityManager } from 'typeorm';

export interface IOrderbookService {
  createOrder(
    userId: string,
    orderInfo: CreateOrderBookReqDto,
  ): Promise<OrderBookEntity>;

  getOrderBooks(
    userId: string,
    stockName?: string,
    side?: OrderSideEnum,
  ): Promise<IOrderBook>;

  getOrdersByUserId(
    userId: string,
    side?: OrderSideEnum,
    stockName?: string,
  ): Promise<OrderBookEntity[]>;

  deleteOrder(userId: string, id: string): Promise<void>;

  sellOrder(
    userId: string,
    orderInfo: CreateSellOrderReqDto,
  ): Promise<ISellTrade>;

  buyOrder(userId: string, orderInfo: CreateBuyOrderReqDto): Promise<IBuyTrade>;

  validateBalance(userId: string, updateFunds: number): Promise<boolean>;
}
@Injectable()
export class OrderbookService implements IOrderbookService {
  constructor(
    @Inject(OrderBookRepository)
    private readonly orderBookRepository: OrderBookRepository,

    private readonly logger: LoggerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly orderHistoryService: OrderHistoryService,

    private dataSource: DataSource,
  ) {}

  static logInfo = 'Service - OrderBook:';

  async createOrder(
    userId: string,
    orderInfo: CreateOrderBookReqDto,
  ): Promise<OrderBookEntity> {
    try {
      this.logger.info(
        `${OrderbookService.logInfo} Create Order for userId: ${userId}`,
      );
      const order = await this.orderBookRepository.save(userId, orderInfo);
      this.logger.info(
        `${OrderbookService.logInfo} Created Order for userId: ${userId}`,
      );
      return order;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.warn(`${OrderbookService.logInfo} ${error.message}`);
      throw error;
    }
  }

  async getOrderBooks(
    userId: string,
    stockName: string = '',
    side?: OrderSideEnum,
  ): Promise<IOrderBook> {
    try {
      this.logger.info(
        `${OrderbookService.logInfo} Fetching OrderBooks for stockName: ${stockName}`,
      );
      const rawOrderBooks = await this.orderBookRepository.getOrderBooks(
        userId,
        stockName,
        side,
      );
      const grouped: IOrderBook = {
        BUY: [] as IStockTradeSummary[],
        SELL: [] as IStockTradeSummary[],
      };

      rawOrderBooks.forEach((row) => {
        const side = row.side as OrderSideEnum;
        grouped[side].push({
          price: row.price,
          quantity: parseInt(row.quantity),
          stockName: row.stockName,
        });
      });
      this.logger.info(
        `${OrderbookService.logInfo} Fetched OrderBooks for stockName: ${stockName}`,
      );
      return grouped;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.warn(`${OrderbookService.logInfo} ${error.message}`);
      throw error;
    }
  }

  async getOrdersByUserId(
    userId: string,
    side?: OrderSideEnum,
    stockName?: string,
  ): Promise<OrderBookEntity[]> {
    try {
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
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.warn(`${OrderbookService.logInfo} ${error.message}`);
      throw error;
    }
  }

  async deleteOrder(userId: string, id: string): Promise<void> {
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `${OrderbookService.logInfo} ${error.message} for id: ${id}`,
      );
      throw error;
    }
  }

  async sellOrder(
    userId: string,
    orderInfo: CreateSellOrderReqDto,
  ): Promise<ISellTrade> {
    this.logInit('SELL', userId, orderInfo);
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const manager = queryRunner.manager;
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
          manager,
        });
      await this.applyOrderBookUpdates(ordersToRemove, ordersToUpdate, manager);

      const remainingOrder = await this.saveRemainingOrder(
        userId,
        orderInfo,
        remainingQuantity,
        manager,
      );

      await this.processFundsForSell(userId, trades, orderInfo.price, manager);

      const { totalQuantity, totalFunds } = this.summarizeTrades(trades);

      await this.recordOrderHistory(
        userId,
        orderInfo,
        remainingOrder?.id,
        totalQuantity,
        manager,
      );

      this.logComplete('SELL', userId, orderInfo, remainingQuantity);
      await queryRunner.commitTransaction();
      return {
        totalStockSold: totalQuantity,
        fundsAdded: totalFunds,
        trades,
        remainingOrder,
      };
    } catch (error) {
      this.logger.warn(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `${OrderbookService.logInfo} ${error.message} for userId: ${userId} payload: ${JSON.stringify(orderInfo)}`,
      );
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async buyOrder(
    userId: string,
    orderInfo: CreateBuyOrderReqDto,
  ): Promise<IBuyTrade> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const manager = queryRunner.manager;
      this.logInit('BUY', userId, orderInfo);

      if (
        !(await this.validateBalance(
          userId,
          -orderInfo.price * orderInfo.quantity,
        ))
      ) {
        throw new CustomError(errorMessages.INSUFFICIENT_BALANCE);
      }

      const existingSellOrders = await this.orderBookRepository.getOrderList(
        userId,
        orderInfo,
      );

      const id: string = uuid();
      const { trades, ordersToRemove, ordersToUpdate, remainingQuantity } =
        await this.matchOrders({
          initiatorId: userId,
          orderInfo,
          oppositeOrders: existingSellOrders,
          isSell: false,
          manager,
          orderId: id,
        });

      await this.applyOrderBookUpdates(ordersToRemove, ordersToUpdate, manager);

      const remainingOrder = await this.saveRemainingOrder(
        userId,
        orderInfo,
        remainingQuantity,
        manager,
        id,
      );

      await this.processFundsForBuy(userId, trades, manager);

      const { totalQuantity, totalFunds } = this.summarizeTrades(trades);

      this.logComplete('BUY', userId, orderInfo, remainingQuantity);
      await queryRunner.commitTransaction();
      return {
        totalStockBought: totalQuantity,
        fundsSpent: totalFunds,
        trades,
        remainingOrder,
      };
    } catch (error) {
      this.logger.warn(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `${OrderbookService.logInfo} ${error.message} for userId: ${userId} payload: ${JSON.stringify(orderInfo)}`,
      );
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async validateBalance(userId: string, updateFunds: number): Promise<boolean> {
    try {
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
    } catch (error) {
      this.logger.warn(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `${OrderbookService.logInfo} ${error.message} for userId: ${userId} payload: ${updateFunds}`,
      );
      throw error;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                              PRIVATE HELPERS                               */
  /* -------------------------------------------------------------------------- */

  private async matchOrders(params: {
    initiatorId: string;
    orderInfo: CreateBuyOrderReqDto | CreateSellOrderReqDto;
    oppositeOrders: OrderBookEntity[];
    isSell: boolean;
    manager: EntityManager;
    orderId?: string;
  }) {
    const { initiatorId, orderInfo, oppositeOrders, isSell, orderId, manager } =
      params;
    let remainingQuantity = orderInfo.quantity;
    const trades: ITrade[] = [];
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
        manager,
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
  ): ITrade {
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
  ): ITrade {
    return {
      buyerId: buyerId,
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
    manager: EntityManager,
    orderId?: string,
  ): Promise<void> {
    if (quantity <= 0) return;
    if (isSell) {
      await this.orderHistoryService.createOrderHistory(
        {
          ...opposite,
          price: orderInfo.price,
          quantity,
        },
        manager,
      );
    } else {
      await this.orderHistoryService.createOrderHistory(
        {
          ...opposite,
          quantity,
        },
        manager,
      );
      await this.orderHistoryService.createOrderHistory(
        {
          ...orderInfo,
          user: { id: initiatorId },
          id: (orderId as string) ?? uuid(),
          quantity,
          price: opposite.price,
        },
        manager,
      );
    }
  }

  private async applyOrderBookUpdates(
    remove: string[],
    update: { id: string; quantity: number }[],
    manager: EntityManager,
  ): Promise<void> {
    if (remove.length)
      await this.orderBookRepository.bulkRemoveOrders(remove, manager);
    if (update.length)
      await this.orderBookRepository.bulkUpdateQuantities(update, manager);
  }

  private async saveRemainingOrder(
    userId: string,
    orderInfo: CreateBuyOrderReqDto | CreateSellOrderReqDto,
    remainingQuantity: number,
    manager: EntityManager,
    id?: string,
  ): Promise<OrderBookEntity | null> {
    if (remainingQuantity <= 0) return null;
    return this.orderBookRepository.save(
      userId,
      { ...orderInfo, quantity: remainingQuantity },
      manager,
      id,
    );
  }

  private async processFundsForSell(
    sellerId: string,
    trades: ITrade[],
    price: number,
    manager: EntityManager,
  ): Promise<void> {
    const sellerCredit = trades.reduce((sum, t) => sum + t.quantity * price, 0);
    await this.userService.updateFunds(sellerId, sellerCredit, manager);

    const buyerDebits: Record<string, number> = {};
    for (const { buyerId, quantity, price: tradePrice } of trades) {
      buyerDebits[buyerId] =
        (buyerDebits[buyerId] || 0) - quantity * tradePrice;
    }

    for (const [buyerId, deltaFunds] of Object.entries(buyerDebits)) {
      await this.userService.updateFunds(buyerId, deltaFunds, manager);
    }
  }

  private async processFundsForBuy(
    buyerId: string,
    trades: any[],
    manager: EntityManager,
  ): Promise<void> {
    const sellerCredits: Record<string, number> = {};
    let buyerDebit = 0;

    for (const { sellerId, quantity, price } of trades) {
      const total = quantity * price;
      buyerDebit -= total;
      const sellerKey: string = String(sellerId);
      sellerCredits[sellerKey] = (sellerCredits[sellerKey] || 0) + total;
    }

    await this.userService.updateFunds(buyerId, buyerDebit, manager);

    await Promise.all(
      Object.entries(sellerCredits).map(([sellerId, delta]) => {
        return this.userService.updateFunds(sellerId, delta, manager);
      }),
    );
  }

  private async recordOrderHistory(
    userId: string,
    orderInfo: CreateSellOrderReqDto,
    orderId: string | undefined,
    totalQuantity: number,
    manager: EntityManager,
  ): Promise<void> {
    if (totalQuantity <= 0) return;
    await this.orderHistoryService.createOrderHistory(
      {
        id: (orderId as string) ?? uuid(),
        ...orderInfo,
        user: { id: userId },
        quantity: totalQuantity,
      },
      manager,
    );
  }

  private summarizeTrades(trades: { quantity: number; price: number }[]): {
    totalQuantity: number;
    totalFunds: number;
  } {
    return {
      totalQuantity: trades.reduce((sum, t) => sum + t.quantity, 0),
      totalFunds: trades.reduce((sum, t) => sum + t.quantity * t.price, 0),
    };
  }

  private logInit(type: 'BUY' | 'SELL', userId: string, info: any): void {
    this.logger.info(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `${OrderbookService.logInfo} ${type} order init | userId=${userId} | stock=${info.stockName} | qty=${info.quantity} | price=${info.price}`,
    );
  }

  private logComplete(
    type: 'BUY' | 'SELL',
    userId: string,
    info: any,
    remaining: number,
  ): void {
    this.logger.info(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `${OrderbookService.logInfo} ${type} order complete | userId=${userId} | filled=${info.quantity - remaining} | remaining=${remaining}`,
    );
  }
}
