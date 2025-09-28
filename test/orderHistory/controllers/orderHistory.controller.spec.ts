import { Test, TestingModule } from '@nestjs/testing';
import { OrderHistoryController } from '../../../src/orderHistory/orderHistory.controller';
import { OrderHistoryService } from '../../../src/orderHistory/services/orderHistory.service';

import { mockOrderHistoryService } from '../mocks';
import { userProfileInput } from '../../users/constants';

describe('OrderHistory Controller', () => {
  let orderHistoryService: jest.Mocked<OrderHistoryService>;
  let orderHistoryController: OrderHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderHistoryController,
        {
          provide: OrderHistoryService,
          useFactory: mockOrderHistoryService,
        },
      ],
    }).compile();
    orderHistoryService = module.get<OrderHistoryService>(
      OrderHistoryService,
    ) as jest.Mocked<OrderHistoryService>;
    orderHistoryController = module.get<OrderHistoryController>(
      OrderHistoryController,
    );
  });

  it('OrderHistoryController should be defined', () => {
    expect(orderHistoryController).toBeDefined();
  });

  describe('Get Order History', () => {
    it('Valid request should return valid response', async () => {
      orderHistoryService.getOrderHistoryByUserId.mockResolvedValue([]);

      const orders = await orderHistoryController.history(userProfileInput);
      expect(orders).toEqual([]);
    });
  });
});
