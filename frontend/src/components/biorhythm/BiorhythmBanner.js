/**
 * 生物节律Banner组件
 * 优化暗色主题适配，参考节律趋势图样式
 */
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const BiorhythmBanner = () => {
  const { theme } = useTheme();

  // 根据主题设置渐变颜色
  const gradientColors = theme === 'dark'
    ? 'from-blue-900 via-purple-900 to-indigo-900'
    : 'from-blue-600 via-purple-600 to-indigo-700';

  const overlayColors = theme === 'dark'
    ? 'from-blue-500/10 via-purple-600/10 to-indigo-700/10'
    : 'from-blue-500/20 via-purple-600/20 to-indigo-700/20';

  return (
    <div className={`taoist-wuxing-banner text-white shadow-lg relative overflow-hidden bg-gradient-to-r ${gradientColors} flex-shrink-0 will-change-transform`}>
      {/* 动态背景渐变 */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-r ${overlayColors} pointer-events-none`} />

      {/* 节律波形装饰元素 - 参考图表样式 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full" />
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full" />
        <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full" />
      </div>

      {/* Banner内容 */}
      <div className="container mx-auto px-3 py-2 md:py-4 relative z-10 text-center">
        <h1 className="text-lg md:text-3xl font-bold mb-1.5 text-shadow-lg taoist-title">
          <span className="inline-block bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            人体节律
          </span>
        </h1>
        <p className="text-white/90 text-xs md:text-base opacity-95 font-medium taoist-subtitle mb-1.5">
          天人合一·顺应自然·调和身心
        </p>
        <div className="flex items-center justify-center gap-0.5 md:gap-2">
          <CycleBadge label="体力" color="green" period="23天" />
          <CycleBadge label="情绪" color="blue" period="28天" />
          <CycleBadge label="智力" color="purple" period="33天" />
        </div>
      </div>
    </div>
  );
};

// CycleBadge子组件 - 显示周期信息（内联显示）
const CycleBadge = ({ label, color, period }) => {
  const colorClasses = {
    green: 'from-green-400 to-green-500 border-green-300/30',
    blue: 'from-blue-400 to-blue-500 border-blue-300/30',
    purple: 'from-purple-400 to-purple-500 border-purple-300/30'
  };

  return (
    <span className={`text-[9px] sm:text-xs md:text-sm font-semibold text-white px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full border bg-gradient-to-r ${colorClasses[color]} whitespace-nowrap shadow-sm flex-shrink-0`}>
      {label}·{period}
    </span>
  );
};

export default React.memo(BiorhythmBanner);
