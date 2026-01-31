
import { UserProfile, FinancialStats } from "../types";
import { aiService } from "./ai";
import { getCurrentEvent } from "../utils/calendar";
import { ORGAN_RHYTHM_DATA } from "../constants/organRhythmData";
import { BODY_TYPE_ID_TO_NAME } from "../constants/bodyConstitution";
import type { ElementType } from "../utils/fiveElements";
import { CHAKRAS, clampChakraScore, getChakraActivityLabel } from "../constants/chakra";
import { getLocalDateKey } from "../utils/dailyYiji";

export interface DailyWisdom {
  poetic: string;
  plain: string;
  regimenId: string;
}

type DailyWisdomCacheRecord = {
  dateKey: string;
  signature: string;
  cachedAt: number;
  value: DailyWisdom;
};

const DAILY_WISDOM_CACHE_KEY = 'nice_today_daily_wisdom_cache_v1';
const DAILY_WISDOM_CACHE_TTL_MS = 6 * 60 * 1000;

type DashboardHealthSummaryCacheRecord = {
  dateKey: string;
  cachedAt: number;
  heartRateStatus: '心率正常' | '心率偏快' | '心率偏慢';
  value: string;
};

const DASHBOARD_HEALTH_SUMMARY_CACHE_KEY = 'nice_today_dashboard_health_summary_cache_v1';
const DASHBOARD_HEALTH_SUMMARY_CACHE_TTL_MS = 6 * 60 * 1000;

const resolveBodyTypeName = (raw: string | null | undefined) => {
  const v = (raw || '').trim();
  if (!v) return '';
  return BODY_TYPE_ID_TO_NAME[v] || v;
};

const buildDailyWisdomSignature = (profile: UserProfile) => {
  const nickname = (profile.nickname || '').trim();
  const zodiac = (profile.zodiac || '').trim();
  const mbti = (profile.mbti || '').trim().toUpperCase();
  const bodyType = resolveBodyTypeName(profile.bodyType);
  const chakraOverall = typeof profile.chakraOverallScore === 'number' ? Math.round(profile.chakraOverallScore) : '';
  const chakraUpdated = profile.chakraLastUpdated || '';
  const chakraKeys = profile.chakraStatus ? Object.keys(profile.chakraStatus).sort().join(',') : '';
  // 添加小时作为签名的一部分，确保每小时内缓存有效但会随时间更新
  const currentHour = new Date().getHours();
  return [nickname, zodiac, mbti, bodyType, chakraOverall, chakraUpdated, chakraKeys, currentHour].join('|');
};

const readDailyWisdomCache = (): DailyWisdomCacheRecord | null => {
  try {
    const raw = localStorage.getItem(DAILY_WISDOM_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DailyWisdomCacheRecord>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.dateKey !== 'string' || typeof parsed.signature !== 'string' || typeof parsed.cachedAt !== 'number') return null;
    const v = parsed.value as any;
    if (!v || typeof v.poetic !== 'string' || typeof v.plain !== 'string' || typeof v.regimenId !== 'string') return null;
    return parsed as DailyWisdomCacheRecord;
  } catch {
    return null;
  }
};

const writeDailyWisdomCache = (record: DailyWisdomCacheRecord) => {
  try {
    localStorage.setItem(DAILY_WISDOM_CACHE_KEY, JSON.stringify(record));
  } catch { }
};

const pickRegimenId = (profile: UserProfile) => {
  const bodyType = resolveBodyTypeName(profile.bodyType);
  const mbti = (profile.mbti || '').trim().toUpperCase();

  if (bodyType.includes('阴虚') && mbti === 'INTJ') return 'yinxu_intj';
  if (bodyType.includes('阴虚')) return 'yinxu';
  if (bodyType.includes('气虚')) return 'qixu';
  if (bodyType.includes('阳虚')) return 'yangxu';
  if (bodyType.includes('痰湿')) return 'tanshi';
  if (bodyType.includes('湿热')) return 'shire';
  if (bodyType.includes('血瘀')) return 'xueyu';
  if (bodyType.includes('气郁')) return 'qiyu';
  if (bodyType.includes('特禀')) return 'tebing';
  if (bodyType.includes('平和')) return 'pinghe';
  return 'general';
};

const buildChakraSnapshot = (profile: UserProfile) => {
  const scores = profile.chakraStatus;
  const hasScores = Boolean(scores && Object.keys(scores).length);
  const overall = typeof profile.chakraOverallScore === 'number'
    ? Math.max(0, Math.min(100, Math.round(profile.chakraOverallScore)))
    : hasScores
      ? Math.max(0, Math.min(100, Math.round(CHAKRAS.map((c) => (clampChakraScore(scores?.[c.id] ?? 0) + 100) / 2).reduce((a, b) => a + b, 0) / CHAKRAS.length)))
      : undefined;

  if (!hasScores && typeof overall !== 'number') return null;

  const scored = hasScores
    ? CHAKRAS
        .map((c) => {
          const v = clampChakraScore(scores?.[c.id] ?? 0);
          return { ...c, score: v, activity: getChakraActivityLabel(v) };
        })
        .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    : [];

  const focus = scored
    .filter((x) => Math.abs(x.score) >= 25)
    .slice(0, 2)
    .map((x) => ({
      id: x.id,
      name: x.name,
      score: x.score,
      activity: x.activity,
      crystal: x.crystal,
      tuning: (x.tuning || []).slice(0, 2)
    }));

  return {
    overall,
    lastUpdated: profile.chakraLastUpdated,
    focus
  };
};

const buildChakraContextText = (profile: UserProfile) => {
  const snap = buildChakraSnapshot(profile);
  if (!snap) return '';
  const overallPart = typeof snap.overall === 'number' ? `总体指数${snap.overall}/100` : '总体指数未知';
  const timePart = snap.lastUpdated ? `更新时间${new Date(snap.lastUpdated).toLocaleDateString()}` : '';
  const focusPart = snap.focus.length
    ? `重点脉轮：${snap.focus.map((x) => `${x.name}${x.score >= 0 ? '+' : ''}${x.score}（${x.activity}，水晶${x.crystal}，建议${x.tuning.join(' / ')}）`).join('；')}`
    : '重点脉轮：整体较均衡';
  return `脉轮数据：${overallPart}${timePart ? `，${timePart}` : ''}。${focusPart}。`;
};

const buildLocalDailyWisdom = (profile: UserProfile, eventName: string | null, rhythm: (typeof ORGAN_RHYTHM_DATA)[number] | undefined): DailyWisdom => {
  const nickname = profile.nickname || '你';
  const bodyType = resolveBodyTypeName(profile.bodyType);
  const mbti = (profile.mbti || '').trim().toUpperCase();
  const regimenId = pickRegimenId(profile);
  const chakraSnap = buildChakraSnapshot(profile);

  const eventPart = eventName ? `逢${eventName}，` : '';
  const rhythmPart = rhythm ? `${rhythm.organ}当令，` : '';

  let poeticTail = '';
  let plain = rhythm?.suggestion || '今晚早点睡，给身体和大脑留出修复时间。';

  // 根据体质和MBTI生成个性化文案
  const wisdomTemplates: Record<string, string[]> = {
    yinxu: ['滋阴润燥', '静养心神', '少熬夜多补水'],
    yangxu: ['温阳固本', '避寒保暖', '少食生冷'],
    qixu: ['益气健脾', '少食多餐', '避免过劳'],
    tanshi: ['化痰祛湿', '清淡饮食', '适当运动'],
    shire: ['清热利湿', '忌辛辣油腻', '保持清爽'],
    qiyu: ['疏肝解郁', '舒展身心', '与人倾诉'],
    xueyu: ['活血化瘀', '适量运动', '温通经络'],
    tebing: ['谨慎调理', '避免过敏源', '循序渐进'],
    pinghe: ['顺应自然', '保持节律', '动静结合']
  };

  const mbtiTemplates: Record<string, string> = {
    INTJ: '理性规划之余，记得给身体温柔的照顾',
    INTP: '思维活跃时，别忘了起身活动筋骨',
    ENTJ: '领导力发挥时，也要倾听身体的声音',
    ENTP: '创意迸发之际，记得补充水分与休息',
    INFJ: '洞察他人之时，也要关照自己的内心',
    INFP: '感受情绪流动，用温暖的方式安抚自己',
    ENFJ: '激励他人的同时，给自己留一片宁静',
    ENFP: '热情探索世界，记得给自己充电的时间',
    ISTJ: '踏实工作之余，尝试一点轻松的舒展',
    ISFJ: '照顾他人之时，别忘了自己也需要呵护',
    ESTJ: '高效执行之际，给身体一个深呼吸的机会',
    ESFJ: '温暖待人之时，也给自己一份温柔的关怀',
    ISTP: '专注动手时，记得抬头看看窗外的风景',
    ISFP: '沉浸美感时，用温柔的方式对待自己的身体',
    ESTP: '行动派的你，偶尔也需要静下来休息片刻',
    ESFP: '享受当下之时，给身体一份健康的礼物'
  };

  let bodyTypeWisdom = bodyType ? wisdomTemplates[profile.bodyType || '']?.[0] || '顺势调理' : '顺其自然';
  let mbtiWisdom = mbti ? mbtiTemplates[mbti] || '找到自己的节奏' : '聆听内心的声音';

  if (regimenId === 'yinxu_intj') {
    poeticTail = '宜滋阴安神，以理性减压收束心火。';
    plain = `建议：${rhythm?.suggestion || '今晚早点睡'}；睡前写下明日3件最重要的事，减少内耗。`;
  } else if (bodyType && mbti) {
    poeticTail = `${bodyTypeWisdom}，${mbtiWisdom}。`;
    if (rhythm?.healthTip) {
      plain = `${rhythm.suggestion}；${rhythm.healthTip}`;
    }
  } else if (bodyType) {
    poeticTail = `${bodyTypeWisdom}，做一件让你更安定的小事。`;
    if (rhythm?.healthTip) {
      plain = `${rhythm.suggestion}；${rhythm.healthTip}`;
    }
  } else if (mbti) {
    poeticTail = `${mbtiWisdom}。`;
    if (rhythm?.healthTip) {
      plain = `${rhythm.suggestion}；${rhythm.healthTip}`;
    }
  } else if (rhythm?.healthTip) {
    plain = `${rhythm.suggestion}；${rhythm.healthTip}`;
    poeticTail = '把今天过轻一点，你会更有力。';
  } else {
    poeticTail = '把今天过轻一点，你会更有力。';
  }

  // 脉轮能量调整建议
  if (chakraSnap?.focus?.some((x) => x.id === 'heart' && x.activity === '不活跃')) {
    plain = `捂胸慢呼吸3次；${plain}`.slice(0, 60);
  } else if (chakraSnap?.focus?.some((x) => x.id === 'root' && x.activity === '不活跃')) {
    plain = `双脚站稳，想象根须深入大地；${plain}`.slice(0, 60);
  } else if (typeof chakraSnap?.overall === 'number' && chakraSnap.overall < 50) {
    plain = `先接地站稳10秒；${plain}`.slice(0, 60);
  }

  const poetic = `亲爱的${nickname}，${eventPart}${rhythmPart}${poeticTail}`.replace(/\s+/g, '').trim();
  return { poetic, plain, regimenId };
};

const parseDailyWisdomJson = (text: string): DailyWisdom | null => {
  const t = (text || '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const raw = JSON.parse(t.slice(start, end + 1)) as Partial<DailyWisdom>;
    if (!raw || typeof raw.poetic !== 'string' || typeof raw.plain !== 'string' || typeof raw.regimenId !== 'string') return null;
    return {
      poetic: raw.poetic.trim(),
      plain: raw.plain.trim(),
      regimenId: raw.regimenId.trim()
    };
  } catch {
    return null;
  }
};

export const getGeminiDailyWisdom = async (profile: UserProfile, useAI: boolean = false): Promise<DailyWisdom> => {
  const now = new Date();
  const dateKey = getLocalDateKey(now);
  const signature = buildDailyWisdomSignature(profile);
  const currentHour = now.getHours();
  const event = getCurrentEvent(now);

  // 获取当前时段的器官节律
  const currentOrganRhythm = ORGAN_RHYTHM_DATA.find(item => {
    const [startStr, endStr] = item.timeRange.split('-');
    const start = parseInt(startStr.split(':')[0]);
    const end = parseInt(endStr.split(':')[0]);
    if (start === 23) return currentHour >= 23 || currentHour < 1;
    return currentHour >= start && currentHour < (end === 1 ? 25 : end);
  });

  const local = buildLocalDailyWisdom(profile, event?.name || null, currentOrganRhythm);
  if (!useAI) return local;

  const cached = readDailyWisdomCache();
  if (cached && cached.dateKey === dateKey && cached.signature === signature && now.getTime() - cached.cachedAt < DAILY_WISDOM_CACHE_TTL_MS) {
    return cached.value;
  }

  try {
    const eventContext = event
      ? `今天是${event.isFestival ? '节日' : '节气'}：${event.name}。`
      : "";

    const rhythmContext = currentOrganRhythm
      ? `当前时辰器官节律：${currentOrganRhythm.organ}经当令，${currentOrganRhythm.description}。建议：${currentOrganRhythm.suggestion}。`
      : "";

    const bodyType = resolveBodyTypeName(profile.bodyType);
    const mbti = (profile.mbti || '').trim().toUpperCase();
    const regimenId = local.regimenId;
    const regimenHint =
      regimenId === 'yinxu_intj'
        ? '当体质为"阴虚质"且 MBTI 为 INTJ 时，必须突出"滋阴安神 + 理性减压"的专属建议，并把 regimenId 设为 yinxu_intj。'
        : bodyType
          ? `把用户体质"${bodyType}"作为核心约束，给出与之匹配的调理方向，并把 regimenId 设为 ${regimenId}。`
          : `给出通用调理方向，并把 regimenId 设为 ${regimenId}。`;

    const chakraContext = buildChakraContextText(profile);
    const prompt = `你是一位精通中医子午流注与现代生活方式的中文健康顾问，文风专业、文雅但不晦涩。

当前背景：${eventContext} ${rhythmContext}
用户画像：昵称${profile.nickname}，星座${profile.zodiac}，MBTI${mbti || '未知'}，体质${bodyType || '未知'}。
${chakraContext ? `灵性能量画像：${chakraContext}` : '灵性能量画像：暂无脉轮数据，请给出温柔且不玄的通用心灵疗愈建议。'}
规则：${regimenHint}

任务：生成"AI 每日锦囊"两层文案：
1) poetic：文雅的主视觉文案，允许出现"胆经当令"等词，但要自然；不超过80个中文字符（含标点）。
2) plain：在 poetic 之下的一句"人话解释"，必须通俗可懂、可执行；优先复用当前时段建议（如"今晚早点睡/避免熬夜/喝温水"等）；并加入1个当下就能做的心灵疗愈动作（10~30秒，如捂胸慢呼吸3次/接地站立/一句自我接纳/轻声哼唱）；不超过45个中文字符。

输出：只输出严格 JSON，结构为 {"poetic":"...","plain":"...","regimenId":"..."}，不要包含任何额外文字。`;

    const text = await aiService.generateContent(prompt);
    const parsed = parseDailyWisdomJson(text || '');
    if (parsed) {
      writeDailyWisdomCache({ dateKey, signature, cachedAt: now.getTime(), value: parsed });
      return parsed;
    }
    if ((text || '').trim()) {
      const value = { ...local, poetic: (text || '').trim() };
      writeDailyWisdomCache({ dateKey, signature, cachedAt: now.getTime(), value });
      return value;
    }
    return local;
  } catch (error) {
    console.error("AI Daily Wisdom Error:", error);
    return local;
  }
};

export const getGeminiFinancialAnalysis = async (
  stats: FinancialStats,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const totalExp = stats.transactions.reduce((acc, t) => acc + t.amount, 0);
    const categories = stats.transactions.reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    // 计算分类占比并排序
    const sortedCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount, pct: Math.round((amount / totalExp) * 100) }));

    const isAnnual = stats.annualIncome > stats.income * 1.1;
    const balance = (isAnnual ? stats.annualIncome : stats.income) - totalExp;
    const savingsRate = Math.round((balance / (isAnnual ? stats.annualIncome : stats.income)) * 100);
    const cutoffDistance = balance - stats.cutoffLine;

    const period = isAnnual ? '年度' : '月度';
    const prompt = `你是一位专业且幽默的财务健康顾问，擅长用轻松但一针见血的方式分析收支状况。

【${period}财务快照】
收入：${isAnnual ? stats.annualIncome : stats.income}元
支出：${totalExp}元
结余：${balance}元（储蓄率${savingsRate}%）
安全线：${stats.cutoffLine}元（距离安全线${cutoffDistance >= 0 ? '+' : ''}${cutoffDistance}元）

【支出TOP5】
${sortedCategories.map((c, i) => `${i + 1}. ${c.name}: ${c.amount}元 (${c.pct}%)`).join('\n')}

【分析要求】
1. 用一句话点评整体财务状况（健康/预警/危险）
2. 指出最值得关注的支出类别并给出具体节流建议
3. ${cutoffDistance < 0 ? '⚠️ 结余已跌破斩杀线，请给出严厉但建设性的警告' : cutoffDistance < stats.cutoffLine * 0.2 ? '⚡ 结余接近预警线，提醒注意控制' : '✓ 财务状况良好，给出保持建议'}
4. 结尾用一句财务金句或幽默吐槽收尾

字数控制在120-160字，语气像一位懂财务的老朋友在和你聊天，既有专业度又不枯燥。`;

    if (onStream) {
      return await aiService.generateContentStream(prompt, onStream);
    }
    const text = await aiService.generateContent(prompt);
    return text || "财务状况良好，保持理性消费习惯。";
  } catch (error) {
    console.error("AI Finance Error:", error);
    throw error;
  }
};

export const getGeminiBodyMetricsAnalysis = async (
  metrics: Record<string, string>,
  profile: UserProfile,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    // 提取关键指标用于更精准的提示
    const bmi = metrics['BMI'] || metrics['bmi'] || '';
    const bp = metrics['血压'] || metrics['bloodPressure'] || '';
    const hr = metrics['静息心率'] || metrics['heartRate'] || '';
    const sleep = metrics['睡眠时长'] || metrics['sleep'] || '';

    const prompt = `你是一位温暖专业的健康管理师，擅长解读身体数据并给出可执行的建议。

【用户档案】
昵称：${profile.nickname || '朋友'}
性别：${profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '未知'}
年龄：${profile.age || '未知'}岁

【身体指标】
${Object.entries(metrics).map(([k, v]) => `${k}: ${v}`).join('\n')}

【分析框架】
${bmi ? '- BMI评估：对照标准范围给出评价\n' : ''}${bp ? '- 血压分析：关注收缩压/舒张压是否在正常区间\n' : ''}${hr ? '- 心率解读：静息心率的含义\n' : ''}${sleep ? '- 睡眠评估：时长与质量的关系\n' : ''}
【输出要求】
1. 开篇用一句温暖的话建立连接（如"看到你的身体数据，我想说..."）
2. 数据解读：用1-2句话概括整体健康状况
3. 亮点肯定：如果有好的指标，请真诚表扬
4. 关注重点：如有异常指标，温和指出并解释意义
5. 行动建议：给出3条具体可执行的小改变（如"每天多走2000步"、"睡前1小时远离屏幕"）

字数180-220字，语气像一位关心你的朋友，既有专业度又充满温度。避免恐吓式表述，重在鼓励和引导。不要给出医疗诊断或处方建议。`;

    if (onStream) {
      return await aiService.generateContentStream(prompt, onStream);
    }
    const text = await aiService.generateContent(prompt);
    return text || "未能生成分析，请确保指标录入完整。";
  } catch (error) {
    console.error("AI Body Analysis Error:", error);
    throw error;
  }
};

export interface DashboardHealthSummaryParams {
  heartRate: number;
  sleepHours: number;
  steps: number;
  moodType: string;
  period: string;
  energy: {
    physical: number;
    mental: number;
    emotional: number;
    spiritual: number;
    totalIndex: number;
  };
}

