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
      <div className="space-y-5">
        {/* 综合分数卡片 - 采用统一风格 */}
        <div className="horoscope-score-container rounded-xl p-5 text-white shadow-lg bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900">
          <div className="text-center mb-4">
            <h3 className="horoscope-title text-lg md:text-xl font-bold mb-2 opacity-90">今日运势</h3>
            <div className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-md">{overallScore}<span className="text-lg md:text-xl opacity-75">分</span></div>
            <p className="horoscope-subtitle text-white/90 font-medium">{overallScore > 75 ? '运势极佳' : overallScore > 60 ? '运势良好' : overallScore > 45 ? '运势平稳' : '运势一般'}</p>
          </div>
              
          <div className="grid grid-cols-4 gap-3">
            {scores.map((item, index) => (
              <div key={index} className="text-center bg-white/15 dark:bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-xl mb-2">{item.icon}</div>
                <div className="text-xl font-bold">{item.score}</div>
                <div className="horoscope-subtitle text-xs opacity-90 mt-1">{item.name}</div>
              </div>
            ))}
          </div>
              
          {/* 分数排序 */}
          <div className="mt-4 flex justify-center items-center text-sm bg-white/15 dark:bg-white/10 rounded-full px-4 py-2.5 backdrop-blur-sm">
            <span className="mr-2 font-medium horoscope-subtitle">运势最强:</span>
            <span className="flex items-center font-bold horoscope-subtitle">
              <span className="mr-1 text-lg">{sortedScores[0].icon}</span>
              <span className="text-sm">{sortedScores[0].name}</span>
            </span>
          </div>
        </div>

        {/* 今日运势描述 - 采用统一风格 */}
        <div className="horoscope-card rounded-xl p-4 bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700" style={{ touchAction: 'manipulation' }}>
          <h4 className="horoscope-title text-gray-800 dark:text-white mb-3 flex items-center">
            <span className="mr-2 text-lg">📝</span>
            <span className="font-bold">今日运势</span>
          </h4>
          <p className="horoscope-subtitle text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            {overallDescription}
          </p>
        </div>

        {/* 爱情提醒 */}
        <div className="horoscope-card rounded-xl p-4 bg-white dark:bg-gray-800 shadow border-l-4 border-pink-500 dark:border-pink-600 border-gray-200 dark:border-gray-700" style={{ touchAction: 'manipulation' }}>
          <h4 className="horoscope-title text-pink-700 dark:text-pink-300 mb-3 flex items-center">
            <span className="mr-2 text-lg">💖</span>爱情提醒 - 来自生辰
          </h4>
          <p className="horoscope-subtitle text-pink-600 dark:text-pink-400 text-base leading-relaxed">
            {String(recommendations.dailyReminder || '今天会是美好的一天')}
          </p>
        </div>

        {/* 建议 - 采用统一风格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="horoscope-card rounded-xl p-4 bg-white dark:bg-gray-800 shadow border-l-4 border-green-500 dark:border-green-600 border-gray-200 dark:border-gray-700" style={{ touchAction: 'manipulation' }}>
            <h4 className="horoscope-title text-green-700 dark:text-green-300 mb-3 flex items-center">
              <span className="mr-2 text-lg">✅</span>
              宜做
            </h4>
            <p className="horoscope-subtitle text-green-700 dark:text-green-400 text-base leading-relaxed">{String(recommendations.positiveAdvice || '保持积极心态')}</p>
          </div>
          <div className="horoscope-card rounded-xl p-4 bg-white dark:bg-gray-800 shadow border-l-4 border-red-500 dark:border-red-600 border-gray-200 dark:border-gray-700" style={{ touchAction: 'manipulation' }}>
            <h4 className="horoscope-title text-red-700 dark:text-red-300 mb-3 flex items-center">
              <span className="mr-2 text-lg">❌</span>
              忌做
            </h4>
            <p className="horoscope-subtitle text-red-700 dark:text-red-400 text-base leading-relaxed">{String(recommendations.avoidAdvice || '避免消极思维')}</p>
          </div>
        </div>

        {/* 心灵问答 */}
        {recommendations.soulQuestion && typeof recommendations.soulQuestion === 'object' && (
          <div className="horoscope-card rounded-xl p-4 bg-white dark:bg-gray-800 shadow border-l-4 border-blue-500 dark:border-blue-600 border-gray-200 dark:border-gray-700">
            <h4 className="horoscope-title text-blue-700 dark:text-blue-300 mb-3 flex items-center">
              <span className="mr-2 text-lg">❓</span>问 {String(recommendations.soulQuestion.question || '今日问题')}
            </h4>
            <p className="horoscope-subtitle text-blue-600 dark:text-blue-400 text-base leading-relaxed">
              {String(recommendations.soulQuestion.answer || '今日解答')}
            </p>
          </div>
        )}

        {/* 幸运物品网格 */}
        <div className="horoscope-card rounded-xl p-5 bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700" style={{ touchAction: 'manipulation' }}>
          <h4 className="horoscope-title text-gray-800 dark:text-white mb-4 text-center text-lg">✨ 今日幸运物</h4>
                
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 幸运色 */}
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div 
                  className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-300 shadow transition-transform duration-200 hover:scale-110 active:scale-95"
                  style={{ backgroundColor: (Array.isArray(recommendations.luckyColors) && recommendations.luckyColors[0]) ? recommendations.luckyColors[0] : '#FF6B6B', touchAction: 'manipulation' }}
                ></div>
              </div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm">幸运色</div>
              <div className="horoscope-subtitle text-gray-800 dark:text-gray-200 text-base font-medium mt-1">
                {String((Array.isArray(recommendations.luckyColors) && recommendations.luckyColors[0]) ? recommendations.luckyColors[0].replace('#', '') : 'FF6B6B')}
              </div>
            </div>
        
            {/* 幸运配饰 */}
            <div className="text-center">
              <div className="text-2xl mb-3 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>💎</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm">幸运配饰</div>
              <div className="horoscope-subtitle text-gray-800 dark:text-gray-200 text-base font-medium mt-1">
                {String(recommendations.luckyAccessory || '幸运配饰')}
              </div>
            </div>
        
            {/* 幸运时辰 */}
            <div className="text-center">
              <div className="text-2xl mb-3 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🕒</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm">幸运时辰</div>
              <div className="horoscope-subtitle text-gray-800 dark:text-gray-200 text-base font-medium mt-1">
                {String(recommendations.luckyTime || '上午9-11点')}
              </div>
            </div>
        
            {/* 幸运方位 */}
            <div className="text-center">
              <div className="text-2xl mb-3 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🧭</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm">幸运方位</div>
              <div className="horoscope-subtitle text-gray-800 dark:text-gray-200 text-base font-medium mt-1">
                {String(recommendations.luckyDirection || '东方')}
              </div>
            </div>
        
            {/* 幸运数字 */}
            <div className="text-center">
              <div className="text-2xl mb-3 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🔢</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm">幸运数字</div>
              <div className="horoscope-subtitle text-gray-800 dark:text-gray-200 text-base font-medium mt-1">
                {Array.isArray(recommendations.luckyNumbers) ? recommendations.luckyNumbers.join('/') : String(recommendations.luckyNumbers || '7')}
              </div>
            </div>
        
            {/* 幸运食物 */}
            <div className="text-center">
              <div className="text-2xl mb-3 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🍵</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm">幸运食物</div>
              <div className="horoscope-subtitle text-gray-800 dark:text-gray-200 text-base font-medium mt-1">
                {String(recommendations.luckyFood || '水果')}
              </div>
            </div>
        
            {/* 幸运随身物 */}
            <div className="text-center">
              <div className="text-2xl mb-3 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>📓</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm">幸运随身物</div>
              <div className="horoscope-subtitle text-gray-800 dark:text-gray-200 text-base font-medium mt-1">
                {String(recommendations.luckyItem || '幸运物品')}
              </div>
            </div>
        
            {/* 幸运花 */}
            <div className="text-center">
              <div className="text-2xl mb-3 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🌻</div>
              <div className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm">幸运花</div>
              <div className="horoscope-subtitle text-gray-800 dark:text-gray-200 text-base font-medium mt-1">
                {String(recommendations.luckyFlower || '向日葵')}
              </div>
            </div>
          </div>
        </div>

        {/* 星座信息 */}
        <div className="horoscope-card rounded-xl p-4 bg-white dark:bg-gray-800 shadow border-l-4 border-purple-500 dark:border-purple-600 border-gray-200 dark:border-gray-700" style={{ touchAction: 'manipulation' }}>
          <div className="flex items-center">
            <span className="text-2xl mr-4 bg-white dark:bg-gray-700 rounded-full p-3 shadow transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>{horoscopeGuidance.horoscopeInfo.icon}</span>
            <div>
              <h4 className="horoscope-title text-purple-700 dark:text-purple-300 text-lg font-bold">
                {userHoroscope}
              </h4>
              <p className="horoscope-subtitle text-purple-600 dark:text-purple-400 text-sm mt-1">
                {horoscopeGuidance.horoscopeInfo.element} · {horoscopeGuidance.horoscopeInfo.dateRange}
              </p>
            </div>
          </div>
        </div>

        {/* 相容星座 */}
        <div className="horoscope-card rounded-xl p-4 bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700" style={{ touchAction: 'manipulation' }}>
          <h4 className="horoscope-title text-gray-800 dark:text-white mb-3 text-lg">🤝 相容星座</h4>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(recommendations.compatibleSigns) ? recommendations.compatibleSigns.map((sign, index) => (
              <span 
                key={index} 
                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 rounded-full text-sm text-blue-700 dark:text-blue-300 transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-800 active:scale-95 cursor-pointer"
                style={{ touchAction: 'manipulation' }}
              >
                {String(sign)}
              </span>
            )) : null}
          </div>
        </div>

        {/* 月亮星座 */}
        <div className="horoscope-card rounded-xl p-4 bg-white dark:bg-gray-800 shadow border-l-4 border-indigo-500 dark:border-indigo-600 border-gray-200 dark:border-gray-700" style={{ touchAction: 'manipulation' }}>
          <div className="flex items-center">
            <span className="text-xl mr-3 transition-transform duration-200 hover:scale-110 active:scale-95" style={{ touchAction: 'manipulation' }}>🌙</span>
            <div>
              <h4 className="horoscope-title text-indigo-700 dark:text-indigo-300 text-lg">今日月亮星座</h4>
              <p className="horoscope-subtitle text-indigo-600 dark:text-indigo-400 text-base mt-1">{String(recommendations.todayMoonSign || '未知')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 统一风格的星座选择器 - 采用嵌入式布局
  const renderHoroscopeSelector = () => {
    return (
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
        {/* 标题区域 */}
        <div className="text-center mb-5">
          <h1 className="horoscope-title text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center">
            <span className="mr-2 text-2xl">🔮</span>
            星座运势
          </h1>
          <p className="horoscope-subtitle text-sm text-gray-600 dark:text-gray-400">
            为您提供每日星座运势指导
          </p>
        </div>
        
        {/* 星座选择器 - 采用3行4列网格布局 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 horoscope-subtitle">
            选择星座查看运势
          </label>
          
          <div className="grid grid-cols-4 gap-3 mb-2">
            {getHoroscopeData() && Array.isArray(getHoroscopeData()) ? getHoroscopeData().map((horoscope, index) => {
              const isActive = userHoroscope === horoscope.name;
              // 为了更好地实现3行4列布局，我们需要对12个星座进行合理排列
              return (
                <button
                  key={horoscope.name}
                  onClick={() => handleHoroscopeChange(horoscope.name)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${isActive 
                    ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="text-2xl mb-1">{horoscope.icon}</span>
                  <span className="text-xs font-bold horoscope-subtitle">{horoscope.name.replace('座', '')}</span>
                </button>
              );
            }) : null}
          </div>
        </div>
        
        {/* 临时查看提示 */}
        {isTemporaryHoroscope && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-2 text-lg">⚠️</span>
                <span className="text-yellow-700 dark:text-yellow-300 text-sm horoscope-subtitle">
                  临时查看 {userHoroscope} 的运势
                </span>
              </div>
              <button
                onClick={handleRestoreUserHoroscope}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 whitespace-nowrap"
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
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-4">
      {/* 星座选择器 - 嵌入页面内容 */}
      {renderHoroscopeSelector()}

      {/* 内容区域 */}
      <div className="rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4">
          <div className="space-y-5">
            {/* 优化的加载状态 - 骨架屏 */}
            {loading && (
              <div className="space-y-5">
                {/* 综合分数骨架屏 */}
                <div className="horoscope-score-container rounded-xl p-5 text-white shadow bg-gradient-to-r from-purple-600/20 to-indigo-700/20 dark:from-purple-800/20 dark:to-indigo-900/20">
                  <div className="text-center mb-4">
                    <div className="h-5 bg-white/20 rounded w-32 mx-auto mb-3 animate-pulse"></div>
                    <div className="h-14 w-24 bg-white/20 rounded mx-auto mb-3 animate-pulse"></div>
                    <div className="h-4 bg-white/10 rounded w-40 mx-auto animate-pulse"></div>
                  </div>
                              
                  <div className="grid grid-cols-4 gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="text-center">
                        <div className="h-8 w-8 bg-white/20 rounded-full mx-auto mb-2 animate-pulse"></div>
                        <div className="h-8 w-10 bg-white/20 rounded mx-auto mb-2 animate-pulse"></div>
                        <div className="h-3 w-12 bg-white/10 rounded mx-auto animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
            
                {/* 运势描述骨架屏 */}
                <div className="horoscope-card rounded-xl p-4 bg-gray-100 dark:bg-gray-700/50 shadow border border-gray-200 dark:border-gray-700">
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-600 rounded mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>
            
                {/* 建议骨架屏 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="horoscope-card rounded-xl p-4 bg-gray-100 dark:bg-gray-700/50 shadow border border-gray-200 dark:border-gray-700">
                    <div className="h-4 w-12 bg-green-200 dark:bg-green-800 rounded mb-3 animate-pulse"></div>
                    <div className="h-12 bg-green-100 dark:bg-green-900/50 rounded animate-pulse"></div>
                  </div>
                  <div className="horoscope-card rounded-xl p-4 bg-gray-100 dark:bg-gray-700/50 shadow border border-gray-200 dark:border-gray-700">
                    <div className="h-4 w-12 bg-red-200 dark:bg-red-800 rounded mb-3 animate-pulse"></div>
                    <div className="h-12 bg-red-100 dark:bg-red-900/50 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* 错误显示 */}
            {error && (
              <div className="horoscope-card rounded-xl p-4 bg-white dark:bg-gray-800 shadow border-l-4 border-red-500 dark:border-red-600 border-gray-200 dark:border-gray-700">
                <p className="horoscope-subtitle text-red-700 dark:text-red-300 text-base text-center">{error}</p>
              </div>
            )}

            {/* 运势内容 */}
            {!loading && !error && horoscopeGuidance && userHoroscope ? (
              renderHoroscopeCard()
            ) : !loading && !error && !userHoroscope ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-3 opacity-50">🔮</div>
                <h3 className="horoscope-title text-gray-700 dark:text-gray-300 mb-3 text-lg font-bold">
                  请选择您的星座
                </h3>
                <p className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-base">
                  点击上方星座按钮，查看您的每日运势
                </p>
              </div>
            ) : null}

            {/* 底部信息 */}
            {!loading && !error && horoscopeGuidance && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm text-center">
                  数据更新时间：{new Date().toLocaleString('zh-CN', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                <p className="horoscope-subtitle text-gray-500 dark:text-gray-400 text-sm mt-2 text-center">
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