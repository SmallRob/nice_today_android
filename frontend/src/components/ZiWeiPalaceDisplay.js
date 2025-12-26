import React, { useState, useEffect } from 'react';

/**
 * 获取卡片颜色（基于强度）
 */
const getCardColor = (strength) => {
  switch (strength) {
    case '强': return 'from-green-100 to-green-200';
    case '偏强': return 'from-blue-100 to-blue-200';
    case '中偏强': return 'from-indigo-100 to-indigo-200';
    case '中': return 'from-gray-100 to-gray-200';
    case '偏弱': return 'from-orange-100 to-orange-200';
    case '弱': return 'from-red-100 to-red-200';
    default: return 'from-gray-100 to-gray-200';
  }
};

/**
 * 获取卡片颜色（深色模式）
 * 增加不透明度和对比度以确保文字清晰可见
 */
const getCardColorDark = (strength) => {
  switch (strength) {
    case '强': return 'from-green-900/80 to-green-800/80 dark:border-green-600';
    case '偏强': return 'from-blue-900/80 to-blue-800/80 dark:border-blue-600';
    case '中偏强': return 'from-indigo-900/80 to-indigo-800/80 dark:border-indigo-600';
    case '中': return 'from-gray-800/80 to-gray-700/80 dark:border-gray-500';
    case '偏弱': return 'from-orange-900/80 to-orange-800/80 dark:border-orange-500';
    case '弱': return 'from-red-900/80 to-red-800/80 dark:border-red-500';
    default: return 'from-gray-800/80 to-gray-700/80 dark:border-gray-500';
  }
};

/**
 * 获取分数颜色
 */
const getScoreColor = (score) => {
  if (score >= 85) return 'bg-green-500';
  if (score >= 75) return 'bg-blue-500';
  if (score >= 65) return 'bg-yellow-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-red-500';
};

/**
 * 紫微命宫展示组件（增强版）
 * 显示紫微命盘各宫位信息，包含详细的错误和警告提示
 */
