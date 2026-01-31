import React, { useState, useEffect } from 'react';
import App from './App'; // 完整版应用
import AppLite from './lite/AppLite'; // 轻量版应用
import versionDetector from './utils/versionDetector'; // 版本检测器
import { useNotification } from './context/NotificationContext';
import updateCheckService from './utils/updateCheckService';
import { getAppVersion } from './utils/capacitor';
import downloadManager from './utils/downloadManager'; // 引入下载管理器

const VersionRouter = () => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();
  const [downloadProgress, setDownloadProgress] = useState(0);

  const getUpdateBaseUrl = () => {
    // 使用指定的 version.json 地址进行检查
    return 'https://leanisssharedstorage.blob.core.windows.net/aise-files/today-update/version.json';
  };

  // 检查更新的函数
  const checkForUpdates = async () => {
    try {
      // 获取API基础URL（从本地存储或使用默认值）
      // 注意：这里仅用于版本检查，实际下载地址会从 version.json 中获取或根据域名构造
      const updateBaseUrl = getUpdateBaseUrl();

      // 获取当前版本信息
      const versionInfo = await getAppVersion();

      // 执行更新检查
      const result = await updateCheckService.checkForUpdate(versionInfo.version, updateBaseUrl);

      if (result && result.hasUpdate) {
        showUpdateNotification(result);
      }

    } catch (error) {
      console.warn('自动更新检查失败:', error.message);
    }
  };

  // 处理下载
  const handleDownload = (updateInfo) => {
    if (!updateInfo.updateUrl) return;
    
    showNotification({
      type: 'info',
      title: '正在下载更新',
      message: '下载进度: 0%',
      duration: 0 // 不自动消失
    });

    downloadManager.downloadApk(
      updateInfo.updateUrl,
      updateInfo.serverVersion,
      (percentage) => {
        setDownloadProgress(percentage);
        // 更新通知 (需要 NotificationContext 支持更新特定 ID 的通知，这里简化处理)
        console.log(`Download progress: ${percentage}%`);
      },
      (filePath) => {
        showNotification({
          type: 'success',
          title: '下载已开始',
          message: '下载完成后将自动安装...',
          duration: 3000
        });
        // 记录已开始安装的版本
        updateCheckService.recordInstalledVersion(updateInfo.serverVersion);
      },
      (error) => {
        showNotification({
          type: 'error',
          title: '下载失败',
          message: error.message,
          duration: 3000
        });
      }
    );
  };

  // 显示更新通知的统一入口
  const showUpdateNotification = (updateInfo) => {
    showNotification({
      type: 'update',
      title: '发现新版本',
      message: `新版本 ${updateInfo.serverVersion} 已提供。\n更新内容：\n${updateInfo.updateInfo?.releaseNotes || '性能优化与问题修复'}`,
      actions: [
        {
          label: '立即更新',
          primary: true,
          onClick: () => handleDownload(updateInfo)
        },
        {
          label: '以后再说',
          onClick: () => {
            updateCheckService.clearUpdateInfo();
          }
        }
      ]
    });
  };

  useEffect(() => {
    const initializeVersionRouting = async () => {
      try {
        // 初始化版本检测器
        const version = await versionDetector.initialize();

        // 设置当前版本
        setCurrentVersion(version);

        // 根据版本自动跳转到相应页面
        versionDetector.autoRedirect();

        setIsLoading(false);
      } catch (error) {
        console.error('版本路由初始化失败:', error);

        // 降级处理：使用默认版本
        setCurrentVersion('lite');
        setIsLoading(false);
      }
    };

    initializeVersionRouting();

    // 监听全局更新通知事件（供其他页面手动触发）
    const handleShowUpdateEvent = (event) => {
      showUpdateNotification(event.detail);
    };

    window.addEventListener('showUpdateNotification', handleShowUpdateEvent);

    // 应用启动 5 秒后检查更新
    const updateTimer = setTimeout(() => {
      checkForUpdates();
    }, 5000);

    return () => {
      window.removeEventListener('showUpdateNotification', handleShowUpdateEvent);
      clearTimeout(updateTimer);
    };
  }, []);

  // 添加版本变化监听器
  useEffect(() => {
    if (!currentVersion) return;

    const removeListener = versionDetector.addVersionChangeListener((detail) => {
      console.log('检测到版本变化:', detail);
      setCurrentVersion(detail.version);

      // 版本变化后重新执行自动跳转
      versionDetector.autoRedirect();
    });

    return () => {
      if (removeListener) removeListener();
    };
  }, [currentVersion]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        backgroundColor: '#f8fafc',
        color: '#374151'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>正在检测应用版本...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 根据版本渲染相应的应用
  if (currentVersion === 'lite') {
    return <AppLite />;
  } else {
    return <App />;
  }
};

export default VersionRouter;
