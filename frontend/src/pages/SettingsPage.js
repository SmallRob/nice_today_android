import React, { useState, useEffect } from 'react';
import DarkModeToggle from '../components/DarkModeToggle';
import { getAppVersion } from '../utils/capacitor';
import { Capacitor } from '@capacitor/core';
import PageLayout, { Card, Button } from '../components/PageLayout';
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
    <PageLayout title="设置">
      <div className="max-w-lg mx-auto space-y-6">
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
          </div>
        </Card>
        
        {/* 关于部分 */}
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
        
        {/* 仅在原生应用中显示的重置按钮 */}
        {platformInfo.isNative && (
          <Button 
            variant="danger" 
            className="w-full py-3"
          >
            重置应用数据
          </Button>
        )}
      </div>
    </PageLayout>
  );
}

export default SettingsPage;