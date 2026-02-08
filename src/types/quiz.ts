// ---- Quiz Types for Frontend ----

export interface QuizOption {
  id: string;
  optionText: string;
  optionTextAr: string | null;
  isCorrect?: boolean; // Only available in admin view, stripped for trainee taking
  orderInQuestion: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  questionTextAr: string | null;
  questionType: 'multiple_choice' | 'true_false';
  explanation: string | null;
  explanationAr: string | null;
  points: number;
  orderInQuiz: number;
  options: QuizOption[];
}

export interface QuizDetail {
  id: string;
  title: string;
  titleAr: string | null;
  description: string;
  descriptionAr: string | null;
  courseId: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  quizType: 'manual' | 'ai_generated';
  timeLimit: number | null;
  passingScore: number;
  isPublished: boolean;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  maxAttempts: number | null;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizListItem {
  id: string;
  title: string;
  titleAr: string | null;
  description: string;
  descriptionAr: string | null;
  courseId: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  attemptCount: number;
  timeLimit: number | null;
  passingScore: number;
  isPublished: boolean;
  maxAttempts: number | null;
  quizType: 'manual' | 'ai_generated';
  createdAt: string;
}

export interface ResponseResult {
  questionId: string;
  questionText: string;
  questionTextAr: string | null;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string | null;
  explanationAr: string | null;
  points: number;
  earnedPoints: number;
}

export interface QuizAttemptResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  timeSpentSeconds: number;
  showCorrectAnswers: boolean;
  responses: ResponseResult[];
}

export interface TraineeAttemptHistoryItem {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  quizTitleAr: string | null;
  score: number | null;
  passed: boolean | null;
  passingScore: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt: string | null;
  timeSpentSeconds: number | null;
}

export interface AdminAttemptItem {
  attemptId: string;
  traineeFirstName: string;
  traineeLastName: string;
  traineeEmail: string;
  score: number | null;
  passed: boolean | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt: string | null;
  timeSpentSeconds: number | null;
}

// ---- Input Types ----

export interface CreateQuizInput {
  title: string;
  titleAr?: string | null;
  description?: string;
  descriptionAr?: string | null;
  courseId?: string | null;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number | null;
  passingScore?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  maxAttempts?: number | null;
  questions: CreateQuestionInput[];
}

export interface CreateQuestionInput {
  questionText: string;
  questionTextAr?: string | null;
  questionType?: 'multiple_choice' | 'true_false';
  explanation?: string | null;
  explanationAr?: string | null;
  points?: number;
  orderInQuiz: number;
  options: CreateOptionInput[];
}

export interface CreateOptionInput {
  optionText: string;
  optionTextAr?: string | null;
  isCorrect: boolean;
  orderInQuestion: number;
}

export interface UpdateQuizInput {
  title?: string;
  titleAr?: string | null;
  description?: string;
  descriptionAr?: string | null;
  courseId?: string | null;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number | null;
  passingScore?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  maxAttempts?: number | null;
  questions?: CreateQuestionInput[];
}

export interface SubmitResponseInput {
  questionId: string;
  selectedOptionId?: string | null;
}

export interface GenerateQuizInput {
  courseId?: string;
  topic?: string;
  numberOfQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionTypes?: ('multiple_choice' | 'true_false')[];
}
