import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { BaseRepository } from '../../core/entity/BaseRepository';
import { WalletEntity } from '../entities/wallet.entity';

@Injectable()
export class WalletsRepository extends BaseRepository<WalletEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource);
  }
  protected entity = WalletEntity;

  async save(
    walletInfo: Partial<WalletEntity>,
    manager?: EntityManager,
  ): Promise<WalletEntity> {
    const repo = this.getRepo(manager);
    const WalletEntity = repo.create(walletInfo);
    return repo.save(WalletEntity);
  }
}
