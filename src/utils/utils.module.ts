import { Module } from '@nestjs/common';
import { HashModule } from './hash/hash.module';
import { TokenService, JwtService } from './token/services';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import {
  AuthenticationGuard,
  UserAccessTokenGuard,
} from './authentication/guards';
import { LoggerModule } from './logger/logger.module';
import { HashService } from './hash/hash.service';
import { BcryptService } from './hash/bcrypt/bcrypt.service';

@Module({
  imports: [HashModule, JwtModule, LoggerModule],
  providers: [
    {
      provide: TokenService,
      useClass: JwtService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: HashService,
      useClass: BcryptService,
    },
    UserAccessTokenGuard,
  ],
  exports: [],
})
export class UtilsModule {}
