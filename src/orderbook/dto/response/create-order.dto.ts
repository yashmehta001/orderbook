import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OrderSideEnum } from '../../../core/config';

export class CreateOrderBookResDto {
  @Expose()
  @ApiProperty({ example: '825a659a-6308-4443-9927-9954a9ab870a' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Google' })
  stockName: string;

  @Expose()
  @ApiProperty({ example: OrderSideEnum.BUY })
  side: OrderSideEnum;

  @Expose()
  @ApiProperty({ example: 150.5 })
  price: number;

  @Expose()
  @ApiProperty({ example: 500 })
  quantity: number;
}
