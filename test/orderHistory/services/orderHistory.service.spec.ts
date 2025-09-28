import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '../../../src/utils/logger/WinstonLogger';
import { OrderHistoryService } from '../../../src/orderHistory/services/orderHistory.service';
import { OrderHistoryRepository } from '../../../src/orderHistory/repository/orderHistory.repository';
import { CreateOrderHistoryDto } from '../../../src/orderHistory/dto';
import { mockOrderHistoryRepository } from '../mocks';
import {
  mockEmptyGroupedHistory,
  mockGroupedHistory,
  mockOrderHistoryItem,
} from '../constants';
import { userOutput } from '../../users/constants';

describe('OrderHistoryService', () => {
  let orderHistoryService: OrderHistoryService;
  let orderHistoryRepository: jest.Mocked<OrderHistoryRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderHistoryService,
        LoggerService,
        {
          provide: 'IOrderHistoryRepository',
          useFactory: mockOrderHistoryRepository,
        },
      ],
    }).compile();
    orderHistoryService = module.get<OrderHistoryService>(OrderHistoryService);
    orderHistoryRepository = module.get('IOrderHistoryRepository');
  });

  it('OrderHistoryService should be defined', () => {
    expect(OrderHistoryService).toBeDefined();
  });

  describe('createOrderHistory', () => {
    it('should save order history successfully', async () => {
      orderHistoryRepository.save.mockResolvedValue(mockOrderHistoryItem);

      const dto: CreateOrderHistoryDto = {
        ...mockOrderHistoryItem,
        user: userOutput,
      };

      const result = await orderHistoryService.createOrderHistory(dto);

      expect(result).toEqual(mockOrderHistoryItem);
    });

    it('should return nothing if quantity <= 0', async () => {
      const dto: CreateOrderHistoryDto = {
        ...mockOrderHistoryItem,
        quantity: 0,
        user: userOutput,
      };

      const result = await orderHistoryService.createOrderHistory(dto);

      expect(result).toBeUndefined();
    });

    it('should throw error if save fails', async () => {
      const dto: CreateOrderHistoryDto = {
        ...mockOrderHistoryItem,
        user: userOutput,
      };
      orderHistoryRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(orderHistoryService.createOrderHistory(dto)).rejects.toThrow(
        'DB error',
      );
    });
  });
  describe('getOrderHistoryByUserId', () => {
    it('should fetch and group order history by transactionId', async () => {
      orderHistoryRepository.getByUserId.mockResolvedValue([
        mockOrderHistoryItem,
      ]);

      const result = await orderHistoryService.getOrderHistoryByUserId(
        userOutput.id,
      );

      expect(result).toEqual(mockGroupedHistory);
    });

    it('should return empty array if no history found', async () => {
      orderHistoryRepository.getByUserId.mockResolvedValue(
        mockEmptyGroupedHistory,
      );

      const result = await orderHistoryService.getOrderHistoryByUserId(
        userOutput.id,
      );

      expect(result).toEqual(mockEmptyGroupedHistory);
    });

    it('should throw error if repository fails', async () => {
      orderHistoryRepository.getByUserId.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        orderHistoryService.getOrderHistoryByUserId(userOutput.id),
      ).rejects.toThrow('DB error');
    });
  });
});
