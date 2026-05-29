# Feature PRD: 健康管理模块优化

**Epic**: Android原生体验架构升级  
**Feature ID**: E001F005  
**Date**: 2026-05-27  
**Status**: Draft

## 1. Feature Overview

### 1.1 Feature Description
对健康管理模块进行全面优化，包括生物节律、情绪日历、身体指标、健康仪表盘等功能页面。采用现代化的数据可视化、卡片式布局、流畅动画和原生交互，提升健康管理模块的专业感和用户体验。

### 1.2 Business Context
健康管理是应用的重要功能，当前存在以下问题：
- 数据展示方式单一，可读性一般
- 缺乏直观的数据可视化
- 页面设计较为传统，缺乏现代感
- 缺乏个性化和互动性

优化健康管理模块可以：
- 提升核心功能的用户体验
- 增加用户粘性和使用时长
- 提升应用的专业形象
- 为后续功能扩展打下基础

## 2. User Stories

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| US-001 | 作为用户，我希望生物节律页面有直观的曲线图，以便清晰了解身体状态变化 | High | 1. 有平滑的曲线动画 2. 支持多维度数据对比 3. 支持时间范围选择 |
| US-002 | 作为用户，我希望情绪日历有彩色标记，以便快速了解情绪变化趋势 | High | 1. 日历有情绪颜色标记 2. 支持情绪记录和查看 3. 有情绪统计图表 |
| US-003 | 作为用户，我希望健康数据有专业的可视化展示，以便更好地理解健康状况 | High | 1. 有环形进度图 2. 有柱状图对比 3. 有趋势折线图 |
| US-004 | 作为用户，我希望有健康提醒功能，以便养成良好的健康习惯 | Medium | 1. 支持喝水提醒 2. 支持运动提醒 3. 支持睡眠提醒 |
| US-005 | 作为用户，我希望有健康报告功能，以便定期了解健康状况总结 | Medium | 1. 支持周报/月报生成 2. 有健康评分 3. 有改善建议 |

## 3. Technical Design

### 3.1 生物节律页面设计

```javascript
// pages/BiorhythmPage.js
import React from 'react';
import { motion } from 'framer-motion';
import { useBiorhythm } from '../hooks/useBiorhythm';

export const BiorhythmPage = () => {
  const { biorhythm, dateRange, setDateRange } = useBiorhythm();

  return (
    <div className="min-h-screen bg-surface">
      {/* 顶部概览 */}
      <motion.div 
        className="bg-gradient-to-b from-primary-container to-surface p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-on-primary-container text-2xl font-bold">生物节律</h1>
          <p className="text-on-primary-container/80 text-sm">了解您的身体状态变化</p>
        </div>

        {/* 当前状态卡片 */}
        <div className="grid grid-cols-3 gap-3">
          <StatusCard 
            label="体力" 
            value={biorhythm.physical} 
            color="#3b82f6" 
            icon="heart"
          />
          <StatusCard 
            label="情绪" 
            value={biorhythm.emotional} 
            color="#ef4444" 
            icon="smile"
          />
          <StatusCard 
            label="智力" 
            value={biorhythm.intellectual} 
            color="#10b981" 
            icon="brain"
          />
        </div>
      </motion.div>

      {/* 节律曲线图 */}
      <motion.div 
        className="mx-4 -mt-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-surface-container-low rounded-2xl p-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-on-surface font-medium">节律曲线</h3>
            <DateRangeSelector 
              value={dateRange} 
              onChange={setDateRange}
            />
          </div>
          <div className="h-48">
            <BiorhythmChart 
              data={biorhythm.chartData}
              dateRange={dateRange}
            />
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <LegendItem color="#3b82f6" label="体力" />
            <LegendItem color="#ef4444" label="情绪" />
            <LegendItem color="#10b981" label="智力" />
          </div>
        </div>
      </motion.div>

      {/* 详细数据 */}
      <motion.div 
        className="mt-6 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Section title="今日详情" icon="calendar">
          <div className="space-y-4">
            <BiorhythmDetail 
              label="体力节律" 
              value={biorhythm.physical}
              description={getPhysicalDescription(biorhythm.physical)}
              color="#3b82f6"
            />
            <BiorhythmDetail 
              label="情绪节律" 
              value={biorhythm.emotional}
              description={getEmotionalDescription(biorhythm.emotional)}
              color="#ef4444"
            />
            <BiorhythmDetail 
              label="智力节律" 
              value={biorhythm.intellectual}
              description={getIntellectualDescription(biorhythm.intellectual)}
              color="#10b981"
            />
          </div>
        </Section>

        <Section title="建议" icon="lightbulb">
          <div className="space-y-3">
            {biorhythm.suggestions.map((suggestion, index) => (
              <SuggestionCard key={index} {...suggestion} />
            ))}
          </div>
        </Section>
      </motion.div>

      {/* 历史趋势 */}
      <motion.div 
        className="mt-6 px-4 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Section title="历史趋势" icon="chart">
          <div className="bg-surface-container-low rounded-2xl p-4">
            <div className="h-48">
              <TrendChart data={biorhythm.history} />
            </div>
          </div>
        </Section>
      </motion.div>
    </div>
  );
};
```

