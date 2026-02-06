'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSuperAdminApi, type SubscriptionPlan } from '@/hooks/useSuperAdminApi';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  DollarSign,
  Users,
  Zap,
  Mic,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function SubscriptionsPage() {
  const { isRTL } = useLanguage();
  const api = useSuperAdminApi();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    monthlyPrice: 0,
    annualPrice: 0,
    seatLimit: 0,
    simulationLimit: 0,
    voiceMinutesLimit: 0,
    isActive: true,
    features: [] as string[],
  });

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPlans();
      // Ensure we always have an array
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
      console.error('Plans fetch error:', err);
      setPlans([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSavePlan = async () => {
    try {
      setSaving(true);
      if (editingPlan) {
        await api.updatePlan(editingPlan.id, {
          displayName: formData.displayName,
          description: formData.description || undefined,
          monthlyPrice: formData.monthlyPrice,
          annualPrice: formData.annualPrice || undefined,
          seatLimit: formData.seatLimit || undefined,
          simulationLimit: formData.simulationLimit || undefined,
          voiceMinutesLimit: formData.voiceMinutesLimit || undefined,
          isActive: formData.isActive,
          features: formData.features,
        });
      } else {
        await api.createPlan({
          name: formData.name,
          displayName: formData.displayName,
          description: formData.description || undefined,
          monthlyPrice: formData.monthlyPrice,
          annualPrice: formData.annualPrice || undefined,
          seatLimit: formData.seatLimit || undefined,
          simulationLimit: formData.simulationLimit || undefined,
          voiceMinutesLimit: formData.voiceMinutesLimit || undefined,
          features: formData.features,
        });
      }
      setIsDialogOpen(false);
      fetchPlans();
    } catch (err) {
      console.error('Failed to save plan:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatLimit = (limit: number | null) => {
    if (limit === null) return isRTL ? 'غير محدود' : 'Unlimited';
    return limit.toLocaleString();
  };

  // Helper to get features as array
  const getFeatures = (features: string | string[]): string[] => {
    if (typeof features === 'string') {
      try {
        return JSON.parse(features || '[]');
      } catch {
        return [];
      }
    }
    return Array.isArray(features) ? features : [];
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    // Ensure features is an array
    const featuresArray = typeof plan.features === 'string'
      ? JSON.parse(plan.features || '[]')
      : (Array.isArray(plan.features) ? plan.features : []);
    setFormData({
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description || '',
      monthlyPrice: plan.monthlyPrice,
      annualPrice: plan.annualPrice || 0,
      seatLimit: plan.seatLimit || 0,
      simulationLimit: plan.simulationLimit || 0,
      voiceMinutesLimit: plan.voiceMinutesLimit || 0,
      isActive: plan.isActive,
      features: featuresArray,
    });
    setIsDialogOpen(true);
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      displayName: '',
      description: '',
      monthlyPrice: 0,
      annualPrice: 0,
      seatLimit: 0,
      simulationLimit: 0,
      voiceMinutesLimit: 0,
      isActive: true,
      features: [],
    });
    setIsDialogOpen(true);
  };

  const getPlanIcon = (name: string) => {
    switch (name) {
      case 'starter':
        return <Zap className="h-6 w-6" />;
      case 'professional':
        return <Users className="h-6 w-6" />;
      case 'enterprise':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <DollarSign className="h-6 w-6" />;
    }
  };

  const getPlanGradient = (name: string) => {
    switch (name) {
      case 'starter':
        return 'from-gray-500 to-gray-600';
      case 'professional':
        return 'from-blue-500 to-indigo-600';
      case 'enterprise':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-rose-500 to-pink-600';
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchPlans} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {isRTL ? 'إعادة المحاولة' : 'Retry'}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', isRTL && 'rtl')}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isRTL ? 'خطط الاشتراك' : 'Subscription Plans'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL ? 'إدارة خطط الاشتراك والأسعار' : 'Manage subscription plans and pricing'}
          </p>
        </div>
        <Button
          onClick={handleCreatePlan}
          className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
        >
          <Plus className="h-4 w-4 me-2" />
          {isRTL ? 'إنشاء خطة' : 'Create Plan'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{plans.filter(p => p.isActive).length}</p>
                <p className="text-sm text-muted-foreground">{isRTL ? 'خطط نشطة' : 'Active Plans'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{plans.reduce((sum, p) => sum + (p.subscriberCount || 0), 0)}</p>
                <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي المشتركين' : 'Total Subscribers'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-500/10">
                <DollarSign className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    plans.reduce((sum, p) => sum + p.monthlyPrice * (p.subscriberCount || 0), 0)
                  )}
                </p>
                <p className="text-sm text-muted-foreground">{isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={cn('relative overflow-hidden', !plan.isActive && 'opacity-60')}>
            <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', getPlanGradient(plan.name))} />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={cn('p-3 rounded-xl bg-gradient-to-br text-white', getPlanGradient(plan.name))}>
                  {getPlanIcon(plan.name)}
                </div>
                <div className="flex items-center gap-2">
                  {!plan.isActive && (
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-500/10 text-gray-500">
                      {isRTL ? 'غير نشط' : 'Inactive'}
                    </span>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleEditPlan(plan)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-4">{plan.displayName}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{formatCurrency(plan.monthlyPrice)}</span>
                  <span className="text-muted-foreground">/{isRTL ? 'شهر' : 'mo'}</span>
                </div>
                {plan.annualPrice && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(plan.annualPrice)}/{isRTL ? 'سنة' : 'year'} ({isRTL ? 'وفر' : 'save'} {Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100)}%)
                  </p>
                )}
              </div>

              {/* Limits */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {isRTL ? 'المقاعد' : 'Seats'}
                  </span>
                  <span className="font-medium">{formatLimit(plan.seatLimit)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    {isRTL ? 'المحاكاة' : 'Simulations'}
                  </span>
                  <span className="font-medium">{formatLimit(plan.simulationLimit)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Mic className="h-4 w-4" />
                    {isRTL ? 'دقائق الصوت' : 'Voice Minutes'}
                  </span>
                  <span className="font-medium">{formatLimit(plan.voiceMinutesLimit)}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <p className="text-sm font-medium">{isRTL ? 'المميزات:' : 'Features:'}</p>
                <ul className="space-y-1">
                  {getFeatures(plan.features).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subscriber Count */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{isRTL ? 'المشتركون' : 'Subscribers'}</span>
                  <span className="font-medium">{plan.subscriberCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan
                ? isRTL ? 'تعديل الخطة' : 'Edit Plan'
                : isRTL ? 'إنشاء خطة جديدة' : 'Create New Plan'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'قم بتعبئة تفاصيل خطة الاشتراك'
                : 'Fill in the subscription plan details'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'اسم الخطة (الداخلي)' : 'Plan Name (Internal)'}</Label>
              <Input
                placeholder="e.g., professional"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!!editingPlan}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'اسم العرض' : 'Display Name'}</Label>
              <Input
                placeholder="e.g., Professional"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Input
                placeholder="Plan description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'السعر الشهري ($)' : 'Monthly Price ($)'}</Label>
              <Input
                type="number"
                placeholder="99"
                value={formData.monthlyPrice || ''}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'السعر السنوي ($)' : 'Annual Price ($)'}</Label>
              <Input
                type="number"
                placeholder="999"
                value={formData.annualPrice || ''}
                onChange={(e) => setFormData({ ...formData, annualPrice: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'حد المقاعد' : 'Seat Limit'}</Label>
              <Input
                type="number"
                placeholder="Unlimited"
                value={formData.seatLimit || ''}
                onChange={(e) => setFormData({ ...formData, seatLimit: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'حد المحاكاة' : 'Simulation Limit'}</Label>
              <Input
                type="number"
                placeholder="Unlimited"
                value={formData.simulationLimit || ''}
                onChange={(e) => setFormData({ ...formData, simulationLimit: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'حد دقائق الصوت' : 'Voice Minutes Limit'}</Label>
              <Input
                type="number"
                placeholder="Unlimited"
                value={formData.voiceMinutesLimit || ''}
                onChange={(e) => setFormData({ ...formData, voiceMinutesLimit: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>{isRTL ? 'نشط' : 'Active'}</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              className="bg-gradient-to-r from-rose-500 to-pink-600"
              onClick={handleSavePlan}
              disabled={saving}
            >
              {saving
                ? (isRTL ? 'جاري الحفظ...' : 'Saving...')
                : editingPlan
                  ? isRTL ? 'حفظ التغييرات' : 'Save Changes'
                  : isRTL ? 'إنشاء الخطة' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
