const KlineChart = ({ data, hoveredAge, onHoverAge, theme, chartType, timeDimension, selectedYear }) => {
  if (!data.length) return null;

  // 响应式宽度：移动设备适配
  const isMobile = window.innerWidth < 375;
  const containerWidth = isMobile ? 280 : 350;
  const containerHeight = 280;
  // 优化内边距，扩大数据展示区域
  const padding = isMobile ? { top: 30, right: 12, bottom: 40, left: 35 } : { top: 35, right: 15, bottom: 45, left: 45 };
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
    const barWidth = isMobile ? 2 : 3;
    const barHeight = isMobile ? 8 : 10;
    const x = padding.left + xScale(i) - barWidth / 2;
    const y = padding.top + yScale(point.value) - barHeight / 2;
    const isPositive = point.value >= 50;
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
        className="bar-element cursor-pointer transition-opacity"
        style={{ transition: 'opacity 0.2s' }}
      />
    );
  }) : [];

  // 曲线图模式的数据点
  const curvePoints = chartType === 'line' ? displayData.map((point, i) => {
    const x = padding.left + xScale(i);
    const y = padding.top + yScale(point.value);
    const pointRadius = isMobile ? 2 : 3;
    const pointStrokeWidth = isMobile ? 1.5 : 2;
    return (
      <circle
        key={i}
        cx={x}
        cy={y}
        r={pointRadius}
        fill={theme === 'dark' ? '#3b82f6' : '#2563eb'}
        stroke={theme === 'dark' ? '#60a5fa' : '#3b82f6'}
        strokeWidth={pointStrokeWidth}
        opacity={hoveredAge === point.age ? 1 : 0.5}
        onMouseEnter={() => onHoverAge(point.age)}
        onMouseLeave={() => onHoverAge(null)}
        className="cursor-pointer transition-opacity"
        style={{ transition: 'opacity 0.2s' }}
      />
    );
  }) : [];

  // 网格线
  const gridLines = [];
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight / 5) * i;
    gridLines.push(
      <line
        key={`grid-h-${i}`}
        x1={padding.left}
        y1={y}
        x2={padding.left + chartWidth}
        y2={y}
        stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
        strokeWidth="0.5"
        strokeDasharray="3,3"
      />
    );
  }

  // X轴标记（根据时间维度）
  const xAxisLabels = [];
  const fontSize = isMobile ? 8 : 10;
  const monthDayFontSize = isMobile ? 7 : 9;
  const yOffset = isMobile ? 12 : 15;
  const yValOffset = isMobile ? 3 : 4;

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
          >
            {age}岁
          </text>
        );
      }
    }
  } else if (timeDimension === 'month') {
    // 月维度：按5个点间隔
    const step = Math.max(1, Math.floor(maxIndex / 6));
    for (let i = 0; i <= maxIndex; i += step) {
      const x = padding.left + xScale(i);
      const point = displayData[i];
      xAxisLabels.push(
        <text
          key={`label-${i}`}
          x={x}
          y={containerHeight - yOffset}
          fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}
          fontSize={monthDayFontSize}
          textAnchor="middle"
        >
          {point?.displayLabel || ''}
        </text>
      );
    }
  } else if (timeDimension === 'day') {
    // 日维度：按5个点间隔
    const step = Math.max(1, Math.floor(maxIndex / 6));
    for (let i = 0; i <= maxIndex; i += step) {
      const x = padding.left + xScale(i);
      const point = displayData[i];
      xAxisLabels.push(
        <text
          key={`label-${i}`}
          x={x}
          y={containerHeight - yOffset}
          fill={theme === 'dark' ? '#9ca3af' : '#6b7280'}
          fontSize={monthDayFontSize}
          textAnchor="middle"
        >
          {point?.displayLabel || ''}
        </text>
      );
    }
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl ${isMobile ? 'p-3' : 'p-4'} shadow-sm relative overflow-hidden`}>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            人生能量走势图
          </h3>
          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {timeDimension === 'year' ? '10-100岁综合能量指数' :
             timeDimension === 'month' ? '月度趋势（前后12个月）' :
             '日度趋势（前后15天）'}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <div className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded`} style={{ backgroundColor: theme === 'dark' ? '#4ade80' : '#22c55e' }}></div>
            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>高能量</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded`} style={{ backgroundColor: theme === 'dark' ? '#f87171' : '#ef4444' }}></div>
            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>低能量</span>
          </div>
        </div>
      </div>

      <svg
        width="100%"
        height={containerHeight}
        viewBox={`0 0 ${containerWidth} ${containerHeight}`}
        className="kline-svg"
      >
        {/* 网格背景 */}
        {gridLines}

        {/* 坐标轴 */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke={theme === 'dark' ? '#4b5563' : '#9ca3af'}
          strokeWidth="1"
        />
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={padding.left + chartWidth}
          y2={padding.top + chartHeight}
          stroke={theme === 'dark' ? '#4b5563' : '#9ca3af'}
          strokeWidth="1"
        />

        {/* 数值标记 */}
        <text x={padding.left - (isMobile ? 30 : 35)} y={padding.top + yValOffset} fill={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={fontSize}>100</text>
        <text x={padding.left - (isMobile ? 30 : 35)} y={padding.top + chartHeight / 2 + yValOffset} fill={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={fontSize}>50</text>
        <text x={padding.left - (isMobile ? 30 : 35)} y={padding.top + chartHeight + yValOffset} fill={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={fontSize}>0</text>

        {/* 曲线路径 - 曲线模式下使用平滑曲线 */}
        {chartType === 'line' ? (
          <path
            d={pathData}
            fill="none"
            stroke={theme === 'dark' ? '#3b82f6' : '#2563eb'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          /* K线路径 - K线模式下使用标准线条 */
          <path
            d={pathData}
            fill="none"
            stroke={theme === 'dark' ? '#3b82f6' : '#2563eb'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
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
                    strokeWidth="1"
                    strokeDasharray="4,2"
                  />
                );
              }
              return null;
            })}
            <circle
              cx={padding.left + xScale(displayData.findIndex(d => d.age === hoveredAge))}
              cy={padding.top + yScale(data.find(d => d.age === hoveredAge)?.value || 50)}
              r="5"
              fill={theme === 'dark' ? '#fbbf24' : '#f59e0b'}
              stroke={theme === 'dark' ? '#fcd34d' : '#fbbf24'}
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* 悬停提示 */}
      {hoveredAge !== null && (
        <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-lg shadow-lg ${
          theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-200'
        } border z-10`}>
          <span className={`${isMobile ? 'text-[11px]' : 'text-sm'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
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
