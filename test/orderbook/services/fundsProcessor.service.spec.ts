import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../src/utils/logger/WinstonLogger';
import { FundsProcessorService } from '../../../src/orderbook/services/fundsProcessor.service';
import { WalletService } from '../../../src/wallet/services/wallet.service';
import { OrderbookService } from '../../../src/orderbook/services/orderbook.service';
import { mockOrderBookService } from '../mocks';
import { mockWalletsRepository } from '../../wallet/mocks/wallet.repository.mock';
import { EntityManager } from 'typeorm';
import { updateWalletServiceOutput } from '../../wallet/constants';
import { ITrade } from '../../../src/orderbook/dto';

describe('FundsProcessorService', () => {
  let fundsProcessorService: FundsProcessorService;
  let walletService: jest.Mocked<WalletService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FundsProcessorService,
        LoggerService,
        WalletService,
        {
          provide: 'IWalletsRepository',
          useValue: mockWalletsRepository,
        },
        {
          provide: OrderbookService,
          useValue: mockOrderBookService,
        },
      ],
    }).compile();

    fundsProcessorService = module.get<FundsProcessorService>(
      FundsProcessorService,
    );
    walletService = module.get<WalletService>(
      WalletService,
    ) as jest.Mocked<WalletService>;
  });

  it('FundsProcessorService should be defined', () => {
    expect(fundsProcessorService).toBeDefined();
  });
  describe('processFundsForSell', () => {
    it('should process funds for sell orders', async () => {
      const sellerId = 'seller-id';
      const trades = [
        { buyerId: 'buyer1', quantity: 2, price: 50 },
        { buyerId: 'buyer2', quantity: 3, price: 50 },
      ];
      const price = 50;
      const manager = {} as EntityManager;
      walletService.updateUserFunds = jest
        .fn()
        .mockResolvedValue(updateWalletServiceOutput);
      const result = await fundsProcessorService.processFundsForSell(
        sellerId,
        trades as ITrade[],
        price,
        manager,
      );

      expect(result).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(walletService.updateUserFunds).toHaveBeenCalledTimes(3);
    });
  });
  describe('processFundsForBuy', () => {
    it('should process funds for buy orders', async () => {
      const buyerId = 'buyer-id';
      const trades = [
        { sellerId: 'seller1', quantity: 2, price: 50 },
        { sellerId: 'seller2', quantity: 3, price: 50 },
      ];
      const manager = {} as EntityManager;
      walletService.updateUserFunds = jest
        .fn()
        .mockResolvedValue(updateWalletServiceOutput);
      const result = await fundsProcessorService.processFundsForBuy(
        buyerId,
        trades as ITrade[],
        manager,
      );

      expect(result).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(walletService.updateUserFunds).toHaveBeenCalledTimes(3);
    });
  });
});
