'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore, usePermissions } from '@/stores/auth.store';
import { settingsApi, type SystemInfo } from '@/lib/api/settings.api';
import { cn } from '@/lib/utils';
import {
  Building2,
  Bell,
  Shield,
  Mail,
  Database,
  Lock,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  Save,
  RefreshCw,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { isRTL } = useLanguage();
  const { user } = useAuthStore();
  const { isAdmin } = usePermissions();

  // Organization state
  const [orgName, setOrgName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [orgSuccess, setOrgSuccess] = useState(false);

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [lowScoreAlerts, setLowScoreAlerts] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // System info state
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoadingSystem, setIsLoadingSystem] = useState(true);

  // Reset data state
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Fetch organization settings
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoadingOrg(true);
      const org = await settingsApi.getOrganization();
      setOrgName(org.name);
      setContactEmail(org.contactEmail);
      setEmailNotifications(org.settings.emailNotifications);
      setWeeklyReports(org.settings.weeklyReports);
      setLowScoreAlerts(org.settings.lowScoreAlerts);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setOrgError(isRTL ? 'فشل في تحميل الإعدادات' : 'Failed to load settings');
    } finally {
      setIsLoadingOrg(false);
    }
  }, [isRTL]);

  // Fetch system info
  const fetchSystemInfo = useCallback(async () => {
    try {
      setIsLoadingSystem(true);
      const info = await settingsApi.getSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    } finally {
      setIsLoadingSystem(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchSystemInfo();
  }, [fetchSettings, fetchSystemInfo]);

  // Save organization settings
  const handleSaveOrganization = async () => {
    if (!isAdmin) return;

    try {
      setIsSavingOrg(true);
      setOrgError(null);
      setOrgSuccess(false);

      await settingsApi.updateOrganization({
        name: orgName,
        contactEmail: contactEmail,
      });

      setOrgSuccess(true);
      setTimeout(() => setOrgSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save organization:', error);
      setOrgError(isRTL ? 'فشل في حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setIsSavingOrg(false);
    }
  };

  // Save notification settings
  const handleSaveNotifications = async (key: string, value: boolean) => {
    if (!isAdmin) return;

    try {
      setIsSavingNotifications(true);

      await settingsApi.updateNotifications({
        [key]: value,
      });

      setNotificationSuccess(true);
      setTimeout(() => setNotificationSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save notifications:', error);
      // Revert the toggle on error
      if (key === 'emailNotifications') setEmailNotifications(!value);
      if (key === 'weeklyReports') setWeeklyReports(!value);
      if (key === 'lowScoreAlerts') setLowScoreAlerts(!value);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = (key: string, value: boolean) => {
    if (key === 'emailNotifications') setEmailNotifications(value);
    if (key === 'weeklyReports') setWeeklyReports(value);
    if (key === 'lowScoreAlerts') setLowScoreAlerts(value);
    handleSaveNotifications(key, value);
  };

  // Change password
  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }

    try {
      setIsChangingPassword(true);
      await settingsApi.changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setPasswordError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Reset data
  const handleResetData = async () => {
    if (!isAdmin) return;

    try {
      setIsResetting(true);
      setResetError(null);

      await settingsApi.resetData(resetConfirmText);

      setResetConfirmText('');
      alert(isRTL ? 'تم إعادة تعيين جميع البيانات بنجاح' : 'All training data has been reset successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset data';
      setResetError(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isRTL ? 'الإعدادات' : 'Settings'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'إدارة إعدادات النظام والتفضيلات' : 'Manage system settings and preferences'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Organization Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Building2 className="h-5 w-5 text-violet-500" />
              {isRTL ? 'إعدادات المؤسسة' : 'Organization Settings'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'معلومات المؤسسة الأساسية' : 'Basic organization information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingOrg ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {isRTL ? 'اسم المؤسسة' : 'Organization Name'}
                  </label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="bg-background border-border"
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {isRTL ? 'البريد الإلكتروني' : 'Contact Email'}
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="bg-background border-border"
                    disabled={!isAdmin}
                  />
                </div>

                {orgError && (
                  <p className="text-sm text-destructive">{orgError}</p>
                )}

                {orgSuccess && (
                  <p className="text-sm text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully'}
                  </p>
                )}

                {isAdmin && (
                  <Button
                    onClick={handleSaveOrganization}
                    disabled={isSavingOrg}
                    className="bg-violet-500 hover:bg-violet-600 text-white"
                  >
                    {isSavingOrg ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className={cn(isRTL ? "mr-2" : "ml-2")}>
                      {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                    </span>
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5 text-violet-500" />
              {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}
              {isSavingNotifications && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {notificationSuccess && (
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              )}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'تحكم في الإشعارات والتنبيهات' : 'Control notifications and alerts'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isRTL ? 'إشعارات البريد' : 'Email Notifications'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'استلام الإشعارات عبر البريد' : 'Receive notifications via email'}
                  </p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={(value) => handleNotificationToggle('emailNotifications', value)}
                disabled={!isAdmin || isSavingNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isRTL ? 'تقارير أسبوعية' : 'Weekly Reports'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'ملخص أسبوعي للأداء' : 'Weekly performance summary'}
                  </p>
                </div>
              </div>
              <Switch
                checked={weeklyReports}
                onCheckedChange={(value) => handleNotificationToggle('weeklyReports', value)}
                disabled={!isAdmin || isSavingNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {isRTL ? 'تنبيهات الدرجات المنخفضة' : 'Low Score Alerts'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'تنبيه عند درجات أقل من 60%' : 'Alert when scores drop below 60%'}
                  </p>
                </div>
              </div>
              <Switch
                checked={lowScoreAlerts}
                onCheckedChange={(value) => handleNotificationToggle('lowScoreAlerts', value)}
                disabled={!isAdmin || isSavingNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-violet-500" />
              {isRTL ? 'الأمان' : 'Security'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'إعدادات الأمان والوصول' : 'Security and access settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <p className="font-medium text-emerald-500">
                  {isRTL ? 'الحساب مؤمن' : 'Account Secured'}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'جميع إعدادات الأمان محدثة' : 'All security settings are up to date'}
              </p>
            </div>

            {/* Password Change Form */}
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
              </p>

              <Input
                type="password"
                placeholder={isRTL ? 'كلمة المرور الحالية' : 'Current Password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-background border-border"
              />
              <Input
                type="password"
                placeholder={isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background border-border"
              />
              <Input
                type="password"
                placeholder={isRTL ? 'تأكيد كلمة المرور' : 'Confirm New Password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background border-border"
              />

              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}

              {passwordSuccess && (
                <p className="text-sm text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {isRTL ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully'}
                </p>
              )}

              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                variant="outline"
                className="w-full"
              >
                {isChangingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                <span className={cn(isRTL ? "mr-2" : "ml-2")}>
                  {isRTL ? 'تغيير كلمة المرور' : 'Update Password'}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Info className="h-5 w-5 text-violet-500" />
                {isRTL ? 'معلومات النظام' : 'System Information'}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchSystemInfo}
                disabled={isLoadingSystem}
              >
                <RefreshCw className={cn("h-4 w-4", isLoadingSystem && "animate-spin")} />
              </Button>
            </div>
            <CardDescription>
              {isRTL ? 'معلومات عن النظام والإصدار' : 'System and version information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingSystem ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : systemInfo ? (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">{isRTL ? 'الإصدار' : 'Version'}</span>
                  <Badge variant="outline" className="border-violet-500/30 text-violet-500">
                    v{systemInfo.version}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">{isRTL ? 'البيئة' : 'Environment'}</span>
                  <Badge variant="outline" className={cn(
                    systemInfo.environment === 'production'
                      ? 'border-blue-500/30 text-blue-500'
                      : 'border-emerald-500/30 text-emerald-500'
                  )}>
                    {systemInfo.environment.charAt(0).toUpperCase() + systemInfo.environment.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">{isRTL ? 'قاعدة البيانات' : 'Database'}</span>
                  <Badge variant="outline" className={cn(
                    systemInfo.database === 'connected'
                      ? 'border-emerald-500/30 text-emerald-500'
                      : 'border-destructive/30 text-destructive'
                  )}>
                    {systemInfo.database === 'connected'
                      ? (isRTL ? 'متصل' : 'Connected')
                      : (isRTL ? 'غير متصل' : 'Disconnected')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">{isRTL ? 'حالة API' : 'API Status'}</span>
                  <Badge variant="outline" className={cn(
                    systemInfo.apiStatus === 'operational'
                      ? 'border-emerald-500/30 text-emerald-500'
                      : 'border-amber-500/30 text-amber-500'
                  )}>
                    {systemInfo.apiStatus === 'operational'
                      ? (isRTL ? 'يعمل' : 'Operational')
                      : (isRTL ? 'محدود' : 'Limited')}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isRTL ? 'فشل في تحميل معلومات النظام' : 'Failed to load system info'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone - Only for org_admin */}
      {isAdmin && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {isRTL ? 'منطقة الخطر' : 'Danger Zone'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'إجراءات لا يمكن التراجع عنها' : 'Irreversible actions'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">
                    {isRTL ? 'إعادة تعيين جميع البيانات' : 'Reset All Data'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'حذف جميع بيانات التدريب والتقارير' : 'Delete all training data and reports'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={isRTL ? 'اكتب DELETE ALL DATA للتأكيد' : 'Type DELETE ALL DATA to confirm'}
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    className="w-64 bg-background border-border text-sm"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleResetData}
                    disabled={resetConfirmText !== 'DELETE ALL DATA' || isResetting}
                  >
                    {isResetting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      isRTL ? 'إعادة تعيين' : 'Reset'
                    )}
                  </Button>
                </div>
              </div>
              {resetError && (
                <p className="text-sm text-destructive mt-2">{resetError}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
