import React from 'react';
import './AppFooter.css';
import { useTheme } from '../context/ThemeContext';

/**
 * 固定底部页脚 - 移动端优化，扁平化设计
 */
// 动态导入版本信息
import versionData from '../version.json';

/**
 * 应用页脚组件 - 支持主题切换
 * 扁平化设计，紧凑间距，移动端优先
 */
const AppFooter = ({ 
  version = 'v1.0.0',
  showCopyright = true,
  showVersion = true,
  className = ''
}) => {
  const { theme } = useTheme();

  return (
    <footer 
      className={`app-footer ${theme} ${className}`}
    >
      <div className="footer-content">
        {showCopyright && (
          <p className="footer-copyright">
            © 2024 今日宜忌
          </p>
        )}
        
        {showVersion && (
          <p className="footer-version">
            版本 {version}
          </p>
        )}
      </div>
    </footer>
  );
};

/**
 * 固定底部页脚组件 - 用于Dashboard等页面
 */
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
      className={`fixed-footer ${theme} ${className}`}
      style={{
        paddingBottom: `calc(var(--spacing-lg) + max(var(--safe-area-inset-bottom), env(safe-area-inset-bottom)))`
      }}
    >
      <div className="footer-content">
        {showCopyright && (
          <p className="footer-copyright">
            © 2024 今日宜忌
          </p>
        )}
        
        {showVersion && (
          <p className="footer-version">
            {version}
          </p>
        )}
      </div>
    </footer>
  );
};

export default AppFooter;
