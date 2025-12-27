/**
 * 生物节律Banner组件
 * 简化的Banner组件，减少嵌套层级
 */
import React from 'react';

const BiorhythmBanner = () => {
  return (
    <div className="taoist-wuxing-banner text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 flex-shrink-0">
      {/* 合并背景渐变 */}
      <div className="absolute inset-0 wuxing-gradient z-0 bg-gradient-to-r from-blue-500/30 via-purple-600/30 to-indigo-700/30" />
      
      {/* 道家装饰符号 - 简化SVG结构 */}
      <svg 
        className="absolute top-2 left-2 w-12 h-12 opacity-15" 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor"
      >
        <circle cx="50" cy="50" r="45" strokeWidth="1.5" />
        <path d="M50,5 A45,45 0 1,1 50,95 A45,45 0 1,1 50,5" strokeWidth="1" />
        <circle cx="50" cy="30" r="8" fill="currentColor" />
        <circle cx="50" cy="70" r="8" strokeWidth="1.5" />
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

      {/* Banner内容 - 简化嵌套 */}
      <div className="container mx-auto px-4 py-3 md:py-6 relative z-10 text-center">
        <h1 className="text-xl md:text-2xl font-semibold mb-1 text-shadow-lg taoist-title">
          <span className="inline-block hover:scale-105 transition-transform duration-300">
            人体节律
          </span>
        </h1>
        <p className="text-white text-xs md:text-sm opacity-95 font-medium taoist-subtitle mb-2">
          天人合一·顺应自然·调和身心
        </p>
        <div className="flex items-center justify-center space-x-1 md:space-x-2">
          <Badge label="体力" color="blue" />
          <Badge label="情绪" color="purple" />
          <Badge label="智力" color="indigo" />
        </div>
      </div>
    </div>
  );
};

// Badge子组件
const Badge = ({ label }) => {
  return (
    <span className="text-[10px] md:text-xs text-white px-2 py-0.5 rounded-full border border-white/20">
      {label}
    </span>
  );
};

export default React.memo(BiorhythmBanner);
