import { EntityManager } from 'typeorm';
import { CreateBuyOrderReqDto, CreateSellOrderReqDto, ITrade } from '../dto';
import { OrderBookEntity } from '../entities/orderbook.entity';

export interface IMatchingLogicService {
  matchOrders(params: {
    initiatorId: string;
    orderInfo: CreateBuyOrderReqDto | CreateSellOrderReqDto;
    oppositeOrders: OrderBookEntity[];
    isSell: boolean;
    manager: EntityManager;
    orderId?: string;
  }): Promise<{
    trades: ITrade[];
    ordersToRemove: string[];
    ordersToUpdate: { id: string; quantity: number }[];
    remainingQuantity: number;
  }>;
}
