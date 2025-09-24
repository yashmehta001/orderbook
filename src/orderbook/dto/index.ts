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
  trades: {
    buyOrderId: string;
    sellUserId: string;
    stockName: string;
    price: number;
    quantity: number;
  }[];
  remainingOrder: OrderBookEntity | null;
}

export interface IBuyTrade {
  totalStockBought: number;
  fundsSpent: number;
  trades: {
    buyOrderId: string;
    sellUserId: string;
    stockName: string;
    price: number;
    quantity: number;
  }[];
  remainingOrder: OrderBookEntity | null;
}

export interface IOrderBook {
  BUY: {
    price: number;
    quantity: number;
    stockName: string;
  }[];
  SELL: {
    price: number;
    quantity: number;
    stockName: string;
  }[];
}
