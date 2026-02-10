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
  sm: { container: 'w-10 h-10', face: 'w-8 h-8', eye: 'w-1.5 h-2', mouth: 'w-3 h-1.5' },
  md: { container: 'w-12 h-12', face: 'w-10 h-10', eye: 'w-2 h-2.5', mouth: 'w-4 h-2' },
  lg: { container: 'w-16 h-16', face: 'w-14 h-14', eye: 'w-2.5 h-3', mouth: 'w-5 h-2.5' },
  xl: { container: 'w-24 h-24', face: 'w-20 h-20', eye: 'w-3 h-4', mouth: 'w-7 h-3.5' },
};

// Gender based on teacher name
const TEACHER_GENDER: Record<TeacherName, 'male' | 'female'> = {
  ahmed: 'male',
  noura: 'female',
  anas: 'male',
  abdullah: 'male',
};

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
  const gender = TEACHER_GENDER[teacherName];

  // Mouth animation state
  const [mouthOpen, setMouthOpen] = useState(0); // 0-1 scale
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Connect to audio for lip sync
  useEffect(() => {
    if (!audioElement || !isSpeaking) {
      setMouthOpen(0);
      return;
    }

    // Create audio context and analyser
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Connect audio element to analyser
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      // Animation loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const animate = () => {
        if (!isSpeaking) {
          setMouthOpen(0);
          return;
        }

        analyser.getByteFrequencyData(dataArray);

        // Get average volume from speech frequencies (100-2000 Hz)
        const speechRange = dataArray.slice(2, 30);
        const average = speechRange.reduce((a, b) => a + b, 0) / speechRange.length;
        const normalized = Math.min(average / 128, 1);

        setMouthOpen(normalized);
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } catch {
      // Fallback: simple animation without audio analysis
      let frame = 0;
      const animate = () => {
        if (!isSpeaking) {
          setMouthOpen(0);
          return;
        }
        // Simple sine wave animation
        frame += 0.15;
        setMouthOpen(Math.abs(Math.sin(frame)) * 0.8);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [audioElement, isSpeaking]);

  // Fallback animation when no audio element
  useEffect(() => {
    if (isSpeaking && !audioElement) {
      let frame = 0;
      const animate = () => {
        if (!isSpeaking) {
          setMouthOpen(0);
          return;
        }
        frame += 0.2;
        // More natural talking pattern
        const base = Math.abs(Math.sin(frame));
        const variation = Math.sin(frame * 2.5) * 0.3;
        setMouthOpen(Math.min(Math.max(base + variation, 0), 1) * 0.7);
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        setMouthOpen(0);
      };
    }
  }, [isSpeaking, audioElement]);

  // Eye blink effect
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className={cn('relative', sizeConfig.container, className)}>
      {/* Pulse effect when speaking */}
      {isSpeaking && (
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-br animate-pulse opacity-30',
            teacher.gradient
          )}
          style={{ animationDuration: '0.8s' }}
        />
      )}

      {/* Face container */}
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg',
          teacher.gradient,
          sizeConfig.face
        )}
        style={{ margin: 'auto' }}
      >
        {/* Face features container */}
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Eyes */}
          <div className="flex gap-2 mb-1">
            {/* Left eye */}
            <div
              className={cn(
                'bg-white rounded-full flex items-center justify-center transition-all duration-100',
                sizeConfig.eye,
                isBlinking && 'scale-y-[0.1]'
              )}
            >
              <div className="w-1/2 h-1/2 bg-gray-800 rounded-full" />
            </div>
            {/* Right eye */}
            <div
              className={cn(
                'bg-white rounded-full flex items-center justify-center transition-all duration-100',
                sizeConfig.eye,
                isBlinking && 'scale-y-[0.1]'
              )}
            >
              <div className="w-1/2 h-1/2 bg-gray-800 rounded-full" />
            </div>
          </div>

          {/* Mouth */}
          <div
            className={cn(
              'bg-white/90 rounded-full transition-all duration-75',
              sizeConfig.mouth
            )}
            style={{
              transform: `scaleY(${0.3 + mouthOpen * 0.7})`,
              borderRadius: mouthOpen > 0.3 ? '50%' : '9999px',
            }}
          />

          {/* Hijab/head covering for female (Noura) */}
          {gender === 'female' && (
            <div
              className={cn(
                'absolute -top-1 left-0 right-0 h-[45%] rounded-t-full',
                'bg-gradient-to-b from-white/20 to-transparent'
              )}
              style={{
                borderTopLeftRadius: '100%',
                borderTopRightRadius: '100%',
              }}
            />
          )}
        </div>
      </div>

      {/* Name badge */}
      <div
        className={cn(
          'absolute -bottom-1 left-1/2 -translate-x-1/2',
          'bg-white/90 dark:bg-gray-800/90 px-1.5 py-0.5 rounded-full',
          'text-[8px] font-semibold shadow-sm whitespace-nowrap',
          teacher.textColor
        )}
      >
        {teacher.displayName[language]}
      </div>
    </div>
  );
}
