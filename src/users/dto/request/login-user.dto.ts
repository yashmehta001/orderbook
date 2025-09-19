import { IsEmail, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotBlank } from '../../../utils/decorators';

export class UserLoginReqDto {
  @IsEmail()
  @MaxLength(255)
  @IsNotBlank()
  @ApiProperty({
    example: 'john@doe.com',
    required: true,
  })
  email: string;

  @IsString()
  @MaxLength(100)
  @IsNotBlank()
  @ApiProperty({
    example: '123456',
    required: false,
  })
  password: string;
}
