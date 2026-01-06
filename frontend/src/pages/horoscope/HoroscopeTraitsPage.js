import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useUserConfig } from '../../contexts/UserConfigContext';
import { HOROSCOPE_DATA_ENHANCED, generateDailyHoroscope, normalizeZodiacParam } from '../../utils/horoscopeAlgorithm';
import { memo } from 'react';
import { Line } from 'react-chartjs-2';
import { ensureChartRegistered } from '../../utils/chartConfig';
import '../../styles/horoscope-traits-page.css';

const HoroscopeTraitsPage = () => {
  const navigate = useNavigate();
  const { zodiacName } = useParams();
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();
  const location = useLocation();

  // 优化参数获取：使用URL参数优先级高于内部状态
  const [currentHoroscope, setCurrentHoroscope] = useState(() => {
    // 多层级参数获取：URL参数 > 传递状态 > 用户配置 > 默认值
    const stateZodiac = location.state?.userZodiac;
    const configZodiac = currentConfig?.zodiac;

    // 解码URL参数（防止移动端编码问题）
    const decodedZodiacName = zodiacName ? decodeURIComponent(zodiacName) : '';

    // 使用 normalizeZodiacParam 统一处理参数（支持数字编码和中文名称）
    const normalizedZodiac = normalizeZodiacParam(decodedZodiacName || stateZodiac || configZodiac);
    console.log('初始化星座参数:', { zodiacName: decodedZodiacName, stateZodiac, configZodiac, normalizedZodiac });

    return normalizedZodiac;
  });
  
  // 运势数据状态
  const [horoscopeData, setHoroscopeData] = useState(null);
  const [loadingHoroscope, setLoadingHoroscope] = useState(false);

  // 优化性能：将辅助函数移出组件内部，避免每次渲染重新创建
  
// 获取元素颜色
const getElementColor = (element) => {
  const colors = {
    '火象': { text: 'text-red-600 dark:text-red-400', bg: 'from-red-500', to: 'to-orange-500' },
    '土象': { text: 'text-green-600 dark:text-green-400', bg: 'from-green-500', to: 'to-emerald-500' },
    '风象': { text: 'text-blue-600 dark:text-blue-400', bg: 'from-blue-500', to: 'to-cyan-500' },
    '水象': { text: 'text-purple-600 dark:text-purple-400', bg: 'from-purple-500', to: 'to-pink-500' }
  };
  return colors[element] || { text: 'text-gray-600 dark:text-gray-100', bg: 'from-gray-500', to: 'to-gray-600' };
};

// 获取颜色中文名称
const getColorName = (hexColor) => {
  const colorMap = {
    '#FF6B6B': '浅红', '#FF8E53': '橙红', '#FFD700': '金色', '#FFA500': '橙色',
    '#4ECDC4': '青绿', '#44A08D': '深绿', '#64B3F4': '浅蓝', '#4A90E2': '蓝色',
    '#96CEB4': '浅绿', '#FFEAA7': '淡黄', '#DA70D6': '兰紫', '#BA55D3': '紫色',
    '#808080': '灰色', '#A9A9A9': '浅灰', '#00BFFF': '深蓝', '#1E90FF': '天蓝',
    '#9370DB': '紫红', '#8A2BE2': '深紫'
  };
  return colorMap[hexColor] || '红色';
};

// 获取星座详细描述
const getZodiacDescription = (zodiacName) => {
  const descriptions = {
    '白羊座': '白羊座是十二星座中的第一个星座，象征着新生和开始。他们充满活力、勇敢无畏，是天生的领导者和冒险家。白羊座的人热情洋溢，总是充满干劲，喜欢挑战和征服新事物。',
    '金牛座': '金牛座代表着稳定和物质享受。他们务实、耐心，注重生活质量，是可靠的朋友和合作伙伴。金牛座的人喜欢美好事物，对美食、艺术有独特的品味。',
    '双子座': '双子座是沟通和学习的代表。他们机智、好奇，善于交际，永远保持着对世界的好奇心。双子座的人思维敏捷，善于表达，喜欢新鲜刺激的体验。',
    '巨蟹座': '巨蟹座象征着家庭和情感。他们敏感、体贴，重视家庭关系，具有强烈的保护欲和同理心。巨蟹座的人情感丰富，喜欢营造温馨的家庭氛围。',
    '狮子座': '狮子座代表着自信和创造力。他们热情、慷慨，喜欢成为焦点，具有天生的领导魅力。狮子座的人自信满满，喜欢展现自己的才华和魅力。',
    '处女座': '处女座象征着完美和服务。他们细致、务实，注重细节，追求完美和秩序。处女座的人分析能力强，喜欢帮助他人解决问题。',
    '天秤座': '天秤座代表着平衡和和谐。他们优雅、公正，重视人际关系，追求美和平衡。天秤座的人善于协调，注重外表和礼仪，喜欢和谐的氛围。',
    '天蝎座': '天蝎座象征着深度和神秘。他们强烈、直觉敏锐，具有深刻的洞察力和强大的意志力。天蝎座的人情感深沉，追求真相和深度。',
    '射手座': '射手座代表着自由和探索。他们乐观、爱冒险，追求知识和真理，具有哲学思维。射手座的人向往自由，喜欢旅行和探索未知。',
    '摩羯座': '摩羯座象征着责任和成就。他们实际、有耐心，目标明确，具有强烈的责任感。摩羯座的人勤奋务实，注重事业发展和长期目标。',
    '水瓶座': '水瓶座代表着创新和独立。他们思想前卫、人道主义，重视自由和进步。水瓶座的人思维独特，喜欢创新和改革，关注社会问题。',
    '双鱼座': '双鱼座象征着梦想和同情心。他们富有想象力、直觉强，具有艺术天赋和同理心。双鱼座的人浪漫敏感，富有创造力，容易被感性事物打动。'
  };
  return descriptions[zodiacName] || `${zodiacName}具有独特的个性和魅力。`;
};

// 获取星座名人例子
const getFamousExamples = (zodiacName) => {
  const examples = {
    '白羊座': ['Lady Gaga', '成龙', '梵高', '艾玛·沃特森', '史蒂夫·乔布斯'],
    '金牛座': ['奥黛丽·赫本', '马克思', '莎士比亚', '乔治·卢卡斯', '威廉·莎士比亚'],
    '双子座': ['玛丽莲·梦露', '肯尼迪', '安吉丽娜·朱莉', '约翰尼·德普', '汤姆·克鲁斯'],
    '巨蟹座': ['汤姆·汉克斯', '戴安娜王妃', '海明威', '普林斯', '梅丽尔·斯特里普'],
    '狮子座': ['奥巴马', '麦当娜', '拿破仑', '詹妮弗·洛佩兹', '本·阿弗莱克'],
    '处女座': ['迈克尔·杰克逊', '巴菲特', '托尔斯泰', '碧昂丝', '基努·里维斯'],
    '天秤座': ['刘德华', '马云', '甘地', '威瑟斯彭', '马特·达蒙'],
    '天蝎座': ['比尔·盖茨', '居里夫人', '毕加索', '莱昂纳多·迪卡普里奥', '茱莉亚·罗伯茨'],
    '射手座': ['泰勒·斯威夫特', '丘吉尔', '贝多芬', '布拉德·皮特', '斯嘉丽·约翰逊'],
    '摩羯座': ['牛顿', '马丁·路德·金', '毛泽东', '扎克伯格', '基努·里维斯'],
    '水瓶座': ['爱迪生', '达尔文', '林肯', '贾斯汀·汀布莱克', '哈利·斯泰尔斯'],
    '双鱼座': ['爱因斯坦', '乔布斯', '雨果', '蕾哈娜', '丹尼尔·雷德克里夫']
  };
  return examples[zodiacName] || ['知名人物'];
};

  // 获取当前星座数据 - 添加安全检查
  const zodiacData = useMemo(() => {
    if (!HOROSCOPE_DATA_ENHANCED || !Array.isArray(HOROSCOPE_DATA_ENHANCED)) {
      console.warn('星座数据不可用或格式不正确');
      return null;
    }
    
    // 调试日志：查看当前参数状态
    console.log('当前星座参数:', {
      zodiacName: zodiacName ? decodeURIComponent(zodiacName) : '',
      stateZodiac: location.state?.userZodiac,
      configZodiac: currentConfig?.zodiac,
      currentHoroscope
    });
    
    // 优化查找逻辑：确保星座名称完全匹配，增加模糊匹配
    const decodedZodiacName = zodiacName ? decodeURIComponent(zodiacName) : '';
    
    // 1. 精确匹配
    let foundZodiac = HOROSCOPE_DATA_ENHANCED.find(h => h.name === currentHoroscope);
    
    // 2. 如果精确匹配失败，尝试模糊匹配（处理可能的空格、特殊字符等）
    if (!foundZodiac && decodedZodiacName) {
      foundZodiac = HOROSCOPE_DATA_ENHANCED.find(h => 
        h.name.replace(/\s+/g, '') === decodedZodiacName.replace(/\s+/g, '')
      );
    }
    
    // 3. 如果还是找不到，使用第一个星座作为备选
    if (!foundZodiac && HOROSCOPE_DATA_ENHANCED.length > 0) {
      console.warn(`未找到星座数据: ${currentHoroscope}，使用默认星座: ${HOROSCOPE_DATA_ENHANCED[0].name}`);
      foundZodiac = HOROSCOPE_DATA_ENHANCED[0];
    }
    
    if (!foundZodiac) {
      console.warn('星座数据完全不可用');
      console.log('可用星座列表:', HOROSCOPE_DATA_ENHANCED.map(z => z.name));
    }
    
    return foundZodiac;
  }, [currentHoroscope, zodiacName]);
  
  const elementColors = useMemo(() => {
    if (!zodiacData?.element) {
      console.warn('星座元素数据不可用');
      return getElementColor(null); // 返回默认颜色
    }
    return getElementColor(zodiacData.element);
  }, [zodiacData]);
  
  // 生成每日运势数据
  const generateDailyHoroscopeData = useCallback(async () => {
    if (!currentHoroscope) return;
    
    setLoadingHoroscope(true);
    try {
      const data = generateDailyHoroscope(currentHoroscope);
      setHoroscopeData(data);
    } catch (error) {
      console.error('生成运势数据失败:', error);
      // 即使生成失败，也设置一个默认的运势数据
      setHoroscopeData({
        overallScore: 75,
        overallDescription: '今日运势平稳，保持积极心态会有不错的发展。',
        dailyForecast: {
          love: { score: 70, description: '良好', trend: '上升' },
          wealth: { score: 65, description: '良好', trend: '平稳' },
          career: { score: 75, description: '良好', trend: '上升' },
          study: { score: 80, description: '很好', trend: '上升' },
          social: { score: 70, description: '良好', trend: '上升' }
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
  }, [currentHoroscope]);

  // 优化：确保所有来源的参数与内部状态同步
  useEffect(() => {
    // 检查URL参数、状态和配置中的星座
    const stateZodiac = location.state?.userZodiac;
    const configZodiac = currentConfig?.zodiac;

    // 解码URL参数
    const decodedZodiacName = zodiacName ? decodeURIComponent(zodiacName) : '';

    // 使用 normalizeZodiacParam 统一处理参数（支持数字编码和中文名称）
    const targetZodiac = normalizeZodiacParam(decodedZodiacName || stateZodiac || configZodiac);

    // 只有当目标星座有效且与当前不同时才更新
    if (targetZodiac && targetZodiac !== currentHoroscope) {
      console.log('更新星座参数:', { from: currentHoroscope, to: targetZodiac, source: zodiacName ? 'URL' : stateZodiac ? 'State' : 'Config' });
      setCurrentHoroscope(targetZodiac);
    }
  }, [zodiacName, location.state?.userZodiac, currentConfig?.zodiac]);
  
  // 当星座变化时，重新生成运势数据
  useEffect(() => {
    if (currentHoroscope) {
      generateDailyHoroscopeData();
    }
  }, [currentHoroscope, generateDailyHoroscopeData]);

  // 确保 Chart.js 组件已注册
  useEffect(() => {
    ensureChartRegistered();
  }, []);

  // 生成每周运势趋势数据 - 确定性算法
  const weeklyTrendData = useMemo(() => {
    if (!currentHoroscope) return { dates: [], energyScores: [], wealthScores: [], careerScores: [], healthScores: [] };

    const dates = [];
    const energyScores = [];
    const wealthScores = [];
    const careerScores = [];
    const healthScores = [];

    const baseDate = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - i);
      dates.push(`${date.getMonth() + 1}/${date.getDate()}`);

      // 使用确定性算法计算分数
      const seed = currentHoroscope.charCodeAt(0) + date.getDate() + date.getMonth() * 31;
      const baseScore = 50 + (seed % 20);
      const dayFactor = (date.getDay() + 1) * 3;
      const deterministicVariation = ((seed * dayFactor) % 20) - 10;

      const energyScore = Math.max(20, Math.min(95, baseScore + dayFactor + deterministicVariation));
      const wealthScore = Math.max(15, Math.min(90, energyScore + ((seed * 2) % 25) - 12));
      const careerScore = Math.max(10, Math.min(85, energyScore + ((seed * 3) % 30) - 15));
      const healthScore = Math.max(10, Math.min(85, energyScore + ((seed * 4) % 25) - 12));

      energyScores.push(energyScore);
      wealthScores.push(wealthScore);
      careerScores.push(careerScore);
      healthScores.push(healthScore);
    }

    return { dates, energyScores, wealthScores, careerScores, healthScores };
  }, [currentHoroscope]);

  // 修复幸运颜色映射 - 使用完整的颜色名称
  const getLuckyColorNames = (colors) => {
    if (!colors || colors.length === 0) return ['蓝色', '绿色'];
    
    const colorNameMap = {
      '#FF6B6B': '浅红', '#FF8E53': '橙红', '#FFD700': '金色', '#FFA500': '橙色',
      '#4ECDC4': '青绿', '#44A08D': '深绿', '#64B3F4': '浅蓝', '#4A90E2': '蓝色',
      '#96CEB4': '浅绿', '#FFEAA7': '淡黄', '#DA70D6': '兰紫', '#BA55D3': '紫色',
      '#808080': '灰色', '#A9A9A9': '浅灰', '#00BFFF': '深蓝', '#1E90FF': '天蓝',
      '#9370DB': '紫红', '#8A2BE2': '深紫',
      '#FF0000': '红色', '#00FF00': '绿色', '#0000FF': '蓝色', '#FFFF00': '黄色',
      '#FF00FF': '品红', '#00FFFF': '青色', '#000000': '黑色', '#FFFFFF': '白色'
    };

    return colors.map(color => {
      if (color.startsWith('#')) {
        return colorNameMap[color.toUpperCase()] || colorNameMap[color] || '红色';
      } else {
        return color;
      }
    });
  };

  // 渲染运势趋势图
  const renderTrendChart = useCallback(() => {
    if (!weeklyTrendData) return null;

    // 确保 Chart.js 组件已注册
    ensureChartRegistered();

    const { dates, energyScores, wealthScores, careerScores, healthScores } = weeklyTrendData;

    const chartData = {
      labels: dates,
      datasets: [
        {
          label: '综合运势',
          data: energyScores,
          borderColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
          backgroundColor: theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label: '财运',
          data: wealthScores,
          borderColor: theme === 'dark' ? '#fbbf24' : '#fbbf24',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointBackgroundColor: theme === 'dark' ? '#fbbf24' : '#fbbf24',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 2,
          borderDash: [5, 5],
          tension: 0.3,
        },
        {
          label: '事业',
          data: careerScores,
          borderColor: theme === 'dark' ? '#34d399' : '#34d399',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointBackgroundColor: theme === 'dark' ? '#34d399' : '#34d399',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 2,
          tension: 0.3,
        },
        {
          label: '健康',
          data: healthScores,
          borderColor: theme === 'dark' ? '#f87171' : '#f87171',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointBackgroundColor: theme === 'dark' ? '#f87171' : '#f87171',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 2,
          tension: 0.3,
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: theme === 'dark' || window.innerWidth <= 768 ? 0 : 300
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
              size: 10,
              weight: '500',
            },
            padding: 8,
            usePointStyle: true,
            boxWidth: 16
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
          titleColor: theme === 'dark' ? '#f3f4f6' : '#1f2937',
          bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
          borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
          borderWidth: 1,
          padding: 6,
          cornerRadius: 4,
          displayColors: true,
        }
      },
      scales: {
        x: {
          type: 'category',
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            font: {
              size: 9,
            }
          }
        },
        y: {
          type: 'linear',
          min: 0,
          max: 100,
          grid: {
            color: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.3)',
            drawBorder: false,
          },
          ticks: {
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            font: {
              size: 9,
            },
            callback: function (value) {
              return value + '%';
            }
          }
        }
      }
    };

    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-4 mb-3 md:mb-4 ${theme}`}>
        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-2 md:mb-3 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM18 7a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1h-2a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          近7日运势趋势
        </h3>
        <div className="h-36 md:h-48">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="mt-2 md:mt-3 grid grid-cols-4 gap-1.5 md:gap-2 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 md:p-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <div className="text-[9px] md:text-xs text-blue-600 dark:text-blue-400 font-medium">综合</div>
            <div className="text-sm md:text-base font-medium text-blue-700 dark:text-blue-300">
              {energyScores[energyScores.length - 1]}%
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-1.5 md:p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
            <div className="text-[9px] md:text-xs text-amber-600 dark:text-amber-400 font-medium">财运</div>
            <div className="text-sm md:text-base font-medium text-amber-700 dark:text-amber-300">
              {wealthScores[wealthScores.length - 1]}%
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-1.5 md:p-2 rounded-lg border border-green-100 dark:border-green-900/30">
            <div className="text-[9px] md:text-xs text-green-600 dark:text-green-400 font-medium">事业</div>
            <div className="text-sm md:text-base font-medium text-green-700 dark:text-green-300">
              {careerScores[careerScores.length - 1]}%
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-1.5 md:p-2 rounded-lg border border-red-100 dark:border-red-900/30">
            <div className="text-[9px] md:text-xs text-red-600 dark:text-red-400 font-medium">健康</div>
            <div className="text-sm md:text-base font-medium text-red-700 dark:text-red-300">
              {healthScores[healthScores.length - 1]}%
            </div>
          </div>
        </div>
      </div>
    );
  }, [weeklyTrendData, theme]);

  if (!zodiacData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">加载星座数据中...</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
            当前星座: {currentHoroscope || '未设置'}
          </p>
          <div className="space-x-2 flex flex-col sm:flex-row justify-center gap-2">
            <button
              onClick={() => navigate('/horoscope')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              返回星座运势
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              刷新页面
            </button>
            <button
              onClick={() => setCurrentHoroscope('白羊座')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              查看白羊座
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`horoscope-traits-page-container min-h-screen ${theme}`} style={{ minHeight: '100vh', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* 顶部标题栏 - 优化版：行内样式，固定高度，兼容9:16屏幕 */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          width: '100%',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          background: (() => {
            // 将Tailwind渐变类转换为实际颜色值
            const colorMap = {
              'from-red-500': '#ef4444',
              'to-orange-500': '#f97316',
              'from-green-500': '#22c55e',
              'to-emerald-500': '#10b981',
              'from-blue-500': '#3b82f6',
              'to-cyan-500': '#06b6d4',
              'from-purple-500': '#a855f7',
              'to-pink-500': '#ec4899',
              'from-gray-500': '#6b7280',
              'to-gray-600': '#4b5563'
            };
            const from = colorMap[elementColors.bg] || '#3b82f6';
            const to = colorMap[elementColors.to] || '#06b6d4';
            return `linear-gradient(to right, ${from}, ${to})`;
          })(),
          color: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            color: 'white',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          <svg
            style={{ width: '20px', height: '20px', marginRight: '6px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <h1
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 'calc(100vw - 160px)'
          }}
        >
          星座特质详解
        </h1>
        <button
          onClick={() => navigate('/settings')}
          style={{
            color: 'white',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          <svg
            style={{ width: '20px', height: '20px' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
      
      {/* 主内容区 */}
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-6 pb-20 md:pb-24 max-w-4xl">
        {/* 星座卡片 */}
        <div className={`bg-gradient-to-br ${elementColors.bg} ${elementColors.to} text-white rounded-xl shadow-lg p-4 md:p-6 mb-3 md:mb-5`}>
          <div className="text-center mb-3 md:mb-4">
            <div className="text-5xl md:text-6xl mb-2 md:mb-3">{zodiacData.icon}</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1.5 md:mb-2">{zodiacData.name}</h2>
            <div className="flex items-center justify-center space-x-3 md:space-x-4 text-sm md:text-lg">
              <span className={`px-2 md:px-3 py-0.5 md:py-1 bg-white/20 rounded-full`}>
                {zodiacData.element}
              </span>
              <span className={`px-2 md:px-3 py-0.5 md:py-1 bg-white/20 rounded-full`}>
                {zodiacData.dateRange}
              </span>
            </div>
          </div>
        </div>

        {/* 今日运势卡片 - 移到性格特征之前 */}
        {loadingHoroscope ? (
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl shadow-lg p-4 md:p-5 mb-4 md:mb-5">
            <div className="flex items-center justify-center py-6 md:py-8">
              <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-white"></div>
              <span className="ml-2 md:ml-3 text-sm md:text-base">运势数据加载中...</span>
            </div>
          </div>
        ) : horoscopeData ? (
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl shadow-lg p-4 md:p-5 mb-4 md:mb-5">
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 flex items-center">
              <span className="mr-2 text-xl md:text-2xl">✨</span> 今日运势
            </h3>
            <div className="mb-3 md:mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm md:text-base font-semibold">综合运势指数</span>
                <span className="text-xl md:text-2xl font-bold">{horoscopeData.overallScore}分</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 md:h-3">
                <div 
                  className="bg-white h-2.5 md:h-3 rounded-full" 
                  style={{ width: `${horoscopeData.overallScore}%` }}
                ></div>
              </div>
            </div>
            
            <p className="mb-3 md:mb-4 text-sm md:text-base text-blue-100">{horoscopeData.overallDescription}</p>
            
            {/* 各领域运势 - 包含健康运势 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5 md:gap-2">
              {Object.entries(horoscopeData.dailyForecast || {}).map(([key, data]) => (
                <div key={key} className="text-center p-1.5 md:p-2 bg-white/10 rounded-lg">
                  <div className="text-[10px] md:text-xs text-blue-200 mb-0.5 md:mb-1">
                    {key === 'love' ? '爱情' : 
                     key === 'wealth' ? '财运' : 
                     key === 'career' ? '事业' : 
                     key === 'study' ? '学业' : 
                     key === 'social' ? '社交' : 
                     key === 'health' ? '健康' : key}
                  </div>
                  <div className="text-base md:text-lg font-bold">{data.score}</div>
                  <div className="text-[10px] md:text-xs text-blue-300">{data.description}</div>
                </div>
              ))}
            </div>
            
            {/* 幸运信息 */}
            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-xs md:text-sm">
                <div>
                  <span className="text-blue-200">幸运色：</span>
                  <span>{getLuckyColorNames(horoscopeData.recommendations?.luckyColorNames || ['蓝色', '绿色']).join('、')}</span>
                </div>
                <div>
                  <span className="text-blue-200">幸运数字：</span>
                  <span>{horoscopeData.recommendations?.luckyNumbers?.join('、') || '3、7、9'}</span>
                </div>
                <div>
                  <span className="text-blue-200">今日建议：</span>
                  <span>{horoscopeData.recommendations?.positiveAdvice || '保持积极心态'}</span>
                </div>
                <div>
                  <span className="text-blue-200">注意事项：</span>
                  <span>{horoscopeData.recommendations?.avoidAdvice || '避免冲动'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* 运势趋势图 */}
        {renderTrendChart()}

        {/* 详细描述 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-5 mb-4 md:mb-5">
          <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 md:mb-3 flex items-center">
            <span className="mr-1.5 md:mr-2 text-lg md:text-xl">📖</span> 星座概述
          </h3>
          <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 leading-relaxed">
            {getZodiacDescription(zodiacData.name)}
          </p>
        </div>

        {/* 个性特质 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-5 mb-4 md:mb-5">
          <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 md:mb-3 flex items-center">
            <span className="mr-1.5 md:mr-2 text-lg md:text-xl">🌟</span> 性格特征
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2.5">
            {(() => {
              const traits = zodiacData.personalityTraits || 
                            (zodiacData.traits ? zodiacData.traits.split('、') : []);
              
              return traits.length > 0 ? traits.map((trait, index) => (
                <div key={index} className="flex items-center p-2 md:p-2.5 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 md:mr-2.5 flex-shrink-0"></span>
                  <span className="text-sm md:text-base text-gray-700 dark:text-gray-200">{trait}</span>
                </div>
              )) : (
                <p className="text-gray-500 dark:text-gray-400 col-span-2 text-sm md:text-base">暂无性格特征数据</p>
              );
            })()}
          </div>
        </div>

        {/* 优点与缺点 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-3.5 mb-4 md:mb-5">
          {/* 优点 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-5">
            <h3 className="text-base md:text-lg font-bold text-green-600 dark:text-green-400 mb-2 md:mb-3 flex items-center">
              <span className="mr-1.5 md:mr-2 text-lg md:text-xl">✨</span> 优点
            </h3>
            <div className="space-y-2 md:space-y-2.5">
              {(() => {
                const strengths = zodiacData.strengths || [];
                return strengths.length > 0 ? strengths.map((strength, index) => (
                  <div key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 md:mt-1.5 mr-2 md:mr-2.5 flex-shrink-0"></span>
                    <span className="text-sm md:text-base text-gray-700 dark:text-gray-200">{strength}</span>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">待补充</p>
                );
              })()}
            </div>
          </div>

          {/* 需注意 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-5">
            <h3 className="text-base md:text-lg font-bold text-orange-600 dark:text-orange-400 mb-2 md:mb-3 flex items-center">
              <span className="mr-1.5 md:mr-2 text-lg md:text-xl">⚠️</span> 需注意
            </h3>
            <div className="space-y-2 md:space-y-2.5">
              {(() => {
                const weaknesses = zodiacData.weaknesses || [];
                return weaknesses.length > 0 ? weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1 md:mt-1.5 mr-2 md:mr-2.5 flex-shrink-0"></span>
                    <span className="text-sm md:text-base text-gray-700 dark:text-gray-200">{weakness}</span>
                  </div>
                )) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">待补充</p>
                );
              })()}
            </div>
          </div>
        </div>

        {/* 幸运信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-5 mb-4 md:mb-5">
          <h3 className="text-base md:text-lg font-bold text-purple-600 dark:text-purple-400 mb-2 md:mb-3 flex items-center">
            <span className="mr-1.5 md:mr-2 text-lg md:text-xl">🍀</span> 幸运信息
          </h3>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="text-center p-2.5 md:p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-1.5 md:mb-2">幸运色</div>
              <div className="flex flex-wrap justify-center gap-0.5 md:gap-1">
                {(() => {
                  const luckyColors = zodiacData.luckyColor || [];
                  return luckyColors.length > 0 ? luckyColors.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                      title={getColorName(color)}
                      aria-label={`幸运色: ${getColorName(color)}`}
                    />
                  )) : (
                    <div
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: '#FF6B6B' }}
                      title="红色"
                      aria-label="幸运色: 红色"
                    />
                  );
                })()}
              </div>
              <div className="text-xs md:text-sm text-gray-700 dark:text-gray-200 mt-1.5 md:mt-2">
                {(() => {
                  const luckyColors = zodiacData.luckyColor || [];
                  return luckyColors.length > 0 
                    ? luckyColors.map(c => getColorName(c)).join('、') 
                    : '红色';
                })()}
              </div>
            </div>
            <div className="text-center p-2.5 md:p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-1.5 md:mb-2">幸运数字</div>
              <div className="flex flex-wrap justify-center gap-1 md:gap-1.5">
                {(() => {
                  const luckyNumbers = zodiacData.luckyNumber || [7, 3, 9]; // 提供默认值
                  return luckyNumbers.length > 0 ? luckyNumbers.map((num, index) => (
                    <span key={index} className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full text-base md:text-lg font-bold text-purple-600 dark:text-purple-400">
                      {num}
                    </span>
                  )) : null;
                })()}
              </div>
            </div>
            <div className="text-center p-2.5 md:p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-1.5 md:mb-2">速配星座</div>
              <div className="flex flex-wrap justify-center gap-1 md:gap-1.5">
                {(() => {
                  const compatibleSigns = zodiacData.compatible || [];
                  return compatibleSigns.length > 0 ? compatibleSigns.slice(0, 4).map((sign, index) => (
                    <span key={index} className="px-2 md:px-2.5 py-0.5 md:py-1 bg-white dark:bg-gray-700 rounded-full text-xs md:text-sm text-gray-700 dark:text-gray-200">
                      {sign}
                    </span>
                  )) : (
                    <span className="px-2 md:px-2.5 py-0.5 md:py-1 bg-white dark:bg-gray-700 rounded-full text-xs md:text-sm text-gray-700 dark:text-gray-200">
                      未知
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* 知名人物 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-5 mb-4 md:mb-5">
          <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 md:mb-3 flex items-center">
            <span className="mr-1.5 md:mr-2 text-lg md:text-xl">⭐</span> 知名{zodiacData.name}
          </h3>
          <div className="flex flex-wrap gap-2 md:gap-2.5">
            {getFamousExamples(zodiacData.name).map((name, index) => (
              <div
                key={index}
                className="px-3 md:px-3.5 py-1.5 md:py-2 bg-gray-50 dark:bg-gray-700 text-sm md:text-base text-gray-700 dark:text-gray-200 rounded-lg flex items-center"
              >
                <span className="text-base md:text-lg mr-1.5 md:mr-2">👤</span>
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* 其他星座入口 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-5">
          <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 md:mb-3 flex items-center">
            <span className="mr-1.5 md:mr-2 text-lg md:text-xl">🔮</span> 查看其他星座
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
            {HOROSCOPE_DATA_ENHANCED.map((zodiac) => (
              <button
                key={zodiac.name}
                onClick={() => setCurrentHoroscope(zodiac.name)}
                className={`p-2 md:p-3 rounded-lg transition-all ${
                  currentHoroscope === zodiac.name
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                }`}
              >
                <div className="text-xl md:text-2xl mb-1">{zodiac.icon}</div>
                <div className="text-xs md:text-sm font-bold">{zodiac.name.replace('座', '')}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 使用React.memo优化组件性能，避免不必要的重新渲染
export default memo(HoroscopeTraitsPage);
