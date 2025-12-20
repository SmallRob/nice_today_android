import React, { useState, useEffect } from 'react';
import { calculateBiorhythm } from '../utils/biorhythmCalculator';

const BiorhythmLitePage = ({ userInfo }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [biorhythms, setBiorhythms] = useState(null);

  useEffect(() => {
    if (userInfo.birthDate) {
      const calculated = calculateBiorhythm(userInfo.birthDate, currentDate);
      setBiorhythms(calculated);
    }
  }, [userInfo.birthDate, currentDate]);

  const handleDateChange = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  if (!userInfo.birthDate) {
    return (
      <div className="lite-card">
        <h2 className="lite-page-title">生物节律</h2>
        <p>请先在设置中填写您的出生日期。</p>
      </div>
    );
  }

  return (
    <div className="lite-biorhythm-page">
      <h2 className="lite-page-title">生物节律</h2>
      
      <div className="lite-card">
        <h3>用户信息</h3>
        <p>昵称: {userInfo.nickname || '未设置'}</p>
        <p>出生日期: {userInfo.birthDate}</p>
      </div>
      
      <div className="lite-card">
        <h3>当前日期: {currentDate.toISOString().split('T')[0]}</h3>
        <div className="date-navigation">
          <button onClick={() => handleDateChange(-1)}>前一天</button>
          <button onClick={() => setCurrentDate(new Date())}>今天</button>
          <button onClick={() => handleDateChange(1)}>后一天</button>
        </div>
      </div>
      
      {biorhythms && (
        <div className="lite-card">
          <h3>节律指数</h3>
          <div className="biorhythm-item">
            <p>体力节律: {biorhythms.physical.toFixed(2)}</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${Math.abs(biorhythms.physical)}%`,
                  backgroundColor: biorhythms.physical >= 0 ? '#4CAF50' : '#F44336'
                }}
              ></div>
            </div>
          </div>
          
          <div className="biorhythm-item">
            <p>情绪节律: {biorhythms.emotional.toFixed(2)}</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${Math.abs(biorhythms.emotional)}%`,
                  backgroundColor: biorhythms.emotional >= 0 ? '#2196F3' : '#FF9800'
                }}
              ></div>
            </div>
          </div>
          
          <div className="biorhythm-item">
            <p>智力节律: {biorhythms.intellectual.toFixed(2)}</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${Math.abs(biorhythms.intellectual)}%`,
                  backgroundColor: biorhythms.intellectual >= 0 ? '#9C27B0' : '#795548'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiorhythmLitePage;