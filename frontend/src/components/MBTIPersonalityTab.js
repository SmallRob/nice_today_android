import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCurrentConfig, useUserConfig } from '../contexts/UserConfigContext';
import { Card } from './PageLayout.js';
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

const MBTIPersonalityTab = () => {
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
  const [comparisonType, setComparisonType] = useState(''); // 用于比较的类型

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
  const loadPersonalityAnalysis = useCallback(async (mbtiType) => {
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
        },
        famousExamples: {
          examples: getFamousExamples(mbtiType),
          inspiration: `这些名人展示了${typeData.name}类型的潜力和多样性`
        }
      };
      
      setPersonalityAnalysis(analysisData);
    } catch (error) {
      console.error('加载MBTI分析失败:', error);
      setError(error.message || '加载分析数据失败');
    } finally {
      setLoading(false);
    }
  }, [mbtiTypes]);

  // 获取名人示例
  const getFamousExamples = (type) => {
    const examplesMap = {
      'ISTJ': ['乔治·华盛顿', '安格拉·默克尔', '娜塔莉·波特曼'],
      'ISFJ': ['特蕾莎修女', '凯特·米德尔顿', '碧昂丝'],
      'INFJ': ['马丁·路德·金', '纳尔逊·曼德拉', 'Lady Gaga'],
      'INTJ': ['艾萨克·牛顿', '埃隆·马斯克', '克里斯托弗·诺兰'],
      'ISTP': ['克林特·伊斯特伍德', '汤姆·克鲁斯', '贝尔·格里尔斯'],
      'ISFP': ['迈克尔·杰克逊', '费雯·丽', '王菲'],
      'INFP': ['威廉·莎士比亚', 'J·K·罗琳', '约翰·列侬'],
      'INTP': ['阿尔伯特·爱因斯坦', '查尔斯·达尔文', '比尔·盖茨'],
      'ESTP': ['唐纳德·特朗普', '麦当娜', '成龙'],
      'ESFP': ['玛丽莲·梦露', '贾斯汀·汀布莱克', '泰勒·斯威夫特'],
      'ENFP': ['罗宾·威廉姆斯', '威尔·史密斯', '奥普拉·温弗瑞'],
      'ENTP': ['马克·吐温', '理查德·费曼', '史蒂夫·乔布斯'],
      'ESTJ': ['乔治·巴顿', '露西尔·鲍尔', '詹姆斯·门罗'],
      'ESFJ': ['比尔·克林顿', '泰勒·斯威夫特', '戴安娜王妃'],
      'ENFJ': ['巴拉克·奥巴马', '奥普拉·温弗瑞', '约翰·F·肯尼迪'],
      'ENTJ': ['玛格丽特·撒切尔', '史蒂夫·乔布斯', '戈登·拉姆齐']
    };
    
    return examplesMap[type] || ['知名人士', '成功人士', '行业领袖'];
  };

  // 使用新的配置上下文
  const { currentConfig, isLoading: configLoading, error: configError } = useCurrentConfig();

  // 初始化组件
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        // 加载所有MBTI类型
        setAllMBTIs(mbtiList);
        
        if (!isMounted) return;
        
        // 从用户配置上下文获取用户信息
        if (currentConfig && isMounted) {
          setUserInfo({
            nickname: currentConfig.nickname || '',
            birthDate: currentConfig.birthDate || '',
            mbti: currentConfig.mbti || ''
          });
          
          // 优先使用用户配置中的MBTI信息
          if (currentConfig.mbti) {
            setUserMBTI(currentConfig.mbti);
          }
        }
        
        if (isMounted) {
          setInitialized(true);
        }
      } catch (error) {
        console.error('初始化MBTI组件失败:', error);
        
        // 降级处理
        setAllMBTIs(mbtiList);
        if (isMounted) {
          setInitialized(true);
        }
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
    };
  }, [mbtiList, currentConfig]);

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
  }, [userMBTI, loadPersonalityAnalysis, initialized, dataLoaded]);

  // 处理MBTI类型选择 - 仅更新状态，不保存配置
  const handleMBTIChange = (mbti) => {
    if (userMBTI !== mbti) {
      setUserMBTI(mbti);
      // 标记需要重新加载数据
      setDataLoaded(false);
    }
  };

  // 处理比较类型选择
  const handleComparisonChange = (mbti) => {
    setComparisonType(mbti);
  };

  // 渲染MBTI基本信息卡片
  const renderBasicInfoCard = () => {
    if (!personalityAnalysis?.basicInfo) return null;

    const { type, name, description, icon, color } = personalityAnalysis.basicInfo;
    const typeData = mbtiTypes.find(t => t.type === type);

    return (
      <Card className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* 图标和类型 */}
            <div 
              className="flex-shrink-0 w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg"
              style={{ background: typeData?.bgGradient || color }}
            >
              {icon}
            </div>
            
            {/* 基本信息 */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {type} - {name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-white">{description}</p>
              </div>
              
              {/* 核心特质标签 */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">
                  核心特质
                </h3>
                <div className="flex flex-wrap gap-2">
                  {personalityAnalysis.traits.coreTraits.map((trait, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
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

    const { strengths, weaknesses, growthAreas } = personalityAnalysis.traits;
    const typeData = mbtiTypes.find(t => t.type === userMBTI);

    return (
      <Card title="特质分析" className="mb-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* 优势 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-xl border border-green-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center">
              <span className="mr-2">✅</span> 优势
            </h3>
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 dark:text-white">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 成长领域 */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-xl border border-blue-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
              <span className="mr-2">📈</span> 成长建议
            </h3>
            <ul className="space-y-3">
              {growthAreas.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 dark:text-white">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 需要注意 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-xl border border-amber-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-4 flex items-center">
              <span className="mr-2">⚠️</span> 需要注意
            </h3>
            <ul className="space-y-3">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 dark:text-white">{weakness}</span>
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

    const { style, communication, compatibleTypes, incompatibleTypes, advice } = personalityAnalysis.relationships;

    return (
      <Card title="人际关系" className="mb-6">
        <div className="space-y-6">
          {/* 关系风格 */}
          <div>
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center">
              <span className="mr-2">💞</span> 关系风格
            </h3>
            <p className="text-gray-700 dark:text-white bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 p-4 rounded-lg">
              {style}
            </p>
          </div>

          {/* 沟通方式 */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
              <span className="mr-2">💬</span> 沟通方式
            </h3>
            <p className="text-gray-700 dark:text-white bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-20 p-4 rounded-lg">
              {communication}
            </p>
          </div>

          {/* 类型兼容性 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center">
                <span className="mr-2">🤝</span> 兼容类型
              </h3>
              <div className="flex flex-wrap gap-2">
                {compatibleTypes.map((type, index) => {
                  const typeData = mbtiTypes.find(t => t.type === type);
                  return (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full text-sm text-gray-700 dark:text-white border border-green-200 dark:border-green-700 flex items-center"
                    >
                      <span className="mr-1">{typeData?.icon}</span>
                      {type}
                    </span>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center">
                <span className="mr-2">⚠️</span> 需要磨合的类型
              </h3>
              <div className="flex flex-wrap gap-2">
                {incompatibleTypes.map((type, index) => {
                  const typeData = mbtiTypes.find(t => t.type === type);
                  return (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900 rounded-full text-sm text-gray-700 dark:text-white border border-red-200 dark:border-red-700 flex items-center"
                    >
                      <span className="mr-1">{typeData?.icon}</span>
                      {type}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 关系建议 */}
          <div>
            <h3 className="text-lg font-semibold text-pink-700 dark:text-pink-300 mb-3 flex items-center">
              <span className="mr-2">💡</span> 关系建议
            </h3>
            <p className="text-gray-700 dark:text-white bg-pink-50 dark:bg-pink-900 dark:bg-opacity-20 p-4 rounded-lg">
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

    const { suggestions, idealEnvironments, workStyle, avoidCareers, advice } = personalityAnalysis.career;

    return (
      <Card title="职业发展" className="mb-6">
        <div className="space-y-6">
          {/* 职业建议 */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center">
              <span className="mr-2">💼</span> 适合职业
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((career, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-full text-sm text-gray-700 dark:text-white border border-blue-200 dark:border-blue-700"
                >
                  {career}
                </span>
              ))}
            </div>
          </div>

          {/* 工作环境和风格 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-3 flex items-center">
                <span className="mr-2">🏢</span> 理想工作环境
              </h3>
              <ul className="space-y-2">
                {idealEnvironments.map((env, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700 dark:text-white">{env}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-cyan-700 dark:text-cyan-300 mb-3 flex items-center">
                <span className="mr-2">⚡</span> 工作风格
              </h3>
              <p className="text-gray-700 dark:text-white bg-cyan-50 dark:bg-cyan-900 dark:bg-opacity-20 p-4 rounded-lg">
                {workStyle}
              </p>
            </div>
          </div>

          {/* 需要避免的职业 */}
          <div>
            <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300 mb-3 flex items-center">
              <span className="mr-2">🚫</span> 需要谨慎的职业
            </h3>
            <div className="flex flex-wrap gap-2">
              {avoidCareers.map((career, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-amber-100 dark:bg-amber-900 rounded-full text-sm text-gray-700 dark:text-white border border-amber-200 dark:border-amber-700"
                >
                  {career}
                </span>
              ))}
            </div>
          </div>

          {/* 职业建议 */}
          <div>
            <h3 className="text-lg font-semibold text-violet-700 dark:text-violet-300 mb-3 flex items-center">
              <span className="mr-2">🎯</span> 职业发展建议
            </h3>
            <p className="text-gray-700 dark:text-white bg-violet-50 dark:bg-violet-900 dark:bg-opacity-20 p-4 rounded-lg">
              {advice}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  // 渲染个人成长卡片
  const renderPersonalGrowthCard = () => {
    if (!personalityAnalysis?.personalGrowth) return null;

    const { tips, developmentAreas, potential, mindfulness } = personalityAnalysis.personalGrowth;

    return (
      <Card title="个人成长" className="mb-6">
        <div className="space-y-6">
          {/* 成长潜力 */}
          <div>
            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center">
              <span className="mr-2">🚀</span> 成长潜力
            </h3>
            <p className="text-gray-700 dark:text-white bg-emerald-50 dark:bg-emerald-900 dark:bg-opacity-20 p-4 rounded-lg">
              {potential}
            </p>
          </div>

          {/* 成长建议 */}
          <div>
            <h3 className="text-lg font-semibold text-lime-700 dark:text-lime-300 mb-3 flex items-center">
              <span className="mr-2">🌱</span> 具体成长建议
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start bg-lime-50 dark:bg-lime-900 dark:bg-opacity-20 p-3 rounded-lg">
                  <span className="text-lime-600 dark:text-lime-400 mr-2">✓</span>
                  <span className="text-gray-700 dark:text-white">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 需要注意的领域 */}
          <div>
            <h3 className="text-lg font-semibold text-rose-700 dark:text-rose-300 mb-3 flex items-center">
              <span className="mr-2">🧘</span> 自我觉察
            </h3>
            <p className="text-gray-700 dark:text-white bg-rose-50 dark:bg-rose-900 dark:bg-opacity-20 p-4 rounded-lg">
              {mindfulness}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  // 渲染名人示例卡片
  const renderFamousExamplesCard = () => {
    if (!personalityAnalysis?.famousExamples) return null;

    const { examples, inspiration } = personalityAnalysis.famousExamples;
    const typeData = mbtiTypes.find(t => t.type === userMBTI);

    return (
      <Card title="知名人物" className="mb-6">
        <div className="space-y-6">
          {/* 名人列表 */}
          <div>
            <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300 mb-4 flex items-center">
              <span className="mr-2">⭐</span> {typeData?.name}类型的知名人物
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {examples.map((person, index) => (
                <div key={index} className="bg-amber-50 dark:bg-amber-900 dark:bg-opacity-20 p-4 rounded-lg border border-amber-100 dark:border-amber-800">
                  <div className="font-medium text-amber-800 dark:text-amber-300 mb-1">{person}</div>
                  <div className="text-sm text-gray-600 dark:text-white">代表性{typeData?.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 启发 */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 mb-3 flex items-center">
              <span className="mr-2">💫</span> 启发
            </h3>
            <p className="text-gray-700 dark:text-white bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 p-4 rounded-lg">
              {inspiration}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  // 渲染MBTI选择器
  const renderMBTISelector = () => {
    return (
      <Card title="MBTI类型选择" className="mb-6">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-white mb-4">
              您可以从用户配置中读取MBTI类型，也可以临时选择其他类型进行查询。临时选择不会保存到配置中。
            </p>
            
            {/* 当前用户信息 */}
            {userInfo.mbti && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  您的用户配置中设置的MBTI类型是：<span className="font-bold">{userInfo.mbti}</span>
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                  💡 如需永久修改MBTI类型，请在用户设置页面进行配置
                </p>
              </div>
            )}
            
            {/* MBTI类型网格 */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-3">
                选择要分析的MBTI类型：
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {allMBTIs.map((mbti) => {
                  const typeData = mbtiTypes.find(t => t.type === mbti);
                  return (
                    <button
                      key={mbti}
                      onClick={() => handleMBTIChange(mbti)}
                      className={`p-2 rounded-lg text-center transition-all duration-200 text-xs font-medium flex flex-col items-center justify-center ${
                        userMBTI === mbti
                          ? 'ring-2 ring-offset-1'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      style={{
                        backgroundColor: userMBTI === mbti ? typeData?.color : undefined,
                        color: userMBTI === mbti ? 'white' : undefined,
                        borderColor: typeData?.color
                      }}
                    >
                      <span className="text-base mb-1">{typeData?.icon}</span>
                      <span>{mbti}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* 当前选择显示 */}
            {userMBTI && (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      当前分析类型：<span className="font-bold">{userMBTI}</span>
                      {userMBTI === userInfo.mbti && (
                        <span className="ml-2 text-green-600 dark:text-green-400">（来自用户配置）</span>
                      )}
                    </p>
                    <p className="text-purple-600 dark:text-purple-400 text-xs mt-1">
                      💡 临时选择仅用于本次查询，不会保存配置
                    </p>
                  </div>
                  <div className="text-right">
                    {userMBTI !== userInfo.mbti && userInfo.mbti && (
                      <button
                        onClick={() => handleMBTIChange(userInfo.mbti)}
                        className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                      >
                        恢复用户配置
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 类型比较选择器 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-3">
              选择要比较的MBTI类型（可选）：
            </h3>
            <div className="flex flex-wrap gap-2">
              {allMBTIs
                .filter(mbti => mbti !== userMBTI)
                .slice(0, 8)
                .map((mbti) => {
                  const typeData = mbtiTypes.find(t => t.type === mbti);
                  return (
                    <button
                      key={mbti}
                      onClick={() => handleComparisonChange(mbti === comparisonType ? '' : mbti)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        comparisonType === mbti
                          ? 'ring-2 ring-offset-1'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      style={{
                        backgroundColor: comparisonType === mbti ? typeData?.color : undefined,
                        color: comparisonType === mbti ? 'white' : undefined
                      }}
                    >
                      <span className="mr-1">{typeData?.icon}</span>
                      {mbti}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // 渲染类型比较卡片
  const renderComparisonCard = () => {
    if (!comparisonType || !personalityAnalysis) return null;
    
    const currentTypeData = mbtiTypes.find(t => t.type === userMBTI);
    const compareTypeData = mbtiTypes.find(t => t.type === comparisonType);
    
    if (!currentTypeData || !compareTypeData) return null;
    
    // 找到共同优势和差异
    const commonStrengths = currentTypeData.strengths.filter(strength => 
      compareTypeData.strengths.includes(strength)
    ).slice(0, 3);
    
    const uniqueStrengths = currentTypeData.strengths.filter(strength => 
      !compareTypeData.strengths.includes(strength)
    ).slice(0, 3);
    
    const compareUniqueStrengths = compareTypeData.strengths.filter(strength => 
      !currentTypeData.strengths.includes(strength)
    ).slice(0, 3);
    
    return (
      <Card title={`类型比较：${userMBTI} vs ${comparisonType}`} className="mb-6">
        <div className="space-y-6">
          {/* 类型基本信息比较 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${currentTypeData.color}20`, border: `1px solid ${currentTypeData.color}` }}>
              <div className="text-3xl mb-2">{currentTypeData.icon}</div>
              <h3 className="text-xl font-bold mb-1" style={{ color: currentTypeData.color }}>{currentTypeData.type}</h3>
              <p className="text-sm text-gray-600 dark:text-white">{currentTypeData.name}</p>
              <p className="text-xs text-gray-500 dark:text-white mt-2">{currentTypeData.description}</p>
            </div>
            
            <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${compareTypeData.color}20`, border: `1px solid ${compareTypeData.color}` }}>
              <div className="text-3xl mb-2">{compareTypeData.icon}</div>
              <h3 className="text-xl font-bold mb-1" style={{ color: compareTypeData.color }}>{compareTypeData.type}</h3>
              <p className="text-sm text-gray-600 dark:text-white">{compareTypeData.name}</p>
              <p className="text-xs text-gray-500 dark:text-white mt-2">{compareTypeData.description}</p>
            </div>
          </div>
          
          {/* 共同优势 */}
          {commonStrengths.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">
                🤝 共同优势
              </h3>
              <div className="flex flex-wrap gap-2">
                {commonStrengths.map((strength, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-green-100 dark:bg-green-900 rounded-full text-sm text-gray-700 dark:text-white"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* 独特优势比较 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: currentTypeData.color }}>
                {currentTypeData.type} 的独特优势
              </h3>
              <ul className="space-y-2">
                {uniqueStrengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: currentTypeData.color }}></span>
                    <span className="text-gray-700 dark:text-white">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: compareTypeData.color }}>
                {compareTypeData.type} 的独特优势
              </h3>
              <ul className="space-y-2">
                {compareUniqueStrengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: compareTypeData.color }}></span>
                    <span className="text-gray-700 dark:text-white">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* 比较建议 */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-white">
              <span className="font-semibold" style={{ color: currentTypeData.color }}>{currentTypeData.type}</span> 和 
              <span className="font-semibold" style={{ color: compareTypeData.color }}> {compareTypeData.type}</span> 
              在沟通和合作时可以相互学习。{currentTypeData.type}可以向{compareTypeData.type}学习{compareUniqueStrengths[0] || '不同的优势'}，而{compareTypeData.type}则可以借鉴{currentTypeData.type}的{uniqueStrengths[0] || '独特优势'}。
            </p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* 标题区域 */}
      <Card>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            🧠 MBTI 16型人格解析
          </h1>
          <p className="text-sm text-gray-600 dark:text-white max-w-2xl mx-auto">
            深入了解16种人格类型的特质、优势、职业发展和人际关系建议。
            人格类型不是限制，而是了解自我和他人、促进个人成长的工具。
          </p>
        </div>
      </Card>

      {/* MBTI选择器 */}
      {renderMBTISelector()}

      {/* 加载状态 */}
      {loading && (
        <Card>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-white text-sm">正在加载人格分析数据...</p>
          </div>
        </Card>
      )}

      {/* 错误显示 */}
      {error && (
        <Card>
          <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setDataLoaded(false);
              }}
              className="mt-2 text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
            >
              重试
            </button>
          </div>
        </Card>
      )}

      {/* 人格分析内容 */}
      {!loading && !error && personalityAnalysis && userMBTI && (
        <div className="space-y-6">
          {/* 类型比较卡片 */}
          {comparisonType && renderComparisonCard()}
          
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
          
          {/* 名人示例卡片 */}
          {renderFamousExamplesCard()}
          
          {/* 底部信息 */}
          <Card>
            <div className="text-center text-gray-500 dark:text-white text-xs">
              <p className="mb-2">MBTI®是Myers-Briggs Type Indicator的注册商标，本页面内容仅供学习和参考使用。</p>
              <p>人格类型理论帮助我们理解个体差异，但每个人都是独特且不断发展变化的。</p>
              <p className="mt-2">数据更新时间：{new Date().toLocaleString()}</p>
            </div>
          </Card>
        </div>
      )}

      {/* 未选择MBTI时的提示 */}
      {!loading && !error && !userMBTI && (
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🧩</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-3">请选择MBTI类型</h3>
            <p className="text-gray-500 dark:text-white text-sm max-w-md mx-auto mb-6">
              从上方选择一种MBTI类型，开始探索人格特质、优势和发展建议
            </p>
            <div className="inline-flex flex-wrap gap-2 justify-center">
              {mbtiList.slice(0, 4).map(mbti => {
                const typeData = mbtiTypes.find(t => t.type === mbti);
                return (
                  <button
                    key={mbti}
                    onClick={() => handleMBTIChange(mbti)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow"
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

export default MBTIPersonalityTab;