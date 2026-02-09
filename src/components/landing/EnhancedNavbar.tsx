'use client';

/**
 * InLearn Enhanced Navigation — Premium Editorial Design
 *
 * A sophisticated, fluid navigation bar featuring:
 * - Morphing glass-blur backdrop on scroll
 * - Micro-interactions: nav items with animated underlines
 * - Intelligent mobile menu with slide-in animation
 * - Active state indicators with smooth transitions
 * - Settings dropdown with elegant hover states
 * - Seamless RTL/LTR support
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { SettingsDropdown } from '@/components/ui/LanguageToggle';
import { InLearnLogo } from '@/components/ui/InLearnLogo';
import { cn } from '@/lib/utils';
import { Menu, X, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';

export function EnhancedNavbar() {
  const { t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section - if at top, home is active
      if (window.scrollY < 100) {
        setActiveSection('hero');
        return;
      }

      const sections = ['features', 'how-it-works', 'testimonials'];
      const current = sections.find(id => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });
      setActiveSection(current || '');
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Call once on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const navItems = [
    { href: '/', label: isRTL ? 'الرئيسية' : 'Home', id: 'hero', isHome: true },
    { href: '#features', label: t.landing.nav.features, id: 'features', isHome: false },
    { href: '#how-it-works', label: t.landing.nav.howItWorks, id: 'how-it-works', isHome: false },
    { href: '#testimonials', label: t.landing.nav.testimonials, id: 'testimonials', isHome: false },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5'
            : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* ══════════════════════════════════
                Logo — Elegant with fade-in
               ══════════════════════════════════ */}
            <Link
              href="/"
              className="flex items-center group"
            >
              <div className="relative">
                <InLearnLogo size="md" />
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </div>
            </Link>

            {/* ══════════════════════════════════
                Desktop Navigation — Animated underlines
               ══════════════════════════════════ */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item, i) => {
                const NavComponent = item.isHome ? Link : 'a';
                return (
                  <NavComponent
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "relative px-4 py-2 text-sm font-semibold transition-colors duration-200 group font-body",
                      activeSection === item.id
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    style={{
                      animationDelay: `${i * 50}ms`
                    }}
                  >
                    {item.label}

                    {/* Animated underline */}
                    <span className={cn(
                      "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full transition-all duration-300",
                      activeSection === item.id
                        ? "w-3/4 opacity-100"
                        : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-60"
                    )} />
                  </NavComponent>
                );
              })}
            </nav>

            {/* ══════════════════════════════════
                Actions — CTA + Settings
               ══════════════════════════════════ */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Settings Dropdown */}
              <div className="nav-action-reveal">
                <SettingsDropdown />
              </div>

              {/* Sign In — Desktop only */}
              <Link href="/login" className="hidden lg:block nav-action-reveal">
                <Button
                  variant="ghost"
                  className={cn(
                    "text-sm font-semibold relative group overflow-hidden font-body",
                    "hover:bg-muted/60"
                  )}
                >
                  <span className="relative z-10">{t.landing.nav.signIn}</span>
                  {/* Hover sweep effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
              </Link>

              {/* Get Started CTA — Elevated design */}
              <Link href="/register" className="hidden lg:block nav-action-reveal">
                <Button className={cn(
                  "relative overflow-hidden group font-body",
                  "bg-gradient-to-r from-primary via-emerald-500 to-primary bg-[length:200%_100%]",
                  "hover:bg-[position:100%_0] hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5",
                  "transition-all duration-300 font-semibold"
                )}>
                  <span className="relative z-10 flex items-center gap-2">
                    {t.landing.nav.getStarted}
                    <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </span>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "lg:hidden p-2.5 rounded-xl transition-all duration-200",
                  "hover:bg-muted/60 active:scale-95",
                  mobileMenuOpen && "bg-muted/60"
                )}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <div className="relative w-6 h-6">
                  <Menu className={cn(
                    "absolute inset-0 h-6 w-6 text-foreground transition-all duration-300",
                    mobileMenuOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                  )} />
                  <X className={cn(
                    "absolute inset-0 h-6 w-6 text-foreground transition-all duration-300",
                    mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            Mobile Menu — Slide-in drawer
           ══════════════════════════════════ */}
        <div className={cn(
          "lg:hidden fixed top-20 right-0 bottom-0 w-80 max-w-[85vw] z-40",
          "bg-background/95 backdrop-blur-2xl border-l border-border/50 shadow-2xl",
          "transition-transform duration-300 ease-out",
          isRTL && "right-auto left-0 border-l-0 border-r border-border/50",
          mobileMenuOpen
            ? "translate-x-0"
            : isRTL ? "-translate-x-full" : "translate-x-full"
        )}>
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Navigation Links */}
            <nav className="flex flex-col p-6 gap-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-4 font-body">
                {isRTL ? 'التنقل' : 'Navigation'}
              </span>
              {navItems.map((item, i) => {
                const NavComponent = item.isHome ? Link : 'a';
                return (
                  <NavComponent
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 font-body",
                      "hover:bg-muted/60 active:scale-98",
                      activeSection === item.id && "bg-primary/10 text-primary"
                    )}
                    style={{
                      animationDelay: `${i * 50}ms`
                    }}
                  >
                    {item.label}
                    <ChevronRight className={cn(
                      "h-4 w-4 opacity-40",
                      isRTL && "rotate-180"
                    )} />
                  </NavComponent>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="mx-6 border-t border-border/50" />

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 p-6 mt-auto">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold border-2 hover:bg-muted/40 font-body"
                >
                  {t.landing.nav.signIn}
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary via-emerald-500 to-primary shadow-lg shadow-primary/20 font-body">
                  <span className="flex items-center gap-2">
                    {t.landing.nav.getStarted}
                    <ArrowIcon className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
            </div>

            {/* Footer branding */}
            <div className="p-6 border-t border-border/30">
              <div className="flex items-center justify-center opacity-40">
                <InLearnLogo size="sm" />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
