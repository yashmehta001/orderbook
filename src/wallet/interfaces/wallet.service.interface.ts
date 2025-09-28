import { EntityManager } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';

export interface IWalletService {
  getUserFunds(id: string): Promise<WalletEntity | null>;
  updateUserFunds(
    id: string,
    funds: number,
    manager?: EntityManager,
  ): Promise<WalletEntity>;
  validateBalance(userId: string, updateFunds: number): Promise<boolean>;
}
