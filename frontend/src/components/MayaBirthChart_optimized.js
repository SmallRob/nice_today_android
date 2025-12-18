import React, { useState, useEffect, useCallback, useRef, lazy, Suspense, memo } from 'react';

import './MayaBirthChart.css';
import { formatDateString } from '../services/apiServiceRefactored';
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
  DEFAULT_BIRTH_DATE,
  DEFAULT_SEAL_INFO,
  DEFAULT_TONE_INFO,
  WEEKDAYS
} from '../config/mayaConfig';

// 懒加载优化版本的结果组件
const ResultsSection = lazy(() => import('./MayaBirthChartResults_optimized'));

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
class MayaCalendarCalculator {
  static TONES = ['磁性', '月亮', '电子', '自我存在', '倍音', '韵律', '共振', '银河', '太阳', '行星', '光谱', '水晶', '宇宙'];
  static SEALS = ['红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界连接者', '蓝手', '黄星星', '红月亮', '白狗', '蓝猴', '黄人', '红天空行者', '白巫师', '蓝鹰', '黄战士', '红地球', '白镜子', '蓝风暴', '黄太阳'];
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
  
  static calculateKin(birthDate) {
    return this.calculateMayaDate(birthDate).kin;
  }
  
  static calculateSeal(kin) {
    return this.SEALS[(kin - 1) % 20];
  }
  
  static calculateTone(kin) {
    return this.TONES[(kin - 1) % 13];
  }
  
  static getSealDescription(kin) {
    return `${this.calculateTone(kin)}的${this.calculateSeal(kin)}`;
  }
  
  static generateDeterministicHash(str) {
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  static getRandomElement(array, seed) {
    return array && array.length ? array[seed % array.length] : null;
  }
}

// 主组件 - 极简移动端优化版本
const MayaBirthChart = () => {
  const [birthInfo, setBirthInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [userInfo, setUserInfo] = useState({ nickname: '', birthDate: '' });
  
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  // 加载用户配置
  useEffect(() => {
    const init = async () => {
      await userConfigManager.initialize();
      const config = userConfigManager.getCurrentConfig();
      setUserInfo({
        nickname: config.nickname || '',
        birthDate: config.birthDate || ''
      });
      
      if (config.birthDate) {
        loadBirthInfo(new Date(config.birthDate));
      }
    };
    
    init();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 简化版数据生成函数
  const generateBirthInfo = useCallback((dateStr, kin, seal, tone, seed) => {
    const sealInfo = sealInfoMap[seal] || DEFAULT_SEAL_INFO;
    const toneInfo = toneInfoMap[tone] || DEFAULT_TONE_INFO;
    
    return {
      date: dateStr,
      weekday: WEEKDAYS[new Date(dateStr).getDay()] || '未知',
      maya_kin: `KIN ${kin}`,
      maya_tone: `${tone}之音`,
      maya_seal: seal,
      maya_seal_desc: `${tone}的${seal}`,
      maya_seal_info: sealInfo,
      maya_tone_info: toneInfo,
      life_purpose: {
        summary: `${tone}的${seal}代表独特的生命能量`,
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

  // 极简版加载函数
  const loadBirthInfo = useCallback(async (date) => {
    if (!date) return;
    
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
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
      if (err.name !== 'AbortError') {
        setError('计算失败，请稍后再试');
      }
    } finally {
      setLoading(false);
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
            <ResultsSection birthInfo={birthInfo} />
          ) : (
            <div className="maya-empty-state">
              <p>选择出生日期查看玛雅印记</p>
            </div>
          )}
        </Suspense>
      )}
    </div>
  );
};

export default MayaBirthChart;