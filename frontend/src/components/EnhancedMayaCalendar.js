import React, { useState, useEffect, useCallback, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './MayaAndWuxingCards.css';
import { fetchMayaBirthInfo, formatDateString, fetchMayaHistory } from '../services/apiService';
import { 
  MAYA_EPOCH, 
  mayaSeals, 
  mayaTones, 
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

// 玛雅日历计算工具类 - 确保计算结果的一致性
class MayaCalendarCalculator {
  // 玛雅日历的基准日期 - 使用固定的基准日期确保计算一致性
  static MAYA_EPOCH = MAYA_EPOCH;
  
  // 计算两个日期之间的天数差
  static daysBetween(date1, date2) {
    // 确保使用UTC时间，避免时区问题
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  }
  
  // 计算玛雅Kin数
  static calculateKin(birthDate) {
    // 将日期字符串转换为Date对象
    const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    
    // 计算与基准日期的天数差
    const dayDiff = this.daysBetween(this.MAYA_EPOCH, birthDateObj);
    
    // 计算Kin数 (1-260范围内)
    // 使用模运算确保结果在1-260范围内，并处理负数情况
    let kin = dayDiff % 260;
    if (kin <= 0) {
      kin = 260 + kin;
    }
    
    return kin;
  }
  
  // 根据Kin数计算玛雅印记
  static calculateSeal(kin) {
    // 玛雅印记是基于Kin数模20计算的
    const sealIndex = (kin - 1) % 20;
    return mayaSeals[sealIndex];
  }
  
  // 根据Kin数计算玛雅音调
  static calculateTone(kin) {
    // 玛雅音调是基于Kin数模13计算的
    const toneIndex = (kin - 1) % 13;
    return mayaTones[toneIndex];
  }
  
  // 获取完整的玛雅印记描述
  static getSealDescription(kin) {
    const tone = this.calculateTone(kin);
    const seal = this.calculateSeal(kin);
    return `${tone}的${seal}`;
  }
  
  // 生成确定性哈希值，确保同一日期总是生成相同的结果
  static generateDeterministicHash(birthDate) {
    // 将日期转换为标准格式YYYY-MM-DD
    const dateStr = typeof birthDate === 'string' ? birthDate : formatDateString(birthDate);
    
    // 使用更稳定的哈希算法
    let hash = 0;
    if (dateStr.length === 0) return hash;
    
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    return Math.abs(hash);
  }
}

const EnhancedMayaCalendar = ({ apiBaseUrl, serviceStatus, isDesktop }) => {
  // 默认日期设置为配置中的默认日期
  const defaultDate = DEFAULT_BIRTH_DATE;
  const [birthDate, setBirthDate] = useState(defaultDate);
  const [birthInfo, setBirthInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [historyDates, setHistoryDates] = useState([]);
  const [isDefaultDate, setIsDefaultDate] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  // 防止并发请求导致loading卡住
  const loadingRef = useRef(false);

  // 获取历史记录（最多6条）
  const fetchHistory = useCallback(async () => {
    if (!apiBaseUrl) return;
    try {
      const result = await fetchMayaHistory(apiBaseUrl);
      if (result.success && Array.isArray(result.history)) {
        setHistoryDates(result.history.slice(0, 6));
      }
    } catch (err) {
      console.error("获取历史记录失败:", err);
    }
  }, [apiBaseUrl]);

  // 保存历史记录到后端（假设有POST接口）
  const saveHistory = useCallback(async (dates) => {
    if (!apiBaseUrl) return;
    try {
      // 尝试不同的API路径前缀
      const possiblePrefixes = ['', '/api', '/maya'];
      let saved = false;
      
      for (const prefix of possiblePrefixes) {
        if (saved) break;
        try {
          const url = `${apiBaseUrl}${prefix}/maya/history`;
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: dates })
          });
          saved = true;
          console.log(`历史记录已保存到 ${url}`);
        } catch (prefixErr) {
          console.error(`使用前缀 ${prefix} 保存历史记录失败:`, prefixErr);
        }
      }
      
      // 如果API保存失败，尝试保存到本地存储
      if (!saved) {
        try {
          localStorage.setItem('mayaCalendarHistory', JSON.stringify(dates));
          console.log('历史记录已保存到本地存储');
        } catch (localErr) {
          console.error("保存历史记录到本地存储失败:", localErr);
        }
      }
    } catch (err) {
      // 失败不影响前端展示
      console.error("保存历史记录失败:", err);
    }
  }, [apiBaseUrl]);

  // 加载出生日期的玛雅日历信息，并处理历史记录
  const loadBirthInfo = useCallback(
    async (date, saveToHistory = false) => {
      if (!date) {
        setError("请选择出生日期");
        return;
      }
      
      if (!isDesktop && !apiBaseUrl) {
        setError("API服务未连接，请检查网络连接");
        return;
      }
      
      if (loadingRef.current) return; // 防止并发
      setLoading(true);
      loadingRef.current = true;
      setError(null);

      try {
        const dateStr = typeof date === 'string' ? date : formatDateString(date);
        console.log("正在请求玛雅出生图数据，日期:", dateStr, "API基础URL:", apiBaseUrl);
        
        let result;
        
        if (isDesktop) {
          // 桌面环境下使用本地计算
          console.log("桌面环境，使用本地计算方法");
          result = { success: false, message: "Use local calculation" };
        } else {
          // Web环境下尝试从API获取数据
          result = await fetchMayaBirthInfo(apiBaseUrl, dateStr);
          console.log("API返回结果:", result);
        }

        if (result && result.success && result.birthInfo) {
          // 如果API成功返回数据，使用API数据
          console.log("使用API返回的数据");
          setBirthInfo(result.birthInfo);
          setShowResults(true);

          // 如果是字符串日期，转换为Date对象并更新birthDate
          if (typeof date === 'string') {
            setBirthDate(new Date(date));
          }

          // 处理历史记录（仅在用户交互后且需要保存时）
          if (saveToHistory && userInteracted) {
            let newHistory = [dateStr, ...historyDates.filter(d => d !== dateStr)];
            if (newHistory.length > 6) newHistory = newHistory.slice(0, 6);
            setHistoryDates(newHistory);
            saveHistory(newHistory);
          }
        } else {
          console.log("API返回失败或数据格式不正确，使用本地计算方法");
          // 如果API失败，使用本地计算方法生成一致的结果
          console.log("API获取失败，使用本地计算方法");
          
          // 将日期字符串转换为Date对象
          const birthDateObj = typeof date === 'string' ? new Date(date) : date;
          
          // 计算玛雅Kin数
          const kin = MayaCalendarCalculator.calculateKin(birthDateObj);
          
          // 计算玛雅印记和音调
          const seal = MayaCalendarCalculator.calculateSeal(kin);
          const tone = MayaCalendarCalculator.calculateTone(kin);
          const sealDesc = MayaCalendarCalculator.getSealDescription(kin);
          
          // 生成确定性哈希值，用于伪随机数生成
          const seed = MayaCalendarCalculator.generateDeterministicHash(birthDateObj);
          
          // 使用种子生成一致的随机数据
          const weekday = WEEKDAYS[birthDateObj.getDay()];
          
          // 构建一致的出生图信息，确保所有字段都有默认值
          const localBirthInfo = {
            date: dateStr,
            weekday: weekday || "未知",
            maya_kin: `KIN ${kin}`,
            maya_tone: `${tone}之音 | 第${(kin % 28) || 28}天`,
            maya_seal: seal,
            maya_seal_desc: sealDesc,
            maya_seal_info: generateSealInfo(seal, seed),
            maya_tone_info: generateToneInfo(tone, seed),
            life_purpose: generateLifePurpose(sealDesc, seed),
            personal_traits: generatePersonalTraits(seal, tone, seed),
            birth_energy_field: generateEnergyField(seal, tone, seed),
            daily_quote: {
              content: generateQuote(seed) || "每一天都是新的开始",
              author: generateAuthor(seed) || "玛雅智者"
            }
          };
          
          console.log("本地生成的出生图信息:", localBirthInfo);
          
          // 确保daily_quote对象存在
          const processedLocalBirthInfo = ensureQuoteExists(localBirthInfo);
          setBirthInfo(processedLocalBirthInfo);
          setShowResults(true);
          
          // 如果是字符串日期，转换为Date对象并更新birthDate
          if (typeof date === 'string') {
            setBirthDate(new Date(date));
          }
          
          // 处理历史记录（仅在用户交互后且需要保存时）
          if (saveToHistory && userInteracted) {
            let newHistory = [dateStr, ...historyDates.filter(d => d !== dateStr)];
            if (newHistory.length > 6) newHistory = newHistory.slice(0, 6);
            setHistoryDates(newHistory);
            saveHistory(newHistory);
          }
        }
      } catch (error) {
        console.error("获取玛雅出生图信息失败:", error);
        setError("获取数据失败，请稍后再试");
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [apiBaseUrl, userInteracted, historyDates, saveHistory]
  );

  // 生成印记信息 - 基于种子确保一致性
  const generateSealInfo = (seal, seed) => {
    // 从配置文件中获取印记信息
    if (!seal || !sealInfoMap[seal]) {
      console.warn(`印记 "${seal}" 不存在于配置中，使用默认值`);
      return DEFAULT_SEAL_INFO;
    }
    return sealInfoMap[seal];
  };

  // 生成音调信息 - 基于种子确保一致性
  const generateToneInfo = (tone, seed) => {
    // 从配置文件中获取音调信息
    if (!tone || !toneInfoMap[tone]) {
      console.warn(`音调 "${tone}" 不存在于配置中，使用默认值`);
      return DEFAULT_TONE_INFO;
    }
    return toneInfoMap[tone];
  };

  // 生成生命使命信息 - 基于种子确保一致性
  const generateLifePurpose = (sealDesc, seed) => {
    // 基于印记描述生成一致的生命使命
    const baseSummary = `${sealDesc || "玛雅印记"}代表了一种独特的生命能量`;
    
    // 使用种子选择一个详细信息
    const seedForDetails = seed + 1; // 使用不同的种子值
    const details = lifePurposeDetailsOptions && lifePurposeDetailsOptions.length > 0 
      ? lifePurposeDetailsOptions[seedForDetails % lifePurposeDetailsOptions.length]
      : "你的生命使命与创造和表达有关，通过你独特的方式分享你的天赋和见解。";
    
    // 使用种子选择一个行动指南
    const seedForActionGuide = seed + 2; // 使用不同的种子值
    const actionGuide = lifePurposeActionGuideOptions && lifePurposeActionGuideOptions.length > 0
      ? lifePurposeActionGuideOptions[seedForActionGuide % lifePurposeActionGuideOptions.length]
      : "通过日常的小行动逐步实现你的潜能。";
    
    return {
      summary: baseSummary,
      details: details,
      action_guide: actionGuide
    };
  };

  // 生成个人特质信息 - 基于种子确保一致性
  const generatePersonalTraits = (seal, tone, seed) => {
    // 确保个性特质池不为空
    if (!personalTraitsStrengthsPool || personalTraitsStrengthsPool.length === 0) {
      console.warn("优势特质池为空，使用默认值");
      return {
        strengths: ["创造性思维", "适应能力强", "直觉敏锐", "表达能力强", "学习能力强"],
        challenges: ["过度分析", "情绪波动", "完美主义"]
      };
    }
    
    if (!personalTraitsChallengesPool || personalTraitsChallengesPool.length === 0) {
      console.warn("挑战特质池为空，使用默认值");
      return {
        strengths: ["创造性思维", "适应能力强", "直觉敏锐", "表达能力强", "学习能力强"],
        challenges: ["过度分析", "情绪波动", "完美主义"]
      };
    }
    
    // 使用种子选择5个优势
    const strengths = [];
    let strengthSeed = seed;
    for (let i = 0; i < 5 && strengths.length < 5; i++) {
      try {
        const strength = personalTraitsStrengthsPool[strengthSeed % personalTraitsStrengthsPool.length];
        if (strength && !strengths.includes(strength)) {
          strengths.push(strength);
        }
      } catch (error) {
        console.error("生成优势特质时出错:", error);
      }
      strengthSeed += 1;
    }
    
    // 如果没有成功生成足够的优势，添加默认值
    while (strengths.length < 5) {
      strengths.push("适应能力强");
    }
    
    // 使用种子选择3个挑战
    const challenges = [];
    let challengeSeed = seed + 100; // 使用不同的种子基数
    for (let i = 0; i < 3 && challenges.length < 3; i++) {
      try {
        const challenge = personalTraitsChallengesPool[challengeSeed % personalTraitsChallengesPool.length];
        if (challenge && !challenges.includes(challenge)) {
          challenges.push(challenge);
        }
      } catch (error) {
        console.error("生成挑战特质时出错:", error);
      }
      challengeSeed += 1;
    }
    
    // 如果没有成功生成足够的挑战，添加默认值
    while (challenges.length < 3) {
      challenges.push("平衡工作与生活");
    }
    
    return {
      strengths: strengths,
      challenges: challenges
    };
  };

  // 生成能量场信息 - 基于种子确保一致性
  const generateEnergyField = (seal, tone, seed) => {
    try {
      // 检查能量场类型配置是否存在
      if (!energyFieldTypes || !energyFieldTypes.primary || !energyFieldTypes.secondary || 
          !energyFieldTypes.primary.length || !energyFieldTypes.secondary.length) {
        console.warn("能量场类型配置不完整，使用默认值");
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
      
      // 使用种子选择主要和次要能量场类型
      const primaryType = energyFieldTypes.primary[seed % energyFieldTypes.primary.length] || "个人能量场";
      const secondaryType = energyFieldTypes.secondary[(seed + 50) % energyFieldTypes.secondary.length] || "创造能量场";
      
      // 检查能量场信息模板是否存在
      if (!energyFieldInfoTemplates) {
        console.warn("能量场信息模板不存在，使用默认值");
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
      
      // 获取主要和次要能量场的信息
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
      
      // 检查平衡建议选项是否存在
      let balanceSuggestion;
      if (!energyFieldBalanceSuggestionOptions || energyFieldBalanceSuggestionOptions.length === 0) {
        console.warn("平衡建议选项不存在，使用默认值");
        balanceSuggestion = `平衡${primaryType}和${secondaryType}的能量，发挥你的最大潜能`;
      } else {
        // 生成平衡建议
        balanceSuggestion = energyFieldBalanceSuggestionOptions[seed % energyFieldBalanceSuggestionOptions.length] || 
          `平衡${primaryType}和${secondaryType}的能量，发挥你的最大潜能`;
        
        // 替换模板中的占位符
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
      // 返回默认值
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
  
  // 生成名言 - 基于种子确保一致性
  const generateQuote = (seed) => {
    try {
      if (!dailyQuotes || dailyQuotes.length === 0) {
        console.warn("每日名言配置为空，使用默认值");
        return "生命不是等待风暴过去，而是学会在雨中跳舞。";
      }
      return dailyQuotes[seed % dailyQuotes.length] || "生命不是等待风暴过去，而是学会在雨中跳舞。";
    } catch (error) {
      console.error("生成名言时出错:", error);
      return "生命不是等待风暴过去，而是学会在雨中跳舞。";
    }
  };
  
  // 生成作者 - 基于种子确保一致性
  const generateAuthor = (seed) => {
    try {
      if (!quoteAuthors || quoteAuthors.length === 0) {
        console.warn("名言作者配置为空，使用默认值");
        return "玛雅智者";
      }
      return quoteAuthors[seed % quoteAuthors.length] || "玛雅智者";
    } catch (error) {
      console.error("生成作者时出错:", error);
      return "玛雅智者";
    }
  };

  // 确保daily_quote对象存在
  const ensureQuoteExists = (birthInfo) => {
    if (!birthInfo.daily_quote) {
      const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
      birthInfo.daily_quote = {
        content: generateQuote(seed),
        author: generateAuthor(seed)
      };
    } else if (typeof birthInfo.daily_quote === 'string') {
      // 处理daily_quote是字符串的情况
      const quoteContent = birthInfo.daily_quote;
      const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
      birthInfo.daily_quote = {
        content: quoteContent,
        author: generateAuthor(seed)
      };
    } else if (!birthInfo.daily_quote.author) {
      // 处理缺少author的情况
      const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
      birthInfo.daily_quote.author = generateAuthor(seed);
    } else if (!birthInfo.daily_quote.content) {
      // 处理缺少content的情况
      const seed = MayaCalendarCalculator.generateDeterministicHash(new Date(birthInfo.date));
      birthInfo.daily_quote.content = generateQuote(seed);
    }
    return birthInfo;
  };

  // 初始化时加载历史记录
  useEffect(() => {
    // 在桌面环境中，apiBaseUrl可能为空，但我们可以直接使用桌面服务
    const effectiveApiBaseUrl = isDesktop ? null : apiBaseUrl;
    
    if (isDesktop || apiBaseUrl) {
      console.log("初始化玛雅出生图，环境:", isDesktop ? "桌面版" : "Web版", "API基础URL:", effectiveApiBaseUrl);
      fetchHistory();
    } else {
      console.error("既不是桌面环境且apiBaseUrl未定义，无法加载玛雅出生图数据");
    }
  }, [fetchHistory, apiBaseUrl, isDesktop]);

  // 处理日期变更
  const handleDateChange = (date) => {
    setBirthDate(date);
    setIsDefaultDate(false);
    setUserInteracted(true);
  };

  // 处理查询按钮点击
  const handleSubmit = () => {
    loadBirthInfo(birthDate, true);
  };

  // 处理历史记录点击
  const handleHistoryClick = (dateStr) => {
    loadBirthInfo(dateStr, true);
  };

  // 获取能量级别
  const getEnergyLevel = (score) => {
    if (score >= 80) return { level: '高', color: '#10b981', bg: 'linear-gradient(135deg, #10b981, #059669)' };
    if (score >= 60) return { level: '中', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' };
    return { level: '低', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' };
  };

  return (
    <div className="maya-calendar-enhanced">
      {/* 标题区域 - 简化突出重点 */}
      <header className="maya-header-enhanced">
        <div className="maya-title-card-enhanced">
          <h1>玛雅日历智慧</h1>
          <p>探索宇宙能量的每日指引</p>
        </div>
      </header>

      {/* 日期选择区域 */}
      <section className="date-picker-section">
        <div className="date-picker-container-enhanced">
          <DatePicker
            selected={birthDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            className="date-picker-enhanced"
            placeholderText="选择出生日期"
          />
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="submit-button-enhanced"
          >
            {loading ? "加载中..." : "查看出生图"}
          </button>
        </div>

        {historyDates.length > 0 && (
          <div className="history-container-enhanced">
            <h3>历史记录</h3>
            <div className="history-dates-enhanced">
              {historyDates.map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(date)}
                  className="history-date-button-enhanced"
                >
                  {date}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {error && <div className="error-message-enhanced">{error}</div>}

      {showResults && birthInfo && (
        <div className="birth-chart-results-enhanced">
          {/* 主要信息区域 - 采用卡片网格布局 */}
          <div className="maya-main-content-enhanced">
            {/* 今日概览卡片 */}
            <section className="maya-overview-card-enhanced">
              <div className="maya-kin-display-enhanced">
                <div className="kin-number">{birthInfo.maya_kin}</div>
                <div className="kin-name">{birthInfo.maya_seal_desc}</div>
              </div>
            </section>

            {/* 能量分析卡片 */}
            <section className="maya-energy-card-enhanced">
              <h3 className="section-title-enhanced">能量分析</h3>
              <div className="energy-ring-container">
                <div className="energy-score-enhanced" style={{ background: getEnergyLevel(birthInfo.energy_scores?.综合 || 65).bg }}>
                  <span className="score-number">{birthInfo.energy_scores?.综合 || 65}</span>
                  <span className="score-level">{getEnergyLevel(birthInfo.energy_scores?.综合 || 65).level}</span>
                </div>
                <svg className="energy-ring" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle 
                    cx="60" cy="60" r="50" fill="none" 
                    stroke={getEnergyLevel(birthInfo.energy_scores?.综合 || 65).color} 
                    strokeWidth="8"
                    strokeDasharray={`${(birthInfo.energy_scores?.综合 || 65) / 100 * 314} 314`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
              </div>
            </section>

            {/* 幸运物品卡片 */}
            <section className="maya-lucky-items-enhanced">
              <h3 className="section-title-enhanced">幸运物品</h3>
              <div className="lucky-items-grid">
                {/* 幸运颜色 */}
                <div className="lucky-item-card-enhanced ripple-effect">
                  <div className="lucky-item-header">
                    <div className="lucky-item-icon">🎨</div>
                    <h4>幸运颜色</h4>
                  </div>
                  <div className="lucky-item-content">
                    <div className="lucky-color-preview" style={{ 
                      background: birthInfo.lucky_items?.幸运色?.颜色 || '#FF6B6B' 
                    }}></div>
                    <div className="lucky-item-description">
                      {birthInfo.lucky_items?.幸运色?.含义 || '带来能量与活力'}
                    </div>
                  </div>
                </div>

                {/* 幸运数字 */}
                <div className="lucky-item-card-enhanced ripple-effect">
                  <div className="lucky-item-header">
                    <div className="lucky-item-icon">🔢</div>
                    <h4>幸运数字</h4>
                  </div>
                  <div className="lucky-item-content">
                    <div className="lucky-number-display">
                      {birthInfo.lucky_items?.幸运数字?.数字 || '7'}
                    </div>
                    <div className="lucky-item-description">
                      {birthInfo.lucky_items?.幸运数字?.含义 || '提升直觉与洞察'}
                    </div>
                  </div>
                </div>

                {/* 幸运食物 */}
                <div className="lucky-item-card-enhanced ripple-effect">
                  <div className="lucky-item-header">
                    <div className="lucky-item-icon">🍎</div>
                    <h4>幸运食物</h4>
                  </div>
                  <div className="lucky-item-content">
                    <div className="lucky-food-display">
                      {birthInfo.lucky_items?.幸运食物?.食物 || '蓝莓'}
                    </div>
                    <div className="lucky-item-description">
                      {birthInfo.lucky_items?.幸运食物?.功效 || '增强直觉与记忆'}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 印记信息卡片 */}
          <div className="maya-seal-card-enhanced">
            <h3 className="section-title-enhanced">印记信息</h3>
            <div className="seal-content-enhanced">
              <div className="seal-header">
                <div className="seal-name">{birthInfo.maya_seal}</div>
                <div className="seal-title">{birthInfo.maya_seal_desc}</div>
              </div>
              
              <div className="seal-details-grid">
                <div className="seal-detail-item">
                  <h4 className="detail-title">特质</h4>
                  <p className="detail-content">{birthInfo.maya_seal_info.特质}</p>
                </div>
                <div className="seal-detail-item">
                  <h4 className="detail-title">能量</h4>
                  <p className="detail-content">{birthInfo.maya_seal_info.能量}</p>
                </div>
                <div className="seal-detail-item">
                  <h4 className="detail-title">启示</h4>
                  <p className="detail-content">{birthInfo.maya_seal_info.启示}</p>
                </div>
                <div className="seal-detail-item">
                  <h4 className="detail-title">象征</h4>
                  <p className="detail-content">{birthInfo.maya_seal_info.象征}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 音调信息卡片 */}
          <div className="maya-tone-card-enhanced">
            <h3 className="section-title-enhanced">音调信息</h3>
            <div className="tone-content-enhanced">
              <div className="tone-header">
                <div className="tone-number">{birthInfo.maya_tone_info?.数字 || '1'}</div>
                <div className="tone-name">{birthInfo.maya_tone}</div>
              </div>
              
              <div className="tone-details-grid">
                <div className="tone-detail-item">
                  <h4 className="detail-title">数字能量</h4>
                  <p className="detail-content">第{birthInfo.maya_tone_info?.数字 || '1'}号音调代表着独特的宇宙振动频率</p>
                </div>
                <div className="tone-detail-item">
                  <h4 className="detail-title">行动</h4>
                  <p className="detail-content">{birthInfo.maya_tone_info.行动}</p>
                </div>
                <div className="tone-detail-item">
                  <h4 className="detail-title">本质</h4>
                  <p className="detail-content">{birthInfo.maya_tone_info.本质}</p>
                </div>
                <div className="tone-detail-item">
                  <h4 className="detail-title">启示</h4>
                  <p className="detail-content">{birthInfo.maya_tone_info.启示}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 生命使命卡片 */}
          <div className="maya-life-purpose-card-enhanced">
            <h3 className="section-title-enhanced">生命使命</h3>
            <div className="life-purpose-content">
              <div className="life-purpose-summary">
                <p>{birthInfo.life_purpose?.summary}</p>
              </div>
              <div className="life-purpose-details">
                <p>{birthInfo.life_purpose?.details}</p>
              </div>
              <div className="life-purpose-action">
                <div className="action-icon">✨</div>
                <div className="action-content">
                  <h4>行动指南</h4>
                  <p>{birthInfo.life_purpose?.action_guide}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 每日启示 */}
          {birthInfo.daily_quote && (
            <div className="maya-daily-inspiration-card-enhanced">
              <h3 className="section-title-enhanced">今日启示</h3>
              <div className="inspiration-content">
                <blockquote className="inspiration-quote">
                  "{birthInfo.daily_quote.content}"
                </blockquote>
                <div className="inspiration-author">— {birthInfo.daily_quote.author}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedMayaCalendar;