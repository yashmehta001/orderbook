import { IOrderHistoryService } from '../../../orderHistory/services/orderHistory.service';

export const mockOrderHistoryService = (): IOrderHistoryService => ({
  createOrderHistory: jest.fn(),
  getOrderHistoryByUserId: jest.fn(),
});
