/**
 * 奇门遁甲页面
 * 整合计算器和历史记录功能
 */

import React, { useState } from 'react';
import QimenDunjiaCalculator from '../components/features/QimenDunjiaCalculator';
import QimenHistory from '../components/features/QimenHistory';
import { useTheme } from '../context/ThemeContext';

const QimenDunjiaPage = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className={`min-h-screen pb-24 safe-area-bottom ${theme === 'dark' ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950' : 'bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50'}`}>
      
      {/* 精美 Banner */}
      <div className={`relative overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-r from-amber-900 via-orange-900 to-red-900' : 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600'} text-white`}>
        {/* 装饰性背景图案 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-yellow-300 rounded-full blur-2xl"></div>
          <div className="absolute top-1/4 right-1/3 w-16 h-16 bg-pink-300 rounded-full blur-xl"></div>
        </div>

        {/* Banner 内容 */}
        <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            {/* 奇门遁甲标题 */}
            <div className="mb-4 md:mb-6">
              <svg className="w-24 h-24 md:w-32 md:h-32 mx-auto" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradient-qimen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                {/* 外圈 */}
                <circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none" />
                {/* 八卦图案 */}
                <g fontSize="16" fill="rgba(255,255,255,0.8)" textAnchor="middle" dominantBaseline="middle">
                  <text x="100" y="20">乾</text>
                  <text x="100" y="180">坤</text>
                  <text x="20" y="100">震</text>
                  <text x="180" y="100">巽</text>
                  <text x="40" y="40">艮</text>
                  <text x="160" y="40">兑</text>
                  <text x="40" y="160">坎</text>
                  <text x="160" y="160">离</text>
                </g>
                {/* 中心太极图 */}
                <path d="M100 10 A90 90 0 0 1 100 190 A90 90 0 0 1 100 10" fill="rgba(255,255,255,0.2)" />
                <path d="M100 10 A90 90 0 0 0 100 190" fill="rgba(0,0,0,0.3)" />
                <circle cx="100" cy="55" r="12" fill="rgba(0,0,0,0.4)" />
                <circle cx="100" cy="145" r="12" fill="rgba(255,255,255,0.4)" />
              </svg>
            </div>

            <h1 className={`text-3xl md:text-5xl font-bold mb-3 md:mb-4 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
              奇门遁甲
            </h1>
            <p className={`text-base md:text-lg mb-2 opacity-90 ${theme === 'dark' ? 'text-amber-200' : 'text-amber-100'}`}>
              千古绝学奇术
            </p>
            <p className={`text-sm md:text-base opacity-80 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-white'}`}>
              鉴本命，遁甲掌先机，八门控福运
            </p>
          </div>

          {/* 特性标签 */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-4 md:mt-6">
            {[
              { icon: '🧮', text: '本命分析' },
              { icon: '💼', text: '事业财禄' },
              { icon: '💕', text: '感情婚姻' },
              { icon: '🌟', text: '五年运程' },
              { icon: '🎯', text: '奇门增运' }
            ].map((tag, index) => (
              <span 
                key={index} 
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-white/20 text-white'}`}
              >
                <span>{tag.icon}</span>
                <span>{tag.text}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 底部波浪装饰 */}
        <svg className="absolute bottom-0 left-0 w-full h-8 md:h-12" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path 
            d="M0,96 C240,64 480,96 720,64 C960,96 1200,64 1440,96 L1440,120 L0,120 Z" 
            fill={theme === 'dark' ? '#111827' : '#FEF3C7'}
          />
        </svg>
      </div>

      {/* 标签切换 */}
      <div className="container mx-auto px-4 -mt-4 md:-mt-6 relative z-20">
        <div className={`flex bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border ${theme === 'dark' ? 'border-gray-600' : 'border-amber-300'}`}>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-3 md:py-4 text-center transition-all duration-300 font-medium ${activeTab === 'calculator'
              ? (theme === 'dark' ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gradient-to-r from-amber-500 to-orange-500') + ' text-white shadow-lg'
              : (theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50')
            }`}
          >
            <span className="text-lg md:text-xl mr-2">🧮</span>
            <span className="text-sm md:text-base">开始计算</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 md:py-4 text-center transition-all duration-300 font-medium ${activeTab === 'history'
              ? (theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-purple-500 to-pink-500') + ' text-white shadow-lg'
              : (theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50')
            }`}
          >
            <span className="text-lg md:text-xl mr-2">📜</span>
            <span className="text-sm md:text-base">历史记录</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        {activeTab === 'calculator' ? <QimenDunjiaCalculator /> : <QimenHistory />}
      </div>

      {/* 底部说明 */}
      <div className="container mx-auto px-4 py-8">
        <div className={`rounded-2xl p-4 md:p-6 text-center ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-amber-200'}`}>
          <h3 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-800'}`}>
            奇门遁甲提示
          </h3>
          <div className={`text-sm md:text-base space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>• 奇门遁甲是中国古代重要的术数之一，包含丰富的哲学思想和预测方法</p>
            <p>• 通过阴阳五行、天干地支等元素，分析时空变化对人生的影响</p>
            <p>• 本工具为模拟演示，结果仅供文化学习和参考</p>
            <p>• 请理性看待测算结果，以积极心态面对人生挑战</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QimenDunjiaPage;