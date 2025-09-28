import { Test, TestingModule } from '@nestjs/testing';
import { MatchingLogicService } from '../../../src/orderbook/services/matchingLogic.service';
import { LoggerService } from '../../../src/utils/logger/WinstonLogger';
import { mockOrderHistoryService } from '../../orderHistory/mocks';
import {
  mockCreateSellOrderRequest,
  mockOrderBookBuyDataExcessOrder,
  mockOrderBookBuyDataRemainingOrder,
  mockOrderBookSellData,
  mockOrderBookSellDataV2,
} from '../constants';
import { userOutput } from '../../users/constants';
import { EntityManager } from 'typeorm';
import { OrderHistoryService } from '../../../src/orderHistory/services/orderHistory.service';

describe('MatchingLogicService', () => {
  let matchingLogicService: MatchingLogicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingLogicService,
        LoggerService,
        {
          provide: OrderHistoryService,
          useFactory: mockOrderHistoryService,
        },
      ],
    }).compile();

    matchingLogicService =
      module.get<MatchingLogicService>(MatchingLogicService);
  });

  it('MatchingLogicService should be defined', () => {
    expect(matchingLogicService).toBeDefined();
  });

  describe('matchOrders', () => {
    it('should match orders correctly', async () => {
      const initiatorId = 'initiator-id';
      const orderInfo = mockCreateSellOrderRequest;
      const oppositeOrders = [mockOrderBookSellData];
      const isSell = true;
      const manager = {} as EntityManager; // Mock EntityManager
      const orderId = 'new-order-id';

      const result = await matchingLogicService.matchOrders({
        initiatorId,
        orderInfo,
        oppositeOrders,
        isSell,
        manager,
        orderId,
      });

      expect(result.trades.length).toBe(1);
      expect(result.trades[0].quantity).toBe(3);
      expect(result.remainingQuantity).toBe(0);
      expect(result.ordersToRemove).toEqual([
        mockOrderBookBuyDataExcessOrder.id,
      ]);
      expect(result.ordersToUpdate).toEqual([]);
    });

    it('should handle no matches', async () => {
      const initiatorId = 'initiator-id';
      const orderInfo = mockCreateSellOrderRequest;
      const oppositeOrders = [];
      const isSell = true;
      const manager = {} as EntityManager; // Mock EntityManager
      const orderId = 'new-order-id';

      const result = await matchingLogicService.matchOrders({
        initiatorId,
        orderInfo,
        oppositeOrders,
        isSell,
        manager,
        orderId,
      });

      expect(result.trades.length).toBe(0);
      expect(result.remainingQuantity).toBe(3);
      expect(result.ordersToRemove).toEqual([]);
      expect(result.ordersToUpdate).toEqual([]);
    });
    it('should handle partial matches', async () => {
      const initiatorId = 'initiator-id';
      const orderInfo = mockCreateSellOrderRequest;
      const oppositeOrders = [mockOrderBookBuyDataRemainingOrder];
      const isSell = true;
      const manager = {} as EntityManager; // Mock EntityManager
      const orderId = 'new-order-id';

      const result = await matchingLogicService.matchOrders({
        initiatorId,
        orderInfo,
        oppositeOrders,
        isSell,
        manager,
        orderId,
      });

      expect(result.trades.length).toBe(1);
      expect(result.trades[0].quantity).toBe(2);
      expect(result.remainingQuantity).toBe(1);
      expect(result.ordersToRemove).toEqual([
        mockOrderBookBuyDataExcessOrder.id,
      ]);
      expect(result.ordersToUpdate).toEqual([]);
    });

    it('should handle removed matches', async () => {
      const initiatorId = 'initiator-id';
      const orderInfo = mockCreateSellOrderRequest;
      const oppositeOrders = [mockOrderBookBuyDataExcessOrder];
      const isSell = true;
      const manager = {} as EntityManager; // Mock EntityManager
      const orderId = 'new-order-id';

      const result = await matchingLogicService.matchOrders({
        initiatorId,
        orderInfo,
        oppositeOrders,
        isSell,
        manager,
        orderId,
      });

      expect(result.trades.length).toBe(1);
      expect(result.trades[0].quantity).toBe(3);
      expect(result.remainingQuantity).toBe(0);
      expect(result.ordersToRemove).toEqual([]);
      expect(result.ordersToUpdate).toEqual([
        { id: mockOrderBookBuyDataExcessOrder.id, quantity: 2 },
      ]);
    });
    it('should handle buy matches', async () => {
      const initiatorId = 'initiator-id';
      const orderInfo = mockOrderBookBuyDataExcessOrder;
      const isSell = false;
      const manager = {} as EntityManager; // Mock EntityManager
      const orderId = 'new-order-id';

      const result = await matchingLogicService.matchOrders({
        initiatorId,
        orderInfo,
        oppositeOrders: [mockOrderBookSellData],
        isSell,
        manager,
        orderId,
      });

      expect(result.trades.length).toBe(1);
      expect(result.trades[0].quantity).toBe(3);
      expect(result.remainingQuantity).toBe(2);
      expect(result.ordersToRemove).toEqual([
        mockOrderBookBuyDataExcessOrder.id,
      ]);
      expect(result.ordersToUpdate).toEqual([]);
    });

    it('should handle buy matches with no remaining quantity', async () => {
      const initiatorId = 'initiator-id';
      const orderInfo = mockOrderBookBuyDataExcessOrder;
      const isSell = false;
      const manager = {} as EntityManager; // Mock EntityManager
      const orderId = 'new-order-id';

      const result = await matchingLogicService.matchOrders({
        initiatorId,
        orderInfo,
        oppositeOrders: [
          mockOrderBookSellData,
          mockOrderBookSellDataV2,
          mockOrderBookSellDataV2,
        ],
        isSell,
        manager,
        orderId,
      });

      expect(result.trades.length).toBe(2);
      expect(result.trades[0].quantity).toBe(3);
      expect(result.trades[1].quantity).toBe(2);
      expect(result.remainingQuantity).toBe(0);
      expect(result.ordersToRemove).toEqual([
        mockOrderBookSellData.id,
        mockOrderBookSellDataV2.id,
      ]);
      expect(result.ordersToUpdate).toEqual([]);
    });
  });

  describe('recordOrderHistory', () => {
    it('should call orderHistoryService.recordOrderHistory', async () => {
      const trade = mockCreateSellOrderRequest;
      const result = await matchingLogicService.recordOrderHistory(
        userOutput.id,
        trade,
        'order-id',
        10,
      );
      expect(result).toBeUndefined();
    });
  });
});
