import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UpdateFundsResDto {
  @Expose()
  @ApiProperty({
    example: 1000,
  })
  funds: number;
}
