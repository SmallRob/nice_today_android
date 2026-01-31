import { userConfigManager } from '../utils/userConfigManager';
import { calculateDetailedBazi } from '../utils/baziHelper';

export const AI_CONFIG = {
  // AI 解读开关默认值 (可通过 UI 覆盖)
  DEFAULT_ENABLE_AI: true,
  // 默认选中的模型 ID
  DEFAULT_MODEL_ID: 'qwen-72b',
  // 首页时令卡片默认开启
  DEFAULT_HOME_TIME_AWARE: true,
  // 可选的模型列表
  MODELS: [
    {
      id: 'qwen-72b',
      name: 'Qwen 2.5 72B',
      API_KEY: "sk-82d03d47f04c4849980584d1ab4deb10",
      ServiceEndPoint: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      ApiVersion: "",
      deploymentName: "qwen2.5-72b-instruct"
    }
  ]
};

const pickString = (v) => (typeof v === 'string' ? v : undefined);
const pickNumber = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

export const getGlobalUserConfigSnapshot = (profile) => {
  const currentConfig = profile || userConfigManager.getCurrentConfig();
  const globalSettings = userConfigManager.getGlobalSettings();

  // Ensure settings have default values if missing
  const settings = {
    useAIInterpretation: globalSettings?.useAIInterpretation ?? AI_CONFIG.DEFAULT_ENABLE_AI,
    selectedAIModelId: globalSettings?.selectedAIModelId || AI_CONFIG.DEFAULT_MODEL_ID,
    homeTimeAwareEnabled: globalSettings?.homeTimeAwareEnabled ?? AI_CONFIG.DEFAULT_HOME_TIME_AWARE,
    customModels: globalSettings?.customModels || []
  };

  // Map userConfigManager structure to UserProfile if needed, 
  // but we designed UserProfile to match it.
  const p = currentConfig;

  // Calculate age if not present but birthDate is
  let age = p.age;
  if (typeof age !== 'number' && p.birthDate) {
    const birthYear = new Date(p.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    age = currentYear - birthYear;
  }

  // Construct the profile with mapped fields
  const finalProfile = {
    ...p,
    // Add computed/normalized fields if they were missing in raw config
    // (Note: types/user.ts UserProfile defines structure)
  };

  return {
    profile: finalProfile,
    settings: settings,
    generatedAt: new Date().toISOString()
  };
};

export const buildUserConfigDisplay = (snapshot) => {
  const out = [];
  const push = (label, v) => {
    const s = typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '';
    if (!s) return;
    out.push({ label, value: s });
  };

  push('昵称', snapshot.profile.nickname);
  push('性别', snapshot.profile.gender === 'male' ? '男' : snapshot.profile.gender === 'female' ? '女' : '保密');
  
  // Calculate age for display if not in profile
  let age = snapshot.profile.age;
  if (!age && snapshot.profile.birthDate) {
      const birthYear = new Date(snapshot.profile.birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      age = currentYear - birthYear;
  }
  if (age) push('年龄', age);

  push('星座', snapshot.profile.zodiac);
  push('生肖', snapshot.profile.zodiacAnimal); // Changed from chineseZodiac to zodiacAnimal to match userConfigManager
  push('MBTI', snapshot.profile.mbti);
  
  if (snapshot.profile.lunarInfo) {
      push('农历', `${snapshot.profile.lunarInfo.lunarBirthMonth}${snapshot.profile.lunarInfo.lunarBirthDay}`);
  }

  // Handle fields that might not be in standard UserProfile but were in original snapshot
  const pAny = snapshot.profile;
  push('气质', pAny.temperament);
  push('九型人格', pAny.enneagram);
  push('常住城市', snapshot.profile.birthLocation?.city); // Default to birth city if residence not available

  if (typeof snapshot.settings.useAIInterpretation === 'boolean') {
    push('AI 解读', snapshot.settings.useAIInterpretation ? '开启' : '关闭');
  }
  if (snapshot.settings.selectedAIModelId) push('当前模型', snapshot.settings.selectedAIModelId);
  if (typeof snapshot.settings.homeTimeAwareEnabled === 'boolean') {
    push('首页时令卡片', snapshot.settings.homeTimeAwareEnabled ? '开启' : '关闭');
  }
  return out;
};

export const buildUserConfigContextForAI = (snapshot, agentId) => {
  const profile = { ...snapshot.profile };

  // 注入更多身体节律数据（如果存在）
  // 这些数据可能来自其他 store 或实时计算
  profile.healthStatus = {
    menstrualCycle: snapshot.profile.menstrualCycle || { status: 'unknown', phase: '' }, // 经期、排卵期、黄体期
    sleepRhythm: snapshot.profile.sleepRhythm || { sleepTime: '', deepSleepRatio: 0, wakeState: '' }, // 入睡时间、深睡比例、晨起状态
    exerciseLoad: snapshot.profile.exerciseLoad || { steps: 0, calories: 0, intensity: 'low' }, // 昨日步数、消耗、强度
    height: snapshot.profile.height,
    weight: snapshot.profile.weight
  };

  // 针对特定智能体注入增强数据
  if (agentId === 'agent_fengshui_master') {
    // 风水：需要经纬度
    if (snapshot.profile.birthLocation) {
      profile.currentLocation = snapshot.profile.birthLocation; // Use birthLocation as fallback/default
    }
  } else if (agentId === 'agent_yixue_mentor') {
    // 易学：需要八字
    // If bazi is already calculated and stored in profile, use it
    if (!profile.bazi && snapshot.profile.birthDate) {
       try {
         const lng = snapshot.profile.birthLocation?.lng;
         
         const baziData = calculateDetailedBazi(
            snapshot.profile.birthDate,
            snapshot.profile.birthTime,
            lng
         );
         
         if (baziData) {
             profile.bazi = {
               year: baziData.year,
               month: baziData.month,
               day: baziData.day,
               hour: baziData.hour,
               wuxing: baziData.wuxing,
               nayin: baziData.nayin,
               shichen: baziData.shichen
             };
         }
       } catch (e) {
         // ignore calculation error
       }
    }
  } else if (agentId === 'agent_spiritual_guide') {
    // 疗愈：需要脉轮
    // chakraStatus 已经在 profile 中 (if populated)
  }

  const payload = {
    profile,
    settings: snapshot.settings
  };
  return JSON.stringify(payload);
};
