import React from 'react';

/**
 * 炫彩风水罗盘图标
 * 使用渐变和传统风水元素设计
 */
const FengShuiCompassIcon = ({ size = 24, color = '#ffffff', className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* 金色渐变 */}
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FF8C00', stopOpacity: 1 }} />
        </linearGradient>

        {/* 红色渐变（天池） */}
        <radialGradient id="redGradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
          <stop offset="0%" style={{ stopColor: '#FF6B6B', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#C41E3A', stopOpacity: 1 }} />
        </radialGradient>

        {/* 木质渐变 */}
        <linearGradient id="woodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#D4A574', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#B8860B', stopOpacity: 1 }} />
        </linearGradient>

        {/* 彩虹渐变（边框） */}
        <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FF6B6B', stopOpacity: 1 }} />
          <stop offset="25%" style={{ stopColor: '#FFD93D', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#6BCB77', stopOpacity: 1 }} />
          <stop offset="75%" style={{ stopColor: '#4D96FF', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#9B59B6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* 外圈罗盘底座 - 使用彩虹渐变 */}
      <circle
        cx="12"
        cy="12"
        r="10.5"
        fill="url(#woodGradient)"
        stroke="url(#rainbowGradient)"
        strokeWidth="0.3"
      />

      {/* 外圈装饰线 */}
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        stroke={color}
        strokeWidth="0.2"
        opacity="0.5"
      />

      {/* 中圈 - 八卦环 */}
      <circle
        cx="12"
        cy="12"
        r="7"
        fill="none"
        stroke={color}
        strokeWidth="0.25"
        opacity="0.6"
      />

      {/* 八卦符号（简化版） */}
      <g opacity="0.7">
        {/* 坎 - 北 */}
        <path d="M12 4 L12 5.5" stroke={color} strokeWidth="0.3" />
        {/* 离 - 南 */}
        <path d="M12 18.5 L12 20" stroke={color} strokeWidth="0.3" />
        {/* 震 - 东 */}
        <path d="M19 12 L17.5 12" stroke={color} strokeWidth="0.3" />
        {/* 兑 - 西 */}
        <path d="M6.5 12 L5 12" stroke={color} strokeWidth="0.3" />
        {/* 乾 - 西北 */}
        <path d="M5.2 5.2 L6.3 6.3" stroke={color} strokeWidth="0.3" />
        {/* 坤 - 西南 */}
        <path d="M18.8 18.8 L17.7 17.7" stroke={color} strokeWidth="0.3" />
        {/* 巽 - 东南 */}
        <path d="M17.7 6.3 L18.8 5.2" stroke={color} strokeWidth="0.3" />
        {/* 艮 - 东北 */}
        <path d="M6.3 17.7 L5.2 18.8" stroke={color} strokeWidth="0.3" />
      </g>

      {/* 内圈 - 地支环 */}
      <circle
        cx="12"
        cy="12"
        r="5"
        fill="none"
        stroke={color}
        strokeWidth="0.25"
        opacity="0.6"
      />

      {/* 12地支标记（简化的点） */}
      <g fill={color} opacity="0.5">
        <circle cx="12" cy="7" r="0.3" />
        <circle cx="17" cy="12" r="0.3" />
        <circle cx="12" cy="17" r="0.3" />
        <circle cx="7" cy="12" r="0.3" />
        <circle cx="15.5" cy="8.5" r="0.3" />
        <circle cx="15.5" cy="15.5" r="0.3" />
        <circle cx="8.5" cy="15.5" r="0.3" />
        <circle cx="8.5" cy="8.5" r="0.3" />
      </g>

      {/* 中心天池 - 红色渐变 */}
      <circle
        cx="12"
        cy="12"
        r="2.5"
        fill="url(#redGradient)"
        stroke={color}
        strokeWidth="0.2"
      />

      {/* 天池内部装饰 - 同心圆 */}
      <circle
        cx="12"
        cy="12"
        r="1.8"
        fill="none"
        stroke={color}
        strokeWidth="0.15"
        opacity="0.6"
      />

      <circle
        cx="12"
        cy="12"
        r="1"
        fill="none"
        stroke={color}
        strokeWidth="0.15"
        opacity="0.4"
      />

      {/* 指针 - 金色渐变 */}
      <g transform={`rotate(45, 12, 12)`}>
        {/* 北向指针 */}
        <path
          d="M12 8.5 L12 5 L12.3 8.5 L13 9.5 L12 9.5 Z"
          fill="url(#goldGradient)"
          opacity="0.9"
        />
        {/* 南向指针 */}
        <path
          d="M12 15.5 L12 19 L11.7 15.5 L11 14.5 L12 14.5 Z"
          fill="url(#goldGradient)"
          opacity="0.7"
        />
        {/* 中心点 */}
        <circle cx="12" cy="12" r="0.4" fill={color} />
      </g>

      {/* 装饰性星点 - 增加神秘感 */}
      <g fill={color} opacity="0.3">
        <circle cx="9.5" cy="9.5" r="0.15" />
        <circle cx="14.5" cy="9.5" r="0.15" />
        <circle cx="9.5" cy="14.5" r="0.15" />
        <circle cx="14.5" cy="14.5" r="0.15" />
      </g>

      {/* 外圈装饰性弧线 */}
      <g stroke={color} strokeWidth="0.15" opacity="0.2" fill="none">
        <path d="M12 1.5 A10.5 10.5 0 0 1 22.5 12" />
        <path d="M12 22.5 A10.5 10.5 0 0 1 1.5 12" />
        <path d="M1.5 12 A10.5 10.5 0 0 1 12 1.5" />
        <path d="M22.5 12 A10.5 10.5 0 0 1 12 22.5" />
      </g>
    </svg>
  );
};

export default FengShuiCompassIcon;
