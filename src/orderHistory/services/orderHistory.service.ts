import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '../../utils/logger/WinstonLogger';
import { OrderHistoryRepository } from '../repository/orderHistory.repository';
import { CreateOrderHistoryDto } from '../dto/request/createHistory.dto';
import { OrderHistoryItemDto, OrderHistoryTransactionResDto } from '../dto';
import { EntityManager } from 'typeorm';
import { OrderHistoryEntity } from '../entities/orderHistory.entity';

export interface IOrderHistoryService {
  createOrderHistory(
    orderInfo: CreateOrderHistoryDto,
    manager?: EntityManager,
  ): Promise<any>;

  getOrderHistoryByUserId(
    userId: string,
  ): Promise<OrderHistoryTransactionResDto[]>;
}
@Injectable()
export class OrderHistoryService implements IOrderHistoryService {
  constructor(
    @Inject(OrderHistoryRepository)
    private readonly orderHistoryRepository: OrderHistoryRepository,
    private readonly logger: LoggerService,
  ) {}
  static logInfo = 'Service - OrderHistory:';
  async createOrderHistory(
    orderInfo: CreateOrderHistoryDto,
    manager?: EntityManager,
  ): Promise<OrderHistoryEntity> {
    try {
      this.logger.info(
        `${OrderHistoryService.logInfo} Creating order history for user ${orderInfo.user.id}`,
      );
      const history = await this.orderHistoryRepository.save(
        orderInfo,
        manager,
      );
      this.logger.info(
        `${OrderHistoryService.logInfo} Successfully created order history for user ${orderInfo.user.id}`,
      );
      return history;
    } catch (error) {
      this.logger.warn(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `${OrderHistoryService.logInfo} Error creating order history for user ${orderInfo.user.id}: ${error.message}`,
      );
      throw error;
    }
  }
  async getOrderHistoryByUserId(
    userId: string,
  ): Promise<OrderHistoryTransactionResDto[]> {
    try {
      this.logger.info(
        `${OrderHistoryService.logInfo} Fetching order history for user ${userId}`,
      );

      const history = await this.orderHistoryRepository.getByUserId(userId);

      // Group by transactionId
      const grouped = history.reduce<Record<string, OrderHistoryItemDto[]>>(
        (acc, item) => {
          if (!acc[item.transactionId]) acc[item.transactionId] = [];
          acc[item.transactionId].push({
            id: item.id,
            stockName: item.stockName,
            side: item.side,
            price: item.price,
            quantity: item.quantity,
            createdAt: item.auditInfo.createdAt,
          });
          return acc;
        },
        {},
      );

      const result: OrderHistoryTransactionResDto[] = Object.entries(
        grouped,
      ).map(([transactionId, orders]) => ({
        transactionId,
        orders,
      }));

      this.logger.info(
        `${OrderHistoryService.logInfo} Successfully fetched grouped order history for user ${userId}`,
      );

      return result;
    } catch (error) {
      this.logger.warn(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `${OrderHistoryService.logInfo} Error fetching order history for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }
}
