/**
 * 本地数据服务 - 替代外部API调用
 * 提供完全本地化的数据计算和存储
 */

// 格式化日期为YYYY-MM-DD
export const formatDateString = (date) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取星期几
export const getWeekday = (date) => {
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return weekdays[date.getDay()];
};

// 五行颜色系统配置
const WUXING_COLORS = {
  "木": {
    "吉": [
      {
        "颜色系统": "木生火",
        "具体颜色": ["绿色", "青色", "翠绿", "橄榄绿"],
        "描述": "木能生火，绿色系代表生机与活力，适合需要创造力和行动力的场合",
        "吉凶": "吉"
      },
      {
        "颜色系统": "木木相生",
        "具体颜色": ["深绿", "墨绿", "森林绿", "军绿"],
        "描述": "同元素相生，增强木元素能量，适合需要稳定和持久力的场合",
        "吉凶": "吉"
      }
    ],
    "不吉": [
      {
        "颜色系统": "金克木",
        "具体颜色": ["白色", "银色", "金色", "米色"],
        "描述": "金克木，白色系会压制木元素的生机，建议避免作为主色调",
        "吉凶": "不吉"
      }
    ]
  },
  "火": {
    "吉": [
      {
        "颜色系统": "火生土",
        "具体颜色": ["红色", "橙色", "粉色", "玫红"],
        "描述": "火能生土，红色系代表热情与活力，适合社交和表达场合",
        "吉凶": "吉"
      },
      {
        "颜色系统": "火火相生",
        "具体颜色": ["大红", "朱红", "火红", "珊瑚红"],
        "描述": "同元素相生，增强火元素能量，适合需要激情和创造力的场合",
        "吉凶": "吉"
      }
    ],
    "不吉": [
      {
        "颜色系统": "水克火",
        "具体颜色": ["黑色", "蓝色", "深蓝", "藏青"],
        "描述": "水克火，黑色系会压制火元素的热情，建议避免作为主色调",
        "吉凶": "不吉"
      }
    ]
  },
  "土": {
    "吉": [
      {
        "颜色系统": "土生金",
        "具体颜色": ["黄色", "棕色", "土黄", "卡其色"],
        "描述": "土能生金，黄色系代表稳定与收获，适合工作和学习场合",
        "吉凶": "吉"
      },
      {
        "颜色系统": "土土相生",
        "具体颜色": ["褐色", "咖啡色", "驼色", "米黄"],
        "描述": "同元素相生，增强土元素能量，适合需要稳定和耐心的场合",
        "吉凶": "吉"
      }
    ],
    "不吉": [
      {
        "颜色系统": "木克土",
        "具体颜色": ["绿色", "青色", "翠绿", "草绿"],
        "描述": "木克土，绿色系会削弱土元素的稳定，建议避免作为主色调",
        "吉凶": "不吉"
      }
    ]
  },
  "金": {
    "吉": [
      {
        "颜色系统": "金生水",
        "具体颜色": ["白色", "银色", "金色", "香槟色"],
        "描述": "金能生水，白色系代表纯净与智慧，适合思考和决策场合",
        "吉凶": "吉"
      },
      {
        "颜色系统": "金金相生",
        "具体颜色": ["金属色", "亮白", "珍珠白", "铂金色"],
        "描述": "同元素相生，增强金元素能量，适合需要精确和条理的场合",
        "吉凶": "吉"
      }
    ],
    "不吉": [
      {
        "颜色系统": "火克金",
        "具体颜色": ["红色", "橙色", "粉色", "玫红"],
        "描述": "火克金，红色系会削弱金元素的锐利，建议避免作为主色调",
        "吉凶": "不吉"
      }
    ]
  },
  "水": {
    "吉": [
      {
        "颜色系统": "水生木",
        "具体颜色": ["黑色", "蓝色", "深蓝", "藏青"],
        "描述": "水能生木，黑色系代表深邃与智慧，适合学习和思考场合",
        "吉凶": "吉"
      },
      {
        "颜色系统": "水水相生",
        "具体颜色": ["深蓝", "海军蓝", "午夜蓝", "墨蓝"],
        "描述": "同元素相生，增强水元素能量，适合需要冷静和智慧的场合",
        "吉凶": "吉"
      }
    ],
    "不吉": [
      {
        "颜色系统": "土克水",
        "具体颜色": ["黄色", "棕色", "土黄", "卡其色"],
        "描述": "土克水，黄色系会阻碍水元素的流动，建议避免作为主色调",
        "吉凶": "不吉"
      }
    ]
  }
};

// 五行食物建议
const WUXING_FOODS = {
  "木": {
    "宜": ["青菜", "菠菜", "芹菜", "西兰花", "豆芽", "绿豆", "绿茶", "柠檬", "酸橙"],
    "忌": ["辛辣食物", "油炸食品", "过咸食物", "酒精饮料", "咖啡因过量"]
  },
  "火": {
    "宜": ["红枣", "枸杞", "番茄", "胡萝卜", "南瓜", "红豆", "火龙果", "荔枝", "桂圆"],
    "忌": ["生冷食物", "冰镇饮料", "寒性水果", "过量甜食", "油炸食品"]
  },
  "土": {
    "宜": ["山药", "土豆", "红薯", "玉米", "小米", "黄豆", "花生", "核桃", "香蕉"],
    "忌": ["生冷食物", "寒性水果", "油腻食物", "过甜食物", "难消化食物"]
  },
  "金": {
    "宜": ["白萝卜", "梨", "苹果", "杏仁", "百合", "银耳", "大米", "豆腐", "牛奶"],
    "忌": ["辛辣食物", "油炸食品", "过咸食物", "热性水果", "刺激性饮料"]
  },
  "水": {
    "宜": ["黑豆", "黑芝麻", "黑木耳", "海带", "紫菜", "蓝莓", "桑葚", "黑米", "鱼类"],
    "忌": ["生冷食物", "冰镇饮料", "寒性食物", "过量甜食", "油炸食品"]
  }
};

// 根据日期计算当日主导五行
const calculateDailyElement = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 简化版的五行计算算法
  const elements = ["木", "火", "土", "金", "水"];
  const index = (year + month + day) % 5;
  return elements[index];
};

// 生成穿衣建议数据
export const generateDressInfo = (date) => {
  const dateStr = formatDateString(date);
  const weekday = getWeekday(date);
  const dailyElement = calculateDailyElement(date);
  
  return {
    date: dateStr,
    weekday: weekday,
    daily_element: dailyElement,
    color_suggestions: WUXING_COLORS[dailyElement] ? [
      ...WUXING_COLORS[dailyElement]["吉"],
      ...WUXING_COLORS[dailyElement]["不吉"]
    ] : [],
    food_suggestions: WUXING_FOODS[dailyElement] || { "宜": [], "忌": [] },
    health_advice: "根据五行理论，今日适合选择与" + dailyElement + "元素相生的颜色，有助于增强运势和身体健康。"
  };
};

// 获取穿衣信息范围数据
export const getDressInfoRange = async (daysBefore = 1, daysAfter = 6) => {
  const dressInfoList = [];
  
  // 生成指定天数范围内的数据
  for (let i = -daysBefore; i <= daysAfter; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dressInfoList.push(generateDressInfo(date));
  }
  
  // 计算日期范围
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBefore);
  
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysAfter);
  
  return {
    success: true,
    dressInfoList: dressInfoList,
    dateRange: {
      start: startDate,
      end: endDate
    }
  };
};

// 获取特定日期的穿衣信息
export const getSpecificDateDressInfo = async (dateStr) => {
  const date = new Date(dateStr);
  
  if (isNaN(date.getTime())) {
    return {
      success: false,
      error: "无效的日期格式"
    };
  }
  
  return {
    success: true,
    dressInfo: generateDressInfo(date)
  };
};

// 获取今日穿衣信息
export const getTodayDressInfo = async () => {
  const today = new Date();
  return {
    success: true,
    dressInfo: generateDressInfo(today)
  };
};

// 玛雅日历计算工具类
const MayaCalendarCalculator = {
  // 标准玛雅历法计算（基于KIN 183校准）
  calculateMayaDate: (gregorianDate) => {
    // 13种调性（银河音调）
    const TONES = [
      '磁性', '月亮', '电子', '自我存在', '倍音', '韵律', '共振',
      '银河', '太阳', '行星', '光谱', '水晶', '宇宙'
    ];
    
    // 20种图腾（太阳印记）
    const SEALS = [
      '红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界连接者', '蓝手', '黄星星',
      '红月亮', '白狗', '蓝猴', '黄人', '红天空行者', '白巫师', '蓝鹰', '黄战士',
      '红地球', '白镜子', '蓝风暴', '黄太阳'
    ];
    
    // 使用已知正确的参考点：2025年9月23日 = KIN 183 磁性的蓝夜
    const REFERENCE_DATE = new Date('2025-09-23');
    const REFERENCE_KIN = 183;
    
    // 计算目标日期
    const targetDate = new Date(gregorianDate);
    
    // 计算从参考日期到目标日期的天数
    const timeDiff = targetDate.getTime() - REFERENCE_DATE.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // 计算KIN数（1-260的循环）
    let kin = REFERENCE_KIN + daysDiff;
    kin = ((kin - 1) % 260) + 1;
    
    // 从KIN数计算调性和图腾
    const toneIndex = (kin - 1) % 13;
    const sealIndex = (kin - 1) % 20;
    
    const tone = TONES[toneIndex];
    const seal = SEALS[sealIndex];
    
    return {
      kin: kin,
      tone: tone,
      seal: seal,
      fullName: `${tone}的${seal}`,
      daysDiff: daysDiff,
      toneIndex: toneIndex,
      sealIndex: sealIndex
    };
  },
  
  // 计算玛雅Kin数
  calculateKin: function(birthDate) {
    const result = this.calculateMayaDate(birthDate);
    return result.kin;
  },
  
  // 根据Kin数计算玛雅印记
  calculateSeal: function(kin) {
    // 20种图腾（太阳印记）
    const SEALS = [
      '红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界连接者', '蓝手', '黄星星',
      '红月亮', '白狗', '蓝猴', '黄人', '红天空行者', '白巫师', '蓝鹰', '黄战士',
      '红地球', '白镜子', '蓝风暴', '黄太阳'
    ];
    
    // 玛雅印记是基于Kin数模20计算的
    const sealIndex = (kin - 1) % 20;
    return SEALS[sealIndex];
  },
  
  // 根据Kin数计算玛雅音调
  calculateTone: function(kin) {
    // 13种调性（银河音调）
    const TONES = [
      '磁性', '月亮', '电子', '自我存在', '倍音', '韵律', '共振',
      '银河', '太阳', '行星', '光谱', '水晶', '宇宙'
    ];
    
    // 玛雅音调是基于Kin数模13计算的
    const toneIndex = (kin - 1) % 13;
    return TONES[toneIndex];
  },
  
  // 获取完整的玛雅印记描述
  getSealDescription: function(kin) {
    const tone = this.calculateTone(kin);
    const seal = this.calculateSeal(kin);
    return `${tone}的${seal}`;
  }
};

