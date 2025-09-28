import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../../../src/wallet/services/wallet.service';
import { WalletController } from '../../../src/wallet/wallet.controller';
import { mockWalletService } from '../mocks/wallet.service.mock';
import { updateWalletInput, updateWalletServiceOutput } from '../constants';
import { userProfileInput } from '../../users/constants';

describe('Wallet Controller', () => {
  let walletService: jest.Mocked<WalletService>;
  let walletController: WalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletController,
        {
          provide: WalletService,
          useFactory: mockWalletService,
        },
      ],
    }).compile();
    walletService = module.get<WalletService>(
      WalletService,
    ) as jest.Mocked<WalletService>;
    walletController = module.get<WalletController>(WalletController);
  });
  it('WalletController should be defined', () => {
    expect(walletController).toBeDefined();
  });

  describe('Wallet Create', () => {
    it('Valid Wallet details should return valid response', async () => {
      walletService.updateUserFunds.mockResolvedValue(
        updateWalletServiceOutput,
      );
      const wallet = await walletController.updateFunds(
        userProfileInput,
        updateWalletInput,
      );
      expect(wallet).toEqual(updateWalletServiceOutput);
    });
  });
});
