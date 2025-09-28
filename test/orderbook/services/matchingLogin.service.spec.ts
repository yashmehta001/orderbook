import { Test, TestingModule } from '@nestjs/testing';
import { MatchingLogicService } from '../../../src/orderbook/services/matchingLogic.service';
import { IOrderHistoryService } from '../../../src/orderHistory/interfaces';
import { OrderHistoryService } from '../../../src/orderHistory/services/orderHistory.service';
import { LoggerService } from '../../../src/utils/logger/WinstonLogger';
import { mockOrderHistoryService } from '../../orderHistory/mocks';
import { mockCreateSellOrderRequest } from '../constants';
import { userOutput } from '../../users/constants';

describe('MatchingLogicService', () => {
  let matchingLogicService: MatchingLogicService;
  let orderHistoryService: jest.Mocked<IOrderHistoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingLogicService,
        LoggerService,
        {
          provide: 'IOrderHistoryService',
          useFactory: mockOrderHistoryService,
        },
      ],
    }).compile();

    matchingLogicService =
      module.get<MatchingLogicService>(MatchingLogicService);
    orderHistoryService = module.get<IOrderHistoryService>(
      'IOrderHistoryService',
    ) as jest.Mocked<OrderHistoryService>;
  });

  it('MatchingLogicService should be defined', () => {
    expect(matchingLogicService).toBeDefined();
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
