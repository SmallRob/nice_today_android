// 3x3矩阵维度定义
export const DIMENSIONS_3x3 = [
  { id: 'body', name: '身体', description: '健康、活力与感官体验' },
  { id: 'mind', name: '心智', description: '学习、思考与知识成长' },
  { id: 'spirit', name: '精神', description: '内省、连接与超越' },
  { id: 'work', name: '创造', description: '工作、创作与技能发展' },
  { id: 'center', name: '核心', description: '平衡与整合的中心' },
  { id: 'love', name: '爱', description: '亲密关系与情感连接' },
  { id: 'play', name: '游戏', description: '乐趣、探索与自由表达' },
  { id: 'serve', name: '服务', description: '贡献、帮助与影响力' },
  { id: 'being', name: '存在', description: '当下、宁静与本质' }
];

// 7x7矩阵维度定义
export const DIMENSIONS_7x7 = [
  // 第一行
  { id: 'health', name: '健康', description: '身体机能与活力状态' },
  { id: 'vitality', name: '生命力', description: '能量水平与恢复力' },
  { id: 'senses', name: '感官', description: '感知世界的能力' },
  { id: 'intuition', name: '直觉', description: '内在知晓与第六感' },
  { id: 'wisdom', name: '智慧', description: '经验与理解的结晶' },
  { id: 'insight', name: '洞察', description: '看透本质的能力' },
  { id: 'clarity', name: '清明', description: '清晰的思维与判断' },
  
  // 第二行
  { id: 'family', name: '家庭', description: '血缘与亲缘关系' },
  { id: 'friendship', name: '友谊', description: '同伴与支持网络' },
  { id: 'community', name: '社群', description: '归属与共同目标' },
  { id: 'mentorship', name: '导师', description: '指导与被指导关系' },
  { id: 'partnership', name: '伙伴', description: '平等合作与联盟' },
  { id: 'romance', name: '浪漫', description: '激情与亲密连接' },
  { id: 'universal-love', name: '大爱', description: '无条件的爱与慈悲' },
  
  // 第三行
  { id: 'art', name: '艺术', description: '审美表达与创造' },
  { id: 'music', name: '音乐', description: '声音与节奏表达' },
  { id: 'writing', name: '写作', description: '文字表达与沟通' },
  { id: 'innovation', name: '创新', description: '新想法与实践' },
  { id: 'craft', name: '手艺', description: '技能与工艺制作' },
  { id: 'performance', name: '表演', description: '呈现与表达自我' },
  { id: 'design', name: '设计', description: '形式与功能的结合' },
  
  // 第四行
  { id: 'knowledge', name: '知识', description: '信息与事实掌握' },
  { id: 'philosophy', name: '哲学', description: '根本问题的探索' },
  { id: 'science', name: '科学', description: '实证与探索精神' },
  { id: 'center-7x7', name: '中心', description: '整合与平衡点' },
  { id: 'mystery', name: '奥秘', description: '未知与神秘探索' },
  { id: 'ethics', name: '伦理', description: '价值观与道德判断' },
  { id: 'truth', name: '真理', description: '真实与本质追求' },
  
  // 第五行
  { id: 'meditation', name: '冥想', description: '静心与内在观察' },
  { id: 'prayer', name: '祈祷', description: '与更高力量的连接' },
  { id: 'ritual', name: '仪式', description: '象征性行动与意义' },
  { id: 'faith', name: '信念', description: '信任与精神依靠' },
  { id: 'surrender', name: '臣服', description: '放手与接受' },
  { id: 'grace', name: '恩典', description: '不劳而获的祝福' },
  { id: 'unity', name: '合一', description: '与万物的连接感' },
  
  // 第六行
  { id: 'teaching', name: '教导', description: '分享知识与智慧' },
  { id: 'healing', name: '疗愈', description: '恢复完整与健康' },
  { id: 'volunteering', name: '志愿服务', description: '无偿帮助他人' },
  { id: 'activism', name: '行动主义', description: '推动社会改变' },
  { id: 'leadership', name: '领导力', description: '引导与激励他人' },
  { id: 'mentoring', name: '指导', description: '培养他人成长' },
  { id: 'legacy', name: '遗产', description: '留下持久影响' },
  
  // 第七行
  { id: 'presence', name: '临在', description: '全然活在当下' },
  { id: 'wonder', name: '惊奇', description: '对世界的赞叹' },
  { id: 'gratitude', name: '感恩', description: '欣赏与感谢' },
  { id: 'joy', name: '喜悦', description: '纯粹的快乐' },
  { id: 'peace', name: '平和', description: '内在的宁静' },
  { id: 'flow', name: '心流', description: '全然投入的状态' },
  { id: 'essence', name: '本质', description: '真实自我的表达' }
];

