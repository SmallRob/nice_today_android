import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { applyTheme, generateCSSVariables, applyCSSVariables } from './cssVariables';

// 主题类型
export type Theme = 'light' | 'dark' | 'system';

// Context类型
type ThemeContextType = {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

// 创建Context
const ThemeContext = createContext<ThemeContextType | null>(null);

// 获取系统主题
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 从localStorage获取保存的主题
const getSavedTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
};

// Provider组件Props
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

// ThemeProvider组件
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
}) => {
  const [theme, setThemeState] = useState<Theme>(() => getSavedTheme() || defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'system') return getSystemTheme();
    return theme;
  });

  // 设置主题
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  // 切换主题
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // 应用主题
  useEffect(() => {
    const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(effectiveTheme);
    applyTheme(effectiveTheme);

    // 初始化CSS变量
    const variables = generateCSSVariables(effectiveTheme);
    applyCSSVariables(variables);
  }, [theme]);

  // 监听系统主题变化
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(newTheme);
      applyTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// useTheme Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
