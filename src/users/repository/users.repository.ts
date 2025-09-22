import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities';
import { Repository } from 'typeorm/repository/Repository';
import { UserCreateReqDto } from '../dto';
import { EntityManager } from 'typeorm';

export interface IUserRepository {
  save(userEntity: UserCreateReqDto): Promise<UserEntity>;

  getByEmail(email: string): Promise<UserEntity | null>;

  getById(id: string): Promise<UserEntity | null>;
}

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
  ) {}

  private getRepo(manager?: EntityManager) {
    return manager ? manager.getRepository(UserEntity) : this.userEntity;
  }
  async save(
    userInfo: UserCreateReqDto,
    manager?: EntityManager,
  ): Promise<UserEntity> {
    const repo = this.getRepo(manager);
    const userEntity = repo.create(userInfo);
    return await repo.save(userEntity);
  }

  async getByEmail(email: string): Promise<UserEntity | null> {
    return await this.userEntity.findOne({
      where: {
        email,
      },
    });
  }

  async getById(id: string): Promise<UserEntity | null> {
    return await this.userEntity.findOne({
      where: {
        id,
      },
    });
  }
}
