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
      icon="dragon"
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
      icon="book"
      color="#8b5cf6"
      route="/bazi?mode=monthly"
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
      console.log('从功能卡片跳转到星座特质页面:', userZodiac);
      // 优化：直接跳转到用户的星座特质页面，传递URL参数
      navigate(`/zodiac-traits/${encodeURIComponent(userZodiac)}`, {
        state: { 
          from: 'feature-card', 
          userZodiac: userZodiac,
          timestamp: Date.now()
        }
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
      icon="sparkles"
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
      color="#db2777"
      route="/period-tracker"
    />
  );
};

/**
 * 紫微命宫组件
 */
const ZiWeiCard = () => {
  const { currentConfig } = useUserConfig();
  const navigate = useNavigate();

  const handleClick = () => {
    // 检查是否有必要的配置信息
    if (currentConfig?.birthDate) {
      navigate('/ziwei');
    } else {
      // 如果没有配置出生信息，跳转到设置页面
      navigate('/settings');
    }
  };

  return (
    <FeatureCard
      title="紫微命宫"
      description="传统命理深度分析"
      icon="star-outline"
      color="#d946ef"
      onClick={handleClick}
    />
  );
};

/**
 * 待办事项组件
 */
const TodoCard = () => {
  return (
    <FeatureCard
      title="待办事项"
      description="高效管理日常任务"
      icon="check-circle"
      color="#3b82f6"
      route="/todo-list"
    />
  );
};

/**
 * 财务斩杀线组件
 */
const FinanceCard = () => {
  return (
    <FeatureCard
      title="财务斩杀线"
      description="智能收支管理分析"
      icon="money"
      color="#ef4444"
      route="/finance"
    />
  );
};

/**
 * 高岛易断卜卦组件
 */
const TakashimaDivinationCard = () => {
  return (
    <FeatureCard
      title="高岛易断"
      description="传统周易卦象占卜"
      icon="divination"
      color="#0ea5e9"
      route="/takashima-advice"
    />
  );
};

/**
 * 生命矩阵组件
 */
const LifeMatrixCard = () => {
  return (
    <FeatureCard
      title="生命矩阵"
      description="构建你的意义能量图谱"
      icon="grid"
      color="#14b8a6"
      route="/lifestyle-guide"
    />
  );
};

/**
 * 每日集卡组件
 */
const DailyCardCard = () => {
  return (
    <FeatureCard
      title="每日集卡"
      description="摇一摇收集精美卡牌"
      icon="shuffle"
      color="#f472b6"
      route="/daily-cards"
    />
  );
};

/**
 * 塔罗花园组件
 */
const TarotGardenCard = () => {
  return (
    <FeatureCard
      title="塔罗花园"
      description="探索塔罗牌的智慧与奥秘"
      icon="cards"
      color="#9333ea"
      route="/tarot-garden"
    />
  );
};

/**
 * 摔杯请卦组件
 */
const CulturalCupCard = () => {
  return (
    <FeatureCard
      title="摔杯请卦"
      description="传统卜卦 · 心诚则灵"
      icon="🏆"
      color="#8B4513"
      route="/cultural-cup"
    />
  );
};

/**
 * 穿衣指南组件
 */
const DressGuideCard = () => {
  return (
    <FeatureCard
      title="穿衣指南"
      description="五行穿衣 · 每日运势"
      icon="👕"
      color="#ec4899"
      route="/dress"
    />
  );
};

/**
 * 五行养生组件
 */
const WuxingHealthCard = () => {
  return (
    <FeatureCard
      title="五行养生"
      description="季节调养 · 身心平衡"
      icon="💚"
      color="#8b5cf6"
      route="/wuxing-health"
    />
  );
};

/**
 * 器官节律组件
 */
const OrganRhythmCard = () => {
  return (
    <FeatureCard
      title="器官节律"
      description="子午流注 · 十二时辰"
      icon="⏰"
      color="#9333ea"
      route="/organ-rhythm"
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
  PeriodTrackerCard,
  ZiWeiCard,
  TodoCard,
  FinanceCard,
  TakashimaDivinationCard,
  LifeMatrixCard,
  DailyCardCard,
  TarotGardenCard,
  CulturalCupCard,
  DressGuideCard,
  WuxingHealthCard,
  OrganRhythmCard
};
