'use client';

/**
 * INLearn Enhanced Navigation — Premium Glassmorphism Design 2024
 *
 * Features:
 * - Morphing glass-blur backdrop with smooth scroll transitions
 * - Animated nav items with gradient underlines
 * - Micro-interactions and hover effects
 * - Intelligent mobile drawer with elegant animations
 * - Seamless RTL/LTR support
 * - Active section detection
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { CompactSettings } from '@/components/ui/LanguageToggle';
import { cn } from '@/lib/utils';
import { Menu, X, ArrowRight, ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';

export function EnhancedNavbar() {
  const { t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Smooth scroll handler with progress tracking
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / docHeight, 1);

    setScrolled(scrollY > 30);
    setScrollProgress(progress);

    // Detect active section
    if (scrollY < 100) {
      setActiveSection('hero');
      return;
    }

    const sections = ['features', 'how-it-works', 'testimonials'];
    for (const id of sections.reverse()) {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 200) {
          setActiveSection(id);
          return;
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Smooth scroll to section
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');

    if (targetId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      }
    }

    setMobileMenuOpen(false);
  };

  const navItems = [
    { href: '#hero', label: isRTL ? 'الرئيسية' : 'Home', id: 'hero' },
    { href: '#features', label: t.landing.nav.features, id: 'features' },
    { href: '#how-it-works', label: t.landing.nav.howItWorks, id: 'how-it-works' },
    { href: '#testimonials', label: t.landing.nav.testimonials, id: 'testimonials' },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile menu */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out',
          scrolled
            ? 'py-2'
            : 'py-4'
        )}
      >
        {/* Glassmorphism background */}
        <div
          className={cn(
            "absolute inset-0 transition-all duration-500",
            scrolled
              ? "bg-background/70 backdrop-blur-2xl border-b border-border/40 shadow-lg shadow-black/5"
              : "bg-transparent"
          )}
          style={{
            backdropFilter: scrolled ? `blur(${20 + scrollProgress * 10}px) saturate(180%)` : 'none',
          }}
        />

        {/* Scroll progress indicator */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary via-emerald-400 to-teal-500 transition-all duration-150"
          style={{ width: `${scrollProgress * 100}%`, opacity: scrolled ? 1 : 0 }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className={cn(
            "flex items-center justify-between transition-all duration-300",
            scrolled ? "h-16" : "h-20"
          )}>
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center group relative z-10"
              onClick={(e) => scrollToSection(e, '#hero')}
            >
              <div className="relative">
                <img
                  src="/logo-white.png"
                  alt="INLEARN"
                  className={cn(
                    "w-auto transition-all duration-300 group-hover:brightness-125",
                    scrolled ? "h-8" : "h-9 lg:h-10"
                  )}
                />
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item, i) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={cn(
                    "relative px-5 py-2.5 text-sm font-semibold transition-all duration-300 group rounded-xl",
                    activeSection === item.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="relative z-10">{item.label}</span>

                  {/* Active indicator dot */}
                  <span className={cn(
                    "absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary transition-all duration-300",
                    activeSection === item.id
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-0"
                  )} />

                  {/* Hover background */}
                  <span className={cn(
                    "absolute inset-0 rounded-xl transition-all duration-300",
                    activeSection === item.id
                      ? "bg-primary/10"
                      : "bg-transparent group-hover:bg-muted/50"
                  )} />
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Settings */}
              <div className="opacity-0 animate-[fadeIn_0.5s_ease_0.3s_forwards]">
                <CompactSettings />
              </div>

              {/* Sign In — Desktop only */}
              <Link href="/login" className="hidden lg:block opacity-0 animate-[fadeIn_0.5s_ease_0.4s_forwards]">
                <Button
                  variant="ghost"
                  className={cn(
                    "text-sm font-semibold relative group overflow-hidden rounded-xl",
                    "hover:bg-muted/60 transition-all duration-300"
                  )}
                >
                  <span className="relative z-10">{t.landing.nav.signIn}</span>
                  {/* Hover sweep effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
              </Link>

              {/* Get Started CTA */}
              <Link href="/register" className="hidden lg:block opacity-0 animate-[fadeIn_0.5s_ease_0.5s_forwards]">
                <Button className={cn(
                  "relative overflow-hidden group rounded-xl",
                  "bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-[length:200%_100%]",
                  "hover:bg-[position:100%_0] hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5",
                  "transition-all duration-300 font-semibold px-6"
                )}>
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t.landing.nav.getStarted}
                    <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </span>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "lg:hidden p-2.5 rounded-xl transition-all duration-300",
                  "hover:bg-muted/60 active:scale-95",
                  mobileMenuOpen ? "bg-muted/80" : "bg-transparent"
                )}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <div className="relative w-6 h-6">
                  <Menu className={cn(
                    "absolute inset-0 h-6 w-6 text-foreground transition-all duration-300",
                    mobileMenuOpen ? "opacity-0 rotate-180 scale-0" : "opacity-100 rotate-0 scale-100"
                  )} />
                  <X className={cn(
                    "absolute inset-0 h-6 w-6 text-foreground transition-all duration-300",
                    mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-180 scale-0"
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu — Slide-in drawer */}
        <div className={cn(
          "lg:hidden fixed top-0 bottom-0 w-[85vw] max-w-sm z-50",
          "bg-background/95 backdrop-blur-2xl shadow-2xl",
          "transition-transform duration-500 ease-out",
          isRTL
            ? "left-0 border-r border-border/50"
            : "right-0 border-l border-border/50",
          mobileMenuOpen
            ? "translate-x-0"
            : isRTL ? "-translate-x-full" : "translate-x-full"
        )}>
          {/* Mobile menu header */}
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <img
              src="/logo-white.png"
              alt="INLEARN"
              className="h-8 w-auto"
            />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-muted/60 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col h-[calc(100%-5rem)] overflow-y-auto">
            {/* Navigation Links */}
            <nav className="flex flex-col p-5 gap-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-4">
                {isRTL ? 'التنقل' : 'Navigation'}
              </span>
              {navItems.map((item, i) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={cn(
                    "flex items-center justify-between px-4 py-4 rounded-xl text-base font-semibold transition-all duration-300",
                    "hover:bg-muted/60 active:scale-[0.98]",
                    activeSection === item.id && "bg-primary/10 text-primary"
                  )}
                  style={{
                    opacity: mobileMenuOpen ? 1 : 0,
                    transform: mobileMenuOpen ? 'translateX(0)' : isRTL ? 'translateX(-20px)' : 'translateX(20px)',
                    transition: `all 0.3s ease ${i * 0.1}s`
                  }}
                >
                  <span>{item.label}</span>
                  <ChevronRight className={cn(
                    "h-4 w-4 opacity-40 transition-transform",
                    isRTL && "rotate-180",
                    activeSection === item.id && "opacity-100 text-primary"
                  )} />
                </a>
              ))}
            </nav>

            {/* Divider */}
            <div className="mx-5 border-t border-border/50" />

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 p-5 mt-auto">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-semibold rounded-xl border-2 hover:bg-muted/40 transition-all"
                >
                  {t.landing.nav.signIn}
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary via-emerald-500 to-teal-500 shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t.landing.nav.getStarted}
                    <ArrowIcon className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
            </div>

            {/* Footer branding */}
            <div className="p-5 border-t border-border/30">
              <p className="text-xs text-muted-foreground text-center">
                {isRTL ? 'منصة التدريب الذكية' : 'AI-Powered Training Platform'}
              </p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
