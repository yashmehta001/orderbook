import { HttpException, HttpStatus } from '@nestjs/common';

export class authFailedException extends HttpException {
  constructor() {
    super(`Incorrect Email or Password`, HttpStatus.UNAUTHORIZED);
  }
}
