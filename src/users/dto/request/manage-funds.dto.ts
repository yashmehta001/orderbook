import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ManageFundsReqDto {
  @IsNumber()
  @ApiProperty({
    example: 100,
    required: true,
  })
  funds: number;
}
