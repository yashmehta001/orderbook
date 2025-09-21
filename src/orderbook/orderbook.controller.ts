import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
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
    description: 'sell Orders created successfully',
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
    description: 'buy Order created successfully',
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

  @Get('/')
  @ApiBearerAuth()
  @Serialize(GetUserOrderBookResDto)
  @ApiResponse({
    description:
      'for more information please check GetUserOrderBookResDto schema',
  })
  @ApiOkResponse({
    description: 'User order book by stock and side',
    type: GetUserOrderBookResDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  async getUserOrderBooks(
    @AuthUser() user: UserProfileReqDto,
    @Query() query: GetOrderBooksReqDto,
  ) {
    return this.orderBookService.getOrdersByUserId(
      user.id,
      query.stockName,
      query.side,
    );
  }

  @Get('/order-books')
  @ApiBearerAuth()
  @Serialize(GetOrderBooksResDto)
  @ApiResponse({
    description: 'for more information please check GetOrderBooksResDto schema',
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
