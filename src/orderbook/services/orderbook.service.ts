import { Inject, Injectable } from '@nestjs/common';
import { OrderBookRepository } from '../repository/orderBook.repository';
import { LoggerService } from '../../utils/logger/WinstonLogger';
import { CreateOrderBookReqDto } from '../dto';
import { OrderSideEnum } from 'src/core/config';
import { CreateSellOrderReqDto } from '../dto/requests/sell-order.dto';
import { OrderBookEntity } from '../entities/orderbook.entity';
import { UserService } from '../../users/services/users.service';

@Injectable()
export class OrderbookService {
  constructor(
    @Inject(OrderBookRepository)
    private readonly orderBookRepository: OrderBookRepository,

    private readonly logger: LoggerService,
    private readonly userService: UserService,
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

  // ToDo: Refactor and split into smaller methods
  // ToDo: Add transactions
  // ToDo: Add History logic
  async sellOrder(userId: string, orderInfo: CreateSellOrderReqDto) {
    this.logger.info(
      `${OrderbookService.logInfo} Sell order init | userId=${userId} | stock=${orderInfo.stockName} | qty=${orderInfo.quantity} | price=${orderInfo.price}`,
    );

    // 1️⃣ Get all eligible BUY orders in one query
    const existingBuyOrders =
      await this.orderBookRepository.getOrderList(orderInfo);
    // 2️⃣ Match SELL against BUY
    const { trades, ordersToRemove, ordersToUpdate, remainingQuantity } =
      this.matchSellWithBuyOrders(userId, orderInfo, existingBuyOrders);

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

    return {
      trades,
      remainingOrder,
    };
  }

  /**
   * 🔹 Core matching logic
   */
  private matchSellWithBuyOrders(
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

  async buyOrder(userId: string, orderInfo: CreateSellOrderReqDto) {
    this.logger.info(
      `${OrderbookService.logInfo} Create buy order for userId: ${userId} for stock: ${orderInfo.stockName} and quantity: ${orderInfo.quantity} at price: ${orderInfo.price}`,
    );
    const existingOrders =
      await this.orderBookRepository.getOrderList(orderInfo);

    const order = await this.orderBookRepository.save(userId, orderInfo);
    this.logger.info(
      `${OrderbookService.logInfo} created buy order for userId: ${userId} for stock: ${orderInfo.stockName} and quantity: ${orderInfo.quantity} at price: ${orderInfo.price}`,
    );
    return order;
  }

  async getOrderBooks(stockName: string = '', side?: OrderSideEnum) {
    this.logger.info(
      `${OrderbookService.logInfo} Fetching OrderBooks for stockName: ${stockName}`,
    );
    const rawOrderBooks = await this.orderBookRepository.getOrderBooks(
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
}