### 3.2 情绪日历页面设计

```javascript
// pages/MoodCalendarPage.js
import React from 'react';
import { motion } from 'framer-motion';
import { useMoodCalendar } from '../hooks/useMoodCalendar';

export const MoodCalendarPage = () => {
  const { 
    currentDate, 
    moodData, 
    selectedDate, 
    setSelectedDate 
  } = useMoodCalendar();

  return (
    <div className="min-h-screen bg-surface">
      {/* 月份导航 */}
      <motion.div 
        className="bg-surface-container-high p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <button className="p-2 rounded-full hover:bg-surface-container">
            <Icon name="chevron-left" size={24} />
          </button>
          <h2 className="text-on-surface text-lg font-medium">
            {currentDate.format('YYYY年MM月')}
          </h2>
          <button className="p-2 rounded-full hover:bg-surface-container">
            <Icon name="chevron-right" size={24} />
          </button>
        </div>
      </motion.div>

      {/* 日历视图 */}
      <motion.div 
        className="mx-4 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-surface-container-low rounded-2xl p-4 shadow-lg">
          {/* 星期头部 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="text-center text-on-surface-variant text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays(currentDate).map((day, index) => (
              <CalendarDay
                key={index}
                date={day.date}
                isCurrentMonth={day.isCurrentMonth}
                mood={moodData[day.date]}
                isSelected={selectedDate === day.date}
                onClick={() => setSelectedDate(day.date)}
              />
            ))}
          </div>

          {/* 情绪图例 */}
          <div className="flex justify-center gap-3 mt-4">
            <MoodLegend mood="happy" label="开心" />
            <MoodLegend mood="calm" label="平静" />
            <MoodLegend mood="anxious" label="焦虑" />
            <MoodLegend mood="sad" label="难过" />
            <MoodLegend mood="angry" label="生气" />
          </div>
        </div>
      </motion.div>

      {/* 情绪统计 */}
      <motion.div 
        className="mt-6 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Section title="本月情绪统计" icon="chart">
          <div className="bg-surface-container-low rounded-2xl p-4">
            <div className="h-48">
              <MoodChart data={moodData} />
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {Object.entries(moodData.stats).map(([mood, count]) => (
                <MoodStatCard key={mood} mood={mood} count={count} />
              ))}
            </div>
          </div>
        </Section>
      </motion.div>

      {/* 情绪记录 */}
      <motion.div 
        className="mt-6 px-4 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Section title="情绪记录" icon="edit">
          <div className="space-y-3">
            {moodData.records.map((record, index) => (
              <MoodRecordCard key={index} {...record} />
            ))}
          </div>
          <Button 
            onClick={() => setShowMoodPicker(true)} 
            variant="filled"
            className="w-full mt-4"
          >
            记录今日心情
          </Button>
        </Section>
      </motion.div>
    </div>
  );
};
```

### 3.3 数据可视化组件