// 能量印记类型
export const IMPRINT_TYPES = [
  // 物质印记
  { id: 'physical-badge', name: '实物徽章', category: 'material', power: 15, description: '代表具体成就的物理符号' },
  { id: 'energy-stone', name: '环境能量石', category: 'material', power: 12, description: '特定场所的能量记录' },
  { id: 'life-object', name: '生命物件', category: 'material', power: 20, description: '承载记忆与意义的个人物品' },
  { id: 'practice-card', name: '身体实践卡', category: 'material', power: 10, description: '记录身体锻炼与健康习惯' },
  
  // 精神印记
  { id: 'insight-crystal', name: '洞察水晶', category: 'spiritual', power: 25, description: '记录重要领悟' },
  { id: 'emotion-stone', name: '情感共鸣石', category: 'spiritual', power: 18, description: '标记深刻情感体验' },
  { id: 'dialogue-echo', name: '对话回声', category: 'spiritual', power: 15, description: '有意义对话的精华记录' },
  { id: 'dream-fragment', name: '梦境碎片', category: 'spiritual', power: 22, description: '重要梦境或直觉的符号化' },
  
  // 关系印记
  { id: 'connection-bridge', name: '连接之桥', category: 'relational', power: 16, description: '代表重要关系的建立' },
  { id: 'forgiveness-flower', name: '宽恕之花', category: 'relational', power: 20, description: '和解与原谅的时刻' },
  { id: 'gratitude-seed', name: '感恩之种', category: 'relational', power: 14, description: '表达真诚感谢的时刻' },
  
  // 创造印记
  { id: 'creation-spark', name: '创造火花', category: 'creative', power: 18, description: '新想法或项目的开始' },
  { id: 'completion-orb', name: '完成宝珠', category: 'creative', power: 25, description: '完成重要作品或项目' },
  { id: 'expression-feather', name: '表达之羽', category: 'creative', power: 12, description: '真诚自我表达的时刻' }
];

// 获取维度颜色
export const getDimensionColor = (dimensionId) => {
  const colorMap = {
    // 3x3 颜色
    body: '#FF6B6B',
    mind: '#4ECDC4',
    spirit: '#45B7D1',
    work: '#96CEB4',
    center: '#FFEAA7',
    love: '#DDA0DD',
    play: '#FDCB6E',
    serve: '#55EFC4',
    being: '#74B9FF',
    
    // 7x7 颜色分组
    // 身体相关 - 红色系
    health: '#FF6B6B', vitality: '#FF8E8E', senses: '#FFAAAA',
    // 关系相关 - 粉色系
    family: '#FFB6C1', friendship: '#FFC8DD', community: '#FFAFCC',
    // 创造相关 - 黄色系
    art: '#FFD166', music: '#FFE5A5', writing: '#FFF1C1',
    // 智慧相关 - 蓝色系
    knowledge: '#118AB2', philosophy: '#06D6A0', science: '#0CB2B2',
    // 精神相关 - 紫色系
    meditation: '#9D4EDD', prayer: '#C77DFF', ritual: '#E0AAFF',
    // 服务相关 - 绿色系
    teaching: '#2A9D8F', healing: '#4CAF50', volunteering: '#8AC926',
    // 存在相关 - 橙色系
    presence: '#F3722C', wonder: '#F8961E', gratitude: '#F9844A'
  };
  
  return colorMap[dimensionId] || '#CCCCCC';
};