import React, { useState } from 'react';
import { calculateMeihuaDivination, generateHexagramFromNumbers } from '../../utils/shaoyong-algorithm';
import './DivinationForm.css';

const DivinationForm = ({ onDivination }) => {
  const [method, setMethod] = useState('number');
  const [number1, setNumber1] = useState('');
  const [number2, setNumber2] = useState('');
  const [number3, setNumber3] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [question, setQuestion] = useState('');

  const handleNumberDivination = () => {
    // 数字起卦法：前两数除以8取余数得上卦和下卦，第三数除以6取余数得动爻
    const num1 = parseInt(number1) || Math.floor(Math.random() * 100) + 1;
    const num2 = parseInt(number2) || Math.floor(Math.random() * 100) + 1;
    const num3 = parseInt(number3) || Math.floor(Math.random() * 6) + 1;
    
    const divinationData = {
      method: 'number',
      upperNumber: (num1 % 8) || 8,
      lowerNumber: (num2 % 8) || 8,
      changingYao: (num3 % 6) || 6,
      question: question || '未提供问题',
      numbers: [num1, num2, num3]
    };
    
    const result = calculateMeihuaDivination(divinationData);
    
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
    
    const divinationData = {
      method: customTime ? 'time' : 'time',
      upperNumber: upperNum,
      lowerNumber: lowerNum,
      changingYao: changingNum,
      question: question || '未提供问题',
      time: timeToUse.toLocaleString()
    };
    
    const result = calculateMeihuaDivination(divinationData);
    result.method = customTime ? '指定时间起卦' : '当前时间起卦';
    
    onDivination(result);
  };

  const handleRandomDivination = () => {
    // 随机起卦
    const randomUpper = Math.floor(Math.random() * 8) + 1;
    const randomLower = Math.floor(Math.random() * 8) + 1;
    const randomChanging = Math.floor(Math.random() * 6) + 1;
    
    const divinationData = {
      method: 'random',
      upperNumber: randomUpper,
      lowerNumber: randomLower,
      changingYao: randomChanging,
      question: question || '未提供问题'
    };
    
    const result = calculateMeihuaDivination(divinationData);
    result.method = '随机起卦';
    
    onDivination(result);
  };

  const resetForm = () => {
    setNumber1('');
    setNumber2('');
    setNumber3('');
    setCustomTime('');
    setQuestion('');
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

      {/* 问题输入框 - 适用于所有起卦方法 */}
      <div className="form-group">
        <label>占卜问题（可选）</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="请输入您想占卜的问题"
        />
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