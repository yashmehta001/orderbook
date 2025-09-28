import { EntityManager } from 'typeorm';

export interface IBaseRepository<T> {
  findOneById(id: string, manager?: EntityManager): Promise<T | null>;
  saveEntity(entity: T, manager?: EntityManager): Promise<T>;
  removeEntity(entity: T, manager?: EntityManager): Promise<T>;
  existsById(id: string, manager?: EntityManager): Promise<boolean>;
}