export const buildUserDashboardHealthSummaryPrompt = (params: DashboardHealthSummaryParams) => {
  const sleepHours = Number.isFinite(params.sleepHours) ? params.sleepHours : 0;
  const steps = Number.isFinite(params.steps) ? params.steps : 0;
  const heartRate = Number.isFinite(params.heartRate) ? params.heartRate : 0;

  // 更细致的状态判断
  const getSleepStatus = (h: number) => {
    if (h >= 7.5) return { label: '睡眠充足', emoji: '😴', color: 'green' };
    if (h >= 6.5) return { label: '睡眠尚可', emoji: '😊', color: 'yellow' };
    if (h >= 5) return { label: '睡眠偏少', emoji: '😪', color: 'orange' };
    return { label: '睡眠不足', emoji: '😫', color: 'red' };
  };

  const getStepsStatus = (s: number) => {
    if (s >= 10000) return { label: '步数优秀', emoji: '🏃', color: 'green' };
    if (s >= 8000) return { label: '步数良好', emoji: '🚶', color: 'lightgreen' };
    if (s >= 6000) return { label: '步数一般', emoji: '😐', color: 'yellow' };
    if (s >= 3000) return { label: '步数偏少', emoji: '😌', color: 'orange' };
    return { label: '需要活动', emoji: '🛋️', color: 'red' };
  };

  const getHeartRateStatus = (hr: number) => {
    if (hr >= 60 && hr <= 70) return { label: '心率优秀', color: 'green' };
    if (hr >= 55 && hr <= 75) return { label: '心率良好', color: 'lightgreen' };
    if (hr >= 60 && hr <= 100) return { label: '心率正常', color: 'yellow' };
    if (hr > 100) return { label: '心率偏快', color: 'orange' };
    return { label: '心率偏慢', color: 'orange' };
  };

  const sleep = getSleepStatus(sleepHours);
  const step = getStepsStatus(steps);
  const hr = getHeartRateStatus(heartRate);

  // 确定关键关注点（优先级排序）
  let keyPoint = '能量相对平衡';
  let priority = 'normal';
  if (sleepHours > 0 && sleepHours < 6) {
    keyPoint = '睡眠严重不足，优先补觉';
    priority = 'sleep';
  } else if (sleepHours > 0 && sleepHours < 7) {
    keyPoint = '睡眠需要改善';
    priority = 'sleep';
  } else if (heartRate > 100) {
    keyPoint = '静息心率偏高，注意减压';
    priority = 'stress';
  } else if (heartRate > 0 && heartRate < 55) {
    keyPoint = '心率偏低，如无不适可观察';
    priority = 'normal';
  } else if (steps < 3000 && steps > 0) {
    keyPoint = '今日活动量较少';
    priority = 'activity';
  } else if (steps >= 10000) {
    keyPoint = '今日运动量达标，继续保持';
    priority = 'good';
  }

  const suggestionHints: Record<string, string> = {
    sleep: '今晚尝试提前30分钟放下手机，建立睡前仪式',
    stress: '做3轮深呼吸（吸气4秒-屏息6秒-呼气8秒），减少咖啡因',
    activity: '现在起身走动5分钟，或做几组伸展运动',
    good: '保持这个节奏，适当拉伸放松肌肉',
    normal: '继续保持良好习惯，关注身体的细微信号'
  };

  // 能量状态描述
  const energyAvg = Math.round((params.energy.physical + params.energy.mental + params.energy.emotional) / 3);
  const energyLevel = energyAvg >= 70 ? '充沛' : energyAvg >= 50 ? '平稳' : energyAvg >= 30 ? '偏低' : '需要充电';

  return `你是一位专业且充满关怀的健康顾问，擅长把健康数据翻译成温暖的建议和可执行的行动。

【今日健康快照】
静息心率：${heartRate} bpm 【${hr.label}】
睡眠时长：${sleepHours.toFixed(1)} 小时 【${sleep.label}】
今日步数：${steps} 步 【${step.label}】
情绪状态：${params.moodType || '未记录'}
生理周期：${params.period || '未记录'}
能量指数：体力${params.energy.physical}/脑力${params.energy.mental}/情绪${params.energy.emotional} 【整体${energyLevel}】

【分析任务】
1. 以一句话开篇，像朋友般问候并概括今日状态（突出"${keyPoint}"）
2. 简要点评2-3个关键指标（肯定好的，温和提醒需要关注的）
3. 给出1条具体可执行的建议（参考方向：${suggestionHints[priority]}）
4. 结尾用一句温暖鼓励的话

【输出要求】
- 纯文本输出，不使用Markdown格式
- 使用【】标记健康状态（如【睡眠充足】【心率正常】）
- 总字数100-140字
    - 语气温暖专业，避免恐吓式表述
    - 不要给出医疗诊断`;
};

export interface BodyConstitutionAnalysisParams {
  age: number;
  bodyType: string;
  regimen: string;
}

export const buildBodyConstitutionPrompt = (params: BodyConstitutionAnalysisParams) => {
  // 年龄段特征映射
  const ageCharacteristics: Record<string, string> = {
    'teen': '青春期发育阶段，生长发育快',
    'young': '青年期精力充沛，但易过度消耗',
    'adult': '成年期责任重，身心压力大',
    'middle': '中年期机能逐渐下降，需注重保养',
    'senior': '老年期气血渐虚，宜缓不宜急'
  };

  // 体质深度解读
  const constitutionInsights: Record<string, string> = {
    '平和质': '阴阳平衡，只需顺应四时，保持节律即可',
    '气虚质': '元气不足，易疲劳气短，需益气健脾',
    '阳虚质': '阳气不足，畏寒怕冷，宜温阳散寒',
    '阴虚质': '阴液不足，易口干燥热，需滋阴润燥',
    '痰湿质': '痰湿内蕴，体胖腹胀，宜化痰祛湿',
    '湿热质': '湿热内蕴，面油口苦，需清热利湿',
    '血瘀质': '血行不畅，易有瘀斑，宜活血化瘀',
    '气郁质': '气机郁滞，情绪不畅，需疏肝解郁',
    '特禀质': '先天特殊，易过敏，需谨慎调理'
  };

  const ageGroup = params.age < 20 ? 'teen' : params.age < 30 ? 'young' : params.age < 45 ? 'adult' : params.age < 60 ? 'middle' : 'senior';

  return `你是一位资深的中医体质调理专家，深谙"因人制宜、因时制宜"之道。

【用户画像】
年龄：${params.age}岁（${ageCharacteristics[ageGroup]}）
体质类型：${params.bodyType}
体质特点：${constitutionInsights[params.bodyType] || '需个性化调理'}
调理原则：${params.regimen}

【任务要求】
结合用户所处的年龄阶段特点和体质特征，给出一条精准、实用、温暖的养生建议：

1. 开篇点明年龄与体质的关联（如"35岁正是事业上升期，气虚体质让你容易感到疲惫..."）
2. 指出现阶段最需关注的1-2个健康问题
3. 给出2-3条具体可执行的建议（饮食/作息/运动/情志等方面）
4. 结尾一句温暖鼓励

【输出要求】
- 总字数80-120字
- 语气专业但亲切，像一位懂你的中医朋友
- 建议要具体可操作，避免空泛
- 纯文本输出，不要Markdown格式`;
};

export const getGeminiBodyConstitutionAnalysis = async (
  params: BodyConstitutionAnalysisParams,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const prompt = buildBodyConstitutionPrompt(params);
    if (onStream) {
      return await aiService.generateContentStream(prompt, onStream);
    }
    const text = await aiService.generateContent(prompt);
    return (text || '').trim();
  } catch (error) {
    console.error("AI Body Constitution Error:", error);
    return '';
  }
};

export const getGeminiUserDashboardHealthSummary = async (
  params: DashboardHealthSummaryParams,
  onStream?: (chunk: string) => void
): Promise<string> => {
  const now = new Date();
  const dateKey = getLocalDateKey(now);
  const heartRate = Number.isFinite(params.heartRate) ? params.heartRate : 0;
  const heartRateStatus: DashboardHealthSummaryCacheRecord['heartRateStatus'] =
    heartRate >= 60 && heartRate <= 100 ? '心率正常' : heartRate > 100 ? '心率偏快' : '心率偏慢';

  // 如果有流式回调，跳过缓存直接生成
  if (!onStream) {
    try {
      const raw = localStorage.getItem(DASHBOARD_HEALTH_SUMMARY_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as Partial<DashboardHealthSummaryCacheRecord>;
        if (cached?.dateKey && cached.dateKey !== dateKey) {
          localStorage.removeItem(DASHBOARD_HEALTH_SUMMARY_CACHE_KEY);
        } else if (
          cached?.dateKey === dateKey &&
          typeof cached.cachedAt === 'number' &&
          cached.heartRateStatus === heartRateStatus &&
          typeof cached.value === 'string' &&
          cached.value.trim() &&
          now.getTime() - cached.cachedAt < DASHBOARD_HEALTH_SUMMARY_CACHE_TTL_MS
        ) {
          return cached.value.trim();
        }
      }
    } catch { }
  }

  try {
    const prompt = buildUserDashboardHealthSummaryPrompt(params);
    let value: string;

    if (onStream) {
      value = await aiService.generateContentStream(prompt, onStream);
    } else {
      const text = await aiService.generateContent(prompt);
      value = (text || '').trim();
    }

    if (value && !onStream) {
      const record: DashboardHealthSummaryCacheRecord = {
        dateKey,
        cachedAt: now.getTime(),
        heartRateStatus,
        value
      };
      try {
        localStorage.setItem(DASHBOARD_HEALTH_SUMMARY_CACHE_KEY, JSON.stringify(record));
      } catch { }
    }
    return value;
  } catch (error) {
    console.error("AI Dashboard Health Summary Error:", error);
    return '';
  }
};

export const getGeminiZodiacAnalysis = async (
  zodiac: string,
  element: string,
  dateStr: string,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const zodiacTraits: Record<string, string> = {
      '鼠': '机智灵活，善于应变，财运敏锐',
      '牛': '踏实稳重，勤勉坚韧，厚积薄发',
      '虎': '勇猛果敢，领导力强，敢于开拓',
      '兔': '温和细腻，善解人意，贵人运佳',
      '龙': '气宇轩昂，志向远大，运势起伏',
      '蛇': '智慧深邃，洞察敏锐，善于谋划',
      '马': '热情奔放，行动力强，自由不羁',
      '羊': '温文尔雅，艺术气质，重视情感',
      '猴': '聪明机智，灵活多变，善于社交',
      '鸡': '精明能干，注重细节，守时守信',
      '狗': '忠诚可靠，正义感强，重情重义',
      '猪': '豁达乐观，福气满满，随遇而安'
    };

    const prompt = `你是一位深谙易经五行与生肖文化的运势顾问，善于将传统智慧转化为现代生活指引。

【今日星盘】
生肖：${zodiac}（${zodiacTraits[zodiac] || '各具特色'}）
五行属性：${element}
日期：${dateStr}

【解读要求】
1. 核心运势：用一句富有诗意的话描绘今日整体能量（如"今日如春风拂面，适合..."）
2. 能量解析：结合五行生克，分析今日能量如何影响${zodiac}的特质（2-3句话）
3. 重点领域：简要提示今日在事业/人际/健康方面的注意点
4. 开运锦囊：给出1-2条具体可行的建议（如"穿红色系衣物增强气场"、"向南方行走有贵人"）
5. 一句箴言：用10-15字总结今日心法

【输出要求】
- 总字数100-140字
- 语气古朴典雅又贴近现代生活
- 纯文本输出，分段清晰但不用Markdown符号
- 重在启发而非预测，引导用户以积极心态面对今日`;

    if (onStream) {
      return await aiService.generateContentStream(prompt, onStream);
    }
    const text = await aiService.generateContent(prompt);
    return text || "运势平稳，顺势而为，心安即是归处。";
  } catch (error) {
    console.error("AI Zodiac Analysis Error:", error);
    return "今日运势平稳，宜静养身心，蓄势待发。";
  }
};

export interface ZiWeiAdvicePalace {
  name: string;
  ganzhi: string;
  score: number;
  strength: string;
  element: string;
  description: string;
}

export interface ZiWeiAdviceInput {
  nickname: string;
  zodiac: string;
  mbti: string;
  mingGongGanzhi: string;
  overallStrength: string;
  strongestPalace: { name: string; score: number; strength: string };
  weakestPalace: { name: string; score: number; strength: string };
  palaces: ZiWeiAdvicePalace[];
}

