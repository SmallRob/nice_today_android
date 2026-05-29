// 路由系统主入口
export { OverlayRouter, useOverlayRouter } from './OverlayRouter';
export { createOverlayRegistry, mergeOverlayGroups, validateRegistry, getRegistryStats } from './overlayRegistry';
export type { OverlayEntry, OverlayGroup, OverlayRegistry, OverlayAppState } from './overlayRegistry.types';

// 导出各领域路由分组
export { userCenterGroup } from './overlayGroups/user-center';
export { fortuneGroup } from './overlayGroups/fortune';
export { healthGroup } from './overlayGroups/health';
export { growthGroup } from './overlayGroups/growth';
export { entertainmentGroup } from './overlayGroups/entertainment';
export { toolsGroup } from './overlayGroups/tools';
