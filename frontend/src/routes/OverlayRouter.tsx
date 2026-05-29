import React, { Suspense, useCallback, useMemo } from 'react';
import { createOverlayRegistry, validateRegistry, getRegistryStats } from './overlayRegistry';
import type { OverlayRegistry } from './overlayRegistry.types';

// 加载状态组件
const DefaultLoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// OverlayRouter Props
type OverlayRouterProps = {
  activeOverlay: string | null;
  overlayParams?: Record<string, any>;
  fallback?: React.ReactNode;
  onBack?: () => void;
};

/**
 * OverlayRouter 组件
 * 根据 activeOverlay 渲染对应的 overlay 页面
 */
export const OverlayRouter: React.FC<OverlayRouterProps> = ({
  activeOverlay,
  overlayParams,
  fallback = <DefaultLoadingFallback />,
  onBack,
}) => {
  // 创建注册表
  const registry = useMemo(() => createOverlayRegistry(), []);

  // 验证注册表
  const validation = useMemo(() => validateRegistry(registry), [registry]);
  if (!validation.valid) {
    console.error('[OverlayRouter] Registry validation failed:', validation.errors);
  }

  // 获取统计信息（开发环境）
  if (process.env.NODE_ENV === 'development') {
    const stats = getRegistryStats(registry);
    console.debug('[OverlayRouter] Registry stats:', stats);
  }

  // 获取当前 overlay 条目
  const entry = activeOverlay ? registry.get(activeOverlay) : null;

  if (!entry) {
    return null;
  }

  const Component = entry.component as React.ComponentType<any>;

  return (
    <div
      className={`fixed inset-0 z-40 ${
        entry.hidesNav !== false ? 'pb-0' : 'pb-16'
      }`}
    >
      <Suspense fallback={fallback}>
        <Component {...overlayParams} onBack={onBack} />
      </Suspense>
    </div>
  );
};

/**
 * useOverlayRouter Hook
 * 提供 overlay 路由操作方法
 */
export const useOverlayRouter = () => {
  const registry = useMemo(() => createOverlayRegistry(), []);

  const getOverlay = useCallback(
    (id: string) => registry.get(id),
    [registry]
  );

  const hasOverlay = useCallback(
    (id: string) => registry.has(id),
    [registry]
  );

  const getAllOverlays = useCallback(
    () => Array.from(registry.entries()),
    [registry]
  );

  return {
    registry,
    getOverlay,
    hasOverlay,
    getAllOverlays,
  };
};
