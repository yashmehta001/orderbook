import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { OrderBookEntity } from '../entities/orderbook.entity';
import { CreateOrderBookReqDto, OrderBookRaw } from '../dto';
import { OrderSideEnum } from '../../core/config';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../core/entity/BaseRepository';
import { IOrderBookRepository } from '../interfaces';

@Injectable()
export class OrderBookRepository
  extends BaseRepository<OrderBookEntity>
  implements IOrderBookRepository
{
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource);
  }
  protected entity = OrderBookEntity;

  async save(
    userId: string,
    orderInfos: CreateOrderBookReqDto,
    manager?: EntityManager,
    id?: string,
  ): Promise<OrderBookEntity> {
    const repo = this.getRepo(manager);
    const orderEntity = repo.create({
      ...orderInfos,
      user: { id: userId },
      id,
    });
    return repo.save(orderEntity);
  }

  async getOrderBooks(
    userId: string,
    stockName: string = '',
    side?: OrderSideEnum,
    manager?: EntityManager,
  ): Promise<OrderBookRaw[]> {
    const orderBooks = this.getRepo(manager)
      .createQueryBuilder('order')
      .select('order.side', 'side')
      .addSelect('order.stock_name', 'stockName')
      .addSelect('order.price', 'price')
      .addSelect('SUM(order.quantity)', 'quantity')
      .leftJoin('order.user', 'user')
      .where('user.id != :userId', { userId })
      .groupBy('order.side')
      .addGroupBy('order.stock_name')
      .addGroupBy('order.price')
      .orderBy('order.stock_name', 'ASC')
      .addOrderBy('order.price', 'DESC');

    if (side) {
      orderBooks.andWhere('order.side = :side', { side });
    }
    if (stockName) {
      orderBooks.andWhere('order.stock_name ILIKE :stockName', {
        stockName: `%${stockName}%`,
      });
    }

    const result: OrderBookRaw[] = await orderBooks.getRawMany();
    return result;
  }
  async getOrderById(
    id: string,
    userId: string,
    manager?: EntityManager,
  ): Promise<OrderBookEntity | null> {
    const order = this.getRepo(manager)
      .createQueryBuilder('order')
      .where({ id })
      .leftJoin('order.user', 'user')
      .andWhere('user.id = :userId', { userId });
    return order.getOne();
  }
  async getOrdersByUserId(
    userId: string,
    stockName?: string,
    side?: OrderSideEnum,
    manager?: EntityManager,
  ): Promise<OrderBookEntity[]> {
    const orders = this.getRepo(manager)
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('side')
      .addOrderBy('order.auditInfo.createdAt', 'DESC');

    if (stockName)
      orders.andWhere('order.stock_name ILIKE :stockName', {
        stockName: `%${stockName}%`,
      });

    if (side) orders.andWhere('order.side = :side', { side });

    return orders.getMany();
  }

  async getOrderList(
    userId: string,
    data?: CreateOrderBookReqDto,
    manager?: EntityManager,
  ): Promise<OrderBookEntity[]> {
    const query = this.getRepo(manager)
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .where('user.id != :userId', { userId });

    if (data?.side && data?.price !== undefined && data?.stockName) {
      query
        .andWhere('order.side != :side', { side: data.side })
        .andWhere('order.stock_name = :stockName', {
          stockName: data.stockName,
        })
        .andWhere(
          data.side === OrderSideEnum.BUY
            ? 'order.price <= :price'
            : 'order.price >= :price',
          { price: data.price },
        )
        .orderBy(
          'order.price',
          data.side === OrderSideEnum.BUY ? 'ASC' : 'DESC',
        );
    }

    query.addOrderBy('order.auditInfo.createdAt', 'ASC');
    return query.getMany();
  }

  async bulkRemoveOrders(
    orderIds: string[],
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);
    if (orderIds.length === 0) return;
    await repo.delete(orderIds);
  }

  async bulkUpdateQuantities(
    updates: { id: string; quantity: number }[],
    manager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepo(manager);
    if (updates.length === 0) return;

    const promises = updates.map(({ id, quantity }) =>
      repo.update(id, { quantity }),
    );
    await Promise.all(promises);
  }
}
