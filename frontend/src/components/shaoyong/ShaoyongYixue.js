import { useState, useEffect } from 'react';

const ShaoyongYixue = () => {
  // 使用系统主题设置
  const [theme, setTheme] = useState(() => {
    // 初始化时检测系统主题偏好
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    return 'dark'; // 默认值
  });

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // 初始化主题
    if (mediaQuery.matches) {
      document.documentElement.classList.add('dark');
    }

    // 监听主题变化
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // 简单易学链接数据
  const easyLearnLinks = [
    {
      id: 'meihua',
      title: '梅花易数',
      description: '以数观象，简易直观的占卜方法',
      icon: '🌸',
      color: 'bg-gradient-to-r from-pink-500 to-purple-500',
      link: '/plum-blossom',
      isImplemented: true
    },
    {
      id: 'tieban',
      title: '铁板神数',
      description: '精微数术，条文详解',
      icon: '🧮',
      color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      link: '/tiebanshenshu',
      isImplemented: true
    },
    {
      id: 'liuyao',
      title: '六爻预测',
      description: '传统占卜，灵活多变',
      icon: '筮',
      color: 'bg-gradient-to-r from-green-500 to-teal-500',
      link: '/liuyao',
      isImplemented: true
    },
    {
      id: 'qimen',
      title: '奇门遁甲',
      description: '帝王之学，时空预测',
      icon: '☰',
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      link: '/qimen',
      isImplemented: true
    },
    {
      id: 'liuren',
      title: '六壬神课',
      description: '最高预测术之一',
      icon: '☯',
      color: 'bg-gradient-to-r from-red-500 to-pink-500',
      link: '/liuren',
      isImplemented: false
    },
    {
      id: 'ziwei',
      title: '紫微斗数',
      description: '帝王之星，命理精要',
      icon: '⭐',
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      link: '/ziwei',
      isImplemented: false
    }
  ];

  return (
    <div className={`min-h-screen w-full transition-all duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`} style={{ minHeight: '-webkit-fill-available' }}>
      {/* 针对本页面的独立样式，避免全局样式冲突 */}
      <style>{`
        .shaoyong-yixue-grid {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 1.5rem !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 auto !important;
        }
        
        @media (min-width: 640px) {
          .shaoyong-yixue-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (min-width: 1024px) {
          .shaoyong-yixue-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        
        @media (max-width: 640px) {
          body { -webkit-text-size-adjust: 100%; }
        }
        
        /* 防止iOS Safari缩放 */
        input, textarea, select {
          font-size: 16px !important;
        }
      `}</style>
      {/* 头部导航 */}
      <header className={`py-6 ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} relative overflow-hidden`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-center sm:text-left w-full">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent max-w-full truncate">简单易学</h1>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} max-w-full truncate`}>传统易学 • 简单入门 • 深入实践</p>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="shaoyong-yixue-grid gap-6 w-full" style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              alignItems: 'stretch'
            }}>
          {easyLearnLinks.map((item) => (
            <div 
              key={item.id}
              className={`rounded-2xl p-4 shadow-lg transform transition-all duration-300 active:scale-[1.02] hover:shadow-xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } ${item.color}`}
              style={{ touchAction: 'manipulation' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl flex-shrink-0">{item.icon}</div>
                <h3 className="text-lg font-bold truncate max-w-[70%]">{item.title}</h3>
              </div>
              <p className={`mb-3 text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'} truncate`}>{item.description}</p>
              <button 
                className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'bg-white text-gray-900 hover:bg-gray-200' 
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
                onClick={() => {
                  if (item.isImplemented) {
                    window.location.href = item.link;
                  } else {
                    // 对于暂未实现的功能，跳转到功能开发中页面
                    window.location.href = `/feature-development?feature=${encodeURIComponent(item.title)}&link=${encodeURIComponent(item.link)}`;
                  }
                }}
              >
                立即学习
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* 底部信息 */}
      <footer className={`py-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} w-full`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2 font-medium">易学入门 - 从零开始学习传统智慧</p>
          <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            选择您感兴趣的易学分支，开始您的学习之旅
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-1">🌸 以数观象</span>
            <span className="flex items-center gap-1">🧮 以象明理</span>
            <span className="flex items-center gap-1">📜 以理知命</span>
            <span className="flex items-center gap-1">🔮 以变应变</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShaoyongYixue;