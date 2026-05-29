/**
 * 事件总线服务
 * 提供组件间的事件通信机制
 */

type EventHandler<T = any> = (event: T) => void;

class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  /**
   * 注册事件监听器
   */
  on<T>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // 返回取消注册函数
    return () => {
      this.off(event, handler);
    };
  }

  /**
   * 注册一次性事件监听器
   */
  once<T>(event: string, handler: EventHandler<T>): () => void {
    const wrappedHandler: EventHandler<T> = (data) => {
      handler(data);
      this.off(event, wrappedHandler);
    };
    return this.on(event, wrappedHandler);
  }

  /**
   * 移除事件监听器
   */
  off<T>(event: string, handler: EventHandler<T>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * 触发事件
   */
  emit<T>(event: string, data?: T): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[EventBus] Error in handler for event "${event}":`, error);
        }
      });
    }
  }

  /**
   * 移除所有监听器
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * 获取事件的监听器数量
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

// 创建全局事件总线实例
export const eventBus = new EventBus();
