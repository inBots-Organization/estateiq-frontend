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
  showName?: boolean;
}

const SIZES = {
  sm: { container: 'w-10 h-10', ring: 'ring-2' },
  md: { container: 'w-12 h-12', ring: 'ring-2' },
  lg: { container: 'w-14 h-14', ring: 'ring-[3px]' },
  xl: { container: 'w-24 h-24', ring: 'ring-4' },
};

export function TalkingAvatar({
  teacherName,
  size = 'md',
  isSpeaking = false,
  audioElement,
  className,
  showName = true,
}: TalkingAvatarProps) {
  const { language } = useLanguage();
  // Fallback to abdullah if teacher doesn't exist in config
  const teacher = TEACHERS[teacherName] || TEACHERS.abdullah;
  const sizeConfig = SIZES[size];

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

      {/* Avatar container with image */}
      <div
        className={cn(
          'relative rounded-full overflow-hidden',
          'bg-gradient-to-br shadow-lg transition-all duration-300',
          teacher.gradient,
          sizeConfig.container,
          sizeConfig.ring,
          isSpeaking ? 'ring-white scale-110' : 'ring-white/50'
        )}
        style={{
          transform: isSpeaking
            ? `scale(${1 + animationPhase * 0.05})`
            : 'scale(1)',
        }}
      >
        {/* Avatar image */}
        <img
          src={teacher.avatarUrl}
          alt={teacher.displayName[language]}
          className="w-full h-full object-cover"
        />

        {/* Speaking indicator - sound waves */}
        {isSpeaking && (
          <div className="absolute -right-1 -bottom-1 z-10">
            <div className="relative">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                <div className="flex gap-0.5 items-end h-2.5">
                  <div
                    className="w-0.5 bg-white rounded-full"
                    style={{
                      height: `${4 + animationPhase * 5}px`,
                      transition: 'height 0.1s ease'
                    }}
                  />
                  <div
                    className="w-0.5 bg-white rounded-full"
                    style={{
                      height: `${7 + (1 - animationPhase) * 5}px`,
                      transition: 'height 0.1s ease'
                    }}
                  />
                  <div
                    className="w-0.5 bg-white rounded-full"
                    style={{
                      height: `${4 + animationPhase * 5}px`,
                      transition: 'height 0.1s ease'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Name badge */}
      {showName && (
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
      )}
    </div>
  );
}
