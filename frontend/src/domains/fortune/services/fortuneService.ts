/**
 * 运势分析域服务
 * 提供运势分析相关的业务逻辑
 */

import { storageService } from '../../../services/storageService';
import { globalUserConfigService } from '../../../services/globalUserConfig';
import type { UserProfile } from '../../../types/user';
import type {
  HoroscopeData,
  ZodiacSign,
  BaziData,
  ZiWeiData,
  HuangliData,
  TarotCard,
  TarotReading,
  MayaData,
  NumerologyData,
  QimenData,
  FortuneModuleId,
} from '../types';

const STORAGE_PREFIX = 'nice_today_fortune_';

export const fortuneService = {
  // 用户信息获取
  getUserProfile: (): UserProfile => {
    return globalUserConfigService.loadProfile();
  },

  // 星座运势
  getHoroscopeData: (sign: ZodiacSign, date?: string): HoroscopeData | null => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const key = `horoscope_${sign}_${targetDate}`;
    return storageService.getItemSync<HoroscopeData | null>(key, null);
  },

  saveHoroscopeData: (data: HoroscopeData): void => {
    const key = `horoscope_${data.sign}_${data.date}`;
    storageService.setItem(key, data);
  },

  getHoroscopeHistory: (sign: ZodiacSign, days: number = 7): HoroscopeData[] => {
    const history: HoroscopeData[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const data = fortuneService.getHoroscopeData(sign, dateStr);
      if (data) {
        history.push(data);
      }
    }
    
    return history;
  },

  // 八字分析
  getBaziData: (birthDate: string, birthTime: string): BaziData | null => {
    const key = `bazi_${birthDate}_${birthTime}`;
    return storageService.getItemSync<BaziData | null>(key, null);
  },

  saveBaziData: (data: BaziData, birthDate: string, birthTime: string): void => {
    const key = `bazi_${birthDate}_${birthTime}`;
    storageService.setItem(key, data);
  },

  // 紫微斗数
  getZiWeiData: (birthDate: string, birthTime: string): ZiWeiData | null => {
    const key = `ziwei_${birthDate}_${birthTime}`;
    return storageService.getItemSync<ZiWeiData | null>(key, null);
  },

  saveZiWeiData: (data: ZiWeiData, birthDate: string, birthTime: string): void => {
    const key = `ziwei_${birthDate}_${birthTime}`;
    storageService.setItem(key, data);
  },

  // 黄历查询
  getHuangliData: (date: string): HuangliData | null => {
    const key = `huangli_${date}`;
    return storageService.getItemSync<HuangliData | null>(key, null);
  },

  saveHuangliData: (data: HuangliData): void => {
    const key = `huangli_${data.date}`;
    storageService.setItem(key, data);
  },

  getHuangliRange: (startDate: string, endDate: string): HuangliData[] => {
    const result: HuangliData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const data = fortuneService.getHuangliData(dateStr);
      if (data) {
        result.push(data);
      }
    }
    
    return result;
  },

  // 塔罗牌
  getTarotDeck: (): TarotCard[] => {
    return storageService.getItemSync<TarotCard[]>('tarot_deck', []);
  },

  saveTarotDeck: (deck: TarotCard[]): void => {
    storageService.setItem('tarot_deck', deck);
  },

  getTarotReading: (id: string): TarotReading | null => {
    return storageService.getItemSync<TarotReading | null>(`tarot_reading_${id}`, null);
  },

  saveTarotReading: (reading: TarotReading): void => {
    const id = `${reading.date}_${reading.spread}`;
    storageService.setItem(`tarot_reading_${id}`, reading);
  },

  getTarotHistory: (limit: number = 10): TarotReading[] => {
    const keys = storageService.getAllKeys().filter(key => key.startsWith('tarot_reading_'));
    const readings: TarotReading[] = [];
    
    keys.forEach(key => {
      const reading = storageService.getItemSync<TarotReading | null>(key.replace(STORAGE_PREFIX, ''), null);
      if (reading) {
        readings.push(reading);
      }
    });
    
    // 按日期排序
    readings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return readings.slice(0, limit);
  },

  // 玛雅历法
  getMayaData: (date: string): MayaData | null => {
    const key = `maya_${date}`;
    return storageService.getItemSync<MayaData | null>(key, null);
  },

  saveMayaData: (data: MayaData): void => {
    const key = `maya_${data.date || new Date().toISOString().split('T')[0]}`;
    storageService.setItem(key, data);
  },

  // 数字命理
  getNumerologyData: (birthDate: string): NumerologyData | null => {
    const key = `numerology_${birthDate}`;
    return storageService.getItemSync<NumerologyData | null>(key, null);
  },

  saveNumerologyData: (data: NumerologyData, birthDate: string): void => {
    const key = `numerology_${birthDate}`;
    storageService.setItem(key, data);
  },

  // 奇门遁甲
  getQimenData: (date: string, time: string): QimenData | null => {
    const key = `qimen_${date}_${time}`;
    return storageService.getItemSync<QimenData | null>(key, null);
  },

  saveQimenData: (data: QimenData, date: string, time: string): void => {
    const key = `qimen_${date}_${time}`;
    storageService.setItem(key, data);
  },

  // 通用功能
  getModuleData: <T>(moduleId: FortuneModuleId, key: string): T | null => {
    const storageKey = `${moduleId}_${key}`;
    return storageService.getItemSync<T | null>(storageKey, null);
  },

  saveModuleData: <T>(moduleId: FortuneModuleId, key: string, data: T): void => {
    const storageKey = `${moduleId}_${key}`;
    storageService.setItem(storageKey, data);
  },

  clearModuleData: (moduleId: FortuneModuleId): void => {
    const keys = storageService.getAllKeys().filter(key => key.startsWith(`${moduleId}_`));
    keys.forEach(key => storageService.removeItem(key.replace(STORAGE_PREFIX, '')));
  },

  // 数据清理
  clearAllFortuneData: (): void => {
    const keys = storageService.getAllKeys().filter(key => 
      key.startsWith('horoscope_') ||
      key.startsWith('bazi_') ||
      key.startsWith('ziwei_') ||
      key.startsWith('huangli_') ||
      key.startsWith('tarot_') ||
      key.startsWith('maya_') ||
      key.startsWith('numerology_') ||
      key.startsWith('qimen_')
    );
    
    keys.forEach(key => storageService.removeItem(key.replace(STORAGE_PREFIX, '')));
  },

  // 数据统计
  getFortuneDataStats: (): { [key: string]: number } => {
    const keys = storageService.getAllKeys();
    const stats: { [key: string]: number } = {};
    
    keys.forEach(key => {
      const prefix = key.split('_')[0];
      if (['horoscope', 'bazi', 'ziwei', 'huangli', 'tarot', 'maya', 'numerology', 'qimen'].includes(prefix)) {
        stats[prefix] = (stats[prefix] || 0) + 1;
      }
    });
    
    return stats;
  },
};