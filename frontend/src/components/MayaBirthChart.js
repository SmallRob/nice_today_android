import { useState, useEffect, useCallback, useRef, lazy, Suspense, memo } from 'react';
// 移除DatePicker导入，不再使用日期选择器
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
import './MayaBirthChart.css';
import { formatDateString } from '../services/apiServiceRefactored';
import { storageManager } from '../utils/storageManager';
import { useCurrentConfig, useUserConfig } from '../contexts/UserConfigContext';
import { 
  sealInfoMap, 
  toneInfoMap,
  lifePurposeDetailsOptions,
  lifePurposeActionGuideOptions,
  personalTraitsStrengthsPool,
  personalTraitsChallengesPool,
  energyFieldTypes,
  energyFieldInfoTemplates,
  energyFieldBalanceSuggestionOptions,
  dailyQuotes,
  quoteAuthors,
  DEFAULT_BIRTH_DATE,
  DEFAULT_SEAL_INFO,
  DEFAULT_TONE_INFO,
  WEEKDAYS
} from '../config/mayaConfig';

// 懒加载优化版本的结果组件
const ResultsSection = lazy(() => import('./MayaBirthChartResults_optimized'));

// 优化的加载组件
const LoadingSpinner = memo(() => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
  </div>
));

// 优化的错误提示组件
const ErrorDisplay = memo(({ error }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
));

// 优化的计算工具类 - 移除实例化，使用静态方法
class MayaCalendarCalculator {
  // 使用静态常量避免每次调用时创建数组
  static TONES = [
    '磁性', '月亮', '电子', '自我存在', '倍音', '韵律', '共振',
    '银河', '太阳', '行星', '光谱', '水晶', '宇宙'
  ];
  
  static SEALS = [
    '红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界连接者', '蓝手', '黄星星',
    '红月亮', '白狗', '蓝猴', '黄人', '红天空行者', '白巫师', '蓝鹰', '黄战士',
    '红地球', '白镜子', '蓝风暴', '黄太阳'
  ];
  
  // 缓存参考日期对象，避免重复创建
  static REFERENCE_DATE = new Date('2025-09-23');
  static REFERENCE_KIN = 183;

  // 优化的玛雅日期计算
  static calculateMayaDate(gregorianDate) {
    try {
      const targetDate = new Date(gregorianDate);
      const timeDiff = targetDate.getTime() - this.REFERENCE_DATE.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      let kin = this.REFERENCE_KIN + daysDiff;
      kin = ((kin - 1) % 260) + 1;
      
      const toneIndex = (kin - 1) % 13;
      const sealIndex = (kin - 1) % 20;
      
      return {
        kin,
        tone: this.TONES[toneIndex],
        seal: this.SEALS[sealIndex],
        fullName: `${this.TONES[toneIndex]}的${this.SEALS[sealIndex]}`,
        toneIndex,
        sealIndex
      };
    } catch (error) {
      console.error('计算玛雅日期时出错:', error);
      return {
        kin: 1,
        tone: this.TONES[0],
        seal: this.SEALS[0],
        fullName: `${this.TONES[0]}的${this.SEALS[0]}`,
        toneIndex: 0,
        sealIndex: 0
      };
    }
  }
  
  // 优化的KIN计算
  static calculateKin(birthDate) {
    const result = this.calculateMayaDate(birthDate);
    return result.kin;
  }
  
  // 优化的印记计算
  static calculateSeal(kin) {
    const sealIndex = (kin - 1) % 20;
    return this.SEALS[sealIndex];
  }
  
  // 优化的音调计算
  static calculateTone(kin) {
    const toneIndex = (kin - 1) % 13;
    return this.TONES[toneIndex];
  }
  
  // 优化的印记描述计算
  static getSealDescription(kin) {
    const tone = this.calculateTone(kin);
    const seal = this.calculateSeal(kin);
    return `${tone}的${seal}`;
  }
  
