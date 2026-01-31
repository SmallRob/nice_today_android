import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { storageManager } from '../utils/storageManager';
import './TabNavigation.css';

const TabNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 检测是否为iOS设备，用于调整底部安全区域
  const isIOS = Capacitor.getPlatform() === 'ios';

  // 页面切换时更新缓存
  useEffect(() => {
    const updateCache = async () => {
      try {
        // 从本地存储获取缓存超时设置
        const savedCacheTimeout = localStorage.getItem('cacheTimeout');
        const timeout = savedCacheTimeout ? parseInt(savedCacheTimeout) : 180000; // 默认3分钟
        storageManager.setGlobalCacheTimeout(timeout);
      } catch (error) {
        console.warn('缓存更新失败:', error);
      }
    };

    updateCache();
  }, [location.pathname]);

  // 优化的Tab样式类 - 根据文本长度自适应宽度
  const getTabClassName = (isActive) => {
    const baseClasses = "tab-button";
    return isActive ? `${baseClasses} active` : baseClasses;
  };

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
      id: 'health-dashboard',
      label: '健康身心',
      path: '/health-dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 'trend',
      label: '人生趋势',
      path: '/trend',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 20h18M5 16l4-4 6 6M15 12l4 4" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 20h18M5 16l4-4 6 6M15 12l4 4" />
        </svg>
      )
    },
    {
      id: 'shaoyong',
      label: '传统易学',
      path: '/shaoyong-yixue',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 22C12 22 12 17 12 12C12 7 12 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12C14.7614 12 17 14.2386 17 17C17 19.7614 14.7614 22 12 22Z" fill="currentColor" opacity="0.2"/>
          <path d="M12 22C12 22 12 17 12 12C12 7 12 2 12 2M12 12C9.23858 12 7 9.76142 7 7C7 4.23858 9.23858 2 12 2M12 12C14.7614 12 17 14.2386 17 17C17 19.7614 14.7614 22 12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="7" r="1" fill="currentColor"/>
          <circle cx="12" cy="17" r="1" fill="currentColor"/>
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 22C12 22 12 17 12 12C12 7 12 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12C14.7614 12 17 14.2386 17 17C17 19.7614 14.7614 22 12 22Z"/>
          <circle cx="12" cy="7" r="1" fill="var(--bg-primary, #fff)"/>
          <circle cx="12" cy="17" r="1" fill="var(--bg-primary, #fff)"/>
        </svg>
      )
    },
    {
      id: 'settings',
      label: '更多功能',
      path: '/more-features',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    }
  ];

  const handleTabClick = (path) => {
    // 在切换Tab前清除相关页面的缓存，确保获取最新数据
    if (path === '/') {
      // 清除首页相关缓存
      storageManager.removeGlobalCache('dashboard_data');
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
      // 清除系统设置页面相关缓存
      storageManager.removeGlobalCache('settings_data');
    } else if (path === '/more-features') {
      // 清除更多功能页面相关缓存
      storageManager.removeGlobalCache('more_features_data');
    } else if (path === '/numerology') {
      // 清除生命灵数页面相关缓存
      storageManager.removeGlobalCache('numerology_data');
    } else if (path === '/shaoyong-yixue') {
      // 清除简单易学页面相关缓存
      storageManager.removeGlobalCache('shaoyong_data');
    }

    navigate(path);
  };

  return (
    <div
      className={`tab-navigation ${isIOS ? 'pb-safe-bottom' : ''
        }`}
    >
      {/* 增加高度到 63px，优化响应式布局 */}
      <div className="tab-navigation-container">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className={getTabClassName(isActive)}
            >
              {/* 图标和文字容器 */}
              <div className="tab-content">
                {/* 图标容器 */}
                <div className="tab-icon">
                  {isActive ?
                    tab.activeIcon :
                    tab.icon
                  }
                </div>

                {/* 标签文字 */}
                <span className="tab-label">{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;