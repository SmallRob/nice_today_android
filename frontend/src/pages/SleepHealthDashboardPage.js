import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserConfig } from '../contexts/UserConfigContext.js';
import useSleepData from '../hooks/useSleepData';
import { calculateSleepScore } from '../utils/sleepCalculator.js';
import { formatTime } from '../utils/timeUtils.js';
import './SleepHealthDashboardPage.css';

// 睡眠健康仪表板页面
const SleepHealthDashboardPage = () => {
  const navigate = useNavigate();
  const { userConfig } = useUserConfig();
  const { sleepData, isLoading, error } = useSleepData();
  
  // 计算睡眠评分
  const sleepScore = useMemo(() => {
    if (!sleepData) return null;
    return calculateSleepScore(sleepData);
  }, [sleepData]);

  // 格式化时间显示
  const formatSleepTime = (minutes) => {
    if (!minutes) return '0分钟';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  };

  return (
    <div className="sleep-health-dashboard-page">
      {/* 页面头部 */}
      <div className="sleep-health-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="返回"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
          </svg>
        </button>
        <h1 className="page-title">睡眠评分</h1>
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
        {/* 睡眠评分卡片 */}
        <div className="sleep-score-card">
          <div className="score-header">
            <h2 className="score-title">睡眠评分</h2>
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
                <span className="score-value">{sleepScore?.totalScore || 0}</span>
              </div>
            </div>
            <h3 className="score-label">非常低</h3>
          </div>

          {/* 睡眠指标 */}
          <div className="sleep-metrics">
            <div className="metric-item">
              <div className="metric-label">
                <span className="metric-icon">●</span>
                <span className="metric-name">时长:</span>
              </div>
              <div className="metric-value">
                <span className="metric-amount">{formatSleepTime(sleepData?.totalDuration || 0) || '0分钟'}</span>
                <span className="metric-range">4/50</span>
              </div>
            </div>
            
            <div className="metric-item">
              <div className="metric-label">
                <span className="metric-icon" style={{color: '#10b981'}}>●</span>
                <span className="metric-name">就寝:</span>
              </div>
              <div className="metric-value">
                <span className="metric-amount">{formatTime(sleepData?.sleepTime) || '--:--'}</span>
                <span className="metric-range">10/30</span>
              </div>
            </div>
            
            <div className="metric-item">
              <div className="metric-label">
                <span className="metric-icon" style={{color: '#f97316'}}>●</span>
                <span className="metric-name">中断:</span>
              </div>
              <div className="metric-value">
                <span className="metric-amount">{sleepData?.interruptions || 0}</span>
                <span className="metric-range">0/20</span>
              </div>
            </div>
          </div>

          {/* 评分说明 */}
          <div className="score-description">
            <p>你的得分相当低。尽量按时就寝，以便休息和恢复。</p>
          </div>
        </div>

        {/* 睡眠详情区域 */}
        <div className="sleep-details-section">
          <div className="section-title">睡眠</div>
          
          {/* 睡眠图表 */}
          <div className="sleep-chart">
            <div className="chart-container">
              <div className="chart-bars">
                <div className="chart-bar" style={{height: '20%'}}>
                  <div className="bar-label">04:49</div>
                </div>
                <div className="chart-bar" style={{height: '80%', backgroundColor: '#6366f1'}}>
                  <div className="bar-label">09:06</div>
                </div>
              </div>
            </div>
            <div className="chart-summary">
              <span className="total-duration">2小时31分钟</span>
            </div>
          </div>

          {/* 生命体征 */}
          <div className="vital-signs">
            <div className="section-title">生命体征</div>
            <div className="vital-signs-content">
              <div className="vital-signs-points">
                {[1, 2, 3, 4, 5].map((point) => (
                  <div 
                    key={point} 
                    className="vital-sign-point"
                    style={{left: `${point * 20}%`}}
                  />
                ))}
              </div>
              <div className="anomaly-indicator">
                <span>1个异常值</span>
                <div className="anomaly-line" />
              </div>
            </div>
          </div>
        </div>

        {/* 健康提示 */}
        <div className="health-tips-section">
          <div className="section-header">
            <h3 className="section-title">提要</h3>
            <button className="show-all-button">全部显示</button>
          </div>
          
          <div className="tip-item">
            <div className="tip-icon">❤️</div>
            <div className="tip-content">
              <h4 className="tip-title">心率：睡眠</h4>
              <p className="tip-description">
                睡眠期间，你的心率介于52到67次/分钟之间。
              </p>
              <div className="heart-rate-graph">
                <div className="graph-container">
                  <div className="graph-bars">
                    {[52, 67, 60, 65, 58, 62, 64].map((value, index) => (
                      <div 
                        key={index}
                        className="graph-bar"
                        style={{height: `${(value - 52) / 15 * 100}%`, left: `${index * 14}%`}}
                      />
                    ))}
                  </div>
                  <div className="graph-labels">
                    <div className="graph-label" style={{left: '0%'}}>最高<br/>67</div>
                    <div className="graph-label" style={{left: '100%', textAlign: 'right'}}>最低<br/>52</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default SleepHealthDashboardPage;