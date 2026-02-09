import { cn } from '@/lib/utils';

interface InLearnLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', svg: 18 },
  md: { container: 'w-9 h-9', svg: 22 },
  lg: { container: 'w-11 h-11', svg: 26 },
  xl: { container: 'w-14 h-14', svg: 32 },
};

export function InLearnLogo({ size = 'md', className }: InLearnLogoProps) {
  const { container, svg } = sizeMap[size];

  return (
    <div
      className={cn(
        container,
        'rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-md relative overflow-hidden',
        className
      )}
    >
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Open book base */}
        <path
          d="M16 8C16 8 10 6 4 7V24C10 23 16 25 16 25C16 25 22 23 28 24V7C22 6 16 8 16 8Z"
          fill="white"
          opacity="0.15"
        />
        {/* Left page */}
        <path
          d="M16 9C16 9 11 7.5 5 8.3V23C11 22.2 16 23.7 16 23.7V9Z"
          fill="white"
          opacity="0.85"
        />
        {/* Right page */}
        <path
          d="M16 9C16 9 21 7.5 27 8.3V23C21 22.2 16 23.7 16 23.7V9Z"
          fill="white"
          opacity="0.65"
        />
        {/* Spine line */}
        <line x1="16" y1="8" x2="16" y2="24" stroke="white" strokeWidth="0.5" opacity="0.4" />
        {/* Graduation cap */}
        <path
          d="M16 3L8 7L16 11L24 7L16 3Z"
          fill="white"
          opacity="0.95"
        />
        {/* Cap tassel */}
        <line x1="22" y1="7" x2="22" y2="11" stroke="white" strokeWidth="1" opacity="0.7" />
        <circle cx="22" cy="11.5" r="1" fill="white" opacity="0.7" />
      </svg>
    </div>
  );
}

export function InLearnLogoGlass({ size = 'lg', className }: InLearnLogoProps) {
  const { svg } = sizeMap[size];
  const containerSize = size === 'xl' ? 'p-4' : size === 'lg' ? 'p-3.5' : size === 'md' ? 'p-2.5' : 'p-2';

  return (
    <div
      className={cn(
        containerSize,
        'bg-white/[0.08] backdrop-blur-sm border border-white/10 rounded-2xl',
        className
      )}
    >
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Open book base */}
        <path
          d="M16 8C16 8 10 6 4 7V24C10 23 16 25 16 25C16 25 22 23 28 24V7C22 6 16 8 16 8Z"
          fill="white"
          opacity="0.1"
        />
        {/* Left page */}
        <path
          d="M16 9C16 9 11 7.5 5 8.3V23C11 22.2 16 23.7 16 23.7V9Z"
          fill="white"
          opacity="0.85"
        />
        {/* Right page */}
        <path
          d="M16 9C16 9 21 7.5 27 8.3V23C21 22.2 16 23.7 16 23.7V9Z"
          fill="white"
          opacity="0.65"
        />
        {/* Spine line */}
        <line x1="16" y1="8" x2="16" y2="24" stroke="white" strokeWidth="0.5" opacity="0.4" />
        {/* Graduation cap */}
        <path
          d="M16 3L8 7L16 11L24 7L16 3Z"
          fill="white"
          opacity="0.95"
        />
        {/* Cap tassel */}
        <line x1="22" y1="7" x2="22" y2="11" stroke="white" strokeWidth="1" opacity="0.7" />
        <circle cx="22" cy="11.5" r="1" fill="white" opacity="0.7" />
      </svg>
    </div>
  );
}
