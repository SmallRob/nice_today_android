// Material Design 3 圆角系统
// 类型定义
export type BorderRadiusScale = {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
};

// 圆角令牌
export const borderRadius: BorderRadiusScale = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '28px',
  full: '9999px',
} as const;

// 圆角数值（用于计算）
export const borderRadiusValues = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 28,
  full: 9999,
} as const;

// 圆角工具函数
export const getBorderRadius = (key: keyof BorderRadiusScale): string => borderRadius[key];

export const getBorderRadiusValue = (key: keyof BorderRadiusScale): number => borderRadiusValues[key];
