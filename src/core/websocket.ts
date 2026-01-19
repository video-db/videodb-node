import WebSocket, { type Data, type ErrorEvent } from 'ws';

/**
 * Interface for WebSocket messages
 */
export interface WebSocketMessage {
  [key: string]: unknown;
}

/**
 * WebSocketConnection class for real-time event streaming from VideoDB
 *
 * @example
 * ```typescript
 * const conn = videodb.connect(apiKey);
 * const ws = await conn.connectWebsocket();
 *
 * // Using async iteration
 * for await (const message of ws.receive()) {
 *   console.log('Received:', message);
 * }
 *
 * // Or manually
 * await ws.connect();
 * ws.onMessage((msg) => console.log(msg));
 * await ws.close();
 * ```
 */
export class WebSocketConnection {
  public url: string;
  public connectionId?: string;
  private _connection: WebSocket | null = null;
  private _messageHandlers: Array<(message: WebSocketMessage) => void> = [];
  private _closeHandlers: Array<() => void> = [];
  private _errorHandlers: Array<(error: Error) => void> = [];
  private _messageQueue: WebSocketMessage[] = [];
  private _resolvers: Array<(value: WebSocketMessage) => void> = [];

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Establish the WebSocket connection
   * @returns Promise that resolves to this WebSocketConnection instance
   */
  public async connect(): Promise<WebSocketConnection> {
    return new Promise((resolve, reject) => {
      try {
        this._connection = new WebSocket(this.url);

        this._connection.on('open', () => {
          // Wait for the init message with connection_id
        });

        this._connection.on('message', (data: Data) => {
          try {
            const message = JSON.parse(data.toString()) as WebSocketMessage;

            // First message should contain connection_id
            if (!this.connectionId && message.connection_id) {
              this.connectionId = message.connection_id as string;
              resolve(this);
              return;
            }

            // Handle subsequent messages
            this._handleMessage(message);
          } catch {
            // Non-JSON message
            const rawMessage: WebSocketMessage = { raw: data.toString() };
            this._handleMessage(rawMessage);
          }
        });

        this._connection.on('error', (event: ErrorEvent) => {
          const error = new Error(event.message);
          this._errorHandlers.forEach(handler => handler(error));
          if (!this.connectionId) {
            reject(error);
          }
        });

        this._connection.on('close', () => {
          this._closeHandlers.forEach(handler => handler());
          this._connection = null;
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming message - either queue it or pass to handler
   */
  private _handleMessage(message: WebSocketMessage): void {
    // Notify all registered handlers
    this._messageHandlers.forEach(handler => handler(message));

    // If there are waiting resolvers, resolve the first one
    if (this._resolvers.length > 0) {
      const resolver = this._resolvers.shift();
      if (resolver) resolver(message);
    } else {
      // Otherwise queue the message
      this._messageQueue.push(message);
    }
  }

  /**
   * Close the WebSocket connection
   */
  public async close(): Promise<void> {
    if (this._connection) {
      return new Promise(resolve => {
        if (this._connection) {
          this._connection.once('close', () => {
            this._connection = null;
            resolve();
          });
          this._connection.close();
        } else {
          resolve();
        }
      });
    }
  }

  /**
   * Send a message over the WebSocket
   * @param message - Message to send
   */
  public async send(message: WebSocketMessage): Promise<void> {
    if (!this._connection) {
      throw new Error('WebSocket is not connected. Call connect() first.');
    }
    return new Promise((resolve, reject) => {
      this._connection!.send(JSON.stringify(message), error => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  /**
   * Register a message handler
   * @param handler - Function to call when a message is received
   */
  public onMessage(handler: (message: WebSocketMessage) => void): void {
    this._messageHandlers.push(handler);
  }

  /**
   * Register a close handler
   * @param handler - Function to call when the connection closes
   */
  public onClose(handler: () => void): void {
    this._closeHandlers.push(handler);
  }

  /**
   * Register an error handler
   * @param handler - Function to call when an error occurs
   */
  public onError(handler: (error: Error) => void): void {
    this._errorHandlers.push(handler);
  }

  /**
   * Check if the WebSocket is connected
   */
  public get isConnected(): boolean {
    return (
      this._connection !== null &&
      this._connection.readyState === WebSocket.OPEN
    );
  }

  /**
   * Async generator that yields received messages
   * Use this with for-await-of loop
   *
   * @example
   * ```typescript
   * for await (const message of ws.receive()) {
   *   console.log(message);
   * }
   * ```
   */
  public async *receive(): AsyncGenerator<WebSocketMessage, void, unknown> {
    if (!this._connection) {
      throw new Error('WebSocket is not connected. Call connect() first.');
    }

    while (this.isConnected) {
      // First check if there are queued messages
      if (this._messageQueue.length > 0) {
        yield this._messageQueue.shift()!;
        continue;
      }

      // Wait for the next message
      const message = await new Promise<WebSocketMessage | null>(resolve => {
        if (!this.isConnected) {
          resolve(null);
          return;
        }

        // Add resolver to queue
        this._resolvers.push(resolve);

        // Also listen for close
        const closeHandler = () => {
          const idx = this._resolvers.indexOf(resolve);
          if (idx !== -1) {
            this._resolvers.splice(idx, 1);
            resolve(null);
          }
        };
        this._connection?.once('close', closeHandler);
      });

      if (message === null) {
        break;
      }
      yield message;
    }
  }
}
