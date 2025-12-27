import FeatureCard from './FeatureCard';

/**
 * MBTI测试组件
 */
const MBTICard = () => {
  return (
    <FeatureCard
      title="MBTI测试"
      description="探索您的性格类型"
      icon="brain"
      color="#6366f1"
      route="/mbti"
      highlight={true}
    />
  );
};

/**
 * 生肖运势组件
 */
const ChineseZodiacCard = () => {
  return (
    <FeatureCard
      title="生肖运势"
      description="今日生肖运势解读"
      icon="star"
      color="#f59e0b"
      route="/zodiac"
    />
  );
};

/**
 * 星座运势组件
 */
const HoroscopeCard = () => {
  return (
    <FeatureCard
      title="星座运势"
      description="十二星座每日运势"
      icon="weather-sunny"
      color="#ec4899"
      route="/horoscope"
      highlight={true}
    />
  );
};

/**
 * 八字月运组件
 */
const BaziCard = () => {
  return (
    <FeatureCard
      title="八字月运"
      description="命理运势深度解析"
      icon="calendar"
      color="#8b5cf6"
      route="/bazi"
    />
  );
};

/**
 * 人体节律趋势分析组件
 */
const BiorhythmCard = () => {
  return (
    <FeatureCard
      title="人体节律"
      description="体力、情绪、智力周期"
      icon="chart-line"
      color="#10b981"
      route="/trend"
      highlight={true}
    />
  );
};

/**
 * 星座特质解析组件
 */
const PersonalityTraitCard = () => {
  return (
    <FeatureCard
      title="星座特质"
      description="了解您的星座性格"
      icon="star"
      color="#06b6d4"
      route="/personality"
    />
  );
};

/**
 * 能量提升组件
 */
const EnergyBoostCard = () => {
  return (
    <FeatureCard
      title="能量提升"
      description="日常能量管理建议"
      icon="lightning-bolt"
      color="#f97316"
      route="/energy"
    />
  );
};

export {
  MBTICard,
  ChineseZodiacCard,
  HoroscopeCard,
  BaziCard,
  BiorhythmCard,
  PersonalityTraitCard,
  EnergyBoostCard
};
