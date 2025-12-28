/**
 * 优化版八字月运页面
 * 基于LifeTrendPage.js优化，按周/月/年计算，展现运势趋势
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserConfig } from '../contexts/UserConfigContext';
import BaziCalculator from '../utils/baziCalculator';
import './LifeTrendPage.css';

const LifeTrendPage_optimized = () => {
  const navigate = useNavigate();
  const { currentConfig } = useUserConfig();
  
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [trendData, setTrendData] = useState(null);
  const [currentInsight, setCurrentInsight] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 检测屏幕尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 计算八字运势趋势
  const calculateTrend = useCallback(() => {
    if (!currentConfig?.birthDate) {
      setTrendData(null);
      setCurrentInsight('请先设置您的出生日期以查看八字运势');
      return;
    }

    try {
      const birthDate = new Date(currentConfig.birthDate);
      const today = new Date();
      
      // 根据时间范围计算趋势数据
      const data = BaziCalculator.calculateBaziTrend(birthDate, today, timeRange);
      
      // 获取当前运势洞察
      const insight = BaziCalculator.getBaziInsight(data.current);
      
      setTrendData(data);
      setCurrentInsight(insight);
    } catch (error) {
      console.error('计算八字运势失败:', error);
      setCurrentInsight('计算运势趋势时出现错误，请稍后重试');
    }
  }, [currentConfig?.birthDate, timeRange]);

  useEffect(() => {
    calculateTrend();
  }, [calculateTrend]);

  // 渲染趋势图表
  const renderTrendChart = () => {
    if (!trendData) return null;

    const { trend, current } = trendData;
    const chartHeight = isMobile ? 200 : 250;

    return (
      <div className="trend-chart-container">
        <h3 className="chart-title">运势趋势图</h3>
        
        <div className="trend-chart" style={{ height: `${chartHeight}px` }}>
          <div className="chart-grid">
            {trend.map((item, index) => {
              const isCurrent = index === trend.length - 1;
              const value = item.overallScore;
              
              return (
                <div key={item.period} className="chart-column">
                  <div 
                    className={`chart-bar ${isCurrent ? 'current' : ''} ${value > 0 ? 'positive' : 'negative'}`}
                    style={{ height: `${Math.abs(value) * 60}%` }}
                    title={`${item.period}: ${value.toFixed(1)}分`}
                  >
                    <div className="bar-value">{value > 0 ? '+' : ''}{value.toFixed(1)}</div>
                  </div>
                  <div className="chart-label">
                    {item.period}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 当前运势详情 */}
        <div className="current-trend">
          <h4>当前运势</h4>
          <div className="score-display">
            <span className="score-value">{current.overallScore.toFixed(1)}</span>
            <span className="score-label">综合评分</span>
          </div>
          <div className="aspect-scores">
            <div className="aspect-item">
              <span className="aspect-name">事业</span>
              <span className={`aspect-value ${current.career > 0 ? 'positive' : 'negative'}`}>
                {current.career > 0 ? '+' : ''}{current.career.toFixed(1)}
              </span>
            </div>
            <div className="aspect-item">
              <span className="aspect-name">财运</span>
              <span className={`aspect-value ${current.wealth > 0 ? 'positive' : 'negative'}`}>
                {current.wealth > 0 ? '+' : ''}{current.wealth.toFixed(1)}
              </span>
            </div>
            <div className="aspect-item">
              <span className="aspect-name">健康</span>
              <span className={`aspect-value ${current.health > 0 ? 'positive' : 'negative'}`}>
                {current.health > 0 ? '+' : ''}{current.health.toFixed(1)}
              </span>
            </div>
            <div className="aspect-item">
              <span className="aspect-name">感情</span>
              <span className={`aspect-value ${current.relationship > 0 ? 'positive' : 'negative'}`}>
                {current.relationship > 0 ? '+' : ''}{current.relationship.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染时间范围选择器
  const renderTimeRangeSelector = () => (
    <div className="time-range-selector">
      <button
        className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
        onClick={() => setTimeRange('week')}
      >
        本周趋势
      </button>
      <button
        className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
        onClick={() => setTimeRange('month')}
      >
        本月趋势
      </button>
      <button
        className={`range-btn ${timeRange === 'year' ? 'active' : ''}`}
        onClick={() => setTimeRange('year')}
      >
        本年趋势
      </button>
    </div>
  );

  return (
    <div className="life-trend-page">
      {/* 头部 */}
      <header className="page-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← 返回
        </button>
        <h1 className="page-title">本周趋势 - 八字月运</h1>
        <div className="header-date">
          {new Date().toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          })}
        </div>
      </header>

      {/* 主要内容 */}
      <main className="page-content">
        {/* 时间范围选择 */}
        {renderTimeRangeSelector()}

        {/* 运势洞察 */}
        <div className="insight-card">
          <div className="insight-icon">🔮</div>
          <div className="insight-content">
            <h3>运势洞察</h3>
            <p>{currentInsight}</p>
          </div>
        </div>

        {/* 趋势图表 */}
        {renderTrendChart()}

        {/* 运势建议 */}
        <div className="advice-section">
          <h3>运势建议</h3>
          <div className="advice-grid">
            <div className="advice-item">
              <div className="advice-icon">💼</div>
              <div className="advice-content">
                <h4>事业建议</h4>
                <p>当前运势适合规划长远目标，避免冲动决策。</p>
              </div>
            </div>
            <div className="advice-item">
              <div className="advice-icon">💰</div>
              <div className="advice-content">
                <h4>财运建议</h4>
                <p>保持稳健投资，注意控制不必要的开支。</p>
              </div>
            </div>
            <div className="advice-item">
              <div className="advice-icon">❤️</div>
              <div className="advice-content">
                <h4>感情建议</h4>
                <p>多与家人朋友沟通，增进情感交流。</p>
              </div>
            </div>
            <div className="advice-item">
              <div className="advice-icon">🏥</div>
              <div className="advice-content">
                <h4>健康建议</h4>
                <p>注意作息规律，适当锻炼增强体质。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 八字说明 */}
        <div className="bazi-explanation">
          <h3>八字运势说明</h3>
          <div className="explanation-content">
            <p>八字运势基于您的出生年月日时，结合天干地支、五行生克理论，分析不同时间段的运势变化趋势。</p>
            <ul>
              <li><strong>综合评分</strong>：反映整体运势好坏，正值表示好运，负值表示挑战</li>
              <li><strong>事业运势</strong>：工作发展、职业机会、项目进展</li>
              <li><strong>财运运势</strong>：收入增长、投资机会、财富积累</li>
              <li><strong>健康运势</strong>：身体状况、精力水平、疾病预防</li>
              <li><strong>感情运势</strong>：人际关系、情感交流、家庭和谐</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LifeTrendPage_optimized;