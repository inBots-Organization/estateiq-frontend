'use client';

/**
 * INLEARN Trainee Layout
 *
 * Premium sidebar navigation with:
 * - Glassmorphism effects
 * - Soft shadows and emerald accents
 * - Smooth micro-interactions
 * - Full RTL/Arabic support
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { CompactSettings } from '@/components/ui/LanguageToggle';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  MessageSquare,
  BarChart,
  LayoutDashboard,
  LogOut,
  Building2,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Phone,
  Loader2,
  GraduationCap,
  Sparkles,
  ClipboardCheck,
  Layers,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { FloatingAdminReturn } from '@/components/admin/ViewModeSwitcher';

export default function TraineeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, token, isAuthenticated } = useAuthStore();
  const { t, isRTL, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeNav, setActiveNav] = useState(pathname);
  const [isNavigating, setIsNavigating] = useState(false);

  // Localized nav items - Clean navigation with only working routes
  // Memoized to prevent unnecessary re-renders
  // IMPORTANT: All hooks must be called before any early returns
  const navItems = useMemo(() => [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard, description: t.nav.dashboardDesc },
    { href: '/courses', label: t.nav.courses, icon: BookOpen, description: t.nav.coursesDesc },
    { href: '/simulation', label: t.nav.simulations, icon: MessageSquare, description: t.nav.simulationsDesc },
    { href: '/voice-training', label: t.nav.voicePractice, icon: Phone, description: t.nav.voicePracticeDesc },
    { href: '/quizzes', label: t.quiz.quizzes, icon: ClipboardCheck, description: t.quiz.quizzesDesc },
    { href: '/flashcards', label: t.flashcard.flashcards, icon: Layers, description: t.flashcard.description },
    { href: '/ai-teacher', label: t.nav.aiTeacher, icon: GraduationCap, description: t.nav.aiTeacherDesc },
    { href: '/reports', label: t.nav.reports, icon: BarChart, description: t.nav.reportsDesc },
  ], [t.nav, t.quiz, t.flashcard]);

  // Optimized navigation handler - instant UI update
  const handleNavClick = useCallback((href: string) => (e: React.MouseEvent) => {
    e.preventDefault();

    // Skip if already on this page
    if (pathname === href) return;

    // Instant UI update
    setActiveNav(href);
    setIsNavigating(true);

    // Navigate immediately without transition delay
    router.push(href);
  }, [pathname, router]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  const getInitials = useCallback(() => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  }, [user?.firstName, user?.lastName]);

  // RTL-aware chevron
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  // Wait for hydration to complete before checking auth
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Update activeNav when pathname changes (for browser back/forward)
  useEffect(() => {
    setActiveNav(pathname);
    setIsNavigating(false);
  }, [pathname]);

  // Redirect to login if not authenticated (after hydration)
  // Also redirect super admin to their dashboard
  useEffect(() => {
    if (isHydrated && !token && !isAuthenticated) {
      // Check localStorage as fallback
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) {
        console.log('[TraineeLayout] No auth found, redirecting to login');
        router.push('/login');
      } else {
        try {
          const parsed = JSON.parse(authStorage);
          if (!parsed?.state?.token) {
            console.log('[TraineeLayout] No token in auth-storage, redirecting to login');
            router.push('/login');
          }
        } catch {
          console.log('[TraineeLayout] Failed to parse auth-storage, redirecting to login');
          router.push('/login');
        }
      }
    }

    // Redirect super admin to their dashboard (they shouldn't access trainee pages)
    if (isHydrated && user?.role === 'saas_super_admin') {
      console.log('[TraineeLayout] Super admin detected, redirecting to super-admin dashboard');
      router.push('/super-admin');
    }
  }, [isHydrated, token, isAuthenticated, router, user?.role]);

  // Show loading while checking auth
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-estate-gold flex items-center justify-center shadow-soft animate-pulse">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground font-medium">
              {isRTL ? 'جاري التحميل...' : 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Position based on language direction */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 w-[280px] bg-card/95 backdrop-blur-xl hidden lg:flex flex-col shadow-soft-xl z-30",
          isRTL
            ? "right-0 border-l border-border"
            : "left-0 border-r border-border"
        )}
        key={`sidebar-${language}`}
      >
        {/* Logo - Premium INLEARN Branding */}
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3.5 group" prefetch={true}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-estate-gold flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow duration-300">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-tight tracking-tight">{t.landing.brandName}</span>
              <span className="text-xs text-muted-foreground">{isRTL ? 'منصة التدريب الذكية' : 'Intelligent Training'}</span>
            </div>
          </Link>
        </div>

        {/* Navigation - Premium Design */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" key={`nav-${language}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.href;
            const isCurrentPage = pathname === item.href;

            return (
              <Link
                key={`${item.href}-${language}`}
                href={item.href}
                prefetch={true}
                onClick={handleNavClick(item.href)}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    isNavigating && activeNav === item.href && !isCurrentPage && "opacity-80"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full",
                      isRTL ? "-left-4" : "-right-4"
                    )} />
                  )}

                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                      isActive
                        ? "bg-primary/15 shadow-soft"
                        : "bg-muted/40 group-hover:bg-primary/10"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate transition-colors duration-200",
                      isActive ? "text-primary" : "group-hover:text-foreground"
                    )}>
                      {item.label}
                    </p>
                    {item.description && !isActive && (
                      <p className="text-xs text-muted-foreground/70 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {isActive && (
                    <ChevronIcon className="h-4 w-4 text-primary/50" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Settings and User section - Premium Design */}
        <div className="p-4 border-t border-border space-y-4">
          {/* Language and Theme */}
          <div className="flex justify-center">
            <CompactSettings />
          </div>

          {/* User Info - Premium Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent border border-primary/20">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-soft">
                <AvatarFallback className="bg-gradient-to-br from-primary via-emerald-500 to-estate-gold text-white text-sm font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-11 transition-colors duration-200"
            onClick={handleLogout}
          >
            <LogOut className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} />
            {t.auth.signOut}
          </Button>
        </div>
      </aside>

      {/* Main content - Margin based on sidebar position */}
      <div className={cn(
        "min-h-screen flex flex-col",
        isRTL ? "lg:mr-[280px]" : "lg:ml-[280px]"
      )}>
        {/* Mobile header - Premium Design */}
        <header className="h-16 bg-card/95 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:hidden shadow-soft">
          <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-soft">
            <AvatarFallback className="bg-gradient-to-br from-primary via-emerald-500 to-estate-gold text-white text-xs font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-emerald-500 to-estate-gold flex items-center justify-center shadow-soft">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-foreground tracking-tight">{t.landing.brandName}</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 rounded-xl hover:bg-muted/60 transition-colors duration-200"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Position based on language direction */}
      <aside
        key={`mobile-sidebar-${language}`}
        className={cn(
          "fixed inset-y-0 z-50 w-[280px] bg-card/95 backdrop-blur-xl transform transition-transform duration-300 lg:hidden shadow-2xl",
          isRTL
            ? cn("right-0", mobileMenuOpen ? "translate-x-0" : "translate-x-full")
            : cn("left-0", mobileMenuOpen ? "translate-x-0" : "-translate-x-full")
        )}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3" prefetch={true}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-emerald-500 to-estate-gold flex items-center justify-center shadow-soft">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground leading-tight tracking-tight">{t.landing.brandName}</span>
              <span className="text-xs text-muted-foreground">{isRTL ? 'التدريب الذكي' : 'Training'}</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-xl hover:bg-muted/60 transition-colors duration-200"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" key={`mobile-nav-${language}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.href;
            return (
              <Link
                key={`mobile-${item.href}-${language}`}
                href={item.href}
                prefetch={true}
                onClick={(e) => {
                  handleNavClick(item.href)(e);
                  setMobileMenuOpen(false);
                }}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group relative",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full",
                      isRTL ? "-left-4" : "-right-4"
                    )} />
                  )}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                      isActive
                        ? "bg-primary/15 shadow-soft"
                        : "bg-muted/40 group-hover:bg-primary/10"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate transition-colors duration-200",
                      isActive ? "text-primary" : "group-hover:text-foreground"
                    )}>
                      {item.label}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <div className="flex justify-center">
            <CompactSettings />
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent border border-primary/20">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-soft">
                <AvatarFallback className="bg-gradient-to-br from-primary via-emerald-500 to-estate-gold text-white text-sm font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-11 transition-colors duration-200"
            onClick={handleLogout}
          >
            <LogOut className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} />
            {t.auth.signOut}
          </Button>
        </div>
      </aside>

      {/* Floating Admin Return Button - Shows when admin is viewing as trainee */}
      <FloatingAdminReturn />
    </div>
  );
}
