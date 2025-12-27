/**
 * AppBanner组件 - 首页顶部横幅
 * 显示应用名称和图标
 */
import niceDayImage from '../../images/nice_day.png';

const AppBanner = () => {
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
      <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
        <div className="flex items-center justify-center space-x-4">
          {/* 应用图标 */}
          <img
            src={niceDayImage}
            alt="Nice Today"
            className="w-16 h-16 md:w-20 md:h-20 rounded-xl shadow-lg"
          />

          {/* 应用名称 */}
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-shadow-lg">
              Nice Today
            </h1>
            <p className="text-sm md:text-base opacity-95 font-medium">
              探索运势·了解自己·精彩每一天
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppBanner;
