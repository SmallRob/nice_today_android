import type { ChakraId, ChakraScores } from '../types';

export type ChakraActivityLevel = 'underactive' | 'balanced' | 'overactive';

export interface ChakraDefinition {
  id: ChakraId;
  name: string;
  shortName: string;
  color: string;
  gradient: string;
  crystal: string;
  symbol: {
    name: string;
    text: string;
  };
  tuning: string[];
}

export const CHAKRAS: ChakraDefinition[] = [
  {
    id: 'root',
    name: '海底轮',
    shortName: '海底',
    color: 'text-rose-400',
    gradient: 'from-rose-500 to-red-600',
    crystal: '黑曜石',
    symbol: { name: '安卡', text: '☥' },
    tuning: ['光脚踩草地/地面（接地）', '抱膝蹲', '默念「我安全，我值得被守护」']
  },
  {
    id: 'sacral',
    name: '生殖轮',
    shortName: '生殖',
    color: 'text-orange-300',
    gradient: 'from-orange-500 to-amber-500',
    crystal: '橙月光石',
    symbol: { name: '新月', text: '☾' },
    tuning: ['轻揉腹部', '情绪书写（写不满/开心）', '看橙色系画面（如晚霞）']
  },
  {
    id: 'solar',
    name: '太阳轮',
    shortName: '太阳',
    color: 'text-amber-300',
    gradient: 'from-amber-400 to-yellow-500',
    crystal: '黄水晶',
    symbol: { name: '太阳', text: '☉' },
    tuning: ['挺胸收腹站立', '念自我肯定语（如「我有能力做好」）', '喝温蜂蜜水']
  },
  {
    id: 'heart',
    name: '心轮',
    shortName: '心',
    color: 'text-emerald-300',
    gradient: 'from-emerald-500 to-green-600',
    crystal: '粉晶',
    symbol: { name: '莲花', text: '✿' },
    tuning: ['双手捂胸口深呼吸', '默念「我接纳自己，也接纳他人」', '轻拍胸腔两侧']
  },
  {
    id: 'throat',
    name: '喉轮',
    shortName: '喉',
    color: 'text-cyan-300',
    gradient: 'from-cyan-500 to-sky-500',
    crystal: '海蓝宝',
    symbol: { name: '音', text: 'ॐ' },
    tuning: ['轻声哼歌/念「啊」音', '喝温水', '对着镜子说一句真心话']
  },
  {
    id: 'thirdEye',
    name: '眉心轮',
    shortName: '眉心',
    color: 'text-blue-300',
    gradient: 'from-blue-600 to-indigo-600',
    crystal: '青金石',
    symbol: { name: '第三眼', text: '◉' },
    tuning: ['闭眼轻按印堂', '专注看一个点（如蜡烛）', '冥想「我拥有清晰的直觉」']
  },
  {
    id: 'crown',
    name: '顶轮',
    shortName: '顶',
    color: 'text-violet-300',
    gradient: 'from-violet-600 to-fuchsia-600',
    crystal: '紫水晶',
    symbol: { name: '星光', text: '✧' },
    tuning: ['头顶轻靠墙面/枕头', '闭眼听纯音乐', '默念「我与万物连接，内心平静」']
  }
];

export const ZERO_CHAKRA_SCORES: ChakraScores = {
  root: 0,
  sacral: 0,
  solar: 0,
  heart: 0,
  throat: 0,
  thirdEye: 0,
  crown: 0
};

export const DEFAULT_CHAKRA_SCORES: ChakraScores = {
  root: 30,
  sacral: 34,
  solar: 40,
  heart: 44,
  throat: 32,
  thirdEye: 28,
  crown: 44
};

export const getChakraActivityLevel = (score: number): ChakraActivityLevel => {
  if (score <= -30) return 'underactive';
  if (score >= 40) return 'overactive';
  return 'balanced';
};

export const getChakraActivityLabel = (score: number) => {
  const level = getChakraActivityLevel(score);
  if (level === 'underactive') return '不活跃';
  if (level === 'overactive') return '过度活跃';
  return '适度活跃';
};

export const clampChakraScore = (v: number) => Math.max(-100, Math.min(100, Math.round(v)));

export interface ChakraGuideDetail {
  id: ChakraId;
  sanskritName: string;
  location: string;
  affirmation: string;
  keywords: string[];
  balanceGuide: {
    mind: string; // 心智
    body: string; // 身体
    soul: string; // 内心
  };
}

export const CHAKRA_GUIDE_DETAILS: Record<ChakraId, ChakraGuideDetail> = {
  crown: {
    id: 'crown',
    sanskritName: 'Sahasrara',
    location: '头顶',
    affirmation: '我领悟',
    keywords: ['灵性连接', '宇宙意识', '合一', '智慧', '启迪', '超越小我'],
    balanceGuide: {
      mind: '放下逻辑分析，练习“静默”与冥想，允许直觉指引。',
      body: '早睡早起，接触纯净的阳光，避免头部受风。',
      soul: '感受与宇宙万物的连接，阅读灵性经典，练习感恩。'
    }
  },
  thirdEye: {
    id: 'thirdEye',
    sanskritName: 'Ajna',
    location: '两眉之间',
    affirmation: '我看见',
    keywords: ['直觉', '洞察力', '想象力', '智慧', '头脑清晰', '灵视'],
    balanceGuide: {
      mind: '信任你的第一直觉，记录梦境，练习可视化想象。',
      body: '多看远方绿色，按摩眉心与太阳穴，食用蓝莓/紫甘蓝。',
      soul: '诚实面对真相，放下幻象与执念，冥想光照亮眉心。'
    }
  },
  throat: {
    id: 'throat',
    sanskritName: 'Vishuddha',
    location: '喉咙',
    affirmation: '我表达',
    keywords: ['表达', '沟通', '真实', '创造力', '倾听', '信念'],
    balanceGuide: {
      mind: '练习诚实表达想法，同时也练习深度倾听。',
      body: '唱歌、朗读、保护嗓子，多喝温水，做颈部拉伸。',
      soul: '用语言创造正向能量，写日记与自己对话，吟唱“HAM”。'
    }
  },
  heart: {
    id: 'heart',
    sanskritName: 'Anahata',
    location: '胸口中央',
    affirmation: '我接纳',
    keywords: ['爱（自爱与他爱）', '慈悲', '连接', '宽恕', '同理心', '关系'],
    balanceGuide: {
      mind: '练习宽恕（对自己和他人），放下评判与怨恨。',
      body: '扩胸运动，拥抱他人/宠物，接触大自然绿色植物。',
      soul: '练习慈悲冥想，感受心中的爱在流动，做志愿服务。'
    }
  },
  solar: {
    id: 'solar',
    sanskritName: 'Manipura',
    location: '肚脐上方',
    affirmation: '我行动',
    keywords: ['个人力量', '意志', '自信', '自尊', '行动力', '目标感', '代谢'],
    balanceGuide: {
      mind: '设定小目标并达成，建立自信，学习对不合理说“不”。',
      body: '核心肌群训练，晒太阳，规律饮食，少吃生冷。',
      soul: '肯定自我价值，相信自己有能力掌控生活，吟唱“RAM”。'
    }
  },
  sacral: {
    id: 'sacral',
    sanskritName: 'Svadhisthana',
    location: '下腹部',
    affirmation: '我感受',
    keywords: ['情感', '愉悦', '欲望', '创造力', '性', '流动性', '人际关系'],
    balanceGuide: {
      mind: '允许情绪流动不压抑，培养创造性爱好（画画/舞蹈）。',
      body: '多喝水，摇摆骨盆，泡澡，接触橙色食物。',
      soul: '接纳自己的欲望与感受，尊重身体的边界与需求。'
    }
  },
  root: {
    id: 'root',
    sanskritName: 'Muladhara',
    location: '脊柱底端/尾骨',
    affirmation: '我存在',
    keywords: ['生存', '安全', '稳定', '接地', '基本需求', '生命力', '归属感'],
    balanceGuide: {
      mind: '关注当下，清理财务状况，建立生活的秩序感。',
      body: '光脚踩地（接地），深蹲，吃根茎类食物，保证睡眠。',
      soul: '信任生命的支持，感受到大地的承托，吟唱“LAM”。'
    }
  }
};
