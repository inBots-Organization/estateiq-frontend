'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Lesson Context for AI Teacher Integration
 *
 * This context allows passing lesson/course information from the Course Details page
 * to the AI Teacher, enabling contextual teaching based on what the trainee is studying.
 */

export interface LessonContext {
  lessonId: string;
  lessonName: string;
  lessonNameAr: string;
  lessonDescription: string;
  lessonDescriptionAr: string;
  courseId: string;
  courseName: string;
  courseNameAr: string;
  courseCategory: string;
  courseDifficulty: string;
  courseObjectives: string[];
  courseObjectivesAr: string[];
  // Future-proofing: attached files for AI to parse
  attachedFiles?: Array<{
    id: string;
    filename: string;
    mimeType: string;
    url?: string;
  }>;
  // Video reference for the AI to suggest segments
  videoId?: string;
  videoDurationMinutes?: number;
}

interface LessonContextState {
  lessonContext: LessonContext | null;
  setLessonContext: (context: LessonContext | null) => void;
  clearLessonContext: () => void;
  hasLessonContext: boolean;
}

const LessonContextContext = createContext<LessonContextState | undefined>(undefined);

export function LessonContextProvider({ children }: { children: ReactNode }) {
  const [lessonContext, setLessonContextState] = useState<LessonContext | null>(null);

  const setLessonContext = (context: LessonContext | null) => {
    setLessonContextState(context);
    // Also persist to sessionStorage for page navigation
    if (context) {
      sessionStorage.setItem('ai-teacher-lesson-context', JSON.stringify(context));
    } else {
      sessionStorage.removeItem('ai-teacher-lesson-context');
    }
  };

  const clearLessonContext = () => {
    setLessonContextState(null);
    sessionStorage.removeItem('ai-teacher-lesson-context');
  };

  // On mount, check sessionStorage for persisted context
  React.useEffect(() => {
    const stored = sessionStorage.getItem('ai-teacher-lesson-context');
    if (stored) {
      try {
        setLessonContextState(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem('ai-teacher-lesson-context');
      }
    }
  }, []);

  return (
    <LessonContextContext.Provider
      value={{
        lessonContext,
        setLessonContext,
        clearLessonContext,
        hasLessonContext: lessonContext !== null,
      }}
    >
      {children}
    </LessonContextContext.Provider>
  );
}

export function useLessonContext() {
  const context = useContext(LessonContextContext);
  if (context === undefined) {
    throw new Error('useLessonContext must be used within a LessonContextProvider');
  }
  return context;
}
