import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { OrderHistoryEntity } from '../entities/orderHistory.entity';
import { CreateOrderHistoryDto } from '../dto/request/createHistory.dto';

@Injectable()
export class OrderHistoryRepository {
  constructor(
    @InjectRepository(OrderHistoryEntity)
    private readonly orderHistoryEntity: Repository<OrderHistoryEntity>,
  ) {}

  private getRepo(manager?: EntityManager) {
    return manager
      ? manager.getRepository(OrderHistoryEntity)
      : this.orderHistoryEntity;
  }

  async save(
    orderInfo: Partial<CreateOrderHistoryDto>,
    manager?: EntityManager,
  ): Promise<OrderHistoryEntity> {
    const repo = this.getRepo(manager);
    const orderEntity = repo.create({
      transactionId: orderInfo.id,
      stockName: orderInfo.stockName,
      side: orderInfo.side,
      price: orderInfo.price,
      quantity: orderInfo.quantity,
      user: orderInfo.user ? { id: orderInfo.user.id } : undefined,
    });
    return repo.save(orderEntity);
  }

  async getByUserId(userId: string): Promise<OrderHistoryEntity[]> {
    const history = this.orderHistoryEntity
      .createQueryBuilder('orderHistory')
      .leftJoin('orderHistory.user', 'user')
      .where('orderHistory.user_id = :userId', { userId })
      .groupBy('orderHistory.transactionId')
      .addGroupBy('orderHistory.id')
      .addGroupBy('user.id')
      .orderBy('orderHistory.transactionId', 'DESC')
      .addOrderBy('orderHistory.auditInfo.createdAt', 'ASC');
    return history.getMany();
  }
}
