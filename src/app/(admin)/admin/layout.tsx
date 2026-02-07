'use client';

/**
 * EstateIQ Admin Layout
 *
 * Premium admin dashboard navigation with:
 * - Violet accent color for admin distinction
 * - Glassmorphism effects
 * - View mode switching (Admin ↔ Trainee)
 * - Full RTL/Arabic support
 * - Role-based navigation (Trainer vs Org Admin)
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, usePermissions } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { CompactSettings } from '@/components/ui/LanguageToggle';
import { ViewModeSwitcher } from '@/components/admin/ViewModeSwitcher';
import { AdminRoleProvider } from '@/contexts/AdminRoleContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Phone,
  Loader2,
  Shield,
  ArrowLeft,
  CreditCard,
  GraduationCap,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, token, isAuthenticated, impersonation, endImpersonation } = useAuthStore();
  const { t, isRTL, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeNav, setActiveNav] = useState(pathname);
  const [isNavigating, setIsNavigating] = useState(false);

  // Check if impersonating
  const isImpersonating = impersonation !== null;

  // Check if user is a trainer (limited access)
  const isTrainer = user?.role === 'trainer';
  const isOrgAdmin = user?.role === 'org_admin';

  // Handle ending impersonation
  const handleEndImpersonation = useCallback(() => {
    endImpersonation();
    router.push('/super-admin/organizations');
  }, [endImpersonation, router]);

  // Admin navigation items - filtered based on role
  const navItems = useMemo(() => {
    const items = [
      {
        href: '/admin',
        label: isRTL ? 'لوحة التحكم' : 'Dashboard',
        icon: LayoutDashboard,
        description: isRTL
          ? (isTrainer ? 'نظرة عامة على مجموعاتك' : 'نظرة عامة على الفريق')
          : (isTrainer ? 'Your groups overview' : 'Team overview'),
        showFor: ['trainer', 'org_admin'],
      },
      {
        href: '/admin/employees',
        label: isRTL ? (isTrainer ? 'طلابي' : 'المتدربين') : (isTrainer ? 'My Students' : 'Trainees'),
        icon: isTrainer ? GraduationCap : Users,
        description: isRTL
          ? (isTrainer ? 'عرض طلاب مجموعاتك' : 'إدارة المتدربين')
          : (isTrainer ? 'View your students' : 'Manage trainees'),
        showFor: ['trainer', 'org_admin'],
      },
      {
        href: '/admin/groups',
        label: isRTL ? (isTrainer ? 'مجموعاتي' : 'المجموعات') : (isTrainer ? 'My Groups' : 'Groups'),
        icon: UsersRound,
        description: isRTL
          ? (isTrainer ? 'عرض مجموعاتك' : 'إدارة المجموعات')
          : (isTrainer ? 'View your groups' : 'Manage groups'),
        showFor: ['trainer', 'org_admin'],
      },
      {
        href: '/admin/voice-sessions',
        label: isRTL ? 'جلسات الصوت' : 'Voice Sessions',
        icon: Phone,
        description: isRTL
          ? (isTrainer ? 'مراقبة مكالمات طلابك' : 'مراقبة المكالمات')
          : (isTrainer ? 'Monitor your students calls' : 'Monitor calls'),
        showFor: ['trainer', 'org_admin'],
      },
      {
        href: '/admin/reports',
        label: isRTL ? 'التقارير' : 'Reports',
        icon: BarChart3,
        description: isRTL
          ? (isTrainer ? 'تقارير طلابك' : 'التقارير والتحليلات')
          : (isTrainer ? 'Your students reports' : 'Reports & analytics'),
        showFor: ['trainer', 'org_admin'],
      },
      // Billing - Only for org_admin
      {
        href: '/admin/billing',
        label: isRTL ? 'المدفوعات' : 'Billing',
        icon: CreditCard,
        description: isRTL ? 'المدفوعات والاستهلاك' : 'Billing & usage',
        showFor: ['org_admin'], // Only admins can see billing
      },
      // Settings - Only for org_admin
      {
        href: '/admin/settings',
        label: isRTL ? 'الإعدادات' : 'Settings',
        icon: Settings,
        description: isRTL ? 'إعدادات النظام' : 'System settings',
        showFor: ['org_admin'], // Only admins can see settings
      },
    ];

    // Filter items based on user role
    const currentRole = user?.role || 'trainee';
    return items.filter(item => item.showFor.includes(currentRole));
  }, [isRTL, isTrainer, user?.role]);

  // Optimized navigation handler
  const handleNavClick = useCallback((href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === href) return;
    setActiveNav(href);
    setIsNavigating(true);
    router.push(href);
  }, [pathname, router]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  const getInitials = useCallback(() => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'A';
  }, [user?.firstName, user?.lastName]);

  // RTL-aware chevron
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  // Wait for hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Update activeNav when pathname changes
  useEffect(() => {
    setActiveNav(pathname);
    setIsNavigating(false);
  }, [pathname]);

  // Check if user has admin-level access (org_admin or trainer can access admin area)
  // Also allow access during impersonation
  const hasAdminAccess = user?.role === 'org_admin' || user?.role === 'trainer' || isImpersonating;

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (isHydrated && !token && !isAuthenticated) {
      router.push('/login');
    } else if (isHydrated && user && !hasAdminAccess) {
      // Super admin without impersonation should go to super-admin dashboard
      if (user.role === 'saas_super_admin') {
        router.push('/super-admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isHydrated, token, isAuthenticated, user, router, hasAdminAccess]);

  // Show loading while checking auth
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-soft animate-pulse">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
            <span className="text-sm text-muted-foreground font-medium">
              {isRTL ? 'جاري التحميل...' : 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Don't render admin content for non-admin users
  if (!user || !hasAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">{isRTL ? 'جاري التحقق...' : 'Verifying access...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">
                {isRTL
                  ? `أنت تتصفح كمؤسسة: ${impersonation?.impersonatedOrgName}`
                  : `Impersonating: ${impersonation?.impersonatedOrgName}`}
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleEndImpersonation}
              className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <ArrowLeft className={cn("h-3 w-3", isRTL ? "ml-1 rotate-180" : "mr-1")} />
              {isRTL ? 'العودة للمنصة' : 'Exit Impersonation'}
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed bottom-0 w-[280px] bg-card/95 backdrop-blur-xl hidden lg:flex flex-col shadow-soft-xl z-30",
          isImpersonating ? "top-10" : "top-0",
          isRTL
            ? "right-0 border-l border-border/50"
            : "left-0 border-r border-border/50"
        )}
        key={`admin-sidebar-${language}`}
      >
        {/* Logo - Admin/Trainer Branding */}
        <div className="h-20 flex items-center px-6 border-b border-border/50">
          <Link href="/admin" className="flex items-center gap-3.5 group" prefetch={true}>
            <div className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center shadow-soft transition-shadow duration-300",
              isTrainer
                ? "bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 group-hover:shadow-glow-teal"
                : "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 group-hover:shadow-glow-violet"
            )}>
              {isTrainer ? <GraduationCap className="h-6 w-6 text-white" /> : <Shield className="h-6 w-6 text-white" />}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-tight tracking-tight">{t.landing.brandName}</span>
              <Badge
                variant="outline"
                className={cn(
                  "w-fit text-[10px] px-1.5 py-0",
                  isTrainer
                    ? "border-teal-500/30 text-teal-500 bg-teal-500/5"
                    : "border-violet-500/30 text-violet-500 bg-violet-500/5"
                )}
              >
                {isTrainer
                  ? (isRTL ? 'لوحة المدرب' : 'Trainer Panel')
                  : (isRTL ? 'لوحة الإدارة' : 'Admin Panel')}
              </Badge>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" key={`admin-nav-${language}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.href || (item.href !== '/admin' && activeNav.startsWith(item.href));

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
                      ? "bg-violet-500/10 text-violet-500"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    isNavigating && activeNav === item.href && "opacity-80"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-full",
                      isRTL ? "-left-4" : "-right-4"
                    )} />
                  )}

                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                      isActive
                        ? "bg-violet-500/15 shadow-soft"
                        : "bg-muted/40 group-hover:bg-violet-500/10"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive ? "text-violet-500" : "text-muted-foreground group-hover:text-violet-500"
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate transition-colors duration-200",
                      isActive ? "text-violet-500" : "group-hover:text-foreground"
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
                    <ChevronIcon className="h-4 w-4 text-violet-500/50" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Settings and User section */}
        <div className="p-4 border-t border-border/50 space-y-4">
          {/* View Mode Switcher - Switch to Trainee View */}
          <ViewModeSwitcher className="w-full" />

          {/* Language and Theme */}
          <div className="flex justify-center">
            <CompactSettings />
          </div>

          {/* Admin Info */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent border border-violet-500/20">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border-2 border-violet-500/20 shadow-soft">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white text-sm font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <Shield className="h-3.5 w-3.5 text-violet-500" />
                </div>
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

      {/* Main content */}
      <div className={cn(
        "min-h-screen flex flex-col",
        isRTL ? "lg:mr-[280px]" : "lg:ml-[280px]"
      )}>
        {/* Mobile header */}
        <header className={cn(
          "h-16 bg-card/95 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 lg:hidden shadow-soft",
          isImpersonating && "mt-10"
        )}>
          <Avatar className={cn(
            "h-9 w-9 border-2 shadow-soft",
            isTrainer ? "border-teal-500/20" : "border-violet-500/20"
          )}>
            <AvatarFallback className={cn(
              "text-white text-xs font-bold",
              isTrainer
                ? "bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600"
                : "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600"
            )}>
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shadow-soft",
              isTrainer
                ? "bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600"
                : "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600"
            )}>
              {isTrainer ? <GraduationCap className="h-5 w-5 text-white" /> : <Shield className="h-5 w-5 text-white" />}
            </div>
            <span className="font-bold text-foreground tracking-tight">{t.landing.brandName}</span>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0",
                isTrainer
                  ? "border-teal-500/30 text-teal-500 bg-teal-500/5"
                  : "border-violet-500/30 text-violet-500 bg-violet-500/5"
              )}
            >
              {isTrainer ? 'Trainer' : 'Admin'}
            </Badge>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 rounded-xl hover:bg-muted/60 transition-colors duration-200"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background p-6 lg:p-8">
          <AdminRoleProvider>
            {children}
          </AdminRoleProvider>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        key={`admin-mobile-sidebar-${language}`}
        className={cn(
          "fixed inset-y-0 z-50 w-[280px] bg-card/95 backdrop-blur-xl transform transition-transform duration-300 lg:hidden shadow-2xl",
          isRTL
            ? cn("right-0", mobileMenuOpen ? "translate-x-0" : "translate-x-full")
            : cn("left-0", mobileMenuOpen ? "translate-x-0" : "-translate-x-full")
        )}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-border/50">
          <Link href="/admin" className="flex items-center gap-3" prefetch={true}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-soft">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground leading-tight tracking-tight">{t.landing.brandName}</span>
              <Badge variant="outline" className="w-fit text-[10px] px-1.5 py-0 border-violet-500/30 text-violet-500 bg-violet-500/5">
                Admin
              </Badge>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2.5 rounded-xl hover:bg-muted/60 transition-colors duration-200"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" key={`admin-mobile-nav-${language}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.href || (item.href !== '/admin' && activeNav.startsWith(item.href));
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
                      ? "bg-violet-500/10 text-violet-500"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-full",
                      isRTL ? "-left-4" : "-right-4"
                    )} />
                  )}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                      isActive
                        ? "bg-violet-500/15 shadow-soft"
                        : "bg-muted/40 group-hover:bg-violet-500/10"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive ? "text-violet-500" : "text-muted-foreground group-hover:text-violet-500"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate transition-colors duration-200",
                      isActive ? "text-violet-500" : "group-hover:text-foreground"
                    )}>
                      {item.label}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50 space-y-4">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start gap-2 h-11 rounded-xl border-violet-500/20 hover:bg-violet-500/10 hover:text-violet-500 transition-colors duration-200">
              <ArrowLeft className={cn("h-4 w-4", isRTL && "rotate-180")} />
              {isRTL ? 'العودة للتطبيق' : 'Back to App'}
            </Button>
          </Link>
          <div className="flex justify-center">
            <CompactSettings />
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent border border-violet-500/20">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border-2 border-violet-500/20 shadow-soft">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white text-sm font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <Shield className="h-3.5 w-3.5 text-violet-500" />
                </div>
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
    </div>
  );
}
