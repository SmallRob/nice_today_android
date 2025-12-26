import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCurrentConfig } from '../contexts/UserConfigContext';
import { formatDateString } from '../services/apiServiceRefactored';
import {
  sealInfoMap,
  toneInfoMap,
  DEFAULT_BIRTH_DATE
} from '../config/mayaConfig';

// 玛雅日期计算工具类
class MayaCalendarCalculator {
  static TONES = [
    '磁性', '月亮', '电子', '自我存在', '倍音', '韵律', '共振',
    '银河', '太阳', '行星', '光谱', '水晶', '宇宙'
  ];

  static SEALS = [
    '红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界连接者', '蓝手', '黄星星',
    '红月亮', '白狗', '蓝猴', '黄人', '红天空行者', '白巫师', '蓝鹰', '黄战士',
    '红地球', '白镜子', '蓝风暴', '黄太阳'
  ];

  static REFERENCE_DATE = new Date('2025-09-23');
  static REFERENCE_KIN = 183;

  // 计算玛雅日期
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
        fullName: `${this.TONES[toneIndex]}的${this.SEALS[seal]}`,
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

  // 计算支持、挑战、指引、推动印记
  static calculateRelatedSeals(sealIndex) {
    return {
      支持: this.SEALS[(sealIndex - 1 + 20) % 20], // 前一个
      挑战: this.SEALS[(sealIndex + 1) % 20],       // 后一个
      指引: this.SEALS[(sealIndex + 5) % 20],       // 对位
      推动: this.SEALS[(sealIndex + 12) % 20]       // 隐匿
    };
  }

  // 生成确定性哈希
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

  // 伪随机数生成器
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

  static getRandomElement(array, seed) {
    if (!array || array.length === 0) return null;
    const index = seed % array.length;
    return array[index];
  }

  // 生成随机整数
  static getRandomInt(min, max, seed) {
    const random = this.seededRandom(seed);
    return Math.floor(random * (max - min + 1)) + min;
  }
}

// 描述生成池
const descriptionPool = {
  白镜子: "洞明世事，深谙人心",
  白狗: "忠诚朋友，真心守护",
  黄星星: "明察秋毫，优雅艺术",
  红龙: "开拓创新，生命之源",
  蓝夜: "梦想家，洞察直觉",
  红风: "灵感涌动，自由呼吸",
  白巫师: "魅力魔法，接收直觉",
  蓝手: "治愈完成，知识行动",
  红地球: "导航进化，同步自然",
  黄人: "智慧自由，影响选择",
  白世界连接者: "死亡重生，平衡连接",
  蓝猴: "游戏魔法，智慧喜悦",
  红蛇: "生存转化，性能量",
  黄战士: "智能勇气，挑战质疑",
  红天空行者: "探索警觉，空间视野",
  白鹰: "创造远见，智慧思想",
  黄种子: "觉醒成长，潜能开花",
  红月亮: "流动净化，普遍情感",
  蓝风暴: "催化能量，自我转变",
  黄太阳: "启蒙生命，光明意识"
};

// 图腾颜色映射（用于Tailwind）
const sealColorClasses = {
  "红龙": "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  "白风": "bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800",
  "蓝夜": "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  "黄种子": "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
  "红蛇": "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
  "白世界连接者": "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800",
  "蓝手": "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800",
  "黄星星": "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
  "红月亮": "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800",
  "白狗": "bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800",
  "蓝猴": "bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800",
  "黄人": "bg-lime-50 dark:bg-lime-950/20 border-lime-200 dark:border-lime-800",
  "红天空行者": "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800",
  "白巫师": "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
  "蓝鹰": "bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800",
  "黄战士": "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
  "红地球": "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800",
  "白镜子": "bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800",
  "蓝风暴": "bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800",
  "黄太阳": "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
};

const MayanTattoo = () => {
  const currentConfig = useCurrentConfig();
  const [tattooData, setTattooData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 生成描述文本
  const generateDescription = useCallback((seal, kin) => {
    const seed = MayaCalendarCalculator.generateDeterministicHash(new Date());
    const baseDesc = descriptionPool[seal] || "独特能量";
    const variations = [
      "内在潜能无限",
      "拥有独特天赋",
      "散发生命光芒",
      "连接宇宙能量"
    ];
    const variation = MayaCalendarCalculator.getRandomElement(variations, seed + kin);
    return `${baseDesc}，${variation}`;
  }, []);

  // 计算图腾数据
  const calculateTattooData = useCallback((birthDate) => {
    if (!birthDate) return null;

    try {
      const mayaDate = MayaCalendarCalculator.calculateMayaDate(birthDate);
      const relatedSeals = MayaCalendarCalculator.calculateRelatedSeals(mayaDate.sealIndex);
      const seed = MayaCalendarCalculator.generateDeterministicHash(birthDate);

      // 生成属性标签
      const attributesPool = [
        "艺术家", "明察秋毫", "开拓者", "梦想家",
        "直觉敏锐", "创造力强", "适应力佳", "善于沟通",
        "领导力", "分析能力", "治愈者", "探索者"
      ];
      const attributes = [
        attributesPool[seed % attributesPool.length],
        attributesPool[(seed + 1) % attributesPool.length],
        attributesPool[(seed + 2) % attributesPool.length],
        attributesPool[(seed + 3) % attributesPool.length]
      ];

      // 生成图腾网络
      const guides = [
        { type: "指引", name: relatedSeals.指引, description: generateDescription(relatedSeals.指引, mayaDate.kin + 1) },
        { type: "主图腾", name: mayaDate.seal, description: generateDescription(mayaDate.seal, mayaDate.kin) },
        { type: "挑战", name: relatedSeals.挑战, description: generateDescription(relatedSeals.挑战, mayaDate.kin + 2) },
        { type: "支持", name: relatedSeals.支持, description: generateDescription(relatedSeals.支持, mayaDate.kin + 3) },
        { type: "推动", name: relatedSeals.推动, description: generateDescription(relatedSeals.推动, mayaDate.kin + 4) }
      ];

      // 格式化出生日期
      const birthDateObj = new Date(birthDate);
      const formattedBirthDate = `${birthDateObj.getFullYear()}年${birthDateObj.getMonth() + 1}月${birthDateObj.getDate()}日`;

      // 格式化当前日期
      const currentDateObj = new Date();
      const formattedCurrentDate = `${currentDateObj.getFullYear()}年${currentDateObj.getMonth() + 1}月${currentDateObj.getDate()}日`;

      return {
        kinNumber: mayaDate.kin,
        kinName: mayaDate.fullName,
        description: generateDescription(mayaDate.seal, mayaDate.kin),
        guides,
        attributes,
        birthDate: formattedBirthDate,
        currentDate: formattedCurrentDate,
        galacticTone: mayaDate.tone,
        solarSeal: mayaDate.seal
      };
    } catch (error) {
      console.error('计算图腾数据时出错:', error);
      return null;
    }
  }, [generateDescription]);

  // 初始化数据
  useEffect(() => {
    const loadTattooData = () => {
      setLoading(true);
      let birthDateToUse = DEFAULT_BIRTH_DATE;

      if (currentConfig && currentConfig.birthDate) {
        try {
          const parsedDate = new Date(currentConfig.birthDate);
          if (!isNaN(parsedDate.getTime())) {
            birthDateToUse = currentConfig.birthDate;
          }
        } catch (error) {
          console.error('解析出生日期失败:', error);
        }
      }

      const data = calculateTattooData(birthDateToUse);
      setTattooData(data);
      setLoading(false);
    };

    loadTattooData();
  }, [currentConfig, calculateTattooData]);

  // 获取图腾颜色类名
  const getSealColorClass = (sealName) => {
    return sealColorClasses[sealName] || "bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800";
  };

  // 生成能量解读文本
  const generateInterpretation = useMemo(() => {
    if (!tattooData) return null;

    const { kinName, guides } = tattooData;
    const guideNames = guides.map(g => g.name);

    return (
      <div className="space-y-3">
        <p>作为<strong className="text-sky-400 dark:text-sky-300">{kinName}</strong>，你拥有独特的生命能量。</p>
        <p>你的<strong className="text-sky-400 dark:text-sky-300">指引力量是{guideNames[0]}</strong>，在人生路上给予你灵性指引。</p>
        <p><strong className="text-sky-400 dark:text-sky-300">{guideNames[3]}</strong>作为你的支持力量，提供稳定的能量基础。</p>
        <p>你的挑战<strong className="text-sky-400 dark:text-sky-300">{guideNames[2]}</strong>推动你不断成长和超越。</p>
        <p><strong className="text-sky-400 dark:text-sky-300">{guideNames[4]}</strong>作为推动力量，激活你的内在潜能。</p>
      </div>
    );
  }, [tattooData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!tattooData) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-center">
        <p className="text-red-700 dark:text-red-300">无法加载图腾数据，请稍后再试。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* 页面标题区域 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-b-lg shadow-lg mb-4">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold mb-1">玛雅图腾解读</h1>
          <p className="text-purple-100 text-sm opacity-90">
            探索你的玛雅印记能量网络
          </p>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="container mx-auto px-4 space-y-3">
        {/* 主要图腾信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
          <div className="text-center mb-4">
            <span className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-3">
              Kin {tattooData.kinNumber}
            </span>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {tattooData.kinName}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 italic mb-4">
              {tattooData.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 text-center">
              <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">银河音阶</div>
              <div className="text-xl font-bold text-purple-700 dark:text-purple-300">{tattooData.galacticTone}</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 text-center">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">太阳印记</div>
              <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{tattooData.solarSeal}</div>
            </div>
          </div>
        </div>

        {/* 能量属性 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
          <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-3 text-center">能量属性</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {tattooData.attributes.map((attr, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-full text-sm text-gray-700 dark:text-gray-300"
              >
                {attr}
              </span>
            ))}
          </div>
        </div>

        {/* 图腾能量网络 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
          <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4 text-center">图腾能量网络</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {tattooData.guides.map((guide, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 text-center border ${getSealColorClass(guide.name)} shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{guide.type}</div>
                <div className="text-lg font-bold text-gray-800 dark:text-white mb-1">{guide.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{guide.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 能量网络关系图 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
          <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-4 text-center">能量网络关系</h3>
          <div className="relative h-64 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg overflow-hidden">
            {/* 中心节点 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white dark:bg-gray-700 rounded-full flex flex-col items-center justify-center shadow-lg z-10">
              <span className="text-xs text-gray-500 dark:text-gray-400">主图腾</span>
              <span className="text-sm font-bold text-gray-800 dark:text-white">{tattooData.solarSeal}</span>
            </div>

            {/* 支持节点 */}
            <div className={`absolute top-4 left-4 w-16 h-16 ${getSealColorClass(tattooData.guides[3].name).split(' ')[0]} rounded-full flex items-center justify-center shadow`}>
              <span className="text-xs font-bold text-gray-800 dark:text-white">{tattooData.guides[3].name.slice(0, 2)}</span>
            </div>

            {/* 挑战节点 */}
            <div className={`absolute top-4 right-4 w-16 h-16 ${getSealColorClass(tattooData.guides[2].name).split(' ')[0]} rounded-full flex items-center justify-center shadow`}>
              <span className="text-xs font-bold text-gray-800 dark:text-white">{tattooData.guides[2].name.slice(0, 2)}</span>
            </div>

            {/* 指引节点 */}
            <div className={`absolute bottom-4 left-4 w-16 h-16 ${getSealColorClass(tattooData.guides[0].name).split(' ')[0]} rounded-full flex items-center justify-center shadow`}>
              <span className="text-xs font-bold text-gray-800 dark:text-white">{tattooData.guides[0].name.slice(0, 2)}</span>
            </div>

            {/* 推动节点 */}
            <div className={`absolute bottom-4 right-4 w-16 h-16 ${getSealColorClass(tattooData.guides[4].name).split(' ')[0]} rounded-full flex items-center justify-center shadow`}>
              <span className="text-xs font-bold text-gray-800 dark:text-white">{tattooData.guides[4].name.slice(0, 2)}</span>
            </div>

            {/* 连接标签 */}
            <div className="absolute top-6 left-6 text-xs text-gray-600 dark:text-gray-400">支持</div>
            <div className="absolute top-6 right-6 text-xs text-gray-600 dark:text-gray-400">挑战</div>
            <div className="absolute bottom-6 left-6 text-xs text-gray-600 dark:text-gray-400">指引</div>
            <div className="absolute bottom-6 right-6 text-xs text-gray-600 dark:text-gray-400">推动</div>
          </div>
        </div>

        {/* 能量解读 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
          <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-4 text-center">能量解读</h3>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
            {generateInterpretation}
          </div>
        </div>

        {/* 底部信息 */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            玛雅历法解读 | 基于13月亮历法 | {tattooData.currentDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MayanTattoo;
