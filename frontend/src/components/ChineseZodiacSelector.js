import React, { useState, useCallback, useMemo } from 'react';
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
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
          <div className="flex items-center justify-center space-x-3">
            <div className={`chinese-zodiac-icon chinese-zodiac-icon-lg chinese-zodiac-icon-${localSelected} selected`}>
              {zodiacs.find(z => z.id === localSelected)?.character}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {zodiacs.find(z => z.id === localSelected)?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {zodiacs.find(z => z.id === localSelected)?.description}
              </p>
              <span className="inline-block mt-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                {zodiacs.find(z => z.id === localSelected)?.element} 元素
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChineseZodiacSelector;