import { EntityManager } from 'typeorm';
import { CreateOrderHistoryDto, OrderHistoryTransactionResDto } from '../dto';

export interface IOrderHistoryService {
  createOrderHistory(
    orderInfo: CreateOrderHistoryDto,
    manager?: EntityManager,
  ): Promise<any>;

  getOrderHistoryByUserId(
    userId: string,
  ): Promise<OrderHistoryTransactionResDto[]>;
}
