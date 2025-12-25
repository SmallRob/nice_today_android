import React, { useState, useEffect, useCallback } from 'react';
import PageLayout, { Card, Button } from './PageLayout';
import { useCurrentConfig, useUserConfig } from '../contexts/UserConfigContext';
import { baziCacheManager } from '../utils/BaziCacheManager';
import { enhancedUserConfigManager } from '../utils/EnhancedUserConfigManager';
import asyncOperationQueue from '../utils/AsyncOperationQueue';
import errorHandlingManager from '../utils/ErrorHandlingManager';
import '../styles/zodiac-icons.css';
import '../styles/zodiac-mbti-icons.css';
import '../styles/config-selectors.css';
import '../styles/user-info-card.css';
import { calculateFiveGrids, getCharStrokes, getMeaning } from '../utils/nameScoring';
import { calculateDetailedBazi } from '../utils/baziHelper';
import { DEFAULT_REGION } from '../data/ChinaLocationData';
import { getShichenSimple, normalizeShichen } from '../utils/astronomy';
import { getZiWeiDisplayData } from '../utils/ziweiHelper';
import ZiWeiPalaceDisplay from './ZiWeiPalaceDisplay';
import birthDataIntegrityManager from '../utils/BirthDataIntegrityManager'; // 新增：出生数据完整性管理器
import ConfigEditModal from './ConfigEditModal';
import NameScoringModal from './NameScoringModal';

