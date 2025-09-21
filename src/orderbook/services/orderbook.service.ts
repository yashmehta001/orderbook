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

  // ToDo: Refactor and split into smaller methods
  // ToDo: Add transactions
  async sellOrder(userId: string, orderInfo: CreateSellOrderReqDto) {
    this.logger.info(
      `${OrderbookService.logInfo} Sell order init | userId=${userId} | stock=${orderInfo.stockName} | qty=${orderInfo.quantity} | price=${orderInfo.price}`,
    );

    // 1️⃣ Get all eligible BUY orders in one query
    const existingBuyOrders = await this.orderBookRepository.getOrderList(
      userId,
      orderInfo,
    );
    console.log(userId);
    console.log(existingBuyOrders);

    // 2️⃣ Match SELL against BUY
    const { trades, ordersToRemove, ordersToUpdate, remainingQuantity } =
      await this.matchSellWithBuyOrders(userId, orderInfo, existingBuyOrders);

    // 3️⃣ Bulk DB writes (orders cleanup)
    if (ordersToRemove.length > 0) {
      await this.orderBookRepository.bulkRemoveOrders(ordersToRemove);
    }
    if (ordersToUpdate.length > 0) {
      await this.orderBookRepository.bulkUpdateQuantities(ordersToUpdate);
    }

    // 4️⃣ Save remaining SELL order (if not fully matched)
    let remainingOrder: OrderBookEntity | null = null;

    if (remainingQuantity > 0) {
      remainingOrder = await this.orderBookRepository.save(userId, {
        ...orderInfo,
        quantity: remainingQuantity,
      });
    }

    // 5️⃣ Process funds movement (buyer loses, seller gains)
    await this.processFunds(userId, trades, orderInfo.price);

    this.logger.info(
      `${OrderbookService.logInfo} Sell order complete | filled=${
        orderInfo.quantity - remainingQuantity
      } | remaining=${remainingQuantity}`,
    );
    const totalStockSold = trades.reduce((sum, t) => sum + t.quantity, 0);
    const fundsAdded = trades.reduce((sum, t) => sum + t.quantity * t.price, 0);
    await this.orderHistoryService.createOrderHistory({
      id: remainingOrder?.id ?? uuid(),
      ...orderInfo,
      user: { id: userId },
      quantity: totalStockSold,
    });
    return {
      totalStockSold,
      fundsAdded,
      trades,
      remainingOrder,
    };
  }

  /**
   * 🔹 Core matching logic
   */
  private async matchSellWithBuyOrders(
    sellerId: string,
    orderInfo: CreateSellOrderReqDto,
    buyOrders: OrderBookEntity[],
  ) {
    let remainingQuantity = orderInfo.quantity;
    const trades: any[] = [];
    const ordersToRemove: string[] = [];
    const ordersToUpdate: { id: string; quantity: number }[] = [];

    for (const buyOrder of buyOrders) {
      if (remainingQuantity <= 0) break;

      const availableQty = buyOrder.quantity;

      if (availableQty <= remainingQuantity) {
        trades.push(
          this.buildTrade(
            buyOrder.id,
            buyOrder?.user?.id,
            sellerId,
            orderInfo,
            availableQty,
          ),
        );
        await this.orderHistoryService.createOrderHistory({
          ...buyOrder,
          price: orderInfo.price,
        });
        remainingQuantity -= availableQty;
        ordersToRemove.push(buyOrder.id);
      } else {
        // ✅ Partially fill BUY order
        trades.push(
          this.buildTrade(
            buyOrder.id,
            buyOrder?.user?.id,
            sellerId,
            orderInfo,
            remainingQuantity,
          ),
        );
        await this.orderHistoryService.createOrderHistory({
          ...buyOrder,
          price: orderInfo.price,
          quantity: remainingQuantity,
        });
        ordersToUpdate.push({
          id: buyOrder.id,
          quantity: availableQty - remainingQuantity,
        });
        remainingQuantity = 0;
      }
    }

    return { trades, ordersToRemove, ordersToUpdate, remainingQuantity };
  }

  /**
   * 🔹 Build trade record
   */
  private buildTrade(
    buyOrderId: string,
    buyerId: string,
    sellerId: string,
    orderInfo: CreateSellOrderReqDto,
    quantity: number,
  ) {
    return {
      buyOrderId,
      buyerId,
      sellUserId: sellerId,
      stockName: orderInfo.stockName,
      price: orderInfo.price,
      quantity,
    };
  }

  /**
   * 🔹 Funds handling (atomic updates for buyers + seller)
   */
  private async processFunds(sellerId: string, trades: any[], price: number) {
    const sellerCredit = trades.reduce((sum, t) => sum + t.quantity * price, 0);

    // 1️⃣ Credit SELLER
    await this.userService.updateFunds(sellerId, sellerCredit);

    // 2️⃣ Debit BUYERS (group by buyerId for bulk update)
    const buyerDebits: Record<string, number> = {};
    for (const trade of trades) {
      const totalCost = trade.quantity * trade.price;
      buyerDebits[trade.buyerId] =
        (buyerDebits[trade.buyerId] || 0) - totalCost;
    }

    for (const [buyerId, deltaFunds] of Object.entries(buyerDebits)) {
      await this.userService.updateFunds(buyerId, deltaFunds);
    }
  }

  // 🔹 Core logic for BUY orders
  // ToDo: Refactor and split into smaller methods
  // ToDo: Add transactions
  async buyOrder(userId: string, orderInfo: CreateBuyOrderReqDto) {
    this.logger.info(
      `${OrderbookService.logInfo} Buy order init | userId=${userId} | stock=${orderInfo.stockName} | qty=${orderInfo.quantity} | price=${orderInfo.price}`,
    );
    if (
      !(await this.validateBalance(
        userId,
        orderInfo.price * orderInfo.quantity * -1,
      ))
    )
      throw new CustomError('Insufficient Balance');
    // 1️⃣ Get all eligible SELL orders (lowest price first)
    const existingSellOrders = await this.orderBookRepository.getOrderList(
      userId,
      orderInfo,
    );
    const id = uuid();
    // 2️⃣ Match BUY against SELL
    const { trades, ordersToRemove, ordersToUpdate, remainingQuantity } =
      await this.matchBuyWithSellOrders(
        userId,
        orderInfo,
        existingSellOrders,
        id,
      );

    // 3️⃣ Bulk DB writes (orders cleanup)
    if (ordersToRemove.length > 0) {
      await this.orderBookRepository.bulkRemoveOrders(ordersToRemove);
    }
    if (ordersToUpdate.length > 0) {
      await this.orderBookRepository.bulkUpdateQuantities(ordersToUpdate);
    }

    // 4️⃣ Save remaining BUY order (if not fully matched)
    let remainingOrder: OrderBookEntity | null = null;
    if (remainingQuantity > 0) {
      remainingOrder = await this.orderBookRepository.save(
        userId,
        {
          ...orderInfo,
          quantity: remainingQuantity,
        },
        id,
      );
    }

    // 5️⃣ Process funds movement (buyer pays, seller receives)
    await this.processFundsForBuy(userId, trades);

    this.logger.info(
      `${OrderbookService.logInfo} Buy order complete | filled=${
        orderInfo.quantity - remainingQuantity
      } | remaining=${remainingQuantity}`,
    );
    const totalStockBought = trades.reduce((sum, t) => sum + t.quantity, 0);
    const fundsSpent = trades.reduce((sum, t) => sum + t.quantity * t.price, 0);
    return {
      totalStockBought,
      fundsSpent,
      trades,
      remainingOrder,
    };
  }

  /**
   * 🔹 Match BUY orders with SELL orders
   */
  private async matchBuyWithSellOrders(
    buyerId: string,
    orderInfo: CreateBuyOrderReqDto,
    sellOrders: OrderBookEntity[],
    id: string,
  ) {
    let remainingQuantity = orderInfo.quantity;
    const trades: any[] = [];
    const ordersToRemove: string[] = [];
    const ordersToUpdate: { id: string; quantity: number }[] = [];

    for (const sellOrder of sellOrders) {
      if (remainingQuantity <= 0) break;

      // only consider SELL orders at or below buyer's price
      if (sellOrder.price > orderInfo.price) break;

      const availableQty = sellOrder.quantity;

      if (availableQty <= remainingQuantity) {
        trades.push(
          this.buildTradeForBuy(
            buyerId,
            sellOrder.id,
            sellOrder?.user?.id,
            sellOrder.stockName,
            sellOrder.price, // ✅ actual sell price
            availableQty,
          ),
        );
        remainingQuantity -= availableQty;
        ordersToRemove.push(sellOrder.id);
        await this.orderHistoryService.createOrderHistory(sellOrder);
        await this.orderHistoryService.createOrderHistory({
          ...orderInfo,
          user: { id: buyerId },
          id,
          quantity: availableQty,
          price: sellOrder.price,
        });
      } else {
        trades.push(
          this.buildTradeForBuy(
            buyerId,
            sellOrder.id,
            sellOrder?.user?.id,
            sellOrder.stockName,
            sellOrder.price,
            remainingQuantity,
          ),
        );
        await this.orderHistoryService.createOrderHistory({
          ...sellOrder,
          quantity: remainingQuantity,
        });
        await this.orderHistoryService.createOrderHistory({
          ...orderInfo,
          user: { id: buyerId },
          id,
          quantity: remainingQuantity,
          price: sellOrder.price,
        });
        ordersToUpdate.push({
          id: sellOrder.id,
          quantity: availableQty - remainingQuantity,
        });
        remainingQuantity = 0;
      }
    }

    return { trades, ordersToRemove, ordersToUpdate, remainingQuantity };
  }

  private buildTradeForBuy(
    buyerId: string,
    sellOrderId: string,
    sellerId: string,
    stockName: string,
    price: number,
    quantity: number,
  ) {
    return {
      buyUserId: buyerId,
      sellOrderId,
      sellerId,
      stockName,
      price, // actual execution price
      quantity,
    };
  }

  /**
   * 🔹 Handle funds for BUY order trades
   * Buyer pays, sellers get credited
   */
  private async processFundsForBuy(buyerId: string, trades: any[]) {
    const sellerCredits: Record<string, number> = {};
    let buyerDebit = 0;

    // 1️⃣ Aggregate buyer debit & seller credits
    for (const { sellerId, quantity, price } of trades) {
      const totalCost = quantity * price;
      buyerDebit -= totalCost; // buyer loses funds
      sellerCredits[sellerId] = (sellerCredits[sellerId] || 0) + totalCost;
    }

    // 2️⃣ Update buyer funds
    await this.userService.updateFunds(buyerId, buyerDebit);

    // 3️⃣ Update seller funds
    for (const [sellerId, deltaFunds] of Object.entries(sellerCredits)) {
      await this.userService.updateFunds(sellerId, deltaFunds);
    }
  }

  async validateBalance(userId: string, updateFunds: number): Promise<boolean> {
    if (updateFunds > 0) return true;
    const { funds } = await this.userService.profile(userId);

    const presentBuyOrders = await this.getOrdersByUserId(
      userId,
      OrderSideEnum.BUY,
    );

    const totalAmountPledged = presentBuyOrders.reduce(
      (sum, order) => sum + (order?.price ?? 0) * (order?.quantity ?? 0) * -1,
      0,
    );
    console.log(funds >= updateFunds + totalAmountPledged);
    return funds + updateFunds + totalAmountPledged >= 0;
  }
}
