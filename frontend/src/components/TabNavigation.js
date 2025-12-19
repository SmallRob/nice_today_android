import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useTheme } from '../context/ThemeContext';
import { storageManager } from '../utils/storageManager';

const TabNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // 检测是否为iOS设备，用于调整底部安全区域
  const isIOS = Capacitor.getPlatform() === 'ios';
  
  // 页面切换时更新缓存
  useEffect(() => {
    // 从本地存储获取缓存超时设置
    const savedCacheTimeout = localStorage.getItem('cacheTimeout');
    const timeout = savedCacheTimeout ? parseInt(savedCacheTimeout) : 180000; // 默认3分钟
    storageManager.setGlobalCacheTimeout(timeout);
    
    // 根据当前路径触发相应页面的缓存更新
    const updatePageCache = async () => {
      // 这里可以根据不同路径触发不同页面的缓存更新逻辑
      // 例如：
      // if (location.pathname === '/') {
      //   // 触发首页缓存更新
      // }
      // if (location.pathname === '/maya') {
      //   // 触发玛雅页面缓存更新
      // }
      // if (location.pathname === '/dress') {
      //   // 触发穿衣指南页面缓存更新
      // }
    };
    
    updatePageCache();
  }, [location.pathname]);

  // 优化的Tab样式类 - 根据文本长度自适应宽度
  const getTabClassName = (isActive) => {
    const baseClasses = "flex flex-col items-center justify-center h-full transition-all duration-200 relative min-w-0 flex-1 px-1";
    
    if (isActive) {
      return `${baseClasses} text-blue-600 dark:text-blue-400`;
    } else {
      return `${baseClasses} text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300`;
    }
  };

  // 活跃Tab指示器样式
  const activeIndicatorClass = theme === 'dark' 
    ? 'bg-blue-400' 
    : 'bg-blue-600';

  const tabs = [
    {
      id: 'dashboard',
      label: '首页',
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      )
    },
    {
      id: 'maya',
      label: '玛雅历法',
      path: '/maya',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
        </svg>
      )
    },
    {
      id: 'dress',
      label: '穿衣养生',
      path: '/dress',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: '设置',
      path: '/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
      )
    }
  ];

  const handleTabClick = (path) => {
    // 在切换Tab前清除相关页面的缓存，确保获取最新数据
    if (path === '/') {
      // 清除首页相关缓存
      storageManager.removeGlobalCache('dashboard_data');
    } else if (path === '/maya') {
      // 清除玛雅页面相关缓存
      storageManager.removeGlobalCache('maya_data');
    } else if (path === '/dress') {
      // 清除穿衣指南页面相关缓存
      storageManager.removeGlobalCache('dress_data');
    } else if (path === '/settings') {
      // 清除设置页面相关缓存
      storageManager.removeGlobalCache('settings_data');
    }
    
    navigate(path);
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 ${
        isIOS ? 'pb-safe-bottom' : ''
      } shadow-lg`}
    >
      <div className="flex justify-center items-center h-16 relative px-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className={getTabClassName(isActive)}
            >
              {/* 活跃指示器 */}
              {isActive && (
                <div className={`absolute top-0 w-full h-0.5 ${activeIndicatorClass}`}></div>
              )}
              
              {/* 图标和文字容器 */}
              <div className="flex flex-col items-center justify-center space-y-1 max-w-full overflow-hidden">
                {/* 图标 */}
                <div className="relative flex-shrink-0">
                  {isActive ? tab.activeIcon : tab.icon}
                </div>
                
                {/* 标签文字 - 根据文本长度自适应 */}
                <span className="text-xs font-medium truncate max-w-full px-1">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;