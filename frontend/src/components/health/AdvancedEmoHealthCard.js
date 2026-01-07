import React, { useState, useEffect } from 'react';
import './EmoHealthCard.css';

// 情绪数据
const emotionData = [
  { name: '平静', percentage: 60, color: '#60a5fa' },
  { name: '焦虑', percentage: 20, color: '#f87171' },
  { name: '愉悦', percentage: 20, color: '#4ade80' },
];

// 情绪知识库数据
const emotionInsights = [
  {
    emotion: '焦虑',
    signal: '事情太多或对未来缺乏控制感',
    perspective: '我在试图控制我无法控制的事吗？'
  },
  {
    emotion: '愤怒',
    signal: '个人边界被侵犯或感到不公平',
    perspective: '哪个价值观受到了挑战？'
  },
  {
    emotion: '低落',
    signal: '能量耗尽或需要撤退休息',
    perspective: '我是否需要给自己一点独处的时间？'
  }
];

const AdvancedEmoHealthCard = () => {
  // 状态管理
  const [currentEmotion, setCurrentEmotion] = useState(emotionData[0]);
  const [pressureLevel, setPressureLevel] = useState(65); // 压力负荷 0-100
  const [sleepQuality, setSleepQuality] = useState(7); // 睡眠质量 1-10
  const [hrvValue, setHrvValue] = useState(55); // 心率变异性
  const [showBreathingTool, setShowBreathingTool] = useState(false);
  const [writingText, setWritingText] = useState('');
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathStep, setBreathStep] = useState('准备');
  const [breathCount, setBreathCount] = useState(0);

  // 当HRV值低时自动置顶呼吸法
  useEffect(() => {
    if (hrvValue < 60) {
      setShowBreathingTool(true);
    }
  }, [hrvValue]);

  // 4-7-8呼吸法控制
  const startBreathingExercise = () => {
    setIsBreathingActive(true);
    setBreathStep('吸气');
    setBreathCount(4);
    
    const timer = setInterval(() => {
      setBreathCount(prev => {
        if (prev <= 1) {
          if (breathStep === '吸气') {
            setBreathStep('憋气');
            return 7;
          } else if (breathStep === '憋气') {
            setBreathStep('呼气');
            return 8;
          } else {
            setBreathStep('吸气');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      setIsBreathingActive(false);
      setBreathStep('准备');
    }, 19000); // 4+7+8秒
  };

  // 五感接地练习
  const groundingExercise = () => {
    const groundingItems = {
      '5个能看到的物体': ['天空', '树木', '建筑', '车辆', '花朵'],
      '4个能摸到的质感': ['衣服', '手机', '桌面', '头发'],
      '3个能听到的声音': ['音乐', '谈话声', '键盘声'],
      '2个能闻到的气味': ['咖啡', '花香'],
      '1个能尝到的味道': ['薄荷', '柠檬']
    };
    
    alert(`五感接地练习:\n\n${Object.entries(groundingItems).map(([key, items]) => 
      `${key}: ${items.join(', ')}`
    ).join('\n\n')}`);
  };

  return (
    <div className="health-card advanced-emo-health-card">
      <div className="bg-gradient-to-br from-sky-500 via-purple-500 to-emerald-500 p-6 rounded-2xl shadow-lg h-full flex flex-col text-white">
        {/* 顶部：情绪快照 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">情绪快照</h3>
            <button 
              className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition-colors"
              onClick={() => {
                // 模拟快速填写情绪
                alert('打开情绪快速填写界面');
              }}
            >
              快速填写
            </button>
          </div>
          
          {/* 情绪气泡图 */}
          <div className="flex items-center justify-center mb-4 space-x-2">
            {emotionData.map((emotion, index) => (
              <div 
                key={index}
                className="flex flex-col items-center"
              >
                <div 
                  className="rounded-full flex items-center justify-center text-white font-medium border-2 border-white/30"
                  style={{ 
                    width: `${60 + emotion.percentage * 1.5}px`, 
                    height: `${60 + emotion.percentage * 1.5}px`,
                    backgroundColor: emotion.color 
                  }}
                >
                  {emotion.percentage}%
                </div>
                <span className="text-xs mt-1 text-gray-600">{emotion.name}</span>
              </div>
            ))}
          </div>
          
          {/* 身心关联指数 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">压力负荷</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${pressureLevel}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">基于HRV: {hrvValue} ms</div>
            </div>
            
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">睡眠质量</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${sleepQuality * 10}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">影响今日情绪</div>
            </div>
          </div>
        </div>
        
        {/* 中间：情绪知识库 */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">情绪知识库</h3>
          <div className="space-y-3">
            {emotionInsights.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">{item.emotion}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    可能的信号
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.signal}</p>
                <p className="text-sm font-medium text-blue-600 mt-2">
                  建议视角: {item.perspective}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* 底部：即时干预工具箱 */}
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">即时干预工具箱</h3>
            {hrvValue < 60 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                HRV偏低，建议使用呼吸法
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {/* 呼吸法工具 */}
            <div 
              className={`bg-white p-3 rounded-lg shadow-sm cursor-pointer border-2 ${
                showBreathingTool ? 'border-blue-500' : 'border-transparent'
              }`}
              onClick={() => setShowBreathingTool(!showBreathingTool)}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">🧘</div>
                <div className="text-xs font-medium">呼吸法</div>
              </div>
            </div>
            
            {/* 认知解离工具 */}
            <div className="bg-white p-3 rounded-lg shadow-sm cursor-pointer">
              <div className="text-center">
                <div className="text-2xl mb-1">✍️</div>
                <div className="text-xs font-medium">认知解离</div>
              </div>
            </div>
            
            {/* 五感接地工具 */}
            <div 
              className="bg-white p-3 rounded-lg shadow-sm cursor-pointer"
              onClick={groundingExercise}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">👣</div>
                <div className="text-xs font-medium">五感接地</div>
              </div>
            </div>
          </div>
          
          {/* 展开的呼吸法工具 */}
          {showBreathingTool && (
            <div className="mt-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">4-7-8呼吸法</h4>
              <p className="text-xs text-blue-700 mb-3">
                吸气4秒，憋气7秒，呼气8秒。这能有效激活副交感神经，降低心率。
              </p>
              
              {!isBreathingActive ? (
                <button
                  onClick={startBreathingExercise}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  开始练习
                </button>
              ) : (
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-700 mb-2">
                    {breathStep} {breathCount}
                  </div>
                  <div className="w-24 h-24 rounded-full border-4 border-blue-500 mx-auto animate-pulse"></div>
                </div>
              )}
            </div>
          )}
          
          {/* 认知解离工具 */}
          <div className="mt-3 bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-800 mb-2">认知解离（三分钟书写）</h4>
            <p className="text-xs text-gray-600 mb-2">
              在下面的文本框中写下你的想法，强调这只是一个"想法"，而非事实。
            </p>
            <textarea
              value={writingText}
              onChange={(e) => setWritingText(e.target.value)}
              placeholder="例如：我现在产生了一个'我觉得自己很失败'的想法。"
              className="w-full h-20 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 rounded-lg text-sm transition-colors">
              保存记录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedEmoHealthCard;