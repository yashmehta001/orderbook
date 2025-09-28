import { OrderSideEnum } from '../../core/config';
import {
  CreateBuyOrderReqDto,
  CreateOrderBookReqDto,
  CreateSellOrderReqDto,
  IBuyTrade,
  IOrderBook,
  ISellTrade,
} from '../dto';
import { OrderBookEntity } from '../entities/orderbook.entity';

export interface IOrderbookService {
  createOrder(
    userId: string,
    orderInfo: CreateOrderBookReqDto,
  ): Promise<OrderBookEntity>;

  getOrderBooks(
    userId: string,
    stockName?: string,
    side?: OrderSideEnum,
  ): Promise<IOrderBook>;

  getOrdersByUserId(
    userId: string,
    side?: OrderSideEnum,
    stockName?: string,
  ): Promise<OrderBookEntity[]>;

  deleteOrder(userId: string, id: string): Promise<void>;

  sellOrder(
    userId: string,
    orderInfo: CreateSellOrderReqDto,
  ): Promise<ISellTrade>;

  buyOrder(userId: string, orderInfo: CreateBuyOrderReqDto): Promise<IBuyTrade>;
}
