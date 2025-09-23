import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { OrderSideEnum } from '../../../core/config';

export class TradeDto {
  @Expose()
  @ApiProperty({ example: 'c212e0e8-aa57-46e8-86ea-782bc224e0fe' })
  buyOrderId: string;

  @Expose()
  @ApiProperty({ example: '48ede012-aa2c-4942-b4e0-f5cab919dc7a' })
  sellUserId: string;

  @Expose()
  @ApiProperty({ example: 'apple' })
  stockName: string;

  @Expose()
  @ApiProperty({ example: 150.5 })
  price: number;

  @Expose()
  @ApiProperty({ example: 280 })
  quantity: number;
}

export class RemainingOrderDto {
  @Expose()
  @ApiProperty({ example: '992cea60-2ccb-45eb-b148-7d936b28d05f' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'apple' })
  stockName: string;

  @Expose()
  @ApiProperty({ example: OrderSideEnum.SELL, enum: OrderSideEnum })
  side: OrderSideEnum;

  @Expose()
  @ApiProperty({ example: 150.0 })
  price: number;

  @Expose()
  @ApiProperty({ example: 1620 })
  quantity: number;
}

export class CreateSellOrderResDto {
  @Expose()
  @ApiProperty({ example: 280 })
  totalStockSold: number;

  @Expose()
  @ApiProperty({ example: 42140 })
  fundsAdded: number;

  @Expose()
  @Type(() => TradeDto)
  @ApiProperty({ type: [TradeDto] })
  trades: TradeDto[];

  @Expose()
  @Type(() => RemainingOrderDto)
  @ApiProperty({ type: RemainingOrderDto, required: false })
  remainingOrder?: RemainingOrderDto;
}
