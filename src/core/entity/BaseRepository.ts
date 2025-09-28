import { EntityManager, Repository, ObjectLiteral, DataSource } from 'typeorm';
import { IBaseRepository } from '../interfaces/BaseRepository.interface';

/**
 * BaseRepository
 * Provides common helpers for all repositories and ensures
 * transaction awareness when using EntityManager.
 */
export abstract class BaseRepository<T extends ObjectLiteral>
  implements IBaseRepository<T>
{
  protected abstract entity: { new (): T };

  constructor(protected readonly dataSource: DataSource) {}

  protected getRepo(manager?: EntityManager): Repository<T> {
    return manager
      ? manager.getRepository<T>(this.entity)
      : this.dataSource.getRepository<T>(this.entity);
  }

  async findOneById(id: string, manager?: EntityManager): Promise<T | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this.getRepo(manager).findOne({ where: { id } as any });
  }

  async saveEntity(entity: T, manager?: EntityManager): Promise<T> {
    return this.getRepo(manager).save(entity);
  }

  async removeEntity(entity: T, manager?: EntityManager): Promise<T> {
    return this.getRepo(manager).remove(entity);
  }

  async existsById(id: string, manager?: EntityManager): Promise<boolean> {
    const count = await this.getRepo(manager).count({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { id } as any,
    });
    return count > 0;
  }
}
