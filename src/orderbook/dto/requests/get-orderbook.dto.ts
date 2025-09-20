// src/orderbook/dto/requests/get-orderbooks.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderSideEnum } from '../../../core/config';

export class GetOrderBooksReqDto {
  @ApiPropertyOptional({
    example: 'Google',
    description: 'Filter by stock name',
  })
  @IsOptional()
  @IsString()
  stockName?: string;

  @ApiPropertyOptional({
    example: OrderSideEnum.BUY,
    enum: OrderSideEnum,
    description: 'Filter by order side (BUY/SELL)',
  })
  @IsOptional()
  @IsEnum(OrderSideEnum)
  side?: OrderSideEnum;
}
