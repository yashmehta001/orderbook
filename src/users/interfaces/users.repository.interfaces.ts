import { EntityManager } from 'typeorm';
import { UserCreateReqDto } from '../dto';
import { UserEntity } from '../entities';

export interface IUserRepository {
  save(
    userInfo: UserCreateReqDto,
    manager?: EntityManager,
  ): Promise<UserEntity>;

  getByEmail(email: string): Promise<UserEntity | null>;

  getById(id: string): Promise<UserEntity | null>;
}
