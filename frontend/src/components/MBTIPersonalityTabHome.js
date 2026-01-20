// @ts-nocheck
import React, { useMemo, useEffect, useState } from 'react';
import { Card } from './PageLayout.js';
import PageLayout from './PageLayout.js';
import { useTheme } from '../context/ThemeContext';
import { mbtiTypes } from '../data/mbtiTypes';
import { useUserConfig } from '../contexts/UserConfigContext';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Generate full personality analysis from MBTI type
 */
const generatePersonalityAnalysis = (mbtiType) => {
  const typeData = mbtiTypes.find(t => t.type === mbtiType);
  if (!typeData) return null;

  // Generate compatible types (similar energy and values)
  const getCompatibleTypes = (type) => {
    const compatibilityMap = {
      'INTJ': ['ENTP', 'INTP', 'ENTJ'],
      'INTP': ['INTJ', 'ENTP', 'INFJ'],
      'ENTJ': ['INTJ', 'ENTP', 'ESTJ'],
      'ENTP': ['INTJ', 'INTP', 'ENTJ'],
      'INFJ': ['ENFP', 'INFP', 'INTJ'],
      'INFP': ['ENFP', 'INFJ', 'ENFJ'],
      'ENFJ': ['INFP', 'ENFP', 'INFJ'],
      'ENFP': ['INFJ', 'INFP', 'ENFJ'],
      'ISTJ': ['ESTJ', 'ISFJ', 'ESFJ'],
      'ISFJ': ['ESFJ', 'ISTJ', 'ISFP'],
      'ESTJ': ['ISTJ', 'ENTJ', 'ESFJ'],
      'ESFJ': ['ISFJ', 'ESTJ', 'ESFP'],
      'ISTP': ['ESTP', 'INTP', 'ISFP'],
      'ISFP': ['ESFP', 'ISTP', 'INFP'],
      'ESTP': ['ISTP', 'ESFP', 'ENTJ'],
      'ESFP': ['ISFP', 'ESTP', 'ENFP'],
    };
    return compatibilityMap[type] || [];
  };

  // Generate incompatible types (opposite traits)
  const getIncompatibleTypes = (type) => {
    const incompatibilityMap = {
      'INTJ': ['ESFP', 'ESTP'],
      'INTP': ['ESFJ', 'ESTJ'],
      'ENTJ': ['ISFP', 'INFP'],
      'ENTP': ['ISFJ', 'ISTJ'],
      'INFJ': ['ESTP', 'ISTP'],
      'INFP': ['ESTJ', 'ENTJ'],
      'ENFJ': ['ISTP', 'INTP'],
      'ENFP': ['ISTJ', 'ESTJ'],
      'ISTJ': ['ENFP', 'ENTP'],
      'ISFJ': ['ENTP', 'ESTP'],
      'ESTJ': ['INFP', 'INTP'],
      'ESFJ': ['INTP', 'ISTP'],
      'ISTP': ['ENFJ', 'ESFJ'],
      'ISFP': ['ENTJ', 'ESTJ'],
      'ESTP': ['INFJ', 'ISFJ'],
      'ESFP': ['INTJ', 'ISTJ'],
    };
    return incompatibilityMap[type] || [];
  };

  // Generate ideal work environments based on type
  const getIdealEnvironments = (type) => {
    const firstLetter = type[0];
    const secondLetter = type[1];
    const thirdLetter = type[2];
    const fourthLetter = type[3];

    const environments = [];

    if (firstLetter === 'I') {
      environments.push('安静独立的工作空间');
    } else {
      environments.push('协作互动的团队环境');
    }

    if (secondLetter === 'N') {
      environments.push('鼓励创新和创意');
    } else {
      environments.push('注重实际和细节');
    }

    if (thirdLetter === 'T') {
      environments.push('逻辑导向的决策流程');
    } else {
      environments.push('重视人际关系和谐');
    }

    if (fourthLetter === 'J') {
      environments.push('结构化和有序的工作流');
    } else {
      environments.push('灵活自由的工作方式');
    }

    return environments;
  };

  // Generate careers to avoid based on weaknesses
  const getAvoidCareers = (type) => {
    const avoidMap = {
      'INTJ': ['销售代表', '客服专员', '社交活动策划'],
      'INTP': ['销售', '市场营销', '人力资源'],
      'ENTJ': ['艺术创作', '社工', '护理'],
      'ENTP': ['会计', '数据录入', '行政助理'],
      'INFJ': ['销售', '高压竞争岗位', '纯技术工作'],
      'INFP': ['销售', '执法', '军事'],
      'ENFJ': ['数据分析', '独立研究', '会计'],
      'ENFP': ['会计', '数据录入', '重复性工作'],
      'ISTJ': ['艺术创作', '即兴表演', '创业'],
      'ISFJ': ['销售', '高压竞争', '频繁变动岗位'],
      'ESTJ': ['艺术', '心理咨询', '创意写作'],
      'ESFJ': ['独立研究', '技术开发', '竞争性销售'],
      'ISTP': ['客服', '教学', '社工'],
      'ISFP': ['管理', '执法', '高压销售'],
      'ESTP': ['研究', '会计', '长期规划'],
      'ESFP': ['会计', '数据分析', '独立研究'],
    };
    return avoidMap[type] || ['高度重复性工作', '与性格特质冲突的岗位'];
  };

  // Split growth tips into multiple actionable items
  const getGrowthTips = (growthTips) => {
    if (!growthTips) return ['持续自我反思', '寻求反馈', '拓展舒适区'];
    const tips = growthTips.split('，').map(tip => tip.trim());
    return tips.length > 0 ? tips : [growthTips];
  };

  // Get famous examples for the MBTI type
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

  return {
    basicInfo: {
      type: typeData.type,
      name: typeData.name,
      description: typeData.description,
      icon: typeData.icon,
      color: typeData.color,
    },
    traits: {
      coreTraits: typeData.tags || typeData.traits?.slice(0, 3) || [],
      strengths: typeData.strengths || [],
      weaknesses: typeData.weaknesses || [],
      growthAreas: getGrowthTips(typeData.growthTips),
    },
    relationships: {
      style: typeData.relationship || '重视真诚和深度的人际连接',
      communication: typeData.communicationStyle || '注重清晰和有效的沟通',
      compatibleTypes: getCompatibleTypes(typeData.type),
      incompatibleTypes: getIncompatibleTypes(typeData.type),
      advice: typeData.relationship || '建立基于相互理解和尊重的关系',
    },
    career: {
      suggestions: typeData.careerAdvice || [],
      idealEnvironments: getIdealEnvironments(typeData.type),
      workStyle: typeData.communicationStyle || '注重效率和成果',
      avoidCareers: getAvoidCareers(typeData.type),
      advice: `${typeData.name}适合从事需要${typeData.traits?.[0] || '专注'}和${typeData.traits?.[1] || '创新'}的工作`,
    },
    personalGrowth: {
      tips: getGrowthTips(typeData.growthTips),
      developmentAreas: typeData.weaknesses?.slice(0, 2) || ['自我认知', '情绪管理'],
      potential: typeData.summary || '具有独特的个人潜力和发展空间',
      mindfulness: typeData.motto || '保持真实的自我',
    },
    famousExamples: getFamousExamples(typeData.type),
  };
};

