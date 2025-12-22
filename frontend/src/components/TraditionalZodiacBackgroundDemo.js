import React, { memo } from 'react';
import TraditionalZodiacBackground from './TraditionalZodiacBackground';
import ChineseZodiacSelector from './ChineseZodiacSelector';
import { useTheme } from '../context/ThemeContext';

const TraditionalZodiacBackgroundDemo = memo(() => {
  const { theme } = useTheme();

  return (
    <TraditionalZodiacBackground className="min-h-screen p-4">
      {/* 演示内容 */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            传统生肖八字运程风格装饰背景
          </h1>
          <p className="text-white/90 text-lg mb-6 drop-shadow-md">
            融合十二生肖、八字命盘、五行相生相克和流年运势方位指示的传统装饰风格
          </p>
        </div>

        {/* 功能演示区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 左侧：生肖选择器演示 */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              十二生肖选择器
            </h2>
            <ChineseZodiacSelector
              selectedZodiac="鼠"
              onZodiacChange={() => {}}
              size="lg"
              showLabels={true}
              gridLayout="4"
            />
          </div>

          {/* 右侧：功能说明 */}
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              传统元素特色
            </h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                <span className="text-gray-700 dark:text-gray-300">十二生肖图案环绕</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                <span className="text-gray-700 dark:text-gray-300">八字命盘布局</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                <span className="text-gray-700 dark:text-gray-300">五行相生相克关系图</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                <span className="text-gray-700 dark:text-gray-300">流年运势方位指示</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                <span className="text-gray-700 dark:text-gray-300">祥云、铜钱、八卦纹样</span>
              </div>
            </div>
          </div>
        </div>

        {/* 色彩搭配展示 */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            中国传统色彩搭配
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-full h-16 bg-[#8b0000] rounded-lg mb-2"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">朱红</span>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-[#8b4513] rounded-lg mb-2"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">赭石</span>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-[#daa520] rounded-lg mb-2"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">金黄</span>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-[#ffd700] rounded-lg mb-2"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">明黄</span>
            </div>
            <div className="text-center">
              <div className="w-full h-16 bg-[#1e90ff] rounded-lg mb-2"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">靛青</span>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            使用说明
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              这个传统生肖八字运程风格的装饰背景组件专为命理应用设计，包含丰富的传统元素：
            </p>
            <ul className="text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>十二生肖图案</strong>：动态环绕，展示传统生肖文化</li>
              <li><strong>八字命盘布局</strong>：模拟传统命盘结构，展示天干地支</li>
              <li><strong>五行关系图</strong>：展示五行相生相克的传统哲学</li>
              <li><strong>方位指示</strong>：体现传统风水中的方位概念</li>
              <li><strong>传统纹样</strong>：祥云、铜钱、八卦等吉祥图案</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              该组件支持深色/浅色主题切换，并具有响应式设计，适配各种屏幕尺寸。
            </p>
          </div>
        </div>
      </div>
    </TraditionalZodiacBackground>
  );
});

TraditionalZodiacBackgroundDemo.displayName = 'TraditionalZodiacBackgroundDemo';

export default TraditionalZodiacBackgroundDemo;