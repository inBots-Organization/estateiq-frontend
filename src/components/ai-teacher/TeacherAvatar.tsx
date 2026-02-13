'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GraduationCap, Target, Brain, Star, Bot } from 'lucide-react';
import { TEACHERS, type TeacherName } from '@/config/teachers';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTeacherStore } from '@/stores/teacher.store';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  GraduationCap,
  Target,
  Brain,
  Star,
} as const;

const SIZES = {
  sm: { container: 'w-8 h-8', text: 'text-xs', icon: 'h-2.5 w-2.5', iconOffset: '-bottom-0.5 -right-0.5' },
  md: { container: 'w-10 h-10', text: 'text-sm', icon: 'h-3 w-3', iconOffset: '-bottom-0.5 -right-0.5' },
  lg: { container: 'w-14 h-14', text: 'text-xl', icon: 'h-4 w-4', iconOffset: '-bottom-1 -right-1' },
  xl: { container: 'w-20 h-20', text: 'text-3xl', icon: 'h-5 w-5', iconOffset: '-bottom-1 -right-1' },
};

const SIZE_PX = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

interface TeacherAvatarProps {
  teacherName: TeacherName;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  showPulse?: boolean;
  className?: string;
  avatarUrl?: string | null;
}

export function TeacherAvatar({ teacherName, size = 'md', showName = false, showPulse = false, className, avatarUrl: propAvatarUrl }: TeacherAvatarProps) {
  const { language } = useLanguage();
  const [imgError, setImgError] = useState(false);

  // Get custom avatar from store if available
  const { customTeacherAvatar, activeTeacher, assignedTeacher } = useTeacherStore();

  // Fallback to abdullah if teacher doesn't exist in config
  const teacher = TEACHERS[teacherName] || TEACHERS.abdullah;
  const sizeConfig = SIZES[size];
  const sizePx = SIZE_PX[size];
  const Icon = ICON_MAP[teacher.iconName] || Bot;

  // Determine which avatar URL to use
  // Priority: prop > store (if same teacher) > teacher config
  const isCurrentTeacher = teacherName === (activeTeacher || assignedTeacher);
  const avatarUrl = propAvatarUrl
    || (isCurrentTeacher && customTeacherAvatar)
    || teacher.avatarUrl;

  const hasValidImage = avatarUrl && !imgError;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        {showPulse && (
          <div className={cn(
            'absolute inset-0 rounded-full bg-gradient-to-br animate-ping opacity-20',
            teacher.gradient
          )} />
        )}

        {hasValidImage ? (
          // Show actual avatar image
          <div className={cn(
            'rounded-full overflow-hidden relative',
            sizeConfig.container
          )}>
            <Image
              src={avatarUrl}
              alt={teacher.displayName[language]}
              width={sizePx}
              height={sizePx}
              className="object-cover w-full h-full"
              onError={() => setImgError(true)}
              unoptimized={avatarUrl.startsWith('data:')}
            />
          </div>
        ) : (
          // Fallback to initial letter
          <div className={cn(
            'rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br relative',
            teacher.gradient,
            sizeConfig.container,
            sizeConfig.text
          )}>
            {teacher.initial[language]}
          </div>
        )}

        {/* Icon badge - only show if not using image */}
        {!hasValidImage && (
          <div className={cn(
            'absolute bg-white rounded-full p-0.5 shadow-sm',
            sizeConfig.iconOffset
          )}>
            <Icon className={cn(sizeConfig.icon, teacher.textColor)} />
          </div>
        )}
      </div>
      {showName && (
        <span className="font-medium text-foreground">
          {teacher.displayName[language]}
        </span>
      )}
    </div>
  );
}
