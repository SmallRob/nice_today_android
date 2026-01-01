/**
 * AppBanner组件 - 首页顶部横幅
 * 显示应用名称和图标
 */
import niceDayImage from '../../images/nice_day.png';
import { useNavigate } from 'react-router-dom';

const AppBanner = () => {
  const navigate = useNavigate();

  const handleSwitchToOldVersion = () => {
    // 跳转到旧版炫彩版主页
    navigate('/old-dashboard');
  };

  return (
    <div className="app-banner text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 flex-shrink-0">
      {/* 背景渐变装饰 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-600/30 to-indigo-700/30" />

      {/* 装饰性SVG */}
      <svg
        className="absolute top-2 left-2 w-12 h-12 opacity-15"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="50" cy="50" r="45" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="30" strokeWidth="1" />
        <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.3" />
      </svg>

      <svg
        className="absolute bottom-2 right-2 w-14 h-14 opacity-15"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
      >
        <path d="M50,10 L90,50 L50,90 L10,50 Z" strokeWidth="2" />
        <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.3" />
      </svg>

      {/* Banner内容 */}
      <div className="container mx-auto relative z-10 px-4">
        <div className="flex items-center justify-start sm:justify-center space-x-2 md:space-x-4 py-2 md:py-3">
          {/* 应用图标 */}
          <img
            src={niceDayImage}
            alt="Nice Today"
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg shadow-md flex-shrink-0"
          />

          {/* 应用名称 */}
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black mb-0.5 text-shadow-xl tracking-tight leading-tight truncate max-w-[150px] sm:max-w-none">
              Nice Today
            </h1>
            <p className="text-[10px] sm:text-xs md:text-sm opacity-95 font-medium leading-tight truncate max-w-[180px] sm:max-w-none">
              探索运势·了解自己·精彩每一天
            </p>
          </div>
        </div>

        {/* 回到旧版主页链接 - 右上角 */}
        <button
          onClick={handleSwitchToOldVersion}
          className="absolute top-2 right-2 text-[10px] sm:top-3 sm:right-3 sm:text-xs md:text-sm text-gray-700 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center space-x-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 hover:from-gray-300 hover:to-gray-300 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full z-20 font-bold"
          title="回到旧版炫彩版主页"
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="hidden sm:inline">回到旧版主页</span>
          <span className="inline sm:hidden">旧版</span>
        </button>
      </div>
    </div>
  );
};

export default AppBanner;
