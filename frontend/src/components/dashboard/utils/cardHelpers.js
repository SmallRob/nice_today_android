import { ICON_MAP, CARD_DEFAULTS } from '../constants';

/**
 * 获取图标内容
 * 支持图标名称或直接使用 emoji
 * 
 * @param {string} icon - 图标名称或 emoji
 * @returns {string} 图标对应的 emoji
 */
export const getIconContent = (icon) => {
  if (!icon) {
    return ICON_MAP[CARD_DEFAULTS.DEFAULT_ICON];
  }

  // 如果传入的是 emoji,直接返回
  if (icon.length <= 2 && /[\u{1F300}-\u{1F9FF}]/u.test(icon)) {
    return icon;
  }

  // 否则从映射表中查找
  return ICON_MAP[icon] || ICON_MAP[CARD_DEFAULTS.DEFAULT_ICON];
};

/**
 * 验证颜色值的有效性
 * 
 * @param {string} color - 颜色值
 * @returns {boolean} 是否有效
 */
export const isValidColor = (color) => {
  if (!color || typeof color !== 'string') {
    return false;
  }

  // 检查 hex 颜色
  if (color.startsWith('#')) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  // 检查 rgb/rgba 颜色
  if (color.startsWith('rgb')) {
    return /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color);
  }

  // 检查颜色名称
  const colorNames = [
    'red', 'green', 'blue', 'yellow', 'purple', 'orange',
    'pink', 'cyan', 'magenta', 'black', 'white', 'gray'
  ];
  return colorNames.includes(color.toLowerCase());
};

/**
 * 获取有效的颜色值
 * 
 * @param {string} color - 输入的颜色值
 * @returns {string} 有效的颜色值
 */
export const getValidColor = (color) => {
  if (isValidColor(color)) {
    return color;
  }
  return CARD_DEFAULTS.DEFAULT_COLOR;
};
