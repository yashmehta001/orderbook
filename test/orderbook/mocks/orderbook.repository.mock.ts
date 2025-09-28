import { IOrderBookRepository } from '../../../src/orderbook/interfaces/orderBook.repository.interface';

export const mockOrderServiceRepository = (): IOrderBookRepository => ({
  save: jest.fn(),
  getOrderBooks: jest.fn(),
  getOrderById: jest.fn(),
  getOrdersByUserId: jest.fn(),
  getOrderList: jest.fn(),
  bulkRemoveOrders: jest.fn(),
  bulkUpdateQuantities: jest.fn(),
  findOneById: jest.fn(),
  saveEntity: jest.fn(),
  removeEntity: jest.fn(),
  existsById: jest.fn(),
});
