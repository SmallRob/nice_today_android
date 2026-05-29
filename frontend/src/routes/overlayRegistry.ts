import { OverlayRegistry, OverlayGroup, OverlayEntry } from './overlayRegistry.types';
import { fortuneGroup } from './overlayGroups/fortune';
import { healthGroup } from './overlayGroups/health';
import { growthGroup } from './overlayGroups/growth';
import { toolsGroup } from './overlayGroups/tools';
import { userCenterGroup } from './overlayGroups/user-center';
import { entertainmentGroup } from './overlayGroups/entertainment';

/**
 * 合并多个 OverlayGroup 为一个注册表
 * 如果有重复的 id，后面的会覆盖前面的（并输出警告）
 */
export function mergeOverlayGroups(groups: OverlayGroup[]): OverlayRegistry {
  const registry: OverlayRegistry = new Map();
  const duplicates: string[] = [];

  for (const group of groups) {
    for (const entry of group.entries) {
      if (registry.has(entry.id)) {
        duplicates.push(`[${group.domain}] ${entry.id}`);
      }
      registry.set(entry.id, entry);
    }
  }

  if (duplicates.length > 0) {
    console.warn('[OverlayRegistry] Duplicate overlay IDs detected:', duplicates);
  }

  return registry;
}

/**
 * 验证注册表的完整性
 * 检查是否有重复 ID、空 ID 等问题
 */
export function validateRegistry(registry: OverlayRegistry): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  registry.forEach((entry, id) => {
    if (!id || id.trim() === '') {
      errors.push('Empty overlay ID found');
    }
    if (!entry.component) {
      errors.push(`Missing component for overlay: ${id}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 获取注册表统计信息
 */
export function getRegistryStats(registry: OverlayRegistry): {
  totalOverlays: number;
  overlayIds: string[];
} {
  return {
    totalOverlays: registry.size,
    overlayIds: Array.from(registry.keys())
  };
}

/**
 * 创建完整注册表（包含所有域）
 */
export function createOverlayRegistry(): OverlayRegistry {
  return mergeOverlayGroups([
    userCenterGroup,
    fortuneGroup,
    healthGroup,
    growthGroup,
    entertainmentGroup,
    toolsGroup,
  ]);
}
