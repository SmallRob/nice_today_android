import React, { useState, useEffect, useCallback } from 'react';
import { storageManager } from '../utils/storageManager';
import { Card } from './PageLayout';

const HoroscopeTab = () => {
  // 状态管理
  const [userHoroscope, setUserHoroscope] = useState('');
  const [horoscopeGuidance, setHoroscopeGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allHoroscopes, setAllHoroscopes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [birthDate, setBirthDate] = useState({ year: null, month: null, day: null });

  // 星座数据
  const getHoroscopeData = () => {
    return [
      { 
        name: '白羊座', 
        dateRange: '3月21日 - 4月19日',
        element: '火象',
        icon: '♈',
        color: '#fc4a1a',
        traits: '勇敢、冲动、领导力',
        luckyColor: ['#FF6B6B', '#FF8E53'],
        luckyNumber: [1, 9],
        compatible: ['狮子座', '射手座', '双子座'],
        incompatible: ['巨蟹座', '天蝎座', '摩羯座']
      },
      { 
        name: '金牛座', 
        dateRange: '4月20日 - 5月20日',
        element: '土象',
        icon: '♉',
        color: '#f7b733',
        traits: '稳重、务实、有耐心',
        luckyColor: ['#FFD700', '#FFA500'],
        luckyNumber: [2, 6],
        compatible: ['处女座', '摩羯座', '巨蟹座'],
        incompatible: ['天蝎座', '水瓶座', '狮子座']
      },
      { 
        name: '双子座', 
        dateRange: '5月21日 - 6月21日',
        element: '风象',
        icon: '♊',
        color: '#667db6',
        traits: '机智、好奇、善变',
        luckyColor: ['#4ECDC4', '#44A08D'],
        luckyNumber: [3, 5],
        compatible: ['天秤座', '水瓶座', '白羊座'],
        incompatible: ['处女座', '双鱼座', '射手座']
      },
      { 
        name: '巨蟹座', 
        dateRange: '6月22日 - 7月22日',
        element: '水象',
        icon: '♋',
        color: '#2193b0',
        traits: '敏感、顾家、有同情心',
        luckyColor: ['#64B3F4', '#4A90E2'],
        luckyNumber: [2, 7],
        compatible: ['天蝎座', '双鱼座', '金牛座'],
        incompatible: ['白羊座', '天秤座', '摩羯座']
      },
      { 
        name: '狮子座', 
        dateRange: '7月23日 - 8月22日',
        element: '火象',
        icon: '♌',
        color: '#ff9a44',
        traits: '自信、慷慨、有魅力',
        luckyColor: ['#FFD700', '#FFA500'],
        luckyNumber: [1, 5],
        compatible: ['白羊座', '射手座', '双子座'],
        incompatible: ['天蝎座', '水瓶座', '金牛座']
      },
      { 
        name: '处女座', 
        dateRange: '8月23日 - 9月22日',
        element: '土象',
        icon: '♍',
        color: '#8e9eab',
        traits: '细致、完美主义、实用',
        luckyColor: ['#96CEB4', '#FFEAA7'],
        luckyNumber: [3, 6],
        compatible: ['金牛座', '摩羯座', '巨蟹座'],
        incompatible: ['双子座', '射手座', '双鱼座']
      },
      { 
        name: '天秤座', 
        dateRange: '9月23日 - 10月23日',
        element: '风象',
        icon: '♎',
        color: '#dda0dd',
        traits: '优雅、公正、追求和谐',
        luckyColor: ['#FF6B6B', '#FF8E53'],
        luckyNumber: [6, 9],
        compatible: ['双子座', '水瓶座', '狮子座'],
        incompatible: ['巨蟹座', '摩羯座', '白羊座']
      },
      { 
        name: '天蝎座', 
        dateRange: '10月24日 - 11月22日',
        element: '水象',
        icon: '♏',
        color: '#8A2BE2',
        traits: '神秘、强烈、洞察力',
        luckyColor: ['#DA70D6', '#BA55D3'],
        luckyNumber: [4, 8],
        compatible: ['巨蟹座', '双鱼座', '处女座'],
        incompatible: ['狮子座', '金牛座', '双子座']
      },
      { 
        name: '射手座', 
        dateRange: '11月23日 - 12月21日',
        element: '火象',
        icon: '♐',
        color: '#32CD32',
        traits: '自由、乐观、爱冒险',
        luckyColor: ['#FFD700', '#FFA500'],
        luckyNumber: [3, 9],
        compatible: ['白羊座', '狮子座', '天秤座'],
        incompatible: ['处女座', '双鱼座', '巨蟹座']
      },
      { 
        name: '摩羯座', 
        dateRange: '12月22日 - 1月19日',
        element: '土象',
        icon: '♑',
        color: '#708090',
        traits: '实际、有责任心、目标明确',
        luckyColor: ['#808080', '#A9A9A9'],
        luckyNumber: [4, 8],
        compatible: ['金牛座', '处女座', '巨蟹座'],
        incompatible: ['白羊座', '天秤座', '狮子座']
      },
      { 
        name: '水瓶座', 
        dateRange: '1月20日 - 2月18日',
        element: '风象',
        icon: '♒',
        color: '#1e90ff',
        traits: '创新、独立、人道主义',
        luckyColor: ['#00BFFF', '#1E90FF'],
        luckyNumber: [4, 7],
        compatible: ['双子座', '天秤座', '射手座'],
        incompatible: ['金牛座', '天蝎座', '巨蟹座']
      },
      { 
        name: '双鱼座', 
        dateRange: '2月19日 - 3月20日',
        element: '水象',
        icon: '♓',
        color: '#9370DB',
        traits: '浪漫、富有想象力、直觉强',
        luckyColor: ['#9370DB', '#8A2BE2'],
        luckyNumber: [3, 7],
        compatible: ['巨蟹座', '天蝎座', '摩羯座'],
        incompatible: ['双子座', '处女座', '射手座']
      }
    ];
  };

  // 获取所有星座列表
  const loadAllHoroscopes = useCallback(async () => {
    const horoscopes = getHoroscopeData().map(h => h.name);
    setAllHoroscopes(horoscopes);
  }, []);

  // 根据出生日期计算星座
  const calculateHoroscopeFromDate = useCallback(async (year, month, day) => {
    // 星座临界点日期数组 (每个月的起始日)
    const criticalDays = [20, 19, 21, 20, 21, 21, 22, 23, 23, 23, 22, 22];
    
    // 星座数组
    const horoscopes = [
      "摩羯座", "水瓶座", "双鱼座", "白羊座", "金牛座", "双子座",
      "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座"
    ];
    
    // 计算星座索引
    let index = month - 1; // 月份转为索引 (0-11)
    
    // 如果日期小于临界点，则属于上一个月的星座
    if (day < criticalDays[month - 1]) {
      index = month - 2; // 上一个月
    }
    
    // 处理边界情况 (1月前是12月，12月后是1月)
    if (index < 0) index = 11; // 1月的摩羯座
    if (index > 11) index = 0; // 12月的摩羯座
    
    const horoscope = horoscopes[index];
    
    if (horoscope) {
      setUserHoroscope(horoscope);
      setBirthDate({ year, month, day });
      
      // 保存到存储 - 使用新的星座存储接口
      await storageManager.setUserHoroscope(horoscope);
      await storageManager.setBirthYear(year);
      
      // 同时保存完整的出生日期到localStorage用于后续计算
      localStorage.setItem('birthDate', JSON.stringify({ year, month, day }));
    }
  }, []);

  // 获取存储的星座信息
  const getStoredHoroscope = async () => {
    try {
      // 使用新的星座存储接口
      const storedHoroscope = await storageManager.getUserHoroscope();
      const storedBirthYear = await storageManager.getBirthYear();
      
      if (storedHoroscope) {
        setUserHoroscope(storedHoroscope);
      }
      
      // 如果有出生年份，尝试从localStorage获取完整的出生日期
      if (storedBirthYear) {
        try {
          // 尝试从localStorage获取完整的出生日期
          const storedBirthDate = localStorage.getItem('birthDate');
          if (storedBirthDate) {
            const birthDateObj = JSON.parse(storedBirthDate);
            setBirthDate(birthDateObj);
            
            // 如果还没有星座信息，根据出生日期重新计算星座
            if (!storedHoroscope && birthDateObj.year && birthDateObj.month && birthDateObj.day) {
              calculateHoroscopeFromDate(birthDateObj.year, birthDateObj.month, birthDateObj.day);
            }
          } else if (storedBirthYear) {
            // 只有年份信息，设置默认的出生日期
            setBirthDate({ year: storedBirthYear, month: 1, day: 1 });
          }
        } catch (err) {
          console.log('解析出生日期失败:', err);
        }
      }
    } catch (err) {
      console.log('无法从存储中获取星座信息:', err);
    }
  };

  // 从生物节律中获取出生日期
  const getBirthDateFromBiorhythm = async () => {
    try {
      // 尝试从生物节律中获取出生年份
      const birthYear = await storageManager.getBirthYear();
      
      if (birthYear) {
        // 这里我们假设用户会手动输入完整的出生日期
        // 因为我们只有年份，没有月份和日期
        console.log('获取到出生年份:', birthYear);
      }
    } catch (err) {
      console.log('无法从生物节律获取出生日期:', err);
    }
  };

  // 加载运势数据
  const loadHoroscopeGuidance = useCallback(async () => {
    if (!userHoroscope) return;

    setLoading(true);
    setError(null);

    try {
      // 获取星座数据
      const horoscopeData = getHoroscopeData();
      const userData = horoscopeData.find(h => h.name === userHoroscope);
      
      if (!userData) {
        throw new Error('未找到星座数据');
      }

      // 简化的每日运势算法
      // 生成随机的月亮星座 (简化版)
      const moonHoroscopes = [...horoscopeData];
      const todayMoonHoroscope = moonHoroscopes[Math.floor(Math.random() * moonHoroscopes.length)];
      
      // 计算运势分数
      let lifeScore = 0;
      let careerScore = 0;
      let healthScore = 0;
      let loveScore = 0;
      
      // 元素相容性规则
      const elements = {
        '火象': ['火象', '风象'], // 相生
        '土象': ['土象', '水象'], // 相生
        '风象': ['风象', '火象'], // 相生
        '水象': ['水象', '土象']  // 相生
      };
      
      // 判断元素关系
      if (userData.element === todayMoonHoroscope.element) {
        // 同元素 +1
        lifeScore += 1;
        careerScore += 1;
        healthScore += 1;
        loveScore += 1;
      } else if (elements[userData.element]?.includes(todayMoonHoroscope.element)) {
        // 相生 +0.5
        lifeScore += 0.5;
        careerScore += 0.5;
        healthScore += 0.5;
        loveScore += 0.5;
      } else {
        // 相克 -0.5
        lifeScore -= 0.5;
        careerScore -= 0.5;
        healthScore -= 0.5;
        loveScore -= 0.5;
      }
      
      // 根据星座特性强化
      switch (userHoroscope) {
        case '白羊座':
          careerScore += 0.5; // 行动力强
          break;
        case '金牛座':
          careerScore += 0.5; // 务实稳定
          break;
        case '双子座':
          lifeScore += 0.5; // 沟通能力强
          break;
        case '巨蟹座':
          loveScore += 0.5; // 情感丰富
          break;
        case '狮子座':
          careerScore += 0.5; // 领导力强
          break;
        case '处女座':
          healthScore += 0.5; // 注重健康
          break;
        case '天秤座':
          loveScore += 0.5; // 追求和谐
          break;
        case '天蝎座':
          loveScore += 0.5; // 情感深刻
          break;
        case '射手座':
          lifeScore += 0.5; // 自由乐观
          break;
        case '摩羯座':
          careerScore += 0.5; // 目标明确
          break;
        case '水瓶座':
          lifeScore += 0.5; // 创新独立
          break;
        case '双鱼座':
          loveScore += 0.5; // 浪漫直觉
          break;
        default:
          break;
      }
      
      // 限制分数范围在 -2 到 +2 之间
      lifeScore = Math.max(-2, Math.min(2, lifeScore));
      careerScore = Math.max(-2, Math.min(2, careerScore));
      healthScore = Math.max(-2, Math.min(2, healthScore));
      loveScore = Math.max(-2, Math.min(2, loveScore));
      
      // 生成运势描述
      const getScoreDescription = (score) => {
        if (score >= 1.5) return '极佳';
        if (score >= 0.5) return '良好';
        if (score >= -0.5) return '一般';
        if (score >= -1.5) return '较差';
        return '很差';
      };
      
      const getTrend = (score) => {
        if (score >= 1) return '上升';
        if (score >= 0) return '平稳';
        if (score >= -1) return '下降';
        return '低迷';
      };
      
      const mockData = {
        horoscopeInfo: {
          name: userData.name,
          element: userData.element,
          dateRange: userData.dateRange,
          icon: userData.icon,
          traits: userData.traits
        },
        dailyForecast: {
          life: {
            score: lifeScore,
            description: getScoreDescription(lifeScore),
            trend: getTrend(lifeScore)
          },
          career: {
            score: careerScore,
            description: getScoreDescription(careerScore),
            trend: getTrend(careerScore)
          },
          health: {
            score: healthScore,
            description: getScoreDescription(healthScore),
            trend: getTrend(healthScore)
          },
          love: {
            score: loveScore,
            description: getScoreDescription(loveScore),
            trend: getTrend(loveScore)
          }
        },
        recommendations: {
          luckyColors: userData.luckyColor,
          luckyNumbers: userData.luckyNumber,
          compatibleSigns: userData.compatible,
          incompatibleSigns: userData.incompatible,
          todayMoonSign: todayMoonHoroscope.name
        }
      };
      
      setHoroscopeGuidance(mockData);
    } catch (error) {
      console.error('加载星座运势失败:', error);
      setError(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [userHoroscope, selectedDate]);

  // 初始化组件
  useEffect(() => {
    const initialize = async () => {
      await loadAllHoroscopes();
      
      // 首先尝试从存储中获取已保存的星座
      await getStoredHoroscope();
      
      // 如果没有保存的星座，尝试从生物节律中获取出生年份
      if (!userHoroscope) {
        await getBirthDateFromBiorhythm();
      }
    };
    
    initialize();
  }, [loadAllHoroscopes]);

  // 当星座或日期变化时重新加载数据
  useEffect(() => {
    if (userHoroscope) {
      loadHoroscopeGuidance();
    }
  }, [userHoroscope, selectedDate, loadHoroscopeGuidance]);

  // 本地日期格式化方法
  const formatDateLocal = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 处理星座选择
  const handleHoroscopeChange = async (horoscope) => {
    setUserHoroscope(horoscope);
    // 保存到存储 - 使用新的星座存储接口
    await storageManager.setUserHoroscope(horoscope);
  };

  // 处理出生日期输入
  const handleDateInput = async (event) => {
    const dateStr = event.target.value;
    if (dateStr) {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      await calculateHoroscopeFromDate(year, month, day);
    }
  };

  // 渲染星座信息卡片
  const renderHoroscopeInfo = () => {
    if (!horoscopeGuidance?.horoscopeInfo) return null;

    const { name, element, dateRange, icon, traits } = horoscopeGuidance.horoscopeInfo;
    const horoscopeData = getHoroscopeData().find(h => h.name === name);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <span className="text-3xl mr-3">{icon}</span>
          {name} {element}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              <span className="font-semibold">日期范围：</span>
              <span className="ml-1">{dateRange}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold">性格特点：</span>
              <span className="ml-1">{traits}</span>
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
              style={{ backgroundColor: `${horoscopeData?.color}20`, color: horoscopeData?.color }}
            >
              {icon}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染每日运势卡片
  const renderDailyForecast = () => {
    if (!horoscopeGuidance?.dailyForecast) return null;

    const { life, career, health, love } = horoscopeGuidance.dailyForecast;
    
    // 根据分数设置颜色
    const getScoreColor = (score) => {
      if (score >= 1) return 'text-green-500';
      if (score >= 0) return 'text-blue-500';
      if (score >= -1) return 'text-yellow-500';
      return 'text-red-500';
    };
    
    const getScoreBg = (score) => {
      if (score >= 1) return 'bg-green-100 dark:bg-green-900 dark:bg-opacity-30';
      if (score >= 0) return 'bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30';
      if (score >= -1) return 'bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-30';
      return 'bg-red-100 dark:bg-red-900 dark:bg-opacity-30';
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">🔮</span>
          今日运势 ({formatDateLocal(selectedDate)})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 生活运势 */}
          <div className={`${getScoreBg(life.score)} rounded-lg p-4`}>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
              <span className="mr-2">🏠</span> 生活
            </h4>
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${getScoreColor(life.score)}`}>
                {life.score > 0 ? `+${life.score}` : life.score}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getScoreColor(life.score)}`}>
                {life.description}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              趋势：{life.trend}
            </p>
          </div>
          
          {/* 事业运势 */}
          <div className={`${getScoreBg(career.score)} rounded-lg p-4`}>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
              <span className="mr-2">💼</span> 事业
            </h4>
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${getScoreColor(career.score)}`}>
                {career.score > 0 ? `+${career.score}` : career.score}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getScoreColor(career.score)}`}>
                {career.description}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              趋势：{career.trend}
            </p>
          </div>
          
          {/* 健康运势 */}
          <div className={`${getScoreBg(health.score)} rounded-lg p-4`}>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
              <span className="mr-2">💚</span> 健康
            </h4>
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${getScoreColor(health.score)}`}>
                {health.score > 0 ? `+${health.score}` : health.score}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getScoreColor(health.score)}`}>
                {health.description}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              趋势：{health.trend}
            </p>
          </div>
          
          {/* 爱情运势 */}
          <div className={`${getScoreBg(love.score)} rounded-lg p-4`}>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
              <span className="mr-2">❤️</span> 爱情
            </h4>
            <div className="flex items-center justify-between">
              <span className={`text-2xl font-bold ${getScoreColor(love.score)}`}>
                {love.score > 0 ? `+${love.score}` : love.score}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getScoreColor(love.score)}`}>
                {love.description}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              趋势：{love.trend}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 渲染推荐建议卡片
  const renderRecommendations = () => {
    if (!horoscopeGuidance?.recommendations) return null;

    const { luckyColors, luckyNumbers, compatibleSigns, incompatibleSigns, todayMoonSign } = horoscopeGuidance.recommendations;
    const horoscopeData = getHoroscopeData();

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">✨</span>
          今日建议
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 幸运颜色 */}
          <div>
            <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3 text-lg flex items-center">
              <span className="mr-2">🎨</span> 幸运颜色
            </h4>
            <div className="flex flex-wrap gap-2">
              {luckyColors.map((color, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-6 h-6 rounded-full mr-2 border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-gray-700 dark:text-gray-300">{color}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 幸运数字 */}
          <div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 text-lg flex items-center">
              <span className="mr-2">🔢</span> 幸运数字
            </h4>
            <div className="flex flex-wrap gap-2">
              {luckyNumbers.map((num, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm text-gray-700 dark:text-gray-200"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
          
          {/* 今日月亮星座 */}
          <div>
            <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3 text-lg flex items-center">
              <span className="mr-2">🌙</span> 今日月亮星座
            </h4>
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {horoscopeData.find(h => h.name === todayMoonSign)?.icon || '🌙'}
              </span>
              <span className="text-gray-700 dark:text-gray-300">{todayMoonSign}</span>
            </div>
          </div>
          
          {/* 相容星座 */}
          <div>
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-3 text-lg flex items-center">
              <span className="mr-2">🤝</span> 相容星座
            </h4>
            <div className="flex flex-wrap gap-2">
              {compatibleSigns.map((sign, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full text-sm text-gray-700 dark:text-gray-200 flex items-center"
                >
                  <span className="mr-1">{horoscopeData.find(h => h.name === sign)?.icon || ''}</span>
                  {sign}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <Card>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            🔮 星座运程
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            根据您的星座和当日天象，为您提供运势指导
          </p>
        </div>
      </Card>

      {/* 星座选择器 */}
      <Card title="选择您的星座" className="mb-4">
        <div className="space-y-4">
          {/* 出生日期输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              根据出生日期计算星座
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              onChange={handleDateInput}
            />
          </div>

          {/* 星座选择网格 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              或者直接选择星座
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {(allHoroscopes.length > 0 ? allHoroscopes : 
                ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', 
                 '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座']
              ).map((horoscope) => {
                const horoscopeData = getHoroscopeData().find(h => h.name === horoscope);
                return (
                  <button
                    key={horoscope}
                    onClick={() => handleHoroscopeChange(horoscope)}
                    className={`p-2 rounded-lg text-center transition-all duration-200 text-sm font-medium flex flex-col items-center ${
                      userHoroscope === horoscope
                        ? 'bg-blue-500 text-white shadow'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-lg mb-1">{horoscopeData?.icon || '⭐'}</span>
                    <span>{horoscope.replace('座', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 日期选择器 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              查看指定日期的运势
            </label>
            <input
              type="date"
              value={selectedDate ? formatDateLocal(selectedDate) : ''}
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : new Date())}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* 当前选择显示 */}
        {userHoroscope && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              当前选择：<span className="font-bold">{userHoroscope}</span>
              {selectedDate && (
                <span className="ml-2">
                  查看日期：<span className="font-bold">{formatDateLocal(selectedDate)}</span>
                </span>
              )}
              {birthDate.year && birthDate.month && birthDate.day && (
                <span className="ml-2">
                  出生日期：<span className="font-bold">
                    {birthDate.year}-{String(birthDate.month).padStart(2, '0')}-{String(birthDate.day).padStart(2, '0')}
                  </span>
                </span>
              )}
            </p>
          </div>
        )}
      </Card>

      {/* 加载状态 */}
      {loading && (
        <Card>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">正在加载星座运势...</p>
          </div>
        </Card>
      )}

      {/* 错误显示 */}
      {error && (
        <Card>
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </Card>
      )}

      {/* 运势内容 */}
      {!loading && !error && horoscopeGuidance && userHoroscope && (
        <div>
          {/* 星座信息 */}
          <Card>
            {renderHoroscopeInfo()}
          </Card>
          
          {/* 每日运势 */}
          <Card>
            {renderDailyForecast()}
          </Card>

          {/* 推荐建议 */}
          <Card>
            {renderRecommendations()}
          </Card>

          {/* 底部信息 */}
          <Card>
            <div className="text-center text-gray-500 dark:text-gray-400 text-xs">
              <p>数据更新时间：{new Date().toLocaleString()}</p>
              <p className="mt-1">星座运势仅供参考，请理性看待，结合实际情况做出决策</p>
            </div>
          </Card>
        </div>
      )}

      {/* 未选择星座时的提示 */}
      {!loading && !error && !userHoroscope && (
        <Card>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔮</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">请选择您的星座</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
              选择星座后，将为您提供个性化的每日运势指导
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HoroscopeTab;