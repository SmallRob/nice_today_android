import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUserConfig } from '../contexts/UserConfigContext';
import { useUserSummary } from '../hooks/useUserInfo';
import { generateDailyHoroscope, generateWeeklyHoroscope, generateMonthlyHoroscope } from '../utils/horoscopeAlgorithm';

const HoroscopePage = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();

  const userSummary = useUserSummary();

  // 状态管理
  const [selectedZodiac, setSelectedZodiac] = useState(currentConfig?.zodiac || '金牛座');
  const [horoscopeData, setHoroscopeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly

  // 获取今日日期
  const getToday = () => {
    const today = new Date();
    return today;
  };

  // 格式化日期字符串
  const formatDateString = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // 格式化日期范围字符串
  const formatDateRange = (viewMode) => {
    const today = getToday();
    if (viewMode === 'daily') {
      return formatDateString(today);
    } else if (viewMode === 'weekly') {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 6);
      return `${formatDateString(today)} - ${formatDateString(endOfWeek)}`;
    } else if (viewMode === 'monthly') {
      return `${today.getFullYear()}年${today.getMonth() + 1}月`;
    }
    return formatDateString(today);
  };

  // 加载星座运势数据
  const loadHoroscopeData = useCallback(async () => {
    if (!selectedZodiac) return;

    setLoading(true);
    setError(null);

    try {
      const date = getToday();
      let data;

      // 根据视图模式加载不同类型的运势
      if (viewMode === 'daily') {
        data = generateDailyHoroscope(selectedZodiac, date);
      } else if (viewMode === 'weekly') {
        data = generateWeeklyHoroscope(selectedZodiac, date);
      } else if (viewMode === 'monthly') {
        data = generateMonthlyHoroscope(selectedZodiac, date);
      }

      if (data) {
        setHoroscopeData(data);
        console.log(`✅ ${viewMode === 'daily' ? '今日' : viewMode === 'weekly' ? '本周' : '本月'}运势已加载:`, data);
      } else {
        throw new Error('无法生成运势数据');
      }
    } catch (err) {
      console.error('加载星座运势失败:', err);
      setError('加载运势数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [selectedZodiac, viewMode]);

  // 初始化
  useEffect(() => {
    loadHoroscopeData();
  }, [loadHoroscopeData]);

  // 星座列表
  const zodiacList = [
    '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
    '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
  ];



  // 渲染运势分数
  const renderScore = (score, label) => (
    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="text-center">
        <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{score}</div>
        <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{label}</div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} pb-6`}>
      {/* 头部 */}
      <div className={`px-4 pt-6 pb-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">✨</span>
            <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              星座运势
            </h1>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            星座运势分析 · 每日能量预测
          </p>
        </div>
      </div>

      {/* 视图切换 */}
      <div className={`px-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex overflow-x-auto space-x-4 py-3">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-all ${viewMode === 'daily'
                ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white'}`
                : `${theme === 'dark' ? 'text-gray-300 bg-gray-800' : 'text-gray-600 bg-gray-200'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
              }`}
          >
            今日运势
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-all ${viewMode === 'weekly'
                ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white'}`
                : `${theme === 'dark' ? 'text-gray-300 bg-gray-800' : 'text-gray-600 bg-gray-200'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
              }`}
          >
            本周运势
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-all ${viewMode === 'monthly'
                ? `${theme === 'dark' ? 'bg-purple-700 text-white' : 'bg-purple-600 text-white'}`
                : `${theme === 'dark' ? 'text-gray-300 bg-gray-800' : 'text-gray-600 bg-gray-200'} hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`
              }`}
          >
            本月运势
          </button>
        </div>
      </div>

      {/* 主内容 */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* 星座选择器 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">选择星座</h2>
            {currentConfig?.zodiac && (
              <span className="text-sm text-purple-600 dark:text-purple-400">
                您的星座：{currentConfig.zodiac}
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {zodiacList.map(zodiac => (
              <button
                key={zodiac}
                onClick={() => setSelectedZodiac(zodiac)}
                className={`p-2 rounded-lg text-sm font-medium transition-all ${
                  selectedZodiac === zodiac
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {zodiac}
              </button>
            ))}
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center mb-6">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">正在加载运势数据...</p>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className={`mb-3 px-4 py-2 rounded-lg text-center ${theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
            <p>{error}</p>
          </div>
        )}

        {/* 运势内容 */}
        {!loading && !error && horoscopeData && (
          <div className="space-y-6">
            {/* 运势概览 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {selectedZodiac} {viewMode === 'daily' ? '今日' : viewMode === 'weekly' ? '本周' : '本月'}运势
                </h2>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-sm font-medium">
                  {formatDateRange(viewMode)}
                </span>
              </div>

              <div className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {horoscopeData.overallDescription || horoscopeData.description}
              </div>

              {/* 运势分数 */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {renderScore(horoscopeData.dailyForecast?.love?.score || 75, '爱情')}
                {renderScore(horoscopeData.dailyForecast?.wealth?.score || 70, '财富')}
                {renderScore(horoscopeData.dailyForecast?.career?.score || 65, '事业')}
                {renderScore(horoscopeData.dailyForecast?.study?.score || 80, '学业')}
              </div>

              {/* 每日概览（仅周运显示） */}
              {viewMode === 'weekly' && horoscopeData.dailyOverview && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
                    本周每日运势概览
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {horoscopeData.dailyOverview.map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">{day.day}</div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {day.date.substring(5)}
                        </div>
                        <div
                          className={`text-xs mt-1 rounded px-1 py-0.5 ${
                            day.score >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            day.score >= 60 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            day.score >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {day.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 每周概览（仅月运显示） */}
              {viewMode === 'monthly' && horoscopeData.weeklyOverview && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
                    本月每周运势概览
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {horoscopeData.weeklyOverview.map((week, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {week.week}
                        </div>
                        <div
                          className={`text-lg font-bold rounded px-2 py-1 ${
                            week.score >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            week.score >= 60 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            week.score >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {week.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 运势详情 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 宜忌 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center">
                  <span className="mr-2">✅</span>
                  {viewMode === 'daily' ? '今日宜' : viewMode === 'weekly' ? '本周宜' : '本月宜'}
                </h3>
                <p className="text-green-700 dark:text-green-200">
                  {horoscopeData.recommendations?.positiveAdvice || '保持积极心态，主动出击'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center">
                  <span className="mr-2">❌</span>
                  {viewMode === 'daily' ? '今日忌' : viewMode === 'weekly' ? '本周忌' : '本月忌'}
                </h3>
                <p className="text-red-700 dark:text-red-200">
                  {horoscopeData.recommendations?.avoidAdvice || '避免冲动决策，三思而行'}
                </p>
              </div>
            </div>

            {/* 幸运物品 */}
            {horoscopeData.recommendations?.luckyColors && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">幸运指南</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">幸运颜色</div>
                    <div className="font-medium text-purple-600 dark:text-purple-400">
                      {horoscopeData.recommendations.luckyColors}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">幸运数字</div>
                    <div className="font-medium text-purple-600 dark:text-purple-400">
                      {horoscopeData.recommendations.luckyNumbers || '7, 14, 21'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">幸运方位</div>
                    <div className="font-medium text-purple-600 dark:text-purple-400">
                      {horoscopeData.recommendations.luckyDirection || '东方'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">相合星座</div>
                    <div className="font-medium text-purple-600 dark:text-purple-400">
                      {Array.isArray(horoscopeData.recommendations.compatibleSigns) 
                        ? horoscopeData.recommendations.compatibleSigns.join('、')
                        : horoscopeData.recommendations.compatibleSigns || '水瓶座、双子座'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 感性提醒 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                <span className="mr-2">💖</span>
                {viewMode === 'daily' ? '今日提醒' : viewMode === 'weekly' ? '本周提醒' : '本月提醒'}
              </h3>
              <p className="text-blue-700 dark:text-blue-200 leading-relaxed">
                {horoscopeData.recommendations?.dailyReminder || horoscopeData.recommendations?.positiveAdvice ||
                  (viewMode === 'daily' ? '今天会是美好的一天，保持微笑，积极面对每一个挑战。' :
                   viewMode === 'weekly' ? '本周保持积极心态，把握机遇。' : '本月稳步前进，持续积累。')}
              </p>
            </div>
          </div>
        )}

        {/* 运势说明 */}
        <div className="text-center text-gray-600 dark:text-gray-300 text-xs">
          <p>数据更新时间：{new Date().toLocaleString('zh-CN')}</p>
          <p className="mt-1">星座运势仅供参考，请理性看待，结合实际情况做出决策</p>
        </div>
      </div>
    </div>
  );
};

export default HoroscopePage;