/**
 * 娱乐休闲域
 * 负责：游戏、趣味测试、互动内容等
 */

// 导出服务
export { entertainmentService } from './services/entertainmentService';

// 导出类型
export type {
  CardGame,
  Card,
  CardSpread,
  GameHistory,
  BookOfAnswers,
  Answer,
  AnswerHistory,
  DailyCard,
  FishingGame,
  FishingRod,
  FishingBait,
  FishingLocation,
  FishCatch,
  FishingItem,
  TarotGarden,
  GardenPlant,
  GardenDecoration,
  GardenVisitor,
  GardenWeather,
  RainbowMood,
  MoodColor,
  MoodActivity,
  FengShuiCompass,
  CompassElement,
  FengShuiRecommendation,
  Achievement,
  EntertainmentState,
  EntertainmentConfig,
  EntertainmentModuleId
} from './types';

// 域标识
export const ENTERTAINMENT_DOMAIN = 'entertainment' as const;

// 功能模块 ID
export const ENTERTAINMENT_MODULES = {
  ANCIENT_CARD_GAME: 'ancient_card_game',
  BOOK_OF_ANSWERS: 'book_of_answers',
  DAILY_CARD: 'daily_card',
  FISHING_GAME: 'fishing_game',
  TAROT_GARDEN: 'tarot_garden',
  RAINBOW_MOOD: 'rainbow_mood',
  CULTURAL_CAP: 'cultural_cap',
  FENG_SHUI_COMPASS: 'feng_shui_compass',
} as const;

export type EntertainmentModuleIdType = typeof ENTERTAINMENT_MODULES[keyof typeof ENTERTAINMENT_MODULES];