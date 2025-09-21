import { Expose } from 'class-transformer';
import { CreateOrderBookResDto } from './create-order.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserOrderBookResDto extends CreateOrderBookResDto {
  @ApiProperty()
  @Expose()
  createdAt: Date;
}
