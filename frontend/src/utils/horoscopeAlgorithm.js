/**
 * 增强版星座运势算法
 * 包含每日运势分数计算、心灵问答、幸运物品生成等功能
 */

// 星座数据增强版（包含更多属性）
export const HOROSCOPE_DATA_ENHANCED = [
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
    incompatible: ['巨蟹座', '天蝎座', '摩羯座'],
    // 新增属性
    personalityTraits: ['勇敢', '热情', '果断', '冲动'],
    strengths: ['领导力', '行动力', '创造力'],
    weaknesses: ['急躁', '固执', '缺乏耐心'],
    elementWeight: { fire: 8, earth: 4, air: 6, water: 3 }
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
    incompatible: ['天蝎座', '水瓶座', '狮子座'],
    personalityTraits: ['稳重', '务实', '有耐心', '固执'],
    strengths: ['耐力', '稳定性', '可靠性'],
    weaknesses: ['固执', '保守', '反应慢'],
    elementWeight: { fire: 5, earth: 9, air: 4, water: 6 }
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
    incompatible: ['处女座', '双鱼座', '射手座'],
    personalityTraits: ['机智', '好奇', '善变', '浮躁'],
    strengths: ['沟通力', '适应力', '学习力'],
    weaknesses: ['善变', '缺乏专注', '肤浅'],
    elementWeight: { fire: 6, earth: 4, air: 8, water: 5 }
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
    incompatible: ['白羊座', '天秤座', '摩羯座'],
    personalityTraits: ['敏感', '顾家', '同情心', '情绪化'],
    strengths: ['同理心', '直觉力', '忠诚度'],
    weaknesses: ['情绪化', '过度敏感', '依赖性强'],
    elementWeight: { fire: 3, earth: 6, air: 5, water: 9 }
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
    incompatible: ['天蝎座', '水瓶座', '金牛座'],
    personalityTraits: ['自信', '慷慨', '有魅力', '自负'],
    strengths: ['领导力', '创造力', '热情'],
    weaknesses: ['自负', '爱炫耀', '固执'],
    elementWeight: { fire: 9, earth: 5, air: 7, water: 4 }
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
    incompatible: ['双子座', '射手座', '双鱼座'],
    personalityTraits: ['细致', '完美主义', '实用', '挑剔'],
    strengths: ['分析力', '可靠性', '组织力'],
    weaknesses: ['挑剔', '焦虑', '过度批判'],
    elementWeight: { fire: 4, earth: 8, air: 5, water: 6 }
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
    incompatible: ['巨蟹座', '摩羯座', '白羊座'],
    personalityTraits: ['优雅', '公正', '追求和谐', '犹豫'],
    strengths: ['外交能力', '审美力', '公正性'],
    weaknesses: ['犹豫不决', '逃避冲突', '肤浅'],
    elementWeight: { fire: 5, earth: 4, air: 9, water: 3 }
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
    incompatible: ['狮子座', '金牛座', '双子座'],
    personalityTraits: ['神秘', '强烈', '洞察力', '多疑'],
    strengths: ['洞察力', '决心', '激情'],
    weaknesses: ['多疑', '嫉妒', '极端'],
    elementWeight: { fire: 3, earth: 6, air: 4, water: 8 }
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
    incompatible: ['处女座', '双鱼座', '巨蟹座'],
    personalityTraits: ['自由', '乐观', '爱冒险', '不负责'],
    strengths: ['乐观', '冒险精神', '正直'],
    weaknesses: ['不负责', '冲动', '缺乏耐心'],
    elementWeight: { fire: 7, earth: 4, air: 6, water: 3 }
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
    incompatible: ['白羊座', '天秤座', '狮子座'],
    personalityTraits: ['实际', '有责任心', '目标明确', '悲观'],
    strengths: ['责任感', '耐心', '组织力'],
    weaknesses: ['悲观', '固执', '工作狂'],
    elementWeight: { fire: 3, earth: 9, air: 5, water: 6 }
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
    incompatible: ['金牛座', '天蝎座', '巨蟹座'],
    personalityTraits: ['创新', '独立', '人道主义', '冷漠'],
    strengths: ['创新力', '独立性', '智慧'],
    weaknesses: ['冷漠', '叛逆', '理想主义'],
    elementWeight: { fire: 4, earth: 3, air: 8, water: 5 }
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
    incompatible: ['双子座', '处女座', '射手座'],
    personalityTraits: ['浪漫', '想象力', '直觉强', '逃避'],
    strengths: ['同情心', '创造力', '直觉力'],
    weaknesses: ['逃避现实', '过度敏感', '缺乏界限'],
    elementWeight: { fire: 3, earth: 5, air: 4, water: 8 }
  }
];

// 映射函数确保元素名称正确对应到内置键名
// 映射函数确保元素名称正确对应到内置键名
const getElementKey = (element) => {
  if (!element) return 'fire';
  const el = String(element).toLowerCase();
  if (el.includes('火') || el.includes('fire')) return 'fire';
  if (el.includes('土') || el.includes('earth')) return 'earth';
  if (el.includes('风') || el.includes('air')) return 'air';
  if (el.includes('水') || el.includes('water')) return 'water';
  return 'fire';
};