export const getGeminiZiWeiAdvice = async (
  input: ZiWeiAdviceInput,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const weakFocus = ['财帛宫', '官禄宫', '夫妻宫', '福德宫', '疾厄宫'];
    const keyLines = weakFocus
      .map((name) => input.palaces.find((p) => p.name === name))
      .filter(Boolean)
      .map((p: any) => `${p.name}：${p.strength} ${p.score}（${p.ganzhi}，${p.element}）`)
      .join('\n');

    const palaceMeanings: Record<string, string> = {
      '命宫': '先天性格与人生基调',
      '兄弟宫': '手足关系与团队协力',
      '夫妻宫': '感情模式与亲密关系',
      '子女宫': '子女缘分与创造力',
      '财帛宫': '理财方式与财富观',
      '疾厄宫': '健康状况与体质倾向',
      '迁移宫': '外出运势与环境适应',
      '仆役宫': '朋友关系与人脉资源',
      '官禄宫': '事业发展与职业方向',
      '田宅宫': '不动产与家庭根基',
      '福德宫': '精神世界与福分享受',
      '父母宫': '亲子关系与长辈缘'
    };

    const prompt = `你是一位融合紫微斗数传统智慧与现代人生策略的命理顾问，善于将星盘信息转化为可执行的人生建议。

【用户画像】
昵称：${input.nickname || '你'}
星座：${input.zodiac || '未知'}
MBTI：${input.mbti || '未知'}

【命盘能量分布】
命宫干支：${input.mingGongGanzhi}
格局综述：${input.overallStrength}

【能量强弱分析】
最强宫位：${input.strongestPalace.name}（${input.strongestPalace.strength} ${input.strongestPalace.score}）- ${palaceMeanings[input.strongestPalace.name] || ''}
最弱宫位：${input.weakestPalace.name}（${input.weakestPalace.strength} ${input.weakestPalace.score}）- ${palaceMeanings[input.weakestPalace.name] || ''}

【重点宫位】
${keyLines || '各宫位能量分布详见命盘'}

【解读任务】
1. 总评：用12-20字概括命盘整体格局与人生策略方向
2. 优势发挥：如何借势最强宫位的能量，在对应领域建立正反馈
3. 短板补强：针对最弱宫位给出3条具体可执行的行动建议
4. 人生平衡：提醒用户注意的人生平衡法则（如事业与家庭、进取与守成等）
5. 本月聚焦：结合当前时节，给出1个优先关注的领域

【输出要求】
- 总字数180-260字
- 语气睿智但不玄虚，重在启发而非预测
- 建议具体可操作，避免空泛
- 纯文本输出，用【】标记各板块
- 不使用表情符号，不提"AI"或算法`;

    const fallbackText = '总评：格局可用，先强后补。\n【借势】把精力投向最强宫位对应的优势领域，形成正反馈。\n【补短】针对最弱宫位先修基础盘：作息、预算、沟通三选一先落地。';

    if (onStream) {
      const result = await aiService.generateContentStream(prompt, onStream);
      return result.trim() || fallbackText;
    }
    const text = await aiService.generateContent(prompt);
    return (text || '').trim() || fallbackText;
  } catch (error) {
    console.error("AI ZiWei Advice Error:", error);
    return '';
  }
};

export const getGeminiDivinationAnalysis = async (
  question: string,
  hexagram: string,
  changingHexagram: string | null,
  lines: string[],
  isMoving: boolean,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const prompt = `你是一位深谙周易智慧的解卦师，善于将卦象转化为对当下处境的洞察与行动指引。

【问卦信息】
所问之事：${question || '心中默问'}
得卦：${hexagram}
${changingHexagram ? `变卦：${changingHexagram}` : '无变卦（静卦）'}
动爻：${lines.join('，') || '无'}

【解卦要求】
1. 核心断语：用一句经典而有力的话点明卦象主旨（如"吉，利涉大川"或"君子以俭德辟难"）
2. 卦象启示：结合本卦与${isMoving ? '变卦' : '互卦'}，解读当前处境的能量状态（3-4句话）
3. 动爻指引：针对动爻给出具体的心法或行动提示
4. 实践建议：给出2-3条可执行的具体建议，帮助用户应对当下
5. 心法总结：用10-15字总结核心智慧

【风格要求】
- 语气庄重但不神秘，重在启发而非预测
- 将古老智慧转化为现代人可理解的语言
- 字数控制在180-240字
- 纯文本输出，分段清晰但不用Markdown符号
- 不提及AI或算法，保持传统解卦的韵味`;

    if (onStream) {
      return await aiService.generateContentStream(prompt, onStream);
    }
    const text = await aiService.generateContent(prompt);
    return text || "卦象深奥，需静心体悟。";
  } catch (error) {
    console.error("AI Divination Analysis Error:", error);
    return "占卜结果已出，请结合卦辞自悟吉凶。";
  }
};

export const getGeminiMayaInterpretation = async (
  nickname: string,
  scopeText: string,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const prompt = `你是一位玛雅历法能量解读者，善于将古老的玛雅智慧转化为当代个人的成长指引。

【解读对象】
${nickname || '朋友'}

【玛雅能量信息】
${scopeText}

【解读框架】
1. 核心频率：用一句富有诗意的话概括今日玛雅能量的核心主题（如"今日是红蛇的日子，适合启动身体的能量..."）
2. 能量解析：解读今日玛雅印记的含义，以及如何影响个人的能量状态（2-3句话）
3. 行动指引：给出3条具体可执行的建议，帮助用户顺应今日能量流动
4. 今日觉察：提醒1个需要留意的内在模式或外在情境
5. 玛雅箴言：用一句10-15字的智慧话语作为今日心法

【风格要求】
- 语气温暖神秘但不玄虚，像一位古老的智慧导师
- 将玛雅历法符号转化为现代人可理解的内在成长语言
- 字数控制在240-320字
- 中文输出，纯文本格式
- 重在自我探索而非预测未来`;

    if (onStream) {
      return await aiService.generateContentStream(prompt, onStream);
    }
    const text = await aiService.generateContent(prompt);
    return text || "抱歉，无法生成解读，请感受今日的自然能量。";
  } catch (error) {
    console.error("AI Maya Interpretation Error:", error);
    return "玛雅能量感应受阻，请稍后再试或通过页面信息自行体悟。";
  }
};

export const getGeminiShuaibeiInterpretation = async (
  params: {
    nickname: string;
    question: string;
    result: string;
    cups: number[];
  },
  onStream?: (chunk: string) => void
): Promise<string> => {
  const { nickname, question, result, cups } = params;
  try {
    const cupStatusText = cups.map(c => c === 0 ? '平（阳杯/圣杯）' : c === 1 ? '凸（阴杯/笑杯）' : '立（立杯/罕见）').join('、');

    const resultMeanings: Record<string, string> = {
      '圣杯': '神明应允，事情可成，时机成熟',
      '笑杯': '时机未到，或有变数，需要再问或等待',
      '阴杯': '神明不应，暂不宜行，需要调整',
      '立杯': '神明显灵，特殊征兆，需特别留意'
    };

    const prompt = `你是一位融合民俗智慧与现代心理学的引导者，善于通过摔杯这一古老仪式，帮助人们聆听内心的声音。

【请卦信息】
求卦者：${nickname || '你'}
所问之事：${question || '心中默问'}
摔杯结果：${result}
杯象状态：${cupStatusText}

【结果含义参考】
${resultMeanings[result] || '请结合杯象解读'}

【解读要求】
1. 核心启示：用一句温暖而有力的话点明这个卦象的核心信息（如"此卦显示时机已至，可以放心前行"）
2. 能量解读：解释这个杯象在当前问题上的意义，帮助用户理解背后的能量状态（2-3句话）
3. 内心对话：引导用户思考这个问题的深层需求，问1-2个启发性的问题
4. 行动建议：给出2-3条具体可执行的建议，帮助用户面对当前处境
5. 祝福收尾：用一句温暖的话结束，给予信心与力量

【风格要求】
- 语气温柔智慧，如一位理解你的朋友
- 重在心理疏解与积极引导，不宣扬迷信
- 将古老仪式转化为自我觉察的机会
- 字数控制在220-280字
- 中文输出，纯文本格式`;

    if (onStream) {
      return await aiService.generateContentStream(prompt, onStream);
    }
    const text = await aiService.generateContent(prompt);
    return text || "卦象已现，请平心静气。";
  } catch (error) {
    console.error("AI Shuaibei Error:", error);
    return "暂时无法通过 AI 连接灵感，请翻阅传统卦象说明。";
  }
};

export interface MoodColorPromptColor {
  name: string;
  hex: string;
  chakra: string;
  property: string;
  element: string;
  parts: string;
  symbol: string;
}

export const buildMoodColorInterpretationPrompt = (params: {
  nickname: string;
  dominantElement: ElementType;
  sheng: string;
  ke: string;
  color: MoodColorPromptColor;
}) => {
  const { nickname, dominantElement, sheng, ke, color } = params;
  return `你是一位色彩疗愈师与五行能量顾问，擅长用诗意但清晰的语言，把身心信号翻译成可行动的指引。

【背景信息】
用户昵称：${nickname || '未填写'}
今日主导五行：${dominantElement}（相生：${sheng}，相克：${ke}）
今日色：${color.name}
HEX：${color.hex}
对应脉轮：${color.chakra}
颜色属性：${color.property}
所属元素：${color.element}
对应身体部位：${color.parts}
象征意义：${color.symbol}

【输出格式要求：必须严格按下列模板输出，不要添加多余标题或解释，不要使用 Markdown 列表符号；每个字段必须单独占一行】
第一行固定写：
生命并不是要等待暴风雨过去，而是学会在雨中翩翩起舞

第二段为信息区（严格按顺序、逐行输出）：
今日色：${color.name}
对应脉轮：${color.chakra}
颜色属性：${color.property}
所属元素：${color.element}
对应身体部位：${color.parts}

第三段为一行：
象征意义：${color.symbol}

第四段以"今日解读"开头，紧跟一段连续文字（120-180字），要求：
1) 必须点出：这个颜色为何在"此刻"被选择（心理需求/身体讯息/能量缺口）
2) 必须自然融合：今日五行${dominantElement}的节奏，并点出相生${sheng}与相克${ke}的提醒
3) 至少给出2个具体可执行的小行动（嵌入在段落中即可，不要另起列表）
4) 风格参考示例：意象清晰、温柔深刻、像在对用户耳语；避免玄乎其玄、避免医疗建议
5) 中文输出。`;
};

export const buildBookAnswerInterpretationPrompt = (params: {
  nickname: string;
  question: string;
  answer: string;
  dominantElement: ElementType;
  sheng: string;
  ke: string;
  elementDescription: string;
}) => {
  const { nickname, question, answer, dominantElement, sheng, ke, elementDescription } = params;
  return `你是一位"答案之书"解读者，语气温柔但不含糊。
用户：${nickname || '你'}
问题：${question.trim() || '未填写问题'}
抽到的答案：${answer}
今日主导五行：${dominantElement}（相生：${sheng}，相克：${ke}）
参考提示：${elementDescription}

请输出：
1) 这句答案在此刻的含义（2-3句）
2) 今日行动建议（3条，每条不超过18字）
3) 今日避坑（1条，不超过18字）
字数控制在180-260字。中文输出。`;
};

export const buildSoulCommunicationPrompt = (params: {
  nickname: string;
  selectedSummary: string;
  dominantElement: ElementType;
  sheng: string;
  ke: string;
  elementDescription: string;
  context: string;
}) => {
  const { nickname, selectedSummary, dominantElement, sheng, ke, elementDescription, context } = params;
  return `你是一位"心灵沟通引导者"，专注于帮助用户倾听内心声音，不提供医疗诊断或迷信断言。

用户昵称：${nickname || '你'}
${selectedSummary}
今日主导五行：${dominantElement}（相生：${sheng}，相克：${ke}）
五行特质参考：${elementDescription}

对话记录：
${context}

请用中文回复（120-220字），包含以下三个部分：
1) 共情总结：理解用户当前状态
2) 下一步行动：提供清晰的行动建议
3) 小练习：从呼吸、书写、整理、沟通中选择一项提供可执行练习

回复要求：语气温柔而坚定，避免专业术语。`;
};

export const buildDivinationInterpretationPrompt = (params: {
  method: '梅花易数' | '六爻占卜';
  guaInfo: string;
}) => {
  const { method, guaInfo } = params;
  return `你是一位精通周易、六爻和梅花易数的国学大师。请根据以下起卦结果给出深度的专业解读。
起卦方式：${method}
${guaInfo}

解读要求：
1. 【卦名与卦象】：识别并说明这是哪一个卦，其大象如何（如：地水师，坎下坤上）。
2. 【卦辞解读】：详细解读该卦的卦辞，说明其核心吉凶倾向。
3. 【爻位分析】：如果是六爻，分析变爻的含义；如果是梅花，分析动爻对全卦的影响。
4. 【精神指引】：给出针对当下的心境调节、处事原则和智慧指引。
5. 【具体建议】：给出三条切实可行的行动建议。

回复要求：专业、优雅、富有禅意，分段清晰，使用 Markdown 格式。
回复语言：中文。`;
};

export const buildQimenDunjiaInterpretationPrompt = (params: {
  question: string;
  focus: '综合' | '事业' | '财运' | '感情' | '健康' | '学业' | '出行' | '其他';
  datetimeLocal: string;
}) => {
  const { question, focus, datetimeLocal } = params;
  return `你是一位资深的奇门遁甲（时家奇门）排盘师与解局师。请根据用户提供的公历时间为其起局排盘，并结合问事主题给出专业解读。

起局时间（公历，本地时间）：${datetimeLocal}
问事方向：${focus}
问事主题：${question}

请按以下结构输出（使用 Markdown）：
1) 【起局要点】阴遁/阳遁、局数、值符、值使、旬首（若无法严格推算，可说明采用的合理简化原则）。
2) 【九宫盘】用一个 3×3 的 Markdown 表格输出九宫盘（上：南，左：东；每宫内容不超过 4 行），每宫包含：宫位（方位）/ 八门 / 九星 / 八神 / 天盘干 / 地盘干。
3) 【解局结论】先给一句"核心断语"（一句话点题，禅意但不玄而空）。
4) 【形势与关键宫位】说明吉凶大势、重点落宫与对应象意（至少 2 个关键点）。
5) 【行动建议】给 3 条可执行的建议（具体到下一步行动）。
6) 【风险提醒】指出 2 个需要规避的风险或误区。
7) 【时间节奏】给出一个简短的节奏提示（例如近期/中期/长期分别注意什么，避免给出绝对断言）。

约束：
- 不要给医疗诊断，不要做迷信式恐吓。
- 文字专业、条理清晰，避免堆砌术语，必要术语要用一句话解释。`;
};
export const getGeminiHumanNumerologyAnalysis = async (
  params: {
    nickname: string;
    lifeNumber: number;
    talentNumbers: number[];
    gridNumbers: number[];
    lines: string[];
  },
  onStream?: (chunk: string) => void
): Promise<string> => {
  const { nickname, lifeNumber, talentNumbers, gridNumbers, lines } = params;
  try {
    // 生命数含义
    const lifeNumberMeanings: Record<number, string> = {
      1: '独立开创，领导力强，天生领袖气质',
      2: '合作共赢，敏感细腻，天生的协调者',
      3: '创意表达，乐观开朗，天生的艺术家',
      4: '务实稳定，踏实可靠，天生的建设者',
      5: '自由探索，适应力强，天生的冒险家',
      6: '关爱责任，家庭观念，天生的守护者',
      7: '智慧分析，内省深思，天生的思想家',
      8: '权力成就，商业头脑，天生的企业家',
      9: '博爱奉献，理想主义，天生的人道主义者'
    };

    // 连线含义
    const lineMeanings: Record<string, string> = {
      '1-2-3': '艺术线：富有创意与表达力',
      '4-5-6': '组织线：擅长规划与执行',
      '7-8-9': '智慧线：理性思维与分析力',
      '1-4-7': '行动线：执行力与实践力',
      '2-5-8': '情感线：感受力与人际敏感度',
      '3-6-9': '心智线：思考逻辑与学习能力',
      '1-5-9': '意志力线：目标感与决断力',
      '3-5-7': '灵性线：直觉与洞察力'
    };

    const prompt = `你是一位深谙生命灵数智慧的导师，善于通过数字解读帮助人们认识自我潜能。

【解读者】
${nickname || '朋友'}

【生命灵数档案】
生命数：${lifeNumber}（${lifeNumberMeanings[lifeNumber] || '独特的人生课题'}）
天赋数：${talentNumbers.join('、')}
能量分布：${gridNumbers.join('、')}
${lines.length > 0 ? `能量连线：${lines.map(l => `${l}(${lineMeanings[l] || '特殊能量通道'})`).join('、')}` : '能量连线：尚未形成明显连线'}

【解读框架】
1. 生命蓝图：解读生命数的核心意义，以及这对${nickname || '你'}的人生道路意味着什么（2-3句话）
2. 天赋印记：结合天赋数和能量连线，点出天生的优势与潜能
3. 能量地图：分析九宫格数字分布，指出能量集中与空缺的领域
4. 成长方向：针对能量特点，给出3条自我提升的具体建议
5. 肯定鼓励：用一句温暖有力的话肯定${nickname || '你'}的独特价值

【风格要求】
- 语气睿智但不晦涩，充满鼓励与启发
- 将数字学转化为自我认识与成长的工具
- 重在肯定潜能而非限制可能
- 字数控制在240-300字
- 中文输出，纯文本格式
- 用【】标记各板块`;

    if (onStream) {
      return await aiService.generateContentStream(prompt, onStream);
    }
    const text = await aiService.generateContent(prompt);
    return text || "数字中蕴藏着无限可能，请继续探索。";
  } catch (error) {
    console.error("AI Human Numerology Error:", error);
    return "暂时无法获取数字灵感，请基于页面数据自行体悟。";
  }
};

export const getGeminiHumanDesignAnalysis = async (
  params: {
    profile: UserProfile;
    hdData: {
      type: string;
      strategy: string;
      authority: string;
      definition: string;
      role: string;
      cross: string;
    }
  },
  onStream?: (chunk: string) => void
): Promise<string> => {
  const { profile, hdData } = params;
  try {
    // 人类图类型解读
    const typeInsights: Record<string, string> = {
      '显示者': '发起型能量场，善于开创与启动，需要 informing 他人以减少阻力',
      '生产者': '回应型能量场，荐骨有持续动力，等待回应后全力以赴',
      '显示生产者': '混合型能量场，既有发起力又有持续动力，需平衡冲动与回应',
      '投射者': '引导型能量场，善于管理与指导，需要被邀请才能发挥',
      '反映者': '镜子型能量场，反映环境与人群状态，需要时间与空间做决定'
    };

    // 权威类型解读
    const authorityInsights: Record<string, string> = {
      '情绪权威': '情绪清明时做决定，给自己时间经历情绪波峰波谷',
      '荐骨权威': '听从身体内在声音，用"嗯哼"或"嗯"感受回应',
      '直觉权威': '当下即刻的直觉反应，相信第一时间的身体感知',
      '意志力权威': '听从内心真正渴望，不为证明而做',
      '自我权威': '投射者专属，听从自我声音，表达真实想法',
      '环境权威': '反映者专属，在不同环境中感受自己的变化'
    };

    const prompt = `你是一位资深的人类设计(Human Design)分析师，善于帮助人们理解自己的能量蓝图，活出真实自我。

【用户档案】
姓名：${profile.nickname || '朋友'}
性别：${profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '未知'}
年龄：${profile.age || '未知'}岁

【人类图核心信息】
能量类型：${hdData.type}（${typeInsights[hdData.type] || '独特的能量运作方式'}）
人生策略：${hdData.strategy}
内在权威：${hdData.authority}（${authorityInsights[hdData.authority] || '独特的决策方式'}）
定义类型：${hdData.definition}
人生角色：${hdData.role}
轮回交叉：${hdData.cross}

【解读要求】
1. 能量本质：解读${hdData.type}的能量场如何运作，以及这对日常生活的意义（3-4句话）
2. 决策智慧：详细说明如何运用${hdData.authority}做正确的决定，给出具体场景示例
3. 角色天赋：解析${hdData.role}在社交互动中的特质与潜力
4. 生活应用：给出3条在日常生活中实践策略与权威的具体建议
5. 回归自我：一句温暖有力的话，鼓励用户信任自己的设计

【风格要求】
- 专业严谨但易懂，避免过度玄学化
- 重在实际生活应用，帮助用户活出真实自我
- 语气肯定鼓励，强调独特价值而非限制
- 字数控制在280-340字
- 中文输出，用【】标记各板块`;

    if (onStream) {
      return await aiService.generateContentStream(prompt, onStream);
    }
    const text = await aiService.generateContent(prompt);
    return text || "你是一个独特的存在，请遵循你的策略与权威。";
  } catch (error) {
    console.error("AI Human Design Error:", error);
    return "人类图能量采集受阻，请翻阅专业书籍深度了解。";
  }
};
export const getGeminiBaziAnalysis = async (
  params: {
    pillars: string[];
    dayMaster: string;
    masterElement: string;
    overallScore: number;
    suggestions: string[];
  },
  onStream?: (chunk: string) => void
): Promise<string> => {
  const { pillars, dayMaster, masterElement, overallScore, suggestions } = params;
  try {
    // 天干地支五行属性
    const heavenlyStems: Record<string, string> = {
      '甲': '阳木', '乙': '阴木', '丙': '阳火', '丁': '阴火',
      '戊': '阳土', '己': '阴土', '庚': '阳金', '辛': '阴金',
      '壬': '阳水', '癸': '阴水'
    };

    const earthlyBranches: Record<string, string> = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木',
      '辰': '土', '巳': '火', '午': '火', '未': '土',
      '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };

    const prompt = `你是一位融合传统八字智慧与现代人生哲学的命理顾问，善于将古老的干支文化转化为对当下的洞察与指引。

【八字命盘】
年柱 ${pillars[0]}：${pillars[0][0]}${heavenlyStems[pillars[0][0]] || ''} ${pillars[0][1]}${earthlyBranches[pillars[0][1]] || ''}
月柱 ${pillars[1]}：${pillars[1][0]}${heavenlyStems[pillars[1][0]] || ''} ${pillars[1][1]}${earthlyBranches[pillars[1][1]] || ''}
日柱 ${pillars[2]}：${pillars[2][0]}${heavenlyStems[pillars[2][0]] || ''} ${pillars[2][1]}${earthlyBranches[pillars[2][1]] || ''}
时柱 ${pillars[3]}：${pillars[3][0]}${heavenlyStems[pillars[3][0]] || ''} ${pillars[3][1]}${earthlyBranches[pillars[3][1]] || ''}

【命盘要点】
命主元神：${dayMaster}
命主五行：${masterElement}
今日能量：${overallScore}%
锦囊提示：${suggestions.join('、')}

【解读要求】
1. 核心断语：用一句富含禅意且精炼的话定性今日运势基调（如"今日木火通明，宜主动进取"）
2. 五行能量：分析今日干支与命主五行的生克关系，说明能量状态与应对策略（2-3句话）
3. 事业指引：结合八字特点，给出今日事业发展方向与注意事项
4. 财运提示：分析财星状态，给出理财与消费建议
5. 情感关系：结合日主与配偶宫，给出人际与感情建议
6. 健康提醒：根据五行平衡，指出需要注意的身体部位
7. 开运心法：给出今日的心态调整与行动建议

【风格要求】
- 专业但不迷信，重在启发而非预测
- 将八字智慧转化为现代人可理解的生活指引
- 语气稳重睿智，有古典韵味
- 总字数320-400字
- 中文输出，用【】标记各板块
- 不使用Markdown符号`;

    if (onStream) {
      return await aiService.generateContentStream(prompt, onStream);
    }
    const text = await aiService.generateContent(prompt);
    return text || "乾坤定数，顺势而为。";
  } catch (error) {
    console.error("AI Bazi Analysis Error:", error);
    throw error;
  }
};

