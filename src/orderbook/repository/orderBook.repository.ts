import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderBookEntity } from '../entities/orderbook.entity';
import { CreateOrderBookReqDto } from '../dto';
import { OrderSideEnum } from '../../core/config';

@Injectable()
export class OrderBookRepository {
  constructor(
    @InjectRepository(OrderBookEntity)
    private readonly orderBookEntity: Repository<OrderBookEntity>,
  ) {}

  async save(
    userId: string,
    orderInfos: CreateOrderBookReqDto,
    id?: string,
  ): Promise<OrderBookEntity> {
    const orderEntity = this.orderBookEntity.create({
      ...orderInfos,
      user: { id: userId },
      id,
    });
    return await this.orderBookEntity.save(orderEntity);
  }

  async getOrderBooks(
    userId: string,
    stockName: string = '',
    side?: OrderSideEnum,
  ) {
    const orderBooks = this.orderBookEntity
      .createQueryBuilder('order')
      .select('order.side', 'side')
      .addSelect('order.stock_name', 'stockName')
      .addSelect('order.price', 'price')
      .addSelect('SUM(order.quantity)', 'quantity')
      .leftJoinAndSelect('order.user', 'user')
      .where('user.id != :userId', { userId })
      .groupBy('order.side')
      .addGroupBy('order.stock_name')
      .addGroupBy('order.price')
      .addGroupBy('user.id')
      .orderBy('order.stock_name', 'ASC')
      .addOrderBy('order.price', 'DESC');

    if (side) {
      orderBooks.andWhere('order.side = :side', { side });
    }
    if (stockName) {
      orderBooks.andWhere('order.stock_name = :stockName', { stockName });
    }

    return await orderBooks.getRawMany();
  }
  async getOrderById(id: string, userId: string) {
    const order = this.orderBookEntity
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
  ) {
    const orders = this.orderBookEntity
      .createQueryBuilder('order')
      .leftJoin('order.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('side')
      .orderBy('order.auditInfo.createdAt', 'DESC');

    if (stockName)
      orders.andWhere('order.stock_name = :stockName', { stockName });

    if (side) orders.andWhere('order.side = :side', { side });

    return orders.getMany();
  }

  async getOrderList(userId: string, data?: CreateOrderBookReqDto) {
    const query = this.orderBookEntity
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .where('user.id != :userId', { userId });

    if (data?.side && data?.price !== undefined && data?.stockName) {
      const oppositeSide =
        data.side === OrderSideEnum.BUY
          ? OrderSideEnum.SELL
          : OrderSideEnum.BUY;

      query
        .andWhere('order.side = :side', { side: oppositeSide })
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

  async bulkRemoveOrders(orderIds: string[]): Promise<void> {
    if (orderIds.length === 0) return;
    await this.orderBookEntity.delete(orderIds);
  }

  async bulkUpdateQuantities(
    updates: { id: string; quantity: number }[],
  ): Promise<void> {
    if (updates.length === 0) return;

    const promises = updates.map(({ id, quantity }) =>
      this.orderBookEntity.update(id, { quantity }),
    );
    await Promise.all(promises);
  }
}
