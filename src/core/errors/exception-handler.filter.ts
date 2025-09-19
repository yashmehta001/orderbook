import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class ExceptionHandlerFilter<T extends HttpException>
  implements ExceptionFilter
{
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const error: any =
      typeof response === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as object);

    const err = error && error.message ? error.message[0] : error;
    response.status(status).json({
      Error: true,
      message: [err],
      data: {},
    });
  }
}
