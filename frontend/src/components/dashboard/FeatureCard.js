import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 功能卡片基础组件
 * 提供统一的卡片样式和交互行为
 */
const FeatureCard = ({
  title,
  description,
  icon,
  color = '#6366f1',
  route,
  onClick,
  disabled = false,
  draggable = false,
  onDragStart,
  onDragEnd,
  index,
  id
}) => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = React.useState(false);

  const handleClick = () => {
    if (disabled) return;
    
    if (route) {
      navigate(route);
    } else if (onClick) {
      onClick();
    }
  };

  const handleDragStart = (e) => {
    if (!draggable) return;
    
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    
    // 设置拖拽时的透明度
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);

    if (onDragStart) {
      onDragStart(e, index);
    }
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    e.target.style.opacity = '1';
    
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  const handleDragOver = (e) => {
    if (!draggable || isDragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    if (!draggable) return;
    e.preventDefault();

    const draggedId = e.dataTransfer.getData('text/plain');
    const targetId = id;

    if (draggedId && targetId && draggedId !== targetId && onDragEnd) {
      // 将拖拽的卡片移动到目标位置
      onDragEnd({
        draggedId,
        targetId,
        type: 'drop'
      });
    }
  };

  // 获取图标内容
  const getIconContent = () => {
    const iconMap = {
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
      'cup':'🏆'
    };
    return iconMap[icon] || iconMap['🔮'] || '📱';
  };

  return (
    <div
      className={`feature-card ${
        disabled ? 'feature-card-loading' : ''
      } ${draggable ? 'feature-card-draggable' : ''} ${
        isDragging ? 'feature-card-dragging' : ''
      }`}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        '--card-color': color
      }}
    >
      <div className="feature-card-icon">
        {getIconContent()}
      </div>

      <div className="feature-card-content">
        <h3 className="feature-card-title">{title}</h3>
        <p className="feature-card-description">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;