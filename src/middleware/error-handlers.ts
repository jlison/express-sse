import {Request, Response, NextFunction} from 'express';

/**
 * Error response structure
 */
interface ErrorResponse {
  status: number;
  message: string;
  timestamp: number;
  path?: string;
}

/**
 * Custom error class with HTTP status code
 */
export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

/**
 * Request logger middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();
  const {method, originalUrl} = req;

  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl}`);

  // Add response finish event handler to log completion
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
};

/**
 * Not found middleware - handles 404 errors
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const error = new HttpError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: Error | HttpError,
  req: Request,
  res: Response,
) => {
  // Determine status code (default to 500 if not set)
  const status = 'status' in err ? err.status : 500;

  // Build error response
  const errorResponse: ErrorResponse = {
    status,
    message: err.message || 'Internal Server Error',
    timestamp: Date.now(),
    path: req.originalUrl,
  };

  // Log error details (but not in tests)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${errorResponse.message}`);
    if (status === 500) {
      console.error(err.stack);
    }
  }

  // Send error response
  res.status(status).json(errorResponse);
};
