import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeAwareLoading = ({ message = "正在加载健康数据...", className = "" }) => {
  const { theme } = useTheme();

  // 根据主题设置加载动画的样式
  const getLoadingStyles = () => {
    if (theme === 'dark') {
      return {
        containerBg: 'bg-gray-900',
        spinnerBorder: 'border-gray-700',
        spinnerBorderTop: 'border-blue-500',
        textColor: 'text-white'
      };
    } else {
      return {
        containerBg: 'bg-white',
        spinnerBorder: 'border-gray-200',
        spinnerBorderTop: 'border-blue-600',
        textColor: 'text-gray-800'
      };
    }
  };

  const styles = getLoadingStyles();

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] w-full ${styles.containerBg} ${className}`}>
      <div className="flex flex-col items-center">
        {/* 加载动画 - 圆形旋转指示器 */}
        <div className={`w-16 h-16 border-4 ${styles.spinnerBorder} ${styles.spinnerBorderTop} rounded-full animate-spin mb-6`}></div>
        
        {/* 加载文本 */}
        <p className={`text-lg font-medium ${styles.textColor} mb-2`}>
          {message}
        </p>
        
        {/* 子弹点动画 */}
        <div className="flex space-x-1">
          <div className={`w-2 h-2 ${styles.textColor.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
          <div className={`w-2 h-2 ${styles.textColor.replace('text-', 'bg-')} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
          <div className={`w-2 h-2 ${styles.textColor.replace('text-', 'bg-')} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ThemeAwareLoading;