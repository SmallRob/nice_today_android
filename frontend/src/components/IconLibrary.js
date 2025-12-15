import React from 'react';
import { Icon } from '@iconify/react';

// Iconify图标库配置
const iconifyIcons = {
  // 生物节律相关图标
  biorhythm: 'mdi:chart-line',
  calendar: 'mdi:calendar',
  heart: 'mdi:heart-pulse',
  brain: 'mdi:brain',
  body: 'mdi:human-handsup',
  chart: 'mdi:chart-bar',
  
  // 玛雅历法相关图标
  maya: 'mdi:pyramid',
  sun: 'mdi:weather-sunny',
  moon: 'mdi:weather-night',
  star: 'mdi:star',
  crystal: 'mdi:crystal-ball',
  
  // 穿搭建议相关图标
  dress: 'mdi:tshirt-crew',
  color: 'mdi:palette',
  food: 'mdi:food-apple',
  drink: 'mdi:cup-water',
  
  // 通用功能图标
  home: 'mdi:home',
  settings: 'mdi:cog',
  user: 'mdi:account',
  date: 'mdi:calendar-today',
  time: 'mdi:clock',
  
  // 操作图标
  add: 'mdi:plus',
  edit: 'mdi:pencil',
  delete: 'mdi:delete',
  save: 'mdi:content-save',
  download: 'mdi:download',
  upload: 'mdi:upload',
  
  // 导航图标
  menu: 'mdi:menu',
  close: 'mdi:close',
  back: 'mdi:arrow-left',
  forward: 'mdi:arrow-right',
  
  // 状态图标
  success: 'mdi:check-circle',
  error: 'mdi:alert-circle',
  warning: 'mdi:alert',
  info: 'mdi:information',
  
  // 天气和自然
  weather: 'mdi:weather-partly-cloudy',
  nature: 'mdi:leaf',
  water: 'mdi:water',
  fire: 'mdi:fire',
  earth: 'mdi:earth',
  
  // 情感和能量
  energy: 'mdi:lightning-bolt',
  love: 'mdi:heart',
  peace: 'mdi:peace',
  balance: 'mdi:scale-balance',
  
  // 工具图标
  search: 'mdi:magnify',
  filter: 'mdi:filter',
  sort: 'mdi:sort',
  refresh: 'mdi:refresh',
  
  // 社交图标
  share: 'mdi:share-variant',
  like: 'mdi:thumb-up',
  comment: 'mdi:comment',
  
  // 文件图标
  file: 'mdi:file-document',
  folder: 'mdi:folder',
  
  // 设备图标
  desktop: 'mdi:desktop-mac',
  mobile: 'mdi:cellphone',
  tablet: 'mdi:tablet',
  
  // 品牌图标
  windows: 'mdi:microsoft-windows',
  apple: 'mdi:apple',
  linux: 'mdi:linux',
  
  // 特殊功能
  darkMode: 'mdi:weather-night',
  lightMode: 'mdi:white-balance-sunny',
  notification: 'mdi:bell',
  help: 'mdi:help-circle'
};

// Icons8风格图标配置（使用Iconify中相似的图标）
const icons8Icons = {
  // 生物节律
  rhythm: 'mdi:chart-bell-curve',
  cycle: 'mdi:reload',
  health: 'mdi:medical-bag',
  
  // 玛雅元素
  temple: 'mdi:temple-buddhist',
  ancient: 'mdi:stone-henge',
  astrology: 'mdi:zodiac-aries',
  
  // 现代风格
  modern: 'mdi:cellphone-link',
  trendy: 'mdi:trending-up',
  stylish: 'mdi:palette-swatch'
};

// 图标组件
const IconComponent = ({ 
  name, 
  size = 24, 
  color = 'currentColor', 
  className = '',
  style = {},
  onClick,
  ...props 
}) => {
  const iconName = iconifyIcons[name] || icons8Icons[name] || name;
  
  return (
    <Icon 
      icon={iconName} 
      width={size} 
      height={size} 
      color={color}
      className={className}
      style={style}
      onClick={onClick}
      {...props}
    />
  );
};

// 专用图标组件
export const BiorhythmIcon = (props) => <IconComponent name="biorhythm" {...props} />;
export const MayaIcon = (props) => <IconComponent name="maya" {...props} />;
export const DressIcon = (props) => <IconComponent name="dress" {...props} />;
export const CalendarIcon = (props) => <IconComponent name="calendar" {...props} />;
export const HeartIcon = (props) => <IconComponent name="heart" {...props} />;
export const SunIcon = (props) => <IconComponent name="sun" {...props} />;
export const MoonIcon = (props) => <IconComponent name="moon" {...props} />;
export const StarIcon = (props) => <IconComponent name="star" {...props} />;

// 图标库导出
export const IconLibrary = {
  // 图标组件
  Icon: IconComponent,
  
  // 专用图标
  BiorhythmIcon,
  MayaIcon,
  DressIcon,
  CalendarIcon,
  HeartIcon,
  SunIcon,
  MoonIcon,
  StarIcon,
  
  // 图标名称映射
  icons: {
    ...iconifyIcons,
    ...icons8Icons
  },
  
  // 图标分类
  categories: {
    biorhythm: ['biorhythm', 'heart', 'brain', 'body', 'chart', 'calendar'],
    maya: ['maya', 'sun', 'moon', 'star', 'crystal', 'temple', 'ancient'],
    dress: ['dress', 'color', 'food', 'drink', 'stylish'],
    system: ['home', 'settings', 'user', 'search', 'notification']
  },
  
  // 工具函数
  getIcon: (name) => iconifyIcons[name] || icons8Icons[name],
  
  // 图标样式预设
  presets: {
    small: { size: 16 },
    medium: { size: 24 },
    large: { size: 32 },
    xlarge: { size: 48 },
    
    primary: { color: '#3b82f6' },
    success: { color: '#10b981' },
    warning: { color: '#f59e0b' },
    error: { color: '#ef4444' },
    
    // 主题颜色
    theme: {
      light: { color: '#374151' },
      dark: { color: '#d1d5db' }
    }
  }
};

export default IconLibrary;