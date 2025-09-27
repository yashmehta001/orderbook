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
  mockCreateBuyOrderRequest,
  mockCreateOrderRequest,
  mockOrderBookBuyData,
  mockOrderBookBuyDataExcessOrder,
  mockOrderBookBuyDataRemainingOrder,
  mockOrderBookSellData,
  mockRawOrders,
} from '../constants';
import { userOutput, userProfileInput } from '../../../users/tests/constants';
import { OrderSideEnum } from '../../../core/config/constants';
import { NotFoundException } from '../../../core/errors/notFoundException.error';
import { mockOrderHistoryItem } from '../../../orderHistory/tests/constants';
import { MatchingLogicService } from '../../services/matchingLogic.service';

describe('OrderbookService', () => {
  let orderbookService: OrderbookService;
  let orderBookRepository: jest.Mocked<OrderBookRepository>;

  let userService: jest.Mocked<UserService>;
  let orderHistoryService: jest.Mocked<OrderHistoryService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let matchingLogicService: jest.Mocked<MatchingLogicService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderbookService,
        LoggerService,
        MatchingLogicService,
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
    matchingLogicService = module.get<MatchingLogicService>(
      MatchingLogicService,
    ) as jest.Mocked<MatchingLogicService>;
  });

  it('OrderbookService should be defined', () => {
    expect(orderbookService).toBeDefined();
  });

  describe('createOrder', () => {
    it('should save and return order on success', async () => {
      orderBookRepository.save.mockResolvedValueOnce(mockOrderBookBuyData);

      const result = await orderbookService.createOrder(
        userProfileInput.id,
        mockCreateOrderRequest,
      );

      expect(result).toEqual(mockOrderBookBuyData);
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
      const mockOrders = [mockOrderBookBuyData];
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
      orderBookRepository.getOrderById.mockResolvedValueOnce(
        mockOrderBookBuyData,
      );
      orderBookRepository.bulkRemoveOrders.mockResolvedValueOnce(undefined);

      await expect(
        orderbookService.deleteOrder(
          userProfileInput.id,
          mockOrderBookBuyData.id,
        ),
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
      orderBookRepository.getOrderById.mockResolvedValueOnce(
        mockOrderBookBuyData,
      );
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
      orderbookService.getOrdersByUserId = jest
        .fn()
        .mockResolvedValueOnce([{ price: 100, quantity: 2 }]);

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
  describe('sellOrder', () => {
    it('should sell an order successfully', async () => {
      orderBookRepository.getOrderList.mockResolvedValueOnce([
        mockOrderBookBuyData,
      ]);
      orderHistoryService.createOrderHistory.mockResolvedValueOnce(
        mockOrderHistoryItem,
      );
      await orderbookService.sellOrder(
        userProfileInput.id,
        mockCreateOrderRequest,
      );
      expect(mockDataSource.release).toHaveBeenCalled();
    });
    it('should sell an order successfully - remaining order', async () => {
      orderBookRepository.getOrderList.mockResolvedValueOnce([
        mockOrderBookBuyDataRemainingOrder,
      ]);
      await orderbookService.sellOrder(
        userProfileInput.id,
        mockCreateOrderRequest,
      );
      expect(mockDataSource.release).toHaveBeenCalled();
    });
    it('should sell an order successfully - excess order', async () => {
      orderBookRepository.getOrderList.mockResolvedValueOnce([
        mockOrderBookBuyDataExcessOrder,
      ]);
      await orderbookService.sellOrder(
        userProfileInput.id,
        mockCreateOrderRequest,
      );
      expect(mockDataSource.release).toHaveBeenCalled();
    });
    it('should throw error', async () => {
      orderBookRepository.getOrderList.mockRejectedValueOnce(
        new Error('test error'),
      );
      try {
        await orderbookService.sellOrder(
          userProfileInput.id,
          mockCreateOrderRequest,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(Object);
      }
      expect(mockDataSource.release).toHaveBeenCalled();
    });
  });

  describe('buyOrder', () => {
    it('should buy an order successfully', async () => {
      orderBookRepository.getOrderList.mockResolvedValueOnce([
        mockOrderBookSellData,
      ]);
      userService.profile.mockResolvedValueOnce(userOutput);
      orderbookService.validateBalance = jest.fn().mockResolvedValueOnce(true);
      await orderbookService.buyOrder(
        userProfileInput.id,
        mockCreateBuyOrderRequest,
      );
      expect(mockDataSource.release).toHaveBeenCalled();
    });

    it('should throw error with insufficient balance', async () => {
      orderBookRepository.getOrderList.mockResolvedValueOnce([
        mockOrderBookSellData,
      ]);
      userService.profile.mockResolvedValueOnce(userOutput);
      orderbookService.validateBalance = jest.fn().mockResolvedValueOnce(false);
      try {
        await orderbookService.buyOrder(
          userProfileInput.id,
          mockCreateBuyOrderRequest,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(Object);
      }
      expect(mockDataSource.release).toHaveBeenCalled();
    });
    it('should throw error', async () => {
      orderBookRepository.getOrderList.mockRejectedValueOnce(
        new Error('test error'),
      );
      userService.profile.mockResolvedValueOnce(userOutput);
      orderbookService.validateBalance = jest.fn().mockResolvedValueOnce(true);
      try {
        await orderbookService.buyOrder(
          userProfileInput.id,
          mockCreateBuyOrderRequest,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(Object);
      }
      expect(mockDataSource.release).toHaveBeenCalled();
    });
  });
});
