'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ThemeId, ThemeMode } from '@/lib/themes';

const STORAGE_KEY_THEME = 'postpurush-theme';
const STORAGE_KEY_MODE = 'postpurush-mode';

const DEFAULT_THEME: ThemeId = 'og-shadcn';
const DEFAULT_MODE: ThemeMode = 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as ThemeId | null;
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;
    if (savedTheme) setThemeState(savedTheme);
    if (savedMode) setModeState(savedMode);
  }, []);

  const setTheme = useCallback((newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY_MODE, newMode);
    document.documentElement.setAttribute('data-mode', newMode);
    // Keep .dark class in sync for shadcn component compatibility
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return { theme, mode, setTheme, setMode };
}
