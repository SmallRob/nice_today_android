import React, { useState, useEffect, useCallback } from 'react';
import { desktopZodiacEnergyService, isDesktopApp } from '../services/desktopService';
import { storageManager } from '../utils/storageManager';

const ZodiacEnergyTab = ({ apiBaseUrl, serviceStatus, isDesktop }) => {
  // 状态管理
  const [userZodiac, setUserZodiac] = useState('');
  const [energyGuidance, setEnergyGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allZodiacs, setAllZodiacs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 五行元素数据
  const getWuxingElements = () => {
    return [
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
  };

  // 从存储管理器获取用户生肖
  const getStoredZodiac = () => {
    return storageManager.getUserZodiac();
  };

  // 保存生肖到存储管理器
  const saveZodiac = (zodiac) => {
    if (zodiac) {
      storageManager.setUserZodiac(zodiac);
    }
  };

  // 获取所有生肖列表
  const loadAllZodiacs = useCallback(async () => {
    try {
      if (isDesktop && isDesktopApp() && window.electronAPI?.zodiacEnergy) {
        const result = await window.electronAPI.zodiacEnergy.getAllZodiacs();
        if (result.success) {
          setAllZodiacs(result.data || []);
        }
      }
    } catch (error) {
      console.error('获取生肖列表失败:', error);
      // 使用默认生肖列表
      setAllZodiacs(['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']);
    }
  }, [isDesktop]);

  // 根据年份计算生肖
  const calculateZodiacFromYear = useCallback(async (year) => {
    try {
      if (isDesktop && isDesktopApp() && window.electronAPI?.zodiacEnergy) {
        const result = await window.electronAPI.zodiacEnergy.getZodiacFromYear(year);
        if (result.success && result.data) {
          setUserZodiac(result.data);
          saveZodiac(result.data);
          storageManager.setBirthYear(year); // 保存出生年份
        }
      }
    } catch (error) {
      console.error('根据年份计算生肖失败:', error);
    }
  }, [isDesktop]);

  // 加载能量指引数据
  const loadEnergyGuidance = useCallback(async () => {
    if (!userZodiac) return;

    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (isDesktop && isDesktopApp() && window.electronAPI?.zodiacEnergy) {
        const dateStr = selectedDate ? formatDateLocal(selectedDate) : null;
        
        if (dateStr && dateStr !== formatDateLocal(new Date())) {
          // 获取指定日期的能量指引
          result = await window.electronAPI.zodiacEnergy.getDate(userZodiac, dateStr);
        } else {
          // 获取今日能量指引
          result = await window.electronAPI.zodiacEnergy.getToday(userZodiac);
        }
      }

      if (result && result.success) {
        setEnergyGuidance(result.data);
      } else {
        // 如果API调用失败，创建模拟数据
        const wuxingElements = getWuxingElements();
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
      }
    } catch (error) {
      console.error('加载能量指引失败:', error);
      setError(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [userZodiac, selectedDate, isDesktop]);

  // 初始化组件
  useEffect(() => {
    const initialize = async () => {
      await loadAllZodiacs();
      const storedZodiac = getStoredZodiac();
      if (storedZodiac) {
        setUserZodiac(storedZodiac);
      }
    };
    
    initialize();
  }, [loadAllZodiacs]);

  // 当生肖或日期变化时重新加载数据
  useEffect(() => {
    if (userZodiac) {
      loadEnergyGuidance();
    }
  }, [userZodiac, selectedDate, loadEnergyGuidance]);

  // 本地日期格式化方法
  const formatDateLocal = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 处理生肖选择
  const handleZodiacChange = (zodiac) => {
    setUserZodiac(zodiac);
    saveZodiac(zodiac);
  };

  // 处理年份输入
  const handleYearInput = (event) => {
    const year = parseInt(event.target.value);
    if (year && year > 1900 && year < 2100) {
      calculateZodiacFromYear(year);
    }
  };

  // 渲染能量匹配度仪表板
  const renderEnergyMatchDashboard = () => {
    if (!energyGuidance?.energyMatch) return null;

    const { 匹配度, 关系, 描述, 用户五行, 当日五行 } = energyGuidance.energyMatch;
    const elementData = getWuxingElements().find(el => el.name === 当日五行);
    
    // 根据匹配度设置颜色
    let colorClass = 'text-green-500';
    if (匹配度 < 40) colorClass = 'text-red-500';
    else if (匹配度 < 70) colorClass = 'text-yellow-500';

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <span className="text-3xl mr-3">{elementData?.icon}</span>
          今日能量匹配度
        </h3>
        
        {/* 能量匹配度圆形进度条 */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={匹配度 < 40 ? '#ef4444' : 匹配度 < 70 ? '#f59e0b' : '#10b981'}
                strokeWidth="3"
                strokeDasharray={`${匹配度}, 100`}
              />
              <text x="18" y="20.5" textAnchor="middle" className="text-3xl font-bold fill-gray-800 dark:fill-white">
                {匹配度}%
              </text>
            </svg>
          </div>
          
          <div className="text-center md:text-left">
            <p className={`text-3xl font-bold ${colorClass} mb-2`}>
              {关系} - {匹配度}%
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-3 text-lg">{描述}</p>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                用户五行: <span className="font-semibold">{用户五行}</span>
              </span>
              <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
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
    const elementData = getWuxingElements().find(el => el.name === 当日五行);
    
    if (!elementData) return null;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="text-3xl mr-3">{elementData.icon}</span>
          {elementData.name}元素能量提升
        </h3>
        
        {/* 快速能量提升方法 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
              <span className="mr-2">⚡</span> {elementData.quickBoost.method}
            </h4>
            <p className="text-gray-700 dark:text-gray-300">{elementData.quickBoost.description}</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center">
              <span className="mr-2">🌟</span> {elementData.quickBoost.secondMethod}
            </h4>
            <p className="text-gray-700 dark:text-gray-300">{elementData.quickBoost.secondDescription}</p>
          </div>
        </div>
        
        {/* 五行养生运动 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
            <span className="mr-2">🏃</span> {elementData.name}行运动
          </h4>
          <p className="text-gray-700 dark:text-gray-300">{elementData.exercise}</p>
        </div>
        
        {/* 呼吸调息法 */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-2 flex items-center">
            <span className="mr-2">🫁</span> {elementData.timeSlot} 呼吸调息
          </h4>
          <p className="text-gray-700 dark:text-gray-300">{elementData.breathingMethod}</p>
        </div>
      </div>
    );
  };

  // 渲染生活建议卡片
  const renderLifestyleCard = () => {
    if (!energyGuidance?.生活建议) return null;

    const { 幸运颜色, 适合饰品, 适合行业, 幸运方位, 能量提升 } = energyGuidance.生活建议;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">💼</span> 生活习惯调整建议
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 text-lg">幸运颜色</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {幸运颜色.map((color, index) => (
                <span key={index} className="px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full text-sm text-gray-700 dark:text-gray-200 border border-blue-200 dark:border-blue-700">
                  {color}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 text-lg">适合饰品</h4>
            <p className="text-gray-700 dark:text-gray-300 text-lg">{适合饰品.join('、')}</p>
          </div>

          <div>
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2 text-lg">适合行业</h4>
            <p className="text-gray-700 dark:text-gray-300 text-lg">{适合行业.join('、')}</p>
          </div>

          <div>
            <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2 text-lg">幸运方位</h4>
            <p className="text-gray-700 dark:text-gray-300 text-lg">{幸运方位.join('、')}</p>
          </div>

          <div>
            <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2 text-lg">能量提升方法</h4>
            <p className="text-gray-700 dark:text-gray-300 text-lg bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-30 p-3 rounded-lg">{能量提升}</p>
          </div>
        </div>
      </div>
    );
  };

  // 渲染饮食调理卡片
  const renderFoodCard = () => {
    if (!energyGuidance?.饮食调理) return null;

    const { 宜, 忌 } = energyGuidance.饮食调理;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">🍎</span> 饮食调理建议
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-4 text-lg flex items-center">
              <span className="mr-2">✅</span> 宜食食物
            </h4>
            <div className="space-y-3">
              {宜.map((food, index) => (
                <div key={index} className="flex items-center bg-green-50 dark:bg-green-900 dark:bg-opacity-20 p-3 rounded-lg">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                  <span className="text-gray-700 dark:text-gray-300 text-lg">{food}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-red-700 dark:text-red-300 mb-4 text-lg flex items-center">
              <span className="mr-2">❌</span> 忌食食物
            </h4>
            <div className="space-y-3">
              {忌.map((food, index) => (
                <div key={index} className="flex items-center bg-red-50 dark:bg-red-900 dark:bg-opacity-20 p-3 rounded-lg">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                  <span className="text-gray-700 dark:text-gray-300 text-lg">{food}</span>
                </div>
              ))}
            </div>
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">🏠</span> 家居风水调整
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 text-lg">家居布置</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {家居布置.map((item, index) => (
                <span key={index} className="px-4 py-2 bg-purple-100 dark:bg-purple-900 rounded-full text-sm text-gray-700 dark:text-gray-200 border border-purple-200 dark:border-purple-700">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2 text-lg">摆放位置</h4>
            <p className="text-gray-700 dark:text-gray-300 text-lg">{摆放位置.join('、')}</p>
          </div>

          <div>
            <h4 className="font-semibold text-pink-700 dark:text-pink-300 mb-2 text-lg">风水建议</h4>
            <p className="text-gray-700 dark:text-gray-300 text-lg bg-pink-50 dark:bg-pink-900 dark:bg-opacity-20 p-3 rounded-lg">{建议}</p>
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
          <span className="mr-3">👥</span> 人际关系调整
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2 text-lg">适合交往的五行</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {适合交往的五行.map((element, index) => {
                const elementData = getWuxingElements().find(el => el.name === element);
                return (
                  <span key={index} className="px-4 py-2 bg-amber-100 dark:bg-amber-900 rounded-full text-sm text-gray-700 dark:text-gray-200 border border-amber-200 dark:border-amber-700 flex items-center">
                    <span className="mr-1">{elementData?.icon}</span>
                    {element}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2 text-lg">适合交往的生肖</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {适合交往的生肖.map((zodiac, index) => (
                <span key={index} className="px-4 py-2 bg-orange-100 dark:bg-orange-900 rounded-full text-sm text-gray-700 dark:text-gray-200 border border-orange-200 dark:border-orange-700">
                  {zodiac}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2 text-lg">交往建议</h4>
            <p className="text-gray-700 dark:text-gray-300 text-lg bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-3 rounded-lg">{建议}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            🌟 每日生肖能量指引
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            根据您的生肖属相和当日五行，为您提供全面的生活健康建议，帮助您调整身心状态，提升生活品质
          </p>
        </div>

        {/* 生肖选择器 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="mr-3">🐉</span> 选择您的生肖
          </h2>
          
          <div className="space-y-6">
            {/* 年份输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                根据出生年份计算生肖
              </label>
              <input
                type="number"
                placeholder="例如：1991"
                min="1900"
                max="2100"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                onBlur={handleYearInput}
              />
            </div>

            {/* 生肖选择网格 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                或者直接选择生肖
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {(allZodiacs.length > 0 ? allZodiacs : ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']).map((zodiac) => (
                  <button
                    key={zodiac}
                    onClick={() => handleZodiacChange(zodiac)}
                    className={`p-4 rounded-xl text-center transition-all duration-200 text-lg font-semibold ${
                      userZodiac === zodiac
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                    }`}
                  >
                    {zodiac}
                  </button>
                ))}
              </div>
            </div>

            {/* 日期选择器 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                查看指定日期的能量指引
              </label>
              <input
                type="date"
                value={selectedDate ? formatDateLocal(selectedDate) : ''}
                onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : new Date())}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* 当前选择显示 */}
          {userZodiac && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 dark:bg-opacity-30 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-blue-700 dark:text-blue-300 font-medium text-lg">
                当前选择：<span className="font-bold">{userZodiac}</span>生肖
                {selectedDate && (
                  <span className="ml-4">
                    查看日期：<span className="font-bold">{formatDateLocal(selectedDate)}</span>
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">正在加载能量指引...</p>
          </div>
        )}

        {/* 错误显示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg p-6 mb-6">
            <p className="text-red-700 dark:text-red-300 text-lg">{error}</p>
          </div>
        )}

        {/* 能量指引内容 */}
        {!loading && !error && energyGuidance && userZodiac && (
          <div>
            {/* 能量匹配度仪表板 */}
            {renderEnergyMatchDashboard()}
            
            {/* 五行能量提升卡片 */}
            {renderWuxingEnergyCard()}

            {/* 分类建议卡片 */}
            <div className="grid gap-6">
              {renderLifestyleCard()}
              {renderFoodCard()}
              {renderFengshuiCard()}
              {renderRelationshipCard()}
            </div>

            {/* 底部信息 */}
            <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p>数据更新时间：{new Date().toLocaleString()}</p>
              <p className="mt-1">五行讲究动态平衡，请根据自身状态灵活调整养生方法</p>
            </div>
          </div>
        )}

        {/* 未选择生肖时的提示 */}
        {!loading && !error && !userZodiac && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-8xl mb-6">🐉</div>
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">请选择您的生肖</h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto">
              选择生肖后，将为您提供个性化的每日能量指引，帮助您调整身心状态，提升生活品质
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZodiacEnergyTab;