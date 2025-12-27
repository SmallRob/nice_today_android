/**
 * 八字月运模块页面
 * 从星座运势分离出的独立功能
 * 专门展示八字相关月运内容
 */
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUserConfig } from '../contexts/UserConfigContext';
import { normalizeBirthInfo } from '../utils/baziDataManager';
import { calculateLiuNianDaYun, getMonthlyBaziFortune, calculateDailyEnergy } from '../utils/baziHelper';
import { Solar } from 'lunar-javascript';

const BaziPage = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [lunarData, setLunarData] = useState(null);
  const [liuNianData, setLiuNianData] = useState(null);
  const [monthlyFortune, setMonthlyFortune] = useState(null);
  const [dailyEnergyData, setDailyEnergyData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 计算八字月运
  const calculateBaziFortune = useCallback(async () => {
    if (!currentConfig?.birthDate) {
      setError('请先设置您的出生信息');
      setLoading(false);
      return;
    }

    try {
      setCalculating(true);
      setLoading(true);

      // 规范化出生信息
      const birthInfo = normalizeBirthInfo(currentConfig);

      // 从字符串格式解析日期和时间
      let year, month, day, hour;

      try {
        // 解析出生日期 (格式: YYYY-MM-DD)
        const dateParts = birthInfo.birthDate.split('-');
        year = parseInt(dateParts[0]);
        month = parseInt(dateParts[1]);
        day = parseInt(dateParts[2]);

        // 解析出生时间 (格式: HH:mm)，默认使用 12:00
        const timeParts = birthInfo.birthTime.split(':');
        hour = timeParts.length >= 1 ? parseInt(timeParts[0]) : 12;
      } catch (parseError) {
        // 如果解析失败，使用默认值
        console.warn('日期时间解析失败，使用默认值:', parseError);
        year = 1990;
        month = 1;
        day = 1;
        hour = 12;
      }

      // 验证解析结果
      if (!year || !month || !day) {
        throw new Error('出生日期解析失败');
      }

      if (!hour || isNaN(hour)) {
        hour = 12; // 默认使用 12:00
        console.log('使用默认出生时间: 12:00');
      }

      // 计算八字数据
      const solarDate = Solar.fromYmdHms(year, month, day, hour, 0, 0);
      const lunar = solarDate.getLunar();
      const eightChar = lunar.getEightChar();

      const lunarData = {
        year: lunar.getYear(),
        month: lunar.getMonth(),
        day: lunar.getDay(),
        hour: lunar.getHour(),
        yearGanZhi: lunar.getYearInGanZhi(),
        monthGanZhi: lunar.getMonthInGanZhi(),
        dayGanZhi: lunar.getDayInGanZhi(),
        hourGanZhi: lunar.getTimeInGanZhi(),
        zodiac: lunar.getYearShengXiao(),
        yearXing: eightChar.getYearWuXing(),
        monthXing: eightChar.getMonthWuXing(),
        dayXing: eightChar.getDayWuXing(),
        hourXing: eightChar.getTimeWuXing()
      };

      setLunarData(lunarData);

      // 计算流年大运
      const liuNian = calculateLiuNianDaYun(year, month, day, hour);
      setLiuNianData(liuNian);

      // 计算月运
      const pillars = [
        lunarData.yearGanZhi,  // 年柱
        lunarData.monthGanZhi, // 月柱
        lunarData.dayGanZhi,   // 日柱
        lunarData.hourGanZhi   // 时柱
      ];
      
      // 创建目标日期对象
      const targetDate = new Date(selectedYear, selectedMonth - 1, 1);
      
      const monthlyFortune = getMonthlyBaziFortune(pillars, targetDate);
      setMonthlyFortune(monthlyFortune);
      
      // 计算每日能量运势
      // 构造符合 calculateDailyEnergy 函数要求的八字数据格式
      const baziDataForDaily = {
        bazi: {
          year: lunarData.yearGanZhi,
          month: lunarData.monthGanZhi,
          day: lunarData.dayGanZhi,
          hour: lunarData.hourGanZhi
        },
        day: lunarData.dayGanZhi
      };
      const dailyEnergy = calculateDailyEnergy(baziDataForDaily);
      setDailyEnergyData(dailyEnergy);

      setError(null);
    } catch (err) {
      setError('计算八字月运失败：' + err.message);
      console.error('八字月运计算错误:', err);
    } finally {
      setCalculating(false);
      setLoading(false);
    }
  }, [currentConfig, selectedYear, selectedMonth]);

  // 初始化
  useEffect(() => {
    calculateBaziFortune();
  }, [calculateBaziFortune]);

  // 月份选择
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-fuchsia-900/30 ${theme}`}>
      {/* 导航标题栏 */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="text-white hover:text-purple-100 flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <h1 className="text-xl font-bold">八字月运</h1>
            <button
              onClick={calculateBaziFortune}
              className="text-white hover:text-purple-100"
              disabled={calculating}
            >
              <svg className={`w-6 h-6 ${calculating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 月份选择器 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">选择月份</h3>
            <select
              value={`${selectedYear}-${selectedMonth}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                setSelectedYear(parseInt(year));
                setSelectedMonth(parseInt(month));
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white dark:bg-gray-700"
            >
              {[2024, 2025, 2026].map(year => (
                months.map(month => (
                  <option key={`${year}-${month}`} value={`${year}-${month}`}>
                    {year}年{month}月
                  </option>
                ))
              ))}
            </select>
          </div>
        </div>

        {/* 八字信息卡片 */}
        {lunarData && (
          <div className="bg-gradient-to-br from-purple-600 to-violet-700 text-white rounded-xl shadow-lg p-6 mb-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-2">您的八字</h2>
              <div className="flex justify-center space-x-4 text-xl font-mono">
                <span className="bg-white/20 px-4 py-2 rounded-lg">{lunarData.yearGanZhi}</span>
                <span className="bg-white/20 px-4 py-2 rounded-lg">{lunarData.monthGanZhi}</span>
                <span className="bg-white/20 px-4 py-2 rounded-lg">{lunarData.dayGanZhi}</span>
                <span className="bg-white/20 px-4 py-2 rounded-lg">{lunarData.hourGanZhi}</span>
              </div>
              <p className="mt-3 text-purple-100">{lunarData.zodiac}年</p>
            </div>
          </div>
        )}

        {/* 月运详情 */}
        {monthlyFortune && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {selectedYear}年{selectedMonth}月运势
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">事业运势</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {monthlyFortune.career || '暂无数据'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-pink-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">财运运势</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {monthlyFortune.wealth || '暂无数据'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">健康运势</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {monthlyFortune.health || '暂无数据'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-violet-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">感情运势</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {monthlyFortune.love || '暂无数据'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 每日运势提醒 */}
        {dailyEnergyData && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">✨</span>
              今日运势提醒
            </h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold">今日能量指数</span>
                <span className="text-xl font-bold">{dailyEnergyData.overallScore}分</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-white h-3 rounded-full" 
                  style={{ width: `${dailyEnergyData.overallScore}%` }}
                ></div>
              </div>
            </div>
            
            <p className="mb-4 text-blue-100">{dailyEnergyData.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 建议 */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  今日建议
                </h4>
                <div className="space-y-2">
                  {dailyEnergyData.suggestions && dailyEnergyData.suggestions.map((suggestion, index) => (
                    <div key={`suggestion-${index}`} className="flex items-center bg-white/10 rounded-lg p-2">
                      <span className="mr-2">{suggestion.icon}</span>
                      <span>{suggestion.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 注意事项 */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <span className="mr-2">⚠️</span>
                  注意事项
                </h4>
                <div className="space-y-2">
                  {dailyEnergyData.attentions && dailyEnergyData.attentions.map((attention, index) => (
                    <div key={`attention-${index}`} className="flex items-center bg-white/10 rounded-lg p-2">
                      <span className="mr-2">{attention.icon}</span>
                      <span>{attention.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 流年运势 */}
        {liuNianData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              流年运势
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liuNianData.yearlyFortune && liuNianData.yearlyFortune.slice(0, 6).map((year, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                    {year.year}年
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {year.fortune}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaziPage;
