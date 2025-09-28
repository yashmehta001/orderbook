import { WalletEntity } from '../../../src/wallet/entities/wallet.entity';
import {
  UserCreateReqDto,
  UserLoginReqDto,
  UserProfileReqDto,
} from '../../../src/users/dto';
import { UserEntity } from '../../../src/users/entities';
import { UserType } from '../../../src/utils/token/types';

export const createUserInput: UserCreateReqDto = {
  firstName: 'john',
  lastName: 'doe',
  email: 'john@doe.com',
  password: '123456',
};

export const userOutput: UserEntity = {
  id: 'some-id',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'hashed-password',
  auditInfo: {
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
    deletedAt: undefined,
  },
  orders: [],
  orderHistory: [],

  wallet: WalletEntity
    ? ({
        funds: 1000,
        id: 'wallet-id',
      } as WalletEntity)
    : undefined,
};

export const loginUserInput: UserLoginReqDto = {
  email: 'john@doe.com',
  password: '123456',
};

export const userProfileInput: UserProfileReqDto = {
  id: '929270f8-f62e-4580-8533-10d473ce520a',
  userType: UserType.USER,
  email: 'john@doe.com',
  iat: 1234,
  exp: 1234,
};

export const invalidUserProfileInput = {
  id: '929270f8-f62e-4580-8533-10d473ce520a',
  userType: UserType.USER,
  email: 'john@doe.com',
  iat: 1234,
  exp: 1234,
};

export const token = 'token';

export const userOutputWithToken = {
  token: `Bearer ${token}`,
  user: { ...userOutput },
};

export const validInputCreate = {
  firstName: 'john',
  lastName: 'doe',
  email: 'john@doe.com',
  password: '123456',
  funds: 0,
};

export const invalidEmailInputCreate = {
  firstName: 'john',
  lastName: 'doe',
  email: 'johndoe.com',
  password: '123456',
  funds: 0,
};

export const validInputLogin = {
  email: 'john@doe.com',
  password: '123456',
};

export const invalidInputLogin = {
  email: 'johndoe.com',
  password: '123456',
};
