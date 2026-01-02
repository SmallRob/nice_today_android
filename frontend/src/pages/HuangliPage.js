import { useTheme } from '../context/ThemeContext';
import HuangliComponent from '../components/HuangliComponent';

const HuangliPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'
    }`}>
      {/* 导航栏 */}
      <div className={`sticky top-0 z-40 ${
        theme === 'dark' 
          ? 'bg-gray-800/90 backdrop-blur-md border-b border-gray-700' 
          : 'bg-white/90 backdrop-blur-md border-b border-gray-200'
      }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              黄历择吉
            </h1>
            <div className="text-sm opacity-70">
              传统历法智慧
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* <div className="mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            传统黄历
          </h2>
          <p className={`${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            查看每日黄历信息，选择吉日进行重要活动
          </p>
        </div> */}

        {/* 黄历组件 */}
        <HuangliComponent />
      </div>
    </div>
  );
};

export default HuangliPage;