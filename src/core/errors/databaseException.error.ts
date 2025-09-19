// db-error.util.ts
import { QueryFailedError } from 'typeorm';
import { CustomError } from './customException.error';
import { HttpStatus } from '@nestjs/common';

export function translateTypeOrmError(error: any) {
  if (error instanceof QueryFailedError) {
    if ((error as any).code === '23505') {
      return new CustomError(`Email already Exists`, HttpStatus.CONFLICT);
    }
  }
  return error;
}
