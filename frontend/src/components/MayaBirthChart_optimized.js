import { useState, useEffect, useCallback, useRef, lazy, Suspense, memo } from 'react';

import './MayaBirthChart.css';
import { formatDateString } from '../services/apiServiceRefactored';
import { userConfigManager } from '../utils/userConfigManager';
import { useTheme } from '../context/ThemeContext';
import { 
  sealInfoMap, 
  toneInfoMap,
  lifePurposeDetailsOptions,
  lifePurposeActionGuideOptions,
  personalTraitsStrengthsPool,
  personalTraitsChallengesPool,
  DEFAULT_SEAL_INFO,
  DEFAULT_TONE_INFO,
  WEEKDAYS
} from '../config/mayaConfig';

// 优化的懒加载策略，预加载结果组件
let ResultsSectionPromise;
const getResultsSection = () => {
  if (!ResultsSectionPromise) {
    ResultsSectionPromise = import('./MayaBirthChartResults_optimized');
  }
  return ResultsSectionPromise;
};

const ResultsSection = lazy(() => getResultsSection());

// 极简加载组件
const LoadingSpinner = memo(() => (
  <div className="maya-loading">
    <div className="spinner"></div>
    <p>正在计算...</p>
  </div>
));

// 极简错误提示
const ErrorDisplay = memo(({ error }) => (
  <div className="maya-error">
    <p>⚠️ {error}</p>
  </div>
));

// 优化的计算工具类 - 纯静态方法
// 与玛雅日历使用一致的计算方法，确保结果准确性
class MayaCalendarCalculator {
  // 使用与mayaConfig.js中一致的图腾和音调定义
  static TONES = [
    '磁性', '月亮', '电子', '自我存在', '倍音', '韵律', '共振',
    '银河', '太阳', '行星', '光谱', '水晶', '宇宙'
  ];
  
  static SEALS = [
    '红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界连接者', '蓝手', '黄星星',
    '红月亮', '白狗', '蓝猴', '黄人', '红天空行者', '白巫师', '蓝鹰', '黄战士',
    '红地球', '白镜子', '蓝风暴', '黄太阳'
  ];
  
  // 使用标准的玛雅历法参考点
  static REFERENCE_DATE = new Date('2012-12-21'); // 玛雅长历结束日期作为基准点
  static REFERENCE_KIN = 260; // 2012-12-21对应的KIN数

  // 更可靠的玛雅日期计算 - 与玛雅日历保持一致
  static calculateMayaDate(gregorianDate) {
    try {
      // 确保输入日期有效
      if (!gregorianDate) {
        throw new Error('无效的日期输入');
      }
      
      const targetDate = new Date(gregorianDate);
      if (isNaN(targetDate.getTime())) {
        throw new Error('无效的日期格式');
      }
      
      // 计算从参考日期到目标日期的天数
      const timeDiff = targetDate.getTime() - this.REFERENCE_DATE.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      // 计算KIN数（1-260的循环）
      let kin = this.REFERENCE_KIN + daysDiff;
      kin = ((kin - 1) % 260 + 260) % 260 + 1; // 确保结果在1-260范围内
      
      // 从KIN数计算调性和图腾
      const toneIndex = (kin - 1) % 13;
      const sealIndex = (kin - 1) % 20;
      
      // 安全获取调性和图腾
      const tone = this.TONES[toneIndex] || this.TONES[0];
      const seal = this.SEALS[sealIndex] || this.SEALS[0];
      const fullName = `${tone}的${seal}`;
      
      return {
        kin: kin,
        tone,
        seal,
        fullName,
        toneIndex: toneIndex,
        sealIndex: sealIndex
      };
    } catch (error) {
      console.error('计算玛雅日期时出错:', error);
      // 返回安全的默认值
      return {
        kin: 1,
        tone: this.TONES[0] || '磁性',
        seal: this.SEALS[0] || '红龙',
        fullName: `${this.TONES[0] || '磁性'}的${this.SEALS[0] || '红龙'}`,
        toneIndex: 0,
        sealIndex: 0
      };
    }
  }
  
  static calculateKin(birthDate) {
    return this.calculateMayaDate(birthDate).kin;
  }
  
  static calculateSeal(kin) {
    const index = ((kin - 1) % 20 + 20) % 20; // 确保非负
    return this.SEALS[index] || this.SEALS[0];
  }
  
  static calculateTone(kin) {
    const index = ((kin - 1) % 13 + 13) % 13; // 确保非负
    return this.TONES[index] || this.TONES[0];
  }
  
  static getSealDescription(kin) {
    const tone = this.calculateTone(kin);
    const seal = this.calculateSeal(kin);
    return `${tone}的${seal}`;
  }
  
