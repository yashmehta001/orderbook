import { IsEnum, IsNumber, IsPositive, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotBlank } from '../../../utils/decorators';
import { OrderSideEnum } from '../../../core/config';

export class CreateOrderBookDto {
  @IsNotBlank()
  @MaxLength(255)
  @ApiProperty({
    example: 'Apple',
    maxLength: 255,
    required: true,
  })
  stockName: string;

  @IsEnum(OrderSideEnum)
  @ApiProperty({
    example: OrderSideEnum.BUY,
    enum: OrderSideEnum,
    required: true,
  })
  side: OrderSideEnum;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 100,
    required: true,
    minimum: 1,
  })
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 150.5,
    required: true,
    minimum: 0.01,
  })
  price: number;
}
