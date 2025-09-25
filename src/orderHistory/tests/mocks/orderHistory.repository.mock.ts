import { IOrderHistoryRepository } from '../../../orderHistory/repository/orderHistory.repository';

export const mockOrderHistoryRepository = (): IOrderHistoryRepository => ({
  save: jest.fn(),
  getByUserId: jest.fn(),
});
