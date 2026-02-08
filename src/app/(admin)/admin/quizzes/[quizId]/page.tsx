'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { quizApi } from '@/lib/api/quiz.api';
import type { CreateQuestionInput, CreateOptionInput, UpdateQuizInput } from '@/types/quiz';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Save,
  Loader2,
  ClipboardCheck,
  HelpCircle,
  GripVertical,
  AlertTriangle,
} from 'lucide-react';

function emptyOption(order: number): CreateOptionInput {
  return { optionText: '', optionTextAr: '', isCorrect: false, orderInQuestion: order };
}

function emptyQuestion(order: number): CreateQuestionInput {
  return {
    questionText: '', questionTextAr: '', questionType: 'multiple_choice',
    explanation: '', explanationAr: '', points: 1, orderInQuiz: order,
    options: [emptyOption(0), emptyOption(1), emptyOption(2), emptyOption(3)],
  };
}

export default function EditQuizPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<string>('');
  const [maxAttempts, setMaxAttempts] = useState<string>('');
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  const [questions, setQuestions] = useState<CreateQuestionInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const quiz = await quizApi.getQuizForAdmin(quizId);
        setTitle(quiz.title);
        setTitleAr(quiz.titleAr || '');
        setDescription(quiz.description);
        setDescriptionAr(quiz.descriptionAr || '');
        setDifficulty(quiz.difficulty);
        setPassingScore(quiz.passingScore);
        setTimeLimit(quiz.timeLimit ? String(quiz.timeLimit) : '');
        setMaxAttempts(quiz.maxAttempts ? String(quiz.maxAttempts) : '');
        setShuffleQuestions(quiz.shuffleQuestions);
        setShowCorrectAnswers(quiz.showCorrectAnswers);
        setQuestions(quiz.questions.map((q, idx) => ({
          questionText: q.questionText,
          questionTextAr: q.questionTextAr || '',
          questionType: q.questionType,
          explanation: q.explanation || '',
          explanationAr: q.explanationAr || '',
          points: q.points,
          orderInQuiz: idx,
          options: q.options.map((o, oidx) => ({
            optionText: o.optionText,
            optionTextAr: o.optionTextAr || '',
            isCorrect: o.isCorrect || false,
            orderInQuestion: oidx,
          })),
        })));
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion(prev.length)]);
  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, orderInQuiz: i })));
  };
  const updateQuestion = (idx: number, updates: Partial<CreateQuestionInput>) => {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, ...updates } : q));
  };
  const updateOption = (qIdx: number, oIdx: number, updates: Partial<CreateOptionInput>) => {
    setQuestions((prev) => prev.map((q, qi) => {
      if (qi !== qIdx) return q;
      const newOpts = q.options.map((o, oi) => oi === oIdx ? { ...o, ...updates } : o);
      return { ...q, options: newOpts };
    }));
  };
  const setCorrectOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) => prev.map((q, qi) => {
      if (qi !== qIdx) return q;
      return { ...q, options: q.options.map((o, oi) => ({ ...o, isCorrect: oi === oIdx })) };
    }));
  };
  const addOption = (qIdx: number) => {
    setQuestions((prev) => prev.map((q, qi) => {
      if (qi !== qIdx) return q;
      return { ...q, options: [...q.options, emptyOption(q.options.length)] };
    }));
  };
  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions((prev) => prev.map((q, qi) => {
      if (qi !== qIdx || q.options.length <= 2) return q;
      return { ...q, options: q.options.filter((_, i) => i !== oIdx).map((o, i) => ({ ...o, orderInQuestion: i })) };
    }));
  };

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) { setError(isRTL ? 'عنوان الاختبار مطلوب' : 'Quiz title is required'); return; }
    if (questions.some((q) => !q.questionText.trim())) { setError(isRTL ? 'جميع الأسئلة يجب أن تحتوي على نص' : 'All questions must have text'); return; }
    if (questions.some((q) => !q.options.some((o) => o.isCorrect))) { setError(isRTL ? 'كل سؤال يجب أن يحتوي على إجابة صحيحة' : 'Each question must have a correct answer'); return; }

    setSaving(true);
    try {
      const data: UpdateQuizInput = {
        title: title.trim(),
        titleAr: titleAr.trim() || undefined,
        description: description.trim(),
        descriptionAr: descriptionAr.trim() || undefined,
        difficulty, passingScore, shuffleQuestions, showCorrectAnswers,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : null,
        questions,
      };
      await quizApi.updateQuiz(quizId, data);
      router.push('/admin/quizzes');
    } catch (err: any) {
      setError(err.message || 'Failed to update quiz');
    } finally {
      setSaving(false);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/quizzes')}>
          <BackIcon className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-violet-500" />
          {t.quiz.editQuiz}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Quiz Details */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold">{isRTL ? 'تفاصيل الاختبار' : 'Quiz Details'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.quizTitle} (EN)</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.quizTitle} (AR)</label>
              <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.quizDescription} (EN)</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.quizDescription} (AR)</label>
              <Input value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} dir="rtl" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.difficulty}</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800">
                <option value="easy">{t.quiz.easy}</option>
                <option value="medium">{t.quiz.medium}</option>
                <option value="hard">{t.quiz.hard}</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.passingScore} (%)</label>
              <Input type="number" min={0} max={100} value={passingScore} onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.timeLimit}</label>
              <Input type="number" min={1} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} placeholder={isRTL ? 'اختياري' : 'Optional'} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t.quiz.maxAttempts}</label>
              <Input type="number" min={1} value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} placeholder={t.quiz.unlimited} />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} className="rounded" />
              {isRTL ? 'ترتيب عشوائي' : 'Shuffle Questions'}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showCorrectAnswers} onChange={(e) => setShowCorrectAnswers(e.target.checked)} className="rounded" />
              {isRTL ? 'إظهار الإجابات' : 'Show Correct Answers'}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-violet-500" />
            {t.quiz.questions} ({questions.length})
          </h3>
          <Button variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-1" /> {t.quiz.addQuestion}
          </Button>
        </div>

        {questions.map((q, qIdx) => (
          <Card key={qIdx} className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <Badge variant="outline" className="text-xs">{t.quiz.question} {qIdx + 1}</Badge>
                  <select value={q.questionType} onChange={(e) => updateQuestion(qIdx, { questionType: e.target.value as any })} className="text-xs border rounded px-2 py-1 bg-white dark:bg-gray-800">
                    <option value="multiple_choice">{isRTL ? 'اختيار متعدد' : 'Multiple Choice'}</option>
                    <option value="true_false">{isRTL ? 'صح/خطأ' : 'True/False'}</option>
                  </select>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeQuestion(qIdx)} disabled={questions.length <= 1} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input value={q.questionText} onChange={(e) => updateQuestion(qIdx, { questionText: e.target.value })} placeholder="Question text (EN)" />
                <Input value={q.questionTextAr || ''} onChange={(e) => updateQuestion(qIdx, { questionTextAr: e.target.value })} placeholder="نص السؤال (AR)" dir="rtl" />
              </div>
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <button onClick={() => setCorrectOption(qIdx, oIdx)} className="shrink-0">
                      {opt.isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-300" />}
                    </button>
                    <Input value={opt.optionText} onChange={(e) => updateOption(qIdx, oIdx, { optionText: e.target.value })} placeholder={`Option ${oIdx + 1} (EN)`} className={cn('flex-1', opt.isCorrect && 'border-green-300 bg-green-50')} />
                    <Input value={opt.optionTextAr || ''} onChange={(e) => updateOption(qIdx, oIdx, { optionTextAr: e.target.value })} placeholder={`الخيار ${oIdx + 1} (AR)`} className="flex-1" dir="rtl" />
                    <Button variant="ghost" size="sm" onClick={() => removeOption(qIdx, oIdx)} disabled={q.options.length <= 2} className="shrink-0 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addOption(qIdx)} className="text-violet-600">
                  <Plus className="w-3.5 h-3.5 mr-1" /> {t.quiz.addOption}
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input value={q.explanation || ''} onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })} placeholder="Explanation (optional, EN)" />
                <Input value={q.explanationAr || ''} onChange={(e) => updateQuestion(qIdx, { explanationAr: e.target.value })} placeholder="الشرح (اختياري, AR)" dir="rtl" />
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" className="w-full" onClick={addQuestion}>
          <Plus className="w-4 h-4 mr-2" /> {t.quiz.addQuestion}
        </Button>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => router.push('/admin/quizzes')}>{t.common.cancel}</Button>
        <Button onClick={handleSave} disabled={saving} className="bg-violet-500 hover:bg-violet-600">
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          {t.common.save}
        </Button>
      </div>
    </div>
  );
}
