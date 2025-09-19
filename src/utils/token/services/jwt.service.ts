import { Injectable } from '@nestjs/common/decorators';
import {
  JwtService as JwtNestService,
  JwtSignOptions,
  JwtVerifyOptions,
} from '@nestjs/jwt';
import { userType } from '../types/user.types';
import { ConfigService } from '@nestjs/config';

export interface IJwtService {
  token(data: userType): Promise<string>;
  decode(token: string): Promise<any>;
}

@Injectable()
export class JwtService implements IJwtService {
  private readonly secret: string;
  private readonly expiresIn: string | number;
  constructor(
    private readonly tokenService: JwtNestService,
    private readonly configService: ConfigService,
  ) {
    this.secret = this.configService.get<string>(
      'JWT_SECRET',
      'default_secret',
    );
    this.expiresIn = this.configService.get<string | number>(
      'JWT_ACCESS_TOKEN_TTL',
      900,
    );
  }

  async token(data: userType): Promise<string> {
    const options: JwtSignOptions = {
      secret: this.secret,
      expiresIn: this.expiresIn,
    };
    return this.tokenService.signAsync(data, options);
  }

  async decode<T extends object = any>(token: string): Promise<T> {
    const options: JwtVerifyOptions = {
      secret: this.secret,
    };
    return this.tokenService.verifyAsync<T>(token, options);
  }
}
