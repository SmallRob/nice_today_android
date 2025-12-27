/**
 * 人体节律模块页面
 * 基于原人体节律页面重构，专注于体力、情绪、智力三大周期
 */
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUserConfig } from '../contexts/UserConfigContext';
import BiorhythmChart from '../components/biorhythm/BiorhythmChart';
import BiorhythmBanner from '../components/biorhythm/BiorhythmBanner';
import { calculateBiorhythmData, getBiorhythmRange } from '../services/localDataService';

const BiorhythmPage = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();

  // 状态管理
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [biorhythmData, setBiorhythmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 计算生物节律
  const calculateBiorhythm = useCallback(async () => {
    if (!currentConfig?.birthDate) {
      setError('请先设置您的出生日期');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 获取趋势数据（前后各10天）
      const rangeResult = await getBiorhythmRange(currentConfig.birthDate, 10, 20);
      if (rangeResult.success && rangeResult.rhythmData) {
        setBiorhythmData(rangeResult.rhythmData);
        setError(null);
      } else {
        setError('计算生物节律失败：' + (rangeResult.error || '未知错误'));
      }
    } catch (err) {
      setError('计算生物节律失败：' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentConfig?.birthDate, selectedDate]);

  // 初始化
  useEffect(() => {
    calculateBiorhythm();
  }, [calculateBiorhythm]);

  // 保存日期选择
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

  // 返回上一页
  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900/30 dark:to-purple-900/30 ${theme}`}>
      {/* Banner */}
      <BiorhythmBanner />

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 日期选择器 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {selectedDate.toLocaleDateString('zh-CN')}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 生物节律图表 */}
        {biorhythmData && (
          <BiorhythmChart
            data={biorhythmData}
            isMobile={window.innerWidth <= 768}
            selectedDate={selectedDate}
            birthDate={currentConfig?.birthDate ? new Date(currentConfig.birthDate) : null}
          />
        )}

        {/* 生物节律说明 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            生物节律说明
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white">体力周期（23天）</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  体力周期影响体力、耐力、免疫力和身体状况。正值期精力充沛，适合运动；负值期注意休息。
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white">情绪周期（28天）</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  情绪周期影响心情、创造力和敏感性。正值期心情愉快，负值期情绪低落，需注意调节。
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-3 h-3 bg-indigo-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white">智力周期（33天）</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  智力周期影响记忆力、逻辑思维和分析能力。正值期思维敏捷，适合学习；负值期容易分心。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 日历弹窗 */}
      {isCalendarOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsCalendarOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">选择日期</h3>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-800 dark:text-white dark:bg-gray-700"
            />
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiorhythmPage;
