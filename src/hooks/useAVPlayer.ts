'use client';

import { useState, useRef, useEffect, useCallback, MutableRefObject } from 'react';
import { AVContentWithSlides, AVSlide } from '@/lib/api/ai-teacher.api';

export interface AVPlayerState {
  currentSlide: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  isAudioReady: boolean;
}

export interface AVPlayerControls {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  goToSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

export interface UseAVPlayerReturn extends AVPlayerState, AVPlayerControls {
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  content: AVContentWithSlides | null;
  currentSlideData: AVSlide | null;
  progress: number; // 0-100
  formattedCurrentTime: string;
  formattedDuration: string;
}

/**
 * Custom hook for managing AV content playback
 * Syncs audio playback with slide transitions
 */
export function useAVPlayer(
  content: AVContentWithSlides | null,
  externalAudioRef?: MutableRefObject<HTMLAudioElement | null>
): UseAVPlayerReturn {
  // Use external ref if provided, otherwise create internal one
  const internalAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioRef = externalAudioRef || internalAudioRef;

  // State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('[useAVPlayer] Content changed:', {
      hasContent: !!content,
      hasAudioUrl: !!content?.audioUrl,
      audioUrlLength: content?.audioUrl?.length || 0,
      audioUrlPrefix: content?.audioUrl?.substring(0, 50),
      slidesCount: content?.slides?.length || 0,
      status: content?.status,
    });
  }, [content]);

  // Sync slide with audio time
  useEffect(() => {
    if (!content?.slides || content.slides.length === 0) return;

    // Find slide that contains current time
    const slideIndex = content.slides.findIndex((slide) => {
      const startTime = Number(slide.audioStartTime) || 0;
      const endTime = Number(slide.audioEndTime) || 0;
      return currentTime >= startTime && currentTime < endTime;
    });

    if (slideIndex !== -1 && slideIndex !== currentSlide) {
      console.log('[useAVPlayer] Slide changed:', { from: currentSlide, to: slideIndex, currentTime });
      setCurrentSlide(slideIndex);
    }
  }, [currentTime, content?.slides, currentSlide]);

  // Audio event handlers - reattach when audioRef changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.log('[useAVPlayer] No audio element ref available');
      return;
    }

    console.log('[useAVPlayer] Setting up audio event listeners on element:', audio);

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      console.log('[useAVPlayer] Audio metadata loaded:', {
        duration: audio.duration,
        readyState: audio.readyState,
      });
      setDuration(audio.duration);
      setIsLoading(false);
      setIsAudioReady(true);
    };

    const handleLoadedData = () => {
      console.log('[useAVPlayer] Audio data loaded, readyState:', audio.readyState);
      setIsLoading(false);
      setIsAudioReady(true);
    };

    const handleCanPlayThrough = () => {
      console.log('[useAVPlayer] Can play through');
      setIsLoading(false);
      setIsAudioReady(true);
    };

    const handlePlay = () => {
      console.log('[useAVPlayer] Audio playing');
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('[useAVPlayer] Audio paused');
      setIsPlaying(false);
    };

    const handleEnded = () => {
      console.log('[useAVPlayer] Audio ended');
      setIsPlaying(false);
      setCurrentSlide(0);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      const audioEl = e.target as HTMLAudioElement;
      const errorCode = audioEl.error?.code;
      const errorMessage = audioEl.error?.message || 'Unknown error';
      console.error('[useAVPlayer] Audio error:', { errorCode, errorMessage, e });
      setError(`فشل تحميل الصوت: ${errorMessage}`);
      setIsLoading(false);
      setIsAudioReady(false);
    };

    const handleWaiting = () => {
      console.log('[useAVPlayer] Audio waiting/buffering');
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      console.log('[useAVPlayer] Audio can play');
      setIsLoading(false);
      setIsAudioReady(true);
    };

    const handleLoadStart = () => {
      console.log('[useAVPlayer] Audio load started');
      setIsLoading(true);
    };

    const handleDurationChange = () => {
      console.log('[useAVPlayer] Duration changed:', audio.duration);
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('durationchange', handleDurationChange);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('durationchange', handleDurationChange);
    };
  }, [audioRef.current]); // Re-run when the actual audio element changes

  // Set audio source when content changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.log('[useAVPlayer] Cannot set source - no audio element');
      return;
    }

    if (!content?.audioUrl) {
      console.log('[useAVPlayer] No audio URL in content');
      setError('لا يوجد ملف صوتي');
      setIsLoading(false);
      return;
    }

    console.log('[useAVPlayer] Setting audio source, URL type:',
      content.audioUrl.startsWith('data:') ? 'data URL' : 'regular URL',
      'length:', content.audioUrl.length
    );

    setIsLoading(true);
    setError(null);
    setCurrentSlide(0);
    setCurrentTime(0);
    setIsAudioReady(false);

    // Set source and load
    audio.src = content.audioUrl;
    audio.load();

    // For data URLs, set fallback duration from content
    if (content.audioUrl.startsWith('data:') && content.totalDuration) {
      console.log('[useAVPlayer] Data URL detected, setting fallback duration:', content.totalDuration);
      setDuration(content.totalDuration);
    }
  }, [content?.audioUrl, content?.totalDuration, audioRef.current]);

  // Controls
  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.error('[useAVPlayer] Cannot play - no audio element');
      return;
    }

    console.log('[useAVPlayer] Attempting to play, readyState:', audio.readyState, 'src:', audio.src?.substring(0, 50));

    audio.play().then(() => {
      console.log('[useAVPlayer] Play started successfully');
    }).catch((err) => {
      console.error('[useAVPlayer] Play error:', err);
      // Check if it's an autoplay policy issue
      if (err.name === 'NotAllowedError') {
        setError('اضغط للتشغيل - المتصفح يتطلب تفاعل المستخدم');
      } else {
        setError(`فشل التشغيل: ${err.message}`);
      }
    });
  }, [audioRef]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
  }, [audioRef]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      const maxDuration = duration || audio.duration || content?.totalDuration || 0;
      const safeTime = Math.max(0, Math.min(time, maxDuration));
      console.log('[useAVPlayer] Seeking to:', safeTime);
      audio.currentTime = safeTime;
      setCurrentTime(safeTime);
    }
  }, [duration, content?.totalDuration, audioRef]);

  const goToSlide = useCallback((index: number) => {
    if (!content?.slides) return;

    const slide = content.slides[index];
    if (slide) {
      const startTime = Number(slide.audioStartTime) || 0;
      console.log('[useAVPlayer] Going to slide:', { index, startTime });
      seekTo(startTime);
      setCurrentSlide(index);
    }
  }, [content?.slides, seekTo]);

  const nextSlide = useCallback(() => {
    if (!content?.slides) return;
    const nextIndex = Math.min(currentSlide + 1, content.slides.length - 1);
    goToSlide(nextIndex);
  }, [content?.slides, currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    const prevIndex = Math.max(currentSlide - 1, 0);
    goToSlide(prevIndex);
  }, [currentSlide, goToSlide]);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (audio) {
      const clampedVol = Math.max(0, Math.min(1, vol));
      audio.volume = clampedVol;
      setVolumeState(clampedVol);
      if (clampedVol > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  }, [isMuted, audioRef]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted, audioRef]);

  // Computed values
  const currentSlideData = content?.slides?.[currentSlide] || null;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    // State
    currentSlide,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    error,
    isAudioReady,

    // Controls
    play,
    pause,
    togglePlay,
    seekTo,
    goToSlide,
    nextSlide,
    prevSlide,
    setVolume,
    toggleMute,

    // Refs and computed
    audioRef,
    content,
    currentSlideData,
    progress,
    formattedCurrentTime: formatTime(currentTime),
    formattedDuration: formatTime(duration),
  };
}

// Keyboard shortcuts hook
export function useAVPlayerKeyboard(player: UseAVPlayerReturn) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          player.togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            player.nextSlide();
          } else {
            player.seekTo(player.currentTime + 10);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            player.prevSlide();
          } else {
            player.seekTo(player.currentTime - 10);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          player.setVolume(player.volume + 0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          player.setVolume(player.volume - 0.1);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          player.toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player]);
}