export const getGeminiBaziMinggeAdvice = async (
  params: {
    nickname: string;
    gender: 'male' | 'female';
    age: number;
    pillars: string[];
    shichen: string;
    fiveElements: { percentages: Record<string, number> };
    tenGods: { percentages: Record<string, number> };
    useGod: string;
    happyGods: string[];
    avoidGods: string[];
    dayun: Array<{ pillar: string; startAge: number; endAge: number }>;
  },
  onStream?: (chunk: string) => void
): Promise<string> => {
  const { nickname, gender, age, pillars, shichen, fiveElements, tenGods, useGod, happyGods, avoidGods, dayun } = params;
  try {
    const topTenGods = Object.entries(tenGods.percentages || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => `${k}${v}%`)
      .join('、');

    const topElements = Object.entries(fiveElements.percentages || {})
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}${v}%`)
      .join('、');

    const dayunText = (dayun || [])
      .slice(0, 6)
      .map((d) => `${d.startAge}-${d.endAge}岁 ${d.pillar}`)
      .join('\n');

    // 用神含义
    const useGodMeanings: Record<string, string> = {
      '金': '需要收敛决断之力，培养果决与清晰',
      '木': '需要生发成长之力，培养规划与进取',
      '水': '需要流动智慧之力，培养灵活与沟通',
      '火': '需要热情表达之力，培养行动与影响',
      '土': '需要承载稳定之力，培养务实与包容'
    };

    const prompt = `你是一位融合传统八字智慧与现代人生发展的命理顾问，善于将命盘信息转化为可执行的人生策略。

【命盘摘要】
命主：${nickname || '你'}（${gender === 'male' ? '男' : '女'}，${age}岁）
出生时辰：${shichen}

【四柱结构】
年柱 ${pillars[0]} | 月柱 ${pillars[1]} | 日柱 ${pillars[2]} | 时柱 ${pillars[3]}

【能量分布】
五行占比：${topElements}
十神配置：${topTenGods}
用神：${useGod}（${useGodMeanings[useGod] || '命盘所需之能量'}）
喜神：${happyGods.join('、')}
忌神：${avoidGods.join('、')}

【大运走向】
${dayunText}

【解读任务】
1. 格局总评：用16-24字概括命盘整体特点与人生策略方向
2. 优势结构：分析命盘中的天赋与有利因素，以及如何发挥（3-4条）
3. 关注领域：指出需要注意的平衡点与潜在挑战（2-3条）
4. 关键策略：基于用神给出核心发展建议（2-3条）
5. 未来三年：针对${age}-${age + 3}岁给出事业、财务、关系、健康四个领域的具体行动建议（各2条）
6. 大运指引：说明如何根据大运变化调整策略，顺势而为

【输出要求】
- 专业清晰，不迷信不恐吓
- 建议具体可执行，避免空泛
- 总字数400-500字
- 中文输出，用【】标记各板块
- 纯文本格式，不用Markdown符号`;

    const fallbackText = '总评：格局可用，重在选对杠杆。\n【优势结构】\n1. 把优势投到可复利的技能与作品。\n2. 用可量化指标推动长期积累。\n【风险结构】\n1. 避免在情绪波动时做重大决策。\n2. 警惕短期高回报诱惑带来的结构性风险。\n【关键杠杆】\n1. 用稳定作息与预算系统提升长期胜率。\n2. 用复盘机制把好运变成可复制的方法。\n【未来三年行动建议】\n1. 事业：确定一条主航道并沉淀作品集。\n2. 事业：每季度完成一次可交付里程碑。\n3. 财务：建立3-6个月应急金与自动储蓄。\n4. 财务：将风险资产控制在可承受比例。\n5. 关系：每周一次高质量沟通与约定规则。\n6. 健康：固定运动与睡眠窗口，坚持体检。\n【十年大运使用说明】\n1. 以阶段目标为导向，顺势放大优势，逆势稳住底盘。\n2. 运势不当作结果保证，把它当作资源配置的参考。';

    if (onStream) {
      const result = await aiService.generateContentStream(prompt, onStream);
      return result.trim() || fallbackText;
    }
    const text = await aiService.generateContent(prompt);
    return text || fallbackText;
  } catch (error) {
    console.error('AI Bazi Mingge Advice Error:', error);
    return '';
  }
};

export interface DietaryHealthParams {
  age: number;
  gender: 'male' | 'female' | 'other';
  eventName: string;
  solarTermName: string;
  solarTermDaysDiff: number;
  mbti?: string;
  ageGroup: string;
  bodyType?: string; // 中医体质，如'阴虚质'、'气虚质'等
  organRhythm?: {
    organ: string;
    timeRange: string;
    description: string;
    suggestion: string;
    healthTip: string;
  }; // 当前器官节律
  energyStatus?: {
    physical: number; // 体力水平 0-100
    mental: number; // 智力/精神水平 0-100
    emotional: number; // 情绪水平 0-100
  }; // 当日能量状态
}

export const getGeminiDietaryAdvice = async (
  params: DietaryHealthParams,
  onStream?: (chunk: string) => void
): Promise<string> => {
  try {
    const { age, gender, eventName, solarTermName, solarTermDaysDiff, mbti, ageGroup, bodyType, organRhythm, energyStatus } = params;

    // 构建体质信息
    const bodyTypeContext = bodyType ? `体质判定：${bodyType}` : '体质未判定';

    // 构建器官节律信息
    const rhythmContext = organRhythm
      ? `${organRhythm.timeRange} ${organRhythm.organ}经当令：${organRhythm.description}`
      : '未获取时辰节律';

    // 构建能量状态信息
    const energyContext = energyStatus
      ? `体力${energyStatus.physical}/脑力${energyStatus.mental}/情绪${energyStatus.emotional}`
      : '未获取能量状态';

    // 季节饮食原则
    const seasonalPrinciples: Record<string, string> = {
      '立春': '春生发陈，宜食辛温发散之品',
      '雨水': '春雨润物，宜食健脾祛湿之物',
      '惊蛰': '春雷惊醒，宜食清淡养肝之食',
      '春分': '阴阳平衡，宜食时令新鲜蔬菜',
      '清明': '清气上升，宜食清淡养肝之品',
      '谷雨': '雨生百谷，宜食健脾祛湿之物',
      '立夏': '夏气始至，宜食清淡养心之食',
      '小满': '麦粒渐满，宜食清热解暑之品',
      '芒种': '忙种之时，宜食清淡易消化之物',
      '夏至': '阳极阴生，宜食清热养阴之食',
      '小暑': '暑气渐盛，宜食清凉解暑之品',
      '大暑': '暑气最盛，宜食清热生津之物',
      '立秋': '秋气始至，宜食滋阴润肺之品',
      '处暑': '暑气将退，宜食清淡养胃之食',
      '白露': '露凝而白，宜食温润防燥之物',
      '秋分': '阴阳平衡，宜食滋阴润燥之品',
      '寒露': '露气寒冷，宜食温润补肾之食',
      '霜降': '霜始降，宜食温补养胃之物',
      '立冬': '冬气始至，宜食温补养肾之品',
      '小雪': '雪未盛，宜食温热补益之物',
      '大雪': '雪盛矣，宜食温补滋养之食',
      '冬至': '阴极阳生，宜食温补阳气之品',
      '小寒': '寒气渐盛，宜食温热暖胃之物',
      '大寒': '寒气最盛，宜食温补强身之食'
    };

    const seasonalGuide = seasonalPrinciples[solarTermName] || '顺应时令，调理身心';

    const prompt = `你是一位融合现代营养学与传统中医食疗的膳食顾问，擅长根据体质、时令、节律和能量状态定制个性化食谱。

【用户画像】
年龄：${age}岁（${ageGroup}）
性别：${gender === 'male' ? '男' : gender === 'female' ? '女' : '其他'}
MBTI：${mbti || '未知'}

【时令背景】
当前：${eventName}（${solarTermName}，已过${solarTermDaysDiff}天）
饮食原则：${seasonalGuide}

【身体状况】
${bodyTypeContext} | ${rhythmContext}
能量状态：${energyContext}

【今日食疗重点】
针对${bodyType || '当前体质'}与${energyStatus ? '能量状态' : '时节特点'}，推荐：

请按以下结构输出个性化膳食建议：

【核心养生点】
结合体质、时令和能量状态，阐述3-4点今日饮食重点，每点说明原理（如"阴虚+脑力低：重点滋阴补脑，推荐黑色食物"）

【推荐食材】
列出5-6个当季适合食材，标注体质益处（如：黑芝麻（滋阴补肾、益脑））

【三餐食谱】
早餐：推荐1道食谱（食材+简单做法+适合原因）
午餐：推荐1道食谱（食材+简单做法+与节律关联）
晚餐：推荐1道食谱（食材+简单做法+晚餐注意点）

【饮食小贴士】
2-3条针对今日体质和状态的具体建议（如"午后可饮菊花枸杞茶清肝明目"）

【今日寄语】
一句温暖鼓励的话，将饮食与健康生活连接

【输出要求】
- 总字数380-500字
- 专业但不晦涩，像营养师朋友的建议
- 食谱具体可操作，食材易购得
- 纯文本输出，用【】标记各板块
- 无Markdown符号，适当换行保持可读性`;

    if (onStream) {
      return await aiService.generateContentStream(prompt, onStream);
    }
    const text = await aiService.generateContent(prompt);
    return (text || '愿你今日三餐有节，起居有常，万物皆是药石，唯心平气和最补。').trim();
  } catch (error) {
    console.error('AI Dietary Health Advice Error:', error);
    return '愿你今日三餐有节，起居有常，万物皆是药石，唯心平气和最补。';
  }
};

export interface DietLogAiSummary {
  caloriesEstimate: number;
  macro: { carbPct: number; proteinPct: number; fatPct: number };
  sugarOilRisk: '低' | '中' | '高';
  summary: string;
  reminders: string[];
}

// 食物营养成分分析接口
export interface FoodNutritionAnalysis {
  name: string;
  foodCategory: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbsPer100g: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

const parseFoodNutritionJson = (text: string): FoodNutritionAnalysis | null => {
  const t = (text || '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const raw = JSON.parse(t.slice(start, end + 1)) as Partial<FoodNutritionAnalysis>;
    if (!raw || typeof raw.name !== 'string') return null;
    
    const caloriesPer100g = Number(raw.caloriesPer100g);
    const proteinPer100g = Number(raw.proteinPer100g);
    const fatPer100g = Number(raw.fatPer100g);
    const carbsPer100g = Number(raw.carbsPer100g);
    
    if (!Number.isFinite(caloriesPer100g) || caloriesPer100g < 0 || caloriesPer100g > 1000) return null;
    if (!Number.isFinite(proteinPer100g) || proteinPer100g < 0 || proteinPer100g > 100) return null;
    if (!Number.isFinite(fatPer100g) || fatPer100g < 0 || fatPer100g > 100) return null;
    if (!Number.isFinite(carbsPer100g) || carbsPer100g < 0 || carbsPer100g > 100) return null;
    
    return {
      name: raw.name.trim(),
      foodCategory: (raw.foodCategory || '').trim(),
      caloriesPer100g: Math.round(caloriesPer100g),
      proteinPer100g: Math.round(proteinPer100g * 10) / 10,
      fatPer100g: Math.round(fatPer100g * 10) / 10,
      carbsPer100g: Math.round(carbsPer100g * 10) / 10,
      confidence: ['high', 'medium', 'low'].includes(raw.confidence as string) ? raw.confidence as 'high' | 'medium' | 'low' : 'medium',
      notes: (raw.notes || '').trim()
    };
  } catch {
    return null;
  }
};

export const getGeminiFoodNutritionAnalysis = async (params: {
  name: string;
  foodCategory: string;
  bodyType?: string;
}): Promise<FoodNutritionAnalysis | null> => {
  try {
    const prompt = `你是一位专业的中文营养师和食品数据库专家。请分析以下食物的营养成分（每100g可食用部分）。

食物名称：${params.name}
食物分类：${params.foodCategory}
${params.bodyType ? `用户体质：${params.bodyType}` : ''}

请根据你的专业知识，给出该食物的营养成分数据。如果是加工食品或复杂菜品，请基于常见做法估算平均值。

输出要求：
1. 只输出严格的JSON格式，不要任何额外文字、Markdown或表情符号
2. JSON结构：
{
  "name": "食物名称",
  "foodCategory": "食物分类",
  "caloriesPer100g": 热量数值(整数,kcal),
  "proteinPer100g": 蛋白质数值(保留1位小数,g),
  "fatPer100g": 脂肪数值(保留1位小数,g),
  "carbsPer100g": 碳水化合物数值(保留1位小数,g),
  "confidence": "high|medium|low",
  "notes": "可选的简短说明，如'这是平均值，实际因品牌而异'"
}
3. confidence表示你对这个数据的置信度：
   - high: 标准食材，数据可靠（如苹果、鸡胸肉）
   - medium: 加工食品或常见菜品，基于常见配方估算
   - low: 复杂菜品或地区特色食物，估算误差可能较大
4. 确保数值在合理范围内：热量0-1000kcal/100g，营养素0-100g/100g`;

    const text = await aiService.generateContent(prompt);
    return parseFoodNutritionJson(text || '');
  } catch (error) {
    console.error('AI Food Nutrition Analysis Error:', error);
    return null;
  }
};

export interface TeaLogAiSummary {
  recommendedMaxCaffeineMg: number;
  recommendedMaxSugarG: number;
  status: '安全' | '接近上限' | '超标';
  summary: string;
  reminders: string[];
  guide?: string;
}

const parseTeaLogAiSummaryJson = (text: string): TeaLogAiSummary | null => {
  const t = (text || '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const raw = JSON.parse(t.slice(start, end + 1)) as Partial<TeaLogAiSummary>;
    const recommendedMaxCaffeineMg = Number(raw.recommendedMaxCaffeineMg);
    const recommendedMaxSugarG = Number(raw.recommendedMaxSugarG);
    if (!Number.isFinite(recommendedMaxCaffeineMg) || !Number.isFinite(recommendedMaxSugarG)) return null;
    const status = raw.status;
    if (status !== '安全' && status !== '接近上限' && status !== '超标') return null;
    const summary = typeof raw.summary === 'string' ? raw.summary.trim() : '';
    const reminders = Array.isArray(raw.reminders) ? raw.reminders.filter((x) => typeof x === 'string').map((x) => x.trim()).filter(Boolean).slice(0, 6) : [];
    const guide = typeof (raw as any).guide === 'string' ? String((raw as any).guide).replace(/\r/g, '').trim() : '';
    return {
      recommendedMaxCaffeineMg: Math.max(50, Math.min(800, Math.round(recommendedMaxCaffeineMg))),
      recommendedMaxSugarG: Math.max(0, Math.min(120, Math.round(recommendedMaxSugarG * 10) / 10)),
      status,
      summary,
      reminders,
      guide: guide || undefined
    };
  } catch {
    return null;
  }
};

const parseDietLogAiSummaryJson = (text: string): DietLogAiSummary | null => {
  const t = (text || '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const raw = JSON.parse(t.slice(start, end + 1)) as Partial<DietLogAiSummary>;
    const caloriesEstimate = Number.isFinite(raw.caloriesEstimate as number) ? Number(raw.caloriesEstimate) : NaN;
    const macro = raw.macro as any;
    if (!Number.isFinite(caloriesEstimate)) return null;
    if (!macro || !Number.isFinite(macro.carbPct) || !Number.isFinite(macro.proteinPct) || !Number.isFinite(macro.fatPct)) return null;
    const sugarOilRisk = raw.sugarOilRisk;
    if (sugarOilRisk !== '低' && sugarOilRisk !== '中' && sugarOilRisk !== '高') return null;
    const summary = typeof raw.summary === 'string' ? raw.summary.trim() : '';
    const reminders = Array.isArray(raw.reminders) ? raw.reminders.filter((x) => typeof x === 'string').map((x) => x.trim()).filter(Boolean).slice(0, 5) : [];
    return {
      caloriesEstimate: Math.max(0, Math.round(caloriesEstimate)),
      macro: {
        carbPct: Math.max(0, Math.min(100, Math.round(macro.carbPct))),
        proteinPct: Math.max(0, Math.min(100, Math.round(macro.proteinPct))),
        fatPct: Math.max(0, Math.min(100, Math.round(macro.fatPct)))
      },
      sugarOilRisk,
      summary,
      reminders
    };
  } catch {
    return null;
  }
};

export const getGeminiDietLogAiSummary = async (params: {
  dateKey: string;
  bodyType: string;
  targetCalories?: number;
  recentCaloriesTrend?: Array<{ dateKey: string; calories: number }>;
  entries: Array<{ meal: string; category: string; name: string; score: number; calories?: number | null }>;
}): Promise<DietLogAiSummary | null> => {
  try {
    const entriesText = params.entries
      .slice(0, 60)
      .map((e, idx) => {
        const cal = Number.isFinite(e.calories as number) ? `；手动${Math.round(Number(e.calories))}kcal` : '';
        return `${idx + 1}. ${e.meal}/${e.category}：${e.name}（分数${e.score}/10${cal}）`;
      })
      .join('\n');

    const trendText = (params.recentCaloriesTrend || [])
      .slice(-7)
      .map((x) => `${x.dateKey}:${Math.max(0, Math.round(Number(x.calories) || 0))}`)
      .join('，');

const prompt = `你是一位中文营养师，请基于用户的饮食记录分析当天的摄入情况，提供可执行提醒，以避免长期高糖高油脂饮食。

日期：${params.dateKey}
用户体质：${params.bodyType || '未知'}
每日目标热量：${Number.isFinite(params.targetCalories as number) ? `${Math.round(Number(params.targetCalories))}kcal` : '未知'}
近7天热量趋势（kcal，可能为估算/手动混合）：${trendText || '无'}
饮食记录（按条列出）：
${entriesText || '无'}

任务：
1) 估算当日总热量（caloriesEstimate），单位为千卡（kcal），输出整数。若某条记录提供了手动热量，请优先使用手动热量计入总热量；否则用分数与分类进行经验估算。
2) 估算三大营养素占比（macro），包括碳水化合物（carbPct）、蛋白质（proteinPct）和脂肪（fatPct），每个比例为0-100的整数，总和约为100。
3) 评估高糖高油脂风险（sugarOilRisk），只能是“低”、“中”或“高”，并用一句话总结（summary）。
4) 提供3-5条提醒（reminders），每条不超过24个中文字符，确保可执行且避免恐吓语气；如果提供了每日目标热量，请包含1条与“低于/接近/超过目标”的可执行提醒；如果提供了近7天趋势，请包含1条基于趋势的可执行建议（如更稳态、避免某时段暴食等）。

