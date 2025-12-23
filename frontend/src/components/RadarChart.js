const RadarChart = ({ data, year, theme }) => {
  if (!data) return null;

  const dimensions = [
    { key: 'career', label: '事业' },
    { key: 'wealth', label: '财运' },
    { key: 'relationship', label: '感情' },
    { key: 'health', label: '健康' },
    { key: 'social', label: '人际' },
  ];

  // 响应式尺寸：移动设备适配
  const isMobile = window.innerWidth < 375;
  const centerX = isMobile ? 115 : 140;
  const centerY = isMobile ? 130 : 150;
  const radius = isMobile ? 75 : 90;
  const angleStep = (2 * Math.PI) / dimensions.length;

  // 生成雷达图多边形点
  const points = dimensions.map((dim, i) => {
    const value = data[dim.key] || 50;
    const scaledRadius = (value / 100) * radius;
    const angle = i * angleStep - Math.PI / 2;

    const x = centerX + scaledRadius * Math.cos(angle);
    const y = centerY + scaledRadius * Math.sin(angle);

    return { x, y, value, label: dim.label };
  });

  // 连接点形成多边形
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // 绘制网格圆环
  const circles = [];
  for (let i = 1; i <= 5; i++) {
    const circleRadius = (radius / 5) * i;
    circles.push(
      <circle
        key={`circle-${i}`}
        cx={centerX}
        cy={centerY}
        r={circleRadius}
        fill="none"
        stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
        strokeWidth="0.5"
        strokeDasharray="2,2"
      />
    );
  }

  // 绘制坐标轴
  const axes = dimensions.map((_dim, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return (
      <line
        key={`axis-${i}`}
        x1={centerX}
        y1={centerY}
        x2={x}
        y2={y}
        stroke={theme === 'dark' ? '#4b5563' : '#9ca3af'}
        strokeWidth="1"
      />
    );
  });

  // 绘制数值标签
  const labels = points.map((point, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const labelRadius = radius + (isMobile ? 20 : 25);
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);

    return (
      <text
        key={`label-${i}`}
        x={x}
        y={y}
        fill={theme === 'dark' ? '#d1d5db' : '#4b5563'}
        fontSize={isMobile ? 9 : 11}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {point.label}
      </text>
    );
  });

  // 计算综合评分
  const averageScore = Math.round(
    dimensions.reduce((sum, dim) => sum + (data[dim.key] || 50), 0) / dimensions.length
  );

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl ${isMobile ? 'p-3' : 'p-4'} shadow-sm overflow-hidden`}>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            多维能量分析
          </h3>
          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {year}年能量分布 · 综合评分: <span className={averageScore >= 60 ? 'text-green-500' : 'text-orange-500'}>{averageScore}分</span>
          </p>
        </div>
      </div>

      <svg width="100%" height={isMobile ? 260 : 320} viewBox={`0 0 ${isMobile ? 230 : 280} ${isMobile ? 260 : 320}`} className="radar-svg">
        {/* 网格圆环 */}
        {circles}

        {/* 坐标轴 */}
        {axes}

        {/* 数据多边形 */}
        <polygon
          points={polygonPoints}
          fill={theme === 'dark' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.15)'}
          stroke={theme === 'dark' ? '#3b82f6' : '#2563eb'}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* 数据点 */}
        {points.map((point, i) => (
          <circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r={isMobile ? 4 : 5}
            fill={theme === 'dark' ? '#3b82f6' : '#2563eb'}
            stroke={theme === 'dark' ? '#60a5fa' : '#60a5fa'}
            strokeWidth={isMobile ? 1.5 : 2}
          />
        ))}

        {/* 标签 */}
        {labels}
      </svg>

      {/* 指标详情 */}
      <div className={`mt-4 space-y-${isMobile ? 2 : 2.5}`}>
        {dimensions.map(dim => {
          const value = data[dim.key] || 50;
          const isPositive = value >= 50;
          return (
            <div key={dim.key} className="flex items-center gap-2">
              <div className={`${isMobile ? 'w-10' : 'w-12'} ${isMobile ? 'text-xs' : 'text-sm'} font-medium`} style={{ color: theme === 'dark' ? '#cbd5e1' : '#4b5563' }}>
                {dim.label}
              </div>
              <div className={`flex-1 ${isMobile ? 'h-2' : 'h-2.5'} rounded-full overflow-hidden`} style={{ backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${value}%`,
                    backgroundColor: isPositive
                      ? (theme === 'dark' ? '#22c55e' : '#16a34a')
                      : (theme === 'dark' ? '#ef4444' : '#dc2626')
                  }}
                />
              </div>
              <div className={`${isMobile ? 'w-9' : 'w-10'} text-right ${isMobile ? 'text-[10px]' : 'text-xs'} font-medium`} style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                {Math.round(value)}/100
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RadarChart;
