'use client';

/**
 * AI Teacher Detail/Edit Page
 *
 * Comprehensive management page for a single AI teacher:
 * - Basic info editing (names, descriptions, personality, level)
 * - System prompts (AR/EN)
 * - Voice settings
 * - Documents management
 * - Assigned trainees list
 */

import { useState, useEffect, useCallback, useRef, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import {
  aiTeachersApi,
  AITeacher,
  AITeacherTrainee,
  AITeacherDocument,
  UpdateAITeacherData,
} from '@/lib/api/ai-teachers.api';
import { brainApi } from '@/lib/api/brain.api';
import {
  Bot,
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  AlertCircle,
  Upload,
  Users,
  FileText,
  Settings,
  MessageSquare,
  Volume2,
  Trash2,
  ExternalLink,
  GraduationCap,
  Target,
  Brain,
  Star,
  Camera,
} from 'lucide-react';

// Personality options
const PERSONALITIES = [
  { value: 'friendly', labelAr: 'ودود', labelEn: 'Friendly' },
  { value: 'challenging', labelAr: 'متحدي', labelEn: 'Challenging' },
  { value: 'professional', labelAr: 'احترافي', labelEn: 'Professional' },
  { value: 'wise', labelAr: 'حكيم', labelEn: 'Wise' },
];

// Level options
const LEVELS = [
  { value: 'beginner', labelAr: 'مبتدئ', labelEn: 'Beginner' },
  { value: 'intermediate', labelAr: 'متوسط', labelEn: 'Intermediate' },
  { value: 'advanced', labelAr: 'متقدم', labelEn: 'Advanced' },
  { value: 'professional', labelAr: 'محترف', labelEn: 'Professional' },
  { value: 'general', labelAr: 'عام', labelEn: 'General' },
];

// Context source options
const CONTEXT_SOURCES = [
  { value: 'brain', labelAr: 'قاعدة المعرفة', labelEn: 'Knowledge Base' },
  { value: 'user-history', labelAr: 'سجل المستخدم', labelEn: 'User History' },
];

// Gradient colors for teacher avatars
const GRADIENTS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-orange-500',
];

