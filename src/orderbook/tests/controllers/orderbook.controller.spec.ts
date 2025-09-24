import { Test, TestingModule } from '@nestjs/testing';
import { OrderbookController } from '../../orderbook.controller';
import { OrderbookService } from '../../services/orderbook.service';
import { mockOrderBookService } from '../mocks';
import {
  mockCreateSellOrderResponse,
  mockCreateSellOrderRequest,
  mockCreateBuyOrderResponse,
  mockCreateBuyOrderRequest,
  query,
  mockOrderBookData,
  mockOrderBook,
} from '../constants';
import { userProfileInput } from '../../../users/tests/constants';

describe('Orderbook Controller', () => {
  let orderbookService: jest.Mocked<OrderbookService>;
  let orderbookController: OrderbookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderbookController,
        {
          provide: OrderbookService,
          useFactory: mockOrderBookService,
        },
      ],
    }).compile();
    orderbookService = module.get<OrderbookService>(
      OrderbookService,
    ) as jest.Mocked<OrderbookService>;
    orderbookController = module.get<OrderbookController>(OrderbookController);
  });

  it('OrderbookController should be defined', () => {
    expect(OrderbookController).toBeDefined();
  });

  describe('sellOrder', () => {
    it('should call service.sellOrder with userId and body', async () => {
      orderbookService.sellOrder.mockResolvedValue(mockCreateSellOrderResponse);

      const result = await orderbookController.sellOrder(
        userProfileInput,
        mockCreateSellOrderRequest,
      );

      expect(result).toEqual(mockCreateSellOrderResponse);
    });
  });

  describe('buyOrder', () => {
    it('should call service.buyOrder with userId and body', async () => {
      orderbookService.buyOrder.mockResolvedValue(mockCreateBuyOrderResponse);

      const result = await orderbookController.buyOrder(
        userProfileInput,
        mockCreateBuyOrderRequest,
      );

      expect(result).toEqual(mockCreateBuyOrderResponse);
    });
  });

  describe('getUserOrderBooks', () => {
    it('should call service.getOrdersByUserId with userId, side, stockName', async () => {
      orderbookService.getOrdersByUserId.mockResolvedValue([mockOrderBookData]);

      const result = await orderbookController.getUserOrderBooks(
        userProfileInput,
        query,
      );

      expect(result).toEqual([mockOrderBookData]);
    });
  });
  describe('deleteOrderFromOrderBooks', () => {
    it('should call service.deleteOrder with userId and orderId', async () => {
      const orderId = 'order-4';
      orderbookService.deleteOrder.mockResolvedValue();

      const result = await orderbookController.deleteOrderFromOrderBooks(
        userProfileInput,
        orderId,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(orderbookService.deleteOrder).toHaveBeenCalledWith(
        userProfileInput.id,
        orderId,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('getOrderBooks', () => {
    it('should call service.getOrderBooks with userId, stockName, side', async () => {
      orderbookService.getOrderBooks.mockResolvedValue(mockOrderBook);

      const result = await orderbookController.getOrderBooks(
        userProfileInput,
        query,
      );

      expect(result).toEqual(mockOrderBook);
    });
  });
});
