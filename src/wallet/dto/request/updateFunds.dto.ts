import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateFundsReqDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'Funds must be a valid number' })
  @Min(0, { message: 'Funds cannot be negative' })
  @ApiProperty({
    example: 0,
    required: false,
    default: 0,
  })
  funds: number;
}
