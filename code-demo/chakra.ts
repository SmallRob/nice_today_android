import { aiService } from './ai';
import { CHAKRAS, ZERO_CHAKRA_SCORES, clampChakraScore } from './constants/chakra';
import type { ChakraId } from '../types';

export interface ChakraQuickCheckAnswers {
  moodId: string;
  moodLabel: string;
  bodyId: string;
  bodyLabel: string;
  goalId: string;
  goalLabel: string;
}

export interface ChakraCalibrationTimelineItem {
  title: string;
  durationSec: number;
  content: string;
  chakraIds?: ChakraId[];
}

export interface ChakraCalibrationPlan {
  estimatedMinutes: number;
  focusChakraIds: ChakraId[];
  focus: Array<{
    chakraId: ChakraId;
    chakraName: string;
    crystal: string;
    symbol: { name: string; text: string };
    reasons: string[];
    tuning: string[];
  }>;
  timeline: ChakraCalibrationTimelineItem[];
}

export interface ChakraCalibrationContext {
  chakraStatus?: Partial<Record<ChakraId, number>>;
  chakraOverallScore?: number;
  chakraLastUpdated?: string;
}

const extractJsonObject = (text: string) => {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1).trim();
  return null;
};

const asPlan = (obj: any): ChakraCalibrationPlan | null => {
  if (!obj || typeof obj !== 'object') return null;
  if (!Array.isArray(obj.focusChakraIds) || !Array.isArray(obj.focus) || !Array.isArray(obj.timeline)) return null;
  const focusChakraIds = obj.focusChakraIds.filter((id: any) => typeof id === 'string') as ChakraId[];
  if (!focusChakraIds.length) return null;
  const estimatedMinutes = typeof obj.estimatedMinutes === 'number' ? obj.estimatedMinutes : 4;
  return {
    estimatedMinutes,
    focusChakraIds,
    focus: obj.focus.map((f: any) => ({
      chakraId: f.chakraId as ChakraId,
      chakraName: String(f.chakraName ?? ''),
      crystal: String(f.crystal ?? ''),
      symbol: { name: String(f.symbol?.name ?? ''), text: String(f.symbol?.text ?? '') },
      reasons: Array.isArray(f.reasons) ? f.reasons.map((x: any) => String(x)) : [],
      tuning: Array.isArray(f.tuning) ? f.tuning.map((x: any) => String(x)) : []
    })),
    timeline: obj.timeline.map((t: any) => ({
      title: String(t.title ?? ''),
      durationSec: typeof t.durationSec === 'number' ? t.durationSec : 0,
      content: String(t.content ?? ''),
      chakraIds: Array.isArray(t.chakraIds) ? (t.chakraIds.filter((x: any) => typeof x === 'string') as ChakraId[]) : undefined
    }))
  };
};

const getById = (id: ChakraId) => CHAKRAS.find((c) => c.id === id) || CHAKRAS[0];

const scoreWeightsFromAnswers = (a: ChakraQuickCheckAnswers) => {
  const w: Record<ChakraId, number> = { ...ZERO_CHAKRA_SCORES };
  const add = (id: ChakraId, n: number) => {
    w[id] = (w[id] || 0) + n;
  };

  const moodMap: Record<string, Array<[ChakraId, number]>> = {
    anxious: [['root', 3], ['throat', 1], ['thirdEye', 1]],
    insecure: [['root', 4]],
    angry: [['solar', 4], ['throat', 1]],
    sad: [['heart', 4], ['root', 1]],
    numb: [['sacral', 4], ['heart', 1]],
    stressed: [['solar', 3], ['throat', 2]],
    calm: [['heart', 2], ['crown', 2]]
  };
  const bodyMap: Record<string, Array<[ChakraId, number]>> = {
    tight_chest: [['heart', 4]],
    sore_throat: [['throat', 4]],
    stomach: [['solar', 4]],
    lower_back: [['root', 4]],
    lower_abdomen: [['sacral', 4]],
    headache: [['thirdEye', 4]],
    insomnia: [['crown', 4], ['thirdEye', 1]],
    fatigue: [['root', 2], ['solar', 2]]
  };
  const goalMap: Record<string, Array<[ChakraId, number]>> = {
    security: [['root', 5]],
    intimacy: [['sacral', 5]],
    confidence: [['solar', 5]],
    love: [['heart', 5]],
    expression: [['throat', 5]],
    intuition: [['thirdEye', 5]],
    calmness: [['crown', 5]]
  };

  (moodMap[a.moodId] || []).forEach(([id, n]) => add(id, n));
  (bodyMap[a.bodyId] || []).forEach(([id, n]) => add(id, n));
  (goalMap[a.goalId] || []).forEach(([id, n]) => add(id, n));

  return w;
};

