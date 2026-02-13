'use client';

/**
 * Admin Course Detail/Edit Page
 *
 * Comprehensive management page for a single course:
 * - Basic info editing (titles, descriptions, category, level)
 * - Lectures management (add, edit, delete, reorder)
 * - Attachments management (upload PDF, images)
 * - Settings (publish/unpublish, delete)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import {
  adminCoursesApi,
  Course,
  Lecture,
  CourseAttachment,
  CourseCategory,
  CourseDifficulty,
  CreateLectureData,
  UpdateLectureData,
} from '@/lib/api/admin-courses.api';
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  AlertCircle,
  Upload,
  Video,
  FileText,
  Settings,
  Trash2,
  Plus,
  GripVertical,
  ExternalLink,
  Clock,
  Eye,
  EyeOff,
  Download,
  Image as ImageIcon,
  File,
  Play,
  Edit2,
  X,
  Check,
  ChevronUp,
  ChevronDown,
  Youtube,
} from 'lucide-react';

// Category options
const CATEGORIES = [
  { value: 'fundamentals', labelAr: 'الأساسيات', labelEn: 'Fundamentals' },
  { value: 'sales', labelAr: 'مهارات البيع', labelEn: 'Sales Skills' },
  { value: 'customer-relations', labelAr: 'علاقات العملاء', labelEn: 'Customer Relations' },
  { value: 'specialization', labelAr: 'التخصص', labelEn: 'Specialization' },
  { value: 'marketing', labelAr: 'التسويق', labelEn: 'Marketing' },
  { value: 'legal', labelAr: 'القانون العقاري', labelEn: 'Real Estate Law' },
];

// Difficulty options
const DIFFICULTIES = [
  { value: 'beginner', labelAr: 'مبتدئ', labelEn: 'Beginner' },
  { value: 'intermediate', labelAr: 'متوسط', labelEn: 'Intermediate' },
  { value: 'advanced', labelAr: 'متقدم', labelEn: 'Advanced' },
];

// Gradient for thumbnail placeholder
const GRADIENTS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-orange-500',
];

export default function AdminCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL, language } = useLanguage();
  const { token } = useAuthStore();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    category: 'fundamentals' as CourseCategory,
    difficulty: 'beginner' as CourseDifficulty,
    estimatedDurationMinutes: 60,
    objectivesAr: [] as string[],
    objectivesEn: [] as string[],
    notesAr: '',
    notesEn: '',
  });

  // Lecture dialog state
  const [lectureDialogOpen, setLectureDialogOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [lectureForm, setLectureForm] = useState<CreateLectureData>({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    videoUrl: '',
    durationMinutes: 15,
  });
  const [isSavingLecture, setIsSavingLecture] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteLectureId, setDeleteLectureId] = useState<string | null>(null);
  const [deleteAttachmentId, setDeleteAttachmentId] = useState<string | null>(null);

  // Upload state
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  // Fetch course
  const fetchCourse = useCallback(async () => {
    if (!token || !courseId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await adminCoursesApi.getCourse(courseId);
      setCourse(data.course);

      // Initialize form data
      setFormData({
        titleAr: data.course.titleAr || '',
        titleEn: data.course.titleEn || '',
        descriptionAr: data.course.descriptionAr || '',
        descriptionEn: data.course.descriptionEn || '',
        category: data.course.category,
        difficulty: data.course.difficulty,
        estimatedDurationMinutes: data.course.estimatedDurationMinutes,
        objectivesAr: adminCoursesApi.parseObjectives(data.course.objectivesAr),
        objectivesEn: adminCoursesApi.parseObjectives(data.course.objectivesEn),
        notesAr: data.course.notesAr || '',
        notesEn: data.course.notesEn || '',
      });
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setIsLoading(false);
    }
  }, [token, courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  // Save course
  const handleSaveCourse = async () => {
    if (!course) return;

    try {
      setIsSaving(true);
      const data = await adminCoursesApi.updateCourse(course.id, {
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn,
        category: formData.category,
        difficulty: formData.difficulty,
        estimatedDurationMinutes: formData.estimatedDurationMinutes,
        objectivesAr: formData.objectivesAr,
        objectivesEn: formData.objectivesEn,
        notesAr: formData.notesAr,
        notesEn: formData.notesEn,
      });
      setCourse(data.course);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving course:', err);
      setError(err instanceof Error ? err.message : 'Failed to save course');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle publish
  const handleTogglePublish = async () => {
    if (!course) return;

    try {
      const data = await adminCoursesApi.togglePublish(course.id, !course.isPublished);
      setCourse(data.course);
    } catch (err) {
      console.error('Error toggling publish:', err);
    }
  };

  // Delete course
  const handleDeleteCourse = async () => {
    if (!course) return;

    try {
      setIsDeleting(true);
      await adminCoursesApi.deleteCourse(course.id);
      router.push('/admin/courses');
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open lecture dialog for create
  const handleAddLecture = () => {
    setEditingLecture(null);
    setLectureForm({
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      videoUrl: '',
      durationMinutes: 15,
    });
    setLectureDialogOpen(true);
  };

  // Open lecture dialog for edit
  const handleEditLecture = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setLectureForm({
      titleAr: lecture.titleAr,
      titleEn: lecture.titleEn,
      descriptionAr: lecture.descriptionAr,
      descriptionEn: lecture.descriptionEn,
      videoUrl: lecture.videoUrl,
      durationMinutes: lecture.durationMinutes,
    });
    setLectureDialogOpen(true);
  };

  // Save lecture (create or update)
  const handleSaveLecture = async () => {
    if (!course || !lectureForm.titleAr || !lectureForm.titleEn || !lectureForm.videoUrl) return;

    try {
      setIsSavingLecture(true);

      if (editingLecture) {
        // Update existing lecture
        await adminCoursesApi.updateLecture(course.id, editingLecture.id, lectureForm);
      } else {
        // Create new lecture
        await adminCoursesApi.createLecture(course.id, lectureForm);
      }

      // Refresh course data
      await fetchCourse();
      setLectureDialogOpen(false);
    } catch (err) {
      console.error('Error saving lecture:', err);
      setError(err instanceof Error ? err.message : 'Failed to save lecture');
    } finally {
      setIsSavingLecture(false);
    }
  };

  // Delete lecture
  const handleDeleteLecture = async () => {
    if (!course || !deleteLectureId) return;

    try {
      setIsDeleting(true);
      await adminCoursesApi.deleteLecture(course.id, deleteLectureId);
      await fetchCourse();
      setDeleteLectureId(null);
    } catch (err) {
      console.error('Error deleting lecture:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Move lecture up/down
  const handleMoveLecture = async (lectureId: string, direction: 'up' | 'down') => {
    if (!course?.lectures) return;

    const currentIndex = course.lectures.findIndex((l) => l.id === lectureId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= course.lectures.length) return;

    // Create new order
    const newLectures = [...course.lectures];
    [newLectures[currentIndex], newLectures[newIndex]] = [
      newLectures[newIndex],
      newLectures[currentIndex],
    ];

    try {
      await adminCoursesApi.reorderLectures(
        course.id,
        newLectures.map((l) => l.id)
      );
      await fetchCourse();
    } catch (err) {
      console.error('Error reordering lectures:', err);
    }
  };

  // Upload thumbnail
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !course) return;

    try {
      setIsUploadingThumbnail(true);
      const data = await adminCoursesApi.uploadThumbnail(course.id, file);
      setCourse(data.course);
    } catch (err) {
      console.error('Error uploading thumbnail:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload thumbnail');
    } finally {
      setIsUploadingThumbnail(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    }
  };

  // Upload attachment
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !course) return;

    try {
      setIsUploadingAttachment(true);
      await adminCoursesApi.uploadAttachment(course.id, file, {
        titleAr: file.name,
        titleEn: file.name,
      });
      await fetchCourse();
    } catch (err) {
      console.error('Error uploading attachment:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload attachment');
    } finally {
      setIsUploadingAttachment(false);
      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = '';
      }
    }
  };

  // Delete attachment
  const handleDeleteAttachment = async () => {
    if (!course || !deleteAttachmentId) return;

    try {
      setIsDeleting(true);
      await adminCoursesApi.deleteAttachment(course.id, deleteAttachmentId);
      await fetchCourse();
      setDeleteAttachmentId(null);
    } catch (err) {
      console.error('Error deleting attachment:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get YouTube video ID from URL
  const getYouTubeId = (url: string) => adminCoursesApi.getYouTubeVideoId(url);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-medium text-destructive">{error || 'Course not found'}</p>
          <Button onClick={() => router.push('/admin/courses')} variant="outline">
            {isRTL ? 'العودة للقائمة' : 'Back to List'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/courses')}
            className="shrink-0"
          >
            <BackArrow className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              {isRTL ? course.titleAr : course.titleEn}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                {course.isPublished
                  ? isRTL
                    ? 'منشور'
                    : 'Published'
                  : isRTL
                    ? 'مسودة'
                    : 'Draft'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {course.lectures?.length || 0} {isRTL ? 'درس' : 'lectures'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveCourse}
            disabled={!hasChanges || isSaving}
            className={cn(
              'bg-gradient-to-r from-violet-500 to-purple-600',
              saveSuccess && 'from-emerald-500 to-emerald-600'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : saveSuccess ? (
              <>
                <Check className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'تم الحفظ' : 'Saved!'}
              </>
            ) : (
              <>
                <Save className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'المعلومات' : 'Info'}</span>
          </TabsTrigger>
          <TabsTrigger value="lectures" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الدروس' : 'Lectures'}</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {course.lectures?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="attachments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'المرفقات' : 'Attachments'}</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {course.attachments?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{isRTL ? 'الإعدادات' : 'Settings'}</span>
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-6">
          {/* Thumbnail Section */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'صورة الدورة' : 'Course Thumbnail'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div
                  className={cn(
                    'w-48 h-32 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br',
                    GRADIENTS[0]
                  )}
                >
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={isRTL ? course.titleAr : course.titleEn}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-white/80" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-3">
                    {isRTL
                      ? 'رفع صورة للدورة (يفضل 16:9)'
                      : 'Upload a course thumbnail (16:9 recommended)'}
                  </p>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={isUploadingThumbnail}
                  >
                    {isUploadingThumbnail ? (
                      <>
                        <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
                        {isRTL ? 'جاري الرفع...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <Upload className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                        {isRTL ? 'رفع صورة' : 'Upload Image'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'العنوان بالعربي' : 'Arabic Title'}</Label>
                  <Input
                    value={formData.titleAr}
                    onChange={(e) => handleFormChange('titleAr', e.target.value)}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'العنوان بالإنجليزي' : 'English Title'}</Label>
                  <Input
                    value={formData.titleEn}
                    onChange={(e) => handleFormChange('titleEn', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الوصف بالعربي' : 'Arabic Description'}</Label>
                  <Textarea
                    value={formData.descriptionAr}
                    onChange={(e) => handleFormChange('descriptionAr', e.target.value)}
                    rows={4}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الوصف بالإنجليزي' : 'English Description'}</Label>
                  <Textarea
                    value={formData.descriptionEn}
                    onChange={(e) => handleFormChange('descriptionEn', e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'التصنيف' : 'Category'}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleFormChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {isRTL ? cat.labelAr : cat.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'المستوى' : 'Level'}</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => handleFormChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((diff) => (
                        <SelectItem key={diff.value} value={diff.value}>
                          {isRTL ? diff.labelAr : diff.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'المدة (دقيقة)' : 'Duration (min)'}</Label>
                  <Input
                    type="number"
                    value={formData.estimatedDurationMinutes}
                    onChange={(e) =>
                      handleFormChange('estimatedDurationMinutes', parseInt(e.target.value) || 60)
                    }
                    min={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}</CardTitle>
              <CardDescription>
                {isRTL
                  ? 'ملاحظات تظهر للمتدربين في صفحة الدورة'
                  : 'Notes displayed to trainees on the course page'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الملاحظات بالعربي' : 'Arabic Notes'}</Label>
                  <Textarea
                    value={formData.notesAr}
                    onChange={(e) => handleFormChange('notesAr', e.target.value)}
                    rows={4}
                    dir="rtl"
                    placeholder={isRTL ? 'ملاحظات اختيارية...' : 'Optional notes...'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الملاحظات بالإنجليزي' : 'English Notes'}</Label>
                  <Textarea
                    value={formData.notesEn}
                    onChange={(e) => handleFormChange('notesEn', e.target.value)}
                    rows={4}
                    placeholder="Optional notes..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lectures Tab */}
        <TabsContent value="lectures" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isRTL ? 'الدروس' : 'Lectures'}</CardTitle>
                <CardDescription>
                  {isRTL
                    ? 'إضافة وترتيب دروس الدورة التدريبية'
                    : 'Add and organize course lectures'}
                </CardDescription>
              </div>
              <Button onClick={handleAddLecture}>
                <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {isRTL ? 'إضافة درس' : 'Add Lecture'}
              </Button>
            </CardHeader>
            <CardContent>
              {course.lectures && course.lectures.length > 0 ? (
                <div className="space-y-3">
                  {course.lectures.map((lecture, index) => (
                    <div
                      key={lecture.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      {/* Order controls */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveLecture(lecture.id, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMoveLecture(lecture.id, 'down')}
                          disabled={index === course.lectures!.length - 1}
                          className="p-1 hover:bg-muted rounded disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Thumbnail */}
                      <div className="w-24 h-16 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {lecture.videoType === 'youtube' && getYouTubeId(lecture.videoUrl) ? (
                          <img
                            src={`https://img.youtube.com/vi/${getYouTubeId(lecture.videoUrl)}/mqdefault.jpg`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Video className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {index + 1}.
                          </span>
                          <h4 className="font-medium truncate">
                            {isRTL ? lecture.titleAr : lecture.titleEn}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lecture.durationMinutes} {isRTL ? 'دقيقة' : 'min'}
                          </span>
                          {lecture.videoType === 'youtube' && (
                            <span className="flex items-center gap-1 text-red-500">
                              <Youtube className="h-3 w-3" />
                              YouTube
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(lecture.videoUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditLecture(lecture)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteLectureId(lecture.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isRTL ? 'لا توجد دروس بعد' : 'No lectures yet'}</p>
                  <Button onClick={handleAddLecture} variant="outline" className="mt-4">
                    <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {isRTL ? 'إضافة أول درس' : 'Add First Lecture'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isRTL ? 'المرفقات' : 'Attachments'}</CardTitle>
                <CardDescription>
                  {isRTL
                    ? 'رفع ملفات PDF وصور للدورة التدريبية'
                    : 'Upload PDF files and images for the course'}
                </CardDescription>
              </div>
              <div>
                <input
                  ref={attachmentInputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={handleAttachmentUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => attachmentInputRef.current?.click()}
                  disabled={isUploadingAttachment}
                >
                  {isUploadingAttachment ? (
                    <>
                      <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
                      {isRTL ? 'جاري الرفع...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                      {isRTL ? 'رفع ملف' : 'Upload File'}
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {course.attachments && course.attachments.length > 0 ? (
                <div className="space-y-3">
                  {course.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      {/* Icon */}
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                        {attachment.fileType === 'pdf' ? (
                          <FileText className="h-6 w-6 text-red-500" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-blue-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {isRTL ? attachment.titleAr : attachment.titleEn}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{attachment.fileName}</span>
                          <span>{formatFileSize(attachment.fileSize)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(attachment.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteAttachmentId(attachment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isRTL ? 'لا توجد مرفقات بعد' : 'No attachments yet'}</p>
                  <Button
                    onClick={() => attachmentInputRef.current?.click()}
                    variant="outline"
                    className="mt-4"
                  >
                    <Upload className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {isRTL ? 'رفع أول ملف' : 'Upload First File'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'حالة النشر' : 'Publish Status'}</CardTitle>
              <CardDescription>
                {isRTL
                  ? 'التحكم في ظهور الدورة للمتدربين'
                  : 'Control course visibility for trainees'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  {course.isPublished ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-emerald-500" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <EyeOff className="h-5 w-5 text-amber-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {course.isPublished
                        ? isRTL
                          ? 'الدورة منشورة'
                          : 'Course is Published'
                        : isRTL
                          ? 'الدورة مسودة'
                          : 'Course is Draft'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {course.isPublished
                        ? isRTL
                          ? 'الدورة ظاهرة للمتدربين'
                          : 'Course is visible to trainees'
                        : isRTL
                          ? 'الدورة مخفية عن المتدربين'
                          : 'Course is hidden from trainees'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={course.isPublished}
                  onCheckedChange={handleTogglePublish}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">
                {isRTL ? 'منطقة الخطر' : 'Danger Zone'}
              </CardTitle>
              <CardDescription>
                {isRTL
                  ? 'إجراءات لا يمكن التراجع عنها'
                  : 'Actions that cannot be undone'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <div>
                  <p className="font-medium text-destructive">
                    {isRTL ? 'حذف الدورة' : 'Delete Course'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? 'سيتم حذف جميع الدروس والمرفقات'
                      : 'All lectures and attachments will be deleted'}
                  </p>
                </div>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'حذف' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lecture Dialog */}
      <Dialog open={lectureDialogOpen} onOpenChange={setLectureDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-violet-500" />
              {editingLecture
                ? isRTL
                  ? 'تعديل الدرس'
                  : 'Edit Lecture'
                : isRTL
                  ? 'إضافة درس جديد'
                  : 'Add New Lecture'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'العنوان بالعربي *' : 'Arabic Title *'}</Label>
                <Input
                  value={lectureForm.titleAr}
                  onChange={(e) =>
                    setLectureForm((prev) => ({ ...prev, titleAr: e.target.value }))
                  }
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'العنوان بالإنجليزي *' : 'English Title *'}</Label>
                <Input
                  value={lectureForm.titleEn}
                  onChange={(e) =>
                    setLectureForm((prev) => ({ ...prev, titleEn: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'الوصف بالعربي' : 'Arabic Description'}</Label>
                <Textarea
                  value={lectureForm.descriptionAr || ''}
                  onChange={(e) =>
                    setLectureForm((prev) => ({ ...prev, descriptionAr: e.target.value }))
                  }
                  rows={3}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'الوصف بالإنجليزي' : 'English Description'}</Label>
                <Textarea
                  value={lectureForm.descriptionEn || ''}
                  onChange={(e) =>
                    setLectureForm((prev) => ({ ...prev, descriptionEn: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'رابط الفيديو *' : 'Video URL *'}</Label>
              <Input
                value={lectureForm.videoUrl}
                onChange={(e) => setLectureForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground">
                {isRTL ? 'يدعم روابط YouTube و Vimeo' : 'Supports YouTube and Vimeo URLs'}
              </p>
            </div>

            {/* YouTube Preview - Small thumbnail */}
            {lectureForm.videoUrl && getYouTubeId(lectureForm.videoUrl) && (
              <div className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
                <img
                  src={`https://img.youtube.com/vi/${getYouTubeId(lectureForm.videoUrl)}/default.jpg`}
                  alt="Video preview"
                  className="w-20 h-14 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-500">
                    {isRTL ? '✓ تم التعرف على الفيديو' : '✓ Video detected'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    youtube.com/watch?v={getYouTubeId(lectureForm.videoUrl)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>{isRTL ? 'المدة (دقيقة)' : 'Duration (minutes)'}</Label>
              <Input
                type="number"
                value={lectureForm.durationMinutes || 15}
                onChange={(e) =>
                  setLectureForm((prev) => ({
                    ...prev,
                    durationMinutes: parseInt(e.target.value) || 15,
                  }))
                }
                min={1}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLectureDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSaveLecture}
              disabled={
                isSavingLecture ||
                !lectureForm.titleAr ||
                !lectureForm.titleEn ||
                !lectureForm.videoUrl
              }
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {isSavingLecture ? (
                <>
                  <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'حفظ' : 'Save'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {isRTL ? 'حذف الدورة' : 'Delete Course'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL
                ? 'هل أنت متأكد من حذف هذه الدورة؟ سيتم حذف جميع الدروس والمرفقات نهائياً.'
                : 'Are you sure you want to delete this course? All lectures and attachments will be permanently deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'جاري الحذف...' : 'Deleting...'}
                </>
              ) : (
                <>
                  <Trash2 className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'حذف' : 'Delete'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Lecture Dialog */}
      <AlertDialog open={!!deleteLectureId} onOpenChange={() => setDeleteLectureId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {isRTL ? 'حذف الدرس' : 'Delete Lecture'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL
                ? 'هل أنت متأكد من حذف هذا الدرس؟'
                : 'Are you sure you want to delete this lecture?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLecture}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

      {/* Delete Attachment Dialog */}
      <AlertDialog open={!!deleteAttachmentId} onOpenChange={() => setDeleteAttachmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              {isRTL ? 'حذف المرفق' : 'Delete Attachment'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL
                ? 'هل أنت متأكد من حذف هذا المرفق؟'
                : 'Are you sure you want to delete this attachment?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAttachment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
    </div>
  );
}
