'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { EnhancedNavbar } from '@/components/landing/EnhancedNavbar';
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
  Globe
} from 'lucide-react';

export default function HomePage() {
  const { t, isRTL } = useLanguage();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Scroll-triggered reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal-up').forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      {/* Navigation */}
      <EnhancedNavbar />

      <main className="flex-grow pt-20">
        {/* ═══════════════════════════════════════
            Hero Section — Floating orbs + staggered entrance
           ═══════════════════════════════════════ */}
        <section id="hero" className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
          {/* Background orbs */}
          <div className="orb orb-1 -top-40 -right-40" />
          <div className="orb orb-2 top-1/2 -left-32" />
          <div className="orb orb-3 -bottom-20 right-1/4" />

          {/* Dot grid pattern */}
          <div className="absolute inset-0 dot-grid opacity-40 dark:opacity-20" />

          {/* Noise overlay */}
          <div className="absolute inset-0 noise-overlay" />

          <div className="container mx-auto px-4 lg:px-8 relative">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/15 px-4 py-2 text-sm reveal-up reveal-up-1 badge-pulse border border-primary/20">
                <Zap className={cn("h-4 w-4", isRTL ? "ml-1.5" : "mr-1.5")} />
                {t.landing.hero.badge}
              </Badge>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-7 leading-tight reveal-up reveal-up-2 font-heading">
                {t.landing.hero.titlePart1}{' '}
                <span className="gradient-text animate-gradient-text bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent relative">
                  {t.landing.hero.titleHighlight}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed reveal-up reveal-up-3">
                {t.landing.hero.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center reveal-up reveal-up-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto btn-gradient btn-shine h-14 px-10 text-base shadow-soft-lg hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300">
                    {t.landing.hero.startFreeTrial}
                    <ArrowIcon className={cn("h-5 w-5", isRTL ? "mr-2" : "ml-2")} />
                  </Button>
                </Link>
                <Link href="#how-it-works" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 text-base hover-lift">
                    <Play className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
                    {t.landing.hero.watchDemo}
                  </Button>
                </Link>
              </div>

              <div className="mt-14 flex flex-wrap items-center justify-center gap-10 text-sm text-muted-foreground reveal-up reveal-up-5">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium">{t.landing.hero.noCreditCard}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium">{t.landing.hero.freeTrial}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium">{t.landing.hero.cancelAnytime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-14 bg-card border-y border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-primary/[0.02]" />
          <div className="container mx-auto px-4 lg:px-8 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <div className="text-center reveal-up reveal-up-1">
                <p className="text-5xl font-bold gradient-text mb-2 count-up">10,000+</p>
                <p className="text-sm text-muted-foreground font-medium">{t.landing.stats.activeTrainees}</p>
              </div>
              <div className="text-center reveal-up reveal-up-2">
                <p className="text-5xl font-bold gradient-text mb-2 count-up">95%</p>
                <p className="text-sm text-muted-foreground font-medium">{t.landing.stats.successRate}</p>
              </div>
              <div className="text-center reveal-up reveal-up-3">
                <p className="text-5xl font-bold gradient-text mb-2 count-up">50K+</p>
                <p className="text-sm text-muted-foreground font-medium">{t.landing.stats.sessionsCompleted}</p>
              </div>
              <div className="text-center reveal-up reveal-up-4">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <p className="text-5xl font-bold gradient-text count-up">4.9</p>
                  <Star className="h-6 w-6 fill-warning text-warning" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">{t.landing.stats.userRating}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16 reveal-up">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10 text-sm">{t.landing.nav.features}</Badge>
              <h2 className="text-4xl font-bold text-foreground mb-4 font-heading">{t.landing.features.title}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.landing.features.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="magnetic-card group border-border/50 reveal-up reveal-up-1">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5 group-hover:from-primary group-hover:to-emerald-600 transition-all duration-300">
                    <MessageSquare className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">{t.landing.features.aiSimulations.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t.landing.features.aiSimulations.description}</p>
                </CardContent>
              </Card>

              <Card className="magnetic-card group border-border/50 reveal-up reveal-up-2">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 flex items-center justify-center mb-5 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300">
                    <Phone className="h-7 w-7 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">{t.landing.features.voiceCalls.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t.landing.features.voiceCalls.description}</p>
                </CardContent>
              </Card>

              <Card className="magnetic-card group border-border/50 reveal-up reveal-up-3">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 flex items-center justify-center mb-5 group-hover:from-success group-hover:to-emerald-600 transition-all duration-300">
                    <BarChart className="h-7 w-7 text-success group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">{t.landing.features.analytics.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t.landing.features.analytics.description}</p>
                </CardContent>
              </Card>

              <Card className="magnetic-card group border-border/50 reveal-up reveal-up-4">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 flex items-center justify-center mb-5 group-hover:from-warning group-hover:to-amber-600 transition-all duration-300">
                    <BookOpen className="h-7 w-7 text-warning group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">{t.landing.features.courses.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t.landing.features.courses.description}</p>
                </CardContent>
              </Card>

              <Card className="magnetic-card group border-border/50 reveal-up reveal-up-5">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5 flex items-center justify-center mb-5 group-hover:from-destructive group-hover:to-red-600 transition-all duration-300">
                    <Award className="h-7 w-7 text-destructive group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">{t.landing.features.certifications.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t.landing.features.certifications.description}</p>
                </CardContent>
              </Card>

              <Card className="magnetic-card group border-border/50 reveal-up reveal-up-6">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-info/10 to-info/5 flex items-center justify-center mb-5 group-hover:from-info group-hover:to-sky-600 transition-all duration-300">
                    <Globe className="h-7 w-7 text-info group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 font-heading">{t.landing.features.bilingual.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t.landing.features.bilingual.description}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-28 bg-muted/30 relative overflow-hidden">
          <div className="gradient-line absolute top-0 left-0 right-0" />
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16 reveal-up">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10 text-sm">{t.landing.nav.howItWorks}</Badge>
              <h2 className="text-4xl font-bold text-foreground mb-4 font-heading">{t.landing.howItWorks.title}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.landing.howItWorks.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-16 relative">
              <div className="relative group reveal-up reveal-up-1">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-soft-lg group-hover:shadow-glow-lg group-hover:scale-105 transition-all duration-300">1</div>
                    <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-lg -z-10 group-hover:bg-primary/30 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4 font-heading">{t.landing.howItWorks.step1.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t.landing.howItWorks.step1.description}</p>
                </div>
                <div className={cn("hidden md:block absolute top-10 w-full h-[2px] step-connector", isRTL ? "right-full" : "left-full")} />
              </div>

              <div className="relative group reveal-up reveal-up-2">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-3xl font-bold shadow-soft-lg group-hover:shadow-glow-lg group-hover:scale-105 transition-all duration-300">2</div>
                    <div className="absolute -inset-2 bg-purple-500/20 rounded-2xl blur-lg -z-10 group-hover:bg-purple-500/30 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4 font-heading">{t.landing.howItWorks.step2.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t.landing.howItWorks.step2.description}</p>
                </div>
                <div className={cn("hidden md:block absolute top-10 w-full h-[2px] step-connector", isRTL ? "right-full" : "left-full")} />
              </div>

              <div className="relative group reveal-up reveal-up-3">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-soft-lg group-hover:shadow-glow-lg group-hover:scale-105 transition-all duration-300">3</div>
                    <div className="absolute -inset-2 bg-success/20 rounded-2xl blur-lg -z-10 group-hover:bg-success/30 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4 font-heading">{t.landing.howItWorks.step3.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t.landing.howItWorks.step3.description}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-28 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16 reveal-up">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10 text-sm">{t.landing.nav.testimonials}</Badge>
              <h2 className="text-4xl font-bold text-foreground mb-4 font-heading">{t.landing.testimonials.title}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.landing.testimonials.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {t.landing.testimonials.items.map((testimonial, index) => (
                <Card key={index} className={cn("magnetic-card reveal-up", `reveal-up-${index + 1}`)}>
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed quote-mark relative">
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
        <section className="py-32 bg-gradient-to-br from-primary via-emerald-600 to-blue-700 dark:from-primary/90 dark:via-emerald-700/80 dark:to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 lg:px-8 text-center relative reveal-up">
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight font-heading">{t.landing.cta.title}</h2>
            <p className="text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">{t.landing.cta.description}</p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/95 h-16 px-14 text-lg font-semibold shadow-soft-lg hover:shadow-glow-lg hover:scale-[1.02] transition-all duration-300 rounded-xl btn-shine">
                {t.landing.cta.button}
                <ArrowIcon className={cn("h-5 w-5", isRTL ? "mr-3" : "ml-3")} />
              </Button>
            </Link>
            <p className="mt-6 text-sm text-white/60">{t.landing.hero.noCreditCard}</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground font-heading">{t.landing.brandName}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.landing.footer.description}</p>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-4 text-base font-heading">{t.landing.footer.product}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.nav.features}</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.nav.pricing}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.courses}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.simulations}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-4 text-base font-heading">{t.landing.footer.company}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.about}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.blog}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.careers}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.contact}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-4 text-base font-heading">{t.landing.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.privacy}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.terms}</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{t.landing.footer.cookies}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {t.landing.brandName}. {t.landing.footer.allRightsReserved}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
