import { isEmail } from 'class-validator';

export function getOsEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
}

export function getOsEnvOptional(key: string): string | undefined {
  return process.env[key];
}

export function checkEmail(key: string): string {
  const email = getOsEnv(key);
  if (!isEmail(email)) {
    throw new Error(`Environment Variable ${key} is not a valid email`);
  }
  return email;
}