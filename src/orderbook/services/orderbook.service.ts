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
} from '../dto';
import { errorMessages, OrderSideEnum } from '../../core/config';
import { CreateSellOrderReqDto } from '../dto/requests/sell-order.dto';
import { OrderBookEntity } from '../entities/orderbook.entity';
import { OrderHistoryService } from '../../orderHistory/services/orderHistory.service';
import { v4 as uuid } from 'uuid';
import { CustomError, NotFoundException } from '../../core/errors';
import { EntityManager } from 'typeorm';
import { MatchingLogicService } from './matchingLogic.service';
import { WalletService } from '../../wallet/services/wallet.service';
import { FundsProcessorService } from './fundsProcessor.service';
import { TransactionManagerService } from '../../database/services/transaction-manager.service';
import { IOrderbookService } from '../interfaces';

@Injectable()
export class OrderbookService implements IOrderbookService {
  constructor(
    @Inject(OrderBookRepository)
    private readonly orderBookRepository: OrderBookRepository,

    private readonly logger: LoggerService,
    private readonly orderHistoryService: OrderHistoryService,
    private readonly matchingLogicService: MatchingLogicService,
    @Inject(forwardRef(() => WalletService))
    private readonly walletsService: WalletService,
    private readonly fundsProcessorService: FundsProcessorService,
    private readonly transactionManagerService: TransactionManagerService,
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
    return this.transactionManagerService.runInTransaction<ISellTrade>(
      async (manager) => {
        this.logInit('SELL', userId, orderInfo);
        const existingBuyOrders = await this.orderBookRepository.getOrderList(
          userId,
          orderInfo,
        );
        const { trades, ordersToRemove, ordersToUpdate, remainingQuantity } =
          await this.matchingLogicService.matchOrders({
            initiatorId: userId,
            orderInfo,
            oppositeOrders: existingBuyOrders,
            isSell: true,
            manager,
          });
        await this.applyOrderBookUpdates(
          ordersToRemove,
          ordersToUpdate,
          manager,
        );

        const remainingOrder = await this.saveRemainingOrder(
          userId,
          orderInfo,
          remainingQuantity,
          manager,
        );

        await this.fundsProcessorService.processFundsForSell(
          userId,
          trades,
          orderInfo.price,
          manager,
        );

        const { totalQuantity, totalFunds } = this.summarizeTrades(trades);
        if (totalQuantity > 0) {
          await this.recordOrderHistory(
            userId,
            orderInfo,
            remainingOrder?.id,
            totalQuantity,
            manager,
          );
        }

        this.logComplete('SELL', userId, orderInfo, remainingQuantity);
        return {
          totalStockSold: totalQuantity,
          fundsAdded: totalFunds,
          trades,
          remainingOrder,
        };
      },
    );
  }

  async buyOrder(
    userId: string,
    orderInfo: CreateBuyOrderReqDto,
  ): Promise<IBuyTrade> {
    return this.transactionManagerService.runInTransaction<IBuyTrade>(
      async (manager) => {
        this.logInit('BUY', userId, orderInfo);

        if (
          !(await this.walletsService.validateBalance(
            userId,
            orderInfo.price * orderInfo.quantity,
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
          await this.matchingLogicService.matchOrders({
            initiatorId: userId,
            orderInfo,
            oppositeOrders: existingSellOrders,
            isSell: false,
            manager,
            orderId: id,
          });

        await this.applyOrderBookUpdates(
          ordersToRemove,
          ordersToUpdate,
          manager,
        );

        const remainingOrder = await this.saveRemainingOrder(
          userId,
          orderInfo,
          remainingQuantity,
          manager,
          id,
        );

        await this.fundsProcessorService.processFundsForBuy(
          userId,
          trades,
          manager,
        );

        const { totalQuantity, totalFunds } = this.summarizeTrades(trades);

        this.logComplete('BUY', userId, orderInfo, remainingQuantity);
        return {
          totalStockBought: totalQuantity,
          fundsSpent: totalFunds,
          trades,
          remainingOrder,
        };
      },
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                              PRIVATE HELPERS                               */
  /* -------------------------------------------------------------------------- */

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

  // private async processFundsForSell(
  //   sellerId: string,
  //   trades: ITrade[],
  //   price: number,
  //   manager: EntityManager,
  // ): Promise<void> {
  //   const sellerCredit = trades.reduce((sum, t) => sum + t.quantity * price, 0);
  //   await this.walletsService.updateUserFunds(sellerId, sellerCredit, manager);

  //   const buyerDebits: Record<string, number> = {};
  //   for (const { buyerId, quantity, price: tradePrice } of trades) {
  //     buyerDebits[buyerId] =
  //       (buyerDebits[buyerId] || 0) - quantity * tradePrice;
  //   }

  //   for (const [buyerId, deltaFunds] of Object.entries(buyerDebits)) {
  //     await this.walletsService.updateUserFunds(buyerId, deltaFunds, manager);
  //   }
  // }

  // private async processFundsForBuy(
  //   buyerId: string,
  //   trades: any[],
  //   manager: EntityManager,
  // ): Promise<void> {
  //   const sellerCredits: Record<string, number> = {};
  //   let buyerDebit = 0;

  //   for (const { sellerId, quantity, price } of trades) {
  //     const total = quantity * price;
  //     buyerDebit -= total;
  //     const sellerKey: string = String(sellerId);
  //     sellerCredits[sellerKey] = (sellerCredits[sellerKey] || 0) + total;
  //   }

  //   await this.walletsService.updateUserFunds(buyerId, buyerDebit, manager);

  //   await Promise.all(
  //     Object.entries(sellerCredits).map(([sellerId, delta]) => {
  //       return this.walletsService.updateUserFunds(sellerId, delta, manager);
  //     }),
  //   );
  // }

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

  // private async withTransaction<T>(
  //   cb: (manager: EntityManager) => Promise<T>,
  // ): Promise<T> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();
  //   try {
  //     const result = await cb(queryRunner.manager);
  //     await queryRunner.commitTransaction();
  //     return result;
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
