// Material Design 3 字体系统
// 类型定义
export type TypographyStyle = {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  letterSpacing?: string;
};

export type TypographyScale = {
  displayLarge: TypographyStyle;
  displayMedium: TypographyStyle;
  displaySmall: TypographyStyle;
  headlineLarge: TypographyStyle;
  headlineMedium: TypographyStyle;
  headlineSmall: TypographyStyle;
  titleLarge: TypographyStyle;
  titleMedium: TypographyStyle;
  titleSmall: TypographyStyle;
  bodyLarge: TypographyStyle;
  bodyMedium: TypographyStyle;
  bodySmall: TypographyStyle;
  labelLarge: TypographyStyle;
  labelMedium: TypographyStyle;
  labelSmall: TypographyStyle;
};

// 字体族
export const fontFamily = {
  sans: ['Inter', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'].join(', '),
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'].join(', '),
} as const;

// 字体大小
export const typography: TypographyScale = {
  // Display - 用于大标题
  displayLarge: {
    fontSize: '57px',
    lineHeight: '64px',
    fontWeight: '400',
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontSize: '45px',
    lineHeight: '52px',
    fontWeight: '400',
  },
  displaySmall: {
    fontSize: '36px',
    lineHeight: '44px',
    fontWeight: '400',
  },
  // Headline - 用于区域标题
  headlineLarge: {
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: '400',
  },
  headlineMedium: {
    fontSize: '28px',
    lineHeight: '36px',
    fontWeight: '400',
  },
  headlineSmall: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: '400',
  },
  // Title - 用于卡片标题
  titleLarge: {
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: '400',
  },
  titleMedium: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: '500',
    letterSpacing: '0.15px',
  },
  titleSmall: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '500',
    letterSpacing: '0.1px',
  },
  // Body - 用于正文内容
  bodyLarge: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: '400',
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '400',
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: '400',
    letterSpacing: '0.4px',
  },
  // Label - 用于标签和小文本
  labelLarge: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '500',
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: '500',
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: '500',
    letterSpacing: '0.5px',
  },
} as const;

// 字体样式工具函数
export const getTypographyStyle = (variant: keyof TypographyScale): React.CSSProperties => {
  const style = typography[variant];
  return {
    fontFamily: fontFamily.sans,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
  };
};
