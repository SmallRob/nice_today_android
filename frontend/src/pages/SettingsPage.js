import React, { useState, useEffect, useCallback } from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import PerformanceTestTool from '../components/PerformanceTestTool';
import UserConfigManager from '../components/UserConfigManager';
import { getAppVersion } from '../utils/capacitor';
import { Capacitor } from '@capacitor/core';
import PageLayout, { Card, Button } from '../components/PageLayout';
import '../index.css';

function SettingsPage() {
  // 从URL查询参数获取当前标签
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'app';
  
  const [appVersion, setAppVersion] = useState({ version: 'v1.0.0', build: 'web' });
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
  const [tabTransition, setTabTransition] = useState(false);
  const [error, setError] = useState(null);

  // 优化标签切换函数
  const handleTabChange = useCallback((tab) => {
    if (tab === activeTab || tabTransition) return;
    
    setTabTransition(true);
    
    // 更新URL参数
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('tab', tab);
    window.history.replaceState({}, '', newUrl);
    
    // 延迟切换标签，添加动画效果
    setTimeout(() => {
      setActiveTab(tab);
      setTabTransition(false);
    }, 150);
  }, [activeTab, tabTransition]);

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

  if (!isLoaded) {
    return (
      <PageLayout title="设置">
        <div className="max-w-4xl mx-auto">
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
      </PageLayout>
    );
  }

  return (
    <PageLayout title="设置">
      <div className="max-w-4xl mx-auto">
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}
        
        {/* 标签导航 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 mb-6 overflow-hidden">
          <div className="flex">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-all duration-200 relative ${
                activeTab === 'app'
                  ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${tabTransition ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleTabChange('app')}
              disabled={tabTransition}
            >
              应用设置
              {activeTab === 'app' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
              )}
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-all duration-200 relative ${
                activeTab === 'userConfigs'
                  ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${tabTransition ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleTabChange('userConfigs')}
              disabled={tabTransition}
            >
              用户配置
              {activeTab === 'userConfigs' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
              )}
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-all duration-200 relative ${
                activeTab === 'about'
                  ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${tabTransition ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleTabChange('about')}
              disabled={tabTransition}
            >
              关于
              {activeTab === 'about' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
              )}
            </button>
          </div>
        </div>
        
        {/* 标签内容 */}
        <div className="space-y-6">
          <div className={`transition-all duration-300 ${tabTransition ? 'opacity-50' : 'opacity-100'}`}>
            {activeTab === 'app' && (
              <div className="space-y-6">
                {/* 性能测试工具 */}
                <PerformanceTestTool />
                
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
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">通知提醒</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">接收生物节律变化提醒</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
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
              <div className="transition-all duration-300 transform">
                <UserConfigManager />
              </div>
            )}
            
            {activeTab === 'about' && (
              <div className="transition-all duration-300 transform">
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
                  </div>
                </Card>
              </div>
            )}
          </div>
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
    </PageLayout>
  );
}

export default SettingsPage;