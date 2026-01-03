import React from 'react';
import { useLocation } from 'react-router-dom';
import { useUserConfig } from '../contexts/UserConfigContext';
import { getAgeGroupByAge, AGE_GROUPS } from '../constants/ageGroups';
import './StageHealthPage.css';

// 阶段养生页面
const StageHealthPage = () => {
  const location = useLocation();
  const { currentConfig } = useUserConfig();
  
  // 获取年龄段信息
  const getAgeGroupData = () => {
    // 优先使用导航传递的年龄段
    const ageGroupFromState = location.state?.ageGroup;
    if (ageGroupFromState && AGE_GROUPS[ageGroupFromState]) {
      return AGE_GROUPS[ageGroupFromState];
    }
    
    // 如果导航未传递或传递的无效，尝试从用户配置计算
    if (currentConfig?.birthDate) {
      const birthDate = new Date(currentConfig.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return getAgeGroupByAge(age);
    }
    
    // 默认返回未知年龄段
    return {
      range: '未知年龄段',
      stage: '未知阶段',
      description: '无法获取年龄段信息',
      color: '#999999'
    };
  };
  
  const ageGroupData = getAgeGroupData();
  
  // 根据年龄段获取对应的养生建议
  const getHealthAdvice = () => {
    const adviceMap = {
      '0-5岁': {
        focus: '生长发育',
        tips: [
          '保证充足营养和睡眠',
          '定期进行生长发育检查',
          '创造安全的成长环境',
          '培养良好的生活习惯'
        ]
      },
      '6-12岁': {
        focus: '身心发展',
        tips: [
          '保证每天1小时户外活动',
          '均衡饮食，避免挑食',
          '培养学习兴趣和良好习惯',
          '注意视力保护'
        ]
      },
      '13-17岁': {
        focus: '青春期发育',
        tips: [
          '保证充足睡眠，避免熬夜',
          '均衡营养，支持身体发育',
          '适度运动，增强体质',
          '培养良好心理素质'
        ]
      },
      '18-25岁': {
        focus: '代谢调理',
        tips: [
          '保持规律作息，避免熬夜',
          '适度运动，增强体质',
          '饮食清淡，避免辛辣刺激',
          '关注肝胆健康'
        ]
      },
      '26-35岁': {
        focus: '事业家庭平衡',
        tips: [
          '调节工作压力，保持心态平和',
          '规律运动，增强免疫力',
          '注意饮食营养均衡',
          '关注心脏健康'
        ]
      },
      '36-45岁': {
        focus: '脏腑调理',
        tips: [
          '注重工作生活平衡',
          '定期体检，预防慢性病',
          '适度运动，保持关节灵活',
          '关注脾胃健康'
        ]
      },
      '46-55岁': {
        focus: '经验智慧',
        tips: [
          '注重脏腑功能调理',
          '定期体检，预防慢性病',
          '适度运动，保持关节灵活',
          '关注肺脏健康'
        ]
      },
      '56-65岁': {
        focus: '经络通畅',
        tips: [
          '养护脾胃，饮食易消化',
          '经络按摩，促进血液循环',
          '适度活动，保持关节灵活',
          '关注脾胃经络'
        ]
      },
      '66岁+': {
        focus: '静养补充',
        tips: [
          '静养为主，避免过度劳累',
          '适当补充气血',
          '保持心情平和',
          '关注肾脏健康'
        ]
      }
    };
    
    return adviceMap[ageGroupData.range] || adviceMap['26-35岁'];
  };
  
  const healthAdvice = getHealthAdvice();

  return (
    <div className="stage-health-page">
      {/* 页面头部 */}
      <div className="stage-health-header">
        <div className="stage-health-title">
          <h1>阶段养生</h1>
          <p>根据年龄段提供个性化养生建议</p>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="stage-health-content">
        <div className="age-group-section">
          <div className="age-group-card" style={{ 
            background: `linear-gradient(135deg, ${ageGroupData.color}40, ${ageGroupData.color}80)`,
            borderLeft: `6px solid ${ageGroupData.color}`
          }}>
            <h2>当前年龄段：{ageGroupData.range}</h2>
            <h3>{ageGroupData.stage}</h3>
            <p>{ageGroupData.description}</p>
          </div>
          
          <div className="health-advice-card">
            <h3>养生重点：{healthAdvice.focus}</h3>
            <ul>
              {healthAdvice.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="health-advice-card">
            <h3>五行养生建议</h3>
            <p>根据五行理论，不同年龄段对应的五行元素有所不同：</p>
            <ul>
              <li><strong>婴幼儿期（0-5岁）</strong>：土元素为主，侧重脾胃养护</li>
              <li><strong>儿童期（6-12岁）</strong>：木元素为主，侧重肝胆养护</li>
              <li><strong>青少年期（13-17岁）</strong>：火元素为主，侧重心脏保养</li>
              <li><strong>青年早期（18-25岁）</strong>：木元素为主，侧重肝胆养护</li>
              <li><strong>青年中期（26-35岁）</strong>：火元素为主，侧重心脏保养</li>
              <li><strong>中年早期（36-45岁）</strong>：土元素为主，侧重脾胃养护</li>
              <li><strong>中年中期（46-55岁）</strong>：金元素为主，侧重肺脏保养</li>
              <li><strong>中年晚期（56-65岁）</strong>：土元素为主，侧重脾胃养护</li>
              <li><strong>老年期（66岁以上）</strong>：水元素为主，侧重肾脏保养</li>
            </ul>
          </div>

          <div className="health-advice-card">
            <h3>季节调养提醒</h3>
            <p>根据不同季节调整养生策略：</p>
            <ul>
              <li><strong>春季</strong>：养肝，多吃绿色蔬菜</li>
              <li><strong>夏季</strong>：养心，注意防暑降温</li>
              <li><strong>秋季</strong>：养肺，多吃白色食物</li>
              <li><strong>冬季</strong>：养肾，注意保暖</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageHealthPage;