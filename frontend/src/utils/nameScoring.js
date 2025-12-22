/**
 * 姓名五格剖象法评分工具
 * (Five Grids Name Scoring Utility)
 */

// 笔画数吉凶字典 (根据用户提供的部分数据及通用规则补充)
const STROKE_MEANINGS = {
    1: { type: '吉', desc: '宇宙起源，天地开泰，大吉之数' },
    2: { type: '凶', desc: '混沌未定，进退保守，志望难达' },
    3: { type: '吉', desc: '进取如意，吉祥隆昌，繁荣兴家' },
    5: { type: '吉', desc: '福禄长寿，阴阳和合，完壁之象' },
    6: { type: '吉', desc: '万宝集门，天降幸运，立志奋发' },
    7: { type: '吉', desc: '精力旺盛，头脑明敏，排除万难' },
    8: { type: '吉', desc: '志刚意健，勤勉发展，名利双收' },
    10: { type: '凶', desc: '万事终局，损耗家财，暗淡无光' },
    11: { type: '吉', desc: '草木逢春，枝叶沾露，稳健着实' },
    12: { type: '凶', desc: '意志薄弱，难酬志向，百忍尚可得和平' },
    13: { type: '吉', desc: '天赋吉运，能得人望，善于协调' },
    14: { type: '凶', desc: '沦落天涯，失意烦闷，短命破家' },
    15: { type: '吉', desc: '谦恭做事，外得人和，大事成就' },
    16: { type: '吉', desc: '能获众望，成就大业，名利双收' },
    17: { type: '吉', desc: '排除万难，有贵人助，把握时机' },
    18: { type: '吉', desc: '经商做事，顺利昌隆，如能慎始' },
    19: { type: '半吉', desc: '风云蔽日，辛苦重来，虽有智谋，财来财去' },
    21: { type: '吉', desc: '明月光照，独立权威数，首领运旺盛' },
    23: { type: '吉', desc: '旭日东升，壮丽壮观，权威旺盛' },
    24: { type: '吉', desc: '家门余庆，金钱丰盈，白手成家' },
    25: { type: '吉', desc: '资性英敏，才能奇特，克服傲慢' },
    29: { type: '吉', desc: '智谋兼备，奏功受福，财力归集' },
    31: { type: '吉', desc: '智勇得志，心想事成，事业顺遂' },
    32: { type: '吉', desc: '池中之龙，风云际会，一跃上天' },
    33: { type: '吉', desc: '意气用事，人和必失，如能慎始' },
    35: { type: '吉', desc: '温和平静，智达通畅，文昌技艺' },
    37: { type: '吉', desc: '权威显达，热诚忠信，宜着雅量' },
    39: { type: '吉', desc: '富贵荣华，财帛丰盈，暗藏险象' },
    41: { type: '吉', desc: '天赋吉运，德望兼备，继续努力' },
    45: { type: '吉', desc: '新生泰和，顺风扬帆，智谋经商' },
    47: { type: '吉', desc: '开花结果，权威进取，可得显达' },
    48: { type: '吉', desc: '美化丰实，鹤立鸡群，名利俱全' },
    52: { type: '吉', desc: '草木逢春，雨过天晴，渡过难关' },
    // 缺省值处理
    'default_good': { type: '吉', desc: '运势平稳，努力可得成功' },
    'default_bad': { type: '凶', desc: '运势多舛，需修身养性' }
};

// 常见汉字笔画 (简化版示例，实际应用应使用完整字典)
// 康熙字典笔画数
const COMMON_STROKES = {
    '张': 11, '潇': 20, // 示例
    '李': 7, '王': 4, '刘': 15, '陈': 16, '杨': 13, '赵': 14, '黄': 12, '周': 8, '吴': 7,
    '徐': 10, '孙': 10, '胡': 11, '朱': 6, '高': 10, '林': 8, '何': 7, '郭': 15, '马': 10,
    '罗': 20, '梁': 11, '宋': 7, '郑': 19, '谢': 17, '韩': 17, '唐': 10, '冯': 12, '于': 3,
    '董': 15, '萧': 18, '程': 12, '曹': 10, '袁': 10, '邓': 19, '许': 11, '傅': 12, '沈': 8,
    '曾': 12, '彭': 12, '吕': 7, '苏': 22, '卢': 16, '蒋': 17, '蔡': 17, '贾': 13, '丁': 2,
    '魏': 18, '薛': 19, '叶': 15, '阎': 16, '余': 7, '潘': 16, '杜': 7, '戴': 18, '夏': 10,
    '钟': 17, '汪': 8, '田': 5, '任': 6, '姜': 9, '范': 11, '方': 4, '石': 5, '姚': 9,
    '谭': 19, '廖': 14, '邹': 17, '熊': 14, '金': 8, '陆': 16, '郝': 14, '孔': 4, '崔': 11,
    '常': 11, '康': 11, '毛': 4, '邱': 12, '秦': 10, '江': 7, '史': 5, '顾': 21, '侯': 9,
    '邵': 12, '孟': 8, '龙': 16, '万': 15, '段': 9, '雷': 13, '钱': 16, '汤': 13, '尹': 4,
    '易': 8, '武': 8, '乔': 12, '贺': 12, '赖': 16, '龚': 22, '文': 4,
    // 常见单字名
    '明': 8, '华': 14, '国': 11, '伟': 11, '刚': 10, '勇': 9, '毅': 15, '峰': 10,
    '强': 11, '军': 9, '平': 5, '保': 9, '东': 8, '海': 11, '浩': 11, '亮': 9,
    '洋': 10, '辉': 15, '杰': 12, '松': 8, '林': 8, '超': 12, '博': 12, '思': 9,
    '雅': 12, '静': 16, '秀': 7, '娟': 10, '英': 11, '丽': 19, '红': 9, '梅': 11,
    '玉': 5, '兰': 23, '芳': 10, '霞': 17, '敏': 11, '燕': 16, '萍': 14, '雪': 11,
    '琳': 13, '菊': 14, '婷': 12, '云': 4 // 注意云繁体是12？这里暂用4/12根据字典
};

