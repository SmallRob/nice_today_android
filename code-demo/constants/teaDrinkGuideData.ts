// 茶饮健康指南数据 - 基于 drinktype.csv

export type DrinkCategory = 'tea' | 'coffee';

export interface DrinkGuideItem {
  id: string;
  category: DrinkCategory;
  categoryLabel: string;
  name: string;
  description: string;
  servingSize: string;
  calories: string;
  caffeine: string;
  healthBenefits: string;
  bestTime: string;
  cautions: string;
  icon: string;
  color: string;
}

export const DRINK_GUIDE_ITEMS: DrinkGuideItem[] = [
  // 茶饮类
  {
    id: 'green-tea',
    category: 'tea',
    categoryLabel: '茶饮',
    name: '绿茶',
    description: '未发酵，清新微涩，保留了茶叶的天然物质',
    servingSize: '一杯 (240ml)',
    calories: '2-5 kcal',
    caffeine: '20-45 mg',
    healthBenefits: '抗氧化，促进新陈代谢，提神醒脑。富含儿茶素，有助于心血管健康。饭后饮用可解腻。建议不加糖以保留健康效益。',
    bestTime: '上午、午后',
    cautions: '避免空腹饮用，以免刺激胃黏膜。脾胃虚寒者应适量饮用，不宜过浓。',
    icon: '🍃',
    color: '#4ade80'
  },
  {
    id: 'oolong-tea',
    category: 'tea',
    categoryLabel: '茶饮',
    name: '乌龙茶',
    description: '半发酵茶，香气馥郁，介于绿茶与红茶之间',
    servingSize: '一杯 (240ml)',
    calories: '2-5 kcal',
    caffeine: '25-50 mg',
    healthBenefits: '帮助分解脂肪，缓解油腻感，适合餐后饮用促进消化。含有茶多酚，有助于控制体重。',
    bestTime: '午后、餐后',
    cautions: '避免空腹饮用，胃酸过多者慎饮。睡前2小时内不宜饮用以免影响睡眠。',
    icon: '🍂',
    color: '#fbbf24'
  },
  {
    id: 'black-tea',
    category: 'tea',
    categoryLabel: '茶饮',
    name: '红茶',
    description: '全发酵茶，口感醇厚甘甜，性质温和',
    servingSize: '一杯 (240ml)',
    calories: '2-5 kcal',
    caffeine: '40-70 mg',
    healthBenefits: '暖胃，帮助消化。适合搭配早餐。可加少量牛奶制成奶茶，增加钙质摄入。含有丰富的茶黄素。',
    bestTime: '上午、早餐',
    cautions: '避免用茶水送服药物，可能影响药效。睡前不宜饮用。贫血患者不宜大量饮用。',
    icon: '🍁',
    color: '#f87171'
  },
  {
    id: 'puer-tea',
    category: 'tea',
    categoryLabel: '茶饮',
    name: '普洱茶',
    description: '后发酵茶，滋味醇厚，越陈越香',
    servingSize: '一杯 (240ml)',
    calories: '0-2 kcal',
    caffeine: '30-60 mg',
    healthBenefits: '去油解腻，辅助降血脂，促进消化。陈年普洱更温和，适合长期饮用。有助于调节肠道菌群。',
    bestTime: '餐后',
    cautions: '新制生普洱性烈，空腹慎饮。胃寒者应选择熟普洱。不宜过浓，避免睡前饮用。',
    icon: '🪵',
    color: '#8b5a2b'
  },
  {
    id: 'herbal-tea',
    category: 'tea',
    categoryLabel: '茶饮',
    name: '花草茶',
    description: '无咖啡因，如洋甘菊、薄荷、玫瑰花等',
    servingSize: '一杯 (240ml)',
    calories: '0-5 kcal',
    caffeine: '0 mg',
    healthBenefits: '舒缓情绪，助眠（如洋甘菊），或提神（如薄荷）。不含咖啡因，适合任何时间饮用。玫瑰花茶有助于调节情绪。',
    bestTime: '任何时间，尤其睡前',
    cautions: '确认对所用花草无过敏反应。孕妇饮用前应咨询医生。部分花草可能有药物相互作用。',
    icon: '🌸',
    color: '#f9a8d4'
  },
  {
    id: 'milk-tea',
    category: 'tea',
    categoryLabel: '茶饮',
    name: '奶茶',
    description: '茶+牛奶+糖/甜味剂，口感丰富',
    servingSize: '一杯 (240ml)',
    calories: '150-300+ kcal',
    caffeine: '取决于茶底',
    healthBenefits: '提供钙质和能量，但市售产品通常高糖高热量。自制时可控制糖分和奶制品质量。',
    bestTime: '作为零食或早餐的一部分',
    cautions: '控制糖分，可自制用低脂奶和代糖。市售奶茶可能含反式脂肪和高糖，应适量饮用。不宜作为日常补水饮品。',
    icon: '🧋',
    color: '#d4a574'
  },
  // 咖啡类
  {
    id: 'americano',
    category: 'coffee',
    categoryLabel: '咖啡',
    name: '美式咖啡',
    description: '浓缩咖啡+水，口感纯粹，热量极低',
    servingSize: '一杯 (240ml)',
    calories: '5-10 kcal',
    caffeine: '60-120 mg',
    healthBenefits: '几乎零热量，提神效果显著。运动前饮用可提高运动表现。有助于提升新陈代谢和专注力。',
    bestTime: '上午、需要专注时',
    cautions: '注意咖啡因总摄入量，可能导致心悸或焦虑。空腹饮用可能刺激胃部。下午2点后饮用可能影响睡眠。',
    icon: '☕',
    color: '#6b7280'
  },
  {
    id: 'latte',
    category: 'coffee',
    categoryLabel: '咖啡',
    name: '拿铁',
    description: '浓缩咖啡+大量蒸汽牛奶，口感顺滑',
    servingSize: '一杯 (240ml)',
    calories: '120-200 kcal',
    caffeine: '60-120 mg',
    healthBenefits: '提供蛋白质和钙质，口感顺滑温和。早餐优选，有助于补充能量和营养。牛奶可以缓解咖啡对胃的刺激。',
    bestTime: '上午、早餐',
    cautions: '选择脱脂或低脂牛奶，控制糖浆添加。乳糖不耐受者可选用植物奶（燕麦奶、杏仁奶）。',
    icon: '🥛',
    color: '#e5e7eb'
  },
  {
    id: 'cappuccino',
    category: 'coffee',
    categoryLabel: '咖啡',
    name: '卡布奇诺',
    description: '浓缩咖啡+等量奶泡与牛奶，奶泡丰富',
    servingSize: '一杯 (240ml)',
    calories: '80-120 kcal',
    caffeine: '60-120 mg',
    healthBenefits: '奶泡丰富，热量通常低于拿铁。口感层次丰富，适合慢慢品味。提供了咖啡因和奶类的双重营养。',
    bestTime: '上午',
    cautions: '同拿铁，注意奶制品选择和糖浆添加。奶泡可能含有较多空气，饱腹感较强。',
    icon: '☕',
    color: '#d6c4a8'
  },
  {
    id: 'cold-brew',
    category: 'coffee',
    categoryLabel: '咖啡',
    name: '冷萃咖啡',
    description: '冷水长时间慢速萃取，口感顺滑',
    servingSize: '一杯 (240ml)',
    calories: '5-10 kcal',
    caffeine: '100-200 mg',
    healthBenefits: '口感顺滑，酸度低，对胃部刺激较小。咖啡因含量可能更高，提神效果持久。适合夏季饮用。',
    bestTime: '上午、午后',
    cautions: '因咖啡因含量高，下午后慎饮以免影响睡眠。胃酸过多者仍需注意，虽然酸度低但咖啡因含量高。',
    icon: '🧊',
    color: '#60a5fa'
  },
  {
    id: 'mocha',
    category: 'coffee',
    categoryLabel: '咖啡',
    name: '摩卡',
    description: '浓缩咖啡+巧克力+牛奶，甜蜜满足',
    servingSize: '一杯 (240ml)',
    calories: '250-400+ kcal',
    caffeine: '60-120 mg',
    healthBenefits: '满足对甜食的渴望，提供能量和愉悦感。巧克力含有抗氧化物质，但热量和糖分很高。',
    bestTime: '作为偶尔的甜点替代',
    cautions: '注意这是高热量饮品，应适量。糖尿病患者和减重人群应严格控制。不宜日常大量饮用。',
    icon: '🍫',
    color: '#7c2d12'
  }
];

