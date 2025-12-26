import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { liteUserConfigManager } from '../utils/liteUserConfigManager';
import { ThemeProvider } from '../context/ThemeContext';
import { useThemeColor } from '../hooks/useThemeColor';
import './styles/liteStyles.css';

// 轻量版页面组件 - 使用 lazy 延迟加载以优化启动速度
const BiorhythmLitePage = React.lazy(() => import('./pages/BiorhythmLitePage'));
const MayaCalendarLitePage = React.lazy(() => import('./pages/MayaCalendarLitePage'));
const DressGuideLitePage = React.lazy(() => import('./pages/DressGuideLitePage'));
const SettingsLitePage = React.lazy(() => import('./pages/SettingsLitePage'));

// 轻量版组件
const LiteTabNavigation = React.lazy(() => import('./components/LiteTabNavigation'));

// 等待界面组件
const LiteLoadingView = ({ message = '正在加载...' }) => (
  <div className="lite-loading-container">
    <div className="lite-loading-spinner"></div>
    <p>{message}</p>
  </div>
);

// 顶部标题栏组件 - 包含版本切换按钮
const TopHeader = () => {
  const handleSwitchToFull = () => {
    // 设置版本标记
    localStorage.setItem('appVersion', 'full');
    // 重新加载页面以切换到完整版
    window.location.href = '/';
  };

  return (
    <div className="lite-top-header">
      <div className="lite-header-title">Nice Today</div>
      <button
        className="lite-version-switch-btn"
        onClick={handleSwitchToFull}
        title="切换到炫彩版"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>炫彩版</span>
      </button>
    </div>
  );
};

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
      {/* 顶部标题栏 */}
      <TopHeader />
      
      {/* 主要内容区域 */}
      <div className="lite-main-content">
        <React.Suspense fallback={<LiteLoadingView />}>
          {children}
        </React.Suspense>
      </div>

      {/* 底部导航 */}
      <React.Suspense fallback={null}>
        <LiteTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </React.Suspense>
    </div>
  );
};

const AppLite = () => {
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    gender: 'secret',
    birthDate: ''
  });
  const [activeTab, setActiveTab] = useState('maya');
  const [isLoading, setIsLoading] = useState(true);

  // 初始化用户配置
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('轻量版应用开始初始化...');
        
        // 确保轻量版用户配置管理器已初始化
        if (!liteUserConfigManager.initialized) {
          console.log('初始化轻量版用户配置管理器...');
          await liteUserConfigManager.initialize();
        }

        // 获取当前用户配置
        const currentConfig = liteUserConfigManager.getCurrentConfig();
        console.log('轻量版当前配置:', currentConfig);
        
        setUserInfo({
          nickname: currentConfig.nickname || '',
          gender: currentConfig.gender || 'secret',
          birthDate: currentConfig.birthDate || ''
        });

        // 添加配置变更监听器
        const removeListener = liteUserConfigManager.addListener((configData) => {
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

  // 异步预加载其他模块，避免点击切换时黑屏/等待
  useEffect(() => {
    if (!isLoading) {
      const prefetchModules = () => {
        // 预加载人体节律界面及其他功能模块
        import('./pages/BiorhythmLitePage').catch(() => { });
        import('./pages/DressGuideLitePage').catch(() => { });
        import('./pages/SettingsLitePage').catch(() => { });
        import('./components/LiteTabNavigation').catch(() => { });
      };

      // 使用 requestIdleCallback 或延迟执行，确保不影响首屏性能
      if (window.requestIdleCallback) {
        window.requestIdleCallback(prefetchModules);
      } else {
        setTimeout(prefetchModules, 2000);
      }
    }
  }, [isLoading]);

  if (isLoading) {
    return <LiteLoadingView message="正在初始化轻量版..." />;
  }

  return (
    <Router basename="/lite">
      <ThemeProvider>
        <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
          <Routes>
            <Route path="/" element={<MayaCalendarLitePage userInfo={userInfo} />} />
            <Route path="/maya" element={<MayaCalendarLitePage userInfo={userInfo} />} />
            <Route path="/biorhythm" element={<BiorhythmLitePage userInfo={userInfo} />} />
            <Route path="/dress" element={<DressGuideLitePage userInfo={userInfo} />} />
            <Route path="/settings" element={<SettingsLitePage userInfo={userInfo} setUserInfo={setUserInfo} />} />
            {/* 兜底跳转，避免白屏 */}
            <Route path="*" element={<MayaCalendarLitePage userInfo={userInfo} />} />
          </Routes>
        </AppLayout>
      </ThemeProvider>
    </Router>
  );
};

export default AppLite;