import { IOrderbookService } from '../../services/orderbook.service';

export const mockOrderBookService = (): IOrderbookService => ({
  createOrder: jest.fn(),
  getOrderBooks: jest.fn(),
  getOrdersByUserId: jest.fn(),
  deleteOrder: jest.fn(),
  sellOrder: jest.fn(),
  buyOrder: jest.fn(),
  validateBalance: jest.fn(),
});
