import { IOrderBookRepository } from '../../repository/orderBook.repository';

export const mockOrderServiceRepository = (): IOrderBookRepository => ({
  save: jest.fn(),
  getOrderBooks: jest.fn(),
  getOrderById: jest.fn(),
  getOrdersByUserId: jest.fn(),
  getOrderList: jest.fn(),
  bulkRemoveOrders: jest.fn(),
  bulkUpdateQuantities: jest.fn(),
});
