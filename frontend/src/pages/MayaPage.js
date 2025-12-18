import React, { useState, useEffect } from 'react';
import MayaCalendar from '../components/MayaCalendar';
import MayaBirthChart from '../components/MayaBirthChart';
import PageLayout, { Card } from '../components/PageLayout';
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
    <PageLayout
      title="玛雅历法"
      subtitle="探索古老的玛雅智慧"
      loading={!isLoaded}
      loadingMessage="正在加载玛雅历法..."
    >
      <div className="space-y-4">
        {/* Tab切换按钮 */}
        <Card padding="p-1">
          <div className="flex">
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
        </Card>

        {/* 内容区域 */}
        <div className="animate-fadeIn">
          {activeTab === 'calendar' && (
            <MayaCalendar onShowBirthChart={handleShowBirthChart} />
          )}
          
          {activeTab === 'birthChart' && (
            <div className="space-y-4">
              <Card 
                title="玛雅出生星盘"
                headerAction={
                  <button
                    onClick={handleBackToCalendar}
                    className="text-sm text-blue-600 dark:text-blue-400 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    返回历法
                  </button>
                }
              >
                <MayaBirthChart />
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default MayaPage;