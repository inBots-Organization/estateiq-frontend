'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Headphones, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GenerateAVButtonsProps {
  onGenerateLecture: () => Promise<void>;
  onGenerateSummary: () => Promise<void>;
  disabled?: boolean;
  language?: 'ar' | 'en';
  className?: string;
}

export function GenerateAVButtons({
  onGenerateLecture,
  onGenerateSummary,
  disabled = false,
  language = 'ar',
  className,
}: GenerateAVButtonsProps) {
  const [isGeneratingLecture, setIsGeneratingLecture] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleGenerateLecture = async () => {
    if (isGeneratingLecture || isGeneratingSummary || disabled) return;
    setIsGeneratingLecture(true);
    try {
      await onGenerateLecture();
    } finally {
      setIsGeneratingLecture(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (isGeneratingLecture || isGeneratingSummary || disabled) return;
    setIsGeneratingSummary(true);
    try {
      await onGenerateSummary();
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const isGenerating = isGeneratingLecture || isGeneratingSummary;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
        <Sparkles className="h-4 w-4 text-violet-400" />
        <span>{language === 'ar' ? 'محتوى مرئي ذكي' : 'AI Visual Content'}</span>
      </div>

      {/* Generate Lecture Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleGenerateLecture}
          disabled={isGenerating || disabled}
          className={cn(
            'w-full h-12 relative overflow-hidden',
            'bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600',
            'hover:from-violet-500 hover:via-purple-500 hover:to-violet-500',
            'text-white font-medium',
            'shadow-lg shadow-violet-500/25',
            'border border-violet-400/20',
            'transition-all duration-300',
            isGeneratingLecture && 'animate-pulse'
          )}
        >
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Content */}
          <span className="relative flex items-center justify-center gap-2">
            {isGeneratingLecture ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{language === 'ar' ? 'جاري الإنشاء...' : 'Generating...'}</span>
              </>
            ) : (
              <>
                <Video className="h-5 w-5" />
                <span>{language === 'ar' ? 'إنشاء محاضرة فيديو' : 'Generate Video Lecture'}</span>
              </>
            )}
          </span>
        </Button>
      </motion.div>

      {/* Generate Summary Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleGenerateSummary}
          disabled={isGenerating || disabled}
          variant="outline"
          className={cn(
            'w-full h-11',
            'border-violet-500/30 bg-violet-500/5',
            'hover:bg-violet-500/10 hover:border-violet-500/50',
            'text-violet-300 hover:text-violet-200',
            'transition-all duration-200',
            isGeneratingSummary && 'animate-pulse'
          )}
        >
          {isGeneratingSummary ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>{language === 'ar' ? 'جاري الإنشاء...' : 'Generating...'}</span>
            </>
          ) : (
            <>
              <Headphones className="h-4 w-4 mr-2" />
              <span>{language === 'ar' ? 'ملخص صوتي تفاعلي' : 'Interactive Audio Summary'}</span>
            </>
          )}
        </Button>
      </motion.div>

      {/* Helper Text */}
      <p className="text-xs text-slate-500 text-center">
        {language === 'ar'
          ? 'المحتوى يتكيف مع نقاط ضعفك تلقائياً'
          : 'Content adapts to your weak areas automatically'}
      </p>
    </div>
  );
}
