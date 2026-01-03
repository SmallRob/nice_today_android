/**
 * MBTI测试模块页面
 * 新建MBTI性格测试页面
 * 测试完成后跳转至现有MBTI人格魅力页
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useCurrentConfig } from '../contexts/UserConfigContext';
import { enhancedUserConfigManager } from '../utils/EnhancedUserConfigManager';

// MBTI测试题目 - 30题增强版
const MBTI_QUESTIONS = [
  {
    id: 1,
    question: '在社交场合中，你通常会？',
    options: [
      { text: '主动与陌生人交流', value: 'E' },
      { text: '等待别人来和你交流', value: 'I' }
    ]
  },
  {
    id: 2,
    question: '做决定时，你更倾向于？',
    options: [
      { text: '依据逻辑分析', value: 'T' },
      { text: '考虑他人感受', value: 'F' }
    ]
  },
  {
    id: 3,
    question: '处理信息时，你更喜欢？',
    options: [
      { text: '关注具体细节和事实', value: 'S' },
      { text: '关注整体和可能性', value: 'N' }
    ]
  },
  {
    id: 4,
    question: '面对变化时，你通常？',
    options: [
      { text: '灵活适应，随机应变', value: 'P' },
      { text: '提前计划，有备无患', value: 'J' }
    ]
  },
  {
    id: 5,
    question: '在团队中，你更愿意？',
    options: [
      { text: '担任领导角色', value: 'E' },
      { text: '配合他人完成工作', value: 'I' }
    ]
  },
  {
    id: 6,
    question: '解决问题时，你更注重？',
    options: [
      { text: '效率和方法', value: 'T' },
      { text: '和谐和人际关系', value: 'F' }
    ]
  },
  {
    id: 7,
    question: '你的思维方式更像是？',
    options: [
      { text: '按部就班，井井有条', value: 'S' },
      { text: '跳跃思考，富有创意', value: 'N' }
    ]
  },
  {
    id: 8,
    question: '面对截止日期，你通常会？',
    options: [
      { text: '提前完成，从容不迫', value: 'J' },
      { text: '最后时刻，一鼓作气', value: 'P' }
    ]
  },
  {
    id: 9,
    question: '学习新知识时，你偏好？',
    options: [
      { text: '实际操作和练习', value: 'S' },
      { text: '理论理解和原理', value: 'N' }
    ]
  },
  {
    id: 10,
    question: '在休息时间，你更愿意？',
    options: [
      { text: '和朋友聚会聊天', value: 'E' },
      { text: '独自阅读或思考', value: 'I' }
    ]
  },
  {
    id: 11,
    question: '评价他人时，你更看重？',
    options: [
      { text: '能力和成就', value: 'T' },
      { text: '品格和态度', value: 'F' }
    ]
  },
  {
    id: 12,
    question: '面对新挑战，你首先会？',
    options: [
      { text: '制定详细计划', value: 'J' },
      { text: '边做边调整', value: 'P' }
    ]
  },
  // 新增题目 (13-30)
  {
    id: 13,
    question: '参加派对时，你通常？',
    options: [
      { text: '和很多人聊天，认识新朋友', value: 'E' },
      { text: '和熟悉的朋友待在一起', value: 'I' }
    ]
  },
  {
    id: 14,
    question: '在争论中，你更看重？',
    options: [
      { text: '事实和证据', value: 'T' },
      { text: '情感和关系', value: 'F' }
    ]
  },
  {
    id: 15,
    question: '计划旅行时，你更倾向于？',
    options: [
      { text: '详细安排每天的行程', value: 'J' },
      { text: '大概规划，随机应变', value: 'P' }
    ]
  },
  {
    id: 16,
    question: '当朋友向你倾诉时，你更可能？',
    options: [
      { text: '分析问题给出建议', value: 'T' },
      { text: '倾听并提供情感支持', value: 'F' }
    ]
  },
  {
    id: 17,
    question: '处理工作时，你更喜欢？',
    options: [
      { text: '一次专注于一个任务', value: 'S' },
      { text: '同时处理多个任务', value: 'N' }
    ]
  },
  {
    id: 18,
    question: '空闲时间，你更愿意？',
    options: [
      { text: '安排活动与人相处', value: 'E' },
      { text: '享受独处时光', value: 'I' }
    ]
  },
  {
    id: 19,
    question: '对于未来，你更关注？',
    options: [
      { text: '具体的可实现目标', value: 'S' },
      { text: '宏大的可能性', value: 'N' }
    ]
  },
  {
    id: 20,
    question: '在团队合作中，你更重视？',
    options: [
      { text: '任务的完成效率', value: 'T' },
      { text: '团队的和谐氛围', value: 'F' }
    ]
  },
  {
    id: 21,
    question: '面对决策，你更可能？',
    options: [
      { text: '仔细权衡利弊', value: 'T' },
      { text: '凭直觉和感觉', value: 'F' }
    ]
  },
  {
    id: 22,
    question: '你的工作风格更接近？',
    options: [
      { text: '按计划稳步推进', value: 'J' },
      { text: '灵活调整适应变化', value: 'P' }
    ]
  },
  {
    id: 23,
    question: '学习新技能时，你更倾向于？',
    options: [
      { text: '跟随步骤实践', value: 'S' },
      { text: '理解原理再应用', value: 'N' }
    ]
  },
  {
    id: 24,
    question: '在社交中，你更享受？',
    options: [
      { text: '与许多人互动', value: 'E' },
      { text: '深入的个别交流', value: 'I' }
    ]
  },
  {
    id: 25,
    question: '处理复杂问题时，你更可能？',
    options: [
      { text: '分解成小步骤解决', value: 'S' },
      { text: '寻找创新解决方案', value: 'N' }
    ]
  },
  {
    id: 26,
    question: '你更倾向于认为？',
    options: [
      { text: '规则有助于秩序', value: 'J' },
      { text: '灵活性带来机会', value: 'P' }
    ]
  },
  {
    id: 27,
    question: '在人际关系中，你更看重？',
    options: [
      { text: '真诚和深度连接', value: 'I' },
      { text: '广泛的社交网络', value: 'E' }
    ]
  },
  {
    id: 28,
    question: '你更相信？',
    options: [
      { text: '理性和逻辑', value: 'T' },
      { text: '情感和同理心', value: 'F' }
    ]
  },
  {
    id: 29,
    question: '面对新环境，你更可能？',
    options: [
      { text: '观察适应后再行动', value: 'S' },
      { text: '大胆尝试新方法', value: 'N' }
    ]
  },
  {
    id: 30,
    question: '你更偏好哪种生活方式？',
    options: [
      { text: '有计划有组织的', value: 'J' },
      { text: '开放自由的', value: 'P' }
    ]
  }
];

const MBTITestPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // 状态管理
  const currentConfig = useCurrentConfig();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [saveStatus, setSaveStatus] = useState({ loading: false, success: false, error: null });
  const [existingMBTI, setExistingMBTI] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // 检查现有MBTI类型
  useEffect(() => {
    if (currentConfig && currentConfig.mbti) {
      const mbtiType = currentConfig.mbti.trim().toUpperCase();
      // 验证是否为有效的MBTI类型（4个字符，每个字符是有效的维度）
      const validTypes = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 
                          'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];
      if (validTypes.includes(mbtiType)) {
        setExistingMBTI(mbtiType);
      }
    }
    setCheckingExisting(false);
  }, [currentConfig]);

  // 当前题目
  const currentQuestion = MBTI_QUESTIONS[currentQuestionIndex];

  // 计算MBTI类型
  const calculateMBTI = () => {
    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    Object.values(answers).forEach(value => {
      counts[value]++;
    });

    const type = [
      counts.E > counts.I ? 'E' : 'I',
      counts.S > counts.N ? 'S' : 'N',
      counts.T > counts.F ? 'T' : 'F',
      counts.J > counts.P ? 'J' : 'P'
    ].join('');

    return type;
  };

  // 获取类型描述
  const getTypeDescription = (type) => {
    const descriptions = {
      'ISTJ': '务实的现实主义者',
      'ISFJ': '热心的守护者',
      'INFJ': '深邃的理想主义者',
      'INTJ': '有远见的策划者',
      'ISTP': '冷静的观察者',
      'ISFP': '温和的艺术家',
      'INFP': '浪漫的梦想家',
      'INTP': '逻辑的分析者',
      'ESTP': '活力的实践者',
      'ESFP': '热情的表演者',
      'ENFP': '自由的激励者',
      'ENTP': '机敏的发明家',
      'ESTJ': '能干的组织者',
      'ESFJ': '和善的照顾者',
      'ENFJ': '有魅力的领导者',
      'ENTJ': '果断的指挥官'
    };
    return descriptions[type] || '独特的个性';
  };

  // 选择答案
  const handleAnswer = (value) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: value
    };
    setAnswers(newAnswers);

    // 如果是最后一题，显示结果
    if (currentQuestionIndex === MBTI_QUESTIONS.length - 1) {
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

    setTimeout(async () => {
      const type = calculateMBTI();
      const description = getTypeDescription(type);
      setResult({ type, description });
      setLoading(false);

      // 保存MBTI类型到用户配置
      try {
        setSaveStatus({ loading: true, success: false, error: null });
        
        // 获取当前配置索引
        const activeIndex = enhancedUserConfigManager.getActiveConfigIndex();
        
        // 更新配置中的MBTI字段
        const updateResult = await enhancedUserConfigManager.updateConfigWithNodeUpdate(
          activeIndex,
          { mbti: type }
        );
        
        if (updateResult && updateResult.success) {
          setSaveStatus({ loading: false, success: true, error: null });
          console.log('MBTI类型保存成功:', type);
        } else {
          throw new Error('更新配置失败');
        }
      } catch (error) {
        console.error('保存MBTI类型失败:', error);
        setSaveStatus({ loading: false, success: false, error: error.message });
      }
    }, 1000);
  };

  // 重新测试
  const handleRetest = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
  };

  // 查看详细分析
  const handleViewDetail = (mbtiType = null) => {
    navigate('/mbti-detail', {
      state: { mbtiType: mbtiType || result?.type }
    });
  };

  if (checkingExisting || (loading && !result)) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
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
            <h1 className="text-xl font-bold">MBTI性格测试</h1>
            <div className="w-12"></div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {result ? (
          /* 结果展示 */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                测试完成！
              </h2>
              <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg">
                <span className="text-4xl font-bold">{result.type}</span>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">
                {result.description}
              </p>
              
              {/* 保存状态提示 */}
              {saveStatus.loading && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-blue-700 dark:text-blue-300">正在保存测试结果...</span>
                  </div>
                </div>
              )}
              {saveStatus.success && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-700 dark:text-green-300">测试结果已成功保存到您的个人配置中</span>
                  </div>
                </div>
              )}
              {saveStatus.error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 dark:text-red-300">保存失败: {saveStatus.error}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleViewDetail}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold"
              >
                查看详细分析
              </button>
              <button
                onClick={handleRetest}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                重新测试
              </button>
            </div>
          </div>
        ) : existingMBTI ? (
          /* 现有MBTI提示界面 */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                您已有MBTI测试结果
              </h2>
              <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl shadow-lg mb-4">
                <span className="text-4xl font-bold">{existingMBTI}</span>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                您的MBTI类型为 <span className="font-bold">{existingMBTI}</span>，上次测试结果已保存。
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => handleViewDetail(existingMBTI)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold"
                >
                  查看详细分析
                </button>
                <button
                  onClick={() => {
                    setExistingMBTI(null);
                    setCurrentQuestionIndex(0);
                    setAnswers({});
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-semibold"
                >
                  重新测试
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 问答界面 */
          <div>
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>题目 {currentQuestionIndex + 1} / {MBTI_QUESTIONS.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / MBTI_QUESTIONS.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / MBTI_QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 问题卡片 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 text-center">
                {currentQuestion.question}
              </h2>

              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.value)}
                    className="w-full text-left px-6 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-gray-800 dark:text-white"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 flex items-center justify-center mr-4">
                        <span className="text-indigo-500 font-semibold">{index + 1}</span>
                      </div>
                      <span className="text-lg">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MBTITestPage;
