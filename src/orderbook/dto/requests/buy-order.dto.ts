import { Equals, IsNumber, IsPositive, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotBlank } from '../../../utils/decorators';
import { OrderSideEnum } from '../../../core/config';
import { CreateOrderBookReqDto } from './create-order.dto';

export class CreateBuyOrderReqDto extends CreateOrderBookReqDto {
  @IsNotBlank()
  @MaxLength(255)
  @ApiProperty({
    example: 'Apple',
    maxLength: 255,
    required: true,
  })
  declare stockName: string;

  @Equals(OrderSideEnum.BUY, {
    message: 'Only BUY orders are allowed.',
  })
  @ApiProperty({
    example: OrderSideEnum.BUY,
    enum: [OrderSideEnum.BUY],
    required: true,
  })
  declare side: OrderSideEnum;
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 100,
    required: true,
    minimum: 1,
  })
  declare quantity: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 150.5,
    required: true,
    minimum: 0.01,
  })
  declare price: number;
}
