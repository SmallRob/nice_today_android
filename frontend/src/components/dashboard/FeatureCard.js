import { useNavigate } from 'react-router-dom';
import IconLibrary from '../IconLibrary';

/**
 * 功能卡片组件 - 首页功能入口
 * @param {Object} props
 * @param {string} props.title - 卡片标题
 * @param {string} props.description - 卡片描述
 * @param {string} props.icon - 图标名称
 * @param {string} props.color - 主题颜色
 * @param {string} props.route - 路由路径
 * @param {boolean} props.highlight - 是否高亮显示
 * @param {string} props.className - 自定义类名
 * @param {Function} props.onClick - 点击回调
 */
const FeatureCard = ({
  title,
  description,
  icon,
  color = '#3b82f6',
  route,
  highlight = false,
  className = '',
  onClick
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (route) {
      navigate(route);
    }
  };

  return (
    <div
      className={`feature-card ${highlight ? 'feature-card-highlight' : ''} ${className}`}
      onClick={handleClick}
      style={{
        '--card-color': color
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="feature-card-icon">
        <IconLibrary.Icon name={icon} size={32} />
      </div>
      <div className="feature-card-content">
        <h3 className="feature-card-title">{title}</h3>
        <p className="feature-card-description">{description}</p>
      </div>
      {highlight && (
        <div className="feature-card-badge">
          热门
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
