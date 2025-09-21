import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { OrderSideEnum } from '../../../core/config';

class BuyTradeDto {
  @Expose()
  @ApiProperty({ example: '48ede012-aa2c-4942-b4e0-f5cab919dc7a' })
  buyUserId: string;

  @Expose()
  @ApiProperty({ example: '049ce57b-2959-4644-ad99-7c51ea4b661a' })
  sellOrderId: string;

  @Expose()
  @ApiProperty({ example: 'fec396fe-e226-48fd-9b91-6871e3344fde' })
  sellerId: string;

  @Expose()
  @ApiProperty({ example: 'Apple' })
  stockName: string;

  @Expose()
  @ApiProperty({ example: 150.5 })
  price: number;

  @Expose()
  @ApiProperty({ example: 100 })
  quantity: number;
}

class RemainingOrderDto {
  @Expose()
  @ApiProperty({ example: 'f7fa3230-684e-4344-9741-edb84459e802' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Apple' })
  stockName: string;

  @Expose()
  @ApiProperty({ example: OrderSideEnum.BUY, enum: OrderSideEnum })
  side: OrderSideEnum;

  @Expose()
  @ApiProperty({ example: 250.0 })
  price: number;

  @Expose()
  @ApiProperty({ example: 330 })
  quantity: number;
}

export class CreateBuyOrderResDto {
  @Expose()
  @ApiProperty({ example: 620 })
  totalStockBought: number;

  @Expose()
  @ApiProperty({ example: 93210 })
  fundsSpent: number;

  @Expose()
  @Type(() => BuyTradeDto)
  @ApiProperty({ type: [BuyTradeDto] })
  trades: BuyTradeDto[];

  @Expose()
  @Type(() => RemainingOrderDto)
  @ApiProperty({ type: RemainingOrderDto, required: false })
  remainingOrder?: RemainingOrderDto;
}