  // 优化的确定性哈希计算
  static generateDeterministicHash(birthDate) {
    try {
      const dateStr = typeof birthDate === 'string' ? birthDate : formatDateString(birthDate);
      let hash = 0;
      if (dateStr.length === 0) return hash;
      
      for (let i = 0; i < dateStr.length; i++) {
        const char = dateStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return Math.abs(hash);
    } catch (error) {
      console.error('生成哈希值时出错:', error);
      return 0;
    }
  }
  
  // 优化的伪随机数生成器
  static linearCongruentialGenerator(seed) {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    return (a * seed + c) % m;
  }
  
  static seededRandom(seed) {
    const newSeed = this.linearCongruentialGenerator(seed);
    return newSeed / Math.pow(2, 32);
  }
  
  // 优化随机整数生成
  static getRandomInt(min, max, seed) {
    const random = this.seededRandom(seed);
    return Math.floor(random * (max - min + 1)) + min;
  }
  
  // 优化随机元素选择
  static getRandomElement(array, seed) {
    if (!array || array.length === 0) return null;
    const index = seed % array.length;
    return array[index];
  }
}

// 缓存对象避免重复创建
const STORAGE_KEYS = {
  BIRTH_DATE: 'maya_birth_date',
  HISTORY: 'maya_calendar_history',
  LAST_QUERY: 'last_maya_birth_query_date',
  BIRTH_INFO_CACHE: 'maya_birth_info_cache'
};

// 精简的用户信息组件 - 去除标题显示
const UserInfoSection = memo(({ userInfo, loading, onSwitchProfile }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-3 mb-3">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {userInfo.birthDate ? `出生日期: ${userInfo.birthDate}` : '请到设置页面配置个人信息'}
        </p>
      </div>
      <button
        onClick={onSwitchProfile}
        disabled={loading}
        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-300 disabled:to-blue-300 text-white text-xs rounded-md transition-all duration-200 active:scale-95 active:shadow-inner relative overflow-hidden group touch-manipulation"
      >
        {/* 高亮反馈效果 */}
        <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
        <span className="relative font-medium">切换配置</span>
      </button>
    </div>
  </div>
));

const HistorySection = memo(({ historyDates, handleHistoryClick }) => (
  historyDates.length > 0 && (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-3">历史记录</h3>
      <div className="flex flex-wrap gap-2">
        {historyDates.map((date, index) => (
          <button
            key={`${date}-${index}`}
            onClick={() => handleHistoryClick(date)}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-md transition-all duration-200 active:scale-95 active:shadow-inner relative overflow-hidden group touch-manipulation"
          >
            {/* 高亮反馈效果 */}
            <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
            <span className="relative">{date}</span>
          </button>
        ))}
      </div>
    </div>
  )
));

// InfoCard组件已定义但未使用，暂时保留以备后续使用

// 主组件 - 优化性能和内存管理
const MayaBirthChart = () => {
  // 使用新的配置上下文
  const { currentConfig, isLoading: configLoading, error: configError } = useCurrentConfig();
  const { configs } = useUserConfig();
  
  // 使用useRef管理不需要触发重渲染的状态
  const loadingRef = useRef(false);
  const birthDateRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // useState管理需要触发重渲染的状态
  const [birthDate, _setBirthDate] = useState(DEFAULT_BIRTH_DATE);
  const [birthInfo, setBirthInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [historyDates, setHistoryDates] = useState([]);
  const [userInteracted, _setUserInteracted] = useState(false);

  // 优化的状态更新函数
  const setBirthDate = useCallback((date) => {
    _setBirthDate(date);
    birthDateRef.current = date;
  }, []);

  // 优化的印记信息生成函数
  const generateSealInfo = useCallback((seal) => {
    if (!seal || !sealInfoMap[seal]) {
      console.warn(`印记 "${seal}" 不存在于配置中，使用默认值`);
      return DEFAULT_SEAL_INFO;
    }
    return sealInfoMap[seal];
  }, []);

  // 优化的音调信息生成函数
  const generateToneInfo = useCallback((tone) => {
    if (!tone || !toneInfoMap[tone]) {
      console.warn(`音调 "${tone}" 不存在于配置中，使用默认值`);
      return DEFAULT_TONE_INFO;
    }
    return toneInfoMap[tone];
  }, []);

  // 优化的生命使命生成函数
  const generateLifePurpose = useCallback((sealDesc, seed) => {
    const baseSummary = `${sealDesc || "玛雅印记"}代表了一种独特的生命能量`;
    
    const seedForDetails = seed + 1;
    const details = MayaCalendarCalculator.getRandomElement(lifePurposeDetailsOptions, seedForDetails) || 
      "你的生命使命与创造和表达有关，通过你独特的方式分享你的天赋和见解。";
    
    const seedForActionGuide = seed + 2;
    const actionGuide = MayaCalendarCalculator.getRandomElement(lifePurposeActionGuideOptions, seedForActionGuide) || 
      "通过日常的小行动逐步实现你的潜能。";
    
    return {
      summary: baseSummary,
      details,
      action_guide: actionGuide
    };
  }, []);

  // 优化的个人特质生成函数
  const generatePersonalTraits = useCallback((seed) => {
    if (!personalTraitsStrengthsPool || personalTraitsStrengthsPool.length === 0) {
      return {
        strengths: ["创造性思维", "适应能力强", "直觉敏锐", "表达能力强", "学习能力强"],
        challenges: ["过度分析", "情绪波动", "完美主义"]
      };
    }
    
    if (!personalTraitsChallengesPool || personalTraitsChallengesPool.length === 0) {
      return {
        strengths: ["创造性思维", "适应能力强", "直觉敏锐", "表达能力强", "学习能力强"],
        challenges: ["过度分析", "情绪波动", "完美主义"]
      };
    }
    
    // 使用Set避免重复
    const strengthsSet = new Set();
    let strengthSeed = seed;
    
    while (strengthsSet.size < 5) {
      const strength = MayaCalendarCalculator.getRandomElement(personalTraitsStrengthsPool, strengthSeed);
      if (strength) strengthsSet.add(strength);
      strengthSeed += 1;
    }
    
    const challengesSet = new Set();
    let challengeSeed = seed + 100;
    
    while (challengesSet.size < 3) {
      const challenge = MayaCalendarCalculator.getRandomElement(personalTraitsChallengesPool, challengeSeed);
      if (challenge) challengesSet.add(challenge);
      challengeSeed += 1;
    }
    
    return {
      strengths: Array.from(strengthsSet),
      challenges: Array.from(challengesSet)
    };
  }, []);

  // 优化的能量场生成函数
  const generateEnergyField = useCallback((seed) => {
    try {
      if (!energyFieldTypes?.primary?.length || !energyFieldTypes?.secondary?.length) {
        return {
          primary: {
            type: "个人能量场",
            info: {
              "描述": "围绕个体的能量场，反映个人状态",
              "影响范围": "个人情绪、健康、思维模式",
              "增强方法": "冥想、运动、健康饮食、充足睡眠"
            }
          },
          secondary: {
            type: "创造能量场",
            info: {
              "描述": "与创造力和表达相关的能量场",
              "影响范围": "艺术创作、问题解决、创新思维",
              "增强方法": "艺术活动、自由表达、接触大自然、打破常规"
            }
          },
          balance_suggestion: "平衡个人能量场和创造能量场的能量，发挥你的最大潜能"
        };
      }
      
      const primaryType = MayaCalendarCalculator.getRandomElement(energyFieldTypes.primary, seed) || "个人能量场";
      const secondaryType = MayaCalendarCalculator.getRandomElement(energyFieldTypes.secondary, seed + 50) || "创造能量场";
      
      const primaryInfo = energyFieldInfoTemplates?.[primaryType] || energyFieldInfoTemplates["个人能量场"] || {
        "描述": "围绕个体的能量场，反映个人状态",
        "影响范围": "个人情绪、健康、思维模式",
        "增强方法": "冥想、运动、健康饮食、充足睡眠"
      };
      
      const secondaryInfo = energyFieldInfoTemplates?.[secondaryType] || energyFieldInfoTemplates["创造能量场"] || {
        "描述": "与创造力和表达相关的能量场",
        "影响范围": "艺术创作、问题解决、创新思维",
        "增强方法": "艺术活动、自由表达、接触大自然、打破常规"
      };
      
      let balanceSuggestion = "平衡个人能量场和创造能量场的能量，发挥你的最大潜能";
      if (energyFieldBalanceSuggestionOptions?.length > 0) {
        balanceSuggestion = MayaCalendarCalculator.getRandomElement(energyFieldBalanceSuggestionOptions, seed + 150) || balanceSuggestion;
        balanceSuggestion = balanceSuggestion.replace('{primary}', primaryType).replace('{secondary}', secondaryType);
      }
      
      return {
        primary: {
          type: primaryType,
          info: primaryInfo
        },
        secondary: {
          type: secondaryType,
          info: secondaryInfo
        },
        balance_suggestion: balanceSuggestion
      };
    } catch (error) {
      console.error("生成能量场信息时出错:", error);
      return {
        primary: {
          type: "个人能量场",
          info: {
            "描述": "围绕个体的能量场，反映个人状态",
            "影响范围": "个人情绪、健康、思维模式",
            "增强方法": "冥想、运动、健康饮食、充足睡眠"
          }
        },
        secondary: {
          type: "创造能量场",
          info: {
            "描述": "与创造力和表达相关的能量场",
            "影响范围": "艺术创作、问题解决、创新思维",
            "增强方法": "艺术活动、自由表达、接触大自然、打破常规"
          }
        },
        balance_suggestion: "平衡个人能量场和创造能量场的能量，发挥你的最大潜能"
      };
    }
  }, []);
  
  // 优化的名言生成函数
  const generateQuote = useCallback((seed) => {
    if (!dailyQuotes?.length) {
      return "生命不是等待风暴过去，而是学会在雨中跳舞。";
    }
    return MayaCalendarCalculator.getRandomElement(dailyQuotes, seed + 200) || "生命不是等待风暴过去，而是学会在雨中跳舞。";
  }, []);
  
  // 优化的作者生成函数
  const generateAuthor = useCallback((seed) => {
    if (!quoteAuthors?.length) {
      return "玛雅智者";
    }
    return MayaCalendarCalculator.getRandomElement(quoteAuthors, seed + 300) || "玛雅智者";
  }, []);

  // 确保引言存在的函数
  const ensureQuoteExists = useCallback((birthInfo) => {
    if (!birthInfo) return birthInfo;
    
    const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
    
    if (!birthInfo.daily_quote) {
      birthInfo.daily_quote = {
        content: generateQuote(seed),
        author: generateAuthor(seed)
      };
    } else if (typeof birthInfo.daily_quote === 'string') {
      const quoteContent = birthInfo.daily_quote;
      birthInfo.daily_quote = {
        content: quoteContent,
        author: generateAuthor(seed)
      };
    } else if (!birthInfo.daily_quote.author) {
      birthInfo.daily_quote.author = generateAuthor(seed);
    } else if (!birthInfo.daily_quote.content) {
      birthInfo.daily_quote.content = generateQuote(seed);
    }
    
    return birthInfo;
  }, [generateQuote, generateAuthor]);

  // 优化的存储函数
  const saveToStorage = useCallback(async (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      
      const preferences = await storageManager.getPreferences();
      const updatedPreferences = { ...preferences, [key]: value };
      await storageManager.savePreferences(updatedPreferences);
      
      return true;
    } catch (err) {
      console.error(`保存到${key}失败:`, err);
      return false;
    }
  }, []);

  // 优化的缓存函数 - 使用内存缓存
  const cacheRef = useRef(new Map());
  
  const getCachedBirthInfo = useCallback(async (dateStr) => {
    try {
      // 先检查内存缓存
      if (cacheRef.current.has(dateStr)) {
        const { timestamp, data } = cacheRef.current.get(dateStr);
        // 检查缓存是否过期（24小时）
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        } else {
          // 清除过期缓存
          cacheRef.current.delete(dateStr);
        }
      }
      
      // 然后检查localStorage
      const cacheKey = `${STORAGE_KEYS.BIRTH_INFO_CACHE}_${dateStr}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // 检查缓存是否过期（24小时）
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          // 更新内存缓存
          cacheRef.current.set(dateStr, parsed);
          return parsed.data;
        } else {
          // 清除过期缓存
          localStorage.removeItem(cacheKey);
        }
      }
      return null;
    } catch (err) {
      console.error('获取缓存数据失败:', err);
      return null;
    }
  }, []);

  const setCachedBirthInfo = useCallback(async (dateStr, data) => {
    try {
      const cacheKey = `${STORAGE_KEYS.BIRTH_INFO_CACHE}_${dateStr}`;
      const cacheData = {
        timestamp: Date.now(),
        data: data
      };
      
      // 更新内存缓存
      cacheRef.current.set(dateStr, cacheData);
      
      // 更新localStorage
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      // 限制内存缓存大小，避免内存泄漏
      if (cacheRef.current.size > 50) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }
      
      return true;
    } catch (err) {
      console.error('保存缓存数据失败:', err);
      return false;
    }
  }, []);

  const loadFromStorage = useCallback(async (key, defaultValue) => {
    try {
      const preferences = await storageManager.getPreferences();
      if (preferences[key] !== undefined) {
        return preferences[key];
      }
      
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      
      return defaultValue;
    } catch (err) {
      console.error(`从${key}读取失败:`, err);
      return defaultValue;
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const history = await loadFromStorage(STORAGE_KEYS.HISTORY, []);
      if (Array.isArray(history)) {
        setHistoryDates(history.slice(0, 6));
      }
    } catch (err) {
      console.error("获取历史记录失败:", err);
    }
  }, [loadFromStorage]);

  const saveHistory = useCallback(async (dates) => {
    await saveToStorage(STORAGE_KEYS.HISTORY, dates);
  }, [saveToStorage]);

  const saveBirthDateToGlobal = useCallback(async (date) => {
    if (date) {
      const dateStr = typeof date === 'string' ? date : formatDateString(date);
      
      await saveToStorage(STORAGE_KEYS.BIRTH_DATE, dateStr);
      
      try {
        localStorage.setItem('last_biorhythm_birthdate', dateStr);
        
        const preferences = await storageManager.getPreferences();
        const updatedPreferences = { 
          ...preferences, 
          last_biorhythm_birthdate: dateStr 
        };
        await storageManager.savePreferences(updatedPreferences);
      } catch (err) {
        console.error("保存到全局存储失败:", err);
      }
    }
  }, [saveToStorage]);

  // 优化的玛雅数据计算函数
  const computeMayaData = useCallback(async (dateStr, birthDateObj) => {
    return new Promise((resolve) => {
      // 使用setTimeout避免阻塞主线程
      setTimeout(() => {
        try {
          const kin = MayaCalendarCalculator.calculateKin(birthDateObj);
          const seal = MayaCalendarCalculator.calculateSeal(kin);
          const tone = MayaCalendarCalculator.calculateTone(kin);
          const seed = MayaCalendarCalculator.generateDeterministicHash(birthDateObj);
          
          resolve({ kin, seal, tone, seed });
        } catch (error) {
          console.error('计算玛雅数据时出错:', error);
          // 返回默认值以防出错
          resolve({ 
            kin: 1, 
            seal: '红龙', 
            tone: '磁性', 
            seed: 0 
          });
        }
      }, 0);
    });
  }, []);

  // 优化的主逻辑
  const loadBirthInfo = useCallback(
    async (date, saveToHistory = false) => {
      if (!date) {
        setError("请选择出生日期");
        return;
      }
      
      // 防止重复调用
      if (loadingRef.current) return;
      
      // 检查日期是否发生变化，避免不必要的计算
      const currentDateStr = typeof date === 'string' ? date : formatDateString(date);
      if (birthInfo && birthInfo.date === currentDateStr) {
        // 如果日期相同且已有数据，直接显示
        setShowResults(true);
        return;
      }
      
      // 创建AbortController用于取消请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      loadingRef.current = true;
      setError(null);

      try {
        const dateStr = currentDateStr;
        const birthDateObj = typeof date === 'string' ? new Date(date) : date;
        const weekday = WEEKDAYS[birthDateObj.getDay()];
        
        // 首先检查缓存
        let localBirthInfo = await getCachedBirthInfo(dateStr);
        
        if (!localBirthInfo) {
          // 如果没有缓存，计算玛雅数据
          const { kin, seal, tone, seed } = await computeMayaData(dateStr, birthDateObj);
          const sealDesc = MayaCalendarCalculator.getSealDescription(kin);
          
          // 优化数据生成，减少不必要的函数调用
          localBirthInfo = {
            date: dateStr,
            weekday: weekday || "未知",
            maya_kin: `KIN ${kin}`,
            maya_tone: `${tone}之音 | 第${(kin % 28) || 28}天`,
            maya_seal: seal,
            maya_seal_desc: sealDesc,
            maya_seal_info: generateSealInfo(seal),
            maya_tone_info: generateToneInfo(tone),
            life_purpose: generateLifePurpose(sealDesc, seed),
            personal_traits: generatePersonalTraits(seed),
            birth_energy_field: generateEnergyField(seed),
            daily_quote: {
              content: generateQuote(seed) || "每一天都是新的开始",
              author: generateAuthor(seed) || "玛雅智者"
            }
          };
          
          // 缓存结果
          await setCachedBirthInfo(dateStr, localBirthInfo);
        }
        
        const processedLocalBirthInfo = ensureQuoteExists(localBirthInfo);
        
        // 检查是否已取消
        if (abortControllerRef.current?.signal.aborted) return;
        
        // 直接更新状态，避免requestAnimationFrame的额外开销
        setBirthInfo(processedLocalBirthInfo);
        setShowResults(true);
        
        if (typeof date === 'string') {
          setBirthDate(new Date(date));
        }
        
        // 异步保存数据
        setTimeout(async () => {
          // 再次检查是否已取消
          if (abortControllerRef.current?.signal.aborted) return;
          
          await saveBirthDateToGlobal(date);
          
          if (saveToHistory && userInteracted) {
            let newHistory = [dateStr, ...historyDates.filter(d => d !== dateStr)];
            if (newHistory.length > 6) newHistory = newHistory.slice(0, 6);
            setHistoryDates(newHistory);
            saveHistory(newHistory);
          }
        }, 0);
        
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("计算玛雅出生图信息失败:", error);
          setError("计算数据失败，请稍后再试");
        }
      } finally {
        // 延迟设置loading为false，确保UI更新完成
        setTimeout(() => {
          setLoading(false);
          loadingRef.current = false;
        }, 0);
      }
    },
    [userInteracted, historyDates, saveHistory, saveBirthDateToGlobal, birthInfo, getCachedBirthInfo, setCachedBirthInfo, computeMayaData, generateSealInfo, generateToneInfo, generateLifePurpose, generatePersonalTraits, generateEnergyField, generateQuote, generateAuthor, ensureQuoteExists]
  );

  const initializeComponent = useCallback(() => {
    // 创建新的AbortController用于初始化
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // 简化用户信息初始化
      let nickname = '';
      let birthDateStr = '1991-04-21';

      // 从配置获取信息
      if (currentConfig) {
        nickname = currentConfig.nickname || '';
        birthDateStr = currentConfig.birthDate || birthDateStr;
      }

      setUserInfo({
        nickname: nickname,
        birthDate: birthDateStr
      });

      // 获取出生日期对象
      let birthDateToUse = DEFAULT_BIRTH_DATE;
      try {
        const parsedDate = new Date(birthDateStr);
        if (!isNaN(parsedDate.getTime())) {
          birthDateToUse = parsedDate;
        }
      } catch (parseError) {
        console.error("解析日期失败，使用默认日期:", parseError);
        birthDateToUse = DEFAULT_BIRTH_DATE;
      }

      setBirthDate(birthDateToUse);

      // 延迟加载，避免阻塞UI
      setTimeout(() => {
        // 检查是否已取消
        if (abortControllerRef.current?.signal.aborted) return;
        loadBirthInfo(birthDateToUse, false);
      }, 100);

      // 加载历史记录
      fetchHistory();
    } catch (error) {
      console.error('初始化失败:', error);
      // 出错时使用默认值
      setUserInfo({
        nickname: '',
        birthDate: '1991-04-21'
      });
      loadBirthInfo(DEFAULT_BIRTH_DATE, false);
    }

    return null;
  }, [fetchHistory, loadBirthInfo]);

  // 监听 currentConfig 变化
  useEffect(() => {
    if (currentConfig) {
      // 更新用户信息
      setUserInfo({
        nickname: currentConfig.nickname || '',
        birthDate: currentConfig.birthDate || ''
      });
      
      // 如果出生日期有变化，更新出生日期
      if (currentConfig.birthDate) {
        try {
          const newBirthDate = new Date(currentConfig.birthDate);
          if (!isNaN(newBirthDate.getTime())) {
            const currentDateStr = birthDate ? formatDateString(birthDate) : '';
            if (currentConfig.birthDate !== currentDateStr) {
              setBirthDate(newBirthDate);
              setTimeout(() => {
                if (abortControllerRef.current?.signal.aborted) return;
                loadBirthInfo(newBirthDate, true);
              }, 0);
            }
          }
        } catch (error) {
          console.error("处理配置中的出生日期失败:", error);
        }
      }
    }
  }, [currentConfig, loadBirthInfo]);

  useEffect(() => {
    let removeListener;
    
    const initialize = async () => {
      removeListener = await initializeComponent();
    };
    
    initialize();
    
    // 清理函数防止内存泄漏
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (removeListener) {
        removeListener();
      }
    };
  }, []);

  // 切换配置处理函数
  const handleSwitchProfile = useCallback(() => {
    // 导航到设置页面
    window.location.href = '/settings?tab=userConfigs';
  }, []);

  const handleHistoryClick = useCallback((dateStr) => {
    loadBirthInfo(dateStr, true);
  }, [loadBirthInfo]);

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      if (handleDateChange.debounceTimer) {
        clearTimeout(handleDateChange.debounceTimer);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* 页面标题区域 - 简洁设计 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-b-lg shadow-lg mb-4">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold mb-1 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            玛雅出生图
          </h1>
          <p className="text-purple-100 text-sm opacity-90">
            探索你的玛雅印记，发现生命能量密码
          </p>
        </div>
      </div>

      {/* 主内容区域 - 优化布局结构 */}
      <div className="container mx-auto px-4 space-y-3">
        {/* 用户信息和操作区域 */}
        <div className="space-y-2">
          <UserInfoSection
            userInfo={userInfo}
            loading={loading}
            onSwitchProfile={handleSwitchProfile}
          />

          {historyDates.length > 0 && (
            <HistorySection
              historyDates={historyDates}
              handleHistoryClick={handleHistoryClick}
            />
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* 结果区域 - 增强视觉层次 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
          <Suspense fallback={
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">正在加载玛雅印记信息...</p>
            </div>
          }>
            <ResultsSection
              birthInfo={birthInfo}
              showResults={showResults}
            />
          </Suspense>
        </div>

        {/* 底部提示信息 */}
        {showResults && birthInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-blue-700 dark:text-blue-300 text-xs">
                玛雅出生图基于13月亮历法计算，每个KIN代表独特的宇宙能量组合
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MayaBirthChart;