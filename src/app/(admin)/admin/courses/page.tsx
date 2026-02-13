'use client';

/**
 * Admin Courses Management Page
 *
 * Allows org admins to manage training courses:
 * - View all courses in a grid
 * - Create new courses
 * - Edit course details, lectures, attachments
 * - Publish/unpublish courses
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  adminCoursesApi,
  Course,
  CourseCategory,
  CourseDifficulty,
  CategoryOption,
  DifficultyOption,
  CreateCourseData,
} from '@/lib/api/admin-courses.api';
import {
  BookOpen,
  Plus,
  Video,
  FileText,
  Loader2,
  AlertCircle,
  GraduationCap,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';

// Category icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  fundamentals: GraduationCap,
  sales: BookOpen,
  'customer-relations': BookOpen,
  specialization: BookOpen,
  marketing: BookOpen,
  legal: BookOpen,
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  fundamentals: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  sales: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'customer-relations': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  specialization: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  marketing: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  legal: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

// Difficulty colors
const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-500',
  intermediate: 'bg-blue-500/10 text-blue-500',
  advanced: 'bg-purple-500/10 text-purple-500',
};

// Gradient colors for course thumbnails
const GRADIENTS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-teal-500',
];

export default function AdminCoursesPage() {
  const { isRTL, language } = useLanguage();
  const { token } = useAuthStore();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [difficulties, setDifficulties] = useState<DifficultyOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<CourseDifficulty | 'all'>('all');

  // New course form
  const [newCourse, setNewCourse] = useState<CreateCourseData>({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    category: 'fundamentals',
    difficulty: 'beginner',
    estimatedDurationMinutes: 60,
  });

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await adminCoursesApi.listCourses({
        category: categoryFilter,
        difficulty: difficultyFilter,
        search: searchQuery || undefined,
      });
      setCourses(data.courses);
      setCategories(data.categories);
      setDifficulties(data.difficulties);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  }, [token, categoryFilter, difficultyFilter, searchQuery]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Toggle publish status
  const handleTogglePublish = async (course: Course) => {
    try {
      await adminCoursesApi.togglePublish(course.id, !course.isPublished);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, isPublished: !c.isPublished } : c))
      );
    } catch (err) {
      console.error('Error toggling publish status:', err);
    }
  };

  // Create new course
  const handleCreateCourse = async () => {
    if (!newCourse.titleAr || !newCourse.titleEn) {
      return;
    }

    try {
      setIsCreating(true);
      const data = await adminCoursesApi.createCourse(newCourse);
      setCreateDialogOpen(false);
      setNewCourse({
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        category: 'fundamentals',
        difficulty: 'beginner',
        estimatedDurationMinutes: 60,
      });
      // Navigate to the new course's page
      router.push(`/admin/courses/${data.course.id}`);
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      setIsDeleting(true);
      await adminCoursesApi.deleteCourse(courseToDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get gradient for course thumbnail
  const getGradient = (index: number) => GRADIENTS[index % GRADIENTS.length];

  // Get category label
  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? (isRTL ? cat.labelAr : cat.labelEn) : category;
  };

  // Get difficulty label
  const getDifficultyLabel = (difficulty: string) => {
    const diff = difficulties.find((d) => d.value === difficulty);
    return diff ? (isRTL ? diff.labelAr : diff.labelEn) : difficulty;
  };

  // RTL-aware chevron
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return isRTL ? `${minutes} دقيقة` : `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return isRTL ? `${hours} ساعة` : `${hours}h`;
    }
    return isRTL ? `${hours} ساعة ${mins} دقيقة` : `${hours}h ${mins}m`;
  };

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
          <Button onClick={fetchCourses} variant="outline">
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
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            {isRTL ? 'إدارة الدورات التدريبية' : 'Course Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL
              ? 'إضافة وتعديل الدورات التدريبية لمتدربيك'
              : 'Add and manage training courses for your trainees'}
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
        >
          <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
          {isRTL ? 'إضافة دورة' : 'Add Course'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'إجمالي الدورات' : 'Total Courses'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.filter((c) => c.isPublished).length}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'منشور' : 'Published'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <EyeOff className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.filter((c) => !c.isPublished).length}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'مسودة' : 'Draft'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Video className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {courses.reduce((sum, c) => sum + (c._count?.lectures || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'إجمالي الدروس' : 'Total Lectures'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className={cn(
              'absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground',
              isRTL ? 'right-3' : 'left-3'
            )}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث في الدورات...' : 'Search courses...'}
            className={cn('h-10', isRTL ? 'pr-10' : 'pl-10')}
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value as CourseCategory | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
            <SelectValue placeholder={isRTL ? 'التصنيف' : 'Category'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'كل التصنيفات' : 'All Categories'}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {isRTL ? cat.labelAr : cat.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={difficultyFilter}
          onValueChange={(value) => setDifficultyFilter(value as CourseDifficulty | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={isRTL ? 'المستوى' : 'Level'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'كل المستويات' : 'All Levels'}</SelectItem>
            {difficulties.map((diff) => (
              <SelectItem key={diff.value} value={diff.value}>
                {isRTL ? diff.labelAr : diff.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courses.map((course, index) => {
          const CategoryIcon = CATEGORY_ICONS[course.category] || BookOpen;

          return (
            <Card
              key={course.id}
              className={cn(
                'group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-violet-500/30',
                !course.isPublished && 'opacity-70'
              )}
              onClick={() => router.push(`/admin/courses/${course.id}`)}
            >
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div
                  className={cn(
                    'h-32 rounded-t-lg flex items-center justify-center bg-gradient-to-br',
                    getGradient(index)
                  )}
                >
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={isRTL ? course.titleAr : course.titleEn}
                      className="h-full w-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-white/80" />
                  )}
                </div>

                <div className="p-4">
                  {/* Header with Status */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-violet-500 transition-colors">
                        {isRTL ? course.titleAr : course.titleEn}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={course.isPublished}
                        onCheckedChange={() => handleTogglePublish(course)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {isRTL ? course.descriptionAr : course.descriptionEn}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge
                      variant="outline"
                      className={cn('text-xs', CATEGORY_COLORS[course.category] || '')}
                    >
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {getCategoryLabel(course.category)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', DIFFICULTY_COLORS[course.difficulty] || '')}
                    >
                      {getDifficultyLabel(course.difficulty)}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Video className="h-4 w-4" />
                      <span>{course._count?.lectures || 0}</span>
                      <span className="text-xs">{isRTL ? 'درس' : 'lectures'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">{formatDuration(course.estimatedDurationMinutes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCourseToDelete(course);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </button>
                      <ChevronIcon className="h-4 w-4 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add New Course Card */}
        <Card
          className="group cursor-pointer border-dashed border-2 hover:border-violet-500/50 transition-all duration-200"
          onClick={() => setCreateDialogOpen(true)}
        >
          <CardContent className="p-5 flex flex-col items-center justify-center min-h-[280px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
              <Plus className="h-8 w-8 text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {isRTL ? 'إضافة دورة جديدة' : 'Add New Course'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'أنشئ دورة تدريبية جديدة' : 'Create a new training course'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              {isRTL ? 'حذف الدورة' : 'Delete Course'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'هل أنت متأكد من حذف هذه الدورة؟ سيتم حذف جميع الدروس والمرفقات.'
                : 'Are you sure you want to delete this course? All lectures and attachments will be deleted.'}
            </DialogDescription>
          </DialogHeader>

          {courseToDelete && (
            <div className="py-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="font-medium">
                  {isRTL ? courseToDelete.titleAr : courseToDelete.titleEn}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {courseToDelete._count?.lectures || 0} {isRTL ? 'درس' : 'lectures'} •{' '}
                  {courseToDelete._count?.attachments || 0} {isRTL ? 'مرفق' : 'attachments'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse} disabled={isDeleting}>
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
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Course Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-500" />
              {isRTL ? 'إضافة دورة جديدة' : 'Add New Course'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'أدخل المعلومات الأساسية للدورة الجديدة'
                : 'Enter basic information for the new course'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'العنوان بالعربي *' : 'Arabic Title *'}</Label>
                <Input
                  value={newCourse.titleAr}
                  onChange={(e) => setNewCourse((prev) => ({ ...prev, titleAr: e.target.value }))}
                  placeholder={isRTL ? 'مثال: أساسيات العقار' : 'e.g., أساسيات العقار'}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'العنوان بالإنجليزي *' : 'English Title *'}</Label>
                <Input
                  value={newCourse.titleEn}
                  onChange={(e) => setNewCourse((prev) => ({ ...prev, titleEn: e.target.value }))}
                  placeholder="e.g., Real Estate Fundamentals"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'الوصف بالعربي' : 'Arabic Description'}</Label>
                <Textarea
                  value={newCourse.descriptionAr || ''}
                  onChange={(e) =>
                    setNewCourse((prev) => ({ ...prev, descriptionAr: e.target.value }))
                  }
                  placeholder={isRTL ? 'وصف الدورة...' : 'Course description...'}
                  dir="rtl"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'الوصف بالإنجليزي' : 'English Description'}</Label>
                <Textarea
                  value={newCourse.descriptionEn || ''}
                  onChange={(e) =>
                    setNewCourse((prev) => ({ ...prev, descriptionEn: e.target.value }))
                  }
                  placeholder="Course description..."
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'التصنيف' : 'Category'}</Label>
                <Select
                  value={newCourse.category}
                  onValueChange={(value) =>
                    setNewCourse((prev) => ({ ...prev, category: value as CourseCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
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
                  value={newCourse.difficulty}
                  onValueChange={(value) =>
                    setNewCourse((prev) => ({ ...prev, difficulty: value as CourseDifficulty }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
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
                  value={newCourse.estimatedDurationMinutes || 60}
                  onChange={(e) =>
                    setNewCourse((prev) => ({
                      ...prev,
                      estimatedDurationMinutes: parseInt(e.target.value) || 60,
                    }))
                  }
                  min={1}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleCreateCourse}
              disabled={isCreating || !newCourse.titleAr || !newCourse.titleEn}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {isCreating ? (
                <>
                  <Loader2 className={cn('h-4 w-4 animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {isRTL ? 'إنشاء الدورة' : 'Create Course'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
