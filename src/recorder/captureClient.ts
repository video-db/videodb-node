import { EventEmitter } from 'events';
import { BinaryManager } from './binaryManager';
import {
  PermissionType,
  type PermissionTypeValue,
  type PermissionStatusValue,
  type BinaryChannel,
  type StartCaptureSessionClientConfig,
  type CaptureClientOptions,
  type TrackTypeValue,
} from './types';

/**
 * CaptureClient provides client-side recording capabilities using the native binary
 *
 * @example
 * ```typescript
 * import { CaptureClient } from 'videodb/capture';
 *
 * const client = new CaptureClient({ sessionToken: token });
 *
 * // Request permissions
 * await client.requestPermission('microphone');
 * await client.requestPermission('screen_capture');
 *
 * // List available channels
 * const channels = await client.listChannels();
 *
 * // Start capture session (sessionId from backend CaptureSession)
 * await client.startCaptureSession({
 *   sessionId: 'ss-xxx', // Required: from CaptureSession.id
 *   channels: [
 *     { channelId: 'mic:default', type: 'audio', record: true, transcript: true },
 *     { channelId: 'display:1', type: 'video', record: true },
 *   ],
 * });
 *
 * // Stop capture
 * await client.stopCaptureSession();
 *
 * // Cleanup
 * await client.shutdown();
 * ```
 */
export class CaptureClient extends EventEmitter {
  private sessionToken: string;
  private binaryManager: BinaryManager;
  private isInitialized: boolean = false;
  private currentSessionId: string | null = null;

  constructor(options: CaptureClientOptions) {
    super();
    this.sessionToken = options.sessionToken;
    this.binaryManager = new BinaryManager({
      dev: options.dev,
      restartOnError: options.restartOnError,
    });

    // Forward events from BinaryManager
    this.binaryManager.on('error', payload => {
      this.emit('error', payload);
    });

    this.binaryManager.on('shutdown', payload => {
      this.emit('shutdown', payload);
    });

    this.binaryManager.on('recording:started', payload => {
      this.emit('recording:started', payload);
    });

    this.binaryManager.on('recording:stopped', payload => {
      this.currentSessionId = null;
      this.emit('recording:stopped', payload);
    });

    this.binaryManager.on('recording:error', payload => {
      this.emit('recording:error', payload);
    });

    this.binaryManager.on('transcript', payload => {
      this.emit('transcript', payload);
    });

    this.binaryManager.on('upload:progress', payload => {
      this.emit('upload:progress', payload);
    });

    this.binaryManager.on('upload:complete', payload => {
      this.emit('upload:complete', payload);
    });
  }

  /**
   * Initialize the capture client (starts the binary)
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.binaryManager.start({
      sessionToken: this.sessionToken,
    });

    this.isInitialized = true;
  }

  /**
   * Request a system permission
   * @param kind - The type of permission to request
   * @returns The permission status
   */
  public async requestPermission(
    kind: PermissionTypeValue
  ): Promise<PermissionStatusValue> {
    await this.ensureInitialized();

    // Validate permission type
    const validPermissions = Object.values(PermissionType);
    if (!validPermissions.includes(kind)) {
      throw new Error(
        `Invalid permission type: ${kind}. Valid types: ${validPermissions.join(
          ', '
        )}`
      );
    }

    const result = await this.binaryManager.sendCommand<{
      status: PermissionStatusValue;
    }>('requestPermission', { permission: kind });

    return result.status;
  }

  /**
   * List available capture channels (microphones, displays, etc.)
   * @returns Array of available channels
   */
  public async listChannels(): Promise<
    Array<BinaryChannel & Record<string, unknown>>
  > {
    await this.ensureInitialized();

    const result = await this.binaryManager.sendCommand<{
      channels: Array<Record<string, unknown>>;
    }>('getChannels', {});

    return result.channels.map(channel => {
      const channelId = channel.id as string;

      const extras = { ...channel };
      return {
        channelId,
        type: channel.type as 'audio' | 'video',
        name: (channel.name ?? channel.channel_name ?? 'Unknown') as string,
        isDefault: channel.is_default as boolean | undefined,
        extras,
      };
    });
  }

