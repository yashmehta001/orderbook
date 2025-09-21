import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '../../utils/logger/WinstonLogger';
import { OrderHistoryRepository } from '../repository/orderHistory.repository';

@Injectable()
export class OrderHistoryService {
  constructor(
    @Inject(OrderHistoryRepository)
    private readonly orderHistoryRepository: OrderHistoryRepository,
    private readonly logger: LoggerService,
  ) {}
  static logInfo = 'Service - OrderHistory:';
  async createOrderHistory(orderInfo): Promise<any> {
    this.logger.info(
      `${OrderHistoryService.logInfo} Creating order history for user ${orderInfo.user.id}`,
    );
    return await this.orderHistoryRepository.save(orderInfo);
  }
}