export const suggestFocusChakras = (answers: ChakraQuickCheckAnswers, ctx?: ChakraCalibrationContext): ChakraId[] => {
  const weights = scoreWeightsFromAnswers(answers);
  const sortedByAnswers = (Object.entries(weights) as Array<[ChakraId, number]>).sort((a, b) => b[1] - a[1]);
  const topByAnswers = sortedByAnswers.filter(([, n]) => n > 0).slice(0, 3).map(([id]) => id);

  const status = ctx?.chakraStatus;
  const hasStatus = Boolean(status && Object.keys(status).length);
  if (!hasStatus) return topByAnswers.length ? topByAnswers.slice(0, 2) : (['heart'] as ChakraId[]);

  const scoredByImbalance = CHAKRAS
    .map((c) => {
      const v = typeof status?.[c.id] === 'number' ? (status?.[c.id] as number) : 0;
      const clamped = clampChakraScore(v);
      return { id: c.id, severity: Math.abs(clamped), clamped };
    })
    .sort((a, b) => b.severity - a.severity);

  const topByImbalance = scoredByImbalance.filter(x => x.severity > 10).slice(0, 3).map(x => x.id);
  const intersect = topByAnswers.filter((id) => topByImbalance.includes(id));
  const merged = [...new Set<ChakraId>([...intersect, ...topByImbalance, ...topByAnswers])].slice(0, 2);
  return merged.length ? merged : (['heart'] as ChakraId[]);
};

export const generateFallbackCalibrationPlan = (answers: ChakraQuickCheckAnswers, ctx?: ChakraCalibrationContext): ChakraCalibrationPlan => {
  const focusChakraIds = suggestFocusChakras(answers, ctx);
  const focusDefs = focusChakraIds.map((id) => getById(id));

  const focus = focusDefs.map((c) => ({
    chakraId: c.id,
    chakraName: c.name,
    crystal: c.crystal,
    symbol: c.symbol,
    reasons: [
      `情绪：${answers.moodLabel}`,
      `体感：${answers.bodyLabel}`,
      `诉求：${answers.goalLabel}`
    ],
    tuning: c.tuning
  }));

  const timeline: ChakraCalibrationTimelineItem[] = [
    {
      title: '准备与定位',
      durationSec: 30,
      content: `把「${focusDefs.map((x) => x.crystal).join('、')}」放在手心或靠近身体，轻触符号「${focusDefs.map((x) => `${x.symbol.text} ${x.symbol.name}`).join(' / ')}」，做 3 次深呼吸。`,
      chakraIds: focusChakraIds
    },
    {
      title: '身体调频',
      durationSec: 90,
      content: focusDefs.map((x) => `• ${x.name}：${x.tuning[0]}（约 45 秒）`).join('\n'),
      chakraIds: focusChakraIds
    },
    {
      title: '情绪释放',
      durationSec: 60,
      content: focusDefs.map((x) => `• ${x.name}：${x.tuning[1]}（约 30 秒）`).join('\n'),
      chakraIds: focusChakraIds
    },
    {
      title: '意念锚定',
      durationSec: 60,
      content: focusDefs.map((x) => `• ${x.name}：${x.tuning[2]}（约 30 秒）`).join('\n'),
      chakraIds: focusChakraIds
    },
    {
      title: '收束与复位',
      durationSec: 30,
      content: '闭眼轻呼吸，想象能量回到胸口，向自己说一句“我已经在路上”。',
      chakraIds: focusChakraIds
    }
  ];

  return {
    estimatedMinutes: 4,
    focusChakraIds,
    focus,
    timeline
  };
};

export const generateChakraCalibrationPlan = async (answers: ChakraQuickCheckAnswers, useAI: boolean, ctx?: ChakraCalibrationContext) => {
  if (!useAI) return generateFallbackCalibrationPlan(answers, ctx);

  const chakraFacts = CHAKRAS.map((c) => ({
    id: c.id,
    name: c.name,
    crystal: c.crystal,
    symbol: c.symbol,
    tuning: c.tuning
  }));

  const chakraStatus = ctx?.chakraStatus;
  const hasStatus = Boolean(chakraStatus && Object.keys(chakraStatus).length);
  const statusSummary = hasStatus
    ? CHAKRAS.map((c) => {
        const v = typeof chakraStatus?.[c.id] === 'number' ? (chakraStatus?.[c.id] as number) : 0;
        const clamped = clampChakraScore(v);
        return { id: c.id, name: c.name, score: clamped, severity: Math.abs(clamped) };
      }).sort((a, b) => b.severity - a.severity)
    : [];

  const recommendedFocus = hasStatus ? statusSummary.slice(0, 3).map((x) => x.id).join('|') : suggestFocusChakras(answers, ctx).join('|');

  const prompt = [
    '你是中文“心灵疗愈与脉轮校准助手”。请结合用户当下状态与脉轮分数，输出一个 3-5 分钟的一站式疗愈校准方案（温柔、具体、可执行）。',
    '要求：',
    '1) 只输出 JSON，不要输出其它文字。',
    '2) focusChakraIds 取值必须来自：root|sacral|solar|heart|throat|thirdEye|crown',
    '3) timeline 总时长 180-300 秒。',
    '4) 方案需要联动：失衡脉轮 + 对应水晶 + 专属符号 + 易操作调频方法。',
    '5) 避免神化、避免医疗承诺；使用“自我觉察/情绪照护/身心调节”的措辞；不用表情符号。',
    '6) reasons 要写清楚“为什么选这个脉轮”（结合情绪/体感/诉求 + 脉轮分数的失衡方向）。',
    '7) tuning 写成短句动作卡（每条 ≤14 字，3-5 条）。',
    '8) timeline.content 用换行分条列出步骤（每条 ≤18 字），包含呼吸、身体、意念锚定与收束。',
    '',
    `用户输入：情绪=${answers.moodLabel}；体感=${answers.bodyLabel}；诉求=${answers.goalLabel}`,
    hasStatus
      ? `当前脉轮分数（-100~100，越接近0越平衡；负值偏低/阻滞，正值偏亢/过载）：${JSON.stringify(statusSummary)}`
      : '当前无脉轮分数，请主要依据用户输入推断失衡点。',
    ctx?.chakraOverallScore !== undefined ? `总体指数（0~100）：${ctx.chakraOverallScore}` : '',
    ctx?.chakraLastUpdated ? `数据更新时间：${ctx.chakraLastUpdated}` : '',
    `建议优先聚焦脉轮（仅供参考）：${recommendedFocus}`,
    `可用脉轮库：${JSON.stringify(chakraFacts)}`,
    '',
    'JSON 结构：',
    JSON.stringify({
      estimatedMinutes: 4,
      focusChakraIds: ['root'],
      focus: [
        {
          chakraId: 'root',
          chakraName: '海底轮',
          crystal: '黑曜石',
          symbol: { name: '安卡', text: '☥' },
          reasons: ['...'],
          tuning: ['...']
        }
      ],
      timeline: [
        { title: '准备', durationSec: 30, content: '...', chakraIds: ['root'] }
      ]
    })
  ].join('\n');

  try {
    const raw = await aiService.generateContent(prompt);
    const jsonText = extractJsonObject(raw || '');
    if (!jsonText) return generateFallbackCalibrationPlan(answers, ctx);
    const parsed = JSON.parse(jsonText);
    const plan = asPlan(parsed);
    if (!plan) return generateFallbackCalibrationPlan(answers, ctx);
    const normalized = {
      ...plan,
      focusChakraIds: plan.focusChakraIds.filter((id) => CHAKRAS.some((c) => c.id === id)).slice(0, 3),
      focus: plan.focus
        .filter((f) => CHAKRAS.some((c) => c.id === f.chakraId))
        .map((f) => {
          const base = getById(f.chakraId);
          return {
            chakraId: base.id,
            chakraName: base.name,
            crystal: f.crystal || base.crystal,
            symbol: f.symbol?.text ? f.symbol : base.symbol,
            reasons: (f.reasons?.length ? f.reasons : [`情绪：${answers.moodLabel}`, `体感：${answers.bodyLabel}`, `诉求：${answers.goalLabel}`]).slice(0, 5),
            tuning: (f.tuning?.length ? f.tuning : base.tuning).slice(0, 5)
          };
        }),
      timeline: plan.timeline
        .filter((t) => t.title && t.durationSec > 0 && t.content)
        .map((t) => ({
          title: t.title,
          durationSec: Math.max(10, Math.round(t.durationSec)),
          content: t.content,
          chakraIds: t.chakraIds?.filter((id) => CHAKRAS.some((c) => c.id === id)).slice(0, 3)
        }))
    } satisfies ChakraCalibrationPlan;

    const total = normalized.timeline.reduce((sum, i) => sum + i.durationSec, 0);
    if (total < 160 || total > 330) return generateFallbackCalibrationPlan(answers, ctx);
    const estimatedMinutes = Math.max(3, Math.min(5, Math.round(total / 60)));
    return { ...normalized, estimatedMinutes };
  } catch {
    return generateFallbackCalibrationPlan(answers, ctx);
  }
};

export const computeOverallChakraScore = (scores: Record<ChakraId, number>) => {
  const clamp0to100 = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  const values0to100 = CHAKRAS.map((c) => (clampChakraScore(scores[c.id] ?? 0) + 100) / 2);
  const avg = values0to100.reduce((a, b) => a + b, 0) / values0to100.length;
  return clamp0to100(avg);
};
