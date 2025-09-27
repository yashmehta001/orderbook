import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionManagerService {
  constructor(private readonly dataSource: DataSource) {}
  public async runInTransaction<T>(
    cb: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await cb(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
