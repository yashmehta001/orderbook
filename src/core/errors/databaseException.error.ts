import { QueryFailedError } from 'typeorm';
import { CustomError } from './customException.error';
import { HttpStatus } from '@nestjs/common';

interface TypeOrmError extends Error {
  code?: string;
}

export function translateTypeOrmError(error: TypeOrmError): Error {
  if (error instanceof QueryFailedError) {
    if ((error as TypeOrmError)?.code === '23505') {
      return new CustomError(`Email already Exists`, HttpStatus.CONFLICT);
    }
  }
  return error;
}
