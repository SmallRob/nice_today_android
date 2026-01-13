
import { Solar } from 'lunar-javascript';

/**
 * 彩虹心情算法工具
 * 根据每日五行能量和日期随机种子生成推荐颜色和解读
 */

// 颜色定义库
export const MOOD_COLORS = [
    { id: 'indigo', name: '靛色', hex: '#4B0082', chakra: '眉心轮', tone: '冷色调', element: '光元素', parts: '头部、神经系统、五官', symbol: '觉知、直觉、清晰' },
    { id: 'crimson', name: '茜色', hex: '#E52B50', chakra: '海底轮', tone: '暖色调', element: '土元素', parts: '脊椎、骨骼、双腿', symbol: '生存、根基、活力' },
    { id: 'amber', name: '琥珀色', hex: '#FFBF00', chakra: '太阳轮', tone: '暖色调', element: '火元素', parts: '消化系统、肌肉、胰腺', symbol: '意志、自信、力量' },
    { id: 'emerald', name: '翠色', hex: '#50C878', chakra: '心轮', tone: '中性调', element: '木元素', parts: '心脏、肺部、循环系统', symbol: '爱、慈悲、疗愈' },
    { id: 'azure', name: '蔚蓝色', hex: '#007FFF', chakra: '喉轮', tone: '冷色调', element: '水元素', parts: '喉咙、甲状腺、颈部', symbol: '沟通、表达、真理' },
    { id: 'violet', name: '堇色', hex: '#8F00FF', chakra: '顶轮', tone: '冷色调', element: '以太元素', parts: '大脑、松果体、皮肤', symbol: '灵性、统一、智慧' },
    { id: 'orange', name: '橙色', hex: '#FF7F00', chakra: '生殖轮', tone: '暖色调', element: '水元素', parts: '生殖系统、肾脏、膀胱', symbol: '创造、情感、欢愉' },
    { id: 'rose', name: '瑰色', hex: '#FF007F', chakra: '心轮', tone: '暖色调', element: '风元素', parts: '胸腺、免疫系统', symbol: '温柔、接纳、无条件的爱' },
    { id: 'gold', name: '金色', hex: '#FFD700', chakra: '冠轮', tone: '暖色调', element: '金元素', parts: '神经连接、意识流', symbol: '丰盛、觉悟、辉煌' },
    { id: 'cyan', name: '青色', hex: '#00FFFF', chakra: '喉轮', tone: '冷色调', element: '风元素', parts: '呼吸道、声带', symbol: '平和、清新、顺通' }
];

// 能量语库
const ENERGY_QUOTES = [
    "我学习把痛苦当做一个提醒自己去倾听内心的信号",
    "每一刻的呼吸都是与宇宙生命力重新连接的机会",
    "我允许自己以最纯粹的方式感受当下的喜怒哀乐",
    "在宁静的底色中，我看见了指引前行的微光",
    "生命并不是要等待暴风雨过去，而是学会在雨中翩翩起舞",
    "我释放所有不再服务于我的旧能量，迎接全新的可能",
    "我的内心拥有一座永不枯竭的平静之源",
    "每一次选择颜色，都是在与自我的灵魂深度对话",
    "我接纳此刻的所有情绪，它们都是通往智慧的阶梯",
    "在色彩的流转中，我找到了属于自己的平衡支点"
];

const INTERPRETATION_TEMPLATES = [
    "今天，{color}在你眼中呈现出一种{adj}的{feel}，那是{chakra}解码身体讯息时的{state}。你将{challenge}重新定义为一种特殊的沟通方式，就像黑夜中的指示灯，它的存在不是为了折磨，而是为了引导你避开更深层的危险。",
    "此刻选择{color}，意味着你的{chakra}正在渴望一种{state}。生活中的{challenge}正在转化为你成长的资粮，让你能更清晰地察觉到那些被忽略的{symbol}。请相信你的直觉，它会带你走向最适合的彼岸。",
    "当{color}映入眼帘，你的灵魂正在经历一场{state}的洗礼。{chakra}的能量流转，提醒你关注{parts}的微小变化。不要害怕{challenge}，它是你通往{symbol}最坚实的桥梁。",
    "选择{color}的你，正散发出一种{adj}的{symbol}气息。这是{chakra}处于平衡状态的体现。即便生活偶尔有{challenge}，你也能以一种{state}的态度去化解，让生命如诗般绽放。"
];

/**
 * 简单的确定性随机数生成器
 */
const seedRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

/**
 * 获取每日心情推荐数据
 */
export const getDailyMoodData = (date = new Date()) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const dateSeed = y * 10000 + m * 100 + d;

    // 1. 计算今日五行（简化版，仅用于决定推荐列表风格）
    const solar = Solar.fromYmd(y, m, d);
    const lunar = solar.getLunar();
    const dayWuXing = lunar.getEightChar().getDayWuXing(); // 今日日柱五行

    // 2. 选择今日能量语
    const quoteIdx = Math.floor(seedRandom(dateSeed) * ENERGY_QUOTES.length);
    const energyQuote = ENERGY_QUOTES[quoteIdx];

    // 3. 推荐颜色列表（每天5个，根据五行有所偏移）
    const allIndices = Array.from({ length: MOOD_COLORS.length }, (_, i) => i);
    // 洗牌算法（使用种子）
    for (let i = allIndices.length - 1; i > 0; i--) {
        const j = Math.floor(seedRandom(dateSeed + i) * (i + 1));
        [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
    }
    const recommendedIndices = allIndices.slice(0, 5);
    const availableColors = recommendedIndices.map(idx => MOOD_COLORS[idx]);

    // 4. 生成每种颜色的今日解读函数
    const generateInterpretation = (color) => {
        const templateIdx = (dateSeed + color.id.length) % INTERPRETATION_TEMPLATES.length;
        const template = INTERPRETATION_TEMPLATES[templateIdx];

        // 根据日期种子和颜色ID生成一些随机关键词，增加每日差异
        const adjs = ['深邃', '轻盈', '温润', '明亮', '澄澈', '厚重', '流动的', '寂静的'];
        const feels = ['清醒感', '力量感', '归属感', '喜悦感', '平静感', '连接感', '通透感'];
        const states = ['静谧光芒', '流转律动', '和谐共鸣', '觉醒时刻', '安住瞬间', '智慧火花'];
        const challenges = ['痛苦', '疲惫', '迷茫', '冲突', '压力', '怀疑'];

        const getKeyword = (list, offset) => list[Math.floor(seedRandom(dateSeed + color.hex.length + offset) * list.length)];

        return template
            .replace(/{color}/g, color.name)
            .replace(/{chakra}/g, color.chakra)
            .replace(/{symbol}/g, color.symbol.split('、')[0])
            .replace(/{parts}/g, color.parts.split('、')[0])
            .replace(/{adj}/g, getKeyword(adjs, 1))
            .replace(/{feel}/g, getKeyword(feels, 2))
            .replace(/{state}/g, getKeyword(states, 3))
            .replace(/{challenge}/g, getKeyword(challenges, 4));
    };

    return {
        dateSeed,
        dayWuXing,
        energyQuote,
        availableColors,
        generateInterpretation
    };
};

const moodAlgorithm = {
    MOOD_COLORS,
    getDailyMoodData
};

export default moodAlgorithm;
