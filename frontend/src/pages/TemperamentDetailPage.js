/**
 * 气质详情页面
 * 显示用户的气质类型详细信息
 */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { userConfig } from '../utils/index.js';

// 气质类型映射
const TEMPERAMENT_TYPES = {
  choleric: { 
    name: '胆汁质', 
    description: '热情、外向、精力旺盛、情绪易激动', 
    color: 'from-red-500 to-red-600',
    traits: [
      '精力旺盛，热情直率',
      '脾气急躁，容易冲动',
      '情绪体验强烈，爆发迅速',
      '反应速度快，但不灵活',
      '意志坚强，果敢决断',
      '但有时粗心、鲁莽'
    ],
    strengths: [
      '行动力强',
      '领导能力突出',
      '决策果断',
      '勇于挑战'
    ],
    challenges: [
      '情绪控制能力较弱',
      '容易急躁',
      '缺乏耐心',
      '有时过于冲动'
    ],
    career: '适合需要快速决策和领导能力的职业，如管理者、销售、应急处理等'
  },
  sanguine: { 
    name: '多血质', 
    description: '活泼、外向、善于交际、适应性强', 
    color: 'from-yellow-500 to-orange-500',
    traits: [
      '活泼好动，反应迅速',
      '喜欢与人交往，善于交际',
      '兴趣广泛但不稳定',
      '情绪发生快而多变',
      '思维灵活，但有时粗心',
      '适应环境能力强'
    ],
    strengths: [
      '社交能力强',
      '适应性强',
      '乐观开朗',
      '思维灵活'
    ],
    challenges: [
      '注意力易分散',
      '兴趣变化快',
      '缺乏持久性',
      '有时不够深入'
    ],
    career: '适合需要沟通协调和创新思维的职业，如公关、市场营销、艺术创作等'
  },
  viscous: { 
    name: '粘液质', 
    description: '安静、稳重、情绪稳定、自制力强', 
    color: 'from-blue-500 to-indigo-600',
    traits: [
      '安静稳重，反应缓慢',
      '情绪发生慢而持续久',
      '注意力稳定，不易转移',
      '善于忍耐，自制力强',
      '思维灵活性略差',
      '但考虑问题深入'
    ],
    strengths: [
      '情绪稳定',
      '自制力强',
      '做事稳重',
      '持久性强'
    ],
    challenges: [
      '反应较慢',
      '缺乏灵活性',
      '适应新环境较慢',
      '有时显得呆板'
    ],
    career: '适合需要耐心和细致的工作，如科研、会计、技术开发、管理等'
  },
  depressive: { 
    name: '抑郁质', 
    description: '敏感、内向、情感细腻、观察力强', 
    color: 'from-purple-500 to-pink-500',
    traits: [
      '敏感多疑，反应迟缓',
      '情绪体验深刻，持续时间长',
      '不善交际，性格孤僻',
      '注意力稳定但难以转移',
      '善于察觉细节',
      '富有想象力和创造力'
    ],
    strengths: [
      '观察力敏锐',
      '情感细腻',
      '富有创造力',
      '深思熟虑'
    ],
    challenges: [
      '情绪敏感',
      '适应性较差',
      '社交能力较弱',
      '容易悲观'
    ],
    career: '适合需要细致观察和创造力的工作，如艺术、研究、咨询、写作等'
  },
  mixed: {
    name: '混合型',
    description: '多种气质类型的组合',
    color: 'from-indigo-500 to-purple-600',
    traits: [
      '兼具多种气质特点',
      '根据情境展现不同特质',
      '适应性较强',
      '性格较为复杂'
    ],
    strengths: [
      '适应性强',
      '多面性格',
      '灵活应变',
      '综合能力'
    ],
    challenges: [
      '性格不够稳定',
      '有时难以预测',
      '内在冲突',
      '自我认知复杂'
    ],
    career: '适合需要综合能力的工作，能够根据环境调整自己的行为方式'
  }
};

const TemperamentDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [temperamentData, setTemperamentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTemperament, setUserTemperament] = useState(null);

  useEffect(() => {
    const loadTemperamentData = async () => {
      try {
        // 首先检查路由参数
        if (location.state) {
          const { temperamentType, temperamentName, scores, dominantTypes, isTemporary } = location.state;
          setTemperamentData({
            type: temperamentType,
            name: temperamentName,
            scores: scores,
            dominantTypes: dominantTypes,
            isTemporary: isTemporary
          });
          setLoading(false);
          return;
        }
        
        // 如果没有路由参数，从用户配置中获取气质数据
        const currentConfig = await userConfig.getCurrentConfig();
        if (currentConfig && currentConfig.temperament) {
          setUserTemperament({
            type: currentConfig.temperament,
            name: currentConfig.temperamentName || '气质类型',
            scores: currentConfig.temperamentScores,
            dominantTypes: currentConfig.temperamentDominantTypes
          });
          
          setTemperamentData({
            type: currentConfig.temperament,
            name: currentConfig.temperamentName || '气质类型',
            scores: currentConfig.temperamentScores,
            dominantTypes: currentConfig.temperamentDominantTypes,
            isTemporary: false
          });
        } else {
          // 没有测试数据，设置为null
          setTemperamentData(null);
        }
      } catch (error) {
        console.error('获取用户气质数据失败:', error);
        // 出错时也设置为null，让用户可以重新测试
        setTemperamentData(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadTemperamentData();
  }, [location.state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/30 dark:to-pink-900/30">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!temperamentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/30 dark:to-pink-900/30 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">气质测试</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">您还没有完成气质测试，无法显示气质详情</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/temperament-test')}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              开始气质测试
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { type, name, scores, dominantTypes, isTemporary } = temperamentData;
  const temperamentInfo = TEMPERAMENT_TYPES[type] || TEMPERAMENT_TYPES.mixed;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/30 dark:to-pink-900/30 ${theme}`}>
      {/* 导航标题栏 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:text-indigo-100 flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <h1 className="text-xl font-bold">气质详情</h1>
            <div className="w-12"></div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* 气质类型标题 */}
          <div className="text-center mb-8">
            <div className={`inline-block bg-gradient-to-r ${temperamentInfo.color} text-white px-8 py-4 rounded-xl shadow-lg mb-4`}>
              <span className="text-3xl font-bold">{name}</span>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">{temperamentInfo.description}</p>
            
            {isTemporary && (
              <div className="mt-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg inline-block">
                临时查看 - 这是预览模式
              </div>
            )}
          </div>

          {/* 气质得分详情（如果有的话） */}
          {scores && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">气质得分详情</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(scores).map(([typeKey, score]) => (
                  <div key={typeKey} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {TEMPERAMENT_TYPES[typeKey]?.name || typeKey}
                    </div>
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{score}</div>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">主要气质类型</h3>
                <p className="text-blue-700 dark:text-blue-300">
                  {dominantTypes && dominantTypes.length > 0 
                    ? dominantTypes.map(t => TEMPERAMENT_TYPES[t]?.name || t).join('、') + (dominantTypes.length > 1 ? '混合型' : '')
                    : '未确定'}
                </p>
              </div>
            </div>
          )}

          {/* 气质特征 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">主要特征</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {temperamentInfo.traits.map((trait, index) => (
                <div key={index} className="flex items-start">
                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 bg-gradient-to-r ${temperamentInfo.color}`}></div>
                  <span className="text-gray-700 dark:text-gray-300">{trait}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 优势与挑战 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4">优势能力</h3>
              <ul className="space-y-2">
                {temperamentInfo.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-4">需要注意</h3>
              <ul className="space-y-2">
                {temperamentInfo.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">⚠</span>
                    <span className="text-gray-700 dark:text-gray-300">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 职业建议 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">职业建议</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">{temperamentInfo?.career || '暂无职业建议'}</p>
            </div>
          </div>

          {/* 按钮区域 */}
          <div className="flex flex-col space-y-3">
            {!isTemporary && (
              <button
                onClick={() => navigate('/temperament-test')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold"
              >
                重新测试
              </button>
            )}
            <button
              onClick={() => navigate('/temperament-test')}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              {isTemporary ? '开始正式测试' : '返回测试'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemperamentDetailPage;