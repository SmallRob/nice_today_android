import React from 'react';
import { Card } from '../components/PageLayout';
import '../index.css';

function MoreFeaturesPage() {

  const handleFeatureClick = (path) => {
    window.location.href = path;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 顶部标题区域 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">更多功能</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">发现应用的所有功能</p>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="space-y-6">
            <Card>
              <div className="text-center p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 rounded-lg text-white relative">
                <div className="text-5xl mb-3">🔮</div>
                <h2 className="text-2xl font-bold mb-2">塔罗花园</h2>
                <p className="text-purple-100 hidden md:block">探索神秘的塔罗世界，聆听命运的指引</p>
                <button
                  onClick={() => handleFeatureClick('/tarot-garden')}
                  className="absolute bottom-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md text-sm transition-all"
                >
                  进入 →
                </button>
              </div>
            </Card>

            <Card>
              <div className="text-center p-6 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-600 rounded-lg text-white relative">
                <div className="text-5xl mb-3">👤</div>
                <h2 className="text-2xl font-bold mb-2">用户配置</h2>
                <p className="text-blue-100 hidden md:block">管理您的个人信息和偏好设置</p>
                <button
                  onClick={() => handleFeatureClick('/user-config')}
                  className="absolute bottom-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md text-sm transition-all"
                >
                  进入 →
                </button>
              </div>
            </Card>

            <Card>
              <div className="text-center p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 rounded-lg text-white relative">
                <div className="text-5xl mb-3">🌸</div>
                <h2 className="text-2xl font-bold mb-2">邵雍易学</h2>
                <p className="text-indigo-100 hidden md:block">梅花易数与铁板神数的智慧融合，探索古法占卜</p>
                <button
                  onClick={() => handleFeatureClick('/shaoyong-yixue')}
                  className="absolute bottom-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md text-sm transition-all"
                >
                  进入 →
                </button>
              </div>
            </Card>

            <Card>
              <div className="text-center p-6 bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 rounded-lg text-white relative">
                <div className="text-5xl mb-3">⚙️</div>
                <h2 className="text-2xl font-bold mb-2">系统设置</h2>
                <p className="text-gray-100 hidden md:block">配置应用系统参数和高级选项</p>
                <button
                  onClick={() => handleFeatureClick('/settings')}
                  className="absolute bottom-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md text-sm transition-all"
                >
                  进入 →
                </button>
              </div>
            </Card>

            <Card>
              <div className="py-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💡 快速访问</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => window.location.href = '/tarot'}
                    className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="text-2xl mb-2">🎴</div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">塔罗牌占卜</p>
                  </button>
                  <button
                    onClick={() => window.location.href = '/numerology'}
                    className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="text-2xl mb-2">🔢</div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">数字之灵</p>
                  </button>
                  <button
                    onClick={() => window.location.href = '/life-matrix'}
                    className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="text-2xl mb-2">🌐</div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">生命矩阵</p>
                  </button>
                  <button
                    onClick={() => window.location.href = '/settings'}
                    className="bg-gray-50 dark:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded-lg p-4 text-left transition-colors"
                  >
                    <div className="text-2xl mb-2">⚙️</div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">系统设置</p>
                  </button>
                </div>
              </div>
            </Card>

            <Card>
              <div className="py-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  更多功能正在开发中，敬请期待...
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoreFeaturesPage;
