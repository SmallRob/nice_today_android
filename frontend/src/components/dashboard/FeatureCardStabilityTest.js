import React from 'react';
import FeatureCard from './FeatureCard';

/**
 * FeatureCard 稳定性测试组件
 * 用于验证修复后的 FeatureCard 组件是否能稳定显示图标和标题
 */
const FeatureCardStabilityTest = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h2>FeatureCard 稳定性测试</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <FeatureCard
          title="MBTI测试"
          icon="mbti"
          category="growth"
          route="/mbti-test"
        />
        <FeatureCard
          title="生肖运势"
          icon="chinese-zodiac"
          category="fortune"
          route="/chinese-zodiac"
        />
        <FeatureCard
          title="星座运势"
          icon="horoscope"
          category="fortune"
          route="/horoscope"
        />
        <FeatureCard
          title="八字月运"
          icon="bazi"
          category="fortune"
          route="/bazi?mode=monthly"
        />
        <FeatureCard
          title="人体节律"
          icon="biorhythm"
          category="health"
          route="/biorhythm"
        />
      </div>
    </div>
  );
};

export default FeatureCardStabilityTest;