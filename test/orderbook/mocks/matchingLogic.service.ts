import { IMatchingLogicService } from '../../../src/orderbook/interfaces';

export const mockMatchingLogicService = (): IMatchingLogicService => ({
  matchOrders: jest.fn(),
});
