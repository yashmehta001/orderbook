import { OrderSideEnum } from '../../../src/core/config';
import { OrderHistoryEntity } from '../../../src/orderHistory/entities/orderHistory.entity';
import {
  OrderHistoryItemDto,
  OrderHistoryTransactionResDto,
} from '../../../src/orderHistory/dto';
import { userOutput } from '../../users/constants';

export const mockOrderHistoryItem: OrderHistoryEntity = {
  id: 'h1',
  stockName: 'apple',
  side: OrderSideEnum.BUY,
  price: 100,
  quantity: 10,
  user: userOutput,
  transactionId: 'txn1',
  auditInfo: {
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export const mockOrderHistoryItemGrouped: OrderHistoryItemDto = {
  id: 'h1',
  stockName: 'apple',
  side: OrderSideEnum.BUY,
  price: 100,
  quantity: 10,
  createdAt: mockOrderHistoryItem.auditInfo.createdAt,
};
export const mockGroupedHistory: OrderHistoryTransactionResDto[] = [
  {
    transactionId: 'txn1',
    orders: [mockOrderHistoryItemGrouped],
  },
];

export const mockEmptyGroupedHistory: OrderHistoryEntity[] = [];
