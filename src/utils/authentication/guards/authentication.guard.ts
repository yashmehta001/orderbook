import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthType } from '../../token/types';

import { UnauthorizedException } from '../errors';
import { UserAccessTokenGuard } from './userToken.guard';
import { AUTH_TYPE_KEY } from '../decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.UserBearer;

  private authTypeGuardMap: Record<AuthType, CanActivate | CanActivate[]>;

  constructor(
    private readonly reflector: Reflector,
    private readonly userAccessTokenGuard: UserAccessTokenGuard,
  ) {
    // build after DI
    this.authTypeGuardMap = {
      [AuthType.UserBearer]: this.userAccessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    const guards = authTypes
      .map((type) => this.authTypeGuardMap[type])
      .flat()
      .filter(Boolean);

    let lastError: any = new UnauthorizedException();

    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate(context);
        if (canActivate) {
          return true;
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError;
  }
}
