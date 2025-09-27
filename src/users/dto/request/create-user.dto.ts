import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotBlank } from '../../../utils/decorators';

export class UserCreateReqDto {
  @IsNotBlank()
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @MaxLength(255, { message: 'First name cannot exceed 255 characters' })
  @ApiProperty({
    example: 'john',
    maxLength: 255,
    required: false,
  })
  firstName: string;

  @IsNotBlank()
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(255, { message: 'Last name cannot exceed 255 characters' })
  @ApiProperty({
    example: 'doe',
    maxLength: 255,
    required: false,
  })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  @ApiProperty({
    example: 'john@doe.com',
    required: true,
  })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  @ApiProperty({
    example: '123456',
    required: false,
  })
  password: string;
}
