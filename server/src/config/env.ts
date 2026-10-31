import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/brightloop_subscriptions?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'brightloop_super_secure_jwt_secret_key_2026_odoo_hackathon',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  RESET_TOKEN_EXPIRES_MINUTES: parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES || '60', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  BILLING_CRON_SCHEDULE: process.env.BILLING_CRON_SCHEDULE || '0 0 * * *',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.ethereal.email',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Brightloop Software <no-reply@brightloop.io>',
};

export const env = ENV;

