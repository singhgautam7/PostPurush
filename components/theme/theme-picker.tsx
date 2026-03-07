'use client';

import { Palette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { THEMES, type ThemeMode } from '@/lib/themes';
import { useTheme } from '@/hooks/use-theme';

export function ThemePicker() {
  const { theme, mode, setTheme, setMode } = useTheme();

  return (
    <Popover>
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'h-8 w-8 flex items-center justify-center rounded-lg',
                'text-foreground-muted hover:text-foreground',
                'hover:bg-raised border border-transparent hover:border-border',
                'transition-all duration-150 focus:outline-none'
              )}
              aria-label="Change themes"
            >
              <Palette size={15} />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Change themes
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        align="end"
        className={cn(
          'w-80 p-3',
          'bg-panel border border-border',
          'shadow-xl shadow-black/40 rounded-xl'
        )}
      >
        {/* Section: Theme */}
        <div className="mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle px-2 block mb-1">
            Theme
          </span>
          <div className="space-y-0.5">
            {THEMES.map((t) => {
              const dotColor = mode === 'dark' ? t.accentColor : t.accentColorLight;
              const isActive = theme === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-border',
                    isActive
                      ? 'bg-primary/10 text-foreground'
                      : 'text-foreground-subtle hover:bg-raised hover:text-foreground'
                  )}
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{
                      backgroundColor: dotColor,
                      boxShadow: isActive ? `0 0 0 2px var(--color-panel), 0 0 0 4px ${dotColor}` : 'none',
                    }}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <div className={cn('text-xs font-medium', isActive ? 'text-foreground' : 'text-foreground-muted')}>
                      {t.name}
                    </div>
                    <div className="text-[10px] text-foreground-subtle truncate">{t.description}</div>
                  </div>
                  {isActive && (
                    <svg className="w-3.5 h-3.5 shrink-0 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-2" />

        {/* Section: Mode */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle px-2 block mb-1">
            Mode
          </span>
          <div className="space-y-0.5">
            {(['light', 'dark'] as ThemeMode[]).map((m) => {
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'w-full flex items-center justify-between',
                    'px-2 py-2 rounded-lg text-sm',
                    'transition-colors duration-150',
                    isActive
                      ? 'bg-primary/10 text-foreground'
                      : 'text-foreground-subtle hover:bg-raised hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    {m === 'light' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    )}
                    <span className="capitalize text-xs font-medium">{m}</span>
                  </span>
                  {isActive && (
                    <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