  static generateDeterministicHash(str) {
    let hash = 0;
    const safeStr = str || '';
    for (let i = 0; i < safeStr.length; i++) {
      hash = ((hash << 5) - hash) + safeStr.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  static getRandomElement(array, seed) {
    if (!array || !array.length) return null;
    const safeSeed = Math.abs(seed) || 0;
    return array[safeSeed % array.length];
  }
}

// 主组件 - 极简移动端优化版本
const MayaBirthChart = () => {
  const { theme } = useTheme();
  const [birthInfo, setBirthInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [userInfo, setUserInfo] = useState({ nickname: '', birthDate: '' });
  // 不需要selectedDate状态，直接使用用户配置中的出生日期
  
  const cacheRef = useRef(new Map());

  // 加载用户配置
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      await userConfigManager.initialize();
      if (!isMounted) return;
      
      const config = userConfigManager.getCurrentConfig();
      setUserInfo({
        nickname: config.nickname || '',
        birthDate: config.birthDate || ''
      });
      
      if (config.birthDate) {
        // 直接加载用户配置中的出生日期数据
        loadBirthInfo(new Date(config.birthDate));
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // 简化版数据生成函数 - 确保所有值都有默认值，避免undefined
  const generateBirthInfo = useCallback((dateStr, kin, seal, tone, seed) => {
    // 确保所有值都有默认值，避免undefined
    const safeTone = tone || '磁性';
    const safeSeal = seal || '红龙';
    const sealInfo = sealInfoMap[safeSeal] || DEFAULT_SEAL_INFO;
    const toneInfo = toneInfoMap[safeTone] || DEFAULT_TONE_INFO;
    
    return {
      date: dateStr || '未知日期',
      weekday: WEEKDAYS[new Date(dateStr).getDay()] || '未知',
      maya_kin: `KIN ${kin || 1}`,
      maya_tone: `${safeTone}之音`,
      maya_seal: safeSeal,
      maya_seal_desc: `${safeTone}的${safeSeal}`,
      maya_seal_info: sealInfo,
      maya_tone_info: {
        ...(toneInfo || {}),
        数字: (toneInfo && toneInfo.数字) ? toneInfo.数字 : (kin ? ((kin - 1) % 13) + 1 : 1)
      },
      life_purpose: {
        summary: `${safeTone}的${safeSeal}代表独特的生命能量`,
        details: MayaCalendarCalculator.getRandomElement(lifePurposeDetailsOptions, seed) || 
          "你的生命使命与创造和表达有关。",
        action_guide: MayaCalendarCalculator.getRandomElement(lifePurposeActionGuideOptions, seed + 1) || 
          "通过日常行动实现潜能。"
      },
      personal_traits: {
        strengths: personalTraitsStrengthsPool?.slice(0, 3) || [],
        challenges: personalTraitsChallengesPool?.slice(0, 2) || []
      },
      birth_energy_field: {
        primary: { type: "个人能量场", info: { "描述": "反映个人状态的能场" } },
        secondary: { type: "创造能量场", info: { "描述": "与创造力相关的能场" } },
        balance_suggestion: "平衡能量发挥潜能"
      }
    };
  }, []);

  // 优化版加载函数 - 添加防抖和取消机制
  const loadBirthInfo = useCallback(async (date) => {
    if (!date) return;
    
    setLoading(true);
    setError(null);
    
    // 使用requestIdleCallback推迟非紧急计算
    if ('requestIdleCallback' in window) {
      return new Promise((resolve) => {
        requestIdleCallback(async () => {
          try {
            const dateStr = typeof date === 'string' ? date : formatDateString(date);
            
            // 检查缓存
            if (cacheRef.current.has(dateStr)) {
              setBirthInfo(cacheRef.current.get(dateStr));
              setShowResults(true);
              setLoading(false);
              resolve();
              return;
            }
            
            // 计算玛雅数据
            const { kin, seal, tone } = MayaCalendarCalculator.calculateMayaDate(date);
            const seed = MayaCalendarCalculator.generateDeterministicHash(dateStr);
            
            // 生成出生信息
            const birthInfoData = generateBirthInfo(dateStr, kin, seal, tone, seed);
            
            // 缓存结果
            cacheRef.current.set(dateStr, birthInfoData);
            
            // 更新状态
            setBirthInfo(birthInfoData);
            setShowResults(true);
            
          } catch (err) {
            setError('计算失败，请稍后再试');
          } finally {
            setLoading(false);
            resolve();
          }
        }, { timeout: 1000 }); // 设置1秒超时
      });
    } else {
      // 降级到直接执行
      try {
        const dateStr = typeof date === 'string' ? date : formatDateString(date);
        
        // 检查缓存
        if (cacheRef.current.has(dateStr)) {
          setBirthInfo(cacheRef.current.get(dateStr));
          setShowResults(true);
          setLoading(false);
          return;
        }
        
        // 计算玛雅数据
        const { kin, seal, tone } = MayaCalendarCalculator.calculateMayaDate(date);
        const seed = MayaCalendarCalculator.generateDeterministicHash(dateStr);
        
        // 生成出生信息
        const birthInfoData = generateBirthInfo(dateStr, kin, seal, tone, seed);
        
        // 缓存结果
        cacheRef.current.set(dateStr, birthInfoData);
        
        // 更新状态
        setBirthInfo(birthInfoData);
        setShowResults(true);
        
      } catch (err) {
        setError('计算失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    }
  }, [generateBirthInfo]);

  // 用户信息栏
  const UserHeader = () => (
    <div className="maya-user-header">
      <h1>{userInfo.nickname ? `${userInfo.nickname}的玛雅印记` : '玛雅出生图'}</h1>
      {userInfo.birthDate && (
        <p className="maya-birth-date">出生日期: {userInfo.birthDate}</p>
      )}
    </div>
  );

  // 主界面
  return (
    <div className="maya-container">
      <UserHeader />
        
      {error && <ErrorDisplay error={error} />}
        
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Suspense fallback={<LoadingSpinner />}>  
          {showResults && birthInfo ? (
            <ResultsSection birthInfo={birthInfo} showResults={showResults} />
          ) : (
            <div className="maya-empty-state">
              <p>加载中...</p>
            </div>
          )}
        </Suspense>
      )}
    </div>
  );
};

export default MayaBirthChart;