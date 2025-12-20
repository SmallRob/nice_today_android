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

  // 渲染统一风格的运势卡片 - 采用生肖能量页面样式
  const renderHoroscopeCard = () => {
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
      <div className="space-y-3 p-3 dress-health-scroll-content">
        {/* 综合分数卡片 - 采用统一风格 */}
        <div className="horoscope-score-container rounded-lg p-4 text-white shadow-lg" style={{ touchAction: 'manipulation' }}>
          <div className="text-center mb-3">
            <h3 className="horoscope-title text-base md:text-lg font-bold mb-2 opacity-90">今日运势</h3>
            <div className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-md">{overallScore}<span className="text-base md:text-lg opacity-75">分</span></div>
            <p className="horoscope-subtitle text-white/90 font-medium">{overallScore > 75 ? '运势极佳' : overallScore > 60 ? '运势良好' : overallScore > 45 ? '运势平稳' : '运势一般'}</p>
          </div>
              
          <div className="grid grid-cols-4 gap-2">
            {scores.map((item, index) => (
              <div key={index} className="text-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                <div className="text-lg mb-1">{item.icon}</div>
                <div className="text-lg font-bold">{item.score}</div>
                <div className="horoscope-subtitle text-xs opacity-90">{item.name}</div>
              </div>
            ))}
          </div>
              
          {/* 分数排序 */}
          <div className="mt-3 flex justify-center items-center text-sm bg-white/10 rounded-full px-3 py-2 backdrop-blur-sm">
            <span className="mr-2 font-medium horoscope-subtitle">运势最强:</span>
            <span className="flex items-center font-bold horoscope-subtitle">
              <span className="mr-1">{sortedScores[0].icon}</span>
              <span className="text-sm">{sortedScores[0].name}</span>
            </span>
          </div>
        </div>

        {/* 今日运势描述 - 采用统一风格 */}
        <div className="horoscope-card rounded-lg p-3" style={{ touchAction: 'manipulation' }}>
          <h4 className="horoscope-title text-gray-800 dark:text-white mb-2 flex items-center">
            <span className="mr-2">📝</span>
            <span className="text-sm font-bold">今日运势</span>
          </h4>
          <p className="horoscope-subtitle text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
            {overallDescription}
          </p>
        </div>

        {/* 爱情提醒 */}
        <div className="horoscope-card rounded-lg p-3 border-l-4 border-pink-500" style={{ touchAction: 'manipulation' }}>
          <h4 className="horoscope-title text-pink-700 dark:text-pink-300 mb-2 flex items-center">
            <span className="mr-2">💖</span>爱情提醒 - 来自生辰
          </h4>
          <p className="horoscope-subtitle text-pink-600 dark:text-pink-400 text-sm leading-relaxed">
            {String(recommendations.dailyReminder || '今天会是美好的一天')}
          </p>
        </div>

        {/* 建议 - 采用统一风格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="horoscope-card rounded-lg p-3 border-l-4 border-green-500" style={{ touchAction: 'manipulation' }}>
            <h4 className="horoscope-title text-green-700 dark:text-green-300 mb-2 flex items-center">
              <span className="mr-2">✅</span>
              宜做
            </h4>
            <p className="horoscope-subtitle text-green-700 dark:text-green-400 text-sm leading-relaxed">{String(recommendations.positiveAdvice || '保持积极心态')}</p>
          </div>
          <div className="horoscope-card rounded-lg p-3 border-l-4 border-red-500" style={{ touchAction: 'manipulation' }}>
            <h4 className="horoscope-title text-red-700 dark:text-red-300 mb-2 flex items-center">
              <span className="mr-2">❌</span>
              忌做
            </h4>
            <p className="horoscope-subtitle text-red-700 dark:text-red-400 text-sm leading-relaxed">{String(recommendations.avoidAdvice || '避免消极思维')}</p>
          </div>
        </div>

        {/* 心灵问答 */}
        {recommendations.soulQuestion && typeof recommendations.soulQuestion === 'object' && (
          <div className="horoscope-card rounded-lg p-3 border-l-4 border-blue-500">
            <h4 className="horoscope-title text-blue-700 dark:text-blue-300 mb-2 flex items-center">
              <span className="mr-2">❓</span>问 {String(recommendations.soulQuestion.question || '今日问题')}
            </h4>
            <p className="horoscope-subtitle text-blue-600 dark:text-blue-400 text-sm leading-relaxed">
              {String(recommendations.soulQuestion.answer || '今日解答')}
            </p>
          </div>
        )}

        {/* 幸运物品网格 */}
        <div className="horoscope-card rounded-lg p-4" style={{ touchAction: 'manipulation' }}>
          <h4 className="horoscope-title text-gray-800 dark:text-white mb-3 text-center">✨ 今日幸运物</h4>
                
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* 幸运色 */}
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow transition-transform duration-200 hover:scale-110 active:scale-95"
                  style={{ backgroundColor: (Array.isArray(recommendations.luckyColors) && recommendations.luckyColors[0]) ? recommendations.luckyColors[0] : '#FF6B6B', touchAction: 'manipulation' }}
                ></div>
              </div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-xs">幸运色</div>
              <div className="horoscope-subtitle text-gray-700 dark:text-gray-300 text-sm font-medium">
                {String((Array.isArray(recommendations.luckyColors) && recommendations.luckyColors[0]) ? recommendations.luckyColors[0].replace('#', '') : 'FF6B6B')}
              </div>
            </div>
        
            {/* 幸运配饰 */}
            <div className="text-center">
              <div className="text-lg mb-2 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>💎</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-xs">幸运配饰</div>
              <div className="horoscope-subtitle text-gray-700 dark:text-gray-300 text-sm font-medium">
                {String(recommendations.luckyAccessory || '幸运配饰')}
              </div>
            </div>
        
            {/* 幸运时辰 */}
            <div className="text-center">
              <div className="text-lg mb-2 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🕒</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-xs">幸运时辰</div>
              <div className="horoscope-subtitle text-gray-700 dark:text-gray-300 text-sm font-medium">
                {String(recommendations.luckyTime || '上午9-11点')}
              </div>
            </div>
        
            {/* 幸运方位 */}
            <div className="text-center">
              <div className="text-lg mb-2 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🧭</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-xs">幸运方位</div>
              <div className="horoscope-subtitle text-gray-700 dark:text-gray-300 text-sm font-medium">
                {String(recommendations.luckyDirection || '东方')}
              </div>
            </div>
        
            {/* 幸运数字 */}
            <div className="text-center">
              <div className="text-lg mb-2 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🔢</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-xs">幸运数字</div>
              <div className="horoscope-subtitle text-gray-700 dark:text-gray-300 text-sm font-medium">
                {Array.isArray(recommendations.luckyNumbers) ? recommendations.luckyNumbers.join('/') : String(recommendations.luckyNumbers || '7')}
              </div>
            </div>
        
            {/* 幸运食物 */}
            <div className="text-center">
              <div className="text-lg mb-2 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🍵</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-xs">幸运食物</div>
              <div className="horoscope-subtitle text-gray-700 dark:text-gray-300 text-sm font-medium">
                {String(recommendations.luckyFood || '水果')}
              </div>
            </div>
        
            {/* 幸运随身物 */}
            <div className="text-center">
              <div className="text-lg mb-2 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>📓</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-xs">幸运随身物</div>
              <div className="horoscope-subtitle text-gray-700 dark:text-gray-300 text-sm font-medium">
                {String(recommendations.luckyItem || '幸运物品')}
              </div>
            </div>
        
            {/* 幸运花 */}
            <div className="text-center">
              <div className="text-lg mb-2 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🌻</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-xs">幸运花</div>
              <div className="horoscope-subtitle text-gray-700 dark:text-gray-300 text-sm font-medium">
                {String(recommendations.luckyFlower || '向日葵')}
              </div>
            </div>
          </div>
        </div>

        {/* 星座信息 */}
        <div className="horoscope-card rounded-lg p-3 border-l-4 border-purple-500" style={{ touchAction: 'manipulation' }}>
          <div className="flex items-center">
            <span className="text-xl mr-3 bg-white dark:bg-gray-700 rounded-full p-2 shadow transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>{horoscopeGuidance.horoscopeInfo.icon}</span>
            <div>
              <h4 className="horoscope-title text-purple-700 dark:text-purple-300 text-sm">
                {userHoroscope}
              </h4>
              <p className="horoscope-subtitle text-purple-600 dark:text-purple-400 text-xs">
                {horoscopeGuidance.horoscopeInfo.element} · {horoscopeGuidance.horoscopeInfo.dateRange}
              </p>
            </div>
          </div>
        </div>

        {/* 相容星座 */}
        <div className="horoscope-card rounded-lg p-3" style={{ touchAction: 'manipulation' }}>
          <h4 className="horoscope-title text-gray-800 dark:text-white mb-2">🤝 相容星座</h4>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(recommendations.compatibleSigns) ? recommendations.compatibleSigns.map((sign, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-xs text-blue-700 dark:text-blue-300 transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-800 active:scale-95 cursor-pointer"
                style={{ touchAction: 'manipulation' }}
              >
                {String(sign)}
              </span>
            )) : null}
          </div>
        </div>

        {/* 月亮星座 */}
        <div className="horoscope-card rounded-lg p-3 border-l-4 border-indigo-500" style={{ touchAction: 'manipulation' }}>
          <div className="flex items-center">
            <span className="text-lg mr-2 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🌙</span>
            <div>
              <h4 className="horoscope-title text-indigo-700 dark:text-indigo-300 text-sm">今日月亮星座</h4>
              <p className="horoscope-subtitle text-indigo-600 dark:text-indigo-400 text-sm">{String(recommendations.todayMoonSign || '未知')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 统一风格的星座选择器 - 采用生肖能量页面样式
  const renderHoroscopeSelector = () => {
    return (
      <div className="dress-health-fixed-header">
        {/* 标题区域 - 采用五行道家养生风格 */}
        <div className="taoist-wuxing-banner text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-800 dark:from-gray-800 dark:via-gray-900 dark:to-black">
          <div className="p-3 md:p-4">
            <h1 className="horoscope-title text-lg md:text-xl font-bold text-center mb-1">
              <span className="mr-2">🔮</span>
              星座运势
            </h1>
            <p className="horoscope-subtitle text-xs md:text-sm text-center text-white/90">
              为您提供每日星座运势指导
            </p>
          </div>
          
          {/* 动态背景效果 */}
          <div className="absolute inset-0 opacity-20 animate-pulse">
            <div className="wuxing-gradient"></div>
          </div>
        </div>
        
        {/* 星座选择器 - 采用网格布局 */}
        <div className="px-3 py-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 horoscope-subtitle">
            选择星座查看运势
          </label>
          
          <div className="horoscope-zodiac-selector">
            {getHoroscopeData() && Array.isArray(getHoroscopeData()) ? getHoroscopeData().map((horoscope) => {
              const isActive = userHoroscope === horoscope.name;
              return (
                <button
                  key={horoscope.name}
                  onClick={() => handleHoroscopeChange(horoscope.name)}
                  className={`horoscope-zodiac-button ${isActive ? 'active' : ''}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="text-lg mb-0.5">{horoscope.icon}</span>
                  <span className="text-xs font-bold horoscope-subtitle">{horoscope.name.replace('座', '')}</span>
                </button>
              );
            }) : null}
          </div>
        </div>
        
        {/* 临时查看提示 */}
        {isTemporaryHoroscope && (
          <div className="px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-y border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-2 text-sm">⚠️</span>
                <span className="text-yellow-700 dark:text-yellow-300 text-xs horoscope-subtitle">
                  临时查看 {userHoroscope} 的运势
                </span>
              </div>
              <button
                onClick={handleRestoreUserHoroscope}
                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
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
    <div className="h-full bg-gray-50 dark:bg-gray-900 dress-health-scroll-container">
      {/* 星座选择器 - 固定头部 */}
      {renderHoroscopeSelector()}

      {/* 内容区域 - 独立滚动 */}
      <div className="flex-1 overflow-hidden taoist-scroll-area">
        <div 
          className="h-full overflow-y-auto optimized-scroll hide-scrollbar performance-optimized scroll-performance-optimized touch-optimized virtual-scroll-container taoist-content-scroll"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            overscrollBehavior: 'contain',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'scroll-position'
          }}
        >
          <div className="px-3 py-4">
            {/* 优化的加载状态 - 骨架屏 */}
            {loading && (
              <div className="space-y-3">
                {/* 综合分数骨架屏 */}
                <div className="horoscope-score-container rounded-lg p-4 text-white shadow">
                  <div className="text-center mb-3">
                    <div className="h-4 bg-white/20 rounded w-24 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-12 w-20 bg-white/20 rounded mx-auto mb-2 animate-pulse"></div>
                    <div className="h-3 bg-white/10 rounded w-32 mx-auto animate-pulse"></div>
                  </div>
                              
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="text-center">
                        <div className="h-6 w-6 bg-white/20 rounded-full mx-auto mb-1 animate-pulse"></div>
                        <div className="h-6 w-8 bg-white/20 rounded mx-auto mb-1 animate-pulse"></div>
                        <div className="h-2 w-10 bg-white/10 rounded mx-auto animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
            
                {/* 运势描述骨架屏 */}
                <div className="horoscope-card rounded-lg p-3">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                  <div className="space-y-1.5">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>
            
                {/* 建议骨架屏 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="horoscope-card rounded-lg p-3">
                    <div className="h-3 w-10 bg-green-200 dark:bg-green-800 rounded mb-2 animate-pulse"></div>
                    <div className="h-10 bg-green-100 dark:bg-green-900 rounded animate-pulse"></div>
                  </div>
                  <div className="horoscope-card rounded-lg p-3">
                    <div className="h-3 w-10 bg-red-200 dark:bg-red-800 rounded mb-2 animate-pulse"></div>
                    <div className="h-10 bg-red-100 dark:bg-red-900 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* 错误显示 */}
            {error && (
              <div className="horoscope-card rounded-lg p-3 border-l-4 border-red-500">
                <p className="horoscope-subtitle text-red-700 dark:text-red-300 text-sm text-center">{error}</p>
              </div>
            )}

            {/* 运势内容 */}
            {!loading && !error && horoscopeGuidance && userHoroscope ? (
              renderHoroscopeCard()
            ) : !loading && !error && !userHoroscope ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2 opacity-50">🔮</div>
                <h3 className="horoscope-title text-gray-700 dark:text-gray-300 mb-2">
                  请选择您的星座
                </h3>
                <p className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm">
                  点击上方星座按钮，查看您的每日运势
                </p>
              </div>
            ) : null}

            {/* 底部信息 */}
            {!loading && !error && horoscopeGuidance && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="horoscope-subtitle text-gray-400 dark:text-gray-500 text-xs text-center">
                  数据更新时间：{new Date().toLocaleString('zh-CN', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                <p className="horoscope-subtitle text-gray-400 dark:text-gray-500 text-xs mt-1 text-center">
                  星座运势仅供参考，请理性看待
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoroscopeTab;