import type { ChakraId } from '../types';

export interface CrystalDefinition {
  id: string;
  name: string;
  chakraIds: ChakraId[];
  color: string;
  energyAttributes: string[];
  mainEffects: string[];
  usageScenarios: string[];
  cleansingFreq: string;
  precautions: string;
  imageUrl?: string; // 预留图片字段
}

export const CRYSTALS: CrystalDefinition[] = [
  {
    id: 'citrine',
    name: '黄水晶',
    chakraIds: ['solar'],
    color: 'from-yellow-300 to-amber-500', // 映射到 Tailwind 渐变色
    energyAttributes: ['行动力', '丰盛'],
    mainEffects: ['增强自信', '决策力', '吸引财富'],
    usageScenarios: ['职场', '谈判', '创业'],
    cleansingFreq: '每周一次',
    precautions: '避免暴晒，防止化学剂接触'
  },
  {
    id: 'aquamarine',
    name: '海蓝宝',
    chakraIds: ['throat'],
    color: 'from-cyan-200 to-sky-400',
    energyAttributes: ['沟通', '平静'],
    mainEffects: ['促进表达', '缓解焦虑', '清晰沟通'],
    usageScenarios: ['演讲', '沟通', '创作'],
    cleansingFreq: '每周一次',
    precautions: '避免高温，可用流水净化'
  },
  {
    id: 'obsidian',
    name: '黑曜石',
    chakraIds: ['root'],
    color: 'from-gray-700 to-black',
    energyAttributes: ['保护', '接地'],
    mainEffects: ['吸收负能量', '提供安全感', '稳定情绪'],
    usageScenarios: ['防护', '冥想', '情绪释放'],
    cleansingFreq: '每周2-3次',
    precautions: '需高频净化，身体虚弱时慎用'
  },
  {
    id: 'rose_quartz',
    name: '粉水晶',
    chakraIds: ['heart'],
    color: 'from-pink-200 to-rose-300',
    energyAttributes: ['爱情', '治愈'],
    mainEffects: ['促进自爱', '修复情感创伤', '增强同理心'],
    usageScenarios: ['情感疗愈', '人际关系'],
    cleansingFreq: '每周一次',
    precautions: '避免长期暴晒会褪色'
  },
  {
    id: 'amethyst',
    name: '紫水晶',
    chakraIds: ['thirdEye'],
    color: 'from-purple-400 to-violet-600',
    energyAttributes: ['直觉', '智慧'],
    mainEffects: ['增强直觉', '促进灵性', '帮助睡眠'],
    usageScenarios: ['冥想', '学习', '睡眠改善'],
    cleansingFreq: '每周一次',
    precautions: '避免长时间暴晒'
  },
  {
    id: 'clear_quartz',
    name: '白水晶',
    chakraIds: ['crown'],
    color: 'from-slate-100 to-white',
    energyAttributes: ['净化', '放大'],
    mainEffects: ['净化能量', '放大其他水晶功效', '增强专注'],
    usageScenarios: ['冥想', '净化空间', '搭配使用'],
    cleansingFreq: '每周一次',
    precautions: '注意消磁，可净化其他水晶'
  },
  {
    id: 'moonstone',
    name: '月光石',
    chakraIds: ['crown', 'thirdEye'],
    color: 'from-blue-100 to-indigo-200',
    energyAttributes: ['安抚', '直觉'],
    mainEffects: ['舒缓情绪', '改善睡眠', '增强女性能量'],
    usageScenarios: ['睡眠', '情绪平衡', '经期不适'],
    cleansingFreq: '每周一次',
    precautions: '避免与硬物碰撞'
  },
  {
    id: 'green_phantom',
    name: '绿幽灵',
    chakraIds: ['heart', 'solar'],
    color: 'from-emerald-400 to-green-700',
    energyAttributes: ['财富', '事业'],
    mainEffects: ['吸引事业机遇', '提升创造力', '缓解压力'],
    usageScenarios: ['职场发展', '财富积累'],
    cleansingFreq: '每周一次',
    precautions: '避免高温和化学品'
  },
  {
    id: 'tigers_eye',
    name: '虎眼石',
    chakraIds: ['solar', 'root'],
    color: 'from-amber-600 to-yellow-700',
    energyAttributes: ['勇气', '保护'],
    mainEffects: ['增强自信', '提供保护', '促进行动力'],
    usageScenarios: ['面试', '挑战', '压力时期'],
    cleansingFreq: '每两周一次',
    precautions: '避免与其他硬石碰撞'
  },
  {
    id: 'tourmaline',
    name: '碧玺',
    chakraIds: ['all'],
    color: 'from-pink-400 via-green-400 to-blue-400',
    energyAttributes: ['调和', '防护', '转化'],
    mainEffects: ['综合调节全身能量', '转化负能量为正向能量', '促进身心平衡'],
    usageScenarios: ['日常佩戴', '能量净化', '身心调和'],
    cleansingFreq: '每周一次',
    precautions: '避免高温和强烈碰撞，不同颜色碧玺可轮流使用'
  },
  {
    id: 'rhodonite',
    name: '红纹石',
    chakraIds: ['heart'],
    color: 'from-rose-400 to-pink-600',
    energyAttributes: ['爱情', '包容', '治愈'],
    mainEffects: ['招来真爱', '治愈情感创伤', '增强包容心与同理心'],
    usageScenarios: ['寻求真爱', '情感疗愈', '改善人际关系'],
    cleansingFreq: '每周一次',
    precautions: '避免长时间阳光直射，以免颜色变淡'
  },
  {
    id: 'red_agate',
    name: '红玛瑙',
    chakraIds: ['root'],
    color: 'from-red-500 to-rose-600',
    energyAttributes: ['活力', '勇气', '动力'],
    mainEffects: ['增强生命力', '提升勇气和自信', '激发行动力'],
    usageScenarios: ['需要勇气时', '体力透支', '新开始'],
    cleansingFreq: '每周一次',
    precautions: '可用流水净化，避免与硬物碰撞'
  },
  {
    id: 'sunstone',
    name: '太阳石',
    chakraIds: ['sacral'],
    color: 'from-orange-300 via-amber-400 to-orange-500',
    energyAttributes: ['快乐', '积极', '好运'],
    mainEffects: ['带来快乐与积极能量', '吸引好运', '提升创造力'],
    usageScenarios: ['情绪低落', '需要灵感', '社交场合'],
    cleansingFreq: '每周一次',
    precautions: '喜欢阳光，可在清晨阳光下短暂充能'
  },
  {
    id: 'strawberry_quartz',
    name: '草莓晶',
    chakraIds: ['heart'],
    color: 'from-pink-300 to-rose-400',
    energyAttributes: ['爱情', '甜蜜', '人缘'],
    mainEffects: ['吸引美好爱情', '增进感情甜蜜度', '提升个人魅力'],
    usageScenarios: ['恋爱中', '约会', '社交聚会'],
    cleansingFreq: '每周一次',
    precautions: '温和水晶，适合长期贴身佩戴'
  },
  {
    id: 'garnet',
    name: '石榴石',
    chakraIds: ['root'],
    color: 'from-red-600 to-red-800',
    energyAttributes: ['活力', '再生', '生命力'],
    mainEffects: ['增强生命力', '促进血液循环', '带来活力与热情'],
    usageScenarios: ['疲劳恢复', '女性周期', '需要活力时'],
    cleansingFreq: '每周一次',
    precautions: '能量较强，建议循序渐进佩戴'
  },
  {
    id: 'gold_rutilated_quartz',
    name: '金发晶',
    chakraIds: ['solar'],
    color: 'from-yellow-300 via-amber-400 to-yellow-600',
    energyAttributes: ['财富', '权威', '目标'],
    mainEffects: ['增强权威感', '招来财富', '帮助实现目标'],
    usageScenarios: ['事业发展', '财富目标', '领导场合'],
    cleansingFreq: '每周一次',
    precautions: '能量强大，身体虚弱者建议不要长时间佩戴'
  },
  {
    id: 'smoky_quartz',
    name: '茶晶',
    chakraIds: ['root'],
    color: 'from-stone-400 to-stone-600',
    energyAttributes: ['稳定', '安心', '接地'],
    mainEffects: ['稳定能量场', '减轻焦虑', '帮助接地与专注'],
    usageScenarios: ['焦虑时', '冥想', '需要专注'],
    cleansingFreq: '每周一次',
    precautions: '可用土埋法净化，适合与其他水晶搭配使用'
  },
  {
    id: 'black_rutilated_quartz',
    name: '黑发晶',
    chakraIds: ['root'],
    color: 'from-gray-800 to-black',
    energyAttributes: ['防护', '驱邪', '安全'],
    mainEffects: ['防护负能量', '驱邪避凶', '增强安全感'],
    usageScenarios: ['防护', '夜间外出', '负能量环境'],
    cleansingFreq: '每周2-3次',
    precautions: '需定期净化，可用盐水或流水清洗'
  },
  {
    id: 'super_seven',
    name: '超七',
    chakraIds: ['all'],
    color: 'from-purple-400 via-violet-500 to-amber-300',
    energyAttributes: ['超级能量', '灵性', '愿望'],
    mainEffects: ['综合提升全身能量', '增强灵性觉醒', '帮助实现愿望'],
    usageScenarios: ['灵性成长', '许愿', '全面提升'],
    cleansingFreq: '每周一次',
    precautions: '能量非常强，建议量力而行，不适合睡眠时佩戴'
  },
  {
    id: 'ametrine',
    name: '紫黄晶',
    chakraIds: ['thirdEye', 'solar'],
    color: 'from-purple-500 via-violet-400 to-amber-400',
    energyAttributes: ['调和', '智慧', '财富'],
    mainEffects: ['象征智能与财富', '兼具紫晶与黄晶双重功效', '平衡身心'],
    usageScenarios: ['决策时刻', '财富智慧', '身心平衡'],
    cleansingFreq: '每周一次',
    precautions: '避免长时间暴晒，防止颜色褪色'
  },
  {
    id: 'phantom_quartz',
    name: '幽灵水晶',
    chakraIds: ['heart'],
    color: 'from-emerald-300 to-green-500',
    energyAttributes: ['事业', '财富', '凝聚'],
    mainEffects: ['招来事业好运', '吸引财富', '帮助事业成长'],
    usageScenarios: ['职场发展', '财富积累', '事业规划'],
    cleansingFreq: '每周一次',
    precautions: '可用月光净化，避免暴晒'
  },
  {
    id: 'titanium_quartz',
    name: '钛晶',
    chakraIds: ['solar'],
    color: 'from-amber-400 via-gold-500 to-orange-400',
    energyAttributes: ['强大能量', '吉祥', '辟邪'],
    mainEffects: ['能量极其强大', '象征大吉祥富贵', '辟邪健康'],
    usageScenarios: ['重大决策', '需要强力支持', '祈福'],
    cleansingFreq: '每周一次',
    precautions: '能量极为强大，身体虚弱者建议不要佩戴，不宜久戴'
  },
  {
    id: 'rutilated_quartz',
    name: '发晶',
    chakraIds: ['solar'],
    color: 'from-yellow-400 via-amber-500 to-yellow-600',
    energyAttributes: ['气势', '企图心', '胆识'],
    mainEffects: ['加强个人气势', '带给人积极旺盛的企图心', '增强冲劲与胆识'],
    usageScenarios: ['创业', '挑战', '突破瓶颈'],
    cleansingFreq: '每周一次',
    precautions: '能量强大，建议初次佩戴时间从短到长'
  },
  {
    id: 'white_phantom_quartz',
    name: '白幽灵',
    chakraIds: ['crown'],
    color: 'from-slate-200 via-white to-slate-100',
    energyAttributes: ['净化', '事业', '灵性'],
    mainEffects: ['净化负能量', '提升灵性', '帮助事业蒸蒸日上'],
    usageScenarios: ['灵性净化', '事业提升', '冥想'],
    cleansingFreq: '每周一次',
    precautions: '可用流水净化，适合搭配其他水晶使用'
  },
  {
    id: 'blue_chalcedony',
    name: '蓝玉髓',
    chakraIds: ['throat'],
    color: 'from-sky-300 to-blue-400',
    energyAttributes: ['沟通', '表达', '和谐'],
    mainEffects: ['增加自我表达能力', '提升沟通协调能力', '避免负面能量'],
    usageScenarios: ['演讲', '谈判', '人际沟通'],
    cleansingFreq: '每周一次',
    precautions: '温和水晶，适合长期佩戴，可用月光净化'
  },
  {
    id: 'pink_chalcedony',
    name: '粉玉髓',
    chakraIds: ['heart'],
    color: 'from-pink-200 to-rose-300',
    energyAttributes: ['温柔', '恋情', '浪漫'],
    mainEffects: ['象征温柔的恋情', '带来浪漫相遇', '唤醒爱的觉知'],
    usageScenarios: ['约会', '寻找爱情', '浪漫时刻'],
    cleansingFreq: '每周一次',
    precautions: '柔和能量，适合敏感体质，避免高温'
  },
  {
    id: 'purple_chalcedony',
    name: '紫玉髓',
    chakraIds: ['heart'],
    color: 'from-violet-300 to-purple-400',
    energyAttributes: ['清爽', '气质', '人际'],
    mainEffects: ['令头脑及心境清爽', '提升个人气质', '助人际关系'],
    usageScenarios: ['社交场合', '需要提升气质', '改善人际'],
    cleansingFreq: '每周一次',
    precautions: '适合日常佩戴，可用清水净化'
  },
  {
    id: 'peridot',
    name: '橄榄石',
    chakraIds: ['heart'],
    color: 'from-lime-400 to-emerald-500',
    energyAttributes: ['舒缓', '聚财', '融洽'],
    mainEffects: ['有助舒缓紧张情绪', '令人心旷神怡', '绿色能量有助聚财'],
    usageScenarios: ['压力缓解', '商务场合', '需要聚财'],
    cleansingFreq: '每周一次',
    precautions: '避免酸性物质接触，可用流水净化'
  },
  {
    id: 'herkimer_diamond',
    name: '闪灵钻',
    chakraIds: ['crown'],
    color: 'from-slate-100 via-white to-blue-100',
    energyAttributes: ['幸运', '增强气场', '放大'],
    mainEffects: ['使愿望促成', '增强个人气场', '提高其他水晶功效'],
    usageScenarios: ['许愿', '搭配其他水晶', '能量放大'],
    cleansingFreq: '每周一次',
    precautions: '天然双尖水晶，能量放大器，可净化其他水晶'
  }
];
