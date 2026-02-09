'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  Settings,
  Shield,
  Bell,
  Mail,
  Database,
  Globe,
  Key,
  Save,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SettingsPage() {
  const { isRTL } = useLanguage();
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: 'INLEARN',
    supportEmail: 'support@inlearn.ai',
    defaultLanguage: 'en',
    maintenanceMode: false,

    // Security Settings
    requireMfa: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    ipWhitelistEnabled: false,

    // Notification Settings
    emailNotifications: true,
    newOrgNotification: true,
    subscriptionAlerts: true,
    usageAlerts: true,
    weeklyReport: true,

    // API Settings
    rateLimit: 1000,
    apiLogging: true,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div className={cn('space-y-6', isRTL && 'rtl')}>
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isRTL ? 'إعدادات المنصة' : 'Platform Settings'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'إدارة إعدادات وتكوينات المنصة' : 'Manage platform settings and configurations'}
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'عام' : 'General'}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الأمان' : 'Security'}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الإشعارات' : 'Notifications'}</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'API' : 'API'}</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-rose-500" />
                {isRTL ? 'الإعدادات العامة' : 'General Settings'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'إعدادات المنصة الأساسية' : 'Basic platform configuration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{isRTL ? 'اسم المنصة' : 'Platform Name'}</Label>
                  <Input
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'بريد الدعم' : 'Support Email'}</Label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'اللغة الافتراضية' : 'Default Language'}</Label>
                  <Select
                    value={settings.defaultLanguage}
                    onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium">{isRTL ? 'وضع الصيانة' : 'Maintenance Mode'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? 'عند التفعيل، لن يتمكن المستخدمون من الوصول للمنصة'
                        : 'When enabled, users will not be able to access the platform'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-rose-500" />
                {isRTL ? 'إعدادات الأمان' : 'Security Settings'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'إعدادات المصادقة والأمان' : 'Authentication and security configuration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{isRTL ? 'المصادقة الثنائية إلزامية' : 'Require MFA'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? 'إجبار جميع المستخدمين على استخدام المصادقة الثنائية'
                        : 'Force all users to use two-factor authentication'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireMfa}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireMfa: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{isRTL ? 'قائمة IP المسموح بها' : 'IP Whitelist'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isRTL
                        ? 'السماح بالوصول من عناوين IP محددة فقط'
                        : 'Only allow access from specific IP addresses'}
                    </p>
                  </div>
                  <Switch
                    checked={settings.ipWhitelistEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, ipWhitelistEnabled: checked })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-2">
                  <Label>{isRTL ? 'مهلة الجلسة (دقائق)' : 'Session Timeout (minutes)'}</Label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الحد الأقصى لمحاولات تسجيل الدخول' : 'Max Login Attempts'}</Label>
                  <Input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-rose-500" />
                {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'إدارة إشعارات البريد الإلكتروني' : 'Manage email notifications'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isRTL ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'تفعيل إشعارات البريد الإلكتروني' : 'Enable email notifications'}
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isRTL ? 'تسجيل مؤسسة جديدة' : 'New Organization Registration'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'إشعار عند تسجيل مؤسسة جديدة' : 'Notify when a new organization registers'}
                  </p>
                </div>
                <Switch
                  checked={settings.newOrgNotification}
                  onCheckedChange={(checked) => setSettings({ ...settings, newOrgNotification: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isRTL ? 'تنبيهات الاشتراك' : 'Subscription Alerts'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'إشعار عند انتهاء أو إلغاء الاشتراكات' : 'Notify on subscription expiry or cancellation'}
                  </p>
                </div>
                <Switch
                  checked={settings.subscriptionAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, subscriptionAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isRTL ? 'تنبيهات الاستخدام' : 'Usage Alerts'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'إشعار عند تجاوز حدود الاستخدام' : 'Notify when usage limits are exceeded'}
                  </p>
                </div>
                <Switch
                  checked={settings.usageAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, usageAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isRTL ? 'التقرير الأسبوعي' : 'Weekly Report'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'استلام تقرير أسبوعي بالإحصائيات' : 'Receive weekly statistics report'}
                  </p>
                </div>
                <Switch
                  checked={settings.weeklyReport}
                  onCheckedChange={(checked) => setSettings({ ...settings, weeklyReport: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-rose-500" />
                {isRTL ? 'إعدادات API' : 'API Settings'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'إعدادات معدل الطلبات والتسجيل' : 'Rate limiting and logging configuration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{isRTL ? 'حد الطلبات (في الدقيقة)' : 'Rate Limit (requests/minute)'}</Label>
                <Input
                  type="number"
                  value={settings.rateLimit}
                  onChange={(e) => setSettings({ ...settings, rateLimit: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'الحد الأقصى للطلبات لكل مؤسسة في الدقيقة' : 'Maximum API requests per organization per minute'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{isRTL ? 'تسجيل طلبات API' : 'API Request Logging'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'تسجيل جميع طلبات API للتحليل' : 'Log all API requests for analytics'}
                  </p>
                </div>
                <Switch
                  checked={settings.apiLogging}
                  onCheckedChange={(checked) => setSettings({ ...settings, apiLogging: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Database Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-rose-500" />
                {isRTL ? 'إجراءات قاعدة البيانات' : 'Database Actions'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'إجراءات الصيانة والنسخ الاحتياطي' : 'Maintenance and backup actions'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border">
                <div>
                  <p className="font-medium">{isRTL ? 'تحديث ذاكرة التخزين المؤقت' : 'Refresh Cache'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'مسح ذاكرة التخزين المؤقت للمنصة' : 'Clear platform cache'}
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {isRTL ? 'تحديث' : 'Refresh'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 gap-2"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
