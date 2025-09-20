// src/orderbook/dto/responses/get-orderbooks.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class OrderBookLevelDto {
  @Expose()
  @ApiProperty({ example: 'Google' })
  stockName: string;

  @Expose()
  @ApiProperty({ example: 150.5 })
  price: number;

  @Expose()
  @ApiProperty({ example: 500 })
  quantity: number;
}

export class OrderBookGroupDto {
  @Expose()
  @Type(() => OrderBookLevelDto)
  @ApiProperty({ type: [OrderBookLevelDto] })
  orders: OrderBookLevelDto[];
}

export class GetOrderBooksResDto {
  @Expose()
  @Type(() => OrderBookLevelDto)
  @ApiProperty({
    type: [OrderBookLevelDto],
    description: 'All buy-side orders',
  })
  BUY: OrderBookLevelDto[];

  @Expose()
  @Type(() => OrderBookLevelDto)
  @ApiProperty({
    type: [OrderBookLevelDto],
    description: 'All sell-side orders',
  })
  SELL: OrderBookLevelDto[];
}