/**
 * MBTI Personality Tab – compact mobile‑first redesign.
 * The component receives `personalityAnalysis` (full MBTI data) and
 * `userMBTI` (the user's four‑letter type, e.g. "INTJ").
 * All sections are rendered with tight padding, unified 11‑12px typography
 * and responsive 2‑column grids to avoid vertical squeezing.
 * 
 * Can also work as a standalone page by reading MBTI type from URL params or location state.
 */
const MBTIPersonalityTabHome = ({ personalityAnalysis: propPersonalityAnalysis, userMBTI: propUserMBTI, isTab = false }) => {
  const { themeColors } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentConfig } = useUserConfig();
  const [loading, setLoading] = useState(!propPersonalityAnalysis);

  // Determine MBTI type from props, URL params, location state, or user config
  const mbtiType = useMemo(() => {
    // Priority 1: Props (when used as a component)
    if (propUserMBTI) return propUserMBTI;

    // Priority 2: URL query parameter
    const urlMbti = searchParams.get('mbti');
    if (urlMbti) return urlMbti.toUpperCase();

    // Priority 3: Location state (from navigation)
    if (location.state?.mbtiType) return location.state.mbtiType.toUpperCase();

    // Priority 4: User config
    if (currentConfig?.mbti) return currentConfig.mbti.toUpperCase();

    return null;
  }, [propUserMBTI, searchParams, location.state, currentConfig]);

  // Generate personality analysis if not provided via props
  const personalityAnalysis = useMemo(() => {
    if (propPersonalityAnalysis) return propPersonalityAnalysis;
    if (!mbtiType) return null;
    return generatePersonalityAnalysis(mbtiType);
  }, [propPersonalityAnalysis, mbtiType]);

  const userMBTI = mbtiType;

  // Handle MBTI type selection
  const handleMBTISelect = (type) => {
    if (type === userMBTI) return;
    // 使用 setSearchParams 静默更新 URL，不触发全页刷新
    setSearchParams({ mbti: type }, { replace: true });
  };

  // Only run initial loading for standalone page access
  useEffect(() => {
    if (propPersonalityAnalysis) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [propPersonalityAnalysis]);

  // Show loading state
  if (loading || !personalityAnalysis || !userMBTI) {
    return (
      <div className={`flex items-center justify-center ${isTab ? 'h-40 bg-transparent' : 'min-h-screen bg-white dark:bg-gray-900'}`}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider">正在加载分析...</p>
        </div>
      </div>
    );
  }

  // ---------- MBTI Selector Component ---------- //
  const renderMBTISelector = () => {
    const allTypes = mbtiTypes.map(t => t.type);
    const userDefaultMBTI = currentConfig?.mbti?.toUpperCase();

    return (
      <Card title="类型快速浏览" className="mb-3">
        <div className="p-1.5">
          <div className="grid grid-cols-4 gap-1.5">
            {allTypes.map((type) => {
              const typeData = mbtiTypes.find(t => t.type === type);
              const isSelected = type === userMBTI;
              const isUserDefault = type === userDefaultMBTI;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleMBTISelect(type)}
                  className={`
                    relative py-1.5 rounded-lg transition-all duration-200
                    flex flex-col items-center justify-center
                    ${isSelected
                      ? 'shadow-sm scale-[1.02] z-10'
                      : 'bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700/60 border border-transparent'
                    }
                  `}
                  style={{
                    background: isSelected ? typeData.bgGradient : undefined,
                    boxShadow: isSelected ? `0 4px 12px ${typeData.color}40` : undefined,
                  }}
                >
                  <span className={`text-xs ${isSelected ? 'scale-110 mb-0.5' : 'opacity-70 mb-0'}`}>
                    {typeData.icon}
                  </span>
                  <span className={`
                    text-[9px] font-black uppercase tracking-tighter
                    ${isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'}
                  `}>
                    {type}
                  </span>

                  {/* Default indicator dot */}
                  {isUserDefault && (
                    <div className={`
                      absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white dark:border-gray-800
                      ${isSelected ? 'bg-white' : 'bg-green-500'}
                    `} />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-2 px-1 flex justify-between items-center text-[9px] text-gray-400 dark:text-gray-500 italic">
            <span>点击图标切换维度</span>
            {userDefaultMBTI && (
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                标记为默认: {userDefaultMBTI}
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // ---------- Helper Render Functions ---------- //
  const renderHeader = () => {
    if (!personalityAnalysis?.basicInfo) return null;
    const { type, name, description, icon, color } = personalityAnalysis.basicInfo;
    const typeData = mbtiTypes.find(t => t.type === type);
    return (
      <Card className="mb-3">
        <div className="flex items-center p-2.5 bg-white dark:bg-gray-800 rounded-xl">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl shadow"
            style={{ background: typeData?.bgGradient || color }}
          >
            {icon}
          </div>
          <div className="ml-3 flex-1">
            <h1 className="text-base font-bold text-gray-800 dark:text-white">
              {type} - {name}
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300">{description}</p>
            {/* Core traits tags */}
            <div className="mt-1 flex flex-wrap gap-1">
              {personalityAnalysis.traits.coreTraits.map((trait, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded-sm text-[10px] font-medium text-white"
                  style={{ backgroundColor: color }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderTendencyMap = () => {
    if (!userMBTI) return null;
    const dimensions = [
      { key: 'E_I', left: '内向', leftCode: 'I', right: '外向', rightCode: 'E' },
      { key: 'S_N', left: '感觉', leftCode: 'S', right: '直觉', rightCode: 'N' },
      { key: 'T_F', left: '思维', leftCode: 'T', right: '情感', rightCode: 'F' },
      { key: 'J_P', left: '判断', leftCode: 'J', right: '感知', rightCode: 'P' },
    ];
    return (
      <Card title="核心倾向坐标维度" className="mb-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-2.5">
          {dimensions.map((dim, idx) => {
            const isRight = userMBTI.includes(dim.rightCode);
            return (
              <div key={idx} className="relative py-1">
                <div className="flex justify-between items-center mb-0.5 px-0.5">
                  <div className={`flex flex-col items-center ${!isRight ? 'opacity-100' : 'opacity-30'}`}>
                    <span className="text-[8px] uppercase font-black text-indigo-500">{dim.leftCode}</span>
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{dim.left}</span>
                  </div>
                  <div className={`flex flex-col items-center ${isRight ? 'opacity-100' : 'opacity-30'}`}>
                    <span className="text-[8px] uppercase font-black text-indigo-500">{dim.rightCode}</span>
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{dim.right}</span>
                  </div>
                </div>
                <div className="relative h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-300 dark:bg-gray-600 z-10" />
                  <div
                    className={`absolute top-0 bottom-0 transition-all duration-500 ease-out ${isRight
                      ? 'right-0 left-1/2 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-r-full'
                      : 'left-0 right-1/2 bg-gradient-to-l from-indigo-400 to-indigo-600 rounded-l-full'
                      }`}
                  />
                </div>
                <div
                  className="absolute top-[18px] w-2.5 h-2.5 rounded-full bg-white dark:bg-indigo-300 shadow-sm border border-indigo-500"
                  style={{ left: isRight ? '75%' : '25%', transform: 'translateX(-50%)' }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-[10px] text-gray-400 dark:text-gray-400 italic text-center">
            基于人格维度的动态平衡，呈现出独一无二的性格能量分布
          </p>
        </div>
      </Card>
    );
  };

  const renderTraitsCard = () => {
    if (!personalityAnalysis?.traits) return null;
    const { strengths, weaknesses, growthAreas } = personalityAnalysis.traits;
    return (
      <Card title="特质分析" className="mb-3">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Strengths */}
          <div className="p-2.5 border-l-4 border-green-500 bg-green-50/30 rounded">
            <h3 className="text-xs font-bold text-green-800 mb-1 flex items-center">
              <span className="mr-1 text-[9px]">✅</span>优势
            </h3>
            <ul className="space-y-1">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start text-[10px] text-gray-700 dark:text-gray-200">
                  <span className="w-1 h-1 bg-green-500 rounded-full mt-0.5 mr-1 flex-shrink-0" />{s}
                </li>
              ))}
            </ul>
          </div>
          {/* Growth */}
          <div className="p-2.5 border-l-4 border-blue-500 bg-blue-50/30 rounded">
            <h3 className="text-xs font-bold text-blue-800 mb-1 flex items-center">
              <span className="mr-1 text-[9px]">📈</span>成长建议
            </h3>
            <ul className="space-y-1">
              {growthAreas.map((g, i) => (
                <li key={i} className="flex items-start text-[10px] text-gray-700 dark:text-gray-200">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-0.5 mr-1 flex-shrink-0" />{g}
                </li>
              ))}
            </ul>
          </div>
          {/* Weaknesses */}
          <div className="p-2.5 border-l-4 border-amber-500 bg-amber-50/30 rounded">
            <h3 className="text-xs font-bold text-amber-800 mb-1 flex items-center">
              <span className="mr-1 text-[9px]">⚠️</span>需要注意
            </h3>
            <ul className="space-y-1">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start text-[10px] text-gray-700 dark:text-gray-200">
                  <span className="w-1 h-1 bg-amber-500 rounded-full mt-0.5 mr-1 flex-shrink-0" />{w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    );
  };

  const renderRelationshipsCard = () => {
    if (!personalityAnalysis?.relationships) return null;
    const { style, communication, compatibleTypes, incompatibleTypes, advice } = personalityAnalysis.relationships;
    return (
      <Card title="人际关系" className="mb-3">
        <div className="space-y-2.5 p-2.5">
          <div>
            <h4 className="text-xs font-bold text-purple-800 mb-1">关系风格</h4>
            <p className="text-[10px] text-gray-600 dark:text-gray-300">{style}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-purple-800 mb-1">沟通方式</h4>
            <p className="text-[10px] text-gray-600 dark:text-gray-300">{communication}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h4 className="text-xs font-bold text-green-800 mb-1">兼容类型</h4>
              <div className="flex flex-wrap gap-1">
                {compatibleTypes.map((t, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-800 mb-1">需要磨合的类型</h4>
              <div className="flex flex-wrap gap-1">
                {incompatibleTypes.map((t, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-200">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-violet-800 mb-1">建议</h4>
            <p className="text-[10px] text-gray-600 dark:text-gray-300 bg-violet-50 dark:bg-violet-900/20 p-2 rounded">{advice}</p>
          </div>
        </div>
      </Card>
    );
  };

  const renderCareerCard = () => {
    if (!personalityAnalysis?.career) return null;
    const { suggestions, idealEnvironments, workStyle, avoidCareers, advice } = personalityAnalysis.career;
    return (
      <Card title="职业发展" className="mb-3">
        <div className="space-y-2.5 p-2.5">
          <div>
            <h4 className="text-xs font-bold text-blue-800 mb-1 flex items-center">
              <span className="mr-1 text-[9px]">💼</span>适合职业
            </h4>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((c, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-[9px] text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-800/30">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h4 className="text-xs font-bold text-teal-800 mb-1 flex items-center">
                <span className="mr-1 text-[9px]">🏢</span>理想工作环境
              </h4>
              <ul className="space-y-1">
                {idealEnvironments.map((e, i) => (
                  <li key={i} className="flex items-start text-[10px] text-gray-600 dark:text-gray-300">
                    <span className="w-1 h-1 bg-teal-500 rounded-full mt-0.5 mr-1 flex-shrink-0" />{e}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-cyan-800 mb-1 flex items-center">
                <span className="mr-1 text-[9px]">⚡</span>工作风格
              </h4>
              <p className="text-[10px] text-gray-600 dark:text-gray-300 bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded border border-cyan-100 dark:border-cyan-800/30">
                {workStyle}
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-800 mb-1 flex items-center">
              <span className="mr-1 text-[9px]">🚫</span>需要谨慎的职业
            </h4>
            <div className="flex flex-wrap gap-1">
              {avoidCareers.map((c, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-[9px] text-amber-800 dark:text-amber-200 border border-amber-100 dark:border-amber-800/30">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-violet-800 mb-1 flex items-center">
              <span className="mr-1 text-[9px]">🎯</span>发展建议
            </h4>
            <p className="text-[10px] text-gray-600 dark:text-gray-300 bg-violet-50 dark:bg-violet-900/20 p-2 rounded border border-violet-100 dark:border-violet-800/30">
              {advice}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  const renderPersonalGrowthCard = () => {
    if (!personalityAnalysis?.personalGrowth) return null;
    const { tips, developmentAreas, potential, mindfulness } = personalityAnalysis.personalGrowth;
    return (
      <Card title="个人成长" className="mb-3">
        <div className="space-y-2.5 p-2.5">
          <div>
            <h4 className="text-xs font-bold text-emerald-800 mb-1 flex items-center">
              <span className="mr-1 text-[9px]">🚀</span>成长潜力
            </h4>
            <p className="text-[10px] text-gray-600 dark:text-gray-300 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded border border-emerald-100 dark:border-emerald-800/30">
              {potential}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-lime-800 mb-1 flex items-center">
              <span className="mr-1 text-[9px]">🌱</span>具体建议
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {tips.map((t, i) => (
                <div key={i} className="flex items-start bg-lime-50/30 dark:bg-lime-900/10 p-2 rounded border border-lime-100 dark:border-lime-800/20">
                  <span className="w-1 h-1 bg-lime-500 rounded-full mt-0.5 mr-1 flex-shrink-0" />
                  <span className="text-[10px] text-gray-600 dark:text-gray-300">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-rose-800 mb-1 flex items-center">
              <span className="mr-1 text-[9px]">🧘</span>自我觉察
            </h4>
            <p className="text-[10px] text-gray-600 dark:text-gray-300 bg-rose-50 dark:bg-rose-900/20 p-2 rounded border border-rose-100 dark:border-rose-800/30">
              {mindfulness}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  const renderFamousExamples = () => {
    if (!personalityAnalysis?.famousExamples) return null;
    return (
      <Card title="代表人物" className="mb-3">
        <div className="p-2.5">
          <div className="flex flex-wrap gap-2 justify-center">
            {personalityAnalysis.famousExamples.map((name, i) => (
              <div key={i} className="px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                <span className="mr-1">✨</span>{name}
              </div>
            ))}
          </div>
          <p className="text-[9px] text-gray-400 dark:text-gray-500 text-center mt-2 italic">
            这些成功人士向我们展示了该人格类型的独特魅力与潜能
          </p>
        </div>
      </Card>
    );
  };

  // ---------- Main Render ---------- //
  const content = (
    <div className={`space-y-3 ${isTab ? 'pb-6' : ''}`}>
      {renderHeader()}
      {renderMBTISelector()}
      {renderFamousExamples()}
      {renderTendencyMap()}
      {renderTraitsCard()}
      {renderRelationshipsCard()}
      {renderCareerCard()}
      {renderPersonalGrowthCard()}
    </div>
  );

  // If used as a standalone page (no propPersonalityAnalysis), wrap in PageLayout
  // Exception: if isTab is true, don't wrap in PageLayout
  if (!propPersonalityAnalysis && !isTab) {
    return (
      <PageLayout
        title={`${userMBTI} 人格详解`}
        showBackButton={false}
      >
        {content}
      </PageLayout>
    );
  }

  return content;
};

export default MBTIPersonalityTabHome;