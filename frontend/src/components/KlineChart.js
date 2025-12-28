import React, { useState, useEffect, useRef } from 'react';

const KlineChart = ({ data, hoveredAge, onHoverAge, theme, chartType, timeDimension, selectedYear }) => {
  const chartContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(350);

  // 监听容器宽度变化
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const updateWidth = () => {
      const width = container.clientWidth;
      // 确保最小宽度
      const adjustedWidth = Math.max(width, 260);
      setContainerWidth(adjustedWidth);
    };

    // 初始计算
    updateWidth();

    // 使用 ResizeObserver 监听容器尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(container);

    // 窗口 resize 时也更新
    const handleResize = () => {
      updateWidth();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!data.length) return null;

  // 响应式高度：根据宽度比例计算
  const containerHeight = Math.round(containerWidth * 0.75);

  // 响应式断点：更细致的设备适配
  const isSmallMobile = containerWidth < 280;
  const isMobile = containerWidth < 320;

  // 优化内边距：根据容器宽度动态调整
  const padding = isSmallMobile
    ? { top: 20, right: 8, bottom: 30, left: 20 }
    : isMobile
    ? { top: 24, right: 10, bottom: 35, left: 24 }
    : { top: 28, right: 12, bottom: 40, left: 30 };
  const chartWidth = containerWidth - padding.left - padding.right;
  const chartHeight = containerHeight - padding.top - padding.bottom;

  // 根据时间维度生成显示数据
  const getDisplayData = () => {
    if (timeDimension === 'year') {
      // 年维度：从10岁起显示，完整人生周期
      return data.filter(d => d.age >= 10);
    } else if (timeDimension === 'month') {
      // 月维度：显示当前月份前后12个月的数据（25个数据点）
      const currentAge = new Date().getFullYear() - selectedYear;
      const displayData = [];
      for (let offset = -12; offset <= 12; offset++) {
        const targetAge = Math.max(10, Math.min(100, currentAge + offset));
        const dataPoint = data.find(d => d.age === targetAge);
        if (dataPoint) {
          displayData.push({
            ...dataPoint,
            displayLabel: offset === 0 ? '当前月' : offset < 0 ? `${Math.abs(offset)}月前` : `${offset}月后`
          });
        }
      }
      return displayData;
    } else if (timeDimension === 'day') {
      // 日维度：显示当日前后30天的数据（31个数据点）
      const currentAge = new Date().getFullYear() - selectedYear;
      const displayData = [];
      for (let offset = -15; offset <= 15; offset++) {
        const targetAge = Math.max(10, Math.min(100, currentAge + offset));
        const dataPoint = data.find(d => d.age === targetAge);
        if (dataPoint) {
          displayData.push({
            ...dataPoint,
            displayLabel: offset === 0 ? '今日' : offset < 0 ? `${Math.abs(offset)}天前` : `${offset}天后`
          });
        }
      }
      return displayData;
    }
    return data.filter(d => d.age >= 10);
  };

  const displayData = getDisplayData();
  const maxValue = Math.max(...displayData.map(d => d.value)) || 100;
  const maxIndex = displayData.length - 1;

  const xScale = (index) => (index / maxIndex) * chartWidth;
  const yScale = (value) => chartHeight - (value / maxValue) * chartHeight;

  const pathData = displayData.map((point, i) => {
    const x = padding.left + xScale(i);
    const y = padding.top + yScale(point.value);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // K线柱状图模式
  const bars = chartType === 'kline' ? displayData.map((point, i) => {
    // 移动端增加触摸区域，提升可点击性
    const barWidth = isSmallMobile ? 4 : isMobile ? 5 : 6;
    const barHeight = isSmallMobile ? 6 : isMobile ? 8 : 10;
    const x = padding.left + xScale(i) - barWidth / 2;
    const y = padding.top + yScale(point.value) - barHeight / 2;
    const isPositive = point.value >= 50;
    // 优化颜色方案：增加渐变效果
    const color = isPositive ? (theme === 'dark' ? '#4ade80' : '#22c55e') : (theme === 'dark' ? '#f87171' : '#ef4444');

    return (
      <rect
        key={i}
        x={x}
        y={y}
        width={barWidth}
        height={barHeight}
        fill={color}
        opacity={hoveredAge === point.age ? 1 : 0.6}
        onMouseEnter={() => onHoverAge(point.age)}
        onMouseLeave={() => onHoverAge(null)}
        onTouchStart={(e) => { e.preventDefault(); onHoverAge(point.age); }}
        onTouchEnd={() => onHoverAge(null)}
        className="bar-element cursor-pointer transition-opacity"
        style={{ transition: 'opacity 0.2s ease-in-out' }}
        rx={isMobile ? 1 : 0}
      />
    );
  }) : [];

  // 曲线图模式的数据点
  const curvePoints = chartType === 'line' ? displayData.map((point, i) => {
    const x = padding.left + xScale(i);
    const y = padding.top + yScale(point.value);
    const pointRadius = isSmallMobile ? 3 : isMobile ? 4 : 5;
    const pointStrokeWidth = isSmallMobile ? 1.5 : isMobile ? 1.5 : 2;
    // 触摸区域半径（比视觉半径大，提升可点击性）
    const touchRadius = isSmallMobile ? 12 : isMobile ? 14 : 16;

    return (
      <g key={i}>
        {/* 透明触摸区域 */}
        <circle
          cx={x}
          cy={y}
          r={touchRadius}
          fill="transparent"
          onMouseEnter={() => onHoverAge(point.age)}
          onMouseLeave={() => onHoverAge(null)}
          onTouchStart={(e) => { e.preventDefault(); onHoverAge(point.age); }}
          onTouchEnd={() => onHoverAge(null)}
          style={{ cursor: 'pointer' }}
        />
        {/* 可见数据点 */}
        <circle
          cx={x}
          cy={y}
          r={pointRadius}
          fill={theme === 'dark' ? '#3b82f6' : '#2563eb'}
          stroke={theme === 'dark' ? '#60a5fa' : '#3b82f6'}
          strokeWidth={pointStrokeWidth}
          opacity={hoveredAge === point.age ? 1 : 0.6}
          style={{ transition: 'opacity 0.2s ease-in-out, r 0.2s ease-in-out' }}
        />
      </g>
    );
  }) : [];

  // 网格线 - 移动端更简洁
  const gridLines = [];
  const gridCount = isSmallMobile ? 4 : 5;
  for (let i = 0; i <= gridCount; i++) {
    const y = padding.top + (chartHeight / gridCount) * i;
    const isMiddle = i === Math.floor(gridCount / 2);
    gridLines.push(
      <line
        key={`grid-h-${i}`}
        x1={padding.left}
        y1={y}
        x2={padding.left + chartWidth}
        y2={y}
        stroke={isMiddle
          ? (theme === 'dark' ? '#4b5563' : '#d1d5db')
          : (theme === 'dark' ? '#374151' : '#e5e7eb')
        }
        strokeWidth={isMiddle ? '0.8' : '0.4'}
        strokeDasharray={isMobile ? '2,2' : '3,3'}
        opacity={isMiddle ? 1 : 0.5}
      />
    );
  }

  // X轴标记（根据时间维度）
  const xAxisLabels = [];
  const fontSize = isSmallMobile ? 7 : isMobile ? 8 : 10;
  const monthDayFontSize = isSmallMobile ? 6 : isMobile ? 7 : 9;
  const yOffset = isSmallMobile ? 10 : isMobile ? 12 : 15;
  const yValOffset = isSmallMobile ? 2 : isMobile ? 3 : 4;
  // 移动端优化：进一步压缩Y轴标签偏移量，最大化数据展示区域
  const yAxisLabelOffset = isSmallMobile ? 18 : isMobile ? 22 : 35;

  if (timeDimension === 'year') {
    // 年维度：从10岁起，按10年间隔
    const minAge = displayData[0]?.age || 10;
    const maxAge = displayData[displayData.length - 1]?.age || 100;
    for (let age = minAge; age <= maxAge; age += 10) {
      const index = displayData.findIndex(d => d.age === age);
      if (index >= 0) {
        const x = padding.left + xScale(index);
        xAxisLabels.push(
          <text
            key={`age-${age}`}
            x={x}
            y={containerHeight - yOffset}
            fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            fontSize={fontSize}
            textAnchor="middle"
            style={{ fontWeight: age === 50 ? 500 : 400 }}
          >
            {age}
          </text>
        );
      }
    }
  } else if (timeDimension === 'month') {
    // 月维度：根据数据点数量动态调整间隔
    const step = isMobile ? Math.max(1, Math.floor(maxIndex / 4)) : Math.max(1, Math.floor(maxIndex / 6));
    for (let i = 0; i <= maxIndex; i += step) {
      const x = padding.left + xScale(i);
      const point = displayData[i];
      // 移动端只显示关键时间点
      if (isMobile && !point?.displayLabel?.includes('当前月') && Math.abs(i - Math.floor(maxIndex / 2)) > 2) continue;
      xAxisLabels.push(
        <text
          key={`label-${i}`}
          x={x}
          y={containerHeight - yOffset}
          fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}
          fontSize={monthDayFontSize}
          textAnchor="middle"
          style={{ fontWeight: point?.displayLabel?.includes('当前月') ? 500 : 400 }}
        >
          {point?.displayLabel || ''}
        </text>
      );
    }
  } else if (timeDimension === 'day') {
    // 日维度：根据数据点数量动态调整间隔
    const step = isMobile ? Math.max(1, Math.floor(maxIndex / 4)) : Math.max(1, Math.floor(maxIndex / 6));
    for (let i = 0; i <= maxIndex; i += step) {
      const x = padding.left + xScale(i);
      const point = displayData[i];
      // 移动端只显示关键时间点
      if (isMobile && !point?.displayLabel?.includes('今日') && Math.abs(i - Math.floor(maxIndex / 2)) > 2) continue;
      xAxisLabels.push(
        <text
          key={`label-${i}`}
          x={x}
          y={containerHeight - yOffset}
          fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}
          fontSize={monthDayFontSize}
          textAnchor="middle"
          style={{ fontWeight: point?.displayLabel?.includes('今日') ? 500 : 400 }}
        >
          {point?.displayLabel || ''}
        </text>
      );
    }
  }

  return (
    <div ref={chartContainerRef} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl ${isSmallMobile ? 'p-2.5' : isMobile ? 'p-3' : 'p-4'} shadow-sm relative overflow-hidden`}>
      <div className={`flex justify-between items-center ${isSmallMobile ? 'mb-2' : 'mb-3'}`}>
        <div>
          <h3 className={`${isSmallMobile ? 'text-xs' : isMobile ? 'text-sm' : 'text-base'} font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            人生能量走势图
          </h3>
          <p className={`${isSmallMobile ? 'text-[9px]' : isMobile ? 'text-[10px]' : 'text-xs'} mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {timeDimension === 'year' ? '10-100岁综合能量指数' :
             timeDimension === 'month' ? '月度趋势（前后12个月）' :
             '日度趋势（前后15天）'}
          </p>
        </div>
        <div className={`flex gap-1.5 ${isSmallMobile ? 'scale-90' : ''}`}>
          <div className="flex items-center gap-1">
            <div className={`${isSmallMobile ? 'w-2 h-2' : isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-sm`} style={{ backgroundColor: theme === 'dark' ? '#4ade80' : '#22c55e' }}></div>
            <span className={`${isSmallMobile ? 'text-[9px]' : isMobile ? 'text-[10px]' : 'text-xs'} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>高</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`${isSmallMobile ? 'w-2 h-2' : isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-sm`} style={{ backgroundColor: theme === 'dark' ? '#f87171' : '#ef4444' }}></div>
            <span className={`${isSmallMobile ? 'text-[9px]' : isMobile ? 'text-[10px]' : 'text-xs'} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>低</span>
          </div>
        </div>
      </div>

      <svg
        width="100%"
        height={containerHeight}
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="kline-svg"
      >
        {/* 网格背景 */}
        {gridLines}

        {/* 坐标轴 - 移动端更细 */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke={theme === 'dark' ? '#4b5563' : '#9ca3af'}
          strokeWidth={isMobile ? '0.6' : '0.8'}
          strokeLinecap="round"
        />
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke={theme === 'dark' ? '#4b5563' : '#9ca3af'}
          strokeWidth={isMobile ? '0.6' : '0.8'}
          strokeLinecap="round"
        />

        {/* 数值标记 - 移动端压缩偏移量使标签更紧凑 */}
        <text x={padding.left - yAxisLabelOffset} y={padding.top + yValOffset} fill={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={fontSize}>100</text>
        <text x={padding.left - yAxisLabelOffset} y={padding.top + chartHeight / 2 + yValOffset} fill={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={fontSize}>50</text>
        <text x={padding.left - yAxisLabelOffset} y={padding.top + chartHeight + yValOffset} fill={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={fontSize}>0</text>

        {/* 曲线路径 - 曲线模式下使用平滑曲线 */}
        {chartType === 'line' ? (
          <path
            d={pathData}
            fill="none"
            stroke={theme === 'dark' ? '#3b82f6' : '#2563eb'}
            strokeWidth={isSmallMobile ? '2' : isMobile ? '2.5' : '3'}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: isMobile ? 'drop-shadow(0 1px 2px rgba(59, 130, 246, 0.2))' : 'none' }}
          />
        ) : (
          /* K线路径 - K线模式下使用标准线条 */
          <path
            d={pathData}
            fill="none"
            stroke={theme === 'dark' ? '#3b82f6' : '#2563eb'}
            strokeWidth={isMobile ? '1.5' : '2'}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: isMobile ? 'drop-shadow(0 1px 2px rgba(59, 130, 246, 0.15))' : 'none' }}
          />
        )}

        {/* K线柱或曲线点 */}
        {chartType === 'kline' ? bars : curvePoints}

        {/* X轴标记 */}
        {xAxisLabels}

        {/* 悬停指示器 */}
        {hoveredAge !== null && (
          <g>
            {displayData.map((point, i) => {
              if (point.age === hoveredAge) {
                const x = padding.left + xScale(i);
                return (
                  <line
                    key="hover-line"
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke={theme === 'dark' ? '#fbbf24' : '#f59e0b'}
                    strokeWidth={isMobile ? '0.8' : '1'}
                    strokeDasharray={isMobile ? '3,1' : '4,2'}
                    style={{ opacity: 0.8 }}
                  />
                );
              }
              return null;
            })}
            {/* 悬停点 - 带有外发光效果 */}
            <circle
              cx={padding.left + xScale(displayData.findIndex(d => d.age === hoveredAge))}
              cy={padding.top + yScale(data.find(d => d.age === hoveredAge)?.value || 50)}
              r={isSmallMobile ? '4' : isMobile ? '5' : '6'}
              fill={theme === 'dark' ? '#fbbf24' : '#f59e0b'}
              stroke={theme === 'dark' ? '#fcd34d' : '#fbbf24'}
              strokeWidth={isMobile ? '1.5' : '2'}
              style={{
                filter: `drop-shadow(0 0 ${isMobile ? 4 : 6}px ${theme === 'dark' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(245, 158, 11, 0.3)'})`
              }}
            />
          </g>
        )}
      </svg>

      {/* 悬停提示 */}
      {hoveredAge !== null && (
        <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 ${isSmallMobile ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-xl shadow-lg backdrop-blur-sm ${
          theme === 'dark' ? 'bg-gray-700/95 text-white border-gray-600' : 'bg-white/95 text-gray-900 border-gray-200'
        } border z-10 transition-all duration-200`}
        style={{
          boxShadow: isMobile
            ? '0 2px 8px rgba(0, 0, 0, 0.15)'
            : '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <span className={`${isSmallMobile ? 'text-[10px]' : isMobile ? 'text-[11px]' : 'text-sm'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            年龄 <b className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{hoveredAge}</b> 岁 |
            能量指数: <b className={data.find(d => d.age === hoveredAge)?.value >= 50 ? 'text-green-500' : 'text-red-500'}>
              {data.find(d => d.age === hoveredAge)?.value || 0}/100
            </b>
          </span>
        </div>
      )}
    </div>
  );
};

export default KlineChart;
