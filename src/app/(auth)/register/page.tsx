'use client';

/**
 * EstateIQ Registration Page
 *
 * Multi-step organization onboarding experience:
 * - Step 1: Organization Details (name, industry type)
 * - Step 2: Admin Account Setup (first user = org_admin)
 * - Step 3: Password & Confirmation
 *
 * Premium enterprise-grade UI with:
 * - Split-screen layout
 * - Progress indicators
 * - Glassmorphism effects
 * - Full RTL/Arabic support
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Building2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles,
  Video,
  Brain,
  BarChart3,
  Briefcase,
  Users,
  Shield,
  ChevronRight,
  ChevronLeft,
  Check,
  Building,
  User,
  Lock
} from 'lucide-react';

// Industry types for real estate organizations
const INDUSTRY_TYPES = [
  { value: 'real_estate_agency', labelEn: 'Real Estate Agency', labelAr: 'وكالة عقارية' },
  { value: 'property_development', labelEn: 'Property Development', labelAr: 'تطوير عقاري' },
  { value: 'brokerage', labelEn: 'Real Estate Brokerage', labelAr: 'وساطة عقارية' },
  { value: 'property_management', labelEn: 'Property Management', labelAr: 'إدارة الممتلكات' },
  { value: 'training_institute', labelEn: 'Training Institute', labelAr: 'معهد تدريب' },
  { value: 'corporate', labelEn: 'Corporate Real Estate', labelAr: 'عقارات الشركات' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

// Team size options
const TEAM_SIZES = [
  { value: '1-10', labelEn: '1-10 employees', labelAr: '1-10 موظفين' },
  { value: '11-50', labelEn: '11-50 employees', labelAr: '11-50 موظف' },
  { value: '51-200', labelEn: '51-200 employees', labelAr: '51-200 موظف' },
  { value: '200+', labelEn: '200+ employees', labelAr: '200+ موظف' },
];

interface FormData {
  // Step 1: Organization
  organizationName: string;
  industryType: string;
  teamSize: string;
  // Step 2: Admin Account
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  // Step 3: Security
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { register } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    industryType: '',
    teamSize: '',
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const NextArrow = isRTL ? ChevronLeft : ChevronRight;
  const PrevArrow = isRTL ? ChevronRight : ChevronLeft;

  const steps = [
    {
      number: 1,
      title: isRTL ? 'المؤسسة' : 'Organization',
      description: isRTL ? 'معلومات شركتك' : 'Your company info',
      icon: Building,
    },
    {
      number: 2,
      title: isRTL ? 'الحساب' : 'Account',
      description: isRTL ? 'بيانات المسؤول' : 'Admin details',
      icon: User,
    },
    {
      number: 3,
      title: isRTL ? 'الأمان' : 'Security',
      description: isRTL ? 'كلمة المرور' : 'Password setup',
      icon: Lock,
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.organizationName.trim()) {
          setError(isRTL ? 'يرجى إدخال اسم المؤسسة' : 'Please enter organization name');
          return false;
        }
        if (!formData.industryType) {
          setError(isRTL ? 'يرجى اختيار نوع النشاط' : 'Please select industry type');
          return false;
        }
        return true;
      case 2:
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError(isRTL ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
          return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
          setError(isRTL ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
          return false;
        }
        return true;
      case 3:
        if (formData.password.length < 8) {
          setError(isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setError('');
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsLoading(true);
    setError('');

    try {
      // The register function in useAuth handles role-based redirection
      // (org_admin/trainer -> /admin, trainee -> /dashboard)
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName,
        industryType: formData.industryType,
        teamSize: formData.teamSize,
        jobTitle: formData.jobTitle,
      });
      // Redirect is handled by useAuth.register based on role
    } catch (err) {
      setError(err instanceof Error ? err.message : (isRTL ? 'حدث خطأ أثناء التسجيل' : 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9!@#$%^&*]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthColor = passwordStrength <= 25 ? 'bg-destructive' :
    passwordStrength <= 50 ? 'bg-orange-500' :
    passwordStrength <= 75 ? 'bg-amber-500' : 'bg-emerald-500';

  const benefits = [
    {
      icon: Brain,
      title: isRTL ? 'تدريب بالذكاء الاصطناعي' : 'AI-Powered Training',
      description: isRTL ? 'محاكاة واقعية مع عملاء افتراضيين' : 'Realistic simulations with virtual clients',
    },
    {
      icon: BarChart3,
      title: isRTL ? 'تحليلات الأداء' : 'Performance Analytics',
      description: isRTL ? 'تقارير مفصلة لتحسين الأداء' : 'Detailed reports to improve performance',
    },
    {
      icon: Users,
      title: isRTL ? 'إدارة الفريق' : 'Team Management',
      description: isRTL ? 'أدوات متقدمة لإدارة المتدربين' : 'Advanced tools for managing trainees',
    },
    {
      icon: Shield,
      title: isRTL ? 'أمان المؤسسات' : 'Enterprise Security',
      description: isRTL ? 'حماية بيانات على مستوى المؤسسات' : 'Enterprise-grade data protection',
    },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      {/* Left Panel - Brand Showcase */}
      <div className={cn(
        "hidden lg:flex lg:w-[50%] relative flex-col justify-between p-10 xl:p-14 overflow-hidden",
        "auth-gradient-bg",
        isRTL && "order-2"
      )}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 -left-24 w-72 h-72 bg-estate-gold/15 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl animate-float" />
          <div className="absolute inset-0 auth-pattern opacity-30" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="p-3.5 glass rounded-2xl">
              <Building2 className="h-9 w-9 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight block">EstateIQ</span>
              <span className="text-sm text-white/60 font-medium">
                {isRTL ? 'منصة التدريب العقاري الذكية' : 'Intelligent Real Estate Training'}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-10 max-w-xl">
          {/* Badge */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-estate-gold" />
              <span className="text-sm text-white font-medium">
                {isRTL ? 'ابدأ تجربتك المجانية' : 'Start Your Free Trial'}
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-5">
              {isRTL
                ? 'ارتقِ بفريقك العقاري إلى مستوى جديد'
                : 'Take Your Real Estate Team to the Next Level'}
            </h1>
            <p className="text-lg text-white/75 leading-relaxed">
              {isRTL
                ? 'انضم إلى أكثر من 50 مؤسسة عقارية تستخدم EstateIQ لتدريب فرقها وتحسين أدائها.'
                : 'Join 50+ real estate organizations using EstateIQ to train their teams and boost performance.'}
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-2xl transition-all duration-300 group cursor-default",
                  "bg-white/[0.07] backdrop-blur-sm border border-white/10",
                  "hover:bg-white/[0.12] hover:border-white/20"
                )}
              >
                <div className="p-2.5 bg-gradient-to-br from-emerald-400/25 to-estate-gold/20 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-5 w-5 text-emerald-300" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{benefit.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-6 pt-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {['A', 'B', 'C', 'D'].map((letter, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-estate-gold border-2 border-white/20 flex items-center justify-center text-white text-xs font-bold shadow-lg"
                >
                  {letter}
                </div>
              ))}
            </div>
            <div>
              <span className="text-white font-bold text-lg">2,500+</span>
              <span className="text-white/60 text-sm block">
                {isRTL ? 'محترف انضم هذا الشهر' : 'professionals joined this month'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-white/40">
            {isRTL ? 'تجربة مجانية لمدة 14 يوم • لا يلزم بطاقة ائتمان' : '14-day free trial • No credit card required'}
          </p>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className={cn(
        "flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-10 overflow-y-auto",
        "bg-gradient-to-b from-background via-background to-muted/20",
        isRTL && "order-1"
      )}>
        <div className="w-full max-w-[480px] animate-fade-in-up">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">EstateIQ</span>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                      currentStep === step.number
                        ? "bg-primary text-white shadow-soft shadow-primary/25"
                        : currentStep > step.number
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {currentStep > step.number ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={cn(
                        "text-sm font-semibold transition-colors",
                        currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-full h-1 mx-3 rounded-full transition-colors",
                      currentStep > step.number ? "bg-emerald-500" : "bg-muted"
                    )} style={{ minWidth: '40px', maxWidth: '80px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Registration Card */}
          <div className="card-premium p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-1">
                {currentStep === 1 && (isRTL ? 'معلومات المؤسسة' : 'Organization Details')}
                {currentStep === 2 && (isRTL ? 'حساب المسؤول' : 'Admin Account')}
                {currentStep === 3 && (isRTL ? 'إعداد كلمة المرور' : 'Set Your Password')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentStep === 1 && (isRTL ? 'أخبرنا عن مؤسستك' : 'Tell us about your organization')}
                {currentStep === 2 && (isRTL ? 'ستكون أنت مسؤول المؤسسة' : "You'll be the organization admin")}
                {currentStep === 3 && (isRTL ? 'اختر كلمة مرور قوية' : 'Choose a strong password')}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center gap-3 animate-fade-in-up">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Organization */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in-up">
                  <div className="space-y-2.5">
                    <label htmlFor="organizationName" className="text-sm font-medium text-foreground">
                      {isRTL ? 'اسم المؤسسة' : 'Organization Name'} <span className="text-destructive">*</span>
                    </label>
                    <div className={cn(
                      "relative rounded-xl transition-all duration-300",
                      focusedField === 'organizationName' && "ring-2 ring-primary/25"
                    )}>
                      <Input
                        id="organizationName"
                        name="organizationName"
                        placeholder={isRTL ? 'مثال: شركة النخبة العقارية' : 'e.g., Elite Real Estate Co.'}
                        value={formData.organizationName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('organizationName')}
                        onBlur={() => setFocusedField(null)}
                        className="input-premium h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="industryType" className="text-sm font-medium text-foreground">
                      {isRTL ? 'نوع النشاط' : 'Industry Type'} <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="industryType"
                      name="industryType"
                      value={formData.industryType}
                      onChange={handleChange}
                      className="input-premium h-12 w-full appearance-none cursor-pointer"
                    >
                      <option value="">{isRTL ? 'اختر نوع النشاط' : 'Select industry type'}</option>
                      {INDUSTRY_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {isRTL ? type.labelAr : type.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="teamSize" className="text-sm font-medium text-foreground">
                      {isRTL ? 'حجم الفريق' : 'Team Size'}
                    </label>
                    <select
                      id="teamSize"
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      className="input-premium h-12 w-full appearance-none cursor-pointer"
                    >
                      <option value="">{isRTL ? 'اختر حجم الفريق (اختياري)' : 'Select team size (optional)'}</option>
                      {TEAM_SIZES.map(size => (
                        <option key={size.value} value={size.value}>
                          {isRTL ? size.labelAr : size.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Admin Account */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2.5">
                      <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                        {isRTL ? 'الاسم الأول' : 'First Name'} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder={isRTL ? 'الاسم الأول' : 'First name'}
                        value={formData.firstName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField(null)}
                        className={cn(
                          "input-premium h-12",
                          focusedField === 'firstName' && "ring-2 ring-primary/25"
                        )}
                      />
                    </div>
                    <div className="space-y-2.5">
                      <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                        {isRTL ? 'اسم العائلة' : 'Last Name'} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder={isRTL ? 'اسم العائلة' : 'Last name'}
                        value={formData.lastName}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                        className={cn(
                          "input-premium h-12",
                          focusedField === 'lastName' && "ring-2 ring-primary/25"
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      {isRTL ? 'البريد الإلكتروني' : 'Work Email'} <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'you@company.com'}
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "input-premium h-12",
                        focusedField === 'email' && "ring-2 ring-primary/25"
                      )}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="jobTitle" className="text-sm font-medium text-foreground">
                      {isRTL ? 'المسمى الوظيفي' : 'Job Title'}
                    </label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      placeholder={isRTL ? 'مثال: مدير التدريب' : 'e.g., Training Manager'}
                      value={formData.jobTitle}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('jobTitle')}
                      onBlur={() => setFocusedField(null)}
                      className={cn(
                        "input-premium h-12",
                        focusedField === 'jobTitle' && "ring-2 ring-primary/25"
                      )}
                    />
                  </div>

                  {/* Admin Badge */}
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {isRTL ? 'سيتم تعيينك كمسؤول المؤسسة' : "You'll be assigned as Organization Admin"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? 'يمكنك إضافة مدربين ومتدربين لاحقاً' : 'You can add trainers and trainees later'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Password */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fade-in-up">
                  <div className="space-y-2.5">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      {isRTL ? 'كلمة المرور' : 'Password'} <span className="text-destructive">*</span>
                    </label>
                    <div className={cn(
                      "relative rounded-xl transition-all duration-300",
                      focusedField === 'password' && "ring-2 ring-primary/25"
                    )}>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
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

                    {/* Password Strength */}
                    {formData.password && (
                      <div className="space-y-2 animate-fade-in-up">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full transition-all duration-300", strengthColor)}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? 'قوة كلمة المرور:' : 'Password strength:'}{' '}
                          <span className={cn(
                            "font-medium",
                            passwordStrength <= 25 ? 'text-destructive' :
                            passwordStrength <= 50 ? 'text-orange-500' :
                            passwordStrength <= 75 ? 'text-amber-500' : 'text-emerald-500'
                          )}>
                            {passwordStrength <= 25 ? (isRTL ? 'ضعيفة' : 'Weak') :
                             passwordStrength <= 50 ? (isRTL ? 'متوسطة' : 'Fair') :
                             passwordStrength <= 75 ? (isRTL ? 'جيدة' : 'Good') :
                             (isRTL ? 'قوية' : 'Strong')}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span className="text-destructive">*</span>
                    </label>
                    <div className={cn(
                      "relative rounded-xl transition-all duration-300",
                      focusedField === 'confirmPassword' && "ring-2 ring-primary/25"
                    )}>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder={isRTL ? 'أعد إدخال كلمة المرور' : 'Confirm your password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        className={cn(
                          "input-premium h-12",
                          isRTL ? "pl-12" : "pr-12"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50",
                          isRTL ? "left-2" : "right-2"
                        )}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    {formData.confirmPassword && formData.password && (
                      <div className="flex items-center gap-2 animate-fade-in-up">
                        {formData.password === formData.confirmPassword ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs text-emerald-500">
                              {isRTL ? 'كلمات المرور متطابقة' : 'Passwords match'}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-destructive" />
                            <span className="text-xs text-destructive">
                              {isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center gap-4 mt-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    className="flex-1 h-12 rounded-xl border-border hover:bg-muted/50"
                  >
                    <PrevArrow className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
                    {isRTL ? 'السابق' : 'Previous'}
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 btn-premium h-12"
                  >
                    {isRTL ? 'التالي' : 'Next'}
                    <NextArrow className={cn("h-5 w-5", isRTL ? "mr-2" : "ml-2")} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 btn-premium h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className={cn("h-5 w-5 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                        {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {isRTL ? 'إنشاء الحساب' : 'Create Account'}
                        <Sparkles className={cn("h-5 w-5", isRTL ? "mr-2" : "ml-2")} />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                <Link
                  href="/login"
                  className="text-primary font-semibold hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                >
                  {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
              </p>
            </div>
          </div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {isRTL ? 'بإنشاء حساب، فإنك توافق على' : 'By creating an account, you agree to our'}{' '}
            <Link href="/terms" className="text-primary hover:underline">
              {isRTL ? 'شروط الخدمة' : 'Terms of Service'}
            </Link>
            {' '}{isRTL ? 'و' : 'and'}{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
