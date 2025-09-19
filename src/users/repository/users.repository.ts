import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities';
import { Repository } from 'typeorm/repository/Repository';
import { UserCreateReqDto } from '../dto';

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

  async save(userInfo: UserCreateReqDto): Promise<UserEntity> {
    const userEntity = this.userEntity.create(userInfo);
    return await this.userEntity.save(userEntity);
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
