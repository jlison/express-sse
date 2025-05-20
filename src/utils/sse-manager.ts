import {EventData} from '@/types';
import {Response} from 'express';
import {v4 as uuidv4} from 'uuid';

/**
 * SSE Connection Manager
 * Handles client connections and broadcasting events to all connected clients
 */
export class SseManager {
  private clients: Map<string, Response> = new Map();

  /**
   * Connect a new client
   * @param res - Express response object
   * @returns Client ID
   */
  public connect(res: Response): string {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disables Nginx buffering

    // Generate a unique ID for this client
    const clientId = uuidv4();
    this.clients.set(clientId, res);

    // Send initial connection message
    this.sendToClient(res, {
      message: 'Connected to SSE',
      timestamp: Date.now(),
    });

    console.log(`Client connected: ${clientId}`);
    console.log(`Total connected clients: ${this.clients.size}`);

    // Set up client disconnect handling
    res.on('close', () => {
      this.disconnect(clientId);
    });

    return clientId;
  }

  /**
   * Disconnect a client
   * @param clientId - ID of the client to disconnect
   */
  public disconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      console.log(`Client disconnected: ${clientId}`);
      console.log(`Remaining connected clients: ${this.clients.size}`);
    }
  }

  /**
   * Send data to all connected clients
   * @param data - Event data to send
   */
  public broadcast(data: EventData): void {
    if (this.clients.size === 0) {
      return;
    }

    console.log(`Broadcasting to ${this.clients.size} clients:`, data);

    for (const [clientId, res] of this.clients.entries()) {
      try {
        this.sendToClient(res, data);
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error);
        this.disconnect(clientId);
      }
    }
  }

  /**
   * Send data to a specific client
   * @param res - Client response object
   * @param data - Event data to send
   */
  private sendToClient(res: Response, data: EventData): void {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * Get the current number of connected clients
   * @returns Number of connected clients
   */
  public getClientCount(): number {
    return this.clients.size;
  }
}

export default SseManager;
