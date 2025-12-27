import React, { useState, useEffect, useRef } from 'react';
import BiorhythmDashboard from '../components/BiorhythmDashboard';
import '../index.css';
import '../styles/animations.css';

function DashboardPage() {
  // 直接初始化为默认值，不等待异步加载
  const [appInfo, setAppInfo] = useState({
    isNative: false,
    platform: 'web',
    version: 'v1.0.0',
    isMobile: false,
    isDesktop: false
  });

  // 使用useRef来跟踪组件是否已卸载
  const isMountedRef = useRef(true);

  useEffect(() => {
    // 异步执行平台检测，不阻塞UI渲染
    requestAnimationFrame(() => {
      try {
        // 尝试使用全局函数，增加多重容错
        const platformInfo = {
          isNative: false,
          platform: 'web',
          isMobile: false,
          isDesktop: false
        };

        // 检查 window.getPlatformInfo 是否存在
        if (window.getPlatformInfo && typeof window.getPlatformInfo === 'function') {
          const info = window.getPlatformInfo();
          if (info) {
            platformInfo.isNative = info.isNative || false;
            platformInfo.platform = info.platform || 'web';
            platformInfo.isMobile = (info.isAndroid || info.isIOS) || false;
            platformInfo.isDesktop = info.isWeb && !platformInfo.isMobile;
          }
        } else {
          // 降级处理：使用 userAgent 进行简单检测
          const ua = navigator.userAgent || '';
          platformInfo.isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
          platformInfo.isDesktop = !platformInfo.isMobile;
          console.warn('window.getPlatformInfo 不可用，使用降级检测');
        }

        // 检查组件是否仍然挂载
        if (!isMountedRef.current) return;

        // 更新状态
        setAppInfo(prev => ({
          ...prev,
          ...platformInfo
        }));
      } catch (error) {
        console.warn('平台检测失败，使用默认值:', error);
        // 出错时保持默认值，不抛出异常
      }
    });

    // 清理函数
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 直接显示BiorhythmDashboard，不做loading检查
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 animate-fade-in h-full overflow-hidden pb-safe-bottom -webkit-overflow-scrolling-touch safe-area-theme-adaptive">
      <BiorhythmDashboard appInfo={appInfo} />
    </div>
  );
}

export default DashboardPage;