'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth.context';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { SettingsDropdown } from '@/components/ui/LanguageToggle';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  ChevronLeft,
  Bell,
  Search,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  labelAr: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const { isSuperAdmin } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Navigation items
  const navItems: NavItem[] = useMemo(
    () => [
      { href: '/super-admin', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutDashboard },
      { href: '/super-admin/organizations', label: 'Organizations', labelAr: 'المؤسسات', icon: Building2 },
      { href: '/super-admin/subscriptions', label: 'Subscriptions', labelAr: 'الاشتراكات', icon: CreditCard },
      { href: '/super-admin/users', label: 'Users', labelAr: 'المستخدمون', icon: Users },
      { href: '/super-admin/analytics', label: 'Analytics', labelAr: 'التحليلات', icon: BarChart3 },
      { href: '/super-admin/audit-logs', label: 'Audit Logs', labelAr: 'سجل المراجعة', icon: FileText },
      { href: '/super-admin/settings', label: 'Settings', labelAr: 'الإعدادات', icon: Settings },
    ],
    []
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Check authentication
    if (!token) {
      router.push('/login');
      return;
    }

    // Check if user is super admin
    if (user && !isSuperAdmin) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'org_admin' || user.role === 'trainer') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [token, user, isSuperAdmin, router, isHydrated]);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/super-admin') {
      return pathname === '/super-admin';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  if (!isHydrated || !token || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-background', isRTL && 'rtl')}>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 w-72 bg-card border-e border-border hidden lg:flex flex-col z-40',
          isRTL ? 'right-0' : 'left-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/super-admin" className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 rounded-xl shadow-lg shadow-rose-500/20">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground block">EstateIQ</span>
              <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {isRTL ? 'مدير المنصة' : 'Platform Admin'}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-fuchsia-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon
                    className={cn('h-5 w-5', isActive(item.href) ? 'text-rose-500' : '')}
                  />
                  <span>{isRTL ? item.labelAr : item.label}</span>
                  {isActive(item.href) && (
                    <ChevronIcon
                      className={cn('h-4 w-4 ms-auto', isRTL ? 'rotate-180' : '')}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0]?.toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full mt-3 justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {isRTL ? 'تسجيل الخروج' : 'Sign Out'}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header
        className={cn(
          'lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-50'
        )}
      >
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-foreground">EstateIQ</span>
        </div>

        <SettingsDropdown />
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 bottom-0 w-72 bg-card z-50 transform transition-transform duration-300 ease-in-out',
          isRTL ? 'right-0' : 'left-0',
          isMobileMenuOpen
            ? 'translate-x-0'
            : isRTL
            ? 'translate-x-full'
            : '-translate-x-full'
        )}
      >
        {/* Mobile Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/super-admin" className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">EstateIQ</span>
              <span className="text-xs text-rose-500 font-medium block">
                {isRTL ? 'مدير المنصة' : 'Platform Admin'}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive(item.href)
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{isRTL ? item.labelAr : item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Logout */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {isRTL ? 'تسجيل الخروج' : 'Sign Out'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen pt-16 lg:pt-0',
          isRTL ? 'lg:mr-72' : 'lg:ml-72'
        )}
      >
        {/* Desktop Top Bar */}
        <div className="hidden lg:flex items-center justify-between h-16 px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          {/* Breadcrumb / Page Title */}
          <div className="flex items-center gap-2 text-sm">
            <Crown className="h-4 w-4 text-rose-500" />
            <span className="text-muted-foreground">
              {isRTL ? 'منصة الإدارة' : 'Platform Administration'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={isRTL ? 'بحث...' : 'Search...'}
                className="w-64 h-9 ps-9 pe-4 bg-muted/50 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 end-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </Button>

            {/* Settings Dropdown */}
            <SettingsDropdown />
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
