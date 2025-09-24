import { IsEnum, IsPositive, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotBlank } from '../../../utils/decorators';
import { OrderSideEnum } from '../../../core/config';

export class CreateOrderBookReqDto {
  @IsNotBlank()
  @MaxLength(255)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @ApiProperty({
    example: 'apple',
    maxLength: 255,
  })
  stockName: string;

  @IsEnum(OrderSideEnum)
  @ApiProperty({
    example: OrderSideEnum.BUY,
    enum: OrderSideEnum,
  })
  side: OrderSideEnum;

  @Transform(({ value }) => Number(value))
  @Min(1)
  @ApiProperty({
    example: '100',
    description: 'Quantity as a numeric string',
    minimum: 1,
    type: String,
  })
  quantity: number;

  @Transform(({ value }) => Number(value))
  @IsPositive({ message: 'Price must be positive' })
  @ApiProperty({
    example: '150.5',
    description: 'Price as a numeric string',
    minimum: 0.01,
    type: String,
  })
  price: number;
}
