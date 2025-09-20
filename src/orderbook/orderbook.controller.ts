import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderbookService } from './services/orderbook.service';
import { Serialize } from 'src/utils/loaders/SerializeDto';
import { AuthUser } from 'src/utils/decorators';
import { UserProfileReqDto } from 'src/users/dto';
import { CreateOrderBookReqDto, CreateOrderBookResDto } from './dto';

@ApiTags('Orderbook')
@Controller('orderbook')
export class OrderbookController {
  constructor(private readonly orderBookService: OrderbookService) {}

  @Serialize(CreateOrderBookResDto, 'Order created successfully')
  @ApiBearerAuth()
  @ApiResponse({
    description:
      'for more information please check CreateOrderBookResDto schema',
  })
  @ApiOkResponse({
    description: 'Orders created successfully',
    type: CreateOrderBookResDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @Post('/create-order')
  async updateFunds(
    @AuthUser() user: UserProfileReqDto,
    @Body() body: CreateOrderBookReqDto,
  ) {
    return this.orderBookService.createOrder(user.id, body);
  }
}
