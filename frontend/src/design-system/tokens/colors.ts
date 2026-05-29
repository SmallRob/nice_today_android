// Material Design 3 颜色系统
// 类型定义
export type ColorToken = {
  main: string;
  on: string;
  container: string;
  onContainer: string;
};

export type SurfaceColorToken = {
  main: string;
  dim: string;
  bright: string;
  container: string;
  containerLow: string;
  containerHigh: string;
  containerHighest: string;
};

export type ColorScheme = {
  primary: ColorToken;
  secondary: ColorToken;
  tertiary: ColorToken;
  error: ColorToken;
  success: ColorToken;
  warning: ColorToken;
  info: ColorToken;
  surface: SurfaceColorToken;
  background: string;
  onBackground: string;
  outline: string;
  outlineVariant: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
  };
};

// 亮色模式颜色
export const lightColors: ColorScheme = {
  primary: {
    main: '#6750A4',
    on: '#FFFFFF',
    container: '#EADDFF',
    onContainer: '#21005D',
  },
  secondary: {
    main: '#625B71',
    on: '#FFFFFF',
    container: '#E8DEF8',
    onContainer: '#1D192B',
  },
  tertiary: {
    main: '#7D5260',
    on: '#FFFFFF',
    container: '#FFD8E4',
    onContainer: '#31111D',
  },
  error: {
    main: '#B3261E',
    on: '#FFFFFF',
    container: '#F9DEDC',
    onContainer: '#410E0B',
  },
  success: {
    main: '#386A20',
    on: '#FFFFFF',
    container: '#B8F397',
    onContainer: '#0F2007',
  },
  warning: {
    main: '#7C5800',
    on: '#FFFFFF',
    container: '#FFDEA6',
    onContainer: '#271900',
  },
  info: {
    main: '#0061A4',
    on: '#FFFFFF',
    container: '#D1E4FF',
    onContainer: '#001D36',
  },
  surface: {
    main: '#FEF7FF',
    dim: '#DED8E1',
    bright: '#FEF7FF',
    container: '#F3EDF7',
    containerLow: '#F7F2FA',
    containerHigh: '#ECE6F0',
    containerHighest: '#E6E0E9',
  },
  background: '#FEF7FF',
  onBackground: '#1D1B20',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  text: {
    primary: '#1D1B20',
    secondary: '#49454F',
    tertiary: '#79747E',
    disabled: '#1D1B201F',
  },
};

// 深色模式颜色
export const darkColors: ColorScheme = {
  primary: {
    main: '#D0BCFF',
    on: '#381E72',
    container: '#4F378B',
    onContainer: '#EADDFF',
  },
  secondary: {
    main: '#CCC2DC',
    on: '#332D41',
    container: '#4A4458',
    onContainer: '#E8DEF8',
  },
  tertiary: {
    main: '#EFB8C8',
    on: '#492532',
    container: '#633B48',
    onContainer: '#FFD8E4',
  },
  error: {
    main: '#F2B8B5',
    on: '#601410',
    container: '#8C1D18',
    onContainer: '#F9DEDC',
  },
  success: {
    main: '#9CD67D',
    on: '#0A3A07',
    container: '#1F5107',
    onContainer: '#B8F397',
  },
  warning: {
    main: '#F5C242',
    on: '#3F2E00',
    container: '#5A4300',
    onContainer: '#FFDEA6',
  },
  info: {
    main: '#9ECAFF',
    on: '#003258',
    container: '#00497D',
    onContainer: '#D1E4FF',
  },
  surface: {
    main: '#141218',
    dim: '#141218',
    bright: '#3B383E',
    container: '#211F26',
    containerLow: '#1D1B20',
    containerHigh: '#2B2930',
    containerHighest: '#36343B',
  },
  background: '#141218',
  onBackground: '#E6E0E9',
  outline: '#938F99',
  outlineVariant: '#49454F',
  text: {
    primary: '#E6E0E9',
    secondary: '#CAC4D0',
    tertiary: '#938F99',
    disabled: '#E6E0E91F',
  },
};

// 导出颜色映射
export const colors = {
  light: lightColors,
  dark: darkColors,
} as const;
