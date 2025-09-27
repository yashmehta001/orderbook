import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from '../entities';
import { UserCreateReqDto } from '../dto';
import { DataSource, EntityManager } from 'typeorm';
import { BaseRepository } from '../../core/entity/BaseRepository';

export interface IUserRepository {
  save(
    userInfo: UserCreateReqDto,
    manager?: EntityManager,
  ): Promise<UserEntity>;

  getByEmail(email: string): Promise<UserEntity | null>;

  getById(id: string): Promise<UserEntity | null>;
}
@Injectable()
export class UserRepository
  extends BaseRepository<UserEntity>
  implements IUserRepository
{
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource);
  }
  protected entity = UserEntity;

  async save(
    userInfo: UserCreateReqDto,
    manager?: EntityManager,
  ): Promise<UserEntity> {
    const repo = this.getRepo(manager);
    const userEntity = repo.create(userInfo);
    return repo.save(userEntity);
  }

  async getByEmail(email: string): Promise<UserEntity | null> {
    return this.getRepo().findOne({ where: { email } });
  }

  async getById(id: string): Promise<UserEntity | null> {
    const user = this.getRepo().createQueryBuilder('user');
    user.where('user.id = :id', { id });
    user.leftJoinAndSelect('user.wallet', 'wallet');
    return user.getOne();
  }
}
