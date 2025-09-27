import { EntityManager } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';

export interface IWalletsRepository {
  save(
    walletInfo: Partial<WalletEntity>,
    manager?: EntityManager,
  ): Promise<WalletEntity>;

  findOneById(
    id: string,
    manager?: EntityManager,
  ): Promise<WalletEntity | null>;

  saveEntity(
    entity: WalletEntity,
    manager?: EntityManager,
  ): Promise<WalletEntity>;
}
