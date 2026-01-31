import type { ElementType } from './fiveElements';

export interface DailyYiJi {
  dateKey: string;
  yi: string[];
  ji: string[];
  meta: {
    dominantElement: ElementType;
    dayStemElement: ElementType;
    signature: string;
    source: 'default' | 'computed' | 'cache';
  };
}

export interface DailyYiJiCompact {
  yi: string;
  ji: string;
}

const STEM_TO_ELEMENT: Record<string, ElementType> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

const BRANCH_TO_ELEMENT: Record<string, ElementType> = {
  '子': '水', '亥': '水',
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '辰': '土', '戌': '土', '丑': '土', '未': '土'
};

const ELEMENT_YIJI: Record<ElementType, { yi: string[]; ji: string[] }> = {
  '木': { yi: ['规划学习', '整理归档', '轻度拉伸'], ji: ['冲动消费', '口舌争执', '熬夜'] },
  '火': { yi: ['表达沟通', '推进执行', '适度出汗'], ji: ['情绪上头决策', '重口辛辣酒精', '熬夜'] },
  '土': { yi: ['复盘理财', '清淡热食', '冥想放松'], ji: ['久坐不动', '暴饮暴食', '拖延'] },
  '金': { yi: ['断舍离', '做决定', '规律作息'], ji: ['过度苛责', '硬碰硬', '冷饮生冷'] },
  '水': { yi: ['深度思考', '写作创作', '补水早睡'], ji: ['过度焦虑', '无谓社交', '熬夜'] }
};

const COMPACT_MAP: Record<string, string> = {
  '规划学习': '学习',
  '整理归档': '整理',
  '轻度拉伸': '拉伸',
  '表达沟通': '交际',
  '推进执行': '执行',
  '适度出汗': '运动',
  '复盘理财': '理财',
  '清淡热食': '饮食',
  '冥想放松': '放松',
  '断舍离': '整理',
  '做决定': '决策',
  '规律作息': '作息',
  '深度思考': '思考',
  '写作创作': '创作',
  '补水早睡': '早睡',
  '冲动消费': '消费',
  '口舌争执': '争执',
  '情绪上头决策': '决策',
  '重口辛辣酒精': '辛辣',
  '久坐不动': '久坐',
  '暴饮暴食': '暴食',
  '拖延': '拖延',
  '过度苛责': '苛责',
  '硬碰硬': '冲突',
  '冷饮生冷': '生冷',
  '过度焦虑': '焦虑',
  '无谓社交': '社交',
  '熬夜': '熬夜'
};

function toCompactLabel(label: string | null | undefined) {
  const raw = (label || '').trim();
  if (!raw) return '';
  const mapped = COMPACT_MAP[raw];
  if (mapped) return mapped;
  if (raw.length <= 2) return raw;
  return raw.slice(0, 2);
}

export function getCompactDailyYiJi(value: DailyYiJi): DailyYiJiCompact {
  const yi = toCompactLabel(value?.yi?.[0]) || '交际';
  const ji = toCompactLabel(value?.ji?.[0]) || '决策';
  return { yi, ji };
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function getLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function elementFromPillar(pillar: string) {
  const stem = pillar?.charAt(0);
  const branch = pillar?.charAt(1);
  const stemElement = stem ? STEM_TO_ELEMENT[stem] : undefined;
  const branchElement = branch ? BRANCH_TO_ELEMENT[branch] : undefined;
  return { stemElement, branchElement };
}

function pickDominantElement(pillars: string[], fallback: ElementType) {
  const counts: Record<ElementType, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  for (const p of pillars) {
    const { stemElement, branchElement } = elementFromPillar(p);
    if (stemElement) counts[stemElement] += 2;
    if (branchElement) counts[branchElement] += 1;
  }
  const entries = Object.entries(counts) as Array<[ElementType, number]>;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]?.[1] ? entries[0][0] : fallback;
}

export function getDefaultDailyYiJi(params: { pillars: string[]; dayPillar: string; signature: string; dateKey: string }): DailyYiJi {
  const dayStem = params.dayPillar?.charAt(0);
  const dayStemElement = (dayStem && STEM_TO_ELEMENT[dayStem]) || '土';
  const dominantElement = pickDominantElement(params.pillars, dayStemElement);
  const base = ELEMENT_YIJI[dominantElement];
  return {
    dateKey: params.dateKey,
    yi: base.yi.slice(0, 2),
    ji: base.ji.slice(0, 2),
    meta: { dominantElement, dayStemElement, signature: params.signature, source: 'default' }
  };
}

export interface DailyYiJiParams {
  pillars: string[];
  dayPillar: string;
  signature: string;
  dateKey: string;
  physioMetrics?: {
    sleepHours?: number;
    steps?: number;
    heartRate?: number;
  };
}

// Helper for seeded shuffle
function seededShuffle<T>(array: T[], seed: string): T[] {
  let currentSeed = 0;
  for (let i = 0; i < seed.length; i++) {
    currentSeed = ((currentSeed << 5) - currentSeed) + seed.charCodeAt(i);
    currentSeed |= 0;
  }
  
  const rng = () => {
    const x = Math.sin(currentSeed++) * 10000;
    return x - Math.floor(x);
  };

  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export async function computeDailyYiJiAsync(params: DailyYiJiParams): Promise<DailyYiJi> {
  const defaultRes = getDefaultDailyYiJi(params);

  await new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), 260);
  });

  const dayBranch = params.dayPillar?.charAt(1);
  const dayBranchElement = (dayBranch && BRANCH_TO_ELEMENT[dayBranch]) || defaultRes.meta.dayStemElement;
  const dominantElement = pickDominantElement(params.pillars, defaultRes.meta.dayStemElement);
  
  // Base pool from dominant element
  const base = ELEMENT_YIJI[dominantElement];
  
  // Secondary pool from Day Branch (Grounding)
  const secondary = ELEMENT_YIJI[dayBranchElement] || base;

  // Combine pools
  let poolYi = [...base.yi, ...secondary.yi];
  let poolJi = [...base.ji, ...secondary.ji];

  // Physiological adjustments
  if (params.physioMetrics) {
    const { sleepHours, steps } = params.physioMetrics;
    if (sleepHours !== undefined && sleepHours < 6) {
       poolYi.push('补觉', '午休', '减少用眼');
       poolJi.push('高强度运动', '长途驾驶', '复杂计算');
    }
    if (steps !== undefined && steps < 3000) {
       poolYi.push('散步', '拉伸');
       poolJi.push('久坐');
    }
  }

  // Shuffle with daily seed
  const seed = `${params.dateKey}-${params.signature}`;
  const shuffledYi = seededShuffle(Array.from(new Set(poolYi)), seed);
  const shuffledJi = seededShuffle(Array.from(new Set(poolJi)), seed);

  return {
    dateKey: params.dateKey,
    yi: shuffledYi.slice(0, 4),
    ji: shuffledJi.slice(0, 4),
    meta: { ...defaultRes.meta, dominantElement, source: 'computed' }
  };
}

const CACHE_KEY_PREFIX = 'dailyYiji_v2:';

export function getCachedDailyYiJi(dateKey: string): DailyYiJi | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${dateKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DailyYiJi;
    if (!parsed || parsed.dateKey !== dateKey || !Array.isArray(parsed.yi) || !Array.isArray(parsed.ji) || !parsed.meta) return null;
    return { ...parsed, meta: { ...parsed.meta, source: 'cache' } };
  } catch {
    return null;
  }
}

export function setCachedDailyYiJi(value: DailyYiJi) {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${value.dateKey}`, JSON.stringify(value));
  } catch {}
}
