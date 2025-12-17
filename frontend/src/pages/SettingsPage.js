import React, { useState, useEffect } from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import { getAppVersion } from '../utils/capacitor';
import { Capacitor } from '@capacitor/core';
import '../index.css';

function SettingsPage() {
  const [appVersion, setAppVersion] = useState({ version: 'v1.0.0', build: 'web' });
  const [platformInfo, setPlatformInfo] = useState({
    platform: 'web',
    isNative: false,
    isAndroid: false,
    isIOS: false
  });
  const [apiBaseUrl, setApiBaseUrl] = useState('https://nice-mcp.leansoftx.com/api');
  const [useLocalCalculation, setUseLocalCalculation] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadAppInfo = async () => {
      try {
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
        const savedApiUrl = localStorage.getItem('apiBaseUrl');
        if (savedApiUrl) {
          setApiBaseUrl(savedApiUrl);
        }
        
        const savedUseLocal = localStorage.getItem('useLocalCalculation');
        if (savedUseLocal) {
          setUseLocalCalculation(savedUseLocal === 'true');
        }
      } catch (error) {
        console.error('Error loading app info:', error);
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

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 w-8 bg-green-500 rounded-full mx-auto mb-2"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">正在加载设置...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 pb-safe-bottom">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">设置</h1>
        
        {/* 应用设置部分 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">应用设置</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">深色模式</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">切换应用的视觉主题</p>
                </div>
                <DarkModeToggle />
              </div>
            </div>
            
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">通知提醒</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">接收生物节律变化提醒</p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-4">
                <div>
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
                
                <div className="flex items-center justify-between pt-2">
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
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">数据同步</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">自动备份您的数据</p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={true} />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* 关于部分 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">关于</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-white">应用版本</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{appVersion.version} ({appVersion.build})</p>
              </div>
            </div>
            
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-white">运行平台</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {platformInfo.isNative ? 
                    (platformInfo.isAndroid ? 'Android' : (platformInfo.isIOS ? 'iOS' : 'Native')) : 
                    'Web'
                  }
                </p>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-white">开发团队</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nice Today</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 其他设置 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">其他</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <button className="w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="font-medium text-gray-900 dark:text-white">用户协议</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button className="w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="font-medium text-gray-900 dark:text-white">隐私政策</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="font-medium text-gray-900 dark:text-white">意见反馈</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 仅在原生应用中显示的重置按钮 */}
        {platformInfo.isNative && (
          <div className="mt-8">
            <button className="w-full py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium">
              重置应用数据
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;