import React, { useState, useEffect } from 'react';
import './AgileHealthPage.css';

// 敏捷养生页面
const AgileHealthPage = () => {
  // 微任务库
  const microTaskLibrary = [
    { id: 1, title: '眼保健操', description: '标准眼保健操+远眺', duration: '10分钟', category: '办公间隙', icon: '👀', type: 'eye-care' },
    { id: 2, title: '肩颈操', description: '低头/抬头/转颈+按揉风池穴', duration: '8分钟', category: '办公间隙', icon: '💆', type: 'neck-care' },
    { id: 3, title: '腹式呼吸', description: '鼻吸口呼，每次呼吸6秒', duration: '3分钟', category: '办公间隙', icon: '🫁', type: 'breathing' },
    { id: 4, title: '五行唤醒', description: '叩齿36下+搓热双手敷眼+按揉足三里', duration: '10分钟', category: '晨起', icon: '🌅', type: 'morning' },
    { id: 5, title: '睡前揉腹', description: '泡脚+揉腹', duration: '10分钟', category: '睡前', icon: '😴', type: 'night' },
    { id: 6, title: '八段锦入门', description: '两手托天理三焦+左右开弓似射雕', duration: '10分钟', category: '运动', icon: '🧘', type: 'exercise' },
    { id: 7, title: '踮脚养生', description: '踮脚起落+散步', duration: '5分钟', category: '运动', icon: '🦵', type: 'exercise' },
    { id: 8, title: '静坐冥想', description: '关注呼吸，静心冥想', duration: '5分钟', category: '放松', icon: '🧘', type: 'meditation' },
    { id: 9, title: '梳头养生', description: '从额到颈，通经络', duration: '3分钟', category: '放松', icon: '💇', type: 'relaxation' },
    { id: 10, title: '转腰运动', description: '疏通带脉', duration: '5分钟', category: '运动', icon: '💪', type: 'exercise' }
  ];

  // 7天敏捷养生打卡表数据
  const [sevenDayChecklist, setSevenDayChecklist] = useState([
    { 
      day: 'Day1', 
      morningTask: { id: 4, title: '五行唤醒' }, 
      noonTask: { id: 1, title: '眼保健操' }, 
      nightTask: { id: 5, title: '睡前揉腹' }, 
      bodyFeeling: 0,
      reviewAdjustment: ''
    },
    { 
      day: 'Day2', 
      morningTask: { id: 6, title: '八段锦入门' }, 
      noonTask: { id: 2, title: '肩颈操' }, 
      nightTask: { id: 8, title: '静坐冥想' }, 
      bodyFeeling: 0,
      reviewAdjustment: ''
    },
    { 
      day: 'Day3', 
      morningTask: { id: 3, title: '腹式呼吸' }, 
      noonTask: { id: 4, title: '五行唤醒' }, 
      nightTask: { id: 7, title: '踮脚养生' }, 
      bodyFeeling: 0,
      reviewAdjustment: ''
    },
    { 
      day: 'Day4', 
      morningTask: { id: 7, title: '踮脚养生' }, 
      noonTask: { id: 5, title: '睡前揉腹' }, 
      nightTask: { id: 9, title: '梳头养生' }, 
      bodyFeeling: 0,
      reviewAdjustment: ''
    },
    { 
      day: 'Day5', 
      morningTask: { id: 6, title: '八段锦入门' }, 
      noonTask: { id: 1, title: '眼保健操' }, 
      nightTask: { id: 10, title: '转腰运动' }, 
      bodyFeeling: 0,
      reviewAdjustment: ''
    },
    { 
      day: 'Day6', 
      morningTask: { id: 9, title: '梳头养生' }, 
      noonTask: { id: 2, title: '肩颈操' }, 
      nightTask: { id: 8, title: '静坐冥想' }, 
      bodyFeeling: 0,
      reviewAdjustment: ''
    },
    { 
      day: 'Day7', 
      morningTask: { id: 1, title: '眼保健操' }, 
      noonTask: { id: 3, title: '腹式呼吸' }, 
      nightTask: { id: 5, title: '睡前揉腹' }, 
      bodyFeeling: 0,
      reviewAdjustment: ''
    }
  ]);

  // 更新身体感受分数
  const updateBodyFeeling = (dayIndex, score) => {
    const newChecklist = [...sevenDayChecklist];
    newChecklist[dayIndex].bodyFeeling = score;
    setSevenDayChecklist(newChecklist);
  };

  // 更新复盘调整内容
  const updateReviewAdjustment = (dayIndex, text) => {
    const newChecklist = [...sevenDayChecklist];
    newChecklist[dayIndex].reviewAdjustment = text;
    setSevenDayChecklist(newChecklist);
  };

  // 今日推荐任务
  const getDailyRecommendedTasks = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // 根据星期几推荐不同的任务组合
    const recommendations = {
      0: [1, 5, 8],   // 周日：眼保健操、睡前揉腹、静坐冥想
      1: [2, 4, 6],   // 周一：肩颈操、五行唤醒、八段锦入门
      2: [1, 3, 7],   // 周二：眼保健操、腹式呼吸、踮脚养生
      3: [2, 5, 9],   // 周三：肩颈操、睡前揉腹、梳头养生
      4: [1, 4, 10],  // 周四：眼保健操、五行唤醒、转腰运动
      5: [2, 6, 8],   // 周五：肩颈操、八段锦入门、静坐冥想
      6: [3, 5, 7]    // 周六：腹式呼吸、睡前揉腹、踮脚养生
    };

    const taskIds = recommendations[dayOfWeek] || [1, 2, 3];
    return microTaskLibrary.filter(task => taskIds.includes(task.id));
  };

  const dailyTasks = getDailyRecommendedTasks();

  return (
    <div className="agile-health-page">
      {/* 页面头部 */}
      <div className="agile-health-header">
        <div className="agile-health-title">
          <h1>敏捷养生</h1>
          <p>碎片化时间也能做好健康管理</p>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="agile-health-content">
        <div className="daily-recommendation-section">
          <h2>今日推荐微任务</h2>
          <p>每天只需少量时间，就能有效改善健康状况：</p>
          
          <div className="task-grid">
            {dailyTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <div className="task-icon">{task.icon}</div>
                  <h3>{task.title}</h3>
                </div>
                <div className="task-body">
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    <span className="task-duration">⏱️ {task.duration}</span>
                    <span className="task-category">🏷️ {task.category}</span>
                  </div>
                </div>
                <button className="start-task-btn">开始任务</button>
              </div>
            ))}
          </div>
        </div>

        {/* 7天敏捷养生打卡表 */}
        <div className="seven-day-checklist-section">
          <h2>7天敏捷养生打卡表</h2>
          <p>坚持7天微任务打卡，养成健康好习惯：</p>
          
          <div className="checklist-table">
            <div className="checklist-header">
              <div className="header-cell">日期</div>
              <div className="header-cell">晨起微任务</div>
              <div className="header-cell">午间微任务</div>
              <div className="header-cell">睡前微任务</div>
              <div className="header-cell">身体感受 (1-10分)</div>
              <div className="header-cell">复盘调整</div>
            </div>
            
            <div className="checklist-body">
              {sevenDayChecklist.map((dayData, dayIndex) => (
                <div key={dayData.day} className="checklist-row">
                  <div className="cell day-cell">{dayData.day}</div>
                  <div className="cell task-cell">
                    <div className="task-name">{dayData.morningTask.title}</div>
                    <div className="task-time">5-10分钟</div>
                  </div>
                  <div className="cell task-cell">
                    <div className="task-name">{dayData.noonTask.title}</div>
                    <div className="task-time">5-10分钟</div>
                  </div>
                  <div className="cell task-cell">
                    <div className="task-name">{dayData.nightTask.title}</div>
                    <div className="task-time">5-10分钟</div>
                  </div>
                  <div className="cell feeling-cell">
                    <div className="feeling-score-selector">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                        <button
                          key={score}
                          className={`score-btn ${dayData.bodyFeeling === score ? 'selected' : ''}`}
                          onClick={() => updateBodyFeeling(dayIndex, score)}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    <div className="current-score">
                      当前: {dayData.bodyFeeling || '未评分'}
                    </div>
                  </div>
                  <div className="cell review-cell">
                    <textarea
                      className="review-textarea"
                      placeholder="记录感受或调整计划..."
                      value={dayData.reviewAdjustment}
                      onChange={(e) => updateReviewAdjustment(dayIndex, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="checklist-tips">
            <h3>使用提示</h3>
            <ul>
              <li>每天完成3个微任务，每个5-10分钟</li>
              <li>根据身体感受评分调整任务安排</li>
              <li>周末复盘，保留舒适任务，替换不适任务</li>
              <li>坚持7天形成健康习惯</li>
            </ul>
          </div>
        </div>

        <div className="task-library-section">
          <h2>微任务库</h2>
          <p>选择适合您的微任务，随时随地养生：</p>
          
          <div className="task-category-grid">
            {['办公间隙', '晨起', '睡前', '运动', '放松'].map(category => {
              const categoryTasks = microTaskLibrary.filter(task => task.category === category);
              return (
                <div key={category} className="category-card">
                  <h3>{category}</h3>
                  <ul>
                    {categoryTasks.map(task => (
                      <li key={task.id}>
                        <span className="task-icon-small">{task.icon}</span>
                        <span className="task-title">{task.title}</span>
                        <span className="task-duration-small">{task.duration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgileHealthPage;