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
    type ErrorResponse = { message?: string | string[] };
    const error: ErrorResponse =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as ErrorResponse);

    const err =
      error &&
      typeof error === 'object' &&
      error.message &&
      Array.isArray(error.message)
        ? error.message[0]
        : (error.message ?? error);
    response.status(status).json({
      Error: true,
      message: [err],
      data: {},
    });
  }
}
