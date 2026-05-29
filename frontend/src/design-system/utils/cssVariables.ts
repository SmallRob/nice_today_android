// CSS变量生成工具
import { lightColors, darkColors, type ColorScheme } from '../tokens/colors';
import { typography, fontFamily } from '../tokens/typography';
import { spacing } from '../tokens/spacing';
import { elevation } from '../tokens/elevation';
import { borderRadius } from '../tokens/borderRadius';

// CSS变量映射类型
type CSSVariables = Record<string, string>;

// 生成颜色CSS变量
const generateColorVariables = (colors: ColorScheme, prefix = ''): CSSVariables => {
  const variables: CSSVariables = {};

  const processObject = (obj: Record<string, unknown>, currentPrefix: string) => {
    Object.entries(obj).forEach(([key, value]) => {
      const variableName = currentPrefix ? `${currentPrefix}-${key}` : key;

      if (typeof value === 'object' && value !== null) {
        processObject(value as Record<string, unknown>, variableName);
      } else {
        variables[`--color-${variableName}`] = String(value);
      }
    });
  };

  processObject(colors, prefix);
  return variables;
};

// 生成字体CSS变量
const generateTypographyVariables = (): CSSVariables => {
  const variables: CSSVariables = {};

  // 字体族
  variables['--font-sans'] = fontFamily.sans;
  variables['--font-mono'] = fontFamily.mono;

  // 字体样式
  Object.entries(typography).forEach(([key, style]) => {
    const prefix = `--typography-${key}`;
    variables[`${prefix}-font-size`] = style.fontSize;
    variables[`${prefix}-line-height`] = style.lineHeight;
    variables[`${prefix}-font-weight`] = style.fontWeight;
    if (style.letterSpacing) {
      variables[`${prefix}-letter-spacing`] = style.letterSpacing;
    }
  });

  return variables;
};

// 生成间距CSS变量
const generateSpacingVariables = (): CSSVariables => {
  const variables: CSSVariables = {};

  Object.entries(spacing).forEach(([key, value]) => {
    variables[`--spacing-${key}`] = value;
  });

  return variables;
};

// 生成阴影CSS变量
const generateElevationVariables = (): CSSVariables => {
  const variables: CSSVariables = {};

  Object.entries(elevation).forEach(([key, value]) => {
    variables[`--elevation-${key}`] = value;
  });

  return variables;
};

// 生成圆角CSS变量
const generateBorderRadiusVariables = (): CSSVariables => {
  const variables: CSSVariables = {};

  Object.entries(borderRadius).forEach(([key, value]) => {
    variables[`--border-radius-${key}`] = value;
  });

  return variables;
};

// 生成所有CSS变量
export const generateCSSVariables = (theme: 'light' | 'dark' = 'light'): CSSVariables => {
  const colors = theme === 'light' ? lightColors : darkColors;

  return {
    ...generateColorVariables(colors),
    ...generateTypographyVariables(),
    ...generateSpacingVariables(),
    ...generateElevationVariables(),
    ...generateBorderRadiusVariables(),
  };
};

// 应用CSS变量到DOM
export const applyCSSVariables = (
  variables: CSSVariables,
  element: HTMLElement = document.documentElement
): void => {
  Object.entries(variables).forEach(([name, value]) => {
    element.style.setProperty(name, value);
  });
};

// 移除CSS变量
export const removeCSSVariables = (
  variables: CSSVariables,
  element: HTMLElement = document.documentElement
): void => {
  Object.keys(variables).forEach((name) => {
    element.style.removeProperty(name);
  });
};

// 切换主题
export const applyTheme = (theme: 'light' | 'dark'): void => {
  const variables = generateCSSVariables(theme);
  applyCSSVariables(variables);

  // 更新class
  document.documentElement.classList.toggle('dark', theme === 'dark');

  // 更新meta标签
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      theme === 'dark' ? '#141218' : '#FEF7FF'
    );
  }
};