// 星象数据（基于日期的星象影响）
const PLANETARY_INFLUENCES = {
  // 行星位置对星座的影响权重
  sun: { fire: 8, earth: 3, air: 6, water: 4 },
  moon: { fire: 4, earth: 5, air: 4, water: 9 },
  mercury: { fire: 5, earth: 6, air: 8, water: 4 },
  venus: { fire: 6, earth: 7, air: 5, water: 8 },
  mars: { fire: 9, earth: 4, air: 6, water: 3 },
  jupiter: { fire: 7, earth: 8, air: 5, water: 6 },
  saturn: { fire: 3, earth: 9, air: 4, water: 7 },
  uranus: { fire: 5, earth: 3, air: 9, water: 4 },
  neptune: { fire: 3, earth: 4, air: 5, water: 9 },
  pluto: { fire: 4, earth: 7, air: 3, water: 8 }
};

// 心灵问答数据库
const SOUL_QUESTIONS = {
  love: [
    "我何时能找到真爱？",
    "如何改善当前的感情关系？",
    "我应该主动表白吗？",
    "如何判断对方是否真心？",
    "在感情中如何保持自我？"
  ],
  career: [
    "我的职业发展前景如何？",
    "何时是换工作的最佳时机？",
    "如何提升职场竞争力？",
    "我应该创业还是继续打工？",
    "如何平衡工作与生活？"
  ],
  health: [
    "如何改善身体健康状况？",
    "需要注意哪些健康问题？",
    "如何缓解压力？",
    "什么样的运动最适合我？",
    "如何提升睡眠质量？"
  ],
  finance: [
    "我的财运何时会有转机？",
    "如何进行合理的投资？",
    "如何控制不必要的开支？",
    "今年适合进行大额消费吗？",
    "如何提升理财能力？"
  ],
  personal: [
    "如何提升自信心？",
    "我应该学习什么新技能？",
    "如何改善人际关系？",
    "今年的主要目标是什么？",
    "如何找到生活的意义？"
  ]
};

// 心灵问答答案库（按星座特性分类）
const SOUL_ANSWERS = {
  // 火象星座（白羊、狮子、射手）
  fire: {
    love: [
      "勇敢追求，但要注意表达方式",
      "热情似火，但要学会控制节奏",
      "主动出击，但要尊重对方感受",
      "真诚表达，但不要急于求成"
    ],
    career: [
      "发挥领导力，勇于承担责任",
      "积极进取，但要注意团队合作",
      "创新思维，但要注重实际效果",
      "目标明确，但要保持耐心"
    ],
    health: [
      "多进行户外运动，释放能量",
      "注意情绪管理，避免过度激动",
      "保持规律作息，避免熬夜",
      "适当放松，不要给自己太大压力"
    ],
    finance: [
      "投资要有冒险精神，但要控制风险",
      "赚钱机会较多，但要理性消费",
      "积极开拓财源，但要避免冲动",
      "财运总体不错，但要合理规划"
    ],
    personal: [
      "保持自信，勇于展现自我",
      "多尝试新事物，扩展视野",
      "学会控制情绪，保持冷静",
      "发挥创造力，追求梦想"
    ]
  },
  // 土象星座（金牛、处女、摩羯）
  earth: {
    love: [
      "稳扎稳打，建立可靠关系",
      "注重实际，不要过分理想化",
      "耐心经营，感情需要时间培养",
      "真诚付出，但要有自我保护意识"
    ],
    career: [
      "脚踏实地，一步一个脚印",
      "注重细节，追求完美",
      "长期规划，不要急于求成",
      "发挥耐心，积累经验"
    ],
    health: [
      "注意饮食规律，保持健康",
      "适当运动，不要过度劳累",
      "关注肠胃健康，避免压力",
      "保持稳定作息，避免变化"
    ],
    finance: [
      "稳健理财，避免高风险投资",
      "积累财富需要耐心和时间",
      "合理规划开支，注重储蓄",
      "财运稳定，但要避免过度保守"
    ],
    personal: [
      "保持务实态度，注重实际",
      "培养耐心，不要急于求成",
      "注重细节，追求完美",
      "建立稳定的人际关系"
    ]
  },
  // 风象星座（双子、天秤、水瓶）
  air: {
    love: [
      "注重沟通，但要避免过度理性",
      "保持新鲜感，避免单调",
      "尊重对方空间，保持独立",
      "灵活应变，但要保持真诚"
    ],
    career: [
      "发挥沟通优势，建立人脉",
      "创新思维，但要结合实际",
      "多学习新知识，保持竞争力",
      "注重合作，发挥团队力量"
    ],
    health: [
      "注意神经系统健康，避免过度思考",
      "保持社交活动，避免孤独",
      "适当冥想，平静心灵",
      "注意呼吸系统健康"
    ],
    finance: [
      "灵活理财，善于发现机会",
      "多元化投资，分散风险",
      "善于利用信息优势",
      "财运多变，要灵活应对"
    ],
    personal: [
      "保持好奇心，不断学习",
      "注重沟通交流，扩展人脉",
      "培养独立思考能力",
      "平衡理性与感性"
    ]
  },
  // 水象星座（巨蟹、天蝎、双鱼）
  water: {
    love: [
      "相信直觉，但要理性判断",
      "用心感受，但要避免过度敏感",
      "真诚付出，但要保护自己",
      "深度连接，但要保持独立"
    ],
    career: [
      "发挥创造力，注重情感价值",
      "相信直觉，但要结合实际",
      "注重人际关系，发挥同理心",
      "保持耐心，等待时机"
    ],
    health: [
      "注意情绪管理，避免抑郁",
      "关注内分泌系统健康",
      "适当进行水中运动",
      "保持积极心态，避免消极"
    ],
    finance: [
      "感性理财，但要保持理性",
      "财运与情绪状态相关",
      "适合投资有情感价值的项目",
      "注意控制消费冲动"
    ],
    personal: [
      "相信直觉，但要理性验证",
      "培养情感智慧，理解他人",
      "保持敏感，但不要过度",
      "发挥创造力，追求梦想"
    ]
  }
};

