import React, { useState, useCallback, useMemo, memo } from 'react';
import '../styles/chinese-zodiac-icons.css';

/**
 * 炫彩生肖选择器组件
 * 使用生肖第一个汉字生成图标，采用炫彩配色方案
 */
const ChineseZodiacSelector = ({
  selectedZodiac = '',
  onZodiacChange,
  size = 'md',
  showLabels = true,
  gridLayout = '4',
  className = ''
}) => {
  // 生肖列表数据
  const zodiacs = useMemo(() => [
    { id: '鼠', name: '鼠', character: '鼠', element: '水', description: '机智灵活，善于变通' },
    { id: '牛', name: '牛', character: '牛', element: '土', description: '勤劳踏实，稳重可靠' },
    { id: '虎', name: '虎', character: '虎', element: '木', description: '勇敢果断，充满活力' },
    { id: '兔', name: '兔', character: '兔', element: '木', description: '温和优雅，心思细腻' },
    { id: '龙', name: '龙', character: '龙', element: '土', description: '威严尊贵，充满力量' },
    { id: '蛇', name: '蛇', character: '蛇', element: '火', description: '智慧神秘，善于观察' },
    { id: '马', name: '马', character: '马', element: '火', description: '自由奔放，热情洋溢' },
    { id: '羊', name: '羊', character: '羊', element: '土', description: '温和善良，富有同情心' },
    { id: '猴', name: '猴', character: '猴', element: '金', description: '聪明伶俐，善于交际' },
    { id: '鸡', name: '鸡', character: '鸡', element: '金', description: '勤奋努力，追求完美' },
    { id: '狗', name: '狗', character: '狗', element: '土', description: '忠诚可靠，重情重义' },
    { id: '猪', name: '猪', character: '猪', element: '水', description: '乐观豁达，福气满满' }
  ], []);

  // 本地选中状态管理
  const [localSelected, setLocalSelected] = useState(selectedZodiac);

  // 同步外部属性到本地状态
  React.useEffect(() => {
    if (selectedZodiac !== localSelected) {
      setLocalSelected(selectedZodiac);
    }
  }, [selectedZodiac]);

  // 处理生肖选择
  const handleZodiacSelect = useCallback((zodiac) => {
    setLocalSelected(zodiac);
    if (onZodiacChange) {
      onZodiacChange(zodiac);
    }
  }, [onZodiacChange]);

  // 根据尺寸获取对应的CSS类名
  const getSizeClass = useCallback((size) => {
    switch (size) {
      case 'sm': return 'chinese-zodiac-icon-sm';
      case 'lg': return 'chinese-zodiac-icon-lg';
      case 'xl': return 'chinese-zodiac-icon-xl';
      default: return 'chinese-zodiac-icon-md';
    }
  }, []);

  // 根据网格布局获取对应的CSS类名
  const getGridClass = useCallback((layout) => {
    switch (layout) {
      case '3': return 'chinese-zodiac-grid-3';
      case '6': return 'chinese-zodiac-grid-6';
      default: return 'chinese-zodiac-grid';
    }
  }, []);

  // 渲染单个生肖图标
  const renderZodiacIcon = useCallback((zodiac) => {
    const isSelected = localSelected === zodiac.id;
    const sizeClass = getSizeClass(size);

    return (
      <div
        key={zodiac.id}
        className={`chinese-zodiac-icon-container ${isSelected ? 'selected' : ''}`}
        onClick={() => handleZodiacSelect(zodiac.id)}
        title={`${zodiac.name} - ${zodiac.description}`}
      >
        <div
          className={`chinese-zodiac-icon ${sizeClass} chinese-zodiac-icon-${zodiac.id} ${isSelected ? 'selected' : ''}`}
          data-zodiac={zodiac.id}
          data-element={zodiac.element}
        >
          {zodiac.character}
        </div>
        {showLabels && (
          <span className="chinese-zodiac-icon-label">
            {zodiac.name}
          </span>
        )}
      </div>
    );
  }, [localSelected, size, showLabels, getSizeClass, handleZodiacSelect]);

  return (
    <div className={`chinese-zodiac-selector ${className}`}>
      <div className={getGridClass(gridLayout)}>
        {zodiacs.map(renderZodiacIcon)}
      </div>

      {/* 选中生肖的详细信息 */}
      {localSelected && (
        <div className="mt-6 p-5 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 shadow-lg shadow-blue-500/5 transition-all animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className={`relative chinese-zodiac-icon chinese-zodiac-icon-lg chinese-zodiac-icon-${localSelected} selected shadow-xl`}>
                {zodiacs.find(z => z.id === localSelected)?.character}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {zodiacs.find(z => z.id === localSelected)?.name}
                </h3>
                <span className="px-2.5 py-0.5 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full border border-blue-200/50 dark:border-blue-800/30 uppercase tracking-widest">
                  {zodiacs.find(z => z.id === localSelected)?.element} 元素
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                {zodiacs.find(z => z.id === localSelected)?.description}
              </p>
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-3 mt-1">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 bg-blue-400 dark:bg-blue-600 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-white"></div>
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">Energy Level Optimized</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ChineseZodiacSelector);