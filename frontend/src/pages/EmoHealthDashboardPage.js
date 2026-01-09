import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserConfig } from '../contexts/UserConfigContext';
import useEmoHealthData from '../hooks/useEmoHealthData';
import EmoHealthCard from '../components/health/EmoHealthCard';
import './EmoHealthDashboardPage.css';

// 情绪健康仪表板页面
const EmoHealthDashboardPage = () => {
  const navigate = useNavigate();
  const { userConfig } = useUserConfig();
  const { emoHealthData, isLoading, error } = useEmoHealthData();
  
  // 计算情绪评分
  const emoScore = useMemo(() => {
    if (!emoHealthData) return null;
    return emoHealthData.totalScore || 75;
  }, [emoHealthData]);

  return (
    <div className="emo-health-dashboard-page">
      {/* 页面头部 */}
      <div className="emo-health-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="返回"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
          </svg>
        </button>
        <h1 className="page-title">情绪健康</h1>
        <div className="header-actions">
          <button className="info-button" aria-label="更多信息">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="main-content">
        {/* 情绪评分卡片 */}
        <div className="emo-score-card">
          <div className="score-header">
            <h2 className="score-title">情绪评分</h2>
            <button className="refresh-button" aria-label="刷新">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6"/>
                <path d="M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            </button>
          </div>
          
          <div className="score-display">
            <div className="score-circle">
              <div className="score-inner">
                <span className="score-value">{emoScore || 0}</span>
              </div>
            </div>
            <h3 className="score-label">良好</h3>
          </div>

          {/* 情绪指标 */}
          <div className="emo-metrics">
            <div className="metric-item">
              <div className="metric-label">
                <span className="metric-icon">●</span>
                <span className="metric-name">压力水平:</span>
              </div>
              <div className="metric-value">
                <span className="metric-amount">{emoHealthData?.stressLevel || '中等'}</span>
                <span className="metric-range">3/5</span>
              </div>
            </div>
            
            <div className="metric-item">
              <div className="metric-label">
                <span className="metric-icon" style={{color: '#10b981'}}>●</span>
                <span className="metric-name">情绪稳定性:</span>
              </div>
              <div className="metric-value">
                <span className="metric-amount">{emoHealthData?.stability || '稳定'}</span>
                <span className="metric-range">4/5</span>
              </div>
            </div>
            
            <div className="metric-item">
              <div className="metric-label">
                <span className="metric-icon" style={{color: '#f97316'}}>●</span>
                <span className="metric-name">情绪波动:</span>
              </div>
              <div className="metric-value">
                <span className="metric-amount">{emoHealthData?.moodSwings || '轻微'}</span>
                <span className="metric-range">2/5</span>
              </div>
            </div>
          </div>

          {/* 评分说明 */}
          <div className="score-description">
            <p>你的情绪状态良好。保持积极的心态，适当调节压力。</p>
          </div>
        </div>

        {/* 情绪详情区域 */}
        <div className="emo-details-section">
          <div className="section-title">情绪状态</div>
          
          {/* 情绪图表 */}
          <div className="emo-chart">
            <div className="chart-container">
              <div className="chart-bars">
                <div className="chart-bar" style={{height: '60%'}}>
                  <div className="bar-label">平静</div>
                </div>
                <div className="chart-bar" style={{height: '80%', backgroundColor: '#6366f1'}}>
                  <div className="bar-label">快乐</div>
                </div>
                <div className="chart-bar" style={{height: '40%'}}>
                  <div className="bar-label">焦虑</div>
                </div>
              </div>
            </div>
            <div className="chart-summary">
              <span className="total-duration">情绪稳定</span>
            </div>
          </div>

          {/* 情绪能量球 */}
          <div className="emo-energy-balls">
            <div className="energy-ball" style={{backgroundColor: '#10b981'}}>
              <span className="ball-label">平静</span>
            </div>
            <div className="energy-ball" style={{backgroundColor: '#3b82f6'}}>
              <span className="ball-label">快乐</span>
            </div>
            <div className="energy-ball" style={{backgroundColor: '#f97316'}}>
              <span className="ball-label">焦虑</span>
            </div>
          </div>
        </div>

        {/* 健康建议 */}
        <div className="health-tips-section">
          <div className="section-header">
            <h3 className="section-title">情绪健康建议</h3>
            <button className="show-all-button">全部显示</button>
          </div>
          
          <EmoHealthCard />
        </div>
      </div>

      {/* 底部导航 */}
      <div className="bottom-nav">
        <button className="nav-button active">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>摘要</span>
        </button>
        
        <button className="nav-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>共享</span>
        </button>
      </div>
    </div>
  );
};

export default EmoHealthDashboardPage;