import { OrderSideEnum } from '../../../core/config';
import {
  CreateBuyOrderReqDto,
  CreateOrderBookReqDto,
  CreateSellOrderReqDto,
  GetOrderBooksReqDto,
  IBuyTrade,
  IOrderBook,
  ISellTrade,
} from '../../dto';
import { OrderBookEntity } from '../../entities/orderbook.entity';
import { userOutput } from '../../../users/tests/constants';

export const mockOrderBookBuyData: OrderBookEntity = {
  id: 'c212e0e8-aa57-46e8-86ea-782bc224e0fe',
  stockName: 'apple',
  side: OrderSideEnum.BUY,
  price: 300,
  quantity: 3,
  user: userOutput,
  auditInfo: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  generateId: () => 'mock-id',
};
export const mockOrderBookBuyDataRemainingOrder: OrderBookEntity = {
  id: 'c212e0e8-aa57-46e8-86ea-782bc224e0fe',
  stockName: 'apple',
  side: OrderSideEnum.BUY,
  price: 300,
  quantity: 2,
  user: userOutput,
  auditInfo: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  generateId: () => 'mock-id',
};
export const mockOrderBookBuyDataExcessOrder: OrderBookEntity = {
  id: 'c212e0e8-aa57-46e8-86ea-782bc224e0fe',
  stockName: 'apple',
  side: OrderSideEnum.BUY,
  price: 300,
  quantity: 5,
  user: userOutput,
  auditInfo: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  generateId: () => 'mock-id',
};
export const mockOrderBookSellData: OrderBookEntity = {
  id: 'c212e0e8-aa57-46e8-86ea-782bc224e0fe',
  stockName: 'apple',
  side: OrderSideEnum.SELL,
  price: 300,
  quantity: 3,
  user: userOutput,
  auditInfo: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  generateId: () => 'mock-id',
};
export const mockCreateSellOrderRequest: CreateSellOrderReqDto = {
  stockName: 'apple',
  side: OrderSideEnum.SELL,
  quantity: 3,
  price: 300,
};
export const mockCreateOrderRequest: CreateOrderBookReqDto = {
  stockName: 'apple',
  side: OrderSideEnum.BUY,
  quantity: 3,
  price: 300,
};

export const mockCreateSellOrderResponse: ISellTrade = {
  totalStockSold: 150,
  fundsAdded: 300,
  trades: [
    {
      buyOrderId: 'c212e0e8-aa57-46e8-86ea-782bc224e0fe',
      buyerId: userOutput.id,
      sellUserId: '48ede012-aa2c-4942-b4e0-f5cab919dc7a',
      stockName: mockCreateSellOrderRequest.stockName,
      price: mockCreateSellOrderRequest.price,
      quantity: 280,
    },
  ],
  remainingOrder: mockOrderBookBuyData,
};

export const mockCreateBuyOrderRequest: CreateBuyOrderReqDto = {
  stockName: 'apple',
  side: OrderSideEnum.BUY,
  quantity: 3,
  price: 300,
};

export const mockCreateBuyOrderResponse: IBuyTrade = {
  totalStockBought: 150,
  fundsSpent: 300,
  trades: [
    {
      buyOrderId: 'c212e0e8-aa57-46e8-86ea-782bc224e0fe',
      buyerId: userOutput.id,
      sellUserId: '48ede012-aa2c-4942-b4e0-f5cab919dc7a',
      stockName: mockCreateBuyOrderRequest.stockName,
      price: mockCreateBuyOrderRequest.price,
      quantity: 280,
    },
  ],
  remainingOrder: mockOrderBookBuyData,
};

export const query: GetOrderBooksReqDto = {
  stockName: 'apple',
  side: OrderSideEnum.BUY,
};

export const mockOrderBook: IOrderBook = {
  BUY: [{ price: 300, quantity: 3, stockName: 'apple' }],
  SELL: [{ price: 350, quantity: 3, stockName: 'apple' }],
};
export const mockRawOrders: any = [
  {
    price: 300,
    quantity: '3',
    stockName: 'apple',
    side: OrderSideEnum.BUY,
  },
  {
    price: 350,
    quantity: '2',
    stockName: 'apple',
    side: OrderSideEnum.SELL,
  },
];
