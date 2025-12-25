import React, { useState, useEffect } from 'react';

/**
 * 紫微命宫展示组件
 */
const ZiWeiPalaceDisplay = ({ ziweiData, birthDate, birthTime, longitude }) => {
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // 宫位卡片颜色配置
  const getCardColor = (strength) => {
    switch (strength) {
      case '强':
      case '偏强':
        return 'from-green-50 to-emerald-50 border-green-200';
      case '弱':
      case '偏弱':
        return 'from-red-50 to-rose-50 border-red-200';
      default:
        return 'from-blue-50 to-indigo-50 border-blue-200';
    }
  };

  const getCardColorDark = (strength) => {
    switch (strength) {
      case '强':
      case '偏强':
        return 'from-green-900/30 to-emerald-900/30 border-green-700';
      case '弱':
      case '偏弱':
        return 'from-red-900/30 to-rose-900/30 border-red-700';
      default:
        return 'from-blue-900/30 to-indigo-900/30 border-blue-700';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!ziweiData || !ziweiData.palaces) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <p>请先设置完整的出生信息以查看紫微命宫</p>
        <p className="text-xs mt-2">需要：出生日期、时辰、经纬度</p>
      </div>
    );
  }

  const { palaces, mingGong, summary } = ziweiData;

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

      {/* 命宫总结 */}
      {summary && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📊 命盘总述</h4>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300">🎯 重点宫位</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
              isExpanded
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keyPalaces.map((palace, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${getCardColor(palace.strength.strength)} dark:${getCardColorDark(palace.strength.strength)} rounded-lg p-3 border transition-all hover:shadow-md`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{palace.name}</h5>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${getScoreColor(palace.strength.score)} text-white`}>
                      {palace.strength.strength}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {palace.ganzhi} · {palace.strength.element}五行
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {palace.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 十二宫位展开/收起 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300">🔮 十二宫位详解</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
              isExpanded
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isExpanded ? '收起全部' : '展开全部'}
          </button>
        </div>

        {isExpanded ? (
          <div className="space-y-2">
            {palaces.map((palace, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r ${getCardColor(palace.strength.strength)} dark:${getCardColorDark(palace.strength.strength)} rounded-lg p-3 border transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{palace.name}</h5>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${getScoreColor(palace.strength.score)} text-white`}>
                        {palace.strength.score}分
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {palace.ganzhi}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {palace.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {palaces.slice(0, 6).map((palace, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${getCardColor(palace.strength.strength)} dark:${getCardColorDark(palace.strength.strength)} rounded-lg p-2.5 border transition-all hover:shadow-md`}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-200">{palace.name}</h5>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {palace.ganzhi}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 命理建议 */}
      {summary && summary.advice && summary.advice.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">💡 命理建议</h4>
          <div className="space-y-2">
            {summary.advice.map((advice, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded-lg ${
                  advice.type === 'success'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : advice.type === 'warning'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                }`}
              >
                <span className="text-lg">{advice.type === 'success' ? '✅' : advice.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-0.5">
                    {advice.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {advice.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📜</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">紫微命宫说明</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
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
