/**
 * Global Audio Manager - Singleton pattern
 * Prevents audio overlap by managing a single audio instance globally
 */

type AudioState = 'idle' | 'loading' | 'playing' | 'paused';

interface AudioManagerEvents {
  onStateChange?: (state: AudioState) => void;
  onError?: (error: Error) => void;
}

class AudioManager {
  private static instance: AudioManager | null = null;
  private audio: HTMLAudioElement | null = null;
  private currentAudioId: string | null = null;
  private state: AudioState = 'idle';
  private isPageVisible: boolean = true;
  private events: AudioManagerEvents = {};
  private abortController: AbortController | null = null;

  private constructor() {
    // Setup visibility change listener
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('beforeunload', this.cleanup);
      window.addEventListener('pagehide', this.cleanup);
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private handleVisibilityChange = () => {
    this.isPageVisible = !document.hidden;
    if (document.hidden) {
      // Stop audio immediately when page is hidden
      this.stop();
    }
  };

  setEvents(events: AudioManagerEvents) {
    this.events = events;
  }

  private setState(newState: AudioState) {
    this.state = newState;
    this.events.onStateChange?.(newState);
  }

  getState(): AudioState {
    return this.state;
  }

  isPlaying(): boolean {
    return this.state === 'playing';
  }

  getCurrentAudioId(): string | null {
    return this.currentAudioId;
  }

  /**
   * Play audio from base64 string
   * Automatically stops any currently playing audio
   */
  async play(base64Audio: string, audioId?: string): Promise<boolean> {
    // Check if page is visible
    if (!this.isPageVisible || document.hidden) {
      console.log('[AudioManager] Blocked: page not visible');
      return false;
    }

    const newAudioId = audioId || `audio-${Date.now()}`;

    // If same audio is already playing, do nothing
    if (this.currentAudioId === newAudioId && this.state === 'playing') {
      console.log('[AudioManager] Same audio already playing');
      return true;
    }

    // Stop any currently playing audio
    this.stop();

    // Double-check visibility after stop
    if (document.hidden) {
      return false;
    }

    this.currentAudioId = newAudioId;
    this.setState('loading');

    try {
      // Create new audio element
      this.audio = new Audio();

      // Setup abort controller for cancellation
      this.abortController = new AbortController();

      // Setup event handlers BEFORE setting src
      const playPromise = new Promise<boolean>((resolve, reject) => {
        if (!this.audio) {
          reject(new Error('Audio element not created'));
          return;
        }

        this.audio.oncanplaythrough = () => {
          if (document.hidden || this.currentAudioId !== newAudioId) {
            this.cleanup();
            resolve(false);
            return;
          }

          this.audio?.play()
            .then(() => {
              this.setState('playing');
              resolve(true);
            })
            .catch((err) => {
              this.cleanup();
              reject(err);
            });
        };

        this.audio.onended = () => {
          if (this.currentAudioId === newAudioId) {
            this.cleanup();
          }
        };

        this.audio.onerror = (e) => {
          this.cleanup();
          reject(new Error('Audio playback error'));
        };

        // Timeout for slow loading
        setTimeout(() => {
          if (this.state === 'loading' && this.currentAudioId === newAudioId) {
            this.cleanup();
            reject(new Error('Audio loading timeout'));
          }
        }, 30000);
      });

      // Set the source
      this.audio.src = `data:audio/mp3;base64,${base64Audio}`;
      this.audio.load();

      return await playPromise;
    } catch (error) {
      console.error('[AudioManager] Play error:', error);
      this.cleanup();
      this.events.onError?.(error instanceof Error ? error : new Error('Unknown error'));
      return false;
    }
  }

  /**
   * Stop any currently playing audio
   */
  stop() {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.oncanplaythrough = null;
        this.audio.onended = null;
        this.audio.onerror = null;
        this.audio.src = '';
        this.audio.load();
      } catch {
        // Ignore cleanup errors
      }
      this.audio = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.currentAudioId = null;
    this.setState('idle');
  }

  /**
   * Pause currently playing audio
   */
  pause() {
    if (this.audio && this.state === 'playing') {
      this.audio.pause();
      this.setState('paused');
    }
  }

  /**
   * Resume paused audio
   */
  resume() {
    if (this.audio && this.state === 'paused' && this.isPageVisible) {
      this.audio.play().catch(() => {
        this.cleanup();
      });
      this.setState('playing');
    }
  }

  /**
   * Cleanup resources
   */
  cleanup = () => {
    this.stop();
  };

  /**
   * Destroy the singleton instance (for testing or app unmount)
   */
  static destroy() {
    if (AudioManager.instance) {
      AudioManager.instance.cleanup();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', AudioManager.instance.handleVisibilityChange);
        window.removeEventListener('beforeunload', AudioManager.instance.cleanup);
        window.removeEventListener('pagehide', AudioManager.instance.cleanup);
      }
      AudioManager.instance = null;
    }
  }
}

// Export singleton instance getter
export const getAudioManager = () => AudioManager.getInstance();

// Export for cleanup on app unmount
export const destroyAudioManager = () => AudioManager.destroy();

// React hook for using audio manager
export function useAudioManager() {
  const manager = getAudioManager();

  return {
    play: (base64: string, id?: string) => manager.play(base64, id),
    stop: () => manager.stop(),
    pause: () => manager.pause(),
    resume: () => manager.resume(),
    isPlaying: () => manager.isPlaying(),
    getState: () => manager.getState(),
    getCurrentAudioId: () => manager.getCurrentAudioId(),
    setEvents: (events: AudioManagerEvents) => manager.setEvents(events),
  };
}
