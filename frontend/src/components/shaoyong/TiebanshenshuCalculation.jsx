import React, { useState, useEffect } from 'react';
import { performTiebanshenshuCalculation, analyzeWuXing } from '../../utils/shaoyong-algorithm';
import './TiebanshenshuCalculation.css';

const TiebanshenshuCalculation = ({ baziData, onCalculationComplete, result }) => {
  const [calculationSteps, setCalculationSteps] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [finalResult, setFinalResult] = useState(null);

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
            开始皇极起数计算
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
          <div className="result-header">
            <h4>皇极起数完成</h4>
            <div className="result-id">
              计算ID: {finalResult.calculationId}
            </div>
          </div>

          <div className="result-summary">
            <div className="summary-card">
              <div className="summary-icon">📜</div>
              <div className="summary-content">
                <h5>条文定位成功</h5>
                <p>在万条文库中定位到 {finalResult.clauseNumbers?.length || 0} 条相关神数</p>
              </div>
            </div>

            <div className="clause-preview">
              <h5>条文编号预览</h5>
              <div className="clause-numbers">
                {finalResult.clauseNumbers?.slice(0, 10).map((num, index) => (
                  <span key={index} className="clause-number">{num}</span>
                ))}
                {finalResult.clauseNumbers?.length > 10 && (
                  <span className="clause-more">...等{finalResult.clauseNumbers.length}条</span>
                )}
              </div>
            </div>
          </div>

          <div className="calculation-review">
            <h5>计算过程回顾</h5>
            <div className="steps-review">
              {finalResult.steps?.map((step, index) => (
                <div key={index} className="review-step">
                  <div className="review-step-header">
                    <span className="step-index">第{step.step}步</span>
                    <span className="step-title">{step.title}</span>
                  </div>
                  <div className="review-step-desc">{step.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="calculation-actions">
            <button
              className="btn-primary"
              onClick={() => {
                const element = document.getElementById('clause-display-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              抽取条文解读
            </button>
            <button className="btn-secondary" onClick={handleRecalculate}>
              重新计算
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TiebanshenshuCalculation;