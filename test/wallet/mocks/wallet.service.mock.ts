import { IWalletService } from '../../../src/wallet/interfaces/wallet.service.interface';

export const mockWalletService = (): IWalletService => ({
  getUserFunds: jest.fn(),
  updateUserFunds: jest.fn(),
  validateBalance: jest.fn(),
});
