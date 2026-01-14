import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import TiebanshenshuPageContent from './TiebanshenshuPage';
import PlumBlossomPageContent from './PlumBlossomDivination';
import QimenDunjiaPageContent from './QimenDunjiaPage';

/**
 * 简单易学页面
 * 整合铁板神数和梅花易数功能
 */
const SimpleIChingPage = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('tiebanshenshu');

  return (
    <div className={`min-h-screen pb-24 safe-area-bottom ${theme === 'dark' ? 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950' : 'bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50'}`}>
      
      {/* 精美 Banner */}
      <div className={`relative overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'} text-white`}>
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
            {/* 八卦图案 */}
            <div className="mb-4 md:mb-6">
              <svg className="w-24 h-24 md:w-32 md:h-32 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                {/* 外圈 */}
                <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" />
                {/* 中心太极图 */}
                <path d="M50 5 A45 45 0 0 1 50 95 A45 45 0 0 1 50 5" fill="rgba(255,255,255,0.3)" />
                <path d="M50 5 A45 45 0 0 0 50 95" fill="rgba(0,0,0,0.2)" />
                <circle cx="50" cy="27.5" r="6" fill="rgba(0,0,0,0.3)" />
                <circle cx="50" cy="72.5" r="6" fill="rgba(255,255,255,0.5)" />
                {/* 八卦方位 */}
                <g fontSize="10" fill="rgba(255,255,255,0.8)" textAnchor="middle" dominantBaseline="middle">
                  <text x="50" y="8">乾</text>
                  <text x="50" y="92">坤</text>
                  <text x="8" y="50">震</text>
                  <text x="92" y="50">巽</text>
                  <text x="20" y="20">艮</text>
                  <text x="80" y="20">兑</text>
                  <text x="20" y="80">坎</text>
                  <text x="80" y="80">离</text>
                </g>
              </svg>
            </div>

            <h1 className={`text-3xl md:text-5xl font-bold mb-3 md:mb-4 ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
              简单易学
            </h1>
            <p className={`text-base md:text-lg mb-2 opacity-90 ${theme === 'dark' ? 'text-indigo-200' : 'text-indigo-100'}`}>
              铁板神数 · 梅花易数
            </p>
            <p className={`text-sm md:text-base opacity-80 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-white'}`}>
              传承千年易学智慧，以数起卦，观象明理
            </p>
          </div>

          {/* 特性标签 */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-4 md:mt-6">
            {[
              { icon: '🧮', text: '数术推演' },
              { icon: '🎯', text: '精准占卜' },
              { icon: '📜', text: '易学传承' },
              { icon: '💫', text: '观象明理' }
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
            fill={theme === 'dark' ? '#111827' : '#F3F4F6'}
          />
        </svg>
      </div>

      {/* 标签切换 */}
      <div className="container mx-auto px-4 -mt-4 md:-mt-6 relative z-20">
        <div className={`flex bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border ${theme === 'dark' ? 'border-gray-600' : 'border-indigo-300'}`}>
          <button
            onClick={() => setActiveTab('tiebanshenshu')}
            className={`flex-1 py-3 md:py-4 text-center transition-all duration-300 font-medium ${activeTab === 'tiebanshenshu'
              ? (theme === 'dark' ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gradient-to-r from-amber-500 to-orange-500') + ' text-white shadow-lg'
              : (theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50')
            }`}
          >
            <span className="text-lg md:text-xl mr-2">🧮</span>
            <span className="text-sm md:text-base">铁板神数</span>
          </button>
          <button
            onClick={() => setActiveTab('meihua')}
            className={`flex-1 py-3 md:py-4 text-center transition-all duration-300 font-medium ${activeTab === 'meihua'
              ? (theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-purple-500 to-pink-500') + ' text-white shadow-lg'
              : (theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50')
            }`}
          >
            <span className="text-lg md:text-xl mr-2">🌸</span>
            <span className="text-sm md:text-base">梅花易数</span>
          </button>
          <button
            onClick={() => setActiveTab('qimen')}
            className={`flex-1 py-3 md:py-4 text-center transition-all duration-300 font-medium ${activeTab === 'qimen'
              ? (theme === 'dark' ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-red-500 to-orange-500') + ' text-white shadow-lg'
              : (theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50')
            }`}
          >
            <span className="text-lg md:text-xl mr-2">🎯</span>
            <span className="text-sm md:text-base">奇门遁甲</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        {activeTab === 'tiebanshenshu' ? <TiebanshenshuPageContent /> : activeTab === 'meihua' ? <PlumBlossomPageContent /> : <QimenDunjiaPageContent />}
      </div>

      {/* 底部说明 */}
      <div className="container mx-auto px-4 py-8">
        <div className={`rounded-2xl p-4 md:p-6 text-center ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-indigo-200'}`}>
          <h3 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-800'}`}>
            易学提示
          </h3>
          <div className={`text-sm md:text-base space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>• 易学为中华传统文化的瑰宝，包含丰富的哲学思想和占卜方法</p>
            <p>• 铁板神数以八字为基础，通过皇极起数法推算命运条文</p>
            <p>• 梅花易数以数起卦，观象明理，是重要的易学分支</p>
            <p>• 本工具为模拟演示，结果仅供文化学习和参考</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleIChingPage;
