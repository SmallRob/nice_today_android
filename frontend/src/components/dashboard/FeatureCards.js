import FeatureCard from './FeatureCard';
import { useUserConfig } from '../../contexts/UserConfigContext';
import { useNavigate } from 'react-router-dom';
import { getZodiacNumber } from '../../utils/horoscopeAlgorithm';

/**
 * MBTI测试组件
 */
const MBTICard = () => {
  return (
    <FeatureCard
      title="MBTI测试"
      icon="mbti"
      category="growth"
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
      icon="chinese-zodiac"
      category="fortune"
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
      icon="horoscope"
      category="fortune"
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
      icon="bazi"
      category="fortune"
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
      icon="biorhythm"
      category="health"
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
      // 使用数字编码作为URL参数，避免中文编码问题
      const zodiacNumber = getZodiacNumber(userZodiac);
      navigate(`/horoscope-traits/${zodiacNumber}`, {
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
      icon="horoscope"
      category="fortune"
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
      icon="energy-boost"
      category="growth"
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
      icon="period-tracker"
      category="health"
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
      icon="ziwei"
      category="fortune"
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
      icon="todo"
      category="daily"
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
      icon="finance"
      category="daily"
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
      icon="takashima"
      category="fortune"
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
      icon="life-matrix"
      category="growth"
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
      icon="daily-card"
      category="entertainment"
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
      icon="tarot-garden"
      category="entertainment"
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
      icon="cultural-cup"
      category="entertainment"
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
      icon="dress-guide"
      category="growth"
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
      icon="wuxing-health"
      category="health"
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
      icon="organ-rhythm"
      category="health"
      route="/organ-rhythm"
    />
  );
};

/**
 * 钓了么钓鱼游戏组件
 */
const FishingGameCard = () => {
  return (
    <FeatureCard
      title="钓了么"
      icon="fishing-game"
      category="entertainment"
      route="/fishing-game"
    />
  );
};

/**
 * 风水罗盘组件
 */
const FengShuiCompassCard = () => {
  return (
    <FeatureCard
      title="风水罗盘"
      icon="feng-shui-compass"
      category="tool"
      route="/feng-shui-compass"
    />
  );
};

/**
 * 六爻占卜组件
 */
const LiuyaoCard = () => {
  return (
    <FeatureCard
      title="六爻占卜"
      icon="liuyao"
      category="fortune"
      route="/liuyao"
    />
  );
};

/**
 * 梅花易数组件
 */
const PlumBlossomCard = () => {
  return (
    <FeatureCard
      title="梅花易数"
      icon="plum-blossom"
      category="fortune"
      route="/plum-blossom"
    />
  );
};

/**
 * 古风马吊组件
 */
const AncientCardGameCard = () => {
  return (
    <FeatureCard
      title="古风马吊"
      icon="ancient-card-game"
      category="entertainment"
      route="/ancient-card-game"
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
  OrganRhythmCard,
  FishingGameCard,
  FengShuiCompassCard,
  LiuyaoCard,
  PlumBlossomCard,
  AncientCardGameCard
};