// 通用健康指南
export const GENERAL_HEALTH_TIPS = [
  '控制添加糖：糖是热量和健康的主要风险。使用代糖或减少糖浆。',
  '注意奶制品选择：优先选择低脂/脱脂奶、植物奶（如杏仁奶、燕麦奶）。',
  '控制咖啡因：每日通常建议不超过400mg，对咖啡因敏感者下午后避免。',
  '避免空腹：可搭配一些食物，减少对胃的刺激。',
  '保持水分平衡：每杯咖啡/茶可额外补充半杯水，避免脱水。',
  '观察身体反应：如出现心悸、失眠、胃部不适，应调整饮用习惯。'
];

// 体质与饮品建议
export const CONSTITUTION_DRINK_SUGGESTIONS: Record<string, {
  recommended: string[];
  avoid: string[];
  tips: string;
}> = {
  yinxu: {
    recommended: ['花草茶', '普洱茶（熟）', '淡绿茶'],
    avoid: ['浓咖啡', '浓茶', '冰镇饮品'],
    tips: '阴虚体质宜滋阴润燥，避免过热过燥的饮品。'
  },
  yangxu: {
    recommended: ['红茶', '普洱茶（熟）', '姜茶'],
    avoid: ['冰咖啡', '冷饮', '寒凉花草茶'],
    tips: '阳虚体质宜温阳散寒，选择温热性质的茶饮。'
  },
  qixu: {
    recommended: ['红茶', '普洱茶（熟）', '黄芪茶'],
    avoid: ['浓咖啡', '空腹饮茶'],
    tips: '气虚体质宜温补，避免空腹饮用刺激性饮品。'
  },
  tanshi: {
    recommended: ['普洱茶', '乌龙茶', '薏米茶'],
    avoid: ['奶茶', '高糖饮品', '甜咖啡'],
    tips: '痰湿体质宜清淡祛湿，严格控制糖分摄入。'
  },
  shire: {
    recommended: ['绿茶', '菊花茶', '薄荷茶'],
    avoid: ['烈性咖啡', '热茶', '酒精饮品'],
    tips: '湿热体质宜清热利湿，选择清凉性质的茶饮。'
  },
  xueyu: {
    recommended: ['红茶', '玫瑰花茶', '山楂茶'],
    avoid: ['冰饮', '过浓咖啡'],
    tips: '血瘀体质宜温通，避免寒凉阻滞气血。'
  },
  qiyu: {
    recommended: ['玫瑰花茶', '茉莉花茶', '薄荷茶'],
    avoid: ['下午后咖啡', '浓茶'],
    tips: '气郁体质宜疏肝解郁，下午后避免咖啡因影响睡眠。'
  },
  tebing: {
    recommended: ['温和花草茶', '淡绿茶', '温水'],
    avoid: ['复杂配方饮品', '未知成分茶饮'],
    tips: '特禀体质宜简单温和，避免过敏源和复杂配方。'
  },
  pinghe: {
    recommended: ['各类茶饮适量'],
    avoid: ['过量咖啡因', '过甜饮品'],
    tips: '平和体质可适量饮用各类茶饮，保持平衡即可。'
  }
};

export const getDrinkGuideItem = (id: string): DrinkGuideItem | undefined => {
  return DRINK_GUIDE_ITEMS.find(item => item.id === id);
};

export const getDrinksByCategory = (category: DrinkCategory): DrinkGuideItem[] => {
  return DRINK_GUIDE_ITEMS.filter(item => item.category === category);
};
