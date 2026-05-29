/**
 * 全局用户配置服务
 * 提供统一的用户配置访问接口，支持快照和数据同步
 */

import type { UserProfile, GlobalUserConfigSnapshot } from '../types';
import { storageService } from './storageService';

/**
 * 获取全局用户配置快照
 */
export const getGlobalUserConfigSnapshot = (profile?: UserProfile): GlobalUserConfigSnapshot => {
  const p = profile ?? storageService.getItemSync<UserProfile | undefined>('user_profile', undefined);

  return {
    profile: p ?? {
      nickname: '',
      birthDate: '',
      birthTime: '',
      shichen: '',
      birthLocation: {
        province: '',
        city: '',
        district: '',
        lng: 0,
        lat: 0,
      },
      zodiac: '',
      zodiacAnimal: '',
      gender: 'male',
      mbti: '',
      isused: false,
      isSystemDefault: true,
    },
    settings: {
      useAIInterpretation: storageService.getItemSync<boolean>('use_ai_interpretation', false),
      selectedAIModelId: storageService.getItemSync<string>('selected_ai_model_id', ''),
      homeTimeAwareEnabled: storageService.getItemSync<boolean>('home_time_aware_enabled', true),
    },
    generatedAt: new Date().toISOString(),
  };
};

/**
 * 加载用户配置
 */
export const loadUserProfile = (): UserProfile => {
  const DEFAULT_PROFILE: UserProfile = {
    nickname: '',
    birthDate: '',
    birthTime: '',
    shichen: '',
    birthLocation: {
      province: '',
      city: '',
      district: '',
      lng: 0,
      lat: 0,
    },
    zodiac: '',
    zodiacAnimal: '',
    gender: 'male',
    mbti: '',
    isused: false,
    isSystemDefault: true,
  };

  let baseProfile = storageService.getItemSync<UserProfile | undefined>('user_profile', undefined);

  if (baseProfile === null || baseProfile === undefined) {
    baseProfile = DEFAULT_PROFILE;
  }

  return {
    ...DEFAULT_PROFILE,
    ...baseProfile,
  };
};

/**
 * 保存用户配置
 */
export const saveUserProfile = (profile: UserProfile): void => {
  storageService.setItem('user_profile', profile);
};

/**
 * 更新用户配置字段
 */
export const updateUserProfileField = <K extends keyof UserProfile>(
  key: K,
  value: UserProfile[K]
): void => {
  const profile = loadUserProfile();
  profile[key] = value;
  saveUserProfile(profile);
};

/**
 * 全局用户配置服务
 */
export const globalUserConfigService = {
  getSnapshot: getGlobalUserConfigSnapshot,
  loadProfile: loadUserProfile,
  saveProfile: saveUserProfile,
  updateField: updateUserProfileField,
};
