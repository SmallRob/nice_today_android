/**
 * 性格测试功能页面
 * 融合MBTI测试和陈会昌六十气质量表
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const PersonalityTestPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('mbti');

  const testTypes = [
    {
      id: 'mbti',
      title: 'MBTI性格测试',
      description: '16种人格类型，深入了解你的性格特质',
      icon: '🧠',
      color: 'from-blue-500 to-indigo-600',
      detailPath: '/mbti-test'
    },
    {
      id: 'chen',
      title: '陈会昌气质测试',
      description: '四气质类型，探索你的行为倾向',
      icon: '🎭',
      color: 'from-purple-500 to-pink-600',
      detailPath: '/temperament-test'
    }
  ];

  const handleTestClick = (testPath) => {
    navigate(testPath);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/30 dark:to-pink-900/30 ${theme}`}>
      {/* 导航标题栏 */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'linear-gradient(to right, #4f46e5, #9333ea)',
        color: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        height: '60px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '100%'
        }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: 0,
              fontSize: '16px'
            }}
          >
            <svg style={{ width: '24px', height: '24px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            性格测试中心
          </h1>
          <div style={{ width: '48px' }}></div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Banner区域 */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-8 text-white text-center">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-3xl font-bold mb-4">性格探索之旅</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              通过科学的性格测试，深入了解自己的特质和倾向，发现更好的自己
            </p>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg flex-nowrap inline-flex min-w-max">
            {testTypes.map((test) => (
              <button
                key={test.id}
                onClick={() => setActiveTab(test.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === test.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {test.title}
              </button>
            ))}
          </div>
        </div>

        {/* 测试卡片展示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testTypes.map((test) => (
            <div
              key={test.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 transition-all hover:shadow-3xl cursor-pointer flex flex-col ${
                activeTab === test.id ? 'ring-4 ring-indigo-500/30' : ''
              }`}
              onClick={() => handleTestClick(test.detailPath)}
            >
              <div className="text-center flex flex-col flex-1">
                <div className="text-6xl mb-4">{test.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                  {test.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {test.description}
                </p>
                
                {/* 测试特点展示 */}
                <div className="space-y-3 mb-6 flex-1">
                  {test.id === 'mbti' && (
                    <>
                      <div className="flex flex-wrap items-center justify-center text-sm text-gray-500 dark:text-gray-400 gap-2">
                        <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full whitespace-nowrap">16种人格类型</span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full whitespace-nowrap">4个维度分析</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        基于荣格的心理类型理论
                      </div>
                    </>
                  )}
                  {test.id === 'chen' && (
                    <>
                      <div className="flex flex-wrap items-center justify-center text-sm text-gray-500 dark:text-gray-400 gap-2">
                        <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full whitespace-nowrap">4种气质类型</span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full whitespace-nowrap">60道题目</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        基于陈会昌的气质量表
                      </div>
                    </>
                  )}
                </div>

                {/* 开始测试按钮 */}
                <button className={`w-full py-4 rounded-xl text-white font-semibold transition-all bg-gradient-to-r ${test.color} hover:shadow-lg mt-auto`}>
                  开始测试
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 测试说明 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">关于性格测试</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">MBTI性格测试</h4>
              <p className="text-sm leading-relaxed">
                MBTI（Myers-Briggs Type Indicator）是基于荣格的心理类型理论开发的自我报告式人格评估工具，
                将人格分为16种类型，帮助你了解自己的性格偏好和行为模式。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">陈会昌气质测试</h4>
              <p className="text-sm leading-relaxed">
                陈会昌六十气质量表是基于古希腊四气质理论的现代中文版量表，
                通过60道题目评估胆汁质、多血质、粘液质、抑郁质四种气质类型的倾向。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityTestPage;