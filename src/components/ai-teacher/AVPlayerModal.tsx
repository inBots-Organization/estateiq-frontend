'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ThumbsUp, ThumbsDown, Star, Loader2, AlertCircle, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AVContentWithSlides, avContentApi } from '@/lib/api/ai-teacher.api';
import { useAVPlayer, useAVPlayerKeyboard } from '@/hooks/useAVPlayer';
import { SlideRenderer } from './SlideRenderer';
import { SlideNavigator } from './SlideNavigator';
import { AudioControls } from './AudioControls';
import { cn } from '@/lib/utils';

interface AVPlayerModalProps {
  contentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  language?: 'ar' | 'en';
}

export function AVPlayerModal({
  contentId,
  isOpen,
  onClose,
  language = 'ar',
}: AVPlayerModalProps) {
  const [content, setContent] = useState<AVContentWithSlides | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Create audio element ref and pass it to the hook
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pass the audioRef to the hook so it uses the same ref as the DOM element
  const player = useAVPlayer(content, audioRef);
  useAVPlayerKeyboard(player);

  // Load content when modal opens
  useEffect(() => {
    if (isOpen && contentId) {
      console.log('[AVPlayerModal] Loading content:', contentId);
      loadContent(contentId);
    }
  }, [isOpen, contentId]);

  // Show feedback prompt when lecture ends
  useEffect(() => {
    if (
      player.currentTime > 0 &&
      player.duration > 0 &&
      player.currentTime >= player.duration - 1 &&
      !feedbackSubmitted
    ) {
      setShowFeedback(true);
    }
  }, [player.currentTime, player.duration, feedbackSubmitted]);

  const loadContent = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[AVPlayerModal] Fetching content from API...');
      const data = await avContentApi.getContent(id);
      console.log('[AVPlayerModal] Content loaded:', {
        id: data.id,
        status: data.status,
        hasAudioUrl: !!data.audioUrl,
        audioUrlLength: data.audioUrl?.length || 0,
        audioUrlPrefix: data.audioUrl?.substring(0, 100),
        slidesCount: data.slides?.length || 0,
        slides: data.slides?.map(s => ({
          num: s.slideNumber,
          title: s.titleAr || s.title,
          start: s.audioStartTime,
          end: s.audioEndTime
        }))
      });

      if (!data.audioUrl) {
        console.error('[AVPlayerModal] No audio URL in response');
        setError(language === 'ar' ? 'لا يوجد ملف صوتي في المحتوى' : 'No audio file in content');
        return;
      }

      if (data.status !== 'ready') {
        console.error('[AVPlayerModal] Content not ready, status:', data.status);
        setError(language === 'ar' ? 'المحتوى غير جاهز بعد' : 'Content not ready yet');
        return;
      }

      setContent(data);
    } catch (err: any) {
      console.error('[AVPlayerModal] Failed to load AV content:', err);
      setError(language === 'ar' ? 'فشل تحميل المحتوى' : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = useCallback(() => {
    player.pause();
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setContent(null);
      setShowFeedback(false);
      setFeedbackSubmitted(false);
      setRating(0);
      setError(null);
    }, 300);
  }, [onClose, player]);

  const handleFeedback = async (helpful: boolean) => {
    if (!content) return;

    try {
      await avContentApi.submitFeedback(content.id, {
        helpful,
        rating,
        watchDuration: Math.floor(player.currentTime),
        completedSlides: Array.from(
          { length: player.currentSlide + 1 },
          (_, i) => i + 1
        ),
      });
      setFeedbackSubmitted(true);
      setShowFeedback(false);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Debug: Log player state
  useEffect(() => {
    if (content) {
      console.log('[AVPlayerModal] Player state:', {
        isPlaying: player.isPlaying,
        isLoading: player.isLoading,
        isAudioReady: player.isAudioReady,
        error: player.error,
        currentTime: player.currentTime,
        duration: player.duration,
        currentSlide: player.currentSlide,
        hasAudioRef: !!audioRef.current,
      });
    }
  }, [player.isPlaying, player.isLoading, player.isAudioReady, player.error, player.currentTime, player.duration, player.currentSlide, content]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'max-w-7xl w-[95vw] h-[90vh] p-0 overflow-hidden',
          'bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-violet-900/30',
          'backdrop-blur-2xl border-white/10',
          language === 'ar' ? 'rtl' : 'ltr'
        )}
      >
        {/* Header */}
        <DialogHeader className="absolute top-0 left-0 right-0 z-10 px-6 py-4 bg-gradient-to-b from-slate-900/90 to-transparent">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white">
              {content?.titleAr || content?.title || (
                language === 'ar' ? 'محاضرة فيديو' : 'Video Lecture'
              )}
            </DialogTitle>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-violet-400 mx-auto mb-4" />
              <p className="text-slate-300">
                {language === 'ar' ? 'جاري تحميل المحاضرة...' : 'Loading lecture...'}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {(error || player.error) && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-20">
            <div className="text-center max-w-md">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error || player.error}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => contentId && loadContent(contentId)} variant="outline">
                  {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                </Button>
                <Button onClick={handleClose} variant="ghost">
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Audio Loading Overlay */}
        {content && !isLoading && !error && !player.error && player.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 z-15">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">
                {language === 'ar' ? 'جاري تحميل الصوت...' : 'Loading audio...'}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {content && !isLoading && !error && (
          <div className="flex h-full pt-16">
            {/* Slide Navigator (Left/Right based on language) */}
            <SlideNavigator
              slides={content.slides}
              currentSlide={player.currentSlide}
              onSlideClick={player.goToSlide}
              language={language}
              className={language === 'ar' ? 'order-2' : 'order-1'}
            />

            {/* Main Slide Area */}
            <div className={cn(
              'flex-1 flex flex-col',
              language === 'ar' ? 'order-1' : 'order-2'
            )}>
              {/* Slide Display */}
              <div className="flex-1 p-6 pb-0 relative">
                <SlideRenderer
                  slide={player.currentSlideData}
                  isPlaying={player.isPlaying}
                  language={language}
                  className="h-full"
                />

                {/* Click to play overlay when not playing and ready */}
                {!player.isPlaying && player.isAudioReady && player.currentTime === 0 && !player.error && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-slate-900/40 cursor-pointer"
                    onClick={() => player.play()}
                  >
                    <div className="bg-violet-500/80 rounded-full p-6 hover:bg-violet-500 transition-colors">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Audio Controls */}
              <AudioControls
                player={player}
                onFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                language={language}
              />
            </div>

            {/* Hidden Audio Element - CRITICAL: This must be rendered for the hook to work */}
            <audio
              ref={audioRef}
              preload="auto"
              style={{ display: 'none' }}
            />
          </div>
        )}

        {/* Feedback Popup */}
        <AnimatePresence>
          {showFeedback && !feedbackSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="bg-slate-800/95 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-2xl">
                <p className="text-white text-lg font-medium mb-4 text-center">
                  {language === 'ar' ? 'هل كانت هذه المحاضرة مفيدة؟' : 'Was this lecture helpful?'}
                </p>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={cn(
                          'h-8 w-8 transition-colors',
                          star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-500 hover:text-yellow-400/50'
                        )}
                      />
                    </button>
                  ))}
                </div>

                {/* Yes/No Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleFeedback(true)}
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                  >
                    <ThumbsUp className="h-5 w-5 mr-2" />
                    {language === 'ar' ? 'نعم، مفيدة' : 'Yes, helpful'}
                  </Button>
                  <Button
                    onClick={() => handleFeedback(false)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-400 hover:bg-slate-700"
                  >
                    <ThumbsDown className="h-5 w-5 mr-2" />
                    {language === 'ar' ? 'يمكن تحسينها' : 'Needs improvement'}
                  </Button>
                </div>

                <button
                  onClick={() => setShowFeedback(false)}
                  className="mt-3 text-sm text-slate-500 hover:text-slate-400 w-full text-center"
                >
                  {language === 'ar' ? 'تخطي' : 'Skip'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Submitted Toast */}
        <AnimatePresence>
          {feedbackSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="bg-green-500/20 backdrop-blur-xl rounded-lg px-6 py-3 border border-green-500/30">
                <p className="text-green-400">
                  {language === 'ar' ? 'شكراً لملاحظاتك!' : 'Thanks for your feedback!'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
