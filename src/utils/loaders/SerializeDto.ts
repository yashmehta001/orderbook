import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export function Serialize(
  responseDto: any = undefined,
  message: number | string = '',
) {
  return UseInterceptors(new SerializeDtoInterceptor(responseDto, message));
}

@Injectable()
export class SerializeDtoInterceptor implements NestInterceptor {
  constructor(
    private responseDto: any,
    private message: string | number,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return {
          Error: false,
          message: this.message ? [this.message] : null,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          data: this.responseDto ? dtoToResponse(this.responseDto, data) : {},
        };
      }),
    );
  }
}

export const dtoToResponse = (
  responseDto: ClassConstructor<unknown>,
  data: unknown[],
) => {
  return plainToInstance(responseDto, data, {
    excludeExtraneousValues: true,
  });
};
