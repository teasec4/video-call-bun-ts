import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { ThemeMode } from '../config/theme';
import { DEFAULT_THEME, getThemeColors, generateCssVariables } from '../config/theme';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme-mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved && (saved === 'dark' || saved === 'light')) {
        return saved;
      }
      
      // Check system preference
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    
    return DEFAULT_THEME;
  });

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode);
    }
  };

  const toggleTheme = () => {
    setTheme(mode === 'dark' ? 'light' : 'dark');
  };

  // Apply theme colors to DOM
  useEffect(() => {
    const colors = getThemeColors(mode);
    const cssVariables = generateCssVariables(colors);
    
    // Update root element with CSS variables
    const style = document.querySelector('style[data-theme]');
    if (style) {
      style.textContent = `:root { ${cssVariables} }`;
    } else {
      const newStyle = document.createElement('style');
      newStyle.setAttribute('data-theme', 'true');
      newStyle.textContent = `:root { ${cssVariables} }`;
      document.head.appendChild(newStyle);
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
