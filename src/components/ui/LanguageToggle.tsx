'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Globe, Moon, Sun, Monitor, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'minimal';
  showLabel?: boolean;
}

export function LanguageToggle({ className, variant = 'outline', showLabel = true }: LanguageToggleProps) {
  const { language, toggleLanguage } = useLanguage();

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium transition-colors",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          className
        )}
      >
        <Globe className="h-4 w-4" />
        <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
      </button>
    );
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={toggleLanguage}
      className={cn("gap-2", className)}
    >
      <Globe className="h-4 w-4" />
      {showLabel && (
        <span>
          {language === 'ar' ? 'English' : 'عربي'}
        </span>
      )}
    </Button>
  );
}

/**
 * Language selector with both options visible
 */
export function LanguageSelector({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("inline-flex rounded-lg border border-border p-1 bg-muted/50", className)}>
      <button
        onClick={() => setLanguage('ar')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          language === 'ar'
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        العربية
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          language === 'en'
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        English
      </button>
    </div>
  );
}

/**
 * Theme toggle button
 */
interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'minimal';
  showLabel?: boolean;
}

export function ThemeToggle({ className, variant = 'outline', showLabel = false }: ThemeToggleProps) {
  const { isDark, toggleTheme, t } = useThemeWithTranslations();

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium transition-colors",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          className
        )}
        aria-label={isDark ? t.lightMode : t.darkMode}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {showLabel && <span>{isDark ? t.lightMode : t.darkMode}</span>}
      </button>
    );
  }

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      className={cn("", className)}
      aria-label={isDark ? t.lightMode : t.darkMode}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

/**
 * Theme selector with all options visible
 */
export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t } = useThemeWithTranslations();

  return (
    <div className={cn("inline-flex rounded-lg border border-border p-1 bg-muted/50", className)}>
      <button
        onClick={() => setTheme('light')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5",
          theme === 'light'
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={t.lightMode}
      >
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline">{t.lightMode}</span>
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5",
          theme === 'dark'
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={t.darkMode}
      >
        <Moon className="h-4 w-4" />
        <span className="hidden sm:inline">{t.darkMode}</span>
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5",
          theme === 'system'
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={t.systemMode}
      >
        <Monitor className="h-4 w-4" />
        <span className="hidden sm:inline">{t.systemMode}</span>
      </button>
    </div>
  );
}

/**
 * Unified Settings Dropdown with language and theme controls
 */
interface SettingsDropdownProps {
  className?: string;
}

export function SettingsDropdown({ className }: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{language === 'ar' ? 'العربية' : 'English'}</span>
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute end-0 top-full mt-2 w-72 rounded-lg border border-border bg-card shadow-lg z-50 animate-fade-in">
          <div className="p-3">
            {/* Language Section */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                {t.settings.language}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('ar')}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                    language === 'ar'
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  العربية
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
                    language === 'en'
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  English
                </button>
              </div>
            </div>

            {/* Theme Section */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                {t.settings.theme}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    "px-2 py-2 rounded-lg text-sm font-medium transition-all border flex items-center justify-center gap-1",
                    theme === 'light'
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-label={t.settings.lightMode}
                >
                  <Sun className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs">{t.settings.lightMode}</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "px-2 py-2 rounded-lg text-sm font-medium transition-all border flex items-center justify-center gap-1",
                    theme === 'dark'
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-label={t.settings.darkMode}
                >
                  <Moon className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs">{t.settings.darkMode}</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={cn(
                    "px-2 py-2 rounded-lg text-sm font-medium transition-all border flex items-center justify-center gap-1",
                    theme === 'system'
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/50 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  aria-label={t.settings.systemMode}
                >
                  <Monitor className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs">{t.settings.systemMode}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline settings for navbar
 */
export function CompactSettings({ className }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-lg border border-border p-1 bg-muted/30", className)}>
      <button
        onClick={toggleLanguage}
        className={cn(
          "px-2.5 py-1.5 rounded-md text-sm font-medium transition-all",
          "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        aria-label={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
      >
        {language === 'ar' ? 'EN' : 'ع'}
      </button>
      <div className="w-px h-5 bg-border" />
      <button
        onClick={toggleTheme}
        className={cn(
          "p-1.5 rounded-md transition-all",
          "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
}

// Helper hook to get theme translations
function useThemeWithTranslations() {
  const { language } = useLanguage();
  const themeContext = useTheme();

  const t = {
    lightMode: language === 'ar' ? 'فاتح' : 'Light',
    darkMode: language === 'ar' ? 'داكن' : 'Dark',
    systemMode: language === 'ar' ? 'تلقائي' : 'System',
  };

  return { ...themeContext, t };
}