// 幸运物品数据库 - 增强版
// 幸运物品数据库 - 增强版 (包含生活用品与配饰)
const LUCKY_ITEMS = {
  fire: [
    { name: '红色笔记本', icon: '📓', description: '记录灵感，提升创造力' },
    { name: '玛瑙手链', icon: '🔴', description: '增强勇气，保护能量' },
    { name: '香薰蜡烛', icon: '🕯️', description: '净化环境，提升热情' },
    { name: '运动手环', icon: '🏃', description: '记录活力，激励行动' },
    { name: '太阳镜', icon: '🕶️', description: '保护视力，增强自信' },
    { name: '火焰项链', icon: '🔥', description: '点燃热情，释放潜力' },
    { name: '红色领带', icon: '👔', description: '职场助推，增强气场' },
    { name: '黑曜石', icon: '🌑', description: '吸收负能量，保持专注' },
    { name: '金丝边眼镜', icon: '👓', description: '睿智冷静，捕捉机遇' },
    { name: '红色钥匙扣', icon: '🔑', description: '开启好运，守护平安' },
    { name: '便携咖啡杯', icon: '☕', description: '随时活力，社交核心' },
    { name: '红宝石耳钉', icon: '👂', description: '精致魅力，吸引贵人' },
    { name: '复古打火机', icon: '🔥', description: '灵光乍现，指引方向' },
    { name: '运动跑鞋', icon: '👟', description: '大步向前，无畏挑战' }
  ],
  earth: [
    { name: '皮质钱包', icon: '👝', description: '聚财守财，增强稳定' },
    { name: '绿植盆栽', icon: '🌱', description: '净化空气，带来生机' },
    { name: '实木书签', icon: '📖', description: '辅助学习，增强耐心' },
    { name: '陶瓷杯', icon: '☕', description: '温暖人心，促进交流' },
    { name: '玉石挂件', icon: '💎', description: '稳定情绪，增强耐力' },
    { name: '大地色系抱枕', icon: '🛋️', description: '家和万事兴，提升自愈力' },
    { name: '石英钟', icon: '🕒', description: '精准控制，提高效率' },
    { name: '黄水晶', icon: '💛', description: '吸纳财富，增强意志' },
    { name: '真皮腰带', icon: '🎫', description: '约束自我，坚持原则' },
    { name: '帆布购物袋', icon: '🛍️', description: '环保生活，积攒福气' },
    { name: '紫砂壶', icon: '🍵', description: '沉淀心性，细品人生' },
    { name: '琥珀戒指', icon: '💍', description: '凝聚时光，增强定力' },
    { name: '陶瓷香薰炉', icon: '🪔', description: '安神助眠，稳固内心' },
    { name: '实木笔记本夹', icon: '📁', description: '井然有序，规划未来' }
  ],
  air: [
    { name: '智能手机', icon: '📱', description: '便捷沟通，获取信息' },
    { name: '水晶饰品', icon: '🔮', description: '净化思维，增强灵感' },
    { name: '羽毛笔', icon: '✒️', description: '激发创意，提升表达' },
    { name: '风铃', icon: '🎐', description: '带来好运，净化环境' },
    { name: '蓝牙耳机', icon: '🎧', description: '专注学习，避免干扰' },
    { name: '电风扇', icon: '🌀', description: '流通能量，扫除沉闷' },
    { name: '望远镜', icon: '🔭', description: '高瞻远瞩，开拓眼界' },
    { name: '纸飞机饰品', icon: '✈️', description: '追逐自由，释放压力' },
    { name: '拼图挂画', icon: '🖼️', description: '拼凑智慧，逻辑清晰' },
    { name: '白色绸缎围巾', icon: '🧣', description: '随风而动，灵活应变' },
    { name: '电子书阅读器', icon: '📖', description: '知识海洋，思维飞翔' },
    { name: '银色长项链', icon: '⛓️', description: '连接沟通，优雅灵动' },
    { name: '迷你无人机', icon: '🛸', description: '不同视角，发现奇迹' },
    { name: '清冷香水', icon: '🧴', description: '独树一帜，保持清醒' }
  ],
  water: [
    { name: '海洋香薰', icon: '🌊', description: '平静心灵，增强直觉' },
    { name: '蓝色水晶', icon: '💧', description: '净化情感，带来宁静' },
    { name: '鱼形挂饰', icon: '🐠', description: '带来好运，增强感性' },
    { name: '茶具套装', icon: '🍵', description: '促进交流，平静内心' },
    { name: '珍珠项链', icon: '⚪', description: '增强魅力，保护情感' },
    { name: '贝壳装饰', icon: '🐚', description: '和谐包容，温柔以待' },
    { name: '雨伞', icon: '☂️', description: '未雨绸缪，安全保护' },
    { name: '圆镜', icon: '🪞', description: '反射智慧，看清自我' },
    { name: '雾化加湿器', icon: '🌫️', description: '滋润身心，缓解干燥' },
    { name: '海蓝宝石手链', icon: '📿', description: '疗愈心灵，增强沟通' },
    { name: '波浪形发贴', icon: '🎀', description: '柔美顺滑，顺势而为' },
    { name: '透明水杯', icon: '🥛', description: '心如止水，清澈明见' },
    { name: '月亮石挂坠', icon: '🌙', description: '梦境启示，感知未来' },
    { name: '蓝色帆布鞋', icon: '👟', description: '温柔足迹，流淌好运' }
  ]
};

