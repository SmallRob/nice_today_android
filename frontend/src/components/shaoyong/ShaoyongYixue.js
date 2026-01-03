import { useState, useEffect } from 'react';

const ShaoyongYixue = () => {
  const [theme, setTheme] = useState('dark'); // light | dark

  // 主题切换 - update Tailwind theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 主题切换函数
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

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
      isImplemented: false
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
    <div className={`min-h-screen transition-all duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* 头部导航 */}
      <header className={`py-6 ${theme === 'dark' ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} relative overflow-hidden`}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">简单易学</h1>
            <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>传统易学 • 简单入门 • 深入实践</p>
          </div>

          <div className="flex items-center">
            <button
              className={`p-3 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors duration-300`}
              onClick={toggleTheme}
              title={`切换到${theme === 'dark' ? '浅色' : '深色'}主题`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>


      </header>

      {/* 主要内容区域 */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {easyLearnLinks.map((item) => (
            <div 
              key={item.id}
              className={`rounded-2xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } ${item.color}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">{item.icon}</div>
                <h3 className="text-xl font-bold">{item.title}</h3>
              </div>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{item.description}</p>
              <button 
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
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
      <footer className={`py-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
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