export default function AITeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL, language } = useLanguage();
  const { token } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<AITeacher | null>(null);
  const [trainees, setTrainees] = useState<AITeacherTrainee[]>([]);
  const [documents, setDocuments] = useState<AITeacherDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');

  // Form state
  const [formData, setFormData] = useState<UpdateAITeacherData>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch teacher data
  const fetchTeacher = useCallback(async () => {
    if (!token || !teacherId) return;

    try {
      setIsLoading(true);
      setError(null);

      const [teacherData, traineesData, documentsData] = await Promise.all([
        aiTeachersApi.get(teacherId),
        aiTeachersApi.getTrainees(teacherId),
        aiTeachersApi.getDocuments(teacherId),
      ]);

      setTeacher(teacherData.teacher);
      setTrainees(traineesData.trainees);
      setDocuments(documentsData.documents);

      // Initialize form data
      setFormData({
        displayNameAr: teacherData.teacher.displayNameAr,
        displayNameEn: teacherData.teacher.displayNameEn,
        descriptionAr: teacherData.teacher.descriptionAr || '',
        descriptionEn: teacherData.teacher.descriptionEn || '',
        personality: teacherData.teacher.personality,
        level: teacherData.teacher.level,
        voiceId: teacherData.teacher.voiceId || '',
        systemPromptAr: teacherData.teacher.systemPromptAr || '',
        systemPromptEn: teacherData.teacher.systemPromptEn || '',
        welcomeMessageAr: teacherData.teacher.welcomeMessageAr || '',
        welcomeMessageEn: teacherData.teacher.welcomeMessageEn || '',
        brainQueryPrefix: teacherData.teacher.brainQueryPrefix || '',
        contextSource: teacherData.teacher.contextSource,
        isActive: teacherData.teacher.isActive,
      });
    } catch (err) {
      console.error('Error fetching teacher:', err);
      setError(err instanceof Error ? err.message : 'Failed to load teacher');
    } finally {
      setIsLoading(false);
    }
  }, [token, teacherId]);

  useEffect(() => {
    fetchTeacher();
  }, [fetchTeacher]);

  // Handle form field changes
  const handleFieldChange = (field: keyof UpdateAITeacherData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSuccessMessage(null);
  };

  // Save changes
  const handleSave = async () => {
    if (!teacher) return;

    try {
      setIsSaving(true);
      setError(null);

      const updatedTeacher = await aiTeachersApi.update(teacher.id, formData);
      setTeacher(updatedTeacher.teacher);
      setHasChanges(false);
      setSuccessMessage(isRTL ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving teacher:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete teacher
  const handleDelete = async () => {
    if (!teacher) return;

    try {
      setIsDeleting(true);
      await aiTeachersApi.delete(teacher.id);
      router.push('/admin/ai-teachers');
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete teacher');
      setIsDeleting(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !teacher) return;

    try {
      setIsSaving(true);
      const result = await aiTeachersApi.uploadAvatar(teacher.id, file);
      setTeacher(result.teacher);
      setSuccessMessage(isRTL ? 'تم تحديث الصورة بنجاح' : 'Avatar updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle document upload for this teacher
  const handleDocumentUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !teacher) return;

    try {
      setIsUploading(true);
      setError(null);

      await brainApi.uploadDocument(file, {
        teacherId: teacher.id,
        contentLevel: teacher.level as 'beginner' | 'intermediate' | 'advanced' | 'professional' | 'general',
      });

      // Refresh documents list
      const docsData = await aiTeachersApi.getDocuments(teacher.id);
      setDocuments(docsData.documents);

      setSuccessMessage(isRTL ? 'تم رفع الملف بنجاح وجاري معالجته' : 'File uploaded successfully, processing...');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (docFileInputRef.current) {
        docFileInputRef.current.value = '';
      }
    }
  };

  // RTL-aware arrow
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

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

  if (error && !teacher) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-medium text-destructive">{error}</p>
          <Button onClick={() => router.push('/admin/ai-teachers')} variant="outline">
            {isRTL ? 'العودة للقائمة' : 'Back to List'}
          </Button>
        </div>
      </div>
    );
  }

  if (!teacher) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/ai-teachers')}
            className="shrink-0"
          >
            <BackArrow className="h-5 w-5" />
          </Button>
          <div className="relative group">
            <Avatar className="h-16 w-16 border-2 border-border shadow-soft">
              {teacher.avatarUrl ? (
                <AvatarImage src={teacher.avatarUrl} alt={teacher.displayNameEn} />
              ) : null}
              <AvatarFallback className={cn(
                "text-white text-2xl font-bold bg-gradient-to-br",
                GRADIENTS[0]
              )}>
                {teacher.displayNameEn.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isRTL ? teacher.displayNameAr : teacher.displayNameEn}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn(
                "text-xs",
                teacher.isActive
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-gray-500/10 text-gray-500 border-gray-500/20"
              )}>
                {teacher.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
              </Badge>
              {teacher.isDefault && (
                <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-500 border-violet-500/20">
                  {isRTL ? 'افتراضي' : 'Default'}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!teacher.isDefault && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {isRTL ? 'حذف' : 'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isRTL ? 'هل أنت متأكد؟' : 'Are you sure?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRTL
                      ? 'سيتم حذف هذا المعلم نهائياً. لا يمكن التراجع عن هذا الإجراء.'
                      : 'This teacher will be permanently deleted. This action cannot be undone.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      isRTL ? 'حذف' : 'Delete'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-gradient-to-r from-violet-500 to-purple-600"
          >
            {isSaving ? (
              <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
            ) : (
              <Save className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            )}
            {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'المعلومات' : 'Info'}</span>
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الـ Prompts' : 'Prompts'}</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الملفات' : 'Docs'}</span>
            {documents.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {documents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="trainees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الطلاب' : 'Trainees'}</span>
            {trainees.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {trainees.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
              <CardDescription>
                {isRTL ? 'اسم المعلم ووصفه بالعربي والإنجليزي' : 'Teacher name and description in Arabic and English'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الاسم بالعربي' : 'Arabic Name'}</Label>
                  <Input
                    value={formData.displayNameAr || ''}
                    onChange={(e) => handleFieldChange('displayNameAr', e.target.value)}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الاسم بالإنجليزي' : 'English Name'}</Label>
                  <Input
                    value={formData.displayNameEn || ''}
                    onChange={(e) => handleFieldChange('displayNameEn', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الوصف بالعربي' : 'Arabic Description'}</Label>
                  <Textarea
                    value={formData.descriptionAr || ''}
                    onChange={(e) => handleFieldChange('descriptionAr', e.target.value)}
                    dir="rtl"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الوصف بالإنجليزي' : 'English Description'}</Label>
                  <Textarea
                    value={formData.descriptionEn || ''}
                    onChange={(e) => handleFieldChange('descriptionEn', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'الإعدادات' : 'Settings'}</CardTitle>
              <CardDescription>
                {isRTL ? 'شخصية المعلم ومستواه وإعدادات الصوت' : 'Teacher personality, level, and voice settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الشخصية' : 'Personality'}</Label>
                  <Select
                    value={formData.personality || 'friendly'}
                    onValueChange={(value) => handleFieldChange('personality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONALITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {isRTL ? p.labelAr : p.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'المستوى' : 'Level'}</Label>
                  <Select
                    value={formData.level || 'general'}
                    onValueChange={(value) => handleFieldChange('level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {isRTL ? l.labelAr : l.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'مصدر السياق' : 'Context Source'}</Label>
                  <Select
                    value={formData.contextSource || 'brain'}
                    onValueChange={(value) => handleFieldChange('contextSource', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTEXT_SOURCES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {isRTL ? c.labelAr : c.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    {isRTL ? 'معرف الصوت (ElevenLabs)' : 'Voice ID (ElevenLabs)'}
                  </Label>
                  <Input
                    value={formData.voiceId || ''}
                    onChange={(e) => handleFieldChange('voiceId', e.target.value)}
                    placeholder="e.g., onwK4e9ZLuTAKqWW03F9"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'بادئة البحث في المعرفة' : 'Brain Query Prefix'}</Label>
                  <Input
                    value={formData.brainQueryPrefix || ''}
                    onChange={(e) => handleFieldChange('brainQueryPrefix', e.target.value)}
                    placeholder="e.g., basics fundamentals beginner"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <Label className="text-base">{isRTL ? 'الحالة' : 'Status'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'تفعيل أو تعطيل المعلم' : 'Enable or disable this teacher'}
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleFieldChange('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'System Prompts' : 'System Prompts'}</CardTitle>
              <CardDescription>
                {isRTL
                  ? 'التعليمات الأساسية للمعلم الذكي. استخدم {{PROFILE}} و {{CONTEXT}} للمتغيرات.'
                  : 'Core instructions for the AI teacher. Use {{PROFILE}} and {{CONTEXT}} for variables.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'System Prompt بالعربي' : 'Arabic System Prompt'}</Label>
                <Textarea
                  value={formData.systemPromptAr || ''}
                  onChange={(e) => handleFieldChange('systemPromptAr', e.target.value)}
                  dir="rtl"
                  rows={10}
                  className="font-mono text-sm"
                  placeholder={isRTL ? 'أدخل تعليمات المعلم بالعربي...' : 'Enter Arabic system prompt...'}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'System Prompt بالإنجليزي' : 'English System Prompt'}</Label>
                <Textarea
                  value={formData.systemPromptEn || ''}
                  onChange={(e) => handleFieldChange('systemPromptEn', e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                  placeholder="Enter English system prompt..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'رسائل الترحيب' : 'Welcome Messages'}</CardTitle>
              <CardDescription>
                {isRTL
                  ? 'الرسالة التي تظهر عند بدء المحادثة مع المعلم'
                  : 'The message shown when starting a conversation with this teacher'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'رسالة الترحيب بالعربي' : 'Arabic Welcome Message'}</Label>
                <Textarea
                  value={formData.welcomeMessageAr || ''}
                  onChange={(e) => handleFieldChange('welcomeMessageAr', e.target.value)}
                  dir="rtl"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'رسالة الترحيب بالإنجليزي' : 'English Welcome Message'}</Label>
                <Textarea
                  value={formData.welcomeMessageEn || ''}
                  onChange={(e) => handleFieldChange('welcomeMessageEn', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isRTL ? 'الملفات المرتبطة' : 'Linked Documents'}</CardTitle>
                  <CardDescription>
                    {isRTL
                      ? 'الملفات المخصصة لهذا المعلم من قاعدة المعرفة'
                      : 'Documents assigned to this teacher from the knowledge base'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={docFileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => docFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-violet-500 to-purple-600"
                  >
                    {isUploading ? (
                      <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                    ) : (
                      <Upload className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    )}
                    {isRTL ? 'رفع ملف' : 'Upload File'}
                  </Button>
                  <Link href="/admin/brain">
                    <Button variant="outline" size="sm">
                      <FileText className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {isRTL ? 'إدارة الملفات' : 'Manage All'}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isRTL ? 'لا توجد ملفات مرتبطة بهذا المعلم' : 'No documents linked to this teacher'}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => docFileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {isRTL ? 'رفع ملف جديد' : 'Upload New File'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.fileName} • {doc.chunkCount} chunks
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        doc.status === 'ready' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trainees Tab */}
        <TabsContent value="trainees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'الطلاب المعينين' : 'Assigned Trainees'}</CardTitle>
              <CardDescription>
                {isRTL
                  ? 'قائمة المتدربين الذين تم تعيين هذا المعلم لهم'
                  : 'List of trainees who have been assigned this teacher'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trainees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isRTL ? 'لا يوجد طلاب معينين لهذا المعلم' : 'No trainees assigned to this teacher'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {trainees.map((trainee) => (
                    <Link
                      key={trainee.id}
                      href={`/admin/employees/${trainee.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm">
                            {trainee.firstName.charAt(0)}{trainee.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {trainee.firstName} {trainee.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{trainee.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {trainee.currentSkillLevel && (
                          <Badge variant="outline" className="text-xs">
                            {trainee.currentSkillLevel}
                          </Badge>
                        )}
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
