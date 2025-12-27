/**
 * 生物节律Banner组件
 * 简化的Banner组件，减少嵌套层级
 */
import React from 'react';

const BiorhythmBanner = () => {
  return (
    <div className="taoist-wuxing-banner text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 flex-shrink-0 will-change-transform">
      {/* 合并背景渐变 - 简化为单层 */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-500/20 via-purple-600/20 to-indigo-700/20 pointer-events-none" />

      {/* 简化的装饰元素 - 用CSS替代SVG提升性能 */}
      <div className="absolute top-3 left-3 w-8 h-8 rounded-full border-2 border-white/10 pointer-events-none" />
      <div className="absolute top-5 right-4 w-6 h-6 transform rotate-45 bg-white/5 pointer-events-none" />

      {/* Banner内容 - 简化嵌套 */}
      <div className="container mx-auto px-4 py-2.5 md:py-6 relative z-10 text-center">
        <h1 className="text-lg md:text-2xl font-semibold mb-1 text-shadow-lg taoist-title">
          <span className="inline-block">
            人体节律
          </span>
        </h1>
        <p className="text-white text-[10px] md:text-sm opacity-95 font-medium taoist-subtitle mb-2">
          天人合一·顺应自然·调和身心
        </p>
        <div className="flex items-center justify-center space-x-1.5 md:space-x-2">
          <Badge label="体力" />
          <Badge label="情绪" />
          <Badge label="智力" />
        </div>
      </div>
    </div>
  );
};

// Badge子组件
const Badge = ({ label }) => {
  return (
    <span className="text-[9px] md:text-xs text-white px-2 py-0.5 rounded-full border border-white/20 whitespace-nowrap">
      {label}
    </span>
  );
};

export default React.memo(BiorhythmBanner);
