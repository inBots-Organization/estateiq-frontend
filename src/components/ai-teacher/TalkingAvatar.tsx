'use client';

import { useState, useEffect, useRef } from 'react';
import { TEACHERS, type TeacherName } from '@/config/teachers';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface TalkingAvatarProps {
  teacherName: TeacherName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  audioElement?: HTMLAudioElement | null;
  className?: string;
}

const SIZES = {
  sm: { container: 'w-10 h-10', emoji: 'text-xl', ring: 'ring-2' },
  md: { container: 'w-12 h-12', emoji: 'text-2xl', ring: 'ring-2' },
  lg: { container: 'w-16 h-16', emoji: 'text-3xl', ring: 'ring-[3px]' },
  xl: { container: 'w-24 h-24', emoji: 'text-5xl', ring: 'ring-4' },
};

// Gender based on teacher name - use appropriate emoji
const TEACHER_EMOJI: Record<TeacherName, { default: string; speaking: string }> = {
  ahmed: { default: '👨🏻‍💼', speaking: '🗣️' },
  noura: { default: '👩🏻‍💼', speaking: '💬' },
  anas: { default: '👨🏻‍🏫', speaking: '🗣️' },
  abdullah: { default: '👨🏻‍💼', speaking: '🗣️' },
};

// Hijab version for Noura
const NOURA_EMOJI = { default: '🧕🏻', speaking: '💬' };

export function TalkingAvatar({
  teacherName,
  size = 'md',
  isSpeaking = false,
  audioElement,
  className,
}: TalkingAvatarProps) {
  const { language } = useLanguage();
  const teacher = TEACHERS[teacherName];
  const sizeConfig = SIZES[size];

  // Use hijab emoji for Noura
  const emojis = teacherName === 'noura' ? NOURA_EMOJI : TEACHER_EMOJI[teacherName];

  // Animation states
  const [animationPhase, setAnimationPhase] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Speaking animation
  useEffect(() => {
    if (!isSpeaking) {
      setAnimationPhase(0);
      return;
    }

    let frame = 0;
    const animate = () => {
      frame += 0.1;
      // Create smooth oscillation for speaking effect
      setAnimationPhase(Math.sin(frame * 3) * 0.5 + 0.5);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpeaking]);

  return (
    <div className={cn('relative', sizeConfig.container, className)}>
      {/* Outer pulse effect when speaking */}
      {isSpeaking && (
        <>
          <div
            className={cn(
              'absolute inset-0 rounded-full bg-gradient-to-br animate-ping opacity-30',
              teacher.gradient
            )}
            style={{ animationDuration: '1.5s' }}
          />
          <div
            className={cn(
              'absolute inset-0 rounded-full bg-gradient-to-br animate-pulse opacity-40',
              teacher.gradient
            )}
            style={{ animationDuration: '0.8s' }}
          />
        </>
      )}

      {/* Avatar container with gradient background */}
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center',
          'bg-gradient-to-br shadow-lg transition-all duration-300',
          teacher.gradient,
          sizeConfig.container,
          sizeConfig.ring,
          isSpeaking ? 'ring-white scale-110' : 'ring-white/50'
        )}
      >
        {/* Emoji face */}
        <div
          className={cn(
            'transition-transform duration-150',
            sizeConfig.emoji
          )}
          style={{
            transform: isSpeaking
              ? `scale(${1 + animationPhase * 0.1}) translateY(${animationPhase * -2}px)`
              : 'scale(1)',
          }}
        >
          {isSpeaking ? emojis.speaking : emojis.default}
        </div>

        {/* Speaking indicator - sound waves */}
        {isSpeaking && (
          <div className="absolute -right-1 -bottom-1">
            <div className="relative">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                <div className="flex gap-0.5 items-end h-2">
                  <div
                    className="w-0.5 bg-white rounded-full animate-pulse"
                    style={{
                      height: `${4 + animationPhase * 4}px`,
                      animationDelay: '0ms'
                    }}
                  />
                  <div
                    className="w-0.5 bg-white rounded-full animate-pulse"
                    style={{
                      height: `${6 + (1 - animationPhase) * 4}px`,
                      animationDelay: '100ms'
                    }}
                  />
                  <div
                    className="w-0.5 bg-white rounded-full animate-pulse"
                    style={{
                      height: `${4 + animationPhase * 4}px`,
                      animationDelay: '200ms'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Name badge */}
      <div
        className={cn(
          'absolute -bottom-1 left-1/2 -translate-x-1/2',
          'bg-white/95 dark:bg-gray-800/95 px-2 py-0.5 rounded-full',
          'text-[9px] font-bold shadow-sm whitespace-nowrap',
          'border border-white/50',
          teacher.textColor
        )}
      >
        {teacher.displayName[language]}
      </div>
    </div>
  );
}
