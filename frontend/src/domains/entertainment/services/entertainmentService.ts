/**
 * 娱乐休闲域服务
 * 提供娱乐休闲域的业务逻辑
 */

import { storageService } from '../../../services/storageService';
import type {
  DailyCard,
  FishingGame,
  Achievement,
  EntertainmentModuleId,
} from '../types';

const STORAGE_PREFIX = 'nice_today_entertainment_';

export const entertainmentService = {
  // ==================== 每日卡牌 ====================

  getDailyCard: (date?: string): DailyCard | null => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const key = `daily_card_${targetDate}`;
    return storageService.getItemSync<DailyCard | null>(key, null);
  },

  saveDailyCard: (card: DailyCard): void => {
    const key = `daily_card_${card.date}`;
    storageService.setItem(key, card);
  },

  getDailyCardStreak: (): number => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const card = entertainmentService.getDailyCard(dateStr);
      
      if (card) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  },

  // ==================== 钓鱼游戏 ====================

  getFishingGame: (): FishingGame | null => {
    return storageService.getItemSync<FishingGame | null>('fishing_game', null);
  },

  saveFishingGame: (game: FishingGame): void => {
    storageService.setItem('fishing_game', game);
  },

  initFishingGame: (): FishingGame => {
    const defaultGame: FishingGame = {
      level: 1,
      experience: 0,
      nextLevel: 100,
      coins: 50,
      inventory: [],
      catches: [],
      currentRod: {
        id: 'basic_rod',
        name: '基础鱼竿',
        quality: 3,
        durability: 100,
      },
      currentBait: {
        id: 'basic_bait',
        name: '蚯蚓',
        type: 'worm',
        effectiveness: 3,
        quantity: 10,
      },
      location: {
        id: 'pond',
        name: '村口小塘',
        type: 'pond',
        fishTypes: ['鲫鱼', '鲤鱼', '草鱼'],
        difficulty: 1,
        unlocked: true,
      },
      achievements: [],
    };
    
    entertainmentService.saveFishingGame(defaultGame);
    return defaultGame;
  },

  // ==================== 成就系统 ====================

  getAchievements: (): Achievement[] => {
    return storageService.getItemSync<Achievement[]>('achievements', []);
  },

  saveAchievements: (achievements: Achievement[]): void => {
    storageService.setItem('achievements', achievements);
  },

  unlockAchievement: (achievementId: string): void => {
    const achievements = entertainmentService.getAchievements();
    const index = achievements.findIndex(a => a.id === achievementId);
    if (index !== -1 && !achievements[index].unlocked) {
      achievements[index].unlocked = true;
      achievements[index].unlockedDate = new Date().toISOString();
      achievements[index].progress = 100;
      entertainmentService.saveAchievements(achievements);
    }
  },

  // ==================== 通用功能 ====================

  getModuleData: <T>(moduleId: EntertainmentModuleId, key: string): T | null => {
    const storageKey = `${moduleId}_${key}`;
    return storageService.getItemSync<T | null>(storageKey, null);
  },

  saveModuleData: <T>(moduleId: EntertainmentModuleId, key: string, data: T): void => {
    const storageKey = `${moduleId}_${key}`;
    storageService.setItem(storageKey, data);
  },

  clearAllEntertainmentData: (): void => {
    const keys = storageService.getAllKeys().filter(key =>
      key.startsWith('daily_card_') ||
      key.startsWith('fishing_game') ||
      key.startsWith('achievements') ||
      key.startsWith('tarot_garden') ||
      key.startsWith('rainbow_mood') ||
      key.startsWith('feng_shui')
    );
    keys.forEach(key => storageService.removeItem(key.replace(STORAGE_PREFIX, '')));
  },
};