/**
 * 人体节律模块页面
 * 基于原人体节律页面重构，专注于体力、情绪、智力三大周期
 * 优化：缩小间距和字体，适配移动端，支持 dark/light 主题
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUserConfig } from '../contexts/UserConfigContext';
import BiorhythmChart from '../components/biorhythm/BiorhythmChart.js';
import BiorhythmBanner from '../components/biorhythm/BiorhythmBanner.js';
import { getBiorhythmRange } from '../services/localDataService';

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

  // 获取趋势颜色类名
  const getTrendColorClass = (value) => {
    if (value > 80) return 'text-green-600 dark:text-green-400 font-bold';
    if (value > 50) return 'text-green-500 dark:text-green-300';
    if (value > 20) return 'text-blue-500 dark:text-blue-300';
    if (value > -20) return 'text-yellow-500 dark:text-yellow-300';
    if (value > -50) return 'text-orange-500 dark:text-orange-300';
    return 'text-red-600 dark:text-red-400 font-bold';
  };

  // 获取趋势符号
  const getTrendSymbol = (prev, current) => {
    if (!prev || !current) return '→';
    const diff = current - prev;
    if (diff > 30) return '↑↑';
    if (diff > 5) return '↑';
    if (diff > -5) return '→';
    if (diff > -30) return '↓';
    return '↓↓';
  };

  // 获取今日数据
  const getTodayData = () => {
    if (!biorhythmData || biorhythmData.length === 0) return null;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const todayData = biorhythmData.find(item => {
      const itemDate = new Date(item.date);
      return itemDate.toISOString().split('T')[0] === todayStr;
    });

    return todayData;
  };

  // 根据节律值获取健康提示
  const getHealthAdvice = (physical, emotional, intellectual) => {
    const advice = [];

    // 体力建议
    if (physical > 50) {
      advice.push({
        type: 'success',
        category: '体力',
        icon: '💪',
        text: '体力充沛,适合运动锻炼或体力活动'
      });
    } else if (physical > 0) {
      advice.push({
        type: 'info',
        category: '体力',
        icon: '🏃',
        text: '体力一般,建议适量运动,注意休息'
      });
    } else {
      advice.push({
        type: 'warning',
        category: '体力',
        icon: '😴',
        text: '体力不足,避免剧烈运动,多休息保重'
      });
    }

    // 情绪建议
    if (emotional > 50) {
      advice.push({
        type: 'success',
        category: '情绪',
        icon: '😊',
        text: '情绪高涨,适合社交活动和重要决策'
      });
    } else if (emotional > 0) {
      advice.push({
        type: 'info',
        category: '情绪',
        icon: '😐',
        text: '情绪平稳,保持平常心,适度社交'
      });
    } else {
      advice.push({
        type: 'warning',
        category: '情绪',
        icon: '😢',
        text: '情绪低落,注意调节心态,多与人交流'
      });
    }

    // 智力建议
    if (intellectual > 50) {
      advice.push({
        type: 'success',
        category: '智力',
        icon: '🧠',
        text: '思维敏捷,适合学习、工作和重要思考'
      });
    } else if (intellectual > 0) {
      advice.push({
        type: 'info',
        category: '智力',
        icon: '📚',
        text: '思维一般,专注力尚可,适合常规工作'
      });
    } else {
      advice.push({
        type: 'warning',
        category: '智力',
        icon: '💭',
        text: '思维迟钝,避免重要决策,注意休息'
      });
    }

    return advice;
  };

  // 计算未来7天数据
  const futureTrends = useMemo(() => {
    if (!biorhythmData || biorhythmData.length < 10) return [];

    const today = new Date();
    const trends = [];

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateStr = targetDate.toISOString().split('T')[0];

      // 在数据中找到对应日期
      const dataIndex = biorhythmData.findIndex(item => {
        const itemDate = new Date(item.date);
        return itemDate.toISOString().split('T')[0] === dateStr;
      });

      if (dataIndex !== -1) {
        const prevIndex = i > 0 && dataIndex > 0 ? biorhythmData[dataIndex - 1] : null;
        const current = biorhythmData[dataIndex];
        const prev = prevIndex || null;

        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

        trends.push({
          date: dateStr,
          day: weekDays[targetDate.getDay()],
          physical: current.physical.toFixed(1),
          emotional: current.emotional.toFixed(1),
          intellectual: current.intellectual.toFixed(1),
          physicalTrend: getTrendSymbol(prev?.physical, current.physical),
          emotionalTrend: getTrendSymbol(prev?.emotional, current.emotional),
          intellectualTrend: getTrendSymbol(prev?.intellectual, current.intellectual)
        });
      }
    }

    return trends;
  }, [biorhythmData]);



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

      {/* 主内容区 - 优化移动端间距 */}
      <div className="container mx-auto px-2 sm:px-3 py-2 sm:py-3 max-w-4xl">
        {/* 日期选择器 - 优化移动端布局，移除返回按钮 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 sm:p-3 mb-3 sm:mb-4">
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center text-sm sm:text-base font-medium"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2v7a2 2 0 001 1h1a1 0 001 1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm sm:text-base">{selectedDate.toLocaleDateString('zh-CN')}</span>
            </button>
          </div>
        </div>

        {/* 错误提示 - 优化移动端间距 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
            <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {/* 今日状态卡片 - 移动端一行三列紧凑显示 */}
        {biorhythmData && (() => {
          const todayData = getTodayData();
          const healthAdvice = todayData ? getHealthAdvice(todayData.physical, todayData.emotional, todayData.intellectual) : [];

          return todayData && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 sm:p-3 mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-2 sm:mb-3">
                今日状态
              </h3>

              {/* 三个节律值 - 移动端紧凑三列 */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-3 sm:mb-4">
                {/* 体力 */}
                <div className={`rounded-lg p-2 sm:p-3 transition-all ${
                  todayData.physical > 50 ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50 border border-green-200 dark:border-green-700' :
                  todayData.physical > 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border border-blue-200 dark:border-blue-700' :
                  'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/50 dark:to-orange-900/50 border border-red-200 dark:border-red-700'
                }`}>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1">体力</div>
                    <div className={`text-base sm:text-xl font-bold ${
                      todayData.physical > 50 ? 'text-green-600 dark:text-green-400' :
                      todayData.physical > 0 ? 'text-blue-600 dark:text-blue-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {todayData.physical.toFixed(0)}
                    </div>
                    <div className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {todayData.physical > 50 ? '充沛' : todayData.physical > 0 ? '一般' : '疲劳'}
                    </div>
                  </div>
                </div>

                {/* 情绪 */}
                <div className={`rounded-lg p-2 sm:p-3 transition-all ${
                  todayData.emotional > 50 ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 border border-purple-200 dark:border-purple-700' :
                  todayData.emotional > 0 ? 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/50 dark:to-blue-900/50 border border-indigo-200 dark:border-indigo-700' :
                  'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/50 dark:to-red-900/50 border border-orange-200 dark:border-orange-700'
                }`}>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1">情绪</div>
                    <div className={`text-base sm:text-xl font-bold ${
                      todayData.emotional > 50 ? 'text-purple-600 dark:text-purple-400' :
                      todayData.emotional > 0 ? 'text-indigo-600 dark:text-indigo-400' :
                      'text-orange-600 dark:text-orange-400'
                    }`}>
                      {todayData.emotional.toFixed(0)}
                    </div>
                    <div className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {todayData.emotional > 50 ? '高涨' : todayData.emotional > 0 ? '平稳' : '低落'}
                    </div>
                  </div>
                </div>

                {/* 智力 */}
                <div className={`rounded-lg p-2 sm:p-3 transition-all ${
                  todayData.intellectual > 50 ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/50 border border-blue-200 dark:border-blue-700' :
                  todayData.intellectual > 0 ? 'bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/50 dark:to-violet-900/50 border border-indigo-200 dark:border-indigo-700' :
                  'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/50 dark:to-orange-900/50 border border-red-200 dark:border-red-700'
                }`}>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1">智力</div>
                    <div className={`text-base sm:text-xl font-bold ${
                      todayData.intellectual > 50 ? 'text-blue-600 dark:text-blue-400' :
                      todayData.intellectual > 0 ? 'text-indigo-600 dark:text-indigo-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {todayData.intellectual.toFixed(0)}
                    </div>
                    <div className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {todayData.intellectual > 50 ? '敏捷' : todayData.intellectual > 0 ? '一般' : '迟钝'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 健康提示 */}
              {healthAdvice.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2">
                  {healthAdvice.map((advice, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 p-2 sm:p-2.5 rounded-lg transition-all ${
                        advice.type === 'success' ?
                          'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 border-l-2 border-green-500' :
                          advice.type === 'warning' ?
                          'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/40 border-l-2 border-orange-500' :
                          'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 border-l-2 border-blue-500'
                      }`}
                    >
                      <span className="text-sm sm:text-base flex-shrink-0 mt-0.5">{advice.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300">
                            {advice.category}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-200 leading-snug">
                          {advice.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* 生物节律图表 */}
        {biorhythmData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-2 sm:mb-3">
              节律趋势图
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              显示未来10天的节律趋势，虚线标记为今天
            </p>
            <BiorhythmChart
              data={biorhythmData}
              isMobile={window.innerWidth <= 768}
            />
            <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex items-center">
                <div className="w-3 h-0.5 bg-green-500 mr-2"></div>
                <span className="text-gray-600 dark:text-gray-300">体力节律</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-0.5 bg-blue-500 mr-2"></div>
                <span className="text-gray-600 dark:text-gray-300">情绪节律</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-0.5 bg-purple-500 mr-2"></div>
                <span className="text-gray-600 dark:text-gray-300">智力节律</span>
              </div>
            </div>
          </div>
        )}

        {/* 未来7天趋势预测表格 */}
        {futureTrends.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">
              未来7天趋势预测
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-opacity-50">
                  <tr>
                    <th scope="col" className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider">日期</th>
                    <th scope="col" className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-green-600 dark:text-green-200 uppercase tracking-wider">体力</th>
                    <th scope="col" className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-blue-600 dark:text-blue-200 uppercase tracking-wider">情绪</th>
                    <th scope="col" className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs font-medium text-purple-600 dark:text-purple-200 uppercase tracking-wider">智力</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {futureTrends.map((trend, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{trend.day}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-100">{trend.date.substring(5)}</div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-xs sm:text-sm ${getTrendColorClass(parseFloat(trend.physical))}`}>{trend.physical}</span>
                          <span className="text-[10px] text-gray-400">{trend.physicalTrend}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-xs sm:text-sm ${getTrendColorClass(parseFloat(trend.emotional))}`}>{trend.emotional}</span>
                          <span className="text-[10px] text-gray-400">{trend.emotionalTrend}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-xs sm:text-sm ${getTrendColorClass(parseFloat(trend.intellectual))}`}>{trend.intellectual}</span>
                          <span className="text-[10px] text-gray-400">{trend.intellectualTrend}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-x-2 sm:gap-x-4 gap-y-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-100">
              <span>↑↑: 大幅上升</span>
              <span>↑: 上升</span>
              <span>→: 平稳</span>
              <span>↓: 下降</span>
              <span>↓↓: 大幅下降</span>
            </div>
          </div>
        )}

        {/* 生物节律说明 - 优化移动端布局 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 mt-3 sm:mt-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-2 sm:mb-3">
            生物节律说明
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-500 rounded-full mt-0.5 sm:mt-1 mr-2 sm:mr-3 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm">体力周期（23天）</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 leading-relaxed">
                  体力周期影响体力、耐力、免疫力和身体状况。正值期精力充沛，适合运动；负值期注意休息。
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-500 rounded-full mt-0.5 sm:mt-1 mr-2 sm:mr-3 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm">情绪周期（28天）</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 leading-relaxed">
                  情绪周期影响心情、创造力和敏感性。正值期心情愉快，负值期情绪低落，需注意调节。
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-indigo-500 rounded-full mt-0.5 sm:mt-1 mr-2 sm:mr-3 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm">智力周期（33天）</h4>
                <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 leading-relaxed">
                  智力周期影响记忆力、逻辑思维和分析能力。正值期思维敏捷，适合学习；负值期容易分心。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 日历弹窗 - 优化移动端布局 */}
      {isCalendarOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-0" onClick={() => setIsCalendarOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-3 sm:p-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white mb-2 sm:mb-3">选择日期</h3>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-800 dark:text-white dark:bg-gray-700"
            />
            <div className="flex justify-end mt-2 sm:mt-3 space-x-2">
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
