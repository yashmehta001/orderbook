import { UserProfileReqDto } from '../../users/dto';
import { CreateSellOrderReqDto } from '../dto/requests/sell-order.dto';
import {
  CreateBuyOrderReqDto,
  GetOrderBooksReqDto,
  IBuyTrade,
  IOrderBook,
  ISellTrade,
} from '../dto';
import { OrderBookEntity } from '../entities/orderbook.entity';

export interface IOrderbookController {
  sellOrder(
    user: UserProfileReqDto,
    body: CreateSellOrderReqDto,
  ): Promise<ISellTrade>;
  buyOrder(
    user: UserProfileReqDto,
    body: CreateBuyOrderReqDto,
  ): Promise<IBuyTrade>;
  getUserOrderBooks(
    user: UserProfileReqDto,
    query: GetOrderBooksReqDto,
  ): Promise<OrderBookEntity[]>;
  deleteOrderFromOrderBooks(
    user: UserProfileReqDto,
    orderId: string,
  ): Promise<void>;
  getOrderBooks(
    user: UserProfileReqDto,
    query: GetOrderBooksReqDto,
  ): Promise<IOrderBook>;
}
