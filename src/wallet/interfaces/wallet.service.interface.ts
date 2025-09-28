import { EntityManager } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';

export interface IWalletService {
  getUserFunds(id: string): Promise<WalletEntity>;
  updateUserFunds(
    id: string,
    funds: number,
    manager?: EntityManager,
  ): Promise<WalletEntity>;
  validateBalance(userId: string, updateFunds: number): Promise<boolean>;
}
