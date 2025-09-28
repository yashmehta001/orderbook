import { IFundsProcessorService } from '../../../src/orderbook/interfaces';

export const mockFundsProcessorService = (): IFundsProcessorService => ({
  processFundsForSell: jest.fn(),
  processFundsForBuy: jest.fn(),
});
