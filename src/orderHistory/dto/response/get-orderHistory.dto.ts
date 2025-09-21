import { ApiProperty } from '@nestjs/swagger';
import { OrderSideEnum } from '../../../core/config';
import { Expose, Type } from 'class-transformer';

export class OrderHistoryItemDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  stockName: string;

  @ApiProperty({ enum: OrderSideEnum })
  @Expose()
  side: OrderSideEnum;

  @ApiProperty()
  @Expose()
  price: number;

  @ApiProperty()
  @Expose()
  quantity: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}

export class OrderHistoryTransactionResDto {
  @ApiProperty()
  @Expose()
  transactionId: string;

  @ApiProperty({ type: [OrderHistoryItemDto] })
  @Expose()
  @Type(() => OrderHistoryItemDto)
  orders: OrderHistoryItemDto[];
}
