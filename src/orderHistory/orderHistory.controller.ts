import { Controller, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderHistoryService } from './services/orderHistory.service';
import { Serialize } from '../utils/loaders/SerializeDto';
import { AuthUser } from '../utils/decorators';
import { UserProfileReqDto } from '../users/dto';
import { OrderHistoryTransactionResDto } from './dto';

@ApiTags('Order History')
@Controller('order-history')
export class OrderHistoryController {
  constructor(private readonly orderHistoryService: OrderHistoryService) {}

  @Serialize(OrderHistoryTransactionResDto)
  @ApiResponse({
    description:
      'for more information please check OrderHistoryTransactionResDto schema',
  })
  @ApiOkResponse({
    description:
      'When user profile is successfully retrieved then this response will receive',
    type: OrderHistoryTransactionResDto,
  })
  @ApiBadRequestResponse({
    description: 'when history is not found',
  })
  @ApiBearerAuth()
  @Get('/history')
  async history(@AuthUser() user: UserProfileReqDto) {
    return this.orderHistoryService.getOrderHistoryByUserId(user.id);
  }
}
