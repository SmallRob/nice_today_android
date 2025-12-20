import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LiteTabNavigation = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'biorhythm', label: '生物节律', icon: '📊' },
    { id: 'maya', label: '玛雅日历', icon: '📅' },
    { id: 'dress', label: '穿衣指南', icon: '👕' },
    { id: 'settings', label: '设置', icon: '⚙️' }
  ];

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    
    // 导航到相应页面
    switch (tabId) {
      case 'biorhythm':
        navigate('/');
        break;
      case 'maya':
        navigate('/maya');
        break;
      case 'dress':
        navigate('/dress');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        navigate('/');
    }
  };

  // 根据当前路径确定活动标签
  const getActiveTab = () => {
    switch (location.pathname) {
      case '/':
        return 'biorhythm';
      case '/maya':
        return 'maya';
      case '/dress':
        return 'dress';
      case '/settings':
        return 'settings';
      default:
        return 'biorhythm';
    }
  };

  const currentActiveTab = getActiveTab();

  return (
    <div className="lite-tab-navigation">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`lite-tab-item ${currentActiveTab === tab.id ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.id)}
        >
          <span className="lite-tab-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </div>
      ))}
    </div>
  );
};

export default LiteTabNavigation;