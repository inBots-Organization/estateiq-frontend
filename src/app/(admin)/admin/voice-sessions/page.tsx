'use client';

/**
 * Admin Voice Sessions Page
 *
 * Monitoring dashboard for real-time voice call training sessions.
 */

import { VoiceSessionMonitor } from '@/components/admin/VoiceSessionMonitor';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminRoleSafe } from '@/contexts/AdminRoleContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Phone, GraduationCap } from 'lucide-react';

export default function VoiceSessionsPage() {
  const { user } = useAuthStore();
  const { isRTL } = useLanguage();
  const { isTrainer } = useAdminRoleSafe();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Check if user has admin-level access (org_admin or trainer)
  const hasAdminAccess = user?.role === 'org_admin' || user?.role === 'trainer';

  useEffect(() => {
    // Allow a moment for auth state to load
    const timer = setTimeout(() => {
      setIsChecking(false);
      if (!user || !hasAdminAccess) {
        router.push('/login');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, router, hasAdminAccess]);

  if (isChecking) {
    return (
      <div className="py-8">
        <Card className="border-border">
          <CardContent className="py-16 flex flex-col items-center justify-center">
            <Loader2 className={`h-8 w-8 animate-spin mb-4 ${isTrainer ? 'text-teal-500' : 'text-violet-500'}`} />
            <p className="text-muted-foreground">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !hasAdminAccess) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {isTrainer && <Phone className="h-6 w-6 text-teal-500" />}
            {isRTL ? 'جلسات التدريب الصوتي' : 'Voice Training Sessions'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isTrainer
              ? (isRTL ? 'مراقبة وتحليل جلسات التدريب الصوتي لطلابك' : 'Monitor and analyze voice training sessions for your students')
              : (isRTL ? 'مراقبة وتحليل جلسات التدريب الصوتي لفريقك' : 'Monitor and analyze voice call training sessions across your team')
            }
          </p>
        </div>
        {isTrainer && (
          <Badge variant="outline" className="px-3 py-1.5 bg-teal-500/10 border-teal-500/30 text-teal-500">
            <GraduationCap className="h-3.5 w-3.5 mr-2" />
            {isRTL ? 'عرض المدرب' : 'Trainer View'}
          </Badge>
        )}
      </div>

      <VoiceSessionMonitor isTrainerView={isTrainer} />
    </div>
  );
}
