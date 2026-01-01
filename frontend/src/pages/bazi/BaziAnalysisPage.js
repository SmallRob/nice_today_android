/**
 * 八字命格分析页面
 * 展示完整的八字命格分析结果，包括四柱、五行、纳音、大运等信息
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useUserConfig } from '../../contexts/UserConfigContext';
import { baziCacheManager } from '../../utils/BaziCacheManager';
import { getDisplayBaziInfo } from '../../utils/baziSchema';
import { calculateDetailedBazi } from '../../utils/baziHelper';
import { DEFAULT_REGION } from '../../data/ChinaLocationData';

// 八字命格展示组件
const BaziFortuneDisplay = ({ birthDate, birthTime, birthLocation, lunarBirthDate, trueSolarTime, savedBaziInfo, nickname }) => {
  const [baziInfo, setBaziInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 计算八字信息
  useEffect(() => {
    // 添加参数验证
    if (!birthDate) {
      console.log('出生日期未设置，显示默认信息');
      setBaziInfo(getFallbackBaziData(birthDate, birthTime));
      setLoading(false);
      return;
    }

    const loadBazi = async () => {
      try {
        setLoading(true);
        let finalBaziData = null;

        // 1. 优先从缓存获取八字信息
        if (nickname) {
          try {
            const cachedBazi = baziCacheManager.getBaziByNickname(nickname, {
              format: 'legacy',
              validate: true,
              fallbackToLegacy: true
            });

            if (cachedBazi && (cachedBazi.bazi || cachedBazi.dualFormatBazi)) {
              console.log('使用缓存中的八字信息:', nickname);

              const displayBazi = getDisplayBaziInfo(cachedBazi.bazi || cachedBazi.dualFormatBazi);

              // 验证缓存数据是否与当前配置一致
              if (validateBaziDataConsistency(displayBazi, birthDate, birthTime, birthLocation)) {
                finalBaziData = displayBazi;
                console.log('缓存数据验证通过');
              } else {
                console.log('缓存数据与当前配置不一致，重新计算');
                baziCacheManager.clearCache(nickname);
              }
            }
          } catch (cacheError) {
            console.warn('缓存读取失败:', cacheError);
          }
        }

        // 2. 如果缓存无效，尝试使用保存的八字信息
        if (!finalBaziData && savedBaziInfo) {
          try {
            console.log('使用配置中保存的八字信息');
            const displayBazi = getDisplayBaziInfo(savedBaziInfo);

            if (validateBaziDataConsistency(displayBazi, birthDate, birthTime, birthLocation)) {
              finalBaziData = displayBazi;
              console.log('配置数据验证通过');
            } else {
              console.log('配置数据与当前信息不一致，重新计算');
            }
          } catch (configError) {
            console.warn('配置数据处理失败:', configError);
          }
        }

        // 3. 如果缓存和保存数据都无效，则实时计算
        if (!finalBaziData) {
          console.log('开始实时计算八字信息');
          try {
            const lng = birthLocation?.lng || DEFAULT_REGION.lng;

            const useTrueSolarTime = trueSolarTime || birthTime || '12:30';

            const info = calculateDetailedBazi(birthDate, useTrueSolarTime, lng);

            finalBaziData = getDisplayBaziInfo(info);

            if (lunarBirthDate && finalBaziData) {
              finalBaziData.lunar = {
                ...finalBaziData.lunar,
                text: lunarBirthDate
              };
            }

            // 计算完成后缓存八字信息
            if (finalBaziData && nickname) {
              try {
                const cacheSuccess = baziCacheManager.cacheBazi(nickname, {
                  birthDate,
                  birthTime: useTrueSolarTime,
                  longitude: lng
                }, finalBaziData);

                if (cacheSuccess) {
                  console.log('八字信息已缓存:', nickname);
                }
              } catch (cacheError) {
                console.warn('缓存存储失败:', cacheError);
              }
            }
          } catch (calcError) {
            console.error('八字计算失败:', calcError);
            finalBaziData = getFallbackBaziData(birthDate, birthTime);
          }
        }

        // 4. 确保最终数据格式正确
        if (finalBaziData) {
          finalBaziData = normalizeBaziData(finalBaziData);
          setBaziInfo(finalBaziData);
        } else {
          setBaziInfo(getFallbackBaziData(birthDate, birthTime));
        }

      } catch (e) {
        console.error('八字加载失败:', e);
        setBaziInfo(getFallbackBaziData(birthDate, birthTime));
      } finally {
        setLoading(false);
      }
    };

    loadBazi();
  }, [birthDate, birthTime, birthLocation, lunarBirthDate, trueSolarTime, savedBaziInfo, nickname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!baziInfo) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-white">
        请先设置出生日期
      </div>
    );
  }

  // 验证 baziInfo 数据结构完整性
  const hasValidBaziData = baziInfo && (
    (baziInfo.meta && baziInfo.birth && baziInfo.bazi &&
     baziInfo.bazi.year && baziInfo.bazi.month && baziInfo.bazi.day && baziInfo.bazi.hour) ||
    (baziInfo.bazi && baziInfo.bazi.year && baziInfo.bazi.month && baziInfo.bazi.day && baziInfo.bazi.hour) ||
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

    baziInfo = { ...defaultBaziInfo, ...baziInfo };
  }

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
    <div className="space-y-6">
      {/* 农历生日信息 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-lg sm:text-xl font-bold mb-2">农历生日</h4>
            <p className="text-2xl sm:text-3xl font-semibold">{(baziInfo && baziInfo.lunar && baziInfo.lunar.text) || '未知'}</p>
            <p className="text-sm sm:text-base opacity-80 mt-2">
              公历：{(baziInfo && baziInfo.solar && baziInfo.solar.text) || '未知'}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm sm:text-base opacity-80 mb-1">时辰</p>
            <p className="text-lg sm:text-xl font-semibold">{(baziInfo && baziInfo.shichen && baziInfo.shichen.ganzhi) || '未知'}</p>
          </div>
        </div>
      </div>

      {/* 八字四柱表格 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="px-3 sm:px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white">柱</th>
              <th className="px-3 sm:px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-white">年柱</th>
              <th className="px-3 sm:px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-white">{(baziInfo && baziInfo.lunar && baziInfo.lunar.monthStr) || '未知'}</th>
              <th className="px-3 sm:px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-white">{(baziInfo && baziInfo.lunar && baziInfo.lunar.dayStr) || '未知'}</th>
              <th className="px-3 sm:px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-white">{(baziInfo && baziInfo.shichen && baziInfo.shichen.ganzhi) || '未知'}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-700 dark:text-white">八字</td>
              <td className="px-3 sm:px-4 py-3 text-center font-mono text-base sm:text-lg font-bold text-gray-900 dark:text-white">{(baziInfo && baziInfo.bazi && baziInfo.bazi.year) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center font-mono text-base sm:text-lg font-bold text-gray-900 dark:text-white">{(baziInfo && baziInfo.bazi && baziInfo.bazi.month) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center font-mono text-base sm:text-lg font-bold text-gray-900 dark:text-white">{(baziInfo && baziInfo.bazi && baziInfo.bazi.day) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center font-mono text-base sm:text-lg font-bold text-gray-900 dark:text-white">{(baziInfo && baziInfo.bazi && baziInfo.bazi.hour) || '未知'}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-700 dark:text-white">五行</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-900 dark:text-white">{(baziInfo && baziInfo.wuxing && baziInfo.wuxing.year) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-900 dark:text-white">{(baziInfo && baziInfo.wuxing && baziInfo.wuxing.month) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-900 dark:text-white">{(baziInfo && baziInfo.wuxing && baziInfo.wuxing.day) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-900 dark:text-white">{(baziInfo && baziInfo.wuxing && baziInfo.wuxing.hour) || '未知'}</td>
            </tr>
            <tr>
              <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-700 dark:text-white">纳音</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-600 dark:text-white text-sm">{(baziInfo && baziInfo.nayin && baziInfo.nayin.year) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-600 dark:text-white text-sm">{(baziInfo && baziInfo.nayin && baziInfo.nayin.month) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-600 dark:text-white text-sm">{(baziInfo && baziInfo.nayin && baziInfo.nayin.day) || '未知'}</td>
              <td className="px-3 sm:px-4 py-3 text-center text-gray-600 dark:text-white text-sm">{(baziInfo && baziInfo.nayin && baziInfo.nayin.hour) || '未知'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 五行统计 */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-md">
        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-4">五行统计</h4>
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {wuxingElements.map((element) => {
            const elementColors = {
              '木': 'bg-green-500', '火': 'bg-red-500', '土': 'bg-yellow-600',
              '金': 'bg-gray-500', '水': 'bg-blue-500'
            };
            return (
              <div key={element} className="text-center">
                <div className={`h-3 sm:h-4 rounded-full ${elementColors[element]} mb-2 mx-auto w-full max-w-[60px]`}></div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-white">{element}</p>
                <p className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">{elementCounts[element]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 八字总述解析 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800 shadow-md">
        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-3">八字总述解析</h4>
        <div className="text-sm sm:text-base text-gray-800 dark:text-white space-y-3">
          <p className="leading-relaxed">
            <span className="font-medium">总述：</span>
            {fortuneType}，八字喜用神「{luckyElement}」，起名最好用五行属性为「{luckyElement}」的字。
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-white leading-relaxed">
            日主天干为{dayMaster}({masterElement})。五行统计：
            木{elementCounts['木']}，火{elementCounts['火']}，土{elementCounts['土']}，
            金{elementCounts['金']}，水{elementCounts['水']}。
          </p>
        </div>
      </div>

      {/* 命局五行喜忌 */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 sm:p-6 border border-purple-200 dark:border-purple-800 shadow-md">
        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-4">命局五行喜忌</h4>
        <div className="text-sm sm:text-base text-gray-800 dark:text-white space-y-3">
          {(() => {
              const preferences = calculateWuxingPreferences(baziInfo);
              if (!preferences) return null;

            return (
              <div className="space-y-4">
                {/* 最喜五行 */}
                {preferences.preferred.filter(p => p.priority === '最喜').map((item, index) => (
                  <div key={`preferred-top-${index}`} className="border-l-4 border-green-500 pl-4 py-2">
                    <p className="font-medium text-base sm:text-lg">最喜五行{item.element}：</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white ml-4">
                      十神：{item.shishen}；方位：{item.fangwei}；数字{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}

                {/* 次喜五行 */}
                {preferences.preferred.filter(p => p.priority === '次喜').map((item, index) => (
                  <div key={`preferred-secondary-${index}`} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-medium text-base sm:text-lg">次喜五行{item.element}：</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white ml-4">
                      十神：{item.shishen}；方位：{item.fangwei}；数字{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}

                {/* 最忌五行 */}
                {preferences.avoided.filter(p => p.priority === '最忌').map((item, index) => (
                  <div key={`avoided-top-${index}`} className="border-l-4 border-red-500 pl-4 py-2">
                    <p className="font-medium text-base sm:text-lg">最忌五行{item.element}：</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white ml-4">
                      十神：{item.shishen}；方位：{item.fangwei}；数字：{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}

                {/* 次忌五行 */}
                {preferences.avoided.filter(p => p.priority === '次忌').map((item, index) => (
                  <div key={`avoided-secondary-${index}`} className="border-l-4 border-orange-500 pl-4 py-2">
                    <p className="font-medium text-base sm:text-lg">次忌五行{item.element}：</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white ml-4">
                      十神：{item.shishen}；方位：{item.fangwei}；数字：{item.shuzi}；色彩：{item.secai}
                    </p>
                  </div>
                ))}

                {/* 平常五行 */}
                {preferences.neutral.map((item, index) => (
                  <div key={`neutral-${index}`} className="border-l-4 border-gray-500 pl-4 py-2">
                    <p className="font-medium text-base sm:text-lg">平常五行{item.element}：</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white ml-4">
                      十神：{item.shishen}；方位：{item.fangwei}；数字：{item.shuzi}；色彩{item.secai}
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* 十年大运 */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 sm:p-6 border border-yellow-200 dark:border-yellow-800 shadow-md">
        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-4">大运</h4>
        <div className="text-sm sm:text-base text-gray-800 dark:text-white">
          {(() => {
              const birthYear = birthDate ? parseInt(birthDate.split('-')[0]) : new Date().getFullYear();
              const dayun = calculateDaYun(baziInfo, birthYear);
              if (!dayun) return null;

            return (
              <div className="space-y-2">
                {dayun.map((d, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-yellow-100 dark:border-yellow-800/50">
                    <span className="font-medium text-sm sm:text-base">{d.ganzhi} {d.startYear}-{d.endYear}</span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-white">({d.ageRange})</span>
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

// 辅助函数：验证八字数据一致性
const validateBaziDataConsistency = (baziData, birthDate, birthTime, birthLocation) => {
  if (!baziData) return false;

  const hasValidStructure = baziData && (
    (baziData.meta && baziData.birth && baziData.bazi) ||
    (baziData.bazi && baziData.bazi.year && baziData.bazi.month && baziData.bazi.day && baziData.bazi.hour) ||
    (baziData.year && baziData.month && baziData.day && baziData.hour)
  );

  if (!hasValidStructure) return false;

  // 验证出生日期是否匹配
  if (birthDate && baziData.birth && baziData.birth.solar && baziData.birth.solar.date !== birthDate) {
    return false;
  }

  return true;
};

// 辅助函数：标准化八字数据格式
const normalizeBaziData = (baziData) => {
  if (!baziData) return baziData;

  const normalized = { ...baziData };

  if (!normalized.bazi) {
    normalized.bazi = {
      year: normalized.year || '甲子',
      month: normalized.month || '乙丑',
      day: normalized.day || '丙寅',
      hour: normalized.hour || '丁卯'
    };
  }

  if (!normalized.wuxing) {
    normalized.wuxing = {
      text: normalized.wuXing?.text || '木火 火火 土水',
      year: normalized.wuXing?.year || '木',
      month: normalized.wuXing?.month || '火',
      day: normalized.wuXing?.day || '火',
      hour: normalized.wuXing?.hour || '土'
    };
  }

  if (!normalized.lunar) {
    normalized.lunar = {
      text: normalized.birth?.lunar?.text || '请设置出生信息',
      monthStr: normalized.birth?.lunar?.monthInChinese || '请设置',
      dayStr: normalized.birth?.lunar?.dayInChinese || '请设置'
    };
  }

  if (!normalized.shichen) {
    normalized.shichen = {
      ganzhi: normalized.birth?.time?.shichenGanZhi || '丁卯'
    };
  }

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

// 辅助函数：获取降级八字数据
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

  if (!baziInfo.bazi) {
    console.warn('baziInfo.bazi 为 null 或 undefined');
    return false;
  }

  const requiredBaziFields = ['year', 'month', 'day', 'hour'];
  for (const field of requiredBaziFields) {
    if (!baziInfo.bazi[field]) {
      console.warn(`baziInfo.bazi.${field} 为 null 或 undefined 或空字符串`);
      return false;
    }

    if (typeof baziInfo.bazi[field] !== 'string') {
      console.warn(`baziInfo.bazi.${field} 不是字符串类型，实际类型为: ${typeof baziInfo.bazi[field]}`);
      return false;
    }

    if (baziInfo.bazi[field].length < 1) {
      console.warn(`baziInfo.bazi.${field} 字符串长度不足`);
      return false;
    }
  }

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

    if (typeof baziInfo.wuxing[field] !== 'string') {
      console.warn(`baziInfo.wuxing.${field} 不是字符串类型，实际类型为: ${typeof baziInfo.wuxing[field]}`);
      return false;
    }
  }

  return true;
};

// 计算五行统计
const calculateFiveElementStats = (baziInfo) => {
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
    const wuxingStr = baziInfo.wuxing.text || '';
    const wuxingList = wuxingStr.split('').filter(c => wuxingElements.includes(c));
    wuxingList.forEach(element => {
      elementCounts[element]++;
    });

    const dayMaster = baziInfo.bazi.day && typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 ? baziInfo.bazi.day.charAt(0) : '未知';
    const elementToIndex = { '木': 0, '火': 1, '土': 2, '金': 3, '水': 4 };

    const sameTypeScore = (elementCounts['木'] * 1.68) + (elementCounts['火'] * 0.34) +
                         (elementCounts['土'] * 0.75) + (elementCounts['金'] * 1.68) +
                         (elementCounts['水'] * 0.60);

    const diffTypeScore = (8 - sameTypeScore);

    const totalScore = Math.abs(sameTypeScore - diffTypeScore);

    let fortuneType = '八字中和';
    let luckyElement = '无特别喜用';
    const dayMasterElement = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
                                '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' }[dayMaster] || '未知';
    const masterElement = dayMasterElement || '未知';

    if (totalScore > 3) {
      if (sameTypeScore > diffTypeScore) {
        fortuneType = '八字偏强';
        const missingElements = wuxingElements.filter(e => elementCounts[e] === 0);
        const minElements = wuxingElements.filter(e => elementCounts[e] === Math.min(...Object.values(elementCounts)));
        luckyElement = minElements.length > 0 ? minElements[0] : '木';
      } else {
        fortuneType = '八字偏弱';
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

// 计算五行喜忌功能
const calculateWuxingPreferences = (baziInfo) => {
  if (!baziInfo || !baziInfo.bazi || !baziInfo.wuxing) {
    return null;
  }

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
    return null;
  }

  const dayMaster = baziInfo.bazi.day && typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 ? baziInfo.bazi.day.charAt(0) : '未知';

  const wuxingMap = {
    '甲': '木', '乙': '木', '寅': '木', '卯': '木',
    '丙': '火', '丁': '火', '巳': '火', '午': '火',
    '戊': '土', '己': '土', '辰': '土', '戌': '土', '丑': '土', '未': '土',
    '庚': '金', '辛': '金', '申': '金', '酉': '金',
    '壬': '水', '癸': '水', '亥': '水', '子': '水'
  };

  const dayMasterElement = wuxingMap[dayMaster] || '未知';

  const wuxingRelations = {
    '木': { '生': '火', '克': '土', '被生': '水', '被克': '金' },
    '火': { '生': '土', '克': '金', '被生': '木', '被克': '水' },
    '土': { '生': '金', '克': '水', '被生': '火', '被克': '木' },
    '金': { '生': '水', '克': '木', '被生': '土', '被克': '火' },
    '水': { '生': '木', '克': '火', '被生': '金', '被克': '土' }
  };

  const wuxingElements = ['木', '火', '土', '金', '水'];
  const elementCounts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  const wuxingStr = (baziInfo.wuxing && baziInfo.wuxing.text) || '';
  const wuxingList = wuxingStr.split('').filter(c => wuxingElements.includes(c));
  wuxingList.forEach(element => {
    elementCounts[element]++;
  });

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

  const dayElementCount = elementCounts[dayMasterElement];
  const averageCount = (elementCounts['木'] + elementCounts['火'] + elementCounts['土'] + elementCounts['金'] + elementCounts['水']) / 5;

  let preferences = {
    preferred: [],
    avoided: [],
    neutral: []
  };

  if (dayElementCount > averageCount) {
    preferences.preferred.push({
      element: wuxingRelations[dayMasterElement]['被克'],
      priority: '次喜',
      shishen: '官杀',
      fangwei: '克我方位',
      shuzi: '克我数字',
      secai: '克我色彩'
    });

    preferences.preferred.push({
      element: wuxingRelations[dayMasterElement]['生'],
      priority: '最喜',
      shishen: '食伤',
      fangwei: '生我方位',
      shuzi: '生我数字',
      secai: '生我色彩'
    });

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

    preferences.avoided.push({
      element: wuxingRelations[dayMasterElement]['克'],
      priority: '次忌',
      shishen: '财星',
      fangwei: '我克方位',
      shuzi: '我克数字',
      secai: '我克色彩'
    });
  } else {
    preferences.preferred.push({
      element: wuxingRelations[dayMasterElement]['被生'],
      priority: '最喜',
      shishen: '印枭',
      fangwei: '生我方位',
      shuzi: '生我数字',
      secai: '生我色彩'
    });

    preferences.preferred.push({
      element: dayMasterElement,
      priority: '次喜',
      shishen: '比劫',
      fangwei: '同类方位',
      shuzi: '同类数字',
      secai: '同类色彩'
    });

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
        element: wuxingRelations[dayMasterElement]['生'],
        priority: '最忌',
        shishen: '食伤',
        fangwei: '泄耗方位',
        shuzi: '泄耗数字',
        secai: '泄耗色彩'
      });
    }

    preferences.avoided.push({
      element: wuxingRelations[dayMasterElement]['克'],
      priority: '次忌',
      shishen: '财星',
      fangwei: '我克方位',
      shuzi: '我克数字',
      secai: '我克色彩'
    });
  }

  wuxingElements.forEach(element => {
    if (!preferences.preferred.some(p => p.element === element) &&
        !preferences.avoided.some(a => a.element === element)) {
      preferences.neutral.push({
        element: element,
        priority: '平常',
        shishen: '食伤',
        fangwei: '平常方位',
        shuzi: '平常数字',
        secai: '平常色彩'
      });
    }
  });

  const elementDetails = {
    '木': { shishen: '比劫', fangwei: '东、东南', shuzi: '三、八', secai: '绿、青' },
    '火': { shishen: '食伤', fangwei: '南、东南', shuzi: '二、七', secai: '红、紫、橙' },
    '土': { shishen: '财星', fangwei: '中央、本地', shuzi: '五、零', secai: '黄、棕' },
    '金': { shishen: '官杀', fangwei: '西、西北', shuzi: '四、九', secai: '白、银、金' },
    '水': { shishen: '印枭', fangwei: '北、西南', shuzi: '一、六', secai: '黑、蓝' }
  };

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

  const hasValidBaziFields = baziInfo.bazi &&
    typeof baziInfo.bazi.year === 'string' && baziInfo.bazi.year.length > 0 &&
    typeof baziInfo.bazi.month === 'string' && baziInfo.bazi.month.length > 0 &&
    typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 &&
    typeof baziInfo.bazi.hour === 'string' && baziInfo.bazi.hour.length > 0;

  if (!hasValidBaziFields) {
    return null;
  }

  const dayMaster = baziInfo.bazi.day && typeof baziInfo.bazi.day === 'string' && baziInfo.bazi.day.length > 0 ? baziInfo.bazi.day.charAt(0) : '未知';

  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const dayMasterIndex = gan.indexOf(dayMaster);

  const yearGan = baziInfo.bazi.year && typeof baziInfo.bazi.year === 'string' && baziInfo.bazi.year.length > 0 ? baziInfo.bazi.year.charAt(0) : '甲';
  const yearGanIndex = gan.indexOf(yearGan);
  const isYangYear = yearGanIndex % 2 === 0;

  const isMale = true;

  let dayunSequence = [];

  const isForward = (isMale && isYangYear) || (!isMale && !isYangYear);

  const monthGan = baziInfo.bazi.month && typeof baziInfo.bazi.month === 'string' && baziInfo.bazi.month.length > 0 ? baziInfo.bazi.month.charAt(0) : '子';
  const monthZhi = baziInfo.bazi.month && typeof baziInfo.bazi.month === 'string' && baziInfo.bazi.month.length > 1 ? baziInfo.bazi.month.charAt(1) : '子';

  const monthGanIndex = gan.indexOf(monthGan);
  const monthZhiIndex = zhi.indexOf(monthZhi);

  for (let i = 0; i < 10; i++) {
    let ganIndex, zhiIndex;

    if (isForward) {
      ganIndex = (monthGanIndex + i + 1) % 10;
      zhiIndex = (monthZhiIndex + i + 1) % 12;
    } else {
      ganIndex = (monthGanIndex - i - 1 + 10) % 10;
      zhiIndex = (monthZhiIndex - i - 1 + 12) % 12;
    }

    if (ganIndex < 0) ganIndex += 10;
    if (zhiIndex < 0) zhiIndex += 12;

    const dagan = gan[ganIndex];
    const dazhi = zhi[zhiIndex];

    const startAge = 6 + i * 10;
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

// 主页面组件
const BaziAnalysisPage = () => {
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-orange-900/20 ${theme}`}>
      {/* 导航标题栏 */}
      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:text-amber-100 flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <h1 className="text-xl font-bold">八字命格分析</h1>
            <button
              onClick={() => navigate('/user-config')}
              className="text-white hover:text-amber-100 flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              设置
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 提示卡片 */}
        <div className="bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-amber-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">
                八字命格分析
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                基于您的出生日期和时间，计算并展示完整的八字命格分析结果，包括四柱、五行、纳音、喜忌、大运等信息。
              </p>
            </div>
          </div>
        </div>

        {/* 八字命格展示 */}
        <BaziFortuneDisplay
          birthDate={currentConfig?.birthDate}
          birthTime={currentConfig?.birthTime}
          birthLocation={currentConfig?.birthLocation}
          lunarBirthDate={currentConfig?.lunarBirthDate}
          trueSolarTime={currentConfig?.trueSolarTime}
          savedBaziInfo={currentConfig?.baziInfo}
          nickname={currentConfig?.nickname}
        />
      </div>
    </div>
  );
};

export default BaziAnalysisPage;
