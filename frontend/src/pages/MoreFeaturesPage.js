import { useNavigate } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import '../index.css';
import '../styles/more-features.css';

function MoreFeaturesPage() {
  const navigate = useNavigate();

  // 设置页面滚动行为
  useLayoutEffect(() => {
    // 防止页面级滚动，确保滚动只在内容区域发生
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // 清理函数
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  const features = [
    {
      id: 'tarot-garden',
      title: '塔罗花园',
      description: '探索神秘的塔罗世界，聆听命运的指引',
      path: '/tarot-garden',
      gradient: 'from-purple-500 via-pink-500 to-indigo-600',
      icon: '🔮'
    },
    {
      id: 'user-config',
      title: '用户配置',
      description: '管理您的个人信息和偏好设置',
      path: '/user-config',
      gradient: 'from-blue-500 via-cyan-500 to-teal-600',
      icon: '👤'
    },
    {
      id: 'shaoyong-yixue',
      title: '邵雍易学',
      description: '梅花易数与铁板神数的智慧融合，探索古法占卜',
      path: '/shaoyong-yixue',
      gradient: 'from-indigo-500 via-purple-500 to-pink-600',
      icon: '🌸'
    },
    {
      id: 'system-settings',
      title: '系统设置',
      description: '配置应用系统参数和高级选项',
      path: '/settings',
      gradient: 'from-gray-500 via-gray-600 to-gray-700',
      icon: '⚙️'
    }
  ];

  const handleFeatureClick = (path) => {
    navigate(path);
  };

  return (
    <div className="more-features-container bg-gray-50 dark:bg-gray-900">
      {/* 顶部标题区域 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">更多功能</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">发现应用的所有功能</p>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="more-features-content">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-6">
            {features.map((feature) => (
              <div key={feature.id} className="feature-card" onClick={() => handleFeatureClick(feature.path)}>
                <div
                  className={`feature-card-inner text-center p-6 rounded-lg text-white relative bg-gradient-to-r ${feature.gradient}`}
                >
                  <div className="feature-card-icon text-5xl mb-3">{feature.icon}</div>
                  <h2 className="feature-card-title text-2xl font-bold mb-2">{feature.title}</h2>
                  <p className="feature-card-description text-white/90 hidden md:block">{feature.description}</p>
                  <button
                    className="feature-card-btn absolute bottom-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md text-sm transition-all"
                  >
                    进入 →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 快速访问提示 */}
          <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💡 快速访问</h3>
            <div className="quick-access-grid">
              <button
                onClick={() => window.location.href = '/tarot'}
                className="quick-access-item bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-left"
              >
                <div className="text-2xl mb-2">🎴</div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">塔罗牌占卜</p>
              </button>
              <button
                onClick={() => window.location.href = '/numerology'}
                className="quick-access-item bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left"
              >
                <div className="text-2xl mb-2">🔢</div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">数字之灵</p>
              </button>
              <button
                onClick={() => window.location.href = '/life-matrix'}
                className="quick-access-item bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-left"
              >
                <div className="text-2xl mb-2">🌐</div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">生命矩阵</p>
              </button>
              <button
                onClick={() => window.location.href = '/settings'}
                className="quick-access-item bg-gray-50 dark:bg-gray-700/20 hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded-lg transition-colors text-left"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">系统设置</p>
              </button>
            </div>
          </div>

          {/* 底部提示 */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>更多功能正在开发中，敬请期待...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoreFeaturesPage;
