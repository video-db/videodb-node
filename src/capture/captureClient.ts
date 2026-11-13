import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { BinaryManager, CaptureCommandError } from './binaryManager';
import type {
  AvailableWindows,
  SwitchWindowOptions,
  SetWindowEnabledOptions,
  WindowEnabledResult,
  StartLocalRecordingOptions,
  LocalRecordingStarted,
  LocalRecordingResult,
  LocalRecordingFailure,
  CaptureClientEvents,
  RecordingIdentity,
  LocalRecording,
  ProcessingComplete,
  RecordingFailure,
  RecorderTokenProvider,
  RelayRecordingOptions,
  RelayRecordingResult,
  WaitForProcessingOptions,
  CaptureShutdownOptions,
} from './types';
import {
  PermissionType,
  PermissionStatus,
  type PermissionTypeValue,
  type PermissionStatusValue,
  type StartCaptureSessionClientConfig,
  type CaptureClientOptions,
  type TrackTypeValue,
} from './types';
import { Channels, groupChannels, type ChannelClient } from './channel';

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
 * await client.startSession({
 *   sessionId: 'ss-xxx', // Required: from CaptureSession.id
 *   channels: [
 *     { channelId: 'mic:default', type: 'audio', store: true },
 *     { channelId: 'display:1', type: 'video', store: true },
 *   ],
 * });
 *
 * // Stop capture
 * await client.stopSession();
 *
 * // Cleanup
 * await client.shutdown();
 * ```
 */
export class CaptureClient extends EventEmitter implements ChannelClient {
  private sessionToken?: string;
  private apiUrl: string;
  private binaryManager: BinaryManager;
  private isInitialized: boolean = false;
  private currentSessionId: string | null = null;

  private initialization?: Promise<void>;
  private tokenProvider?: RecorderTokenProvider;
  private maxTokenRefreshAttempts: number;
  private tokenHashes = new Map<string, Set<string>>();
  private tokenTasks = new Map<string, Promise<void>>();
  private recordingSessions = new Map<string, string>();
  private processing = new EventEmitter();
  private outcomes = new Map<string, ProcessingComplete | Error>();
  private pendingSessions = new Set<string>();
  private pendingRecordings = new Set<string>();
  private shuttingDown = false;
  private suspending = false;
  private lifecycleGeneration = 0;
  private captureOperations: Promise<unknown> = Promise.resolve();
  private localRecordingId: string | null = null;
  private localOutcomes = new Map<string, LocalRecordingResult | Error>();

  private serializeCapture<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.captureOperations.then(operation);
    this.captureOperations = result.catch(() => {});
    return result;
  }

  public on<K extends keyof CaptureClientEvents>(
    event: K,
    listener: (payload: CaptureClientEvents[K]) => void
  ): this;
  // Preserve EventEmitter compatibility for application-defined events.
  public on(
    event: string | symbol,
    listener: Parameters<EventEmitter['on']>[1]
  ): this;
  public on(
    event: string | symbol,
    listener: Parameters<EventEmitter['on']>[1]
  ): this {
    return super.on(event, listener);
  }

  constructor(options: CaptureClientOptions = {}) {
    super();
    this.sessionToken = options.sessionToken;
    this.tokenProvider = options.getRecorderToken;
    this.maxTokenRefreshAttempts = options.maxTokenRefreshAttempts ?? 3;
    if (
      !Number.isInteger(this.maxTokenRefreshAttempts) ||
      this.maxTokenRefreshAttempts < 1
    ) {
      throw new Error('maxTokenRefreshAttempts must be a positive integer');
    }
    this.processing.setMaxListeners(0);
    this.apiUrl = options.apiUrl || 'https://api.videodb.io';
    this.binaryManager = new BinaryManager({
      dev: options.dev,
      restartOnError: options.restartOnError,
    });

    for (const name of [
      'windows-available',
      'window-suspended',
      'window-resumed',
      'window-closed',
      'window-switched',
      'local-recording-started',
    ]) {
      this.binaryManager.on(name, payload => this.emit(name, payload));
    }

    for (const name of [
      'local-recording-ready',
      'recording-token-needed',
      'local-recording-failed',
      'recording-relay-failed',
      'processing-complete',
    ] as const) {
      this.binaryManager.on(
        name,
        (
          payload:
            | RecordingIdentity
            | LocalRecordingResult
            | LocalRecordingFailure
        ) => {
          // Standalone events have no server session. Never add them to relay/processing state.
          if (!('sessionId' in payload)) {
            if (name === 'local-recording-ready') {
              this.localOutcomes.set(
                payload.recordingId,
                payload as LocalRecordingResult
              );
            } else if (name === 'local-recording-failed') {
              this.localOutcomes.set(
                payload.recordingId,
                new Error('Local finalization failed; output retained')
              );
            }
            this.processing.emit('local-change');
            this.emit(name, payload);
            return;
          }
          if (
            !this.sessionToken &&
            !this.tokenProvider &&
            !this.pendingRecordings.has(payload.recordingId)
          ) {
            this.emit(name, payload);
            return; // A tokenless local client does not adopt unrelated server relay jobs.
          }
          this.recordingSessions.set(payload.recordingId, payload.sessionId);
          if (name === 'processing-complete') {
            this.setOutcome(payload, payload as ProcessingComplete);
            this.tokenHashes.delete(payload.recordingId);
          } else if (
            name === 'local-recording-failed' ||
            name === 'recording-relay-failed'
          ) {
            this.setOutcome(
              payload,
              new Error(`${name}: recording retained for recovery`)
            );
          } else {
            this.pendingRecordings.add(payload.recordingId);
          }
          this.emit(name, payload);
          if (name === 'recording-token-needed' && this.tokenProvider) {
            // Serialize requests: an authorization rejection may arrive before relay acceptance.
            const previous =
              this.tokenTasks.get(payload.recordingId) ?? Promise.resolve();
            const generation = this.lifecycleGeneration;
            const task = previous.then(() =>
              this.supplyRecorderToken(payload, generation)
            );
            this.tokenTasks.set(payload.recordingId, task);
            void task.finally(() => {
              if (this.tokenTasks.get(payload.recordingId) === task)
                this.tokenTasks.delete(payload.recordingId);
            });
          }
        }
      );
    }
    this.binaryManager.on('recording-started', payload => {
      this.emit('recording-started', payload);
      this.emit('recording:started', payload);
    });
    this.binaryManager.on(
      'recording-complete',
      (payload: { sessionId: string }) => {
        if (payload.sessionId === this.currentSessionId)
          this.currentSessionId = null;
        this.emit('recording-complete', payload);
        this.emit('recording:stopped', payload);
      }
    );

    // Forward events from BinaryManager
    this.binaryManager.on('error', payload => {
      this.emit('error', payload);
    });

    this.binaryManager.on('shutdown', payload => {
      this.lifecycleGeneration++;
      this.isInitialized = false;
      this.localRecordingId = null;
      this.currentSessionId = null;
      this.processing.emit('exit');
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
    if (this.suspending) throw new Error('CaptureClient is suspending');
    if (this.isInitialized) {
      return;
    }

    if (!this.initialization) {
      this.initialization = this.binaryManager
        .start({
          ...(this.sessionToken ? { sessionToken: this.sessionToken } : {}),
          apiUrl: this.apiUrl,
        })
        .then(() => {
          this.isInitialized = true;
        })
        .finally(() => {
          this.initialization = undefined;
        });
    }
    await this.initialization;
  }

  private setOutcome(
    identity: RecordingIdentity,
    outcome: ProcessingComplete | Error
  ): void {
    this.outcomes.set(`recording:${identity.recordingId}`, outcome);
    this.outcomes.set(`session:${identity.sessionId}`, outcome);
    if (!(outcome instanceof Error)) {
      this.pendingRecordings.delete(identity.recordingId);
      this.pendingSessions.delete(identity.sessionId);
    }
    this.processing.emit('change');
  }

  private async supplyRecorderToken(
    identity: RecordingIdentity,
    generation: number
  ): Promise<void> {
    try {
      if (generation !== this.lifecycleGeneration) return;
      const hashes =
        this.tokenHashes.get(identity.recordingId) ?? new Set<string>();
      if (hashes.size >= this.maxTokenRefreshAttempts)
        throw new Error('Refresh limit');
      const token = await this.tokenProvider!({
        ...identity,
        forceRefresh: true,
      });
      if (generation !== this.lifecycleGeneration) return;
      if (token === null) {
        this.pendingRecordings.delete(identity.recordingId);
        return; // Host did not authorize this retained recording.
      }
      if (!token?.trim()) throw new Error('Empty token');
      const hash = createHash('sha256').update(token).digest('hex');
      if (hashes.has(hash)) throw new Error('Cached token');
      hashes.add(hash);
      this.tokenHashes.set(identity.recordingId, hashes);
      await this.relayRecording({
        recordingId: identity.recordingId,
        uploadToken: token,
      });
    } catch {
      if (generation !== this.lifecycleGeneration) return;
      // Do not propagate provider/HTTP exceptions, which may contain credentials.
      const error =
        'Could not obtain or submit a fresh recorder token; bypass token caches and retry explicitly';
      this.setOutcome(identity, new Error(error));
      this.emit('recording-token-error', {
        ...identity,
        error,
      } satisfies RecordingFailure);
    }
  }

  /** Lists durable jobs for this API environment; does not relay them. */
  public async listLocalRecordings(): Promise<LocalRecording[]> {
    await this.ensureInitialized();
    const result = await this.binaryManager.sendCommand<{
      recordings: LocalRecording[];
    }>('listLocalRecordings');
    for (const job of result.recordings)
      this.recordingSessions.set(job.recordingId, job.sessionId);
    return result.recordings;
  }

  /** Resolves on acceptance. Await waitForProcessing separately for ingestion. */
  public async relayRecording(
    options: RelayRecordingOptions
  ): Promise<RelayRecordingResult> {
    if (
      options.recordingId === this.localRecordingId ||
      this.localOutcomes.has(options.recordingId)
    )
      throw new Error(
        'Standalone files are local only; session relay is not supported'
      );
    if (!options.recordingId || !options.uploadToken?.trim())
      throw new Error('recordingId and fresh uploadToken are required');
    await this.ensureInitialized();
    this.pendingRecordings.add(options.recordingId);
    this.outcomes.delete(`recording:${options.recordingId}`);
    const sessionId = this.recordingSessions.get(options.recordingId);
    if (sessionId) this.outcomes.delete(`session:${sessionId}`);
    try {
      return await this.binaryManager.sendCommand<RelayRecordingResult>(
        'relayRecording',
        { ...options }
      );
    } catch {
      const error = new Error(
        'Relay request rejected; recording retained for recovery'
      );
      this.outcomes.set(`recording:${options.recordingId}`, error);
      if (sessionId) this.outcomes.set(`session:${sessionId}`, error);
      this.processing.emit('change');
      throw error;
    }
  }

  /** Handles completion events that arrive before or after this call. */
  public async waitForProcessing(
    options: WaitForProcessingOptions
  ): Promise<ProcessingComplete> {
    if (
      options.recordingId &&
      (options.recordingId === this.localRecordingId ||
        this.localOutcomes.has(options.recordingId))
    )
      throw new Error(
        'Use stopLocalRecording to await standalone finalization'
      );
    const timeoutMs = options.timeoutMs ?? 900_000;
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0)
      throw new Error('timeoutMs must be positive');
    const key = options.recordingId
      ? `recording:${options.recordingId}`
      : `session:${options.sessionId}`;
    if (!options.recordingId && !options.sessionId)
      throw new Error('recordingId or sessionId is required');
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        this.processing.off('change', check);
        this.processing.off('exit', exited);
      };
      const check = () => {
        const outcome = this.outcomes.get(key);
        if (!outcome) return;
        cleanup();
        if (outcome instanceof Error) reject(outcome);
        else resolve(outcome);
      };
      const exited = () => {
        cleanup();
        reject(
          new Error(
            'Recorder exited before processing completed; recover retained jobs'
          )
        );
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(
          new Error(
            'Processing timed out; recorder remains running and jobs can be recovered'
          )
        );
      }, timeoutMs);
      this.processing.on('change', check);
      this.processing.on('exit', exited);
      check();
    });
  }

  /** Discover current windows and mode-specific capabilities. No server call. */
  public async getWindows(): Promise<AvailableWindows> {
    if (process.platform !== 'darwin')
      return {
        supported: false,
        supportsSwitchWindow: false,
        supportsDeferredWindow: false,
        supportsPlaceholder: false,
        supportsSetWindowEnabled: false,
        supportsAddWindowMidRecording: false,
        windows: [],
      };
    await this.ensureInitialized();
    return this.binaryManager.sendCommand<AvailableWindows>('getWindows');
  }

  /** Replace the selected window without resetting the recording timeline. */
  public async switchWindow(
    options: SwitchWindowOptions
  ): Promise<{ channelId: string }> {
    return this.serializeCapture(async () => {
      if (this.shuttingDown) throw new Error('CaptureClient is shutting down');
      if (!options.channelId?.startsWith('window:'))
        throw new Error('A discovered window channelId is required');
      await this.ensureInitialized();
      return this.binaryManager.sendCommand('switchWindow', { ...options });
    });
  }

  /** Off replaces private video with gray frames; unlike pause, it does not freeze the last picture. */
  public async setWindowEnabled(
    options: SetWindowEnabledOptions
  ): Promise<WindowEnabledResult> {
    return this.serializeCapture(async () => {
      if (this.shuttingDown) throw new Error('CaptureClient is shutting down');
      if (typeof options.enabled !== 'boolean')
        throw new Error('enabled must be a boolean');
      await this.ensureInitialized();
      return this.binaryManager.sendCommand('setWindowEnabled', { ...options });
    });
  }

  /** Start macOS standalone capture. No token, API session, RTStreams, or automatic upload. */
  public startLocalRecording(
    options: StartLocalRecordingOptions
  ): Promise<LocalRecordingStarted> {
    return this.serializeCapture(async () => {
      if (this.shuttingDown) throw new Error('CaptureClient is shutting down');
      if (this.currentSessionId || this.localRecordingId)
        throw new Error('A recording is already active');
      if (process.platform !== 'darwin')
        throw new Error('Standalone capture is supported on macOS only');
      const channels = options.channels;
      if (
        !Array.isArray(channels) ||
        channels.filter(ch => ch.type === 'video').length !== 1
      ) {
        throw new Error('Select exactly one display or window video channel');
      }
      if (
        channels.some(ch =>
          ch.type === 'video'
            ? !/^(screen|display:[0-9]+|window:[^:]+)$/.test(ch.channelId)
            : ch.type !== 'audio' ||
              !['mic:default', 'system_audio:default'].includes(ch.channelId)
        )
      ) {
        throw new Error(
          'Unsupported local capture channel; select a display/window and default audio sources'
        );
      }
      const capabilities = await this.getWindows();
      if (!capabilities.supportsDeferredWindow)
        throw new CaptureCommandError({
          code: 'DEFERRED_TARGET_UNSUPPORTED',
          message:
            'Install the window-capable recorder artifact before starting standalone capture',
        });
      const started =
        await this.binaryManager.sendCommand<LocalRecordingStarted>(
          'startRecording',
          {
            mode: 'deferred',
            channels: channels.map(ch => ({
              channel_id: ch.channelId,
              type: ch.type,
            })),
          },
          310_000
        );
      this.localRecordingId = started.recordingId;
      return started;
    });
  }

  /** Finalize the MP4 and return its paths, including when ready arrives before the command reply. */
  public stopLocalRecording(): Promise<LocalRecordingResult> {
    return this.serializeCapture(async () => {
      const id = this.localRecordingId;
      if (!id) throw new Error('No standalone recording is active');
      try {
        await this.binaryManager.sendCommand('stopRecording', {}, 155_000);
      } catch (error) {
        if (
          error instanceof CaptureCommandError &&
          error.code === 'FINALIZE_FAILED'
        )
          this.localRecordingId = null;
        throw error;
      }
      this.localRecordingId = null;
      return this.waitForLocalFinalization(id);
    });
  }

  private waitForLocalFinalization(id: string): Promise<LocalRecordingResult> {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        this.processing.off('local-change', check);
        this.processing.off('exit', exited);
      };
      const check = () => {
        const result = this.localOutcomes.get(id);
        if (!result) return;
        cleanup();
        if (result instanceof Error) reject(result);
        else resolve(result);
      };
      const exited = () => {
        cleanup();
        reject(
          new Error('Recorder exited before local finalization completed')
        );
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(
          new Error('Local finalization timed out; inspect retained output')
        );
      }, 155_000);
      this.processing.on('local-change', check);
      this.processing.on('exit', exited);
      check();
    });
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

    const result = await this.binaryManager.sendCommand<
      Record<string, unknown>
    >('requestPermission', { permission: kind });

    // Handle both response shapes from the binary
    if (result.requested === true) {
      return PermissionStatus.granted;
    }

    const status =
      (result.status as PermissionStatusValue) ??
      (result.permission_status as PermissionStatusValue);

    if (!status) {
      console.warn(
        'VideoDB Capture: Unexpected requestPermission response:',
        result
      );
      return PermissionStatus.undetermined;
    }

    return status;
  }

  /**
   * List available capture channels grouped by type
   *
   * Returns a Channels object with mics, displays, and systemAudio properties.
   * Each property is a ChannelList with a `.default` property to get the first channel.
   *
   * @returns Channels object with grouped channels that support pause/resume
   *
   * @example
   * ```typescript
   * const channels = await client.listChannels();
   *
   * // Access default channels
   * const defaultMic = channels.mics.default;
   * const defaultDisplay = channels.displays.default;
   *
   * // Pause/resume individual channels
   * await channels.mics.default?.pause();
   * await channels.mics.default?.resume();
   *
   * // Iterate over all mics
   * for (const mic of channels.mics) {
   *   console.log(mic.name);
   * }
   * ```
   */
  public async listChannels(): Promise<Channels> {
    await this.ensureInitialized();

    const result = await this.binaryManager.sendCommand<{
      channels: Array<Record<string, unknown>>;
    }>('getChannels', {});

    const rawChannels = result.channels.map(channel => {
      const channelId = channel.channel_id as string;
      return {
        channelId,
        type: channel.type as 'audio' | 'video',
        name: (channel.name ?? channel.channel_name ?? 'Unknown') as string,
        isDefault: channel.is_default as boolean | undefined,
      };
    });

    return groupChannels(rawChannels, this);
  }

  /**
   * Start capture session
   * @param config - Capture session configuration (sessionId is required)
   */
  public startSession(config: StartCaptureSessionClientConfig): Promise<void> {
    return this.serializeCapture(() => this.startSessionInternal(config));
  }

  private async startSessionInternal(
    config: StartCaptureSessionClientConfig
  ): Promise<void> {
    if (this.currentSessionId || this.localRecordingId)
      throw new Error('A recording is already active');
    if (!this.sessionToken)
      throw new Error('sessionToken is required for session-backed capture');
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

    if (this.shuttingDown) throw new Error('CaptureClient is shutting down');

    const channels = config.channels.map(channel => ({
      channel_id:
        (channel as { channel_id?: string }).channel_id ?? channel.channelId,
      type: channel.type,
      store: channel.store ?? true,
      is_primary: channel.isPrimary ?? false,
    }));

    if (channels.some(ch => !ch.channel_id)) {
      throw new Error('channels must include channelId for each channel');
    }

    this.currentSessionId = config.sessionId;
    // macOS video capture creates a local recording; Windows/audio-only retain legacy behavior.
    if (
      process.platform === 'darwin' &&
      config.channels.some(ch => ch.type === 'video')
    ) {
      this.pendingSessions.add(config.sessionId);
      this.outcomes.delete(`session:${config.sessionId}`);
    }

    const primaryVideo =
      channels.find(ch => ch.is_primary && ch.type === 'video') ||
      channels.find(ch => ch.type === 'video');

    try {
      await this.binaryManager.sendCommand(
        'startRecording',
        {
          uploadToken: this.sessionToken,
          sessionId: config.sessionId,
          channels,
          ...(primaryVideo
            ? { primary_video_channel_id: primaryVideo.channel_id }
            : {}),
        },
        310_000
      );
    } catch (error) {
      this.currentSessionId = null;
      this.pendingSessions.delete(config.sessionId);
      throw error;
    }
  }

  /**
   * Stop the current capture session
   */
  public stopSession(): Promise<void> {
    return this.serializeCapture(() => this.stopSessionInternal());
  }

  private async stopSessionInternal(): Promise<void> {
    if (this.localRecordingId)
      throw new Error('Use stopLocalRecording for standalone capture');
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

    await this.binaryManager.sendCommand(
      'stopRecording',
      {
        sessionId: this.currentSessionId,
      },
      155_000
    );

    this.currentSessionId = null;
  }

  /**
   * Pause specific tracks
   * @param tracks - Array of track types to pause
   */
  public pauseTracks(tracks: TrackTypeValue[]): Promise<void> {
    return this.serializeCapture(() => this.pauseTracksInternal(tracks));
  }

  private async pauseTracksInternal(tracks: TrackTypeValue[]): Promise<void> {
    if (this.shuttingDown) throw new Error('CaptureClient is shutting down');
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
  public resumeTracks(tracks: TrackTypeValue[]): Promise<void> {
    return this.serializeCapture(() => this.resumeTracksInternal(tracks));
  }

  private async resumeTracksInternal(tracks: TrackTypeValue[]): Promise<void> {
    if (this.shuttingDown) throw new Error('CaptureClient is shutting down');
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
  public async shutdown(options: CaptureShutdownOptions = {}): Promise<void> {
    if (this.shuttingDown) throw new Error('Shutdown already in progress');
    this.shuttingDown = true;
    try {
      await this.captureOperations;
      if (this.initialization) await this.initialization;
      if (!this.isInitialized) {
        await this.binaryManager.stop();
        return;
      }
      if (this.localRecordingId) await this.stopLocalRecording();
      if (options.waitForProcessing !== false) {
        if (this.currentSessionId) await this.stopSession();
        for (const sessionId of this.pendingSessions) {
          await this.waitForProcessing({
            sessionId,
            timeoutMs: options.timeoutMs,
          });
        }
        for (const recordingId of this.pendingRecordings) {
          await this.waitForProcessing({
            recordingId,
            timeoutMs: options.timeoutMs,
          });
        }
      }
      this.suspending = true;
      this.lifecycleGeneration++;
      await this.binaryManager.stop();
      this.isInitialized = false;
      this.currentSessionId = null;
      this.pendingSessions.clear();
      this.pendingRecordings.clear();
    } finally {
      this.shuttingDown = false;
      this.suspending = false;
    }
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
    return this.currentSessionId !== null || this.localRecordingId !== null;
  }
}