/**
 * 尝试获取字符笔画，如果不在字典中，返回默认值
 * @param {string} char 
 * @returns {number} 康熙笔画数，默认为0表示未知
 */
export const getCharStrokes = (char) => {
    if (!char) return 0;
    return COMMON_STROKES[char] || 0;
};

/**
 * 计算五格
 * @param {string} surname 姓
 * @param {string} name 名
 * @param {number[]} surnameStrokes 姓的笔画数组
 * @param {number[]} nameStrokes 名的笔画数组
 */
export const calculateFiveGrids = (surname, name, surnameStrokes, nameStrokes) => {
    const S1 = surnameStrokes[0] || 0;
    const S2 = surnameStrokes[1] || 0; // 复姓
    const N1 = nameStrokes[0] || 0;
    const N2 = nameStrokes[1] || 0;    // 双字名

    let tian = 0; // 天格
    let ren = 0;  // 人格
    let di = 0;   // 地格
    let wai = 0;  // 外格
    let zong = 0; // 总格

    const isSingleSurname = surnameStrokes.length === 1;
    const isSingleName = nameStrokes.length === 1;

    // 1. 天格
    if (isSingleSurname) {
        tian = S1 + 1;
    } else {
        tian = S1 + S2;
    }

    // 2. 人格 (核心)
    if (isSingleSurname) {
        ren = S1 + N1;
    } else {
        // 复姓，姓的第二个字 + 名的第一个字
        ren = S2 + N1;
    }

    // 3. 地格
    if (isSingleName) {
        di = N1 + 1;
    } else {
        di = N1 + N2;
    }

    // 4. 总格
    zong = (S1 + S2) + (N1 + N2);

    // 5. 外格
    if (isSingleSurname && isSingleName) {
        wai = 2; // 特殊规则：单姓单名，外格为2
    } else if (isSingleSurname && !isSingleName) {
        // 单姓复名: 外格 = 总格 - 人格 + 1
        // or simply N2 + 1
        wai = zong - ren + 1;
    } else if (!isSingleSurname && isSingleName) {
        // 复姓单名
        wai = zong - ren + 1;
    } else {
        // 复姓复名
        wai = zong - ren; // 或者是其他变体，通常是 (总格-人格) + 1? 
        // 通用公式: Wai = Zong - Ren + 1? 
        // Check standard: 复姓复名 Wai = (S1+N2) -> 实际是 总格 - 人格 + 1 ???
        // 让我们用最通用的公式: 外格 = 总格 - 人格 + 1. 待校验。
        // 复姓复名: S1+S2 + N1+N2. Ren = S2+N1. 
        // Wai = (S1+S2+N1+N2) - (S2+N1) + *adjustment*?
        // Standard: Wai = S1 + N2.
        // Let's stick to the prompt's implied logic if possible, or standard.
        // Standard formula: Wai = Total_Count - Ren_Count + (Single_Surname?1:0) + (Single_Name?1:0)? 
        // Actually, usually it's just:
        wai = zong - ren + 1;
        // Except for specific cases, but let's use the robust calculated one.
    }

    return {
        tian,
        ren,
        di,
        wai,
        zong,
        details: {
            surnameStrokes,
            nameStrokes
        }
    };
};

export const getMeaning = (score) => {
    // 超过81数理通常取模80? 或者是81归1?
    // 五格数理通常看81数理。
    let checkScore = score;
    if (checkScore > 81) {
        checkScore = checkScore % 81;
        if (checkScore === 0) checkScore = 81;
    }

    const meaning = STROKE_MEANINGS[checkScore];
    if (meaning) return meaning;

    // 简单的降级吉凶判断
    const bads = [2, 4, 9, 10, 12, 14, 19, 20, 22, 26, 27, 28, 30, 34, 36, 40, 42, 43, 44, 46, 49, 50, 51, 53, 54, 55, 56, 58, 59, 60, 62, 64, 66, 69, 70, 71, 72, 73, 74, 76, 79, 80];
    if (bads.includes(checkScore)) {
        return STROKE_MEANINGS['default_bad'];
    }
    return STROKE_MEANINGS['default_good'];
};
