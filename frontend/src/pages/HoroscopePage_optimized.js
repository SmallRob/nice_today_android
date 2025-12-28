import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUserConfig } from '../contexts/UserConfigContext';
import { useUserSummary } from '../hooks/useUserInfo';
import { useNavigate } from 'react-router-dom';
import { generateDailyHoroscope } from '../utils/horoscopeAlgorithm';
import '../styles/dashboard.css';

const HoroscopePage = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();
  const navigate = useNavigate();
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
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  // 加载星座运势数据
  const loadHoroscopeData = useCallback(async () => {
    if (!selectedZodiac) return;

    setLoading(true);
    setError(null);

    try {
      const date = getToday();
      const data = generateDailyHoroscope(selectedZodiac, date);
      
      if (data) {
        setHoroscopeData(data);
      } else {
        throw new Error('无法生成运势数据');
      }
    } catch (err) {
      console.error('加载星座运势失败:', err);
      setError('加载运势数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [selectedZodiac]);

  // 初始化
  useEffect(() => {
    loadHoroscopeData();
  }, [loadHoroscopeData]);

  // 星座列表
  const zodiacList = [
    '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
    '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
  ];

  // 返回上一页
  const handleBack = () => {
    navigate('/dashboard');
  };

  // 渲染运势分数
  const renderScore = (score, label) => (
    <div className="flex flex-col items-center p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
      <div className="text-lg font-bold text-gray-800 dark:text-white">{score}</div>
      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{label}</div>
      <div className="w-16 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mt-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600" 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 ${theme}`}>
      {/* 头部 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-white hover:text-purple-100 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回首页
            </button>
            <h1 className="text-xl font-bold">今日运势</h1>
            <div className="w-12"></div>
          </div>
        </div>
      </div>

      {/* 视图切换 */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-16 z-30">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto space-x-2 py-3">
            <button
              onClick={() => setViewMode('daily')}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all text-sm ${
                viewMode === 'daily'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
              }`}
            >
              今日运势
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all text-sm ${
                viewMode === 'weekly'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
              }`}
            >
              本周运势
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all text-sm ${
                viewMode === 'monthly'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
              }`}
            >
              本月运势
            </button>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={loadHoroscopeData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              重新加载
            </button>
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
                  {getToday()}
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
            </div>

            {/* 运势详情 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 宜忌 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center">
                  <span className="mr-2">✅</span> 今日宜
                </h3>
                <p className="text-green-700 dark:text-green-200">
                  {horoscopeData.recommendations?.positiveAdvice || '保持积极心态，主动出击'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center">
                  <span className="mr-2">❌</span> 今日忌
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

            {/* 每日提醒 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                <span className="mr-2">💖</span> 感性提醒
              </h3>
              <p className="text-blue-700 dark:text-blue-200 leading-relaxed">
                {horoscopeData.recommendations?.dailyReminder || '今天会是美好的一天，保持微笑，积极面对每一个挑战。'}
              </p>
            </div>
          </div>
        )}

        {/* 运势说明 */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ※ 运势仅供参考，请以积极心态面对每一天 ※
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            数据更新时间：{new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HoroscopePage;