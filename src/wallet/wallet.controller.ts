import { Body, Controller, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { errorMessages, successMessages } from '../core/config/messages';
import { UserProfileReqDto } from '../users/dto';
import { AuthUser } from '../utils/decorators';
import { Serialize } from '../utils/loaders/SerializeDto';
import { UpdateFundsReqDto, UpdateFundsResDto } from './dto';
import { WalletEntity } from './entities/wallet.entity';
import { WalletService } from './services/wallet.service';

@ApiTags('Wallets')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @Serialize(UpdateFundsResDto, successMessages.FUND_UPDATED)
  @ApiResponse({
    description: 'for more information please check ManageFundsReqDto schema',
  })
  @ApiOkResponse({
    description: 'Funds are updated successfully',
    type: UpdateFundsResDto,
  })
  @ApiBadRequestResponse({
    description: errorMessages.INSUFFICIENT_BALANCE,
  })
  @ApiNotFoundResponse({
    description: errorMessages.USER_NOT_FOUND,
  })
  @ApiBearerAuth()
  @Put('/update-funds')
  async updateFunds(
    @AuthUser() user: UserProfileReqDto,
    @Body() body: UpdateFundsReqDto,
  ): Promise<WalletEntity | null> {
    return this.walletService.updateUserFunds(user.id, body.funds);
  }
}
