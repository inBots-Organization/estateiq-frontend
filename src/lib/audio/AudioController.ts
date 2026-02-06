/**
 * AudioController - Production-grade single-playback audio manager
 *
 * GUARANTEES:
 * 1. Only ONE audio stream can play at any time
 * 2. Starting new audio INSTANTLY cancels previous audio
 * 3. Smooth fade-in/fade-out transitions
 * 4. Memory-safe cleanup of audio resources
 * 5. Event callbacks for state changes
 *
 * Based on best practices from:
 * - ElevenLabs latency optimization docs
 * - WebRTC audio handling patterns
 */

export interface AudioControllerConfig {
  fadeInDuration?: number;      // ms for fade-in
  fadeOutDuration?: number;     // ms for fade-out
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  onPlaybackInterrupted?: () => void;
  onError?: (error: Error) => void;
}

interface AudioState {
  audioContext: AudioContext | null;
  currentSource: AudioBufferSourceNode | null;
  currentGain: GainNode | null;
  currentAudioId: string | null;
  isPlaying: boolean;
  audioQueue: Array<{ id: string; buffer: AudioBuffer }>;
}

export class AudioController {
  private state: AudioState = {
    audioContext: null,
    currentSource: null,
    currentGain: null,
    currentAudioId: null,
    isPlaying: false,
    audioQueue: [],
  };

  private config: Required<AudioControllerConfig>;
  private playbackPromiseResolve: (() => void) | null = null;

  constructor(config: AudioControllerConfig = {}) {
    this.config = {
      fadeInDuration: config.fadeInDuration ?? 50,
      fadeOutDuration: config.fadeOutDuration ?? 30,
      onPlaybackStart: config.onPlaybackStart ?? (() => {}),
      onPlaybackEnd: config.onPlaybackEnd ?? (() => {}),
      onPlaybackInterrupted: config.onPlaybackInterrupted ?? (() => {}),
      onError: config.onError ?? ((e) => console.error('[AudioController]', e)),
    };
  }

  /**
   * Initialize or get AudioContext
   */
  private async getAudioContext(): Promise<AudioContext> {
    if (!this.state.audioContext || this.state.audioContext.state === 'closed') {
      this.state.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Resume if suspended (browser autoplay policy)
    if (this.state.audioContext.state === 'suspended') {
      await this.state.audioContext.resume();
    }

    return this.state.audioContext;
  }

  /**
   * HARD STOP - Immediately cancel ALL audio playback
   * This is the core guarantee: instant cancellation
   */
  public hardStop(): void {
    const { currentSource, currentGain, audioContext } = this.state;

    if (currentSource) {
      try {
        // Immediate stop - no fade
        currentSource.stop(0);
        currentSource.disconnect();
      } catch (e) {
        // Already stopped
      }
    }

    if (currentGain) {
      try {
        currentGain.disconnect();
      } catch (e) {
        // Already disconnected
      }
    }

    // Clear queue
    this.state.audioQueue = [];

    // Reset state
    this.state.currentSource = null;
    this.state.currentGain = null;
    this.state.currentAudioId = null;
    this.state.isPlaying = false;

    // Resolve any pending playback promise
    if (this.playbackPromiseResolve) {
      this.playbackPromiseResolve();
      this.playbackPromiseResolve = null;
    }

    this.config.onPlaybackInterrupted();
  }

  /**
   * Soft stop with fade-out
   */
  public async softStop(): Promise<void> {
    const { currentGain, audioContext } = this.state;

    if (!currentGain || !audioContext || !this.state.isPlaying) {
      return;
    }

    // Fade out
    const now = audioContext.currentTime;
    currentGain.gain.setValueAtTime(currentGain.gain.value, now);
    currentGain.gain.linearRampToValueAtTime(0, now + this.config.fadeOutDuration / 1000);

    // Wait for fade then hard stop
    await new Promise(resolve => setTimeout(resolve, this.config.fadeOutDuration));
    this.hardStop();
  }

  /**
   * Play audio from base64 string
   * GUARANTEE: Any previous audio is stopped first
   */
  public async playBase64(base64Audio: string, audioId?: string): Promise<boolean> {
    const id = audioId ?? `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // STEP 1: Always hard stop any existing playback first
    this.hardStop();

    try {
      const audioContext = await this.getAudioContext();

      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer.slice(0));

      // Check if we should still play (might have been cancelled during decode)
      if (this.state.currentAudioId !== null && this.state.currentAudioId !== id) {
        return false;
      }

      return this.playBuffer(audioBuffer, id);
    } catch (error) {
      this.config.onError(error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Play AudioBuffer directly
   */
  public async playBuffer(buffer: AudioBuffer, audioId?: string): Promise<boolean> {
    const id = audioId ?? `audio_${Date.now()}`;

    // STEP 1: Always hard stop any existing playback first
    this.hardStop();

    try {
      const audioContext = await this.getAudioContext();

      // Create source
      const source = audioContext.createBufferSource();
      source.buffer = buffer;

      // Create gain for fade effects
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);

      // Connect: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Update state
      this.state.currentSource = source;
      this.state.currentGain = gainNode;
      this.state.currentAudioId = id;
      this.state.isPlaying = true;

      // Create promise for playback completion
      const playbackPromise = new Promise<void>((resolve) => {
        this.playbackPromiseResolve = resolve;

        source.onended = () => {
          // Only handle if this is still the current audio
          if (this.state.currentAudioId === id) {
            this.state.currentSource = null;
            this.state.currentGain = null;
            this.state.currentAudioId = null;
            this.state.isPlaying = false;
            this.config.onPlaybackEnd();
          }
          resolve();
        };
      });

      // Fade in
      gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + this.config.fadeInDuration / 1000);

      // Start playback
      source.start(0);
      this.config.onPlaybackStart();

      // Wait for playback to complete
      await playbackPromise;
      return true;
    } catch (error) {
      this.state.isPlaying = false;
      this.config.onError(error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Queue audio for sequential playback
   */
  public async queueBase64(base64Audio: string, audioId?: string): Promise<void> {
    const id = audioId ?? `audio_${Date.now()}`;

    try {
      const audioContext = await this.getAudioContext();

      // Decode
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer.slice(0));

      // Add to queue
      this.state.audioQueue.push({ id, buffer: audioBuffer });

      // If not currently playing, start
      if (!this.state.isPlaying) {
        this.playNextInQueue();
      }
    } catch (error) {
      this.config.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Play next item in queue
   */
  private async playNextInQueue(): Promise<void> {
    if (this.state.audioQueue.length === 0) {
      return;
    }

    const next = this.state.audioQueue.shift()!;
    await this.playBuffer(next.buffer, next.id);

    // Play next if queue not empty
    if (this.state.audioQueue.length > 0) {
      this.playNextInQueue();
    }
  }

  /**
   * Check if currently playing
   */
  public get isPlaying(): boolean {
    return this.state.isPlaying;
  }

  /**
   * Get current audio ID
   */
  public get currentAudioId(): string | null {
    return this.state.currentAudioId;
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.hardStop();

    if (this.state.audioContext && this.state.audioContext.state !== 'closed') {
      this.state.audioContext.close().catch(() => {});
    }

    this.state.audioContext = null;
  }
}

// Singleton instance for app-wide use
let audioControllerInstance: AudioController | null = null;

export function getAudioController(config?: AudioControllerConfig): AudioController {
  if (!audioControllerInstance) {
    audioControllerInstance = new AudioController(config);
  }
  return audioControllerInstance;
}

export function resetAudioController(): void {
  if (audioControllerInstance) {
    audioControllerInstance.dispose();
    audioControllerInstance = null;
  }
}
