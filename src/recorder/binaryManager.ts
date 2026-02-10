import { spawn, type ChildProcess } from 'child_process';
import * as readline from 'readline';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  PROTOCOL_PREFIX,
  MAX_AUTO_RESTARTS,
  ERROR_BUFFER_SIZE,
  HEALTH_CHECK_INTERVAL,
  HEALTH_CHECK_TIMEOUT,
  type BinaryMessage,
  type BinaryResponse,
  type BinaryEvent,
} from './types';
import { RecorderInstaller } from './installer';

interface PendingCommand {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

/**
 * BinaryManager handles communication with the native recorder binary
 * Manages the child process lifecycle, health checks, and auto-restart
 */
export class BinaryManager extends EventEmitter {
  private process: ChildProcess | null = null;
  private pendingCommands: Map<string, PendingCommand> = new Map();
  private isDev: boolean;
  private restartOnError: boolean;
  private remainingRestarts: number = MAX_AUTO_RESTARTS;
  private errorBuffer: string[] = [];
  private unexpectedShutdown: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastHealthCheck: number | null = null;
  private installer: RecorderInstaller;
  private initConfig: Record<string, unknown> = {};

  constructor(options: { dev?: boolean; restartOnError?: boolean } = {}) {
    super();
    this.isDev = options.dev || false;
    this.restartOnError = options.restartOnError !== false;
    this.installer = new RecorderInstaller();
  }

  /**
   * Get the binary path and arguments
   */
  private getBinaryCommand(): { command: string; args: string[] } {
    if (this.isDev) {
      // In dev mode, use a mock binary (Node.js script)
      const path = require('path');
      return {
        command: 'node',
        args: [path.join(__dirname, '..', '..', 'mock', 'binary.js')],
      };
    }

    const binaryPath = this.installer.getBinaryPath();
    return {
      command: binaryPath,
      args: [],
    };
  }

  /**
   * Append an error to the circular buffer
   */
  private appendError(error: string): void {
    this.errorBuffer.push(error);
    if (this.errorBuffer.length > ERROR_BUFFER_SIZE) {
      this.errorBuffer.shift();
    }
  }

  /**
   * Flush all pending commands with an error
   */
  private flushPendingCommands(error: Error): void {
    this.pendingCommands.forEach(promise => {
      promise.reject(error);
    });
    this.pendingCommands.clear();
  }

  /**
   * Handle a message from the binary
   */
  private handleMessage(msg: BinaryMessage): void {
    if (msg.type === 'response') {
      const response = msg as BinaryResponse;
      const { commandId, status, result } = response;
      const promise = this.pendingCommands.get(commandId);
      if (promise) {
        if (status === 'success') {
          promise.resolve(result);
        } else {
          promise.reject(new Error(JSON.stringify(result)));
        }
        this.pendingCommands.delete(commandId);
      }
    } else if (msg.type === 'event') {
      const event = msg as BinaryEvent;
      this.emit(event.event, event.payload);
    }
  }

  /**
   * Start health checks
   */
  private startHealthCheck(): void {
    this.stopHealthCheck();

    this.healthCheckInterval = setInterval(async () => {
      try {
        const start = Date.now();
        await this.sendCommand('ping');
        this.lastHealthCheck = Date.now();

        const duration = this.lastHealthCheck - start;
        if (duration > 5000) {
          console.warn(`VideoDB Recorder: Health check slow (${duration}ms)`);
        }
      } catch {
        console.error('VideoDB Recorder: Health check failed');

        if (
          this.lastHealthCheck &&
          Date.now() - this.lastHealthCheck > HEALTH_CHECK_TIMEOUT
        ) {
          console.error('VideoDB Recorder: Binary appears hung, restarting...');
          this.emit('error', {
            type: 'health_check_timeout',
            message: 'Binary not responding to health checks',
          });

          if (this.process) {
            this.process.kill();
          }
        }
      }
    }, HEALTH_CHECK_INTERVAL);
  }

