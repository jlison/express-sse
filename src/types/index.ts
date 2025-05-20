/**
 * Type definitions for the Express SSE application
 */

/**
 * Event data structure sent to clients
 */
export interface EventData<T = unknown> {
  message: string;
  data?: T;
  timestamp?: number;
}

/**
 * Configuration for the application
 */
export interface AppConfig {
  port: number;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}

/**
 * Structure for a connected SSE client
 */
export interface SseClient<T = unknown> {
  id: string;
  response: Response;
  send: (data: EventData<T>) => void;
}
