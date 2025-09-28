import { IOrderHistoryRepository } from '../../../src/orderHistory/interfaces/orderHistory.repository.interface';

export const mockOrderHistoryRepository = (): IOrderHistoryRepository => ({
  save: jest.fn(),
  getByUserId: jest.fn(),
  findOneById: jest.fn(),
  saveEntity: jest.fn(),
  removeEntity: jest.fn(),
  existsById: jest.fn(),
});
