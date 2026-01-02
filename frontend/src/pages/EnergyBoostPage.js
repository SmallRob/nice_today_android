/**
 * 每日能量提升模块页面
 * 由原每日正念内容提炼
 * 优化：统一字体大小，优化排版，适配移动端
 */
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import MindfulnessActivities from '../components/biorhythm/MindfulnessActivities.js';

// 能量活动数据
const ENERGY_ACTIVITIES = [
  {
    id: 1,
    title: '晨间冥想',
    description: '花10分钟进行冥想，开启充满活力的一天',
    icon: '🧘',
    category: 'mindfulness'
  },
  {
    id: 2,
    title: '户外散步',
    description: '在自然中散步20分钟，吸收阳光和新鲜空气',
    icon: '🌳',
    category: 'physical'
  },
  {
    id: 3,
    title: '深呼吸练习',
    description: '进行5分钟深呼吸，放松身心，提升专注力',
    icon: '🌬️',
    category: 'mindfulness'
  },
  {
    id: 4,
    title: '健康早餐',
    description: '享用营养均衡的早餐，为身体提供充足能量',
    icon: '🥗',
    category: 'diet'
  },
  {
    id: 5,
    title: '拉伸运动',
    description: '做一套简单的拉伸动作，缓解肌肉紧张',
    icon: '🤸',
    category: 'physical'
  },
  {
    id: 6,
    title: '感恩练习',
    description: '写下三件感恩的事，培养积极心态',
    icon: '🙏',
    category: 'mindfulness'
  },
  {
    id: 7,
    title: '保持水分',
    description: '喝一杯温水，促进新陈代谢',
    icon: '💧',
    category: 'diet'
  },
  {
    id: 8,
    title: '积极思考',
    description: '阅读励志文字或听一首励志歌曲',
    icon: '✨',
    category: 'mindfulness'
  }
];

// 能量指引
const ENERGY_GUIDANCE = [
  '保持积极心态，每一天都是新的开始',
  '合理安排时间，劳逸结合更高效',
  '多与正能量的人交流，传递快乐',
  '适度运动，让身体充满活力',
  '学习新技能，激发内在潜能',
  '保持良好的作息，质量比时长更重要',
  '学会放下，不要被小事影响心情',
  '给自己设定小目标，逐步实现大梦想'
];

const EnergyBoostPage = () => {
  const { theme } = useTheme();

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [energyGuidance, setEnergyGuidance] = useState('');
  const [energyLevel, setEnergyLevel] = useState(50);
  const [energyHistory, setEnergyHistory] = useState([]);

  // 生成随机活动
  const generateRandomActivities = useCallback(() => {
    const shuffled = [...ENERGY_ACTIVITIES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, []);

  // 获取随机能量指引
  const getRandomGuidance = useCallback(() => {
    const index = Math.floor(Math.random() * ENERGY_GUIDANCE.length);
    return ENERGY_GUIDANCE[index];
  }, []);

  // 初始化
  useEffect(() => {
    // 从本地存储加载完成状态
    const loadCompletedTasks = () => {
      try {
        const stored = localStorage.getItem('energyBoost_completedTasks');
        if (stored) {
          setCompletedTasks(JSON.parse(stored));
        }
      } catch (error) {
        console.error('加载完成任务失败:', error);
      }
    };

    // 加载能量历史
    const loadEnergyHistory = () => {
      try {
        const stored = localStorage.getItem('energyBoost_history');
        if (stored) {
          setEnergyHistory(JSON.parse(stored));
        }
      } catch (error) {
        console.error('加载能量历史失败:', error);
      }
    };

    loadCompletedTasks();
    loadEnergyHistory();

    //生成活动
    const newActivities = generateRandomActivities();
    setActivities(newActivities);
    setEnergyGuidance(getRandomGuidance());

    setLoading(false);
  }, [generateRandomActivities, getRandomGuidance]);

  // 切换任务完成状态
  const handleToggleTask = (taskId) => {
    let newCompletedTasks;
    if (completedTasks.includes(taskId)) {
      newCompletedTasks = completedTasks.filter(id => id !== taskId);
    } else {
      newCompletedTasks = [...completedTasks, taskId];
    }

    setCompletedTasks(newCompletedTasks);
    localStorage.setItem('energyBoost_completedTasks', JSON.stringify(newCompletedTasks));

    // 更新能量等级
    const newEnergyLevel = 50 + newCompletedTasks.length * 12.5;
    setEnergyLevel(Math.min(newEnergyLevel, 100));

    // 记录到历史
    if (!completedTasks.includes(taskId)) {
      const today = new Date().toISOString().split('T')[0];
      const newHistory = [
        ...energyHistory,
        {
          date: today,
          tasksCompleted: newCompletedTasks.length,
          energyLevel: newEnergyLevel
        }
      ];
      setEnergyHistory(newHistory);
      localStorage.setItem('energyBoost_history', JSON.stringify(newHistory));
    }
  };

  // 刷新活动
  const handleRefreshActivities = () => {
    const newActivities = generateRandomActivities();
    setActivities(newActivities);
    setEnergyGuidance(getRandomGuidance());
  };

  // 重置今日任务
  const handleResetTasks = () => {
    if (window.confirm('确定要重置今日任务吗？')) {
      setCompletedTasks([]);
      setEnergyLevel(50);
      localStorage.removeItem('energyBoost_completedTasks');
      handleRefreshActivities();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="w-10 h-10 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-orange-900/30 dark:to-yellow-900/30">
      {/* 导航标题栏 */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="text-white hover:text-orange-100 flex items-center text-lg"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <h1 className="text-xl font-bold">每日能量提升</h1>
            <button
              onClick={handleResetTasks}
              className="text-white hover:text-orange-100 p-2"
              title="重置任务"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.003 8.003 0 014.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 0 001 1H9z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* 能量等级卡片 */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">今日能量指数</h2>
              <div className="text-3xl font-bold">{energyLevel}</div>
            </div>
            <div className="text-5xl opacity-20">⚡</div>
          </div>

          {/* 能量等级指示条 */}
          <div className="h-4 bg-white/30 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${energyLevel}%` }}
            ></div>
          </div>
          <p className="text-lg opacity-90 text-white">
            完成任务可以提升能量等级
          </p>
        </div>

        {/* 每日能量活动 */}
        <MindfulnessActivities
          activities={activities}
          completedTasks={completedTasks}
          onToggleTask={handleToggleTask}
          onRefreshActivities={handleRefreshActivities}
          energyGuidance={energyGuidance}
        />

        {/* 能量历史 */}
        {energyHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              近期能量记录
            </h3>
            <div className="space-y-3">
              {energyHistory.slice(-7).reverse().map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-3"></div>
                    <span className="text-lg text-gray-800 dark:text-white">{record.date}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                      {record.tasksCompleted} 个任务
                    </span>
                    <span className="font-semibold text-lg text-orange-600 dark:text-orange-400">
                      {record.energyLevel}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 能量提升建议 */}
        <div className="bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl shadow-lg p-6 border border-orange-200 dark:border-orange-800">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            能量提升建议
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-2xl mr-3">💪</span>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                坚持每天完成能量任务，养成良好习惯
              </p>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-3">🌅</span>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                早上起床后进行简单的拉伸和冥想
              </p>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-3">🥗</span>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                合理饮食，多吃富含蛋白质和维生素的食物
              </p>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-3">😴</span>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                保证充足的睡眠，让身体得到充分休息
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnergyBoostPage;
