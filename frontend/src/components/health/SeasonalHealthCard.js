import { useState, useEffect } from 'react';
import { useUserConfig } from '../../contexts/UserConfigContext.js';
import { useNavigate } from 'react-router-dom';
import { getSolarTermState } from '../../utils/solarTerms';
import { SeasonalHealthIcon } from '../icons';

// 当季养生健康提醒卡片组件
const SeasonalHealthCard = ({ onClick }) => {
  const navigate = useNavigate();
  const { userConfig } = useUserConfig();
  const [seasonData, setSeasonData] = useState(null);
  const [currentDate, setCurrentDate] = useState(() => new Date().toDateString());

  // 从本地存储获取用户设置的缓存超时时间
  const getUserCacheTimeout = () => {
    const savedCacheTimeout = localStorage.getItem('cacheTimeout');
    return savedCacheTimeout ? parseInt(savedCacheTimeout) : 10800000; // 默认3小时
  };

  // 生成缓存键
  const getCacheKey = () => {
    return `seasonal-health-${currentDate}`;
  };

  // 检查缓存
  const getCachedData = () => {
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp, date: cacheDate } = JSON.parse(cached);
        const now = Date.now();

        // 检查是否跨天（隔天重新计算策略）
        if (cacheDate !== currentDate) {
          localStorage.removeItem(cacheKey);
          return null;
        }

        // 检查缓存是否超时
        const cacheTimeout = getUserCacheTimeout();
        if (now - timestamp < cacheTimeout) {
          return data;
        } else {
          // 清除过期缓存
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (e) {
      console.warn('读取缓存失败:', e);
    }
    return null;
  };

  // 设置缓存
  const setCachedData = (data) => {
    try {
      const cacheKey = getCacheKey();
      const cacheData = {
        data,
        timestamp: Date.now(),
        date: currentDate  // 添加日期信息用于隔天检查
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('设置缓存失败:', e);
    }
  };

  // 扩展的节气养生详细配置
  const solarTermDetails = {
    "立春": {
      emoji: "🌱",
      color: "from-green-400 to-emerald-500",
      desc: "阳气始生，万物复苏",
      detailedTips: [
        { title: "防寒护阳", content: "重点保护头、颈、足部，外出戴帽子围巾，防止风寒侵袭" },
        { title: "养肝疏泄", content: "保持心情舒畅，适当进行户外活动，助肝气疏泄" },
        { title: "饮食调养", content: "宜食辛温发散之品，如韭菜、洋葱、生姜，少吃酸涩食物" },
        { title: "作息调整", content: "夜卧早起，适当晚睡（不晚于23点），早起广步于庭" }
      ],
      foods: ['韭菜', '菠菜', '香椿', '洋葱', '生姜'],
      activities: ['踏青', '散步', '慢跑', '太极拳']
    },
    "雨水": {
      emoji: "💧",
      color: "from-green-500 to-teal-500",
      desc: "降水增多，湿气渐重",
      detailedTips: [
        { title: "健脾祛湿", content: "多吃山药、薏米、红豆等健脾祛湿食物，少食生冷油腻" },
        { title: "防倒春寒", content: "注意保暖，适时增减衣物，不宜过早脱去棉衣" },
        { title: "调理脾胃", content: "饮食宜少酸多甘，保护脾胃阳气" },
        { title: "运动调养", content: "不宜剧烈运动，以温和运动为主，避免大汗淋漓" }
      ],
      foods: ['山药', '薏米', '红豆', '莲子', '南瓜'],
      activities: ['散步', '瑜伽', '太极', '八段锦']
    },
    "惊蛰": {
      emoji: "⚡",
      color: "from-green-600 to-emerald-600",
      desc: "春雷乍动，万物生机",
      detailedTips: [
        { title: "润肺止咳", content: "多食梨子、银耳等润肺食物，预防春咳" },
        { title: "舒展筋骨", content: "早睡早起，适度运动，顺应阳气升发" },
        { title: "清肝明目", content: "多食绿色蔬菜，保持心情愉悦，避免肝火旺盛" },
        { title: "防过敏", content: "注意预防花粉过敏，外出佩戴口罩" }
      ],
      foods: ['梨', '银耳', '百合', '菠菜', '芹菜'],
      activities: ['踏青', '跑步', '太极', '放风筝']
    },
    "春分": {
      emoji: "🌸",
      color: "from-pink-400 to-rose-500",
      desc: "阴阳平衡，昼夜均分",
      detailedTips: [
        { title: "调和阴阳", content: "保持情志平和，饮食忌在大寒大热" },
        { title: "疏肝解郁", content: "多进行户外活动，调节情志，顺应春气" },
        { title: "饮食平衡", content: "阴阳平衡，宜食性平味甘之品，如山药、红枣" },
        { title: "规律作息", content: "顺应昼夜变化，保持良好的睡眠习惯" }
      ],
      foods: ['山药', '红枣', '枸杞', '银耳', '百合'],
      activities: ['踏青', '赏花', '散步', '太极']
    },
    "清明": {
      emoji: "🌿",
      color: "from-green-500 to-lime-500",
      desc: "气清景明，万物皆显",
      detailedTips: [
        { title: "柔肝养肺", content: "饮食宜温，多食柔肝养肺之物，如荠菜、菠菜" },
        { title: "舒畅情志", content: "踏青祭祖，亲近自然，保持心情愉悦" },
        { title: "防寒保暖", content: "注意早晚温差，适时增减衣物" },
        { title: "清补调理", content: "宜清淡饮食，多食时令蔬菜，少食辛辣" }
      ],
      foods: ['荠菜', '菠菜', '春笋', '韭菜', '鸡蛋'],
      activities: ['踏青', '放风筝', '郊游', '祭祖']
    },
    "谷雨": {
      emoji: "🌾",
      color: "from-yellow-400 to-amber-500",
      desc: "雨生百谷，湿气增加",
      detailedTips: [
        { title: "祛湿健脾", content: "注意祛湿健脾，少吃生冷肥腻，多食薏米、红豆" },
        { title: "防风湿", content: "早晚注意保暖，避免寒湿侵袭关节" },
        { title: "养肝护脾", content: "饮食宜清淡，多食山药、莲子健脾养胃" },
        { title: "适度运动", content: "以温和运动为主，避免在潮湿环境下剧烈运动" }
      ],
      foods: ['薏米', '红豆', '山药', '莲子', '冬瓜'],
      activities: ['散步', '瑜伽', '太极', '八段锦']
    },
    "立夏": {
      emoji: "☀️",
      color: "from-red-400 to-orange-500",
      desc: "夏季开始，万物繁茂",
      detailedTips: [
        { title: "养心安神", content: "养心为主，清淡饮食，多喝水，保持心境平和" },
        { title: "清心泻火", content: "可适当食用莲子心、苦瓜等清心火之品" },
        { title: "午休养心", content: "午休片刻（15-30分钟），保护心气" },
        { title: "适度运动", content: "选择早晨或傍晚运动，避免正午暴晒" }
      ],
      foods: ['莲子', '苦瓜', '绿豆', '冬瓜', '西红柿'],
      activities: ['晨练', '游泳', '太极', '散步']
    },
    "小满": {
      emoji: "🌾",
      color: "from-amber-500 to-orange-600",
      desc: "麦粒渐满，湿热交蒸",
      detailedTips: [
        { title: "清热解暑", content: "饮食宜清爽，多吃苦瓜等苦味食物清心火" },
        { title: "祛湿健脾", content: "多食薏米、红豆、冬瓜等祛湿食物" },
        { title: "避免大汗", content: "避免大汗淋漓，注意皮肤清洁，预防皮肤病" },
        { title: "静心调息", content: "保持心境平和，避免烦躁不安" }
      ],
      foods: ['苦瓜', '薏米', '红豆', '冬瓜', '绿豆'],
      activities: ['游泳', '晨练', '太极', '散步']
    },
    "芒种": {
      emoji: "🌾",
      color: "from-yellow-500 to-amber-600",
      desc: "仲夏时节，湿热加重",
      detailedTips: [
        { title: "清淡饮食", content: "饮食宜清淡，多吃瓜果蔬菜，少食油腻辛辣" },
        { title: "防暑降温", content: "晚睡早起，中午小憩，勤洗澡，保持身体清爽" },
        { title: "祛湿排毒", content: "多食绿豆、冬瓜、苦瓜等清热解毒食物" },
        { title: "避免贪凉", content: "不宜过度贪凉饮冷，以免损伤脾胃" }
      ],
      foods: ['绿豆', '冬瓜', '苦瓜', '西瓜', '黄瓜'],
      activities: ['游泳', '晨练', '太极', '瑜伽']
    },
    "夏至": {
      emoji: "🔥",
      color: "from-red-500 to-pink-600",
      desc: "阳气最盛，阴气始生",
      detailedTips: [
        { title: "清补为宜", content: "饮食宜清补，多吃苦味和酸味食物，清热解暑" },
        { title: "养阴护阳", content: "阳气最盛，宜养阴护阳，避免过度耗损" },
        { title: "避免暴晒", content: "避免阳光直射，注意防暑降温，防止中暑" },
        { title: "静心安神", content: "保持心境平和，避免烦躁和情绪波动" }
      ],
      foods: ['苦瓜', '黄瓜', '冬瓜', '绿豆', '西瓜'],
      activities: ['晨练', '游泳', '太极', '午休']
    },
    "小暑": {
      emoji: "🌡️",
      color: "from-orange-500 to-red-600",
      desc: "季夏开始，炎热渐盛",
      detailedTips: [
        { title: "清淡饮食", content: "饮食宜清淡，注意补充水分和盐分" },
        { title: "静心养气", content: "静心养气，避免剧烈运动，防止大汗伤阳" },
        { title: "防暑降温", content: "注意防暑降温，多喝绿豆汤、菊花茶清热解暑" },
        { title: "午休养心", content: "中午适当休息，保护心气，避免过度疲劳" }
      ],
      foods: ['绿豆', '菊花', '西瓜', '苦瓜', '冬瓜'],
      activities: ['晨练', '游泳', '午休', '太极']
    },
    "大暑": {
      emoji: "🔥",
      color: "from-red-600 to-orange-700",
      desc: "一年中最热时期",
      detailedTips: [
        { title: "清热解暑", content: "多食绿豆、冬瓜、西瓜等清热解暑食物" },
        { title: "防暑降温", content: "注意防暑降温，避免中暑，保证充足睡眠" },
        { title: "祛湿健脾", content: "饮食清淡，多食薏米、红豆健脾祛湿" },
        { title: "静心调养", content: "保持心境平和，避免烦躁，静心养神" }
      ],
      foods: ['绿豆', '冬瓜', '西瓜', '苦瓜', '薏米'],
      activities: ['游泳', '晨练', '午休', '静坐']
    },
    "立秋": {
      emoji: "🍂",
      color: "from-amber-400 to-orange-500",
      desc: "阳气渐收，阴气渐长",
      detailedTips: [
        { title: "收敛肺气", content: "少吃辛辣，多吃酸味食物以收敛肺气，如苹果、葡萄" },
        { title: "润燥养肺", content: "多食梨、银耳等润肺食物，防秋燥" },
        { title: "适应秋凉", content: "早卧早起，适应秋凉，适时增减衣物" },
        { title: "调理脾胃", content: "饮食宜温润，避免过度贪凉" }
      ],
      foods: ['梨', '银耳', '苹果', '葡萄', '百合'],
      activities: ['登山', '慢跑', '太极', '散步']
    },
    "处暑": {
      emoji: "🍁",
      color: "from-orange-400 to-red-500",
      desc: "暑气终结，天气转凉",
      detailedTips: [
        { title: "滋阴润燥", content: "多食银耳、百合、梨等滋阴润燥食物" },
        { title: "适应秋凉", content: "早睡早起，适当且温和的运动，增强体质" },
        { title: "防秋燥", content: "注意补充水分，保持室内适宜湿度" },
        { title: "调理情志", content: "保持心情舒畅，避免悲秋情绪" }
      ],
      foods: ['银耳', '百合', '梨', '蜂蜜', '山药'],
      activities: ['登山', '慢跑', '太极', '散步']
    },
    "白露": {
      emoji: "☁️",
      color: "from-white-400 to-blue-300",
      desc: "天气转凉，露凝而白",
      detailedTips: [
        { title: "防秋燥", content: "多食梨、蜂蜜、芝麻等润肺食物，预防秋燥" },
        { title: "足部保暖", content: "注意保暖，尤其是腹部和脚部，寒从脚起" },
        { title: "润肺止咳", content: "多食白色食物，如银耳、百合、莲子" },
        { title: "预防感冒", content: "早晚温差大，注意及时增减衣物" }
      ],
      foods: ['梨', '蜂蜜', '芝麻', '银耳', '百合'],
      activities: ['慢跑', '太极', '散步', '瑜伽']
    },
    "秋分": {
      emoji: "🍁",
      color: "from-yellow-500 to-orange-600",
      desc: "阴阳平衡，昼夜均分",
      detailedTips: [
        { title: "润肺养阴", content: "饮食宜温润，多吃清润养肺之物，如梨、银耳" },
        { title: "收敛神气", content: "收敛神气，保持心境平和，避免悲忧" },
        { title: "调和阴阳", content: "顺应自然变化，保持阴阳平衡" },
        { title: "适度运动", content: "选择温和运动，避免大汗，收敛元气" }
      ],
      foods: ['梨', '银耳', '百合', '蜂蜜', '山药'],
      activities: ['太极', '散步', '瑜伽', '登山']
    },
    "寒露": {
      emoji: "❄️",
      color: "from-blue-400 to-cyan-500",
      desc: "露气寒冷，将欲凝结",
      detailedTips: [
        { title: "滋阴润燥", content: "多食山药、莲子、百合等滋阴润燥食物" },
        { title: "足部保暖", content: "足部保暖，防止寒从脚起，睡前泡脚" },
        { title: "护肺润燥", content: "多食白色润肺食物，如银耳、梨、百合" },
        { title: "防寒保暖", content: "注意保暖，尤其是头部、颈部和足部" }
      ],
      foods: ['山药', '莲子', '百合', '银耳', '梨'],
      activities: ['太极', '散步', '瑜伽', '慢跑']
    },
    "霜降": {
      emoji: "🌨️",
      color: "from-gray-400 to-blue-500",
      desc: "天气渐冷，初霜出现",
      detailedTips: [
        { title: "平补肝肾", content: "多食柿子、板栗、山药等平补肝肾食物" },
        { title: "防寒保暖", content: "注意防寒保暖，预防呼吸道疾病" },
        { title: "温润养肺", content: "饮食宜温润，多食银耳、百合等润肺食物" },
        { title: "收敛元气", content: "早睡早起，收敛神气，避免大汗" }
      ],
      foods: ['柿子', '板栗', '山药', '银耳', '百合'],
      activities: ['散步', '太极', '瑜伽', '慢跑']
    },
    "立冬": {
      emoji: "🥶",
      color: "from-blue-500 to-indigo-600",
      desc: "冬季开始，万物收藏",
      detailedTips: [
        { title: "滋阴潜阳", content: "多食温补食物，如羊肉、牛肉、核桃" },
        { title: "早睡晚起", content: "早睡晚起，保证充足睡眠，利于阳气潜藏" },
        { title: "温补阳气", content: "可适当进补，但不宜过度，以免上火" },
        { title: "防寒保暖", content: "注意保暖，特别是头部、背部和足部" }
      ],
      foods: ['羊肉', '牛肉', '核桃', '黑芝麻', '红枣'],
      activities: ['太极', '八段锦', '散步', '静坐']
    },
    "小雪": {
      emoji: "❄️",
      color: "from-cyan-500 to-blue-600",
      desc: "气温下降，降水成雪",
      detailedTips: [
        { title: "温补肾阳", content: "多食黑色食物，如黑豆、黑芝麻、黑米" },
        { title: "保暖防寒", content: "注意头部和手脚保暖，外出戴帽子围巾" },
        { title: "调养脾胃", content: "饮食宜温热，避免生冷食物" },
        { title: "静心养神", content: "保持心境平和，避免情绪波动" }
      ],
      foods: ['黑豆', '黑芝麻', '黑米', '羊肉', '核桃'],
      activities: ['太极', '八段锦', '散步', '静坐']
    },
    "大雪": {
      emoji: "❄️",
      color: "from-blue-600 to-indigo-700",
      desc: "冰雪封地，寒气呈盛",
      detailedTips: [
        { title: "进补时机", content: "进补好时机，多食羊肉、红枣、桂圆等温补食物" },
        { title: "防寒保暖", content: "防寒保暖，早卧晚起，待日光" },
        { title: "温补肾阳", content: "可适当食用羊肉汤、当归生姜羊肉汤" },
        { title: "藏精养神", content: "保持精神内守，避免过度消耗" }
      ],
      foods: ['羊肉', '红枣', '桂圆', '当归', '生姜'],
      activities: ['太极', '八段锦', '散步', '静坐']
    },
    "冬至": {
      emoji: "❄️",
      color: "from-indigo-500 to-purple-600",
      desc: "阴极之至，阳气始生",
      detailedTips: [
        { title: "补益阳气", content: "多吃饺子、汤圆，适当进补，补益阳气" },
        { title: "养阴固本", content: "注意防寒，避免过度劳累，养阴固本" },
        { title: "温补脾肾", content: "多食羊肉、牛肉、韭菜等温补食物" },
        { title: "起居有常", content: "早卧晚起，必待日光，保证充足睡眠" }
      ],
      foods: ['饺子', '汤圆', '羊肉', '牛肉', '韭菜'],
      activities: ['太极', '八段锦', '散步', '静坐']
    },
    "小寒": {
      emoji: "🥶",
      color: "from-blue-700 to-indigo-800",
      desc: "天气寒冷，尚未极点",
      detailedTips: [
        { title: "防寒护阳", content: "重点保护头、颈、足部，外出戴帽子围巾，睡前用40°C左右温水泡脚15分钟（可加生姜或艾叶）" },
        { title: "避免剧烈运动", content: "避免清晨剧烈运动，防止阳气外泄" },
        { title: "温补食疗", content: "推荐当归生姜羊肉汤，黑芝麻核桃粥，既温肾阳又益精血。晨起空腹喝少量温蜂蜜水，缓解冬季干燥" },
        { title: "作息调节", content: "遵循'早卧晚起'原则，尽量22点前入睡，待日光出现再起床，以顺应阳气潜藏" }
      ],
      foods: ['羊肉', '当归', '生姜', '黑芝麻', '核桃'],
      activities: ['太极拳', '八段锦', '散步', '气功']
    },
    "大寒": {
      emoji: "🧊",
      color: "from-indigo-700 to-purple-800",
      desc: "一年中最冷时期",
      detailedTips: [
        { title: "固护脾肾", content: "多食温热食物，如羊肉、牛肉、韭菜、桂圆等" },
        { title: "注意保暖", content: "注意保暖，避免风寒侵袭，特别保护头部、颈部和足部" },
        { title: "温补肾阳", content: "可适当进补，多食黑色食物和温补食材" },
        { title: "藏精养神", content: "保持精神内守，避免过度消耗和情绪波动" }
      ],
      foods: ['羊肉', '牛肉', '韭菜', '桂圆', '核桃'],
      activities: ['太极', '八段锦', '散步', '静坐']
    }
  };

  // 判断是否在节气窗口期（前7天到后3天）
  const isInSolarTermWindow = (solarTermState) => {
    if (!solarTermState) return false;

    const { type, diff } = solarTermState;

    // 当天、前3天、后3天
    const isWithinThreeDays = type === 'today' || type === 'before' || type === 'after';

    // 前4-7天（提醒状态）
    const isWithinSevenDaysBefore = type === 'reminder' && diff >= -7 && diff < 0;

    return isWithinThreeDays || isWithinSevenDaysBefore;
  };

  // 获取当前季节信息
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) {
      return {
        name: '春',
        element: '木',
        organ: '肝',
        desc: '生发之气，养肝为先',
        color: 'from-green-400 to-emerald-500',
        tips: [
          '早睡早起，春捂秋冻',
          '多食绿色蔬菜、芽苗类',
          '适度运动，疏肝理气',
          '保持心情舒畅，避免暴怒'
        ],
        foods: ['韭菜', '菠菜', '豆芽', '香椿', '蜂蜜', '大枣'],
        activities: ['踏青', '放风筝', '散步', '太极拳']
      };
    } else if (month >= 6 && month <= 8) {
      return {
        name: '夏',
        element: '火',
        organ: '心',
        desc: '生长之气，养心为要',
        color: 'from-red-400 to-orange-500',
        tips: [
          '晚睡早起，适当午休',
          '多食苦味食物，清热解暑',
          '适度运动，避免大汗',
          '保持心境平和，避免烦躁'
        ],
        foods: ['苦瓜', '冬瓜', '丝瓜', '绿豆', '莲子', '百合'],
        activities: ['游泳', '晨练', '太极', '散步']
      };
    } else if (month >= 9 && month <= 11) {
      return {
        name: '秋',
        element: '金',
        organ: '肺',
        desc: '收敛之气，养肺为主',
        color: 'from-yellow-400 to-amber-500',
        tips: [
          '早睡早起，收敛神气',
          '多食滋阴润燥食物',
          '适度运动，增强体质',
          '保持内心平静，避免悲伤'
        ],
        foods: ['梨', '银耳', '百合', '蜂蜜', '白萝卜', '莲藕'],
        activities: ['登山', '慢跑', '太极', '气功']
      };
    } else {
      return {
        name: '冬',
        element: '水',
        organ: '肾',
        desc: '收藏之气，养肾为本',
        color: 'from-blue-400 to-indigo-500',
        tips: [
          '早睡晚起，避寒就温',
          '多食温热滋补食物',
          '适度运动，不宜过汗',
          '保持精神内守，避免惊恐'
        ],
        foods: ['羊肉', '牛肉', '黑豆', '黑芝麻', '核桃', '枸杞'],
        activities: ['太极拳', '八段锦', '散步', '气功']
      };
    }
  };

  // 根据用户年龄和性别获取个性化建议
  const getPersonalizedAdvice = () => {
    if (!userConfig?.birthDate) {
      return "根据季节特点，调整养生重点";
    }

    const birthDate = new Date(userConfig.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const gender = userConfig.gender;

    let advice = "";

    if (age < 30) {
      advice = gender === 'female'
        ? "年轻女性应注重肝血调养，顺应春季生发之气"
        : "年轻男性应注重肾精养护，避免过度消耗";
    } else if (age < 50) {
      advice = gender === 'female'
        ? "中年女性应关注气血平衡，注意情绪调节"
        : "中年男性应注重脾胃养护，避免过度劳累";
    } else {
      advice = gender === 'female'
        ? "中老年女性应注重滋阴养血，保持心态平和"
        : "中老年男性应注重补肾固精，适度运动";
    }

    return advice;
  };

  // 获取节令养生数据（节气或季节）
  const getHealthData = () => {
    const solarTermState = getSolarTermState(new Date());

    // 详细调试信息
    const debugInfo = {
      date: currentDate,
      solarTermState,
      solarTermStateType: solarTermState?.type,
      solarTermStateDiff: solarTermState?.diff,
      solarTermStateName: solarTermState?.name,
      isInWindow: isInSolarTermWindow(solarTermState),
      windowCheck: {
        isWithinThreeDays: solarTermState?.type === 'today' || solarTermState?.type === 'before' || solarTermState?.type === 'after',
        isWithinSevenDaysBefore: solarTermState?.type === 'reminder' && solarTermState?.diff >= -7 && solarTermState?.diff < 0
      }
    };

    // 详细日志
    console.log('[SeasonalHealthCard] 计算健康数据:', debugInfo);

    // 判断是否在节气窗口期（前7天到后3天）
    if (isInSolarTermWindow(solarTermState)) {
      // 显示节气养生
      const termName = solarTermState.name;
      const termDetail = solarTermDetails[termName];

      if (termDetail) {
        console.log('[SeasonalHealthCard] 使用节气养生:', termName);
        return {
          type: 'solarTerm',
          name: termName,
          ...termDetail,
          solarTermState
        };
      } else {
        console.warn('[SeasonalHealthCard] 节气详情未找到:', termName);
      }
    } else {
      console.log('[SeasonalHealthCard] 不在节气窗口期，原因:', {
        type: solarTermState?.type,
        diff: solarTermState?.diff,
        isWithinThreeDays: debugInfo.windowCheck.isWithinThreeDays,
        isWithinSevenDaysBefore: debugInfo.windowCheck.isWithinSevenDaysBefore
      });
    }

    // 显示季节养生
    console.log('[SeasonalHealthCard] 使用季节养生');
    return {
      type: 'season',
      ...getCurrentSeason(),
      solarTermState
    };
  };

  useEffect(() => {
    console.log('[SeasonalHealthCard] useEffect 执行，当前日期:', currentDate);

    // 先清除所有旧的缓存键（确保没有昨天的缓存）
    try {
      const cacheKeys = Object.keys(localStorage);
      cacheKeys.forEach(key => {
        if (key.startsWith('seasonal-health-')) {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { date: cacheDate } = JSON.parse(cached);
            // 如果缓存日期不是今天的，立即删除
            if (cacheDate !== currentDate) {
              console.log('[SeasonalHealthCard] 清除过期缓存:', key, cacheDate);
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (e) {
      console.warn('[SeasonalHealthCard] 清理缓存失败:', e);
    }

    // 检查当天的缓存
    const cachedData = getCachedData();
    if (cachedData) {
      console.log('[SeasonalHealthCard] 使用缓存数据');
      setSeasonData(cachedData);
    } else {
      console.log('[SeasonalHealthCard] 无缓存，重新计算');
      const data = getHealthData();
      setSeasonData(data);
      // 设置缓存
      setCachedData(data);
    }
  }, [currentDate]); // 当日期变化时重新执行

  // 监听日期变化（每分钟检查一次）
  useEffect(() => {
    const timer = setInterval(() => {
      const newDate = new Date().toDateString();
      if (newDate !== currentDate) {
        console.log('[SeasonalHealthCard] 检测到日期变化:', currentDate, '->', newDate);
        setCurrentDate(newDate);
      }
    }, 60000); // 每分钟检查一次

    return () => clearInterval(timer);
  }, [currentDate]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/wuxing-health');
    }
  };

  if (!seasonData) {
    return (
      <div className="health-card seasonal-health-card">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-2xl text-white shadow-lg h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  const isSolarTerm = seasonData.type === 'solarTerm';
  const seasonName = isSolarTerm ? seasonData.solarTermState.name : seasonData.name;
  const title = isSolarTerm ? `${seasonName}节气养生` : `${seasonData.name}季养生`;
  const emoji = isSolarTerm ? seasonData.emoji : (
    seasonData.name === '春' ? '🌸' :
      seasonData.name === '夏' ? '☀️' :
        seasonData.name === '秋' ? '🍂' : '❄️'
  );

  // 格式化节气状态描述
  const getSolarTermStatus = () => {
    if (!isSolarTerm || !seasonData.solarTermState) return '';

    const { type, diff, name } = seasonData.solarTermState;
    if (type === 'today') return `今天是${name}节气`;
    if (type === 'before') return `距离${name}节气还有${Math.abs(diff)}天`;
    if (type === 'after') return `${name}节气已过${diff}天`;
    return '';
  };

  return (
    <div
      className="health-card seasonal-health-card"
      onClick={handleClick}
    >
      <div className={`bg-gradient-to-br ${seasonData.color} p-4 rounded-2xl text-white shadow-lg h-full border border-white/20 backdrop-blur-sm`}>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md shadow-inner">
            <SeasonalHealthIcon size={24} color="white" />
          </div>
          <div className="text-right">
            <h3 className="font-bold text-lg">{title}</h3>
            {isSolarTerm ? (
              <>
                <p className="text-xs opacity-90">{seasonData.desc}</p>
                <p className="text-xs opacity-75 mt-1">{getSolarTermStatus()}</p>
              </>
            ) : (
              <>
                <p className="text-sm opacity-90">{seasonData.desc}</p>
                <p className="text-xs opacity-75 mt-1">五行：{seasonData.element}行 | 养护脏腑：{seasonData.organ}</p>
              </>
            )}
          </div>
        </div>

        {/* 节气/季节养生小贴士 */}
        <div className="mb-3">
          <p className="text-xs font-medium opacity-90 mb-2">
            {isSolarTerm ? '节气养生要点：' : '养生要点：'}
          </p>
          {isSolarTerm && seasonData.detailedTips ? (
            <div className="space-y-2">
              {seasonData.detailedTips.slice(0, 3).map((tip, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <p className="text-xs font-medium mb-1">{index + 1}. {tip.title}</p>
                  <p className="text-xs opacity-80">{tip.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {seasonData.tips.slice(0, 2).map((tip, index) => (
                <div key={index} className="text-xs opacity-75 flex items-center">
                  <span className="mr-1">•</span>
                  {tip}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 推荐食物 */}
        {seasonData.foods && seasonData.foods.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-medium opacity-90 mb-1">
              推荐食物：
            </p>
            <div className="flex flex-wrap gap-1">
              {seasonData.foods.slice(0, 6).map((food, index) => (
                <span key={index} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {food}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 推荐活动 */}
        {seasonData.activities && seasonData.activities.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-medium opacity-90 mb-1">
              推荐活动：
            </p>
            <div className="flex flex-wrap gap-1">
              {seasonData.activities.slice(0, 4).map((activity, index) => (
                <span key={index} className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {activity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 个性化建议 */}
        <div className="mb-2 pt-2 border-t border-white border-opacity-20">
          <p className="text-xs font-medium opacity-90 mb-1">个人建议：</p>
          <p className="text-xs opacity-75">{getPersonalizedAdvice()}</p>
        </div>

        {/* 五行/节气关系提示 */}
        <div className="mt-2 pt-2 border-t border-white border-opacity-20">
          <p className="text-xs opacity-75">
            {isSolarTerm
              ? `${seasonData.desc}，顺应节气变化调养身心，保持健康生活`
              : `${seasonData.name}季与${seasonData.element}行相应，${seasonData.organ}气渐旺，宜顺应自然调养身心`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeasonalHealthCard;