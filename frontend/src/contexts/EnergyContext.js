import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DAILY_CONFIG, generateBubble } from '../constants/energyLevels';

// 创建能量Context
const EnergyContext = createContext(null);

/**
 * 能量管理Provider
 */
export const EnergyProvider = ({ children }) => {
  const [energyData, setEnergyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [energyBoostVisited, setEnergyBoostVisited] = useState(false);

  // 初始化能量数据
  useEffect(() => {
    const initializeEnergy = async () => {
      try {
        const stored = localStorage.getItem('energyData');
        let data;

        if (stored) {
          data = JSON.parse(stored);
        } else {
          // 初始化数据
          data = {
            totalEnergy: 0,
            currentLevel: 1,
            dailyCollected: 0,
            dailyLimit: DAILY_CONFIG.DAILY_LIMIT,
            lastOpenDate: null,
            bubbles: [],
            history: [],
            energyBoostVisited: false,
            energyBoostUP: 0,
            lastBoostDate: null,
            boostCompletedTasks: [],
            shownLevels: [1], // 已提示过的等级
          };
        }

        // 检查每日签到
        const today = new Date().toDateString();
        if (data.lastOpenDate !== today) {
          // 新的一天，重置每日收集并签到奖励
          data.dailyCollected = DAILY_CONFIG.SIGN_IN_REWARD;
          data.totalEnergy += DAILY_CONFIG.SIGN_IN_REWARD;
          data.lastOpenDate = today;

          // 添加历史记录
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
          if (!data.history.find(h => h.date === yesterday)) {
            data.history.unshift({
              date: yesterday,
              collected: 0,
            });
          }

          // 清理过期气泡
          const now = new Date();
          data.bubbles = data.bubbles.filter(bubble => {
            const expiresAt = new Date(bubble.expiresAt);
            return expiresAt > now;
          });

          // 检查能量提升页面访问状态
          if (data.lastBoostDate !== today) {
            // 新的一天，重置能量提升相关状态
            data.energyBoostVisited = false;
            data.energyBoostUP = 0;
            data.boostCompletedTasks = [];
            data.lastBoostDate = today;
          }
        }

        setEnergyData(data);
        saveEnergyData(data);
        setLoading(false);
      } catch (error) {
        console.error('初始化能量数据失败:', error);
        setLoading(false);
      }
    };

    initializeEnergy();
  }, []);

  // 保存能量数据
  const saveEnergyData = useCallback((data) => {
    try {
      localStorage.setItem('energyData', JSON.stringify(data));
    } catch (error) {
      console.error('保存能量数据失败:', error);
    }
  }, []);

  // 添加能量
  const addEnergy = useCallback((amount, source = 'unknown') => {
    setEnergyData(prev => {
      if (!prev) return prev;

      // 检查每日上限
      const newDailyCollected = prev.dailyCollected + amount;
      const actualAmount = Math.min(amount, Math.max(0, prev.dailyLimit - prev.dailyCollected));

      if (actualAmount <= 0) {
        console.log(`[${source}] 已达到每日能量上限`);
        return prev;
      }

      const updated = {
        ...prev,
        totalEnergy: prev.totalEnergy + actualAmount,
        dailyCollected: newDailyCollected,
      };

      saveEnergyData(updated);
      console.log(`[${source}] 获得 ${actualAmount} 能量 (总计: ${updated.totalEnergy})`);
      return updated;
    });
  }, [saveEnergyData]);

  // 添加首页能量球能量
  const addDailyEnergyScore = useCallback((score) => {
    setEnergyData(prev => {
      if (!prev) return prev;

      // 检查每日上限
      const newDailyCollected = prev.dailyCollected + score;
      const actualAmount = Math.min(score, Math.max(0, prev.dailyLimit - prev.dailyCollected));

      if (actualAmount <= 0) {
        console.log('[首页能量球] 已达到每日能量上限');
        return prev;
      }

      const updated = {
        ...prev,
        totalEnergy: prev.totalEnergy + actualAmount,
        dailyCollected: newDailyCollected,
      };

      saveEnergyData(updated);
      console.log(`[首页能量球] 获得 ${actualAmount} 能量 (总计: ${updated.totalEnergy})`);
      return updated;
    });
  }, [saveEnergyData]);

  // 访问能量提升页面
  const visitEnergyBoostPage = useCallback(() => {
    setEnergyData(prev => {
      if (!prev) return prev;

      // 如果今天已经访问过，不再给予奖励
      if (prev.energyBoostVisited) {
        console.log('[能量提升页] 今日已访问过，不再给予奖励');
        return prev;
      }

      // 检查每日上限
      const reward = DAILY_CONFIG.ENERGY_BOOST_PAGE_REWARD;
      const newDailyCollected = prev.dailyCollected + reward;
      const actualAmount = Math.min(reward, Math.max(0, prev.dailyLimit - prev.dailyCollected));

      if (actualAmount <= 0) {
        console.log('[能量提升页] 已达到每日能量上限');
        return {
          ...prev,
          energyBoostVisited: true,
        };
      }

      const updated = {
        ...prev,
        totalEnergy: prev.totalEnergy + actualAmount,
        dailyCollected: newDailyCollected,
        energyBoostVisited: true,
      };

      saveEnergyData(updated);
      console.log(`[能量提升页] 获得 ${actualAmount} 能量 (总计: ${updated.totalEnergy})`);
      return updated;
    });
  }, [saveEnergyData]);

  // 添加UP能量（能量提升任务奖励）
  const addEnergyBoostUP = useCallback((taskId, upAmount) => {
    setEnergyData(prev => {
      if (!prev) return prev;

      // 检查是否已完成过这个任务
      if (prev.boostCompletedTasks && prev.boostCompletedTasks.includes(taskId)) {
        console.log(`[能量提升UP] 任务${taskId}已完成，不再给予UP能量`);
        return prev;
      }

      // 检查UP能量上限
      const newUP = (prev.energyBoostUP || 0) + upAmount;
      const actualUP = Math.min(upAmount, Math.max(0, DAILY_CONFIG.ENERGY_BOOST_UP_LIMIT - (prev.energyBoostUP || 0)));

      if (actualUP <= 0) {
        console.log('[能量提升UP] 已达到UP能量上限');
        return prev;
      }

      const completedTasks = prev.boostCompletedTasks || [];
      const updated = {
        ...prev,
        energyBoostUP: newUP,
        boostCompletedTasks: [...completedTasks, taskId],
      };

      saveEnergyData(updated);
      console.log(`[能量提升UP] 任务${taskId} 获得 ${actualUP} UP能量 (总计: ${updated.energyBoostUP}/${DAILY_CONFIG.ENERGY_BOOST_UP_LIMIT})`);
      return updated;
    });
  }, [saveEnergyData]);

  // 记录已提示的等级
  const markLevelShown = useCallback((level) => {
    setEnergyData(prev => {
      if (!prev) return prev;

      // 如果这个等级已经提示过，不再重复记录
      if (prev.shownLevels && prev.shownLevels.includes(level)) {
        return prev;
      }

      const updated = {
        ...prev,
        shownLevels: [...(prev.shownLevels || []), level],
      };

      saveEnergyData(updated);
      console.log(`[等级提示] 已记录等级 ${level} 的提示`);
      return updated;
    });
  }, [saveEnergyData]);

  // 检查等级是否已经提示过
  const isLevelShown = useCallback((level) => {
    if (!energyData || !energyData.shownLevels) return false;
    return energyData.shownLevels.includes(level);
  }, [energyData]);

  // 收集气泡能量
  const collectBubble = useCallback((bubbleId) => {
    setEnergyData(prev => {
      if (!prev) return prev;

      const bubbleIndex = prev.bubbles.findIndex(b => b.id === bubbleId);
      if (bubbleIndex === -1) return prev;

      const bubble = prev.bubbles[bubbleIndex];
      const actualAmount = Math.min(bubble.energy, Math.max(0, prev.dailyLimit - prev.dailyCollected));

      const updated = {
        ...prev,
        totalEnergy: prev.totalEnergy + actualAmount,
        dailyCollected: prev.dailyCollected + actualAmount,
        bubbles: prev.bubbles.filter(b => b.id !== bubbleId),
      };

      saveEnergyData(updated);
      return updated;
    });
  }, [saveEnergyData]);

  // 生成新气泡
  const spawnBubble = useCallback(() => {
    setEnergyData(prev => {
      if (!prev) return prev;

      const newBubble = generateBubble(DAILY_CONFIG.VISIT_REWARD);
      const updated = {
        ...prev,
        bubbles: [...prev.bubbles, newBubble],
      };

      // 限制气泡数量，最多保留20个
      if (updated.bubbles.length > 20) {
        updated.bubbles = updated.bubbles.slice(-20);
      }

      saveEnergyData(updated);
      return updated;
    });
  }, [saveEnergyData]);

  // 更新历史记录
  const updateHistory = useCallback((date, collected) => {
    setEnergyData(prev => {
      if (!prev) return prev;

      const historyIndex = prev.history.findIndex(h => h.date === date);
      let newHistory;

      if (historyIndex !== -1) {
        newHistory = [...prev.history];
        newHistory[historyIndex] = { date, collected };
      } else {
        newHistory = [{ date, collected }, ...prev.history];
      }

      // 只保留最近7天记录
      if (newHistory.length > 7) {
        newHistory = newHistory.slice(0, 7);
      }

      const updated = {
        ...prev,
        history: newHistory,
      };

      saveEnergyData(updated);
      return updated;
    });
  }, [saveEnergyData]);

  // 获取今日能量进度
  const getTodayProgress = useCallback(() => {
    if (!energyData) return { collected: 0, limit: DAILY_CONFIG.DAILY_LIMIT, percentage: 0 };

    return {
      collected: energyData.dailyCollected,
      limit: energyData.dailyLimit,
      percentage: (energyData.dailyCollected / energyData.dailyLimit) * 100,
    };
  }, [energyData]);

  // 获取气泡总数
  const getBubblesCount = useCallback(() => {
    if (!energyData) return 0;
    const now = new Date();
    return energyData.bubbles.filter(b => new Date(b.expiresAt) > now).length;
  }, [energyData]);

  const value = {
    energyData,
    loading,
    addEnergy,
    addDailyEnergyScore,
    visitEnergyBoostPage,
    addEnergyBoostUP,
    collectBubble,
    spawnBubble,
    updateHistory,
    getTodayProgress,
    getBubblesCount,
    saveEnergyData,
    markLevelShown,
    isLevelShown,
  };

  return <EnergyContext.Provider value={value}>{children}</EnergyContext.Provider>;
};

/**
 * 使用能量Context的Hook
 */
export const useEnergy = () => {
  const context = useContext(EnergyContext);
  if (!context) {
    throw new Error('useEnergy must be used within EnergyProvider');
  }
  return context;
};

export default EnergyContext;
