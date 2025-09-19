import { UserCreateReqDto } from '../../users/dto';

export enum OrderSideEnum {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum EnvironmentEnum {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
  Test = 'test',
}

export const seedUser: UserCreateReqDto = {
  email: 'admin@orderbook.com',
  password: 'Admin@123',
  firstName: 'Admin',
  lastName: 'User',
  funds: 100000000,
};
