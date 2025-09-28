import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../../../src/utils/logger/WinstonLogger';
import { WalletService } from '../../../src/wallet/services/wallet.service';
import { mockWalletsRepository } from '../mocks/wallet.repository.mock';
import { IWalletsRepository } from '../../../src/wallet/interfaces/wallets.repository.interface';
import { OrderbookService } from '../../../src/orderbook/services/orderbook.service';
import { mockOrderBookService } from '../../orderbook/mocks';
import {
  updateWalletServiceInsufficientFundsOutput,
  updateWalletServiceOutput,
} from '../constants';
import { userOutput } from '../../users/constants';
import {
  mockOrderBookBuyDataExcessOrder,
  mockOrderBookBuyDataRemainingOrder,
} from '../../orderbook/constants';

describe('WalletService', () => {
  let walletService: WalletService;
  let walletRepository: jest.Mocked<IWalletsRepository>;
  let orderbookService: jest.Mocked<OrderbookService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        LoggerService,
        {
          provide: 'IWalletsRepository',
          useFactory: mockWalletsRepository,
        },
        {
          provide: OrderbookService,
          useFactory: mockOrderBookService,
        },
      ],
    }).compile();
    walletService = module.get<WalletService>(WalletService);
    walletRepository = module.get<IWalletsRepository>(
      'IWalletsRepository',
    ) as jest.Mocked<IWalletsRepository>;

    orderbookService = module.get<OrderbookService>(
      OrderbookService,
    ) as jest.Mocked<OrderbookService>;
    walletService = module.get<WalletService>(
      WalletService,
    ) as jest.Mocked<WalletService>;
  });

  it('WalletService should be defined', () => {
    expect(walletService).toBeDefined();
  });

  describe('getUserFunds', () => {
    it('should return user funds if wallet exists', async () => {
      walletRepository.findOneById.mockResolvedValue(updateWalletServiceOutput);

      const result = await walletService.getUserFunds(userOutput.id);
      expect(result).toEqual(updateWalletServiceOutput);
    });
    it('should return null if wallet does not exist', async () => {
      walletRepository.findOneById.mockResolvedValue(null);

      const result = await walletService.getUserFunds(userOutput.id);
      expect(result).toBeNull();
    });
    it('should throw an error if repository throws an error', async () => {
      walletRepository.findOneById.mockRejectedValue(new Error('DB Error'));

      await expect(walletService.getUserFunds(userOutput.id)).rejects.toThrow(
        'DB Error',
      );
    });
  });
  describe('updateUserFunds', () => {
    it('should update user funds if wallet exists', async () => {
      const previousFunds = updateWalletServiceOutput.funds;
      walletRepository.findOneById.mockResolvedValue(updateWalletServiceOutput);
      walletRepository.saveEntity.mockResolvedValue({
        ...updateWalletServiceOutput,
        funds: updateWalletServiceOutput.funds + 100,
      });

      const result = await walletService.updateUserFunds(userOutput.id, 100);
      expect(result.funds).toEqual(previousFunds + 100);
    });

    it('should create a new wallet if one does not exist', async () => {
      walletRepository.findOneById.mockResolvedValue(null);
      walletRepository.save.mockResolvedValue(updateWalletServiceOutput);

      const result = await walletService.updateUserFunds(userOutput.id, 100);
      expect(result).toEqual(updateWalletServiceOutput);
    });

    it('should throw an error if updating funds results in negative balance', async () => {
      walletRepository.findOneById.mockResolvedValue(
        updateWalletServiceInsufficientFundsOutput,
      );

      await expect(
        walletService.updateUserFunds(userOutput.id, -1500),
      ).rejects.toThrow('Insufficient Balance');
    });

    it('should throw an error if repository throws an error', async () => {
      walletRepository.findOneById.mockRejectedValue(new Error('DB Error'));

      await expect(
        walletService.updateUserFunds(userOutput.id, 100),
      ).rejects.toThrow('DB Error');
    });
  });

  describe('validateBalance', () => {
    it('should return true if user has sufficient balance', async () => {
      walletRepository.findOneById.mockResolvedValue(updateWalletServiceOutput);
      orderbookService.getOrdersByUserId.mockResolvedValue([
        mockOrderBookBuyDataRemainingOrder,
      ]);

      const result = await walletService.validateBalance(userOutput.id, 5);
      expect(result).toBe(true);
    });
    it('should return true if user has no records and sufficient balance', async () => {
      walletService.getUserFunds = jest
        .fn()
        .mockResolvedValue(updateWalletServiceOutput);
      orderbookService.getOrdersByUserId.mockResolvedValue([]);

      const result = await walletService.validateBalance(userOutput.id, 5);
      expect(result).toBe(true);
    });

    it('should return false if user has insufficient balance', async () => {
      walletRepository.findOneById.mockResolvedValue(
        updateWalletServiceInsufficientFundsOutput,
      );
      orderbookService.getOrdersByUserId.mockResolvedValue([
        mockOrderBookBuyDataExcessOrder,
      ]);

      const result = await walletService.validateBalance(userOutput.id, 300);
      expect(result).toBe(false);
    });

    it('should throw an error if user wallet does not exist', async () => {
      walletService.getUserFunds = jest.fn().mockResolvedValue(null);
      orderbookService.getOrdersByUserId.mockResolvedValue([
        mockOrderBookBuyDataRemainingOrder,
      ]);

      await expect(
        walletService.validateBalance(userOutput.id, 500),
      ).rejects.toThrow('Record Not Found');
    });

    it('should throw an error if any service throws an error', async () => {
      walletService.getUserFunds = jest
        .fn()
        .mockRejectedValue(new Error('Service Error'));
      orderbookService.getOrdersByUserId.mockResolvedValue([
        mockOrderBookBuyDataRemainingOrder,
      ]);

      await expect(
        walletService.validateBalance(userOutput.id, 500),
      ).rejects.toThrow('Service Error');
    });
    it('should throw an error if any service throws an error in getLockedFundsForPendingBuys', async () => {
      walletService.getUserFunds = jest
        .fn()
        .mockResolvedValue(updateWalletServiceOutput);
      orderbookService.getOrdersByUserId.mockRejectedValue(
        new Error('Service Error'),
      );

      await expect(
        walletService.validateBalance(userOutput.id, 500),
      ).rejects.toThrow('Service Error');
    });
  });
});
