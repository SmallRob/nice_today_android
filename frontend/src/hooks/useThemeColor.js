import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

// 主题颜色映射
const THEME_COLORS = {
  light: '#6366f1',  // indigo-500
  dark: '#1e293b'    // slate-800
};

/**
 * 自定义Hook用于动态更新主题颜色
 * 根据当前主题模式更新meta标签中的theme-color
 */
export const useThemeColor = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // 更新theme-color meta标签
    const updateMetaThemeColor = () => {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS.light);
      }
    };

    // 更新状态栏颜色（如果支持）
    const updateStatusBarColor = () => {
      try {
        // 对于支持setStatusbarBackgroundColor的平台（如Capacitor）
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar) {
          window.Capacitor.Plugins.StatusBar.setBackgroundColor({
            color: THEME_COLORS[theme] || THEME_COLORS.light
          });
        }
      } catch (error) {
        console.debug('无法设置状态栏背景色:', error);
      }
    };

    // 执行更新
    updateMetaThemeColor();
    updateStatusBarColor();

    // 清理函数
    return () => {
      // 不需要特殊清理
    };
  }, [theme]); // 仅在主题变化时执行

  return theme;
};