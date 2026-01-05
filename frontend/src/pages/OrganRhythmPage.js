import React, { useState, useEffect, useMemo } from 'react';
import { organRhythmTips } from '../config/healthTipsConfig';

/**
 * 器官节律独立页面
 * 显示子午流注十二时辰养生信息
 */
const OrganRhythmPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrganIndex, setSelectedOrganIndex] = useState(null);

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  // 获取当前器官节律信息
  const getCurrentOrganInfo = useMemo(() => {
    const hour = currentTime.getHours();
    let index;
    if (hour >= 1 && hour < 3) index = 0;  // 01:00-03:00
    else if (hour >= 3 && hour < 5) index = 1;  // 03:00-05:00
    else if (hour >= 5 && hour < 7) index = 2;  // 05:00-07:00
    else if (hour >= 7 && hour < 9) index = 3;  // 07:00-09:00
    else if (hour >= 9 && hour < 11) index = 4;  // 09:00-11:00
    else if (hour >= 11 && hour < 13) index = 5;  // 11:00-13:00
    else if (hour >= 13 && hour < 15) index = 6;  // 13:00-15:00
    else if (hour >= 15 && hour < 17) index = 7;  // 15:00-17:00
    else if (hour >= 17 && hour < 19) index = 8;  // 17:00-19:00
    else if (hour >= 19 && hour < 21) index = 9;  // 19:00-21:00
    else if (hour >= 21 && hour < 23) index = 10; // 21:00-23:00
    else index = 11; // 23:00-01:00

    return {
      time: organRhythmTips.organTimes[index],
      organ: organRhythmTips.organs[index],
      description: organRhythmTips.organDescriptions[organRhythmTips.organs[index]] || "",
      suggestion: organRhythmTips.organSuggestions[organRhythmTips.organs[index]] || "",
      healthTip: organRhythmTips.organHealthTips[organRhythmTips.organs[index]] || ""
    };
  }, [currentTime]);

  // 获取选定的器官节律信息
  const getSelectedOrganInfo = useMemo(() => {
    if (selectedOrganIndex === null) return null;

    return {
      time: organRhythmTips.organTimes[selectedOrganIndex],
      organ: organRhythmTips.organs[selectedOrganIndex],
      description: organRhythmTips.organDescriptions[organRhythmTips.organs[selectedOrganIndex]] || "",
      suggestion: organRhythmTips.organSuggestions[organRhythmTips.organs[selectedOrganIndex]] || "",
      healthTip: organRhythmTips.organHealthTips[organRhythmTips.organs[selectedOrganIndex]] || ""
    };
  }, [selectedOrganIndex]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-pink-900/30">
      {/* 导航标题栏 */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'linear-gradient(to right, #9333ea, #4f46e5)',
        color: '#ffffff',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        height: '60px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '100%'
        }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: 0,
              fontSize: '16px'
            }}
          >
            <svg style={{ width: '24px', height: '24px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            器官节律养生
          </h1>
          <div style={{ width: '24px', height: '24px' }}></div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* 当前/选择的器官信息 */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded-2xl p-6 shadow-lg border border-purple-100 dark:border-purple-800 mb-6">
          {/* 标题和时间标签 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200 flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2 shadow-sm"></span>
              {selectedOrganIndex !== null ? '节律详情' : '当前节律'}
            </h3>
            <span className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-sm font-bold text-purple-700 dark:text-purple-200 shadow-sm">
              {(selectedOrganIndex !== null ? getSelectedOrganInfo : getCurrentOrganInfo).time}
            </span>
          </div>

          {/* 活跃脏腑 */}
          <div className="flex items-center justify-between mb-4 bg-white/40 dark:bg-black/20 p-3 rounded-xl">
            <span className="text-sm opacity-70 dark:text-gray-300">活跃脏腑:</span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-serif">
              {(selectedOrganIndex !== null ? getSelectedOrganInfo : getCurrentOrganInfo).organ}
            </span>
          </div>

          {/* 能量流转说明 */}
          <div className="bg-purple-500/5 p-3 rounded-xl mb-4">
            <h4 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-2">能量流转</h4>
            <p className="text-base leading-relaxed dark:text-gray-200">
              {(selectedOrganIndex !== null ? getSelectedOrganInfo : getCurrentOrganInfo).description}
            </p>
          </div>

          {/* 建议行为 */}
          <div className="bg-purple-500/5 p-3 rounded-xl mb-4">
            <h4 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-2">建议行为</h4>
            <p className="text-base leading-relaxed dark:text-gray-200">
              {(selectedOrganIndex !== null ? getSelectedOrganInfo : getCurrentOrganInfo).suggestion}
            </p>
          </div>

          {/* 养生秘诀 */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl shadow-md">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">💡</span>
              <p className="text-sm font-bold opacity-80">养生秘诀</p>
            </div>
            <p className="text-base font-medium leading-relaxed">
              {(selectedOrganIndex !== null ? getSelectedOrganInfo : getCurrentOrganInfo).healthTip}
            </p>
          </div>

          {/* 返回按钮 */}
          {selectedOrganIndex !== null && (
            <button
              onClick={() => setSelectedOrganIndex(null)}
              className="w-full mt-4 py-3 text-sm text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            >
              ← 返回当前时间
            </button>
          )}
        </div>

        {/* 24小时表格 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">子午流注·十二时辰</h3>
          <div className="grid grid-cols-3 gap-3">
            {organRhythmTips.organTimes.map((time, index) => {
              const isCurrent = getCurrentOrganInfo.organ === organRhythmTips.organs[index];
              const isSelected = selectedOrganIndex === index;
              return (
                <div
                  key={index}
                  onClick={() => setSelectedOrganIndex(index)}
                  className={`p-4 rounded-xl text-center transition-all duration-300 cursor-pointer border ${isSelected
                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg scale-105 z-10'
                    : isCurrent
                      ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 ring-2 ring-purple-500/50'
                      : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-600 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                >
                  <div className="text-xs font-medium opacity-60 truncate">{time}</div>
                  <div className={`text-sm font-black ${isSelected ? 'text-white' : 'dark:text-white'}`}>
                    {organRhythmTips.organs[index]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部温馨提示 */}
        <div className="bg-amber-400 dark:bg-amber-600 text-amber-950 dark:text-amber-50 rounded-2xl p-4 shadow-md flex items-start space-x-3 mt-6">
          <span className="text-2xl mt-1">💡</span>
          <div>
            <h4 className="text-sm font-bold mb-1">天理养生</h4>
            <p className="text-xs opacity-90 leading-tight">
              顺天应时，动静结合。养生不仅是身体的调理，更是心性的修养。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganRhythmPage;