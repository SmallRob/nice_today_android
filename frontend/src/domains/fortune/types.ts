/**
 * 运势分析域类型定义
 */

// 星座运势类型
export interface HoroscopeData {
  sign: ZodiacSign;
  date: string;
  overall: number; // 1-5
  love: number; // 1-5
  career: number; // 1-5
  wealth: number; // 1-5
  health: number; // 1-5
  luckyNumber: number;
  luckyColor: string;
  summary: string;
  details: {
    loveDescription: string;
    careerDescription: string;
    wealthDescription: string;
    healthDescription: string;
  };
}

export type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer' 
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

// 八字分析类型
export interface BaziData {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  fiveElements: FiveElements;
  dayMaster: string;
  analysis: BaziAnalysis;
}

export interface Pillar {
  heavenlyStem: string;
  earthlyBranch: string;
  hiddenStems: string[];
  nayin: string;
}

export interface FiveElements {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface BaziAnalysis {
  strength: string;
  favorableElements: string[];
  unfavorableElements: string[];
  personality: string;
  career: string;
  health: string;
  relationships: string;
}

// 紫微斗数类型
export interface ZiWeiData {
  palaces: ZiWeiPalace[];
  mainStars: ZiWeiStar[];
  auxiliaryStars: ZiWeiStar[];
  yearStars: ZiWeiStar[];
  analysis: ZiWeiAnalysis;
}

export interface ZiWeiPalace {
  name: string;
  position: number;
  stars: string[];
  meaning: string;
}

export interface ZiWeiStar {
  name: string;
  palace: string;
  brightness: string;
  meaning: string;
}

export interface ZiWeiAnalysis {
  personality: string;
  career: string;
  wealth: string;
  relationships: string;
  health: string;
  overall: string;
}

// 黄历类型
export interface HuangliData {
  date: string;
  lunarDate: string;
  ganZhi: string;
  yi: string[]; // 宜
  ji: string[]; // 忌
  auspicious: string[];
  inauspicious: string[];
  gods: string[];
  directions: {
    wealth: string;
    happiness: string;
    evil: string;
  };
}

// 塔罗牌类型
export interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number: number;
  image: string;
  upright: string;
  reversed: string;
  meaning: string;
  keywords: string[];
}

export interface TarotReading {
  cards: TarotCard[];
  positions: string[];
  spread: string;
  question: string;
  interpretation: string;
  date: string;
}

// 玛雅历法类型
export interface MayaData {
  kin: number;
  seal: string;
  tone: string;
  wavespell: string;
  castle: string;
  analysis: string;
}

// 数字命理类型
export interface NumerologyData {
  lifePathNumber: number;
  destinyNumber: number;
  soulNumber: number;
  personalityNumber: number;
  birthdayNumber: number;
  analysis: NumerologyAnalysis;
}

export interface NumerologyAnalysis {
  lifePath: string;
  destiny: string;
  soul: string;
  personality: string;
  compatibility: string[];
}

// 奇门遁甲类型
export interface QimenData {
  palace: QimenPalace[];
  analysis: string;
}

export interface QimenPalace {
  number: number;
  star: string;
  door: string;
  deity: string;
  element: string;
  meaning: string;
}

// 运势分析域状态
export interface FortuneState {
  currentFortune: HoroscopeData | null;
  baziData: BaziData | null;
  ziweiData: ZiWeiData | null;
  huangliData: HuangliData | null;
  tarotReading: TarotReading | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// 运势分析域配置
export interface FortuneConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  cacheEnabled: boolean;
  cacheDuration: number;
}

// 运势分析域模块ID
export type FortuneModuleId = 
  | 'horoscope'
  | 'bazi'
  | 'ziwei'
  | 'huangli'
  | 'tarot'
  | 'maya'
  | 'chinese_zodiac'
  | 'numerology'
  | 'qimen_dunjia'
  | 'takashima'
  | 'tiebanshenshu'
  | 'plum_blossom'
  | 'six_yao'
  | 'simple_iching';