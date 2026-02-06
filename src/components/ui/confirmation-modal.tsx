'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { AlertTriangle, Trash2, Ban, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  icon?: 'delete' | 'suspend' | 'warning';
  showReasonInput?: boolean;
  reasonPlaceholder?: string;
  isLoading?: boolean;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'default',
  icon = 'warning',
  showReasonInput = false,
  reasonPlaceholder,
  isLoading = false,
}: ConfirmationModalProps) {
  const { isRTL } = useLanguage();
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(showReasonInput ? reason : undefined);
    setReason('');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setReason('');
  };

  const iconMap = {
    delete: Trash2,
    suspend: Ban,
    warning: AlertTriangle,
  };

  const Icon = iconMap[icon];

  const variantStyles = {
    danger: {
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      confirmButton: 'bg-destructive hover:bg-destructive/90 text-white',
    },
    warning: {
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      confirmButton: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
    default: {
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      confirmButton: 'bg-primary hover:bg-primary/90 text-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-xl', styles.iconBg)}>
              <Icon className={cn('h-6 w-6', styles.iconColor)} />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold text-foreground">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-sm text-muted-foreground">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {showReasonInput && (
          <div className="mt-4">
            <Textarea
              placeholder={reasonPlaceholder || (isRTL ? 'السبب (اختياري)' : 'Reason (optional)')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        )}

        <AlertDialogFooter className={cn('mt-6 gap-3', isRTL && 'flex-row-reverse')}>
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              {cancelText || (isRTL ? 'إلغاء' : 'Cancel')}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn('flex-1', styles.confirmButton)}
            >
              {isLoading ? (
                <>
                  <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'جاري التنفيذ...' : 'Processing...'}
                </>
              ) : (
                confirmText || (isRTL ? 'تأكيد' : 'Confirm')
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
