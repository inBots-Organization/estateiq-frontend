'use client';

/**
 * AI Teachers Management Page
 *
 * Allows org admins to manage AI teachers:
 * - View all teachers in a grid
 * - Create new teachers
 * - Edit teacher details, prompts, voice
 * - View assigned trainees and documents
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { aiTeachersApi, AITeacher, CreateAITeacherData } from '@/lib/api/ai-teachers.api';
import {
  Bot,
  Plus,
  Users,
  FileText,
  Loader2,
  AlertCircle,
  GraduationCap,
  Target,
  Brain,
  Star,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RefreshCcw,
  Trash2,
  Upload,
} from 'lucide-react';

// Personality configuration
const PERSONALITIES = {
  friendly: {
    label: { ar: 'ودود', en: 'Friendly' },
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: GraduationCap
  },
  challenging: {
    label: { ar: 'متحدي', en: 'Challenging' },
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    icon: Target
  },
  professional: {
    label: { ar: 'احترافي', en: 'Professional' },
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: Brain
  },
  wise: {
    label: { ar: 'حكيم', en: 'Wise' },
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    icon: Star
  },
};

// Level configuration
const LEVELS = {
  beginner: { label: { ar: 'مبتدئ', en: 'Beginner' }, color: 'bg-green-500/10 text-green-500' },
  intermediate: { label: { ar: 'متوسط', en: 'Intermediate' }, color: 'bg-blue-500/10 text-blue-500' },
  advanced: { label: { ar: 'متقدم', en: 'Advanced' }, color: 'bg-purple-500/10 text-purple-500' },
  professional: { label: { ar: 'محترف', en: 'Professional' }, color: 'bg-amber-500/10 text-amber-500' },
  general: { label: { ar: 'عام', en: 'General' }, color: 'bg-gray-500/10 text-gray-500' },
};

// Gradient colors for teacher avatars
const GRADIENTS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-teal-500',
];

export default function AITeachersPage() {
  const { isRTL, language } = useLanguage();
  const { token } = useAuthStore();
  const router = useRouter();

  const [teachers, setTeachers] = useState<AITeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newTeacher, setNewTeacher] = useState<CreateAITeacherData>({
    name: '',
    displayNameAr: '',
    displayNameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    personality: 'friendly',
    level: 'general',
    voiceId: '',
    systemPromptAr: '',
    systemPromptEn: '',
    welcomeMessageAr: '',
    welcomeMessageEn: '',
    brainQueryPrefix: '',
    contextSource: 'brain',
  });

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await aiTeachersApi.list();
      setTeachers(data.teachers);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Toggle teacher active status
  const handleToggleActive = async (teacher: AITeacher) => {
    try {
      await aiTeachersApi.update(teacher.id, { isActive: !teacher.isActive });
      setTeachers(prev =>
        prev.map(t => t.id === teacher.id ? { ...t, isActive: !t.isActive } : t)
      );
    } catch (err) {
      console.error('Error toggling teacher status:', err);
    }
  };

  // Create new teacher
  const handleCreateTeacher = async () => {
    if (!newTeacher.name || !newTeacher.displayNameAr || !newTeacher.displayNameEn) {
      return;
    }

    try {
      setIsCreating(true);
      const data = await aiTeachersApi.create(newTeacher);
      setTeachers(prev => [...prev, data.teacher]);
      setCreateDialogOpen(false);
      setNewTeacher({
        name: '',
        displayNameAr: '',
        displayNameEn: '',
        personality: 'friendly',
        level: 'general',
      });
      // Navigate to the new teacher's page
      router.push(`/admin/ai-teachers/${data.teacher.id}`);
    } catch (err) {
      console.error('Error creating teacher:', err);
      setError(err instanceof Error ? err.message : 'Failed to create teacher');
    } finally {
      setIsCreating(false);
    }
  };

  // Reset all evaluations
  const handleResetEvaluations = async () => {
    try {
      setIsResetting(true);
      const result = await aiTeachersApi.resetEvaluations();
      console.log('Reset result:', result);
      setResetDialogOpen(false);
      // Refresh teachers to update counts
      await fetchTeachers();
    } catch (err) {
      console.error('Error resetting evaluations:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset evaluations');
    } finally {
      setIsResetting(false);
    }
  };

  // Get gradient for teacher
  const getGradient = (index: number) => GRADIENTS[index % GRADIENTS.length];

  // Get personality config
  const getPersonality = (key: string) => PERSONALITIES[key as keyof typeof PERSONALITIES] || PERSONALITIES.friendly;

  // Get level config
  const getLevel = (key: string) => LEVELS[key as keyof typeof LEVELS] || LEVELS.general;

  // RTL-aware chevron
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-sm text-muted-foreground">
            {isRTL ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-medium text-destructive">{error}</p>
          <Button onClick={fetchTeachers} variant="outline">
            {isRTL ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            {isRTL ? 'المعلمين الأذكياء' : 'AI Teachers'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL
              ? 'إدارة المعلمين الأذكياء وتخصيصهم لمتدربيك'
              : 'Manage AI teachers and customize them for your trainees'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setResetDialogOpen(true)}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <RefreshCcw className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'إعادة ضبط التقييمات' : 'Reset Evaluations'}
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
          >
            <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? 'إضافة معلم' : 'Add Teacher'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teachers.length}</p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'إجمالي المعلمين' : 'Total Teachers'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teachers.filter(t => t.isActive).length}</p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'نشط' : 'Active'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teachers.reduce((sum, t) => sum + (t._count?.assignedTrainees || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'طلاب معينين' : 'Assigned Trainees'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {teachers.reduce((sum, t) => sum + (t._count?.documents || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'ملفات مرتبطة' : 'Linked Documents'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {teachers.map((teacher, index) => {
          const personality = getPersonality(teacher.personality);
          const level = getLevel(teacher.level);
          const PersonalityIcon = personality.icon;

          return (
            <Link key={teacher.id} href={`/admin/ai-teachers/${teacher.id}`}>
              <Card className={cn(
                "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-violet-500/30",
                !teacher.isActive && "opacity-60"
              )}>
                <CardContent className="p-5">
                  {/* Header with Avatar and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <Avatar className="h-16 w-16 border-2 border-border shadow-soft">
                      {teacher.avatarUrl ? (
                        <AvatarImage src={teacher.avatarUrl} alt={teacher.displayNameEn} />
                      ) : null}
                      <AvatarFallback className={cn(
                        "text-white text-xl font-bold bg-gradient-to-br",
                        getGradient(index)
                      )}>
                        {teacher.displayNameEn.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={teacher.isActive}
                        onCheckedChange={() => handleToggleActive(teacher)}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Name and Description */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-violet-500 transition-colors">
                      {isRTL ? teacher.displayNameAr : teacher.displayNameEn}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {isRTL ? teacher.descriptionAr : teacher.descriptionEn}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className={cn("text-xs", personality.color)}>
                      <PersonalityIcon className="h-3 w-3 mr-1" />
                      {isRTL ? personality.label.ar : personality.label.en}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs", level.color)}>
                      {isRTL ? level.label.ar : level.label.en}
                    </Badge>
                    {teacher.isDefault && (
                      <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-500 border-violet-500/20">
                        {isRTL ? 'افتراضي' : 'Default'}
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{teacher._count?.assignedTrainees || 0}</span>
                      <span className="text-xs">{isRTL ? 'طالب' : 'trainees'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{teacher._count?.documents || 0}</span>
                      <span className="text-xs">{isRTL ? 'ملف' : 'docs'}</span>
                    </div>
                    <ChevronIcon className="h-4 w-4 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {/* Add New Teacher Card */}
        <Card
          className="group cursor-pointer border-dashed border-2 hover:border-violet-500/50 transition-all duration-200"
          onClick={() => setCreateDialogOpen(true)}
        >
          <CardContent className="p-5 flex flex-col items-center justify-center min-h-[280px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
              <Plus className="h-8 w-8 text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {isRTL ? 'إضافة معلم جديد' : 'Add New Teacher'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'أنشئ معلم ذكي مخصص' : 'Create a custom AI teacher'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reset Evaluations Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <RefreshCcw className="h-5 w-5" />
              {isRTL ? 'إعادة ضبط جميع التقييمات' : 'Reset All Evaluations'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'هذا الإجراء سيحذف جميع تقييمات المتدربين وتعييناتهم للمعلمين. سيحتاج كل متدرب لإعادة التقييم من جديد.'
                : 'This action will delete all trainee evaluations and teacher assignments. Every trainee will need to be re-evaluated.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <p className="text-sm text-destructive font-medium mb-2">
                {isRTL ? 'سيتم حذف:' : 'This will delete:'}
              </p>
              <ul className={cn("text-sm text-muted-foreground space-y-1", isRTL ? "list-disc pr-5" : "list-disc pl-5")}>
                <li>{isRTL ? 'جميع تعيينات المعلمين' : 'All teacher assignments'}</li>
                <li>{isRTL ? 'مستويات المهارات الحالية' : 'Current skill levels'}</li>
                <li>{isRTL ? 'تقارير المهارات اليومية' : 'Daily skill reports'}</li>
                <li>{isRTL ? 'جلسات التشخيص' : 'Diagnostic sessions'}</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetEvaluations}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                  {isRTL ? 'جاري الحذف...' : 'Resetting...'}
                </>
              ) : (
                <>
                  <Trash2 className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {isRTL ? 'حذف وإعادة ضبط' : 'Reset All'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Teacher Dialog - Enhanced with all fields */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-violet-500" />
              {isRTL ? 'إضافة معلم جديد' : 'Add New Teacher'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'أدخل جميع تفاصيل المعلم الجديد لتخصيصه بالكامل'
                : 'Enter all details for the new teacher to fully customize it'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="basic">{isRTL ? 'أساسي' : 'Basic'}</TabsTrigger>
                <TabsTrigger value="prompts">{isRTL ? 'التعليمات' : 'Prompts'}</TabsTrigger>
                <TabsTrigger value="advanced">{isRTL ? 'متقدم' : 'Advanced'}</TabsTrigger>
              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'الاسم بالعربي *' : 'Arabic Name *'}</Label>
                    <Input
                      value={newTeacher.displayNameAr}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, displayNameAr: e.target.value }))}
                      placeholder={isRTL ? 'مثال: سارة' : 'e.g., سارة'}
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'الاسم بالإنجليزي *' : 'English Name *'}</Label>
                    <Input
                      value={newTeacher.displayNameEn}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, displayNameEn: e.target.value }))}
                      placeholder="e.g., Sarah"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? 'المعرف (للنظام) *' : 'Identifier (system) *'}</Label>
                  <Input
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, name: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    placeholder="e.g., sarah"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'حروف إنجليزية صغيرة بدون مسافات' : 'Lowercase letters, no spaces'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'الوصف بالعربي' : 'Arabic Description'}</Label>
                    <Textarea
                      value={newTeacher.descriptionAr || ''}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, descriptionAr: e.target.value }))}
                      placeholder={isRTL ? 'وصف قصير للمعلم...' : 'Short description...'}
                      dir="rtl"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'الوصف بالإنجليزي' : 'English Description'}</Label>
                    <Textarea
                      value={newTeacher.descriptionEn || ''}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, descriptionEn: e.target.value }))}
                      placeholder="Short description..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'الشخصية' : 'Personality'}</Label>
                    <Select
                      value={newTeacher.personality}
                      onValueChange={(value) => setNewTeacher(prev => ({ ...prev, personality: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PERSONALITIES).map(([key, val]) => (
                          <SelectItem key={key} value={key}>
                            {isRTL ? val.label.ar : val.label.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'المستوى' : 'Level'}</Label>
                    <Select
                      value={newTeacher.level}
                      onValueChange={(value) => setNewTeacher(prev => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LEVELS).map(([key, val]) => (
                          <SelectItem key={key} value={key}>
                            {isRTL ? val.label.ar : val.label.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Prompts Tab */}
              <TabsContent value="prompts" className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'System Prompt بالعربي' : 'Arabic System Prompt'}</Label>
                  <Textarea
                    value={newTeacher.systemPromptAr || ''}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, systemPromptAr: e.target.value }))}
                    placeholder={isRTL ? 'تعليمات المعلم بالعربي...' : 'Arabic instructions...'}
                    dir="rtl"
                    rows={5}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'System Prompt بالإنجليزي' : 'English System Prompt'}</Label>
                  <Textarea
                    value={newTeacher.systemPromptEn || ''}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, systemPromptEn: e.target.value }))}
                    placeholder="English instructions..."
                    rows={5}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'رسالة الترحيب بالعربي' : 'Arabic Welcome'}</Label>
                    <Textarea
                      value={newTeacher.welcomeMessageAr || ''}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, welcomeMessageAr: e.target.value }))}
                      placeholder={isRTL ? 'مرحباً...' : 'Welcome message...'}
                      dir="rtl"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'رسالة الترحيب بالإنجليزي' : 'English Welcome'}</Label>
                    <Textarea
                      value={newTeacher.welcomeMessageEn || ''}
                      onChange={(e) => setNewTeacher(prev => ({ ...prev, welcomeMessageEn: e.target.value }))}
                      placeholder="Welcome message..."
                      rows={2}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'معرف الصوت (ElevenLabs)' : 'Voice ID (ElevenLabs)'}</Label>
                  <Input
                    value={newTeacher.voiceId || ''}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, voiceId: e.target.value }))}
                    placeholder="e.g., onwK4e9ZLuTAKqWW03F9"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'اتركه فارغاً لاستخدام الصوت الافتراضي' : 'Leave empty to use default voice'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'بادئة البحث في المعرفة' : 'Brain Query Prefix'}</Label>
                  <Input
                    value={newTeacher.brainQueryPrefix || ''}
                    onChange={(e) => setNewTeacher(prev => ({ ...prev, brainQueryPrefix: e.target.value }))}
                    placeholder="e.g., basics fundamentals"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? 'كلمات تضاف للبحث في قاعدة المعرفة' : 'Keywords added to knowledge base queries'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'مصدر السياق' : 'Context Source'}</Label>
                  <Select
                    value={newTeacher.contextSource || 'brain'}
                    onValueChange={(value) => setNewTeacher(prev => ({ ...prev, contextSource: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brain">{isRTL ? 'قاعدة المعرفة' : 'Knowledge Base'}</SelectItem>
                      <SelectItem value="user-history">{isRTL ? 'سجل المستخدم' : 'User History'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleCreateTeacher}
              disabled={isCreating || !newTeacher.name || !newTeacher.displayNameAr || !newTeacher.displayNameEn}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {isCreating ? (
                <>
                  <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                  {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {isRTL ? 'إنشاء المعلم' : 'Create Teacher'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
