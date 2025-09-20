import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
import {
  CreateBuyOrderReqDto,
  CreateBuyOrderResDto,
  CreateOrderBookReqDto,
  CreateOrderBookResDto,
  CreateSellOrderResDto,
  GetOrderBooksReqDto,
  GetOrderBooksResDto,
} from './dto';
import { CreateSellOrderReqDto } from './dto/requests/sell-order.dto';

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
  async createOrder(
    @AuthUser() user: UserProfileReqDto,
    @Body() body: CreateOrderBookReqDto,
  ) {
    return this.orderBookService.createOrder(user.id, body);
  }

  @Serialize(CreateSellOrderResDto, 'Sell Order created successfully')
  @ApiBearerAuth()
  @ApiResponse({
    description:
      'for more information please check CreateSellOrderResDto schema',
  })
  @ApiOkResponse({
    description: 'sell Orders created successfully',
    type: CreateSellOrderResDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
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
  @ApiOkResponse({
    description: 'buy Order created successfully',
    type: CreateBuyOrderResDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @Post('/buy-order')
  async buyOrder(
    @AuthUser() user: UserProfileReqDto,
    @Body() body: CreateBuyOrderReqDto,
  ) {
    return this.orderBookService.buyOrder(user.id, body);
  }

  @Get()
  @ApiBearerAuth()
  @Serialize(GetOrderBooksResDto)
  @ApiResponse({
    description:
      'for more information please check CreateOrderBookResDto schema',
  })
  @ApiOkResponse({
    description: 'Aggregated order book by stock and side',
    type: CreateOrderBookResDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  async getOrderBooks(@Query() query: GetOrderBooksReqDto) {
    return this.orderBookService.getOrderBooks(query.stockName, query.side);
  }
}
