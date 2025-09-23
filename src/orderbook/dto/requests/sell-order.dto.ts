import { Equals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderSideEnum } from '../../../core/config';
import { CreateOrderBookReqDto } from './create-order.dto';

export class CreateSellOrderReqDto extends CreateOrderBookReqDto {
  @Equals(OrderSideEnum.SELL, {
    message: 'Only SELL orders are allowed.',
  })
  @ApiProperty({
    example: OrderSideEnum.SELL,
    enum: [OrderSideEnum.SELL],
  })
  override side: OrderSideEnum = OrderSideEnum.SELL;
}
