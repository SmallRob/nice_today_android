// Material Design 3 间距系统
// 类型定义
export type SpacingScale = {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
};

// 间距令牌
export const spacing: SpacingScale = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '80px',
} as const;

// 间距数值（用于计算）
export const spacingValues = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
} as const;

// 间距工具函数
export const getSpacing = (key: keyof SpacingScale): string => spacing[key];

export const getSpacingValue = (key: keyof SpacingScale): number => spacingValues[key];
