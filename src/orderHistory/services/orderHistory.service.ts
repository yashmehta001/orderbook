import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '../../utils/logger/WinstonLogger';
import { OrderHistoryRepository } from '../repository/orderHistory.repository';
import { CreateOrderHistoryDto } from '../dto/createHistory.dto';

@Injectable()
export class OrderHistoryService {
  constructor(
    @Inject(OrderHistoryRepository)
    private readonly orderHistoryRepository: OrderHistoryRepository,
    private readonly logger: LoggerService,
  ) {}
  static logInfo = 'Service - OrderHistory:';
  async createOrderHistory(orderInfo: CreateOrderHistoryDto): Promise<any> {
    try {
      this.logger.info(
        `${OrderHistoryService.logInfo} Creating order history for user ${orderInfo.user.id}`,
      );
      const history = await this.orderHistoryRepository.save(orderInfo);
      this.logger.info(
        `${OrderHistoryService.logInfo} Successfully created order history for user ${orderInfo.user.id}`,
      );
      return history;
    } catch (error) {
      this.logger.warn(
        `${OrderHistoryService.logInfo} Error creating order history for user ${orderInfo.user.id}: ${error.message}`,
      );
      throw error;
    }
  }
}
