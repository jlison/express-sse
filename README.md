# Express SSE Application

A TypeScript-based Express server application that implements Server-Sent Events
(SSE) to monitor file changes in a local directory and notify connected clients
in real-time.

## Features

- TypeScript implementation with strict type checking
- Express.js server with SSE endpoint
- File system monitoring using Node.js fs.watch API
- Path aliases for improved import organization
- Development environment with Bun hot reloading
- Production deployment with PM2

## Project Structure

```
express-sse/
├── src/                      # Source code directory
│   ├── config/               # Configuration files
│   ├── middleware/           # Express middleware
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   └── server.ts             # Main server file
├── watched/                  # Directory monitored for file changes
├── dist/                     # Compiled JavaScript output
├── tsconfig.json             # TypeScript configuration
├── ecosystem.config.js       # PM2 configuration
├── .env.example              # Example environment variables
└── package.json              # Project dependencies and scripts
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v22.x or later)
- [Bun](https://bun.sh/) (v1.0.0 or later)
- [PM2](https://pm2.keymetrics.io/) (for production)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/jlison/express-sse.git
   cd express-sse
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

## Development

Run the application in development mode with hot reloading:

```bash
bun run dev
```

This will start the server on port 3000 (default) with hot reloading enabled.

## Building for Production

Build the TypeScript code to JavaScript:

```bash
bun run build
```

This will compile the TypeScript code to JavaScript in the `dist` directory.

## Production Deployment

Start the application in production mode using PM2:

```bash
bun run prod
```

Additional PM2 commands:

- Stop the application: `bun run prod:stop`
- Restart the application: `bun run prod:restart`
- View logs: `bun run prod:logs`
- Monitor the application: `bun run prod:monit`

## API Endpoints

### GET /events

SSE endpoint that clients can connect to for receiving real-time notifications
when files are added to the watched directory or when events are manually
triggered.

Example client usage:

```javascript
const eventSource = new EventSource('http://localhost:3000/events');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received event:', data);
};

eventSource.onerror = () => {
  console.error('Error connecting to the SSE server');
  eventSource.close();
};
```

### POST /trigger-event

Endpoint to manually trigger an event that will be sent to all connected
clients.

Example:

```bash
curl -X POST http://localhost:3000/trigger-event \
  -H "Content-Type: application/json" \
  -d '{"message": "New event", "data": {"key": "value"}}'
```

### GET /status

Returns the current status of the application, including:

- Number of connected clients
- Watched directory path
- Server uptime
- Current timestamp

## Testing File Events

To test the file event notification system, simply add a new file to the
`watched` directory:

```bash
echo "test content" > watched/test-file.txt
```

All connected clients will receive a notification with details about the new
file.

## Configuration

The application can be configured using environment variables in a `.env` file:

| Variable           | Description                                                          | Default     |
| ------------------ | -------------------------------------------------------------------- | ----------- |
| `PORT`             | Server port                                                          | 3000        |
| `WATCH_FOLDER`     | Directory to monitor for file changes                                | './watched' |
| `CORS_ORIGIN`      | CORS origin policy (use comma-separated values for multiple origins) | '\*'        |
| `CORS_CREDENTIALS` | Enable CORS credentials                                              | false       |
| `NODE_ENV`         | Environment (development, production, test)                          | development |

You can copy the provided `.env.example` file to create your own configuration:

```bash
cp .env.example .env
```

## License

This project is licensed under the terms of the MIT license.
