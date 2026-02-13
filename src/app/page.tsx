'use client';

/**
 * INLearn Landing Page — Premium AI-Driven Design 2024
 *
 * Features:
 * - Modern glassmorphism hero section with animated orbs
 * - Scroll-reveal animations for all sections
 * - Premium feature cards with hover effects
 * - Enhanced statistics with gradient backgrounds
 * - Testimonials with elegant quote styling
 * - Responsive design with RTL support
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { EnhancedNavbar } from '@/components/landing/EnhancedNavbar';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  BarChart,
  Award,
  Play,
  CheckCircle,
  Star,
  ArrowRight,
  ArrowLeft,
  Zap,
  BookOpen,
  Phone,
  Globe,
  Sparkles,
  Shield,
  ChevronDown,
} from 'lucide-react';

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = ref.current?.querySelectorAll('[data-scroll-reveal]');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function HomePage() {
  const { t, isRTL } = useLanguage();
  const scrollRef = useScrollReveal();

  // RTL-aware arrow
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div ref={scrollRef} className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <EnhancedNavbar />

      <main className="flex-grow">
        {/* ═══════════════════════════════════════════════════════════
            Hero Section — Premium AI-Driven Design
           ═══════════════════════════════════════════════════════════ */}
        <section id="hero" className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-20">
          {/* Animated background orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="orb orb-1 absolute top-[10%] left-[5%] morph-blob" />
            <div className="orb orb-2 absolute bottom-[20%] right-[10%] morph-blob" style={{ animationDelay: '-3s' }} />
            <div className="orb orb-3 absolute top-[40%] right-[30%] morph-blob" style={{ animationDelay: '-6s' }} />
            {/* Extra sparkle particles */}
            <div className="absolute top-[20%] left-[20%] w-2 h-2 bg-primary/40 rounded-full float-continuous" style={{ animationDelay: '0s' }} />
            <div className="absolute top-[60%] left-[15%] w-1.5 h-1.5 bg-emerald-400/30 rounded-full float-continuous" style={{ animationDelay: '1s' }} />
            <div className="absolute top-[30%] right-[20%] w-2 h-2 bg-teal-400/30 rounded-full float-continuous" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-[30%] right-[25%] w-1 h-1 bg-primary/50 rounded-full float-continuous" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] dark:opacity-[0.05]" />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

          {/* Content */}
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <div data-scroll-reveal className="reveal-up mb-6">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/15 px-4 py-2 text-sm font-semibold border border-primary/20 shadow-lg shadow-primary/5 badge-pulse glow-pulse">
                  <Sparkles className={cn("h-4 w-4 icon-wiggle", isRTL ? "ml-2" : "mr-2")} />
                  {t.landing.hero.badge}
                </Badge>
              </div>

              {/* Main heading */}
              <h1
                data-scroll-reveal
                className="reveal-up reveal-up-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight"
              >
                <span className="block mb-2">{t.landing.hero.titlePart1}</span>
                <span className="relative inline-block sparkle">
                  <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-500 bg-clip-text text-transparent text-wave">
                    {t.landing.hero.titleHighlight}
                  </span>
                  {/* Glow effect behind text */}
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-400 to-teal-500 blur-2xl opacity-20 -z-10 pulse-grow" />
                </span>
              </h1>

              {/* Subtitle */}
              <p
                data-scroll-reveal
                className="reveal-up reveal-up-2 text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                {t.landing.hero.description}
              </p>

              {/* CTA Buttons */}
              <div
                data-scroll-reveal
                className="reveal-up reveal-up-3 flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                <Link href="/register">
                  <Button
                    size="lg"
                    className={cn(
                      "w-full sm:w-auto h-14 px-8 text-base font-semibold rounded-2xl ripple btn-shine",
                      "bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-[length:200%_100%]",
                      "hover:bg-[position:100%_0] hover:shadow-xl hover:shadow-primary/25",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      "transition-all duration-300 group glow-pulse"
                    )}
                  >
                    <Sparkles className={cn("h-5 w-5 icon-wiggle", isRTL ? "ml-2" : "mr-2")} />
                    {t.landing.hero.startFreeTrial}
                    <ArrowIcon className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      isRTL ? "mr-2 group-hover:-translate-x-1" : "ml-2 group-hover:translate-x-1"
                    )} />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-14 px-8 text-base font-semibold rounded-2xl border-2 hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 group ripple jelly-hover"
                  >
                    <Play className={cn("h-5 w-5 icon-bounce", isRTL ? "ml-2" : "mr-2")} />
                    {t.landing.hero.watchDemo}
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div
                data-scroll-reveal
                className="reveal-up reveal-up-4 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground stagger-fade"
              >
                {[
                  { icon: CheckCircle, text: t.landing.hero.noCreditCard },
                  { icon: Shield, text: t.landing.hero.freeTrial },
                  { icon: CheckCircle, text: t.landing.hero.cancelAnytime },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-full hover:bg-muted/50 transition-all duration-300 jelly-hover">
                    <item.icon className="h-4 w-4 text-primary icon-bounce" />
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bounce-arrow cursor-pointer" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            <ChevronDown className="h-8 w-8 text-muted-foreground/50 hover:text-primary transition-colors" />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            Stats Section — Vibrant Gradient Cards
           ═══════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />

          <div className="container mx-auto px-4 lg:px-8 relative">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { value: '10,000+', label: t.landing.stats.activeTrainees, delay: '0' },
                { value: '95%', label: t.landing.stats.successRate, delay: '1' },
                { value: '50K+', label: t.landing.stats.sessionsCompleted, delay: '2' },
                { value: '4.9', label: t.landing.stats.userRating, icon: Star, delay: '3' },
              ].map((stat, i) => (
                <div
                  key={i}
                  data-scroll-reveal
                  className={cn("reveal-up", `reveal-up-${i + 1}`)}
                >
                  <div className="relative group card-tilt">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-emerald-500/10 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 text-center hover:border-primary/30 transition-all duration-300 hover:shadow-lg magnetic">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <p className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-emerald-500 to-teal-500 bg-clip-text text-transparent counter-animate stat-number">
                          {stat.value}
                        </p>
                        {stat.icon && <stat.icon className="h-6 w-6 fill-warning text-warning heartbeat" />}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            Features Section — Premium Cards with Hover Effects
           ═══════════════════════════════════════════════════════════ */}
        <section id="features" className="py-20 sm:py-28 bg-background relative">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 lg:px-8 relative">
            {/* Section header */}
            <div className="text-center mb-16" data-scroll-reveal>
              <Badge className="mb-4 bg-primary/10 text-primary px-4 py-1.5">{t.landing.nav.features}</Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t.landing.features.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.landing.features.subtitle}
              </p>
            </div>

            {/* Features grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  icon: MessageSquare,
                  title: t.landing.features.aiSimulations.title,
                  description: t.landing.features.aiSimulations.description,
                  gradient: 'from-primary to-emerald-600',
                  iconBg: 'from-primary/10 to-primary/5',
                },
                {
                  icon: Phone,
                  title: t.landing.features.voiceCalls.title,
                  description: t.landing.features.voiceCalls.description,
                  gradient: 'from-purple-600 to-purple-700',
                  iconBg: 'from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20',
                  iconColor: 'text-purple-600 dark:text-purple-400',
                },
                {
                  icon: BarChart,
                  title: t.landing.features.analytics.title,
                  description: t.landing.features.analytics.description,
                  gradient: 'from-success to-emerald-600',
                  iconBg: 'from-success/10 to-success/5',
                  iconColor: 'text-success',
                },
                {
                  icon: BookOpen,
                  title: t.landing.features.courses.title,
                  description: t.landing.features.courses.description,
                  gradient: 'from-warning to-amber-600',
                  iconBg: 'from-warning/10 to-warning/5',
                  iconColor: 'text-warning',
                },
                {
                  icon: Award,
                  title: t.landing.features.certifications.title,
                  description: t.landing.features.certifications.description,
                  gradient: 'from-destructive to-red-600',
                  iconBg: 'from-destructive/10 to-destructive/5',
                  iconColor: 'text-destructive',
                },
                {
                  icon: Globe,
                  title: t.landing.features.bilingual.title,
                  description: t.landing.features.bilingual.description,
                  gradient: 'from-info to-sky-600',
                  iconBg: 'from-info/10 to-info/5',
                  iconColor: 'text-info',
                },
              ].map((feature, i) => (
                <div key={i} data-scroll-reveal className={cn("reveal-up", `reveal-up-${(i % 3) + 1}`)}>
                  <Card className="h-full group hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm overflow-hidden card-hover-glow magnetic">
                    <CardContent className="p-7 relative">
                      {/* Hover gradient overlay */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500",
                        feature.gradient
                      )} />

                      {/* Icon */}
                      <div className={cn(
                        "relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500",
                        "bg-gradient-to-br",
                        feature.iconBg,
                        `group-hover:bg-gradient-to-br group-hover:${feature.gradient}`
                      )}>
                        <feature.icon className={cn(
                          "h-7 w-7 transition-all duration-300 icon-bounce",
                          feature.iconColor || "text-primary",
                          "group-hover:text-white group-hover:scale-110"
                        )} />
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            How It Works Section — Step-by-Step Process
           ═══════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-20 sm:py-28 bg-muted/30 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 dot-grid opacity-30" />

          <div className="container mx-auto px-4 lg:px-8 relative">
            {/* Section header */}
            <div className="text-center mb-16" data-scroll-reveal>
              <Badge className="mb-4 bg-primary/10 text-primary px-4 py-1.5">{t.landing.nav.howItWorks}</Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t.landing.howItWorks.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.landing.howItWorks.subtitle}
              </p>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  step: 1,
                  title: t.landing.howItWorks.step1.title,
                  description: t.landing.howItWorks.step1.description,
                  gradient: 'from-primary to-emerald-600',
                },
                {
                  step: 2,
                  title: t.landing.howItWorks.step2.title,
                  description: t.landing.howItWorks.step2.description,
                  gradient: 'from-purple-600 to-purple-700',
                },
                {
                  step: 3,
                  title: t.landing.howItWorks.step3.title,
                  description: t.landing.howItWorks.step3.description,
                  gradient: 'from-success to-emerald-600',
                },
              ].map((item, i) => (
                <div key={i} data-scroll-reveal className={cn("reveal-up", `reveal-up-${i + 1}`)}>
                  <div className="relative group text-center">
                    {/* Connection line (hidden on last item and mobile) */}
                    {i < 2 && (
                      <div className={cn(
                        "hidden md:block absolute top-12 h-1 bg-gradient-to-r rounded-full",
                        item.gradient,
                        "opacity-30",
                        isRTL ? "left-0 -translate-x-1/2 w-full" : "right-0 translate-x-1/2 w-full"
                      )} />
                    )}

                    {/* Step number */}
                    <div className="relative inline-flex mb-8">
                      <div className={cn(
                        "w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-2xl",
                        "bg-gradient-to-br",
                        item.gradient,
                        "group-hover:scale-110 group-hover:shadow-xl transition-all duration-500 float-continuous"
                      )}>
                        <span className="counter-animate">{item.step}</span>
                      </div>
                      {/* Glow effect */}
                      <div className={cn(
                        "absolute inset-0 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity pulse-grow",
                        "bg-gradient-to-br",
                        item.gradient
                      )} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            Testimonials Section — Social Proof
           ═══════════════════════════════════════════════════════════ */}
        <section id="testimonials" className="py-20 sm:py-28 bg-background relative">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Section header */}
            <div className="text-center mb-16" data-scroll-reveal>
              <Badge className="mb-4 bg-primary/10 text-primary px-4 py-1.5">{t.landing.nav.testimonials}</Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                {t.landing.testimonials.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.landing.testimonials.subtitle}
              </p>
            </div>

            {/* Testimonials grid */}
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {t.landing.testimonials.items.map((testimonial, index) => (
                <div key={index} data-scroll-reveal className={cn("reveal-up", `reveal-up-${index + 1}`)}>
                  <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border-border/50 bg-card/80 backdrop-blur-sm card-tilt magnetic">
                    <CardContent className="p-6 relative">
                      {/* Quote mark */}
                      <div className="absolute top-4 opacity-10 text-6xl font-serif text-primary swing">
                        {isRTL ? '\u201D' : '\u201C'}
                      </div>

                      {/* Stars */}
                      <div className="flex gap-1 mb-4 relative stagger-fade">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-warning text-warning icon-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>

                      {/* Quote */}
                      <p className="text-muted-foreground mb-6 leading-relaxed relative">
                        "{testimonial.quote}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm pulse-grow",
                          index === 0 ? "bg-gradient-to-br from-primary to-blue-600" :
                          index === 1 ? "bg-gradient-to-br from-success to-emerald-500" :
                          "bg-gradient-to-br from-purple-500 to-pink-500"
                        )}>
                          {testimonial.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            CTA Section — Final Call to Action
           ═══════════════════════════════════════════════════════════ */}
        <section className="py-24 sm:py-32 relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-teal-600" />

          {/* Pattern overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

          {/* Animated orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl morph-blob" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl morph-blob" style={{ animationDelay: '-4s' }} />

          <div className="container mx-auto px-4 lg:px-8 relative" data-scroll-reveal>
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {t.landing.cta.title}
              </h2>
              <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                {t.landing.cta.description}
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className={cn(
                    "bg-white text-primary hover:bg-white/95",
                    "h-16 px-12 text-lg font-semibold rounded-2xl",
                    "shadow-2xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
                    "transition-all duration-300 group ripple btn-shine shake-attention"
                  )}
                >
                  <Sparkles className={cn("h-5 w-5 icon-wiggle", isRTL ? "ml-3" : "mr-3")} />
                  {t.landing.cta.button}
                  <ArrowIcon className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isRTL ? "mr-3 group-hover:-translate-x-1" : "ml-3 group-hover:translate-x-1"
                  )} />
                </Button>
              </Link>
              <p className="mt-6 text-sm text-white/60">{t.landing.hero.noCreditCard}</p>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════
          Footer — Clean and Professional
         ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-card border-t border-border py-12 sm:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              {/* Light mode logo */}
              <img
                src="/light-logo.png"
                alt="INLEARN"
                className="h-8 w-auto mb-4 dark:hidden"
              />
              {/* Dark mode logo */}
              <img
                src="/logo-white.png"
                alt="INLEARN"
                className="h-8 w-auto mb-4 hidden dark:block"
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.landing.footer.description}
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-foreground font-semibold mb-4">{t.landing.footer.product}</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">{t.landing.nav.features}</a></li>
                <li><a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">{t.landing.nav.howItWorks}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t.landing.footer.courses}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t.landing.footer.simulations}</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-foreground font-semibold mb-4">{t.landing.footer.company}</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t.landing.footer.about}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t.landing.footer.blog}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t.landing.footer.careers}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t.landing.footer.contact}</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-foreground font-semibold mb-4">{t.landing.footer.legal}</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t.landing.footer.privacy}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t.landing.footer.terms}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t.landing.footer.cookies}</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {t.landing.brandName}. {t.landing.footer.allRightsReserved}
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-300 jelly-hover">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-300 jelly-hover">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-300 jelly-hover">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
