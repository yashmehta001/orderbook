import { IOrderHistoryService } from '../../../src/orderHistory/interfaces/orderHistory.service.interface';

export const mockOrderHistoryService = (): IOrderHistoryService => ({
  createOrderHistory: jest.fn(),
  getOrderHistoryByUserId: jest.fn(),
});
