import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { userConfigManager } from '../utils/userConfigManager';
import { Card } from './PageLayout';
import { useTheme } from '../context/ThemeContext';
import ChineseZodiacSelector from './ChineseZodiacSelector';
import '../styles/zodiac-icons.css';
import '../styles/chinese-zodiac-icons.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 生肖能量组件配置管理器 - 仅用于读取默认配置
class ZodiacEnergyConfigManager {
  constructor() {
    this.CONFIG_KEY = 'zodiac_energy_config';
    this.DEFAULT_CONFIG = {
      userZodiac: '',
      selectedDate: new Date().toISOString(),
      lastUsedZodiac: '',
      zodiacHistory: [],
      themeSettings: {
        autoSync: true,
        independentMode: false
      },
      version: '1.0',
      lastUpdated: Date.now()
    };
  }

  // 获取配置 - 仅返回默认配置，不保存任何用户选择
  getConfig() {
    // 始终返回默认配置，忽略任何已保存的用户配置
    return { ...this.DEFAULT_CONFIG };
  }
}

// 创建配置管理器实例
const zodiacEnergyConfigManager = new ZodiacEnergyConfigManager();

const ZodiacEnergyTab = memo(({ onError }) => {
  // 使用主题管理
  const { theme, configManager: themeConfigManager } = useTheme();

  // 状态管理
  const [userZodiac, setUserZodiac] = useState('');
  const [energyGuidance, setEnergyGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allZodiacs, setAllZodiacs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    birthDate: '',
    zodiac: '',
    zodiacAnimal: ''
  });
  const [initialized, setInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [tempZodiac, setTempZodiac] = useState(''); // 用于临时切换生肖查看

  // 五行元素数据 - 使用useMemo缓存，避免重复创建
  const wuxingElements = React.useMemo(() => [
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
  ], []);

  // 生肖列表 - 使用useMemo缓存
  const zodiacs = React.useMemo(() => ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'], []);

  // 获取所有生肖列表
  const loadAllZodiacs = useCallback(async () => {
    setAllZodiacs(zodiacs);
  }, [zodiacs]);

  // 根据年份计算生肖
  const calculateZodiacFromYear = useCallback((year) => {
    // 生肖计算规则：(年份 - 4) % 12
    const index = (year - 4) % 12;
    const zodiac = zodiacs[index];

    if (zodiac) {
      setUserZodiac(zodiac);
    }
  }, [zodiacs]);

  // 加载能量指引数据
  const loadEnergyGuidance = useCallback(async () => {
    if (!userZodiac) return;

    setLoading(true);
    setError(null);

    try {
      // 创建模拟数据
      const todayElement = wuxingElements[Math.floor(Math.random() * wuxingElements.length)];

      // 根据生肖确定用户五行
      const zodiacElementMap = {
        '鼠': '水', '牛': '土', '虎': '木', '兔': '木',
        '龙': '土', '蛇': '火', '马': '火', '羊': '土',
        '猴': '金', '鸡': '金', '狗': '土', '猪': '水'
      };

      const userElement = zodiacElementMap[userZodiac] || '土';
      const userElementData = wuxingElements.find(el => el.name === userElement);

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

      const mockData = {
        energyMatch: {
          匹配度: matchScore,
          关系: relation,
          描述: `您的${userElement}属性与今日${todayElement.name}能量${relation}`,
          用户五行: userElement,
          当日五行: todayElement.name
        },
        生活建议: {
          幸运颜色: userElementData.name === '木' ? ['绿色', '青色'] :
            userElementData.name === '火' ? ['红色', '紫色'] :
              userElementData.name === '土' ? ['黄色', '棕色'] :
                userElementData.name === '金' ? ['白色', '银色'] : ['蓝色', '黑色'],
          适合饰品: userElementData.name === '木' ? ['木质饰品', '绿色水晶'] :
            userElementData.name === '火' ? ['红宝石', '玛瑙'] :
              userElementData.name === '土' ? ['玉石', '黄水晶'] :
                userElementData.name === '金' ? ['黄金', '白金首饰'] : ['水晶', '珍珠'],
          适合行业: userElementData.name === '木' ? ['教育', '文化', '林业'] :
            userElementData.name === '火' ? ['能源', '传媒', '表演'] :
              userElementData.name === '土' ? ['房地产', '建筑', '农业'] :
                userElementData.name === '金' ? ['金融', '机械', '珠宝'] : ['贸易', '航运', '旅游'],
          幸运方位: userElementData.name === '木' ? ['正东', '东北方'] :
            userElementData.name === '火' ? ['正南', '东南方'] :
              userElementData.name === '土' ? ['东北', '西南方'] :
                userElementData.name === '金' ? ['正西', '西北方'] : ['正北', '西北方'],
          能量提升: userElementData.quickBoost.description
        },
        饮食调理: {
          宜: userElementData.name === '木' ? ['绿色蔬菜', '酸味食物', '新鲜水果'] :
            userElementData.name === '火' ? ['红色食物', '苦味食物', '辛辣食物'] :
              userElementData.name === '土' ? ['黄色食物', '甘味食物', '温性食物'] :
                userElementData.name === '金' ? ['白色食物', '辛味食物', '润肺食物'] : ['黑色食物', '咸味食物', '补肾食物'],
          忌: userElementData.name === '木' ? ['过度油腻', '辛辣刺激'] :
            userElementData.name === '火' ? ['过度燥热', '油腻食物'] :
              userElementData.name === '土' ? ['生冷食物', '过度甜腻'] :
                userElementData.name === '金' ? ['过度辛辣', '干燥食物'] : ['过度咸', '生冷食物']
        },
        家居风水: {
          家居布置: userElementData.name === '木' ? ['绿植', '木质家具', '花卉'] :
            userElementData.name === '火' ? ['红色装饰', '暖色灯光', '蜡烛'] :
              userElementData.name === '土' ? ['陶瓷工艺品', '大地色系装饰', '黄色物件'] :
                userElementData.name === '金' ? ['金属制品', '白色装饰', '水晶'] : ['鱼缸', '水景装饰', '蓝色物件'],
          摆放位置: userElementData.name === '木' ? ['东方', '东南方'] :
            userElementData.name === '火' ? ['南方', '东南方'] :
              userElementData.name === '土' ? ['中央', '西南方', '东北方'] :
                userElementData.name === '金' ? ['西方', '西北方'] : ['北方', '西方'],
          建议: `${userElementData.name}元素宜${userElementData.quickBoost.secondDescription}`
        },
        人际关系: {
          适合交往的五行: userElementData.name === '木' ? ['火', '水'] :
            userElementData.name === '火' ? ['土', '木'] :
              userElementData.name === '土' ? ['金', '火'] :
                userElementData.name === '金' ? ['水', '土'] : ['木', '金'],
          适合交往的生肖: userElementData.name === '木' ? ['蛇', '马', '鼠', '猪'] :
            userElementData.name === '火' ? ['牛', '龙', '羊', '狗'] :
              userElementData.name === '土' ? ['猴', '鸡', '蛇', '马'] :
                userElementData.name === '金' ? ['鼠', '猪', '牛', '龙'] : ['虎', '兔', '猴', '鸡'],
          建议: `与${userElementData.name === '木' ? '火、水' :
            userElementData.name === '火' ? '土、木' :
              userElementData.name === '土' ? '金、火' :
                userElementData.name === '金' ? '水、土' : '木、金'}五行的人相处最为和谐`
        }
      };

      setEnergyGuidance(mockData);
    } catch (error) {
      console.error('加载能量指引失败:', error);
      setError(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [userZodiac, selectedDate, wuxingElements]);

  // 初始化组件 - 优化为立即加载默认数据
  useEffect(() => {
    let isMounted = true;
    const removeListener = () => { };

    const initialize = async () => {
      try {
        // 立即加载所有生肖，不等待
        await loadAllZodiacs();

        if (!isMounted) return;

        // 设置默认生肖为"鼠"，确保有数据可显示
        setUserZodiac('鼠');
        setTempZodiac('');

        // 异步获取用户配置，但不阻塞界面
        setTimeout(async () => {
          try {
            // 确保用户配置管理器已初始化
            if (!userConfigManager.initialized) {
              await userConfigManager.initialize();
            }

            // 获取用户配置
            const currentConfig = userConfigManager.getCurrentConfig();
            if (currentConfig && isMounted) {
              setUserInfo(currentConfig);

              // 如果用户有配置的生肖，则更新显示
              if (currentConfig.zodiacAnimal && currentConfig.zodiacAnimal !== '鼠') {
                setUserZodiac(currentConfig.zodiacAnimal);
                // 标记需要重新加载数据
                setDataLoaded(false);
              } else if (currentConfig.birthDate) {
                // 如果没有生肖但有出生日期，计算生肖
                const birthYear = new Date(currentConfig.birthDate).getFullYear();
                if (birthYear && birthYear > 1900 && birthYear < 2100) {
                  const calculatedZodiac = zodiacs[(birthYear - 4) % 12];
                  if (calculatedZodiac && calculatedZodiac !== '鼠') {
                    setUserZodiac(calculatedZodiac);
                    // 标记需要重新加载数据
                    setDataLoaded(false);
                  }
                }
              }
            }

            // 添加配置变更监听器
            const removeConfigListener = userConfigManager.addListener((configData) => {
              if (isMounted && configData.currentConfig) {
                setUserInfo(configData.currentConfig);

                // 仅在没有临时生肖时更新生肖信息，避免覆盖用户临时选择
                if (configData.currentConfig.zodiacAnimal &&
                  configData.currentConfig.zodiacAnimal !== userZodiac &&
                  !tempZodiac) { // 仅在没有临时生肖时更新
                  setUserZodiac(configData.currentConfig.zodiacAnimal);
                  // 强制重新加载数据（包括配置切换和强制重载）
                  setDataLoaded(false);
                }

                // 如果收到强制重载标志，确保重新加载数据
                if (configData.forceReload) {
                  setDataLoaded(false);
                }
              }
            });

            removeListener.current = removeConfigListener;
          } catch (error) {
            console.warn('异步加载用户配置失败:', error);
          }
        }, 50); // 短延迟，确保界面先显示

        if (isMounted) {
          setInitialized(true);
        }
      } catch (error) {
        console.error('初始化生肖能量组件失败:', error);

        // 降级处理：使用默认逻辑
        await loadAllZodiacs();
        setUserZodiac('鼠');
        setTempZodiac('');
        if (isMounted) {
          setInitialized(true);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      if (removeListener.current) {
        removeListener.current();
      }
    };
  }, [loadAllZodiacs, zodiacs]);

  // 当生肖或日期变化时重新加载数据 - 优化加载逻辑
  useEffect(() => {
    if (!userZodiac || !initialized) return;

    // 仅在首次默认加载或用户主动切换时执行数据请求
    if (!dataLoaded) {
      const timer = setTimeout(() => {
        loadEnergyGuidance();
        setDataLoaded(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [userZodiac, selectedDate, loadEnergyGuidance, initialized, dataLoaded, userInfo.zodiacAnimal, tempZodiac]);

  // 本地日期格式化方法
  const formatDateLocal = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 处理生肖选择 - 支持临时查看模式
  const handleZodiacChange = async (zodiac) => {
    if (userZodiac !== zodiac) {
      // 如果是用户配置的生肖，清除临时标记
      if (zodiac === userInfo.zodiacAnimal) {
        setTempZodiac('');
      } else {
        // 否则设置为临时生肖
        setTempZodiac(zodiac);
      }

      setUserZodiac(zodiac);
      // 标记需要重新加载数据
      setDataLoaded(false);
    }
  };

  // 重置为默认生肖
  const resetToDefaultZodiac = () => {
    const defaultZodiac = userInfo.zodiacAnimal || '鼠';
    setTempZodiac('');
    setUserZodiac(defaultZodiac);
    setDataLoaded(false);
  };

  // 处理日期选择 - 仅更新状态，不保存配置
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    // 标记需要重新加载数据
    setDataLoaded(false);
  };

  // 渲染能量匹配度仪表板
  const renderEnergyMatchDashboard = () => {
    if (!energyGuidance?.energyMatch) return null;

    const { 匹配度, 关系, 描述, 用户五行, 当日五行 } = energyGuidance.energyMatch;
    const elementData = wuxingElements.find(el => el.name === 当日五行);

    // 根据匹配度设置颜色
    let colorClass = 'text-green-500';
    if (匹配度 < 40) colorClass = 'text-red-500';
    else if (匹配度 < 70) colorClass = 'text-yellow-500';

    // 根据主题设置SVG背景色
    const bgColor = theme === 'dark' ? '#374151' : '#e5e7eb';
    const textColor = theme === 'dark' ? '#ffffff' : '#1f2937';

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          能量匹配度
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4">
          <div className="relative w-28 h-28">
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
              <text x="18" y="20.5" textAnchor="middle" className="text-xs font-bold" fill={textColor}>
                {匹配度}%
              </text>
            </svg>
          </div>

          <div className="text-center md:text-left">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">{elementData?.icon}</span>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">能量匹配度</h3>
            </div>
            <p className={`text-lg font-bold ${colorClass} mb-2`}>
              {关系} - {匹配度}%
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-xs mb-3">{描述}</p>
            <div className="flex flex-wrap gap-1">
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

  // 渲染五行能量卡片
  const renderWuxingEnergyCard = () => {
    if (!energyGuidance?.energyMatch) return null;

    const { 当日五行 } = energyGuidance.energyMatch;
    const elementData = wuxingElements.find(el => el.name === 当日五行);

    if (!elementData) return null;

    // 根据主题设置渐变背景
    const getGradientClass = (baseColors) => {
      return theme === 'dark'
        ? 'dark:from-gray-700 dark:to-gray-600'
        : `from-${baseColors.from} to-${baseColors.to}`;
    };

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <span className="mr-2">{elementData?.icon}</span>
          {elementData.name}元素能量提升
        </h3>
        <div className="space-y-3">
          {/* 快速能量提升方法 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`bg-gradient-to-r ${getGradientClass({ from: 'blue-50', to: 'indigo-50' })} rounded p-3`}>
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                <span className="mr-2">⚡</span> {elementData.quickBoost.method}
              </h4>
              <p className="text-xs text-gray-700 dark:text-gray-300">{elementData.quickBoost.description}</p>
            </div>

            <div className={`bg-gradient-to-r ${getGradientClass({ from: 'purple-50', to: 'pink-50' })} rounded p-3`}>
              <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center">
                <span className="mr-2">🌟</span> {elementData.quickBoost.secondMethod}
              </h4>
              <p className="text-xs text-gray-700 dark:text-gray-300">{elementData.quickBoost.secondDescription}</p>
            </div>
          </div>

          {/* 五行养生运动 */}
          <div className={`bg-gradient-to-r ${getGradientClass({ from: 'green-50', to: 'emerald-50' })} rounded p-3`}>
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
              <span className="mr-2">🏃</span> {elementData.name}行运动
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300">{elementData.exercise}</p>
          </div>

          {/* 呼吸调息法 */}
          <div className={`bg-gradient-to-r ${getGradientClass({ from: 'orange-50', to: 'amber-50' })} rounded p-3`}>
            <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2 flex items-center">
              <span className="mr-2">🫁</span> {elementData.timeSlot} 呼吸调息
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300">{elementData.breathingMethod}</p>
          </div>
        </div>
      </div>
    );
  };

  // 渲染生活建议卡片
  const renderLifestyleCard = () => {
    if (!energyGuidance?.生活建议) return null;

    const { 幸运颜色, 适合饰品, 适合行业, 幸运方位, 能量提升 } = energyGuidance.生活建议;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
          </svg>
          生活习惯调整建议
        </h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
              <span className="mr-1">🎨</span> 幸运颜色
            </h4>
            <div className="flex flex-wrap gap-1">
              {幸运颜色.map((color, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-xs text-gray-700 dark:text-gray-200 border border-blue-200 dark:border-blue-700">
                  {color}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center">
              <span className="mr-1">💎</span> 适合饰品
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300">{适合饰品.join('、')}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center">
              <span className="mr-1">💼</span> 适合行业
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300">{适合行业.join('、')}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center">
              <span className="mr-1">🧭</span> 幸运方位
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300">{幸运方位.join('、')}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center">
              <span className="mr-1">⚡</span> 能量提升方法
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300 bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-20 p-2 rounded">{能量提升}</p>
          </div>
        </div>
      </div>
    );
  };

  // 渲染饮食调理卡片 - 左右分栏式设计
  const renderFoodCard = () => {
    if (!energyGuidance?.饮食调理) return null;

    const { 宜, 忌 } = energyGuidance.饮食调理;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          饮食调理建议
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 左侧：宜食食物 */}
          <div className="h-full">
            <div className="h-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-4 border border-green-200 dark:border-green-800 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 dark:bg-green-900/50 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-green-600 dark:text-green-400">✅</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-green-800 dark:text-green-300">宜食食物</h4>
                  <p className="text-[10px] text-green-600 dark:text-green-500 opacity-80">推荐增加摄入的类别</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {宜.map((food, index) => (
                  <div key={index} className="flex items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2.5 rounded-lg border border-green-100 dark:border-green-800/50 transition-all hover:translate-x-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2.5 flex-shrink-0"></span>
                    <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">{food}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：忌食食物 */}
          <div className="h-full">
            <div className="h-full bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 rounded-xl p-4 border border-red-200 dark:border-red-800 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="bg-red-100 dark:bg-red-900/50 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-red-600 dark:text-red-400">❌</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-800 dark:text-red-300">忌食食物</h4>
                  <p className="text-[10px] text-red-600 dark:text-red-500 opacity-80">建议暂时避免摄入</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {忌.map((food, index) => (
                  <div key={index} className="flex items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2.5 rounded-lg border border-red-100 dark:border-red-800/50 transition-all hover:translate-x-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2.5 flex-shrink-0"></span>
                    <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">{food}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 底部建议说明 */}
        <div className="mt-4 text-center">
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              💡 饮食调理建议：根据五行相生相克原理，合理搭配食物有助于提升能量平衡
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 渲染家居风水卡片
  const renderFengshuiCard = () => {
    if (!energyGuidance?.家居风水) return null;

    const { 家居布置, 摆放位置, 建议 } = energyGuidance.家居风水;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          家居风水调整
        </h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center">
              <span className="mr-1">🏡</span> 家居布置
            </h4>
            <div className="flex flex-wrap gap-1">
              {家居布置.map((item, index) => (
                <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded-full text-xs text-gray-700 dark:text-gray-200 border border-purple-200 dark:border-purple-700">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center">
              <span className="mr-1">📍</span> 摆放位置
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300">{摆放位置.join('、')}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-pink-700 dark:text-pink-300 mb-2 flex items-center">
              <span className="mr-1">💡</span> 风水建议
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300 bg-pink-50 dark:bg-pink-900 dark:bg-opacity-20 p-2 rounded">{建议}</p>
          </div>
        </div>
      </div>
    );
  };

  // 渲染人际关系卡片
  const renderRelationshipCard = () => {
    if (!energyGuidance?.人际关系) return null;

    const { 适合交往的五行, 适合交往的生肖, 建议 } = energyGuidance.人际关系;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          人际关系调整
        </h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center">
              <span className="mr-1">🌟</span> 适合交往的五行
            </h4>
            <div className="flex flex-wrap gap-1">
              {适合交往的五行.map((element, index) => {
                const elementData = wuxingElements.find(el => el.name === element);
                return (
                  <span key={index} className="px-2 py-1 bg-amber-100 dark:bg-amber-900 rounded-full text-xs text-gray-700 dark:text-gray-200 border border-amber-200 dark:border-amber-700 flex items-center">
                    <span className="mr-1">{elementData?.icon}</span>
                    {element}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center">
              <span className="mr-1">🐲</span> 适合交往的生肖
            </h4>
            <div className="flex flex-wrap gap-1">
              {适合交往的生肖.map((zodiac, index) => (
                <span key={index} className="px-2 py-1 bg-orange-100 dark:bg-orange-900 rounded-full text-xs text-gray-700 dark:text-gray-200 border border-orange-200 dark:border-orange-700">
                  {zodiac}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center">
              <span className="mr-1">💡</span> 交往建议
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-2 rounded">{建议}</p>
          </div>
        </div>
      </div>
    );
  };

  // 渲染能量趋势图 - 增强版（包含财运和事业趋势）
  // 优化的能量趋势图组件
  const EnergyTrendChart = useMemo(() => {
    if (!userZodiac) return null;

    // 生成确定性的过去7天数据，避免因Math.random导致的频繁渲染
    const generateWeeklyData = () => {
      const dates = [];
      const energyScores = [];
      const wealthScores = [];
      const careerScores = [];

      // 使用生肖和日期作为种子
      const seedBase = userZodiac.charCodeAt(0);

      for (let i = 6; i >= 0; i--) {
        const date = new Date(selectedDate);
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
    };

    const { dates, energyScores, wealthScores, careerScores } = generateWeeklyData();

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
        duration: 1000 // 增加动画时长，让体验更丝滑
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
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          近7日能量趋势分析
        </h3>
        <div className="h-72">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <div className="text-blue-600 dark:text-blue-400 text-[10px] font-bold">能量指数</div>
            <div className="text-base font-black text-blue-700 dark:text-blue-300">
              {energyScores[energyScores.length - 1]}%
            </div>
          </div>
          <div className="bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
            <div className="text-amber-600 dark:text-amber-400 text-[10px] font-bold">财运趋势</div>
            <div className="text-base font-black text-amber-700 dark:text-amber-300">
              {wealthScores[wealthScores.length - 1]}%
            </div>
          </div>
          <div className="bg-green-50/50 dark:bg-green-900/10 p-2 rounded-lg border border-green-100 dark:border-green-900/30">
            <div className="text-green-600 dark:text-green-300 text-[10px] font-bold">事业趋势</div>
            <div className="text-base font-black text-green-700 dark:text-green-300">
              {careerScores[careerScores.length - 1]}%
            </div>
          </div>
        </div>
        <div className="mt-3 text-[10px] text-gray-400 dark:text-gray-500 text-center italic">
          注：数据基于个人生肖属性与当日五行气场精密计算得出
        </div>
      </div>
    );
  }, [userZodiac, selectedDate, theme]);

  // 渲染生肖选择器
  const renderZodiacSelector = () => {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
          生肖能量选择
        </h3>
        <div className="space-y-4">
          <div>
            {/* 当前用户信息 */}
            {(userInfo.zodiacAnimal || tempZodiac) && (
              <div className="mb-4 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 shadow-sm backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-3">
                      <span className="text-xl">🧬</span>
                    </div>
                    <div>
                      <p className="text-blue-800 dark:text-blue-300 text-sm font-semibold">
                        {userInfo.zodiacAnimal ? (
                          <>我的生肖：<span className="text-lg font-black text-blue-600 dark:text-blue-400">{userInfo.zodiacAnimal}</span></>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">尚未配置个人生肖</span>
                        )}
                      </p>
                      {tempZodiac && tempZodiac !== userInfo.zodiacAnimal && (
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                          🔔 当前正在预览测试生肖能量
                        </p>
                      )}
                    </div>
                  </div>

                  {tempZodiac && tempZodiac !== userInfo.zodiacAnimal && (
                    <div className="flex items-center bg-orange-100/80 dark:bg-orange-900/40 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/50">
                      <span className="text-xs font-bold text-orange-700 dark:text-orange-300">
                        当前查看：{tempZodiac}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 提示文本 */}
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
              ✨ 点击任意生肖图标查看能量指引，临时查看不会保存配置
            </div>

            {/* 炫彩生肖选择器 */}
            <div className="mb-4">
              <ChineseZodiacSelector
                selectedZodiac={userZodiac}
                onZodiacChange={handleZodiacChange}
                size="md"
                showLabels={true}
                gridLayout="4"
                className="chinese-zodiac-selector-energy"
              />
            </div>

            {/* 日期选择器 */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                查看指定日期的能量指引
              </label>
              <input
                type="date"
                value={selectedDate ? formatDateLocal(selectedDate) : ''}
                onChange={(e) => {
                  const newDate = e.target.value ? new Date(e.target.value) : new Date();
                  handleDateChange(newDate);
                }}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm transition-colors"
              />
            </div>
          </div>

          {/* 重置按钮 */}
          {tempZodiac && tempZodiac !== userInfo.zodiacAnimal && (
            <div className="flex justify-center pt-2">
              <button
                onClick={resetToDefaultZodiac}
                className="flex items-center gap-2 text-sm font-bold bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-6 py-2.5 rounded-full border-2 border-blue-100 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
              >
                <span>🔄</span> 返回您的生肖 {userInfo.zodiacAnimal && `(${userInfo.zodiacAnimal})`}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
      {/* 核心滚动容器：包含 Banner 和 内容，确保进入时看到顶部 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar scroll-performance-optimized bg-white dark:bg-black -webkit-overflow-scrolling-touch">
        {/* Banner区域 - 随页面滚动 */}
        <div className="traditional-zodiac-banner text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 flex-shrink-0">
          {/* 传统生肖渐变背景 */}
          <div className="absolute inset-0 zodiac-gradient z-0 bg-gradient-to-r from-red-500/30 via-orange-400/30 to-yellow-400/30"></div>

          {/* 传统生肖装饰符号 */}
          <div className="absolute top-2 left-2 w-12 h-12 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* 生肖龙图案 */}
              <path d="M30,30 Q40,20 50,30 T70,30" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M30,40 Q40,50 50,40 T70,40" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="35" cy="25" r="2" fill="currentColor" />
              <circle cx="65" cy="35" r="2" fill="currentColor" />
              <path d="M25,35 L30,30" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M25,45 L30,40" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <div className="absolute bottom-2 right-2 w-14 h-14 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* 生肖凤凰图案 */}
              <path d="M30,60 Q40,50 50,60 T70,60" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M30,70 Q40,80 50,70 T70,70" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M75,65 Q80,60 75,55" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="35" cy="55" r="2" fill="currentColor" />
              <circle cx="65" cy="65" r="2" fill="currentColor" />
            </svg>
          </div>

          {/* 传统纹饰边框 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400"></div>
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-400 via-orange-500 to-red-600"></div>
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-red-600 via-orange-500 to-yellow-400"></div>

          {/* 传统装饰角 */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-300"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-yellow-300"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-yellow-300"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-300"></div>

          <div className="container mx-auto px-4 py-3 md:py-6 relative z-10 text-center">
            <h1 className="text-xl md:text-2xl font-bold mb-1 text-shadow-lg traditional-zodiac-title">
              <span className="inline-block transform hover:scale-105 transition-transform duration-300">
                生肖运势
              </span>
            </h1>
            <p className="text-white text-xs md:text-base opacity-95 font-medium traditional-zodiac-subtitle mb-2">
              传统生肖·运势分析·吉祥如意
            </p>
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <span className="text-[10px] md:text-xs bg-red-500/60 text-white px-2 py-0.5 rounded-full border border-white/20 shadow-sm">🐭</span>
              <span className="text-[10px] md:text-xs bg-orange-500/60 text-white px-2 py-0.5 rounded-full border border-white/20 shadow-sm">🐂</span>
              <span className="text-[10px] md:text-xs bg-yellow-500/60 text-white px-2 py-0.5 rounded-full border border-white/20 shadow-sm">🐅</span>
              <span className="text-[10px] md:text-xs bg-green-500/60 text-white px-2 py-0.5 rounded-full border border-white/20 shadow-sm">🐇</span>
              <span className="text-[10px] md:text-xs bg-blue-500/60 text-white px-2 py-0.5 rounded-full border border-white/20 shadow-sm">🐉</span>
            </div>
          </div>
        </div>

        {/* 内容展示区域 - 使用DressHealthTab的边距样式 */}
        <div className="container mx-auto px-4 py-4 md:px-4 md:py-6 bg-white dark:bg-black flex-1">
          <div className="mb-4 mx-auto max-w-2xl h-full">
            <div className="space-y-3 h-full">
      {/* 生肖选择器 */}
      {renderZodiacSelector()}

      {/* 加载状态 */}
      {loading && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-300 text-xs">正在加载能量指引...</p>
          </div>
        </div>
      )}

      {/* 错误显示 */}
      {error && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded p-3">
            <p className="text-red-700 dark:text-red-300 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* 能量指引内容 */}
      {!loading && !error && energyGuidance && userZodiac && (
        <div className="space-y-3">
          {/* 能量匹配度仪表板 */}
          {renderEnergyMatchDashboard()}

          {/* 五行能量提升卡片 */}
          {renderWuxingEnergyCard()}

          {/* 能量趋势图 */}
          {EnergyTrendChart}

          {/* 分类建议卡片 */}
          {renderLifestyleCard()}
          {renderFoodCard()}
          {renderFengshuiCard()}
          {renderRelationshipCard()}

          {/* 底部信息 */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-center text-gray-500 dark:text-gray-400 text-xs p-3">
              <p>数据更新时间：{new Date().toLocaleString()}</p>
              <p className="mt-1">五行讲究动态平衡，请根据自身状态灵活调整养生方法</p>
            </div>
          </div>
        </div>
      )}

      {/* 未选择生肖时的提示 */}
      {!loading && !error && !userZodiac && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🐉</div>
            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">请选择您的生肖</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs max-w-xs mx-auto">
              选择生肖后，将为您提供个性化的每日能量指引
            </p>
          </div>
        </div>

      )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ZodiacEnergyTab;