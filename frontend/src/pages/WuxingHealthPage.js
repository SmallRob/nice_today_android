/**
 * 五行养生页面
 * 专注于五行相生相克、季节调养、健康知识等内容
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IconLibrary from '../components/IconLibrary';
import { useUserConfig } from '../contexts/UserConfigContext';
import { calculateDetailedBazi } from '../utils/baziHelper';
import { getDisplayBaziInfo } from '../utils/baziSchema';
import { DEFAULT_REGION } from '../data/ChinaLocationData';

// 五行相生相克可视化组件
const WuxingRelationship = ({ currentElement }) => {
  const relationships = {
    '木': { generates: '火', restricts: '土', generatedBy: '水', restrictedBy: '金', color: 'text-green-600 dark:text-green-400', desc: '主生长、升发' },
    '火': { generates: '土', restricts: '金', generatedBy: '木', restrictedBy: '水', color: 'text-red-600 dark:text-red-400', desc: '主发散、温热' },
    '土': { generates: '金', restricts: '水', generatedBy: '火', restrictedBy: '木', color: 'text-yellow-600 dark:text-yellow-400', desc: '主承载、生化' },
    '金': { generates: '水', restricts: '木', generatedBy: '土', restrictedBy: '火', color: 'text-gray-600 dark:text-gray-400', desc: '主肃降、收敛' },
    '水': { generates: '木', restricts: '火', generatedBy: '金', restrictedBy: '土', color: 'text-blue-600 dark:text-blue-400', desc: '主滋润、下行' }
  };

  const current = relationships[currentElement] || relationships['木'];

  const wuxingData = [
    { element: '木', organ: '肝', emotion: '怒', season: '春', color: 'green' },
    { element: '火', organ: '心', emotion: '喜', season: '夏', color: 'red' },
    { element: '土', organ: '脾', emotion: '思', season: '长夏', color: 'yellow' },
    { element: '金', organ: '肺', emotion: '悲', season: '秋', color: 'gray' },
    { element: '水', organ: '肾', emotion: '恐', season: '冬', color: 'blue' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-md">
      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <IconLibrary.Icon name="energy" size={20} className="mr-2 text-purple-500" />
        五行相生相克
      </h3>

      <div className="relative h-48 sm:h-56 mb-6 flex items-center justify-center">
        <div className="relative w-40 h-40 sm:w-48 sm:h-48">
          {wuxingData.map((item, i) => {
            const angle = (i * 72 - 90) * (Math.PI / 180);
            const x = 50 + 40 * Math.cos(angle);
            const y = 50 + 40 * Math.sin(angle);
            const isActive = item.element === currentElement;
            return (
              <div
                key={item.element}
                className={`absolute w-10 h-10 sm:w-12 sm:h-12 -ml-5 -mt-5 sm:-ml-6 sm:-mt-6 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold transition-all duration-500 ${item.element === '木' ? 'bg-green-500' : item.element === '火' ? 'bg-red-500' : item.element === '土' ? 'bg-yellow-600' : item.element === '金' ? 'bg-gray-500' : 'bg-blue-500'} ${isActive ? 'ring-4 ring-offset-2 ring-purple-500 scale-125 z-10 shadow-lg' : 'opacity-70 shadow-sm'}`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {item.element}
              </div>
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-400 text-center leading-tight">
              五行循环<br />生生不息
            </div>
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="text-gray-300 dark:text-gray-600" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl border border-green-100 dark:border-green-800">
          <p className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-200 mb-1.5 flex items-center">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1.5 sm:mr-2"></span>
            相生关系
          </p>
          <p className="text-[11px] sm:text-sm text-green-700 dark:text-green-100 leading-relaxed">
            {currentElement}生{current.generates}（母子相生），{current.generatedBy}生{currentElement}（母子相生）。相生能促进能量流动，增强生命力。
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-xl border border-red-100 dark:border-red-800">
          <p className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-200 mb-1.5 flex items-center">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full mr-1.5 sm:mr-2"></span>
            相克关系
          </p>
          <p className="text-[11px] sm:text-sm text-red-700 dark:text-red-100 leading-relaxed">
            {currentElement}克{current.restricts}（主客相克），{current.restrictedBy}克{currentElement}（主客相克）。相克能平衡能量，纠正偏颇。
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-[11px] sm:text-sm text-gray-600 dark:text-gray-200 leading-relaxed border border-gray-200 dark:border-gray-600">
        <strong className="text-gray-800 dark:text-white">养生原理：</strong>
        五行理论认为，人体五脏分别对应五行，健康在于五行平衡。当某一行过旺或过弱时，可通过饮食、起居、运动等方式调节，达到阴阳平衡、气血畅通的状态。
      </div>
    </div>
  );
};

// 季节调养组件
const SeasonalHealth = () => {
  const currentSeason = useMemo(() => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return { name: '春', element: '木', organ: '肝', desc: '生发之气，养肝为先' };
    if (month >= 6 && month <= 8) return { name: '夏', element: '火', organ: '心', desc: '生长之气，养心为要' };
    if (month >= 9 && month <= 11) return { name: '秋', element: '金', organ: '肺', desc: '收敛之气，养肺为主' };
    return { name: '冬', element: '水', organ: '肾', desc: '收藏之气，养肾为本' };
  }, []);

  const seasonAdvice = {
    '春': {
      element: '木',
      organ: '肝',
      tips: [
        '早睡早起，春捂秋冻',
        '多食绿色蔬菜、芽苗类',
        '适度运动，疏肝理气',
        '保持心情舒畅，避免生气',
        '可饮用玫瑰花茶疏肝解郁'
      ],
      avoid: [
        '避免熬夜，损伤肝血',
        '少食辛辣刺激性食物',
        '不宜过度劳累',
        '慎食过多酸性食物'
      ]
    },
    '夏': {
      element: '火',
      organ: '心',
      tips: [
        '晚睡早起，午间小憩',
        '多食清热利湿食物',
        '保持心平气和，避免急躁',
        '适度出汗，但避免大汗淋漓',
        '可饮用绿茶、菊花茶清心火'
      ],
      avoid: [
        '避免暴晒，损伤心气',
        '少食生冷寒凉食物',
        '不宜剧烈运动',
        '慎食过多油腻辛辣'
      ]
    },
    '秋': {
      element: '金',
      organ: '肺',
      tips: [
        '早睡早起，收敛神气',
        '多食润肺生津食物',
        '适度运动，增强肺气',
        '保持乐观情绪，避免悲伤',
        '可饮用百合茶润肺止咳'
      ],
      avoid: [
        '避免受凉，损伤肺气',
        '少食辛辣燥热食物',
        '不宜过度悲伤',
        '慎食过多油炸食物'
      ]
    },
    '冬': {
      element: '水',
      organ: '肾',
      tips: [
        '早卧晚起，必待日光',
        '多食温补肾阳食物',
        '适度运动，补肾固精',
        '保持心神安宁，避免惊恐',
        '可饮用枸杞茶补肾益精'
      ],
      avoid: [
        '避免受寒，损伤肾气',
        '少食生冷寒凉食物',
        '不宜过度劳累',
        '慎食过多咸味食物'
      ]
    }
  };

  const advice = seasonAdvice[currentSeason.name];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-md">
      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <IconLibrary.Icon name="clock" size={20} className="mr-2 text-blue-500" />
        季节调养
      </h3>

      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className="text-2xl sm:text-3xl">{currentSeason.name === '春' ? '🍃' : currentSeason.name === '夏' ? '☀️' : currentSeason.name === '秋' ? '🍂' : '❄️'}</span>
            <div>
              <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">当前季节：{currentSeason.name}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{currentSeason.desc}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">主导五行</p>
            <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">{currentSeason.element}</p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${currentSeason.element === '木' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200' : currentSeason.element === '火' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200' : currentSeason.element === '土' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200' : currentSeason.element === '金' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-200' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'}`}>
            对应脏腑：{currentSeason.organ}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 flex items-center">
            <IconLibrary.Icon name="success" size={16} className="mr-1.5" />
            养生要点
          </h4>
          <ul className="space-y-2">
            {advice.tips.map((tip, i) => (
              <li key={i} className="flex items-start text-[11px] sm:text-sm text-gray-700 dark:text-gray-200">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-2 mt-1.5 sm:mt-1 flex-shrink-0"></span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 flex items-center">
            <IconLibrary.Icon name="error" size={16} className="mr-1.5" />
            注意事项
          </h4>
          <ul className="space-y-2">
            {advice.avoid.map((item, i) => (
              <li key={i} className="flex items-start text-[11px] sm:text-sm text-gray-700 dark:text-gray-200">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full mr-2 mt-1.5 sm:mt-1 flex-shrink-0"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// 个性化养生建议组件
const PersonalizedHealth = ({ baziInfo }) => {
  if (!baziInfo || !baziInfo.bazi || !baziInfo.wuxing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-md">
        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
          <IconLibrary.Icon name="user" size={20} className="mr-2 text-purple-500" />
          个性化养生
        </h3>
        <div className="text-center py-8">
          <IconLibrary.Icon name="info" size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">请先设置您的出生信息</p>
          <button
            onClick={() => window.location.href = '/user-config'}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 transition-colors"
          >
            前往设置
          </button>
        </div>
      </div>
    );
  }

  // 计算五行统计
  const wuxingElements = ['木', '火', '土', '金', '水'];
  const elementCounts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const wuxingStr = baziInfo.wuxing.text || '';
  const wuxingList = wuxingStr.split('').filter(c => wuxingElements.includes(c));
  wuxingList.forEach(element => elementCounts[element]++);

  // 找出最旺和最弱的五行
  const strongest = wuxingElements.reduce((a, b) => elementCounts[a] > elementCounts[b] ? a : b);
  const weakest = wuxingElements.reduce((a, b) => elementCounts[a] < elementCounts[b] ? a : b);

  // 获取日主五行
  const dayMaster = baziInfo.bazi.day && typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 ? baziInfo.bazi.day.charAt(0) : '甲';
  const dayMasterElement = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
                                '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' }[dayMaster] || '木';

  const organMap = {
    '木': { organ: '肝', advice: '养肝护眼，疏肝理气', food: '绿茶、枸杞、菊花、菠菜' },
    '火': { organ: '心', advice: '养心安神，清心降火', food: '莲子、百合、绿豆、苦瓜' },
    '土': { organ: '脾', advice: '健脾和胃，益气养血', food: '山药、红枣、小米、南瓜' },
    '金': { organ: '肺', advice: '养肺润燥，益气固表', food: '银耳、雪梨、百合、蜂蜜' },
    '水': { organ: '肾', advice: '补肾固精，滋阴补肾', food: '黑芝麻、核桃、黑豆、枸杞' }
  };

  const dayMasterAdvice = organMap[dayMasterElement];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-md">
      <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <IconLibrary.Icon name="user" size={20} className="mr-2 text-purple-500" />
        个性化养生建议
      </h3>

      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">您的日主</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{dayMaster}</p>
          </div>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">日主五行</p>
            <p className={`text-lg sm:text-xl font-bold ${dayMasterElement === '木' ? 'text-green-600 dark:text-green-400' : dayMasterElement === '火' ? 'text-red-600 dark:text-red-400' : dayMasterElement === '土' ? 'text-yellow-600 dark:text-yellow-400' : dayMasterElement === '金' ? 'text-gray-600 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {dayMasterElement}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200 rounded-full text-xs sm:text-sm font-medium">
            对应脏腑：{dayMasterAdvice.organ}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
            <IconLibrary.Icon name="success" size={16} className="mr-1.5" />
            养生重点
          </h4>
          <p className="text-[11px] sm:text-sm text-blue-700 dark:text-blue-100 mb-2">{dayMasterAdvice.advice}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">推荐食物：{dayMasterAdvice.food}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-100 dark:border-green-800">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">最旺五行</h4>
            <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400 mb-1">{strongest}</p>
            <p className="text-[11px] sm:text-xs text-green-700 dark:text-green-100">
              {strongest}气过旺，宜选择{strongest === '木' ? '金' : strongest === '火' ? '水' : strongest === '土' ? '木' : strongest === '金' ? '火' : '土'}性食物以平衡
            </p>
          </div>

          <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl border border-orange-100 dark:border-orange-800">
            <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">最弱五行</h4>
            <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">{weakest}</p>
            <p className="text-[11px] sm:text-xs text-orange-700 dark:text-orange-100">
              {weakest}气不足，宜选择{weakest}性食物以补益
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 主页面组件
const WuxingHealthPage = () => {
  const navigate = useNavigate();
  const { currentConfig } = useUserConfig();
  const [baziInfo, setBaziInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentElement, setCurrentElement] = useState('木');

  useEffect(() => {
    // 根据季节设置当前五行
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) setCurrentElement('木');
    else if (month >= 6 && month <= 8) setCurrentElement('火');
    else if (month >= 9 && month <= 11) setCurrentElement('金');
    else setCurrentElement('水');

    // 如果有出生信息，计算八字
    if (currentConfig?.birthDate && currentConfig?.birthTime) {
      const calculateBazi = async () => {
        try {
          const lng = currentConfig?.birthLocation?.lng || DEFAULT_REGION.lng;
          const info = calculateDetailedBazi(currentConfig.birthDate, currentConfig.birthTime, lng);
          setBaziInfo(getDisplayBaziInfo(info));
        } catch (error) {
          console.error('八字计算失败:', error);
        } finally {
          setLoading(false);
        }
      };
      calculateBazi();
    } else {
      setLoading(false);
    }
  }, [currentConfig]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/30 dark:to-pink-900/30">
      {/* 导航标题栏 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:text-white/80 flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <h1 className="text-xl font-bold">五行养生</h1>
            <button
              onClick={() => navigate('/dress')}
              className="text-white hover:text-white/80 text-sm"
            >
              穿衣指南
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* 提示卡片 */}
        <div className="bg-purple-100 dark:bg-purple-900/30 border-l-4 border-purple-500 p-4 rounded-r-xl">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-purple-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">
                五行养生智慧
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                基于五行相生相克理论，结合季节规律和个人体质，提供科学的养生建议。顺应天时，调和阴阳，达到身心健康平衡的状态。
              </p>
            </div>
          </div>
        </div>

        {/* 五行相生相克 */}
        <WuxingRelationship currentElement={currentElement} />

        {/* 季节调养 */}
        <SeasonalHealth />

        {/* 个性化养生 */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">正在分析您的体质...</p>
          </div>
        ) : (
          <PersonalizedHealth baziInfo={baziInfo} currentConfig={currentConfig} />
        )}

        {/* 养生知识卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 shadow-md">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
            <IconLibrary.Icon name="book" size={20} className="mr-2 text-indigo-500" />
            养生知识
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">四季养生总则</h4>
              <p className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-200 leading-relaxed">
                春生夏长，秋收冬藏。顺应四时阴阳变化，调节饮食起居，达到天人合一的境界。
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">情志养生</h4>
              <p className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-200 leading-relaxed">
                五行对应五志（喜怒思悲恐），保持心情平和，情绪稳定，是养生的重要环节。
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">起居作息</h4>
              <p className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-200 leading-relaxed">
                遵循"日出而作，日入而息"的自然规律，保证充足睡眠，避免熬夜伤身。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WuxingHealthPage;
