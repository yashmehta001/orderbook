// src/config/env.validation.ts
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  validateSync,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
  Test = 'test',
}

export class EnvConfig {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  PORT!: number;

  // Database
  @IsString()
  DATABASE_HOST!: string;

  @Type(() => Number)
  @IsInt()
  DATABASE_PORT!: number;

  @IsString()
  DATABASE_USER!: string;

  @IsString()
  DATABASE_PASSWORD!: string;

  @IsString()
  DATABASE_NAME!: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    return value === 'true' || value === '1';
  })
  @IsBoolean()
  DATABASE_LOGGING?: boolean;

  @IsString()
  JWT_SECRET!: string;

  @Type(() => Number)
  @IsInt()
  JWT_ACCESS_TOKEN_TTL!: number;
}

/**
 * validate: function to pass to ConfigModule.forRoot({ validate })
 * returns a plain JS object (or class instance) with validated & converted fields.
 */
export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvConfig, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const detail = errors
      .map((e) => {
        const constraints = e.constraints
          ? Object.values(e.constraints).join(', ')
          : '';
        return `${e.property}: ${constraints}`;
      })
      .join('; ');
    throw new Error(`Config validation error: ${detail}`);
  }

  // Return plain object (class instance is fine too; ConfigService will use the returned object)
  return {
    NODE_ENV: validated.NODE_ENV,
    PORT: validated.PORT,
    DATABASE_HOST: validated.DATABASE_HOST,
    DATABASE_PORT: validated.DATABASE_PORT,
    DATABASE_USER: validated.DATABASE_USER,
    DATABASE_PASSWORD: validated.DATABASE_PASSWORD,
    DATABASE_NAME: validated.DATABASE_NAME,
    DATABASE_LOGGING: validated.DATABASE_LOGGING,
    JWT_SECRET: validated.JWT_SECRET,
    JWT_ACCESS_TOKEN_TTL: validated.JWT_ACCESS_TOKEN_TTL,
  };
}
