'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  Zap,
  Users,
  Phone,
  Clock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Download,
  ExternalLink,
  Sparkles,
  Brain,
  Building2,
  Crown,
} from 'lucide-react';

export default function BillingPage() {
  const { isRTL } = useLanguage();

  // Static billing data
  const subscriptionPlan = {
    name: isRTL ? 'خطة المؤسسات' : 'Enterprise Plan',
    status: 'active',
    price: '$299',
    billingCycle: isRTL ? 'شهرياً' : 'per month',
    nextBillingDate: '2026-03-01',
    features: [
      isRTL ? 'عدد غير محدود من المتدربين' : 'Unlimited trainees',
      isRTL ? '100 ساعة تدريب ذكاء اصطناعي' : '100 hours AI training',
      isRTL ? 'تقارير متقدمة' : 'Advanced reports',
      isRTL ? 'دعم ذو أولوية' : 'Priority support',
      isRTL ? 'تخصيص السيناريوهات' : 'Custom scenarios',
    ],
  };

  const usageStats = {
    aiHoursUsed: 42.5,
    aiHoursTotal: 100,
    simulationCalls: 156,
    simulationCallsTotal: 500,
    voiceCalls: 89,
    voiceCallsTotal: 200,
    activeSeats: 8,
    totalSeats: 25,
  };

  const invoices = [
    { id: 'INV-2026-001', date: '2026-02-01', amount: '$299.00', status: 'paid' },
    { id: 'INV-2026-000', date: '2026-01-01', amount: '$299.00', status: 'paid' },
    { id: 'INV-2025-012', date: '2025-12-01', amount: '$299.00', status: 'paid' },
    { id: 'INV-2025-011', date: '2025-11-01', amount: '$299.00', status: 'paid' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isRTL ? 'المدفوعات والاستهلاك' : 'Billing & Usage'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL ? 'إدارة اشتراكك ومتابعة استهلاك الفريق' : 'Manage your subscription and track team usage'}
          </p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
          <CreditCard className="h-4 w-4" />
          {isRTL ? 'إدارة الفواتير' : 'Manage Billing'}
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {/* Subscription Plan Card */}
      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-glow">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  {subscriptionPlan.name}
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                    <CheckCircle className={cn("h-3 w-3", isRTL ? "ml-1" : "mr-1")} />
                    {isRTL ? 'نشط' : 'Active'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'اشتراكك الحالي' : 'Your current subscription'}
                </CardDescription>
              </div>
            </div>
            <div className={cn("text-right", isRTL && "text-left")}>
              <p className="text-3xl font-bold text-foreground">{subscriptionPlan.price}</p>
              <p className="text-sm text-muted-foreground">{subscriptionPlan.billingCycle}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-6">
            {subscriptionPlan.features.map((feature, index) => (
              <Badge key={index} variant="outline" className="py-1.5 px-3 border-violet-500/20 bg-violet-500/5">
                <CheckCircle className={cn("h-3 w-3 text-violet-500", isRTL ? "ml-1.5" : "mr-1.5")} />
                {feature}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {isRTL ? 'التجديد التالي:' : 'Next billing:'} {formatDate(subscriptionPlan.nextBillingDate)}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* AI Hours */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Brain className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'ساعات الذكاء الاصطناعي' : 'AI Hours'}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {usageStats.aiHoursUsed}<span className="text-sm text-muted-foreground font-normal">/{usageStats.aiHoursTotal}</span>
                  </p>
                </div>
              </div>
            </div>
            <Progress value={(usageStats.aiHoursUsed / usageStats.aiHoursTotal) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((usageStats.aiHoursUsed / usageStats.aiHoursTotal) * 100)}% {isRTL ? 'مستخدم' : 'used'}
            </p>
          </CardContent>
        </Card>

        {/* Simulation Calls */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'محاكاة نصية' : 'Text Simulations'}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {usageStats.simulationCalls}<span className="text-sm text-muted-foreground font-normal">/{usageStats.simulationCallsTotal}</span>
                  </p>
                </div>
              </div>
            </div>
            <Progress value={(usageStats.simulationCalls / usageStats.simulationCallsTotal) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((usageStats.simulationCalls / usageStats.simulationCallsTotal) * 100)}% {isRTL ? 'مستخدم' : 'used'}
            </p>
          </CardContent>
        </Card>

        {/* Voice Calls */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                  <Phone className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'مكالمات صوتية' : 'Voice Calls'}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {usageStats.voiceCalls}<span className="text-sm text-muted-foreground font-normal">/{usageStats.voiceCallsTotal}</span>
                  </p>
                </div>
              </div>
            </div>
            <Progress value={(usageStats.voiceCalls / usageStats.voiceCallsTotal) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((usageStats.voiceCalls / usageStats.voiceCallsTotal) * 100)}% {isRTL ? 'مستخدم' : 'used'}
            </p>
          </CardContent>
        </Card>

        {/* Active Seats */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                  <Users className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'المقاعد النشطة' : 'Active Seats'}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {usageStats.activeSeats}<span className="text-sm text-muted-foreground font-normal">/{usageStats.totalSeats}</span>
                  </p>
                </div>
              </div>
            </div>
            <Progress value={(usageStats.activeSeats / usageStats.totalSeats) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {usageStats.totalSeats - usageStats.activeSeats} {isRTL ? 'مقاعد متاحة' : 'seats available'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends & Invoices Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Usage Trend */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">{isRTL ? 'استهلاك الشهر' : 'Monthly Consumption'}</CardTitle>
                <CardDescription>{isRTL ? 'ملخص استهلاك الفريق هذا الشهر' : "Your team's usage this month"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{isRTL ? 'إجمالي وقت التدريب' : 'Total Training Time'}</span>
                </div>
                <span className="font-semibold text-foreground">42.5 {isRTL ? 'ساعة' : 'hours'}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{isRTL ? 'جلسات المحاكاة' : 'Simulation Sessions'}</span>
                </div>
                <span className="font-semibold text-foreground">156</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{isRTL ? 'مكالمات صوتية' : 'Voice Sessions'}</span>
                </div>
                <span className="font-semibold text-foreground">89</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{isRTL ? 'متدربون نشطون' : 'Active Trainees'}</span>
                </div>
                <span className="font-semibold text-foreground">8</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                  <CreditCard className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">{isRTL ? 'أحدث الفواتير' : 'Latest Invoices'}</CardTitle>
                  <CardDescription>{isRTL ? 'سجل المدفوعات الأخيرة' : 'Recent payment history'}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-violet-500 hover:text-violet-600 hover:bg-violet-500/10">
                {isRTL ? 'عرض الكل' : 'View All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{invoice.id}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(invoice.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-foreground">{invoice.amount}</span>
                    <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                      {isRTL ? 'مدفوعة' : 'Paid'}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA */}
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-glow">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {isRTL ? 'هل تحتاج إلى موارد إضافية؟' : 'Need more resources?'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL
                    ? 'قم بترقية خطتك للحصول على ساعات AI إضافية ومزايا متقدمة'
                    : 'Upgrade your plan for additional AI hours and advanced features'}
                </p>
              </div>
            </div>
            <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-soft">
              <Zap className="h-4 w-4" />
              {isRTL ? 'ترقية الخطة' : 'Upgrade Plan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
