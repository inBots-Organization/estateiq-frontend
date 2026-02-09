'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  audioRef: React.RefObject<HTMLAudioElement>;
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
export function useAVPlayer(content: AVContentWithSlides | null): UseAVPlayerReturn {
  const audioRef = useRef<HTMLAudioElement>(null);

  // State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync slide with audio time
  useEffect(() => {
    if (!content?.slides || content.slides.length === 0) return;

    const slideIndex = content.slides.findIndex(
      (slide) => currentTime >= slide.audioStartTime && currentTime < slide.audioEndTime
    );

    if (slideIndex !== -1 && slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }
  }, [currentTime, content?.slides, currentSlide]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentSlide(0);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setError('Failed to load audio');
      setIsLoading(false);
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Set audio source when content changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !content?.audioUrl) return;

    setIsLoading(true);
    setError(null);
    setCurrentSlide(0);
    setCurrentTime(0);

    audio.src = content.audioUrl;
    audio.load();
  }, [content?.audioUrl]);

  // Controls
  const play = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch((err) => {
        console.error('Play error:', err);
        setError('Failed to play audio');
      });
    }
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
  }, []);

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
      audio.currentTime = Math.max(0, Math.min(time, duration));
    }
  }, [duration]);

  const goToSlide = useCallback((index: number) => {
    if (!content?.slides) return;

    const slide = content.slides[index];
    if (slide) {
      seekTo(slide.audioStartTime);
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
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Computed values
  const currentSlideData = content?.slides?.[currentSlide] || null;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number): string => {
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
