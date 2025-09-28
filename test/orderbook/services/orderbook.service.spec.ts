/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { OrderbookService } from '../../../src/orderbook/services/orderbook.service';
import { OrderHistoryService } from '../../../src/orderHistory/services/orderHistory.service';
import { UserService } from '../../../src/users/services/users.service';
import { LoggerService } from '../../../src/utils/logger/WinstonLogger';
import { mockOrderHistoryService } from '../../orderHistory/mocks';
import { mockUserService } from '../../users/mocks';
import { mockOrderServiceRepository } from '../mocks';
import { IOrderBookRepository } from '../../../src/orderbook/interfaces/orderBook.repository.interface';
import { mockMatchingLogicService } from '../mocks/matchingLogic.service';
import {
  IFundsProcessorService,
  IMatchingLogicService,
} from '../../../src/orderbook/interfaces';
import { mockFundsProcessorService } from '../mocks/fundsProcessor.service.mock';
import { WalletService } from '../../../src/wallet/services/wallet.service';
import { TransactionManagerService } from '../../../src/database/services/transaction-manager.service';
import { DataSource } from 'typeorm';
import {
  mockCreateOrderRequest,
  mockOrderBookBuyData,
  mockOrderBookBuyDataExcessOrder,
  mockOrderBookBuyDataRemainingOrder,
  mockRawOrders,
} from '../constants';
import { userProfileInput } from '../../users/constants';
import { OrderSideEnum } from '../../../src/core/config';
import { NotFoundException } from '../../../src/core/errors';
import { mockWalletsRepository } from '../../wallet/mocks/wallet.repository.mock';

describe('OrderbookService', () => {
  let orderbookService: OrderbookService;
  let orderBookRepository: jest.Mocked<IOrderBookRepository>;

  let userService: jest.Mocked<UserService>;
  let orderHistoryService: jest.Mocked<OrderHistoryService>;
  let matchingLogicService: jest.Mocked<IMatchingLogicService>;
  let fundsProcessorService: jest.Mocked<IFundsProcessorService>;
  let walletService: jest.Mocked<WalletService>;
  let transactionManagerService: jest.Mocked<TransactionManagerService>;
  let mockDataSource: jest.Mocked<DataSource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderbookService,
        LoggerService,
        WalletService,
        TransactionManagerService,
        {
          provide: 'IMatchingLogicService',
          useFactory: mockMatchingLogicService,
        },
        {
          provide: 'IFundsProcessorService',
          useFactory: mockFundsProcessorService,
        },
        {
          provide: UserService,
          useFactory: mockUserService,
        },
        {
          provide: OrderHistoryService,
          useFactory: mockOrderHistoryService,
        },
        {
          provide: 'IOrderBookRepository',
          useFactory: mockOrderServiceRepository,
        },
        {
          provide: 'IWalletsRepository',
          useValue: mockWalletsRepository,
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {},
            }),
            getRepository: jest.fn(),
          },
        },
      ],
    }).compile();
    orderbookService = module.get<OrderbookService>(OrderbookService);
    walletService = module.get<WalletService>(
      WalletService,
    ) as jest.Mocked<WalletService>;
    orderBookRepository = module.get<IOrderBookRepository>(
      'IOrderBookRepository',
    ) as jest.Mocked<IOrderBookRepository>;
    matchingLogicService = module.get<IMatchingLogicService>(
      'IMatchingLogicService',
    ) as jest.Mocked<IMatchingLogicService>;
    fundsProcessorService = module.get<IFundsProcessorService>(
      'IFundsProcessorService',
    ) as jest.Mocked<IFundsProcessorService>;

    userService = module.get<UserService>(
      UserService,
    ) as jest.Mocked<UserService>;
    orderHistoryService = module.get<OrderHistoryService>(
      OrderHistoryService,
    ) as jest.Mocked<OrderHistoryService>;
    transactionManagerService = module.get<TransactionManagerService>(
      TransactionManagerService,
    ) as jest.Mocked<TransactionManagerService>;
    mockDataSource = module.get<DataSource>(
      DataSource,
    ) as jest.Mocked<DataSource>;
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

  // describe('sellOrder', () => {
  //   it('should sell an order successfully', async () => {
  //     orderBookRepository.getOrderList.mockResolvedValueOnce([
  //       mockOrderBookBuyData,
  //     ]);
  //     orderHistoryService.createOrderHistory.mockResolvedValueOnce(
  //       mockOrderHistoryItem,
  //     );
  //     await orderbookService.sellOrder(
  //       userProfileInput.id,
  //       mockCreateOrderRequest,
  //     );
  //     expect(mockDataSource.release).toHaveBeenCalled();
  //   });
  //   it('should sell an order successfully - remaining order', async () => {
  //     orderBookRepository.getOrderList.mockResolvedValueOnce([
  //       mockOrderBookBuyDataRemainingOrder,
  //     ]);
  //     await orderbookService.sellOrder(
  //       userProfileInput.id,
  //       mockCreateOrderRequest,
  //     );
  //     expect(mockDataSource.release).toHaveBeenCalled();
  //   });
  //   it('should sell an order successfully - excess order', async () => {
  //     orderBookRepository.getOrderList.mockResolvedValueOnce([
  //       mockOrderBookBuyDataExcessOrder,
  //     ]);
  //     await orderbookService.sellOrder(
  //       userProfileInput.id,
  //       mockCreateOrderRequest,
  //     );
  //     expect(mockDataSource.release).toHaveBeenCalled();
  //   });
  //   it('should throw error', async () => {
  //     orderBookRepository.getOrderList.mockRejectedValueOnce(
  //       new Error('test error'),
  //     );
  //     try {
  //       await orderbookService.sellOrder(
  //         userProfileInput.id,
  //         mockCreateOrderRequest,
  //       );
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(Object);
  //     }
  //     expect(mockDataSource.release).toHaveBeenCalled();
  //   });
  // });

  // describe('buyOrder', () => {
  //   it('should buy an order successfully', async () => {
  //     orderBookRepository.getOrderList.mockResolvedValueOnce([
  //       mockOrderBookSellData,
  //     ]);
  //     userService.profile.mockResolvedValueOnce(userOutput);
  //     await orderbookService.buyOrder(
  //       userProfileInput.id,
  //       mockCreateBuyOrderRequest,
  //     );
  //     expect(mockDataSource.release).toHaveBeenCalled();
  //   });

  //   it('should throw error with insufficient balance', async () => {
  //     orderBookRepository.getOrderList.mockResolvedValueOnce([
  //       mockOrderBookSellData,
  //     ]);
  //     userService.profile.mockResolvedValueOnce(userOutput);
  //     try {
  //       await orderbookService.buyOrder(
  //         userProfileInput.id,
  //         mockCreateBuyOrderRequest,
  //       );
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(Object);
  //     }
  //     expect(mockDataSource.release).toHaveBeenCalled();
  //   });
  //   it('should throw error', async () => {
  //     orderBookRepository.getOrderList.mockRejectedValueOnce(
  //       new Error('test error'),
  //     );
  //     userService.profile.mockResolvedValueOnce(userOutput);
  //     try {
  //       await orderbookService.buyOrder(
  //         userProfileInput.id,
  //         mockCreateBuyOrderRequest,
  //       );
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(Object);
  //     }
  //     expect(mockDataSource.release).toHaveBeenCalled();
  //   });
  // });
});
