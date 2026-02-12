'use client';

import { Badge } from '@/components/ui/badge';
import { TEACHERS, type TeacherName, VALID_TEACHER_NAMES } from '@/config/teachers';
import { useTeacherStore } from '@/stores/teacher.store';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { TeacherAvatar } from './TeacherAvatar';

interface TeacherSelectorProps {
  onSelect?: (teacherName: TeacherName) => void;
  className?: string;
  showAllTeachers?: boolean; // If true, shows all teachers. Default: only assigned teacher
}

export function TeacherSelector({ onSelect, className, showAllTeachers = false }: TeacherSelectorProps) {
  const { t, language, isRTL } = useLanguage();
  const { assignedTeacher: storeAssignedTeacher, activeTeacher, setActiveTeacher } = useTeacherStore();

  // Get assigned teacher from auth store as primary source of truth
  const user = useAuthStore((state) => state.user);
  const authAssignedTeacher = user?.assignedTeacher;

  const handleSelect = (name: TeacherName) => {
    setActiveTeacher(name);
    onSelect?.(name);
  };

  // Get the assigned teacher from auth store (primary) or teacher store (fallback)
  // Also validate that the teacher name exists in TEACHERS config
  const rawAssignedTeacher = authAssignedTeacher || storeAssignedTeacher;
  const isValidTeacher = rawAssignedTeacher && VALID_TEACHER_NAMES.includes(rawAssignedTeacher as TeacherName);

  // Only show assigned teacher by default
  // If no assigned teacher or invalid teacher, fallback to abdullah
  const teacherToShow = isValidTeacher ? rawAssignedTeacher : 'abdullah';
  const teacher = TEACHERS[teacherToShow as TeacherName];

  // If showAllTeachers is false, just show the assigned teacher as a display card (not selectable)
  if (!showAllTeachers && teacher) {
    return (
      <div className={className}>
        <div className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl border',
          'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
        )}>
          <TeacherAvatar teacherName={teacherToShow as TeacherName} size="lg" showPulse={true} />
          <div className={cn('text-start', isRTL && 'text-end')}>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {teacher.displayName[language]}
              </span>
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                {t.teacher.primary}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {teacher.shortDescription[language]}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {teacher.description[language]}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If showAllTeachers, show the old behavior (all teachers selectable)
  const allTeachers = Object.values(TEACHERS);

  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        {t.teacher.selectTeacher}
      </h3>
      <div className={cn(
        'flex gap-3 overflow-x-auto pb-2 scrollbar-hide',
        isRTL && 'flex-row-reverse'
      )}>
        {allTeachers.map((t) => {
          const isActive = activeTeacher === t.name;
          const isAssigned = rawAssignedTeacher === t.name;

          return (
            <button
              key={t.name}
              onClick={() => handleSelect(t.name)}
              className={cn(
                'flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200',
                'hover:shadow-md hover:scale-[1.02]',
                isActive
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:border-border/80'
              )}
            >
              <TeacherAvatar teacherName={t.name} size="md" showPulse={isActive} />
              <div className={cn('text-start', isRTL && 'text-end')}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">
                    {t.displayName[language]}
                  </span>
                  {isAssigned && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                      {language === 'ar' ? 'الأساسي' : 'Primary'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[180px] truncate">
                  {t.shortDescription[language]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
