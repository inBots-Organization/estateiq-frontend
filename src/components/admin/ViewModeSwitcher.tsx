'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useViewModeStore } from '@/stores/viewMode.store';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Users, Shield, ArrowLeftRight } from 'lucide-react';

interface ViewModeSwitcherProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function ViewModeSwitcher({ variant = 'default', className }: ViewModeSwitcherProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { viewMode, toggleViewMode } = useViewModeStore();
  const { isRTL } = useLanguage();

  // Only show for admins and trainers
  const canSwitch = user?.role === 'org_admin' || user?.role === 'trainer';

  if (!canSwitch) return null;

  const handleToggle = () => {
    toggleViewMode();
    if (viewMode === 'admin') {
      // Switching to trainee view
      router.push('/dashboard');
    } else {
      // Switching back to admin view
      router.push('/admin');
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className={cn(
          'gap-2 h-9 px-3 rounded-lg transition-all duration-200',
          viewMode === 'trainee'
            ? 'bg-violet-500/10 border-violet-500/30 text-violet-500 hover:bg-violet-500/20'
            : 'bg-teal-500/10 border-teal-500/30 text-teal-500 hover:bg-teal-500/20',
          className
        )}
      >
        <ArrowLeftRight className="h-4 w-4" />
        {viewMode === 'admin' ? (
          <span className="hidden sm:inline">
            {isRTL ? 'عرض كمتدرب' : 'Trainee View'}
          </span>
        ) : (
          <span className="hidden sm:inline">
            {isRTL ? 'لوحة الإدارة' : 'Admin Panel'}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      className={cn(
        'gap-2 h-11 px-4 rounded-xl transition-all duration-200 border-2',
        viewMode === 'trainee'
          ? 'bg-violet-500/10 border-violet-500/30 text-violet-500 hover:bg-violet-500/20 hover:border-violet-500/50'
          : 'bg-teal-500/10 border-teal-500/30 text-teal-500 hover:bg-teal-500/20 hover:border-teal-500/50',
        className
      )}
    >
      {viewMode === 'admin' ? (
        <>
          <Users className="h-4 w-4" />
          <span>{isRTL ? 'عرض كمتدرب' : 'Switch to Trainee View'}</span>
        </>
      ) : (
        <>
          <Shield className="h-4 w-4" />
          <span>{isRTL ? 'العودة للوحة الإدارة' : 'Back to Admin Panel'}</span>
        </>
      )}
    </Button>
  );
}

// Floating button version for trainee dashboard when admin is viewing as trainee
export function FloatingAdminReturn() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { viewMode, setViewMode } = useViewModeStore();
  const { isRTL } = useLanguage();

  // Only show when admin is in trainee view mode
  const showButton =
    (user?.role === 'org_admin' || user?.role === 'trainer') &&
    viewMode === 'trainee';

  if (!showButton) return null;

  const handleReturn = () => {
    setViewMode('admin');
    router.push('/admin');
  };

  return (
    <div className={cn(
      'fixed bottom-6 z-50',
      isRTL ? 'left-6' : 'right-6'
    )}>
      <Button
        onClick={handleReturn}
        className={cn(
          'gap-2 h-12 px-5 rounded-full shadow-lg',
          'bg-gradient-to-r from-violet-500 to-purple-600',
          'hover:from-violet-600 hover:to-purple-700',
          'text-white font-medium',
          'animate-bounce-subtle'
        )}
      >
        <Shield className="h-5 w-5" />
        <span>{isRTL ? 'العودة للوحة الإدارة' : 'Back to Admin Panel'}</span>
      </Button>
    </div>
  );
}
