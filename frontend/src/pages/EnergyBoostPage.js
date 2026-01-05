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
    // 获取今天的日期字符串
    const getTodayDateString = () => {
      return new Date().toISOString().split('T')[0];
    };

    // 检查并重置每日任务
    const checkAndResetDailyTasks = () => {
      const today = getTodayDateString();
      const lastResetDate = localStorage.getItem('energyBoost_lastResetDate');
      
      // 如果没有重置日期或者不是今天，则重置任务
      if (!lastResetDate || lastResetDate !== today) {
        console.log('检测到新的一天，重置每日任务');
        
        // 重置任务状态
        setCompletedTasks([]);
        setEnergyLevel(50);
        localStorage.removeItem('energyBoost_completedTasks');
        localStorage.removeItem('energyBoost_currentLevel');
        
        // 保存今天的重置日期
        localStorage.setItem('energyBoost_lastResetDate', today);
        
        // 生成新的每日活动
        const newActivities = generateRandomActivities();
        setActivities(newActivities);
        setEnergyGuidance(getRandomGuidance());
      } else {
        // 如果是今天，加载保存的任务状态
        console.log('今日任务已加载');
        
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
        
        // 如果活动为空，生成新的活动
        if (activities.length === 0) {
          const newActivities = generateRandomActivities();
          setActivities(newActivities);
          setEnergyGuidance(getRandomGuidance());
        }
      }
    };

    // 执行检查和重置
    checkAndResetDailyTasks();

    setLoading(false);
  }, [generateRandomActivities, getRandomGuidance, visitEnergyBoostPage, pageVisited, energyData, activities.length]);

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
    if (window.confirm('确定要重置今日任务吗？重置后将清除今日进度并生成新的任务。')) {
      // 重置任务状态
      setCompletedTasks([]);
      setEnergyLevel(50);
      localStorage.removeItem('energyBoost_completedTasks');
      localStorage.removeItem('energyBoost_currentLevel');
      
      // 更新重置日期为今天（确保不会在明天自动重置）
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('energyBoost_lastResetDate', today);
      
      // 生成新的活动
      handleRefreshActivities();
      
      // 提示用户
      alert('今日任务已重置！新的任务已生成。');
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
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'linear-gradient(to right, #f97316, #d97706)',
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
          <h1 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            每日能量提升
          </h1>
          <button
            onClick={handleResetTasks}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#ef4444',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '8px 12px',
              fontSize: '14px',
              borderRadius: '8px',
              gap: '4px'
            }}
            title="重置任务"
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.003 8.003 0 014.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 001 1H9z" />
            </svg>
            重置
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{
        margin: '0 auto',
        padding: '16px',
        paddingBottom: '80px',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {/* 能量球卡片 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ position: 'relative' }}>
            {/* 能量球主体 */}
            <div
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.5s ease',
                background: `conic-gradient(
                  from 0deg at 50% 50%,
                  #f97316 0deg,
                  #f59e0b ${energyLevel * 3.6}deg,
                  #fef3c7 ${energyLevel * 3.6}deg,
                  #fef3c7 360deg
                )`
              }}
            >
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                bottom: '16px',
                left: '16px',
                background: 'linear-gradient(to bottom right, #ffffff, #fffbeb)',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#ea580c'
                }}>{energyLevel}%</div>
                <div style={{
                  fontSize: '12px',
                  color: '#f97316',
                  marginTop: '4px'
                }}>能量指数</div>
              </div>
            </div>
            {/* 能量球装饰光效 */}
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes energyBallGlow {
                  0%, 100% { opacity: 0.3; }
                  50% { opacity: 0.8; }
                }
              `
            }} />
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: '50%',
              background: 'linear-gradient(to right, transparent, rgba(251, 146, 60, 0.6), transparent)',
              animation: 'energyBallGlow 2s ease-in-out infinite'
            }}></div>
          </div>

          {/* UP能量显示 */}
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(to right, #a855f7, #ec4899)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>今日UP能量</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', marginLeft: '8px' }}>
                {energyData?.energyBoostUP || 0} / {DAILY_CONFIG.ENERGY_BOOST_UP_LIMIT}
              </span>
            </div>
          </div>

          <p style={{
            fontSize: '14px',
            color: '#4b5563',
            marginTop: '16px',
            textAlign: 'center',
            padding: '0 8px'
          }}>
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
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '16px',
            marginBottom: '16px',
            border: '1px solid rgba(251, 146, 60, 0.1)'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '8px' }}>📊</span>
              近期能量记录
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {energyHistory.slice(-7).reverse().map((record, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'linear-gradient(to right, rgba(255, 237, 213, 0.8), rgba(254, 243, 199, 0.8))',
                  borderRadius: '8px',
                  border: '1px solid rgba(251, 146, 60, 0.7)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'linear-gradient(to right, #fb923c, #f59e0b)',
                      marginRight: '10px'
                    }}></div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#1f2937'
                    }}>{record.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#4b5563'
                    }}>
                      {record.tasksCompleted} 个任务
                    </span>
                    <span style={{
                      fontWeight: 'bold',
                      fontSize: '12px',
                      color: 'transparent',
                      background: 'linear-gradient(to right, #f97316, #d97706)',
                      backgroundClip: 'text'
                    }}>
                      {record.energyLevel}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 能量提升建议 */}
        <div style={{
          background: 'linear-gradient(to bottom right, rgba(255, 237, 213, 0.6), rgba(254, 243, 199, 0.6))',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '16px',
          border: '1px solid rgba(251, 146, 60, 0.5)',
          backdropFilter: 'blur(8px)'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '8px' }}>💡</span>
            能量提升建议
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '16px', marginRight: '10px' }}>💪</span>
              <p style={{
                fontSize: '12px',
                color: '#374151',
                lineHeight: '1.5',
                flex: 1
              }}>
                坚持每天完成能量任务，养成良好习惯
              </p>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '16px', marginRight: '10px' }}>🌅</span>
              <p style={{
                fontSize: '12px',
                color: '#374151',
                lineHeight: '1.5',
                flex: 1
              }}>
                早上起床后进行简单的拉伸和冥想
              </p>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '16px', marginRight: '10px' }}>🥗</span>
              <p style={{
                fontSize: '12px',
                color: '#374151',
                lineHeight: '1.5',
                flex: 1
              }}>
                合理饮食，多吃富含蛋白质和维生素的食物
              </p>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '16px', marginRight: '10px' }}>😴</span>
              <p style={{
                fontSize: '12px',
                color: '#374151',
                lineHeight: '1.5',
                flex: 1
              }}>
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