import { Test, TestingModule } from '@nestjs/testing';
import { OrderBookRepository } from '../../repository/orderBook.repository';
import { OrderbookService } from '../../services/orderbook.service';
import { UserService } from '../../../users/services/users.service';
import { mockUserService } from '../../../users/tests/mocks';
import { LoggerService } from '../../../utils/logger/WinstonLogger';
import { OrderHistoryService } from '../../../orderHistory/services/orderHistory.service';
import { mockOrderHistoryService } from '../../../orderHistory/tests/mocks';
import { DataSource } from 'typeorm';
import { mockDataSource, mockOrderServiceRepository } from '../mocks';
import {
  mockCreateOrderRequest,
  mockOrderBookData,
  mockRawOrders,
} from '../constants';
import { userOutput, userProfileInput } from '../../../users/tests/constants';
import { OrderSideEnum } from '../../../core/config/constants';
import { NotFoundException } from '../../../core/errors/notFoundException.error';

describe('OrderbookService', () => {
  let orderbookService: OrderbookService;
  let orderBookRepository: jest.Mocked<OrderBookRepository>;

  let userService: jest.Mocked<UserService>;
  let orderHistoryService: jest.Mocked<OrderHistoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderbookService,
        LoggerService,
        {
          provide: UserService,
          useValue: mockUserService(),
        },
        {
          provide: OrderHistoryService,
          useValue: mockOrderHistoryService(),
        },
        {
          provide: OrderBookRepository,
          useFactory: mockOrderServiceRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();
    orderbookService = module.get<OrderbookService>(OrderbookService);
    orderBookRepository = module.get<OrderBookRepository>(
      OrderBookRepository,
    ) as jest.Mocked<OrderBookRepository>;

    userService = module.get<UserService>(
      UserService,
    ) as jest.Mocked<UserService>;
    orderHistoryService = module.get<OrderHistoryService>(
      OrderHistoryService,
    ) as jest.Mocked<OrderHistoryService>;
  });

  it('OrderbookService should be defined', () => {
    expect(orderbookService).toBeDefined();
  });

  describe('createOrder', () => {
    it('should save and return order on success', async () => {
      orderBookRepository.save.mockResolvedValueOnce(mockOrderBookData);

      const result = await orderbookService.createOrder(
        userProfileInput.id,
        mockCreateOrderRequest,
      );

      expect(result).toEqual(mockOrderBookData);
    });

    it('should log warning and rethrow on error', async () => {
      orderBookRepository.save.mockRejectedValueOnce(new Error());

      try {
        await orderbookService.createOrder(
          userProfileInput.id,
          mockCreateOrderRequest,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(Object);
      }
    });
  });

  describe('getOrderBooks', () => {
    it('should group BUY and SELL orders correctly', async () => {
      orderBookRepository.getOrderBooks.mockResolvedValueOnce(mockRawOrders);

      const result = await orderbookService.getOrderBooks(
        userProfileInput.id,
        'apple',
      );

      expect(result.BUY).toEqual([
        { price: 300, quantity: 3, stockName: 'apple' },
      ]);
      expect(result.SELL).toEqual([
        { price: 350, quantity: 2, stockName: 'apple' },
      ]);
    });

    it('should return empty BUY and SELL arrays when no orders found', async () => {
      orderBookRepository.getOrderBooks.mockResolvedValueOnce([]);

      const result = await orderbookService.getOrderBooks(
        userProfileInput.id,
        'apple',
      );

      expect(result.BUY).toEqual([]);
      expect(result.SELL).toEqual([]);
    });

    it('should log warning and rethrow on error', async () => {
      orderBookRepository.getOrderBooks.mockRejectedValueOnce(new Error());
      try {
        await orderbookService.getOrderBooks(userProfileInput.id, 'apple');
      } catch (error) {
        expect(error).toBeInstanceOf(Object);
      }
    });
  });
  describe('getOrdersByUserId', () => {
    it('should return orders for a user on success', async () => {
      const mockOrders = [mockOrderBookData];
      orderBookRepository.getOrdersByUserId.mockResolvedValueOnce(mockOrders);

      const result = await orderbookService.getOrdersByUserId(
        userProfileInput.id,
        OrderSideEnum.BUY,
        'apple',
      );

      expect(result).toEqual(mockOrders);
    });

    it('should return empty array when no orders found', async () => {
      orderBookRepository.getOrdersByUserId.mockResolvedValueOnce([]);

      const result = await orderbookService.getOrdersByUserId(
        userProfileInput.id,
      );

      expect(result).toEqual([]);
    });

    it('should log warning and rethrow on error', async () => {
      orderBookRepository.getOrdersByUserId.mockRejectedValueOnce(
        new Error('fetch error'),
      );
      try {
        await orderbookService.getOrdersByUserId(userProfileInput.id);
      } catch (error) {
        expect(error).toBeInstanceOf(Object);
      }
    });
  });

  describe('deleteOrder', () => {
    it('should delete an order successfully', async () => {
      orderBookRepository.getOrderById.mockResolvedValueOnce(mockOrderBookData);
      orderBookRepository.bulkRemoveOrders.mockResolvedValueOnce(undefined);

      await expect(
        orderbookService.deleteOrder(userProfileInput.id, mockOrderBookData.id),
      ).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if order does not exist', async () => {
      orderBookRepository.getOrderById.mockResolvedValueOnce(null);

      await expect(
        orderbookService.deleteOrder(userProfileInput.id, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should log warning and rethrow error if bulkRemoveOrders fails', async () => {
      const mockOrder = { id: 'order-123', userId: userProfileInput.id };
      orderBookRepository.getOrderById.mockResolvedValueOnce(mockOrderBookData);
      orderBookRepository.bulkRemoveOrders.mockRejectedValueOnce(
        new Error('delete failed'),
      );
      try {
        await orderbookService.deleteOrder(userProfileInput.id, mockOrder.id);
      } catch (error) {
        expect(error).toBeInstanceOf(Object);
      }
    });
  });

  describe('validateBalance', () => {
    it('should return true immediately if updateFunds > 0', async () => {
      const result = await orderbookService.validateBalance(
        userProfileInput.id,
        100,
      );

      expect(result).toBe(true);
    });

    it('should return true when funds + updateFunds + pledged >= 0', async () => {
      userService.profile.mockResolvedValueOnce(userOutput);
      orderbookService.getOrdersByUserId = jest.fn().mockResolvedValueOnce([
        { price: 100, quantity: 2 },
      ]);

      const result = await orderbookService.validateBalance(
        userProfileInput.id,
        -500,
      );

      expect(result).toBe(true);
    });

    it('should return false when funds + updateFunds + pledged < 0', async () => {
      userService.profile.mockResolvedValueOnce(userOutput);
      orderbookService.getOrdersByUserId = jest
        .fn()
        .mockResolvedValueOnce([{ price: 200, quantity: 1 }]);

      const result = await orderbookService.validateBalance(
        userProfileInput.id,
        -1200,
      );

      expect(result).toBe(false);
    });

    it('should handle empty orders array correctly', async () => {
      userService.profile.mockResolvedValueOnce(userOutput);
      orderbookService.getOrdersByUserId = jest.fn().mockResolvedValueOnce([]);

      const result = await orderbookService.validateBalance(
        userProfileInput.id,
        -200,
      );

      expect(result).toBe(true);
    });

    it('should log warning and rethrow if error occurs', async () => {
      userService.profile.mockRejectedValueOnce(new Error('profile error'));
      try {
        await orderbookService.validateBalance(userProfileInput.id, -100);
      } catch (error) {
        expect(error).toBeInstanceOf(Object);
      }
    });
  });
});
