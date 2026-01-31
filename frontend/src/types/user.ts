export interface BirthLocation {
  province: string;
  city: string;
  district: string;
  lng: number;
  lat: number;
}

export interface NameScore {
  tian: number;
  ren: number;
  di: number;
  wai: number;
  zong: number;
  mainType: string;
  totalScore: number;
}

export interface BaziInfo {
  year: string;
  month: string;
  day: string;
  hour: string;
  lunar?: any;
  wuxing?: any;
  nayin?: any;
  shichen?: any;
  solar?: any;
}

export interface LunarInfo {
  lunarBirthDate: string;
  lunarBirthMonth: string;
  lunarBirthDay: string;
  trueSolarTime: string;
}

export interface AIModelConfig {
  id: string;
  name: string;
  API_KEY: string;
  ServiceEndPoint: string;
  ApiVersion?: string;
  deploymentName?: string;
}

export interface AISettings {
  useAIInterpretation: boolean;
  selectedAIModelId?: string;
  homeTimeAwareEnabled?: boolean;
  customModels?: AIModelConfig[];
}

export interface UserProfile {
  nickname: string;
  realName?: string;
  birthDate: string;
  birthTime: string;
  shichen: string;
  birthLocation: BirthLocation;
  zodiac: string;
  zodiacAnimal: string;
  gender: 'male' | 'female' | 'secret';
  mbti: string;
  nameScore?: NameScore | null;
  bazi?: BaziInfo | null;
  lunarBirthDate?: string | null;
  trueSolarTime?: string | null;
  lunarInfo?: LunarInfo | null;
  lastCalculated?: string | null;
  isused: boolean;
  isSystemDefault: boolean;
  templateSource?: string | null;
  isFromTemplate?: boolean;
}

export interface GlobalUserConfigSnapshot {
  profile: UserProfile;
  settings: AISettings;
  generatedAt: string;
}