const ZiWeiPalaceDisplay = ({ ziweiData, birthDate, birthTime, longitude }) => {
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // 检查是否有错误或警告
  const hasError = ziweiData && (ziweiData.error || ziweiData.missingFields);
  const hasWarnings = ziweiData && (ziweiData.validationWarnings || ziweiData.calculationWarnings);
  
  // 获取错误信息
  const getErrorDisplay = () => {
    if (!ziweiData) return null;
    
    if (ziweiData.error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/50 rounded-lg p-4 border border-red-200 dark:border-red-600">
          <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">⚠️ 计算错误</h4>
          <div className="text-sm text-red-600 dark:text-red-300 space-y-1">
            <p>{ziweiData.error}</p>
            <p className="text-xs opacity-80">建议：请检查出生日期、时间和经纬度是否正确</p>
          </div>
        </div>
      );
    }

    if (ziweiData.missingFields && ziweiData.missingFields.length > 0) {
      const fieldNames = {
        'birthDate': '出生日期',
        'birthTime': '出生时间',
        'birthLocation': '出生地点（经纬度）'
      };

      return (
        <div className="bg-orange-50 dark:bg-orange-900/50 rounded-lg p-4 border border-orange-200 dark:border-orange-600">
          <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">📋 缺少必要信息</h4>
          <div className="text-sm text-orange-600 dark:text-orange-300">
            <p className="mb-2">请完善以下信息以计算紫微命盘：</p>
            <ul className="list-disc list-inside space-y-1">
              {ziweiData.missingFields.map(field => (
                <li key={field} className="font-medium">{fieldNames[field] || field}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    return null;
  };

  // 获取警告信息
  const getWarningDisplay = () => {
    if (!ziweiData) return null;

    const allWarnings = [
      ...(ziweiData.validationWarnings || []),
      ...(ziweiData.calculationWarnings || [])
    ];

    if (allWarnings.length === 0) return null;

    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/50 rounded-lg p-4 border border-yellow-200 dark:border-yellow-600">
        <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">⚡ 数据质量警告</h4>
        <div className="text-sm text-yellow-600 dark:text-yellow-300 space-y-1">
          {allWarnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <p>{warning.message}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 显示计算元数据（用于调试）
  const getMetadataDisplay = () => {
    // getZiWeiDisplayData 返回的结构是 { ziweiData: { ... }, metadata: { ... } }
    // metadata 在外层，不在 ziweiData.ziweiData 内部
    const metadata = ziweiData?.metadata || ziweiData?.ziweiData?.metadata;

    if (!metadata) return null;

    const { birthDate, birthTime, trueSolarTime, longitude, latitude } = metadata;

    return (
      <div className="bg-gray-50 dark:bg-gray-800/80 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-200 mb-2">📊 计算参数</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
          <div>出生日期：{birthDate}</div>
          <div>出生时间：{birthTime}</div>
          <div>经度：{longitude?.toFixed(4)}°</div>
          <div>纬度：{latitude?.toFixed(4)}°</div>
          <div className="col-span-2">真太阳时：{trueSolarTime}</div>
        </div>
      </div>
    );
  };

  // 显示加载或空状态
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <p className="ml-3 text-gray-500 dark:text-gray-400">正在计算紫微命盘...</p>
      </div>
    );
  }

  if (!ziweiData) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <p>请先设置完整的出生信息以查看紫微命宫</p>
        <p className="text-xs mt-2">需要：出生日期、时辰、经纬度</p>
      </div>
    );
  }

  // 显示错误状态
  const errorDisplay = getErrorDisplay();
  if (errorDisplay) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold mb-1">🌟 紫微命宫</h3>
              <p className="text-sm opacity-90">基于出生时间的命盘分析</p>
            </div>
          </div>
        </div>
        {errorDisplay}
        <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-4 border border-blue-200 dark:border-blue-600">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-white mb-1">如何修复</h4>
              <div className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
                <p>• 确保出生日期格式为 YYYY-MM-DD（如：1991-04-30）</p>
                <p>• 确保出生时间格式为 HH:MM（如：12:30）</p>
                <p>• 确保经纬度在有效范围内（经度：-180 到 180，纬度：-90 到 90）</p>
                <p>• 建议使用"编辑"按钮修改配置后保存</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 从 ziweiData 中提取实际的紫微命宫数据
  // getZiWeiDisplayData 返回的结构是 { ziweiData: { palaces, mingGong, summary, ... }, ... }
  const actualZiweiData = ziweiData?.ziweiData || ziweiData;

  // 检查是否有实际的紫微命宫数据
  if (!actualZiweiData || !actualZiweiData.palaces) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold mb-1">🌟 紫微命宫</h3>
              <p className="text-sm opacity-90">基于出生时间的命盘分析</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/50 rounded-lg p-4 border border-orange-200 dark:border-orange-600">
          <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">⚠️ 数据不完整</h4>
          <div className="text-sm text-orange-600 dark:text-orange-300">
            <p>紫微命盘数据不完整或计算失败。</p>
            <p className="text-xs mt-2 opacity-80">请检查出生信息是否完整，或点击"刷新八字信息"按钮重新计算。</p>
          </div>
        </div>
      </div>
    );
  }

  const { palaces, mingGong, summary } = actualZiweiData;

  // 显示警告（如果有的话）
  const warningDisplay = getWarningDisplay();

  // 显示元数据（用于调试）
  const metadataDisplay = getMetadataDisplay();

  // 重点宫位（命宫、事业宫、财帛宫、夫妻宫）
  const keyPalaces = palaces.filter(p =>
    p.name === '命宫' ||
    p.name === '事业宫' ||
    p.name === '财帛宫' ||
    p.name === '夫妻宫'
  );

  return (
    <div className="space-y-4">
      {/* 紫微命宫头部 */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold mb-1">🌟 紫微命宫</h3>
            <p className="text-sm opacity-90">基于出生时间的命盘分析</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">命宫主星</p>
            <p className="text-lg font-semibold">{mingGong?.ganzhi || '未知'}</p>
          </div>
        </div>
      </div>

      {/* 计算元数据（可选显示，用于调试） */}
      {process.env.NODE_ENV === 'development' && metadataDisplay}

      {/* 警告信息（如果有） */}
      {warningDisplay}

      {/* 命宫总结 */}
      {summary && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/60 dark:to-purple-900/60 rounded-lg p-4 border border-indigo-200 dark:border-indigo-600">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">📊 命盘总述</h4>
          <div className="text-sm text-gray-700 dark:text-gray-200 space-y-1">
            <p>
              <span className="font-medium">整体格局：</span>
              {summary.overallStrength}
            </p>
            <p>
              <span className="font-medium">最强宫位：</span>
              {summary.strongestPalace?.name}（{summary.strongestPalace?.ganzhi}）
            </p>
            <p>
              <span className="font-medium">最弱宫位：</span>
              {summary.weakestPalace?.name}（{summary.weakestPalace?.ganzhi}）
            </p>
          </div>
        </div>
      )}

      {/* 重点宫位 */}
      <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-gray-700 dark:text-white">🎯 重点宫位</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
              isExpanded
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700/80 dark:text-gray-300'
            }`}
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keyPalaces.map((palace, index) => {
              const isWeak = ['弱', '偏弱'].includes(palace.strength.strength);
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${getCardColor(palace.strength.strength)} dark:${getCardColorDark(palace.strength.strength)} rounded-lg p-3 border transition-all hover:shadow-md ${isWeak ? 'dark:border-red-600/60' : ''}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h5 className={`text-sm font-semibold ${isWeak ? 'text-gray-900 dark:text-red-200' : 'text-gray-800 dark:text-gray-200'}`}>
                      {palace.name}
                    </h5>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${getScoreColor(palace.strength.score)} text-white`}>
                        {palace.strength.strength}
                      </span>
                    </div>
                  </div>
                  <div className={`text-xs mb-1 ${isWeak ? 'text-gray-700 dark:text-red-300/90' : 'text-gray-600 dark:text-gray-400'}`}>
                    {palace.ganzhi} · {palace.strength.element}五行
                  </div>
                  <p className={`text-xs leading-relaxed ${isWeak ? 'text-gray-900 dark:text-red-100/90' : 'text-gray-700 dark:text-gray-300'}`}>
                    {palace.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 十二宫位展开/收起 */}
      <div className="bg-white dark:bg-gray-800/90 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-gray-700 dark:text-white">🔮 十二宫位详解</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
              isExpanded
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700/80 dark:text-gray-300'
            }`}
          >
            {isExpanded ? '收起全部' : '展开全部'}
          </button>
        </div>

        {isExpanded ? (
          <div className="space-y-2">
            {palaces.map((palace, index) => {
              const isWeak = ['弱', '偏弱'].includes(palace.strength.strength);
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-r ${getCardColor(palace.strength.strength)} dark:${getCardColorDark(palace.strength.strength)} rounded-lg p-3 border transition-all hover:shadow-md ${isWeak ? 'dark:border-red-600/60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className={`text-sm font-semibold ${isWeak ? 'text-gray-900 dark:text-red-200' : 'text-gray-800 dark:text-gray-200'}`}>
                          {palace.name}
                        </h5>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${getScoreColor(palace.strength.score)} text-white`}>
                          {palace.strength.score}分
                        </span>
                        <span className={`text-xs ${isWeak ? 'text-gray-700 dark:text-red-300/90' : 'text-gray-600 dark:text-gray-400'}`}>
                          {palace.ganzhi}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isWeak ? 'text-gray-900 dark:text-red-100/90' : 'text-gray-700 dark:text-gray-300'}`}>
                        {palace.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {palaces.slice(0, 6).map((palace, index) => {
              const isWeak = ['弱', '偏弱'].includes(palace.strength.strength);
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${getCardColor(palace.strength.strength)} dark:${getCardColorDark(palace.strength.strength)} rounded-lg p-2.5 border transition-all hover:shadow-md ${isWeak ? 'dark:border-red-600/60' : ''}`}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <h5 className={`text-xs font-semibold ${isWeak ? 'text-gray-900 dark:text-red-200' : 'text-gray-800 dark:text-gray-200'}`}>
                        {palace.name}
                      </h5>
                    </div>
                    <div className={`text-xs ${isWeak ? 'text-gray-700 dark:text-red-300/90' : 'text-gray-600 dark:text-gray-400'}`}>
                      {palace.ganzhi}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 命理建议 */}
      {summary && summary.advice && summary.advice.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/50 rounded-lg p-4 border border-amber-200 dark:border-amber-600">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-3">💡 命理建议</h4>
          <div className="space-y-2">
            {summary.advice.map((advice, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded-lg ${
                  advice.type === 'success'
                    ? 'bg-green-100 dark:bg-green-900/50'
                    : advice.type === 'warning'
                      ? 'bg-red-100 dark:bg-red-900/50'
                      : 'bg-blue-100 dark:bg-blue-900/50'
                }`}
              >
                <span className="text-lg">{advice.type === 'success' ? '✅' : advice.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-0.5">
                    {advice.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {advice.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-4 border border-blue-200 dark:border-blue-600">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📜</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-white mb-1">紫微命宫说明</h4>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
              <p>• 紫微命宫基于出生时间、经纬度等精确信息计算</p>
              <p>• 十二宫位代表人生不同领域，强度分数（20-100）反映该领域的先天运势</p>
              <p>• 命宫最强代表您的先天优势领域，最弱宫位需要后天弥补</p>
              <p>• 更新出生信息后，紫微命宫将自动重新计算</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZiWeiPalaceDisplay;
