import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserConfig } from '../contexts/UserConfigContext.js';
import StageHealthCard from '../components/health/StageHealthCard.js';
import BiorhythmStatusCard from '../components/health/BiorhythmStatusCard.js';
import AgileHealthCard from '../components/health/AgileHealthCard.js';
import SeasonalHealthCard from '../components/health/SeasonalHealthCard.js';
import BodyMetricsRhythmCard from '../components/health/BodyMetricsRhythmCard.js';
import DressDietCard from '../components/health/DressDietCard.js';
import './HealthDashboardPage.css';

// 健康身心仪表板 - 主页面
const HealthDashboardPage = () => {
  const navigate = useNavigate();
  const { userConfig } = useUserConfig();
  
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
        {/* 1. 阶段养生提醒卡片 */}
        <StageHealthCard />

        {/* 2. 每日生物节律状态卡片 */}
        <BiorhythmStatusCard />

        {/* 3. 敏捷养生卡片 */}
        <AgileHealthCard />

        {/* 4. 当季养生健康提醒卡片 */}
        <SeasonalHealthCard />

        {/* 5. 身体指标与器官节律卡片 */}
        <BodyMetricsRhythmCard />

        {/* 6. 每日穿搭与饮食建议卡片 */}
        <DressDietCard />
      </div>
    </div>
  );
};

export default HealthDashboardPage;