import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

// 主题颜色映射
const THEME_COLORS = {
  light: '#6366f1',  // indigo-500
  dark: '#1e293b'    // slate-800
};

/**
 * 自定义Hook用于动态更新主题颜色
 * 根据当前主题模式更新meta标签中的theme-color和状态栏样式
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

    // 更新状态栏颜色和样式（如果支持）
    const updateStatusBarColor = async () => {
      try {
        const themeColor = THEME_COLORS[theme] || THEME_COLORS.light;

        // 对于Capacitor平台，设置状态栏颜色和样式
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar) {
          const StatusBar = window.Capacitor.Plugins.StatusBar;

          // 获取平台信息
          const platform = window.Capacitor.getPlatform();

          // 根据主题设置状态栏样式
          // DARK样式 = 浅色文字（用于深色背景）
          // LIGHT样式 = 深色文字（用于浅色背景）
          const statusBarStyle = theme === 'dark' ? 'DARK' : 'LIGHT';

          // iOS不支持设置背景色，只支持样式
          if (platform === 'ios') {
            await StatusBar.setStyle({ style: statusBarStyle });
          } else {
            // Android和其他平台支持设置背景色和样式
            await StatusBar.setStyle({ style: statusBarStyle });
            await StatusBar.setBackgroundColor({ color: themeColor });
          }

          console.log(`状态栏已更新: style=${statusBarStyle}, color=${themeColor}, theme=${theme}`);
        }
      } catch (error) {
        console.debug('无法设置状态栏颜色:', error);
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