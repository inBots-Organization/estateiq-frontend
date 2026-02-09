'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AVSlide } from '@/lib/api/ai-teacher.api';
import { cn } from '@/lib/utils';

interface SlideRendererProps {
  slide: AVSlide | null;
  isPlaying: boolean;
  language?: 'ar' | 'en';
  className?: string;
}

export function SlideRenderer({
  slide,
  isPlaying,
  language = 'ar',
  className,
}: SlideRendererProps) {
  if (!slide) {
    return (
      <div className={cn(
        'flex items-center justify-center h-full',
        'bg-gradient-to-br from-slate-900/50 to-slate-800/50',
        'rounded-xl border border-white/10',
        className
      )}>
        <p className="text-slate-400 text-lg">No slide selected</p>
      </div>
    );
  }

  const title = language === 'ar' && slide.titleAr ? slide.titleAr : slide.title;
  const bulletPoints = language === 'ar' && slide.bulletPointsAr
    ? slide.bulletPointsAr
    : slide.bulletPoints;

  return (
    <div className={cn(
      'relative h-full p-8 overflow-hidden',
      'bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-violet-900/30',
      'backdrop-blur-xl rounded-xl border border-white/10',
      language === 'ar' ? 'rtl text-right' : 'ltr text-left',
      className
    )}>
      {/* Slide Number Badge */}
      <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium">
        {slide.slideNumber}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full flex flex-col justify-center"
        >
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, x: language === 'ar' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-8"
          >
            {title}
          </motion.h2>

          {/* Bullet Points */}
          <div className="space-y-4">
            {bulletPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: language === 'ar' ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {index + 1}
                </span>
                <p className="text-lg md:text-xl text-slate-200 leading-relaxed pt-1">
                  {point}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Visual Type Indicator */}
          {slide.visualType !== 'bullets' && (
            <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-slate-400 text-sm">
                {slide.visualType === 'diagram' && 'رسم توضيحي'}
                {slide.visualType === 'chart' && 'رسم بياني'}
                {slide.visualType === 'image' && 'صورة'}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Playing Indicator */}
      {isPlaying && (
        <motion.div
          className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-4 bg-violet-400 rounded-full"
                animate={{
                  scaleY: [1, 1.5, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
          <span className="text-violet-300 text-sm">جاري التشغيل</span>
        </motion.div>
      )}
    </div>
  );
}
