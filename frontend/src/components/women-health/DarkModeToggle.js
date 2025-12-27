import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme, THEMES, isSystemTheme } = useTheme();

  // 根据当前主题渲染不同的图标
  const renderThemeIcon = () => {
    if (isSystemTheme) {
      return (
        // 系统主题图标 - 自动跟随系统
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    }
    
    switch (theme) {
      case THEMES.PURPLE:
        return (
          // 紫色主题图标 - 淡紫色主题
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        );
      case THEMES.DARK:
        return (
          // 月亮图标 - 暗色主题
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        );
      case THEMES.PINK:
        return (
          // 花朵图标 - 粉色主题
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  // 根据当前主题获取按钮样式
  const getButtonStyle = () => {
    if (isSystemTheme) {
      return "bg-blue-100 border-2 border-blue-300 text-blue-700 hover:bg-blue-200";
    }
    
    switch (theme) {
      case THEMES.PURPLE:
        return "bg-purple-100 border-2 border-purple-300 text-purple-700 hover:bg-purple-200";
      case THEMES.DARK:
        return "bg-gray-800 border-2 border-gray-600 text-gray-200 hover:bg-gray-700";
      case THEMES.PINK:
        return "bg-pink-100 border-2 border-pink-300 text-pink-700 hover:bg-pink-200";
      default:
        return "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50";
    }
  };

  // 获取工具提示文本
  const getTooltipText = () => {
    if (isSystemTheme) {
      return "系统主题 - 点击切换至手动模式";
    }
    
    switch (theme) {
      case THEMES.PURPLE:
        return "淡紫色主题 - 点击切换至暗色模式";
      case THEMES.DARK:
        return "暗色主题 - 点击切换至粉色模式";
      case THEMES.PINK:
        return "粉色主题 - 点击切换至淡紫色模式";
      default:
        return "切换主题";
    }
  };

  // 获取系统主题指示器
  const getSystemIndicator = () => {
    if (isSystemTheme) {
      return (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white">
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative group">
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full ${getButtonStyle()} transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 relative`}
        aria-label={getTooltipText()}
      >
        {renderThemeIcon()}
        {getSystemIndicator()}
      </button>
      
      {/* 工具提示 */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
        {getTooltipText()}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
      
      {/* 主题指示器 */}
      <div className="flex justify-center mt-1 space-x-1">
        <div className={`w-1 h-1 rounded-full ${(isSystemTheme || theme === THEMES.PURPLE) ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
        <div className={`w-1 h-1 rounded-full ${(isSystemTheme || theme === THEMES.DARK) ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
        <div className={`w-1 h-1 rounded-full ${(isSystemTheme || theme === THEMES.PINK) ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
        <div className={`w-1 h-1 rounded-full ${isSystemTheme ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
      </div>
    </div>
  );
};

export default ThemeToggle;