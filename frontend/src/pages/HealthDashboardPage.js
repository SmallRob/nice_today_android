import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserConfig } from '../contexts/UserConfigContext.js';
import LazyHealthCard from '../components/health/LazyHealthCard.js';
import StageHealthCard from '../components/health/StageHealthCard.js';
import BiorhythmStatusCard from '../components/health/BiorhythmStatusCard.js';
import AgileHealthCard from '../components/health/AgileHealthCard.js';
import SeasonalHealthCard from '../components/health/SeasonalHealthCard.js';
import BodyMetricsRhythmCard from '../components/health/BodyMetricsRhythmCard.js';
import DressDietCard from '../components/health/DressDietCard.js';
import DietHealthCard from '../components/health/DietHealthCard.js';
import BloodTypeHealthCard from '../components/health/BloodTypeHealthCard.js';
import SimpleEmoHealthCard from '../components/health/SimpleEmoHealthCard';
import StepCounterCard from '../components/health/StepCounterCard';
import mobileScreenOptimization from '../utils/mobileScreenOptimization.js';
import '../styles/mobileScreenOptimization.css';
import './HealthDashboardPage.css';

// 健康身心仪表板 - 主页面
const HealthDashboardPage = () => {
  const navigate = useNavigate();
  const { userConfig } = useUserConfig();
  
  // 移动屏幕优化初始化
  useEffect(() => {
    const isMobile = mobileScreenOptimization.getScreenType() === 'mobile';
    
    // 添加移动优化监听器
    mobileScreenOptimization.addMobileOptimizationListener();
    
    // 初始化优化
    if (isMobile) {
      const healthGrid = document.querySelector('.health-dashboard-grid');
      if (healthGrid) {
        healthGrid.classList.add('mobile-optimization-container');
        mobileScreenOptimization.optimizeLayoutForMobile(healthGrid);
      }
    }
    
    // 清理函数
    return () => {
      mobileScreenOptimization.removeMobileOptimizationListener();
    };
  }, []);
  
  // 预定义卡片配置
  const cardConfigs = useMemo(() => [
    {
      id: 'stage-health',
      component: StageHealthCard,
      priority: 1, // 高优先级，首屏加载
      cacheKey: 'stage-health',
      title: '阶段养生提醒卡片'
    },
    {
      id: 'biorhythm-status',
      component: BiorhythmStatusCard,
      priority: 1, // 高优先级，首屏加载
      cacheKey: 'biorhythm-status',
      title: '每日生物节律状态卡片'
    },
    {
      id: 'step-counter',
      component: StepCounterCard,
      priority: 1, // 高优先级，运动健康重要
      cacheKey: 'step-counter',
      title: '步数计数器卡片'
    },
    {
      id: 'dress-diet',
      component: DressDietCard,
      priority: 2, // 高计算复杂度，中优先级
      cacheKey: 'dress-diet',
      title: '每日穿搭与饮食建议卡片'
    },
    {
      id: 'agile-health',
      component: AgileHealthCard,
      priority: 2, // 中优先级，快速加载
      cacheKey: 'agile-health',
      title: '敏捷养生卡片'
    },
    {
      id: 'seasonal-health',
      component: SeasonalHealthCard,
      priority: 3, // 中优先级
      cacheKey: 'seasonal-health',
      title: '当季养生健康提醒卡片'
    },
    {
      id: 'body-metrics',
      component: BodyMetricsRhythmCard,
      priority: 3, // 中优先级
      cacheKey: 'body-metrics',
      title: '身体指标与器官节律卡片'
    },
    {
      id: 'diet-health',
      component: DietHealthCard,
      priority: 4, // 中优先级
      cacheKey: 'diet-health',
      title: '饮食健康'
    },
    {
      id: 'blood-type-health',
      component: BloodTypeHealthCard,
      priority: 2, // 高优先级，重要健康信息
      cacheKey: 'blood-type-health',
      title: '血型健康管理卡片'
    },
    {
      id: 'emo-health',
      component: SimpleEmoHealthCard,
      priority: 1, // 高优先级，情绪健康重要
      cacheKey: 'emo-health',
      title: '情绪与健康'
    }
  ], []);
  
  return (
    <div className="health-dashboard-page">
      {/* 页面头部 */}
      <div className="health-dashboard-header">
        <div className="health-dashboard-title">
          <h1>健康身心</h1>
          <p>关注身心健康，享受美好生活</p>
        </div>
      </div>

      {/* 健康身心仪表板卡片网格 */}
      <div className="health-dashboard-grid">
        {cardConfigs.map((cardConfig, index) => (
          <LazyHealthCard
            key={cardConfig.id}
            component={cardConfig.component}
            cacheKey={cardConfig.cacheKey}
            priority={cardConfig.priority}
            loadingComponent={
              <div className="health-card">
                <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-4 rounded-2xl text-white shadow-lg h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">加载中...</p>
                  </div>
                </div>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
};

export default HealthDashboardPage;