'use client';

import { motion } from 'framer-motion';
import { AVSlide } from '@/lib/api/ai-teacher.api';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SlideNavigatorProps {
  slides: AVSlide[];
  currentSlide: number;
  onSlideClick: (index: number) => void;
  language?: 'ar' | 'en';
  className?: string;
}

export function SlideNavigator({
  slides,
  currentSlide,
  onSlideClick,
  language = 'ar',
  className,
}: SlideNavigatorProps) {
  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      'w-64 h-full overflow-y-auto py-4 px-2',
      'bg-slate-900/50 backdrop-blur-sm',
      'border-r border-white/10 rtl:border-r-0 rtl:border-l',
      className
    )}>
      <h3 className="text-sm font-medium text-slate-400 mb-4 px-2">
        {language === 'ar' ? 'الشرائح' : 'Slides'} ({slides.length})
      </h3>

      <div className="space-y-2">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const isPast = index < currentSlide;
          const title = language === 'ar' && slide.titleAr ? slide.titleAr : slide.title;

          return (
            <motion.button
              key={slide.id}
              onClick={() => onSlideClick(index)}
              className={cn(
                'w-full p-3 rounded-lg text-right rtl:text-right ltr:text-left',
                'transition-all duration-200',
                'border',
                isActive
                  ? 'bg-violet-500/20 border-violet-500/50 text-white'
                  : isPast
                    ? 'bg-slate-800/50 border-slate-700/50 text-slate-300'
                    : 'bg-slate-800/30 border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                {/* Slide Number / Check */}
                <div className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  isActive
                    ? 'bg-violet-500 text-white'
                    : isPast
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                )}>
                  {isPast ? <Check className="w-3 h-3" /> : index + 1}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    isActive ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-400'
                  )}>
                    {title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDuration(slide.duration)}
                  </p>
                </div>
              </div>

              {/* Progress Indicator for Active Slide */}
              {isActive && (
                <motion.div
                  className="mt-2 h-1 rounded-full bg-slate-700 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                    animate={{
                      width: '100%',
                    }}
                    transition={{
                      duration: slide.duration,
                      ease: 'linear',
                    }}
                  />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}د ${secs}ث`;
  }
  return `${secs}ث`;
}
