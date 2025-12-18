import React, { useState, useEffect, useCallback, useRef, lazy, Suspense, memo } from 'react';
// 移除DatePicker导入，不再使用日期选择器
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
import './MayaBirthChart.css';
import '../styles/mayaGlobalStyles.css';
import { formatDateString } from '../services/apiServiceRefactored';
import { storageManager } from '../utils/storageManager';
import { userConfigManager } from '../utils/userConfigManager';
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
  <div className="flex flex-col items-center justify-center py-6 animate-fadeIn">
    <div className="animate-pulse flex flex-col items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-5 text-center">正在计算玛雅出生图...</p>
    </div>
  </div>
));

// 优化的错误提示组件
const ErrorDisplay = memo(({ error }) => (
  <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-center animate-fadeIn">
    <div className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-2">
      <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="text-red-800 dark:text-red-300 text-sm font-medium mb-2 leading-5">加载失败</h3>
    <p className="text-red-600 dark:text-red-400 text-xs mb-3 leading-5">{error}</p>
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

// 用户信息组件 - 显示用户信息和配置切换
const UserInfoSection = memo(({ userInfo, loading, onSwitchProfile }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mb-4">
    <div className="flex flex-col sm:flex-row items-center justify-between">
      <div>
        <h3 className="text-base font-medium text-gray-900 dark:text-white">
          {userInfo.nickname ? `${userInfo.nickname} 的玛雅出生图` : '玛雅出生图'}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {userInfo.birthDate ? `基于出生日期 ${userInfo.birthDate} 计算` : '请到设置页面配置个人信息'}
        </p>
        {userInfo.zodiac && userInfo.zodiacAnimal && (
          <div className="flex gap-2 mt-1">
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400 text-xs rounded-full">
              {userInfo.zodiac}
            </span>
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 dark:bg-opacity-20 text-purple-600 dark:text-purple-400 text-xs rounded-full">
              {userInfo.zodiacAnimal}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={onSwitchProfile}
        disabled={loading}
        className="mt-3 sm:mt-0 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-sm rounded-md transition-colors"
      >
        切换配置
      </button>
    </div>
  </div>
));

const HistorySection = memo(({ historyDates, handleHistoryClick }) => (
  historyDates.length > 0 && (
    <div className="history-container">
      <h3>历史记录</h3>
      <div className="history-dates">
        {historyDates.map((date, index) => (
          <button
            key={`${date}-${index}`}
            onClick={() => handleHistoryClick(date)}
            className="history-date-button"
          >
            {date}
          </button>
        ))}
      </div>
    </div>
  )
));

const InfoCard = memo(({ title, children, className = "" }) => (
  <div className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm ${className}`}>
    <h4 className="font-semibold text-gray-800 mb-3 text-base">{title}</h4>
    {children}
  </div>
));

// 主组件 - 优化性能和内存管理
const MayaBirthChart = () => {
  // 使用useRef管理不需要触发重渲染的状态
  const loadingRef = useRef(false);
  const birthDateRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // useState管理需要触发重渲染的状态
  const [birthInfo, setBirthInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [historyDates, setHistoryDates] = useState([]);
  const [userInteracted, setUserInteracted] = useState(false);
  const [configManagerReady, setConfigManagerReady] = useState(false);
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    birthDate: '',
    zodiac: '',
    zodiacAnimal: ''
  });

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
  
  // 今日启示模块已迁移至玛雅日历页面
  // 以下相关函数已不再使用
  
  // 确保数据结构的完整性函数
  const ensureBirthInfoIntegrity = useCallback((birthInfo) => {
    if (!birthInfo) return birthInfo;
    
    // 确保基本数据结构完整
    if (!birthInfo.date) birthInfo.date = '';
    if (!birthInfo.weekday) birthInfo.weekday = '未知';
    if (!birthInfo.maya_kin) birthInfo.maya_kin = 'KIN 1';
    if (!birthInfo.maya_tone) birthInfo.maya_tone = '磁性之音 | 第1天';
    if (!birthInfo.maya_seal) birthInfo.maya_seal = '红龙';
    if (!birthInfo.maya_seal_desc) birthInfo.maya_seal_desc = '磁性的红龙';
    
    return birthInfo;
  }, []);

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
            birth_energy_field: generateEnergyField(seed)
            // 今日启示模块已迁移至玛雅日历页面
          };
          
          // 缓存结果
          await setCachedBirthInfo(dateStr, localBirthInfo);
        }
        
        const processedLocalBirthInfo = ensureBirthInfoIntegrity(localBirthInfo);
        
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
    [historyDates, saveHistory, saveBirthDateToGlobal, birthInfo, getCachedBirthInfo, setCachedBirthInfo, computeMayaData, generateSealInfo, generateToneInfo, generateLifePurpose, generatePersonalTraits, generateEnergyField, generateQuote, generateAuthor, ensureQuoteExists]
  );

  const initializeComponent = useCallback(async () => {
    // 创建新的AbortController用于初始化
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    // 初始化配置管理器
    await userConfigManager.initialize();
    setConfigManagerReady(true);
    
    // 获取当前配置
    const currentConfig = userConfigManager.getCurrentConfig();
    
    // 更新用户信息
    setUserInfo({
      nickname: currentConfig.nickname || '',
      birthDate: currentConfig.birthDate || '',
      zodiac: currentConfig.zodiac || '',
      zodiacAnimal: currentConfig.zodiacAnimal || ''
    });
    
    // 获取出生日期
    let birthDateToUse = DEFAULT_BIRTH_DATE;
    if (currentConfig && currentConfig.birthDate) {
      try {
        const parsedDate = new Date(currentConfig.birthDate);
        if (!isNaN(parsedDate.getTime())) {
          birthDateToUse = parsedDate;
        }
      } catch (parseError) {
        console.error("解析存储的日期失败:", parseError);
      }
    }
    
    setBirthDate(birthDateToUse);
    
    // 延迟加载，避免阻塞UI
    setTimeout(() => {
      // 检查是否已取消
      if (abortControllerRef.current?.signal.aborted) return;
      loadBirthInfo(birthDateToUse, false);
    }, 100);
    
    // 加载历史记录
    await fetchHistory();
    
    // 添加配置变更监听器
    const removeListener = userConfigManager.addListener(({
      currentConfig: updatedConfig
    }) => {
      if (updatedConfig) {
        setUserInfo({
          nickname: updatedConfig.nickname || '',
          birthDate: updatedConfig.birthDate || '',
          zodiac: updatedConfig.zodiac || '',
          zodiacAnimal: updatedConfig.zodiacAnimal || ''
        });
        
        // 如果出生日期有变化，重新加载数据
        if (updatedConfig.birthDate && updatedConfig.birthDate !== (birthDate ? formatDateString(birthDate) : '')) {
          try {
            const newBirthDate = new Date(updatedConfig.birthDate);
            if (!isNaN(newBirthDate.getTime())) {
              setBirthDate(newBirthDate);
              setTimeout(() => {
                if (abortControllerRef.current?.signal.aborted) return;
                loadBirthInfo(newBirthDate, true);
              }, 0);
            }
          } catch (error) {
            console.error("处理新出生日期失败:", error);
          }
        }
      }
    });
    
    return removeListener;
  }, [fetchHistory, loadBirthInfo]);

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
  }, [initializeComponent]);

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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="maya-birth-chart">
      <h2>玛雅出生图</h2>
      
      <UserInfoSection
        userInfo={userInfo}
        loading={loading}
        onSwitchProfile={handleSwitchProfile}
      />

      <HistorySection
        historyDates={historyDates}
        handleHistoryClick={handleHistoryClick}
      />

      {error && <ErrorDisplay error={error} />}

      <Suspense fallback={<LoadingSpinner />}>
        <ResultsSection
          birthInfo={birthInfo}
          showResults={showResults}
        />
      </Suspense>
    </div>
  );
};

export default MayaBirthChart;