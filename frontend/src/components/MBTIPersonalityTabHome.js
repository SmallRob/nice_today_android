import React, { useState, useEffect, useMemo } from 'react';
import { userConfigManager } from '../utils/userConfigManager';
import { Card } from './PageLayout';
import { useTheme } from '../context/ThemeContext';

// MBTI配置管理器 - 仅用于读取默认配置
class MBTIConfigManager {
  constructor() {
    this.CONFIG_KEY = 'mbti_config';
    this.DEFAULT_CONFIG = {
      userMBTI: '',
      selectedDate: new Date().toISOString(),
      lastUsedMBTI: '',
      mbtiHistory: [],
      themeSettings: {
        autoSync: true,
        independentMode: false
      },
      version: '1.0',
      lastUpdated: Date.now()
    };
  }

  // 获取配置 - 仅返回默认配置，不保存任何用户选择
  getConfig() {
    // 始终返回默认配置，忽略任何已保存的用户配置
    return { ...this.DEFAULT_CONFIG };
  }
}

// 创建配置管理器实例
const mbtiConfigManager = new MBTIConfigManager();

const MBTIPersonalityTabHome = () => {
  // 使用主题管理
  const { theme } = useTheme();

  // 状态管理
  const [userMBTI, setUserMBTI] = useState('');
  const [personalityAnalysis, setPersonalityAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allMBTIs, setAllMBTIs] = useState([]);
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    birthDate: '',
    mbti: ''
  });
  const [initialized, setInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [tempMBTI, setTempMBTI] = useState(''); // 用于临时切换MBTI查看

  // MBTI人格类型数据 - 使用useMemo缓存
  const mbtiTypes = useMemo(() => [
    {
      type: 'ISTJ',
      name: '物流师',
      nickname: '内敛蜜蜂',
      tags: ['细节控', '责任担当', '秩序守护者'],
      motto: '“言必行，行必果”',
      summary: '诚实可靠的执行者，以严谨的态度和高度的责任感守护规则与秩序。',
      description: '务实、可靠、注重细节',
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      icon: '�',
      traits: ['可靠', '有条理', '务实', '传统', '忠诚'],
      strengths: ['责任感强', '注重细节', '逻辑清晰', '遵守规则', '执行力强'],
      weaknesses: ['缺乏灵活性', '过于保守', '不擅长表达情感', '抗拒变化', '容易固执'],
      careerAdvice: ['会计', '审计师', '行政人员', '项目经理', '数据分析师'],
      relationship: 'ISTJ在关系中重视稳定和承诺，是可靠的生活伴侣',
      communicationStyle: '直接、具体、注重事实，不擅长表达情感',
      growthTips: '尝试接受新想法，学习表达情感，培养灵活性'
    },
    {
      type: 'ISFJ',
      name: '守护者',
      nickname: '温顺小鹿',
      tags: ['体贴入微', '温和坚定', '幕后英雄'],
      motto: '“照顾他人是我的本能”',
      summary: '细心周到的照顾者，以谦逊和奉献的精神为身边人提供最坚实的依靠。',
      description: '体贴、尽责、保护欲强',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      icon: '🦌',
      traits: ['体贴', '保护欲强', '尽责', '传统', '支持性'],
      strengths: ['有责任心', '体贴他人', '注重细节', '忠诚可靠', '务实'],
      weaknesses: ['过于敏感', '难以拒绝他人', '抗拒变化', '过度自我批评', '隐藏需求'],
      careerAdvice: ['护士', '教师', '社工', '行政助理', '心理咨询师'],
      relationship: 'ISFJ是体贴的伴侣，重视家庭和谐和传统价值',
      communicationStyle: '温和、体贴、注重他人感受，避免冲突',
      growthTips: '学习设定界限，表达自己的需求，接受建设性批评'
    },
    {
      type: 'INFJ',
      name: '倡导者',
      nickname: '利他长颈鹿',
      tags: ['灵魂导师', '理想主义者', '洞察之眼'],
      motto: '“世界可以变得更美好”',
      summary: '富有远见的坚守者，在深邃的洞察中寻找人生的意义并默默感化他人。',
      description: '理想主义、有洞察力、富有同情心',
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      icon: '🦒',
      traits: ['理想主义', '有洞察力', '富有同情心', '创意', '神秘'],
      strengths: ['深刻洞察力', '富有同情心', '创造力强', '理想主义', '坚持原则'],
      weaknesses: ['过于完美主义', '容易过度思考', '难以表达需求', '容易疲惫', '过于敏感'],
      careerAdvice: ['心理咨询师', '作家', '艺术家', '教师', '社工'],
      relationship: 'INFJ寻求深刻的精神连接，是理解 and 支持性的伴侣',
      communicationStyle: '深刻、富有洞察力、隐喻丰富，注重深层次交流',
      growthTips: '学会接受不完美，平衡理想与现实，保护个人能量'
    },
    {
      type: 'INTJ',
      name: '建筑师',
      nickname: '冷静的鹰',
      tags: ['反讽大师', '理性且机智', '真理探索家'],
      motto: '“一切皆在计划之中”',
      summary: '高效的规划者和深思熟虑的创新者，以周密的规划面对挑战。',
      description: '战略思维、独立、追求效率',
      color: '#6366f1',
      bgGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      icon: '🦅',
      traits: ['战略思维', '独立', '逻辑性强', '有远见', '自信'],
      strengths: ['战略思维', '逻辑分析', '独立思考', '执行力强', '有远见'],
      weaknesses: ['过于批判', '不擅长情感表达', '显得冷漠', '固执己见', '完美主义'],
      careerAdvice: ['科学家', '工程师', '战略规划师', '企业家', '投资分析师'],
      relationship: 'INTJ重视智力连接，寻求能理解他们愿景的伴侣',
      communicationStyle: '逻辑清晰、直接、注重效率，不绕弯子',
      growthTips: '学习表达情感，考虑他人感受，培养耐心'
    },
    {
      type: 'ISTP',
      name: '鉴赏家',
      nickname: '傲娇猫猫',
      tags: ['冷面笑匠', '生存专家', '硬核玩家'],
      motto: '“凡事都有其运作之道”',
      summary: '冷静务实的探索者，在观察与实践中洞察事物的本质并能迅速化解难题。',
      description: '实用、灵活、擅长解决问题',
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      icon: '�',
      traits: ['实用', '灵活', '冷静', '独立', '冒险'],
      strengths: ['解决问题能力强', '动手能力强', '适应力强', '冷静沉着', '务实'],
      weaknesses: ['缺乏长期规划', '容易感到无聊', '不擅长表达情感', '冲动', '抗拒承诺'],
      careerAdvice: ['工程师', '机械师', '飞行员', '程序员', '急救人员'],
      relationship: 'ISTP享受自由和冒险，需要能理解他们独立性的伴侣',
      communicationStyle: '直接、务实、注重行动，不擅长情感交流',
      growthTips: '培养长期目标意识，学习情感表达，考虑未来规划'
    },
    {
      type: 'ISFP',
      name: '探险家',
      nickname: '灵活小熊',
      tags: ['唯美主义', '自由灵魂', '感官大师'],
      motto: '“生活是一件艺术品”',
      summary: '细腻敏感的创造者，用独特的审美和温和的态度去感悟与点缀这个世界。',
      description: '艺术、敏感、活在当下',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      icon: '🐻',
      traits: ['艺术', '敏感', '活在当下', '灵活', '温和'],
      strengths: ['艺术感强', '敏感细腻', '适应力强', '活在当下', '温和友善'],
      weaknesses: ['缺乏规划', '过度敏感', '难以应对批评', '逃避冲突', '容易冲动'],
      careerAdvice: ['艺术家', '设计师', '园艺师', '兽医', '舞蹈家'],
      relationship: 'ISFP是浪漫敏感的伴侣，重视当下的情感体验',
      communicationStyle: '温和、艺术化、注重感受，避免直接冲突',
      growthTips: '学习规划未来，面对建设性批评，表达自己的需求'
    },
    {
      type: 'INFP',
      name: '调停者',
      nickname: '反骨小蝴蝶',
      tags: ['精神隐士', '温柔力量', '脑回路奇特'],
      motto: '“愿每个灵魂都被温柔以待”',
      summary: '怀揣梦想的治愈者，在坚持自我价值的同时默默传递着希望与爱。',
      description: '理想主义、富有同情心、创意无限',
      color: '#ec4899',
      bgGradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      icon: '🦋',
      traits: ['理想主义', '富有同情心', '创意无限', '价值观驱动', '灵活'],
      strengths: ['富有同情心', '创造力强', '理想主义', '价值观坚定', '适应力强'],
      weaknesses: ['过于理想化', '容易感到压力', '难以做决定', '逃避冲突', '自我怀疑'],
      careerAdvice: ['作家', '艺术家', '心理咨询师', '社工', '编辑'],
      relationship: 'INFP追求灵魂伴侣，重视深度情感和价值观的契合',
      communicationStyle: '隐喻丰富、富有诗意、注重价值观，避免直接对抗',
      growthTips: '平衡理想与现实，学习做决定，建立自信心'
    },
    {
      type: 'INTP',
      name: '逻辑学家',
      nickname: '睿智猫头鹰',
      tags: ['好奇宝宝', '逻辑狂人', '学术独行侠'],
      motto: '“宇宙的真相就在这里”',
      summary: '深奥理论的构建者，对知识充满渴望，习惯于在逻辑思考中发现世界的规律。',
      description: '逻辑思维、创新、好奇心强',
      color: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      icon: '🦉',
      traits: ['逻辑思维', '创新', '好奇心强', '独立', '分析性'],
      strengths: ['逻辑思维强', '创新能力强', '好奇心旺盛', '独立思考', '分析能力强'],
      weaknesses: ['过于理论化', '缺乏执行力', '社交困难', '显得冷漠', '容易分心'],
      careerAdvice: ['科学家', '哲学家', '程序员', '数学家', '研究员'],
      relationship: 'INTP重视智力刺激，寻求能进行深度讨论的伴侣',
      communicationStyle: '逻辑严密、理论性强、注重概念，可能显得抽象',
      growthTips: '培养执行力，学习社交技巧，平衡理论与实际'
    },
    {
      type: 'ESTP',
      name: '企业家',
      nickname: '敏锐雪豹',
      tags: ['即兴大师', '能量泵', '现实派玩家'],
      motto: '“活在当下，立即行动”',
      summary: '机敏果敢的开拓者，以极强的适应力和敏锐的洞察力在快节奏的生活中游刃有余。',
      description: '活力四射、务实、善于交际',
      color: '#f97316',
      bgGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      icon: '�',
      traits: ['活力四射', '务实', '善于交际', '灵活', '冒险'],
      strengths: ['行动力强', '善于交际', '适应力强', '务实高效', '充满活力'],
      weaknesses: ['缺乏耐心', '容易冲动', '不注重细节', '抗拒规则', '缺乏长期规划'],
      careerAdvice: ['销售', '企业家', '运动员', '公关', '应急服务'],
      relationship: 'ESTP是充满活力的伴侣，喜欢冒险和新鲜体验',
      communicationStyle: '直接、生动、注重行动，善于即兴发挥',
      growthTips: '培养耐心，注重细节，考虑长远影响'
    },
    {
      type: 'ESFP',
      name: '表演者',
      nickname: '乐天鹦鹉',
      tags: ['快乐瀑布', '社交C位', '颜值担当'],
      motto: '“世界是我的舞台”',
      summary: '热力四射的感染者，用无穷的活力和幽默感将快乐传递给身边的每一个人。',
      description: '热情、友善、享受生活',
      color: '#84cc16',
      bgGradient: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
      icon: '🦜',
      traits: ['热情', '友善', '享受生活', '乐观', '善于交际'],
      strengths: ['热情洋溢', '善于交际', '适应力强', '乐观积极', '享受当下'],
      weaknesses: ['缺乏规划', '容易分心', '难以处理复杂问题', '逃避冲突', '冲动'],
      careerAdvice: ['演员', '主持人', '销售', '活动策划', '导游'],
      relationship: 'ESFP是充满乐趣的伴侣，重视享受生活和社交活动',
      communicationStyle: '生动有趣、热情洋溢、注重当下体验',
      growthTips: '学习规划未来，培养专注力，面对复杂问题'
    },
    {
      type: 'ENFP',
      name: '竞选者',
      nickname: '快乐小狗',
      tags: ['灵感泉涌', '社交牛杂症', '自由追逐者'],
      motto: '“生活处处是惊喜”',
      summary: '创意无限的追梦者，在不断探索新可能性的过程中为世界注入活力与热情。',
      description: '热情、创意、鼓舞人心',
      color: '#fbbf24',
      bgGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      icon: '🐶',
      traits: ['热情', '创意', '鼓舞人心', '乐观', '善于交际'],
      strengths: ['热情洋溢', '创造力强', '善于鼓舞他人', '适应力强', '乐观积极'],
      weaknesses: ['缺乏专注', '容易过度承诺', '难以完成项目', '逃避细节', '容易分心'],
      careerAdvice: ['公关', '创意总监', '教师', '心理咨询师', '作家'],
      relationship: 'ENFP是充满激情的伴侣，重视深度连接和共同成长',
      communicationStyle: '热情洋溢、富有感染力、注重可能性',
      growthTips: '培养专注力，学习管理时间，注重细节'
    },
    {
      type: 'ENTP',
      name: '辩论家',
      nickname: '机敏赤狐',
      tags: ['嘴炮王者', '点子大王', '破局者'],
      motto: '“为什么要按照常理出牌”',
      summary: '机智多变的挑战者，喜欢在思想碰撞中探索真理，总能提出令人赞叹的新奇见解。',
      description: '机智、创新、喜欢挑战',
      color: '#a855f7',
      bgGradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
      icon: '🦊',
      traits: ['机智', '创新', '喜欢挑战', '善于辩论', '好奇心强'],
      strengths: ['思维敏捷', '创新能力强', '善于辩论', '适应力强', '好奇心旺盛'],
      weaknesses: ['容易争论', '缺乏耐心', '难以坚持', '忽视细节', '容易厌倦'],
      careerAdvice: ['律师', '企业家', '发明家', '咨询师', '战略家'],
      relationship: 'ENTP是智力刺激的伴侣，喜欢辩论和思想碰撞',
      communicationStyle: '机智幽默、善于辩论、注重思想交流',
      growthTips: '培养耐心，学习坚持，考虑他人感受'
    },
    {
      type: 'ESTJ',
      name: '执行官',
      nickname: '果断小狼',
      tags: ['天生管理者', '时间管理大师', '公平正义'],
      motto: '“秩序是成功的基石”',
      summary: '高效果断的统筹者，以强大的执行力和组织能力确保每一项计划都能被完美达成。',
      description: '务实、果断、注重效率',
      color: '#0ea5e9',
      bgGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      icon: '�',
      traits: ['务实', '果断', '注重效率', '有条理', '传统'],
      strengths: ['执行力强', '组织能力强', '务实高效', '果断决策', '责任感强'],
      weaknesses: ['缺乏灵活性', '过于直接', '不擅长情感表达', '抗拒变化', '显得专制'],
      careerAdvice: ['经理', '军官', '教师', '警察', '项目经理'],
      relationship: 'ESTJ是可靠的伴侣，重视稳定和传统家庭价值',
      communicationStyle: '直接、务实、注重效率，可能显得生硬',
      growthTips: '培养灵活性，学习情感表达，考虑他人感受'
    },
    {
      type: 'ESFJ',
      name: '执政官',
      nickname: '靠谱大象',
      tags: ['和谐使者', '社交润滑剂', '家庭支柱'],
      motto: '“大家开心我就开心”',
      summary: '热情友善的连接者，致力于维护群体的和谐与稳定，是身边人最温暖的港湾。',
      description: '友善、尽责、善于交际',
      color: '#22c55e',
      bgGradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      icon: '🐘',
      traits: ['友善', '尽责', '善于交际', '传统', '支持性'],
      strengths: ['善于交际', '有责任心', '体贴他人', '组织能力强', '务实'],
      weaknesses: ['过于在意他人看法', '难以拒绝他人', '抗拒变化', '过度自我批评', '容易焦虑'],
      careerAdvice: ['教师', '护士', '社工', '行政人员', '客户服务'],
      relationship: 'ESFJ是体贴的伴侣，重视家庭和谐和社交关系',
      communicationStyle: '友善、体贴、注重和谐，避免冲突',
      growthTips: '学习设定界限，表达自己的需求，接受不同意见'
    },
    {
      type: 'ENFJ',
      name: '主人公',
      nickname: '真诚白鸽',
      tags: ['魅力领袖', '共情大师', '理想向导'],
      motto: '“只要我们站在一起”',
      summary: '极具魅力的领导者，以满腔的热情和真诚的同情心感召他人共同走向光明的未来。',
      description: '魅力四射、鼓舞人心、富有同情心',
      color: '#eab308',
      bgGradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
      icon: '🕊️',
      traits: ['魅力四射', '鼓舞人心', '富有同情心', '理想主义', '善于交际'],
      strengths: ['领导力强', '善于鼓舞他人', '富有同情心', '沟通能力强', '理想主义'],
      weaknesses: ['过度投入', '容易疲惫', '过于理想化', '难以接受批评', '容易过度承诺'],
      careerAdvice: ['教师', '心理咨询师', '公关', '政治家', '人力资源'],
      relationship: 'ENFJ是充满关怀的伴侣，重视深度连接和共同成长',
      communicationStyle: '鼓舞人心、富有感染力、注重他人感受',
      growthTips: '学习保护个人能量，接受建设性批评，平衡理想与现实'
    },
    {
      type: 'ENTJ',
      name: '指挥官',
      nickname: '霸气狮子',
      tags: ['战略奇才', '意志之王', '无畏统帅'],
      motto: '“我的字典里没有不可能”',
      summary: '雄心勃勃的开拓者，以无与伦比的意志力和长远的战略眼光征服一个又一个目标。',
      description: '战略思维、果断、领导力强',
      color: '#d946ef',
      bgGradient: 'linear-gradient(135deg, #d946ef 0%, #c026d3 100%)',
      icon: '🦁',
      traits: ['战略思维', '果断', '领导力强', '自信', '有远见'],
      strengths: ['领导力强', '战略思维', '果断决策', '执行力强', '有远见'],
      weaknesses: ['过于强势', '缺乏耐心', '不擅长情感表达', '显得傲慢', '过于批判'],
      careerAdvice: ['CEO', '律师', '投资银行家', '政治家', '军事指挥官'],
      relationship: 'ENTJ是强大的伴侣，重视目标 and 成就的共享',
      communicationStyle: '直接、果断、注重效率，可能显得强势',
      growthTips: '培养耐心，学习情感表达，考虑他人感受'
    }
  ], []);

  // MBTI类型列表
  const mbtiList = useMemo(() => [
    'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
    'ISTP', 'ISFP', 'INFP', 'INTP',
    'ESTP', 'ESFP', 'ENFP', 'ENTP',
    'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
  ], []);

  // 加载MBTI分析数据
  const loadPersonalityAnalysis = (mbtiType) => {
    if (!mbtiType) return;

    setLoading(true);
    setError(null);

    try {
      // 查找对应的MBTI类型数据
      const typeData = mbtiTypes.find(t => t.type === mbtiType);

      if (!typeData) {
        throw new Error(`未找到${mbtiType}类型的分析数据`);
      }

      // 生成兼容类型（相似的MBTI类型）
      const getCompatibleTypes = (type) => {
        const compatibilityMap = {
          'ISTJ': ['ISFJ', 'ESTJ', 'ISTP'],
          'ISFJ': ['ISTJ', 'ESFJ', 'ISFP'],
          'INFJ': ['ENFJ', 'INTJ', 'ENFP'],
          'INTJ': ['ENTJ', 'INFJ', 'INTP'],
          'ISTP': ['ESTP', 'ISFP', 'ISTJ'],
          'ISFP': ['ESFP', 'ISTP', 'ISFJ'],
          'INFP': ['ENFP', 'INFJ', 'INTP'],
          'INTP': ['ENTP', 'INTJ', 'INFP'],
          'ESTP': ['ISTP', 'ESFP', 'ENTP'],
          'ESFP': ['ISFP', 'ESTP', 'ENFP'],
          'ENFP': ['INFP', 'ENFJ', 'ENTP'],
          'ENTP': ['INTP', 'ENFP', 'ESTP'],
          'ESTJ': ['ISTJ', 'ESFJ', 'ENTJ'],
          'ESFJ': ['ISFJ', 'ESTJ', 'ENFJ'],
          'ENFJ': ['INFJ', 'ESFJ', 'ENFP'],
          'ENTJ': ['INTJ', 'ESTJ', 'ENTP']
        };

        return compatibilityMap[type] || ['INFJ', 'ENFJ', 'ENFP'];
      };

      // 生成不兼容类型
      const getIncompatibleTypes = (type) => {
        const incompatibilityMap = {
          'ISTJ': ['ENFP', 'ENTP', 'INFP'],
          'ISFJ': ['ENTP', 'INTP', 'ENTJ'],
          'INFJ': ['ESTP', 'ESFP', 'ISTP'],
          'INTJ': ['ESFP', 'ESTP', 'ESFJ'],
          'ISTP': ['ENFJ', 'INFJ', 'ENFP'],
          'ISFP': ['ENTJ', 'INTJ', 'ESTJ'],
          'INFP': ['ESTJ', 'ENTJ', 'ISTJ'],
          'INTP': ['ESFJ', 'ESTJ', 'ISFJ'],
          'ESTP': ['INFJ', 'INTJ', 'ISFJ'],
          'ESFP': ['INTJ', 'INFJ', 'ISTJ'],
          'ENFP': ['ISTJ', 'ISFJ', 'ESTJ'],
          'ENTP': ['ISFJ', 'ISTJ', 'ESFJ'],
          'ESTJ': ['INFP', 'ENFP', 'INTP'],
          'ESFJ': ['INTP', 'ENTP', 'INTJ'],
          'ENFJ': ['ISTP', 'ESTP', 'ISTJ'],
          'ENTJ': ['ISFP', 'INFP', 'ESFP']
        };

        return incompatibilityMap[type] || ['ISTJ', 'ESTJ', 'ISTP'];
      };

      // 生成职业建议详情
      const getCareerDetails = (type) => {
        const careerMap = {
          'ISTJ': {
            idealEnvironments: ['结构化环境', '清晰的规则和期望', '注重细节的工作'],
            workStyle: '系统化、按部就班、注重准确性',
            avoidCareers: ['需要高度创意的工作', '频繁变化的环境', '模糊不清的任务']
          },
          'ISFJ': {
            idealEnvironments: ['支持性环境', '帮助他人的机会', '稳定的工作节奏'],
            workStyle: '细致、可靠、注重团队和谐',
            avoidCareers: ['高压竞争环境', '需要频繁演讲的工作', '孤立的工作环境']
          },
          // 其他类型的职业详情...
        };

        return careerMap[type] || {
          idealEnvironments: ['支持性环境', '清晰的目标', '合作氛围'],
          workStyle: '平衡、适应性强、注重结果',
          avoidCareers: ['高度竞争环境', '模糊的任务', '孤立工作']
        };
      };

      const compatibleTypes = getCompatibleTypes(mbtiType);
      const incompatibleTypes = getIncompatibleTypes(mbtiType);
      const careerDetails = getCareerDetails(mbtiType);

      // 构建分析数据
      const analysisData = {
        basicInfo: {
          type: typeData.type,
          name: typeData.name,
          nickname: typeData.nickname,
          tags: typeData.tags,
          motto: typeData.motto,
          summary: typeData.summary,
          description: typeData.description,
          icon: typeData.icon,
          color: typeData.color
        },
        traits: {
          coreTraits: typeData.traits,
          strengths: typeData.strengths,
          weaknesses: typeData.weaknesses,
          growthAreas: typeData.growthTips.split('，')
        },
        relationships: {
          style: typeData.relationship,
          communication: typeData.communicationStyle,
          compatibleTypes: compatibleTypes,
          incompatibleTypes: incompatibleTypes,
          advice: `与${compatibleTypes.join('、')}类型相处较为和谐，与${incompatibleTypes.join('、')}类型可能需要更多磨合`
        },
        career: {
          suggestions: typeData.careerAdvice,
          idealEnvironments: careerDetails.idealEnvironments,
          workStyle: careerDetails.workStyle,
          avoidCareers: careerDetails.avoidCareers,
          advice: `在${careerDetails.idealEnvironments.join('、')}的环境中更能发挥潜力`
        },
        personalGrowth: {
          tips: typeData.growthTips.split('，'),
          developmentAreas: typeData.weaknesses.slice(0, 3),
          potential: `${typeData.type}类型在${typeData.strengths.slice(0, 2).join('、')}方面具有显著优势`,
          mindfulness: `注意避免${typeData.weaknesses.slice(0, 2).join('和')}的倾向`
        }
      };

      setPersonalityAnalysis(analysisData);
    } catch (error) {
      console.error('加载MBTI分析失败:', error);
      setError(error.message || '加载分析数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化组件 - 优化为立即加载默认数据
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        // 立即加载所有MBTI类型和默认MBTI，不等待用户配置
        setAllMBTIs(mbtiList);
        setUserMBTI('INFP');
        setTempMBTI('');

        // 异步获取用户配置，但不阻塞界面
        setTimeout(async () => {
          try {
            // 确保用户配置管理器已初始化
            if (!userConfigManager.initialized) {
              await userConfigManager.initialize();
            }

            // 获取用户配置
            const currentConfig = userConfigManager.getCurrentConfig();
            if (currentConfig && isMounted) {
              setUserInfo({
                nickname: currentConfig.nickname || '',
                birthDate: currentConfig.birthDate || '',
                mbti: currentConfig.mbti || ''
              });

              // 如果用户有配置的MBTI且不是默认值，则更新显示
              if (currentConfig.mbti && currentConfig.mbti !== 'INFP') {
                setUserMBTI(currentConfig.mbti);
                // 标记需要重新加载数据
                setDataLoaded(false);
              }
            }

            // 添加配置变更监听器
            const removeConfigListener = userConfigManager.addListener((configData) => {
              if (isMounted && configData.currentConfig) {
                setUserInfo({
                  nickname: configData.currentConfig.nickname || '',
                  birthDate: configData.currentConfig.birthDate || '',
                  mbti: configData.currentConfig.mbti || ''
                });

                // 仅在没有临时MBTI时更新MBTI信息，避免覆盖用户临时选择
                if (configData.currentConfig.mbti &&
                  configData.currentConfig.mbti !== userMBTI &&
                  !tempMBTI) { // 仅在没有临时MBTI时更新
                  setUserMBTI(configData.currentConfig.mbti);
                  // 标记需要重新加载数据
                  setDataLoaded(false);
                }
              }
            });

            if (removeConfigListener) {
              removeConfigListener();
            }
          } catch (error) {
            console.warn('异步加载用户配置失败:', error);
          }
        }, 50); // 短延迟，确保界面先显示

        if (isMounted) {
          setInitialized(true);
        }
      } catch (error) {
        console.error('初始化MBTI组件失败:', error);

        // 降级处理
        setAllMBTIs(mbtiList);
        setUserMBTI('INFP');
        setTempMBTI('');
        if (isMounted) {
          setInitialized(true);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [mbtiList]);

  // 当MBTI类型变化时重新加载数据
  useEffect(() => {
    if (!userMBTI || !initialized) return;

    // 仅在首次默认加载或用户主动切换时执行数据请求
    if (!dataLoaded) {
      const timer = setTimeout(() => {
        loadPersonalityAnalysis(userMBTI);
        setDataLoaded(true);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [userMBTI, initialized, dataLoaded]);

  // 处理MBTI类型选择 - 支持临时查看模式
  const handleMBTIChange = (mbti) => {
    if (userMBTI !== mbti) {
      // 如果是用户配置的MBTI，清除临时标记
      if (mbti === userInfo.mbti) {
        setTempMBTI('');
      } else {
        // 否则设置为临时MBTI
        setTempMBTI(mbti);
      }

      setUserMBTI(mbti);
      // 标记需要重新加载数据
      setDataLoaded(false);
    }
  };

  // 渲染MBTI基本信息卡片
  const renderBasicInfoCard = () => {
    if (!personalityAnalysis?.basicInfo) return null;

    const { type, name, nickname, tags, motto, summary, icon, color } = personalityAnalysis.basicInfo;

    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-800 dark:to-purple-950 rounded-2xl p-6 text-white shadow-lg mb-4 transition-all duration-300">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* 图标和类型 */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex-shrink-0 w-24 h-24 rounded-3xl flex flex-col items-center justify-center text-5xl shadow-xl backdrop-blur-md bg-white/20 border border-white/30 ring-1 ring-white/20 transform hover:rotate-3 transition-transform duration-500"
            >
              <span className="mb-1">{icon}</span>
            </div>
            <div className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm text-[10px] font-black uppercase tracking-widest border border-white/10">
              {type}
            </div>
          </div>

          {/* 基本信息 */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:gap-3 mb-2 justify-center md:justify-start">
                <h1 className="text-3xl font-black tracking-tight">{nickname}</h1>
                <div className="h-6 w-[2px] bg-white/30 hidden md:block"></div>
                <span className="text-lg font-bold opacity-90">{name}</span>
              </div>
              <p className="text-sm text-indigo-100 font-bold mb-3 tracking-wide bg-black/10 inline-block px-3 py-1 rounded-lg backdrop-blur-sm">
                {motto}
              </p>
              <p className="text-xs text-white/80 font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
                {summary}
              </p>
            </div>

            {/* 核心特质标签 */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-1.5 bg-white/15 dark:bg-black/40 border border-white/20 rounded-full text-[11px] font-black tracking-wider text-white shadow-inner"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染人格特质二维坐标图
  const renderTraitsCoordinateMap = () => {
    if (!userMBTI) return null;

    const dimensions = [
      { key: 'E_I', left: '内向', leftCode: 'I', right: '外向', rightCode: 'E' },
      { key: 'S_N', left: '感觉', leftCode: 'S', right: '直觉', rightCode: 'N' },
      { key: 'T_F', left: '思维', leftCode: 'T', right: '情感', rightCode: 'F' },
      { key: 'J_P', left: '判断', leftCode: 'J', right: '感知', rightCode: 'P' },
    ];

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-6 border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 100 100">
            <path d="M 10 50 L 90 50 M 50 10 L 50 90" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3 text-indigo-600 dark:text-indigo-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
          核心倾向坐标维度
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 px-2">
          {dimensions.map((dim, index) => {
            const isRight = userMBTI.includes(dim.rightCode);
            return (
              <div key={index} className="relative py-2">
                <div className="flex justify-between items-end mb-4 px-1">
                  <div className={`flex flex-col items-center ${!isRight ? 'opacity-100 scale-110' : 'opacity-40'}`}>
                    <span className="text-[10px] uppercase font-black text-indigo-500 mb-1">{dim.leftCode}</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{dim.left}</span>
                  </div>
                  <div className={`flex flex-col items-center ${isRight ? 'opacity-100 scale-110' : 'opacity-40'}`}>
                    <span className="text-[10px] uppercase font-black text-indigo-500 mb-1">{dim.rightCode}</span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{dim.right}</span>
                  </div>
                </div>

                <div className="relative h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                  {/* 中心线 */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-300 dark:bg-gray-600 z-10"></div>

                  {/* 进度条 */}
                  <div
                    className={`absolute top-0 bottom-0 transition-all duration-1000 ease-out flex items-center justify-center ${isRight
                      ? 'right-0 left-1/2 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                      : 'left-0 right-1/2 bg-gradient-to-l from-indigo-400 to-indigo-600 rounded-l-full shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                      }`}
                  >
                  </div>
                </div>

                {/* 装饰性光点 */}
                <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-indigo-300 shadow-md border-2 border-indigo-500 z-20 transition-all duration-1000 ease-out`}
                  style={{
                    left: isRight ? '75%' : '25%',
                    transform: 'translate(-50%, 0)'
                  }}
                ></div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic text-center">
            基于人格维度的动态平衡，呈现出独一无二的性格能量分布
          </p>
        </div>
      </div>
    );
  };

  // 渲染特质分析卡片
  const renderTraitsCard = () => {
    if (!personalityAnalysis?.traits) return null;

    const { strengths, weaknesses } = personalityAnalysis.traits;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          特质潜力分析
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 优势 */}
          <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-800/30 transition-all hover:shadow-md">
            <h3 className="text-[13px] font-bold text-emerald-800 dark:text-emerald-400 mb-3 flex items-center tracking-wide">
              <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mr-2 text-xs">💎</span>
              核心优势
            </h3>
            <ul className="space-y-2.5">
              {strengths.slice(0, 4).map((strength, index) => (
                <li key={index} className="flex items-start">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2.5 flex-shrink-0"></div>
                  <span className="text-[12px] text-gray-700 dark:text-gray-300 font-medium leading-tight">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 需要注意 */}
          <div className="bg-rose-50/40 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-100/50 dark:border-rose-800/30 transition-all hover:shadow-md">
            <h3 className="text-[13px] font-bold text-rose-800 dark:text-rose-400 mb-3 flex items-center tracking-wide">
              <span className="w-6 h-6 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center mr-2 text-xs">⚖️</span>
              注意与挑战
            </h3>
            <ul className="space-y-2.5">
              {weaknesses.slice(0, 4).map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-rose-400 rounded-full mr-2.5 flex-shrink-0"></div>
                  <span className="text-[12px] text-gray-700 dark:text-gray-300 font-medium leading-tight">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };


  // 渲染人际关系卡片
  const renderRelationshipsCard = () => {
    if (!personalityAnalysis?.relationships) return null;

    const { compatibleTypes, advice } = personalityAnalysis.relationships;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-pink-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          社交与情感共鸣
        </h3>
        <div className="space-y-4">
          {/* 兼容类型 */}
          <div>
            <h3 className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center">
              <span className="w-6 h-6 bg-pink-50 dark:bg-pink-900/40 rounded-full flex items-center justify-center mr-2 text-xs">💖</span>
              灵魂共鸣类型
            </h3>
            <div className="flex flex-wrap gap-2">
              {compatibleTypes.slice(0, 4).map((type, index) => {
                const compatTypeData = mbtiTypes.find(t => t.type === type);
                return (
                  <div
                    key={index}
                    className="group px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm flex items-center transition-all hover:border-pink-200 dark:hover:border-pink-900/50 hover:shadow-md"
                  >
                    <span className="text-sm mr-2 group-hover:scale-125 transition-transform">{compatTypeData?.icon}</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{type}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 关系建议 */}
          <div className="relative p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-xl border border-pink-100/50 dark:border-pink-900/30">
            <div className="absolute top-3 right-4 opacity-10 text-3xl">💬</div>
            <h3 className="text-[11px] font-black text-pink-600 dark:text-pink-400 uppercase tracking-widest mb-1.5">沟通建议</h3>
            <p className="text-[12px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              {advice}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 渲染职业发展卡片
  const renderCareerCard = () => {
    if (!personalityAnalysis?.career) return null;

    const { suggestions } = personalityAnalysis.career;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1h2V3a1 1 0 011-1h1a1 1 0 011 1v1h2a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 001-1z" clipRule="evenodd" />
          </svg>
          天赋使命与职业
        </h3>
        <div className="p-1">
          <h3 className="text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <span className="w-6 h-6 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center mr-2 text-xs">💼</span>
            高匹配度职业
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.slice(0, 6).map((career, index) => (
              <div
                key={index}
                className="px-3 py-2.5 bg-blue-50/30 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/20 rounded-xl text-[12px] text-blue-800 dark:text-blue-300 font-bold text-center tracking-wide"
              >
                {career}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 渲染个人成长卡片
  const renderPersonalGrowthCard = () => {
    if (!personalityAnalysis?.personalGrowth) return null;

    const { tips, potential } = personalityAnalysis.personalGrowth;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          成长与进化指南
        </h3>
        <div className="space-y-4">
          {/* 成长潜力 */}
          <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30">
            <h3 className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center">
              <span className="mr-2">✨</span> Potential Analysis
            </h3>
            <p className="text-[12px] text-gray-700 dark:text-gray-300 font-medium leading-relaxed tracking-wide">
              {potential}
            </p>
          </div>

          {/* 成长建议 */}
          <div className="grid grid-cols-1 gap-3">
            {tips.slice(0, 3).map((tip, index) => (
              <div key={index} className="flex items-center p-3.5 bg-white dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-transform duration-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 flex items-center justify-center mr-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <span className="text-[12px] text-gray-700 dark:text-gray-300 font-medium leading-tight">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 渲染MBTI选择器
  const renderMBTISelector = () => {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 flex items-center">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          深度人格探索
        </h3>
        <div className="space-y-4">
          <div>
            {/* 当前用户信息 */}
            {userInfo.mbti && (
              <div className="mb-4 p-3 bg-indigo-50/50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/50 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">💡</span>
                  <div>
                    <p className="text-indigo-800 dark:text-indigo-300 text-[11px] font-bold uppercase tracking-widest leading-none">Your Configuration</p>
                    <p className="text-gray-800 dark:text-white text-xs font-black mt-1">{userInfo.mbti}</p>
                  </div>
                </div>
                {tempMBTI && tempMBTI !== userInfo.mbti && (
                  <div className="px-2.5 py-1 bg-orange-100 dark:bg-orange-900/40 rounded-full">
                    <p className="text-orange-700 dark:text-orange-300 text-[10px] font-bold">查看中: {tempMBTI}</p>
                  </div>
                )}
              </div>
            )}

            {/* 提示文本 */}
            <p className="mb-3 text-[11px] text-gray-400 dark:text-gray-500 font-medium px-1 flex items-center">
              <span className="mr-1.5 opacity-50">✦</span> 点击下方任意类型探索深度分析
            </p>

            {/* MBTI类型网格 */}
            <div className="mb-4">
              <div className="grid grid-cols-4 gap-2">
                {allMBTIs.map((mbti) => {
                  const typeData = mbtiTypes.find(t => t.type === mbti);
                  const isSelected = userMBTI === mbti;
                  const isUserConfig = userInfo.mbti === mbti;

                  return (
                    <button
                      key={mbti}
                      onClick={() => handleMBTIChange(mbti)}
                      className={`group relative py-3 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center overflow-hidden border ${isSelected
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent shadow-lg scale-[1.02]'
                        : 'bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md'
                        }`}
                    >
                      {/* 选中光晕效果 */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                      )}

                      <span className={`text-lg mb-0.5 transition-transform group-hover:scale-125 ${isSelected ? 'scale-110' : ''}`}>
                        {typeData?.icon}
                      </span>
                      <span className={`text-[11px] font-black tracking-tighter ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                        {mbti}
                      </span>

                      {/* 状态标记 */}
                      {isUserConfig && (
                        <div className={`absolute top-1.5 right-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'} shadow-sm`}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 重置按钮 */}
            {tempMBTI && tempMBTI !== userInfo.mbti && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => {
                    setUserMBTI(userInfo.mbti);
                    setTempMBTI('');
                    setDataLoaded(false);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold rounded-full border border-indigo-100 dark:border-indigo-900 shadow-sm transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                >
                  <span>↩</span>
                  <span>回归我的配置: {userInfo.mbti}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
      {/* 核心滚动容器：包含 Banner 和 内容，确保进入时看到顶部 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar scroll-performance-optimized bg-white dark:bg-black -webkit-overflow-scrolling-touch">
        {/* Banner区域 - 随页面滚动 */}
        <div className="nature-harmony-banner text-white shadow-lg relative overflow-hidden bg-gradient-to-r from-green-800 via-emerald-700 to-teal-900 flex-shrink-0">
          {/* 自然渐变背景 */}
          <div className="absolute inset-0 nature-gradient z-0 bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-teal-700/20"></div>

          {/* 自然元素装饰 */}
          <div className="absolute top-2 left-2 w-12 h-12 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M30,40 Q50,20 70,40" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
              <circle cx="30" cy="40" r="2" fill="currentColor" className="animate-pulse" />
              <circle cx="50" cy="20" r="1.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
              <circle cx="70" cy="40" r="1.8" fill="currentColor" className="animate-pulse" style={{ animationDelay: '1s' }} />
              <path d="M40,60 Q50,80 60,60" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
              <circle cx="40" cy="60" r="2.2" fill="currentColor" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
              <circle cx="60" cy="60" r="1.6" fill="currentColor" className="animate-pulse" style={{ animationDelay: '2s' }} />
            </svg>
          </div>
          <div className="absolute bottom-2 right-2 w-14 h-14 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M20,30 Q40,10 60,30" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
              <circle cx="20" cy="30" r="1.8" fill="currentColor" className="animate-pulse" />
              <circle cx="40" cy="10" r="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
              <circle cx="60" cy="30" r="1.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
              <path d="M80,40 Q70,60 60,50" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
            </svg>
          </div>

          {/* 动态自然元素效果 */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  opacity: Math.random() * 0.4 + 0.1
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 py-3 md:py-6 relative z-10 text-center">
            <h1 className="text-xl md:text-2xl font-bold mb-1 text-shadow-lg nature-title">
              <span className="inline-block transform hover:scale-105 transition-transform duration-300">
                MBTI人格分析
              </span>
            </h1>
            <p className="text-white text-xs md:text-base opacity-95 font-medium nature-subtitle mb-2">
              性格探索·天赋发现·成长指南
            </p>
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <span className="text-[10px] md:text-xs bg-green-500/60 text-white px-2 py-0.5 rounded-full border border-white/20 shadow-sm">🌿</span>
              <span className="text-[10px] md:text-xs bg-emerald-500/60 text-white px-2 py-0.5 rounded-full border border-white/20 shadow-sm">🌱</span>
              <span className="text-[10px] md:text-xs bg-teal-500/60 text-white px-2 py-0.5 rounded-full border border-white/20 shadow-sm">🍃</span>
              <span className="text-[10px] md:text-xs bg-green-400/60 text-white px-2 py-0.5 rounded-full border border-white/20 shadow-sm">🌳</span>
              <span className="text-[10px] md:text-xs bg-emerald-400/60 text-white px-2 py-0.5 rounded-full border border-white/20 shadow-sm">🌲</span>
            </div>
          </div>
        </div>

        {/* 内容展示区域 - 使用DressHealthTab的边距样式 */}
        <div className="container mx-auto px-4 py-4 md:px-4 md:py-6 bg-white dark:bg-black flex-1">
          <div className="mb-4 mx-auto max-w-2xl h-full">
            <div className="space-y-3 h-full">
              {/* MBTI选择器 */}
              {renderMBTISelector()}

              {/* 加载状态 */}
              {loading && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
                  <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p className="text-gray-600 dark:text-gray-300 text-xs">正在加载人格分析数据...</p>
                  </div>
                </div>
              )}

              {/* 错误显示 */}
              {error && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700 mb-4">
                  <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded p-3">
                    <p className="text-red-700 dark:text-red-300 text-xs">{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        setDataLoaded(false);
                      }}
                      className="mt-2 text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                    >
                      重试
                    </button>
                  </div>
                </div>
              )}

              {/* 人格分析内容 */}
              {!loading && !error && personalityAnalysis && userMBTI && (
                <div className="space-y-3">
                  {/* 基本信息卡片 */}
                  {renderBasicInfoCard()}

                  {/* 特质维度分布图 */}
                  {renderTraitsCoordinateMap()}

                  {/* 特质分析卡片 */}
                  {renderTraitsCard()}

                  {/* 人际关系卡片 */}
                  {renderRelationshipsCard()}

                  {/* 职业发展卡片 */}
                  {renderCareerCard()}

                  {/* 个人成长卡片 */}
                  {renderPersonalGrowthCard()}
                </div>
              )}

              {/* 未选择MBTI时的提示 */}
              {!loading && !error && !userMBTI && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 md:p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">🧩</div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">请选择MBTI类型</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs max-w-xs mx-auto mb-3">
                      选择一种MBTI类型，探索人格特质与发展建议
                    </p>
                    <div className="inline-flex flex-wrap gap-1 justify-center">
                      {mbtiList.slice(0, 4).map(mbti => {
                        const typeData = mbtiTypes.find(t => t.type === mbti);
                        return (
                          <button
                            key={mbti}
                            onClick={() => handleMBTIChange(mbti)}
                            className="px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 hover:shadow"
                            style={{
                              backgroundColor: typeData?.color,
                              color: 'white'
                            }}
                          >
                            {mbti}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MBTIPersonalityTabHome;