import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResDto {
  @Expose()
  @ApiProperty({
    example: '109156be-c4fb-41ea-b1b4-efe1671c5836',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'John',
  })
  firstName: string;

  @Expose()
  @ApiProperty({
    example: 'Doe',
  })
  lastName: string;

  @Expose()
  @ApiProperty({
    example: 'john@doe.com',
  })
  email: string;
}
