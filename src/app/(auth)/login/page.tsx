'use client';

/**
 * InLearn Login Page — "Luminous Knowledge" Design
 *
 * A bold, editorial login experience featuring:
 * - Dramatic dark showcase panel with animated knowledge pathways
 * - Layered depth with mesh gradients and particle-like dots
 * - Large typographic statements with staggered reveals
 * - Pristine, airy form panel with floating label-style inputs
 * - Micro-interactions: morphing focus rings, icon transitions
 * - Full RTL/Arabic support with Cairo + Alexandria fonts
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Brain,
  BarChart3,
  BookOpen,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { InLearnLogo } from '@/components/ui/InLearnLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
  };

  const capabilities = [
    {
      icon: Brain,
      label: isRTL ? 'محاكاة ذكية' : 'AI Simulations',
      color: 'from-emerald-400 to-teal-300',
    },
    {
      icon: BarChart3,
      label: isRTL ? 'تحليلات فورية' : 'Live Analytics',
      color: 'from-sky-400 to-blue-300',
    },
    {
      icon: BookOpen,
      label: isRTL ? 'مسارات تعلم' : 'Learning Paths',
      color: 'from-violet-400 to-purple-300',
    },
    {
      icon: Shield,
      label: isRTL ? 'بيئة آمنة' : 'Safe Environment',
      color: 'from-amber-400 to-orange-300',
    },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      {/* ═══════════════════════════════════════════════════════
          SHOWCASE PANEL — Dark, dramatic, editorial
         ═══════════════════════════════════════════════════════ */}
      <div
        className={cn(
          'hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col overflow-hidden',
          isRTL && 'order-2'
        )}
      >
        {/* Base gradient — lighter emerald/teal tones */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, #0a2820 0%, #0d2e28 25%, #0f2d25 50%, #0d3535 75%, #0a2420 100%)',
          }}
        />

        {/* Mesh gradient overlay — creates depth zones */}
        <div className="absolute inset-0 login-mesh-gradient" />

        {/* Animated knowledge pathway lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="login-pathway login-pathway-1" />
          <div className="login-pathway login-pathway-2" />
          <div className="login-pathway login-pathway-3" />
        </div>

        {/* Floating luminous particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="login-particle" style={{ top: '15%', left: '20%', animationDelay: '0s' }} />
          <div className="login-particle" style={{ top: '40%', left: '70%', animationDelay: '2s' }} />
          <div className="login-particle" style={{ top: '65%', left: '35%', animationDelay: '4s' }} />
          <div className="login-particle" style={{ top: '80%', left: '80%', animationDelay: '1s' }} />
          <div className="login-particle" style={{ top: '25%', left: '55%', animationDelay: '3s' }} />
          <div className="login-particle" style={{ top: '55%', left: '15%', animationDelay: '5s' }} />
        </div>

        {/* Subtle grain texture */}
        <div className="absolute inset-0 login-grain" />

        {/* Content layer */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-14">
          {/* ── TOP: Brand Mark ── */}
          <div
            className={cn(
              'transition-all duration-700 ease-out',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            )}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                  <path d="M16 9C16 9 11 7.5 5 8.3V23C11 22.2 16 23.7 16 23.7V9Z" fill="white" opacity="0.9" />
                  <path d="M16 9C16 9 21 7.5 27 8.3V23C21 22.2 16 23.7 16 23.7V9Z" fill="white" opacity="0.6" />
                  <path d="M16 3L8 7L16 11L24 7L16 3Z" fill="white" opacity="0.95" />
                  <line x1="22" y1="7" x2="22" y2="11" stroke="white" strokeWidth="1" opacity="0.6" />
                  <circle cx="22" cy="11.5" r="1" fill="white" opacity="0.6" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold text-white/90 tracking-tight font-heading">
                  InLearn
                </span>
                <span className="text-[11px] text-white/30 block -mt-0.5 tracking-wide uppercase">
                  {isRTL ? 'منصة التدريب الذكية' : 'Smart Training Platform'}
                </span>
              </div>
            </div>
          </div>

          {/* ── CENTER: Hero statement ── */}
          <div className="space-y-10 max-w-lg">
            {/* Large typographic headline */}
            <div className="space-y-5">
              <h1
                className={cn(
                  'text-[2.75rem] xl:text-[3.25rem] font-bold text-white leading-[1.08] tracking-tight font-heading transition-all duration-700 delay-100 ease-out',
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                )}
              >
                {isRTL ? (
                  <>
                    تعلّم. تدرّب.
                    <br />
                    <span className="login-gradient-text">تميّز.</span>
                  </>
                ) : (
                  <>
                    Learn. Practice.
                    <br />
                    <span className="login-gradient-text">Excel.</span>
                  </>
                )}
              </h1>

              <p
                className={cn(
                  'text-base xl:text-lg text-white/40 leading-relaxed max-w-md transition-all duration-700 delay-200 ease-out',
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                )}
              >
                {isRTL
                  ? 'منصة تدريب مؤسسي مدعومة بالذكاء الاصطناعي، تحوّل الموظفين إلى محترفين.'
                  : 'AI-powered corporate training that transforms employees into high-performers.'}
              </p>
            </div>

            {/* Capability pills — horizontal scroll feel */}
            <div
              className={cn(
                'flex flex-wrap gap-2.5 transition-all duration-700 delay-300 ease-out',
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
            >
              {capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 cursor-default"
                >
                  <div className={cn('w-6 h-6 rounded-md bg-gradient-to-br flex items-center justify-center', cap.color)}>
                    <cap.icon className="h-3.5 w-3.5 text-gray-900" />
                  </div>
                  <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors font-medium">
                    {cap.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Social proof strip */}
            <div
              className={cn(
                'flex items-center gap-8 pt-4 transition-all duration-700 delay-500 ease-out',
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              )}
            >
              {[
                { value: '2,500+', label: isRTL ? 'متدرب نشط' : 'Active Learners' },
                { value: '95%', label: isRTL ? 'معدل النجاح' : 'Success Rate' },
                { value: '50+', label: isRTL ? 'مؤسسة' : 'Organizations' },
              ].map((stat, i) => (
                <div key={i} className="space-y-0.5">
                  <span className="text-2xl xl:text-3xl font-bold text-white font-heading">{stat.value}</span>
                  <span className="text-[11px] text-white/30 block uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── BOTTOM: Testimonial quote ── */}
          <div
            className={cn(
              'max-w-md transition-all duration-700 delay-500 ease-out',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            )}
          >
            <div className="relative">
              <div className="absolute -top-3 -left-1 text-emerald-400/20 text-5xl font-serif leading-none">&ldquo;</div>
              <blockquote className="text-sm text-white/50 leading-relaxed italic pl-5">
                {isRTL
                  ? 'InLearn غيّرت طريقة تدريبنا بالكامل. أداء فريقنا تحسّن بنسبة 40% خلال 3 أشهر فقط.'
                  : 'InLearn completely transformed how we train. Our team performance improved 40% in just 3 months.'}
              </blockquote>
              <div className="flex items-center gap-3 mt-4 pl-5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-500/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-300">
                    {isRTL ? 'م.ع' : 'S.A'}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-medium text-white/60 block">
                    {isRTL ? 'محمد العتيبي' : 'Sarah Anderson'}
                  </span>
                  <span className="text-[10px] text-white/25 block">
                    {isRTL ? 'مدير التدريب، شركة المستقبل' : 'Head of Training, TechCorp'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          FORM PANEL — Clean, airy, refined
         ═══════════════════════════════════════════════════════ */}
      <div
        className={cn(
          'flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16',
          'relative overflow-hidden',
          isRTL && 'order-1'
        )}
      >
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/[0.02]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Mobile Brand Header */}
          <div
            className={cn(
              'lg:hidden flex items-center justify-center gap-3 mb-10 transition-all duration-500',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            )}
          >
            <InLearnLogo size="md" />
            <span className="text-xl font-bold text-foreground tracking-tight font-heading">InLearn</span>
          </div>

          {/* Welcome Header */}
          <div
            className={cn(
              'mb-8 transition-all duration-600 delay-75 ease-out',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-emerald-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-[1.7rem] font-bold text-foreground tracking-tight font-heading">
              {isRTL ? 'مرحباً بعودتك' : 'Welcome back'}
            </h2>
            <p className="text-muted-foreground mt-1.5 text-[15px]">
              {isRTL ? 'سجّل دخولك للمتابعة في رحلة التدريب' : 'Sign in to continue your training journey'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="p-3.5 text-sm text-destructive bg-destructive/8 rounded-xl border border-destructive/15 flex items-center gap-3 animate-fade-in-up">
                <div className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse flex-shrink-0" />
                <span className="text-[13px]">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div
              className={cn(
                'space-y-2 transition-all duration-600 delay-150 ease-out',
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
            >
              <label htmlFor="email" className="text-[13px] font-semibold text-foreground/80 uppercase tracking-wider">
                {isRTL ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder={isRTL ? 'name@company.com' : 'name@company.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={cn(
                    'h-12 rounded-xl bg-muted/30 border-border/60 px-4 text-sm transition-all duration-300',
                    'placeholder:text-muted-foreground/50',
                    'focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 focus-visible:bg-background',
                    'hover:border-border hover:bg-muted/40',
                    focusedField === 'email' && 'bg-background border-primary/40 ring-2 ring-primary/20'
                  )}
                />
                {/* Active indicator line */}
                <div
                  className={cn(
                    'absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-full transition-all duration-300',
                    focusedField === 'email' ? 'w-3/4 opacity-100' : 'w-0 opacity-0'
                  )}
                />
              </div>
            </div>

            {/* Password Field */}
            <div
              className={cn(
                'space-y-2 transition-all duration-600 delay-200 ease-out',
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
            >
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[13px] font-semibold text-foreground/80 uppercase tracking-wider">
                  {isRTL ? 'كلمة المرور' : 'Password'}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary/70 hover:text-primary transition-colors font-medium"
                >
                  {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot?'}
                </Link>
              </div>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className={cn(
                    'h-12 rounded-xl bg-muted/30 border-border/60 px-4 text-sm transition-all duration-300',
                    'placeholder:text-muted-foreground/50',
                    'focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 focus-visible:bg-background',
                    'hover:border-border hover:bg-muted/40',
                    isRTL ? 'pl-12' : 'pr-12',
                    focusedField === 'password' && 'bg-background border-primary/40 ring-2 ring-primary/20'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 p-2 text-muted-foreground/50 hover:text-foreground/70 transition-all duration-200 rounded-lg',
                    isRTL ? 'left-1.5' : 'right-1.5'
                  )}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
                {/* Active indicator line */}
                <div
                  className={cn(
                    'absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-full transition-all duration-300',
                    focusedField === 'password' ? 'w-3/4 opacity-100' : 'w-0 opacity-0'
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div
              className={cn(
                'pt-1 transition-all duration-600 delay-200 ease-out',
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
            >
              <Button
                type="submit"
                className={cn(
                  'w-full h-12 rounded-xl text-[15px] font-semibold group relative overflow-hidden',
                  'bg-gradient-to-r from-primary via-emerald-500 to-teal-500',
                  'hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-[1px]',
                  'active:translate-y-0 active:shadow-md',
                  'transition-all duration-200'
                )}
                disabled={isLoading}
              >
                {/* Shine sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      {isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      {isRTL ? 'تسجيل الدخول' : 'Sign in'}
                      <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    </>
                  )}
                </span>
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div
            className={cn(
              'relative my-6 transition-all duration-600 delay-300 ease-out',
              mounted ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-background text-[11px] text-muted-foreground/60 uppercase tracking-widest">
                {isRTL ? 'أو' : 'or'}
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div
            className={cn(
              'transition-all duration-600 delay-300 ease-out',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <Link href="/register" className="block">
              <button className="w-full h-12 rounded-xl border border-border/60 bg-background hover:bg-muted/30 hover:border-border transition-all duration-200 text-[15px] font-medium text-foreground/80 hover:text-foreground group flex items-center justify-center gap-2">
                {isRTL ? 'إنشاء حساب جديد' : 'Create an account'}
                <ChevronIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-all duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </button>
            </Link>
          </div>

          {/* Terms */}
          <p
            className={cn(
              'mt-6 text-center text-[11px] text-muted-foreground/50 leading-relaxed transition-all duration-600 delay-500 ease-out',
              mounted ? 'opacity-100' : 'opacity-0'
            )}
          >
            {isRTL ? 'بتسجيل الدخول، فإنك توافق على' : 'By signing in, you agree to our'}{' '}
            <Link href="/terms" className="text-muted-foreground/70 hover:text-foreground/70 underline underline-offset-2 transition-colors">
              {isRTL ? 'شروط الخدمة' : 'Terms'}
            </Link>
            {' '}{isRTL ? 'و' : '&'}{' '}
            <Link href="/privacy" className="text-muted-foreground/70 hover:text-foreground/70 underline underline-offset-2 transition-colors">
              {isRTL ? 'سياسة الخصوصية' : 'Privacy'}
            </Link>
          </p>

          {/* Demo Credentials — Development */}
          <div
            className={cn(
              'mt-5 transition-all duration-600 delay-500 ease-out',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider">
                  {isRTL ? 'تسجيل سريع - بيانات التجربة' : 'Quick Login - Demo Accounts'}
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    role: isRTL ? 'مدير المنصة' : 'Super Admin',
                    email: 'superadmin@estateiq.com',
                    password: '123456',
                    color: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20',
                    borderColor: 'border-rose-500/20 hover:border-rose-500/40'
                  },
                  {
                    role: isRTL ? 'مدير' : 'Admin',
                    email: 'admin@macsoft.com',
                    password: '123456',
                    color: 'bg-primary/10 text-primary hover:bg-primary/20',
                    borderColor: 'border-primary/20 hover:border-primary/40'
                  },
                  {
                    role: isRTL ? 'مدرب' : 'Trainer',
                    email: 'abdullah@macsoft.com',
                    password: '123456',
                    color: 'bg-violet-500/10 text-violet-500 hover:bg-violet-500/20',
                    borderColor: 'border-violet-500/20 hover:border-violet-500/40'
                  },
                  {
                    role: isRTL ? 'متدرب' : 'Trainee',
                    email: 'fahad@macsoft.com',
                    password: '123456',
                    color: 'bg-sky-500/10 text-sky-500 hover:bg-sky-500/20',
                    borderColor: 'border-sky-500/20 hover:border-sky-500/40'
                  },
                ].map((cred, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickFill(cred.email, cred.password)}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 p-2.5 rounded-lg border transition-all duration-200',
                      'hover:shadow-sm active:scale-[0.98]',
                      cred.color,
                      cred.borderColor
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-background/40">
                        {cred.role}
                      </span>
                      <code className="text-muted-foreground/70 font-mono text-[11px] truncate">
                        {cred.email}
                      </code>
                    </div>
                    <div className="flex-shrink-0">
                      <ChevronIcon className="h-3.5 w-3.5 opacity-50" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-2 mt-2 border-t border-border/30 text-[10px] text-muted-foreground/50 text-center">
                {isRTL ? 'انقر على أي دور لملء النموذج تلقائياً' : 'Click any role to auto-fill the form'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
