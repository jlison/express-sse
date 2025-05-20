/**
 * Type definitions for the Express SSE application
 */

/**
 * Event data structure sent to clients
 */
export interface EventData<T = unknown> {
  message: string;
  filename?: string;
  timestamp?: number;
  data?: T;
}

/**
 * Configuration for the application
 */
export interface AppConfig {
  port: number;
  watchFolder: string;
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
