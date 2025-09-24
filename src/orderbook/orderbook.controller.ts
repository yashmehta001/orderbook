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
import { errorMessages, successMessages } from 'src/core/config';

@ApiTags('Orderbook')
@Controller('orderbook')
export class OrderbookController {
  constructor(private readonly orderBookService: OrderbookService) {}

  @Serialize(CreateSellOrderResDto, successMessages.SELL_ORDER_CREATED)
  @ApiBearerAuth()
  @ApiResponse({
    description:
      'for more information please check CreateSellOrderResDto schema',
  })
  @ApiCreatedResponse({
    description: successMessages.SELL_ORDER_CREATED,
    type: CreateSellOrderResDto,
  })
  @ApiBadRequestResponse({
    description: errorMessages.BAD_REQUEST,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/sell-order')
  async sellOrder(
    @AuthUser() user: UserProfileReqDto,
    @Body() body: CreateSellOrderReqDto,
  ) {
    return this.orderBookService.sellOrder(user.id, body);
  }

  @Serialize(CreateBuyOrderResDto, successMessages.BUY_ORDER_CREATED)
  @ApiBearerAuth()
  @ApiResponse({
    description:
      'for more information please check CreateBuyOrderResDto schema',
  })
  @ApiCreatedResponse({
    description: successMessages.BUY_ORDER_CREATED,
    type: CreateBuyOrderResDto,
  })
  @ApiBadRequestResponse({
    description: errorMessages.BAD_REQUEST,
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
    description:
      "Returns a list of pending trades from the user's order book. Supports optional filtering by stock symbol and order side (buy/sell).",
    type: GetUserOrderBookResDto,
  })
  @ApiBadRequestResponse({
    description: errorMessages.BAD_REQUEST,
  })
  @Get('/pending-orders')
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

  @Serialize({}, successMessages.ORDER_CANCELLED)
  @ApiBearerAuth()
  @ApiResponse({
    description:
      'for more information please check GetUserOrderBookResDto schema',
  })
  @ApiNoContentResponse({
    description: 'Successfully deleted the pending trade order.',
  })
  @ApiBadRequestResponse({
    description: errorMessages.BAD_REQUEST,
  })
  @Delete('/pending-orders/:id')
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
    description:
      'Get the aggregated current order book, grouped by stock and side.',
    type: CreateOrderBookResDto,
  })
  @ApiBadRequestResponse({
    description: errorMessages.BAD_REQUEST,
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
