import featureIcons from '../../config/featureIcons.json';

const ModernIcon = ({ name, size = 24, color = '#ffffff' }) => {
  // 从 JSON 配置中获取图标
  const iconConfig = featureIcons.icons[name];
  
  // 如果有配置，使用配置中的 SVG，否则使用默认图标
  const iconSvg = iconConfig ? (
    <div 
      dangerouslySetInnerHTML={{ __html: iconConfig.svg }}
      style={{ 
        width: size, 
        height: size, 
        color: color,
        display: 'inline-block' 
      }}
    />
  ) : null;

  // 默认图标
  const icons = {
    // 日常生活类图标
    daily: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
      </svg>
    ),
    
    // 运势分析类图标
    fortune: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    ),
    
    // 个人成长类图标
    growth: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    
    // 健康管理类图标
    health: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
    
    // 娱乐休闲类图标
    entertainment: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
      </svg>
    ),
    
    // 通用图标
    default: (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
        <circle cx="12" cy="12" r="10" />
      </svg>
    )
  };

  return (
    <div className="modern-icon">
      {iconSvg || icons[name] || icons.default}
    </div>
  );
};

export default ModernIcon;