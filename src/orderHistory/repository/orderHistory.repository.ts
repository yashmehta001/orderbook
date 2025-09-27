import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { EntityManager, DataSource } from 'typeorm';
import { OrderHistoryEntity } from '../entities/orderHistory.entity';
import { CreateOrderHistoryDto } from '../dto/request/createHistory.dto';
import { BaseRepository } from '../../core/entity/BaseRepository';

export interface IOrderHistoryRepository {
  save(
    orderInfo: Partial<CreateOrderHistoryDto>,
    manager?: EntityManager,
  ): Promise<OrderHistoryEntity>;

  getByUserId(userId: string): Promise<OrderHistoryEntity[]>;
}

@Injectable()
export class OrderHistoryRepository
  extends BaseRepository<OrderHistoryEntity>
  implements IOrderHistoryRepository
{
  protected entity = OrderHistoryEntity;

  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource);
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
    return this.getRepo()
      .createQueryBuilder('orderHistory')
      .leftJoin('orderHistory.user', 'user')
      .where('orderHistory.user_id = :userId', { userId })
      .groupBy('orderHistory.transactionId')
      .addGroupBy('orderHistory.id')
      .addGroupBy('user.id')
      .orderBy('orderHistory.transactionId', 'DESC')
      .addOrderBy('orderHistory.auditInfo.createdAt', 'ASC')
      .getMany();
  }
}
