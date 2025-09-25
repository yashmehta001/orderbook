import { OrderBookEntity } from '../entities/orderbook.entity';

export * from './requests/create-order.dto';
export * from './requests/get-orderbook.dto';
export * from './requests/buy-order.dto';
export * from './requests/sell-order.dto';

export * from './response/get-orderbook.dto';
export * from './response/create-order.dto';
export * from './response/sell-order.dto';
export * from './response/buy-order.dto';
export * from './response/get-userOrderBook.dto';

export interface ISellTrade {
  totalStockSold: number;
  fundsAdded: number;
  trades: ITrade[];
  remainingOrder: OrderBookEntity | null;
}

export interface IBuyTrade {
  totalStockBought: number;
  fundsSpent: number;
  trades: ITrade[];
  remainingOrder: OrderBookEntity | null;
}

export interface OrderBookRaw {
  side: string;
  stockName: string;
  price: number;
  quantity: string;
}
export interface IStockTradeSummary {
  price: number;
  quantity: number;
  stockName: string;
}
export interface IOrderBook {
  BUY: IStockTradeSummary[];
  SELL: IStockTradeSummary[];
}

export interface ITrade {
  buyUserId?: string;
  sellOrderId?: string;
  sellerId?: string;
  id?: string;
  buyOrderId?: string;
  sellUserId?: string;
  stockName: string;
  buyerId: string;
  price: number;
  quantity: number;
}
