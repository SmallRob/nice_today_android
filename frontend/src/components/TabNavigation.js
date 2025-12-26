import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TabNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'home', label: '首页', icon: '🏠', path: '/' },
    { id: 'maya', label: '玛雅', icon: '📅', path: '/maya' },
    { id: 'dress', label: '穿衣', icon: '👕', path: '/dress' },
    { id: 'trend', label: '运势', icon: '📊', path: '/trend' },
    { id: 'tarot', label: '塔罗', icon: '🔮', path: '/tarot' },
    { id: 'numerology', label: '灵数', icon: '🔢', path: '/numerology' },
    { id: 'settings', label: '设置', icon: '⚙️', path: '/settings' }
  ];

  // 根据当前路径确定活动标签
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/maya')) return 'maya';
    if (path.startsWith('/dress')) return 'dress';
    if (path.startsWith('/trend')) return 'trend';
    if (path.startsWith('/tarot')) return 'tarot';
    if (path.startsWith('/numerology')) return 'numerology';
    if (path.startsWith('/settings')) return 'settings';
    return 'home';
  };

  const currentActiveTab = getActiveTab();

  const handleTabClick = (tab) => {
    navigate(tab.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = currentActiveTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default TabNavigation;
