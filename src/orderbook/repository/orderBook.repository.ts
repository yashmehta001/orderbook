import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderBookEntity } from '../entities/orderbook.entity';
import { CreateOrderBookReqDto } from '../dto';
import { OrderSideEnum } from '../../core/config';
import { v4 as uuid } from 'uuid';
@Injectable()
export class OrderBookRepository {
  constructor(
    @InjectRepository(OrderBookEntity)
    private readonly orderBookEntity: Repository<OrderBookEntity>,
  ) {}

  async save(
    userId: string,
    orderInfos: CreateOrderBookReqDto,
    id?:string
  ): Promise<OrderBookEntity> {
    const orderEntity = this.orderBookEntity.create({
    ...orderInfos,
    user: { id: userId },
    id,
  });
    return await this.orderBookEntity.save(orderEntity);
  }

  async getOrderBooks(stockName: string = '', side?: OrderSideEnum) {
    const orderBooks = this.orderBookEntity
      .createQueryBuilder('order')
      .select('order.side', 'side')
      .addSelect('order.stock_name', 'stockName')
      .addSelect('order.price', 'price')
      .addSelect('SUM(order.quantity)', 'quantity')
      .groupBy('order.side')
      .addGroupBy('order.stock_name')
      .addGroupBy('order.price')
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

  //TODO: take userId as param to exclude user's own orders from listing
  async getOrderList(data?: CreateOrderBookReqDto) {
    const query = this.orderBookEntity
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user');

    if (data?.side && data?.price !== undefined && data?.stockName) {
      const oppositeSide =
        data.side === OrderSideEnum.BUY
          ? OrderSideEnum.SELL
          : OrderSideEnum.BUY;

      query
        .where('order.side = :side', { side: oppositeSide })
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

    // For now, do sequential updates (still fewer calls than loop-in-service)
    // 🚀 Can be optimized to a single CASE WHEN update query if needed
    const promises = updates.map(({ id, quantity }) =>
      this.orderBookEntity.update(id, { quantity }),
    );
    await Promise.all(promises);
  }
}