```javascript
// components/charts/BiorhythmChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';

export const BiorhythmChart = ({ data, dateRange }) => {
  const chartData = {
    labels: data.dates,
    datasets: [
      {
        label: '体力',
        data: data.physical,
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f620',
        tension: 0.4,
        fill: false,
      },
      {
        label: '情绪',
        data: data.emotional,
        borderColor: '#ef4444',
        backgroundColor: '#ef444420',
        tension: 0.4,
        fill: false,
      },
      {
        label: '智力',
        data: data.intellectual,
        borderColor: '#10b981',
        backgroundColor: '#10b98120',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        min: -100,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
        grid: {
          color: 'var(--outline-variant)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return <Line data={chartData} options={options} />;
};

// components/charts/MoodChart.js
export const MoodChart = ({ data }) => {
  const moodColors = {
    happy: '#4CAF50',
    calm: '#2196F3',
    anxious: '#FF9800',
    sad: '#9C27B0',
    angry: '#F44336',
  };

  const chartData = {
    labels: Object.keys(data.stats),
    datasets: [{
      data: Object.values(data.stats),
      backgroundColor: Object.keys(data.stats).map(mood => moodColors[mood]),
      borderWidth: 0,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: '60%',
  };

  return <Doughnut data={chartData} options={options} />;
};
```

### 3.4 健康提醒功能

```javascript
// hooks/useHealthReminder.js
import { useEffect, useCallback } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

export const useHealthReminder = () => {
  const scheduleReminder = useCallback(async (reminder) => {
    try {
      await LocalNotifications.requestPermissions();
      
      await LocalNotifications.schedule({
        notifications: [{
          title: reminder.title,
          body: reminder.body,
          id: reminder.id,
          schedule: {
            at: reminder.time,
            repeats: reminder.repeats,
          },
          sound: 'default',
          attachments: null,
          actionTypeId: 'health-reminder',
          extra: null,
        }],
      });
    } catch (error) {
      console.error('设置提醒失败:', error);
    }
  }, []);

  const cancelReminder = useCallback(async (id) => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (error) {
      console.error('取消提醒失败:', error);
    }
  }, []);

  const setupDefaultReminders = useCallback(async () => {
    // 喝水提醒
    await scheduleReminder({
      id: 1,
      title: '喝水提醒',
      body: '记得喝水哦，保持身体水分充足！',
      time: new Date(new Date().setHours(10, 0, 0, 0)),
      repeats: true,
    });

    // 运动提醒
    await scheduleReminder({
      id: 2,
      title: '运动提醒',
      body: '该起来活动一下了，保持身体健康！',
      time: new Date(new Date().setHours(16, 0, 0, 0)),
      repeats: true,
    });

    // 睡眠提醒
    await scheduleReminder({
      id: 3,
      title: '睡眠提醒',
      body: '准备睡觉了，保证充足睡眠很重要！',
      time: new Date(new Date().setHours(22, 0, 0, 0)),
      repeats: true,
    });
  }, [scheduleReminder]);

  return {
    scheduleReminder,
    cancelReminder,
    setupDefaultReminders,
  };
};
```

## 4. Implementation Plan

### 4.1 Phase 1: 生物节律页面
- 设计现代化的页面布局
- 实现节律曲线图表
- 添加状态卡片和详情

### 4.2 Phase 2: 情绪日历页面
- 设计日历视图组件
- 实现情绪记录功能
- 添加情绪统计图表

### 4.3 Phase 3: 其他健康模块
- 升级身体指标页面
- 升级健康仪表盘页面
- 添加健康提醒功能

### 4.4 Phase 4: 健康报告
- 实现健康数据统计
- 生成健康报告
- 添加健康建议功能

## 5. Acceptance Criteria

- [ ] 生物节律页面有直观的曲线图展示
- [ ] 情绪日历有彩色标记和统计功能
- [ ] 健康数据有专业的可视化展示
- [ ] 支持健康提醒功能
- [ ] 深色模式下显示正常
- [ ] 页面加载时间<1秒
- [ ] 数据记录和保存功能正常

## 6. Technical Dependencies

- Chart.js（图表）
- @capacitor/local-notifications（本地通知）
- date-fns（日期处理）
- 设计系统组件库（E001F001）

## 7. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 图表性能问题 | 中 | 中 | 使用Canvas渲染，优化数据量 |
| 提醒功能被系统限制 | 中 | 高 | 提供应用内提醒作为备选 |
| 数据准确性问题 | 低 | 高 | 加强数据验证和错误处理 |
| 用户隐私问题 | 低 | 高 | 明确数据使用说明，本地存储 |
