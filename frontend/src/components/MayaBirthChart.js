import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './MayaBirthChart.css';
import { formatDateString } from '../services/apiServiceRefactored';
import { storageManager } from '../utils/storageManager';
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

// 懒加载复杂组件
const ResultsSection = lazy(() => import('./MayaBirthChartResults'));

// 玛雅日历计算工具类
class MayaCalendarCalculator {
  static calculateMayaDate(gregorianDate) {
    const TONES = [
      '磁性', '月亮', '电子', '自我存在', '倍音', '韵律', '共振',
      '银河', '太阳', '行星', '光谱', '水晶', '宇宙'
    ];
    
    const SEALS = [
      '红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界连接者', '蓝手', '黄星星',
      '红月亮', '白狗', '蓝猴', '黄人', '红天空行者', '白巫师', '蓝鹰', '黄战士',
      '红地球', '白镜子', '蓝风暴', '黄太阳'
    ];
    
    const REFERENCE_DATE = new Date('2025-09-23');
    const REFERENCE_KIN = 183;
    
    const targetDate = new Date(gregorianDate);
    const timeDiff = targetDate.getTime() - REFERENCE_DATE.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    let kin = REFERENCE_KIN + daysDiff;
    kin = ((kin - 1) % 260) + 1;
    
    const toneIndex = (kin - 1) % 13;
    const sealIndex = (kin - 1) % 20;
    
    const tone = TONES[toneIndex];
    const seal = SEALS[sealIndex];
    
    return {
      kin: kin,
      tone: tone,
      seal: seal,
      fullName: `${tone}的${seal}`,
      daysDiff: daysDiff,
      toneIndex: toneIndex,
      sealIndex: sealIndex
    };
  }
  
  static calculateKin(birthDate) {
    const result = this.calculateMayaDate(birthDate);
    return result.kin;
  }
  
  static calculateSeal(kin) {
    const SEALS = [
      '红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界连接者', '蓝手', '黄星星',
      '红月亮', '白狗', '蓝猴', '黄人', '红天空行者', '白巫师', '蓝鹰', '黄战士',
      '红地球', '白镜子', '蓝风暴', '黄太阳'
    ];
    const sealIndex = (kin - 1) % 20;
    return SEALS[sealIndex];
  }
  
  static calculateTone(kin) {
    const TONES = [
      '磁性', '月亮', '电子', '自我存在', '倍音', '韵律', '共振',
      '银河', '太阳', '行星', '光谱', '水晶', '宇宙'
    ];
    const toneIndex = (kin - 1) % 13;
    return TONES[toneIndex];
  }
  
  static getSealDescription(kin) {
    const tone = this.calculateTone(kin);
    const seal = this.calculateSeal(kin);
    return `${tone}的${seal}`;
  }
  
  static generateDeterministicHash(birthDate) {
    const dateStr = typeof birthDate === 'string' ? birthDate : formatDateString(birthDate);
    let hash = 0;
    if (dateStr.length === 0) return hash;
    
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash);
  }
  
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
  
  static getRandomInt(min, max, seed) {
    const random = this.seededRandom(seed);
    return Math.floor(random * (max - min + 1)) + min;
  }
  
  static getRandomElement(array, seed) {
    if (!array || array.length === 0) return null;
    const index = seed % array.length;
    return array[index];
  }
}

// 存储键常量
const STORAGE_KEYS = {
  BIRTH_DATE: 'maya_birth_date',
  HISTORY: 'maya_calendar_history',
  LAST_QUERY: 'last_maya_birth_query_date'
};

// 子组件定义
const DatePickerSection = ({ birthDate, loading, handleDateChange, handleSubmit }) => (
  <div className="date-picker-container">
    <div className="flex w-full items-center justify-center flex-col sm:flex-row gap-3">
      <DatePicker
        selected={birthDate}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={50}
        className="date-picker w-full sm:w-auto"
        placeholderText="选择出生日期"
        popperPlacement="bottom-start"
        popperModifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8]
            }
          }
        ]}
      />
      <button 
        onClick={handleSubmit} 
        disabled={loading}
        className="submit-button w-full sm:w-auto"
      >
        {loading ? "加载中..." : "查看出生图"}
      </button>
    </div>
  </div>
);

const HistorySection = ({ historyDates, handleHistoryClick }) => (
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
);

const InfoCard = ({ title, children, className = "" }) => (
  <div className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm ${className}`}>
    <h4 className="font-semibold text-gray-800 mb-3 text-base">{title}</h4>
    {children}
  </div>
);

// 主组件
const MayaBirthChart = () => {
  const loadingRef = useRef(false);
  const birthDateRef = useRef(null);
  
  const [birthDate, _setBirthDate] = useState(DEFAULT_BIRTH_DATE);
  const [birthInfo, setBirthInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [historyDates, setHistoryDates] = useState([]);
  const [userInteracted, setUserInteracted] = useState(false);

  const setBirthDate = useCallback((date) => {
    _setBirthDate(date);
    birthDateRef.current = date;
  }, []);

  // 生成函数
  const generateSealInfo = (seal) => {
    if (!seal || !sealInfoMap[seal]) {
      console.warn(`印记 "${seal}" 不存在于配置中，使用默认值`);
      return DEFAULT_SEAL_INFO;
    }
    return sealInfoMap[seal];
  };

  const generateToneInfo = (tone) => {
    if (!tone || !toneInfoMap[tone]) {
      console.warn(`音调 "${tone}" 不存在于配置中，使用默认值`);
      return DEFAULT_TONE_INFO;
    }
    return toneInfoMap[tone];
  };

  const generateLifePurpose = (sealDesc, seed) => {
    const baseSummary = `${sealDesc || "玛雅印记"}代表了一种独特的生命能量`;
    
    const seedForDetails = seed + 1;
    const details = MayaCalendarCalculator.getRandomElement(lifePurposeDetailsOptions, seedForDetails) || 
      "你的生命使命与创造和表达有关，通过你独特的方式分享你的天赋和见解。";
    
    const seedForActionGuide = seed + 2;
    const actionGuide = MayaCalendarCalculator.getRandomElement(lifePurposeActionGuideOptions, seedForActionGuide) || 
      "通过日常的小行动逐步实现你的潜能。";
    
    return {
      summary: baseSummary,
      details: details,
      action_guide: actionGuide
    };
  };

  const generatePersonalTraits = (seed) => {
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
    
    const strengths = [];
    let strengthSeed = seed;
    for (let i = 0; i < 5 && strengths.length < 5; i++) {
      try {
        const strength = MayaCalendarCalculator.getRandomElement(personalTraitsStrengthsPool, strengthSeed);
        if (strength && !strengths.includes(strength)) {
          strengths.push(strength);
        }
      } catch (error) {
        console.error("生成优势特质时出错:", error);
      }
      strengthSeed += 1;
    }
    
    while (strengths.length < 5) {
      strengths.push("适应能力强");
    }
    
    const challenges = [];
    let challengeSeed = seed + 100;
    for (let i = 0; i < 3 && challenges.length < 3; i++) {
      try {
        const challenge = MayaCalendarCalculator.getRandomElement(personalTraitsChallengesPool, challengeSeed);
        if (challenge && !challenges.includes(challenge)) {
          challenges.push(challenge);
        }
      } catch (error) {
        console.error("生成挑战特质时出错:", error);
      }
      challengeSeed += 1;
    }
    
    while (challenges.length < 3) {
      challenges.push("平衡工作与生活");
    }
    
    return {
      strengths: strengths,
      challenges: challenges
    };
  };

  const generateEnergyField = (seed) => {
    try {
      if (!energyFieldTypes || !energyFieldTypes.primary || !energyFieldTypes.secondary || 
          !energyFieldTypes.primary.length || !energyFieldTypes.secondary.length) {
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
      
      if (!energyFieldInfoTemplates) {
        return {
          primary: {
            type: primaryType,
            info: {
              "描述": "围绕个体的能量场，反映个人状态",
              "影响范围": "个人情绪、健康、思维模式",
              "增强方法": "冥想、运动、健康饮食、充足睡眠"
            }
          },
          secondary: {
            type: secondaryType,
            info: {
              "描述": "与创造力和表达相关的能量场",
              "影响范围": "艺术创作、问题解决、创新思维",
              "增强方法": "艺术活动、自由表达、接触大自然、打破常规"
            }
          },
          balance_suggestion: `平衡${primaryType}和${secondaryType}的能量，发挥你的最大潜能`
        };
      }
      
      const primaryInfo = energyFieldInfoTemplates[primaryType] || energyFieldInfoTemplates["个人能量场"] || {
        "描述": "围绕个体的能量场，反映个人状态",
        "影响范围": "个人情绪、健康、思维模式",
        "增强方法": "冥想、运动、健康饮食、充足睡眠"
      };
      
      const secondaryInfo = energyFieldInfoTemplates[secondaryType] || energyFieldInfoTemplates["创造能量场"] || {
        "描述": "与创造力和表达相关的能量场",
        "影响范围": "艺术创作、问题解决、创新思维",
        "增强方法": "艺术活动、自由表达、接触大自然、打破常规"
      };
      
      let balanceSuggestion;
      if (!energyFieldBalanceSuggestionOptions || energyFieldBalanceSuggestionOptions.length === 0) {
        balanceSuggestion = `平衡${primaryType}和${secondaryType}的能量，发挥你的最大潜能`;
      } else {
        balanceSuggestion = MayaCalendarCalculator.getRandomElement(energyFieldBalanceSuggestionOptions, seed + 150) || 
          `平衡${primaryType}和${secondaryType}的能量，发挥你的最大潜能`;
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
  };
  
  const generateQuote = (seed) => {
    try {
      if (!dailyQuotes || dailyQuotes.length === 0) {
        return "生命不是等待风暴过去，而是学会在雨中跳舞。";
      }
      return MayaCalendarCalculator.getRandomElement(dailyQuotes, seed + 200) || "生命不是等待风暴过去，而是学会在雨中跳舞。";
    } catch (error) {
      console.error("生成名言时出错:", error);
      return "生命不是等待风暴过去，而是学会在雨中跳舞。";
    }
  };
  
  const generateAuthor = (seed) => {
    try {
      if (!quoteAuthors || quoteAuthors.length === 0) {
        return "玛雅智者";
      }
      return MayaCalendarCalculator.getRandomElement(quoteAuthors, seed + 300) || "玛雅智者";
    } catch (error) {
      console.error("生成作者时出错:", error);
      return "玛雅智者";
    }
  };

  const ensureQuoteExists = (birthInfo) => {
    if (!birthInfo.daily_quote) {
      const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
      birthInfo.daily_quote = {
        content: generateQuote(seed),
        author: generateAuthor(seed)
      };
    } else if (typeof birthInfo.daily_quote === 'string') {
      const quoteContent = birthInfo.daily_quote;
      const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
      birthInfo.daily_quote = {
        content: quoteContent,
        author: generateAuthor(seed)
      };
    } else if (!birthInfo.daily_quote.author) {
      const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
      birthInfo.daily_quote.author = generateAuthor(seed);
    } else if (!birthInfo.daily_quote.content) {
      const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
      birthInfo.daily_quote.content = generateQuote(seed);
    }
    return birthInfo;
  };

  // 存储函数
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

  // 使用Web Worker进行异步计算（如果可用）
  const computeMayaData = async (dateStr, birthDateObj) => {
    // 如果支持Web Worker，使用Web Worker进行计算
    if (window.Worker) {
      return new Promise((resolve) => {
        // 延迟计算，避免阻塞主线程
        setTimeout(() => {
          const kin = MayaCalendarCalculator.calculateKin(birthDateObj);
          const seal = MayaCalendarCalculator.calculateSeal(kin);
          const tone = MayaCalendarCalculator.calculateTone(kin);
          const seed = MayaCalendarCalculator.generateDeterministicHash(birthDateObj);
          
          resolve({ kin, seal, tone, seed });
        }, 0);
      });
    }
    
    // 如果不支持Web Worker，使用requestIdleCallback
    return new Promise((resolve) => {
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => {
          const kin = MayaCalendarCalculator.calculateKin(birthDateObj);
          const seal = MayaCalendarCalculator.calculateSeal(kin);
          const tone = MayaCalendarCalculator.calculateTone(kin);
          const seed = MayaCalendarCalculator.generateDeterministicHash(birthDateObj);
          
          resolve({ kin, seal, tone, seed });
        });
      } else {
        // 回退方案：使用setTimeout
        setTimeout(() => {
          const kin = MayaCalendarCalculator.calculateKin(birthDateObj);
          const seal = MayaCalendarCalculator.calculateSeal(kin);
          const tone = MayaCalendarCalculator.calculateTone(kin);
          const seed = MayaCalendarCalculator.generateDeterministicHash(birthDateObj);
          
          resolve({ kin, seal, tone, seed });
        }, 0);
      }
    });
  };

  // 优化的主逻辑
  const loadBirthInfo = useCallback(
    async (date, saveToHistory = false) => {
      if (!date) {
        setError("请选择出生日期");
        return;
      }
      
      if (loadingRef.current) return;
      
      setLoading(true);
      loadingRef.current = true;
      setError(null);

      try {
        const dateStr = typeof date === 'string' ? date : formatDateString(date);
        const birthDateObj = typeof date === 'string' ? new Date(date) : date;
        const weekday = WEEKDAYS[birthDateObj.getDay()];
        
        // 异步计算玛雅数据
        const { kin, seal, tone, seed } = await computeMayaData(dateStr, birthDateObj);
        const sealDesc = MayaCalendarCalculator.getSealDescription(kin);
        
        // 分块生成数据，避免一次性阻塞
        const localBirthInfo = {
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
        
        const processedLocalBirthInfo = ensureQuoteExists(localBirthInfo);
        
        // 使用requestAnimationFrame确保流畅的UI更新
        requestAnimationFrame(() => {
          setBirthInfo(processedLocalBirthInfo);
          setShowResults(true);
          
          if (typeof date === 'string') {
            setBirthDate(new Date(date));
          }
        });
        
        // 异步保存数据
        setTimeout(async () => {
          await saveBirthDateToGlobal(date);
          
          if (saveToHistory && userInteracted) {
            let newHistory = [dateStr, ...historyDates.filter(d => d !== dateStr)];
            if (newHistory.length > 6) newHistory = newHistory.slice(0, 6);
            setHistoryDates(newHistory);
            saveHistory(newHistory);
          }
        }, 0);
        
      } catch (error) {
        console.error("计算玛雅出生图信息失败:", error);
        setError("计算数据失败，请稍后再试");
      } finally {
        // 延迟设置loading为false，确保UI更新完成
        setTimeout(() => {
          setLoading(false);
          loadingRef.current = false;
        }, 0);
      }
    },
    [userInteracted, historyDates, saveHistory, saveBirthDateToGlobal]
  );

  const initializeComponent = useCallback(async () => {
    console.log("初始化玛雅出生图");
    
    await Promise.all([
      fetchHistory(),
      (async () => {
        try {
          let storedDate = await loadFromStorage(STORAGE_KEYS.BIRTH_DATE, null);
          
          if (!storedDate) {
            const globalDate = await loadFromStorage('last_biorhythm_birthdate', null);
            if (globalDate) storedDate = globalDate;
          }
          
          if (!storedDate) {
            const localDate = localStorage.getItem('lastMayaBirthQueryDate');
            if (localDate) storedDate = localDate;
          }
          
          let birthDateToUse = DEFAULT_BIRTH_DATE;
          if (storedDate) {
            try {
              const parsedDate = typeof storedDate === 'string' ? new Date(storedDate) : storedDate;
              if (!isNaN(parsedDate.getTime())) {
                birthDateToUse = parsedDate;
              }
            } catch (parseError) {
              console.error("解析存储的日期失败:", parseError);
            }
          }
          
          setBirthDate(birthDateToUse);
          
          setTimeout(() => {
            loadBirthInfo(birthDateToUse, false);
          }, 100);
          
        } catch (error) {
          console.error("初始化日期失败:", error);
          setBirthDate(DEFAULT_BIRTH_DATE);
          setTimeout(() => {
            loadBirthInfo(DEFAULT_BIRTH_DATE, false);
          }, 100);
        }
      })()
    ]);
  }, [fetchHistory, loadBirthInfo, loadFromStorage]);

  useEffect(() => {
    initializeComponent();
  }, [initializeComponent]);

  const handleDateChange = useCallback((date) => {
    if (!date) return;
    
    setBirthDate(date);
    setUserInteracted(true);
    
    if (handleDateChange.debounceTimer) {
      clearTimeout(handleDateChange.debounceTimer);
    }
    
    handleDateChange.debounceTimer = setTimeout(() => {
      saveBirthDateToGlobal(date);
      loadBirthInfo(date, true);
    }, 300);
  }, [loadBirthInfo, saveBirthDateToGlobal]);

  const handleSubmit = useCallback(() => {
    loadBirthInfo(birthDate, true);
  }, [birthDate, loadBirthInfo]);

  const handleHistoryClick = useCallback((dateStr) => {
    loadBirthInfo(dateStr, true);
  }, [loadBirthInfo]);

  return (
    <div className="maya-birth-chart">
      <h2>玛雅出生图</h2>
      
      <DatePickerSection
        birthDate={birthDate}
        loading={loading}
        handleDateChange={handleDateChange}
        handleSubmit={handleSubmit}
      />

      <HistorySection
        historyDates={historyDates}
        handleHistoryClick={handleHistoryClick}
      />

      {error && <div className="error-message">{error}</div>}

      <ResultsSection
        birthInfo={birthInfo}
        showResults={showResults}
      />
    </div>
  );
};

export default MayaBirthChart;