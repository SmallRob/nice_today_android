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
 * 增强不透明度、对比度和渐变效果
 */
const getCardColorDark = (strength) => {
  switch (strength) {
    case '强': return 'from-green-800/90 to-emerald-900/90 dark:border-green-400/60 dark:shadow-green-900/30';
    case '偏强': return 'from-blue-800/90 to-indigo-900/90 dark:border-blue-400/60 dark:shadow-blue-900/30';
    case '中偏强': return 'from-indigo-800/90 to-purple-900/90 dark:border-indigo-400/60 dark:shadow-indigo-900/30';
    case '中': return 'from-gray-700/90 to-slate-800/90 dark:border-gray-400/60 dark:shadow-gray-800/30';
    case '偏弱': return 'from-orange-800/90 to-amber-900/90 dark:border-orange-400/60 dark:shadow-orange-900/30';
    case '弱': return 'from-red-800/90 to-rose-900/90 dark:border-red-400/60 dark:shadow-red-900/30';
    default: return 'from-gray-700/90 to-slate-800/90 dark:border-gray-400/60 dark:shadow-gray-800/30';
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
        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/80 dark:to-rose-900/80 rounded-2xl p-5 border border-red-200 dark:border-red-600/70 shadow-lg dark:shadow-xl backdrop-blur-sm">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">⚠️</span>
            <h4 className="text-base font-bold text-red-700 dark:text-red-300">计算错误</h4>
          </div>
          <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
            <p className="font-medium">{ziweiData.error}</p>
            <p className="text-xs opacity-90 bg-red-100/50 dark:bg-red-800/50 rounded-lg p-3 border border-red-300/50 dark:border-red-700/50">
              💡 建议：请检查出生日期、时间和经纬度是否正确
            </p>
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
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/80 dark:to-amber-900/80 rounded-2xl p-5 border border-orange-200 dark:border-orange-600/70 shadow-lg dark:shadow-xl backdrop-blur-sm">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">📋</span>
            <h4 className="text-base font-bold text-orange-700 dark:text-orange-300">缺少必要信息</h4>
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300">
            <p className="mb-3 font-medium">请完善以下信息以计算紫微命盘：</p>
            <ul className="space-y-2">
              {ziweiData.missingFields.map(field => (
                <li key={field} className="flex items-center gap-2 bg-orange-100/50 dark:bg-orange-800/50 rounded-lg p-2.5 border border-orange-300/50 dark:border-orange-700/50">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">●</span>
                  <span className="font-medium">{fieldNames[field] || field}</span>
                </li>
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
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/80 dark:to-amber-900/80 rounded-2xl p-5 border border-yellow-200 dark:border-yellow-600/70 shadow-lg dark:shadow-xl backdrop-blur-sm">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl">⚡</span>
          <h4 className="text-base font-bold text-yellow-800 dark:text-yellow-300">数据质量警告</h4>
        </div>
        <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
          {allWarnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-3 bg-yellow-100/50 dark:bg-yellow-800/50 rounded-xl p-3 border border-yellow-300/50 dark:border-yellow-700/50">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <p className="leading-relaxed">{warning.message}</p>
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
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/80 dark:to-slate-800/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-600 shadow-md dark:shadow-xl backdrop-blur-sm">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          计算参数
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 dark:text-gray-300">
          <div className="bg-white/60 dark:bg-gray-700/50 rounded-lg p-2.5 border border-gray-200 dark:border-gray-600">
            <span className="text-gray-500 dark:text-gray-400">出生日期：</span>
            <span className="font-semibold ml-1">{birthDate}</span>
          </div>
          <div className="bg-white/60 dark:bg-gray-700/50 rounded-lg p-2.5 border border-gray-200 dark:border-gray-600">
            <span className="text-gray-500 dark:text-gray-400">出生时间：</span>
            <span className="font-semibold ml-1">{birthTime}</span>
          </div>
          <div className="bg-white/60 dark:bg-gray-700/50 rounded-lg p-2.5 border border-gray-200 dark:border-gray-600">
            <span className="text-gray-500 dark:text-gray-400">经度：</span>
            <span className="font-semibold ml-1">{longitude?.toFixed(4)}°</span>
          </div>
          <div className="bg-white/60 dark:bg-gray-700/50 rounded-lg p-2.5 border border-gray-200 dark:border-gray-600">
            <span className="text-gray-500 dark:text-gray-400">纬度：</span>
            <span className="font-semibold ml-1">{latitude?.toFixed(4)}°</span>
          </div>
          <div className="col-span-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-lg p-2.5 border border-purple-200 dark:border-purple-700/50">
            <span className="text-purple-600 dark:text-purple-400 font-bold">真太阳时：</span>
            <span className="font-bold ml-1 text-purple-800 dark:text-purple-300">{trueSolarTime}</span>
          </div>
        </div>
      </div>
    );
  };

  // 显示加载或空状态
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50"></div>
          <div className="relative animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 dark:border-purple-500 shadow-lg"></div>
        </div>
        <p className="mt-6 text-base font-medium text-gray-600 dark:text-gray-400">正在计算紫微命盘...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">基于出生时间、经纬度等信息</p>
      </div>
    );
  }

  if (!ziweiData) {
    return (
      <div className="text-center py-10">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 rounded-2xl p-8 border border-purple-200 dark:border-purple-700/50 shadow-lg dark:shadow-xl backdrop-blur-sm max-w-md mx-auto">
          <div className="text-6xl mb-4">🔮</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">请设置完整的出生信息</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">需要完善以下信息以查看紫微命宫</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">出生日期</span>
            <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">出生时辰</span>
            <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">经纬度</span>
          </div>
        </div>
      </div>
    );
  }

  // 显示错误状态
  const errorDisplay = getErrorDisplay();
  if (errorDisplay) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-700 dark:via-pink-700 dark:to-rose-700 rounded-2xl p-5 text-white shadow-xl dark:shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-1 flex items-center">
                <span className="mr-2">🌟</span>
                紫微命宫
              </h3>
              <p className="text-sm opacity-95 font-medium">基于出生时间的命盘分析</p>
            </div>
          </div>
        </div>
        {errorDisplay}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/80 dark:to-indigo-900/80 rounded-2xl p-5 border border-blue-200 dark:border-blue-600/70 shadow-lg dark:shadow-xl backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <span className="text-3xl flex-shrink-0">💡</span>
            <div className="flex-1">
              <h4 className="text-base font-bold text-gray-800 dark:text-white mb-3">如何修复</h4>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <p className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mr-2 flex-shrink-0">•</span>
                  <span>确保出生日期格式为 <span className="font-semibold">YYYY-MM-DD</span>（如：1991-04-30）</span>
                </p>
                <p className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mr-2 flex-shrink-0">•</span>
                  <span>确保出生时间格式为 <span className="font-semibold">HH:MM</span>（如：12:30）</span>
                </p>
                <p className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mr-2 flex-shrink-0">•</span>
                  <span>确保经纬度在有效范围内（经度：<span className="font-semibold">-180 到 180</span>，纬度：<span className="font-semibold">-90 到 90</span>）</span>
                </p>
                <p className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mr-2 flex-shrink-0">•</span>
                  <span>建议使用"编辑"按钮修改配置后保存</span>
                </p>
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
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-700 dark:via-pink-700 dark:to-rose-700 rounded-2xl p-5 text-white shadow-xl dark:shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-1 flex items-center">
                <span className="mr-2">🌟</span>
                紫微命宫
              </h3>
              <p className="text-sm opacity-95 font-medium">基于出生时间的命盘分析</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/80 dark:to-amber-900/80 rounded-2xl p-5 border border-orange-200 dark:border-orange-600/70 shadow-lg dark:shadow-xl backdrop-blur-sm">
          <div className="flex items-start gap-4 mb-3">
            <span className="text-3xl flex-shrink-0">⚠️</span>
            <div>
              <h4 className="text-base font-bold text-orange-700 dark:text-orange-300">数据不完整</h4>
              <div className="text-sm text-orange-600 dark:text-orange-300">
                <p>紫微命盘数据不完整或计算失败。</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-100/50 dark:bg-orange-800/50 rounded-xl p-4 border border-orange-300/50 dark:border-orange-700/50">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
                请检查出生信息是否完整，或点击"刷新八字信息"按钮重新计算
              </p>
            </div>
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
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-700 dark:via-pink-700 dark:to-rose-700 rounded-2xl p-5 text-white shadow-xl dark:shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold mb-1 flex items-center">
              <span className="mr-2">🌟</span>
              紫微命宫
            </h3>
            <p className="text-sm opacity-95 font-medium">基于出生时间的命盘分析</p>
          </div>
          <div className="text-right bg-white/10 dark:bg-black/20 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-xs opacity-90 mb-1">命宫主星</p>
            <p className="text-xl font-bold tracking-wide">{mingGong?.ganzhi || '未知'}</p>
          </div>
        </div>
      </div>

      {/* 计算元数据（可选显示，用于调试） */}
      {process.env.NODE_ENV === 'development' && metadataDisplay}

      {/* 警告信息（如果有） */}
      {warningDisplay}

      {/* 命宫总结 */}
      {summary && (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/80 dark:via-purple-900/80 dark:to-pink-900/80 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-600/70 shadow-md dark:shadow-xl backdrop-blur-sm">
          <h4 className="text-base font-bold text-gray-800 dark:text-white mb-3 flex items-center">
            <span className="mr-2">📊</span>
            命盘总述
          </h4>
          <div className="text-sm text-gray-700 dark:text-gray-200 space-y-2">
            <p className="flex items-center">
              <span className="w-20 font-semibold text-indigo-600 dark:text-indigo-400">整体格局：</span>
              <span className="font-medium">{summary.overallStrength}</span>
            </p>
            <p className="flex items-center">
              <span className="w-20 font-semibold text-emerald-600 dark:text-emerald-400">最强宫位：</span>
              <span className="font-medium">{summary.strongestPalace?.name}（{summary.strongestPalace?.ganzhi}）</span>
            </p>
            <p className="flex items-center">
              <span className="w-20 font-semibold text-orange-600 dark:text-orange-400">最弱宫位：</span>
              <span className="font-medium">{summary.weakestPalace?.name}（{summary.weakestPalace?.ganzhi}）</span>
            </p>
          </div>
        </div>
      )}

      {/* 重点宫位 */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-gray-700 dark:text-white">🎯 重点宫位</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95 ${
              isExpanded
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white dark:from-purple-600 dark:to-indigo-600 shadow-md hover:shadow-lg'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200 hover:shadow-md'
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
                  className={`relative overflow-hidden bg-gradient-to-br ${getCardColor(palace.strength.strength)} dark:${getCardColorDark(palace.strength.strength)} rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] ${isWeak ? 'dark:border-red-500/60' : ''}`}
                >
                  {/* 装饰性光泽 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none dark:from-white/5"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className={`text-sm font-bold ${isWeak ? 'text-gray-900 dark:text-red-300' : 'text-gray-800 dark:text-gray-100'}`}>
                        {palace.name}
                      </h5>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getScoreColor(palace.strength.score)} text-white shadow-sm`}>
                          {palace.strength.strength}
                        </span>
                      </div>
                    </div>
                    <div className={`text-xs mb-1 font-medium ${isWeak ? 'text-gray-700 dark:text-red-400/90' : 'text-gray-600 dark:text-gray-400'}`}>
                      {palace.ganzhi} · {palace.strength.element}五行
                    </div>
                    <p className={`text-xs leading-relaxed ${isWeak ? 'text-gray-800 dark:text-red-200/90' : 'text-gray-700 dark:text-gray-300'}`}>
                      {palace.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 十二宫位展开/收起 */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-gray-700 dark:text-white">🔮 十二宫位详解</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95 ${
              isExpanded
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white dark:from-purple-600 dark:to-indigo-600 shadow-md hover:shadow-lg'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200 hover:shadow-md'
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
                  className={`relative overflow-hidden bg-gradient-to-r ${getCardColor(palace.strength.strength)} dark:${getCardColorDark(palace.strength.strength)} rounded-xl p-3.5 border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.01] ${isWeak ? 'dark:border-red-500/60' : ''}`}
                >
                  {/* 装饰性光泽 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none dark:from-white/5"></div>
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h5 className={`text-sm font-bold ${isWeak ? 'text-gray-900 dark:text-red-300' : 'text-gray-800 dark:text-gray-100'}`}>
                          {palace.name}
                        </h5>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getScoreColor(palace.strength.score)} text-white shadow-sm`}>
                          {palace.strength.score}分
                        </span>
                        <span className={`text-xs font-semibold ${isWeak ? 'text-gray-700 dark:text-red-400/90' : 'text-gray-600 dark:text-gray-400'}`}>
                          {palace.ganzhi}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isWeak ? 'text-gray-800 dark:text-red-200/90' : 'text-gray-700 dark:text-gray-300'}`}>
                        {palace.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {palaces.slice(0, 6).map((palace, index) => {
              const isWeak = ['弱', '偏弱'].includes(palace.strength.strength);
              return (
                <div
                  key={index}
                  className={`relative overflow-hidden bg-gradient-to-br ${getCardColor(palace.strength.strength)} dark:${getCardColorDark(palace.strength.strength)} rounded-xl p-3 border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] ${isWeak ? 'dark:border-red-500/60' : ''}`}
                >
                  {/* 装饰性光泽 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none dark:from-white/5"></div>
                  <div className="relative z-10 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1.5">
                      <h5 className={`text-xs font-bold ${isWeak ? 'text-gray-900 dark:text-red-300' : 'text-gray-800 dark:text-gray-100'}`}>
                        {palace.name}
                      </h5>
                    </div>
                    <div className={`text-xs font-semibold ${isWeak ? 'text-gray-700 dark:text-red-400/90' : 'text-gray-600 dark:text-gray-400'}`}>
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
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/80 dark:to-yellow-900/80 rounded-2xl p-5 border border-amber-200 dark:border-amber-600/70 shadow-md dark:shadow-xl backdrop-blur-sm">
          <h4 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <span className="mr-2">💡</span>
            命理建议
          </h4>
          <div className="space-y-2.5">
            {summary.advice.map((advice, index) => (
              <div
                key={index}
                className={`relative overflow-hidden flex items-start gap-3 p-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                  advice.type === 'success'
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/70 dark:to-emerald-900/70 border border-green-200 dark:border-green-600/50'
                    : advice.type === 'warning'
                      ? 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/70 dark:to-rose-900/70 border border-red-200 dark:border-red-600/50'
                      : 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/70 dark:to-indigo-900/70 border border-blue-200 dark:border-blue-600/50'
                }`}
              >
                {/* 装饰性光泽 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none dark:from-white/5"></div>
                <span className="relative z-10 text-xl flex-shrink-0">{advice.type === 'success' ? '✅' : advice.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <div className="relative z-10 flex-1">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                    {advice.title}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {advice.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/80 dark:to-indigo-900/80 rounded-2xl p-5 border border-blue-200 dark:border-blue-600/70 shadow-md dark:shadow-xl backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <span className="text-3xl flex-shrink-0">📜</span>
          <div className="flex-1">
            <h4 className="text-base font-bold text-gray-800 dark:text-white mb-3">紫微命宫说明</h4>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <p className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 font-semibold mr-2 flex-shrink-0">•</span>
                <span>紫微命宫基于出生时间、经纬度等精确信息计算</span>
              </p>
              <p className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 font-semibold mr-2 flex-shrink-0">•</span>
                <span>十二宫位代表人生不同领域，强度分数（20-100）反映该领域的先天运势</span>
              </p>
              <p className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 font-semibold mr-2 flex-shrink-0">•</span>
                <span>命宫最强代表您的先天优势领域，最弱宫位需要后天弥补</span>
              </p>
              <p className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 font-semibold mr-2 flex-shrink-0">•</span>
                <span>更新出生信息后，紫微命宫将自动重新计算</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZiWeiPalaceDisplay;
