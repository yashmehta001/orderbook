import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderbookService } from './services/orderbook.service';
import { Serialize } from '../utils/loaders/SerializeDto';
import { AuthUser } from '../utils/decorators';
import { UserProfileReqDto } from '../users/dto';
import {
  CreateBuyOrderReqDto,
  CreateBuyOrderResDto,
  CreateOrderBookResDto,
  CreateSellOrderResDto,
  GetOrderBooksReqDto,
  GetOrderBooksResDto,
  GetUserOrderBookResDto,
} from './dto';
import { CreateSellOrderReqDto } from './dto/requests/sell-order.dto';

@ApiTags('Orderbook')
@Controller('orderbook')
export class OrderbookController {
  constructor(private readonly orderBookService: OrderbookService) {}

  @Serialize(CreateSellOrderResDto, 'Sell Order created successfully')
  @ApiBearerAuth()
  @ApiResponse({
    description:
      'for more information please check CreateSellOrderResDto schema',
  })
  @ApiCreatedResponse({
    description: 'Sell Orders created successfully',
    type: CreateSellOrderResDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/sell-order')
  async sellOrder(
    @AuthUser() user: UserProfileReqDto,
    @Body() body: CreateSellOrderReqDto,
  ) {
    return this.orderBookService.sellOrder(user.id, body);
  }

  @Serialize(CreateBuyOrderResDto, 'Buy Order created successfully')
  @ApiBearerAuth()
  @ApiResponse({
    description:
      'for more information please check CreateBuyOrderResDto schema',
  })
  @ApiCreatedResponse({
    description: 'Buy Orders created successfully',
    type: CreateBuyOrderResDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/buy-order')
  async buyOrder(
    @AuthUser() user: UserProfileReqDto,
    @Body() body: CreateBuyOrderReqDto,
  ) {
    return this.orderBookService.buyOrder(user.id, body);
  }

  @ApiBearerAuth()
  @Serialize(GetUserOrderBookResDto)
  @ApiResponse({
    description:
      'for more information please check GetUserOrderBookResDto schema',
  })
  @ApiOkResponse({
    description: 'Get pending user order book. Filter by stock and side',
    type: GetUserOrderBookResDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @Get('/')
  async getUserOrderBooks(
    @AuthUser() user: UserProfileReqDto,
    @Query() query: GetOrderBooksReqDto,
  ) {
    return this.orderBookService.getOrdersByUserId(
      user.id,
      query.side,
      query.stockName,
    );
  }

  @Serialize({}, 'Order deleted successfully')
  @ApiBearerAuth()
  @ApiResponse({
    description:
      'for more information please check GetUserOrderBookResDto schema',
  })
  @ApiNoContentResponse({
    description: 'Pending trade order deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @Delete('/:id')
  async deleteOrderFromOrderBooks(
    @AuthUser() user: UserProfileReqDto,
    @Param('id') orderId: string,
  ) {
    return this.orderBookService.deleteOrder(user.id, orderId);
  }

  @Get('/order-books')
  @ApiBearerAuth()
  @Serialize(GetOrderBooksResDto)
  @ApiResponse({
    description: 'for more information please check GetOrderBooksResDto schema',
  })
  @ApiOkResponse({
    description: 'Aggregated pending order book by stock and side',
    type: CreateOrderBookResDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  async getOrderBooks(
    @AuthUser() user: UserProfileReqDto,
    @Query() query: GetOrderBooksReqDto,
  ) {
    return this.orderBookService.getOrderBooks(
      user.id,
      query.stockName,
      query.side,
    );
  }
}
