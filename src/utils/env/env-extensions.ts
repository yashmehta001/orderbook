// import { isEmail } from 'class-validator';

// export function getOsEnv(key: string): string {
//   if (process.env[key] === 'undefined') {
//     throw new Error(`Environment variable ${key} is not set.`);
//   }

//   return process.env[key] as string;
// }

// export function getOsEnvOptional(key: string): string | undefined {
//   return process.env[key];
// }

// export function checkEmail(key: string): string {
//   const email = getOsEnv(key);
//   if (!isEmail(email)) {
//     throw new Error(`Environment Variable ${key} is not an email`);
//   }
//   return email;
// }
