
export const WUXING_ELEMENTS = [
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

export const ZODIAC_LIST = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

export const ZODIAC_ELEMENT_MAP: Record<string, string> = {
    '鼠': '水', '牛': '土', '虎': '木', '兔': '木',
    '龙': '土', '蛇': '火', '马': '火', '羊': '土',
    '猴': '金', '鸡': '金', '狗': '土', '猪': '水'
};
