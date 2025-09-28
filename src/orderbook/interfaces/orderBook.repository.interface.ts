import { IBaseRepository } from '../../core/interfaces/BaseRepository.interface';
import { CreateOrderBookReqDto, OrderBookRaw } from '../dto';
import { OrderBookEntity } from '../entities/orderbook.entity';
import { EntityManager } from 'typeorm';
import { OrderSideEnum } from '../../core/config';

export interface IOrderBookRepository extends IBaseRepository<OrderBookEntity> {
  save(
    userId: string,
    orderInfos: CreateOrderBookReqDto,
    manager?: EntityManager,
    id?: string,
  ): Promise<OrderBookEntity>;

  getOrderBooks(
    userId: string,
    stockName?: string,
    side?: OrderSideEnum,
  ): Promise<OrderBookRaw[]>;

  getOrderById(id: string, userId: string): Promise<OrderBookEntity | null>;

  getOrdersByUserId(
    userId: string,
    stockName?: string,
    side?: OrderSideEnum,
  ): Promise<OrderBookEntity[]>;

  getOrderList(
    userId: string,
    data?: CreateOrderBookReqDto,
  ): Promise<OrderBookEntity[]>;

  bulkRemoveOrders(orderIds: string[], manager?: EntityManager): Promise<void>;

  bulkUpdateQuantities(
    updates: { id: string; quantity: number }[],
    manager?: EntityManager,
  ): Promise<void>;
}
