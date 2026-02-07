'use client';

import { useRouter, usePathname } from 'next/navigation';
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

// Floating button version for navigation between admin and trainee views
export function FloatingAdminReturn() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { viewMode, setViewMode } = useViewModeStore();
  const { isRTL } = useLanguage();

  // Check if user is admin or trainer
  const isAdminOrTrainer = user?.role === 'org_admin' || user?.role === 'trainer';

  // Check if currently on admin pages
  const isOnAdminPage = pathname?.startsWith('/admin');

  // Show button when:
  // 1. User is admin/trainer AND in trainee view mode (show "Back to Admin")
  // 2. User is admin/trainer AND on admin page (show "Go to Trainee")
  const showButton = isAdminOrTrainer && (viewMode === 'trainee' || isOnAdminPage);

  if (!showButton) return null;

  const handleNavigation = () => {
    if (isOnAdminPage) {
      // Currently on admin page - go to trainee view
      setViewMode('trainee');
      router.push('/dashboard');
    } else {
      // Currently on trainee page - go back to admin
      setViewMode('admin');
      router.push('/admin');
    }
  };

  // Determine button style and text based on current location
  const isGoingToTrainee = isOnAdminPage;

  return (
    <div className={cn(
      'fixed bottom-6 z-50',
      isRTL ? 'left-6' : 'right-6'
    )}>
      <Button
        onClick={handleNavigation}
        className={cn(
          'gap-2 h-12 px-5 rounded-full shadow-lg',
          'text-white font-medium',
          'animate-bounce-subtle',
          isGoingToTrainee
            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700'
            : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
        )}
      >
        {isGoingToTrainee ? (
          <>
            <Users className="h-5 w-5" />
            <span>{isRTL ? 'الذهاب لصفحة المتدرب' : 'Go to Trainee Page'}</span>
          </>
        ) : (
          <>
            <Shield className="h-5 w-5" />
            <span>{isRTL ? 'العودة للوحة الإدارة' : 'Back to Admin Panel'}</span>
          </>
        )}
      </Button>
    </div>
  );
}