  /**
   * Stop health checks
   */
  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Start the binary process
   */
  public async start(config: Record<string, unknown> = {}): Promise<void> {
    if (this.process && this.process.exitCode === null) {
      console.warn('VideoDB Recorder: Process already running');
      return;
    }

    this.initConfig = config;

    // Ensure binary is installed
    if (!this.isDev && !this.installer.isInstalled()) {
      console.log('VideoDB Recorder: Installing binary...');
      await this.installer.install();
    }

    try {
      const { command, args } = this.getBinaryCommand();

      this.process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Handle stdin errors (e.g. EPIPE when binary exits unexpectedly)
      this.process.stdin!.on('error', (err: Error) => {
        console.error(`VideoDB Recorder: stdin write error: ${err.message}`);
      });

      // Handle stderr (logs and errors)
      const stderrRl = readline.createInterface({
        input: this.process.stderr!,
        terminal: false,
      });

      stderrRl.on('line', (line: string) => {
        this.appendError(line);
        console.error(`[Recorder Binary]: ${line}`);
      });

      // Handle stdout (protocol messages)
      const stdoutRl = readline.createInterface({
        input: this.process.stdout!,
        terminal: false,
      });

      stdoutRl.on('line', (line: string) => {
        if (line.startsWith(PROTOCOL_PREFIX)) {
          try {
            const jsonStr = line.substring(PROTOCOL_PREFIX.length);
            const msg = JSON.parse(jsonStr) as BinaryMessage;
            this.handleMessage(msg);
          } catch (e) {
            console.error('Failed to parse protocol message:', line, e);
          }
        } else {
          // Non-protocol output (debug logs from binary)
          console.log(`[Recorder Binary Debug]: ${line}`);
        }
      });

      // Handle process errors
      this.process.on('error', (error: Error) => {
        console.error(`VideoDB Recorder: Process error: ${error.message}`);
        this.flushPendingCommands(new Error(`Process error: ${error.message}`));
        this.emit('error', {
          type: 'process',
          message:
            'The recorder binary process failed to start or exited improperly.',
        });
      });

      // Handle process exit
      this.process.on('exit', (code: number | null, signal: string | null) => {
        console.log(
          `VideoDB Recorder: Process exited with code ${code}, signal ${signal}`
        );

        this.flushPendingCommands(new Error(`Process exited: ${code}`));
        this.emit('shutdown', { code: code ?? 0, signal: signal ?? '' });

        stderrRl.close();
        stdoutRl.close();
        this.process = null;

        // Auto-restart logic
        if (code !== 0 && signal !== 'SIGINT') {
          this.unexpectedShutdown = true;

          if (this.restartOnError && this.remainingRestarts > 0) {
            this.remainingRestarts--;
            console.warn(
              `VideoDB Recorder: Auto-restarting (${this.remainingRestarts} restarts remaining)`
            );
            console.warn(
              `Last errors:\n${this.errorBuffer.slice(-10).join('\n')}`
            );

            setTimeout(() => {
              this.start(this.initConfig);
            }, 1000);
          } else if (this.remainingRestarts === 0) {
            console.error(
              'VideoDB Recorder: Max restart attempts reached. Manual intervention required'
            );
            this.emit('error', {
              type: 'max_restarts',
              message: 'Binary crashed too many times. Please check logs.',
            });
          }
        }
      });

      if (this.unexpectedShutdown) {
        console.log('VideoDB Recorder: Recovered from unexpected shutdown');
        this.unexpectedShutdown = false;
      }

      // Start health checks
      this.startHealthCheck();

      // Send init command
      await this.sendCommand('init', config);
    } catch (error) {
      console.error('VideoDB Recorder: Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Send a command to the binary
   */
  public async sendCommand<T = unknown>(
    command: string,
    params: Record<string, unknown> = {}
  ): Promise<T> {
    if (!this.process || !this.process.stdin || this.process.stdin.destroyed) {
      throw new Error('SDK not initialized or binary process is not running.');
    }

    const commandId = uuidv4();
    const payload =
      PROTOCOL_PREFIX + JSON.stringify({ command, commandId, params }) + '\n';

    return new Promise((resolve, reject) => {
      this.pendingCommands.set(commandId, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.process!.stdin!.write(payload, (err) => {
        if (err) {
          const pending = this.pendingCommands.get(commandId);
          if (pending) {
            pending.reject(
              new Error(`Failed to send command '${command}': ${err.message}`)
            );
            this.pendingCommands.delete(commandId);
          }
        }
      });
    });
  }

  /**
   * Gracefully stop the binary
   */
  public async stop(): Promise<void> {
    if (!this.process) {
      return;
    }

    this.stopHealthCheck();

    try {
      await this.sendCommand('shutdown');

      // Force kill after 5 seconds if still running
      const currentProc = this.process;
      setTimeout(() => {
        if (currentProc && !currentProc.killed) {
          console.warn('VideoDB Recorder: Force killing process after timeout');
          currentProc.kill();
        }
      }, 5000);
    } catch {
      // If shutdown command fails, just kill
      console.warn('VideoDB Recorder: Shutdown command failed, force killing');
      if (this.process) {
        this.process.kill();
      }
    }
  }

  /**
   * Immediately kill the binary process
   */
  public kill(): void {
    if (this.process) {
      this.process.kill();
    }
  }

  /**
   * Check if the binary is running
   */
  public isRunning(): boolean {
    return this.process !== null && this.process.exitCode === null;
  }
}
