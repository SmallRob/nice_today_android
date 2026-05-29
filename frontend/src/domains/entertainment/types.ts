/**
 * 娱乐休闲域类型定义
 */

// 卡牌游戏类型
export interface CardGame {
  id: string;
  name: string;
  type: 'tarot' | 'oracle' | 'playing' | 'custom';
  deck: Card[];
  currentCard: Card | null;
  spread: CardSpread | null;
  history: GameHistory[];
}

export interface Card {
  id: number;
  name: string;
  image: string;
  meaning: string;
  reversed: boolean;
  position?: string;
}

export interface CardSpread {
  name: string;
  positions: number;
  layout: string[];
  description: string;
}

export interface GameHistory {
  date: string;
  cards: Card[];
  interpretation: string;
  rating: number; // 1-5
}

// 答案之书类型
export interface BookOfAnswers {
  totalAnswers: number;
  currentAnswer: Answer | null;
  history: AnswerHistory[];
  categories: string[];
}

export interface Answer {
  id: number;
  text: string;
  category: string;
  mood: 'positive' | 'neutral' | 'negative';
  advice: string;
}

export interface AnswerHistory {
  date: string;
  question: string;
  answer: Answer;
  rating: number; // 1-5
}

// 每日卡牌类型
export interface DailyCard {
  date: string;
  card: Card;
  message: string;
  affirmation: string;
  action: string;
  reflection: string;
  streak: number;
}

// 钓鱼游戏类型
export interface FishingGame {
  level: number;
  experience: number;
  nextLevel: number;
  coins: number;
  inventory: FishingItem[];
  catches: FishCatch[];
  currentRod: FishingRod;
  currentBait: FishingBait;
  location: FishingLocation;
  achievements: Achievement[];
}

export interface FishingRod {
  id: string;
  name: string;
  quality: number; // 1-10
  durability: number; // 0-100
  specialEffect?: string;
}

export interface FishingBait {
  id: string;
  name: string;
  type: 'worm' | 'lure' | 'fly' | 'bait';
  effectiveness: number; // 1-10
  quantity: number;
}

export interface FishingLocation {
  id: string;
  name: string;
  type: 'pond' | 'lake' | 'river' | 'ocean';
  fishTypes: string[];
  difficulty: number; // 1-10
  unlocked: boolean;
}

export interface FishCatch {
  id: string;
  fishType: string;
  weight: number;
  length: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  date: string;
  location: string;
  bait: string;
  rod: string;
}

export interface FishingItem {
  id: string;
  name: string;
  type: 'rod' | 'bait' | 'accessory' | 'fish';
  quantity: number;
  description: string;
}

// 塔罗花园类型
export interface TarotGarden {
  plants: GardenPlant[];
  decorations: GardenDecoration[];
  visitors: GardenVisitor[];
  weather: GardenWeather;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  experience: number;
  level: number;
}

export interface GardenPlant {
  id: string;
  name: string;
  type: 'flower' | 'tree' | 'herb' | 'crystal';
  stage: 'seed' | 'sprout' | 'growing' | 'blooming' | 'wilting';
  health: number; // 0-100
  water: number; // 0-100
  sunlight: number; // 0-100
  magic: number; // 0-100
  plantedDate: string;
  lastWatered: string;
  specialEffect?: string;
}

export interface GardenDecoration {
  id: string;
  name: string;
  type: 'furniture' | 'lighting' | 'path' | 'water' | 'mystical';
  position: { x: number; y: number };
  effect: string;
  acquiredDate: string;
}

export interface GardenVisitor {
  id: string;
  name: string;
  type: 'animal' | 'spirit' | 'fairy' | 'human';
  mood: 'happy' | 'neutral' | 'sad';
  gift?: string;
  visitDate: string;
  duration: number; // minutes
}

export interface GardenWeather {
  current: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'magical';
  temperature: number;
  humidity: number;
  magicLevel: number; // 0-100
  effects: string[];
}

// 彩虹心情类型
export interface RainbowMood {
  date: string;
  colors: MoodColor[];
  overallMood: number; // 1-5
  activities: MoodActivity[];
  notes: string;
  shareable: boolean;
}

export interface MoodColor {
  color: string;
  percentage: number;
  meaning: string;
  emotion: string;
}

export interface MoodActivity {
  name: string;
  duration: number; // minutes
  moodBefore: number; // 1-5
  moodAfter: number; // 1-5
  enjoyment: number; // 1-5
}

// 风水罗盘类型
export interface FengShuiCompass {
  direction: number; // 0-360
  facing: string;
  sitting: string;
  elements: CompassElement[];
  recommendations: FengShuiRecommendation[];
  analysis: string;
}

export interface CompassElement {
  direction: string;
  element: string;
  trigram: string;
  meaning: string;
  influence: 'positive' | 'negative' | 'neutral';
}

export interface FengShuiRecommendation {
  area: string;
  element: string;
  color: string;
  shape: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

// 成就系统类型
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'game' | 'collection' | 'social' | 'special';
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress: number; // 0-100
  reward: string;
}

// 娱乐休闲域状态
export interface EntertainmentState {
  cardGame: CardGame | null;
  bookOfAnswers: BookOfAnswers | null;
  dailyCard: DailyCard | null;
  fishingGame: FishingGame | null;
  tarotGarden: TarotGarden | null;
  rainbowMood: RainbowMood | null;
  fengShuiCompass: FengShuiCompass | null;
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// 娱乐休闲域配置
export interface EntertainmentConfig {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationsEnabled: boolean;
  notificationsEnabled: boolean;
  autoSave: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

// 娱乐模块ID
export type EntertainmentModuleId = 
  | 'ancient_card_game'
  | 'book_of_answers'
  | 'daily_card'
  | 'fishing_game'
  | 'tarot_garden'
  | 'rainbow_mood'
  | 'cultural_cap'
  | 'feng_shui_compass';