// 导入所有图标组件
import MBTIIcon from '../icons/MBTIIcon';
import ChineseZodiacIcon from '../icons/ChineseZodiacIcon';
import HoroscopeIcon from '../icons/HoroscopeIcon';
import BaziIcon from '../icons/BaziIcon';
import BiorhythmIcon from '../icons/BiorhythmIcon';
import PersonalityTraitIcon from '../icons/PersonalityTraitIcon';
import EnergyBoostIcon from '../icons/EnergyBoostIcon';
import PeriodTrackerIcon from '../icons/PeriodTrackerIcon';
import ZiWeiIcon from '../icons/ZiWeiIcon';
import TodoIcon from '../icons/TodoIcon';
import FinanceIcon from '../icons/FinanceIcon';
import TakashimaIcon from '../icons/TakashimaIcon';
import LifeMatrixIcon from '../icons/LifeMatrixIcon';
import DailyCardIcon from '../icons/DailyCardIcon';
import TarotGardenIcon from '../icons/TarotGardenIcon';
import CulturalCupIcon from '../icons/CulturalCupIcon';
import DressGuideIcon from '../icons/DressGuideIcon';
import WuxingHealthIcon from '../icons/WuxingHealthIcon';
import OrganRhythmIcon from '../icons/OrganRhythmIcon';
import FishingGameIcon from '../icons/FishingGameIcon';
import FengShuiCompassIcon from '../icons/FengShuiCompassIcon';
import LiuyaoIcon from '../icons/LiuyaoIcon';
import PlumBlossomIcon from '../icons/PlumBlossomIcon';

/**
 * 图标映射表 - 稳定的React组件渲染
 */
const iconMap = {
  // 功能图标
  'mbti': MBTIIcon,
  'chinese-zodiac': ChineseZodiacIcon,
  'horoscope': HoroscopeIcon,
  'bazi': BaziIcon,
  'biorhythm': BiorhythmIcon,
  'personality': PersonalityTraitIcon,
  'energy-boost': EnergyBoostIcon,
  'period-tracker': PeriodTrackerIcon,
  'ziwei': ZiWeiIcon,
  'todo': TodoIcon,
  'finance': FinanceIcon,
  'takashima': TakashimaIcon,
  'life-matrix': LifeMatrixIcon,
  'daily-card': DailyCardIcon,
  'tarot-garden': TarotGardenIcon,
  'cultural-cup': CulturalCupIcon,
  'dress-guide': DressGuideIcon,
  'wuxing-health': WuxingHealthIcon,
  'organ-rhythm': OrganRhythmIcon,
  'fishing-game': FishingGameIcon,
  'feng-shui-compass': FengShuiCompassIcon,
  'liuyao': LiuyaoIcon,
  'plum-blossom': PlumBlossomIcon,

  // 默认图标（用于category）
  'daily': TodoIcon,
  'fortune': HoroscopeIcon,
  'growth': EnergyBoostIcon,
  'health': BiorhythmIcon,
  'entertainment': TarotGardenIcon,
  'tool': FengShuiCompassIcon,
};

const ModernIcon = ({ name, size = 24, color = '#1a1a1a', className = '' }) => {
  // 获取对应的图标组件
  const IconComponent = iconMap[name];
  
  // 如果找不到指定的图标，但有默认图标
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found, using default icon`);
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      </svg>
    );
  }

  // 安全渲染图标组件，避免渲染错误
  try {
    return <IconComponent size={size} color={color} className={className} />;
  } catch (error) {
    console.error(`Error rendering icon "${name}":`, error);
    // 如果渲染出错，返回默认图标
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      </svg>
    );
  }
};

export default ModernIcon;