/**
 * Global Audio Manager - Singleton pattern
 * Prevents audio overlap by managing a single audio instance globally
 *
 * CRITICAL: This module uses a true singleton pattern to prevent
 * infinite re-renders in React components.
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
  private initialized: boolean = false;

  private constructor() {
    // Setup visibility change listener only once
    if (typeof document !== 'undefined' && !this.initialized) {
      this.initialized = true;
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
    if (this.state !== newState) {
      this.state = newState;
      this.events.onStateChange?.(newState);
    }
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
  play(base64Audio: string, audioId?: string): void {
    // Check if page is visible
    if (!this.isPageVisible || (typeof document !== 'undefined' && document.hidden)) {
      console.log('[AudioManager] Blocked: page not visible');
      return;
    }

    const newAudioId = audioId || `audio-${Date.now()}`;

    // If same audio is already playing, do nothing
    if (this.currentAudioId === newAudioId && this.state === 'playing') {
      console.log('[AudioManager] Same audio already playing');
      return;
    }

    // Stop any currently playing audio FIRST
    this.stop();

    // Double-check visibility after stop
    if (typeof document !== 'undefined' && document.hidden) {
      return;
    }

    this.currentAudioId = newAudioId;
    this.setState('loading');

    try {
      // Create new audio element
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      this.audio = audio;

      audio.oncanplaythrough = () => {
        if (typeof document !== 'undefined' && document.hidden) {
          this.cleanup();
          return;
        }
        if (this.currentAudioId !== newAudioId) {
          return;
        }

        audio.play()
          .then(() => {
            this.setState('playing');
          })
          .catch(() => {
            this.cleanup();
          });
      };

      audio.onended = () => {
        if (this.currentAudioId === newAudioId) {
          this.currentAudioId = null;
          this.audio = null;
          this.setState('idle');
        }
      };

      audio.onerror = () => {
        this.cleanup();
        this.events.onError?.(new Error('Audio playback error'));
      };

      audio.load();
    } catch (error) {
      console.error('[AudioManager] Play error:', error);
      this.cleanup();
      this.events.onError?.(error instanceof Error ? error : new Error('Unknown error'));
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
      } catch {
        // Ignore cleanup errors
      }
      this.audio = null;
    }

    this.currentAudioId = null;
    this.setState('idle');
  }

  /**
   * Cleanup resources
   */
  cleanup = () => {
    this.stop();
  };

  /**
   * Destroy the singleton instance
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

// Create singleton instance immediately
let audioManagerInstance: AudioManager | null = null;

/**
 * Get the singleton AudioManager instance
 * This is stable and won't cause re-renders
 */
export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = AudioManager.getInstance();
  }
  return audioManagerInstance;
}

// Export cleanup function
export const destroyAudioManager = () => AudioManager.destroy();

/**
 * STABLE React hook for AudioManager
 * Returns the SAME object reference every time to prevent infinite loops
 */
const stableAudioManagerHook = {
  play: (base64: string, id?: string) => getAudioManager().play(base64, id),
  stop: () => getAudioManager().stop(),
  isPlaying: () => getAudioManager().isPlaying(),
  getState: () => getAudioManager().getState(),
  getCurrentAudioId: () => getAudioManager().getCurrentAudioId(),
  setEvents: (events: AudioManagerEvents) => getAudioManager().setEvents(events),
};

export function useAudioManager() {
  // Return the SAME stable object every time - prevents infinite loops
  return stableAudioManagerHook;
}