// 幸运颜色数据库
const LUCKY_COLORS = [
  { name: '正红色', value: '#FF0000' },
  { name: '橘黄色', value: '#FFA500' },
  { name: '明黄色', value: '#FFFF00' },
  { name: '草绿色', value: '#7CFC00' },
  { name: '天蓝色', value: '#87CEEB' },
  { name: '靛青色', value: '#000080' },
  { name: '紫罗兰', value: '#EE82EE' },
  { name: '珍珠白', value: '#FFFFFF' },
  { name: '金闪色', value: '#FFD700' },
  { name: '银灰色', value: '#C0C0C0' },
  { name: '珊瑚粉', value: '#FF7F50' },
  { name: '薄荷绿', value: '#98FB98' },
  { name: '咖啡棕', value: '#A52A2A' },
  { name: '酒红色', value: '#800000' },
  { name: '丁香紫', value: '#E6E6FA' },
  { name: '奶油白', value: '#FFFDD0' },
  { name: '香槟金', value: '#F7E7CE' },
  { name: '玫瑰金', value: '#B76E79' },
  { name: '松石绿', value: '#40E0D0' },
  { name: '橄榄绿', value: '#808000' },
  { name: '午夜蓝', value: '#191970' },
  { name: '樱花粉', value: '#FFB7C5' },
  { name: '杏黄色', value: '#FBCEB1' },
  { name: '焦糖色', value: '#AF6E4D' },
  { name: '莫兰迪灰', value: '#929292' }
];

// 幸运食物数据库
const LUCKY_FOODS = {
  fire: ['麻辣烫', '红烩牛肉', '石榴', '草莓', '红辣椒', '炭烤牛排', '番茄炒蛋', '枸杞茶', '红烧肉', '火辣鸡翅', '鲜果披萨', '热可可', '红石榴汁', '烤羊排', '麻辣火锅'],
  earth: ['土豆泥', '玉米', '南瓜派', '糙米饭', '花生', '地瓜', '面包', '蜂蜜', '栗子', '松子', '燕麦片', '黑芝麻糊', '全麦饼干', '核桃', '糯米滋'],
  air: ['棉花糖', '柠檬片', '薄荷糖', '爆米花', '蔬菜沙拉', '气泡水', '面条', '果冻', '苏打饼干', '水果拼盘', '爆汁橙', '马卡龙', '气泡鸡尾酒', '三明治', '松餅'],
  water: ['海鲜大餐', '西瓜', '酸奶', '银耳汤', '黑豆', '海带丝', '冬瓜汤', '椰子水', '鲜草莓派', '三文鱼', '豆腐汤', '莲藕汁', '雪梨炖冰糖', '蓝莓汁', '清蒸鱼']
};

// 生成每日唯一ID（基于日期和星座）
const generateDailyId = (horoscopeName, date = new Date()) => {
  const dateStr = date.toISOString().split('T')[0];
  // 使用浏览器兼容的简单哈希函数替代Buffer
  const horoscopeCode = btoa(encodeURIComponent(horoscopeName)).substring(0, 6);
  return `${dateStr}-${horoscopeCode}`;
};

// 伪随机数生成器（基于日期和星座的唯一性）
const dailyRandom = (horoscopeName, seed = 'horoscope') => {
  const dailyId = generateDailyId(horoscopeName);
  let hash = 0;
  for (let i = 0; i < dailyId.length; i++) {
    hash = ((hash << 5) - hash) + dailyId.charCodeAt(i);
    hash = hash & hash; // 转换为32位整数
  }
  const randomSeed = (hash + seed.charCodeAt(0)) % 2147483647;
  return (randomSeed * 16807) % 2147483647 / 2147483647;
};

// 计算行星位置影响（简化版）
const calculatePlanetaryInfluence = (date = new Date()) => {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

  // 简化的行星位置计算
  return {
    sun: Math.sin(dayOfYear / 365 * 2 * Math.PI) * 0.5 + 0.5,
    moon: Math.sin(dayOfYear / 27.3 * 2 * Math.PI) * 0.5 + 0.5,
    mercury: Math.sin(dayOfYear / 88 * 2 * Math.PI) * 0.5 + 0.5,
    venus: Math.sin(dayOfYear / 225 * 2 * Math.PI) * 0.5 + 0.5,
    mars: Math.sin(dayOfYear / 687 * 2 * Math.PI) * 0.5 + 0.5
  };
};

/**
 * 计算每日运势分数（0-100分）
 * 优化算法，避免分数偏低，提供更积极的运势评分
 */
export const calculateDailyHoroscopeScore = (horoscopeName, date = new Date()) => {
  const horoscope = HOROSCOPE_DATA_ENHANCED.find(h => h.name === horoscopeName);
  if (!horoscope) return 82; // 提高默认分数

  const planetaryInfluence = calculatePlanetaryInfluence(date);
  const randomFactor = dailyRandom(horoscopeName, 'score');

  // 提高基础分数，确保整体分数更积极
  let baseScore = 65; // 从50提高到65

  // 行星影响计算 - 优化权重分配
  Object.keys(planetaryInfluence).forEach(planet => {
    const influence = planetaryInfluence[planet];
    const elementKey = getElementKey(horoscope.element);
    const weight = PLANETARY_INFLUENCES[planet]?.[elementKey] || 5;
    
    // 优化：增加正向偏移，减少负向影响
    if (influence > 0.5) {
      baseScore += (influence - 0.5) * weight * 1.2; // 正向影响增强20%
    } else {
      baseScore += (influence - 0.5) * weight * 0.8; // 负向影响减弱20%
    }
  });

  // 增加星座字符偏移，确保不同星座分数即使在同一天也具有差异性
  const nameHash = (horoscopeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 15) - 3; // 减小负向偏移
  baseScore += nameHash;

  // 优化随机因素：减少负向波动，增加正向波动
  const optimizedRandom = (randomFactor - 0.3) * 25; // 调整随机范围，减少负向波动
  baseScore += optimizedRandom;

  // 基于星座元素特性的额外加分
  const elementBonus = {
    'fire': 8,   // 火象星座：积极、热情
    'earth': 5,  // 土象星座：稳定、务实  
    'air': 7,    // 风象星座：灵活、聪明
    'water': 6   // 水象星座：感性、直觉
  }[getElementKey(horoscope.element)] || 0;
  
  baseScore += elementBonus;

  // 确保分数在合理范围内且更积极
  return Math.max(55, Math.min(98, Math.round(baseScore))); // 提高最低分限制
};

/**
 * 生成心灵问答
 */
export const generateSoulQuestion = (horoscopeName, date = new Date()) => {
  const horoscope = HOROSCOPE_DATA_ENHANCED.find(h => h.name === horoscopeName);
  if (!horoscope) return null;

  const element = getElementKey(horoscope.element);
  const random = dailyRandom(horoscopeName, 'question');

  // 选择问题类型
  const categories = Object.keys(SOUL_QUESTIONS);
  if (categories.length === 0) return null;

  const categoryIndex = Math.floor(random * categories.length);
  const category = categories[categoryIndex];

  // 选择具体问题
  const questions = SOUL_QUESTIONS[category];
  if (!questions || questions.length === 0) return null;

  const questionIndex = Math.floor(dailyRandom(horoscopeName, category) * questions.length);
  const question = questions[Math.min(questionIndex, questions.length - 1)];

  // 生成答案（基于星座特性）
  const answers = SOUL_ANSWERS[element]?.[category] || ["保持积极心态，一切都会好起来"];
  if (answers.length === 0) return { question, answer: "保持积极", category, timestamp: date.getTime() };

  const answerIndex = Math.floor(dailyRandom(horoscopeName, 'answer') * answers.length);
  const answer = answers[Math.min(answerIndex, answers.length - 1)];

  return {
    question,
    answer,
    category,
    timestamp: date.getTime()
  };
};

/**
 * 生成幸运物品
 */
export const generateLuckyItem = (horoscopeName, date = new Date()) => {
  const horoscope = HOROSCOPE_DATA_ENHANCED.find(h => h.name === horoscopeName);
  if (!horoscope) return null;

  const element = getElementKey(horoscope.element);
  const items = LUCKY_ITEMS[element] || LUCKY_ITEMS.fire;

  if (!items || items.length === 0) {
    return {
      name: '幸运护身符',
      icon: '🔮',
      description: '带来好运和保护能量',
      element: horoscope.element,
      horoscope: horoscopeName,
      date: date.toISOString().split('T')[0]
    };
  }

  const random = dailyRandom(horoscopeName, 'item');
  const itemIndex = Math.floor(random * items.length);

  return {
    ...items[Math.min(itemIndex, items.length - 1)],
    element: horoscope.element,
    horoscope: horoscopeName,
    date: date.toISOString().split('T')[0]
  };
};

/**
 * 生成完整的每日运势数据
 */
export const generateDailyHoroscope = (horoscopeName, date = new Date()) => {
  const horoscope = HOROSCOPE_DATA_ENHANCED.find(h => h.name === horoscopeName);
  if (!horoscope) return null;

  const overallScore = calculateDailyHoroscopeScore(horoscopeName, date);
  const soulQuestion = generateSoulQuestion(horoscopeName, date);

  // 生成各领域分数（基于总体分数和星座特性）
  const random = dailyRandom(horoscopeName, 'detailed');
  const baseScores = {
    love: overallScore * 0.8 + random * 20,
    wealth: overallScore * 0.7 + (1 - random) * 30,
    career: overallScore * 0.9 + random * 10,
    study: overallScore * 0.6 + random * 40,
    social: overallScore * 0.75 + (random * 0.5 + 0.25) * 25
  };

  // 增加更精细的偏移量，确保即使是相邻星座分数也不同
  const nameOffset = horoscopeName.length * 2;
  baseScores.love += (dailyRandom(horoscopeName, 'love_offset') - 0.5) * 10 + nameOffset % 5;
  baseScores.wealth += (dailyRandom(horoscopeName, 'wealth_offset') - 0.5) * 10 + (nameOffset * 3) % 5;
  baseScores.career += (dailyRandom(horoscopeName, 'career_offset') - 0.5) * 10 + (nameOffset * 7) % 5;
  baseScores.study += (dailyRandom(horoscopeName, 'study_offset') - 0.5) * 10 + (nameOffset * 11) % 5;
  baseScores.social += (dailyRandom(horoscopeName, 'social_offset') - 0.5) * 10 + (nameOffset * 13) % 5;

  // 根据星座特性调整分数
  switch (horoscopeName) {
    case '白羊座':
    case '狮子座':
    case '射手座': // 火象星座
      baseScores.career += 5;
      baseScores.love += 3;
      break;
    case '金牛座':
    case '处女座':
    case '摩羯座': // 土象星座
      baseScores.wealth += 5;
      baseScores.career += 3;
      break;
    case '双子座':
    case '天秤座':
    case '水瓶座': // 风象星座
      baseScores.study += 5;
      baseScores.love += 3;
      break;
    case '巨蟹座':
    case '天蝎座':
    case '双鱼座': // 水象星座
      baseScores.love += 5;
      baseScores.study += 3;
      break;
    default:
      // 默认情况下不做额外调整
      break;
  }

  // 确保分数在合理范围内且保持独特性
  Object.keys(baseScores).forEach(key => {
    // 再次通过微调确保独特性
    const finalMod = (horoscopeName.charCodeAt(0) + key.length) % 5;
    baseScores[key] = Math.max(5, Math.min(100, Math.round(baseScores[key] + finalMod)));
  });

  // 确保所有函数调用都返回字符串值，而不是函数引用
  const dailyForecast = {
    love: {
      score: baseScores.love,
      description: getScoreDescription(baseScores.love),
      trend: getTrend(baseScores.love)
    },
    wealth: {
      score: baseScores.wealth,
      description: getScoreDescription(baseScores.wealth),
      trend: getTrend(baseScores.wealth)
    },
    career: {
      score: baseScores.career,
      description: getScoreDescription(baseScores.career),
      trend: getTrend(baseScores.career)
    },
    study: {
      score: baseScores.study,
      description: getScoreDescription(baseScores.study),
      trend: getTrend(baseScores.study)
    },
    social: {
      score: baseScores.social,
      description: getScoreDescription(baseScores.social),
      trend: getTrend(baseScores.social)
    }
  };

  const element = getElementKey(horoscope.element);
  const items = LUCKY_ITEMS[element] || LUCKY_ITEMS.fire;
  const itemRandom = dailyRandom(horoscopeName, 'item');
  const accessoryRandom = dailyRandom(horoscopeName, 'accessory');

  // 防御性处理：确保 items 存在且不为空
  // 即使数据库出现异常，也保证有一个默认项
  const fallbackItem = { name: '幸运石头', icon: '🪨', description: '虽然平凡但坚固' };
  const safeItems = (items && items.length > 0)
    ? items
    : (LUCKY_ITEMS.fire && LUCKY_ITEMS.fire.length > 0 ? LUCKY_ITEMS.fire : [fallbackItem]);

  // 确保索引访问安全
  const luckyItem = safeItems[Math.floor(itemRandom * safeItems.length) % safeItems.length] || safeItems[0] || fallbackItem;
  const luckyAccessory = safeItems[Math.floor(accessoryRandom * safeItems.length) % safeItems.length] || safeItems[0] || fallbackItem;

  // 幸运颜色算法优化
  const colorRandom = dailyRandom(horoscopeName, 'color');
  const safeColors = (LUCKY_COLORS && LUCKY_COLORS.length > 0) ? LUCKY_COLORS : [{ name: '正红色', value: '#FF0000' }];
  const selectedColor = safeColors[Math.floor(colorRandom * safeColors.length) % safeColors.length] || { name: '正红色', value: '#FF0000' };

  // 幸运食物算法优化
  const foodRandom = dailyRandom(horoscopeName, 'food');
  const foodPool = LUCKY_FOODS[element] || LUCKY_FOODS.fire;
  // 防御性处理：确保 foodPool 存在且不为空
  const safeFoodPool = (foodPool && foodPool.length > 0) ? foodPool : LUCKY_FOODS.fire;
  const selectedFood = safeFoodPool[Math.floor(foodRandom * safeFoodPool.length) % safeFoodPool.length];

  const recommendations = {
    luckyColors: [selectedColor?.value || '#FF0000'],
    luckyColorNames: [selectedColor?.name || '正红色'],
    luckyNumbers: Array.isArray(horoscope.luckyNumber) ? horoscope.luckyNumber : [horoscope.luckyNumber || 7],
    compatibleSigns: Array.isArray(horoscope.compatible) ? horoscope.compatible : [horoscope.compatible || '未知星座'],
    todayMoonSign: String(getRandomMoonSign(horoscopeName) || '白羊座'),
    soulQuestion: soulQuestion,
    luckyItem: String(luckyItem?.name || '幸运物品'),
    luckyAccessory: String(luckyAccessory?.name || '幸运配饰'),
    luckyTime: ['清晨', '上午', '中午', '下午', '傍晚', '深夜'][Math.floor(dailyRandom(horoscopeName, 'time') * 6)] +
      Math.floor(dailyRandom(horoscopeName, 'hour') * 12 + 1) + '点',
    luckyDirection: ['东方', '南方', '西方', '北方', '东南', '东北', '西南', '西北'][Math.floor(dailyRandom(horoscopeName, 'dir') * 8)],
    luckyFood: selectedFood,
    luckyFlower: ['向日葵', '郁金香', '玫瑰', '百合', '康乃馨', '雏菊', '薰衣草', '风铃草'][Math.floor(dailyRandom(horoscopeName, 'flower') * 8)],
    positiveAdvice: String(generatePositiveAdvice(horoscopeName) || '保持积极心态'),
    avoidAdvice: String(generateAvoidAdvice(horoscopeName) || '避免消极思维'),
    dailyReminder: String(generateDailyReminder(horoscopeName) || '今天会是美好的一天')
  };

  const horoscopeInfo = {
    name: horoscope.name,
    element: horoscope.element,
    dateRange: horoscope.dateRange,
    icon: horoscope.icon,
    traits: horoscope.traits,
    color: horoscope.color
  };

  return {
    horoscopeInfo,
    dailyForecast,
    recommendations,
    overallDescription: generateOverallDescription(overallScore, horoscopeName),
    overallScore: overallScore,
    timestamp: date.getTime(),
    dailyId: generateDailyId(horoscopeName, date)
  };
};

