const {execSync} = require('child_process');
require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'express-sse',
      script: 'src/server.ts',
      interpreter: execSync('which bun').toString().trim(),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || 5000,
        WATCH_FOLDER: process.env.WATCH_FOLDER || './watched',
        CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
        CORS_CREDENTIALS: process.env.CORS_CREDENTIALS || 'false',
      },
    },
  ],
};
