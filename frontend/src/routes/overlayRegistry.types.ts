import { ComponentType, LazyExoticComponent } from 'react';

/**
 * Overlay 注册条目类型
 * 每个 overlay 对应一个全屏覆盖层页面
 */
export interface OverlayEntry {
  /** overlay 唯一标识，对应 activeOverlay 值 */
  id: string;
  /** lazy 加载的组件 */
  component: ComponentType<any> | LazyExoticComponent<any>;
  /** 是否隐藏底部导航，默认 true */
  hidesNav?: boolean;
  /** 动态 props 注入工厂函数 */
  props?: (state: any) => Record<string, unknown>;
}

/**
 * Overlay 分组类型
 * 每个业务域导出一个 OverlayGroup
 */
export interface OverlayGroup {
  /** 域名称 */
  domain: string;
  /** 该域下的 overlay 注册列表 */
  entries: OverlayEntry[];
}

/**
 * 聚合后的注册表类型
 */
export type OverlayRegistry = Map<string, OverlayEntry>;

/**
 * App 状态类型（用于 props 工厂函数）
 * 只包含 overlay 渲染所需的最小状态集
 */
export interface OverlayAppState {
  activeOverlay: string | null;
  overlayStack: string[];
  [key: string]: any;
}
