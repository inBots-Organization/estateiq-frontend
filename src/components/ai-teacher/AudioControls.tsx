'use client';

import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { UseAVPlayerReturn } from '@/hooks/useAVPlayer';

interface AudioControlsProps {
  player: UseAVPlayerReturn;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  language?: 'ar' | 'en';
  className?: string;
}

export function AudioControls({
  player,
  onFullscreen,
  isFullscreen,
  language = 'ar',
  className,
}: AudioControlsProps) {
  const {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    progress,
    formattedCurrentTime,
    formattedDuration,
    togglePlay,
    seekTo,
    prevSlide,
    nextSlide,
    setVolume,
    toggleMute,
    content,
    currentSlide,
  } = player;

  const totalSlides = content?.slides?.length || 0;

  return (
    <div className={cn(
      'w-full px-6 py-4',
      'bg-gradient-to-t from-slate-900/90 via-slate-900/70 to-transparent',
      'backdrop-blur-sm',
      className
    )}>
      {/* Progress Bar */}
      <div className="mb-4">
        <div
          className="relative h-1.5 bg-slate-700/50 rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            seekTo(pos * duration);
          }}
        >
          {/* Buffered */}
          <div
            className="absolute top-0 left-0 h-full bg-slate-600/50 rounded-full"
            style={{ width: '100%' }}
          />

          {/* Progress */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
            style={{ width: `${progress}%` }}
          />

          {/* Hover Indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 8px)` }}
          />

          {/* Slide Markers */}
          {content?.slides?.map((slide, index) => {
            const markerPos = (slide.audioStartTime / duration) * 100;
            return (
              <div
                key={slide.id}
                className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-white/30 rounded-full"
                style={{ left: `${markerPos}%` }}
                title={`Slide ${index + 1}`}
              />
            );
          })}
        </div>

        {/* Time Display */}
        <div className="flex justify-between items-center mt-2 text-sm text-slate-400">
          <span>{formattedCurrentTime}</span>
          <span>
            {language === 'ar' ? 'الشريحة' : 'Slide'} {currentSlide + 1} / {totalSlides}
          </span>
          <span>{formattedDuration}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between">
        {/* Left: Volume */}
        <div className="flex items-center gap-3 w-48">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-slate-300 hover:text-white hover:bg-white/10"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>

          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={([val]) => setVolume(val / 100)}
            className="w-24"
          />
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30"
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            onClick={togglePlay}
            disabled={isLoading}
            className={cn(
              'w-14 h-14 rounded-full',
              'bg-gradient-to-r from-violet-500 to-purple-500',
              'hover:from-violet-400 hover:to-purple-400',
              'text-white shadow-lg shadow-violet-500/25',
              'transition-all duration-200'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            disabled={currentSlide >= totalSlides - 1}
            className="text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Right: Fullscreen */}
        <div className="flex items-center gap-3 w-48 justify-end">
          {onFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onFullscreen}
              className="text-slate-300 hover:text-white hover:bg-white/10"
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-4 flex justify-center gap-6 text-xs text-slate-500">
        <span>Space: {language === 'ar' ? 'تشغيل/إيقاف' : 'Play/Pause'}</span>
        <span>{language === 'ar' ? 'الأسهم' : 'Arrows'}: {language === 'ar' ? 'تقديم/ترجيع' : 'Seek'}</span>
        <span>Shift + {language === 'ar' ? 'الأسهم' : 'Arrows'}: {language === 'ar' ? 'التنقل بين الشرائح' : 'Change Slide'}</span>
        <span>M: {language === 'ar' ? 'كتم' : 'Mute'}</span>
      </div>
    </div>
  );
}
