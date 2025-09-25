import { Equals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderSideEnum } from '../../../core/config';
import { CreateOrderBookReqDto } from './create-order.dto';

export class CreateBuyOrderReqDto extends CreateOrderBookReqDto {
  @Equals(OrderSideEnum.BUY, {
    message: 'Only BUY orders are allowed.',
  })
  @ApiProperty({
    example: OrderSideEnum.BUY,
    enum: [OrderSideEnum.BUY],
  })
  override side: OrderSideEnum = OrderSideEnum.BUY;
}
