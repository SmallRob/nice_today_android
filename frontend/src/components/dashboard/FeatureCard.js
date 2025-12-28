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
  highlight = false,
  disabled = false
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    
    if (route) {
      navigate(route);
    } else if (onClick) {
      onClick();
    }
  };

  // 获取图标内容
  const getIconContent = () => {
    const iconMap = {
      'brain': '🧠',
      'star': '⭐',
      'weather-sunny': '☀️',
      'calendar': '📅',
      'chart-line': '📊',
      'lightning-bolt': '⚡',
      'heart': '❤️'
    };
    return iconMap[icon] || '📱';
  };

  return (
    <div
      className={`feature-card ${highlight ? 'feature-card-highlight' : ''} ${
        disabled ? 'feature-card-loading' : ''
      }`}
      onClick={handleClick}
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

      {highlight && (
        <div className="feature-card-badge">热门</div>
      )}
    </div>
  );
};

export default FeatureCard;