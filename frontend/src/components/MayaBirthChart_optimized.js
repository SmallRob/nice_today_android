import { useState, useEffect, useCallback, useRef, memo } from 'react';

import './MayaBirthChart.css';
import { formatDateString } from '../services/apiServiceRefactored';
import { useCurrentConfig } from '../contexts/UserConfigContext';
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

// 直接导入结果组件，不使用懒加载
import ResultsSection from './MayaBirthChartResults_optimized';

// 优化的加载组件 - 紧凑设计
const LoadingSpinner = memo(() => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center transition-all duration-300">
    <div className="relative w-12 h-12 mx-auto mb-4">
      <div className="absolute inset-0 rounded-full border-4 border-purple-100 dark:border-purple-900/30"></div>
      <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
    </div>
    <p className="text-sm font-medium text-gray-600 dark:text-white tracking-wide">正在同步宇宙频率...</p>
    <p className="text-xs text-gray-400 dark:text-white mt-1">计算您的玛雅印记中</p>
  </div>
));

// 优化的错误提示 - 紧凑设计
const ErrorDisplay = memo(({ error }) => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl p-4 text-center transition-all duration-300 shadow-sm">
    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-2">
      <span className="text-xl">⚠️</span>
    </div>
    <p className="text-sm font-medium text-red-700 dark:text-red-400 tracking-wide">{error}</p>
    <button
      onClick={() => window.location.reload()}
      className="mt-2 text-xs text-red-600 dark:text-red-500 underline underline-offset-2"
    >
      点击重试
    </button>
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
  // 使用新的配置上下文
  const { currentConfig, isLoading: configLoading } = useCurrentConfig();

  const [birthInfo, setBirthInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [userInfo, setUserInfo] = useState({ nickname: '', birthDate: '' });
  const [isInitialized, setIsInitialized] = useState(false);
  // 不需要selectedDate状态，直接使用用户配置中的出生日期

  const cacheRef = useRef(new Map());

  // 简化版数据生成函数 - 确保所有值都有默认值，避免undefined
  // 必须在 loadBirthInfo 之前定义，避免初始化顺序错误
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
  }, [personalTraitsStrengthsPool, personalTraitsChallengesPool]);

  // 优化版加载函数 - 添加超时机制和可靠的加载流程
  const loadBirthInfo = useCallback(async (date) => {
    if (!date) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dateStr = typeof date === 'string' ? date : formatDateString(date);

      // 检查缓存
      if (cacheRef.current.has(dateStr)) {
        const cachedData = cacheRef.current.get(dateStr);
        setBirthInfo(cachedData);
        setShowResults(true);
        return;
      }

      // 计算玛雅数据 - 直接执行，不使用 requestIdleCallback 避免延迟问题
      const { kin, seal, tone } = MayaCalendarCalculator.calculateMayaDate(date);
      const seed = MayaCalendarCalculator.generateDeterministicHash(dateStr);

      // 生成出生信息
      const birthInfoData = generateBirthInfo(dateStr, kin, seal, tone, seed);

      // 缓存结果
      cacheRef.current.set(dateStr, birthInfoData);

      // 更新状态 - 确保状态更新成功
      setBirthInfo(birthInfoData);
      setShowResults(true);

    } catch (err) {
      console.error('加载玛雅数据失败:', err);
      setError('计算失败，请稍后再试');
      setShowResults(false);
    } finally {
      // 确保无论如何都更新 loading 状态
      setLoading(false);
    }
  }, [generateBirthInfo, cacheRef]);

  // 加载用户配置 - 简化出生日期获取逻辑，参考UnifiedNumerologyPage实现
  useEffect(() => {
    try {
      let birthDate = null;
      let nickname = '用户';

      // 从用户配置上下文获取用户信息
      if (currentConfig) {
        // 优先从标准配置获取
        birthDate = currentConfig.birthDate;
        nickname = currentConfig.nickname || '用户';

        // 如果没有，尝试从其他位置获取（兼容性）
        if (!birthDate && currentConfig.birthInfo) {
          birthDate = currentConfig.birthInfo.birthDate;
        }
        if (!birthDate && currentConfig.userInfo) {
          birthDate = currentConfig.userInfo.birthDate;
        }
      }

      // 使用默认日期（确保向后兼容性）
      if (!birthDate) {
        birthDate = '1991-04-21';
        console.warn('未找到用户出生日期，使用默认值:', birthDate);
      }

      // 设置用户信息
      setUserInfo({
        nickname: nickname,
        birthDate: birthDate
      });

      // 如果有出生日期，加载玛雅数据
      if (birthDate) {
        try {
          const newBirthDate = new Date(birthDate);
          if (!isNaN(newBirthDate.getTime())) {
            loadBirthInfo(newBirthDate);
          }
        } catch (error) {
          console.error('加载出生信息失败:', error);
          setError('加载失败，请稍后再试');
        }
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('初始化失败:', error);
      // 出错时使用默认值
      setUserInfo({
        nickname: '用户',
        birthDate: '1991-04-21'
      });
      try {
        loadBirthInfo(new Date('1991-04-21'));
      } catch (loadError) {
        console.error('使用默认日期加载失败:', loadError);
        setError('加载失败，请稍后再试');
      }
      setIsInitialized(true);
    }
  }, []);

  // 监听 currentConfig 变化 - 当配置更新时重新加载数据
  useEffect(() => {
    if (!isInitialized || !currentConfig) return;

    const { nickname, birthDate } = currentConfig;

    // 更新用户信息
    setUserInfo({
      nickname: nickname || '用户',
      birthDate: birthDate || ''
    });

    // 如果出生日期有变化，重新计算玛雅数据
    if (birthDate) {
      try {
        const newBirthDate = new Date(birthDate);
        if (!isNaN(newBirthDate.getTime())) {
          // 重新计算玛雅数据
          loadBirthInfo(newBirthDate);
        }
      } catch (error) {
        console.error('处理配置变更失败:', error);
        setError('加载失败，请稍后再试');
      }
    } else {
      // 如果配置中没有出生日期，清除显示的数据
      setBirthInfo(null);
      setShowResults(false);
      setError(null);
    }
  }, [currentConfig, isInitialized, loadBirthInfo]);

  // 简化的用户信息栏 - 紧凑设计
  const UserHeader = () => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-sm border border-white/20 dark:border-gray-700/50 p-4 mb-3 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-sm ring-2 ring-purple-100 dark:ring-purple-900/30">
            <span className="text-lg font-bold">{userInfo.nickname?.charAt(0) || '印'}</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
              {userInfo.nickname ? `${userInfo.nickname}的玛雅印记` : '玛雅出生图'}
            </h1>
            <p className="text-[10px] text-gray-400 dark:text-white uppercase tracking-widest font-medium mt-0.5">
              MAYA BIRTH CHART
            </p>
          </div>
        </div>
        {userInfo.birthDate && (
          <div className="px-2.5 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-full border border-gray-100 dark:border-gray-600">
            <span className="text-[11px] font-medium text-gray-500 dark:text-white tracking-wide">
              {userInfo.birthDate}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // 主界面 - 紧凑设计
  return (
    <div className="space-y-2">
      {/* 简化的用户信息栏 */}
      <UserHeader />

      {error && <ErrorDisplay error={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : (
        showResults && birthInfo ? (
          <ResultsSection birthInfo={birthInfo} showResults={showResults} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-white">
              {!userInfo.birthDate ? '请先设置出生日期' : '正在加载星盘数据...'}
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default MayaBirthChart;