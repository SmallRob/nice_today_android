import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 敏捷养生卡片组件
const AgileHealthCard = ({ onClick }) => {
  const navigate = useNavigate();
  
  // 微任务库
  const microTaskLibrary = [
    { id: 1, title: '眼保健操', description: '标准眼保健操+远眺', duration: '10分钟', category: '办公间隙', icon: '👀', type: 'eye-care' },
    { id: 2, title: '肩颈操', description: '低头/抬头/转颈+按揉风池穴', duration: '8分钟', category: '办公间隙', icon: '💆', type: 'neck-care' },
    { id: 3, title: '腹式呼吸', description: '鼻吸口呼，每次呼吸6秒', duration: '3分钟', category: '办公间隙', icon: '🫁', type: 'breathing' },
    { id: 4, title: '五行唤醒', description: '叩齿36下+搓热双手敷眼+按揉足三里', duration: '10分钟', category: '晨起', icon: '🌅', type: 'morning' },
    { id: 5, title: '睡前揉腹', description: '泡脚+揉腹', duration: '10分钟', category: '睡前', icon: '😴', type: 'night' },
    { id: 6, title: '八段锦入门', description: '两手托天理三焦+左右开弓似射雕', duration: '10分钟', category: '运动', icon: '🧘', type: 'exercise' },
    { id: 7, title: '踮脚养生', description: '踮脚起落+散步', duration: '5分钟', category: '运动', icon: '🦵', type: 'exercise' },
    { id: 8, title: '静坐冥想', description: '关注呼吸，静心冥想', duration: '5分钟', category: '放松', icon: '🧘', type: 'meditation' },
    { id: 9, title: '梳头养生', description: '从额到颈，通经络', duration: '3分钟', category: '放松', icon: '💇', type: 'relaxation' },
    { id: 10, title: '转腰运动', description: '疏通带脉', duration: '5分钟', category: '运动', icon: '💪', type: 'exercise' }
  ];

  // 从本地存储获取用户设置的缓存超时时间
  const getUserCacheTimeout = () => {
    const savedCacheTimeout = localStorage.getItem('cacheTimeout');
    return savedCacheTimeout ? parseInt(savedCacheTimeout) : 10800000; // 默认3小时
  };

  // 生成缓存键
  const getCacheKey = () => {
    const today = new Date().toDateString();
    return `agile-health-tasks-${today}`;
  };

  // 检查缓存
  const getCachedData = () => {
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { tasks, timestamp, date: cacheDate } = JSON.parse(cached);
        const now = Date.now();
        const currentDate = new Date().toDateString();
        
        // 检查是否跨天（隔天重新计算策略）
        if (cacheDate !== currentDate) {
          localStorage.removeItem(cacheKey);
          return null;
        }
        
        // 检查缓存是否超时
        const cacheTimeout = getUserCacheTimeout();
        if (now - timestamp < cacheTimeout) {
          return tasks;
        } else {
          // 清除过期缓存
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (e) {
      console.warn('读取缓存失败:', e);
    }
    return null;
  };

  // 设置缓存
  const setCachedData = (tasks) => {
    try {
      const cacheKey = getCacheKey();
      const currentDate = new Date().toDateString();
      const cacheData = {
        tasks,
        timestamp: Date.now(),
        date: currentDate  // 添加日期信息用于隔天检查
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('设置缓存失败:', e);
    }
  };

  // 从本地存储获取任务状态（带用户自定义缓存时间）
  const getStoredTasks = () => {
    try {
      const stored = localStorage.getItem('agileHealthTasks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // 从本地存储获取今日任务（带用户自定义缓存时间）
  const getStoredDailyTasks = () => {
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { tasks, timestamp, date: cacheDate } = JSON.parse(cached);
        const now = Date.now();
        const currentDate = new Date().toDateString();
        
        // 检查是否跨天（隔天重新计算策略）
        if (cacheDate !== currentDate) {
          localStorage.removeItem(cacheKey);
          return null;
        }
        
        // 检查缓存是否超时
        const cacheTimeout = getUserCacheTimeout();
        if (now - timestamp < cacheTimeout) {
          return tasks;
        } else {
          // 清除过期缓存
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (e) {
      console.warn('读取缓存失败:', e);
    }
    return null;
  };

  // 保存任务状态到本地存储
  const saveTaskStatus = (tasks) => {
    try {
      localStorage.setItem('agileHealthTasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('保存任务状态失败:', e);
    }
  };

  // 保存今日任务到本地存储（带用户自定义缓存时间）
  const saveDailyTasks = (tasks) => {
    try {
      const cacheKey = getCacheKey();
      const currentDate = new Date().toDateString();
      const cacheData = {
        tasks,
        timestamp: Date.now(),
        date: currentDate  // 添加日期信息用于隔天检查
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (e) {
      console.error('保存今日任务失败:', e);
    }
  };



  const [dailyTasks, setDailyTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 初始化任务
  useEffect(() => {
    const initTasks = async () => {
      // 检查缓存中的任务
      let storedDailyTasks = getStoredDailyTasks();
      let storedCompletedTasks = getStoredTasks();

      if (!storedDailyTasks) {
        // 生成今日任务
        const selectedTasks = [];
        const categories = ['办公间隙', '晨起', '睡前', '运动', '放松'];
        
        categories.forEach(category => {
          const categoryTasks = microTaskLibrary.filter(task => task.category === category);
          if (categoryTasks.length > 0) {
            const randomTask = categoryTasks[Math.floor(Math.random() * categoryTasks.length)];
            selectedTasks.push(randomTask);
          }
        });

        // 如果不足3个，从剩余任务中随机补充
        const remainingTasks = microTaskLibrary.filter(task => 
          !selectedTasks.some(t => t.id === task.id)
        );
        
        while (selectedTasks.length < 3 && remainingTasks.length > 0) {
          const randomIndex = Math.floor(Math.random() * remainingTasks.length);
          selectedTasks.push(remainingTasks[randomIndex]);
          remainingTasks.splice(randomIndex, 1);
        }

        storedDailyTasks = selectedTasks.slice(0, 3); // 最多3个任务
        saveDailyTasks(storedDailyTasks);
      }

      setDailyTasks(storedDailyTasks);
      setCompletedTasks(storedCompletedTasks);
      setLoading(false);
    };

    initTasks();
  }, []);

  // 切换任务完成状态
  const toggleTaskCompletion = (taskId) => {
    const newCompletedTasks = completedTasks.includes(taskId)
      ? completedTasks.filter(id => id !== taskId)
      : [...completedTasks, taskId];
    
    setCompletedTasks(newCompletedTasks);
    saveTaskStatus(newCompletedTasks);
  };

  // 换一换任务
  const refreshTasks = () => {
    const selectedTasks = [];
    const categories = ['办公间隙', '晨起', '睡前', '运动', '放松'];
    
    categories.forEach(category => {
      const categoryTasks = microTaskLibrary.filter(task => task.category === category);
      if (categoryTasks.length > 0) {
        const randomTask = categoryTasks[Math.floor(Math.random() * categoryTasks.length)];
        selectedTasks.push(randomTask);
      }
    });

    // 如果不足3个，从剩余任务中随机补充
    const remainingTasks = microTaskLibrary.filter(task => 
      !selectedTasks.some(t => t.id === task.id)
    );
    
    while (selectedTasks.length < 3 && remainingTasks.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingTasks.length);
      selectedTasks.push(remainingTasks[randomIndex]);
      remainingTasks.splice(randomIndex, 1);
    }

    const newTasks = selectedTasks.slice(0, 3);
    setDailyTasks(newTasks);
    saveDailyTasks(newTasks);
    // 重置完成状态
    setCompletedTasks([]);
    saveTaskStatus([]);
  };

  const completedCount = completedTasks.length;
  const totalCount = dailyTasks.length;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/agile-health');
    }
  };

  if (loading) {
    return (
      <div className="health-card agile-health-card">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-2xl text-white shadow-lg h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="health-card agile-health-card"
      onClick={handleClick}
    >
      <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-2xl text-white shadow-lg h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl">⚡</div>
          <div className="text-right">
            <h3 className="font-bold text-lg">敏捷养生</h3>
            <p className="text-sm opacity-90">今日任务</p>
          </div>
        </div>
        
        <div className="text-center mb-3">
          <div className="text-3xl font-bold mb-1">{completedCount}/{totalCount}</div>
          <p className="text-sm opacity-80">已完成/总任务</p>
        </div>

        {/* 今日任务列表 */}
        <div className="space-y-2 mb-3">
          {dailyTasks.map((task, index) => (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                completedTasks.includes(task.id) 
                  ? 'bg-white bg-opacity-20' 
                  : 'bg-white bg-opacity-10'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskCompletion(task.id);
              }}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={completedTasks.includes(task.id)}
                  onChange={() => toggleTaskCompletion(task.id)}
                  className="w-4 h-4 rounded bg-white bg-opacity-20 border-white border-opacity-30 text-green-500 focus:ring-green-500 mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskCompletion(task.id);
                  }}
                />
                <div>
                  <div className="font-medium flex items-center">
                    <span className="mr-2">{task.icon}</span>
                    {task.title}
                  </div>
                  <div className="opacity-75">{task.duration}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 换一换按钮 */}
        <div className="flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              refreshTasks();
            }}
            className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full transition-all flex items-center"
          >
            <span className="mr-1">🔄</span>
            换一换
          </button>
        </div>

        {/* 完成提示 */}
        {completedCount > 0 && (
          <div className="mt-2 pt-2 border-t border-white border-opacity-20">
            <p className="text-xs opacity-75 text-center">
              {completedCount === totalCount 
                ? '🎉 恭喜完成所有任务！' 
                : `还有 ${totalCount - completedCount} 个任务待完成`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgileHealthCard;