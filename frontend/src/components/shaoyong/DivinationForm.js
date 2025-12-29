import React, { useState } from 'react';
import './DivinationForm.css';

const DivinationForm = ({ onDivination }) => {
  const [method, setMethod] = useState('number');
  const [number1, setNumber1] = useState('');
  const [number2, setNumber2] = useState('');
  const [number3, setNumber3] = useState('');
  const [customTime, setCustomTime] = useState('');

  const handleNumberDivination = () => {
    // 数字起卦法：前两数除以8取余数得上卦和下卦，第三数除以6取余数得动爻
    const num1 = parseInt(number1) || Math.floor(Math.random() * 100) + 1;
    const num2 = parseInt(number2) || Math.floor(Math.random() * 100) + 1;
    const num3 = parseInt(number3) || Math.floor(Math.random() * 6) + 1;
    
    const upperTrigram = (num1 % 8) || 8;
    const lowerTrigram = (num2 % 8) || 8;
    const changingLine = (num3 % 6) || 6;
    
    const result = {
      method: '数字起卦',
      numbers: [num1, num2, num3],
      upperTrigram,
      lowerTrigram,
      changingLine,
      originalHexagram: calculateHexagram(upperTrigram, lowerTrigram),
      interchangingHexagram: calculateInterchangingHexagram(upperTrigram, lowerTrigram),
      changingHexagram: calculateChangingHexagram(upperTrigram, lowerTrigram, changingLine),
    };
    
    onDivination(result);
  };

  const handleTimeDivination = () => {
    // 时间起卦法：使用当前时间或指定时间
    const timeToUse = customTime ? new Date(customTime) : new Date();
    const year = timeToUse.getFullYear();
    const month = timeToUse.getMonth() + 1;
    const day = timeToUse.getDate();
    const hour = timeToUse.getHours();
    const minute = timeToUse.getMinutes();
    
    // 年月日时起卦法
    const upperNum = (year + month + day) % 8 || 8;
    const lowerNum = (hour + minute) % 8 || 8;
    const changingNum = (year + month + day + hour + minute) % 6 || 6;
    
    const result = {
      method: customTime ? '指定时间起卦' : '当前时间起卦',
      time: timeToUse.toLocaleString(),
      upperTrigram: upperNum,
      lowerTrigram: lowerNum,
      changingLine: changingNum,
      originalHexagram: calculateHexagram(upperNum, lowerNum),
      interchangingHexagram: calculateInterchangingHexagram(upperNum, lowerNum),
      changingHexagram: calculateChangingHexagram(upperNum, lowerNum, changingNum),
    };
    
    onDivination(result);
  };

  const handleRandomDivination = () => {
    // 随机起卦
    const randomUpper = Math.floor(Math.random() * 8) + 1;
    const randomLower = Math.floor(Math.random() * 8) + 1;
    const randomChanging = Math.floor(Math.random() * 6) + 1;
    
    const result = {
      method: '随机起卦',
      upperTrigram: randomUpper,
      lowerTrigram: randomLower,
      changingLine: randomChanging,
      originalHexagram: calculateHexagram(randomUpper, randomLower),
      interchangingHexagram: calculateInterchangingHexagram(randomUpper, randomLower),
      changingHexagram: calculateChangingHexagram(randomUpper, randomLower, randomChanging),
    };
    
    onDivination(result);
  };

  // 计算本卦
  const calculateHexagram = (upper, lower) => {
    // 简化版：返回卦象编号 (1-64)
    return (upper - 1) * 8 + lower;
  };

  // 计算互卦
  const calculateInterchangingHexagram = (upper, lower) => {
    // 互卦取本卦中间四爻，二三四爻为下卦，三四五爻为上卦
    // 简化处理：返回一个随机的互卦
    return Math.floor(Math.random() * 64) + 1;
  };

  // 计算变卦
  const calculateChangingHexagram = (upper, lower, changingLine) => {
    // 变卦：动爻变化后得到的新卦
    // 简化处理：返回一个基于动爻变化的卦
    const changeFactor = changingLine % 2 === 0 ? 1 : -1;
    let newUpper = upper + changeFactor;
    let newLower = lower - changeFactor;
    
    if (newUpper > 8) newUpper = 1;
    if (newUpper < 1) newUpper = 8;
    if (newLower > 8) newLower = 1;
    if (newLower < 1) newLower = 8;
    
    return (newUpper - 1) * 8 + newLower;
  };

  const resetForm = () => {
    setNumber1('');
    setNumber2('');
    setNumber3('');
    setCustomTime('');
  };

  return (
    <div className="divination-form">
      <div className="method-selector">
        <button 
          className={`method-btn ${method === 'number' ? 'active' : ''}`}
          onClick={() => setMethod('number')}
        >
          数字起卦
        </button>
        <button 
          className={`method-btn ${method === 'time' ? 'active' : ''}`}
          onClick={() => setMethod('time')}
        >
          时间起卦
        </button>
        <button 
          className="method-btn random"
          onClick={handleRandomDivination}
        >
          随机起卦
        </button>
      </div>

      {method === 'number' && (
        <div className="number-divination">
          <div className="form-group">
            <label>第一个数字（除以8得余数定上卦）</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={number1}
              onChange={(e) => setNumber1(e.target.value)}
              placeholder="可留空，将随机生成"
            />
          </div>
          <div className="form-group">
            <label>第二个数字（除以8得余数定下卦）</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={number2}
              onChange={(e) => setNumber2(e.target.value)}
              placeholder="可留空，将随机生成"
            />
          </div>
          <div className="form-group">
            <label>第三个数字（除以6得余数定动爻）</label>
            <input
              type="number"
              min="1"
              max="100"
              value={number3}
              onChange={(e) => setNumber3(e.target.value)}
              placeholder="可留空，将随机生成"
            />
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleNumberDivination}>
              开始占卜
            </button>
            <button className="btn-secondary" onClick={resetForm}>
              重置
            </button>
          </div>
          <div className="method-explanation">
            <h4>数字起卦法说明</h4>
            <p>邵雍梅花易数认为"万物皆数"，通过三个数字即可起卦：</p>
            <ul>
              <li>前两数除以8，余数对应八卦（1乾☰、2兑☱、3离☲、4震☳、5巽☴、6坎☵、7艮☶、8坤☷）</li>
              <li>第三数除以6，余数确定动爻位置（1-6爻）</li>
              <li>上卦为外卦，下卦为内卦，组成64卦之一</li>
            </ul>
          </div>
        </div>
      )}

      {method === 'time' && (
        <div className="time-divination">
          <div className="form-group">
            <label>选择起卦时间（留空则使用当前时间）</label>
            <input
              type="datetime-local"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleTimeDivination}>
              时间起卦
            </button>
            <button className="btn-secondary" onClick={() => setCustomTime('')}>
              使用当前时间
            </button>
          </div>
          <div className="method-explanation">
            <h4>时间起卦法说明</h4>
            <p>以年月日时之数起卦：</p>
            <ul>
              <li>年、月、日数相加除以8得上卦</li>
              <li>时、分数相加除以8得下卦</li>
              <li>年月日时总数除以6得动爻</li>
              <li>此法体现"时运"之理，卦象随时间变化</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DivinationForm;