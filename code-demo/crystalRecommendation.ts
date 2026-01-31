
import { CRYSTALS, CrystalDefinition } from './constants/crystals';
import { CHAKRAS } from './constants/chakra';
import type { ChakraScores, UserProfile } from '../types';

export interface EnergyIndex {
  physical: number;  // 体力 0-100
  mental: number;    // 脑力 0-100
  emotional: number; // 情绪 0-100
}

export interface CrystalRecommendation {
  crystal: CrystalDefinition;
  matchScore: number;
  reason: string;
  healingFocus: string;
  affirmation: string;
  chakraPriority: string[];
}

export interface DailyCrystalReading {
  date: string;
  luckyCrystal: CrystalRecommendation;
  secondaryCrystals: CrystalRecommendation[];
  overallEnergy: {
    level: 'low' | 'moderate' | 'high';
    description: string;
  };
  healingGuidance: {
    theme: string;
    advice: string[];
    meditation: string;
  };
}

// 计算脉轮失衡状态，返回需要优先关注的脉轮
function calculateChakraPriority(
  chakraStatus: ChakraScores | undefined,
  energyIndex: EnergyIndex
): { chakraId: string; score: number; priority: number }[] {
  if (!chakraStatus) {
    // 如果没有脉轮数据，根据能量指数推断
    const priorities: { chakraId: string; score: number; priority: number }[] = [];
    
    // 体力低 -> 海底轮、太阳轮
    if (energyIndex.physical < 40) {
      priorities.push({ chakraId: 'root', score: -50, priority: 1 });
      priorities.push({ chakraId: 'solar', score: -30, priority: 2 });
    }
    // 情绪低 -> 心轮、生殖轮
    if (energyIndex.emotional < 40) {
      priorities.push({ chakraId: 'heart', score: -40, priority: 1 });
      priorities.push({ chakraId: 'sacral', score: -30, priority: 2 });
    }
    // 脑力低 -> 眉心轮、顶轮
    if (energyIndex.mental < 40) {
      priorities.push({ chakraId: 'thirdEye', score: -35, priority: 1 });
      priorities.push({ chakraId: 'crown', score: -25, priority: 2 });
    }
    
    return priorities.length > 0 ? priorities : [
      { chakraId: 'heart', score: 0, priority: 1 },
      { chakraId: 'solar', score: 0, priority: 2 }
    ];
  }

  // 计算每个脉轮的失衡程度
  const chakraEntries = Object.entries(chakraStatus)
    .map(([id, score]) => ({
      chakraId: id,
      score,
      priority: score < 0 ? Math.abs(score) : 0 // 负分表示需要关注
    }))
    .filter(item => item.score < 30) // 只关注分数低于30的脉轮
    .sort((a, b) => a.score - b.score); // 分数越低越优先

  return chakraEntries.length > 0 ? chakraEntries : [
    { chakraId: 'heart', score: chakraStatus.heart || 0, priority: 1 },
    { chakraId: 'solar', score: chakraStatus.solar || 0, priority: 2 }
  ];
}

// 根据能量指数计算整体能量状态
function calculateOverallEnergyLevel(energyIndex: EnergyIndex): {
  level: 'low' | 'moderate' | 'high';
  description: string;
} {
  const avg = (energyIndex.physical + energyIndex.mental + energyIndex.emotional) / 3;
  
  if (avg < 40) {
    return {
      level: 'low',
      description: '当前能量较低，需要温和滋养与接地'
    };
  } else if (avg < 70) {
    return {
      level: 'moderate',
      description: '能量处于平稳状态，适合稳步提升与平衡'
    };
  } else {
    return {
      level: 'high',
      description: '能量充沛，适合追求更高层次的灵性成长'
    };
  }
}

// 计算水晶与当前状态的匹配分数
function calculateCrystalMatchScore(
  crystal: CrystalDefinition,
  chakraPriority: { chakraId: string; score: number; priority: number }[],
  energyLevel: 'low' | 'moderate' | 'high',
  energyIndex: EnergyIndex
): number {
  let score = 50; // 基础分数

  // 1. 脉轮匹配度 (0-40分)
  const matchedChakras = crystal.chakraIds.filter(id => 
    id === 'all' || chakraPriority.some(cp => cp.chakraId === id)
  );
  
  if (crystal.chakraIds.includes('all')) {
    // 全脉轮水晶在整体能量低时更有价值
    score += energyLevel === 'low' ? 35 : 25;
  } else {
    // 根据匹配脉轮的优先级加分
    matchedChakras.forEach(chakraId => {
      const priority = chakraPriority.find(cp => cp.chakraId === chakraId);
      if (priority) {
        score += Math.min(20, Math.abs(priority.score) / 2 + 10);
      }
    });
  }

  // 2. 能量属性匹配 (0-25分)
  const energyNeeds: string[] = [];
  if (energyIndex.physical < 50) energyNeeds.push('活力', '动力', '生命力');
  if (energyIndex.mental < 50) energyNeeds.push('专注', '智慧', '清晰');
  if (energyIndex.emotional < 50) energyNeeds.push('平静', '治愈', '安抚');
  if (energyIndex.emotional > 70 && energyIndex.mental > 70) {
    energyNeeds.push('灵性', '直觉', '超级能量');
  }

  const energyMatch = crystal.energyAttributes.filter(attr =>
    energyNeeds.some(need => attr.includes(need) || need.includes(attr))
  ).length;
  score += energyMatch * 8;

  // 3. 能量强度适配 (0-15分)
  const highEnergyCrystals = ['超七', '钛晶', '金发晶', '发晶', '黑发晶'];
  const gentleCrystals = ['粉水晶', '月光石', '蓝玉髓', '粉玉髓', '草莓晶'];
  
  if (energyLevel === 'low' && gentleCrystals.some(name => crystal.name.includes(name))) {
    score += 15; // 低能量时温和水晶更适合
  } else if (energyLevel === 'high' && highEnergyCrystals.some(name => crystal.name.includes(name))) {
    score += 15; // 高能量时强力水晶更适合
  } else if (energyLevel === 'moderate') {
    score += 10; // 中等能量时大多数水晶都适合
  }

  // 4. 随机因子 (0-10分) - 让每日推荐有变化
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const crystalIndex = CRYSTALS.findIndex(c => c.id === crystal.id);
  const dailyRandom = ((dayOfYear * 13 + crystalIndex * 7) % 10);
  score += dailyRandom;

  return Math.min(100, Math.max(0, score));
}

// 生成匹配理由
function generateMatchReason(
  crystal: CrystalDefinition,
  chakraPriority: { chakraId: string; score: number; priority: number }[],
  energyLevel: 'low' | 'moderate' | 'high'
): string {
  const primaryChakra = chakraPriority[0];
  const chakraName = primaryChakra 
    ? CHAKRAS.find(c => c.id === primaryChakra.chakraId)?.name || '心轮'
    : '心轮';

  const reasons: string[] = [];

  // 根据脉轮匹配生成理由
  if (crystal.chakraIds.includes('all')) {
    reasons.push(`你的整体能量需要综合调和，${crystal.name}能全面平衡各个脉轮`);
  } else if (primaryChakra && crystal.chakraIds.includes(primaryChakra.chakraId)) {
    reasons.push(`你的${chakraName}需要关注，${crystal.name}能针对性帮助平衡该脉轮`);
  } else if (crystal.chakraIds.length > 1) {
    const chakraNames = crystal.chakraIds
      .map(id => CHAKRAS.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join('与');
    reasons.push(`${crystal.name}能同时作用于${chakraNames}，帮助多维度能量协调`);
  }

  // 根据能量属性生成理由
  if (energyLevel === 'low') {
    if (crystal.energyAttributes.includes('治愈') || crystal.energyAttributes.includes('安抚')) {
      reasons.push(`当前能量较低，${crystal.name}的温和治愈能量能给予你温柔支持`);
    } else if (crystal.energyAttributes.includes('接地') || crystal.energyAttributes.includes('稳定')) {
      reasons.push(`${crystal.name}的接地能量能帮助你找回稳定与安全感`);
    }
  } else if (energyLevel === 'high') {
    if (crystal.energyAttributes.includes('灵性') || crystal.energyAttributes.includes('直觉')) {
      reasons.push(`能量充沛时，${crystal.name}能助你探索更高层次的灵性成长`);
    } else if (crystal.energyAttributes.includes('放大')) {
      reasons.push(`${crystal.name}能放大你当前充沛的正能量，加速愿望实现`);
    }
  }

  // 根据功效生成理由
  if (crystal.mainEffects.some(e => e.includes('财富') || e.includes('事业'))) {
    reasons.push(`${crystal.name}能为你的事业发展带来积极助力`);
  }
  if (crystal.mainEffects.some(e => e.includes('爱情') || e.includes('情感'))) {
    reasons.push(`在感情方面，${crystal.name}能帮助你吸引或修复美好的关系`);
  }

  return reasons.length > 0 
    ? reasons[Math.floor(Math.random() * reasons.length)]
    : `${crystal.name}的能量特质与今天的你有特别的共鸣`;
}

// 生成疗愈主题
function generateHealingFocus(
  crystal: CrystalDefinition,
  chakraPriority: { chakraId: string; score: number; priority: number }[]
): string {
  const primaryChakra = chakraPriority[0];
  
  if (crystal.energyAttributes.includes('爱情') || crystal.energyAttributes.includes('治愈')) {
    return '情感疗愈与自爱';
  } else if (crystal.energyAttributes.includes('财富') || crystal.energyAttributes.includes('事业')) {
    return '事业发展与财富丰盛';
  } else if (crystal.energyAttributes.includes('灵性') || crystal.energyAttributes.includes('直觉')) {
    return '灵性觉醒与内在智慧';
  } else if (crystal.energyAttributes.includes('保护') || crystal.energyAttributes.includes('接地')) {
    return '能量防护与稳定 grounding';
  } else if (primaryChakra) {
    const chakraName = CHAKRAS.find(c => c.id === primaryChakra.chakraId)?.name || '';
    return `${chakraName}的平衡与活化`;
  }
  
  return '整体能量调和与净化';
}

// 生成肯定语
function generateAffirmation(crystal: CrystalDefinition): string {
  const affirmations: Record<string, string[]> = {
    'default': [
      '我接纳此刻的自己，也相信更好的明天',
      '我的内在拥有无限的智慧与力量',
      '我值得被爱，我值得拥有美好的一切'
    ],
    '爱情': [
      '我敞开心扉，让爱自然流动',
      '我值得被深深爱着，我也能给予真挚的爱',
      '爱围绕着我，我是爱的化身'
    ],
    '财富': [
      '我值得拥有丰盛的物质生活',
      '财富自然地流向我，我欣然接受',
      '我是财富的磁铁，丰盛是我的本质'
    ],
    '勇气': [
      '我有勇气面对一切挑战',
      '我的内心充满力量与自信',
      '我相信自己的能力，我无所畏惧'
    ],
    '平静': [
      '我的内心如平静湖面，清澈安宁',
      '我选择平静，我释放所有焦虑',
      '深呼吸，让宁静充满我的身心'
    ],
    '灵性': [
      '我与宇宙智慧相连，直觉是我的指引',
      '我倾听内心的声音，那是灵魂的呼唤',
      '我灵性觉醒，活在当下的觉知中'
    ]
  };

  // 根据水晶能量属性选择肯定语类别
  let category = 'default';
  if (crystal.energyAttributes.some(a => a.includes('爱情') || a.includes('温柔'))) category = '爱情';
  else if (crystal.energyAttributes.some(a => a.includes('财富') || a.includes('丰盛'))) category = '财富';
  else if (crystal.energyAttributes.some(a => a.includes('勇气') || a.includes('自信'))) category = '勇气';
  else if (crystal.energyAttributes.some(a => a.includes('平静') || a.includes('安抚'))) category = '平静';
  else if (crystal.energyAttributes.some(a => a.includes('灵性') || a.includes('直觉'))) category = '灵性';

  const categoryAffirmations = affirmations[category] || affirmations.default;
  return categoryAffirmations[Math.floor(Math.random() * categoryAffirmations.length)];
}

// 生成每日水晶推荐
export function generateDailyCrystalReading(
  profile: UserProfile,
  energyIndex: EnergyIndex
): DailyCrystalReading {
  const date = new Date().toISOString().split('T')[0];
  
  // 1. 分析脉轮优先级
  const chakraPriority = calculateChakraPriority(profile.chakraStatus, energyIndex);
  
  // 2. 计算整体能量水平
  const overallEnergy = calculateOverallEnergyLevel(energyIndex);
  
  // 3. 为所有水晶计算匹配分数
  const scoredCrystals = CRYSTALS.map(crystal => {
    const matchScore = calculateCrystalMatchScore(
      crystal,
      chakraPriority,
      overallEnergy.level,
      energyIndex
    );
    
    return {
      crystal,
      matchScore,
      reason: generateMatchReason(crystal, chakraPriority, overallEnergy.level),
      healingFocus: generateHealingFocus(crystal, chakraPriority),
      affirmation: generateAffirmation(crystal),
      chakraPriority: chakraPriority.map(c => c.chakraId)
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  // 4. 选择最佳水晶和次要推荐
  const luckyCrystal = scoredCrystals[0];
  const secondaryCrystals = scoredCrystals.slice(1, 4); // 推荐3个备选

  // 5. 生成疗愈指引
  const healingGuidance = generateHealingGuidance(
    luckyCrystal.crystal,
    overallEnergy.level,
    chakraPriority
  );

  return {
    date,
    luckyCrystal,
    secondaryCrystals,
    overallEnergy,
    healingGuidance
  };
}

// 生成疗愈指引
function generateHealingGuidance(
  crystal: CrystalDefinition,
  energyLevel: 'low' | 'moderate' | 'high',
  chakraPriority: { chakraId: string; score: number; priority: number }[]
): DailyCrystalReading['healingGuidance'] {
  const themes: Record<string, string> = {
    'low': '温柔滋养与能量恢复',
    'moderate': '能量平衡与稳步提升',
    'high': '灵性探索与愿望显化'
  };

  // 根据水晶特性生成建议
  const advice: string[] = [];
  
  if (energyLevel === 'low') {
    advice.push('今天请对自己温柔一些，允许自己休息与恢复');
    advice.push(`将${crystal.name}握在手心，闭上眼睛深呼吸三次`);
    advice.push('如果感到疲惫，不必强求，慢慢来也是一种进步');
  } else if (energyLevel === 'moderate') {
    advice.push('这是一个适合稳定前行的日子，保持当下的节奏');
    advice.push(`佩戴${crystal.name}时，默念今天的肯定语三遍`);
    advice.push('在忙碌之余，记得给自己留一些独处的时光');
  } else {
    advice.push('你的能量状态很好，适合尝试新的挑战');
    advice.push(`借助${crystal.name}的力量，把想法付诸行动`);
    advice.push('分享你的正能量，帮助身边需要的人');
  }

  // 添加水晶特定建议
  if (crystal.energyAttributes.includes('灵性')) {
    advice.push('花5分钟冥想，感受水晶带来的灵性指引');
  }
  if (crystal.energyAttributes.includes('爱情')) {
    advice.push('今天对身边的人多说一句温暖的话');
  }
  if (crystal.energyAttributes.includes('财富')) {
    advice.push('保持对丰盛的信心，留意身边的机会');
  }

  // 生成冥想引导
  const primaryChakra = chakraPriority[0];
  const chakraName = primaryChakra 
    ? CHAKRAS.find(c => c.id === primaryChakra.chakraId)?.name || '心轮'
    : '心轮';
  
  const meditation = `
找一个舒适的坐姿，轻轻握住${crystal.name}。
闭上眼睛，将注意力放在你的${chakraName}位置。
想象${crystal.energyAttributes[0]}的光芒从水晶流入你的身体，
温柔地清理、疗愈、充能这个区域。
保持这个观想3-5分钟，感受能量的流动。
结束时，深深感恩，慢慢睁开眼睛。
  `.trim();

  return {
    theme: themes[energyLevel],
    advice,
    meditation
  };
}

// 获取简单的今日幸运水晶（用于快速展示）
export function getTodayLuckyCrystal(
  profile: UserProfile,
  energyIndex?: EnergyIndex
): CrystalRecommendation {
  const defaultEnergy: EnergyIndex = {
    physical: 50,
    mental: 50,
    emotional: 50
  };
  
  const reading = generateDailyCrystalReading(profile, energyIndex || defaultEnergy);
  return reading.luckyCrystal;
}

// 生成心灵疗愈AI提示词
export function generateHealingPrompt(
  profile: UserProfile,
  crystal: CrystalDefinition,
  energyIndex: EnergyIndex
): string {
  const chakraNames = crystal.chakraIds.includes('all') 
    ? '全脉轮'
    : crystal.chakraIds.map(id => CHAKRAS.find(c => c.id === id)?.name).filter(Boolean).join('、');
  
  return `
你是一位温柔而有智慧的水晶疗愈师。

今日来访者信息：
- 昵称：${profile.nickname || '访客'}
- 星座：${profile.zodiac || '未知'}
- MBTI：${profile.mbti || '未知'}
- 今日能量状态：体力${energyIndex.physical}/脑力${energyIndex.mental}/情绪${energyIndex.emotional}

推荐水晶：${crystal.name}
- 对应脉轮：${chakraNames}
- 能量属性：${crystal.energyAttributes.join('、')}
- 主要功效：${crystal.mainEffects.join('、')}

请为来访者提供：
1. 【心灵启示】（3-4句话）- 结合水晶能量，给予来访者今日的心灵指引，帮助他们看到当下的课题或机会
2. 【疗愈建议】（3条具体建议）- 如何在日常生活中运用这块水晶的能量
3. 【情绪净化】（1段简短的引导语）- 帮助来访者释放负面情绪，字数控制在80字以内

语气要求：
- 温暖、包容、充满疗愈感
- 避免说教，以陪伴和引导的方式
- 可以适度神秘但不脱离现实
- 不要使用 markdown 标题符号
  `.trim();
}