输出要求：
- 只输出严格的JSON格式，不要任何额外文字、Markdown或表情符号。
- JSON结构：{"caloriesEstimate": 数值, "macro": {"carbPct": 数值, "proteinPct": 数值, "fatPct": 数值}, "sugarOilRisk": "字符串", "summary": "字符串", "reminders": ["字符串1", "字符串2", ...]}`;

    const text = await aiService.generateContent(prompt);
    return parseDietLogAiSummaryJson(text || '');
  } catch (error) {
    console.error('AI Diet Log Summary Error:', error);
    return null;
  }
};

export const getGeminiTeaLogAiSummary = async (params: {
  dateKey: string;
  bodyType: string;
  age?: number;
  gender?: string;
  todayTotals: { caffeineMg: number; sugarG: number; servings: number };
  recentTrend?: Array<{ dateKey: string; caffeineMg: number; sugarG: number; servings: number }>;
  entries: Array<{
    name: string;
    brand?: string;
    caffeineMark?: string;
    sugarMark?: string;
    tips?: string[];
    cupMl: number;
    servings: number;
    caffeineMg: number;
    sugarG: number;
  }>;
}): Promise<TeaLogAiSummary | null> => {
  try {
    const entriesText = params.entries
      .slice(0, 60)
      .map((e, idx) => {
        const metaParts = [
          e.brand ? `品牌${e.brand}` : '',
          e.caffeineMark ? `咖啡因${e.caffeineMark}` : '',
          e.sugarMark ? `含糖${e.sugarMark}` : '',
          e.tips?.length ? `提示${e.tips.slice(0, 3).join('/')}` : ''
        ].filter(Boolean);
        const meta = metaParts.length ? `；${metaParts.join('；')}` : '';
        return `${idx + 1}. ${e.name}（${Math.round(e.cupMl)}ml × ${Math.round(e.servings)}杯；咖啡因${Math.round(e.caffeineMg)}mg；糖${Math.round(e.sugarG * 10) / 10}g${meta}）`;
      })
      .join('\n');

    const trendText = (params.recentTrend || [])
      .slice(-7)
      .map((x) => `${x.dateKey}:${Math.round(x.caffeineMg)}mg/${Math.round(x.sugarG * 10) / 10}g/${Math.round(x.servings)}杯`)
      .join('，');

    const prompt = `你是一位中文健康营养师，专注于茶/咖啡饮品的咖啡因与糖摄入控制。你需要结合“用户体质（中医体质）+年龄性别+今日饮用记录+近7天趋势+饮品健康标记（如红绿灯/0咖啡因/高糖提示）”，给出“今日最高限制”和可执行的健康提示，避免用户过量饮用影响睡眠、心率、焦虑与代谢。

