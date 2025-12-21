import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * 统一的页面布局组件
 * 提供一致的页面结构和样式
 */
const PageLayout = ({ 
  title, 
  subtitle, 
  children, 
  loading = false, 
  error = null,
  headerAction = null,
  bgGradient = false,
  showBackButton = false,
  onBackPress = null
}) => {
  const { theme } = useTheme();
  
  // 背景样式
  const bgClass = bgGradient 
    ? theme === 'dark' 
      ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
      : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    : 'bg-white dark:bg-gray-900';

  // 加载状态
  if (loading) {
    return (
      <div className={`flex-1 overflow-auto ${bgClass} pb-safe-bottom`}>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className={`flex-1 overflow-auto ${bgClass} pb-safe-bottom`}>
        <div className="flex flex-col items-center justify-center h-64 p-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500 dark:text-red-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">加载失败</h3>
          <p className="text-red-600 dark:text-red-400 mb-4 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-auto ${bgClass} pb-safe-bottom`}>
      {/* 页面头部 */}
      {(title || subtitle || showBackButton || headerAction) && (
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-4">
            <div className="flex items-center">
              {showBackButton && (
                <button
                  onClick={onBackPress}
                  className="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              <div className="flex-1">
                {title && (
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white" style={{ color: 'var(--color-text)' }}>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {subtitle}
                  </p>
                )}
              </div>
              
              {headerAction && (
                <div className="ml-3">
                  {headerAction}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 页面内容 */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

/**
 * 统一的卡片组件
 */
export const Card = ({ 
  title, 
  subtitle, 
  children, 
  padding = 'p-4', 
  rounded = 'rounded-lg',
  shadow = 'shadow-sm',
  border = 'border border-gray-200 dark:border-gray-700',
  headerAction = null,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 ${rounded} ${shadow} ${border} ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className={`${padding} border-b border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white" style={{ color: 'var(--color-text)' }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction}
          </div>
        </div>
      )}
      <div className={padding}>
        {children}
      </div>
    </div>
  );
};

/**
 * 统一的按钮组件
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  icon = null
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // 变体样式
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
  };
  
  // 尺寸样式
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

/**
 * 统一的信息提示组件
 */
export const Alert = ({ 
  children, 
  variant = 'info', 
  className = '',
  icon = null
}) => {
  const baseClasses = 'p-4 rounded-lg';
  
  // 变体样式
  const variantClasses = {
    info: 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300',
    success: 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300',
    danger: 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
  };
  
  const defaultIcons = {
    info: (
      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    danger: (
      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  };
  
  const displayIcon = icon || defaultIcons[variant];
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start">
        {displayIcon}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;