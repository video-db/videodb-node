import WebSocket, { type Data, type ErrorEvent } from 'ws';

/**
 * Interface for WebSocket messages
 */
export interface WebSocketMessage {
  [key: string]: unknown;
}

/**
 * Filter configuration for WebSocket stream
 */
export interface WebSocketStreamFilter {
  /** Channel type to filter (e.g., 'transcript', 'scene_index') */
  channel?: string;
  /** Specific ID to filter (e.g., rtstream ID, index ID) */
  id?: string;
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

  /**
   * Async generator that yields filtered messages
   * Use this with for-await-of loop to receive messages matching the filter
   *
   * @param filter - Filter configuration with optional channel and id properties
   *
   * @example
   * ```typescript
   * // Listen for transcript events from a specific rtstream
   * for await (const ev of ws.stream({ channel: 'transcript', id: 'rts-xxx' })) {
   *   console.log('Transcript:', ev.data.text);
   * }
   *
   * // Listen for all scene index events
   * for await (const ev of ws.stream({ channel: 'scene_index' })) {
   *   console.log('Scene:', ev);
   * }
   * ```
   */
  public async *stream(
    filter: WebSocketStreamFilter = {}
  ): AsyncGenerator<WebSocketMessage, void, unknown> {
    if (!this._connection) {
      throw new Error('WebSocket is not connected. Call connect() first.');
    }

    const matchesFilter = (message: WebSocketMessage): boolean => {
      // If no filter, match all messages
      if (!filter.channel && !filter.id) {
        return true;
      }

      // Check channel filter
      if (filter.channel) {
        const msgChannel =
          message.channel || message.type || message.event_type;
        if (msgChannel !== filter.channel) {
          return false;
        }
      }

      // Check ID filter
      if (filter.id) {
        const msgId =
          message.id ||
          message.rtstream_id ||
          message.rtstreamId ||
          message.index_id ||
          message.indexId;
        if (msgId !== filter.id) {
          return false;
        }
      }

      return true;
    };

    // Create a filtered queue for messages that match
    const filteredQueue: WebSocketMessage[] = [];
    const filteredResolvers: Array<(value: WebSocketMessage | null) => void> =
      [];

    // Handler for incoming messages
    const messageHandler = (message: WebSocketMessage) => {
      if (matchesFilter(message)) {
        if (filteredResolvers.length > 0) {
          const resolver = filteredResolvers.shift();
          if (resolver) resolver(message);
        } else {
          filteredQueue.push(message);
        }
      }
    };

    // Register the handler
    this._messageHandlers.push(messageHandler);

    try {
      while (this.isConnected) {
        // First check if there are queued filtered messages
        if (filteredQueue.length > 0) {
          yield filteredQueue.shift()!;
          continue;
        }

        // Wait for the next matching message
        const currentConnection = this._connection;
        const message = await new Promise<WebSocketMessage | null>(resolve => {
          if (!this.isConnected || !currentConnection) {
            resolve(null);
            return;
          }

          filteredResolvers.push(resolve);

          // Listen for close
          const closeHandler = () => {
            const idx = filteredResolvers.indexOf(resolve);
            if (idx !== -1) {
              filteredResolvers.splice(idx, 1);
              resolve(null);
            }
          };
          currentConnection.once('close', closeHandler);
        });

        if (message === null) {
          break;
        }
        yield message;
      }
    } finally {
      // Cleanup: remove our handler
      const idx = this._messageHandlers.indexOf(messageHandler);
      if (idx !== -1) {
        this._messageHandlers.splice(idx, 1);
      }
    }
  }
}
