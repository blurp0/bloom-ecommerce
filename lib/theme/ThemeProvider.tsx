'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemeColor  = 'blue' | 'pink';
export type ThemeMode   = 'light' | 'dark';
export type ThemeMotion = 'normal' | 'reduced';

export interface ThemeState {
  color:  ThemeColor;
  mode:   ThemeMode;
  motion: ThemeMotion;
}

export interface ThemeContextValue extends ThemeState {
  setColor:  (color:  ThemeColor)  => void;
  setMode:   (mode:   ThemeMode)   => void;
  setMotion: (motion: ThemeMotion) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readColor(): ThemeColor {
  try {
    const stored = localStorage.getItem('theme-color');
    if (stored === 'blue' || stored === 'pink') return stored;
  } catch {
    // localStorage unavailable
  }
  return 'blue';
}

function readMode(): ThemeMode {
  try {
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage unavailable
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readMotion(): ThemeMotion {
  try {
    const stored = localStorage.getItem('theme-motion');
    if (stored === 'normal' || stored === 'reduced') return stored;
  } catch {
    // localStorage unavailable
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'normal';
}

function applyTheme(color: ThemeColor, mode: ThemeMode, motion: ThemeMotion): void {
  const html = document.documentElement;
  html.setAttribute('data-theme', color);
  html.classList.toggle('dark', mode === 'dark');
  html.classList.toggle('reduce-motion', motion === 'reduced');
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialise from localStorage / system prefs on the client.
  // We use lazy initialisers so the read happens only once on mount.
  const [color, setColorState] = useState<ThemeColor>(() =>
    // SSR: we can't read localStorage — use the same default as the inline
    // script so the server HTML matches what the script will already have set.
    typeof window === 'undefined' ? 'blue' : readColor(),
  );
  const [mode, setModeState] = useState<ThemeMode>(() =>
    typeof window === 'undefined' ? 'light' : readMode(),
  );
  const [motion, setMotionState] = useState<ThemeMotion>(() =>
    typeof window === 'undefined' ? 'normal' : readMotion(),
  );

  // On first client render, re-read from localStorage/system so we're always
  // in sync (handles the case where the lazy init ran on the server).
  useEffect(() => {
    setColorState(readColor());
    setModeState(readMode());
    setMotionState(readMotion());
  }, []);

  // Whenever state changes, persist and apply to <html>.
  useEffect(() => {
    applyTheme(color, mode, motion);
  }, [color, mode, motion]);

  const setColor = useCallback((next: ThemeColor) => {
    try { localStorage.setItem('theme-color', next); } catch { /* noop */ }
    setColorState(next);
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    try { localStorage.setItem('theme-mode', next); } catch { /* noop */ }
    setModeState(next);
  }, []);

  const setMotion = useCallback((next: ThemeMotion) => {
    try { localStorage.setItem('theme-motion', next); } catch { /* noop */ }
    setMotionState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ color, mode, motion, setColor, setMode, setMotion }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}
