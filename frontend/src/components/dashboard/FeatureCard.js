import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { getIconContent, getValidColor } from './utils/cardHelpers';
import { CARD_DEFAULTS } from './constants';

/**
 * 功能卡片基础组件
 * 提供统一的卡片样式和交互行为
 *
 * @component
 * @example
 * ```jsx
 * <FeatureCard
 *   title="每日运势"
 *   description="查看今日运势详情"
 *   icon="star"
 *   color="#6366f1"
 *   route="/daily-fortune"
 * />
 * ```
 */
const FeatureCard = ({
  title,
  description,
  icon,
  color,
  route,
  onClick,
  disabled,
  draggable,
  onDragStart,
  onDragEnd,
  index,
  id
}) => {
  const navigate = useNavigate();

  // 验证和规范化 props
  const validColor = useMemo(() => getValidColor(color), [color]);

  // 使用拖拽 hook
  const { isDragging, handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useDragAndDrop({
    draggable: Boolean(draggable),
    id: id || String(index),
    index,
    onDragStart,
    onDragEnd
  });

  // 点击处理
  const handleClick = useCallback(() => {
    if (disabled || isDragging) return;

    if (route) {
      navigate(route);
    } else if (onClick) {
      onClick();
    }
  }, [disabled, isDragging, route, navigate, onClick]);

  // Drop 处理
  const handleCardDrop = useCallback((e) => {
    handleDrop(e, id || String(index));
  }, [handleDrop, id, index]);

  // 获取图标内容 (使用 memo 缓存)
  const iconContent = useMemo(() => getIconContent(icon), [icon]);

  // 构建 className
  const cardClassName = useMemo(() => {
    const classes = ['feature-card'];

    if (disabled) {
      classes.push('feature-card-loading');
    }

    if (draggable) {
      classes.push('feature-card-draggable');
    }

    if (isDragging) {
      classes.push('feature-card-dragging');
    }

    return classes.join(' ');
  }, [disabled, draggable, isDragging]);

  return (
    <div
      className={cardClassName}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleCardDrop}
      style={{
        '--card-color': validColor
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={title}
    >
      <div className="feature-card-icon">
        {iconContent}
      </div>

      <div className="feature-card-content">
        <h3 className="feature-card-title">{title}</h3>
        <p className="feature-card-description">{description}</p>
      </div>
    </div>
  );
};

// PropTypes 类型定义
FeatureCard.propTypes = {
  /** 卡片标题 */
  title: PropTypes.string.isRequired,
  /** 卡片描述 */
  description: PropTypes.string.isRequired,
  /** 图标名称或 emoji */
  icon: PropTypes.string,
  /** 卡片主题色 */
  color: PropTypes.string,
  /** 路由路径 */
  route: PropTypes.string,
  /** 点击回调函数 */
  onClick: PropTypes.func,
  /** 是否禁用 */
  disabled: PropTypes.bool,
  /** 是否可拖拽 */
  draggable: PropTypes.bool,
  /** 拖拽开始回调 */
  onDragStart: PropTypes.func,
  /** 拖拽结束回调 */
  onDragEnd: PropTypes.func,
  /** 卡片索引 */
  index: PropTypes.number,
  /** 卡片唯一标识 */
  id: PropTypes.string
};

// 默认 props
FeatureCard.defaultProps = {
  icon: CARD_DEFAULTS.DEFAULT_ICON,
  color: CARD_DEFAULTS.DEFAULT_COLOR,
  route: null,
  onClick: null,
  disabled: false,
  draggable: false,
  onDragStart: null,
  onDragEnd: null,
  index: 0,
  id: null
};

// 性能优化:使用 React.memo 避免不必要的重新渲染
export default React.memo(FeatureCard);