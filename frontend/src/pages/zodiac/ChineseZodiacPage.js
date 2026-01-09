import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useUserConfig } from '../../contexts/UserConfigContext';
import { generateDailyHoroscope } from '../../utils/horoscopeAlgorithm';
import { Line } from 'react-chartjs-2';
import { ensureChartRegistered } from '../../utils/chartConfig';

/**
 * 十二生肖数据
 */
const CHINESE_ZODIAC_DATA = [
  {
    name: '鼠',
    icon: '🐭',
    yearRange: '2008, 1996, 1984, 1972',
    element: '水',
    traits: ['聪明机灵', '反应敏捷', '善于交际'],
    strengths: ['机智灵活', '适应力强', '善于理财'],
    weaknesses: ['有时优柔寡断', '过于谨慎'],
    luckyColor: '蓝色、金色',
    luckyNumber: [1, 4, 9],
    compatible: ['牛', '龙', '猴'],
    description: '鼠年出生的人机智聪明，反应敏捷，善于交际。他们适应能力强，理财有方，但有时会过于谨慎。'
  },
  {
    name: '牛',
    icon: '🐮',
    yearRange: '2009, 1997, 1985, 1973',
    element: '土',
    traits: ['稳重踏实', '勤奋努力', '诚实可靠'],
    strengths: ['稳重可靠', '勤奋努力', '有耐心'],
    weaknesses: ['固执己见', '不善表达'],
    luckyColor: '黄色、绿色',
    luckyNumber: [2, 5, 8],
    compatible: ['鼠', '蛇', '鸡'],
    description: '牛年出生的人稳重踏实，勤奋努力，诚实可靠。他们做事认真，有耐心，但有时会固执己见。'
  },
  {
    name: '虎',
    icon: '🐯',
    yearRange: '2010, 1998, 1986, 1974',
    element: '木',
    traits: ['勇敢无畏', '热情豪爽', '富有冒险精神'],
    strengths: ['勇敢自信', '热情豪爽', '有领导力'],
    weaknesses: ['脾气急躁', '冲动鲁莽'],
    luckyColor: '蓝色、橙色',
    luckyNumber: [1, 3, 9],
    compatible: ['马', '狗', '猪'],
    description: '虎年出生的人勇敢无畏，热情豪爽，富有冒险精神。他们天生有领导力，但有时会冲动鲁莽。'
  },
  {
    name: '兔',
    icon: '🐰',
    yearRange: '2011, 1999, 1987, 1975',
    element: '木',
    traits: ['温和善良', '聪明谨慎', '善于观察'],
    strengths: ['温和友善', '聪明机智', '善于沟通'],
    weaknesses: ['过于敏感', '优柔寡断'],
    luckyColor: '粉色、紫色',
    luckyNumber: [3, 4, 9],
    compatible: ['羊', '猴', '猪'],
    description: '兔年出生的人温和善良，聪明谨慎，善于观察。他们善于沟通，但有时过于敏感。'
  },
  {
    name: '龙',
    icon: '🐲',
    yearRange: '2012, 2000, 1988, 1976',
    element: '土',
    traits: ['气宇轩昂', '自信满满', '富有创造力'],
    strengths: ['自信豪爽', '有创造力', '天生的领导者'],
    weaknesses: ['过于自负', '不易接受意见'],
    luckyColor: '金色、银色',
    luckyNumber: [1, 6, 7],
    compatible: ['鼠', '猴', '鸡'],
    description: '龙年出生的人气宇轩昂，自信满满，富有创造力。他们是天生的领导者，但有时会过于自负。'
  },
  {
    name: '蛇',
    icon: '🐍',
    yearRange: '2013, 2001, 1989, 1977',
    element: '火',
    traits: ['冷静理智', '敏锐洞察', '善于思考'],
    strengths: ['冷静睿智', '观察敏锐', '理财有道'],
    weaknesses: ['多疑敏感', '不易信任他人'],
    luckyColor: '黑色、红色',
    luckyNumber: [2, 8, 9],
    compatible: ['牛', '鸡'],
    description: '蛇年出生的人冷静理智，敏锐洞察，善于思考。他们观察敏锐，理财有道，但有时会多疑敏感。'
  },
  {
    name: '马',
    icon: '🐴',
    yearRange: '2014, 2002, 1990, 1978',
    element: '火',
    traits: ['热情奔放', '积极乐观', '充满活力'],
    strengths: ['热情开朗', '积极进取', '善于表达'],
    weaknesses: ['急躁易怒', '缺乏耐心'],
    luckyColor: '红色、紫色',
    luckyNumber: [2, 3, 7],
    compatible: ['虎', '羊', '狗'],
    description: '马年出生的人热情奔放，积极乐观，充满活力。他们善于表达，积极进取，但有时会急躁易怒。'
  },
  {
    name: '羊',
    icon: '🐑',
    yearRange: '2015, 2003, 1991, 1979',
    element: '土',
    traits: ['温柔善良', '富有同情心', '追求和平'],
    strengths: ['温柔体贴', '富有同情心', '艺术天赋'],
    weaknesses: ['过于敏感', '缺乏自信'],
    luckyColor: '绿色、棕色',
    luckyNumber: [2, 7],
    compatible: ['兔', '马', '猪'],
    description: '羊年出生的人温柔善良，富有同情心，追求和平。他们有艺术天赋，但有时会缺乏自信。'
  },
  {
    name: '猴',
    icon: '🐵',
    yearRange: '2016, 2004, 1992, 1980',
    element: '金',
    traits: ['聪明机灵', '活泼好动', '善于交际'],
    strengths: ['聪明机智', '活泼开朗', '适应力强'],
    weaknesses: ['注意力分散', '不够专注'],
    luckyColor: '白色、金色',
    luckyNumber: [1, 7, 8],
    compatible: ['鼠', '龙'],
    description: '猴年出生的人聪明机灵，活泼好动，善于交际。他们适应力强，但有时会注意力分散。'
  },
  {
    name: '鸡',
    icon: '🐔',
    yearRange: '2017, 2005, 1993, 1981',
    element: '金',
    traits: ['勤奋努力', '认真负责', '善于理财'],
    strengths: ['勤奋认真', '有责任心', '善于规划'],
    weaknesses: ['过于挑剔', '爱钻牛角尖'],
    luckyColor: '黄色、棕色',
    luckyNumber: [5, 7, 8],
    compatible: ['龙', '蛇', '牛'],
    description: '鸡年出生的人勤奋努力，认真负责，善于理财。他们有责任心，善于规划，但有时会过于挑剔。'
  },
  {
    name: '狗',
    icon: '🐶',
    yearRange: '2018, 2006, 1994, 1982',
    element: '土',
    traits: ['忠诚正直', '勤奋可靠', '富有正义感'],
    strengths: ['忠诚可靠', '正直诚实', '有责任心'],
    weaknesses: ['过于敏感', '不易敞开心扉'],
    luckyColor: '红色、绿色',
    luckyNumber: [3, 4, 9],
    compatible: ['虎', '马', '兔'],
    description: '狗年出生的人忠诚正直，勤奋可靠，富有正义感。他们有责任心，但有时不易敞开心扉。'
  },
  {
    name: '猪',
    icon: '🐷',
    yearRange: '2019, 2007, 1995, 1983',
    element: '水',
    traits: ['善良真诚', '豁达大方', '富有同情心'],
    strengths: ['善良豁达', '诚实可靠', '知足常乐'],
    weaknesses: ['过于轻信', '缺乏主见'],
    luckyColor: '黄色、灰色',
    luckyNumber: [2, 5, 8],
    compatible: ['兔', '羊', '虎'],
    description: '猪年出生的人善良真诚，豁达大方，富有同情心。他们诚实可靠，知足常乐，但有时会缺乏主见。'
  }
];

// 五行元素数据
const WUXING_ELEMENTS = [
  {
    name: '木',
    color: '#11998e',
    bgGradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    icon: '🌳',
    traits: '生长、向上',
    quickBoost: {
      method: '绿植触碰法',
      description: '触摸家中植物叶片3分钟，同步默念"生长""向上"等词汇，唤醒肝胆经络',
      secondMethod: '窗口深呼吸',
      secondDescription: '面向东方开窗，做7次深长呼吸（吸气4秒→屏息2秒→呼气6秒），想象吸入草木清气'
    },
    exercise: '瑜伽树式、太极拳，疏肝理气，增强身体柔韧性',
    timeSlot: '卯时（5-7点）',
    breathingMethod: '清凉呼吸法，清肺排浊，缓解春困秋燥'
  },
  {
    name: '火',
    color: '#fc4a1a',
    bgGradient: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
    icon: '🔥',
    traits: '温热、向上',
    quickBoost: {
      method: '晒太阳法',
      description: '早晨或傍晚面朝南方站立10分钟，双手自然下垂，想象阳光从头顶注入全身',
      secondMethod: '厨房疗愈',
      secondDescription: '快速煮一杯红茶或姜茶，双手捧杯感受热量，小口啜饮并深呼吸'
    },
    exercise: '八段锦"摇头摆尾去心火"，增强心脏功能',
    timeSlot: '午时（11-13点）',
    breathingMethod: '蜂鸣调息法，降心火，缓解焦虑失眠'
  },
  {
    name: '土',
    color: '#f7b733',
    bgGradient: 'linear-gradient(135deg, #f7b733 0%, #fc4a1a 100%)',
    icon: '⛰',
    traits: '承载、中和',
    quickBoost: {
      method: '赤脚接地法',
      description: '脱鞋赤脚踩草地/地板10分钟，想象体内浊气从脚底排出（无户外条件可手捧一碗生米静坐）',
      secondMethod: '黄色食物咀嚼',
      secondDescription: '缓慢食用一小块南瓜或地瓜，专注感受甘甜味道，同步按压足三里穴'
    },
    exercise: '站桩、腹部按摩，健脾和胃，增强消化吸收功能',
    timeSlot: '亥时（21-23点）',
    breathingMethod: '乌加依呼吸，固肾强腰，促进肾经流动'
  },
  {
    name: '金',
    color: '#667db6',
    bgGradient: 'linear-gradient(135deg, #667db6 0%, #0082c8 100%)',
    icon: '⚙️',
    traits: '收敛、肃杀',
    quickBoost: {
      method: '金属摩擦法',
      description: '用钥匙或硬币快速摩擦手掌外侧（肺经区域）2分钟，刺激魄力相关穴位',
      secondMethod: '断舍离速行',
      secondDescription: '10分钟内清理手机相册/桌面3件冗余物品，通过"舍弃"行为强化决策能量'
    },
    exercise: '扩胸运动、太极拳云手，增强肺活量，改善呼吸功能',
    timeSlot: '卯时（5-7点）',
    breathingMethod: '清凉呼吸法，清肺排浊，缓解春困秋燥'
  },
  {
    name: '水',
    color: '#2193b0',
    bgGradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    icon: '💧',
    traits: '滋润、向下',
    quickBoost: {
      method: '冷水敷腕法',
      description: '用冷水浸湿毛巾敷于手腕内侧（神门穴）5分钟，同步听流水声白噪音',
      secondMethod: '黑色食物速食',
      secondDescription: '咀嚼5颗黑芝麻丸或饮用黑豆豆浆，专注感受食物质地'
    },
    exercise: '深蹲、腰部旋转，固肾强腰，改善生殖系统功能',
    timeSlot: '亥时（21-23点）',
    breathingMethod: '乌加依呼吸，固肾强腰，促进肾经流动'
  }
];

/**
 * 根据出生年份计算生肖
 */
const getChineseZodiac = (year) => {
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const index = (year - 4) % 12;
  return zodiacs[index >= 0 ? index : index + 12];
};

const ChineseZodiacPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();

  // 注册 Chart.js 组件
  useEffect(() => {
    ensureChartRegistered();
  }, []);

  // 从用户配置中获取生肖
  const [userZodiac, setUserZodiac] = useState(() => {
    if (currentConfig?.birthDate) {
      const year = new Date(currentConfig.birthDate).getFullYear();
      return getChineseZodiac(year);
    }
    return '鼠'; // 默认生肖
  });

  // 计算能量匹配度
  const energyMatch = useMemo(() => {
    if (!userZodiac) return null;

    // 根据生肖确定用户五行
    const zodiacElementMap = {
      '鼠': '水', '牛': '土', '虎': '木', '兔': '木',
      '龙': '土', '蛇': '火', '马': '火', '羊': '土',
      '猴': '金', '鸡': '金', '狗': '土', '猪': '水'
    };

    const userElement = zodiacElementMap[userZodiac] || '土';
    const userElementData = WUXING_ELEMENTS.find(el => el.name === userElement);

    // 计算当日五行（使用当前日期）
    const today = new Date();
    const seed = today.getDate() + today.getMonth() * 31 + today.getFullYear() * 372;
    const elementIndex = Math.abs(seed) % WUXING_ELEMENTS.length;
    const todayElement = WUXING_ELEMENTS[elementIndex];

    // 计算匹配度
    let matchScore = 50;
    let relation = '中性';

    if (userElement === todayElement.name) {
      matchScore = 85;
      relation = '本日';
    } else {
      // 五行相生相克关系
      const generateMap = {
        '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
      };
      const overcomeMap = {
        '木': '土', '土': '水', '水': '火', '火': '金', '金': '木'
      };

      if (generateMap[userElement] === todayElement.name) {
        matchScore = 75;
        relation = '相生';
      } else if (overcomeMap[userElement] === todayElement.name) {
        matchScore = 35;
        relation = '相克';
      } else if (generateMap[todayElement.name] === userElement) {
        matchScore = 65;
        relation = '被生';
      } else {
        matchScore = 45;
        relation = '被克';
      }
    }

    return {
      匹配度: matchScore,
      关系: relation,
      描述: `您的${userElement}属性与今日${todayElement.name}能量${relation}`,
      用户五行: userElement,
      当日五行: todayElement.name,
      todayElementData: todayElement
    };
  }, [userZodiac]);

  // 颜色名称到十六进制值的映射
  const getColorHex = (colorName) => {
    const colorMap = {
      '蓝色': '#4A90E2',
      '金色': '#FFD700',
      '黄色': '#FFC107',
      '绿色': '#4CAF50',
      '橙色': '#FF9800',
      '粉色': '#E91E63',
      '紫色': '#9C27B0',
      '红色': '#FF5252',
      '黑色': '#212121',
      '白色': '#FFFFFF',
      '灰色': '#9E9E9E',
      '青绿': '#26A69A',
      '浅蓝': '#64B3F4',
      '浅绿': '#81C784',
      '淡黄': '#FFEAA7',
      '兰紫': '#DA70D6',
      '深紫': '#8A2BE2',
      '品红': '#FF00FF',
      '青色': '#00FFFF',
      '正红色': '#FF0000',
      '魅力红': '#FF6B6B'
    };
    return colorMap[colorName] || '#4A90E2'; // 默认返回蓝色
  };

  // 解析幸运颜色字符串，返回颜色名称数组
  const parseLuckyColors = (colorString) => {
    if (!colorString) return ['蓝色', '金色'];
    // 处理中文分隔符：、和，
    return colorString.split(/[、，]/).map(color => color.trim()).filter(color => color);
  };

  // 日期状态（用于趋势图）
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 近7日能量趋势数据
  const weeklyData = useMemo(() => {
    if (!userZodiac) return { dates: [], energyScores: [], wealthScores: [], careerScores: [] };

    const dates = [];
    const energyScores = [];
    const wealthScores = [];
    const careerScores = [];

    // 使用生肖和日期作为种子
    const seedBase = userZodiac.charCodeAt(0);
    // 使用单一Date对象并修改其值，减少对象创建
    const baseDate = new Date(selectedDate);

    for (let i = 6; i >= 0; i--) {
      // 复制日期而不是每次创建新对象
      const date = new Date(baseDate);
      date.setDate(date.getDate() - i);
      dates.push(`${date.getMonth() + 1}/${date.getDate()}`);

      // 基础能量分数（基于生肖和日期偏移量计算，确保结果固定）
      const daySeed = date.getDate() + date.getMonth() * 31;
      const baseScore = 50 + (seedBase % 20);
      const dayFactor = (date.getDay() + 1) * 3;
      // 使用确定性算法代替随机数
      const deterministicVariation = ((seedBase * daySeed) % 20) - 10;
      const energyScore = Math.max(20, Math.min(95, baseScore + dayFactor + deterministicVariation));

      // 财运分数（基于能量分数但有一定偏差，也是确定性的）
      const wealthVariation = ((seedBase * daySeed * 2) % 25) - 12;
      const wealthScore = Math.max(15, Math.min(90, energyScore + wealthVariation));

      // 事业分数（基于能量分数但有一定偏差，也是确定性的）
      const careerVariation = ((seedBase * daySeed * 3) % 30) - 15;
      const careerScore = Math.max(10, Math.min(85, energyScore + careerVariation));

      energyScores.push(energyScore);
      wealthScores.push(wealthScore);
      careerScores.push(careerScore);
    }

    return { dates, energyScores, wealthScores, careerScores };
  }, [userZodiac, selectedDate]);

  // 运势数据状态
  const [horoscopeData, setHoroscopeData] = useState(null);
  const [loadingHoroscope, setLoadingHoroscope] = useState(false);

  // 获取当前生肖数据
  const zodiacData = CHINESE_ZODIAC_DATA.find(z => z.name === userZodiac);

  // 生成每日运势数据
  const generateDailyHoroscopeData = useCallback(async () => {
    if (!userZodiac) return;

    setLoadingHoroscope(true);
    try {
      // 生肖对应的星座映射（简化版）
      const zodiacToHoroscope = {
        '鼠': '双子座', '牛': '金牛座', '虎': '白羊座', '兔': '巨蟹座',
        '龙': '狮子座', '蛇': '天蝎座', '马': '射手座', '羊': '摩羯座',
        '猴': '水瓶座', '鸡': '处女座', '狗': '天秤座', '猪': '双鱼座'
      };

      const horoscopeName = zodiacToHoroscope[userZodiac] || '金牛座';
      const data = generateDailyHoroscope(horoscopeName);
      setHoroscopeData(data);
    } catch (error) {
      console.error('生成生肖运势数据失败:', error);
      // 设置默认运势数据
      setHoroscopeData({
        overallScore: 70,
        overallDescription: '今日运势平稳，保持积极心态会有不错的发展。',
        dailyForecast: {
          love: { score: 65, description: '良好', trend: '上升' },
          wealth: { score: 70, description: '良好', trend: '平稳' },
          career: { score: 75, description: '良好', trend: '上升' },
          study: { score: 70, description: '良好', trend: '上升' },
          social: { score: 68, description: '良好', trend: '平稳' }
        },
        recommendations: {
          luckyColorNames: ['蓝色', '绿色'],
          luckyNumbers: [3, 7, 9],
          compatibleSigns: ['白羊座', '狮子座', '射手座'],
          positiveAdvice: '保持积极心态，主动出击',
          avoidAdvice: '避免冲动行事',
          dailyReminder: '今天会是充满机遇的一天'
        }
      });
    } finally {
      setLoadingHoroscope(false);
    }
  }, [userZodiac]);

  // 当生肖变化时，重新生成运势数据
  useEffect(() => {
    if (userZodiac) {
      generateDailyHoroscopeData();
    }
  }, [userZodiac, generateDailyHoroscopeData]);

  // 获取元素颜色
  const getElementColor = (element) => {
    const colors = {
      '水': { text: 'text-blue-600 dark:text-blue-400', bg: 'from-blue-500', to: 'to-cyan-500' },
      '木': { text: 'text-green-600 dark:text-green-400', bg: 'from-green-500', to: 'to-emerald-500' },
      '火': { text: 'text-red-600 dark:text-red-400', bg: 'from-red-500', to: 'to-orange-500' },
      '土': { text: 'text-yellow-600 dark:text-yellow-400', bg: 'from-yellow-500', to: 'to-amber-500' },
      '金': { text: 'text-gray-600 dark:text-gray-400', bg: 'from-gray-500', to: 'to-slate-500' }
    };
    return colors[element] || { text: 'text-gray-600 dark:text-gray-100', bg: 'from-gray-500', to: 'to-gray-600' };
  };

  const elementColors = zodiacData ? getElementColor(zodiacData.element) : getElementColor('水');

  // 渲染能量趋势图
  const renderEnergyTrendChart = useCallback(() => {
    if (!userZodiac) return null;

    const { dates, energyScores, wealthScores, careerScores } = weeklyData;

    // 图表配置 - 仅依赖theme和数据
    const chartData = {
      labels: dates,
      datasets: [
        {
          label: '能量指数',
          data: energyScores,
          borderColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
          backgroundColor: theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.4,
        },
        {
          label: '财运趋势',
          data: wealthScores,
          borderColor: theme === 'dark' ? '#f59e0b' : '#f59e0b',
          backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: theme === 'dark' ? '#f59e0b' : '#f59e0b',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderDash: [5, 5],
          tension: 0.3,
        },
        {
          label: '事业趋势',
          data: careerScores,
          borderColor: theme === 'dark' ? '#10b981' : '#10b981',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointBackgroundColor: theme === 'dark' ? '#10b981' : '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: theme === 'dark' || window.innerWidth <= 768 ? 0 : 300 // 移动端禁用动画提升性能
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: theme === 'dark' ? '#d1d5db' : '#374151',
            font: {
              size: 11,
              weight: '500',
            },
            padding: 10,
            usePointStyle: true,
          }
        },
        tooltip: {
          enabled: window.innerWidth > 768, // 仅在桌面设备启用tooltip
          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
          titleColor: theme === 'dark' ? '#f3f4f6' : '#1f2937',
          bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
          borderWidth: 1,
          padding: 8,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += context.parsed.y + '%';
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            font: {
              size: 10,
            }
          }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)',
            drawBorder: false,
          },
          ticks: {
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            font: {
              size: 10,
            },
            callback: function (value) {
              return value + '%';
            }
          }
        }
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
          <svg className="w-5 h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          近7日能量趋势分析
        </h3>
        <div className="h-64 md:h-72">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-1 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <div className="text-blue-600 dark:text-blue-400 text-xs font-medium">能量指数</div>
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {energyScores[energyScores.length - 1]}%
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
            <div className="text-amber-600 dark:text-amber-400 text-xs font-medium">财运趋势</div>
            <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {wealthScores[wealthScores.length - 1]}%
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 p-2 rounded-lg border border-green-100 dark:border-green-900/30">
            <div className="text-green-600 dark:text-green-300 text-xs font-medium">事业趋势</div>
            <div className="text-sm font-medium text-green-700 dark:text-green-300">
              {careerScores[careerScores.length - 1]}%
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400 dark:text-gray-100 text-center italic">
          注：数据基于个人生肖属性与当日五行气场精密计算得出
        </div>
      </div>
    );
  }, [weeklyData, theme]);

  // 渲染能量匹配度仪表板
  const renderEnergyMatchDashboard = () => {
    if (!energyMatch) return null;

    const { 匹配度, 关系, 描述, 用户五行, 当日五行 } = energyMatch;
    const elementData = WUXING_ELEMENTS.find(el => el.name === 当日五行);

    // 根据匹配度设置颜色
    let colorClass = 'text-green-500';
    if (匹配度 < 40) colorClass = 'text-red-500';
    else if (匹配度 < 70) colorClass = 'text-yellow-500';

    // 根据主题设置SVG背景色
    const bgColor = theme === 'dark' ? '#374151' : '#e5e7eb';
    const textColor = theme === 'dark' ? '#ffffff' : '#1f2937';

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
          <svg className="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          能量匹配度
        </h3>
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={bgColor}
                strokeWidth="2.5"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={匹配度 < 40 ? '#ef4444' : 匹配度 < 70 ? '#f59e0b' : '#10b981'}
                strokeWidth="2.5"
                strokeDasharray={`${匹配度}, 100`}
              />
              <text x="18" y="20.5" textAnchor="middle" className="text-sm font-bold" fill={textColor}>
                {匹配度}%
              </text>
            </svg>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-2">{elementData?.icon}</span>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">能量匹配度</h3>
            </div>
            <p className={`text-xl font-bold ${colorClass} mb-2`}>
              {关系} - {匹配度}%
            </p>
            <p className="text-gray-600 dark:text-gray-100 text-sm mb-3">{描述}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                用户五行: <span className="font-semibold">{用户五行}</span>
              </span>
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                当日五行: <span className="font-semibold">{当日五行}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!zodiacData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">生肖数据加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme}`}>
      {/* 顶部标题栏 - 固定高度适配移动设备 */}
      <div className={`bg-gradient-to-r ${elementColors.bg} ${elementColors.to} text-white sticky top-0 z-40 shadow-lg`} style={{ height: '60px' }}>
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="relative flex items-center justify-between w-full h-full">
            <button
              onClick={() => navigate(-1)}
              className="relative z-10 text-white hover:text-white/90 flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <h1 className="absolute inset-0 flex items-center justify-center text-lg font-bold pointer-events-none">生肖运势</h1>
            <button
              onClick={() => navigate('/user-config')}
              className="relative z-10 text-white hover:text-white/90 ml-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 - 优化移动端间距 */}
      <div className="container mx-auto px-2 py-4 pb-16 max-w-4xl">
        {/* 生肖卡片 */}
        <div className={`bg-gradient-to-br ${elementColors.bg} ${elementColors.to} text-white rounded-xl shadow-lg p-4 mb-4`}>
          <div className="text-center mb-3">
            <div className="text-6xl mb-2">{zodiacData.icon}</div>
            <h2 className="text-2xl font-bold mb-1">您的生肖：{zodiacData.name}</h2>
            <div className="text-base opacity-90">
              属{zodiacData.element}
            </div>
          </div>
        </div>

        {/* 详细描述 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">📖</span> 生肖概述
          </h3>
          <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
            {zodiacData.description}
          </p>
          <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            出生年份：{zodiacData.yearRange}
          </div>
        </div>

        {/* 个性特质 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="mr-2">🌟</span> 性格特征
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {zodiacData.traits.map((trait, index) => (
              <div key={index} className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                <span className="text-gray-700 dark:text-gray-200 text-sm">{trait}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 优点与缺点 */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {/* 优点 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <h3 className="text-lg font-bold text-green-600 dark:text-green-400 mb-3 flex items-center">
              <span className="mr-2">✨</span> 优点
            </h3>
            <div className="space-y-2">
              {zodiacData.strengths.map((strength, index) => (
                <div key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span className="text-gray-700 dark:text-gray-200 text-sm">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 需注意 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-3 flex items-center">
              <span className="mr-2">⚠️</span> 需注意
            </h3>
            <div className="space-y-2">
              {zodiacData.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span className="text-gray-700 dark:text-gray-200 text-sm">{weakness}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 幸运信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center">
            <span className="mr-2">🍀</span> 幸运信息
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="text-gray-600 dark:text-gray-400 text-xs mb-1.5">幸运色</div>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {parseLuckyColors(zodiacData.luckyColor).map((colorName, index) => {
                  const colorHex = getColorHex(colorName);
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 mb-0.5"
                        style={{ backgroundColor: colorHex }}
                        title={colorName}
                        aria-label={`幸运色: ${colorName}`}
                      />
                      <div className="text-[9px] text-gray-600 dark:text-gray-400 truncate max-w-[40px]">
                        {colorName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="text-gray-600 dark:text-gray-400 text-xs mb-2">幸运数字</div>
              <div className="flex flex-wrap justify-center gap-1">
                {zodiacData.luckyNumber.map((num, index) => (
                  <span key={index} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full text-lg font-bold text-purple-600 dark:text-purple-400">
                    {num}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="text-gray-600 dark:text-gray-400 text-xs mb-2">速配生肖</div>
              <div className="flex flex-wrap justify-center gap-1">
                {zodiacData.compatible.map((sign, index) => (
                  <span key={index} className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-200">
                    {sign}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 能量趋势分析 */}
        {renderEnergyTrendChart()}

        {/* 能量匹配度 */}
        {renderEnergyMatchDashboard()}

        {/* 今日运势卡片 */}
        {loadingHoroscope ? (
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <span className="ml-3">运势数据加载中...</span>
            </div>
          </div>
        ) : horoscopeData ? (
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">✨</span> 生肖今日运势
            </h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-semibold">综合运势指数</span>
                <span className="text-2xl font-bold">{horoscopeData.overallScore}分</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full"
                  style={{ width: `${horoscopeData.overallScore}%` }}
                ></div>
              </div>
            </div>

            <p className="mb-4 text-blue-100">{horoscopeData.overallDescription}</p>

            {/* 各领域运势 */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 w-full">
              {Object.entries(horoscopeData.dailyForecast || {}).map(([key, data]) => (
                <div key={key} className="text-center p-1 bg-white/10 rounded-lg min-w-0 overflow-hidden">
                  <div className="text-[10px] text-green-200 mb-0.5 whitespace-nowrap">
                    {key === 'love' ? '爱情' :
                      key === 'wealth' ? '财运' :
                        key === 'career' ? '事业' :
                          key === 'study' ? '学业' :
                            key === 'social' ? '社交' : key}
                  </div>
                  <div className="text-base font-bold whitespace-nowrap">{data.score}</div>
                  <div className="text-[10px] text-green-300 whitespace-nowrap">{data.description}</div>
                </div>
              ))}
            </div>

            {/* 幸运信息 */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-200">幸运色：</span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {Array.isArray(horoscopeData.recommendations?.luckyColors)
                      ? horoscopeData.recommendations.luckyColors.map((colorHex, index) => {
                        const colorName = Array.isArray(horoscopeData.recommendations?.luckyColorNames)
                          ? horoscopeData.recommendations.luckyColorNames[index]
                          : colorHex;
                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-green-300 dark:border-green-700"
                              style={{ backgroundColor: colorHex }}
                              title={colorName}
                              aria-label={`幸运色: ${colorName}`}
                            />
                            <div className="text-[9px] sm:text-[10px] text-green-100 truncate max-w-[40px] sm:max-w-[50px]">
                              {colorName}
                            </div>
                          </div>
                        );
                      })
                      : (() => {
                        const colorNames = ['蓝色', '绿色'];
                        return colorNames.map((colorName, index) => {
                          const colorHex = getColorHex(colorName);
                          return (
                            <div key={index} className="flex flex-col items-center">
                              <div
                                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-green-300 dark:border-green-700"
                                style={{ backgroundColor: colorHex }}
                                title={colorName}
                                aria-label={`幸运色: ${colorName}`}
                              />
                              <div className="text-[9px] sm:text-[10px] text-green-100 truncate max-w-[40px] sm:max-w-[50px]">
                                {colorName}
                              </div>
                            </div>
                          );
                        });
                      })()}
                  </div>
                </div>
                <div>
                  <span className="text-green-200">幸运数字：</span>
                  <span>{horoscopeData.recommendations?.luckyNumbers?.join('、') || '3、7、9'}</span>
                </div>
                <div>
                  <span className="text-green-200">今日建议：</span>
                  <span>{horoscopeData.recommendations?.positiveAdvice || '保持积极心态'}</span>
                </div>
                <div>
                  <span className="text-green-200">注意事项：</span>
                  <span>{horoscopeData.recommendations?.avoidAdvice || '避免冲动'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* 其他生肖入口 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🔮</span> 查看其他生肖
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 w-full">
            {CHINESE_ZODIAC_DATA.map((zodiac) => (
              <button
                key={zodiac.name}
                onClick={() => setUserZodiac(zodiac.name)}
                className={`aspect-square rounded-lg transition-all flex flex-col items-center justify-center p-2 min-w-0 overflow-hidden ${userZodiac === zodiac.name
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                  }`}
              >
                <div className="text-xl">{zodiac.icon}</div>
                <div className="text-xs font-bold mt-1 whitespace-nowrap">{zodiac.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChineseZodiacPage;
