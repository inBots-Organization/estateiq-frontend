'use client';

import { Badge } from '@/components/ui/badge';
import { TEACHERS, TEACHER_LIST, type TeacherName } from '@/config/teachers';
import { useTeacherStore } from '@/stores/teacher.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { TeacherAvatar } from './TeacherAvatar';

interface TeacherSelectorProps {
  onSelect?: (teacherName: TeacherName) => void;
  className?: string;
}

export function TeacherSelector({ onSelect, className }: TeacherSelectorProps) {
  const { t, language, isRTL } = useLanguage();
  const { assignedTeacher, activeTeacher, setActiveTeacher } = useTeacherStore();

  const handleSelect = (name: TeacherName) => {
    setActiveTeacher(name);
    onSelect?.(name);
  };

  // Order: assigned teacher first, then abdullah, then rest
  const orderedTeachers = TEACHER_LIST.sort((a, b) => {
    if (a.name === assignedTeacher) return -1;
    if (b.name === assignedTeacher) return 1;
    if (a.name === 'abdullah') return -1;
    if (b.name === 'abdullah') return 1;
    return 0;
  });

  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        {t.teacher.selectTeacher}
      </h3>
      <div className={cn(
        'flex gap-3 overflow-x-auto pb-2 scrollbar-hide',
        isRTL && 'flex-row-reverse'
      )}>
        {orderedTeachers.map((teacher) => {
          const isActive = activeTeacher === teacher.name;
          const isAssigned = assignedTeacher === teacher.name;

          return (
            <button
              key={teacher.name}
              onClick={() => handleSelect(teacher.name)}
              className={cn(
                'flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200',
                'hover:shadow-md hover:scale-[1.02]',
                isActive
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm'
                  : 'border-border bg-card hover:border-border/80'
              )}
            >
              <TeacherAvatar teacherName={teacher.name} size="md" showPulse={isActive} />
              <div className={cn('text-start', isRTL && 'text-end')}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">
                    {teacher.displayName[language]}
                  </span>
                  {isAssigned && (
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                      {t.teacher.primary}
                    </Badge>
                  )}
                  {teacher.isAlwaysAvailable && !isAssigned && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {t.teacher.mentor}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[180px] truncate">
                  {teacher.shortDescription[language]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
