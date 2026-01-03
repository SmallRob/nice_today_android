/**
 * 陈会昌六十气质量表测试页面
 * 包含60道题目，评估四种气质类型：胆汁质、多血质、粘液质、抑郁质
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { userConfig, enhancedUserConfigManager } from '../utils/index.js';

// 陈会昌六十气质量表题目
const CHEN_TEMPERAMENT_QUESTIONS = [
  { id: 1, question: '做事力求稳妥，不做无把握的事。', type: 'viscous' },
  { id: 2, question: '遇到可气的事就怒不可遏，想把心里话全说出来才痛快。', type: 'choleric' },
  { id: 3, question: '宁肯一个人干事，不愿很多人在一起。', type: 'depressive' },
  { id: 4, question: '到一个新环境很快就能适应。', type: 'sanguine' },
  { id: 5, question: '厌恶那些强烈的刺激，如尖叫、噪声、危险的镜头等。', type: 'depressive' },
  { id: 6, question: '和人争吵时，总是先发制人，喜欢挑衅。', type: 'choleric' },
  { id: 7, question: '喜欢安静的环境。', type: 'viscous' },
  { id: 8, question: '喜欢和人交往。', type: 'sanguine' },
  { id: 9, question: '羡慕那种能克制自己感情的人。', type: 'choleric' },
  { id: 10, question: '生活有规律，很少违反作息制度。', type: 'viscous' },
  { id: 11, question: '在多数情况下情绪是乐观的。', type: 'sanguine' },
  { id: 12, question: '碰到陌生人觉得很拘束。', type: 'depressive' },
  { id: 13, question: '遇到令人气愤的事，能很好地自我克制。', type: 'viscous' },
  { id: 14, question: '做事总是有旺盛的精力。', type: 'choleric' },
  { id: 15, question: '遇到问题常常举棋不定，优柔寡断。', type: 'depressive' },
  { id: 16, question: '在人群中从不觉得过分拘束。', type: 'sanguine' },
  { id: 17, question: '情绪高昂时，觉得干什么都有趣。', type: 'choleric' },
  { id: 18, question: '当注意力集中于一件事时，别的事很难使我分心。', type: 'viscous' },
  { id: 19, question: '理解问题总比别人快。', type: 'sanguine' },
  { id: 20, question: '碰到危险情境，常有一种极度恐怖感。', type: 'depressive' },
  { id: 21, question: '对学习、工作、事业怀有很高的热情。', type: 'choleric' },
  { id: 22, question: '能够长时间做枯燥、单调的工作。', type: 'viscous' },
  { id: 23, question: '符合兴趣的事情，干起来劲头十足，否则就不想干。', type: 'sanguine' },
  { id: 24, question: '一点小事就能引起情绪波动。', type: 'depressive' },
  { id: 25, question: '讨厌做那种需要耐心、细致的工作。', type: 'sanguine' },
  { id: 26, question: '与人交往不卑不亢。', type: 'viscous' },
  { id: 27, question: '喜欢参加热烈的活动。', type: 'choleric' },
  { id: 28, question: '爱看感情细腻、描写人物内心活动的文学作品。', type: 'depressive' },
  { id: 29, question: '工作、学习时间长了，常感到厌倦。', type: 'sanguine' },
  { id: 30, question: '不喜欢长时间谈论一个问题，愿意实际动手干。', type: 'viscous' },
  { id: 31, question: '宁愿侃侃而谈，不愿窃窃私语。', type: 'choleric' },
  { id: 32, question: '别人说我总是闷闷不乐。', type: 'depressive' },
  { id: 33, question: '疲倦时只要短暂的休息就能精神抖擞，重新投入工作。', type: 'viscous' },
  { id: 34, question: '理解问题常比别人慢些。', type: 'sanguine' },
  { id: 35, question: '心里有话宁愿自己想，不愿说出来。', type: 'depressive' },
  { id: 36, question: '认准一个目标就希望尽快实现，不达目的，誓不罢休。', type: 'choleric' },
  { id: 37, question: '学习、工作同样一段时间后，常比别人更疲倦。', type: 'depressive' },
  { id: 38, question: '做事有些莽撞，常常不考虑后果。', type: 'choleric' },
  { id: 39, question: '老师或师傅讲授新知识、技术时，总希望他讲慢些，多重复几遍。', type: 'viscous' },
  { id: 40, question: '能够很快地忘记那些不愉快的事情。', type: 'sanguine' },
  { id: 41, question: '做作业或完成一件工作总比别人花的时间多。', type: 'depressive' },
  { id: 42, question: '喜欢运动量大的剧烈体育活动，或参加各种文娱活动。', type: 'choleric' },
  { id: 43, question: '不能很快地把注意力从一件事转移到另一件事上去。', type: 'viscous' },
  { id: 44, question: '接受一个任务后，希望把它迅速完成。', type: 'sanguine' },
  { id: 45, question: '认为墨守成规比冒风险强些。', type: 'viscous' },
  { id: 46, question: '能够同时注意几件事物。', type: 'sanguine' },
  { id: 47, question: '当我烦闷的时候，别人很难使我高兴起来。', type: 'depressive' },
  { id: 48, question: '爱看情节起伏跌宕、激动人心的小说。', type: 'choleric' },
  { id: 49, question: '对工作抱认真严谨、始终一贯的态度。', type: 'viscous' },
  { id: 50, question: '和周围人们的关系总是相处不好。', type: 'choleric' },
  { id: 51, question: '喜欢复习学过的知识，重复做已经掌握的工作。', type: 'depressive' },
  { id: 52, question: '喜欢做变化大、花样多的工作。', type: 'sanguine' },
  { id: 53, question: '小时候会背的诗歌，我似乎比别人记得清楚。', type: 'depressive' },
  { id: 54, question: '别人说我"出语伤人"，可我并不觉得这样。', type: 'choleric' },
  { id: 55, question: '在体育活动中，常因反应慢而落后。', type: 'viscous' },
  { id: 56, question: '反应敏捷，头脑机智。', type: 'sanguine' },
  { id: 57, question: '喜欢有条理而不甚麻烦的工作。', type: 'viscous' },
  { id: 58, question: '兴奋的事常使我失眠。', type: 'choleric' },
  { id: 59, question: '老师讲新概念，常常听不懂，但是弄懂以后就很难忘记。', type: 'depressive' },
  { id: 60, question: '假如工作枯燥无味，马上就会情绪低落。', type: 'sanguine' },
];

// 气质类型映射
const TEMPERAMENT_TYPES = {
  choleric: { name: '胆汁质', description: '热情、外向、精力旺盛、情绪易激动', color: 'from-red-500 to-red-600' },
  sanguine: { name: '多血质', description: '活泼、外向、善于交际、适应性强', color: 'from-yellow-500 to-orange-500' },
  viscous: { name: '粘液质', description: '安静、稳重、情绪稳定、自制力强', color: 'from-blue-500 to-indigo-600' },
  depressive: { name: '抑郁质', description: '敏感、内向、情感细腻、观察力强', color: 'from-purple-500 to-pink-500' }
};

// 评分选项
const SCORE_OPTIONS = [
  { value: 2, text: '非常符合', color: 'bg-red-500 hover:bg-red-600' },
  { value: 1, text: '比较符合', color: 'bg-orange-400 hover:bg-orange-500' },
  { value: 0, text: '拿不准', color: 'bg-gray-300 hover:bg-gray-400' },
  { value: -1, text: '比较不符合', color: 'bg-blue-400 hover:bg-blue-500' },
  { value: -2, text: '完全不符合', color: 'bg-indigo-500 hover:bg-indigo-600' }
];

const ChenTemperamentTestPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // 状态管理
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 当前题目
  const currentQuestion = CHEN_TEMPERAMENT_QUESTIONS[currentQuestionIndex];

  // 计算气质类型得分
  const calculateTemperamentScores = () => {
    const scores = {
      choleric: 0,  // 胆汁质
      sanguine: 0,  // 多血质
      viscous: 0,   // 粘液质
      depressive: 0 // 抑郁质
    };

    // 根据题目类型累加分数
    CHEN_TEMPERAMENT_QUESTIONS.forEach(question => {
      const answerValue = answers[question.id] || 0;
      scores[question.type] += answerValue;
    });

    return scores;
  };

  // 计算主要气质类型
  const calculateMainTemperament = (scores) => {
    // 获取所有得分
    const scoreEntries = Object.entries(scores);
    
    // 找到最高分的气质类型
    const maxScore = Math.max(...scoreEntries.map(([type, score]) => score));
    const maxTypes = scoreEntries.filter(([type, score]) => score === maxScore).map(([type]) => type);
    
    // 如果有多个最高分，则为混合型
    if (maxTypes.length > 1) {
      return {
        type: 'mixed',
        name: `${maxTypes.map(t => TEMPERAMENT_TYPES[t].name).join('、')}混合型`,
        scores: scores,
        dominantTypes: maxTypes
      };
    }

    // 检查是否为典型类型（得分明显高于其他类型）
    const sortedScores = scoreEntries.sort((a, b) => b[1] - a[1]);
    const first = sortedScores[0];
    const second = sortedScores[1];
    
    if (first[1] - second[1] >= 4) {
      // 典型类型
      return {
        type: first[0],
        name: `${TEMPERAMENT_TYPES[first[0]].name}（典型）`,
        scores: scores,
        dominantTypes: [first[0]]
      };
    } else if (first[1] - second[1] < 3) {
      // 混合型（前两种接近）
      return {
        type: 'mixed',
        name: `${TEMPERAMENT_TYPES[first[0]].name}、${TEMPERAMENT_TYPES[second[0]].name}混合型`,
        scores: scores,
        dominantTypes: [first[0], second[0]]
      };
    } else {
      // 单一类型
      return {
        type: first[0],
        name: TEMPERAMENT_TYPES[first[0]].name,
        scores: scores,
        dominantTypes: [first[0]]
      };
    }
  };

  // 选择答案
  const handleAnswer = (value) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value
    };
    setAnswers(newAnswers);

    // 如果是最后一题，显示结果
    if (currentQuestionIndex === CHEN_TEMPERAMENT_QUESTIONS.length - 1) {
      handleShowResult();
    } else {
      // 否则进入下一题
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    }
  };

  // 显示结果
  const handleShowResult = () => {
    setLoading(true);

    setTimeout(() => {
      const scores = calculateTemperamentScores();
      const temperament = calculateMainTemperament(scores);
      setResult(temperament);
      setLoading(false);
    }, 1000);
  };

  // 重新测试
  const handleRetest = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
  };

  // 查看详细分析
  const handleViewDetail = async () => {
    if (result) {
      // 保存测试结果到用户配置
      try {
        // 获取所有配置和当前活跃索引
        const allConfigs = await userConfig.getAllConfigs();
        const activeConfigIndex = enhancedUserConfigManager.getActiveConfigIndex();
        
        await userConfig.updateConfig(activeConfigIndex, {
          temperament: result.type,
          temperamentName: result.name,
          temperamentScores: result.scores,
          temperamentDominantTypes: result.dominantTypes
        });
        console.log('气质测试结果已保存到用户配置');
      } catch (error) {
        console.error('保存气质测试结果失败:', error);
      }
      
      navigate('/temperament-detail', {
        state: { 
          temperamentType: result.type,
          temperamentName: result.name,
          scores: result.scores,
          dominantTypes: result.dominantTypes
        }
      });
    }
  };

  // 临时查看其他气质类型
  const handleViewOtherTemperament = (type) => {
    navigate('/temperament-detail', {
      state: { 
        temperamentType: type,
        temperamentName: TEMPERAMENT_TYPES[type].name,
        scores: null, // 表示这是临时查看
        dominantTypes: [type],
        isTemporary: true
      }
    });
  };

  if (loading && !result) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/30 dark:to-pink-900/30">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/30 dark:to-pink-900/30 ${theme}`}>
      {/* 导航标题栏 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="text-white hover:text-indigo-100 flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <h1 className="text-xl font-bold">陈会昌六十气质测试</h1>
            <div className="w-12"></div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {result ? (
          /* 结果展示 */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                测试完成！
              </h2>
              <div className={`inline-block bg-gradient-to-r ${TEMPERAMENT_TYPES[result.dominantTypes[0]]?.color || 'from-indigo-500 to-purple-600'} text-white px-8 py-4 rounded-xl shadow-lg mb-4`}>
                <span className="text-3xl font-bold">{result.name}</span>
              </div>
              
              {/* 气质得分详情 */}
              <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
                {Object.entries(result.scores).map(([type, score]) => (
                  <div key={type} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="font-semibold text-gray-700 dark:text-gray-300">{TEMPERAMENT_TYPES[type].name}</div>
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{score}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <button
                onClick={handleViewDetail}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold"
              >
                查看详细分析并保存结果
              </button>
              <button
                onClick={handleRetest}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                重新测试
              </button>
              
              {/* 临时查看其他气质类型 */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">查看其他气质类型</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(TEMPERAMENT_TYPES).map(([type, info]) => (
                    <button
                      key={type}
                      onClick={() => handleViewOtherTemperament(type)}
                      className={`py-3 px-4 rounded-lg text-white ${info.color.includes('red') ? 'bg-red-500 hover:bg-red-600' : 
                        info.color.includes('yellow') ? 'bg-yellow-500 hover:bg-yellow-600' : 
                        info.color.includes('blue') ? 'bg-blue-500 hover:bg-blue-600' : 
                        'bg-purple-500 hover:bg-purple-600'} transition-all`}
                    >
                      {info.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 问答界面 */
          <div>
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>题目 {currentQuestionIndex + 1} / {CHEN_TEMPERAMENT_QUESTIONS.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / CHEN_TEMPERAMENT_QUESTIONS.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / CHEN_TEMPERAMENT_QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 问题卡片 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {SCORE_OPTIONS.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.value)}
                    className={`py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all text-gray-800 dark:text-white ${option.color.replace('hover:', '')}`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{option.text}</span>
                      <span className="text-xs mt-1 opacity-80">({option.value > 0 ? '+' : ''}{option.value})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* 当前进度信息 */}
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              评分标准：非常符合+2分，比较符合+1分，拿不准0分，比较不符合-1分，完全不符合-2分
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChenTemperamentTestPage;