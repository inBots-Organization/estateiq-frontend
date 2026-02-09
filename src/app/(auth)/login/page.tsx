'use client';

/**
 * INLEARN Login Page
 *
 * Premium enterprise-grade login experience with:
 * - Split-screen layout (Brand visualization + Clean form)
 * - Glassmorphism effects in dark mode
 * - Smooth micro-interactions
 * - Full RTL/Arabic support
 */

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Building2,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  TrendingUp,
  Users,
  Brain,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

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

  const platformFeatures = [
    {
      icon: Brain,
      title: isRTL ? 'تدريب بالذكاء الاصطناعي' : 'AI-Powered Training',
      description: isRTL ? 'محاكاة واقعية مع عملاء افتراضيين ذكيين' : 'Realistic simulations with intelligent virtual clients',
    },
    {
      icon: BarChart3,
      title: isRTL ? 'تحليلات متقدمة' : 'Advanced Analytics',
      description: isRTL ? 'تقارير أداء تفصيلية ورؤى قابلة للتنفيذ' : 'Detailed performance reports and actionable insights',
    },
    {
      icon: Shield,
      title: isRTL ? 'بيئة آمنة للتعلم' : 'Safe Learning Environment',
      description: isRTL ? 'تدرب بحرية دون ضغوط العالم الحقيقي' : 'Practice freely without real-world pressure',
    },
  ];

  const trustedStats = [
    { value: '2,500+', label: isRTL ? 'متدرب نشط' : 'Active Trainees', icon: Users },
    { value: '95%', label: isRTL ? 'معدل النجاح' : 'Success Rate', icon: TrendingUp },
    { value: '50+', label: isRTL ? 'مؤسسة عقارية' : 'Real Estate Firms', icon: Building2 },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      {/* Left Panel - Brand Showcase */}
      <div className={cn(
        "hidden lg:flex lg:w-[55%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden",
        "auth-gradient-bg",
        isRTL && "order-2"
      )}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 -left-24 w-72 h-72 bg-estate-gold/15 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl animate-float" />

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 auth-pattern opacity-30" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="p-3.5 glass rounded-2xl">
              <Building2 className="h-9 w-9 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight block">INLEARN</span>
              <span className="text-sm text-white/60 font-medium">
                {isRTL ? 'منصة التدريب العقاري الذكية' : 'Intelligent Real Estate Training'}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-10 max-w-xl">
          {/* Main Headline */}
          <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
              {isRTL
                ? 'طوّر مهاراتك العقارية مع قوة الذكاء الاصطناعي'
                : 'Elevate Your Real Estate Skills with AI'}
            </h1>
            <p className="text-lg text-white/75 leading-relaxed max-w-md">
              {isRTL
                ? 'انضم إلى آلاف المحترفين الذين يستخدمون INLEARN لتحسين أدائهم وإتقان فن المبيعات العقارية.'
                : 'Join thousands of professionals using INLEARN to enhance their performance and master the art of real estate sales.'}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {platformFeatures.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-2xl transition-all duration-300",
                  "bg-white/[0.07] backdrop-blur-sm border border-white/10",
                  "hover:bg-white/[0.12] hover:border-white/20 group cursor-default"
                )}
              >
                <div className="p-2.5 bg-gradient-to-br from-emerald-400/25 to-estate-gold/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-5 w-5 text-emerald-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-emerald-200 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-400/60 flex-shrink-0 mt-0.5" />
              </div>
            ))}
          </div>

          {/* Trust Stats */}
          <div className="flex items-center gap-6 xl:gap-8 pt-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {trustedStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <stat.icon className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className="text-xs text-white/50 block">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-white/40">
            {isRTL
              ? '© 2024 INLEARN. جميع الحقوق محفوظة.'
              : '© 2024 INLEARN. All rights reserved.'}
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={cn(
        "flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12",
        "bg-gradient-to-b from-background via-background to-muted/20",
        isRTL && "order-1"
      )}>
        <div className="w-full max-w-[420px] animate-fade-in-up">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">INLEARN</span>
          </div>

          {/* Login Card */}
          <div className="card-premium p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary/20 via-emerald-500/15 to-estate-gold/10 rounded-2xl flex items-center justify-center mb-5 shadow-soft">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isRTL ? 'مرحباً بعودتك' : 'Welcome Back'}
              </h2>
              <p className="text-muted-foreground">
                {isRTL ? 'سجّل دخولك للمتابعة في رحلة التدريب' : 'Sign in to continue your training journey'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-3 animate-fade-in-up">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className={cn(
                  "relative rounded-xl transition-all duration-300",
                  focusedField === 'email' && "ring-2 ring-primary/25"
                )}>
                  <Input
                    id="email"
                    type="email"
                    placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="input-premium h-12"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    {isRTL ? 'كلمة المرور' : 'Password'}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </Link>
                </div>
                <div className={cn(
                  "relative rounded-xl transition-all duration-300",
                  focusedField === 'password' && "ring-2 ring-primary/25"
                )}>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={cn(
                      "input-premium h-12",
                      isRTL ? "pl-12" : "pr-12"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50",
                      isRTL ? "left-2" : "right-2"
                    )}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="btn-premium w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className={cn("h-5 w-5 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                    {isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                    <ArrowIcon className={cn(
                      "h-5 w-5 transition-transform",
                      isRTL ? "mr-2 group-hover:-translate-x-1" : "ml-2 group-hover:translate-x-1"
                    )} />
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-card text-muted-foreground">
                    {isRTL ? 'أو' : 'or'}
                  </span>
                </div>
              </div>

              {/* Register Link */}
              <p className="text-sm text-muted-foreground text-center">
                {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                <Link
                  href="/register"
                  className="text-primary font-semibold hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                >
                  {isRTL ? 'إنشاء حساب جديد' : 'Create Account'}
                </Link>
              </p>
            </form>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {isRTL ? 'بتسجيل الدخول، فإنك توافق على' : 'By signing in, you agree to our'}{' '}
            <Link href="/terms" className="text-primary hover:underline">
              {isRTL ? 'شروط الخدمة' : 'Terms of Service'}
            </Link>
            {' '}{isRTL ? 'و' : 'and'}{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </Link>
          </p>

          {/* Demo Credentials - Development Only */}
          <div className="mt-5 p-4 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-xs font-semibold text-foreground">
                {isRTL ? 'بيانات التجربة السريعة' : 'Demo Credentials'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded font-medium">
                  {isRTL ? 'مدير المنصة' : 'Super Admin'}
                </span>
                <code className="text-slate-600 dark:text-muted-foreground font-mono">superadmin@inlearn.ai</code>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded font-medium">
                  {isRTL ? 'مدير' : 'Admin'}
                </span>
                <code className="text-slate-600 dark:text-muted-foreground font-mono">admin@macsoft.com</code>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded font-medium">
                  {isRTL ? 'مدرب' : 'Trainer'}
                </span>
                <code className="text-slate-600 dark:text-muted-foreground font-mono">abdullah@macsoft.com</code>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded font-medium">
                  {isRTL ? 'متدرب' : 'Trainee'}
                </span>
                <code className="text-slate-600 dark:text-muted-foreground font-mono">fahad@macsoft.com</code>
              </div>
              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                {isRTL ? 'كلمة المرور:' : 'Password:'} <code className="font-mono text-foreground">Test1234</code>
                <br />
                <span className="text-rose-500">{isRTL ? 'مدير المنصة:' : 'Super Admin:'}</span> <code className="font-mono text-foreground">SuperAdmin@123!</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
