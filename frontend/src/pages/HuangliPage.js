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
      {/* 为黄历页面添加独立样式，避免全局样式冲突 */}
      <style>{`
        .huangli-page-container {
          width: 100% !important;
          max-width: 100vw !important;
          padding: 2px 5px !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        
        .huangli-component-wrapper {
          width: 100% !important;
          max-width: 100vw !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
        }
        
        /* 确保月历网格布局正确 */
        .huangli-component .grid.grid-cols-7 {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
          gap: 0.125rem !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        
        /* 日期单元格样式 */
        .huangli-component .touch-target {
          aspect-ratio: 1 !important;
          min-width: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        
        /* 月份导航样式 */
        .month-nav-container {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin-bottom: 0.25rem !important;
        }
        
        .month-display {
          text-align: center !important;
          font-weight: 600 !important;
          padding: 0 0.25rem !important;
          flex: 1 !important;
          min-width: 0 !important;
          overflow: hidden !important;
          white-space: nowrap !important;
          text-overflow: ellipsis !important;
        }
      `}</style>
      
      {/* 主内容区 - 优化版 */}
      <div 
        className="huangli-page-container"
      >
        {/* 黄历组件 */}
        <div 
          className="huangli-component-wrapper"
        >
          <HuangliComponent />
        </div>
      </div>
    </div>
  );
};

export default HuangliPage;