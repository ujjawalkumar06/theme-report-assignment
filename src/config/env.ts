import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        `Copy .env.example to .env and provide staging credentials.`,
    );
  }
  return value;
}

export const ENV = {
  baseUrl: (process.env.APP_BASE_URL ?? 'https://base-application-stage.oomnieye.com').replace(/\/+$/, ''),
  email: required('APP_EMAIL'),
  password: required('APP_PASSWORD'),
} as const;

/** Routes discovered during application exploration. */
export const ROUTES = {
  login: '/#/login',
  dashboard: '/#/dashboard/overview',
  reports: '/#/dashboard/reports',
  themeStudio: '/#/dashboard/reports?themeStudio=true',
} as const;
