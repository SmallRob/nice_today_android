import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { userConfigManager } from '../utils/userConfigManager';
import {
  HOROSCOPE_DATA_ENHANCED as getHoroscopeData,
  generateDailyHoroscope
} from '../utils/horoscopeAlgorithm';
import {
  getDailyHoroscopeWithCache,
  initializeHoroscopeCache
} from '../utils/horoscopeCache';
import {
  debounce,
  performanceMonitor,
  initializePerformanceOptimization
} from '../utils/performanceOptimization';
import '../styles/mobileOptimization.css';

const HoroscopeTab = () => {
  // 状态管理
  const [userHoroscope, setUserHoroscope] = useState('');
  const [horoscopeGuidance, setHoroscopeGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isTemporaryHoroscope, setIsTemporaryHoroscope] = useState(false);
  const isTemporaryRef = useRef(false);

  // 初始化缓存管理器和性能优化
  useEffect(() => {
    const initOptimizations = async () => {
      try {
        // 初始化性能优化
        initializePerformanceOptimization();
        
        // 初始化缓存管理器
        initializeHoroscopeCache();
      } catch (error) {
        console.warn('优化初始化失败:', error);
      }
    };
    
    initOptimizations();
  }, []);

  // 计算综合分数（基于增强版算法）
  const calculateOverallScore = useCallback((dailyForecast) => {
    if (!dailyForecast) return 77; // 默认分数
    const { love, wealth, career, study } = dailyForecast;
    const total = (love.score + wealth.score + career.score + study.score) / 4;
    return Math.round(total);
  }, []);

  // 从用户配置获取用户星座
  const getUserZodiac = useCallback(() => {
    try {
      const config = userConfigManager.getCurrentConfig();
      return config?.zodiac || '';
    } catch (error) {
      console.log('获取用户星座失败:', error);
      return '';
    }
  }, []);

  // 加载运势数据（使用增强版算法和缓存）- 简化版
  const loadHoroscopeGuidance = useCallback(async (horoscope = userHoroscope, date = new Date()) => {
    if (!horoscope) return;

    performanceMonitor.start();
    setLoading(true);
    setError(null);

    try {
      // 使用缓存机制获取运势数据
      const horoscopeData = await getDailyHoroscopeWithCache(
        horoscope, 
        date, 
        { generateDailyHoroscope }
      );
      
      if (!horoscopeData) {
        throw new Error('无法生成星座运势数据');
      }
      
      setHoroscopeGuidance(horoscopeData);
    } catch (error) {
      console.error('加载星座运势失败:', error);
      setError(error.message || '加载失败');
    } finally {
      setLoading(false);
      performanceMonitor.end('加载星座运势数据');
    }
  }, [userHoroscope]);

  // 防抖版本的加载函数，用于用户快速切换时避免多次请求
  const debouncedLoadHoroscopeGuidance = useMemo(
    () => debounce(loadHoroscopeGuidance, 300),
    [loadHoroscopeGuidance]
  );

  // 初始化组件 - 简化版
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        // 确保用户配置管理器已初始化
        if (!userConfigManager.initialized) {
          await userConfigManager.initialize();
        }
        
        // 从用户配置获取用户星座
        const userZodiac = getUserZodiac();
        if (userZodiac && isMounted) {
          setUserHoroscope(userZodiac);
          setIsTemporaryHoroscope(false);
          isTemporaryRef.current = false;
        }
        
        if (isMounted) {
          setInitialized(true);
        }
      } catch (error) {
        console.error('初始化星座运程组件失败:', error);
        if (isMounted) {
          setInitialized(true);
        }
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
    };
  }, [getUserZodiac]);

  // 同步临时状态到ref
  useEffect(() => {
    isTemporaryRef.current = isTemporaryHoroscope;
  }, [isTemporaryHoroscope]);

  // 当星座变化时重新加载数据 - 简化版
  useEffect(() => {
    if (!userHoroscope || !initialized) return;
    
    // 仅在首次默认加载或用户主动切换时执行数据请求
    if (!dataLoaded) {
      const timer = setTimeout(() => {
        debouncedLoadHoroscopeGuidance();
        setDataLoaded(true);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [userHoroscope, debouncedLoadHoroscopeGuidance, initialized, dataLoaded]);

  // 处理星座选择 - 简化版（仅临时查询，不保存）
  const handleHoroscopeChange = useCallback((horoscope) => {
    if (userHoroscope !== horoscope) {
      setUserHoroscope(horoscope);
      // 标记为临时选择
      setIsTemporaryHoroscope(true);
      // 标记需要重新加载数据
      setDataLoaded(false);
    }
  }, [userHoroscope]);

  // 恢复用户配置的星座
  const handleRestoreUserHoroscope = useCallback(() => {
    const userZodiac = getUserZodiac();
    if (userZodiac && userZodiac !== userHoroscope) {
      setUserHoroscope(userZodiac);
      setIsTemporaryHoroscope(false);
      // 标记需要重新加载数据
      setDataLoaded(false);
    }
  }, [userHoroscope, getUserZodiac]);

  // 渲染移动端优化的运势卡片
  const renderMobileHoroscopeCard = () => {
    if (!horoscopeGuidance || !userHoroscope) return null;

    const overallScore = calculateOverallScore(horoscopeGuidance.dailyForecast);
    const { dailyForecast, recommendations, overallDescription } = horoscopeGuidance;
    
    // 分数排序
    const scores = [
      { name: '爱情', score: dailyForecast.love.score, icon: '❤️' },
      { name: '财富', score: dailyForecast.wealth.score, icon: '💰' },
      { name: '事业', score: dailyForecast.career.score, icon: '💼' },
      { name: '学业', score: dailyForecast.study.score, icon: '📚' }
    ];
    
    // 按分数排序
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);

    return (
      <div className="space-y-4">
        {/* 综合分数卡片 */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium mb-1">综合分数</h3>
            <div className="text-5xl font-bold mb-2">{overallScore}<span className="text-2xl">分</span></div>
            <p className="text-blue-100 text-sm">今天运气还不错</p>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {scores.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-lg mb-1">{item.icon}</div>
                <div className="text-xl font-bold">{item.score}</div>
                <div className="text-xs opacity-90">{item.name}</div>
              </div>
            ))}
          </div>
          
          {/* 分数排序 */}
          <div className="mt-4 flex justify-center items-center text-sm">
            <span className="mr-2">运势排行:</span>
            {sortedScores.map((item, index) => (
              <span key={index} className="flex items-center mr-2">
                <span className="mr-1">{item.name}</span>
                {index < sortedScores.length - 1 && <span className="text-xs">&gt;</span>}
              </span>
            ))}
          </div>
        </div>

        {/* 今日运势描述 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h4 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center">
            <span className="mr-2">📝</span>今日运势
          </h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {overallDescription}
          </p>
        </div>

        {/* 爱情提醒 */}
        <div className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl p-4 shadow border border-pink-100 dark:border-pink-800">
          <h4 className="font-bold text-pink-700 dark:text-pink-300 mb-2 flex items-center">
            <span className="mr-2">💖</span>爱情提醒 - 来自生辰
          </h4>
          <p className="text-pink-600 dark:text-pink-400 text-sm leading-relaxed">
            {recommendations.dailyReminder}
          </p>
        </div>

        {/* 建议 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 shadow border border-green-100 dark:border-green-800">
            <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">✅ 建议</h4>
            <p className="text-green-600 dark:text-green-400 text-sm">{recommendations.positiveAdvice}</p>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-4 shadow border border-red-100 dark:border-red-800">
            <h4 className="font-bold text-red-700 dark:text-red-300 mb-2">❌ 避免</h4>
            <p className="text-red-600 dark:text-red-400 text-sm">{recommendations.avoidAdvice}</p>
          </div>
        </div>

        {/* 心灵问答 */}
        {recommendations.soulQuestion && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 shadow border border-blue-100 dark:border-blue-800">
            <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
              <span className="mr-2">❓</span>问 {recommendations.soulQuestion.question}
            </h4>
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              {recommendations.soulQuestion.answer}
            </p>
          </div>
        )}

        {/* 幸运物品网格 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h4 className="font-bold text-gray-800 dark:text-white mb-4 text-center">✨ 今日幸运物</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 幸运色 */}
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div 
                  className="w-10 h-10 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: recommendations.luckyColors[0] }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">幸运色</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {recommendations.luckyColors[0].replace('#', '')}
              </div>
            </div>

            {/* 幸运配饰 */}
            <div className="text-center">
              <div className="text-2xl mb-2">💎</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">幸运配饰</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {recommendations.luckyAccessory}
              </div>
            </div>

            {/* 幸运时辰 */}
            <div className="text-center">
              <div className="text-2xl mb-2">🕒</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">幸运时辰</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {recommendations.luckyTime}
              </div>
            </div>

            {/* 幸运方位 */}
            <div className="text-center">
              <div className="text-2xl mb-2">🧭</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">幸运方位</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {recommendations.luckyDirection}
              </div>
            </div>

            {/* 幸运数字 */}
            <div className="text-center">
              <div className="text-2xl mb-2">🔢</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">幸运数字</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {recommendations.luckyNumbers.join('/')}
              </div>
            </div>

            {/* 幸运食物 */}
            <div className="text-center">
              <div className="text-2xl mb-2">🍵</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">幸运食物</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {recommendations.luckyFood}
              </div>
            </div>

            {/* 幸运随身物 */}
            <div className="text-center">
              <div className="text-2xl mb-2">📓</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">幸运随身物</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {recommendations.luckyItem}
              </div>
            </div>

            {/* 幸运花 */}
            <div className="text-center">
              <div className="text-2xl mb-2">🌻</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">幸运花</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {recommendations.luckyFlower}
              </div>
            </div>
          </div>
        </div>

        {/* 星座信息 */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 shadow border border-purple-100 dark:border-purple-800">
          <div className="flex items-center mb-3">
            <span className="text-3xl mr-3">{horoscopeGuidance.horoscopeInfo.icon}</span>
            <div>
              <h4 className="font-bold text-purple-700 dark:text-purple-300 text-lg">
                {userHoroscope}
              </h4>
              <p className="text-purple-600 dark:text-purple-400 text-sm">
                {horoscopeGuidance.horoscopeInfo.element} · {horoscopeGuidance.horoscopeInfo.dateRange}
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            <span className="font-medium">性格特点：</span>
            {horoscopeGuidance.horoscopeInfo.traits}
          </p>
        </div>

        {/* 相容星座 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h4 className="font-bold text-gray-800 dark:text-white mb-3">🤝 相容星座</h4>
          <div className="flex flex-wrap gap-2">
            {recommendations.compatibleSigns.map((sign, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm text-blue-700 dark:text-blue-300"
              >
                {sign}
              </span>
            ))}
          </div>
        </div>

        {/* 月亮星座 */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-4 shadow border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🌙</span>
            <div>
              <h4 className="font-bold text-indigo-700 dark:text-indigo-300">今日月亮星座</h4>
              <p className="text-indigo-600 dark:text-indigo-400">{recommendations.todayMoonSign}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 移动端星座选择器
  const renderMobileHoroscopeSelector = () => {
    return (
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 pb-3 pt-1">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择星座查看运势
          </label>
          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-2 min-w-max">
              {getHoroscopeData().map((horoscope) => {
                const isActive = userHoroscope === horoscope.name;
                return (
                  <button
                    key={horoscope.name}
                    onClick={() => handleHoroscopeChange(horoscope.name)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg flex flex-col items-center justify-center min-w-[70px] transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-xl mb-1">{horoscope.icon}</span>
                    <span className="text-xs font-medium">{horoscope.name.replace('座', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {isTemporaryHoroscope && (
          <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center justify-between">
              <span className="text-yellow-700 dark:text-yellow-300 text-xs">
                ⚠️ 临时查看 {userHoroscope} 的运势
              </span>
              <button
                onClick={handleRestoreUserHoroscope}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs rounded"
              >
                恢复我的星座
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* 移动端标题 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4">
        <h1 className="text-xl font-bold flex items-center">
          <span className="mr-2">🔮</span>
          星座运势
        </h1>
        <p className="text-blue-100 text-sm mt-1">为您提供每日星座运势指导</p>
      </div>

      {/* 星座选择器 */}
      {renderMobileHoroscopeSelector()}

      <div className="px-3">
        {/* 加载状态 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">正在加载星座运势...</p>
          </div>
        )}

        {/* 错误显示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4 my-3">
            <p className="text-red-700 dark:text-red-300 text-sm text-center">{error}</p>
          </div>
        )}

        {/* 运势内容 */}
        {!loading && !error && horoscopeGuidance && userHoroscope ? (
          renderMobileHoroscopeCard()
        ) : !loading && !error && !userHoroscope ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4 opacity-50">🔮</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              请选择您的星座
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              点击上方星座按钮，查看您的每日运势
            </p>
          </div>
        ) : null}

        {/* 底部信息 */}
        {!loading && !error && horoscopeGuidance && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-400 dark:text-gray-500 text-xs">
              数据更新时间：{new Date().toLocaleString('zh-CN', { 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
            <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-1">
              星座运势仅供参考，请理性看待
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoroscopeTab;