import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * 固定底部页脚 - 用于需要固定在底部的场景
 */
// 动态导入版本信息
import versionData from '../version.json';

/**
 * 应用页脚组件 - 支持主题切换
 * 确保在亮色和暗黑模式下都能正确显示
 */
const AppFooter = ({ 
  version = 'v1.0.0',
  showCopyright = true,
  showVersion = true,
  className = ''
}) => {
  const { theme } = useTheme();

  // 页脚样式 - 根据主题适配
  const footerStyles = {
    light: {
      background: 'bg-white dark:bg-gray-900',
      border: 'border-t border-gray-200 dark:border-gray-700',
      text: 'text-gray-600 dark:text-gray-300'
    },
    dark: {
      background: 'bg-gray-900',
      border: 'border-t border-gray-700',
      text: 'text-gray-400'
    }
  };

  const currentStyles = theme === 'dark' ? footerStyles.dark : footerStyles.light;

  return (
    <footer 
      className={`
        ${currentStyles.background} 
        ${currentStyles.border} 
        ${currentStyles.text}
        py-4 px-6
        text-center text-sm
        transition-colors duration-300
        safe-area-theme-adaptive
        ${className}
      `}
    >
      <div className="max-w-4xl mx-auto">
        {showCopyright && (
          <p className="mb-2">
            © 2024 今日宜忌. 保留所有权利
          </p>
        )}
        
        {showVersion && (
          <p className="text-xs opacity-75">
            版本 {version}
          </p>
        )}
        
        {/* 安全区域适配底部留白 */}
        <div className="bottom-safe-area-theme"></div>
      </div>
    </footer>
  );
};

export const FixedAppFooter = ({ 
  version = versionData?.versionName || 'v1.0.0',
  showCopyright = true,
  showVersion = true,
  className = ''
}) => {
  // 安全获取主题，提供降级方案
  let theme = 'light';
  try {
    const themeContext = useTheme();
    theme = themeContext?.theme || 'light';
  } catch (error) {
    console.warn('Theme context not available, using light mode:', error);
  }

  return (
    <footer 
      className={`
        fixed bottom-0 left-0 right-0
        bg-white dark:bg-gray-900
        border-t border-gray-200 dark:border-gray-700 
        text-gray-600 dark:text-gray-300
        py-3 px-6
        text-center text-sm
        transition-colors duration-300
        z-40
        safe-area-theme-adaptive
        ${className}
      `}
      style={{
        paddingBottom: `calc(0.75rem + max(var(--safe-area-inset-bottom), env(safe-area-inset-bottom)))`
      }}
    >
      <div className="max-w-4xl mx-auto">
        {showCopyright && (
          <p className="mb-1">
            © 2024 今日宜忌
          </p>
        )}
        
        {showVersion && (
          <p className="text-xs opacity-75">
            {version}
          </p>
        )}
      </div>
    </footer>
  );
};

export default AppFooter;