  /**
   * Start capture session
   * @param config - Capture session configuration (sessionId is required)
   */
  public async startCaptureSession(
    config: StartCaptureSessionClientConfig
  ): Promise<void> {
    await this.ensureInitialized();

    // Validate configuration
    if (!config.sessionId) {
      throw new Error('sessionId is required');
    }

    if (!config.channels || !Array.isArray(config.channels)) {
      throw new Error('channels array is required');
    }

    if (config.channels.length === 0) {
      throw new Error('channels array cannot be empty');
    }

    this.currentSessionId = config.sessionId;

    const channels = config.channels.map(channel => ({
      channel_id:
        (channel as { channel_id?: string }).channel_id ?? channel.channelId,
      type: channel.type,
      record: channel.record,
      transcript: channel.transcript,
      store: channel.store,
    }));

    if (channels.some(ch => !ch.channel_id)) {
      throw new Error('channels must include channelId for each channel');
    }

    const primaryVideo = channels.find(ch => ch.type === 'video');

    await this.binaryManager.sendCommand('startRecording', {
      uploadToken: this.sessionToken,
      sessionId: config.sessionId,
      channels,
      ...(primaryVideo
        ? { primary_video_channel_id: primaryVideo.channel_id }
        : {}),
    });
  }

  /**
   * Stop the current capture session
   */
  public async stopCaptureSession(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    if (!this.currentSessionId) {
      // No active session, but try to stop anyway
      await this.binaryManager.sendCommand('stopRecording', {
        sessionId: 'current',
      });
      return;
    }

    await this.binaryManager.sendCommand('stopRecording', {
      sessionId: this.currentSessionId,
    });

    this.currentSessionId = null;
  }

  /**
   * Pause specific tracks
   * @param tracks - Array of track types to pause
   */
  public async pauseTracks(tracks: TrackTypeValue[]): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('CaptureClient not initialized');
    }

    if (!tracks || !Array.isArray(tracks)) {
      throw new Error('tracks must be an array');
    }

    if (tracks.length === 0) {
      throw new Error('tracks array cannot be empty');
    }

    const validTracks = ['mic', 'system_audio', 'screen'];
    const invalidTracks = tracks.filter(t => !validTracks.includes(t));
    if (invalidTracks.length > 0) {
      throw new Error(
        `Invalid track(s): ${invalidTracks.join(
          ', '
        )}. Valid tracks: ${validTracks.join(', ')}`
      );
    }

    await this.binaryManager.sendCommand('pauseTracks', { tracks });
  }

  /**
   * Resume specific tracks
   * @param tracks - Array of track types to resume
   */
  public async resumeTracks(tracks: TrackTypeValue[]): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('CaptureClient not initialized');
    }

    if (!tracks || !Array.isArray(tracks)) {
      throw new Error('tracks must be an array');
    }

    if (tracks.length === 0) {
      throw new Error('tracks array cannot be empty');
    }

    const validTracks = ['mic', 'system_audio', 'screen'];
    const invalidTracks = tracks.filter(t => !validTracks.includes(t));
    if (invalidTracks.length > 0) {
      throw new Error(
        `Invalid track(s): ${invalidTracks.join(
          ', '
        )}. Valid tracks: ${validTracks.join(', ')}`
      );
    }

    await this.binaryManager.sendCommand('resumeTracks', { tracks });
  }

  /**
   * Gracefully shutdown the capture client
   */
  public async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    await this.binaryManager.stop();
    this.isInitialized = false;
    this.currentSessionId = null;
  }

  /**
   * Check if the capture client is initialized
   */
  public get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if a capture is currently active
   */
  public get isCapturing(): boolean {
    return this.currentSessionId !== null;
  }
}
