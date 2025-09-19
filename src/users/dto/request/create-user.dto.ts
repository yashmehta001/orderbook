import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotBlank } from '../../../utils/decorators';

export class UserCreateReqDto {
  @IsNotBlank()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    example: 'john',
    maxLength: 255,
    required: false,
  })
  firstName: string;

  @IsNotBlank()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    example: 'doe',
    maxLength: 255,
    required: false,
  })
  lastName: string;

  @IsEmail()
  @MaxLength(255)
  @ApiProperty({
    example: 'john@doe.com',
    required: true,
  })
  email: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty({
    example: '123456',
    required: false,
  })
  password: string;
}
