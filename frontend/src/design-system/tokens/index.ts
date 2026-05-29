// 设计令牌统一导出
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './elevation';
export * from './borderRadius';

// 导入用于生成CSS变量
import { lightColors, darkColors, type ColorScheme } from './colors';
import { typography, fontFamily, type TypographyScale } from './typography';
import { spacing, type SpacingScale } from './spacing';
import { elevation, type ElevationScale } from './elevation';
import { borderRadius, type BorderRadiusScale } from './borderRadius';

// 设计令牌完整类型
export type DesignTokens = {
  colors: {
    light: ColorScheme;
    dark: ColorScheme;
  };
  typography: TypographyScale;
  fontFamily: typeof fontFamily;
  spacing: SpacingScale;
  elevation: ElevationScale;
  borderRadius: BorderRadiusScale;
};

// 完整设计令牌
export const designTokens: DesignTokens = {
  colors: {
    light: lightColors,
    dark: darkColors,
  },
  typography,
  fontFamily,
  spacing,
  elevation,
  borderRadius,
} as const;
