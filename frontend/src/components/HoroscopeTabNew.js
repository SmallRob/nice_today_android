import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { userConfigManager } from '../utils/userConfigManager';
import * as horoscopeAlgorithm from '../utils/horoscopeAlgorithm';
import {
  initializeHoroscopeCache
} from '../utils/horoscopeCache';
import {
  debounce,
  initializePerformanceOptimization
} from '../utils/performanceOptimization';
import performanceMonitor from '../utils/performanceMonitor';
import { getToday } from '../utils/timeCache';
import '../styles/mobileOptimization.css';
import '../styles/animations.css';

// 解构赋值确保函数正确导入
const { 
  HOROSCOPE_DATA_ENHANCED, 
  generateDailyHoroscope 
} = horoscopeAlgorithm;

// 创建别名以保持向后兼容性
const getHoroscopeData = () => HOROSCOPE_DATA_ENHANCED;

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
        // 检查函数是否存在再初始化性能优化
        if (typeof initializePerformanceOptimization === 'function') {
          initializePerformanceOptimization();
        }
        
        // 检查函数是否存在再初始化缓存管理器
        if (typeof initializeHoroscopeCache === 'function') {
          initializeHoroscopeCache();
        }
      } catch (error) {
        console.error('优化初始化失败:', error);
        setError('初始化失败: ' + error.message);
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

  // 优化的模块化运势数据计算
  const calculateHoroscopeData = useCallback((horoscope, date) => {
    try {
      // 检查函数是否存在并添加类型验证
      if (typeof generateDailyHoroscope !== 'function') {
        throw new Error('星座数据生成函数未正确加载');
      }
      
      // 模块化计算步骤
      // 第一步：基础数据生成
      const basicData = generateDailyHoroscope(horoscope, date);
      
      if (!basicData) {
        throw new Error('无法生成基础星座数据');
      }
      
      // 第二步：增强数据处理
      const enhancedData = {
        ...basicData,
        calculatedAt: new Date().toISOString(),
        calculationMethod: 'modular'
      };
      
      // 第三步：验证数据完整性
      const requiredFields = ['horoscopeInfo', 'dailyForecast', 'recommendations'];
      for (const field of requiredFields) {
        if (!enhancedData[field]) {
          console.warn(`缺少必要字段: ${field}`);
        }
      }
      
      return enhancedData;
    } catch (error) {
      console.error('计算星座运势数据失败:', error);
      throw error;
    }
  }, []);

  // 优化的加载函数 - 使用时间缓存确保准确性
  const loadHoroscopeGuidance = useCallback(async (horoscope = userHoroscope, date) => {
    if (!horoscope) return Promise.resolve();

    // 使用缓存的当前时间，确保所有组件使用一致的日期
    const currentDate = date || getToday();
    
    // 确保性能监控函数存在再调用
    if (typeof performanceMonitor?.start === 'function') {
      performanceMonitor.start();
    }
    
    setLoading(true);
    setError(null);

    try {
      // 使用模块化计算
      const horoscopeData = calculateHoroscopeData(horoscope, currentDate);
      setHoroscopeGuidance(horoscopeData);
      return Promise.resolve(horoscopeData);
    } catch (error) {
      console.error('加载星座运势失败:', error);
      setError(error.message || '加载失败');
      return Promise.reject(error);
    } finally {
      setLoading(false);
      // 确保性能监控函数存在再调用
      if (typeof performanceMonitor?.end === 'function') {
        performanceMonitor.end('加载星座运势数据');
      }
    }
  }, [calculateHoroscopeData]);

  // 防抖版本的加载函数，用于用户快速切换时避免多次请求
  const debouncedLoadHoroscopeGuidance = useMemo(
    () => debounce(loadHoroscopeGuidance, 300),
    [loadHoroscopeGuidance]
  );

  // 初始化组件 - 优化为优先获取用户数据
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        // 确保用户配置管理器已初始化
        if (!userConfigManager.initialized) {
          await userConfigManager.initialize();
        }
        
        // 获取用户星座
        const userZodiac = getUserZodiac();
        
        // 如果用户有配置星座，优先使用；否则使用白羊座
        const initialHoroscope = userZodiac || '白羊座';
        
        if (isMounted) {
          setUserHoroscope(initialHoroscope);
          setIsTemporaryHoroscope(!userZodiac); // 如果不是用户配置的星座，标记为临时
          isTemporaryRef.current = !userZodiac;
          setInitialized(true);
          setDataLoaded(false); // 标记需要加载运势数据
        }
      } catch (error) {
        console.error('初始化星座运程组件失败:', error);
        // 降级处理
        if (isMounted) {
          setUserHoroscope('白羊座');
          setIsTemporaryHoroscope(true);
          isTemporaryRef.current = true;
          setInitialized(true);
          setDataLoaded(false);
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

  // 当星座变化时重新加载数据 - 使用时间缓存确保一致性
  useEffect(() => {
    if (!userHoroscope || !initialized) return;
    
    // 立即加载数据，不使用防抖，确保实时响应
    if (!dataLoaded) {
      // 直接调用，不使用防抖，确保立即计算新数据
      loadHoroscopeGuidance(userHoroscope, getToday())
        .then(() => {
          if (typeof setDataLoaded === 'function') {
            setDataLoaded(true);
          }
        })
        .catch(error => {
          console.error('加载星座数据失败:', error);
          setError('加载失败: ' + error.message);
        });
    }
  }, [userHoroscope, loadHoroscopeGuidance, initialized, dataLoaded]);

  // 处理星座选择 - 实时计算，不缓存旧数据
  const handleHoroscopeChange = useCallback((horoscope) => {
    if (userHoroscope !== horoscope) {
      setUserHoroscope(horoscope);
      // 标记为临时选择（如果不是用户配置的星座）
      setIsTemporaryHoroscope(horoscope !== getUserZodiac());
      isTemporaryRef.current = horoscope !== getUserZodiac();
      
      // 立即重置数据，确保不会显示旧数据
      setHoroscopeGuidance(null);
      setError(null);
      // 标记需要重新加载数据
      setDataLoaded(false);
    }
  }, [userHoroscope, getUserZodiac]);

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
      <div className="space-y-2.5">
        {/* 综合分数卡片 - 突出显示 */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-3 text-white shadow-md transform transition-all duration-300 hover:scale-102 active:scale-98 mobile-card" style={{ touchAction: 'manipulation' }}>
          <div className="text-center mb-2.5">
            <h3 className="text-sm md:text-base font-medium mb-1 opacity-90 mobile-responsive-heading">今日运势</h3>
            <div className="text-2xl md:text-3xl font-bold mb-1 drop-shadow-md">{overallScore}<span className="text-sm md:text-base opacity-75">分</span></div>
            <p className="text-blue-100 text-xs font-medium mobile-text mobile-responsive-text">{overallScore > 75 ? '运势极佳' : overallScore > 60 ? '运势良好' : overallScore > 45 ? '运势平稳' : '运势一般'}</p>
          </div>
              
          <div className="grid grid-cols-4 gap-1">
            {scores.map((item, index) => (
              <div key={index} className="text-center bg-white bg-opacity-10 rounded p-1 backdrop-blur-sm mobile-animation">
                <div className="text-sm md:text-base mb-1">{item.icon}</div>
                <div className="text-base font-bold">{item.score}</div>
                <div className="text-xs opacity-90 mobile-text">{item.name}</div>
              </div>
            ))}
          </div>
              
          {/* 分数排序 */}
          <div className="mt-2.5 flex justify-center items-center text-xs bg-white bg-opacity-10 rounded-full px-2.5 py-1 backdrop-blur-sm mobile-animation">
            <span className="mr-1.5 font-medium mobile-text mobile-responsive-text">运势最强:</span>
            <span className="flex items-center font-bold mobile-text mobile-responsive-text">
              <span className="mr-1">{sortedScores[0].icon}</span>
              <span className="text-xs">{sortedScores[0].name}</span>
            </span>
          </div>
        </div>

        {/* 今日运势描述 - 优化版 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 shadow border-l-4 border-blue-500 transition-all duration-200 hover:shadow-sm active:scale-98" style={{ touchAction: 'manipulation' }}>
          <h4 className="font-bold text-gray-800 dark:text-white mb-1.5 flex items-center">
            <span className="mr-1 text-xs">📝</span>
            <span className="text-xs md:text-sm mobile-responsive-heading font-medium">今日运势</span>
          </h4>
          <p className="text-gray-700 dark:text-gray-200 text-xs leading-relaxed mobile-text mobile-responsive-text">
            {overallDescription}
          </p>
        </div>

        {/* 爱情提醒 */}
        <div className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-lg p-2.5 shadow border border-pink-100 dark:border-pink-800 transition-all duration-200 hover:shadow-xs active:scale-98" style={{ touchAction: 'manipulation' }}>
          <h4 className="font-bold text-pink-700 dark:text-pink-300 mb-1 flex items-center mobile-responsive-heading text-xs">
            <span className="mr-1 text-xs">💖</span>爱情提醒 - 来自生辰
          </h4>
          <p className="text-pink-600 dark:text-pink-400 text-xs leading-relaxed mobile-text mobile-responsive-text">
            {String(recommendations.dailyReminder || '今天会是美好的一天')}
          </p>
        </div>

        {/* 建议 - 突出显示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-2.5 shadow border-l-4 border-green-500 transform transition-all duration-200 hover:scale-102 active:scale-98" style={{ touchAction: 'manipulation' }}>
            <h4 className="font-bold text-green-700 dark:text-green-300 mb-1.5 flex items-center text-xs mobile-responsive-heading">
              <span className="mr-1 text-xs">✅</span>
              宜做
            </h4>
            <p className="text-green-700 dark:text-green-400 text-xs leading-relaxed mobile-text mobile-responsive-text">{String(recommendations.positiveAdvice || '保持积极心态')}</p>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 rounded-lg p-2.5 shadow border-l-4 border-red-500 transform transition-all duration-200 hover:scale-102 active:scale-98" style={{ touchAction: 'manipulation' }}>
            <h4 className="font-bold text-red-700 dark:text-red-300 mb-1.5 flex items-center text-xs mobile-responsive-heading">
              <span className="mr-1 text-xs">❌</span>
              忌做
            </h4>
            <p className="text-red-700 dark:text-red-400 text-xs leading-relaxed mobile-text mobile-responsive-text">{String(recommendations.avoidAdvice || '避免消极思维')}</p>
          </div>
        </div>

        {/* 心灵问答 */}
        {recommendations.soulQuestion && typeof recommendations.soulQuestion === 'object' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-2.5 shadow border border-blue-100 dark:border-blue-800">
            <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center mobile-responsive-heading text-xs">
              <span className="mr-1 text-xs">❓</span>问 {String(recommendations.soulQuestion.question || '今日问题')}
            </h4>
            <p className="text-blue-600 dark:text-blue-400 text-xs mobile-text mobile-responsive-text">
              {String(recommendations.soulQuestion.answer || '今日解答')}
            </p>
          </div>
        )}

        {/* 幸运物品网格 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow transition-all duration-200 hover:shadow-sm mobile-card" style={{ touchAction: 'manipulation' }}>
          <h4 className="font-bold text-gray-800 dark:text-white mb-2 text-center mobile-responsive-heading text-sm">✨ 今日幸运物</h4>
                
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {/* 幸运色 */}
            <div className="text-center px-1">
              <div className="flex justify-center mb-1">
                <div 
                  className="w-7 h-7 rounded-full border-2 border-white shadow transition-transform duration-200 hover:scale-110 active:scale-95"
                  style={{ backgroundColor: (Array.isArray(recommendations.luckyColors) && recommendations.luckyColors[0]) ? recommendations.luckyColors[0] : '#FF6B6B', touchAction: 'manipulation' }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mobile-text">幸运色</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mobile-text">
                {String((Array.isArray(recommendations.luckyColors) && recommendations.luckyColors[0]) ? recommendations.luckyColors[0].replace('#', '') : 'FF6B6B')}
              </div>
            </div>
        
            {/* 幸运配饰 */}
            <div className="text-center px-1">
              <div className="text-base mb-1 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>💎</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mobile-text">幸运配饰</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mobile-text">
                {String(recommendations.luckyAccessory || '幸运配饰')}
              </div>
            </div>
        
            {/* 幸运时辰 */}
            <div className="text-center px-1">
              <div className="text-base mb-1 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🕒</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mobile-text">幸运时辰</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mobile-text">
                {String(recommendations.luckyTime || '上午9-11点')}
              </div>
            </div>
        
            {/* 幸运方位 */}
            <div className="text-center px-1">
              <div className="text-base mb-1 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🧭</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mobile-text">幸运方位</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mobile-text">
                {String(recommendations.luckyDirection || '东方')}
              </div>
            </div>
        
            {/* 幸运数字 */}
            <div className="text-center px-1">
              <div className="text-base mb-1 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🔢</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mobile-text">幸运数字</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mobile-text">
                {Array.isArray(recommendations.luckyNumbers) ? recommendations.luckyNumbers.join('/') : String(recommendations.luckyNumbers || '7')}
              </div>
            </div>
        
            {/* 幸运食物 */}
            <div className="text-center px-1">
              <div className="text-base mb-1 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🍵</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mobile-text">幸运食物</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mobile-text">
                {String(recommendations.luckyFood || '水果')}
              </div>
            </div>
        
            {/* 幸运随身物 */}
            <div className="text-center px-1">
              <div className="text-base mb-1 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>📓</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mobile-text">幸运随身物</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mobile-text">
                {String(recommendations.luckyItem || '幸运物品')}
              </div>
            </div>
        
            {/* 幸运花 */}
            <div className="text-center px-1">
              <div className="text-base mb-1 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🌻</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mobile-text">幸运花</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mobile-text">
                {String(recommendations.luckyFlower || '向日葵')}
              </div>
            </div>
          </div>
        </div>

        {/* 星座信息 - 精简版 */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg p-2.5 shadow border-l-4 border-purple-500 transition-all duration-200 hover:shadow-xs active:scale-98" style={{ touchAction: 'manipulation' }}>
          <div className="flex items-center">
            <span className="text-lg mr-2 bg-white rounded-full p-1 shadow transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>{horoscopeGuidance.horoscopeInfo.icon}</span>
            <div>
              <h4 className="font-bold text-purple-700 dark:text-purple-300 text-xs mobile-responsive-heading">
                {userHoroscope}
              </h4>
              <p className="text-purple-600 dark:text-purple-400 text-xs mobile-text mobile-responsive-text">
                {horoscopeGuidance.horoscopeInfo.element} · {horoscopeGuidance.horoscopeInfo.dateRange}
              </p>
            </div>
          </div>
        </div>

        {/* 相容星座 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow transition-all duration-200 hover:shadow-xs mobile-card" style={{ touchAction: 'manipulation' }}>
          <h4 className="font-bold text-gray-800 dark:text-white mb-1.5 mobile-responsive-heading text-xs">🤝 相容星座</h4>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(recommendations.compatibleSigns) ? recommendations.compatibleSigns.map((sign, index) => (
              <span 
                key={index} 
                className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 rounded-full text-xs text-blue-700 dark:text-blue-300 transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-800 active:scale-95 cursor-pointer"
                style={{ touchAction: 'manipulation' }}
              >
                {String(sign)}
              </span>
            )) : null}
          </div>
        </div>

        {/* 月亮星座 */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-2 shadow border border-indigo-100 dark:border-indigo-800 mobile-card transition-all duration-200 hover:shadow-xs active:scale-98" style={{ touchAction: 'manipulation' }}>
          <div className="flex items-center">
            <span className="text-sm mr-1 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🌙</span>
            <div>
              <h4 className="font-bold text-indigo-700 dark:text-indigo-300 text-xs mobile-responsive-heading">今日月亮星座</h4>
              <p className="text-indigo-600 dark:text-indigo-400 text-xs mobile-text mobile-responsive-text">{String(recommendations.todayMoonSign || '未知')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 移动端星座选择器 - 优化为网格布局
  const renderMobileHoroscopeSelector = () => {
    return (
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 pb-3 pt-2 shadow-sm">
        {/* 标题区域 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-b-lg p-3 shadow-md hardware-accelerated mb-3">
          <h1 className="text-base md:text-lg font-bold flex items-center mobile-responsive-heading font-rendering-optimized">
            <span className="mr-2 text-lg">🔮</span>
            <span>星座运势</span>
          </h1>
          <p className="text-blue-100 text-xs mt-1 mobile-text font-rendering-optimized">为您提供每日星座运势指导</p>
        </div>
        
        <div className="mb-2 px-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 mobile-text mobile-responsive-text">
            选择星座查看运势
          </label>
          {/* 使用网格布局替代横向滚动 */}
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 px-1">
            {getHoroscopeData() && Array.isArray(getHoroscopeData()) ? getHoroscopeData().map((horoscope) => {
              const isActive = userHoroscope === horoscope.name;
              return (
                <button
                  key={horoscope.name}
                  onClick={() => handleHoroscopeChange(horoscope.name)}
                  className={`flex flex-col items-center justify-center rounded-lg transition-all relative overflow-hidden transform mobile-animation ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95'
                  }`}
                  style={{ 
                    touchAction: 'manipulation',
                    minHeight: '52px' // 紧凑型设计
                  }}
                >
                  {/* 选中状态的高亮效果 */}
                  {isActive && (
                    <>
                      <span className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-pulse"></span>
                      <span className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    </>
                  )}
                  <span className="text-lg mb-0.5">{horoscope.icon}</span>
                  <span className="text-xs font-bold">{horoscope.name.replace('座', '')}</span>
                </button>
              );
            }) : null}
          </div>
        </div>
        
        {isTemporaryHoroscope && (
          <div className="mx-2 mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-2 text-sm">⚠️</span>
                <span className="text-yellow-700 dark:text-yellow-300 text-xs mobile-text mobile-responsive-text">
                  临时查看 {userHoroscope} 的运势
                </span>
              </div>
              <button
                onClick={handleRestoreUserHoroscope}
                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors active:scale-95 mobile-button mobile-responsive-text"
                style={{ touchAction: 'manipulation' }}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 animate-fade-in performance-optimized safe-area-inset-top touch-responsive">
      {/* 星座选择器 */}
      {renderMobileHoroscopeSelector()}

      <div className="px-2">
        {/* 优化的加载状态 - 骨架屏 */}
        {loading && (
          <div className="space-y-2.5">
            {/* 综合分数骨架屏 */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-3 text-white shadow">
              <div className="text-center mb-2.5">
                <div className="h-4 bg-white bg-opacity-20 rounded w-24 mx-auto mb-1.5 animate-pulse"></div>
                <div className="h-10 w-16 bg-white bg-opacity-20 rounded mx-auto mb-1.5 animate-pulse"></div>
                <div className="h-2.5 bg-white bg-opacity-10 rounded w-28 mx-auto animate-pulse"></div>
              </div>
                          
              <div className="grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-4 w-4 bg-white bg-opacity-20 rounded-full mx-auto mb-1 animate-pulse"></div>
                    <div className="h-4 w-5 bg-white bg-opacity-20 rounded mx-auto mb-1 animate-pulse"></div>
                    <div className="h-1.5 w-8 bg-white bg-opacity-10 rounded mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
        
            {/* 运势描述骨架屏 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 shadow">
              <div className="h-3.5 w-14 bg-gray-200 dark:bg-gray-700 rounded mb-1.5 animate-pulse"></div>
              <div className="space-y-1">
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse"></div>
              </div>
            </div>
        
            {/* 建议骨架屏 */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-2.5 shadow border border-green-100 dark:border-green-800">
                <div className="h-2.5 w-9 bg-green-200 dark:bg-green-800 rounded mb-1.5 animate-pulse"></div>
                <div className="h-8 bg-green-100 dark:bg-green-900 rounded animate-pulse"></div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg p-2.5 shadow border border-red-100 dark:border-red-800">
                <div className="h-2.5 w-9 bg-red-200 dark:bg-red-800 rounded mb-1.5 animate-pulse"></div>
                <div className="h-8 bg-red-100 dark:bg-red-900 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {/* 错误显示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-2.5 my-2 mobile-error mobile-animation">
            <p className="text-red-700 dark:text-red-300 text-xs text-center mobile-text">{error}</p>
          </div>
        )}

        {/* 运势内容 */}
        {!loading && !error && horoscopeGuidance && userHoroscope ? (
          renderMobileHoroscopeCard()
        ) : !loading && !error && !userHoroscope ? (
          <div className="text-center py-5">
            <div className="text-2xl mb-1.5 opacity-50">🔮</div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 mobile-responsive-heading">
              请选择您的星座
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mobile-text">
              点击上方星座按钮，查看您的每日运势
            </p>
          </div>
        ) : null}

        {/* 底部信息 */}
        {!loading && !error && horoscopeGuidance && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 mobile-responsive-text">
            <p className="text-center text-gray-400 dark:text-gray-500 text-xs mobile-text">
              数据更新时间：{new Date().toLocaleString('zh-CN', { 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
            <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-1 mobile-text">
              星座运势仅供参考，请理性看待
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoroscopeTab;