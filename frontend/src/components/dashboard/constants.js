/**
 * 功能卡片相关常量
 * 集中管理图标映射、默认配置等
 */

/**
 * 图标映射表
 * 支持图标名称到 emoji 的映射
 */
export const ICON_MAP = {
  'brain': '🧠',
  'star': '⭐',
  'star-outline': '✴️',
  'weather-sunny': '☀️',
  'calendar': '📅',
  'chart-line': '📊',
  'lightning-bolt': '⚡',
  'heart': '❤️',
  'grid': '🌟',
  'sparkles': '✨',
  'cards': '🎴',
  'dragon': '🐉',
  'book': '📖',
  'check-circle': '✅',
  'money': '💰',
  'divination': '🔮',
  'shuffle': '🔀',
  'cup': '🏆',
  'default': '🔮'
};

/**
 * 卡片默认配置
 */
export const CARD_DEFAULTS = {
  DEFAULT_COLOR: '#6366f1',
  DEFAULT_ICON: 'default',
  DRAG_OPACITY: '0.5',
  DRAG_DELAY: 0
};

/**
 * 拖拽相关常量
 */
export const DRAG_CONFIG = {
  EFFECT: 'move',
  DATA_TYPE: 'text/plain'
};
