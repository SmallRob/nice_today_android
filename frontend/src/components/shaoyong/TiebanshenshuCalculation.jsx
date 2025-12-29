import React, { useState, useEffect } from 'react';
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

  // 天干地支转数字（简化版）
  const stemToNumber = (stem) => {
    const stemMap = {
      '甲': 1, '乙': 2, '丙': 3, '丁': 4, '戊': 5,
      '己': 6, '庚': 7, '辛': 8, '壬': 9, '癸': 10
    };
    return stemMap[stem] || 1;
  };

  const branchToNumber = (branch) => {
    const branchMap = {
      '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
      '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12
    };
    return branchMap[branch] || 1;
  };

  // 模拟皇极起数算法
  const performCalculation = () => {
    setIsCalculating(true);
    setCalculationSteps([]);
    setProgress(0);

    const steps = [];
    
    // 第一步：八字转数
    setTimeout(() => {
      steps.push({
        step: 1,
        title: '八字转先天数',
        description: `将八字天干地支转化为先天八卦数`,
        details: [
          `年柱 ${baziData.year.stem}${baziData.year.branch} → ${stemToNumber(baziData.year.stem)}/${branchToNumber(baziData.year.branch)}`,
          `月柱 ${baziData.month.stem}${baziData.month.branch} → ${stemToNumber(baziData.month.stem)}/${branchToNumber(baziData.month.branch)}`,
          `日柱 ${baziData.day.stem}${baziData.day.branch} → ${stemToNumber(baziData.day.stem)}/${branchToNumber(baziData.day.branch)}`,
          `时柱 ${baziData.hour.stem}${baziData.hour.branch} → ${stemToNumber(baziData.hour.stem)}/${branchToNumber(baziData.hour.branch)}`
        ]
      });
      setCalculationSteps([...steps]);
      setProgress(25);
    }, 1000);

    // 第二步：计算四柱总数
    setTimeout(() => {
      const yearNum = stemToNumber(baziData.year.stem) + branchToNumber(baziData.year.branch);
      const monthNum = stemToNumber(baziData.month.stem) + branchToNumber(baziData.month.branch);
      const dayNum = stemToNumber(baziData.day.stem) + branchToNumber(baziData.day.branch);
      const hourNum = stemToNumber(baziData.hour.stem) + branchToNumber(baziData.hour.branch);
      const total = yearNum + monthNum + dayNum + hourNum;
      
      steps.push({
        step: 2,
        title: '计算四柱总数',
        description: `四柱数相加，得先天总数`,
        details: [
          `年柱数: ${yearNum}`,
          `月柱数: ${monthNum}`,
          `日柱数: ${dayNum}`,
          `时柱数: ${hourNum}`,
          `总数: ${total}`
        ]
      });
      setCalculationSteps([...steps]);
      setProgress(50);
    }, 2000);

    // 第三步：皇极起数
    setTimeout(() => {
      const baseNumber = 10000; // 万条文库基础
      const genderFactor = baziData.gender === 'male' ? 1 : 2;
      const leapFactor = baziData.isLeapMonth ? 1.5 : 1;
      
      // 模拟复杂计算
      const calculation = [
        { operation: '总数 × 八卦基数', value: '× 64' },
        { operation: '加性别因子', value: genderFactor === 1 ? '+ 乾数' : '+ 坤数' },
        { operation: '闰月调整', value: leapFactor === 1.5 ? '× 1.5' : '不变' },
        { operation: '归藏数转换', value: '→ 归藏卦数' }
      ];
      
      steps.push({
        step: 3,
        title: '皇极起数法',
        description: '应用皇极经世起数规则',
        details: calculation.map(item => `${item.operation}: ${item.value}`),
        calculation
      });
      setCalculationSteps([...steps]);
      setProgress(75);
    }, 3000);

    // 第四步：生成条文编号
    setTimeout(() => {
      // 生成一组随机条文编号 (1-12000)
      const clauseCount = Math.floor(Math.random() * 6) + 5; // 5-10条
      const clauseNumbers = [];
      for (let i = 0; i < clauseCount; i++) {
        clauseNumbers.push(Math.floor(Math.random() * 12000) + 1);
      }
      
      // 排序并去重
      const uniqueClauses = [...new Set(clauseNumbers)].sort((a, b) => a - b);
      
      steps.push({
        step: 4,
        title: '生成条文编号',
        description: `在万条文库中定位 ${uniqueClauses.length} 条神数`,
        details: [
          `库中定位: 第 ${uniqueClauses[0]} 条`,
          `关联条文: ${uniqueClauses.slice(1).join(', ')}`,
          `总条文数: 12000 条`,
          `命中率: ${((uniqueClauses.length / 12000) * 100).toFixed(4)}%`
        ],
        clauseNumbers: uniqueClauses
      });
      
      setCalculationSteps([...steps]);
      setProgress(100);
      
      // 生成最终结果
      const finalResult = {
        baziData,
        steps: [...steps],
        clauseNumbers: uniqueClauses,
        calculationId: Date.now().toString(36).toUpperCase(),
        calculationTime: new Date().toLocaleTimeString()
      };
      
      setFinalResult(finalResult);
      setIsCalculating(false);
      
      // 通知父组件
      setTimeout(() => {
        onCalculationComplete(finalResult);
      }, 500);
    }, 4000);
  };

  // 重新计算
  const handleRecalculate = () => {
    setFinalResult(null);
    setCalculationSteps([]);
    setProgress(0);
    performCalculation();
  };

  // 八字五行分析
  const analyzeWuXing = () => {
    const stemWuxing = {
      '甲': '木', '乙': '木', '丙': '火', '丁': '火',
      '戊': '土', '己': '土', '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    
    const wuxingCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    
    [baziData.year.stem, baziData.month.stem, baziData.day.stem, baziData.hour.stem]
      .forEach(stem => {
        wuxingCount[stemWuxing[stem]]++;
      });
    
    return wuxingCount;
  };

  const wuxingCount = analyzeWuXing();

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
                className={`calculation-step ${step.step <= progress/25 ? 'completed' : ''}`}
              >
                <div className="step-header">
                  <div className="step-number">{step.step}</div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-status">
                    {step.step <= progress/25 ? '✓' : '...'}
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
            <button className="btn-primary" onClick={() => window.location.reload()}>
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