// 辅助函数
const getScoreDescription = (score) => {
  if (score >= 90) return '极佳';
  if (score >= 75) return '很好';
  if (score >= 60) return '良好';
  if (score >= 45) return '一般';
  if (score >= 30) return '较差';
  return '很差';
};

const getTrend = (score) => {
  if (score >= 80) return '大幅上升';
  if (score >= 60) return '上升';
  if (score >= 40) return '平稳';
  if (score >= 20) return '下降';
  return '大幅下降';
};

/**
 * 计算今日月亮星座
 * 基于月亮周期（约27.3天）和当前日期计算
 */
export const calculateMoonSign = (date = new Date()) => {
  // 月亮周期约27.3天，每个星座停留约2.275天
  const moonCycleDays = 27.3;
  const signsPerCycle = 12;
  const daysPerSign = moonCycleDays / signsPerCycle;
  
  // 参考点：假设某个日期月亮在白羊座开始
  const referenceDate = new Date('2024-01-01'); // 月亮在白羊座开始
  
  // 计算天数差
  const timeDiff = date.getTime() - referenceDate.getTime();
  const daysDiff = Math.abs(timeDiff / (1000 * 60 * 60 * 24));
  
  // 计算当前月亮在周期中的位置
  const cyclePosition = daysDiff % moonCycleDays;
  const currentSignIndex = Math.floor(cyclePosition / daysPerSign);
  
  const moonSigns = [
    '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
    '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
  ];
  
  return moonSigns[currentSignIndex % moonSigns.length];
};

/**
 * 获取月亮星座的影响描述
 */
export const getMoonSignInfluence = (moonSign) => {
  const influences = {
    '白羊座': '今日月亮在白羊座，带来冲动的能量和新的开始。适合采取行动，但要注意控制脾气。',
    '金牛座': '今日月亮在金牛座，增强稳定性和物质享受。适合处理财务问题，享受美食。',
    '双子座': '今日月亮在双子座，促进沟通和学习。适合社交活动、学习和信息交流。',
    '巨蟹座': '今日月亮在巨蟹座，强化情感和家庭关系。适合与家人相处，关注内心感受。',
    '狮子座': '今日月亮在狮子座，激发创造力和自信。适合展现自我，追求个人目标。',
    '处女座': '今日月亮在处女座，注重细节和健康。适合整理环境，关注身体健康。',
    '天秤座': '今日月亮在天秤座，强调平衡和人际关系。适合社交活动，寻求和谐。',
    '天蝎座': '今日月亮在天蝎座，加深直觉和洞察力。适合深度思考，探索隐秘。',
    '射手座': '今日月亮在射手座，带来乐观和冒险精神。适合旅行学习，扩展视野。',
    '摩羯座': '今日月亮在摩羯座，增强责任感和目标导向。适合工作规划，追求成就。',
    '水瓶座': '今日月亮在水瓶座，激发创新和独立思想。适合科技探索，社会活动。',
    '双鱼座': '今日月亮在双鱼座，强化直觉和同情心。适合艺术创作，冥想放松。'
  };
  
  return influences[moonSign] || '月亮星座带来神秘的能量影响。';
};

