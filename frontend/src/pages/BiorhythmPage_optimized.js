/**
 * 优化版人体节律页面
 * 基于BiorhythmTab.js优化，增加每日提醒，优化趋势图，适配手机端
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserConfig } from '../contexts/UserConfigContext';
import BiorhythmCalculator from '../utils/biorhythmCalculator';
import './BiorhythmPage.css';

const BiorhythmPage_optimized = () => {
  const navigate = useNavigate();
  const { currentConfig } = useUserConfig();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [biorhythmData, setBiorhythmData] = useState(null);
  const [dailyTips, setDailyTips] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 检测屏幕尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 计算生物节律数据
  const calculateBiorhythmData = useCallback(() => {
    if (!currentConfig?.birthDate) {
      setBiorhythmData(null);
      setDailyTips('请先设置您的出生日期以查看生物节律');
      return;
    }

    try {
      const birthDate = new Date(currentConfig.birthDate);
      const today = new Date();
      
      // 计算今日节律
      const todayRhythm = BiorhythmCalculator.calculateBiorhythm(birthDate, today);
      
      // 计算趋势数据（前后7天）
      const trendData = BiorhythmCalculator.generateTrendData(birthDate, 7, 7);

      // 获取每日建议
      const tips = BiorhythmCalculator.getBiorhythmInsight(todayRhythm);
      
      setBiorhythmData({
        today: todayRhythm,
        trend: trendData,
        birthDate: birthDate.toISOString().split('T')[0]
      });
      setDailyTips(tips);
    } catch (error) {
      console.error('计算生物节律失败:', error);
      setDailyTips('计算生物节律时出现错误，请稍后重试');
    }
  }, [currentConfig?.birthDate]);

  useEffect(() => {
    calculateBiorhythmData();
  }, [calculateBiorhythmData]);

  // 渲染节律图表
  const renderBiorhythmChart = () => {
    if (!biorhythmData) return null;

    const { today, trend } = biorhythmData;
    const chartHeight = isMobile ? 200 : 300;

    return (
      <div className="biorhythm-chart-container">
        <h3 className="chart-title">生物节律趋势图</h3>
        
        {/* 简化版趋势图 - 适配移动端 */}
        <div className="trend-chart" style={{ height: `${chartHeight}px` }}>
          <div className="chart-grid">
            {trend.map((day, index) => (
              <div key={day.date} className="chart-column">
                <div className="chart-bars">
                  {/* 体力周期 */}
                  <div 
                    className={`bar physical ${day.physical > 0 ? 'positive' : 'negative'}`}
                    style={{ height: `${Math.abs(day.physical) * 40}%` }}
                    title={`体力: ${day.physical.toFixed(2)}`}
                  ></div>
                  {/* 情绪周期 */}
                  <div 
                    className={`bar emotional ${day.emotional > 0 ? 'positive' : 'negative'}`}
                    style={{ height: `${Math.abs(day.emotional) * 40}%` }}
                    title={`情绪: ${day.emotional.toFixed(2)}`}
                  ></div>
                  {/* 智力周期 */}
                  <div 
                    className={`bar intellectual ${day.intellectual > 0 ? 'positive' : 'negative'}`}
                    style={{ height: `${Math.abs(day.intellectual) * 40}%` }}
                    title={`智力: ${day.intellectual.toFixed(2)}`}
                  ></div>
                </div>
                <div className="chart-label">
                  {index === 7 ? '今日' : 
                   index < 7 ? `-${7 - index}` : `+${index - 7}`}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 图例 */}
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color physical"></div>
            <span>体力周期</span>
          </div>
          <div className="legend-item">
            <div className="legend-color emotional"></div>
            <span>情绪周期</span>
          </div>
          <div className="legend-item">
            <div className="legend-color intellectual"></div>
            <span>智力周期</span>
          </div>
        </div>
      </div>
    );
  };

  // 渲染今日节律详情
  const renderTodayRhythm = () => {
    if (!biorhythmData?.today) return null;

    const { physical, emotional, intellectual } = biorhythmData.today;
    
    const getRhythmStatus = (value) => {
      if (value > 0.7) return { status: '极佳', emoji: '🔥', color: 'excellent' };
      if (value > 0.3) return { status: '良好', emoji: '👍', color: 'good' };
      if (value > -0.3) return { status: '一般', emoji: '➖', color: 'normal' };
      if (value > -0.7) return { status: '较差', emoji: '⚠️', color: 'poor' };
      return { status: '低迷', emoji: '💤', color: 'low' };
    };

    return (
      <div className="today-rhythm">
        <h3 className="section-title">今日节律状态</h3>
        <div className="rhythm-cards">
          <div className={`rhythm-card ${getRhythmStatus(physical).color}`}>
            <div className="rhythm-emoji">💪</div>
            <div className="rhythm-value">{physical.toFixed(2)}</div>
            <div className="rhythm-status">{getRhythmStatus(physical).status}</div>
            <div className="rhythm-label">体力周期</div>
          </div>
          <div className={`rhythm-card ${getRhythmStatus(emotional).color}`}>
            <div className="rhythm-emoji">❤️</div>
            <div className="rhythm-value">{emotional.toFixed(2)}</div>
            <div className="rhythm-status">{getRhythmStatus(emotional).status}</div>
            <div className="rhythm-label">情绪周期</div>
          </div>
          <div className={`rhythm-card ${getRhythmStatus(intellectual).color}`}>
            <div className="rhythm-emoji">🧠</div>
            <div className="rhythm-value">{intellectual.toFixed(2)}</div>
            <div className="rhythm-status">{getRhythmStatus(intellectual).status}</div>
            <div className="rhythm-label">智力周期</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="biorhythm-page">
      {/* 头部 */}
      <header className="page-header">
        <button 
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← 返回
        </button>
        <h1 className="page-title">每日建议 - 生物节律</h1>
        <div className="header-date">
          {new Date().toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}
        </div>
      </header>

      {/* 主要内容 */}
      <main className="page-content">
        {/* 每日提醒 */}
        <div className="daily-tips-card">
          <div className="tips-icon">💡</div>
          <div className="tips-content">
            <h3>今日建议</h3>
            <p>{dailyTips}</p>
          </div>
        </div>

        {/* 今日节律状态 */}
        {renderTodayRhythm()}

        {/* 趋势图表 */}
        {renderBiorhythmChart()}

        {/* 节律说明 */}
        <div className="rhythm-explanation">
          <h3>生物节律说明</h3>
          <div className="explanation-grid">
            <div className="explanation-item">
              <div className="item-icon">💪</div>
              <div className="item-content">
                <h4>体力周期 (23天)</h4>
                <p>影响体力、耐力、免疫力。正值期适合运动，负值期注意休息。</p>
              </div>
            </div>
            <div className="explanation-item">
              <div className="item-icon">❤️</div>
              <div className="item-content">
                <h4>情绪周期 (28天)</h4>
                <p>影响心情、创造力、敏感性。正值期心情愉快，负值期注意调节。</p>
              </div>
            </div>
            <div className="explanation-item">
              <div className="item-icon">🧠</div>
              <div className="item-content">
                <h4>智力周期 (33天)</h4>
                <p>影响记忆力、逻辑思维。正值期适合学习，负值期容易分心。</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BiorhythmPage_optimized;