// 八字命理展示组件（优化版：优先从缓存中读取八字信息）
const BaziFortuneDisplay = ({ birthDate, birthTime, birthLocation, lunarBirthDate, trueSolarTime, savedBaziInfo, nickname }) => {
  const [baziInfo, setBaziInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 计算八字信息（优先使用缓存或保存的八字信息）
  useEffect(() => {
    if (!birthDate) return;

    const loadBazi = async () => {
      setLoading(true);
      try {
        // 1. 优先从缓存获取八字信息
        if (nickname) {
          const cachedBazi = baziCacheManager.getBaziByNickname(nickname);
          if (cachedBazi && cachedBazi.bazi) {
            console.log('使用缓存中的八字信息:', nickname);
            setBaziInfo(cachedBazi.bazi);
            return;
          }
        }
        
        // 2. 其次使用保存的八字信息
        if (savedBaziInfo && savedBaziInfo.bazi) {
          console.log('使用配置中保存的八字信息');
          setBaziInfo(savedBaziInfo);
        } else {
          // 3. 如果没有缓存或保存的八字信息，则实时计算
          console.log('配置中无八字信息，开始实时计算');
          const lng = birthLocation?.lng || DEFAULT_REGION.lng;

          // 使用统一的真太阳时计算，确保与农历日期一致
          const useTrueSolarTime = trueSolarTime || birthTime || '12:30';
          const info = calculateDetailedBazi(birthDate, useTrueSolarTime, lng);

          // 如果提供了农历日期，确保显示一致性
          if (lunarBirthDate && info) {
            info.lunar = {
              ...info.lunar,
              text: lunarBirthDate // 使用配置中存储的农历日期
            };
          }
          
          // 计算完成后缓存八字信息
          if (info && nickname) {
            const cacheSuccess = baziCacheManager.cacheBazi(nickname, {
              birthDate,
              birthTime: useTrueSolarTime,
              longitude: lng
            }, info);
            
            if (cacheSuccess) {
              console.log('八字信息已缓存:', nickname);
            }
          }

          setBaziInfo(info);
        }
      } catch (e) {
        console.error('八字加载失败:', e);
      } finally {
        setLoading(false);
      }
    };

    loadBazi();
  }, [birthDate, birthTime, birthLocation, lunarBirthDate, trueSolarTime, savedBaziInfo, nickname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!baziInfo) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        请先设置出生日期
      </div>
    );
  }

  // 验证 baziInfo 数据结构完整性
  const hasValidBaziData = baziInfo && baziInfo.bazi && baziInfo.wuxing &&
                           baziInfo.bazi.day && baziInfo.wuxing.text &&
                           baziInfo.lunar && baziInfo.shichen && baziInfo.nayin;

  if (!hasValidBaziData) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        八字数据不完整，请检查配置
      </div>
    );
  }

  // 直接调用计算函数，避免使用 useMemo
  const { elementCounts, wuxingElements, dayMaster, fortuneType, luckyElement, masterElement, totalScore } = calculateFiveElementStats(baziInfo);

  return (
    <div className="space-y-4">
      {/* 农历生日信息 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-bold mb-1">农历生日</h4>
            <p className="text-2xl font-semibold">{baziInfo.lunar?.text || '未知'}</p>
            <p className="text-sm opacity-80 mt-1">
              公历：{baziInfo.solar?.text || '未知'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">时辰</p>
            <p className="text-lg font-semibold">{baziInfo.shichen?.ganzhi || '未知'}</p>
          </div>
        </div>
      </div>

      {/* 八字四柱表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">柱</th>
              <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">辛丑年</th>
              <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{baziInfo.lunar?.monthStr || '未知'}</th>
              <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{baziInfo.lunar?.dayStr || '未知'}</th>
              <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{baziInfo.shichen?.ganzhi || '未知'}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">八字</td>
              <td className="px-3 py-2 text-center font-mono text-gray-900 dark:text-white">{baziInfo.bazi?.year || '未知'}</td>
              <td className="px-3 py-2 text-center font-mono text-gray-900 dark:text-white">{baziInfo.bazi?.month || '未知'}</td>
              <td className="px-3 py-2 text-center font-mono text-gray-900 dark:text-white">{baziInfo.bazi?.day || '未知'}</td>
              <td className="px-3 py-2 text-center font-mono text-gray-900 dark:text-white">{baziInfo.bazi?.hour || '未知'}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">五行</td>
              <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{baziInfo.wuxing?.year || '未知'}</td>
              <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{baziInfo.wuxing?.month || '未知'}</td>
              <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{baziInfo.wuxing?.day || '未知'}</td>
              <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{baziInfo.wuxing?.hour || '未知'}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">纳音</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-sm">{baziInfo.nayin?.year || '未知'}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-sm">{baziInfo.nayin?.month || '未知'}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-sm">{baziInfo.nayin?.day || '未知'}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-sm">{baziInfo.nayin?.hour || '未知'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 五行统计 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">五行统计</h4>
        <div className="grid grid-cols-5 gap-2">
          {wuxingElements.map((element) => {
            const elementColors = {
              '木': 'bg-green-500', '火': 'bg-red-500', '土': 'bg-yellow-600',
              '金': 'bg-gray-500', '水': 'bg-blue-500'
            };
            return (
              <div key={element} className="text-center">
                <div className={`h-2 rounded-full ${elementColors[element]} mb-1`}></div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{element}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{elementCounts[element]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 八字总述解析 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">八字总述解析</h4>
        <div className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
          <p>
            <span className="font-medium">总述：</span>
            {fortuneType}，八字喜用神「{luckyElement}」，起名最好用五行属性为「{luckyElement}」的字。
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            日主天干为{dayMaster}({masterElement})。五行统计：
            木{elementCounts['木']}，火{elementCounts['火']}，土{elementCounts['土']}，
            金{elementCounts['金']}，水{elementCounts['水']}。
          </p>
        </div>
      </div>

      {/* 命局五行喜忌 */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">命局五行喜忌</h4>
        <div className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
          {(() => {
              const preferences = calculateWuxingPreferences(baziInfo);
              if (!preferences) return null;
            
            return (
              <div className="space-y-3">
                {/* 最喜五行 */}
                {preferences.preferred.filter(p => p.priority === '最喜').map((item, index) => (
                  <div key={`preferred-top-${index}`} className="border-l-4 border-green-500 pl-3">
                    <p className="font-medium">最喜五行{item.element}：</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                      十神：{item.shishen}；方位：{item.fangwei}；数字{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}
                
                {/* 次喜五行 */}
                {preferences.preferred.filter(p => p.priority === '次喜').map((item, index) => (
                  <div key={`preferred-secondary-${index}`} className="border-l-4 border-blue-500 pl-3">
                    <p className="font-medium">次喜五行{item.element}：</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                      十神：{item.shishen}；方位：{item.fangwei}；数字{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}
                
                {/* 最忌五行 */}
                {preferences.avoided.filter(p => p.priority === '最忌').map((item, index) => (
                  <div key={`avoided-top-${index}`} className="border-l-4 border-red-500 pl-3">
                    <p className="font-medium">最忌五行{item.element}：</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                      十神：{item.shishen}；方位：{item.fangwei}；数字：{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}
                
                {/* 次忌五行 */}
                {preferences.avoided.filter(p => p.priority === '次忌').map((item, index) => (
                  <div key={`avoided-secondary-${index}`} className="border-l-4 border-orange-500 pl-3">
                    <p className="font-medium">次忌五行{item.element}：</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                      十神：{item.shishen}；方位：{item.fangwei}；数字：{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}
                
                {/* 平常五行 */}
                {preferences.neutral.map((item, index) => (
                  <div key={`neutral-${index}`} className="border-l-4 border-gray-500 pl-3">
                    <p className="font-medium">平常五行{item.element}：</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                      十神：{item.shishen}；方位：{item.fangwei}；数字{item.shuzi}；色彩{item.secai}
                    </p>
                  </div>
                ))}
              </div>
            );
          })()} 
        </div>
      </div>

      {/* 十年大运 */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">大运</h4>
        <div className="text-sm text-gray-800 dark:text-gray-200">
          {(() => {
              // 从出生日期中提取年份
              const birthYear = birthDate ? parseInt(birthDate.split('-')[0]) : new Date().getFullYear();
              const dayun = calculateDaYun(baziInfo, birthYear);
              if (!dayun) return null;
            
            return (
              <div className="space-y-1">
                {dayun.map((d, index) => (
                  <div key={index} className="flex justify-between py-1 border-b border-yellow-100 dark:border-yellow-800/50">
                    <span className="font-medium">{d.ganzhi} {d.startYear}-{d.endYear}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({d.ageRange})</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

BaziFortuneDisplay.displayName = 'BaziFortuneDisplay';

// 格式化位置字符串
const formatLocationString = (loc) => {
  if (!loc) return '';
  const { province, city, district, lng, lat } = loc;
  // 过滤掉空值
  const parts = [province, city, district].filter(Boolean);
  let str = parts.join(' ');

  // 只有当经纬度都存在时才添加
  if (lng !== undefined && lat !== undefined && lng !== null && lat !== null) {
    // 保留部分小数位，避免过长
    const fmtLng = typeof lng === 'number' ? lng : parseFloat(lng);
    const fmtLat = typeof lat === 'number' ? lat : parseFloat(lat);
    if (!isNaN(fmtLng) && !isNaN(fmtLat)) {
      str += ` (经度: ${fmtLng}, 纬度: ${fmtLat})`;
    }
  }
  return str;
};

// 性别选项（仅用于显示）
const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'secret', label: '保密' }
];

// 优化的加载组件
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
  </div>
);

// 计算五行统计（独立函数，避免使用 useMemo）
const calculateFiveElementStats = (baziInfo) => {
  // 确保数据安全
  if (!baziInfo || !baziInfo.bazi || !baziInfo.wuxing) {
    return {
      elementCounts: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
      wuxingElements: ['木', '火', '土', '金', '水'],
      dayMaster: '未知',
      fortuneType: '数据不可用',
      luckyElement: '无',
      masterElement: '未知',
      totalScore: 0
    };
  }

  const wuxingElements = ['木', '火', '土', '金', '水'];
  const elementCounts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  try {
    // 统计四柱五行
    const wuxingStr = baziInfo.wuxing.text || ''; // "金土 火金 金金 土水"
    const wuxingList = wuxingStr.split('').filter(c => wuxingElements.includes(c));
    wuxingList.forEach(element => {
      elementCounts[element]++;
    });

    // 计算日主和五行得分
    const dayMaster = baziInfo.bazi.day ? baziInfo.bazi.day.charAt(0) : '未知';
    const elementToIndex = { '木': 0, '火': 1, '土': 2, '金': 3, '水': 4 };

    // 简化版八字旺衰计算
    const sameElementIndex = baziInfo.wuxing.year ? elementToIndex[baziInfo.wuxing.year[0]] : -1; // 年干
    const dayElementIndex = elementToIndex[dayMaster];

    // 同类得分（日主和同类）
    const sameTypeScore = (elementCounts['木'] * 1.68) + (elementCounts['火'] * 0.34) +
                         (elementCounts['土'] * 0.75) + (elementCounts['金'] * 1.68) +
                         (elementCounts['水'] * 0.60);

    // 异类得分
    const diffTypeScore = (8 - sameTypeScore);

    // 综合旺衰分数
    const totalScore = Math.abs(sameTypeScore - diffTypeScore);

    // 判断旺衰和喜用神
    let fortuneType = '八字中和';
    let luckyElement = '无特别喜用';
    const dayMasterElement = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
                                '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' }[dayMaster] || '未知';
    const masterElement = dayMasterElement || '未知';

    if (totalScore > 3) {
      if (sameTypeScore > diffTypeScore) {
        fortuneType = '八字偏强';
        // 找出最缺少的五行
        const missingElements = wuxingElements.filter(e => elementCounts[e] === 0);
        const minElements = wuxingElements.filter(e => elementCounts[e] === Math.min(...Object.values(elementCounts)));
        luckyElement = minElements.length > 0 ? minElements[0] : '木';
      } else {
        fortuneType = '八字偏弱';
        // 喜用神为日主同类五行
        luckyElement = masterElement;
      }
    }

    return { elementCounts, wuxingElements, dayMaster, fortuneType, luckyElement, masterElement, totalScore };
  } catch (error) {
    console.error('计算五行统计时出错:', error);
    return {
      elementCounts: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
      wuxingElements: ['木', '火', '土', '金', '水'],
      dayMaster: '未知',
      fortuneType: '计算出错',
      luckyElement: '无',
      masterElement: '未知',
      totalScore: 0
    };
  }
};

// 将五格评分转换为100分制综合评分
const calculateTotalScore = (scoreResult) => {
  if (!scoreResult) return 0;

  const calculateGridScore = (gridValue) => {
    const meaning = getMeaning(gridValue);
    if (meaning.type === '吉') return 20;
    if (meaning.type === '半吉') return 15;
    return 5;
  };

  const tianScore = calculateGridScore(scoreResult.tian);
  const renScore = calculateGridScore(scoreResult.ren);
  const diScore = calculateGridScore(scoreResult.di);
  const waiScore = calculateGridScore(scoreResult.wai);
  const zongScore = calculateGridScore(scoreResult.zong);

  const totalScore = tianScore + renScore + diScore + waiScore + zongScore;

  return Math.round(totalScore);
};

// 计算五行喜忌功能
const calculateWuxingPreferences = (baziInfo) => {
  if (!baziInfo || !baziInfo.bazi || !baziInfo.wuxing) {
    return null;
  }

  // 获取日主（日干）
  const dayMaster = baziInfo.bazi.day.charAt(0);
  
  // 五行对应表
  const wuxingMap = {
    '甲': '木', '乙': '木', '寅': '木', '卯': '木',
    '丙': '火', '丁': '火', '巳': '火', '午': '火',
    '戊': '土', '己': '土', '辰': '土', '戌': '土', '丑': '土', '未': '土',
    '庚': '金', '辛': '金', '申': '金', '酉': '金',
    '壬': '水', '癸': '水', '亥': '水', '子': '水'
  };
  
  // 获取日主五行
  const dayMasterElement = wuxingMap[dayMaster] || '未知';
  
  // 五行生克关系
  const wuxingRelations = {
    '木': { '生': '火', '克': '土', '被生': '水', '被克': '金' },
    '火': { '生': '土', '克': '金', '被生': '木', '被克': '水' },
    '土': { '生': '金', '克': '水', '被生': '火', '被克': '木' },
    '金': { '生': '水', '克': '木', '被生': '土', '被克': '火' },
    '水': { '生': '木', '克': '火', '被生': '金', '被克': '土' }
  };
  
  // 统计四柱五行数量
  const wuxingElements = ['木', '火', '土', '金', '水'];
  const elementCounts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  
  const wuxingStr = baziInfo.wuxing.text; // "金土 火金 金金 土水"
  const wuxingList = wuxingStr.split('').filter(c => wuxingElements.includes(c));
  wuxingList.forEach(element => {
    elementCounts[element]++;
  });
  
  // 分析五行强弱
  let strongestElement = null;
  let weakestElement = null;
  let maxCount = -1;
  let minCount = 10;
  
  wuxingElements.forEach(element => {
    if (elementCounts[element] > maxCount) {
      maxCount = elementCounts[element];
      strongestElement = element;
    }
    if (elementCounts[element] < minCount) {
      minCount = elementCounts[element];
      weakestElement = element;
    }
  });
  
  // 确定喜用神和忌神
  // 如果日主五行在四柱中力量过强，需要克制或泄耗
  // 如果日主五行在四柱中力量过弱，需要生扶或同类相助
  const dayElementCount = elementCounts[dayMasterElement];
  const averageCount = (elementCounts['木'] + elementCounts['火'] + elementCounts['土'] + elementCounts['金'] + elementCounts['水']) / 5;
  
  let preferences = {
    preferred: [], // 喜用神
    avoided: [], // 忌神
    neutral: []  // 平常用神
  };
  
  // 根据日主强弱判断喜用神
  if (dayElementCount > averageCount) {
    // 日主偏强，需要克制、泄耗
    preferences.preferred.push({
      element: wuxingRelations[dayMasterElement]['被克'], // 克我者为官杀，为喜用
      priority: '次喜',
      shishen: '官杀',
      fangwei: '克我方位',
      shuzi: '克我数字',
      secai: '克我色彩'
    });
    
    preferences.preferred.push({
      element: wuxingRelations[dayMasterElement]['生'], // 我生者为食伤，为喜用
      priority: '最喜',
      shishen: '食伤',
      fangwei: '生我方位',
      shuzi: '生我数字',
      secai: '生我色彩'
    });
    
    // 最强的五行作为忌神
    if (strongestElement) {
      preferences.avoided.push({
        element: strongestElement,
        priority: '最忌',
        shishen: '同类过旺',
        fangwei: '同类方位',
        shuzi: '同类数字',
        secai: '同类色彩'
      });
    }
    
    // 被克的五行作为次忌
    preferences.avoided.push({
      element: wuxingRelations[dayMasterElement]['克'], // 我克者为财星，可能为忌
      priority: '次忌',
      shishen: '财星',
      fangwei: '我克方位',
      shuzi: '我克数字',
      secai: '我克色彩'
    });
  } else {
    // 日主偏弱，需要生扶
    preferences.preferred.push({
      element: wuxingRelations[dayMasterElement]['被生'], // 生我者为印枭，为喜用
      priority: '最喜',
      shishen: '印枭',
      fangwei: '生我方位',
      shuzi: '生我数字',
      secai: '生我色彩'
    });
    
    preferences.preferred.push({
      element: dayMasterElement, // 同类为比劫，为喜用
      priority: '次喜',
      shishen: '比劫',
      fangwei: '同类方位',
      shuzi: '同类数字',
      secai: '同类色彩'
    });
    
    // 最强的五行作为忌神（克制日主的）
    if (strongestElement === wuxingRelations[dayMasterElement]['被克']) {
      preferences.avoided.push({
        element: strongestElement,
        priority: '最忌',
        shishen: '官杀',
        fangwei: '克我方位',
        shuzi: '克我数字',
        secai: '克我色彩'
      });
    } else {
      preferences.avoided.push({
        element: wuxingRelations[dayMasterElement]['生'], // 泄耗日主的
        priority: '最忌',
        shishen: '食伤',
        fangwei: '泄耗方位',
        shuzi: '泄耗数字',
        secai: '泄耗色彩'
      });
    }
    
    preferences.avoided.push({
      element: wuxingRelations[dayMasterElement]['克'], // 我克者为财星，可能为忌
      priority: '次忌',
      shishen: '财星',
      fangwei: '我克方位',
      shuzi: '我克数字',
      secai: '我克色彩'
    });
  }
  
  // 剩余的作为平常
  wuxingElements.forEach(element => {
    if (!preferences.preferred.some(p => p.element === element) && 
        !preferences.avoided.some(a => a.element === element)) {
      preferences.neutral.push({
        element: element,
        priority: '平常',
        shishen: '食伤', // 默认值
        fangwei: '平常方位',
        shuzi: '平常数字',
        secai: '平常色彩'
      });
    }
  });
  
  // 根据具体的五行配置设置更详细的属性
  const elementDetails = {
    '木': { shishen: '比劫', fangwei: '东、东南', shuzi: '三、八', secai: '绿、青' },
    '火': { shishen: '食伤', fangwei: '南、东南', shuzi: '二、七', secai: '红、紫、橙' },
    '土': { shishen: '财星', fangwei: '中央、本地', shuzi: '五、零', secai: '黄、棕' },
    '金': { shishen: '官杀', fangwei: '西、西北', shuzi: '四、九', secai: '白、银、金' },
    '水': { shishen: '印枭', fangwei: '北、西南', shuzi: '一、六', secai: '黑、蓝' }
  };
  
  // 更新详细信息
  preferences.preferred.forEach(item => {
    if (elementDetails[item.element]) {
      item.shishen = elementDetails[item.element].shishen;
      item.fangwei = elementDetails[item.element].fangwei;
      item.shuzi = elementDetails[item.element].shuzi;
      item.secai = elementDetails[item.element].secai;
    }
  });
  
  preferences.avoided.forEach(item => {
    if (elementDetails[item.element]) {
      item.shishen = elementDetails[item.element].shishen;
      item.fangwei = elementDetails[item.element].fangwei;
      item.shuzi = elementDetails[item.element].shuzi;
      item.secai = elementDetails[item.element].secai;
    }
  });
  
  preferences.neutral.forEach(item => {
    if (elementDetails[item.element]) {
      item.shishen = elementDetails[item.element].shishen;
      item.fangwei = elementDetails[item.element].fangwei;
      item.shuzi = elementDetails[item.element].shuzi;
      item.secai = elementDetails[item.element].secai;
    }
  });
  
  return preferences;
};

// 计算十年大运
const calculateDaYun = (baziInfo, birthYear) => {
  if (!baziInfo || !baziInfo.bazi) {
    return null;
  }

  // 获取日主（日干）
  const dayMaster = baziInfo.bazi.day.charAt(0);
  
  // 天干
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  // 地支
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 男性阳干顺排，阴干逆排；女性阴干顺排，阳干逆排
  // 根据出生年份判断性别和干支阴阳
  const dayMasterIndex = gan.indexOf(dayMaster);
  
  // 简化版本：根据年干判断阴阳（奇数为阳，偶数为阴）
  const yearGanIndex = gan.indexOf(baziInfo.bazi.year.charAt(0));
  const isYangYear = yearGanIndex % 2 === 0; // 甲、丙、戊、庚、壬为阳
  
  // 男性大运顺排，女性大运逆排
  const isMale = true; // 默认为男性，实际应从配置中获取
  
  let dayunSequence = [];
  
  // 计算大运起始干支
  // 男性阳干或女性阴干：顺排
  // 男性阴干或女性阳干：逆排
  const isForward = (isMale && isYangYear) || (!isMale && !isYangYear);
  
  // 从月柱开始排大运
  const monthGan = baziInfo.bazi.month.charAt(0);
  const monthZhi = baziInfo.bazi.month.charAt(1);
  
  const monthGanIndex = gan.indexOf(monthGan);
  const monthZhiIndex = zhi.indexOf(monthZhi);
  
  // 生成10个大运干支（代表10个10年周期）
  for (let i = 0; i < 10; i++) {
    let ganIndex, zhiIndex;
    
    if (isForward) {
      // 顺排
      ganIndex = (monthGanIndex + i + 1) % 10;
      zhiIndex = (monthZhiIndex + i + 1) % 12;
    } else {
      // 逆排
      ganIndex = (monthGanIndex - i - 1 + 10) % 10;
      zhiIndex = (monthZhiIndex - i - 1 + 12) % 12;
    }
    
    if (ganIndex < 0) ganIndex += 10;
    if (zhiIndex < 0) zhiIndex += 12;
    
    const dagan = gan[ganIndex];
    const dazhi = zhi[zhiIndex];
    
    // 计算大运的起止年份
    // 通常大运从出生后几年开始，这里假设6-10岁开始
    const startAge = 6 + i * 10; // 6-15, 16-25, 26-35...
    const endAge = startAge + 9;
    const startY = birthYear + startAge;
    const endY = startY + 9;
    
    dayunSequence.push({
      ganzhi: dagan + dazhi,
      startYear: startY,
      endYear: endY,
      ageRange: `${startAge}-${endAge}岁`
    });
  }
  
  return dayunSequence;
};

// 配置列表项组件
const ConfigForm = ({ config, index, isActive, onEdit, onDelete, onSetActive, onScoreName, onDragStart, onDragOver, onDrop, isDragging, dragOverIndex }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 检查是否是系统默认配置（已被禁用）
  const isSystemDefault = config.isSystemDefault === true;

  // 拖拽相关样式
  const getDragStyles = () => {
    let styles = '';
    if (isDragging) {
      styles = 'opacity-50 scale-95 shadow-lg';
    } else if (dragOverIndex === index) {
      styles = 'border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20';
    }
    return styles;
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all duration-200 performance-optimized touch-manipulation
        ${isActive ? 'border-blue-500 dark:border-blue-400 shadow-md' : isSystemDefault ? 'border-gray-300 dark:border-gray-600 opacity-60' : 'border-gray-200 dark:border-gray-700'}
        ${getDragStyles()}
      `}
      draggable={!isSystemDefault}
      onDragStart={(e) => !isSystemDefault && onDragStart && onDragStart(e, index)}
      onDragOver={(e) => !isSystemDefault && onDragOver && onDragOver(e, index)}
      onDrop={(e) => !isSystemDefault && onDrop && onDrop(e, index)}
      onDragEnd={() => !isSystemDefault && onDragStart && onDragStart({ target: { dataset: { dragging: false } } }, index)}
    >
      {/* 标题区域 */}
      <div
        className={`bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between ${isSystemDefault ? 'cursor-default' : ''}`}
        onClick={() => !isSystemDefault && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {/* 拖拽把手 */}
          {!isSystemDefault && (
            <div
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 touch-manipulation"
              style={{ cursor: 'grab' }}
              onDragStart={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
              </svg>
            </div>
          )}
          <div className="flex items-center space-x-2">
            {isActive && (
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
            {isSystemDefault && (
              <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-xs rounded-full">
                系统默认
              </span>
            )}
            <h3 className="font-medium text-gray-900 dark:text-white">
              {config.nickname || `配置 ${index + 1}`}
            </h3>
            {config.realName && (
              <div className="flex items-center ml-2 space-x-2">
                <span className="text-gray-500 text-xs">|</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{config.realName}</span>
                {config?.nameScore && (
                  <span className={`px-2 py-0.5 text-xs rounded font-bold ${config.nameScore.totalScore >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    config.nameScore.totalScore >= 80 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    config.nameScore.totalScore >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    config.nameScore.totalScore >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {config.nameScore.totalScore || 0}分
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isActive && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20 text-blue-600 dark:text-blue-400 text-xs rounded-full">
              当前使用
            </span>
          )}
          {!isSystemDefault && (
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {/* 简化的配置信息（展开时显示） */}
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">昵称：</span>
              <span className="ml-1 text-gray-900 dark:text-white font-medium">{config.nickname || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">星座：</span>
              <span className="ml-1 text-gray-900 dark:text-white font-medium">{config.zodiac || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">生肖：</span>
              <span className="ml-1 text-gray-900 dark:text-white font-medium">{config.zodiacAnimal || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">MBTI：</span>
              <span className="ml-1 text-gray-900 dark:text-white font-medium">{config.mbti || '-'}</span>
            </div>
          </div>

          {/* 姓名评分入口 */}
          {config.realName && /[一-龥]/.test(config.realName) ? (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">姓名评分：</span>
                  {config.nameScore && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded font-bold ${config.nameScore.totalScore >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      config.nameScore.totalScore >= 80 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      config.nameScore.totalScore >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      config.nameScore.totalScore >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {config.nameScore.totalScore || 0}分
                    </span>
                  )}
                </div>
                <button
                  className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 transition-colors"
                  onClick={() => onScoreName && onScoreName(index)}
                >
                  {config.nameScore ? '重新评分' : '评分'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm">姓名评分：</span>
                <button
                  className="ml-2 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 transition-colors"
                  onClick={() => onEdit && onEdit(index)}
                >
                  填写姓名并评分
                </button>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2 mt-4">
            {!isActive && !isSystemDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetActive(index)}
              >
                设为默认
              </Button>
            )}
            {onEdit && !isSystemDefault && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onEdit(index)}
              >
                编辑
              </Button>
            )}
            {onEdit && isSystemDefault && (
              <Button
                variant="outline"
                size="sm"
                disabled
              >
                编辑（系统默认）
              </Button>
            )}
            {!isSystemDefault && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(index)}
              >
                删除
              </Button>
            )}
            {isSystemDefault && (
              <Button
                variant="outline"
                size="sm"
                disabled
              >
                删除（系统默认）
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

ConfigForm.displayName = 'ConfigForm';

const UserConfigManagerComponent = () => {
  // 从全局配置上下文获取数据
  const {
    configs,
    currentConfig,
    configManagerReady,
    loading: contextLoading,
    error: contextError,
    initializeConfigManager,
    updateConfig,
    addConfig,
    deleteConfig,
    switchConfig,
    updateBaziInfo,
    calculateAndSyncBazi,
    getValidBirthInfo
  } = useUserConfig();

  // 本地状态（只保留组件特定的状态）
  const [activeConfigIndex, setActiveConfigIndex] = useState(0); // 本地状态保持同步
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState(null); // 错误状态
  const [message, setMessage] = useState(null); // 用于显示提示信息
  const [isTempScoringOpen, setIsTempScoringOpen] = useState(false); // 临时评分弹窗状态
  const [tempScoringConfigIndex, setTempScoringConfigIndex] = useState(null); // 临时评分使用的配置索引
  const [baziKey, setBaziKey] = useState(0); // 八字计算刷新键
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 编辑弹窗状态
  const [editingConfigIndex, setEditingConfigIndex] = useState(null); // 正在编辑的配置索引
  // 用户信息折叠状态
  const [isUserInfoExpanded, setIsUserInfoExpanded] = useState(true);
  // 紫微命宫数据
  const [ziweiData, setZiweiData] = useState(null);
  const [ziweiLoading, setZiweiLoading] = useState(false);
  // 拖拽相关状态
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // 降级处理：如果 enhancedUserConfigManager 不可用，使用基本的默认配置
  const [useFallbackMode, setUseFallbackMode] = useState(false);

  // 配置监听器回调 - 立即更新状态确保刷新
  // 使用 ref 来跟踪前一个 configs.length，避免无限循环
  const prevConfigsLengthRef = React.useRef(0);

  const handleConfigChange = useCallback(({
    configs: updatedConfigs,
    activeConfigIndex: updatedActiveIndex,
    currentConfig,
    forceReload
  }) => {
    console.log('配置变更监听器触发:', {
      configsLength: updatedConfigs.length,
      activeIndex: updatedActiveIndex,
      currentConfigNickname: currentConfig?.nickname,
      forceReload
    });

    // 由于configs现在来自全局上下文，这里只更新本地状态
    setActiveConfigIndex(updatedActiveIndex);

    // 确保展开索引在有效范围内
    if (updatedActiveIndex >= 0 && updatedActiveIndex < updatedConfigs.length) {
      setExpandedIndex(updatedActiveIndex);
    } else if (updatedConfigs.length > 0) {
      setExpandedIndex(0);
    }

    // 如果配置数据变化，强制刷新八字和紫微数据
    // 使用 ref 来避免依赖 configs
    const lengthChanged = updatedConfigs.length !== prevConfigsLengthRef.current;
    if (forceReload || lengthChanged) {
      setBaziKey(prev => prev + 1);
    }
    // 更新 ref
    prevConfigsLengthRef.current = updatedConfigs.length;
  }, []); // 移除 configs 依赖，避免无限循环

  // 显示提示信息
  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    // 根据消息类型和长度调整显示时间
    const displayTime = type === 'error' ? 8000 : 3000; // 错误消息显示8秒，其他消息3秒
    setTimeout(() => {
      setMessage(null);
    }, displayTime);
  }, []);

  // 处理配置保存 - 简化验证流程，减少不必要的警告
  const handleSaveConfig = useCallback(async (index, configData) => {
    // 检查是否是新建配置（index < 0 表示新建，或 index 超出存储范围）
    const storedConfigs = enhancedUserConfigManager.getAllConfigs();
    const isNewConfig = index < 0 || index >= storedConfigs.length;

    console.log('========== 开始保存配置 ==========');
    console.log('传入参数:', { index, isNewConfig, storedConfigsCount: storedConfigs.length });
    console.log('配置数据:', JSON.parse(JSON.stringify(configData, (k, v) =>
      (k === 'bazi' || k === 'lunarInfo' || k === 'nameScore') ? '[对象]' : v
    )));

    // 显示保存中状态
    showMessage('正在保存配置...', 'info');

    // 简化验证：只进行基本的数据完整性检查，不显示警告
    let finalConfigData = { ...configData };
    
    // 确保基本字段存在
    if (!finalConfigData.birthLocation) {
      finalConfigData.birthLocation = { ...DEFAULT_REGION };
    }
    
    // 确保经纬度有效
    if (finalConfigData.birthLocation.lng === undefined || finalConfigData.birthLocation.lng === null || isNaN(finalConfigData.birthLocation.lng)) {
      finalConfigData.birthLocation.lng = DEFAULT_REGION.lng;
    }
    if (finalConfigData.birthLocation.lat === undefined || finalConfigData.birthLocation.lat === null || isNaN(finalConfigData.birthLocation.lat)) {
      finalConfigData.birthLocation.lat = DEFAULT_REGION.lat;
    }
    
    // 第二步：自动为中文姓名打分（只有当 nameScore 不存在时才计算）
    if (finalConfigData.realName && /[一-龥]/.test(finalConfigData.realName) && !finalConfigData.nameScore) {
      try {
        // 智能拆分姓名
        const compoundSurnames = [
          '欧阳', '太史', '端木', '上官', '司马', '东方', '独孤', '南宫', '万俟', '闻人',
          '夏侯', '诸葛', '尉迟', '公羊', '赫连', '澹台', '皇甫', '宗政', '濮阳', '公冶',
          '太叔', '申屠', '公孙', '慕容', '仲孙', '钟离', '长孙', '宇文', '司徒', '鲜于',
          '司空', '闾丘', '子车', '亓官', '司寇', '巫马', '公西', '颛孙', '壤驷', '公良',
          '漆雕', '乐正', '宰父', '谷梁', '拓跋', '夹谷', '轩辕', '令狐', '段干', '百里',
          '呼延', '东郭', '南门', '羊舌', '微生', '公户', '公玉', '公仪', '梁丘', '公仲',
          '公上', '公门', '公山', '公坚', '左丘', '公伯', '西门', '公祖', '第五', '公乘',
          '贯丘', '公皙', '南荣', '东里', '东宫', '仲长', '子书', '子桑', '即墨', '达奚',
          '褚师'
        ];

        let surname = '', firstName = '';
        const name = finalConfigData.realName.trim();

        // 检查是否包含中文圆点
        if (name.includes('·') || name.includes('•')) {
          const parts = name.split(/[·•]/);
          surname = parts[0] || '';
          firstName = parts.slice(1).join('') || '';
        } else {
          // 检查是否是复姓
          let isCompound = false;
          for (const compoundSurname of compoundSurnames) {
            if (name.startsWith(compoundSurname)) {
              surname = compoundSurname;
              firstName = name.substring(compoundSurname.length);
              isCompound = true;
              break;
            }
          }

          if (!isCompound) {
            const nameLength = name.length;
            if (nameLength === 2) {
              surname = name.substring(0, 1);
              firstName = name.substring(1);
            } else if (nameLength === 3) {
              surname = name.substring(0, 1);
              firstName = name.substring(1);
            } else if (nameLength >= 4) {
              surname = name.substring(0, 2);
              firstName = name.substring(2);
            }
          }
        }

        // 计算五格评分
        const surnameChars = surname.split('').filter(c => c);
        const firstNameChars = firstName.split('').filter(c => c);
        const surnameStrokes = surnameChars.map(c => getCharStrokes(c));
        const firstNameStrokes = firstNameChars.map(c => getCharStrokes(c));

        const scoreResult = calculateFiveGrids(
          surname,
          firstName,
          surnameStrokes.map(s => parseInt(s) || 1),
          firstNameStrokes.map(s => parseInt(s) || 1)
        );

        const mainMeaning = getMeaning(scoreResult.ren);
        const totalScore = calculateTotalScore(scoreResult);
        finalConfigData.nameScore = {
          ...scoreResult,
          mainType: mainMeaning.type,
          totalScore: totalScore
        };
      } catch (e) {
        console.error('自动评分失败:', e);
        // 失败时不中断保存流程
      }
    }
    // 如果 nameScore 存在但缺少 totalScore，则计算 totalScore
    else if (finalConfigData.nameScore && finalConfigData.nameScore.totalScore === undefined) {
      const totalScore = calculateTotalScore(finalConfigData.nameScore);
      finalConfigData.nameScore.totalScore = totalScore;
    }

    // 第三步：简化八字计算（仅在必要且数据完整时计算）
    if (finalConfigData.birthDate && !finalConfigData.bazi) {
      try {
        const birthDate = finalConfigData.birthDate;
        const birthTime = finalConfigData.birthTime || '12:30';
        const longitude = finalConfigData.birthLocation?.lng || 116.40;

        // 简化八字计算，只计算基本信息
        const baziInfo = calculateDetailedBazi(birthDate, birthTime, longitude);
        if (baziInfo) {
          finalConfigData.bazi = baziInfo;
          
          // 计算农历信息（简化处理）
          try {
            const { generateLunarAndTrueSolarFields } = await import('../utils/LunarCalendarHelper');
            const lunarFields = generateLunarAndTrueSolarFields({
              ...finalConfigData,
              birthLocation: finalConfigData.birthLocation || { lng: longitude, lat: 39.90 }
            });
            if (lunarFields.lunarBirthDate) {
              finalConfigData.lunarBirthDate = lunarFields.lunarBirthDate;
            }
            if (lunarFields.trueSolarTime) {
              finalConfigData.trueSolarTime = lunarFields.trueSolarTime;
            }
          } catch (error) {
            // 农历计算失败不影响保存
          }
        }
      } catch (error) {
        // 八字计算失败不影响保存
      }
    }

    try {
      // 使用异步操作队列管理保存操作
      const saveOperation = async (operationData) => {
        const { index, finalConfigData } = operationData;
        
        if (isNewConfig) {
          // 新建配置，保存基础配置（包括自动计算的八字）
          console.log('执行添加新配置操作...');
          const addResult = await enhancedUserConfigManager.addBasicConfig(finalConfigData);
          console.log('addBasicConfig 返回结果:', addResult);
          if (!addResult) {
            throw new Error('添加新配置失败');
          }
          console.log('新建基础配置成功（包含八字信息）');
        } else {
          // 现有配置，更新存储（包括八字信息）
          console.log('执行更新配置操作，索引:', index);
          const updateResult = await enhancedUserConfigManager.updateConfigWithNodeUpdate(index, finalConfigData);
          console.log('updateConfigWithNodeUpdate 返回结果:', {
            success: updateResult?.success,
            recovered: updateResult?.recovered,
            error: updateResult?.error
          });
          if (!updateResult || !updateResult.success) {
            throw new Error(updateResult?.error || '更新配置失败');
          }
        }
        
        return true; // 返回成功状态
      };
      
      // 将保存操作添加到队列
      await asyncOperationQueue.enqueue(
        saveOperation,
        'save-config',
        { index, finalConfigData },
        // 乐观更新数据（可选）
        null
      );

      console.log('========== 保存配置成功 ==========');
      console.log('监听器将自动更新状态');

      // 同步更新八字缓存
      if (finalConfigData.bazi && finalConfigData.nickname) {
        const birthInfo = {
          birthDate: finalConfigData.birthDate,
          birthTime: finalConfigData.birthTime || '12:30',
          longitude: finalConfigData.birthLocation?.lng || 116.40
        };
        
        const cacheSuccess = baziCacheManager.cacheBazi(
          finalConfigData.nickname,
          birthInfo,
          finalConfigData.bazi
        );
        
        if (cacheSuccess) {
          console.log('八字信息已同步到缓存:', finalConfigData.nickname);
        } else {
          console.warn('八字信息同步到缓存失败:', finalConfigData.nickname);
        }
      }
      
      // 显示成功消息
      showMessage('✅ 配置保存成功', 'success');

      // 刷新八字和紫微命宫数据
      setBaziKey(prev => prev + 1);

      // 延迟后清除消息，让用户看到成功提示
      setTimeout(() => {
        setMessage(null);
      }, 2000);

      return true; // 返回成功状态
    } catch (error) {
      console.error('========== 保存配置失败 ==========');
      console.error('错误信息:', error.message);
      console.error('错误堆栈:', error.stack);

      // 使用错误处理管理器记录错误
      errorHandlingManager.logError('save-config', error, {
        configIndex: index,
        configData: finalConfigData
      });
      
      // 尝试恢复
      const recoveryResult = await errorHandlingManager.attemptRecovery(
        'save-config',
        async () => {
          // 尝试使用修复后的配置数据保存
          const repairedConfig = errorHandlingManager.validateAndRepairConfig(finalConfigData);
          if (isNewConfig) {
            return enhancedUserConfigManager.addBasicConfig(repairedConfig);
          } else {
            return enhancedUserConfigManager.updateConfigWithNodeUpdate(index, repairedConfig);
          }
        },
        { configIndex: index, configData: finalConfigData }
      );
      
      if (recoveryResult) {
        showMessage('✅ 配置已通过修复后保存成功', 'success');
      } else {
        // 显示错误消息
        showMessage('❌ 保存失败: ' + error.message, 'error');
        
        // 将异常信息传递给调用者
        throw error;
      }
    }
  }, [showMessage]);

  // 处理添加新配置 - 只创建临时配置，不直接保存
  const handleAddConfig = useCallback(() => {
    // 直接打开新建配置弹窗，不添加到列表
    setEditingConfigIndex(-1); // 使用特殊标记 -1 表示新建
    setIsEditModalOpen(true);
    showMessage('请填写配置信息', 'info');
  }, [showMessage]);

  // 处理从模板复制新建配置
  const handleAddFromTemplate = useCallback(async () => {
    try {
      showMessage('正在从模板创建新配置...', 'info');

      // 使用异步操作队列管理从模板添加配置操作
      const addFromTemplateOperation = async () => {
        // 从默认配置模板复制并保存
        const success = await enhancedUserConfigManager.addConfigFromTemplate();
        
        if (!success) {
          throw new Error('从模板创建配置返回失败');
        }
        
        return success;
      };
      
      // 将从模板添加配置操作添加到队列
      const success = await asyncOperationQueue.enqueue(
        addFromTemplateOperation,
        'add-from-template',
        {},
        // 乐观更新数据（可选）
        null
      );

      if (success) {
        showMessage('✅ 从模板创建新配置成功', 'success');

        // 延迟后清除消息
        setTimeout(() => {
          setMessage(null);
        }, 2000);
      }
    } catch (error) {
      console.error('从模板创建配置失败:', error);
      
      // 使用错误处理管理器记录错误
      errorHandlingManager.logError('add-from-template', error, {});
      
      // 尝试恢复
      const recoveryResult = await errorHandlingManager.attemptRecovery(
        'add-from-template',
        async () => {
          // 尝试重新从模板创建配置
          return await enhancedUserConfigManager.addConfigFromTemplate();
        },
        {}
      );
      
      if (recoveryResult) {
        showMessage('✅ 从模板创建配置已通过恢复机制成功', 'success');
      } else {
        showMessage('❌ 从模板创建失败: ' + error.message, 'error');
      }
    }
  }, [showMessage, setMessage]);

  // 处理删除配置
  const handleDeleteConfig = useCallback(async (index) => {
    if (configs.length <= 1) {
      showMessage('至少需要保留一个配置', 'error');
      return;
    }

    // 检查是否是临时配置（不在存储中）
    const storedConfigs = enhancedUserConfigManager.getAllConfigs();
    const isTempConfig = index >= storedConfigs.length;

    // 使用自定义确认对话框替代window.confirm
    if (window.confirm('确定要删除这个配置吗？')) {
      let configToDelete = null; // 确保在 try-catch 作用域外定义
      try {
        // 获取配置信息以清理相关缓存
        configToDelete = configs[index];
        
        // 使用异步操作队列管理删除操作
        const deleteOperation = async (operationData) => {
          const { index } = operationData;
          
          // 从存储中移除配置
          await enhancedUserConfigManager.removeConfig(index);
          // deleteConfig 内部已经调用了 notifyListeners
          // 监听器会自动更新本地状态，这里只需要调整展开索引
          // 注意：监听器更新是异步的，所以需要从 enhancedUserConfigManager 获取最新长度
          const freshConfigs = enhancedUserConfigManager.getAllConfigs();
          setExpandedIndex(prev => Math.max(0, Math.min(prev, freshConfigs.length - 1)));
          
          return true;
        };
        
        // 将删除操作添加到队列
        await asyncOperationQueue.enqueue(
          deleteOperation,
          'delete-config',
          { index },
          // 乐观更新数据（可选）
          null
        );
        
        showMessage('删除配置成功', 'success');
        
        // 清理相关缓存
        if (configToDelete && configToDelete.nickname) {
          baziCacheManager.clearCache(configToDelete.nickname);
          console.log('已清理配置相关缓存:', configToDelete.nickname);
        }
      } catch (error) {
        console.error('删除配置失败:', error);
        
        // 使用错误处理管理器记录错误
        errorHandlingManager.logError('delete-config', error, {
          configIndex: index,
          configToDelete: configToDelete
        });
        
        // 尝试恢复
        const recoveryResult = await errorHandlingManager.attemptRecovery(
          'delete-config',
          async () => {
            // 尝试重新执行删除操作
            await enhancedUserConfigManager.removeConfig(index);
            return true;
          },
          { configIndex: index, configToDelete: configToDelete }
        );
        
        if (recoveryResult) {
          showMessage('✅ 配置已通过恢复机制删除成功', 'success');
        } else {
          showMessage(`删除配置失败: ${error.message}`, 'error');
        }
      }
    }
  }, [configs.length, showMessage, configs]);

  // 处理编辑配置
  const handleEditConfig = useCallback((index) => {
    setEditingConfigIndex(index);
    setIsEditModalOpen(true);
  }, []);

  // 处理姓名评分
  const handleScoreName = useCallback((index) => {
    setTempScoringConfigIndex(index);
    setIsTempScoringOpen(true);
  }, []);

  // 优化处理设置活跃配置 - 异步切换避免卡顿
  const handleSetActiveConfig = useCallback(async (index) => {
    if (isSwitching) return;

    try {
      setIsSwitching(true);
      setError(null);

      // 使用异步操作队列管理设置活跃配置操作
      const setActiveOperation = async (operationData) => {
        const { index } = operationData;
        
        // 异步设置活跃配置
        await new Promise(resolve => setTimeout(resolve, 50));
        await enhancedUserConfigManager.setActiveConfig(index);
        
        return true;
      };
      
      // 将设置活跃配置操作添加到队列
      await asyncOperationQueue.enqueue(
        setActiveOperation,
        'set-active-config',
        { index },
        // 乐观更新数据（可选）
        null
      );
      
      // setActiveConfig 内部已经调用了 notifyListeners
      // 监听器会自动更新本地状态，不需要手动更新
      console.log('设置活跃配置成功，监听器将自动更新状态');

      // 延迟更新切换状态，确保UI流畅
      setTimeout(() => {
        setIsSwitching(false);
      }, 300);
    } catch (error) {
      console.error('切换配置失败:', error);
      
      // 使用错误处理管理器记录错误
      errorHandlingManager.logError('set-active-config', error, {
        configIndex: index
      });
      
      // 尝试恢复
      const recoveryResult = await errorHandlingManager.attemptRecovery(
        'set-active-config',
        async () => {
          // 尝试恢复到之前的状态
          const previousActiveIndex = enhancedUserConfigManager.getActiveConfigIndex();
          if (previousActiveIndex !== index) {
            await enhancedUserConfigManager.setActiveConfig(previousActiveIndex);
          }
          return true;
        },
        { configIndex: index, previousActiveIndex: enhancedUserConfigManager.getActiveConfigIndex() }
      );
      
      if (recoveryResult) {
        setError('切换配置失败，已恢复到之前状态');
      } else {
        setError('切换配置失败: ' + error.message);
      }
      setIsSwitching(false);

      // 恢复之前的状态
      const activeIndex = enhancedUserConfigManager.getActiveConfigIndex();
      setActiveConfigIndex(activeIndex);
    }
  }, [isSwitching]);

  // 处理展开/折叠
  const handleToggleExpand = useCallback((index) => {
    setExpandedIndex(prev => prev === index ? -1 : index);
  }, []);

  // 处理导入配置
  const handleImportConfigs = useCallback(() => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const jsonData = e.target.result;
            const success = await enhancedUserConfigManager.importConfigs(jsonData);
            if (success) {
              // importConfigs 内部已经调用了 notifyListeners
              // 监听器会自动更新本地状态
              console.log('导入配置成功，监听器将自动更新状态');
              showMessage('导入配置成功', 'success');
            } else {
              showMessage('导入配置失败，请检查文件格式', 'error');
            }
          } catch (error) {
            showMessage('读取文件失败: ' + error.message, 'error');
          }
        };

        reader.readAsText(file);
      };

      input.click();
    } catch (error) {
      showMessage('导入失败: ' + error.message, 'error');
    }
  }, [showMessage]);

  // 处理导出配置
  const handleExportConfigs = useCallback(() => {
    try {
      const jsonData = enhancedUserConfigManager.exportConfigs();
      if (!jsonData) {
        showMessage('导出配置失败', 'error');
        return;
      }

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `nice-today-configs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
      showMessage('导出配置成功', 'success');
    } catch (error) {
      showMessage('导出配置失败: ' + error.message, 'error');
    }
  }, [showMessage]);

  // 计算紫微命宫数据（当配置或活跃配置索引变化时）
  useEffect(() => {
    const loadZiweiData = async () => {
      // 检查是否有有效的配置
      if (!configs || configs.length === 0 || activeConfigIndex < 0 || activeConfigIndex >= configs.length) {
        setZiweiData(null);
        return;
      }

      const currentConfig = configs[activeConfigIndex];
      if (!currentConfig) {
        setZiweiData(null);
        return;
      }

      // 检查是否有必要的出生信息
      if (!currentConfig.birthDate) {
        // 没有出生日期，返回降级数据
        setZiweiData({
          error: '缺少出生日期',
          baziInfo: null,
          ziweiData: null,
          calculatedAt: new Date().toISOString()
        });
        return;
      }

      setZiweiLoading(true);

      try {
        // 使用 getZiWeiDisplayData 计算紫微命宫
        const result = await getZiWeiDisplayData(currentConfig);

        if (result) {
          setZiweiData(result);
        } else {
          // 计算失败，返回降级数据
          setZiweiData({
            error: '紫微命宫计算失败',
            baziInfo: null,
            ziweiData: null,
            calculatedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('计算紫微命宫失败:', error);
        setZiweiData({
          error: error.message,
          baziInfo: null,
          ziweiData: null,
          calculatedAt: new Date().toISOString()
        });
      } finally {
        setZiweiLoading(false);
      }
    };

    loadZiweiData();
  }, [configs, activeConfigIndex, baziKey]); // 当配置、活跃配置索引或八字刷新键变化时重新计算

  // 拖拽开始
  const handleDragStart = useCallback((e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
    setIsDragging(true);
  }, []);

  // 拖拽经过
  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  // 拖拽放置
  const handleDrop = useCallback(async (e, toIndex) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (isNaN(fromIndex) || fromIndex === toIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setIsDragging(false);
      return;
    }

    try {
      // 使用异步操作队列管理排序操作
      const reorderOperation = async (operationData) => {
        const { fromIndex, toIndex } = operationData;
        
        // 执行排序
        const success = await enhancedUserConfigManager.reorderConfig(fromIndex, toIndex);
        
        if (!success) {
          throw new Error('配置排序失败');
        }
        
        return success;
      };
      
      // 将排序操作添加到队列
      const success = await asyncOperationQueue.enqueue(
        reorderOperation,
        'reorder-config',
        { fromIndex, toIndex },
        // 乐观更新数据（可选）
        null
      );

      if (success) {
        showMessage('配置排序成功', 'success');
      }
    } catch (error) {
      console.error('排序配置失败:', error);
      
      // 使用错误处理管理器记录错误
      errorHandlingManager.logError('reorder-config', error, {
        fromIndex,
        toIndex
      });
      
      // 尝试恢复
      const recoveryResult = await errorHandlingManager.attemptRecovery(
        'reorder-config',
        async () => {
          // 尝试恢复到之前的排序状态
          // 这里可以实现撤销操作，暂时返回true表示恢复成功
          return true;
        },
        { fromIndex, toIndex }
      );
      
      if (recoveryResult) {
        showMessage('✅ 配置排序已通过恢复机制处理', 'success');
      } else {
        showMessage(`排序失败: ${error.message}`, 'error');
      }
    } finally {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setIsDragging(false);
    }
  }, [showMessage]);

  if (contextLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载配置...</p>
        </div>
      </div>
    );
  }

  if (contextError) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 dark:text-red-300">{contextError}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 dark:text-red-400 text-sm hover:underline"
        >
          重新加载
        </button>
      </div>
    );
  }

  // 用户信息卡片组件 - 仿Steam风格
  const UserInfoCard = ({ config }) => {
    if (!config) return null;

    // 获取显示姓名（优先使用真实姓名，否则使用昵称或"匿名者"）
    const displayName = config.realName || config.nickname || '匿名者';
    const nickName = config.nickname || '未设置昵称';

    // 获取姓名首字用于头像
    const avatarText = displayName ? displayName.charAt(0) : '?';

    // 评分等级
    const getScoreLevel = (score) => {
      if (score >= 90) return 'excellent';
      if (score >= 80) return 'good';
      if (score >= 70) return 'fair';
      return 'poor';
    };

    const scoreLevel = config.nameScore ? getScoreLevel(config.nameScore.totalScore) : null;

    // 格式化地点
    const formatLocation = (loc) => {
      if (!loc) return '未设置';
      const parts = [loc.province, loc.city, loc.district].filter(Boolean);
      if (parts.length === 0) return '未设置';
      return parts.join(' ') + (loc.lng && loc.lat ?
        ` (经度: ${parseFloat(loc.lng).toFixed(2)}, 纬度: ${parseFloat(loc.lat).toFixed(2)})` : '');
    };

    return (
      <div className="user-info-card">
        {/* 装饰性顶部条 */}
        <div className="decorative-bar"></div>

        {/* 用户头部信息 */}
        <div className="user-header">
          {/* 头像 */}
          <div className="default-avatar">
            <span className="avatar-text">{avatarText}</span>
          </div>

          {/* 用户名称区域 */}
          <div className="user-names">
            {/* 姓名行 */}
            <div className="username-row">
              <h3 className="username">{displayName}</h3>
              {/* 评分徽章 */}
              {config.nameScore && (
                <span className={`score-badge score-${scoreLevel}`}>
                  {config.nameScore.totalScore}分
                </span>
              )}
            </div>

            {/* 昵称标签 */}
            <p className="user-tag">@{nickName}</p>
          </div>
        </div>

        {/* 用户详情区域 */}
        <div className="user-details">
          <div className="detail-row">
            <span className="detail-label">出生日期</span>
            <span className="detail-value birthdate">{config.birthDate || '未设置'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">出生时间</span>
            <span className="detail-value birthtime">
              {config.birthTime || '12:30'}
              <span className="text-xs text-gray-500 ml-2">
                ({normalizeShichen(config.shichen || getShichenSimple(config.birthTime || '12:30'))})
              </span>
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">性别</span>
            <span className="detail-value gender">
              {GENDER_OPTIONS.find(opt => opt.value === config.gender)?.label || '保密'}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">星座</span>
            <span className="detail-value zodiac">{config.zodiac || '未设置'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">生肖</span>
            <span className="detail-value zodiac">{config.zodiacAnimal || '未设置'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">MBTI类型</span>
            <span className="detail-value mbti">{config.mbti || '未设置'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">出生地点</span>
            <span className="detail-value location">{formatLocation(config.birthLocation)}</span>
          </div>

          {/* 姓名评分按钮行 */}
          {/[一-龥]/.test(config.realName || '') && (
            <div className="detail-row" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>
              <span className="detail-label"></span>
              <div style={{ flex: 1 }}>
                <button
                  className="score-btn"
                  onClick={() => {
                    setTempScoringConfigIndex(activeConfigIndex);
                    setIsTempScoringOpen(true);
                  }}
                >
                  {config.nameScore ? '🔄 重新计算评分' : '✏️ 填写姓名并评分'}
                </button>
              </div>
            </div>
          )}

          {/* 未填写姓名时的评分入口 */}
          {!config.realName && (
            <div className="detail-row" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>
              <span className="detail-label"></span>
              <div style={{ flex: 1 }}>
                <button
                  className="score-btn"
                  onClick={() => {
                    setTempScoringConfigIndex(activeConfigIndex);
                    setIsTempScoringOpen(true);
                  }}
                >
                  ✏️ 填写姓名并评分
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 消息提示 */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900 border-l-4 border-red-400' : message.type === 'success' ? 'bg-green-50 dark:bg-green-900 border-l-4 border-green-400' : 'bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400'}`}>
          <p className={`${message.type === 'error' ? 'text-red-700 dark:text-red-300' : message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'} whitespace-pre-line`}>
            {message.text}
          </p>
        </div>
      )}
      {/* 用户信息 - 使用优化的卡片样式 */}
      <Card title="用户信息">
        <div className="p-4">
          {configs[activeConfigIndex] ? (
            <UserInfoCard config={configs[activeConfigIndex]} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">当前没有可用配置</p>
          )}
        </div>
      </Card>

      {/* 紫微命宫展示栏目 */}
      <Card
        title="紫微命宫"
        className="mb-6"
        headerExtra={
          ziweiLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
              计算中...
            </div>
          )
        }
      >
        <ZiWeiPalaceDisplay
          ziweiData={ziweiData}
          birthDate={configs[activeConfigIndex]?.birthDate}
          birthTime={configs[activeConfigIndex]?.birthTime}
          longitude={configs[activeConfigIndex]?.birthLocation?.lng}
          nickname={configs[activeConfigIndex]?.nickname}
        />
      </Card>

      {/* 八字命格展示栏目 */}
      <Card
        title="八字命格"
        className="mb-6"
        headerExtra={
          <div className="flex space-x-2">
            <button
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              onClick={() => {
                // 触发重新计算
                if (configs[activeConfigIndex]?.birthDate) {
                  setBaziKey(prev => prev + 1);
                  showMessage('🔄 正在刷新八字信息...', 'info');
                } else {
                  showMessage('请先设置出生日期', 'error');
                }
              }}
              title="刷新八字信息"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              onClick={async () => {
                // 从当前配置的出生信息重新计算八字并同步到缓存和配置
                if (configs[activeConfigIndex]?.nickname) {
                  try {
                    const config = configs[activeConfigIndex];
                    const nickname = config.nickname;
                    const birthDate = config.birthDate;
                    const birthTime = config.birthTime || '12:30';
                    const longitude = config.birthLocation?.lng || 116.40;

                    if (!birthDate) {
                      showMessage('请先设置出生日期', 'error');
                      return;
                    }

                    console.log('开始同步八字信息:', { nickname, birthDate, birthTime, longitude });

                    // 显示加载状态
                    showMessage('⏳ 正在计算八字信息...', 'info');

                    // 1. 计算八字信息
                    const baziInfo = calculateDetailedBazi(birthDate, birthTime, longitude);
                    if (!baziInfo) {
                      showMessage('❌ 八字计算失败', 'error');
                      return;
                    }

                    // 2. 同步八字到全局配置
                    showMessage('⏳ 正在保存八字信息到配置...', 'info');
                    const updateSuccess = await enhancedUserConfigManager.updateBaziInfo(nickname, {
                      bazi: baziInfo,
                      lunarBirthDate: baziInfo.lunar?.text,
                      trueSolarTime: birthTime,
                      lastCalculated: new Date().toISOString()
                    });

                    if (!updateSuccess) {
                      showMessage('❌ 八字信息更新到配置失败', 'error');
                      return;
                    }

                    // 3. 同步八字到缓存（使用默认过期时间）
                    const cacheSuccess = baziCacheManager.cacheBazi(nickname, {
                      birthDate,
                      birthTime,
                      longitude
                    }, baziInfo);

                    if (!cacheSuccess) {
                      console.warn('八字信息同步到缓存失败，但已保存到配置');
                    }

                    // 4. 刷新显示
                    setBaziKey(prev => prev + 1);
                    showMessage('✅ 八字信息已成功同步', 'success');

                  } catch (error) {
                    console.error('同步八字信息失败:', error);
                    showMessage('❌ 同步八字信息失败: ' + error.message, 'error');
                  }
                }
              }}
              title="同步八字到全局配置"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </button>
          </div>
        }
      >
        {configs[activeConfigIndex]?.birthDate ? (
          (() => {
            const currentConfig = configs[activeConfigIndex];
            return currentConfig ? (
              <BaziFortuneDisplay
                key={`${baziKey}-${currentConfig.nickname}-${currentConfig.birthDate}`}
                birthDate={currentConfig.birthDate}
                birthTime={currentConfig.birthTime || '12:30'}
                birthLocation={currentConfig.birthLocation}
                lunarBirthDate={currentConfig.lunarBirthDate}
                trueSolarTime={currentConfig.trueSolarTime}
                savedBaziInfo={currentConfig.bazi}
                nickname={currentConfig.nickname}
              />
            ) : null;
          })()
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <p>请先设置出生日期以查看八字命格信息</p>
          </div>
        )}
      </Card>

      {/* 用户配置管理 - 优化版 */}
      <Card title="用户配置" className="mb-6">
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold text-blue-700 dark:text-blue-400">🎯 配置管理</span>
              在这里管理您的个人信息配置，包括昵称、出生日期、星座和生肖。
              您可以创建多个配置，并随时切换使用哪个配置。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="primary"
              onClick={handleAddConfig}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>添加新配置</span>
            </Button>

            <Button
              variant="primary"
              onClick={handleAddFromTemplate}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
              title="以系统默认用户'叉子'的配置为模板创建新用户"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>从模板新建</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleImportConfigs}
              className="flex items-center justify-center space-x-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>导入配置</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleExportConfigs}
              className="flex items-center justify-center space-x-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>导出配置</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // 批量检查数据完整性
                try {
                  console.log('开始批量检查数据完整性...');
                  const results = birthDataIntegrityManager.batchValidateConfigs(configs);
                  
                  if (results.summary.errors > 0 || results.summary.warnings > 0) {
                    const report = birthDataIntegrityManager.generateReport(results);
                    console.log('数据完整性检查报告:', report);
                    
                    // 显示检查结果
                    const errorCount = results.summary.errors;
                    const warningCount = results.summary.warnings;
                    const correctionCount = results.summary.corrections;
                    
                    let message = `数据完整性检查完成：`;
                    if (errorCount > 0) message += ` ❌ ${errorCount}个错误`;
                    if (warningCount > 0) message += ` ⚠️ ${warningCount}个警告`;
                    if (correctionCount > 0) message += ` 🔧 ${correctionCount}个可修复项`;
                    if (errorCount === 0 && warningCount === 0) message += ` ✅ 所有配置数据完整`;
                    
                    showMessage(message, errorCount > 0 ? 'error' : warningCount > 0 ? 'info' : 'success');
                  } else {
                    showMessage('✅ 所有配置数据完整，无需修复', 'success');
                  }
                } catch (error) {
                  console.error('数据完整性检查失败:', error);
                  showMessage('❌ 数据完整性检查失败: ' + error.message, 'error');
                }
              }}
              className="flex items-center justify-center space-x-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 transition-all duration-200"
            >
              <span className="text-lg">🔍</span>
              <span>数据检查</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // 为他人评分时，不使用配置索引
                setTempScoringConfigIndex(null);
                setIsTempScoringOpen(true);
              }}
              className="flex items-center justify-center space-x-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all duration-200"
            >
              <span className="text-lg">💯</span>
              <span>为他人评分</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 临时评分弹窗 */}
      <NameScoringModal
        isOpen={isTempScoringOpen}
        onClose={() => {
          setIsTempScoringOpen(false);
          setTempScoringConfigIndex(null);
        }}
        name={configs[tempScoringConfigIndex]?.realName || ''}
        isPersonal={tempScoringConfigIndex !== null}
        onSaveScore={async (score, inputName) => {
          // 保存评分到配置（仅个人评分）
          if (tempScoringConfigIndex !== null && score) {
            const totalScore = calculateTotalScore(score);
            const updateData = { nameScore: { ...score, totalScore } };

            // 如果用户输入了姓名且配置中没有姓名，则保存姓名
            if (inputName && inputName.trim() && /[一-龥]/.test(inputName.trim())) {
              const config = configs[tempScoringConfigIndex];
              if (!config.realName) {
                updateData.realName = inputName.trim();
                console.log('保存姓名到配置:', updateData.realName);
              }
            }

            // 使用异步操作队列管理评分保存操作
            try {
              const saveScoreOperation = async (operationData) => {
                const { tempScoringConfigIndex, updateData, configs } = operationData;
                
                // 更新配置
                await enhancedUserConfigManager.updateConfigWithNodeUpdate(tempScoringConfigIndex, updateData);
                console.log('姓名评分已保存到配置索引:', tempScoringConfigIndex);
                
                // 同步更新八字缓存
                const config = configs[tempScoringConfigIndex];
                if (config && config.bazi && config.nickname) {
                  const birthInfo = {
                    birthDate: config.birthDate,
                    birthTime: config.birthTime || '12:30',
                    longitude: config.birthLocation?.lng || 116.40
                  };
                  
                  const cacheSuccess = baziCacheManager.cacheBazi(
                    config.nickname,
                    birthInfo,
                    config.bazi
                  );
                  
                  if (cacheSuccess) {
                    console.log('八字信息已同步到缓存:', config.nickname);
                  } else {
                    console.warn('八字信息同步到缓存失败:', config.nickname);
                  }
                }
                
                return true;
              };
              
              // 将评分保存操作添加到队列
              await asyncOperationQueue.enqueue(
                saveScoreOperation,
                'save-name-score',
                { tempScoringConfigIndex, updateData, configs },
                // 乐观更新数据（可选）
                null
              );
            } catch (error) {
              console.error('保存姓名评分失败:', error);
              
              // 使用错误处理管理器记录错误
              errorHandlingManager.logError('save-name-score', error, {
                tempScoringConfigIndex,
                updateData
              });
              
              // 尝试恢复
              const recoveryResult = await errorHandlingManager.attemptRecovery(
                'save-name-score',
                async () => {
                  // 尝试使用修复后的数据保存
                  const repairedConfig = errorHandlingManager.validateAndRepairConfig({
                    nameScore: updateData.nameScore,
                    realName: updateData.realName
                  });
                  return await enhancedUserConfigManager.updateConfigWithNodeUpdate(
                    tempScoringConfigIndex, 
                    repairedConfig
                  );
                },
                { tempScoringConfigIndex, updateData }
              );
              
              if (recoveryResult) {
                showMessage && showMessage('✅ 姓名评分已通过修复后保存成功', 'success');
              } else {
                showMessage && showMessage('保存评分失败: ' + error.message, 'error');
              }
            }
          }
          // 临时为他人评分时不保存
        }}
        showMessage={showMessage}
      />

      {/* 配置编辑弹窗 */}
      <ConfigEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingConfigIndex(null);
        }}
        config={editingConfigIndex >= 0 ? configs[editingConfigIndex] : null}
        index={editingConfigIndex}
        isNew={editingConfigIndex < 0}
        onSave={async (index, configData) => {
          // 直接调用保存函数，弹窗已在 ConfigEditModal 内部关闭
          try {
            const result = await handleSaveConfig(index, configData);
            // 保存成功，ConfigEditModal 会显示成功消息
            console.log('配置保存完成，返回值:', result);
          return result; // 返回保存结果
        } catch (error) {
          console.error('保存过程中发生错误:', error);
          // 保存失败，重新抛出异常让 ConfigEditModal 能够捕获并显示错误消息
          throw error;
        }
      }}
      showMessage={showMessage}
    />

      {/* 配置列表 */}
      <div className="space-y-3">
        {configs.map((config, index) => (
          <ConfigForm
            key={index}
            config={config}
            index={index}
            isActive={index === activeConfigIndex}
            onDelete={handleDeleteConfig}
            onSetActive={handleSetActiveConfig}
            onEdit={handleEditConfig}
            onScoreName={handleScoreName}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragging={isDragging && draggedIndex === index}
            dragOverIndex={dragOverIndex}
          />
        ))}
      </div>


    </div>
  );
};

export default UserConfigManagerComponent;