import { IWalletsRepository } from '../../../src/wallet/interfaces/wallets.repository.interface';

export const mockWalletsRepository = (): IWalletsRepository => ({
  save: jest.fn(),
  findOneById: jest.fn(),
  existsById: jest.fn(),
  saveEntity: jest.fn(),
  removeEntity: jest.fn(),
});
