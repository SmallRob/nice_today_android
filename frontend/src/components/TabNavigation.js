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
    let isMounted = true;
    
    const updateCache = async () => {
      if (!isMounted) return;
      
      try {
        // 从本地存储获取缓存超时设置
        const savedCacheTimeout = localStorage.getItem('cacheTimeout');
        const timeout = savedCacheTimeout ? parseInt(savedCacheTimeout) : 180000; // 默认3分钟
        storageManager.setGlobalCacheTimeout(timeout);
        
        // 根据当前路径触发相应页面的缓存更新逻辑
        const updatePageCache = async () => {
          if (!isMounted) return;
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
        
        await updatePageCache();
      } catch (error) {
        console.warn('缓存更新失败:', error);
      }
    };
    
    updateCache();
    
    return () => {
      isMounted = false;
    };
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
      id: 'trend',
      label: '人生趋势',
      path: '/trend',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6M3 21h18" />
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
      label: '更多功能',
      path: '/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
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
    } else if (path === '/trend') {
      // 清除人生趋势页面相关缓存
      storageManager.removeGlobalCache('lifeTrend_data');
    } else if (path === '/dress') {
      // 清除穿衣指南页面相关缓存
      storageManager.removeGlobalCache('dress_data');
    } else if (path === '/tarot') {
      // 清除塔罗页面相关缓存
      storageManager.removeGlobalCache('tarot_data');
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
      {/* 减少高度，优化间距 */}
      <div className="flex justify-around items-center h-12 relative px-0.5">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className={getTabClassName(isActive)}
            >
              {/* 活跃指示器 - 增强高亮效果 */}
              {isActive && (
                <>
                  <div className={`absolute top-0 w-full h-0.5 ${activeIndicatorClass}`}></div>
                  <div className={`absolute inset-0 rounded-lg ${activeIndicatorClass} opacity-10`}></div>
                </>
              )}
              
              {/* 图标和文字容器 - 超紧凑布局 */}
              <div className="flex flex-col items-center justify-center space-y-0 max-w-full overflow-hidden">
                {/* 图标 - 保持适当大小 */}
                <div className="relative flex-shrink-0">
                  {isActive ? 
                    React.cloneElement(tab.activeIcon, { className: "w-5 h-5" }) : 
                    React.cloneElement(tab.icon, { className: "w-5 h-5" })
                  }
                </div>
                
                {/* 标签文字 - 减小字体大小，去除内边距 */}
                <span className="text-xs font-medium truncate w-full leading-tight">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;