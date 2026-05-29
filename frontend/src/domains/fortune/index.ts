/**
 * 运势分析域
 * 负责：星座运势、八字分析、紫微斗数、黄历、塔罗等
 */

// 导出服务
export { fortuneService } from './services/fortuneService';

// 导出组件
export { default as HoroscopePage } from './components/HoroscopePage';
export { default as BaziPage } from './components/BaziPage';
export { default as TarotPage } from './components/TarotPage';
export { default as HuangliPage } from './components/HuangliPage';

// 导出类型
export type {
  HoroscopeData,
  ZodiacSign,
  BaziData,
  Pillar,
  FiveElements,
  BaziAnalysis,
  ZiWeiData,
  ZiWeiPalace,
  ZiWeiStar,
  ZiWeiAnalysis,
  HuangliData,
  TarotCard,
  TarotReading,
  MayaData,
  NumerologyData,
  NumerologyAnalysis,
  QimenData,
  QimenPalace,
  FortuneState,
  FortuneConfig,
  FortuneModuleId
} from './types';

// 域标识
export const FORTUNE_DOMAIN = 'fortune' as const;

// 功能模块 ID
export const FORTUNE_MODULES = {
  HOROSCOPE: 'horoscope',
  BAZI: 'bazi',
  ZIWEI: 'ziwei',
  HUANGLI: 'huangli',
  TAROT: 'tarot',
  MAYA: 'maya',
  CHINESE_ZODIAC: 'chinese_zodiac',
  NUMEROLOGY: 'numerology',
  QIMEN_DUNJIA: 'qimen_dunjia',
  TAKASHIMA: 'takashima',
  TIEBANSHENSHU: 'tiebanshenshu',
} as const;
