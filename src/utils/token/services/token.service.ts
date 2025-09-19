import { Injectable } from '@nestjs/common/decorators';
import { userType } from '../types';

@Injectable()
export abstract class TokenService {
  abstract token(data: userType): Promise<string>;

  abstract decode<T>(token: string): Promise<T>;
}
