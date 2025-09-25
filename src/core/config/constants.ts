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
export const seedOrders = [
  {
    stockName: 'apple',
    side: OrderSideEnum.BUY,
    quantity: 100,
    price: 150.5,
  },
  {
    stockName: 'apple',
    side: OrderSideEnum.SELL,
    quantity: 50,
    price: 155.0,
  },
  {
    stockName: 'google',
    side: OrderSideEnum.BUY,
    quantity: 200,
    price: 2500.0,
  },
  {
    stockName: 'google',
    side: OrderSideEnum.SELL,
    quantity: 100,
    price: 2550.0,
  },
];
