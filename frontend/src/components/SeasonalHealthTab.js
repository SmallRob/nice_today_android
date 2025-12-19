import React, { useState, useEffect, useMemo } from 'react';
import { seasonHealthTips, organRhythmTips, seasonGeneralTips } from '../config/healthTipsConfig';

// 时令养生标签页组件
const SeasonalHealthTab = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('season'); // 'season' 或 'organ'

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  // 获取当前季节信息
  const getCurrentSeason = useMemo(() => {
    const month = currentTime.getMonth() + 1;
    const day = currentTime.getDate();
    
    if ((month === 2 && day >= 4) || month === 3 || month === 4 || (month === 5 && day < 5)) {
      return seasonHealthTips["春"];
    } else if ((month === 5 && day >= 5) || month === 6 || month === 7 || (month === 8 && day < 7)) {
      return seasonHealthTips["夏"];
    } else if ((month === 8 && day >= 7) || (month === 9 && day < 7)) {
      return seasonHealthTips["长夏"];
    } else if ((month === 9 && day >= 7) || month === 10 || (month === 11 && day < 7)) {
      return seasonHealthTips["秋"];
    } else {
      return seasonHealthTips["冬"];
    }
  }, [currentTime]);

  // 获取当前器官节律信息
  const getCurrentOrganInfo = useMemo(() => {
    const hour = currentTime.getHours();
    const index = Math.floor((hour + 1) / 2) % 12;
    
    return {
      time: organRhythmTips.organTimes[index],
      organ: organRhythmTips.organs[index],
      description: organRhythmTips.organDescriptions[organRhythmTips.organs[index]] || "",
      suggestion: organRhythmTips.organSuggestions[organRhythmTips.organs[index]] || "",
      healthTip: organRhythmTips.organHealthTips[organRhythmTips.organs[index]] || ""
    };
  }, [currentTime]);

  // 季节颜色映射
  const seasonColors = {
    "春": { bg: "bg-green-50 dark:bg-green-900 dark:bg-opacity-20", border: "border-green-200 dark:border-green-700", text: "text-green-800 dark:text-green-300" },
    "夏": { bg: "bg-red-50 dark:bg-red-900 dark:bg-opacity-20", border: "border-red-200 dark:border-red-700", text: "text-red-800 dark:text-red-300" },
    "长夏": { bg: "bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20", border: "border-yellow-200 dark:border-yellow-700", text: "text-yellow-800 dark:text-yellow-300" },
    "秋": { bg: "bg-gray-50 dark:bg-gray-700", border: "border-gray-200 dark:border-gray-600", text: "text-gray-800 dark:text-gray-300" },
    "冬": { bg: "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20", border: "border-blue-200 dark:border-blue-700", text: "text-blue-800 dark:text-blue-300" }
  };

  // 五行颜色映射
  const elementColors = {
    "木": "bg-green-500",
    "火": "bg-red-500", 
    "土": "bg-yellow-500",
    "金": "bg-gray-500",
    "水": "bg-blue-500"
  };



  return (
    <div className="space-y-3 md:space-y-4">
      {/* 页面标题 - 移动端优化 */}
      <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-lg p-3 md:p-4">
        <h2 className="text-lg md:text-xl font-bold mb-1">时令养生指南</h2>
        <p className="text-teal-100 text-xs md:text-sm">
          根据四季五行规律和器官节律，为您提供个性化的养生建议
        </p>
      </div>

      {/* 标签切换 - 移动端优化 */}
      <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setActiveTab('season')}
          className={`flex-1 py-2 md:py-3 px-2 md:px-4 text-center transition-colors duration-200 touch-manipulation ${
            activeTab === 'season'
              ? 'bg-teal-500 text-white font-medium'
              : 'text-gray-600 dark:text-gray-300 active:bg-gray-50 dark:active:bg-gray-700'
          }`}
        >
          <span className="text-sm md:text-base">四季养生</span>
        </button>
        <button
          onClick={() => setActiveTab('organ')}
          className={`flex-1 py-2 md:py-3 px-2 md:px-4 text-center transition-colors duration-200 touch-manipulation ${
            activeTab === 'organ'
              ? 'bg-purple-500 text-white font-medium'
              : 'text-gray-600 dark:text-gray-300 active:bg-gray-50 dark:active:bg-gray-700'
          }`}
        >
          <span className="text-sm md:text-base">器官节律</span>
        </button>
      </div>

      {/* 四季养生内容 */}
      {activeTab === 'season' && (
        <div className="space-y-3 md:space-y-4">
          {/* 当前季节信息卡片 - 移动端优化 */}
          <div className={`${seasonColors[getCurrentSeason.name].bg} ${seasonColors[getCurrentSeason.name].border} border-l-4 border-teal-500 rounded-lg p-3 md:p-4`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 md:mb-3">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-1 md:mb-0">
                <span className={`w-2 h-2 md:w-3 md:h-3 ${elementColors[getCurrentSeason.element]} rounded-full mr-2`}></span>
                {getCurrentSeason.name}季养生指南
              </h3>
              <span className="px-2 py-1 md:px-3 md:py-1 bg-white dark:bg-gray-700 rounded-full text-xs md:text-sm font-medium text-teal-700 dark:text-teal-300">
                {getCurrentSeason.element}行
              </span>
            </div>
            
            {/* 季节特点 */}
            <div className="mb-2 md:mb-3">
              <h4 className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">季节特点：</h4>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {getCurrentSeason.characteristics}
              </p>
            </div>

            {/* 主令脏腑 */}
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">主令脏腑：</span>
              <span className="px-2 py-1 md:px-3 md:py-1 bg-white dark:bg-gray-700 rounded-full text-xs md:text-sm text-teal-700 dark:text-teal-300">
                {getCurrentSeason.organs}
              </span>
            </div>

            {/* 养生建议 */}
            <div>
              <h4 className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">养生建议：</h4>
              <div className="space-y-1 md:space-y-2">
                {getCurrentSeason.advice.split('\n').map((line, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-teal-500 mr-2 text-xs">•</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{line.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 四季养生小贴士 - 移动端优化 */}
          <div className="bg-teal-50 dark:bg-teal-900 dark:bg-opacity-20 border-l-4 border-teal-500 rounded-r-lg p-3 md:p-4">
            <h4 className="text-xs md:text-sm font-medium text-teal-800 dark:text-teal-300 mb-1 md:mb-2">四季养生小贴士</h4>
            <ul className="text-xs text-teal-700 dark:text-teal-300 space-y-0.5 md:space-y-1">
              {seasonGeneralTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-teal-500 mr-1 text-xs">•</span>
                  <span className="text-xs">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 器官节律内容 */}
      {activeTab === 'organ' && (
        <div className="space-y-3 md:space-y-4">
          {/* 当前器官节律信息 - 移动端优化 */}
          <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 border-l-4 border-purple-500 rounded-lg p-3 md:p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 md:mb-3">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-1 md:mb-0">
                <span className="w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-full mr-2"></span>
                当前器官节律
              </h3>
              <span className="px-2 py-1 md:px-3 md:py-1 bg-white dark:bg-gray-700 rounded-full text-xs md:text-sm font-medium text-purple-700 dark:text-purple-300">
                {getCurrentOrganInfo.time}
              </span>
            </div>

            {/* 当前器官 */}
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">当令器官：</span>
              <span className="px-2 py-1 md:px-3 md:py-1 bg-white dark:bg-gray-700 rounded-full text-xs md:text-sm font-medium text-purple-700 dark:text-purple-300">
                {getCurrentOrganInfo.organ}
              </span>
            </div>

            {/* 器官描述 */}
            <div className="mb-2 md:mb-3">
              <h4 className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">节律特点：</h4>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {getCurrentOrganInfo.description}
              </p>
            </div>

            {/* 养生建议 */}
            <div className="mb-2 md:mb-3">
              <h4 className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">养生建议：</h4>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {getCurrentOrganInfo.suggestion}
              </p>
            </div>

            {/* 健康提示 */}
            <div className="bg-purple-100 dark:bg-purple-900 dark:bg-opacity-30 rounded-lg p-2 md:p-3">
              <h5 className="text-xs md:text-sm font-medium text-purple-800 dark:text-purple-300 mb-1">健康提示：</h5>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                {getCurrentOrganInfo.healthTip}
              </p>
            </div>
          </div>

          {/* 24小时器官节律表 - 移动端优化 */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-3 md:p-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-3">
              24小时器官节律表
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2">
              {organRhythmTips.organTimes.map((time, index) => (
                <div
                  key={index}
                  className={`p-1 md:p-2 rounded-lg text-center transition-all duration-200 ${
                    getCurrentOrganInfo.organ === organRhythmTips.organs[index]
                      ? 'bg-purple-500 text-white shadow-md transform scale-105'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="text-xs font-medium">{time}</div>
                  <div className="text-xs">{organRhythmTips.organs[index]}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-2 md:mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                根据中医理论，人体器官在24小时内具有特定的活跃节律
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 温馨提示 - 移动端优化 */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg p-3 md:p-4">
        <h4 className="text-sm md:text-base font-semibold mb-1 md:mb-2 flex items-center">
          <span className="w-3 h-3 md:w-4 md:h-4 mr-1">💡</span>
          养生小贴士
        </h4>
        <div className="text-yellow-100 text-xs leading-relaxed space-y-0.5 md:space-y-1">
          <p>• 养生贵在坚持，长期坚持才能看到效果</p>
          <p>• 根据个人体质调整养生方案，不必完全照搬</p>
          <p>• 保持心情愉悦是养生的重要前提</p>
        </div>
      </div>
    </div>
  );
};

export default SeasonalHealthTab;