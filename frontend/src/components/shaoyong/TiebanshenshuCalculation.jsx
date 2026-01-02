import React, { useState, useEffect } from 'react';
import { performTiebanshenshuCalculation, analyzeWuXing } from '../../utils/shaoyong-algorithm';
import './TiebanshenshuCalculation.css';

const TiebanshenshuCalculation = ({ baziData, onCalculationComplete, result }) => {
  const [calculationSteps, setCalculationSteps] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [finalResult, setFinalResult] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState({});

  // 如果已有结果，直接显示
  useEffect(() => {
    if (result) {
      setFinalResult(result);
      setCalculationSteps(result.steps || []);
    }
  }, [result]);

  // 模拟皇极起数算法
  const performCalculation = async () => {
    setIsCalculating(true);
    setCalculationSteps([]);
    setProgress(0);

    try {
      // 使用新的算法模块进行计算
      const calculationResult = await performTiebanshenshuCalculation(baziData);

      // 更新进度和结果显示
      setCalculationSteps(calculationResult.steps);
      setProgress(100);
      
      setFinalResult(calculationResult);
      setIsCalculating(false);

      // 通知父组件
      setTimeout(() => {
        onCalculationComplete(calculationResult);
      }, 500);
    } catch (error) {
      console.error('Calculation failed:', error);
      setIsCalculating(false);
    }
  };

  // 重新计算
  const handleRecalculate = () => {
    setFinalResult(null);
    setCalculationSteps([]);
    setProgress(0);
    performCalculation();
  };

  const wuxingCount = analyzeWuXing(baziData);

  // 切换步骤展开/收起
  const toggleStepExpand = (index) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // 切换所有步骤展开/收起
  const toggleAllSteps = () => {
    const allExpanded = Object.values(expandedSteps).every(v => v === true);
    if (allExpanded) {
      setExpandedSteps({});
    } else {
      const newExpanded = {};
      finalResult.steps?.forEach((_, index) => {
        newExpanded[index] = true;
      });
      setExpandedSteps(newExpanded);
    }
  };

  return (
    <div className="tiebanshenshu-calculation">
      {!finalResult && !isCalculating ? (
        <div className="start-calculation">
          <div className="bazi-review">
            <h4>输入八字确认</h4>
            <div className="bazi-display">
              <div className="bazi-pillars">
                <div className="pillar">
                  <div className="pillar-label">年柱</div>
                  <div className="pillar-value">{baziData.year.stem}{baziData.year.branch}</div>
                </div>
                <div className="pillar">
                  <div className="pillar-label">月柱</div>
                  <div className="pillar-value">{baziData.month.stem}{baziData.month.branch}</div>
                </div>
                <div className="pillar">
                  <div className="pillar-label">日柱</div>
                  <div className="pillar-value">{baziData.day.stem}{baziData.day.branch}</div>
                </div>
                <div className="pillar">
                  <div className="pillar-label">时柱</div>
                  <div className="pillar-value">{baziData.hour.stem}{baziData.hour.branch}</div>
                </div>
              </div>
              <div className="bazi-info">
                <p><strong>性别：</strong>{baziData.gender === 'male' ? '男命' : '女命'}</p>
                <p><strong>日期：</strong>{baziData.solarDate} {baziData.birthTime}</p>
                {baziData.lunarDate && <p><strong>农历：</strong>{baziData.lunarDate}</p>}
              </div>
            </div>

            <div className="wuxing-analysis">
              <h5>八字五行分析</h5>
              <div className="wuxing-bars">
                {Object.entries(wuxingCount).map(([wuxing, count]) => (
                  <div key={wuxing} className="wuxing-bar">
                    <div className="wuxing-label">{wuxing}</div>
                    <div className="bar-container">
                      <div
                        className={`bar bar-${wuxing}`}
                        style={{ width: `${count * 25}%` }}
                      >
                        <span className="bar-count">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="calculation-instructions">
            <h4>皇极起数说明</h4>
            <ul>
              <li>铁板神数以八字为基础，通过"皇极起数法"将命运化为卦数</li>
              <li>算法会将八字天干地支转化为先天八卦数</li>
              <li>经过多步计算，在12000条文库中定位相关条文</li>
              <li>计算过程模拟真实铁板神数推算逻辑</li>
              <li>点击开始计算，体验邵雍的"数术之王"算法</li>
            </ul>
          </div>

          <button className="btn-primary start-btn" onClick={performCalculation}>
            皇极起数计算
          </button>
        </div>
      ) : isCalculating ? (
        <div className="calculation-in-progress">
          <h4>皇极起数计算中...</h4>

          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">{progress}%</div>
          </div>

          <div className="calculation-steps">
            {calculationSteps.map((step, index) => (
              <div
                key={index}
                className={`calculation-step ${step.step <= progress / 25 ? 'completed' : ''}`}
              >
                <div className="step-header">
                  <div className="step-number">{step.step}</div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-status">
                    {step.step <= progress / 25 ? '✓' : '...'}
                  </div>
                </div>
                <div className="step-description">{step.description}</div>
                {step.details && (
                  <div className="step-details">
                    {step.details.map((detail, i) => (
                      <div key={i} className="step-detail">{detail}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="calculation-tip">
            <p>铁板神数计算复杂，传统推算需数小时乃至数日，此处为简化模拟</p>
          </div>
        </div>
      ) : (
        <div className="calculation-complete">
          {/* 结果头部 */}
          <div className="result-header">
            <div className="result-title-group">
              <div className="success-icon">✓</div>
              <div className="title-content">
                <h4>皇极起数完成</h4>
                <p className="result-subtitle">铁板神数推算已完成</p>
              </div>
            </div>
            <div className="result-meta">
              <span className="meta-item">
                <span className="meta-icon">🆔</span>
                {finalResult.calculationId?.slice(0, 8)}...
              </span>
              <span className="meta-item">
                <span className="meta-icon">⏱️</span>
                {finalResult.calculationTime}
              </span>
            </div>
          </div>

          {/* 结果摘要卡片 */}
          <div className="result-summary">
            <div className="summary-card primary">
              <div className="summary-icon">📜</div>
              <div className="summary-content">
                <h5>条文定位</h5>
                <p className="value">{finalResult.clauseNumbers?.length || 0}</p>
                <p className="label">条神数</p>
              </div>
            </div>

            <div className="summary-card secondary">
              <div className="summary-icon">🔢</div>
              <div className="summary-content">
                <h5>计算步骤</h5>
                <p className="value">{finalResult.steps?.length || 0}</p>
                <p className="label">个阶段</p>
              </div>
            </div>

            <div className="summary-card tertiary">
              <div className="summary-icon">🎯</div>
              <div className="summary-content">
                <h5>准确度</h5>
                <p className="value">高</p>
                <p className="label">可信</p>
              </div>
            </div>
          </div>

          {/* 详细结果 */}
          <div className="detailed-results">
            {/* 八字五行分析 */}
            <div className="detail-card">
              <div className="detail-card-header">
                <h5>八字五行分析</h5>
                <span className="detail-badge">基于八字</span>
              </div>
              <div className="wuxing-bars-result">
                {Object.entries(finalResult.wuxingAnalysis || wuxingCount).map(([element, count]) => (
                  <div key={element} className="wuxing-bar-result">
                    <div className="bar-label">{element}</div>
                    <div className="bar-container-result">
                      <div
                        className={`bar-result bar-${element}`}
                        style={{ width: `${Math.min(count * 25, 100)}%` }}
                      >
                        <span className="bar-count-result">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 条文编号 */}
            <div className="detail-card">
              <div className="detail-card-header">
                <h5>条文编号详情</h5>
                <span className="detail-badge">{finalResult.clauseNumbers?.length || 0}条</span>
              </div>
              <div className="clause-numbers-result">
                {finalResult.clauseNumbers?.slice(0, 12).map((num, index) => (
                  <span key={index} className="clause-number-result">
                    {num}
                  </span>
                ))}
                {finalResult.clauseNumbers?.length > 12 && (
                  <span className="clause-more-result">
                    +{finalResult.clauseNumbers.length - 12}条
                  </span>
                )}
              </div>
            </div>

            {/* 计算过程详解 */}
            <div className="detail-card">
              <div className="detail-card-header">
                <h5>计算过程详解</h5>
                <button className="expand-all-btn" onClick={toggleAllSteps}>
                  {Object.values(expandedSteps).every(v => v === true) ? '全部收起' : '全部展开'}
                </button>
              </div>
              <div className="steps-result">
                {finalResult.steps?.map((step, index) => (
                  <div key={index} className={`step-result ${expandedSteps[index] ? 'expanded' : ''}`}>
                    <div
                      className="step-result-header"
                      onClick={() => toggleStepExpand(index)}
                    >
                      <div className="step-indicator">{step.step}</div>
                      <div className="step-result-title">{step.title}</div>
                      <div className={`step-toggle-icon ${expandedSteps[index] ? 'expanded' : ''}`}>
                        ▼
                      </div>
                    </div>
                    {expandedSteps[index] && (
                      <div className="step-result-content">
                        <p className="step-result-description">{step.description}</p>
                        {step.details && step.details.length > 0 && (
                          <div className="step-result-details">
                            <h6>详细信息:</h6>
                            <ul>
                              {step.details.map((detail, i) => (
                                <li key={i}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="calculation-actions">
            <button
              className="btn-primary btn-large primary-action"
              onClick={() => {
                const element = document.getElementById('clause-display-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <span className="action-icon">📖</span>
              查看条文解读
            </button>
            <div className="secondary-actions">
              <button className="btn-secondary" onClick={handleRecalculate}>
                <span className="action-icon">🔄</span>
                重新计算
              </button>
              <button className="btn-secondary">
                <span className="action-icon">💾</span>
                保存结果
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiebanshenshuCalculation;