import { useTheme } from '../context/ThemeContext';
import HuangliComponent from '../components/HuangliComponent';

const HuangliPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen pb-safe-bottom w-full max-w-full ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'
    }`}>
      {/* 顶部导航栏 - 优化版 */}
      {/* <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 h-[60px]">
        <div className="flex items-center justify-between px-4 h-full max-w-full overflow-hidden">
          {/* <div className="flex flex-col min-w-0"> */}
            {/* <h1 className="text-lg sm:text-xl font-bold truncate whitespace-nowrap text-gray-900 dark:text-white">
              黄历择吉
            </h1> */}
            {/* <div className="text-sm sm:text-base opacity-70 text-gray-600 dark:text-gray-400 truncate">
              传统历法智慧
            </div> */}
          {/* </div> */}
        {/* </div>
      </div> */} 

      {/* 主内容区 - 优化版 */}
      <div 
        className="w-full max-w-full mx-auto overflow-hidden"
        style={{ 
          padding: '2px 5px',
          boxSizing: 'border-box',
          maxWidth: '100vw',
          overflowX: 'hidden',
          wordWrap: 'break-word',
          overflowWrap: 'break-word'
        }}
      >
        {/* 黄历组件 */}
        <div 
          className="w-full max-w-full overflow-hidden"
          style={{
            width: '100%',
            maxWidth: '100vw',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            overflowY: 'auto'
          }}
        >
          <HuangliComponent />
        </div>
      </div>
    </div>
  );
};

export default HuangliPage;