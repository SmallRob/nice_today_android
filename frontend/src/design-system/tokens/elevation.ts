// Material Design 3 阴影系统
// 类型定义
export type ElevationScale = {
  level0: string;
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  level5: string;
};

// 阴影令牌
export const elevation: ElevationScale = {
  level0: 'none',
  level1: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  level2: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  level3: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
  level4: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
  level5: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
} as const;

// 阴影工具函数
export const getElevation = (level: keyof ElevationScale): string => elevation[level];