// 保持向后兼容性
const getRandomMoonSign = () => {
  return calculateMoonSign(new Date());
};

const generatePositiveAdvice = (horoscopeName) => {
  const advices = {
    '白羊座': '积极表达、展现领导力',
    '金牛座': '稳扎稳打、注重实际',
    '双子座': '多沟通交流、学习新知识',
    '巨蟹座': '关心家人、表达情感',
    '狮子座': '展现自信、发挥创造力',
    '处女座': '注重细节、追求完美',
    '天秤座': '保持平衡、促进和谐',
    '天蝎座': '深度思考、相信直觉',
    '射手座': '冒险探索、保持乐观',
    '摩羯座': '专注目标、脚踏实地',
    '水瓶座': '创新思维、独立行动',
    '双鱼座': '发挥想象、相信直觉'
  };
  return advices[horoscopeName] || '保持积极心态，把握机会';
};

const generateAvoidAdvice = (horoscopeName) => {
  const avoids = {
    '白羊座': '冲动行事、过度自我',
    '金牛座': '固执己见、拒绝变化',
    '双子座': '三心二意、缺乏耐心',
    '巨蟹座': '过度敏感、情绪化',
    '狮子座': '自负炫耀、控制欲强',
    '处女座': '过度挑剔、焦虑不安',
    '天秤座': '犹豫不决、逃避冲突',
    '天蝎座': '多疑嫉妒、极端行为',
    '射手座': '不负责任、冲动决定',
    '摩羯座': '过度悲观、工作狂',
    '水瓶座': '过于理性、冷漠疏离',
    '双鱼座': '逃避现实、缺乏界限'
  };
  return avoids[horoscopeName] || '避免消极思维，保持理性';
};

const generateDailyReminder = (horoscopeName) => {
  const reminders = {
    '白羊座': '今天适合主动出击，但要注意控制脾气，避免因小事与人发生冲突。',
    '金牛座': '保持稳定节奏，避免被外界干扰，专注完成手头工作会有不错收获。',
    '双子座': '今天思维活跃，适合学习交流，但要避免同时处理太多事情导致分心。',
    '巨蟹座': '情感丰富的一天，多关心家人朋友，但要注意不要过度敏感影响心情。',
    '狮子座': '展现自信的好时机，但要避免过度强势，多听取他人意见会有帮助。',
    '处女座': '注重细节的一天，但不要过分追求完美，适当放松会让效率更高。',
    '天秤座': '适合社交活动，但要避免为了和谐而委屈自己，保持真诚最重要。',
    '天蝎座': '直觉敏锐，适合深度思考，但要避免因多疑而影响人际关系。',
    '射手座': '冒险精神旺盛，适合尝试新事物，但要考虑实际可行性再行动。',
    '摩羯座': '专注工作会有好成绩，但要注意劳逸结合，避免过度劳累。',
    '水瓶座': '创新思维活跃，适合头脑风暴，但要考虑方案的实用性。',
    '双鱼座': '想象力丰富，适合创作和冥想，但要避免过度沉溺于幻想。'
  };
  return reminders[horoscopeName] || '保持积极心态，今天会有不错的收获。';
};

const generateOverallDescription = (score, horoscopeName) => {
  if (score >= 80) {
    return `今天对${horoscopeName}来说是充满机遇的一天，各方面运势都很不错，要好好把握！`;
  } else if (score >= 60) {
    return `今天${horoscopeName}的运势总体良好，只要保持积极心态，会有不错的发展。`;
  } else if (score >= 40) {
    return `今天${horoscopeName}的运势平稳，需要多一些耐心和努力才能获得理想结果。`;
  } else {
    return `今天${horoscopeName}可能会遇到一些挑战，但只要保持冷静，一切都会好起来。`;
  }
};

/**
 * 验证每日运势数据的唯一性
 */
export const validateHoroscopeUniqueness = (horoscopeData1, horoscopeData2) => {
  if (!horoscopeData1 || !horoscopeData2) return false;

  return (
    horoscopeData1.dailyId === horoscopeData2.dailyId &&
    horoscopeData1.horoscopeInfo.name === horoscopeData2.horoscopeInfo.name &&
    horoscopeData1.timestamp === horoscopeData2.timestamp
  );
};

const horoscopeAlgorithm = {
  HOROSCOPE_DATA_ENHANCED,
  calculateDailyHoroscopeScore,
  generateSoulQuestion,
  generateLuckyItem,
  generateDailyHoroscope,
  validateHoroscopeUniqueness
};

export default horoscopeAlgorithm;