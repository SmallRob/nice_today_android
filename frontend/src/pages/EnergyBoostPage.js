/**
 * 每日能量提升模块页面
 * 由原每日正念内容提炼
 * 优化：统一字体大小，优化排版，适配移动端
 */
import { useState, useEffect, useCallback } from 'react';
import MindfulnessActivities from '../components/biorhythm/MindfulnessActivities.js';
import { useEnergy } from '../contexts/EnergyContext';
import { DAILY_CONFIG } from '../constants/energyLevels';

// 能量活动数据
const ENERGY_ACTIVITIES = [
  {
    id: 1,
    title: '晨间冥想',
    description: '花10分钟进行冥想，开启充满活力的一天',
    icon: '🧘',
    category: 'mindfulness',
    upReward: 150,
  },
  {
    id: 2,
    title: '户外散步',
    description: '在自然中散步20分钟，吸收阳光和新鲜空气',
    icon: '🌳',
    category: 'physical',
    upReward: 200,
  },
  {
    id: 3,
    title: '深呼吸练习',
    description: '进行5分钟深呼吸，放松身心，提升专注力',
    icon: '🌬️',
    category: 'mindfulness',
    upReward: 100,
  },
  {
    id: 4,
    title: '健康早餐',
    description: '享用营养均衡的早餐，为身体提供充足能量',
    icon: '🥗',
    category: 'diet',
    upReward: 150,
  },
  {
    id: 5,
    title: '拉伸运动',
    description: '做一套简单的拉伸动作，缓解肌肉紧张',
    icon: '🤸',
    category: 'physical',
    upReward: 150,
  },
  {
    id: 6,
    title: '感恩练习',
    description: '写下三件感恩的事，培养积极心态',
    icon: '🙏',
    category: 'mindfulness',
    upReward: 100,
  },
  {
    id: 7,
    title: '保持水分',
    description: '喝一杯温水，促进新陈代谢',
    icon: '💧',
    category: 'diet',
    upReward: 50,
  },
  {
    id: 8,
    title: '积极思考',
    description: '阅读励志文字或听一首励志歌曲',
    icon: '✨',
    category: 'mindfulness',
    upReward: 100,
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
  // 能量树状态
  const {
    energyData,
    visitEnergyBoostPage,
    addEnergyBoostUP,
  } = useEnergy();

  // 状态管理
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [energyGuidance, setEnergyGuidance] = useState('');
  const [energyLevel, setEnergyLevel] = useState(50);
  const [energyHistory, setEnergyHistory] = useState([]);
  const [pageVisited, setPageVisited] = useState(false);

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

  // 访问能量提升页面奖励
  useEffect(() => {
    if (!pageVisited && energyData) {
      visitEnergyBoostPage();
      setPageVisited(true);
    }
  }, [pageVisited, energyData, visitEnergyBoostPage]);

  // 初始化
  useEffect(() => {
    // 从本地存储加载完成状态
    const loadCompletedTasks = () => {
      try {
        const stored = localStorage.getItem('energyBoost_completedTasks');
        if (stored) {
          const loadedTasks = JSON.parse(stored);
          setCompletedTasks(loadedTasks);
        }
      } catch (error) {
        console.error('加载完成任务失败:', error);
      }
    };

    // 加载能量等级
    const loadEnergyLevel = () => {
      try {
        const storedLevel = localStorage.getItem('energyBoost_currentLevel');
        if (storedLevel) {
          // 如果存在保存的能量等级，优先使用
          const savedLevel = JSON.parse(storedLevel);
          setEnergyLevel(Math.min(savedLevel, 100));
        } else {
          // 如果没有保存的能量等级，基于已完成任务数量计算
          const storedTasks = localStorage.getItem('energyBoost_completedTasks');
          if (storedTasks) {
            const loadedTasks = JSON.parse(storedTasks);
            const newEnergyLevel = 50 + loadedTasks.length * 12.5;
            setEnergyLevel(Math.min(newEnergyLevel, 100));
          }
        }
      } catch (error) {
        console.error('加载能量等级失败:', error);
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
    loadEnergyLevel();
    loadEnergyHistory();

    //生成活动
    const newActivities = generateRandomActivities();
    setActivities(newActivities);
    setEnergyGuidance(getRandomGuidance());

    setLoading(false);
  }, [generateRandomActivities, getRandomGuidance, visitEnergyBoostPage, pageVisited, energyData]);

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
    
    // 保存当前能量等级到本地存储
    localStorage.setItem('energyBoost_currentLevel', JSON.stringify(newEnergyLevel));

    // 获取任务的UP奖励
    const activity = ENERGY_ACTIVITIES.find(a => a.id === taskId);
    const upReward = activity ? activity.upReward : 0;

    // 记录到历史
    if (!completedTasks.includes(taskId)) {
      // 添加UP能量到能量树
      addEnergyBoostUP(taskId, upReward);

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
      localStorage.removeItem('energyBoost_currentLevel');
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
      {/* 优化的导航标题栏 */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white truncate">每日能量提升</h1>
            <button
              onClick={handleResetTasks}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm"
              title="重置任务"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.003 8.003 0 014.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 001 1H9z" />
              </svg>
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-4 max-w-4xl pb-20">
        {/* 能量球卡片 */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative">
            {/* 能量球主体 */}
            <div
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-500"
              style={{
                background: `conic-gradient(
                  from 0deg at 50% 50%,
                  #f97316 0deg,
                  #f59e0b ${energyLevel * 3.6}deg,
                  #fef3c7 ${energyLevel * 3.6}deg,
                  #fef3c7 360deg
                )`
              }}
            >
              <div className="absolute inset-4 bg-gradient-to-br from-white to-orange-50 rounded-full flex flex-col items-center justify-center">
                <div className="text-lg font-bold text-orange-600">{energyLevel}%</div>
                <div className="text-xs text-orange-500 mt-1">能量指数</div>
              </div>
            </div>
            {/* 能量球装饰光效 */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-orange-300/20 to-transparent animate-pulse"></div>
          </div>

          {/* UP能量显示 */}
          <div className="mt-4 text-center">
            <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-lg">
              <span className="text-sm font-semibold">今日UP能量</span>
              <span className="text-lg font-bold ml-2">
                {energyData?.energyBoostUP || 0} / {DAILY_CONFIG.ENERGY_BOOST_UP_LIMIT}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 text-center px-2">
            完成任务可以提升能量等级，并额外获得UP能量
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
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-4 border border-orange-100 dark:border-orange-800/40">
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 flex items-center">
              <span className="mr-2">📊</span>
              近期能量记录
            </h3>
            <div className="space-y-2">
              {energyHistory.slice(-7).reverse().map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-100/70 dark:border-orange-800/30">
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 mr-2.5"></div>
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{record.date}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {record.tasksCompleted} 个任务
                    </span>
                    <span className="font-bold text-xs text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">
                      {record.energyLevel}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 能量提升建议 */}
        <div className="bg-gradient-to-br from-orange-100/60 to-amber-100/60 dark:from-orange-900/15 dark:to-amber-900/15 rounded-lg shadow-md p-4 border border-orange-200/50 dark:border-orange-800/30 backdrop-blur-sm">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 flex items-center">
            <span className="mr-2">💡</span>
            能量提升建议
          </h3>
          <ul className="space-y-2.5">
            <li className="flex items-start p-2.5 bg-white/40 dark:bg-black/5 rounded-lg">
              <span className="text-base mr-2.5">💪</span>
              <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed flex-1">
                坚持每天完成能量任务，养成良好习惯
              </p>
            </li>
            <li className="flex items-start p-2.5 bg-white/40 dark:bg-black/5 rounded-lg">
              <span className="text-base mr-2.5">🌅</span>
              <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed flex-1">
                早上起床后进行简单的拉伸和冥想
              </p>
            </li>
            <li className="flex items-start p-2.5 bg-white/40 dark:bg-black/5 rounded-lg">
              <span className="text-base mr-2.5">🥗</span>
              <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed flex-1">
                合理饮食，多吃富含蛋白质和维生素的食物
              </p>
            </li>
            <li className="flex items-start p-2.5 bg-white/40 dark:bg-black/5 rounded-lg">
              <span className="text-base mr-2.5">😴</span>
              <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed flex-1">
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