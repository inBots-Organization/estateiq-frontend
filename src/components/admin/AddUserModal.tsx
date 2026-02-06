'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Loader2, User, Mail, Shield, Lock, Users, Eye, EyeOff } from 'lucide-react';

interface Group {
  id: string;
  name: string;
}

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    groupId?: string;
  }) => Promise<void>;
  groups?: Group[];
}

export function AddUserModal({
  open,
  onOpenChange,
  onSave,
  groups = [],
}: AddUserModalProps) {
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'trainee',
    groupId: '',
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'trainee',
        groupId: '',
      });
      setError('');
      setShowPassword(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password
    if (formData.password.length < 8) {
      setError(isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await onSave({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        groupId: formData.groupId || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : (isRTL ? 'فشل في إنشاء المستخدم' : 'Failed to create user'));
    } finally {
      setIsLoading(false);
    }
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
    setShowPassword(true);
  };

  const roles = [
    { value: 'trainee', labelAr: 'متدرب', labelEn: 'Trainee', descAr: 'يمكنه التدريب فقط', descEn: 'Can only train' },
    { value: 'trainer', labelAr: 'مدرب', labelEn: 'Trainer', descAr: 'يمكنه مراقبة المتدربين', descEn: 'Can monitor trainees' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {isRTL ? 'إضافة مستخدم جديد' : 'Add New User'}
          </DialogTitle>
          <DialogDescription>
            {isRTL
              ? 'أدخل بيانات المستخدم الجديد لإضافته إلى منظمتك'
              : 'Enter the new user\'s details to add them to your organization'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {isRTL ? 'الاسم الأول' : 'First Name'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder={isRTL ? 'أحمد' : 'John'}
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                {isRTL ? 'اسم العائلة' : 'Last Name'} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder={isRTL ? 'محمد' : 'Doe'}
                required
                autoComplete="off"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {isRTL ? 'البريد الإلكتروني' : 'Email'} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={isRTL ? 'user@example.com' : 'user@example.com'}
              required
              autoComplete="off"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              {isRTL ? 'كلمة المرور' : 'Password'} <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={isRTL ? '8 أحرف على الأقل' : 'At least 8 characters'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={cn(isRTL ? 'pl-10' : 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors',
                    isRTL ? 'left-3' : 'right-3'
                  )}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePassword}
                className="shrink-0"
              >
                {isRTL ? 'توليد' : 'Generate'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'شارك كلمة المرور مع المستخدم بشكل آمن' : 'Share the password with the user securely'}
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              {isRTL ? 'الصلاحية' : 'Role'} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span>{isRTL ? role.labelAr : role.labelEn}</span>
                      <span className="text-xs text-muted-foreground">
                        {isRTL ? role.descAr : role.descEn}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Group Assignment (Optional) */}
          {groups.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="group" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                {isRTL ? 'المجموعة' : 'Group'}
                <span className="text-muted-foreground text-xs">({isRTL ? 'اختياري' : 'Optional'})</span>
              </Label>
              <Select
                value={formData.groupId || 'none'}
                onValueChange={(value) => setFormData({ ...formData, groupId: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر مجموعة...' : 'Select a group...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {isRTL ? 'بدون مجموعة' : 'No group'}
                  </SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.role === 'trainer'
                  ? (isRTL ? 'سيتم تعيين المدرب لهذه المجموعة' : 'The trainer will be assigned to this group')
                  : (isRTL ? 'سيتم إضافة المتدرب لهذه المجموعة' : 'The trainee will be added to this group')}
              </p>
            </div>
          )}

          <DialogFooter className={cn('gap-3 pt-4', isRTL && 'flex-row-reverse')}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                </>
              ) : (
                <>
                  <User className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'إنشاء المستخدم' : 'Create User'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
