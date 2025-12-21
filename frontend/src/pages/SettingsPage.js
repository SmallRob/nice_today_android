import React, { useState, useEffect, useCallback, useRef } from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import PerformanceTestTool from '../components/PerformanceTestTool';
import UserConfigManager from '../components/UserConfigManager';
import { getAppVersion } from '../utils/capacitor';
import { Capacitor } from '@capacitor/core';
import PageLayout, { Card, Button } from '../components/PageLayout';
import notificationService from '../utils/notificationService';
import updateCheckService from '../utils/updateCheckService';
import { useNotification } from '../context/NotificationContext';
import versionDetector from '../utils/versionDetector';
import { restartApp } from '../utils/restartApp';
import versionData from '../version.json';
import '../index.css';

function SettingsPage() {
  // 从URL查询参数获取当前标签
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'app';

  const [appVersion, setAppVersion] = useState({
    version: versionData.versionName,
    build: 'web'
  });
  const [platformInfo, setPlatformInfo] = useState({
    platform: 'web',
    isNative: false,
    isAndroid: false,
    isIOS: false
  });
  const [apiBaseUrl, setApiBaseUrl] = useState('https://nice-mcp.leansoftx.com/api');
  const [useLocalCalculation, setUseLocalCalculation] = useState(false);
  const [cacheTimeout, setCacheTimeout] = useState(180000); // 默认3分钟
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const { showNotification } = useNotification();
  const [error, setError] = useState(null);

  // 通知设置状态
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    morningTime: '07:00',
    eveningTime: '21:00',
    permissionGranted: false
  });

  // 更新检查设置状态
  const [updateCheckSettings, setUpdateCheckSettings] = useState({
    enabled: true,
    checkFrequency: 'startup',
    lastCheckTime: null,
    checkRecords: []
  });

  // 滚动容器引用
  const scrollContainerRef = useRef(null);

  // 滚动到顶部函数
  const scrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  // 简化的标签切换函数，提高移动端兼容性
  const handleTabChange = useCallback((tab) => {
    if (tab === activeTab) return;

    // 更新URL参数
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('tab', tab);
    window.history.replaceState({}, '', newUrl);

    // 滚动到顶部
    scrollToTop();

    // 直接切换标签，移除动画效果提高兼容性
    setActiveTab(tab);
  }, [activeTab, scrollToTop]);

  // 标签切换时自动滚动到顶部
  useEffect(() => {
    scrollToTop();
  }, [activeTab, scrollToTop]);

  useEffect(() => {
    const loadAppInfo = async () => {
      try {
        setError(null);

        // 异步加载应用信息，避免卡顿
        await new Promise(resolve => setTimeout(resolve, 100));

        // 获取应用版本信息
        const versionInfo = await getAppVersion();
        setAppVersion(versionInfo);

        // 获取平台信息
        const platform = Capacitor.getPlatform();
        setPlatformInfo({
          platform,
          isNative: Capacitor.isNativePlatform(),
          isAndroid: platform === 'android',
          isIOS: platform === 'ios'
        });

        // 从本地存储加载API设置
        await new Promise(resolve => setTimeout(resolve, 50));
        const savedApiUrl = localStorage.getItem('apiBaseUrl');
        if (savedApiUrl) {
          setApiBaseUrl(savedApiUrl);
        }

        const savedUseLocal = localStorage.getItem('useLocalCalculation');
        if (savedUseLocal) {
          setUseLocalCalculation(savedUseLocal === 'true');
        }

        // 从本地存储加载缓存超时设置
        const savedCacheTimeout = localStorage.getItem('cacheTimeout');
        if (savedCacheTimeout) {
          setCacheTimeout(parseInt(savedCacheTimeout));
        }

        // 加载通知设置
        const notificationSettings = notificationService.getSettings();
        setNotificationSettings(notificationSettings);

        // 加载更新检查设置
        const updateConfig = updateCheckService.getConfig();
        const checkRecords = updateCheckService.getCheckRecords();
        setUpdateCheckSettings({
          enabled: updateConfig.enabled,
          checkFrequency: updateConfig.checkFrequency,
          lastCheckTime: updateConfig.lastCheckTime,
          checkRecords: checkRecords
        });
      } catch (error) {
        console.error('Error loading app info:', error);
        setError('加载应用信息失败: ' + error.message);
      } finally {
        setIsLoaded(true);
      }
    };

    loadAppInfo();
  }, []);

  // 保存API基础URL设置
  const handleApiBaseUrlChange = (e) => {
    const newUrl = e.target.value;
    setApiBaseUrl(newUrl);
    localStorage.setItem('apiBaseUrl', newUrl);
  };

  // 保存使用本地计算设置
  const handleUseLocalCalculationChange = (e) => {
    const newValue = e.target.checked;
    setUseLocalCalculation(newValue);
    localStorage.setItem('useLocalCalculation', newValue.toString());
  };

  // 保存缓存超时设置
  const handleCacheTimeoutChange = (e) => {
    const newValue = parseInt(e.target.value);
    setCacheTimeout(newValue);
    localStorage.setItem('cacheTimeout', newValue.toString());
  };

  // 处理通知设置变更
  const handleNotificationChange = (field, value) => {
    const newSettings = {
      ...notificationSettings,
      [field]: value
    };

    setNotificationSettings(newSettings);

    // 更新通知服务设置
    notificationService.updateSettings(newSettings);
  };

  // 请求通知权限
  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setNotificationSettings(prev => ({
      ...prev,
      permissionGranted: granted
    }));

    if (granted) {
      setError('通知权限已授权！');
      setTimeout(() => setError(null), 3000);
    } else {
      setError('通知权限被拒绝，请在浏览器设置中手动开启。');
      setTimeout(() => setError(null), 3000);
    }
  };

  // 测试通知
  const handleTestNotification = () => {
    if (!notificationSettings.permissionGranted) {
      setError('请先授权通知权限');
      setTimeout(() => setError(null), 3000);
      return;
    }

    notificationService.sendNotification(
      '测试通知',
      '这是一个测试通知，确认通知功能正常工作。'
    );

    setError('测试通知已发送');
    setTimeout(() => setError(null), 3000);
  };

  // 切换应用版本
  const handleVersionSwitch = (version) => {
    const currentVersion = versionDetector.getCurrentVersion();
    if (version === currentVersion) {
      showNotification({
        type: 'info',
        title: '提示',
        message: `当前已是${version === 'lite' ? '轻量版' : '炫彩版'}`,
        duration: 2000
      });
      return;
    }

    showNotification({
      type: 'warning',
      title: '版本切换确认',
      message: `确定要切换到${version === 'lite' ? '轻量版' : '炫彩版'}吗？这需要重启应用。`,
      actions: [
        {
          label: '立即重启',
          primary: true,
          onClick: () => {
            versionDetector.switchVersion(version);
            restartApp();
          }
        },
        {
          label: '以后再说',
          onClick: () => {
            // 仅保存设置但不重启
            localStorage.setItem('appVersion', version);
            showNotification({
              type: 'success',
              title: '设置成功',
              message: '版本设置已更新，将在下次启动时生效',
              duration: 3000
            });
          }
        }
      ]
    });
  };

  // 获取当前版本
  const getCurrentVersion = () => {
    return localStorage.getItem('appVersion') || 'lite';
  };

  // 重新加载当前版本
  const handleReloadCurrentVersion = () => {
    const currentVersion = getCurrentVersion();
    showNotification({
      type: 'info',
      title: '重新加载确认',
      message: `确定要重新加载${currentVersion === 'lite' ? '轻量版' : '炫彩版'}吗？这将刷新当前页面。`,
      actions: [
        {
          label: '立即刷新',
          primary: true,
          onClick: () => {
            // 保存当前标签页状态
            const currentTab = activeTab;
            localStorage.setItem('settingsActiveTab', currentTab);

            // 刷新页面
            window.location.reload();
          }
        },
        {
          label: '取消',
          onClick: () => {
            // 用户取消操作
          }
        }
      ]
    });
  };

  // 处理更新检查设置变更
  const handleUpdateCheckChange = async (field, value) => {
    const newSettings = {
      ...updateCheckSettings,
      [field]: value
    };

    setUpdateCheckSettings(newSettings);

    // 更新服务配置
    await updateCheckService.updateConfig({
      enabled: newSettings.enabled,
      checkFrequency: newSettings.checkFrequency
    });

    setError('更新检查设置已保存');
    setTimeout(() => setError(null), 2000);
  };

  // 手动检查更新
  const handleManualCheckUpdate = async () => {
    try {
      setError('正在检查更新...');

      const result = await updateCheckService.forceCheckForUpdate(
        appVersion.version,
        apiBaseUrl
      );

      if (result && result.hasUpdate) {
        showNotification({
          type: 'update',
          title: '发现新版本',
          message: `新版本 ${result.serverVersion} 已提供，包含重要改进和新功能。`,
          actions: [
            {
              label: '立即更新',
              primary: true,
              onClick: () => {
                if (result.updateUrl) window.open(result.updateUrl, '_blank');
              }
            },
            {
              label: '稍后再说',
              onClick: () => { }
            }
          ]
        });
      } else if (result) {
        showNotification({
          type: 'success',
          title: '检查完成',
          message: '当前已是最新版本',
          duration: 3000
        });
      } else {
        setError('检查更新失败，请检查网络连接');
      }

      setTimeout(() => setError(null), 3000);

      // 刷新检查记录
      const records = updateCheckService.getCheckRecords();
      setUpdateCheckSettings(prev => ({
        ...prev,
        checkRecords: records,
        lastCheckTime: updateCheckService.getConfig().lastCheckTime
      }));

    } catch (error) {
      setError('检查更新失败: ' + error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  // 清除检查记录
  const handleClearCheckRecords = () => {
    const newRecords = updateCheckService.getCheckRecords().slice(-10); // 保留最近10条
    setUpdateCheckSettings(prev => ({
      ...prev,
      checkRecords: newRecords
    }));

    // 这里需要实际清除存储中的记录，但为了简单起见，我们只更新状态
    setError('检查记录已清除（保留最近10条）');
    setTimeout(() => setError(null), 2000);
  };

  if (!isLoaded) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">设置</h1>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">正在加载设置...</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">请稍候，正在初始化应用配置</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 顶部标题区域 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">设置</h1>
        </div>
      </div>
      
      {/* 固定顶部区域 - 包含错误提示和标签导航 */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800">
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* 成功提示 */}
          {error && !error.includes('失败') && (
            <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-400 p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700 dark:text-green-300">{error}</p>
              </div>
            </div>
          )}

          {/* 标签导航 - 传统矩形圆角风格 */}
          <div className="container mx-auto px-4 py-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 max-w-md mx-auto">
              <button
                className={`flex-1 py-2 px-3 text-center font-medium text-sm rounded-md transition-colors ${activeTab === 'app'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                onClick={() => handleTabChange('app')}
              >
                应用设置
              </button>
              <button
                className={`flex-1 py-2 px-3 text-center font-medium text-sm rounded-md transition-colors ${activeTab === 'userConfigs'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                onClick={() => handleTabChange('userConfigs')}
              >
                用户配置
              </button>
              <button
                className={`flex-1 py-2 px-3 text-center font-medium text-sm rounded-md transition-colors ${activeTab === 'about'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                onClick={() => handleTabChange('about')}
              >
                关于
              </button>
            </div>
          </div>
        </div>

        {/* 独立滚动的内容区域 */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorY: 'contain'
            }}
          >
            <div className="container mx-auto px-4 py-4 max-w-4xl">
              <div>
                {activeTab === 'app' && (
                  <div className="space-y-6">
                    {/* 应用设置部分 */}
                    <Card title="应用设置">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">深色模式</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">切换应用的视觉主题</p>
                          </div>
                          <DarkModeToggle />
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">应用版本</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">切换应用版本以适应不同设备性能</p>
                            <div className="flex space-x-4 mb-3">
                              <button
                                className={`flex-1 py-2 px-4 rounded-md transition-colors ${getCurrentVersion() === 'lite' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                                onClick={() => handleVersionSwitch('lite')}
                              >
                                轻量版
                              </button>
                              <button
                                className={`flex-1 py-2 px-4 rounded-md transition-colors ${getCurrentVersion() === 'full' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                                onClick={() => handleVersionSwitch('full')}
                              >
                                炫彩版
                              </button>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center space-x-2"
                                onClick={() => handleReloadCurrentVersion()}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>重新加载当前版本</span>
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {getCurrentVersion() === 'lite' ? '当前为轻量版，适合低端设备' : '当前为炫彩版，功能更丰富'}
                            </p>
                          </div>
                        </div>

                        {/* 通知设置 - 暂时隐藏以避免闪退问题 */}
                        {/* <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">通知设置</h4>
                            
                            {!notificationSettings.permissionGranted ? (
                              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                                <p className="text-yellow-700 dark:text-yellow-200 text-sm mb-2">
                                  通知权限未授权，需要授权后才能接收提醒
                                </p>
                                <button 
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                  onClick={handleRequestPermission}
                                >
                                  授权通知权限
                                </button>
                              </div>
                            ) : (
                              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-30 border border-green-200 dark:border-green-700 rounded-lg">
                                <p className="text-green-700 dark:text-green-200 text-sm mb-2">
                                  ✓ 通知权限已授权
                                </p>
                                <button 
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                  onClick={handleTestNotification}
                                >
                                  测试通知
                                </button>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">启用通知提醒</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">接收生物节律变化提醒</p>
                              </div>
                              <label className="inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={notificationSettings.enabled}
                                  onChange={(e) => handleNotificationChange('enabled', e.target.checked)}
                                  disabled={!notificationSettings.permissionGranted}
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                            
                            {notificationSettings.enabled && notificationSettings.permissionGranted && (
                              <div className="space-y-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-lg">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    早上提醒时间:
                                  </label>
                                  <input
                                    type="time"
                                    value={notificationSettings.morningTime}
                                    onChange={(e) => handleNotificationChange('morningTime', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    style={{width: '120px'}}
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    晚上提醒时间:
                                  </label>
                                  <input
                                    type="time"
                                    value={notificationSettings.eveningTime}
                                    onChange={(e) => handleNotificationChange('eveningTime', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    style={{width: '120px'}}
                                  />
                                </div>
                                
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  <p>• 系统会在指定时间推送节律提醒</p>
                                  <p>• 当节律值达到极值（≤-90或≥90）时，会额外推送预警提醒</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div> */}

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div className="mb-4">
                            <p className="font-medium text-gray-900 dark:text-white">API服务地址</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">设置后端服务地址</p>
                            <input
                              type="text"
                              value={apiBaseUrl}
                              onChange={handleApiBaseUrlChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="https://nice-mcp.leansoftx.com/api"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">使用本地计算</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">启用后将使用本地JavaScript计算代替API调用</p>
                            </div>
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={useLocalCalculation}
                                onChange={handleUseLocalCalculationChange}
                              />
                              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">数据同步</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">自动备份您的数据</p>
                          </div>
                          <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">缓存超时时间</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">设置数据缓存的有效时间</p>
                            <select
                              value={cacheTimeout}
                              onChange={handleCacheTimeoutChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="60000">1分钟</option>
                              <option value="120000">2分钟</option>
                              <option value="180000">3分钟</option>
                              <option value="300000">5分钟</option>
                              <option value="600000">10分钟</option>
                              <option value="1800000">30分钟</option>
                            </select>
                          </div>
                        </div>

                        {/* 更新检查设置 */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">启用自动更新检查</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">自动检查新版本并提示更新</p>
                              </div>
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={updateCheckSettings.enabled}
                                  onChange={(e) => handleUpdateCheckChange('enabled', e.target.checked)}
                                />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            {updateCheckSettings.enabled && (
                              <div className="space-y-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-3 rounded-lg">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    检查频率:
                                  </label>
                                  <select
                                    value={updateCheckSettings.checkFrequency}
                                    onChange={(e) => handleUpdateCheckChange('checkFrequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  >
                                    <option value="startup">启动时检查</option>
                                    <option value="daily">每天检查</option>
                                    <option value="weekly">每周检查</option>
                                  </select>
                                </div>

                                <div className="flex space-x-2">
                                  <button
                                    onClick={handleManualCheckUpdate}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors"
                                  >
                                    立即检查更新
                                  </button>
                                  <button
                                    onClick={handleClearCheckRecords}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
                                  >
                                    清除记录
                                  </button>
                                </div>

                                {updateCheckSettings.lastCheckTime && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    上次检查: {new Date(updateCheckSettings.lastCheckTime).toLocaleString()}
                                  </div>
                                )}

                                {updateCheckSettings.checkRecords.length > 0 && (
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    检查记录: {updateCheckSettings.checkRecords.length} 条
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* 其他设置 */}
                    <Card title="其他">
                      <div className="space-y-1">
                        <button className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg">
                          <span className="font-medium text-gray-900 dark:text-white">用户协议</span>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <button className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg">
                          <span className="font-medium text-gray-900 dark:text-white">隐私政策</span>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        <button className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg">
                          <span className="font-medium text-gray-900 dark:text-white">意见反馈</span>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === 'userConfigs' && (
                  <div>
                    <UserConfigManager />
                  </div>
                )}

                {activeTab === 'about' && (
                  <div>
                    <Card title="关于">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <p className="font-medium text-gray-900 dark:text-white">应用版本</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{appVersion.version} ({appVersion.build})</p>
                        </div>

                        <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="font-medium text-gray-900 dark:text-white">运行平台</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {platformInfo.isNative ?
                              (platformInfo.isAndroid ? 'Android' : (platformInfo.isIOS ? 'iOS' : 'Native')) :
                              'Web'
                            }
                          </p>
                        </div>

                        <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="font-medium text-gray-900 dark:text-white">开发团队</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Nice Today</p>
                        </div>

                        {/* 性能测试工具 */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <PerformanceTestTool />
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>

              {/* 仅在原生应用中显示的重置按钮 */}
              {platformInfo.isNative && (
                <Button
                  variant="danger"
                  className="w-full py-3 mt-6"
                >
                  重置应用数据
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

export default SettingsPage;