import { HttpException, HttpStatus } from '@nestjs/common';

export class emailExistsException extends HttpException {
  constructor() {
    super(`Email already Exists`, HttpStatus.CONFLICT);
  }
}
