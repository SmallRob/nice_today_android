import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { userConfigManager } from '../utils/userConfigManager';
import { ThemeProvider } from '../context/ThemeContext';
import { useThemeColor } from '../hooks/useThemeColor';
import './styles/liteStyles.css';

// 轻量版页面组件
import BiorhythmLitePage from './pages/BiorhythmLitePage';
import MayaCalendarLitePage from './pages/MayaCalendarLitePage';
import DressGuideLitePage from './pages/DressGuideLitePage';
import SettingsLitePage from './pages/SettingsLitePage';

// 轻量版组件
import LiteTabNavigation from './components/LiteTabNavigation';

// 应用布局组件 - 包含主题颜色管理
const AppLayout = ({ children, activeTab, setActiveTab }) => {
  // 使用主题颜色Hook确保状态栏颜色与主题同步
  const theme = useThemeColor();
  
  // 设置CSS变量以便在样式中使用主题颜色
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--status-bar-background', '#1e293b');
    } else {
      root.style.setProperty('--status-bar-background', '#6366f1');
    }
  }, [theme]);
  
  return (
    <div className="lite-app-container">
      {/* 主要内容区域 */}
      <div className="lite-main-content">
        {children}
      </div>
      
      {/* 底部导航 */}
      <LiteTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

const AppLite = () => {
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    gender: 'secret',
    birthDate: ''
  });
  const [activeTab, setActiveTab] = useState('biorhythm');
  const [isLoading, setIsLoading] = useState(true);

  // 初始化用户配置
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 确保用户配置管理器已初始化
        if (!userConfigManager.initialized) {
          await userConfigManager.initialize();
        }

        // 获取当前用户配置
        const currentConfig = userConfigManager.getCurrentConfig();
        setUserInfo({
          nickname: currentConfig.nickname || '',
          gender: currentConfig.gender || 'secret',
          birthDate: currentConfig.birthDate || ''
        });

        // 添加配置变更监听器
        const removeListener = userConfigManager.addListener((configData) => {
          if (configData.currentConfig) {
            setUserInfo({
              nickname: configData.currentConfig.nickname || '',
              gender: configData.currentConfig.gender || 'secret',
              birthDate: configData.currentConfig.birthDate || ''
            });
          }
        });

        setIsLoading(false);

        // 清理监听器
        return () => {
          if (removeListener) removeListener();
        };
      } catch (error) {
        console.error('轻量版应用初始化失败:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="lite-loading-container">
        <div className="lite-loading-spinner"></div>
        <p>正在加载轻量版应用...</p>
      </div>
    );
  }

  return (
    <Router>
      <ThemeProvider>
        <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
          <Routes>
            <Route path="/" element={<BiorhythmLitePage userInfo={userInfo} />} />
            <Route path="/maya" element={<MayaCalendarLitePage userInfo={userInfo} />} />
            <Route path="/dress" element={<DressGuideLitePage userInfo={userInfo} />} />
            <Route path="/settings" element={<SettingsLitePage userInfo={userInfo} setUserInfo={setUserInfo} />} />
          </Routes>
        </AppLayout>
      </ThemeProvider>
    </Router>
  );
};

export default AppLite;