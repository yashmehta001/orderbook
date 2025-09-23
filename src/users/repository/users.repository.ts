import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities';
import { Repository } from 'typeorm/repository/Repository';
import { UserCreateReqDto } from '../dto';
import { EntityManager } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
  ) {}

  private getRepo(manager?: EntityManager): Repository<UserEntity> {
    return manager ? manager.getRepository(UserEntity) : this.userEntity;
  }
  async save(
    userInfo: UserCreateReqDto,
    manager?: EntityManager,
  ): Promise<UserEntity> {
    const repo = this.getRepo(manager);
    const userEntity = repo.create(userInfo);
    return repo.save(userEntity);
  }

  async getByEmail(email: string): Promise<UserEntity | null> {
    return this.userEntity.findOne({
      where: {
        email,
      },
    });
  }

  async getById(id: string): Promise<UserEntity | null> {
    return this.userEntity.findOne({
      where: {
        id,
      },
    });
  }
}
