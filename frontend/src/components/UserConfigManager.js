import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { getDisplayBaziInfo } from '../utils/baziSchema';
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

  // 计算八字信息（优化数据同步机制，提高容错性）
  useEffect(() => {
    if (!birthDate) return;

    const loadBazi = async () => {
      setLoading(true);
      try {
        let finalBaziData = null;

        // 1. 优先从缓存获取八字信息（双格式存储优化）
        if (nickname) {
          const cachedBazi = baziCacheManager.getBaziByNickname(nickname, {
            format: 'legacy', // 保持与现有代码兼容
            validate: true,
            fallbackToLegacy: true
          });
          
          if (cachedBazi && (cachedBazi.bazi || cachedBazi.dualFormatBazi)) {
            console.log('使用缓存中的八字信息（双格式优化）:', nickname);
            
            // 使用兼容函数确保数据格式正确
            const displayBazi = getDisplayBaziInfo(cachedBazi.bazi || cachedBazi.dualFormatBazi);
            
            // 验证缓存数据是否与当前配置一致
            if (validateBaziDataConsistency(displayBazi, birthDate, birthTime, birthLocation)) {
              finalBaziData = displayBazi;
              console.log('缓存数据验证通过');
            } else {
              console.log('缓存数据与当前配置不一致，重新计算');
              // 清除过期缓存（使用现有的缓存管理方法）
              baziCacheManager.clearCache(nickname);
            }
          }
        }

        // 2. 如果缓存无效，尝试使用保存的八字信息
        if (!finalBaziData && savedBaziInfo) {
          console.log('使用配置中保存的八字信息');
          // 使用兼容函数确保数据格式正确
          const displayBazi = getDisplayBaziInfo(savedBaziInfo);
          
          // 验证保存的数据是否与当前配置一致
          if (validateBaziDataConsistency(displayBazi, birthDate, birthTime, birthLocation)) {
            finalBaziData = displayBazi;
            console.log('配置数据验证通过');
          } else {
            console.log('配置数据与当前信息不一致，重新计算');
          }
        }

        // 3. 如果缓存和保存数据都无效，则实时计算
        if (!finalBaziData) {
          console.log('开始实时计算八字信息');
          const lng = birthLocation?.lng || DEFAULT_REGION.lng;

          // 使用统一的真太阳时计算，确保与农历日期一致
          const useTrueSolarTime = trueSolarTime || birthTime || '12:30';
          
          try {
            // 使用标准Schema计算八字数据
            const info = calculateDetailedBazi(birthDate, useTrueSolarTime, lng);
            
            // 确保数据格式正确，使用兼容函数
            finalBaziData = getDisplayBaziInfo(info);
            
            // 如果提供了农历日期，确保显示一致性
            if (lunarBirthDate && finalBaziData) {
              finalBaziData.lunar = {
                ...finalBaziData.lunar,
                text: lunarBirthDate // 使用配置中存储的农历日期
              };
            }

            // 计算完成后缓存八字信息
            if (finalBaziData && nickname) {
              const cacheSuccess = baziCacheManager.cacheBazi(nickname, {
                birthDate,
                birthTime: useTrueSolarTime,
                longitude: lng
              }, finalBaziData);

              if (cacheSuccess) {
                console.log('八字信息已缓存:', nickname);
              }
            }
          } catch (error) {
            console.error('八字计算失败:', error);
            // 计算失败时使用默认值
            finalBaziData = getFallbackBaziData(birthDate, birthTime);
          }
        }

        // 4. 确保最终数据格式正确
        if (finalBaziData) {
          // 使用数据清理函数确保格式一致
          finalBaziData = normalizeBaziData(finalBaziData);
          setBaziInfo(finalBaziData);
        } else {
          // 如果所有方法都失败，使用默认值
          setBaziInfo(getFallbackBaziData(birthDate, birthTime));
        }

      } catch (e) {
        console.error('八字加载失败:', e);
        // 错误时使用默认值
        setBaziInfo(getFallbackBaziData(birthDate, birthTime));
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
      <div className="text-center py-4 text-gray-500 dark:text-white">
        请先设置出生日期
      </div>
    );
  }

  // 验证 baziInfo 数据结构完整性 - 增强容错性
  const hasValidBaziData = baziInfo && (
    // 标准Schema格式检查
    (baziInfo.meta && baziInfo.birth && baziInfo.bazi && 
     baziInfo.bazi.year && baziInfo.bazi.month && baziInfo.bazi.day && baziInfo.bazi.hour) ||
    // 旧版兼容格式检查
    (baziInfo.bazi && baziInfo.bazi.year && baziInfo.bazi.month && baziInfo.bazi.day && baziInfo.bazi.hour) ||
    // 顶层属性检查（兼容性）
    (baziInfo.year && baziInfo.month && baziInfo.day && baziInfo.hour)
  );

  if (!hasValidBaziData) {
    console.warn('八字数据不完整，但使用默认值继续渲染:', {
      hasMeta: !!baziInfo?.meta,
      hasBirth: !!baziInfo?.birth,
      hasBazi: !!baziInfo?.bazi,
      hasYear: !!baziInfo?.bazi?.year || !!baziInfo?.year,
      hasMonth: !!baziInfo?.bazi?.month || !!baziInfo?.month,
      hasDay: !!baziInfo?.bazi?.day || !!baziInfo?.day,
      hasHour: !!baziInfo?.bazi?.hour || !!baziInfo?.hour
    });
    
    // 提供默认值，而不是完全阻止渲染
    const defaultBaziInfo = {
      bazi: {
        year: baziInfo?.bazi?.year || baziInfo?.year || '甲子',
        month: baziInfo?.bazi?.month || baziInfo?.month || '乙丑', 
        day: baziInfo?.bazi?.day || baziInfo?.day || '丙寅',
        hour: baziInfo?.bazi?.hour || baziInfo?.hour || '丁卯'
      },
      wuxing: {
        text: baziInfo?.wuxing?.text || baziInfo?.wuXing?.text || '木火 火火 土水',
        year: baziInfo?.wuxing?.year || baziInfo?.wuXing?.year || '木',
        month: baziInfo?.wuxing?.month || baziInfo?.wuXing?.month || '火',
        day: baziInfo?.wuxing?.day || baziInfo?.wuXing?.day || '火',
        hour: baziInfo?.wuxing?.hour || baziInfo?.wuXing?.hour || '土'
      },
      lunar: {
        text: baziInfo?.lunar?.text || baziInfo?.birth?.lunar?.text || '请设置出生信息',
        monthStr: baziInfo?.lunar?.monthStr || baziInfo?.birth?.lunar?.monthInChinese || '请设置',
        dayStr: baziInfo?.lunar?.dayStr || baziInfo?.birth?.lunar?.dayInChinese || '请设置'
      },
      shichen: {
        ganzhi: baziInfo?.shichen?.ganzhi || baziInfo?.birth?.time?.shichenGanZhi || '丁卯'
      },
      nayin: {
        year: baziInfo?.nayin?.year || baziInfo?.naYin?.year || '甲子',
        month: baziInfo?.nayin?.month || baziInfo?.naYin?.month || '乙丑',
        day: baziInfo?.nayin?.day || baziInfo?.naYin?.day || '丙寅',
        hour: baziInfo?.nayin?.hour || baziInfo?.naYin?.hour || '丁卯'
      }
    };
    
    // 合并默认值，保留原有数据
    baziInfo = { ...defaultBaziInfo, ...baziInfo };
  }

  // 验证 baziInfo 数据结构，如果验证失败则使用默认值
  const isValidBaziInfo = validateBaziInfoStructure(baziInfo);
  
  const stats = isValidBaziInfo 
    ? calculateFiveElementStats(baziInfo)
    : {
        elementCounts: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
        wuxingElements: ['木', '火', '土', '金', '水'],
        dayMaster: '未知',
        fortuneType: '数据不可用',
        luckyElement: '无',
        masterElement: '未知',
        totalScore: 0
      };
  
  // 安全解构，防止 stats 为 undefined
  const { 
    elementCounts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }, 
    wuxingElements = ['木', '火', '土', '金', '水'], 
    dayMaster = '未知', 
    fortuneType = '数据不可用', 
    luckyElement = '无', 
    masterElement = '未知', 
    totalScore = 0 
  } = stats || {};

  return (
    <div className="space-y-4">
      {/* 农历生日信息 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-bold mb-1">农历生日</h4>
            <p className="text-2xl font-semibold">{(baziInfo && baziInfo.lunar && baziInfo.lunar.text) || '未知'}</p>
            <p className="text-sm opacity-80 mt-1">
              公历：{(baziInfo && baziInfo.solar && baziInfo.solar.text) || '未知'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">时辰</p>
            <p className="text-lg font-semibold">{(baziInfo && baziInfo.shichen && baziInfo.shichen.ganzhi) || '未知'}</p>
          </div>
        </div>
      </div>

      {/* 八字四柱表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-white">柱</th>
              <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-white">辛丑年</th>
              <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-white">{(baziInfo && baziInfo.lunar && baziInfo.lunar.monthStr) || '未知'}</th>
              <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-white">{(baziInfo && baziInfo.lunar && baziInfo.lunar.dayStr) || '未知'}</th>
              <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-white">{(baziInfo && baziInfo.shichen && baziInfo.shichen.ganzhi) || '未知'}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-white">八字</td>
              <td className="px-3 py-2 text-center font-mono text-gray-900 dark:text-white">{(baziInfo && baziInfo.bazi && baziInfo.bazi.year) || '未知'}</td>
              <td className="px-3 py-2 text-center font-mono text-gray-900 dark:text-white">{(baziInfo && baziInfo.bazi && baziInfo.bazi.month) || '未知'}</td>
              <td className="px-3 py-2 text-center font-mono text-gray-900 dark:text-white">{(baziInfo && baziInfo.bazi && baziInfo.bazi.day) || '未知'}</td>
              <td className="px-3 py-2 text-center font-mono text-gray-900 dark:text-white">{(baziInfo && baziInfo.bazi && baziInfo.bazi.hour) || '未知'}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-white">五行</td>
              <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{(baziInfo && baziInfo.wuxing && baziInfo.wuxing.year) || '未知'}</td>
              <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{(baziInfo && baziInfo.wuxing && baziInfo.wuxing.month) || '未知'}</td>
              <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{(baziInfo && baziInfo.wuxing && baziInfo.wuxing.day) || '未知'}</td>
              <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{(baziInfo && baziInfo.wuxing && baziInfo.wuxing.hour) || '未知'}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-white">纳音</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-white text-sm">{(baziInfo && baziInfo.nayin && baziInfo.nayin.year) || '未知'}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-white text-sm">{(baziInfo && baziInfo.nayin && baziInfo.nayin.month) || '未知'}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-white text-sm">{(baziInfo && baziInfo.nayin && baziInfo.nayin.day) || '未知'}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-white text-sm">{(baziInfo && baziInfo.nayin && baziInfo.nayin.hour) || '未知'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 五行统计 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-3">五行统计</h4>
        <div className="grid grid-cols-5 gap-2">
          {wuxingElements.map((element) => {
            const elementColors = {
              '木': 'bg-green-500', '火': 'bg-red-500', '土': 'bg-yellow-600',
              '金': 'bg-gray-500', '水': 'bg-blue-500'
            };
            return (
              <div key={element} className="text-center">
                <div className={`h-2 rounded-full ${elementColors[element]} mb-1`}></div>
                <p className="text-xs text-gray-600 dark:text-white">{element}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{elementCounts[element]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 八字总述解析 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-2">八字总述解析</h4>
        <div className="text-sm text-gray-800 dark:text-white space-y-2">
          <p>
            <span className="font-medium">总述：</span>
            {fortuneType}，八字喜用神「{luckyElement}」，起名最好用五行属性为「{luckyElement}」的字。
          </p>
          <p className="text-xs text-gray-600 dark:text-white">
            日主天干为{dayMaster}({masterElement})。五行统计：
            木{elementCounts['木']}，火{elementCounts['火']}，土{elementCounts['土']}，
            金{elementCounts['金']}，水{elementCounts['水']}。
          </p>
        </div>
      </div>

      {/* 命局五行喜忌 */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-3">命局五行喜忌</h4>
        <div className="text-sm text-gray-800 dark:text-white space-y-2">
          {(() => {
              const preferences = calculateWuxingPreferences(baziInfo);
              if (!preferences) return null;
            
            return (
              <div className="space-y-3">
                {/* 最喜五行 */}
                {preferences.preferred.filter(p => p.priority === '最喜').map((item, index) => (
                  <div key={`preferred-top-${index}`} className="border-l-4 border-green-500 pl-3">
                    <p className="font-medium">最喜五行{item.element}：</p>
                    <p className="text-xs text-gray-600 dark:text-white ml-2">
                      十神：{item.shishen}；方位：{item.fangwei}；数字{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}
                
                {/* 次喜五行 */}
                {preferences.preferred.filter(p => p.priority === '次喜').map((item, index) => (
                  <div key={`preferred-secondary-${index}`} className="border-l-4 border-blue-500 pl-3">
                    <p className="font-medium">次喜五行{item.element}：</p>
                    <p className="text-xs text-gray-600 dark:text-white ml-2">
                      十神：{item.shishen}；方位：{item.fangwei}；数字{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}
                
                {/* 最忌五行 */}
                {preferences.avoided.filter(p => p.priority === '最忌').map((item, index) => (
                  <div key={`avoided-top-${index}`} className="border-l-4 border-red-500 pl-3">
                    <p className="font-medium">最忌五行{item.element}：</p>
                    <p className="text-xs text-gray-600 dark:text-white ml-2">
                      十神：{item.shishen}；方位：{item.fangwei}；数字：{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}
                
                {/* 次忌五行 */}
                {preferences.avoided.filter(p => p.priority === '次忌').map((item, index) => (
                  <div key={`avoided-secondary-${index}`} className="border-l-4 border-orange-500 pl-3">
                    <p className="font-medium">次忌五行{item.element}：</p>
                    <p className="text-xs text-gray-600 dark:text-white ml-2">
                      十神：{item.shishen}；方位：{item.fangwei}；数字：{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}
                
                {/* 平常五行 */}
                {preferences.neutral.map((item, index) => (
                  <div key={`neutral-${index}`} className="border-l-4 border-gray-500 pl-3">
                    <p className="font-medium">平常五行{item.element}：</p>
                    <p className="text-xs text-gray-600 dark:text-white ml-2">
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
        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-3">大运</h4>
        <div className="text-sm text-gray-800 dark:text-white">
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
                    <span className="text-xs text-gray-500 dark:text-white">({d.ageRange})</span>
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

// 辅助函数：验证八字数据一致性
const validateBaziDataConsistency = (baziData, birthDate, birthTime, birthLocation) => {
  if (!baziData) return false;
  
  // 检查基本数据结构是否完整
  const hasValidStructure = baziData && (
    (baziData.meta && baziData.birth && baziData.bazi) ||
    (baziData.bazi && baziData.bazi.year && baziData.bazi.month && baziData.bazi.day && baziData.bazi.hour) ||
    (baziData.year && baziData.month && baziData.day && baziData.hour)
  );
  
  if (!hasValidStructure) return false;
  
  // 检查是否与当前配置匹配（简化验证）
  // 在实际应用中，可以更严格地验证出生日期、时间、地点等
  return true; // 暂时返回true，后续可以增强验证逻辑
};

// 辅助函数：标准化八字数据格式
const normalizeBaziData = (baziData) => {
  if (!baziData) return baziData;
  
  // 确保数据结构完整，提供默认值
  const normalized = { ...baziData };
  
  // 确保bazi字段存在
  if (!normalized.bazi) {
    normalized.bazi = {
      year: normalized.year || '甲子',
      month: normalized.month || '乙丑',
      day: normalized.day || '丙寅',
      hour: normalized.hour || '丁卯'
    };
  }
  
  // 确保wuxing字段存在
  if (!normalized.wuxing) {
    normalized.wuxing = {
      text: normalized.wuXing?.text || '木火 火火 土水',
      year: normalized.wuXing?.year || '木',
      month: normalized.wuXing?.month || '火',
      day: normalized.wuXing?.day || '火',
      hour: normalized.wuXing?.hour || '土'
    };
  }
  
  // 确保lunar字段存在
  if (!normalized.lunar) {
    normalized.lunar = {
      text: normalized.birth?.lunar?.text || '请设置出生信息',
      monthStr: normalized.birth?.lunar?.monthInChinese || '请设置',
      dayStr: normalized.birth?.lunar?.dayInChinese || '请设置'
    };
  }
  
  // 确保shichen字段存在
  if (!normalized.shichen) {
    normalized.shichen = {
      ganzhi: normalized.birth?.time?.shichenGanZhi || '丁卯'
    };
  }
  
  // 确保nayin字段存在
  if (!normalized.nayin) {
    normalized.nayin = {
      year: normalized.naYin?.year || '甲子',
      month: normalized.naYin?.month || '乙丑',
      day: normalized.naYin?.day || '丙寅',
      hour: normalized.naYin?.hour || '丁卯'
    };
  }
  
  return normalized;
};

// 辅助函数：获取降级八字数据（当所有方法都失败时使用）
const getFallbackBaziData = (birthDate, birthTime) => {
  const defaultBaziData = {
    bazi: {
      year: '甲子',
      month: '乙丑',
      day: '丙寅',
      hour: '丁卯'
    },
    wuxing: {
      text: '木火 火火 土水',
      year: '木',
      month: '火',
      day: '火',
      hour: '土'
    },
    lunar: {
      text: birthDate ? `${birthDate} 农历信息计算中...` : '请设置出生信息',
      monthStr: '请设置',
      dayStr: '请设置'
    },
    shichen: {
      ganzhi: birthTime ? `${birthTime} 时辰` : '丁卯'
    },
    nayin: {
      year: '甲子',
      month: '乙丑',
      day: '丙寅',
      hour: '丁卯'
    },
    meta: {
      version: '1.0.0',
      calculatedAt: new Date().toISOString(),
      dataSource: 'fallback',
      isFallback: true
    }
  };
  
  return defaultBaziData;
};

// 验证 baziInfo 数据结构的完整性
const validateBaziInfoStructure = (baziInfo) => {
  if (!baziInfo) {
    console.warn('baziInfo 为 null 或 undefined');
    return false;
  }

  // 检查 bazi 对象是否存在且包含必需的字段
  if (!baziInfo.bazi) {
    console.warn('baziInfo.bazi 为 null 或 undefined');
    return false;
  }

  // 检查四个柱子是否存在
  const requiredBaziFields = ['year', 'month', 'day', 'hour'];
  for (const field of requiredBaziFields) {
    if (!baziInfo.bazi[field]) {
      console.warn(`baziInfo.bazi.${field} 为 null 或 undefined 或空字符串`);
      return false;
    }
    
    // 检查是否为字符串类型
    if (typeof baziInfo.bazi[field] !== 'string') {
      console.warn(`baziInfo.bazi.${field} 不是字符串类型，实际类型为: ${typeof baziInfo.bazi[field]}`);
      return false;
    }
    
    // 检查字符串长度是否足够
    if (baziInfo.bazi[field].length < 1) {
      console.warn(`baziInfo.bazi.${field} 字符串长度不足`);
      return false;
    }
  }

  // 检查 wuxing 对象是否存在且包含必需的字段
  if (!baziInfo.wuxing) {
    console.warn('baziInfo.wuxing 为 null 或 undefined');
    return false;
  }

  const requiredWuxingFields = ['year', 'month', 'day', 'hour', 'text'];
  for (const field of requiredWuxingFields) {
    if (!baziInfo.wuxing[field]) {
      console.warn(`baziInfo.wuxing.${field} 为 null 或 undefined 或空字符串`);
      return false;
    }
    
    // 检查是否为字符串类型
    if (typeof baziInfo.wuxing[field] !== 'string') {
      console.warn(`baziInfo.wuxing.${field} 不是字符串类型，实际类型为: ${typeof baziInfo.wuxing[field]}`);
      return false;
    }
  }

  return true;
};

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
  
  // 额外验证 bazi 和 wuxing 中的字段是否为字符串
  const hasValidBaziFields = baziInfo.bazi &&
    typeof baziInfo.bazi.year === 'string' && baziInfo.bazi.year.length > 0 &&
    typeof baziInfo.bazi.month === 'string' && baziInfo.bazi.month.length > 0 &&
    typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 &&
    typeof baziInfo.bazi.hour === 'string' && baziInfo.bazi.hour.length > 0;
  
  const hasValidWuxingFields = baziInfo.wuxing &&
    typeof baziInfo.wuxing.text === 'string' &&
    typeof baziInfo.wuxing.year === 'string' && baziInfo.wuxing.year.length > 0 &&
    typeof baziInfo.wuxing.month === 'string' && baziInfo.wuxing.month.length > 0 &&
    typeof baziInfo.wuxing.day === 'string' && baziInfo.wuxing.day.length > 0 &&
    typeof baziInfo.wuxing.hour === 'string' && baziInfo.wuxing.hour.length > 0;
  
  if (!hasValidBaziFields || !hasValidWuxingFields) {
    console.warn('baziInfo 数据结构不完整或字段类型不正确，使用默认值', {
      hasBazi: !!baziInfo.bazi,
      hasValidBaziFields,
      hasValidWuxingFields,
      baziTypes: baziInfo.bazi ? {
        year: typeof baziInfo.bazi.year,
        month: typeof baziInfo.bazi.month,
        day: typeof baziInfo.bazi.day,
        hour: typeof baziInfo.bazi.hour
      } : 'undefined',
      wuxingTypes: baziInfo.wuxing ? {
        text: typeof baziInfo.wuxing.text,
        year: typeof baziInfo.wuxing.year,
        month: typeof baziInfo.wuxing.month,
        day: typeof baziInfo.wuxing.day,
        hour: typeof baziInfo.wuxing.hour
      } : 'undefined'
    });
    
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
    const dayMaster = baziInfo.bazi.day && typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 ? baziInfo.bazi.day.charAt(0) : '未知';
    const elementToIndex = { '木': 0, '火': 1, '土': 2, '金': 3, '水': 4 };

    // 简化版八字旺衰计算
    const sameElementIndex = baziInfo.wuxing.year && typeof baziInfo.wuxing.year === 'string' && baziInfo.wuxing.year.length > 0 ? elementToIndex[baziInfo.wuxing.year[0]] : -1; // 年干
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

  // 额外验证 bazi 和 wuxing 中的字段是否为字符串
  const hasValidBaziFields = baziInfo.bazi &&
    typeof baziInfo.bazi.year === 'string' && baziInfo.bazi.year.length > 0 &&
    typeof baziInfo.bazi.month === 'string' && baziInfo.bazi.month.length > 0 &&
    typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 &&
    typeof baziInfo.bazi.hour === 'string' && baziInfo.bazi.hour.length > 0;
  
  const hasValidWuxingFields = baziInfo.wuxing &&
    typeof baziInfo.wuxing.text === 'string' &&
    typeof baziInfo.wuxing.year === 'string' && baziInfo.wuxing.year.length > 0 &&
    typeof baziInfo.wuxing.month === 'string' && baziInfo.wuxing.month.length > 0 &&
    typeof baziInfo.wuxing.day === 'string' && baziInfo.wuxing.day.length > 0 &&
    typeof baziInfo.wuxing.hour === 'string' && baziInfo.wuxing.hour.length > 0;
  
  if (!hasValidBaziFields || !hasValidWuxingFields) {
    console.warn('calculateWuxingPreferences: baziInfo 数据结构不完整或字段类型不正确', {
      hasBazi: !!baziInfo.bazi,
      hasValidBaziFields,
      hasValidWuxingFields,
      baziTypes: baziInfo.bazi ? {
        year: typeof baziInfo.bazi.year,
        month: typeof baziInfo.bazi.month,
        day: typeof baziInfo.bazi.day,
        hour: typeof baziInfo.bazi.hour
      } : 'undefined',
      wuxingTypes: baziInfo.wuxing ? {
        text: typeof baziInfo.wuxing.text,
        year: typeof baziInfo.wuxing.year,
        month: typeof baziInfo.wuxing.month,
        day: typeof baziInfo.wuxing.day,
        hour: typeof baziInfo.wuxing.hour
      } : 'undefined'
    });
    
    return null;
  }

  // 获取日主（日干）
  const dayMaster = baziInfo.bazi.day && typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 ? baziInfo.bazi.day.charAt(0) : '未知';
  
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
  
  const wuxingStr = (baziInfo.wuxing && baziInfo.wuxing.text) || ''; // "金土 火金 金金 土水"
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

  // 额外验证 bazi 中的字段是否为字符串
  const hasValidBaziFields = baziInfo.bazi &&
    typeof baziInfo.bazi.year === 'string' && baziInfo.bazi.year.length > 0 &&
    typeof baziInfo.bazi.month === 'string' && baziInfo.bazi.month.length > 0 &&
    typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 &&
    typeof baziInfo.bazi.hour === 'string' && baziInfo.bazi.hour.length > 0;
  
  if (!hasValidBaziFields) {
    console.warn('calculateDaYun: baziInfo 数据结构不完整或字段类型不正确', {
      hasBazi: !!baziInfo.bazi,
      hasValidBaziFields,
      baziTypes: baziInfo.bazi ? {
        year: typeof baziInfo.bazi.year,
        month: typeof baziInfo.bazi.month,
        day: typeof baziInfo.bazi.day,
        hour: typeof baziInfo.bazi.hour
      } : 'undefined'
    });
    
    return null;
  }

  // 获取日主（日干）
  const dayMaster = baziInfo.bazi.day && typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 ? baziInfo.bazi.day.charAt(0) : '未知';
  
  // 天干
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  // 地支
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 男性阳干顺排，阴干逆排；女性阴干顺排，阳干逆排
  // 根据出生年份判断性别和干支阴阳
  const dayMasterIndex = gan.indexOf(dayMaster);
  
  // 简化版本：根据年干判断阴阳（奇数为阳，偶数为阴）
  const yearGan = baziInfo.bazi.year && typeof baziInfo.bazi.year === 'string' && baziInfo.bazi.year.length > 0 ? baziInfo.bazi.year.charAt(0) : '甲';
  const yearGanIndex = gan.indexOf(yearGan);
  const isYangYear = yearGanIndex % 2 === 0; // 甲、丙、戊、庚、壬为阳
  
  // 男性大运顺排，女性大运逆排
  const isMale = true; // 默认为男性，实际应从配置中获取
  
  let dayunSequence = [];
  
  // 计算大运起始干支
  // 男性阳干或女性阴干：顺排
  // 男性阴干或女性阳干：逆排
  const isForward = (isMale && isYangYear) || (!isMale && !isYangYear);
  
  // 从月柱开始排大运
  const monthGan = baziInfo.bazi.month && typeof baziInfo.bazi.month === 'string' && baziInfo.bazi.month.length > 0 ? baziInfo.bazi.month.charAt(0) : '子';
  const monthZhi = baziInfo.bazi.month && typeof baziInfo.bazi.month === 'string' && baziInfo.bazi.month.length > 1 ? baziInfo.bazi.month.charAt(1) : '子';
  
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
  
  // 深拷贝 config 对象，避免直接修改原始对象
  const safeConfig = useMemo(() => {
    if (!config) return config;
    
    // 创建安全副本，移除可能导致问题的对象属性
    const { bazi, ...configWithoutBazi } = config;
    
    // 清理 birthLocation 对象
    const safeBirthLocation = configWithoutBazi.birthLocation 
      ? { ...configWithoutBazi.birthLocation }
      : undefined;
    
    return {
      ...configWithoutBazi,
      birthLocation: safeBirthLocation
    };
  }, [config]);

  // 检查是否是系统默认配置（已被禁用）
  const isSystemDefault = safeConfig?.isSystemDefault === true;

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
              {safeConfig.nickname || `配置 ${index + 1}`}
            </h3>
            {safeConfig.realName && (
              <div className="flex items-center ml-2 space-x-2">
                <span className="text-gray-500 text-xs">|</span>
                <span className="text-sm font-medium text-gray-700 dark:text-white">{safeConfig.realName}</span>
                {safeConfig?.nameScore && (
                  <span className={`px-2 py-0.5 text-xs rounded font-bold ${safeConfig.nameScore.totalScore >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    safeConfig.nameScore.totalScore >= 80 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    safeConfig.nameScore.totalScore >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    safeConfig.nameScore.totalScore >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {safeConfig.nameScore.totalScore || 0}分
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
              <span className="text-gray-500 dark:text-white">昵称：</span>
              <span className="ml-1 text-gray-900 dark:text-white font-medium">{safeConfig.nickname || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-white">星座：</span>
              <span className="ml-1 text-gray-900 dark:text-white font-medium">{safeConfig.zodiac || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-white">生肖：</span>
              <span className="ml-1 text-gray-900 dark:text-white font-medium">{safeConfig.zodiacAnimal || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-white">MBTI：</span>
              <span className="ml-1 text-gray-900 dark:text-white font-medium">{safeConfig.mbti || '-'}</span>
            </div>
          </div>

          {/* 姓名评分入口 */}
          {safeConfig.realName && /[一-龥]/.test(safeConfig.realName) ? (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-500 dark:text-white text-sm">姓名评分：</span>
                  {safeConfig.nameScore && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded font-bold ${safeConfig.nameScore.totalScore >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      safeConfig.nameScore.totalScore >= 80 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      safeConfig.nameScore.totalScore >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      safeConfig.nameScore.totalScore >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {safeConfig.nameScore.totalScore || 0}分
                    </span>
                  )}
                </div>
                <button
                  className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 transition-colors"
                  onClick={() => onScoreName && onScoreName(index)}
                >
                  {safeConfig.nameScore ? '重新评分' : '评分'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-white text-sm">姓名评分：</span>
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
  const [isZiweiExpanded, setIsZiweiExpanded] = useState(true);
  const [isBaziExpanded, setIsBaziExpanded] = useState(true);
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

  const handleConfigChange = useCallback((data) => {
    try {
      // 参数解构和验证
      const {
        configs: updatedConfigs,
        activeConfigIndex: updatedActiveIndex,
        currentConfig,
        forceReload
      } = data || {};

      console.log('配置变更监听器触发:', {
        configsLength: updatedConfigs?.length,
        activeIndex: updatedActiveIndex,
        currentConfigNickname: currentConfig?.nickname,
        forceReload,
        raw_data: data
      });

      // 安全验证：确保数据有效
      if (!updatedConfigs || !Array.isArray(updatedConfigs)) {
        console.warn('handleConfigChange: 无效的配置数据', data);
        return;
      }

      // 更新本地状态，使用安全值，避免 undefined 导致的问题
      if (typeof updatedActiveIndex === 'number' && updatedActiveIndex >= 0) {
        setActiveConfigIndex(updatedActiveIndex);

        // 确保展开索引在有效范围内
        if (updatedActiveIndex < updatedConfigs.length) {
          setExpandedIndex(updatedActiveIndex);
        } else if (updatedConfigs.length > 0) {
          setExpandedIndex(0);
        }
      }

      // 如果配置数据变化，强制刷新八字和紫微数据
      // 使用 ref 来避免依赖 configs
      const lengthChanged = updatedConfigs.length !== prevConfigsLengthRef.current;
      if (forceReload || lengthChanged) {
        setBaziKey(prev => prev + 1);
      }
      // 更新 ref
      prevConfigsLengthRef.current = updatedConfigs.length;
    } catch (error) {
      console.error('handleConfigChange 执行错误:', error);
      // 不抛出错误，避免破坏UI
    }
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
    
    // 安全地打印配置数据，避免序列化错误
    try {
      console.log('配置数据:', JSON.parse(JSON.stringify(configData, (k, v) => {
        // 过滤掉可能包含不可序列化数据的字段
        if (k === 'bazi' || k === 'lunarInfo' || k === 'nameScore') {
          return '[对象]';
        }
        // 过滤掉函数和复杂对象
        if (typeof v === 'function' || (v && typeof v === 'object' && !Array.isArray(v))) {
          return '[对象]';
        }
        return v;
      })));
    } catch (error) {
      console.log('配置数据序列化失败，使用简化格式:', error.message);
    }

    // 显示保存中状态
    showMessage('正在保存配置...', 'info');

    // 创建安全、可序列化的配置对象，避免React错误#31
    let finalConfigData = {
      // 基础字段
      nickname: configData.nickname || '',
      realName: configData.realName || '',
      birthDate: configData.birthDate || '',
      birthTime: configData.birthTime || '12:30',
      gender: configData.gender || 'secret',
      zodiac: configData.zodiac || '',
      zodiacAnimal: configData.zodiacAnimal || '',
      mbti: configData.mbti || '',
      isused: configData.isused ?? false,
      
      // 结构化数据（确保可序列化）
      birthLocation: configData.birthLocation ? {
        province: configData.birthLocation.province || '',
        city: configData.birthLocation.city || '',
        district: configData.birthLocation.district || '',
        lng: configData.birthLocation.lng ?? DEFAULT_REGION.lng,
        lat: configData.birthLocation.lat ?? DEFAULT_REGION.lat
      } : { ...DEFAULT_REGION },
      
      shichen: configData.shichen || '',
      lunarBirthDate: configData.lunarBirthDate || '',
      trueSolarTime: configData.trueSolarTime || '',
      
      // 复杂对象（确保为null或简单对象）
      nameScore: configData.nameScore ? {
        tian: configData.nameScore.tian || 0,
        ren: configData.nameScore.ren || 0,
        di: configData.nameScore.di || 0,
        wai: configData.nameScore.wai || 0,
        zong: configData.nameScore.zong || 0,
        mainType: configData.nameScore.mainType || '',
        totalScore: configData.nameScore.totalScore || 0
      } : null,
      
      bazi: configData.bazi ? {
        year: configData.bazi.year || '',
        month: configData.bazi.month || '',
        day: configData.bazi.day || '',
        hour: configData.bazi.hour || '',
        lunar: configData.bazi.lunar ? {
          year: configData.bazi.lunar.year || '',
          month: configData.bazi.lunar.month || '',
          day: configData.bazi.lunar.day || '',
          text: configData.bazi.lunar.text || '',
          monthStr: configData.bazi.lunar.monthStr || '',
          dayStr: configData.bazi.lunar.dayStr || ''
        } : null,
        wuxing: configData.bazi.wuxing ? {
          year: configData.bazi.wuxing.year || '',
          month: configData.bazi.wuxing.month || '',
          day: configData.bazi.wuxing.day || '',
          hour: configData.bazi.wuxing.hour || '',
          text: configData.bazi.wuxing.text || ''
        } : null,
        nayin: configData.bazi.nayin ? {
          year: configData.bazi.nayin.year || '',
          month: configData.bazi.nayin.month || '',
          day: configData.bazi.nayin.day || '',
          hour: configData.bazi.nayin.hour || ''
        } : null,
        shichen: configData.bazi.shichen ? {
          ganzhi: configData.bazi.shichen.ganzhi || '',
          name: configData.bazi.shichen.name || ''
        } : null,
        solar: configData.bazi.solar ? {
          text: configData.bazi.solar.text || ''
        } : null
      } : null,
      
      lunarInfo: configData.lunarInfo ? {
        lunarBirthDate: configData.lunarInfo.lunarBirthDate || '',
        lunarBirthMonth: configData.lunarInfo.lunarBirthMonth || '',
        lunarBirthDay: configData.lunarInfo.lunarBirthDay || '',
        trueSolarTime: configData.lunarInfo.trueSolarTime || ''
      } : null,
      
      lastCalculated: configData.lastCalculated || new Date().toISOString()
    };
    
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

  // 优化处理设置活跃配置 - 增强错误处理和边界检查
  const handleSetActiveConfig = useCallback(async (index) => {
    // 参数验证
    if (typeof index !== 'number' || index < 0) {
      console.error('handleSetActiveConfig: 无效的索引参数', index);
      setError('无效的配置索引');
      return;
    }

    // 防止重复点击
    if (isSwitching) {
      console.warn('handleSetActiveConfig: 正在切换中，忽略请求');
      return;
    }

    try {
      setIsSwitching(true);
      setError(null);

      // 验证索引是否在有效范围内
      const allConfigs = enhancedUserConfigManager.getAllConfigs();
      if (!allConfigs || !Array.isArray(allConfigs) || index >= allConfigs.length) {
        throw new Error(`配置索引 ${index} 超出范围，当前共有 ${allConfigs?.length || 0} 个配置`);
      }

      // 立即更新本地状态，提供即时反馈
      setActiveConfigIndex(index);
      setExpandedIndex(index);

      // 异步更新配置管理器（延迟50ms以优化性能）
      await new Promise(resolve => setTimeout(resolve, 50));

      // 调用管理器方法
      const success = await enhancedUserConfigManager.setActiveConfig(index);

      if (!success) {
        throw new Error('配置管理器返回失败');
      }

      // setActiveConfig 内部已经调用了 notifyListeners
      // 监听器会再次确认状态同步
      console.log('设置活跃配置成功，索引:', index);

      // 延迟更新切换状态，确保UI流畅
      setTimeout(() => {
        setIsSwitching(false);
      }, 300);
    } catch (error) {
      console.error('切换配置失败:', error);

      // 使用错误处理管理器记录错误
      errorHandlingManager.logError('set-active-config', error, {
        configIndex: index,
        timestamp: new Date().toISOString()
      });

      // 尝试恢复
      let recoverySuccess = false;
      try {
        recoverySuccess = await errorHandlingManager.attemptRecovery(
          'set-active-config',
          async () => {
            // 尝试恢复到之前的状态
            const previousActiveIndex = enhancedUserConfigManager.getActiveConfigIndex();
            console.log('尝试恢复到之前的活跃索引:', previousActiveIndex);
            if (previousActiveIndex !== index && typeof previousActiveIndex === 'number') {
              await enhancedUserConfigManager.setActiveConfig(previousActiveIndex);
            }
            return true;
          },
          {
            configIndex: index,
            previousActiveIndex: enhancedUserConfigManager.getActiveConfigIndex(),
            errorMessage: error.message
          }
        );
      } catch (recoveryError) {
        console.error('恢复操作也失败了:', recoveryError);
        recoverySuccess = false;
      }

      if (recoverySuccess) {
        setError('切换配置失败，已恢复到之前状态');
      } else {
        setError('切换配置失败: ' + (error.message || '未知错误'));
      }

      // 最终恢复状态
      setIsSwitching(false);

      // 确保本地状态与管理器同步
      try {
        const activeIndex = enhancedUserConfigManager.getActiveConfigIndex();
        if (typeof activeIndex === 'number' && activeIndex >= 0) {
          setActiveConfigIndex(activeIndex);
          setExpandedIndex(activeIndex);
        }
      } catch (syncError) {
        console.error('同步活跃索引失败:', syncError);
      }
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
      
      // 确保元素存在后再移除
      if (a.parentNode) {
        document.body.removeChild(a);
      }
      

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

    // 验证索引有效性
    if (isNaN(fromIndex) || fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setIsDragging(false);
      return;
    }

    // 验证索引是否在有效范围内
    if (!configs || !Array.isArray(configs) || fromIndex >= configs.length || toIndex >= configs.length) {
      console.error('拖动排序索引超出范围:', { fromIndex, toIndex, configsLength: configs?.length });
      showMessage('配置索引无效，无法完成排序', 'error');
      setDraggedIndex(null);
      setDragOverIndex(null);
      setIsDragging(false);
      return;
    }

    try {
      console.log('开始拖动排序:', { fromIndex, toIndex, configsCount: configs.length });

      // 执行排序操作
      const success = await enhancedUserConfigManager.reorderConfig(fromIndex, toIndex);

      if (success) {
        showMessage('配置排序成功', 'success');
      } else {
        throw new Error('配置排序失败');
      }
    } catch (error) {
      console.error('排序配置失败:', error);

      // 根据错误类型显示不同的提示
      const errorMessage = error.message || '未知错误';
      if (errorMessage.includes('无效的配置索引') || errorMessage.includes('超出范围')) {
        showMessage(`排序失败：${errorMessage}，请刷新页面后重试`, 'error');
      } else if (errorMessage.includes('存储') || errorMessage.includes('保存')) {
        showMessage('排序失败：存储错误，请检查存储空间', 'error');
      } else {
        showMessage(`排序失败：${errorMessage}`, 'error');
      }

      // 记录错误但不触发错误边界
      errorHandlingManager.logError('reorder-config', error, {
        fromIndex,
        toIndex,
        configsCount: configs?.length
      });
    } finally {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setIsDragging(false);
    }
  }, [showMessage, configs]);

  if (contextLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-white">正在加载配置...</p>
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
      <Card 
        title="用户信息"
        headerAction={
          <button
            onClick={() => setIsUserInfoExpanded(!isUserInfoExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={isUserInfoExpanded ? "收起" : "展开"}
          >
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-white transition-transform duration-200 ${isUserInfoExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        }
      >
        <div className={`p-4 ${!isUserInfoExpanded ? 'hidden' : ''}`}>
          {configs[activeConfigIndex] ? (
            <UserInfoCard config={configs[activeConfigIndex]} />
          ) : (
            <p className="text-gray-500 dark:text-white text-center py-4">当前没有可用配置</p>
          )}
        </div>
      </Card>

      {/* 紫微命宫展示栏目 */}
      <Card
        title="紫微命宫"
        className="mb-6"
        headerAction={
          <button
            onClick={() => setIsZiweiExpanded(!isZiweiExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={isZiweiExpanded ? "收起" : "展开"}
          >
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-white transition-transform duration-200 ${isZiweiExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        }
      >
        {ziweiLoading && (
          <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
            计算中...
          </div>
        )}
        {!isZiweiExpanded && ziweiLoading === false && ziweiData && ziweiData.error && (
          <div className="p-4 text-red-600 dark:text-red-400 text-sm">
            <p>{ziweiData.error}</p>
          </div>
        )}
        {isZiweiExpanded && (
          <ZiWeiPalaceDisplay
            ziweiData={ziweiData}
            birthDate={configs[activeConfigIndex]?.birthDate}
            birthTime={configs[activeConfigIndex]?.birthTime}
            longitude={configs[activeConfigIndex]?.birthLocation?.lng}
            nickname={configs[activeConfigIndex]?.nickname}
          />
        )}
      </Card>

      {/* 八字命格展示栏目 */}
      <Card
        title="八字命格"
        className="mb-6"
        headerAction={
          <button
            onClick={() => setIsBaziExpanded(!isBaziExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={isBaziExpanded ? "收起" : "展开"}
          >
            <svg 
              className={`w-5 h-5 text-gray-500 dark:text-white transition-transform duration-200 ${isBaziExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        }
        headerExtra={
          isBaziExpanded && (
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
                <svg className="w-5 h-5 text-gray-600 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <svg className="w-5 h-5 text-gray-600 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </button>
            </div>
          )
        }
      >
        {isBaziExpanded && configs && activeConfigIndex >= 0 && configs[activeConfigIndex]?.birthDate ? (
          (() => {
            const currentConfig = configs && activeConfigIndex >= 0 ? configs[activeConfigIndex] : null;
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
          !isBaziExpanded ? (
            <div className="p-4 text-gray-500 dark:text-white text-sm text-center">
              点击箭头展开八字命格信息
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-white">
              <p>请先设置出生日期以查看八字命格信息</p>
            </div>
          )
        )}
      </Card>

      {/* 用户配置管理 - 优化版 */}
      <Card title="用户配置" className="mb-6">
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-white leading-relaxed">
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
        {configs && Array.isArray(configs) && configs.length > 0 ? configs.map((config, index) => {
          // 深拷贝 config 对象，避免直接修改原始数据
          const safeConfig = {
            ...config,
            birthLocation: config.birthLocation ? { ...config.birthLocation } : undefined
          };

          return (
            <ConfigForm
              key={index}
              config={safeConfig}
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
          );
        }) : (
          <div className="text-center py-8 text-gray-500 dark:text-white">
            <p>暂无配置，请添加新配置</p>
          </div>
        )}
      </div>


    </div>
  );
};

export default UserConfigManagerComponent;