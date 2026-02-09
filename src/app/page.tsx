'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { SettingsDropdown } from '@/components/ui/LanguageToggle';
import { cn } from '@/lib/utils';
import {
  Building2,
  MessageSquare,
  BarChart,
  Award,
  Play,
  CheckCircle,
  Star,
  ArrowRight,
  ArrowLeft,
  Users,
  TrendingUp,
  Shield,
  Zap,
  BookOpen,
  Target,
  Phone,
  Globe,
  Menu,
  X
} from 'lucide-react';

export default function HomePage() {
  const { t, isRTL } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // RTL-aware arrow
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">{t.landing.brandName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t.landing.nav.features}</a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t.landing.nav.howItWorks}</a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t.landing.nav.testimonials}</a>
            </nav>

            {/* Actions Container - Desktop and Mobile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Settings - Always visible */}
              <SettingsDropdown />

              {/* Desktop Actions - Hidden on mobile */}
              <Link href="/login" className="hidden md:block">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  {t.landing.nav.signIn}
                </Button>
              </Link>
              <Link href="/register" className="hidden md:block">
                <Button className="btn-gradient shadow-lg">
                  {t.landing.nav.getStarted}
                </Button>
              </Link>

              {/* Mobile Menu Button - Hidden on desktop */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted/60 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-foreground" />
                ) : (
                  <Menu className="h-6 w-6 text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in">
              <nav className="flex flex-col gap-4 mb-4">
                <a
                  href="#features"
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.landing.nav.features}
                </a>
                <a
                  href="#how-it-works"
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.landing.nav.howItWorks}
                </a>
                <a
                  href="#testimonials"
                  className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.landing.nav.testimonials}
                </a>
              </nav>
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t.landing.nav.signIn}
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full btn-gradient">
                    {t.landing.nav.getStarted}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-16 sm:py-20 lg:py-32">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:opacity-20" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float-rotate" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 via-transparent to-blue-500/5 rounded-full blur-3xl animate-pulse-soft" />

          <div className="container mx-auto px-4 lg:px-8 relative">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary hover:bg-primary/15 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm animate-bounce-in border border-primary/20 shadow-sm">
                <Zap className={cn("h-3 w-3 sm:h-4 sm:w-4", isRTL ? "ml-1.5" : "mr-1.5")} />
                {t.landing.hero.badge}
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 sm:mb-7 leading-tight px-2 animate-blur-in delay-100">
                {t.landing.hero.titlePart1}{' '}
                <span className="gradient-text animate-gradient-text bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent relative">
                  {t.landing.hero.titleHighlight}
                  <span className="absolute -inset-1 bg-primary/10 blur-xl rounded-lg -z-10" />
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4 animate-slide-in-bottom delay-200">
                {t.landing.hero.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0 animate-slide-in-bottom delay-300">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto btn-gradient h-12 sm:h-14 px-7 sm:px-10 text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                    {t.landing.hero.startFreeTrial}
                    <ArrowIcon className={cn("h-4 w-4 sm:h-5 sm:w-5", isRTL ? "mr-2" : "ml-2")} />
                  </Button>
                </Link>
                <Link href="#how-it-works" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-7 sm:px-10 text-sm sm:text-base hover:bg-muted/50 transition-all duration-300">
                    <Play className={cn("h-4 w-4 sm:h-5 sm:w-5", isRTL ? "ml-2" : "mr-2")} />
                    {t.landing.hero.watchDemo}
                  </Button>
                </Link>
              </div>
              <div className="mt-10 sm:mt-14 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-5 sm:gap-10 text-xs sm:text-sm text-muted-foreground animate-fade-in-up-delayed-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success/15 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-success" />
                  </div>
                  <span className="font-medium">{t.landing.hero.noCreditCard}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success/15 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-success" />
                  </div>
                  <span className="font-medium">{t.landing.hero.freeTrial}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-success/15 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-success" />
                  </div>
                  <span className="font-medium">{t.landing.hero.cancelAnytime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-10 sm:py-14 bg-card border-y border-border relative overflow-hidden">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02]" />
          <div className="container mx-auto px-4 lg:px-8 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 stagger-children">
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-muted/30 to-transparent hover:from-primary/10 hover:to-primary/5 transition-all duration-500 card-hover-glow">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-1">10,000+</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{t.landing.stats.activeTrainees}</p>
              </div>
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-muted/30 to-transparent hover:from-primary/10 hover:to-primary/5 transition-all duration-500 card-hover-glow">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-1">95%</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{t.landing.stats.successRate}</p>
              </div>
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-muted/30 to-transparent hover:from-primary/10 hover:to-primary/5 transition-all duration-500 card-hover-glow">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-1">50K+</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{t.landing.stats.sessionsCompleted}</p>
              </div>
              <div className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-muted/30 to-transparent hover:from-primary/10 hover:to-primary/5 transition-all duration-500 card-hover-glow">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text">4.9</p>
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-warning text-warning animate-float" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{t.landing.stats.userRating}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary hover:bg-primary/10 text-xs sm:text-sm">{t.landing.nav.features}</Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
                {t.landing.features.title}
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                {t.landing.features.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 stagger-children">
              <Card className="card-hover group hover-lift border-transparent hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5 group-hover:from-primary group-hover:to-emerald-600 transition-all duration-300 shadow-sm">
                    <MessageSquare className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t.landing.features.aiSimulations.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t.landing.features.aiSimulations.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover group hover-lift border-transparent hover:border-purple-500/20 transition-all duration-300">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 flex items-center justify-center mb-5 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300 shadow-sm">
                    <Phone className="h-7 w-7 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t.landing.features.voiceCalls.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t.landing.features.voiceCalls.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover group hover-lift border-transparent hover:border-success/20 transition-all duration-300">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 flex items-center justify-center mb-5 group-hover:from-success group-hover:to-emerald-600 transition-all duration-300 shadow-sm">
                    <BarChart className="h-7 w-7 text-success group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t.landing.features.analytics.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t.landing.features.analytics.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover group hover-lift border-transparent hover:border-warning/20 transition-all duration-300">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 flex items-center justify-center mb-5 group-hover:from-warning group-hover:to-amber-600 transition-all duration-300 shadow-sm">
                    <BookOpen className="h-7 w-7 text-warning group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t.landing.features.courses.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t.landing.features.courses.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover group hover-lift border-transparent hover:border-destructive/20 transition-all duration-300">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5 flex items-center justify-center mb-5 group-hover:from-destructive group-hover:to-red-600 transition-all duration-300 shadow-sm">
                    <Award className="h-7 w-7 text-destructive group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t.landing.features.certifications.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t.landing.features.certifications.description}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover group hover-lift border-transparent hover:border-info/20 transition-all duration-300">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-info/10 to-info/5 flex items-center justify-center mb-5 group-hover:from-info group-hover:to-sky-600 transition-all duration-300 shadow-sm">
                    <Globe className="h-7 w-7 text-info group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t.landing.features.bilingual.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t.landing.features.bilingual.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 sm:py-20 lg:py-28 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary hover:bg-primary/10 text-xs sm:text-sm">{t.landing.nav.howItWorks}</Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
                {t.landing.howItWorks.title}
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                {t.landing.howItWorks.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 sm:gap-10 lg:gap-16">
              <div className="relative group">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      1
                    </div>
                    <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-lg -z-10 group-hover:bg-primary/30 transition-colors" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">{t.landing.howItWorks.step1.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t.landing.howItWorks.step1.description}
                  </p>
                </div>
                <div className={cn(
                  "hidden md:block absolute top-10 w-[calc(50%-3rem)] h-1 bg-gradient-to-r from-primary via-purple-500 to-purple-600 rounded-full",
                  isRTL ? "right-[calc(50%+2.5rem)]" : "left-[calc(50%+2.5rem)]"
                )} />
              </div>

              <div className="relative group">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      2
                    </div>
                    <div className="absolute -inset-2 bg-purple-500/20 rounded-2xl blur-lg -z-10 group-hover:bg-purple-500/30 transition-colors" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">{t.landing.howItWorks.step2.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t.landing.howItWorks.step2.description}
                  </p>
                </div>
                <div className={cn(
                  "hidden md:block absolute top-10 w-[calc(50%-3rem)] h-1 bg-gradient-to-r from-purple-600 via-emerald-500 to-success rounded-full",
                  isRTL ? "right-[calc(50%+2.5rem)]" : "left-[calc(50%+2.5rem)]"
                )} />
              </div>

              <div className="relative group">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      3
                    </div>
                    <div className="absolute -inset-2 bg-success/20 rounded-2xl blur-lg -z-10 group-hover:bg-success/30 transition-colors" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">{t.landing.howItWorks.step3.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t.landing.howItWorks.step3.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 sm:py-20 lg:py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary hover:bg-primary/10 text-xs sm:text-sm">{t.landing.nav.testimonials}</Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
                {t.landing.testimonials.title}
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                {t.landing.testimonials.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
              {t.landing.testimonials.items.map((testimonial, index) => (
                <Card key={index} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm",
                        index === 0 ? "bg-gradient-to-br from-primary to-blue-600" :
                        index === 1 ? "bg-gradient-to-br from-success to-emerald-500" :
                        "bg-gradient-to-br from-purple-500 to-pink-500"
                      )}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-primary via-emerald-600 to-blue-700 dark:from-primary/90 dark:via-emerald-700/80 dark:to-blue-800 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 lg:px-8 text-center relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 sm:mb-6 px-4 leading-tight">
              {t.landing.cta.title}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/85 mb-8 sm:mb-10 max-w-2xl mx-auto px-4 leading-relaxed">
              {t.landing.cta.description}
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/95 h-14 sm:h-16 px-10 sm:px-14 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 rounded-xl">
                {t.landing.cta.button}
                <ArrowIcon className={cn("h-5 w-5", isRTL ? "mr-3" : "ml-3")} />
              </Button>
            </Link>
            <p className="mt-6 text-sm text-white/60">{t.landing.hero.noCreditCard}</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 sm:py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground">{t.landing.brandName}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t.landing.footer.description}
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-foreground font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t.landing.footer.product}</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.nav.features}</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.nav.pricing}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.courses}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.simulations}</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-foreground font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t.landing.footer.company}</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.about}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.blog}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.careers}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.contact}</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-foreground font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{t.landing.footer.legal}</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.privacy}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.terms}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.cookies}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 sm:pt-8 border-t border-border text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {t.landing.brandName}. {t.landing.footer.allRightsReserved}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