// 计算玛雅出生信息
export const calculateMayaBirthInfo = async (birthDateStr) => {
  try {
    // 解析出生日期
    const birthDate = new Date(birthDateStr);
    
    if (isNaN(birthDate.getTime())) {
      return {
        success: false,
        error: "无效的出生日期格式"
      };
    }
    
    // 计算玛雅信息
    const mayaResult = MayaCalendarCalculator.calculateMayaDate(birthDate);
    
    // 获取星期几
    const weekday = getWeekday(birthDate);
    
    // 生成出生信息
    const birthInfo = {
      date: birthDateStr,
      weekday: weekday,
      maya_kin: `KIN ${mayaResult.kin}`,
      maya_tone: `${mayaResult.tone}之音 | 第${(mayaResult.kin % 28) || 28}天`,
      maya_seal: mayaResult.seal,
      maya_seal_desc: mayaResult.fullName,
      // 这里可以添加更多详细的玛雅信息
    };
    
    return {
      success: true,
      birthInfo: birthInfo
    };
  } catch (error) {
    console.error('计算玛雅出生信息失败:', error);
    return {
      success: false,
      error: `计算玛雅出生信息失败: ${error.message}`
    };
  }
};

// 生物节律本地计算
export const calculateBiorhythmData = async (birthDate, targetDate = new Date()) => {
  if (!birthDate) {
    return {
      success: false,
      error: "请选择出生日期"
    };
  }
  
  const birth = new Date(birthDate);
  const target = new Date(targetDate);
  
  if (isNaN(birth.getTime()) || isNaN(target.getTime())) {
    return {
      success: false,
      error: "无效的日期格式"
    };
  }
  
  // 计算天数差
  const timeDiff = target.getTime() - birth.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // 生物节律计算
  const physical = Math.sin((2 * Math.PI * daysDiff) / 23) * 100;
  const emotional = Math.sin((2 * Math.PI * daysDiff) / 28) * 100;
  const intellectual = Math.sin((2 * Math.PI * daysDiff) / 33) * 100;
  
  return {
    success: true,
    data: {
      date: formatDateString(target),
      physical: Math.round(physical),
      emotional: Math.round(emotional),
      intellectual: Math.round(intellectual),
      days_since_birth: daysDiff
    }
  };
};

// 获取生物节律范围数据
export const getBiorhythmRange = async (birthDate, daysBefore = 10, daysAfter = 20) => {
  const rhythmData = [];
  const birth = new Date(birthDate);
  
  if (isNaN(birth.getTime())) {
    return {
      success: false,
      error: "无效的出生日期格式"
    };
  }
  
  for (let i = -daysBefore; i <= daysAfter; i++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + i);
    
    const result = await calculateBiorhythmData(birthDate, targetDate);
    if (result.success) {
      rhythmData.push(result.data);
    }
  }
  
  return {
    success: true,
    rhythmData: rhythmData
  };
};

// 本地存储管理
const STORAGE_KEYS = {
  BIRTH_DATE: 'biorhythm_birth_date',
  DRESS_HISTORY: 'dress_info_history',
  USER_PREFERENCES: 'user_preferences'
};

// 保存数据到本地存储
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('保存到本地存储失败:', error);
    return false;
  }
};

// 从本地存储读取数据
export const loadFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('从本地存储读取数据失败:', error);
    return null;
  }
};

// 清除本地存储数据
export const clearLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('清除本地存储数据失败:', error);
    return false;
  }
};

export default {
  getDressInfoRange,
  getSpecificDateDressInfo,
  getTodayDressInfo,
  calculateBiorhythmData,
  getBiorhythmRange,
  calculateMayaBirthInfo,
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  formatDateString,
  getWeekday
};