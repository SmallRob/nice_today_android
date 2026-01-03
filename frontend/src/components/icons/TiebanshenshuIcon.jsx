import React from 'react';

const TiebanshenshuIcon = ({ className = '', size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 铁板外框 */}
      <rect x="2" y="2" width="20" height="20" rx="3" stroke={color} strokeWidth="2" />
      
      {/* 中心圆形 */}
      <circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.5" fill="none" />
      
      {/* 内部八卦符号 - 简化的乾卦 */}
      {/* 上爻 */}
      <line x1="9" y1="7" x2="15" y2="7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      
      {/* 中爻 */}
      <line x1="9" y1="10" x2="15" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      
      {/* 下爻 */}
      <line x1="9" y1="13" x2="15" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      
      {/* 数字符号 - 代表数术 */}
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fill={color}
        fontSize="5"
        fontWeight="bold"
        fontFamily="serif"
      >
        数
      </text>
      
      {/* 左上角装饰 - 天干 */}
      <text
        x="5"
        y="6"
        textAnchor="middle"
        fill={color}
        fontSize="3"
        fontWeight="normal"
        fontFamily="serif"
      >
        甲
      </text>
      
      {/* 右上角装饰 - 地支 */}
      <text
        x="19"
        y="6"
        textAnchor="middle"
        fill={color}
        fontSize="3"
        fontWeight="normal"
        fontFamily="serif"
      >
        子
      </text>
      
      {/* 左下角装饰 - 代表条文 */}
      <line x1="4" y1="19" x2="6" y2="19" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="4" y1="20" x2="6" y2="20" stroke={color} strokeWidth="1" strokeLinecap="round" />
      
      {/* 右下角装饰 - 代表条文 */}
      <line x1="18" y1="19" x2="20" y2="19" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="18" y1="20" x2="20" y2="20" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
};

export default TiebanshenshuIcon;
