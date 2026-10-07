import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppThemeId = 'emerald' | 'blue' | 'amber' | 'purple';

export interface AppThemeConfig {
  id: AppThemeId;
  name: string;
  nameAr: string;
  desc: string;
  previewColor: string; // hex
  hexPrimary: string;
  // Dynamic CSS classes for consistent styling
  accentText: string;
  accentBg: string;
  accentBgLight: string;
  accentBgHover: string;
  accentBorder: string;
  accentRing: string;
  badgeBg: string;
  cardGlowBorder: string;
  activeNavBg: string;
}

export const APP_THEMES: Record<AppThemeId, AppThemeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Moroccan Emerald',
    nameAr: 'أخضر مغربي',
    desc: 'Bank Al-Maghrib star green',
    previewColor: '#10b981',
    hexPrimary: '#059669',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-600',
    accentBgLight: 'bg-emerald-600/20',
    accentBgHover: 'hover:bg-emerald-500',
    accentBorder: 'border-emerald-500/40',
    accentRing: 'focus:ring-emerald-500/50',
    badgeBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    cardGlowBorder: 'border-emerald-900/40',
    activeNavBg: 'bg-emerald-600/30 text-emerald-400 ring-emerald-500/40',
  },
  blue: {
    id: 'blue',
    name: 'Atlantic Blue',
    nameAr: 'أزرق أطلسي',
    desc: 'Tanger Med & maritime modernity',
    previewColor: '#3b82f6',
    hexPrimary: '#2563eb',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-600',
    accentBgLight: 'bg-blue-600/20',
    accentBgHover: 'hover:bg-blue-500',
    accentBorder: 'border-blue-500/40',
    accentRing: 'focus:ring-blue-500/50',
    badgeBg: 'bg-blue-950/80 text-blue-400 border-blue-800/60',
    cardGlowBorder: 'border-blue-900/40',
    activeNavBg: 'bg-blue-600/30 text-blue-400 ring-blue-500/40',
  },
  amber: {
    id: 'amber',
    name: 'Sahara Ochre',
    nameAr: 'عنبر الصحراء',
    desc: 'Marrakech clay & golden sand',
    previewColor: '#f59e0b',
    hexPrimary: '#d97706',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-600',
    accentBgLight: 'bg-amber-600/20',
    accentBgHover: 'hover:bg-amber-500',
    accentBorder: 'border-amber-500/40',
    accentRing: 'focus:ring-amber-500/50',
    badgeBg: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    cardGlowBorder: 'border-amber-900/40',
    activeNavBg: 'bg-amber-600/30 text-amber-400 ring-amber-500/40',
  },
  purple: {
    id: 'purple',
    name: 'Atlas Violet',
    nameAr: 'بنفسجي الأطلس',
    desc: 'Al Boraq & Moroccan craft art',
    previewColor: '#a855f7',
    hexPrimary: '#9333ea',
    accentText: 'text-purple-400',
    accentBg: 'bg-purple-600',
    accentBgLight: 'bg-purple-600/20',
    accentBgHover: 'hover:bg-purple-500',
    accentBorder: 'border-purple-500/40',
    accentRing: 'focus:ring-purple-500/50',
    badgeBg: 'bg-purple-950/80 text-purple-400 border-purple-800/60',
    cardGlowBorder: 'border-purple-900/40',
    activeNavBg: 'bg-purple-600/30 text-purple-400 ring-purple-500/40',
  },
};

const THEME_STORAGE_KEY = 'dirhampay_color_theme_v1';

interface ThemeContextType {
  themeId: AppThemeId;
  theme: AppThemeConfig;
  setThemeId: (id: AppThemeId) => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<AppThemeId>('emerald');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as AppThemeId | null;
      if (stored && APP_THEMES[stored]) {
        setThemeIdState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setThemeId = (id: AppThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
      // Sync browser theme-color meta tag
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', APP_THEMES[id].hexPrimary);
      }
    } catch {
      // ignore
    }
  };

  const theme = APP_THEMES[themeId] || APP_THEMES.emerald;

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        theme,
        setThemeId,
        isThemeModalOpen,
        setIsThemeModalOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
