import { WalletEntity } from '../entities/wallet.entity';
import { UserProfileReqDto } from '../../users/dto';
import { UpdateFundsReqDto } from '../dto';

export interface IWalletController {
  updateFunds(
    user: UserProfileReqDto,
    body: UpdateFundsReqDto,
  ): Promise<WalletEntity | null>;
}
