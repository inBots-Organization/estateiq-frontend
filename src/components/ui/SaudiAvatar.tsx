/**
 * Saudi Avatar Component
 *
 * Displays a Saudi client avatar for voice training
 */

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SaudiAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

export function SaudiAvatar({ className, size = 'lg', isActive = false }: SaudiAvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const sizePixels = {
    sm: 48,
    md: 96,
    lg: 128,
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Pulsing glow effect when active */}
      {isActive && (
        <>
          <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping" />
          <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
        </>
      )}

      <div className={cn(
        "relative z-10 w-full h-full drop-shadow-lg",
        isActive && "animate-subtle-bounce"
      )}>
        <Image
          src="/saudi-avatar.svg"
          alt="Saudi Client Avatar"
          width={sizePixels[size]}
          height={sizePixels[size]}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
