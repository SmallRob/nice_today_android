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

// 优化的加载组件 - 紧凑设计
const LoadingSpinner = memo(() => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center transition-all duration-300">
    <div className="relative w-12 h-12 mx-auto mb-4">
      <div className="absolute inset-0 rounded-full border-4 border-purple-100 dark:border-purple-900/30"></div>
      <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
    </div>
    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 tracking-wide">正在同步宇宙频率...</p>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">计算您的玛雅印记中</p>
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
  }, [personalTraitsStrengthsPool, personalTraitsChallengesPool]);

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
  }, [generateBirthInfo, cacheRef]);

  // 简化的用户信息栏 - 紧凑设计
  const UserHeader = () => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-sm border border-white/20 dark:border-gray-700/50 p-4 mb-3 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-sm ring-2 ring-purple-100 dark:ring-purple-900/30">
            <span className="text-lg font-bold">印</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
              {userInfo.nickname ? `${userInfo.nickname}的玛雅印记` : '玛雅出生图'}
            </h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium mt-0.5">
              MAYA BIRTH CHART
            </p>
          </div>
        </div>
        {userInfo.birthDate && (
          <div className="px-2.5 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-full border border-gray-100 dark:border-gray-600">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 tracking-wide">
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
        <Suspense fallback={<LoadingSpinner />}>
          {showResults && birthInfo ? (
            <ResultsSection birthInfo={birthInfo} showResults={showResults} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">加载中...</p>
            </div>
          )}
        </Suspense>
      )}
    </div>
  );
};

export default MayaBirthChart;