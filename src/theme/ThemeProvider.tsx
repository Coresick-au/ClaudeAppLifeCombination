import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { ThemeName, UserTheme } from '@/types/shared.types';
import { hearthstoneVars } from './hearthstone';
import { meadowVars } from './meadow';
import { darkgoldVars } from './darkgold';

const THEME_KEY = 'life-os-theme';

const themeVarsMap: Record<ThemeName, Record<string, string>> = {
  hearthstone: hearthstoneVars,
  meadow: meadowVars,
  darkgold: darkgoldVars,
};

interface ThemeContextValue {
  userTheme: UserTheme;
  activeTheme: ThemeName;
  setUserTheme: (theme: UserTheme) => void;
  setWealthOverride: (active: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeVars(theme: ThemeName) {
  const vars = themeVarsMap[theme];
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

function getStoredTheme(): UserTheme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'hearthstone' || stored === 'meadow') {
    return stored;
  }
  return 'hearthstone';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [userTheme, setUserThemeState] = useState<UserTheme>(getStoredTheme);
  const [wealthOverride, setWealthOverride] = useState(false);

  const activeTheme: ThemeName = wealthOverride ? 'darkgold' : userTheme;

  const setUserTheme = useCallback((theme: UserTheme) => {
    setUserThemeState(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, []);

  useEffect(() => {
    applyThemeVars(activeTheme);
  }, [activeTheme]);

  return (
    <ThemeContext.Provider
      value={{ userTheme, activeTheme, setUserTheme, setWealthOverride }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