日期：${params.dateKey}
用户体质：${params.bodyType || '未知'}
用户年龄：${Number.isFinite(params.age as number) ? Math.round(Number(params.age)) : '未知'}
用户性别：${params.gender || '未知'}

今日汇总：总杯数${Math.round(params.todayTotals.servings)}；咖啡因${Math.round(params.todayTotals.caffeineMg)}mg；糖${Math.round(params.todayTotals.sugarG * 10) / 10}g
近7天趋势（咖啡因/糖/杯数）：${trendText || '无'}
详细记录：
${entriesText || '无'}

医学常识参考（可用于设定上限）：
1) 一般成人咖啡因上限常取400mg/天；对咖啡因敏感、睡眠差、焦虑、心悸、青少年/体弱者建议更低（如100-250mg/天）。
2) 游离糖建议不超过25g/天（更严格可更低）。
3) 中医体质提示：阴虚/湿热更应减少刺激与甜腻；痰湿应控糖控奶茶；气虚/阳虚应避免过量刺激与冰饮；特禀体质更关注敏感反应与睡眠。

任务：
1) 给出今日建议的咖啡因最高限制 recommendedMaxCaffeineMg（mg，整数）。
2) 给出今日建议的糖最高限制 recommendedMaxSugarG（g，可带1位小数）。
3) 根据“今日实际摄入 vs 建议上限”，给出状态 status，只能是：安全 / 接近上限 / 超标。
4) 用一句话总结 summary（<=32字，避免恐吓语气）。
5) 给出 3-6 条提醒 reminders（每条<=24字，必须可执行；至少1条围绕咖啡因，至少1条围绕控糖，至少1条结合体质；若记录中出现“红灯/高糖/0咖啡因但高糖”等标记，要有针对性提醒）。
6) 生成“今日饮茶AI指南” guide：一段可复制的中文文本，包含换行与编号，结构必须包含以下小节并显式带上摄入数值：
   - 开头一句：“根据你的今日摄入数据，结合健康提醒，以下是为你的定制的调整建议：”
   - 1. 咖啡因管理（今日咖啡因mg/建议上限mg），包含“当前状态：”与“建议行动：”与“提醒：”
   - 2. 糖分控制（今日糖g/建议上限g），包含“当前状态：”与“建议行动：”与可选“护齿提示：”
   - 3. 综合健康优化，至少包含“饮品选择：”“明日小目标：”
   输出内容禁止出现Markdown符号（如##、**、-、*），但允许使用中文冒号、分号、换行与“1./2./3.”编号。

输出要求：
- 只输出严格的JSON格式，不要任何额外文字、Markdown或表情符号。
- JSON结构：{"recommendedMaxCaffeineMg": 数值, "recommendedMaxSugarG": 数值, "status": "字符串", "summary": "字符串", "reminders": ["字符串1", "字符串2", ...], "guide": "字符串"}`;

    const text = await aiService.generateContent(prompt);
    return parseTeaLogAiSummaryJson(text || '');
  } catch (error) {
    console.error('AI Tea Log Summary Error:', error);
    return null;
  }
};

export interface DressingGuideAiAnalysis {
  summary: string;
  outfitSuggestion: string;
  dietSuggestion: string;
  luckyColor: string;
  luckyFood: string;
}

const DRESSING_GUIDE_CACHE_KEY = 'nice_today_dressing_guide_ai_v1';

const parseDressingGuideAiJson = (text: string): DressingGuideAiAnalysis | null => {
  const t = (text || '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const raw = JSON.parse(t.slice(start, end + 1)) as Partial<DressingGuideAiAnalysis>;
    return {
      summary: (raw.summary || '').trim(),
      outfitSuggestion: (raw.outfitSuggestion || '').trim(),
      dietSuggestion: (raw.dietSuggestion || '').trim(),
      luckyColor: (raw.luckyColor || '').trim(),
      luckyFood: (raw.luckyFood || '').trim(),
    };
  } catch {
    return null;
  }
};

export const getGeminiDressingGuide = async (params: {
  dateKey: string;
  dominantElement: string;
  userProfile: UserProfile;
  weather?: string;
  temperature?: string;
}): Promise<DressingGuideAiAnalysis | null> => {
  const { dateKey, dominantElement, userProfile, weather, temperature } = params;
  
  // 1. Try Cache
  try {
    const raw = localStorage.getItem(DRESSING_GUIDE_CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached.dateKey === dateKey && cached.value) {
        return cached.value;
      }
    }
  } catch {}

  // 2. Call AI
  try {
    const bodyType = resolveBodyTypeName(userProfile.bodyType);
    const mbti = (userProfile.mbti || '').trim().toUpperCase();
    const gender = userProfile.gender === 'male' ? '男' : userProfile.gender === 'female' ? '女' : '未知';
    
    const prompt = `你是一位专业且富有审美的中文形象顾问与养生专家。请根据以下信息为用户提供今日穿搭与饮食建议。
    
    日期：${dateKey}
    今日五行主导：${dominantElement}
    天气情况：${weather || '未知'}，气温${temperature || '未知'}
    用户画像：${gender}，体质${bodyType || '未知'}，MBTI ${mbti || '未知'}
    
    任务：
    1. summary：用一句富有诗意或力量感的话概括今日状态（20字内）。
    2. outfitSuggestion：结合五行能量、天气与用户体质，给出具体的穿搭建议（如材质、款式、风格）（50字内）。
    3. dietSuggestion：结合五行与体质，给出具体的饮食调理建议（50字内）。
    4. luckyColor：推荐1-2个今日开运色。
    5. luckyFood：推荐1-2个今日养生食材。
    
    输出要求：
    - 只输出严格 JSON，结构为 {"summary":"...","outfitSuggestion":"...","dietSuggestion":"...","luckyColor":"...","luckyFood":"..."}`;

    const text = await aiService.generateContent(prompt);
    const parsed = parseDressingGuideAiJson(text || '');
    
    if (parsed) {
      // 3. Write Cache
      try {
        localStorage.setItem(DRESSING_GUIDE_CACHE_KEY, JSON.stringify({
          dateKey,
          timestamp: Date.now(),
          value: parsed
        }));
      } catch {}
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("AI Dressing Guide Error:", error);
    return null;
  }
};

export const getGeminiHoroscopeMonthlyAnalysis = async (
  params: {
    zodiac: string;
    month: string;
  },
  onStream?: (chunk: string) => void
): Promise<string> => {
  const { zodiac, month } = params;
  try {
    // 星座元素与特质
    const zodiacElements: Record<string, string> = {
      '白羊座': '火象 - 开创、行动、热情',
      '金牛座': '土象 - 稳定、务实、享受',
      '双子座': '风象 - 灵活、沟通、好奇',
      '巨蟹座': '水象 - 滋养、情感、直觉',
      '狮子座': '火象 - 自信、创造、领导',
      '处女座': '土象 - 细致、服务、完美',
      '天秤座': '风象 - 和谐、审美、平衡',
      '天蝎座': '水象 - 深刻、转化、洞察',
      '射手座': '火象 - 探索、乐观、自由',
      '摩羯座': '土象 - 责任、成就、规划',
      '水瓶座': '风象 - 创新、独立、人道',
      '双鱼座': '水象 - 想象、共情、灵性'
    };

    const prompt = `你是一位融合西洋占星学与现代心理学的运势分析师，善于将星象能量转化为生活指引。

【星盘信息】
星座：${zodiac}（${zodiacElements[zodiac] || '独特能量'}）
解析月份：${month}

【运势解读要求】
1. 本月主题：用一句富有诗意的话概括本月核心能量（如"本月是整理与重启的时光..."）
2. 星象背景：简述影响本月的主要星象及其含义（2-3句话）
3. 爱情运势：针对${zodiac}的特质，给出感情方面的趋势与建议
4. 事业发展：分析工作/学业方面的机会与挑战
5. 财富状况：提示财务方面的注意事项与机会
6. 身心健康：关注身体与心理状态，给出养护建议
7. 关键日期：指出2-3个需要特别留意的日期及原因
8. 本月心法：用一句智慧话语作为本月的提醒

【风格要求】
- 专业但不宿命，重在启发而非预测
- 语气温暖积极，富有鼓励性
- 将占星学转化为自我成长的工具
- 总字数350-450字
- 中文输出，用【】标记各板块
- 纯文本格式，不用Markdown列表符号`;

    if (onStream) {
      return await aiService.generateContentStream(prompt, onStream);
    }
    const text = await aiService.generateContent(prompt);
    return text || "星象变幻莫测，保持内心平静是最好的应对。";
  } catch (error) {
    console.error("AI Horoscope Monthly Analysis Error:", error);
    return "暂时无法连接星空能量，请稍后重试。";
  }
};
