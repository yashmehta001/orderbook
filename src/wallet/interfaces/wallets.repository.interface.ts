import { EntityManager } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';
import { IBaseRepository } from '../../core/interfaces/BaseRepository.interface';

export interface IWalletsRepository extends IBaseRepository<WalletEntity> {
  save(
    walletInfo: Partial<WalletEntity>,
    manager?: EntityManager,
  ): Promise<WalletEntity>;
}
