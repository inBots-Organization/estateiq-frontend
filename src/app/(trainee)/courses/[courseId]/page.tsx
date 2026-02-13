'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLessonContext } from '@/contexts/LessonContext';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { traineeCoursesApi, Course, Lesson } from '@/lib/api/trainee-courses.api';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { traineeApi } from '@/lib/api/trainee.api';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Clock,
  CheckCircle,
  BookOpen,
  Target,
  Award,
  MessageSquare,
  Phone,
  Sparkles,
  Loader2,
  GraduationCap,
  Brain,
  AlertCircle,
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL } = useLanguage();
  const { setLessonContext } = useLessonContext();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lessonStartTime = useRef<number>(Date.now());

  // Load course from API
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await traineeCoursesApi.getCourse(courseId);
        setCourse(response.course);
        if (response.course.lessons && response.course.lessons.length > 0) {
          setSelectedLesson(response.course.lessons[0]);
        }
      } catch (err: any) {
        console.error('Failed to fetch course:', err);
        setError(err.message || 'Course not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Fetch completed lessons from backend
  useEffect(() => {
    const fetchCompletedLessons = async () => {
      try {
        const profile = await traineeApi.getProfile();
        if (profile.progress?.completedLectureIds) {
          setCompletedLessons(new Set(profile.progress.completedLectureIds));
        }
      } catch (err) {
        console.error('Failed to fetch completed lessons:', err);
      }
    };

    fetchCompletedLessons();
  }, []);

  // Track when lesson changes to calculate time spent
  useEffect(() => {
    lessonStartTime.current = Date.now();
  }, [selectedLesson?.id]);

  const ArrowBackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isRTL ? 'جاري تحميل الدورة...' : 'Loading course...'}
          </p>
        </div>
      </div>
    );
  }

  // Error/Not found state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-foreground mb-2">
            {isRTL ? 'الدورة غير موجودة' : 'Course not found'}
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href="/courses">
            <Button variant="outline">
              {isRTL ? 'العودة للدورات' : 'Back to Courses'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleLessonComplete = async () => {
    if (selectedLesson && !completedLessons.has(selectedLesson.id)) {
      setIsCompletingLesson(true);

      try {
        // Calculate time spent on this lesson (min 1 minute, max lesson duration)
        const timeSpentMs = Date.now() - lessonStartTime.current;
        const timeSpentMinutes = Math.min(
          Math.max(1, Math.round(timeSpentMs / 60000)),
          selectedLesson.durationMinutes
        );

        // Save to backend
        await traineeApi.completeLecture(selectedLesson.id, timeSpentMinutes);

        // Update local state
        const newCompleted = new Set(completedLessons);
        newCompleted.add(selectedLesson.id);
        setCompletedLessons(newCompleted);

        // Auto-advance to next lesson
        if (course.lessons) {
          const currentIndex = course.lessons.findIndex(l => l.id === selectedLesson.id);
          if (currentIndex < course.lessons.length - 1) {
            setSelectedLesson(course.lessons[currentIndex + 1]);
          }
        }
      } catch (err) {
        console.error('Failed to save lesson completion:', err);
        // Still update local state even if API fails
        const newCompleted = new Set(completedLessons);
        newCompleted.add(selectedLesson.id);
        setCompletedLessons(newCompleted);
      } finally {
        setIsCompletingLesson(false);
      }
    }
  };

  const handleStartSimulation = () => {
    if (course.recommendedSimulation) {
      const { type, scenarioType, difficultyLevel } = course.recommendedSimulation;
      if (type === 'text') {
        router.push(`/simulation?scenario=${scenarioType}&difficulty=${difficultyLevel}`);
      } else {
        router.push('/voice-training');
      }
    }
  };

  // Navigate to AI Teacher with lesson context
  const handleStudyWithAI = () => {
    if (!selectedLesson || !course) return;

    // Set the lesson context for the AI Teacher
    setLessonContext({
      lessonId: selectedLesson.id,
      lessonName: selectedLesson.titleEn,
      lessonNameAr: selectedLesson.titleAr,
      lessonDescription: selectedLesson.descriptionEn,
      lessonDescriptionAr: selectedLesson.descriptionAr,
      courseId: course.id,
      courseName: course.titleEn,
      courseNameAr: course.titleAr,
      courseCategory: course.category,
      courseDifficulty: course.difficulty,
      courseObjectives: course.objectivesEn,
      courseObjectivesAr: course.objectivesAr,
      videoId: selectedLesson.videoId,
      videoDurationMinutes: selectedLesson.durationMinutes,
      attachedFiles: [], // Future-proofing for lesson materials
    });

    // Navigate to AI Teacher
    router.push('/ai-teacher');
  };

  // Get video ID for embedding
  const getVideoEmbedUrl = (lesson: Lesson) => {
    const videoId = traineeCoursesApi.getYouTubeVideoId(lesson.videoId || lesson.videoUrl);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }
    // If it's not a YouTube URL, return as-is
    return lesson.videoUrl;
  };

  const lessons = course.lessons || [];
  const lessonCount = lessons.length;
  const completedCount = lessons.filter(l => completedLessons.has(l.id)).length;
  const progressPercent = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
  const objectives = traineeCoursesApi.getCourseObjectives(course, isRTL);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto py-4 px-4 lg:px-8">
          <Link
            href="/courses"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowBackIcon className={cn("h-4 w-4", isRTL ? "ml-1" : "mr-1")} />
            {isRTL ? 'العودة للدورات' : 'Back to Courses'}
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn("border", traineeCoursesApi.getDifficultyColor(course.difficulty))}>
                  {traineeCoursesApi.getDifficultyLabel(course.difficulty, isRTL)}
                </Badge>
                <Badge variant="outline">{traineeCoursesApi.getCategoryLabel(course.category, isRTL)}</Badge>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-relaxed">
                {traineeCoursesApi.getCourseTitle(course, isRTL)}
              </h1>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{traineeCoursesApi.formatDuration(course.estimatedDurationMinutes, isRTL)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>{lessonCount} {isRTL ? 'درس' : 'lessons'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                <span>{progressPercent}% {isRTL ? 'مكتمل' : 'complete'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Video Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card className="overflow-hidden border-border">
              <div className="aspect-video bg-black">
                {selectedLesson && (
                  <iframe
                    className="w-full h-full"
                    src={getVideoEmbedUrl(selectedLesson)}
                    title={traineeCoursesApi.getLessonTitle(selectedLesson, isRTL)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
              {selectedLesson && (
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-foreground mb-2 leading-relaxed">
                        {traineeCoursesApi.getLessonTitle(selectedLesson, isRTL)}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {traineeCoursesApi.getLessonDescription(selectedLesson, isRTL)}
                      </p>
                    </div>
                    <Button
                      onClick={handleLessonComplete}
                      disabled={completedLessons.has(selectedLesson.id) || isCompletingLesson}
                      className={cn(
                        "flex-shrink-0",
                        completedLessons.has(selectedLesson.id)
                          ? 'bg-green-600 hover:bg-green-600'
                          : 'bg-primary hover:bg-primary/90'
                      )}
                    >
                      {isCompletingLesson ? (
                        <>
                          <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                          {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : completedLessons.has(selectedLesson.id) ? (
                        <>
                          <CheckCircle className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          {isRTL ? 'مكتمل' : 'Completed'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          {isRTL ? 'تم الإكمال' : 'Mark Complete'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Course Objectives */}
            {objectives.length > 0 && (
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {isRTL ? 'ما ستتعلمه' : "What You'll Learn"}
                  </h3>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground leading-relaxed">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Course Description */}
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {isRTL ? 'عن هذه الدورة' : 'About This Course'}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {traineeCoursesApi.getCourseDescription(course, isRTL)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - AI Tools & Lesson List */}
          <div className="lg:col-span-1 space-y-4">
            {/* AI Learning Tools Card - Prominent at Top */}
            <Card className="border-2 border-violet-500/30 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 overflow-hidden">
              <CardContent className="p-4">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">
                      {isRTL ? 'أدوات التعلم الذكية' : 'AI Learning Tools'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'تعلم أسرع مع الذكاء الاصطناعي' : 'Learn faster with AI assistance'}
                    </p>
                  </div>
                </div>

                {/* Study with AI Teacher - Primary CTA */}
                {selectedLesson && (
                  <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/20 mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 animate-pulse" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-5 w-5 text-violet-400" />
                        <span className="font-bold text-violet-400">
                          {isRTL ? 'ذاكر مع معلمك الذكي' : 'Study with AI Teacher'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {isRTL
                          ? `احصل على شرح مخصص لـ "${traineeCoursesApi.getLessonTitle(selectedLesson, isRTL)}" مع اختبارات فورية.`
                          : `Get personalized explanation of "${traineeCoursesApi.getLessonTitle(selectedLesson, isRTL)}" with instant quizzes.`
                        }
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                          <Brain className="h-3 w-3 me-1" />
                          {isRTL ? 'شرح مفصل' : 'Explanations'}
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                          <Target className="h-3 w-3 me-1" />
                          {isRTL ? 'اختبارات' : 'Quizzes'}
                        </Badge>
                      </div>
                      <Button
                        onClick={handleStudyWithAI}
                        className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25"
                      >
                        <GraduationCap className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                        {isRTL ? 'ابدأ المذاكرة الآن' : 'Start Studying Now'}
                        <Sparkles className={cn("h-4 w-4", isRTL ? "mr-2" : "ml-2")} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* AI Practice Section */}
                <div className="p-4 bg-gradient-to-br from-primary/5 to-teal-500/5 rounded-xl border border-primary/20 mb-3">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-semibold">
                      {isRTL ? 'تدرب مع الذكاء الاصطناعي' : 'Practice with AI'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {isRTL
                      ? 'عزز ما تعلمته بمحادثات مدعومة بالذكاء الاصطناعي.'
                      : "Reinforce learning with AI-powered conversations."
                    }
                  </p>
                  <div className="flex gap-2">
                    <Link href="/voice-training" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                        <Phone className={cn("h-4 w-4", isRTL ? "ml-1" : "mr-1")} />
                        {isRTL ? 'صوتي' : 'Voice'}
                      </Button>
                    </Link>
                    <Link href={`/course-practice?courseId=${courseId}`} className="flex-1">
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                        <MessageSquare className={cn("h-4 w-4", isRTL ? "ml-1" : "mr-1")} />
                        {isRTL ? 'محادثة' : 'Chat'}
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Recommended Simulation */}
                {course.recommendedSimulation && (
                  <div className="p-4 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-xl border border-amber-500/20">
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                      <Target className="h-5 w-5" />
                      <span className="font-semibold">
                        {isRTL ? 'تدريب موصى به' : 'Recommended Training'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {isRTL
                        ? 'جرب هذا التدريب لتطبيق ما تعلمته.'
                        : 'Try this training to apply what you learned.'
                      }
                    </p>
                    <Button
                      onClick={handleStartSimulation}
                      size="sm"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    >
                      {course.recommendedSimulation.type === 'text' ? (
                        <MessageSquare className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      ) : (
                        <Phone className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      )}
                      {isRTL
                        ? course.recommendedSimulation.type === 'text' ? 'ابدأ المحاكاة' : 'ابدأ المكالمة'
                        : course.recommendedSimulation.type === 'text' ? 'Start Simulation' : 'Start Call'
                      }
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Progress & Lessons Card */}
            <Card className="sticky top-4 border-border">
              <CardContent className="p-4">
                {/* Progress Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      {isRTL ? 'تقدم الدورة' : 'Course Progress'}
                    </h3>
                    <span className="text-sm font-medium text-primary">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL
                      ? `${completedCount} من ${lessonCount} دروس مكتملة`
                      : `${completedCount} of ${lessonCount} lessons completed`
                    }
                  </p>
                </div>

                {/* Course Completion Badge */}
                {progressPercent === 100 && (
                  <div className="mb-4 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-600">
                      <Award className="h-5 w-5" />
                      <span className="font-semibold">
                        {isRTL ? 'تم إكمال الدورة!' : 'Course Completed!'}
                      </span>
                    </div>
                    <p className="text-sm text-green-600/80 mt-1 leading-relaxed">
                      {isRTL
                        ? 'تهانينا! لقد أكملت جميع الدروس.'
                        : "Congratulations! You've completed all lessons."
                      }
                    </p>
                  </div>
                )}

                {/* Lessons List */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    {isRTL ? 'الدروس' : 'Lessons'}
                  </h3>
                  <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                    {lessons.map((lesson, index) => {
                      const isSelected = selectedLesson?.id === lesson.id;
                      const isCompleted = completedLessons.has(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={cn(
                            "w-full text-right p-3 rounded-lg transition-all",
                            isSelected
                              ? 'bg-primary/10 border border-primary/30'
                              : 'hover:bg-muted/50 border border-transparent'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                              isCompleted
                                ? 'bg-green-500/20 text-green-500'
                                : isSelected
                                ? 'bg-primary/20 text-primary'
                                : 'bg-muted text-muted-foreground'
                            )}>
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium truncate leading-relaxed",
                                isSelected ? 'text-primary' : 'text-foreground'
                              )}>
                                {traineeCoursesApi.getLessonTitle(lesson, isRTL)}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {lesson.durationMinutes} {isRTL ? 'دقيقة' : 'min'}
                              </p>
                            </div>
                            {isSelected && (
                              <Play className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
