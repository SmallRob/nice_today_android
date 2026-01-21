/**
 * 常见情绪与对应身体问题自查清单数据
 * 结合中医理论与现代身心医学
 */

export const moodHealthData = [
    {
        mood: '愤怒、烦躁',
        tcmTheory: '怒伤肝 → 肝气郁结',
        modernMedicine: '偏头痛、高血压、甲状腺问题、乳腺结节',
        signals: '频繁头痛、月经不调、胸闷、容易叹气',
        color: 'from-orange-500 to-red-600',
        icon: '🔥'
    },
    {
        mood: '悲伤、抑郁',
        tcmTheory: '忧伤肺 → 肺气耗损',
        modernMedicine: '哮喘、慢性支气管炎、免疫力下降、疲劳',
        signals: '胸闷气短、咳嗽、容易感冒、提不起劲',
        color: 'from-blue-400 to-indigo-500',
        icon: '☁️'
    },
    {
        mood: '焦虑、恐惧',
        tcmTheory: '恐伤肾 → 肾气不固',
        modernMedicine: '脱发、耳鸣、尿频、腰膝酸软、过敏',
        signals: '失眠多梦、手脚冰凉、皮肤瘙痒、关节疼痛',
        color: 'from-gray-600 to-slate-800',
        icon: '❄️'
    },
    {
        mood: '思虑过度',
        tcmTheory: '思伤脾 → 脾胃虚弱',
        modernMedicine: '消化不良、胃溃疡、肠易激综合征、肥胖',
        signals: '腹胀嗳气、食欲不振、便秘或腹泻、水肿',
        color: 'from-amber-400 to-yellow-600',
        icon: '🌀'
    },
    {
        mood: '过度喜悦/兴奋',
        tcmTheory: '喜伤心 → 心气涣散',
        modernMedicine: '心悸、心律失常、失眠、神经衰弱',
        signals: '心跳加速、坐立不安、失眠多梦、注意力不集中',
        color: 'from-pink-400 to-rose-500',
        icon: '⚡'
    },
    {
        mood: '愧疚、羞耻',
        tcmTheory: '情志内耗 → 气血瘀滞',
        modernMedicine: '慢性疼痛、湿疹、牛皮癣、自身免疫病',
        signals: '莫名的身体疼痛、皮肤反复发炎、口腔溃疡',
        color: 'from-purple-500 to-violet-700',
        icon: '🌫️'
    },
    {
        mood: '压抑、委屈',
        tcmTheory: '肝气郁结 → 气血不畅',
        modernMedicine: '痛经、子宫肌瘤、慢性咽炎、肩颈僵硬',
        signals: '咽喉异物感、经前综合征、肩颈酸痛、情绪低落',
        color: 'from-emerald-500 to-teal-600',
        icon: '🌿'
    }
];

export const checkTips = [
    "观察规律：当你出现某种情绪后，留意身体是否立刻或在一两天内出现对应的不适。",
    "关注慢性症状：如果某个身体问题反复发作，且检查不出明确的生理原因，很可能与长期情绪积压有关。",
    "情绪溯源：当身体发出信号时，试着回溯最近一周的情绪状态，找到可能的触发点。"
];
