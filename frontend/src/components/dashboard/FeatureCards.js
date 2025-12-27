import FeatureCard from './FeatureCard';
import { useUserConfig } from '../../contexts/UserConfigContext';
import { useNavigate } from 'react-router-dom';

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
      route="/mbti-test"
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
      description="了解您的生肖性格"
      icon="star"
      color="#f59e0b"
      route="/chinese-zodiac"
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
      route="/biorhythm"
      highlight={true}
    />
  );
};

/**
 * 星座特质解析组件
 */
const PersonalityTraitCard = () => {
  const { currentConfig } = useUserConfig();
  const navigate = useNavigate();

  // 获取用户配置的星座，如果没有则跳转到默认页面
  const userZodiac = currentConfig?.zodiac;

  const handleClick = () => {
    if (userZodiac) {
      // 优化：直接跳转到用户的星座特质页面，传递URL参数
      navigate(`/zodiac-traits/${encodeURIComponent(userZodiac)}`, {
        state: { from: 'dashboard', userZodiac: userZodiac }
      });
    } else {
      // 如果没有配置星座，跳转到星座运势页面让用户选择
      navigate('/horoscope');
    }
  };

  return (
    <FeatureCard
      title="星座特质"
      description="了解您的星座性格"
      icon="star"
      color="#06b6d4"
      onClick={handleClick}
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

/**
 * 经期助手组件
 */
const PeriodTrackerCard = () => {
  return (
    <FeatureCard
      title="经期助手"
      description="智能周期追踪记录"
      icon="heart"
      color="#ec4899"
      route="/period-tracker"
      highlight={true}
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
  EnergyBoostCard,
  PeriodTrackerCard
};
