import path from 'path';
import {AppConfig} from '@/types';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration based on environment
 */
const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  watchFolder: process.env.WATCH_FOLDER || path.join(process.cwd(), 'watched'),
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
};

export default config;
