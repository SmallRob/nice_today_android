import { useState, useCallback } from 'react';

/**
 * 自定义 Hook: 拖拽功能管理
 * 封装拖拽相关的状态和逻辑
 * 
 * @param {boolean} draggable - 是否启用拖拽
 * @param {string} id - 卡片唯一标识
 * @param {number} index - 卡片索引
 * @param {Function} onDragStart - 拖拽开始回调
 * @param {Function} onDragEnd - 拖拽结束回调
 * @returns {Object} 拖拽相关的处理函数和状态
 */
export const useDragAndDrop = ({
  draggable = false,
  id,
  index,
  onDragStart,
  onDragEnd
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((e) => {
    if (!draggable) return;

    try {
      setIsDragging(true);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);

      // 设置拖拽时的透明度
      setTimeout(() => {
        if (e.target) {
          e.target.style.opacity = '0.5';
        }
      }, 0);

      if (onDragStart) {
        onDragStart(e, index);
      }
    } catch (error) {
      console.error('拖拽开始失败:', error);
      setIsDragging(false);
    }
  }, [draggable, id, index, onDragStart]);

  const handleDragEnd = useCallback((e) => {
    if (!draggable) return;

    try {
      setIsDragging(false);
      if (e.target) {
        e.target.style.opacity = '1';
      }

      if (onDragEnd) {
        onDragEnd(e);
      }
    } catch (error) {
      console.error('拖拽结束失败:', error);
      setIsDragging(false);
    }
  }, [draggable, onDragEnd]);

  const handleDragOver = useCallback((e) => {
    if (!draggable || isDragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, [draggable, isDragging]);

  const handleDrop = useCallback((e, targetId) => {
    if (!draggable) return;
    e.preventDefault();

    try {
      const draggedId = e.dataTransfer.getData('text/plain');

      if (draggedId && targetId && draggedId !== targetId && onDragEnd) {
        // 将拖拽的卡片移动到目标位置
        onDragEnd({
          draggedId,
          targetId,
          type: 'drop'
        });
      }
    } catch (error) {
      console.error('拖拽放置失败:', error);
    }
  }, [draggable, onDragEnd]);

  return {
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };
};
