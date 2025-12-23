import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageLayout, { Card, Button } from './PageLayout';
import { userConfigManager } from '../utils/userConfigManager';
import '../styles/zodiac-icons.css';
import '../styles/zodiac-mbti-icons.css';
import '../styles/config-selectors.css';
import { getShichen, calculateTrueSolarTime } from '../utils/astronomy';
import { calculateFiveGrids, getCharStrokes, getMeaning } from '../utils/nameScoring';
import { calculateDetailedBazi } from '../utils/baziHelper';

import { REGION_DATA, DEFAULT_REGION } from '../data/ChinaLocationData';

// 八字命理展示组件
const BaziFortuneDisplay = ({ birthDate, birthTime, birthLocation }) => {
  const [baziInfo, setBaziInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // 计算八字信息
  useEffect(() => {
    if (!birthDate) return;

    const calculate = () => {
      setLoading(true);
      try {
        const lng = birthLocation?.lng || DEFAULT_REGION.lng;
        const info = calculateDetailedBazi(birthDate, birthTime || '12:30', lng);
        setBaziInfo(info);
      } catch (e) {
        console.error('八字计算失败:', e);
      } finally {
        setLoading(false);
      }
    };

    calculate();
  }, [birthDate, birthTime, birthLocation]);

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

// 星座选项
const ZODIAC_OPTIONS = [
  '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
  '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
];

// 生肖选项
const ZODIAC_ANIMAL_OPTIONS = [
  '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'
];

// 性别选项
const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'secret', label: '保密' }
];

// MBTI类型选项
const MBTI_OPTIONS = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

// 优化的加载组件
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
  </div>
);

// 姓名评分模态框
const NameScoringModal = ({ isOpen, onClose, name, isPersonal = false, onSaveScore, existingScore, configIndex, showMessage, isValidNameScore }) => {
  const [step, setStep] = useState('input'); // input, result
  const [tempName, setTempName] = useState(''); // 临时输入的姓名
  const [splitName, setSplitName] = useState({ surname: '', firstName: '' });
  const [strokes, setStrokes] = useState({ surname: [], firstName: [] });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 智能拆分中文姓名
  const smartSplitName = (fullName) => {
    if (!fullName) return { surname: '', firstName: '' };

    // 常见复姓列表
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

    // 检查是否包含中文圆点（少数民族姓名分隔符）
    if (fullName.includes('·') || fullName.includes('•')) {
      const parts = fullName.split(/[·•]/);
      return {
        surname: parts[0] || '',
        firstName: parts.slice(1).join('') || ''
      };
    }

    // 检查是否是复姓
    for (const compoundSurname of compoundSurnames) {
      if (fullName.startsWith(compoundSurname)) {
        return {
          surname: compoundSurname,
          firstName: fullName.substring(compoundSurname.length)
        };
      }
    }

    // 根据姓名长度判断
    const nameLength = fullName.length;
    if (nameLength === 2) {
      // 两个字：第一个是姓
      return {
        surname: fullName.substring(0, 1),
        firstName: fullName.substring(1)
      };
    } else if (nameLength === 3) {
      // 三个字：第一个是姓，后两个是名
      return {
        surname: fullName.substring(0, 1),
        firstName: fullName.substring(1)
      };
    } else if (nameLength >= 4) {
      // 四个字及以上：默认前两个是姓（可能是复姓）
      return {
        surname: fullName.substring(0, 2),
        firstName: fullName.substring(2)
      };
    }

    // 默认情况
    return {
      surname: fullName.substring(0, 1),
      firstName: fullName.substring(1) || ''
    };
  };

  // 初始化拆解姓名 - 只在个人评分时加载用户信息
  useEffect(() => {
    if (isOpen) {
      if (isPersonal && name) {
        // 个人评分：使用智能拆分
        const split = smartSplitName(name);
        setSplitName(split);

        // 初始笔画获取
        const surnameChars = split.surname.split('').filter(c => c);
        const firstNameChars = split.firstName.split('').filter(c => c);

        const surnameStrokes = surnameChars.map(c => getCharStrokes(c));
        const firstNameStrokes = firstNameChars.map(c => getCharStrokes(c));

        setStrokes({
          surname: surnameStrokes,
          firstName: firstNameStrokes
        });

        // 优化：优先从配置中加载缓存评分，如果没有则动态计算
        if (configIndex !== undefined && configIndex >= 0) {
          // 从配置中获取评分数据
          const config = userConfigManager.getConfigByIndex(configIndex);
          if (config && config.nameScore && isValidNameScore(config.nameScore)) {
            setAnalysisResult(config.nameScore);
            setStep('result');
          } else {
            // 没有缓存评分或评分无效，需要动态计算
            setStep('input');
          }
        } else if (existingScore && isValidNameScore(existingScore)) {
          // 如果有已有评分且有效，直接显示结果
          setAnalysisResult(existingScore);
          setStep('result');
        } else {
          setStep('input');
        }
        setTempName(''); // 重置临时姓名
      } else {
        // 为他人评分或没有姓名：清空所有状态
        setSplitName({ surname: '', firstName: '' });
        setStrokes({ surname: [], firstName: [] });
        setAnalysisResult(null);
        setStep('input');
        setTempName('');
      }
    }
  }, [isOpen, name, isPersonal, existingScore, configIndex]);

  // 处理姓名输入变化
  const handleNameChange = (newName) => {
    setTempName(newName);

    if (newName && newName.trim()) {
      // 自动拆分
      const split = smartSplitName(newName.trim());
      setSplitName(split);

      const surnameChars = split.surname.split('').filter(c => c);
      const firstNameChars = split.firstName.split('').filter(c => c);

      setStrokes({
        surname: surnameChars.map(c => getCharStrokes(c)),
        firstName: firstNameChars.map(c => getCharStrokes(c))
      });
    }
  };

  // 手动重新拆分
  const handleReSplit = () => {
    const nameToSplit = tempName || name || '';
    if (nameToSplit && nameToSplit.trim()) {
      const split = smartSplitName(nameToSplit.trim());
      setSplitName(split);

      const surnameChars = split.surname.split('').filter(c => c);
      const firstNameChars = split.firstName.split('').filter(c => c);

      setStrokes({
        surname: surnameChars.map(c => getCharStrokes(c)),
        firstName: firstNameChars.map(c => getCharStrokes(c))
      });
    }
  };

  const handleCalculate = () => {
    try {
      const res = calculateFiveGrids(
        splitName.surname,
        splitName.firstName,
        strokes.surname.map(s => parseInt(s) || 1), // 默认值为1防错
        strokes.firstName.map(s => parseInt(s) || 1)
      );
      
      // 检查返回结果是否有效
      if (res && isValidNameScore(res)) {
        setAnalysisResult(res);

        // 如果是个人评分且有回调，保存评分结果
        if (isPersonal && onSaveScore && !tempName) {
          onSaveScore(res);
        }

        setStep('result');
      } else {
        // 评分结果无效，显示错误信息
        setErrorMessage('姓名评分计算失败，请检查输入信息');
      }
    } catch (error) {
      console.error('姓名评分计算出错:', error);
      setErrorMessage('姓名评分计算失败: ' + error.message);
    }
  };

  const getScoreColor = (type) => {
    if (type === '吉') return 'text-green-600 dark:text-green-400';
    if (type === '半吉') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // 将五格评分转换为100分制综合评分
  const convertTo100PointScore = (analysisResult) => {
    if (!analysisResult) return 0;
    
    // 计算每个格子的分数：吉=20分，半吉=15分，凶=5分
    const calculateGridScore = (gridValue) => {
      const meaning = getMeaning(gridValue);
      if (meaning.type === '吉') return 20;
      if (meaning.type === '半吉') return 15;
      return 5; // 凶
    };
    
    const tianScore = calculateGridScore(analysisResult.tian);
    const renScore = calculateGridScore(analysisResult.ren); // 人格最重要，可考虑权重
    const diScore = calculateGridScore(analysisResult.di);
    const waiScore = calculateGridScore(analysisResult.wai);
    const zongScore = calculateGridScore(analysisResult.zong);
    
    // 计算总分 (满分100分)
    const totalScore = tianScore + renScore + diScore + waiScore + zongScore;
    
    return Math.round(totalScore);
  };

  // 根据100分制分数获取等级评价
  const getScoreLevel = (score) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    if (score >= 60) return '需改进';
    return '待提升';
  };

  // 根据100分制分数获取等级颜色
  const getScoreLevelColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ touchAction: 'none' }}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">🔮</span> 姓名五格剖象评分
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {errorMessage}
            </div>
          )}
          {step === 'input' && (
            <div className="space-y-4">
              {/* 姓名输入框 - 允许临时输入他人姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isPersonal ? '您的姓名' : '输入姓名'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempName || name || ''}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="输入中文姓名"
                  />
                  <button
                    onClick={handleReSplit}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap text-sm"
                  >
                    重新拆分
                  </button>
                </div>
                {!isPersonal && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    可为他人临时评分，结果不会保存
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                系统已智能拆分姓名和笔画数。如有错误，可手动调整或点击"重新拆分"。
              </div>

              {/* 姓氏设置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">姓氏 (Surname)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={splitName.surname}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSplitName(prev => ({ ...prev, surname: val }));
                      setStrokes(prev => ({ ...prev, surname: val.split('').map(c => getCharStrokes(c)) }));
                    }}
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="输入姓"
                  />
                  {splitName.surname.split('').map((char, idx) => (
                    <input
                      key={`s-${idx}`}
                      type="number"
                      value={strokes.surname[idx] || ''}
                      onChange={(e) => {
                        const newStrokes = [...strokes.surname];
                        newStrokes[idx] = e.target.value;
                        setStrokes(prev => ({ ...prev, surname: newStrokes }));
                      }}
                      className="w-16 px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center"
                      placeholder="笔画"
                    />
                  ))}
                </div>
              </div>

              {/* 名字设置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">名字 (Name)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={splitName.firstName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSplitName(prev => ({ ...prev, firstName: val }));
                      setStrokes(prev => ({ ...prev, firstName: val.split('').map(c => getCharStrokes(c)) }));
                    }}
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="输入名"
                  />
                  {splitName.firstName.split('').map((char, idx) => (
                    <input
                      key={`n-${idx}`}
                      type="number"
                      value={strokes.firstName[idx] || ''}
                      onChange={(e) => {
                        const newStrokes = [...strokes.firstName];
                        newStrokes[idx] = e.target.value;
                        setStrokes(prev => ({ ...prev, firstName: newStrokes }));
                      }}
                      className="w-16 px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center"
                      placeholder="笔画"
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button variant="primary" onClick={handleCalculate} className="w-full">
                  开始评分
                </Button>
              </div>
            </div>
          )}

          {step === 'result' && analysisResult && isValidNameScore(analysisResult) ? (
            <div className="space-y-6">
              {/* 综合评分卡片 */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xl font-bold">{splitName.surname}{splitName.firstName}</h4>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded">五格剖象</span>
                </div>
                
                {/* 100分制总评分 */}
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold mb-1">{convertTo100PointScore(analysisResult)}<span className="text-lg">分</span></div>
                  <div className={`text-lg font-semibold ${getScoreLevelColor(convertTo100PointScore(analysisResult))}`}>
                    {getScoreLevel(convertTo100PointScore(analysisResult))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center bg-white/10 rounded p-2">
                    <div className="text-xs opacity-80">总格 (后运)</div>
                    <div className="text-2xl font-bold">{analysisResult.zong}</div>
                    <div className="text-sm font-medium">{getMeaning(analysisResult.zong).type}</div>
                  </div>
                  <div className="text-center bg-white/10 rounded p-2">
                    <div className="text-xs opacity-80">人格 (主运)</div>
                    <div className="text-2xl font-bold">{analysisResult.ren}</div>
                    <div className="text-sm font-medium">{getMeaning(analysisResult.ren).type}</div>
                  </div>
                </div>
              </div>

              {/* 详细列表 */}
              <div className="space-y-3">
                {[
                  { label: '天格 (祖运)', score: analysisResult.tian, desc: '代表祖先、长辈运势' },
                  { label: '人格 (主运)', score: analysisResult.ren, desc: '代表性格与核心运势' },
                  { label: '地格 (前运)', score: analysisResult.di, desc: '代表青年时期运势' },
                  { label: '外格 (副运)', score: analysisResult.wai, desc: '代表社交与外部关系' },
                  { label: '总格 (后运)', score: analysisResult.zong, desc: '代表一生整体运势' },
                ].map((item, idx) => {
                  const meaning = getMeaning(item.score);
                  return (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{item.label}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{item.desc}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-lg font-mono font-bold mr-2 text-gray-700 dark:text-gray-300">{item.score}</span>
                          <span className={`px-2 py-0.5 text-xs rounded font-bold ${meaning.type === '吉' ? 'bg-green-100 text-green-700' :
                            meaning.type === '半吉' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {meaning.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 pl-1 border-l-2 border-gray-300 dark:border-gray-600">
                        {meaning.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <Button variant="outline" onClick={() => setStep('input')} className="w-full">
                  重新调整
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">评分数据无效</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">当前评分数据格式不正确，无法正常显示结果。</p>
              <Button variant="primary" onClick={() => setStep('input')} className="w-full">
                重新评分
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 配置编辑弹窗组件
const ConfigEditModal = ({ isOpen, onClose, config, index, isNew, onSave, showMessage }) => {
  const [formData, setFormData] = useState({
    nickname: '',
    realName: '',
    birthDate: '',
    birthTime: '12:30',
    shichen: '午时二刻',
    birthLocation: { ...DEFAULT_REGION },
    zodiac: '',
    zodiacAnimal: '',
    gender: 'secret',
    mbti: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [locationInput, setLocationInput] = useState(formatLocationString(DEFAULT_REGION));
  const formRef = useRef(null);

  // 当 config 变化时更新 formData（修复数据加载问题）
  useEffect(() => {
    if (config) {
      setFormData({ ...config });
      setLocationInput(formatLocationString(config.birthLocation || DEFAULT_REGION));
    }
  }, [config, isOpen]);

  // 当弹窗关闭时重置状态
  useEffect(() => {
    if (!isOpen) {
      setHasChanges(false);
      setIsSaving(false);
    }
  }, [isOpen]);

  // 计算真太阳时和时辰
  const [calculatedInfo, setCalculatedInfo] = useState({
    shichen: '',
    trueSolarTime: ''
  });

  useEffect(() => {
    const shichen = getShichen(formData.birthTime || '12:30');
    const lng = formData.birthLocation?.lng || DEFAULT_REGION.lng;
    const trueSolarTime = calculateTrueSolarTime(formData.birthDate, formData.birthTime || '12:30', lng);

    setCalculatedInfo({
      shichen,
      trueSolarTime
    });
  }, [formData.birthDate, formData.birthTime, formData.birthLocation]);

  // 检测表单是否有变化
  useEffect(() => {
    if (!config) {
      setHasChanges(formData.nickname || formData.birthDate);
      return;
    }
    const changed =
      formData.nickname !== config.nickname ||
      formData.realName !== config.realName ||
      formData.birthDate !== config.birthDate ||
      formData.zodiac !== config.zodiac ||
      formData.zodiacAnimal !== config.zodiacAnimal ||
      formData.gender !== config.gender ||
      formData.mbti !== config.mbti ||
      formData.birthTime !== config.birthTime ||
      formData.shichen !== config.shichen ||
      formData.birthLocation?.district !== config.birthLocation?.district;
    setHasChanges(changed);
  }, [formData, config]);

  // 处理表单字段变化
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'birthTime') {
        newData.shichen = getShichen(value);
      }
      return newData;
    });
  }, []);

  // 处理地区变化
  const handleRegionChange = (type, value) => {
    const currentLoc = formData.birthLocation || { ...DEFAULT_REGION };
    let newLoc = { ...currentLoc };

    if (type === 'province') {
      const provData = REGION_DATA.find(p => p.name === value);
      if (provData) {
        newLoc.province = value;
        const firstCity = provData.children[0];
        newLoc.city = firstCity.name;
        const firstDistrict = firstCity.children[0];
        newLoc.district = firstDistrict.name;
        newLoc.lng = firstDistrict.lng;
        newLoc.lat = firstDistrict.lat;
      }
    } else if (type === 'city') {
      const provData = REGION_DATA.find(p => p.name === newLoc.province);
      const cityData = provData?.children.find(c => c.name === value);
      if (cityData) {
        newLoc.city = value;
        const firstDistrict = cityData.children[0];
        newLoc.district = firstDistrict.name;
        newLoc.lng = firstDistrict.lng;
        newLoc.lat = firstDistrict.lat;
      }
    } else if (type === 'district') {
      const provData = REGION_DATA.find(p => p.name === newLoc.province);
      const cityData = provData?.children.find(c => c.name === newLoc.city);
      const distData = cityData?.children.find(d => d.name === value);
      if (distData) {
        newLoc.district = value;
        newLoc.lng = distData.lng;
        newLoc.lat = distData.lat;
      }
    }
    setFormData(prev => ({ ...prev, birthLocation: newLoc }));
    setLocationInput(formatLocationString(newLoc));
  };

  // 处理位置输入框变化
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocationInput(value);

    try {
      const lngMatch = value.match(/经度[:：]\s*(\d+(\.\d+)?)/);
      const latMatch = value.match(/纬度[:：]\s*(\d+(\.\d+)?)/);

      if (lngMatch && latMatch) {
        const lng = parseFloat(lngMatch[1]);
        const lat = parseFloat(latMatch[1]);

        if (!isNaN(lng) && !isNaN(lat)) {
          const regionPart = value.split(/[(\uff08]/)[0].trim();
          const parts = regionPart.split(/\s+/);

          setFormData(prev => {
            const currentLoc = prev.birthLocation || { ...DEFAULT_REGION };
            return {
              ...prev,
              birthLocation: {
                ...currentLoc,
                province: parts[0] || currentLoc.province,
                city: parts[1] || currentLoc.city,
                district: parts[2] || currentLoc.district,
                lng: lng,
                lat: lat
              }
            };
          });
        }
      }
    } catch (err) {
      console.debug('Location parse error:', err);
    }
  };

  // 保存配置
  const handleSave = useCallback(async () => {
    if (!formData.nickname.trim()) {
      showMessage('请输入昵称', 'error');
      return;
    }
  
    if (!formData.birthDate) {
      showMessage('请选择出生日期', 'error');
      return;
    }
  
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 自动为中文姓名打分
    let finalConfigData = { ...formData };
    if (formData.realName && /[一-龥]/.test(formData.realName)) {
      try {
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
        const name = formData.realName.trim();
  
        if (name.includes('·') || name.includes('•')) {
          const parts = name.split(/[·•]/);
          surname = parts[0] || '';
          firstName = parts.slice(1).join('') || '';
        } else {
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
        finalConfigData.nameScore = {
          ...scoreResult,
          mainType: mainMeaning.type
        };
      } catch (e) {
        console.error('自动评分失败:', e);
      }
    }
  
    // 如果没有评分但有真实姓名，保留现有评分
    if (!finalConfigData.nameScore && formData.nameScore) {
      finalConfigData.nameScore = formData.nameScore;
    }
  
    // 计算八字信息
    if (formData.birthDate && formData.birthTime) {
      try {
        const longitude = formData.birthLocation?.lng || 116.40;
        const baziInfo = calculateDetailedBazi(formData.birthDate, formData.birthTime, longitude);
        if (baziInfo) {
          finalConfigData.bazi = baziInfo;
        }
      } catch (error) {
        console.error('八字计算失败:', error);
        // 即使八字计算失败也不影响保存其他信息
      }
    }
  
    // 校验位置信息
    let finalLocation = { ...formData.birthLocation };
  
    try {
      const lngMatch = locationInput.match(/经度[:：]\s*([-+]?\d+(\.\d+)?)/) || locationInput.match(/lng[:：]\s*([-+]?\d+(\.\d+)?)/);
      const latMatch = locationInput.match(/纬度[:：]\s*([-+]?\d+(\.\d+)?)/) || locationInput.match(/lat[:：]\s*([-+]?\d+(\.\d+)?)/);
  
      let parsedLng, parsedLat;
  
      if (lngMatch && latMatch) {
        parsedLng = parseFloat(lngMatch[1]);
        parsedLat = parseFloat(latMatch[1]);
      } else {
        const pairMatch = locationInput.match(/([-+]?\d+(\.\d+)?)[,\s]+([-+]?\d+(\.\d+)?)/);
        if (pairMatch) {
          const v1 = parseFloat(pairMatch[1]);
          const v3 = parseFloat(pairMatch[3]);
          if (Math.abs(v1) > 90) { parsedLng = v1; parsedLat = v3; }
          else if (Math.abs(v3) > 90) { parsedLng = v3; parsedLat = v1; }
          else { parsedLng = v1; parsedLat = v3; }
        }
      }
  
      if (parsedLng !== undefined && parsedLat !== undefined && !isNaN(parsedLng) && !isNaN(parsedLat)) {
        if (parsedLng >= -180 && parsedLng <= 180 && parsedLat >= -90 && parsedLat <= 90) {
          finalLocation.lng = parsedLng;
          finalLocation.lat = parsedLat;
        }
      }
  
      const addressPart = locationInput.split(/[(\uff08]/)[0].trim();
      if (addressPart) {
        const parts = addressPart.split(/\s+/);
        if (parts.length === 3) {
          finalLocation.province = parts[0];
          finalLocation.city = parts[1];
          finalLocation.district = parts[2];
        } else if (parts.length === 2) {
          finalLocation.province = parts[0];
          finalLocation.city = parts[1];
          finalLocation.district = '';
        }
      }
  
      if (finalLocation.lng === undefined || finalLocation.lng === null) {
        finalLocation.lng = 116.40;
        finalLocation.lat = 39.90;
        finalLocation.province = '北京市';
        finalLocation.city = '北京市';
        finalLocation.district = '东城区';
        showMessage('未检测到有效经纬度，已默认设置为北京', 'info');
      }
  
    } catch (e) {
      console.error("Location parse error", e);
      if (!finalLocation.lng) {
        finalLocation = { ...DEFAULT_REGION };
      }
    }
  
    onSave(index, { ...finalConfigData, birthLocation: finalLocation });
    setIsSaving(false);
    onClose();
  }, [formData, index, onSave, showMessage, locationInput, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ touchAction: 'none' }}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">⚙️</span> {isNew ? '新建配置' : '修改配置'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 space-y-6" ref={formRef}>
          {/* 昵称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              昵称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleFieldChange('nickname', e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="用于应用内展示 (必需)"
            />
          </div>

          {/* 真实姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              真实姓名 (选填)
            </label>
            <input
              type="text"
              value={formData.realName || ''}
              onChange={(e) => handleFieldChange('realName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="用于五格评分与八字测算 (可选)"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              注：保存后将自动为中文姓名进行五格评分，无需手动操作。
            </p>
          </div>

          {/* 出生日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              出生日期
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleFieldChange('birthDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 性别 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              性别
            </label>
            <div className="gender-options grid grid-cols-3 gap-2">
              {GENDER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`p-2 rounded-md text-center transition-all duration-200 text-sm font-medium ${formData.gender === option.value
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300 shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  onClick={() => handleFieldChange('gender', option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 出生时间 */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              出生具体时间 (出生时辰)
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <select
                value={(formData.birthTime || '12:30').split(':')[0]}
                onChange={(e) => {
                  const hour = e.target.value;
                  const minute = (formData.birthTime || '12:30').split(':')[1];
                  handleFieldChange('birthTime', `${hour}:${minute}`);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}时
                  </option>
                ))}
              </select>
              <span className="text-gray-500">:</span>
              <select
                value={(formData.birthTime || '12:30').split(':')[1]}
                onChange={(e) => {
                  const minute = e.target.value;
                  const hour = (formData.birthTime || '12:30').split(':')[0];
                  handleFieldChange('birthTime', `${hour}:${minute}`);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="00">00分</option>
                <option value="15">15分</option>
                <option value="30">30分</option>
                <option value="45">45分</option>
              </select>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex justify-between bg-white dark:bg-gray-800 p-2 rounded border border-dashed border-gray-300 dark:border-gray-600">
              <span>时辰：<span className="font-medium text-blue-600 dark:text-blue-400">{calculatedInfo.shichen}</span></span>
              <span>真太阳时：<span className="font-medium text-purple-600 dark:text-purple-400">{calculatedInfo.trueSolarTime}</span></span>
            </div>
          </div>

          {/* 出生地点 */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              出生地点 (用于校准真太阳时)
            </label>

            <div className="mb-3">
              <input
                type="text"
                value={locationInput}
                onChange={handleLocationInputChange}
                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white text-sm"
                placeholder="例如: 北京市 北京市 朝阳区 (经度: 116.48, 纬度: 39.95)"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <select
                value={formData.birthLocation?.province || DEFAULT_REGION.province}
                onChange={(e) => handleRegionChange('province', e.target.value)}
                className="px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {REGION_DATA.map(p => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>

              <select
                value={formData.birthLocation?.city || DEFAULT_REGION.city}
                onChange={(e) => handleRegionChange('city', e.target.value)}
                className="px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {REGION_DATA.find(p => p.name === (formData.birthLocation?.province || DEFAULT_REGION.province))?.children.map(c => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>

              <select
                value={formData.birthLocation?.district || DEFAULT_REGION.district}
                onChange={(e) => handleRegionChange('district', e.target.value)}
                className="px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {REGION_DATA.find(p => p.name === (formData.birthLocation?.province || DEFAULT_REGION.province))
                  ?.children.find(c => c.name === (formData.birthLocation?.city || DEFAULT_REGION.city))
                  ?.children.map(d => (
                    <option key={d.code} value={d.name}>{d.name}</option>
                  ))
                }
              </select>
            </div>
            {formData.birthLocation?.lng && (
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>经度: {formData.birthLocation.lng.toFixed(2)}°</span>
                <span>纬度: {formData.birthLocation.lat.toFixed(2)}°</span>
              </div>
            )}
          </div>

          {/* 星座 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              星座
            </label>
            <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              点击选择您的星座
            </div>
            <div className="selector-grid">
              {ZODIAC_OPTIONS.map((zodiac) => (
                <div
                  key={zodiac}
                  className={`selector-item performance-optimized ${formData.zodiac === zodiac ? 'selected' : ''}`}
                  onClick={() => handleFieldChange('zodiac', zodiac)}
                >
                  <div
                    className={`selector-icon zodiac-sign-icon zodiac-sign-icon-sm zodiac-sign-icon-${zodiac} ${formData.zodiac === zodiac ? 'selected' : ''}`}
                    data-symbol=""
                  ></div>
                  <span className="selector-label">{zodiac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 生肖 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              生肖
            </label>
            <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              点击选择您的生肖
            </div>
            <div className="selector-grid">
              {ZODIAC_ANIMAL_OPTIONS.map((animal) => (
                <div
                  key={animal}
                  className={`selector-item performance-optimized ${formData.zodiacAnimal === animal ? 'selected' : ''}`}
                  onClick={() => handleFieldChange('zodiacAnimal', animal)}
                >
                  <div
                    className={`selector-icon zodiac-icon zodiac-icon-sm zodiac-icon-${animal} ${formData.zodiacAnimal === animal ? 'selected' : ''}`}
                  ></div>
                  <span className="selector-label">{animal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MBTI类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              MBTI类型
            </label>
            <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              点击选择您的MBTI类型
            </div>
            <div className="selector-grid">
              {MBTI_OPTIONS.map((type) => (
                <div
                  key={type}
                  className={`selector-item performance-optimized ${formData.mbti === type ? 'selected' : ''}`}
                  onClick={() => handleFieldChange('mbti', type)}
                >
                  <div
                    className={`selector-icon mbti-icon mbti-icon-sm mbti-icon-${type} ${formData.mbti === type ? 'selected' : ''}`}
                    data-type={type}
                  ></div>
                  <span className="selector-label">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2 bg-white dark:bg-gray-800">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving || (!formData.nickname || !formData.birthDate)}>
            {isSaving ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// 配置列表项组件
const ConfigForm = ({ config, index, isActive, onEdit, onDelete, onSetActive }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`border rounded-lg overflow-hidden transition-shadow duration-200 performance-optimized ${isActive ? 'border-blue-500 dark:border-blue-400 shadow-md' : 'border-gray-200 dark:border-gray-700'
      }`}>
      {/* 标题区域 */}
      <div
        className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isActive && (
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
            <h3 className="font-medium text-gray-900 dark:text-white">
              {config.nickname || `配置 ${index + 1}`}
            </h3>
            {config.realName && (
              <div className="flex items-center ml-2 space-x-2">
                <span className="text-gray-500 text-xs">|</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{config.realName}</span>
                {config?.nameScore && (
                  <span className={`px-2 py-0.5 text-xs rounded font-bold ${config.nameScore.mainType === '吉' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    config.nameScore.mainType === '半吉' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {config.nameScore.mainType}
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
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
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

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2 mt-4">
            {!isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetActive(index)}
              >
                设为默认
              </Button>
            )}
            {onEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onEdit(index)}
              >
                编辑
              </Button>
            )}
            {index > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(index)}
              >
                删除
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

  // 验证姓名评分结果是否有效
  const isValidNameScore = (score) => {
    if (!score) return false;
    // 检查是否包含必要的五格评分字段
    return score.tian !== undefined &&
           score.ren !== undefined &&
           score.di !== undefined &&
           score.wai !== undefined &&
           score.zong !== undefined;
  };

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
    // 3秒后自动清除消息
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  }, []);

  // 处理配置保存
  const handleSaveConfig = useCallback((index, configData) => {
    // 检查是否是新建配置（检查存储中是否存在）
    const storedConfigs = userConfigManager.getAllConfigs();
    const isNewConfig = index >= storedConfigs.length;
  
    // 自动为中文姓名打分
    let finalConfigData = { ...configData };
    if (configData.realName && /[一-龥]/.test(configData.realName)) {
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
        finalConfigData.nameScore = {
          ...scoreResult,
          mainType: mainMeaning.type
        };
      } catch (e) {
        console.error('自动评分失败:', e);
        // 失败时不中断保存流程
      }
    }
  
    // 如果评分结果无效，重新计算评分
    if (finalConfigData.nameScore && !isValidNameScore(finalConfigData.nameScore)) {
      console.warn('检测到无效的姓名评分数据，正在重新计算...');
      if (finalConfigData.realName && /[一-龥]/.test(finalConfigData.realName)) {
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
  
          // 重新计算五格评分
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
          finalConfigData.nameScore = {
            ...scoreResult,
            mainType: mainMeaning.type
          };
        } catch (e) {
          console.error('重新计算评分失败:', e);
        }
      }
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
  
    let success;
    if (isNewConfig) {
      // 新建配置，添加到存储
      success = userConfigManager.addConfig(finalConfigData);
    } else {
      // 现有配置，更新存储
      success = userConfigManager.updateConfig(index, finalConfigData);
    }
  
    if (success) {
      // 立即从userConfigManager重新加载所有配置，确保数据同步
      const freshConfigs = userConfigManager.getAllConfigs();
      setConfigs([...freshConfigs]);
  
      // 如果是新建配置，设置为活跃配置
      if (isNewConfig) {
        setActiveConfigIndex(index);
        userConfigManager.setActiveConfig(index);
      }
  
      // 强制重新加载所有组件，确保数据同步
      setTimeout(() => {
        userConfigManager.forceReloadAll();
      }, 100);
      showMessage('保存配置成功', 'success');
  
      // 保存成功后折叠面板
      setExpandedIndex(-1);
    } else {
      showMessage('保存配置失败，请重试', 'error');
    }
  }, [showMessage, isValidNameScore]);

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

    // 检查是否是新建配置（检查存储中是否存在）
    const storedConfigs = userConfigManager.getAllConfigs();
    const isNewConfig = index >= storedConfigs.length;

    // 使用自定义确认对话框替代window.confirm
    if (window.confirm('确定要删除这个配置吗？')) {
      let success;
      if (isNewConfig) {
        // 新建配置，只需从本地状态移除
        setConfigs(prev => prev.filter((_, i) => i !== index));
        // 调整展开索引
        setExpandedIndex(prev => Math.max(0, Math.min(prev, configs.length - 2)));
        showMessage('删除配置成功', 'success');
        return;
      } else {
        // 存储中的配置，需要从存储中移除
        success = userConfigManager.removeConfig(index);
        if (success) {
          // 更新本地状态
          setConfigs(prev => prev.filter((_, i) => i !== index));
          // 调整展开索引
          setExpandedIndex(prev => Math.max(0, Math.min(prev, configs.length - 2)));
          showMessage('删除配置成功', 'success');
        } else {
          showMessage('删除配置失败，请重试', 'error');
        }
      }
    }
  }, [configs.length, showMessage]);

  // 处理编辑配置
  const handleEditConfig = useCallback((index) => {
    setEditingConfigIndex(index);
    setIsEditModalOpen(true);
  }, []);

  // 优化处理设置活跃配置 - 异步切换避免卡顿
  const handleSetActiveConfig = useCallback(async (index) => {
    if (isSwitching) return;

    try {
      setIsSwitching(true);
      setError(null);

      // 显示切换状态
      setActiveConfigIndex(index);

      // 异步设置活跃配置
      await new Promise(resolve => setTimeout(resolve, 50));
      const success = userConfigManager.setActiveConfig(index);

      if (success) {
        // 异步强制重新加载所有组件，确保新配置生效
        setTimeout(() => {
          userConfigManager.forceReloadAll();
        }, 200);

        // 延迟更新状态，确保UI流畅
        setTimeout(() => {
          setIsSwitching(false);
        }, 300);
      } else {
        throw new Error('设置当前配置失败');
      }
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
              // 重新加载配置
              const freshConfigs = userConfigManager.getAllConfigs();
              const activeIndex = userConfigManager.getActiveConfigIndex();
              setConfigs([...freshConfigs]);
              setActiveConfigIndex(activeIndex);
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
          <p className={`${message.type === 'error' ? 'text-red-700 dark:text-red-300' : message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>
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
              {configs[activeConfigIndex].realName && (
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">真实姓名：</span>
                  <span className="ml-2 font-bold text-gray-900 dark:text-white">{configs[activeConfigIndex].realName}</span>
                  {configs[activeConfigIndex]?.nameScore && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded font-bold ${configs[activeConfigIndex].nameScore.mainType === '吉' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      configs[activeConfigIndex].nameScore.mainType === '半吉' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {configs[activeConfigIndex].nameScore.mainType}
                    </span>
                  )}
                  {/[一-龥]/.test(configs[activeConfigIndex].realName) && (
                    <button
                      className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-800/50 transition-colors"
                      onClick={() => {
                        // 传递当前配置索引以加载缓存的评分
                        setTempScoringConfigIndex(activeConfigIndex);
                        setIsTempScoringOpen(true);
                      }}
                    >
                      查看评分
                    </button>
                  )}
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
      <NameScoringModal
        isOpen={isTempScoringOpen}
        onClose={() => {
          setIsTempScoringOpen(false);
          setTempScoringConfigIndex(null); // 关闭时重置配置索引
        }}
        name={configs[tempScoringConfigIndex]?.realName || ''}
        isPersonal={tempScoringConfigIndex !== null}
        existingScore={configs[tempScoringConfigIndex]?.nameScore || null}
        configIndex={tempScoringConfigIndex}
        onSaveScore={(score) => {
          // 保存评分到配置
          if (tempScoringConfigIndex !== null) {
            const updatedConfig = { ...configs[tempScoringConfigIndex], nameScore: score };
            handleSaveConfig(tempScoringConfigIndex, updatedConfig);
          }
        }}
        showMessage={showMessage}
        isValidNameScore={isValidNameScore}
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
        onSave={(index, configData) => {
          handleSaveConfig(index, configData);
          setIsEditModalOpen(false);
          setEditingConfigIndex(null);
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
          />
        ))}
      </div>


    </div>
  );
};

export default UserConfigManagerComponent;