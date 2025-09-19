import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AppSeeder } from './app.seeder';
import { AuthType } from 'src/utils/token/types';
import { Auth } from 'src/utils/authentication/decorator';

@Controller('seed')
export class SeedsController {
  constructor(private readonly appSeeder: AppSeeder) {}

  @Post()
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  async seed() {
    await this.appSeeder.seed();
    return {
      success: true,
      message: 'Seeding completed successfully',
    };
  }
}