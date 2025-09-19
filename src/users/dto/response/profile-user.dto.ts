import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class UserProfileResDto {
  @Expose()
  @ApiProperty({
    example: '109156be-c4fb-41ea-b1b4-efe1671c5836',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: 'John Doe',
  })
  @Transform(({ obj }) => `${obj.firstName} ${obj.lastName}`)
  fullName: string;

  @Expose()
  @ApiProperty({
    example: 'john@doe.com',
  })
  email: string;
}
