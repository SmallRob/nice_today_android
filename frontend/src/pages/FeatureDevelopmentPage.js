import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const FeatureDevelopmentPage = () => {
  const [searchParams] = useSearchParams();
  const [featureInfo, setFeatureInfo] = useState({
    feature: '功能',
    link: '#'
  });

  useEffect(() => {
    const feature = searchParams.get('feature') || '该功能';
    const link = searchParams.get('link') || '#';
    setFeatureInfo({ feature, link });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-pink-900/30 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white">🏗️</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {featureInfo.feature}开发中
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          您所访问的「{featureInfo.feature}」功能正在紧锣密鼓地开发中，敬请期待！
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-semibold">开发进度：</span>
            <span className="block mt-1">📋 需求分析 • 🔧 系统设计 • 🧪 功能开发</span>
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            返回上一页
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureDevelopmentPage;