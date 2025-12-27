import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { storageManager } from '../utils/storageManager';
import { useCurrentConfig, useUserConfig } from '../contexts/UserConfigContext';
import { Card } from './PageLayout';

const HoroscopeTab = ({ currentConfig: propCurrentConfig, theme: propTheme, viewMode = 'daily' }) => {
  // 使用新的配置上下文，优先使用传入的参数
  const { currentConfig: contextConfig, isLoading: configLoading, error: configError } = useCurrentConfig();
  const currentConfig = propCurrentConfig || contextConfig;

  // 状态管理
  const [userHoroscope, setUserHoroscope] = useState('');
  const [isTemporaryHoroscope, setIsTemporaryHoroscope] = useState(false);
  const [horoscopeGuidance, setHoroscopeGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allHoroscopes, setAllHoroscopes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [birthDate, setBirthDate] = useState({ year: null, month: null, day: null });
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    birthDate: '',
    zodiac: '',
    zodiacAnimal: ''
  });
  const [initialized, setInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // 创建ref来跟踪临时状态
  const isTemporaryRef = useRef(false);

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
        traitsDetail: {
          personality: '充满活力和冒险精神，勇于面对挑战，天生的领导者',
          love: '热情直白，喜欢主动追求，对感情忠诚投入',
          career: '具有开创精神，适合创业和管理岗位，需要学会团队协作',
          health: '精力旺盛但容易冲动，注意控制情绪，避免过度劳累',
          strengths: ['勇敢果断', '积极主动', '领导力强', '富有激情'],
          weaknesses: ['缺乏耐心', '容易冲动', '脾气急躁', '不够细心']
        },
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
        traitsDetail: {
          personality: '踏实稳重，追求安全感，重视物质和精神双重满足',
          love: '重视稳定关系，感情深沉专一，需要时间培养感情',
          career: '适合金融、艺术等需要耐心和审美的领域，注重实际回报',
          health: '体质较强但需要注意饮食，容易贪吃，适度运动很重要',
          strengths: ['踏实可靠', '有耐心', '审美能力强', '理财能力好'],
          weaknesses: ['固执己见', '过于保守', '贪图享乐', '反应较慢']
        },
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
        traitsDetail: {
          personality: '思维敏捷，好奇心强，善于沟通和适应环境',
          love: '需要新鲜感，喜欢精神交流，但可能不够专一',
          career: '适合媒体、销售等需要沟通和创意的工作，多才多艺',
          health: '神经质，容易焦虑，需要保持心理平衡和充足睡眠',
          strengths: ['思维敏捷', '沟通能力强', '适应力强', '多才多艺'],
          weaknesses: ['缺乏恒心', '善变', '缺乏深度', '容易分心']
        },
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
        traitsDetail: {
          personality: '情感丰富，重视家庭，具有强烈的安全感和保护欲',
          love: '情感深沉，渴望稳定关系，极其重视家庭和情感联系',
          career: '适合教育、护理、餐饮等关爱他人的领域，工作认真负责',
          health: '情绪影响健康，容易消化不良，需要保持情绪稳定',
          strengths: ['富有同情心', '顾家', '直觉强', '记忆力好'],
          weaknesses: ['过于敏感', '情绪化', '缺乏安全感', '过于保护']
        },
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
        traitsDetail: {
          personality: '自信阳光，具有王者风范，渴望被认可和赞美',
          love: '热情浪漫，喜欢被宠爱的感觉，对感情慷慨大方',
          career: '适合领导岗位和演艺领域，具有极强的表现力和号召力',
          health: '心脏和循环系统需要注意，保持适度运动，避免过度劳累',
          strengths: ['自信大方', '领导力强', '慷慨热情', '表现力强'],
          weaknesses: ['自负', '爱面子', '霸道', '过于追求荣耀']
        },
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
        traitsDetail: {
          personality: '注重细节，追求完美，具有强烈的服务意识和责任感',
          love: '谨慎认真，追求完美关系，对伴侣要求较高但忠诚专一',
          career: '适合数据分析、医疗、编辑等需要细心和专业的工作',
          health: '容易神经紧张和消化问题，需要放松心情，注意饮食规律',
          strengths: ['细心认真', '完美主义', '分析能力强', '乐于助人'],
          weaknesses: ['过于挑剔', '焦虑紧张', '过于苛刻', '缺乏弹性']
        },
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
        traitsDetail: {
          personality: '追求平衡与和谐，具有良好的审美能力和外交手腕',
          love: '浪漫优雅，重视伴侣关系，需要公平和相互尊重的感情',
          career: '适合法律、公关、艺术等需要平衡和审美的工作',
          health: '腰部和肾脏需要注意，保持规律作息，避免压力过大',
          strengths: ['优雅公正', '善于社交', '审美能力强', '外交手腕好'],
          weaknesses: ['犹豫不决', '过于依赖', '逃避冲突', '过于追求完美']
        },
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
        traitsDetail: {
          personality: '神秘深沉，具有强烈的意志力和敏锐的洞察力',
          love: '情感炽烈，占有欲强，对感情极度忠诚但也容易嫉妒',
          career: '适合侦探、心理学、医学等需要洞察力的专业领域',
          health: '生殖系统和情绪需要注意，学会释放压力，避免极端情绪',
          strengths: ['洞察力强', '意志坚定', '忠诚可靠', '神秘魅力'],
          weaknesses: ['多疑', '报复心强', '占有欲强', '过于极端']
        },
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
        traitsDetail: {
          personality: '乐观开朗，追求自由，具有探险精神和哲学思维',
          love: '喜欢自由空间，感情直接坦诚，重视精神契合而非束缚',
          career: '适合旅游、教育、出版等需要自由和创意的工作',
          health: '臀部和腿部需要注意，避免过度冒险，保持运动量',
          strengths: ['乐观开朗', '自由奔放', '有远见', '幽默风趣'],
          weaknesses: ['粗心大意', '不负责任', '缺乏耐心', '言辞过于直率']
        },
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
        traitsDetail: {
          personality: '踏实务实，具有强烈的责任感和野心，追求事业成就',
          love: '感情谨慎，重视稳定关系，需要时间建立信任但忠诚专一',
          career: '适合管理和企业高管，具有极强的执行力和组织能力',
          health: '骨骼和皮肤需要注意，避免过度劳累，保持规律生活',
          strengths: ['责任心强', '目标明确', '执行力强', '坚韧不拔'],
          weaknesses: ['过于严肃', '固执', '压抑情感', '功利心重']
        },
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
        traitsDetail: {
          personality: '独立创新，思维超前，具有强烈的人道主义精神',
          love: '重视精神交流，需要自由空间，不喜欢过于束缚的关系',
          career: '适合科技、创新、人道主义等领域，具有前瞻性思维',
          health: '循环系统和神经需要注意，保持规律作息，避免过度思考',
          strengths: ['创新思维', '独立自主', '人道主义', '友善友善'],
          weaknesses: ['过于理想化', '疏离感强', '固执己见', '缺乏情感表达']
        },
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
        traitsDetail: {
          personality: '浪漫敏感，富有想象力和艺术天赋，直觉敏锐',
          love: '浪漫多情，重视情感联系，容易为爱情牺牲奉献',
          career: '适合艺术、音乐、文学等创意领域，具有丰富的想象力',
          health: '免疫系统和脚部需要注意，避免过度沉迷幻想，保持现实感',
          strengths: ['富有想象力', '直觉强', '艺术天赋', '富有同情心'],
          weaknesses: ['过于理想化', '逃避现实', '缺乏自信', '过于敏感']
        },
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
  const getStoredHoroscope = useCallback(async () => {
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
  }, [calculateHoroscopeFromDate]);

  // 从生物节律中获取出生日期
  const getBirthDateFromBiorhythm = useCallback(async () => {
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
  }, []);

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

      // 根据不同的 viewMode 计算运势分数
      const calculateScores = () => {
        let lifeScore = 0;
        let careerScore = 0;
        let healthScore = 0;
        let loveScore = 0;

        // 元素相容性规则
        const elements = {
          '火象': ['火象', '风象'],
          '土象': ['土象', '水象'],
          '风象': ['风象', '火象'],
          '水象': ['水象', '土象']
        };

        // 根据星座特性强化
        switch (userHoroscope) {
          case '白羊座':
            careerScore += 0.5;
            break;
          case '金牛座':
            careerScore += 0.5;
            break;
          case '双子座':
            lifeScore += 0.5;
            break;
          case '巨蟹座':
            loveScore += 0.5;
            break;
          case '狮子座':
            careerScore += 0.5;
            break;
          case '处女座':
            healthScore += 0.5;
            break;
          case '天秤座':
            loveScore += 0.5;
            break;
          case '天蝎座':
            loveScore += 0.5;
            break;
          case '射手座':
            lifeScore += 0.5;
            break;
          case '摩羯座':
            careerScore += 0.5;
            break;
          case '水瓶座':
            lifeScore += 0.5;
            break;
          case '双鱼座':
            loveScore += 0.5;
            break;
          default:
            break;
        }

        // 根据 viewMode 调整分数
        if (viewMode === 'daily') {
          // 每日运势 - 基础分数
          const moonHoroscopes = [...horoscopeData];
          const todayMoonHoroscope = moonHoroscopes[Math.floor(Math.random() * moonHoroscopes.length)];

          if (userData.element === todayMoonHoroscope.element) {
            lifeScore += 1;
            careerScore += 1;
            healthScore += 1;
            loveScore += 1;
          } else if (elements[userData.element]?.includes(todayMoonHoroscope.element)) {
            lifeScore += 0.5;
            careerScore += 0.5;
            healthScore += 0.5;
            loveScore += 0.5;
          } else {
            lifeScore -= 0.5;
            careerScore -= 0.5;
            healthScore -= 0.5;
            loveScore -= 0.5;
          }
        } else if (viewMode === 'weekly') {
          // 本周运势 - 综合几天的情况
          lifeScore += 0.8;
          careerScore += 0.7;
          healthScore += 0.6;
          loveScore += 0.9;
        } else if (viewMode === 'monthly') {
          // 本月运势 - 更长远的趋势
          lifeScore += 0.6;
          careerScore += 0.8;
          healthScore += 0.5;
          loveScore += 0.7;
        }

        // 限制分数范围在 -2 到 +2 之间
        lifeScore = Math.max(-2, Math.min(2, lifeScore));
        careerScore = Math.max(-2, Math.min(2, careerScore));
        healthScore = Math.max(-2, Math.min(2, healthScore));
        loveScore = Math.max(-2, Math.min(2, loveScore));

        return { lifeScore, careerScore, healthScore, loveScore };
      };

      const { lifeScore, careerScore, healthScore, loveScore } = calculateScores();

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

      // 生成月亮星座或其他信息
      const moonHoroscopes = [...horoscopeData];
      const todayMoonHoroscope = moonHoroscopes[Math.floor(Math.random() * moonHoroscopes.length)];

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
        },
        viewMode: viewMode // 记录当前视图模式
      };

      setHoroscopeGuidance(mockData);
    } catch (error) {
      console.error('加载星座运势失败:', error);
      setError(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [userHoroscope, viewMode]);

  // 初始化组件
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        // 加载所有星座
        await loadAllHoroscopes();
        
        if (!isMounted) return;
        
        // 从用户配置上下文获取用户信息
        if (currentConfig && isMounted) {
          setUserInfo(currentConfig);
          
          // 优先使用用户配置中的星座信息
          if (currentConfig.zodiac) {
            setUserHoroscope(currentConfig.zodiac);
            setIsTemporaryHoroscope(false);
            isTemporaryRef.current = false;
            
            // 同步到storageManager以保持兼容性
            await storageManager.setUserHoroscope(currentConfig.zodiac);
          } else if (currentConfig.birthDate) {
            // 如果没有星座但有出生日期，计算星座
            const birthDateObj = new Date(currentConfig.birthDate);
            const year = birthDateObj.getFullYear();
            const month = birthDateObj.getMonth() + 1;
            const day = birthDateObj.getDate();
            
            if (year && month && day) {
              await calculateHoroscopeFromDate(year, month, day);
            }
          }
        } else {
          // 降级处理：使用原有逻辑
          await getStoredHoroscope();
          
          // 如果没有保存的星座，尝试从生物节律中获取出生年份
          if (!userHoroscope) {
            await getBirthDateFromBiorhythm();
          }
        }
        
        if (isMounted) {
          setInitialized(true);
        }
      } catch (error) {
        console.error('初始化星座运程组件失败:', error);
        
        // 降级处理：使用原有逻辑
        await loadAllHoroscopes();
        if (isMounted) {
          await getStoredHoroscope();
          
          // 如果没有保存的星座，尝试从生物节律中获取出生年份
          if (!userHoroscope) {
            await getBirthDateFromBiorhythm();
          }
          setInitialized(true);
        }
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
    };
  }, [loadAllHoroscopes, calculateHoroscopeFromDate, currentConfig, getStoredHoroscope]);

  // 同步临时状态到ref
  useEffect(() => {
    isTemporaryRef.current = isTemporaryHoroscope;
  }, [isTemporaryHoroscope]);

  // 当星座或日期变化时重新加载数据 - 优化加载逻辑
  useEffect(() => {
    if (!userHoroscope || !initialized) return;
    
    // 仅在首次默认加载或用户主动切换时执行数据请求
    if (!dataLoaded) {
      const timer = setTimeout(() => {
        loadHoroscopeGuidance();
        setDataLoaded(true);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [userHoroscope, selectedDate, loadHoroscopeGuidance, initialized, dataLoaded]);

  // 本地日期格式化方法
  const formatDateLocal = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 处理星座选择 - 修复临时点击问题
  const handleHoroscopeChange = useCallback(async (horoscope) => {
    if (userHoroscope !== horoscope) {
      setUserHoroscope(horoscope);
      // 标记为临时选择
      setIsTemporaryHoroscope(true);
      // 保存到存储 - 使用新的星座存储接口
      await storageManager.setUserHoroscope(horoscope);
      // 标记需要重新加载数据
      setDataLoaded(false);
    }
  }, [userHoroscope, storageManager, setDataLoaded, setIsTemporaryHoroscope]);

  // 新增：恢复用户配置的星座
  const handleRestoreUserHoroscope = useCallback(async () => {
    // 从用户配置获取星座
    if (currentConfig && currentConfig.zodiac) {
      setUserHoroscope(currentConfig.zodiac);
      setIsTemporaryHoroscope(false);
      // 保存到存储
      await storageManager.setUserHoroscope(currentConfig.zodiac);
      // 标记需要重新加载数据
      setDataLoaded(false);
    }
  }, [storageManager, setDataLoaded, setIsTemporaryHoroscope, currentConfig]);



  // 渲染星座信息卡片
  const renderHoroscopeInfo = () => {
    if (!horoscopeGuidance?.horoscopeInfo) return null;

    const { name, element, dateRange, icon, traits } = horoscopeGuidance.horoscopeInfo;
    const horoscopeData = getHoroscopeData().find(h => h.name === name);
    const traitsDetail = horoscopeData?.traitsDetail;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="text-3xl mr-3">{icon}</span>
          {name} {element}
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-700 dark:text-gray-200 mb-3">
              <span className="font-semibold">日期范围：</span>
              <span className="ml-1">{dateRange}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-200">
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

        {/* 增强的星座特质详情 */}
        {traitsDetail && (
          <div className="mt-6 space-y-4">
            {/* 性格描述 */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-700">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                <span className="mr-2">✨</span> 性格详解
              </h4>
              <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                {traitsDetail.personality}
              </p>
            </div>

            {/* 维度详情 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                  <span className="mr-2">❤️</span> 感情观
                </h4>
                <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                  {traitsDetail.love}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                  <span className="mr-2">💼</span> 事业观
                </h4>
                <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                  {traitsDetail.career}
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                  <span className="mr-2">💚</span> 健康提示
                </h4>
                <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                  {traitsDetail.health}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                  <span className="mr-2">💪</span> 优缺点分析
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">优势：</p>
                    <div className="flex flex-wrap gap-1">
                      {traitsDetail.strengths.map((strength, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full"
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-1">劣势：</p>
                    <div className="flex flex-wrap gap-1">
                      {traitsDetail.weaknesses.map((weakness, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full"
                        >
                          {weakness}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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

    // 根据视图模式显示不同的标题
    const getTitle = () => {
      switch (viewMode) {
        case 'daily':
          return `今日运势 (${formatDateLocal(selectedDate)})`;
        case 'weekly':
          return '本周运势';
        case 'monthly':
          return '本月运势';
        default:
          return '运势';
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 mb-5 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-5 flex items-center">
          <span className="mr-2 text-lg">🔮</span>
          {getTitle()}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 生活运势 */}
          <div className={`${getScoreBg(life.score)} rounded-lg p-4`}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <span className="mr-2">🏠</span> 生活
            </h4>
            <div className="flex items-center justify-between">
              <span className={`text-xl font-bold ${getScoreColor(life.score)}`}>
                {life.score > 0 ? `+${life.score}` : life.score}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getScoreColor(life.score)}`}>
                {life.description}
              </span>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-200 mt-2">
              趋势：{life.trend}
            </p>
          </div>

          {/* 事业运势 */}
          <div className={`${getScoreBg(career.score)} rounded-lg p-4`}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <span className="mr-2">💼</span> 事业
            </h4>
            <div className="flex items-center justify-between">
              <span className={`text-xl font-bold ${getScoreColor(career.score)}`}>
                {career.score > 0 ? `+${career.score}` : career.score}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getScoreColor(career.score)}`}>
                {career.description}
              </span>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-200 mt-2">
              趋势：{career.trend}
            </p>
          </div>

          {/* 健康运势 */}
          <div className={`${getScoreBg(health.score)} rounded-lg p-4`}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <span className="mr-2">💚</span> 健康
            </h4>
            <div className="flex items-center justify-between">
              <span className={`text-xl font-bold ${getScoreColor(health.score)}`}>
                {health.score > 0 ? `+${health.score}` : health.score}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getScoreColor(health.score)}`}>
                {health.description}
              </span>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-200 mt-2">
              趋势：{health.trend}
            </p>
          </div>

          {/* 爱情运势 */}
          <div className={`${getScoreBg(love.score)} rounded-lg p-4`}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <span className="mr-2">❤️</span> 爱情
            </h4>
            <div className="flex items-center justify-between">
              <span className={`text-xl font-bold ${getScoreColor(love.score)}`}>
                {love.score > 0 ? `+${love.score}` : love.score}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getScoreColor(love.score)}`}>
                {love.description}
              </span>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-200 mt-2">
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

    const { luckyColors, luckyNumbers, compatibleSigns, todayMoonSign } = horoscopeGuidance.recommendations;
    const horoscopeData = getHoroscopeData();

    // 根据视图模式显示不同的标题
    const getTitle = () => {
      switch (viewMode) {
        case 'daily':
          return '今日建议';
        case 'weekly':
          return '本周建议';
        case 'monthly':
          return '本月建议';
        default:
          return '建议';
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="mr-3">✨</span>
          {getTitle()}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 幸运颜色 */}
          <div>
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 text-lg flex items-center">
              <span className="mr-2">🎨</span> 幸运颜色
            </h4>
            <div className="flex flex-wrap gap-2">
              {luckyColors.map((color, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-6 h-6 rounded-full mr-2 border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-gray-700 dark:text-white">{color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 幸运数字 */}
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 text-lg flex items-center">
              <span className="mr-2">🔢</span> 幸运数字
            </h4>
            <div className="flex flex-wrap gap-2">
              {luckyNumbers.map((num, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm text-gray-700 dark:text-white"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>

          {/* 今日月亮星座 */}
          <div>
            <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3 text-lg flex items-center">
              <span className="mr-2">🌙</span> 今日月亮星座
            </h4>
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {horoscopeData.find(h => h.name === todayMoonSign)?.icon || '🌙'}
              </span>
              <span className="text-gray-700 dark:text-white">{todayMoonSign}</span>
            </div>
          </div>

          {/* 相容星座 */}
          <div>
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 text-lg flex items-center">
              <span className="mr-2">🤝</span> 相容星座
            </h4>
            <div className="flex flex-wrap gap-2">
              {compatibleSigns.map((sign, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full text-sm text-gray-700 dark:text-white flex items-center"
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

  // 用户信息显示组件
  const UserInfoDisplay = useMemo(() => {
    return (
      <Card title="当前用户信息" className="mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                用户昵称
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {userInfo.nickname || '未知用户'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                出生日期
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {userInfo.birthDate || '未知'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                当前星座
              </p>
              <p className="font-medium text-blue-600 dark:text-blue-400">
                {userHoroscope || '未设置'}
              </p>
            </div>
          </div>
          {userInfo.nickname && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-300">
                💡 如需修改信息，请在设置页面进行用户配置管理
              </p>
            </div>
          )}
        </div>
      </Card>
    );
  }, [userInfo, userHoroscope]);

  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <Card>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            🔮 星座运程
          </h1>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            根据您的星座和当日天象，为您提供运势指导
          </p>
        </div>
      </Card>

      {/* 用户信息显示 */}
      {UserInfoDisplay}
      
      {/* 简化的星座选择器 */}
      <Card title="临时切换星座" className="mb-4">
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            您可以临时切换查看不同星座的运程，这不会修改您的用户配置
          </p>
          
          {/* 星座选择网格 */}
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
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white'
                  }`}
                >
                  <span className="text-lg mb-1">{horoscopeData?.icon || '⭐'}</span>
                  <span>{horoscope.replace('座', '')}</span>
                </button>
              );
            })}
          </div>

          {/* 日期选择器 - 仅在每日模式下显示 */}
          {viewMode === 'daily' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                查看指定日期的运势
              </label>
              <input
                type="date"
                value={selectedDate ? formatDateLocal(selectedDate) : ''}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : new Date();
                  setSelectedDate(newDate);
                  // 日期变更时标记需要重新加载数据
                  setDataLoaded(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
          )}

          {/* 当前选择显示 */}
          {userHoroscope && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <p className="text-blue-800 dark:text-blue-200 text-sm mb-2 md:mb-0">
                  当前选择：<span className="font-semibold">{userHoroscope}</span>
                  {isTemporaryHoroscope && <span className="ml-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded">临时</span>}
                  {viewMode === 'daily' && selectedDate && (
                    <span className="ml-2">
                      查看日期：<span className="font-semibold">{formatDateLocal(selectedDate)}</span>
                    </span>
                  )}
                  {birthDate.year && birthDate.month && birthDate.day && (
                    <span className="ml-2">
                      出生日期：<span className="font-semibold">
                        {birthDate.year}-{String(birthDate.month).padStart(2, '0')}-{String(birthDate.day).padStart(2, '0')}
                      </span>
                    </span>
                  )}
                </p>
                {isTemporaryHoroscope && (
                  <button
                    onClick={handleRestoreUserHoroscope}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    恢复我的星座
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 加载状态 */}
      {loading && (
        <Card>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-700 dark:text-gray-200 text-sm">正在加载星座运势...</p>
          </div>
        </Card>
      )}

      {/* 错误显示 */}
      {error && (
        <Card>
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
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
            <div className="text-center text-gray-600 dark:text-gray-300 text-xs">
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
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">请选择您的星座</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto">
              选择星座后，将为您提供个性化的每日运势指导
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HoroscopeTab;