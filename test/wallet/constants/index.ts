import { WalletEntity } from '../../../src/wallet/entities/wallet.entity';
import { UpdateFundsResDto } from '../../../src/wallet/dto';
import { userOutput } from '../../users/constants';
import { AuditInfo } from '../../../src/core/entity';

export const updateWalletInput: UpdateFundsResDto = {
  funds: 1000,
};

export const updateWalletOutput: UpdateFundsResDto = {
  funds: 1000,
};

export const updateWalletServiceOutput: WalletEntity = {
  id: userOutput.id,
  funds: 1000,
  user: userOutput,
  auditInfo: new AuditInfo(),
};
