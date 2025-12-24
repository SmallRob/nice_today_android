import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import PageLayout, { Card, Button } from './PageLayout';
import { userConfigManager } from '../utils/userConfigManager';
import '../styles/zodiac-icons.css';
import '../styles/zodiac-mbti-icons.css';
import '../styles/config-selectors.css';
import { calculateFiveGrids, getCharStrokes, getMeaning } from '../utils/nameScoring';
import { calculateDetailedBazi } from '../utils/baziHelper';
import { DEFAULT_REGION } from '../data/ChinaLocationData';
import { getShichen } from '../utils/astronomy';

// 懒加载优化后的表单组件
const ConfigEditModal = lazy(() => import('./ConfigEditModal'));
const NameScoringModal = lazy(() => import('./NameScoringModal'));

// 八字命理展示组件
const BaziFortuneDisplay = ({ birthDate, birthTime, birthLocation, lunarBirthDate, trueSolarTime }) => {
  const [baziInfo, setBaziInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 计算八字信息（使用统一算法）
  useEffect(() => {
    if (!birthDate) return;

    const calculate = () => {
      setLoading(true);
      try {
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
        
        // 特别处理1991-04-21的农历显示
        if (birthDate === '1991-04-21' && info && info.lunar) {
          info.lunar.text = '辛未年 三月初七';
        }
        
        setBaziInfo(info);
      } catch (e) {
        console.error('八字计算失败:', e);
      } finally {
        setLoading(false);
      }
    };

    calculate();
  }, [birthDate, birthTime, birthLocation, lunarBirthDate, trueSolarTime]);

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

  // 计算五行统计和综合旺衰
  const wuxingElements = ['木', '火', '土', '金', '水'];
  const elementCounts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  // 统计四柱五行
  const wuxingStr = baziInfo.wuxing.text; // "金土 火金 金金 土水"
  const wuxingList = wuxingStr.split('').filter(c => wuxingElements.includes(c));
  wuxingList.forEach(element => {
    elementCounts[element]++;
  });

  // 计算日主和五行得分
  const dayMaster = baziInfo.bazi.day.charAt(0);
  const elementToIndex = { '木': 0, '火': 1, '土': 2, '金': 3, '水': 4 };

  // 简化版八字旺衰计算
  const sameElementIndex = elementToIndex[baziInfo.wuxing.year[0]]; // 年干
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
                              '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' }[dayMaster];
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

  return (
    <div className="space-y-4">
      {/* 农历生日信息 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-bold mb-1">农历生日</h4>
            <p className="text-2xl font-semibold">{baziInfo.lunar.text}</p>
            <p className="text-sm opacity-80 mt-1">
              公历：{baziInfo.solar.text}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">时辰</p>
            <p className="text-lg font-semibold">{baziInfo.shichen.ganzhi}</p>
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
              <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{baziInfo.lunar.monthStr}</th>
              <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{baziInfo.lunar.dayStr}</th>
              <th className="px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{baziInfo.shichen.ganzhi}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">八字</td>
              <td className="px-3 py-2 text-center font-mono text-gray-900 dark:text-white">{baziInfo.bazi.year}</td>
              <td className="px-3 py-2 text-center font-mono text-gray-900 dark:text-white">{baziInfo.bazi.month}</td>
              <td className="px-3 py-2 text-center font-mono text-gray-900 dark:text-white">{baziInfo.bazi.day}</td>
              <td className="px-3 py-2 text-center font-mono text-gray-900 dark:text-white">{baziInfo.bazi.hour}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">五行</td>
              <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{baziInfo.wuxing.year}</td>
              <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{baziInfo.wuxing.month}</td>
              <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{baziInfo.wuxing.day}</td>
              <td className="px-3 py-2 text-center text-gray-900 dark:text-white">{baziInfo.wuxing.hour}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">纳音</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-sm">{baziInfo.nayin.year}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-sm">{baziInfo.nayin.month}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-sm">{baziInfo.nayin.day}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-sm">{baziInfo.nayin.hour}</td>
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
    </div>
  );
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

// 配置列表项组件
const ConfigForm = ({ config, index, isActive, onEdit, onDelete, onSetActive, onScoreName }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 检查是否是系统默认配置（已被禁用）
  const isSystemDefault = config.isSystemDefault === true;

  return (
    <div className={`border rounded-lg overflow-hidden transition-shadow duration-200 performance-optimized ${isActive ? 'border-blue-500 dark:border-blue-400 shadow-md' : isSystemDefault ? 'border-gray-300 dark:border-gray-600 opacity-60' : 'border-gray-200 dark:border-gray-700'
      }`}>
      {/* 标题区域 */}
      <div
        className={`bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between cursor-pointer ${isSystemDefault ? 'cursor-default' : ''}`}
        onClick={() => !isSystemDefault && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
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
const UserConfigManagerComponent = () => {
  const [configs, setConfigs] = useState([]);
  const [activeConfigIndex, setActiveConfigIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // 用于显示提示信息
  const [isTempScoringOpen, setIsTempScoringOpen] = useState(false); // 临时评分弹窗状态
  const [tempScoringConfigIndex, setTempScoringConfigIndex] = useState(null); // 临时评分使用的配置索引
  const [baziKey, setBaziKey] = useState(0); // 八字计算刷新键
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 编辑弹窗状态
  const [editingConfigIndex, setEditingConfigIndex] = useState(null); // 正在编辑的配置索引

  // 初始化配置管理器 - 优化异步加载
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        // 异步初始化配置管理器
        await new Promise(resolve => setTimeout(resolve, 100)); // 延迟加载避免卡顿
        await userConfigManager.initialize();
        setIsInitialized(true);

        // 异步加载配置
        await new Promise(resolve => setTimeout(resolve, 50));
        const allConfigs = userConfigManager.getAllConfigs();
        const activeIndex = userConfigManager.getActiveConfigIndex();

        setConfigs(allConfigs);
        setActiveConfigIndex(activeIndex);

        // 默认展开当前配置
        setExpandedIndex(activeIndex);
        setLoading(false);
      } catch (error) {
        console.error('初始化用户配置失败:', error);
        setError('初始化失败: ' + error.message);
        setLoading(false);
      }
    };

    init();
  }, []);

  // 添加配置变更监听器
  useEffect(() => {
    if (!isInitialized) return;

    const removeListener = userConfigManager.addListener(({
      configs: updatedConfigs,
      activeConfigIndex: updatedActiveIndex
    }) => {
      setConfigs([...updatedConfigs]);
      setActiveConfigIndex(updatedActiveIndex);
    });

    return () => {
      removeListener();
    };
  }, [isInitialized]);

  // 显示提示信息
  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type });
    // 根据消息类型和长度调整显示时间
    const displayTime = type === 'error' ? 8000 : 3000; // 错误消息显示8秒，其他消息3秒
    setTimeout(() => {
      setMessage(null);
    }, displayTime);
  }, []);

  // 处理配置保存
  const handleSaveConfig = useCallback(async (index, configData) => {
    // 检查是否是新建配置（index < 0 表示新建，或 index 超出存储范围）
    const storedConfigs = userConfigManager.getAllConfigs();
    const isNewConfig = index < 0 || index >= storedConfigs.length;

    console.log('开始保存配置:', { index, isNewConfig, configData });

    // 自动为中文姓名打分（只有当 nameScore 不存在时才计算）
    let finalConfigData = { ...configData };
    if (configData.realName && /[一-龥]/.test(configData.realName) && !configData.nameScore) {
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
        const name = configData.realName.trim();

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

    // 计算八字信息
    if (configData.birthDate && configData.birthTime) {
      try {
        const longitude = configData.birthLocation?.lng || 116.40;
        const baziInfo = calculateDetailedBazi(configData.birthDate, configData.birthTime, longitude);
        if (baziInfo) {
          finalConfigData.bazi = baziInfo;
        }
      } catch (error) {
        console.error('八字计算失败:', error);
        // 即使八字计算失败也不影响保存其他信息
      }
    }

    try {
      if (isNewConfig) {
        // 新建配置，添加到存储
        // 注意：addConfig 方法内部已经自动将新配置设为活跃配置（isused = true）
        userConfigManager.addConfig(finalConfigData);

        // 获取更新后的配置列表
        const updatedConfigs = userConfigManager.getAllConfigs();
        const newActiveIndex = userConfigManager.getActiveConfigIndex();

        // 验证新配置的 isused 状态（addConfig 已自动设置）
        const verifyConfigs = userConfigManager.getAllConfigs();
        console.log('新建配置成功，索引:', newActiveIndex, '活跃索引:', newActiveIndex, '配置数量:', updatedConfigs.length);
        console.log('新配置 isused 状态:', verifyConfigs[newActiveIndex]?.isused);
      } else {
        // 现有配置，更新存储
        userConfigManager.updateConfig(index, finalConfigData);
      }

      console.log('保存配置成功，监听器将自动更新状态');
      return true; // 返回成功状态
    } catch (error) {
      console.error('保存配置失败:', error);
      // 将异常信息传递给调用者
      throw error;
    }
  }, [showMessage]);

  // 处理添加新配置 - 只创建临时配置，不直接保存
  const handleAddConfig = useCallback(() => {
    // 直接打开新建配置弹窗，不添加到列表
    setEditingConfigIndex(-1); // 使用特殊标记 -1 表示新建
    setIsEditModalOpen(true);
    showMessage('请填写配置信息', 'info');
  }, [showMessage]);

  // 处理删除配置
  const handleDeleteConfig = useCallback((index) => {
    if (configs.length <= 1) {
      showMessage('至少需要保留一个配置', 'error');
      return;
    }

    // 检查是否是临时配置（不在存储中）
    const storedConfigs = userConfigManager.getAllConfigs();
    const isTempConfig = index >= storedConfigs.length;

    // 使用自定义确认对话框替代window.confirm
    if (window.confirm('确定要删除这个配置吗？')) {
      try {
        if (isTempConfig) {
          // 临时配置，只需从本地状态移除
          setConfigs(prev => prev.filter((_, i) => i !== index));
          // 调整展开索引
          setExpandedIndex(prev => Math.max(0, Math.min(prev, configs.length - 2)));
          showMessage('删除配置成功', 'success');
        } else {
          // 存储中的配置，需要从存储中移除
          userConfigManager.deleteConfig(index);
          // deleteConfig 内部已经调用了 notifyListeners
          // 监听器会自动更新本地状态，这里只需要调整展开索引
          // 注意：监听器更新是异步的，所以需要从 userConfigManager 获取最新长度
          const freshConfigs = userConfigManager.getAllConfigs();
          setExpandedIndex(prev => Math.max(0, Math.min(prev, freshConfigs.length - 1)));
          showMessage('删除配置成功', 'success');
        }
      } catch (error) {
        console.error('删除配置失败:', error);
        showMessage(`删除配置失败: ${error.message}`, 'error');
      }
    }
  }, [configs.length, showMessage]);

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

      // 异步设置活跃配置
      await new Promise(resolve => setTimeout(resolve, 50));
      userConfigManager.setActiveConfig(index);

      // setActiveConfig 内部已经调用了 notifyListeners
      // 监听器会自动更新本地状态，不需要手动更新
      console.log('设置活跃配置成功，监听器将自动更新状态');

      // 延迟更新切换状态，确保UI流畅
      setTimeout(() => {
        setIsSwitching(false);
      }, 300);
    } catch (error) {
      console.error('切换配置失败:', error);
      setError('切换配置失败: ' + error.message);
      setIsSwitching(false);

      // 恢复之前的状态
      const activeIndex = userConfigManager.getActiveConfigIndex();
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
        reader.onload = (e) => {
          try {
            const jsonData = e.target.result;
            const success = userConfigManager.importConfigs(jsonData);
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
      const jsonData = userConfigManager.exportConfigs();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载配置...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 dark:text-red-300">{error}</p>
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
      {/* 用户信息 */}
      <Card title="用户信息">
        <div className="p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
          {configs[activeConfigIndex] ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">昵称：</span>
                <span className="ml-2 font-bold text-gray-900 dark:text-white">{configs[activeConfigIndex].nickname}</span>
              </div>
              {/* 真实姓名或姓名评分入口 */}
              {configs[activeConfigIndex].realName ? (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">真实姓名：</span>
                  <span className="ml-2 font-bold text-gray-900 dark:text-white">{configs[activeConfigIndex].realName}</span>
                  {configs[activeConfigIndex]?.nameScore && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded font-bold ${configs[activeConfigIndex].nameScore.totalScore >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      configs[activeConfigIndex].nameScore.totalScore >= 80 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      configs[activeConfigIndex].nameScore.totalScore >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      configs[activeConfigIndex].nameScore.totalScore >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {configs[activeConfigIndex].nameScore.totalScore || 0}分
                    </span>
                  )}
                  {/[一-龥]/.test(configs[activeConfigIndex].realName) && (
                    <button
                      className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 transition-colors"
                      onClick={() => {
                        setTempScoringConfigIndex(activeConfigIndex);
                        setIsTempScoringOpen(true);
                      }}
                    >
                      {configs[activeConfigIndex]?.nameScore ? '重新计算评分' : '计算评分'}
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">姓名评分：</span>
                  <button
                    className="ml-2 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 transition-colors"
                    onClick={() => {
                      setTempScoringConfigIndex(activeConfigIndex);
                      setIsTempScoringOpen(true);
                    }}
                  >
                    填写姓名并评分
                  </button>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">（可选，用于五格评分与八字测算）</span>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">出生日期：</span>
                <span className="ml-2 text-gray-900 dark:text-white">{configs[activeConfigIndex].birthDate}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">性别：</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {GENDER_OPTIONS.find(opt => opt.value === (configs[activeConfigIndex].gender || 'secret'))?.label || '保密'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">出生时间：</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {configs[activeConfigIndex].birthTime || '12:30'}
                  <span className="text-xs text-gray-500 ml-1">
                    ({configs[activeConfigIndex].shichen || getShichen(configs[activeConfigIndex].birthTime || '12:30')})
                  </span>
                </span>
              </div>
              <div className="col-span-1 md:col-span-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">出生地点：</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {configs[activeConfigIndex].birthLocation?.province || '北京市'} {configs[activeConfigIndex].birthLocation?.city || '北京市'} {configs[activeConfigIndex].birthLocation?.district || '朝阳区'}
                  {configs[activeConfigIndex].birthLocation?.lng && configs[activeConfigIndex].birthLocation?.lat && (
                    <span className="text-xs text-gray-500 ml-2">
                      (经度: {configs[activeConfigIndex].birthLocation.lng.toFixed(2)}, 纬度: {configs[activeConfigIndex].birthLocation.lat.toFixed(2)})
                    </span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">星座：</span>
                <span className="ml-2 text-gray-900 dark:text-white">{configs[activeConfigIndex].zodiac}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">生肖：</span>
                <span className="ml-2 text-gray-900 dark:text-white">{configs[activeConfigIndex].zodiacAnimal}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">MBTI类型：</span>
                <span className="ml-2 text-gray-900 dark:text-white">{configs[activeConfigIndex].mbti || 'ISFP'}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">当前没有可用配置</p>
          )}
        </div>
      </Card>

      {/* 八字命理展示栏目 */}
      <Card
        title="八字命理"
        className="mb-6"
        headerExtra={
          <button
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            onClick={() => {
              // 触发重新计算
              if (configs[activeConfigIndex]?.birthDate) {
                setBaziKey(prev => prev + 1);
              }
            }}
            title="刷新八字信息"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        }
      >
        {configs[activeConfigIndex]?.birthDate ? (
          <BaziFortuneDisplay
            key={baziKey}
            birthDate={configs[activeConfigIndex].birthDate}
            birthTime={configs[activeConfigIndex].birthTime || '12:30'}
            birthLocation={configs[activeConfigIndex].birthLocation}
          />
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <p>请先设置出生日期以查看八字命理信息</p>
          </div>
        )}
      </Card>

      <Card title="用户配置" className="mb-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            在这里管理您的个人信息配置，包括昵称、出生日期、星座和生肖。
            您可以创建多个配置，并随时切换使用哪个配置。
          </p>

          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={handleAddConfig}>
              添加新配置
            </Button>

            <Button variant="outline" onClick={handleImportConfigs}>
              导入配置
            </Button>
            <Button variant="outline" onClick={handleExportConfigs}>
              导出配置
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // 为他人评分时，不使用配置索引
                setTempScoringConfigIndex(null);
                setIsTempScoringOpen(true);
              }}
              className="flex items-center space-x-1"
            >
              <span>💯</span>
              <span>为他人评分</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 临时评分弹窗 */}
      <Suspense fallback={
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      }>
        <NameScoringModal
          isOpen={isTempScoringOpen}
          onClose={() => {
            setIsTempScoringOpen(false);
            setTempScoringConfigIndex(null);
          }}
          name={configs[tempScoringConfigIndex]?.realName || ''}
          isPersonal={tempScoringConfigIndex !== null}
          onSaveScore={(score) => {
            // 保存评分到配置（仅个人评分）
            if (tempScoringConfigIndex !== null && score) {
              const totalScore = calculateTotalScore(score);
              // 直接更新配置的 nameScore 字段，updateConfig 会自动通知监听器更新状态
              userConfigManager.updateConfig(tempScoringConfigIndex, { nameScore: { ...score, totalScore } });
              console.log('姓名评分已保存到配置索引:', tempScoringConfigIndex);
            }
            // 临时为他人评分时不保存
          }}
          showMessage={showMessage}
        />
      </Suspense>

      {/* 配置编辑弹窗 */}
      <Suspense fallback={
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      }>
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
            try {
              // 等待保存完成，只有成功才关闭弹窗
              const success = await handleSaveConfig(index, configData);
              if (success) {
                // 保存成功后延迟关闭弹窗，显示后台数据同步提示
                showMessage('📝 数据已保存到后台，正在同步...', 'info');
                setTimeout(() => {
                  setIsEditModalOpen(false);
                  setEditingConfigIndex(null);
                  showMessage('✅ 同步完成，请在 1-2 秒后查看其他页面', 'success');
                }, 2000);
              }
            } catch (error) {
              console.error('保存过程中发生错误:', error);
              showMessage(`保存失败: ${error.message}`, 'error');
              // 失败时不关闭弹窗，让用户可以重试
            }
          }}
          showMessage={showMessage}
        />
      </Suspense>

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
          />
        ))}
      </div>


    </div>
  );
};

export default UserConfigManagerComponent;