import React, { useState, useEffect } from 'react';
import MayaCalendar from '../components/MayaCalendar';
import MayaBirthChart from '../components/MayaBirthChart';
import '../index.css';

function MayaPage() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [showBirthChart, setShowBirthChart] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 模拟加载状态
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const handleShowBirthChart = () => {
    setShowBirthChart(true);
    setActiveTab('birthChart');
  };

  const handleBackToCalendar = () => {
    setShowBirthChart(false);
    setActiveTab('calendar');
  };

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
      {!isLoaded ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 w-8 bg-purple-500 rounded-full mx-auto mb-2"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">正在加载玛雅历法...</p>
          </div>
        </div>
      ) : (
        <div className="pb-safe-bottom">
          <div className="bg-white dark:bg-gray-900">
            {/* Tab切换按钮 */}
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex p-1">
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'calendar'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={handleBackToCalendar}
                >
                  玛雅历法
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'birthChart'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={handleShowBirthChart}
                >
                  出生星盘
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-4">
              {activeTab === 'calendar' && (
                <div className="animate-fadeIn">
                  <MayaCalendar onShowBirthChart={handleShowBirthChart} />
                </div>
              )}
              
              {activeTab === 'birthChart' && (
                <div className="animate-fadeIn">
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      玛雅出生星盘
                    </h2>
                    <button
                      onClick={handleBackToCalendar}
                      className="text-sm text-blue-600 dark:text-blue-400 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      返回历法
                    </button>
                  </div>
                  <MayaBirthChart />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MayaPage;