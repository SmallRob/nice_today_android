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
      description: '务实、可靠、注重细节',
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      icon: '📋',
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
      description: '体贴、尽责、保护欲强',
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      icon: '🛡️',
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
      description: '理想主义、有洞察力、富有同情心',
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      icon: '🌟',
      traits: ['理想主义', '有洞察力', '富有同情心', '创意', '神秘'],
      strengths: ['深刻洞察力', '富有同情心', '创造力强', '理想主义', '坚持原则'],
      weaknesses: ['过于完美主义', '容易过度思考', '难以表达需求', '容易疲惫', '过于敏感'],
      careerAdvice: ['心理咨询师', '作家', '艺术家', '教师', '社工'],
      relationship: 'INFJ寻求深刻的精神连接，是理解和支持性的伴侣',
      communicationStyle: '深刻、富有洞察力、隐喻丰富，注重深层次交流',
      growthTips: '学会接受不完美，平衡理想与现实，保护个人能量'
    },
    { 
      type: 'INTJ', 
      name: '建筑师', 
      description: '战略思维、独立、追求效率',
      color: '#6366f1',
      bgGradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      icon: '🏗️',
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
      description: '实用、灵活、擅长解决问题',
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      icon: '🔧',
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
      description: '艺术、敏感、活在当下',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      icon: '🎨',
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
      description: '理想主义、富有同情心、创意无限',
      color: '#ec4899',
      bgGradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      icon: '🕊️',
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
      description: '逻辑思维、创新、好奇心强',
      color: '#06b6d4',
      bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      icon: '🔬',
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
      description: '活力四射、务实、善于交际',
      color: '#f97316',
      bgGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      icon: '💼',
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
      description: '热情、友善、享受生活',
      color: '#84cc16',
      bgGradient: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
      icon: '🎭',
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
      description: '热情、创意、鼓舞人心',
      color: '#fbbf24',
      bgGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      icon: '🎉',
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
      description: '机智、创新、喜欢挑战',
      color: '#a855f7',
      bgGradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
      icon: '💡',
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
      description: '务实、果断、注重效率',
      color: '#0ea5e9',
      bgGradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      icon: '👔',
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
      description: '友善、尽责、善于交际',
      color: '#22c55e',
      bgGradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      icon: '🤝',
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
      description: '魅力四射、鼓舞人心、富有同情心',
      color: '#eab308',
      bgGradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
      icon: '🎤',
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
      description: '战略思维、果断、领导力强',
      color: '#d946ef',
      bgGradient: 'linear-gradient(135deg, #d946ef 0%, #c026d3 100%)',
      icon: '👑',
      traits: ['战略思维', '果断', '领导力强', '自信', '有远见'],
      strengths: ['领导力强', '战略思维', '果断决策', '执行力强', '有远见'],
      weaknesses: ['过于强势', '缺乏耐心', '不擅长情感表达', '显得傲慢', '过于批判'],
      careerAdvice: ['CEO', '律师', '投资银行家', '政治家', '军事指挥官'],
      relationship: 'ENTJ是强大的伴侣，重视目标和成就的共享',
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

    const { type, name, description, icon, color } = personalityAnalysis.basicInfo;
    const typeData = mbtiTypes.find(t => t.type === type);

    return (
      <Card className="mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            {/* 图标和类型 */}
            <div 
              className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow"
              style={{ background: typeData?.bgGradient || color }}
            >
              {icon}
            </div>
            
            {/* 基本信息 */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-2">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                  {type} - {name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
              </div>
              
              {/* 核心特质标签 */}
              <div className="mb-2">
                <div className="flex flex-wrap gap-1 justify-center md:justify-start">
                  {personalityAnalysis.traits.coreTraits.slice(0, 3).map((trait, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: color }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // 渲染特质分析卡片
  const renderTraitsCard = () => {
    if (!personalityAnalysis?.traits) return null;

    const { strengths, weaknesses } = personalityAnalysis.traits;

    return (
      <Card title="核心特质" className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* 优势 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-3 rounded-lg border border-green-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
              <span className="mr-1">✅</span> 优势
            </h3>
            <ul className="space-y-1">
              {strengths.slice(0, 3).map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 需要注意 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 p-3 rounded-lg border border-amber-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center">
              <span className="mr-1">⚠️</span> 注意
            </h3>
            <ul className="space-y-1">
              {weaknesses.slice(0, 3).map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    );
  };

  // 渲染人际关系卡片
  const renderRelationshipsCard = () => {
    if (!personalityAnalysis?.relationships) return null;

    const { compatibleTypes, advice } = personalityAnalysis.relationships;
    const typeData = mbtiTypes.find(t => t.type === userMBTI);

    return (
      <Card title="人际交往" className="mb-4">
        <div className="space-y-3">
          {/* 兼容类型 */}
          <div>
            <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center">
              <span className="mr-1">🤝</span> 相处融洽的类型
            </h3>
            <div className="flex flex-wrap gap-1">
              {compatibleTypes.slice(0, 4).map((type, index) => {
                const compatTypeData = mbtiTypes.find(t => t.type === type);
                return (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full text-xs text-gray-700 dark:text-gray-200 border border-green-200 dark:border-green-700 flex items-center"
                  >
                    <span className="mr-1">{compatTypeData?.icon}</span>
                    {type}
                  </span>
                );
              })}
            </div>
          </div>
          
          {/* 关系建议 */}
          <div>
            <h3 className="text-sm font-semibold text-pink-700 dark:text-pink-300 mb-2 flex items-center">
              <span className="mr-1">💡</span> 建议
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 bg-pink-50 dark:bg-pink-900 dark:bg-opacity-20 p-2 rounded">
              {advice}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  // 渲染职业发展卡片
  const renderCareerCard = () => {
    if (!personalityAnalysis?.career) return null;

    const { suggestions } = personalityAnalysis.career;

    return (
      <Card title="职业方向" className="mb-4">
        <div>
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
            <span className="mr-1">💼</span> 适合职业
          </h3>
          <div className="flex flex-wrap gap-1">
            {suggestions.slice(0, 6).map((career, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-xs text-gray-700 dark:text-gray-200 border border-blue-200 dark:border-blue-700"
              >
                {career}
              </span>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  // 渲染个人成长卡片
  const renderPersonalGrowthCard = () => {
    if (!personalityAnalysis?.personalGrowth) return null;

    const { tips, potential } = personalityAnalysis.personalGrowth;

    return (
      <Card title="成长建议" className="mb-4">
        <div className="space-y-3">
          {/* 成长潜力 */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center">
              <span className="mr-1">🚀</span> 潜力
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 bg-emerald-50 dark:bg-emerald-900 dark:bg-opacity-20 p-2 rounded">
              {potential}
            </p>
          </div>

          {/* 成长建议 */}
          <div>
            <h3 className="text-sm font-semibold text-lime-700 dark:text-lime-300 mb-2 flex items-center">
              <span className="mr-1">🌱</span> 建议
            </h3>
            <div className="grid grid-cols-1 gap-1">
              {tips.slice(0, 2).map((tip, index) => (
                <div key={index} className="flex items-start bg-lime-50 dark:bg-lime-900 dark:bg-opacity-20 p-2 rounded">
                  <span className="text-lime-600 dark:text-lime-400 mr-1">✓</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // 渲染MBTI选择器
  const renderMBTISelector = () => {
    return (
      <Card title="选择人格类型" className="mb-4">
        <div className="space-y-3">
          <div>
            {/* 当前用户信息 */}
            {userInfo.mbti && (
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded border border-blue-200 dark:border-blue-700">
                <p className="text-blue-700 dark:text-blue-300 text-xs">
                  您的MBTI类型：<span className="font-bold">{userInfo.mbti}</span>
                  {tempMBTI && tempMBTI !== userInfo.mbti && (
                    <span className="ml-1 text-xs">（当前查看：{tempMBTI}）</span>
                  )}
                </p>
              </div>
            )}
            
            {/* 提示文本 */}
            <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
              点击任意MBTI类型查看分析，临时查看不会保存配置
            </div>
            
            {/* MBTI类型网格 */}
            <div className="mb-3">
              <div className="grid grid-cols-8 gap-1">
                {allMBTIs.map((mbti) => {
                  const typeData = mbtiTypes.find(t => t.type === mbti);
                  const isTempSelected = tempMBTI === mbti && tempMBTI !== userInfo.mbti;
                  const isUserConfig = userInfo.mbti === mbti;
                  
                  return (
                    <button
                      key={mbti}
                      onClick={() => handleMBTIChange(mbti)}
                      className={`p-1.5 rounded text-center transition-all duration-200 text-xs font-medium flex flex-col items-center justify-center relative overflow-hidden ${
                        userMBTI === mbti
                          ? 'ring-2 ring-offset-1 shadow-sm transform scale-110'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: userMBTI === mbti ? typeData?.color : undefined,
                        color: userMBTI === mbti ? 'white' : undefined,
                        borderColor: typeData?.color,
                        borderWidth: userMBTI === mbti ? '2px' : '1px'
                      }}
                      title={
                        isUserConfig 
                          ? '您的配置MBTI类型' 
                          : isTempSelected 
                            ? '临时查看的MBTI类型' 
                            : `查看${mbti}类型分析`
                      }
                    >
                      {/* 选中状态的高亮效果 */}
                      {userMBTI === mbti && (
                        <>
                          <span 
                            className="absolute inset-0 rounded animate-pulse opacity-30"
                            style={{ backgroundColor: typeData?.color }}
                          ></span>
                          <span 
                            className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white animate-ping"
                          ></span>
                        </>
                      )}
                      <span className="relative z-10 text-sm mb-0.5">{typeData?.icon}</span>
                      <span className="relative z-10 font-bold">{mbti}</span>
                      {/* 用户配置标记 */}
                      {isUserConfig && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="您的配置"></span>
                      )}
                      {/* 临时查看标记 */}
                      {isTempSelected && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="临时查看"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* 重置按钮 */}
            {tempMBTI && tempMBTI !== userInfo.mbti && (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setUserMBTI(userInfo.mbti);
                    setTempMBTI('');
                    setDataLoaded(false);
                  }}
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  返回您的配置 ({userInfo.mbti})
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      {/* MBTI选择器 */}
      {renderMBTISelector()}

      {/* 加载状态 */}
      {loading && (
        <Card>
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-300 text-xs">正在加载人格分析数据...</p>
          </div>
        </Card>
      )}

      {/* 错误显示 */}
      {error && (
        <Card>
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
        </Card>
      )}

      {/* 人格分析内容 */}
      {!loading && !error && personalityAnalysis && userMBTI && (
        <div className="space-y-3">
          {/* 基本信息卡片 */}
          {renderBasicInfoCard()}
          
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
        <Card>
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
        </Card>
      )}
    </div>
  );
};

export default MBTIPersonalityTabHome;