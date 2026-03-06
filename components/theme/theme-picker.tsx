'use client';

import { useState } from 'react';
import { Palette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { THEMES, type ThemeId, type ThemeMode } from '@/lib/themes';
import { useTheme } from '@/hooks/use-theme';

export function ThemePicker() {
  const { theme, mode, setTheme, setMode } = useTheme();
  const [hoveredTheme, setHoveredTheme] = useState<ThemeId | null>(null);

  const activeThemeDef = THEMES.find((t) => t.id === theme)!;
  const displayedName = hoveredTheme
    ? THEMES.find((t) => t.id === hoveredTheme)?.name
    : activeThemeDef.name;
  const displayedColor =
    mode === 'dark'
      ? (THEMES.find((t) => t.id === (hoveredTheme ?? theme))?.accentColor ?? activeThemeDef.accentColor)
      : (THEMES.find((t) => t.id === (hoveredTheme ?? theme))?.accentColorLight ?? activeThemeDef.accentColorLight);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'p-2 rounded-lg transition-colors',
            'text-foreground-subtle hover:text-foreground hover:bg-raised',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-border'
          )}
          aria-label="Open theme picker"
        >
          <Palette size={16} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className={cn(
          'w-72 p-4',
          'bg-panel border border-border',
          'shadow-xl shadow-black/40 rounded-xl'
        )}
      >
        {/* Section: Accent Color */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle">
              Accent Color
            </span>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
              style={{
                backgroundColor: displayedColor + '22',
                color: displayedColor,
                border: `1px solid ${displayedColor}44`,
              }}
            >
              {displayedName}
            </span>
          </div>

          {/* Color swatches — 4 per row, 2 rows */}
          <div className="grid grid-cols-4 gap-2">
            {THEMES.map((t) => {
              const swatchColor = mode === 'dark' ? t.accentColor : t.accentColorLight;
              const isActive = theme === t.id;

              return (
                <button
                  key={t.id}
                  title={t.name}
                  onClick={() => setTheme(t.id)}
                  onMouseEnter={() => setHoveredTheme(t.id)}
                  onMouseLeave={() => setHoveredTheme(null)}
                  className={cn(
                    'relative w-full aspect-square rounded-xl',
                    'flex items-center justify-center',
                    'transition-all duration-150',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                  )}
                  style={{
                    backgroundColor: swatchColor + (isActive ? '33' : '1a'),
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: isActive ? swatchColor : 'transparent',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: swatchColor }}
                  />
                  {isActive && (
                    <svg
                      className="absolute inset-0 m-auto w-5 h-5"
                      viewBox="0 0 20 20"
                      fill="white"
                      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
                    >
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
        <div className="border-t border-border my-3" />

        {/* Section: Mode */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground-subtle block mb-2">
            Mode
          </span>
          <div className="space-y-1">
            {(['light', 'dark'] as ThemeMode[]).map((m) => {
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'w-full flex items-center justify-between',
                    'px-3 py-2 rounded-lg text-sm',
                    'transition-colors duration-150',
                    isActive
                      ? 'bg-raised text-foreground font-medium'
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
                    <span className="capitalize">{m}</span>
                  </span>
                  {isActive && (
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
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
