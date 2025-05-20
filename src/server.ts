import express from 'express';
import cors from 'cors';
import fs from 'fs';

import config from '@/config';
import {
  requestLogger,
  notFoundHandler,
  errorHandler,
} from '@/middleware/error-handlers';
import FileWatcher from '@/utils/file-watcher';
import SseManager from '@/utils/sse-manager';
import {EventData} from '@/types';

// Initialize Express app
const app = express();

// Initialize SSE manager and file watcher
const sseManager = new SseManager();
const fileWatcher = new FileWatcher(config.watchFolder);

// Set up middleware
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  }),
);
app.use(express.json());
app.use(requestLogger);

// SSE endpoint
app.get('/events', (req, res) => {
  // Connect the client to the SSE manager
  const clientId = sseManager.connect(res);

  // Handle client disconnect
  req.on('close', () => {
    console.log(`Client ${clientId} connection closed`);
    sseManager.disconnect(clientId);
  });
});

// Manual event trigger endpoint
app.post('/trigger-event', express.json(), (req, res) => {
  const eventData: EventData = {
    message: req.body.message || 'Event triggered',
    data: req.body.data,
    timestamp: Date.now(),
  };

  sseManager.broadcast(eventData);
  res.json({success: true, eventData});
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    clients: sseManager.getClientCount(),
    watchFolder: config.watchFolder,
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start watching for file changes
fileWatcher.onFileAdded((data: EventData) => {
  sseManager.broadcast(data);
});

// Start the server
const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Watching for file changes in: ${config.watchFolder}`);

  // Ensure the watched directory exists
  if (!fs.existsSync(config.watchFolder)) {
    fs.mkdirSync(config.watchFolder, {recursive: true});
    console.log(`Created watch folder: ${config.watchFolder}`);
  }

  // Start the file watcher
  fileWatcher.start();
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutting down gracefully...');

  server.close(() => {
    console.log('HTTP server closed');
    fileWatcher.stop();
    process.exit(0);
  });

  // Force close if graceful shutdown fails
  setTimeout(() => {
    console.error(
      'Could not close connections in time, forcefully shutting down',
    );
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
