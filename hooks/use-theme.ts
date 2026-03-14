'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ThemeId, ThemeMode } from '@/lib/themes';

const STORAGE_KEY_THEME = 'postpurush-theme';
const STORAGE_KEY_MODE = 'postpurush-mode';

const DEFAULT_THEME: ThemeId = 'og-shadcn';
const DEFAULT_MODE: ThemeMode = 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEY_THEME) as ThemeId) || DEFAULT_THEME;
    }
    return DEFAULT_THEME;
  });
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode) || DEFAULT_MODE;
    }
    return DEFAULT_MODE;
  });

  useEffect(() => {
    const savedTheme = (localStorage.getItem(STORAGE_KEY_THEME) as ThemeId) || DEFAULT_THEME;
    const savedMode = (localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode) || DEFAULT_MODE;

    // Re-apply to DOM — hydration may have reverted ThemeScript's changes
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-mode', savedMode);
    if (savedMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const handleThemeChange = () => {
      const t = localStorage.getItem(STORAGE_KEY_THEME) as ThemeId | null;
      if (t) setThemeState(t);
    };
    const handleModeChange = () => {
      const m = localStorage.getItem(STORAGE_KEY_MODE) as ThemeMode | null;
      if (m) setModeState(m);
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_THEME) handleThemeChange();
      if (e.key === STORAGE_KEY_MODE) handleModeChange();
    };

    window.addEventListener('postpurush-theme-change', handleThemeChange);
    window.addEventListener('postpurush-mode-change', handleModeChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('postpurush-theme-change', handleThemeChange);
      window.removeEventListener('postpurush-mode-change', handleModeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setTheme = useCallback((newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    window.dispatchEvent(new Event('postpurush-theme-change'));
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
    window.dispatchEvent(new Event('postpurush-mode-change'));
  }, []);

  return { theme, mode, setTheme, setMode };
}
