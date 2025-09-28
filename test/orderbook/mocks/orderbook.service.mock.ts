import { IOrderbookService } from '../../../src/orderbook/interfaces';

export const mockOrderBookService = (): IOrderbookService => ({
  createOrder: jest.fn(),
  getOrderBooks: jest.fn(),
  getOrdersByUserId: jest.fn(),
  deleteOrder: jest.fn(),
  sellOrder: jest.fn(),
  buyOrder: jest.fn(),
});
