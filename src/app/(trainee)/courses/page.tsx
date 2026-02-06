'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  courses,
  getCourseTitle,
  getCourseDescription,
  Course
} from '@/data/courses';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { traineeApi } from '@/lib/api/trainee.api';
import {
  BookOpen,
  Clock,
  Play,
  GraduationCap,
  Search,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Phone,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function CoursesPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  // Fetch completed lessons from backend
  useEffect(() => {
    const fetchCompletedLessons = async () => {
      try {
        const profile = await traineeApi.getProfile();
        if (profile.progress?.completedLectureIds) {
          setCompletedLessonIds(new Set(profile.progress.completedLectureIds));
        }
      } catch (err) {
        console.error('Failed to fetch completed lessons:', err);
      }
    };

    fetchCompletedLessons();
  }, []);

  // Calculate progress for each course
  const getCourseProgress = (course: Course): number => {
    if (course.lessons.length === 0) return 0;
    const completedCount = course.lessons.filter(lesson => completedLessonIds.has(lesson.id)).length;
    return Math.round((completedCount / course.lessons.length) * 100);
  };

  // Check if course is completed
  const isCourseCompleted = (course: Course): boolean => {
    return course.lessons.length > 0 && course.lessons.every(lesson => completedLessonIds.has(lesson.id));
  };

  // Localized categories
  const categories = useMemo(() => [
    { id: 'All', label: isRTL ? 'جميع التصنيفات' : 'All Categories' },
    { id: 'Fundamentals', label: isRTL ? 'الأساسيات' : 'Fundamentals' },
    { id: 'Sales Skills', label: isRTL ? 'مهارات البيع' : 'Sales Skills' },
    { id: 'Client Relations', label: isRTL ? 'علاقات العملاء' : 'Client Relations' },
    { id: 'Specialization', label: isRTL ? 'التخصص' : 'Specialization' },
    { id: 'Marketing', label: isRTL ? 'التسويق' : 'Marketing' },
  ], [isRTL]);

  // Localized difficulties
  const difficulties = useMemo(() => [
    { id: 'All', label: isRTL ? 'جميع المستويات' : 'All Levels' },
    { id: 'beginner', label: isRTL ? 'مبتدئ' : 'Beginner' },
    { id: 'intermediate', label: isRTL ? 'متوسط' : 'Intermediate' },
    { id: 'advanced', label: isRTL ? 'متقدّم' : 'Advanced' },
  ], [isRTL]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const title = getCourseTitle(course, isRTL).toLowerCase();
      const description = getCourseDescription(course, isRTL).toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = title.includes(query) || description.includes(query);
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty, isRTL]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (isRTL) {
      return hours > 0 ? `${hours} ساعة ${mins} دقيقة` : `${mins} دقيقة`;
    }
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      beginner: { ar: 'مبتدئ', en: 'Beginner' },
      intermediate: { ar: 'متوسط', en: 'Intermediate' },
      advanced: { ar: 'متقدّم', en: 'Advanced' },
    };
    return isRTL ? labels[difficulty]?.ar : labels[difficulty]?.en || difficulty;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Fundamentals': 'bg-blue-500',
      'Sales Skills': 'bg-purple-500',
      'Client Relations': 'bg-green-500',
      'Specialization': 'bg-orange-500',
      'Marketing': 'bg-pink-500',
    };
    return colors[category] || 'bg-muted-foreground';
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, { ar: string; en: string }> = {
      'Fundamentals': { ar: 'الأساسيات', en: 'Fundamentals' },
      'Sales Skills': { ar: 'مهارات البيع', en: 'Sales Skills' },
      'Client Relations': { ar: 'علاقات العملاء', en: 'Client Relations' },
      'Specialization': { ar: 'التخصص', en: 'Specialization' },
      'Marketing': { ar: 'التسويق', en: 'Marketing' },
    };
    return isRTL ? categoryMap[category]?.ar : categoryMap[category]?.en || category;
  };

  const getSimulationLabel = (type: 'text' | 'voice') => {
    if (type === 'text') {
      return isRTL ? 'محاكاة نصية' : 'Text Simulation';
    }
    return isRTL ? 'مكالمة صوتية' : 'Voice Call';
  };

  // Get appropriate course image based on course ID/category
  const getCourseImage = (courseId: string) => {
    const courseImages: Record<string, string> = {
      'real-estate-fundamentals': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop&q=80',
      'negotiation-mastery': 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=450&fit=crop&q=80',
      'client-psychology': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=450&fit=crop&q=80',
      'luxury-properties': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=450&fit=crop&q=80',
      'digital-marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop&q=80',
      'first-time-buyers': 'https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?w=800&h=450&fit=crop&q=80',
    };
    return courseImages[courseId] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop&q=80';
  };

  const handleStartSimulation = (course: Course, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (course.recommendedSimulation) {
      const { type, scenarioType, difficultyLevel } = course.recommendedSimulation;
      if (type === 'text') {
        router.push(`/simulation?scenario=${scenarioType}&difficulty=${difficultyLevel}`);
      } else {
        router.push('/voice-training');
      }
    }
  };

  // RTL-aware icons
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-card to-background border-b border-border">
        <div className="container mx-auto py-8 px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground leading-relaxed">
                {isRTL ? 'الدورات التدريبية' : 'Training Courses'}
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                {isRTL
                  ? 'طوّر مهاراتك مع دورات متخصصة من الخبراء'
                  : 'Develop your skills with expert-led courses'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground bg-card/50 px-4 py-2 rounded-xl border border-border">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-medium">{courses.length} {isRTL ? 'دورة متاحة' : 'courses available'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 lg:px-8">
        {/* Filters */}
        <div className="bg-card rounded-2xl border border-border p-5 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={cn(
                "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                isRTL ? "right-4" : "left-4"
              )} />
              <Input
                placeholder={isRTL ? 'ابحث عن دورة...' : 'Search for a course...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "h-12 rounded-xl border-border/50 focus:border-primary transition-colors",
                  isRTL ? "pr-12 text-right" : "pl-12"
                )}
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "rounded-lg transition-all",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-primary/10 hover:border-primary/30"
                  )}
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-2">
              {difficulties.map(diff => (
                <Button
                  key={diff.id}
                  variant={selectedDifficulty === diff.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={cn(
                    "rounded-lg transition-all",
                    selectedDifficulty === diff.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-primary/10 hover:border-primary/30"
                  )}
                >
                  {diff.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {isRTL ? 'لا توجد دورات' : 'No courses found'}
            </h3>
            <p className="text-muted-foreground">
              {isRTL ? 'جرب تعديل معايير البحث' : 'Try adjusting your search filters'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} prefetch={true}>
                <Card className="h-full overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-card">
                  {/* Course Image/Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-muted/80 to-muted overflow-hidden">
                    {/* Background image using Unsplash */}
                    <img
                      src={getCourseImage(course.id)}
                      alt={getCourseTitle(course, isRTL)}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                        <Play className={cn("h-6 w-6 text-primary", isRTL ? "mr-0.5" : "ml-0.5")} />
                      </div>
                    </div>
                    <div className={cn("absolute top-3", isRTL ? "right-3" : "left-3")}>
                      <Badge className={cn("border font-medium backdrop-blur-sm", getDifficultyColor(course.difficulty))}>
                        {getDifficultyLabel(course.difficulty)}
                      </Badge>
                    </div>
                    <div className={cn("absolute top-3", isRTL ? "left-3" : "right-3")}>
                      {isCourseCompleted(course) ? (
                        <Badge className="bg-green-500 text-white font-medium backdrop-blur-sm border-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {isRTL ? 'مكتمل' : 'Completed'}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-white/90 text-foreground font-medium backdrop-blur-sm">
                          {course.lessons.length} {isRTL ? 'درس' : 'lessons'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Category */}
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2.5 h-2.5 rounded-full", getCategoryColor(course.category))} />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {getCategoryLabel(course.category)}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-relaxed">
                        {getCourseTitle(course, isRTL)}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {getCourseDescription(course, isRTL)}
                      </p>
                    </div>

                    {/* Course Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(course.estimatedDurationMinutes)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.lessons.length} {isRTL ? 'درس' : 'lessons'}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{isRTL ? 'التقدم' : 'Progress'}</span>
                        <span className={cn(
                          "font-semibold",
                          isCourseCompleted(course) ? "text-green-500" : "text-foreground"
                        )}>
                          {getCourseProgress(course)}%
                          {isCourseCompleted(course) && (
                            <CheckCircle className="inline h-3 w-3 ml-1" />
                          )}
                        </span>
                      </div>
                      <Progress
                        value={getCourseProgress(course)}
                        className={cn("h-2", isCourseCompleted(course) && "[&>div]:bg-green-500")}
                      />
                    </div>

                    {/* Recommended Simulation Badge */}
                    {course.recommendedSimulation && (
                      <div
                        className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 cursor-pointer hover:from-primary/10 hover:to-primary/15 transition-colors"
                        onClick={(e) => handleStartSimulation(course, e)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            {course.recommendedSimulation.type === 'text' ? (
                              <MessageSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Phone className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-primary truncate">
                              {isRTL ? 'تدريب موصى به' : 'Recommended Training'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {getSimulationLabel(course.recommendedSimulation.type)}
                            </p>
                          </div>
                        </div>
                        <Sparkles className="h-4 w-4 text-primary/60" />
                      </div>
                    )}

                    {/* CTA */}
                    <Button className={cn(
                      "w-full h-11 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all",
                      isCourseCompleted(course)
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-gradient-to-r from-primary to-teal-500 hover:from-primary/90 hover:to-teal-500/90 text-white"
                    )}>
                      {isCourseCompleted(course)
                        ? (isRTL ? 'مكتمل ✓' : 'Completed ✓')
                        : getCourseProgress(course) > 0
                          ? (isRTL ? 'أكمل الدورة' : 'Continue')
                          : (isRTL ? 'ابدأ التعلم' : 'Start Learning')
                      }
                      {!isCourseCompleted(course) && (
                        <ArrowIcon className={cn(
                          "h-4 w-4 transition-transform",
                          isRTL ? "mr-2 group-hover:-translate-x-1" : "ml-2 group-hover:translate-x-1"
                        )} />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
