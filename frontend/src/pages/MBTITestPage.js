/**
 * MBTI测试模块页面
 * 新建MBTI性格测试页面
 * 测试完成后跳转至现有MBTI人格魅力页
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// MBTI测试题目
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
  }
];

const MBTITestPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // 状态管理
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

    setTimeout(() => {
      const type = calculateMBTI();
      const description = getTypeDescription(type);
      setResult({ type, description });
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
  const handleViewDetail = () => {
    navigate('/mbti-detail', {
      state: { mbtiType: result?.type }
    });
  };

  if (loading && !result) {
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
