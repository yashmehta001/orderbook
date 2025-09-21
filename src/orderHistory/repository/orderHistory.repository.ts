import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderHistoryEntity } from '../entities/orderHistory.entity';

@Injectable()
export class OrderHistoryRepository {
  constructor(
    @InjectRepository(OrderHistoryEntity)
    private readonly orderHistoryEntity: Repository<OrderHistoryEntity>,
  ) {}

  async save(
    orderInfo: Partial<OrderHistoryEntity>,
  ): Promise<OrderHistoryEntity> {
    const orderEntity = this.orderHistoryEntity.create({
      transactionId: orderInfo.id,
      stockName: orderInfo.stockName,
      side: orderInfo.side,
      price: orderInfo.price,
      quantity: orderInfo.quantity,
      user: orderInfo.user ? { id: orderInfo.user.id } : undefined,
    });
    return await this.orderHistoryEntity.save(orderEntity);
  }
}
