import {AppConfig} from '@/types';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration based on environment
 */
const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS
      ? process.env.CORS_CREDENTIALS === 'true'
      : true,
  },
};

export default config;
