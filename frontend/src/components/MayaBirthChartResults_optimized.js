import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';

// 优化的分块渲染组件 - 使用IntersectionObserver进行懒加载
const ChunkedRenderer = memo(({ items, chunkSize = 3, renderItem, loadingComponent }) => {
  const [visibleChunks, setVisibleChunks] = useState(1);
  const observerRef = React.useRef(null);
  const sentinelRef = React.useRef(null);
  
  const chunks = useMemo(() => {
    const result = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      result.push(items.slice(i, i + chunkSize));
    }
    return result;
  }, [items, chunkSize]);

  useEffect(() => {
    // 清理之前的观察者
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // 创建新的观察者
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && visibleChunks < chunks.length) {
          // 使用requestAnimationFrame避免阻塞UI
          requestAnimationFrame(() => {
            setVisibleChunks(prev => Math.min(prev + 1, chunks.length));
          });
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '200px' // 提前200px加载，提升用户体验
    });

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observerRef.current.observe(sentinel);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleChunks, chunks.length]);

  return (
    <>
      {chunks.slice(0, visibleChunks).map((chunk, chunkIndex) => (
        <div key={chunkIndex} className="chunk-container">
          {chunk.map((item, index) => renderItem(item, chunkIndex * chunkSize + index))}
        </div>
      ))}
      {visibleChunks < chunks.length && (
        <div 
          ref={sentinelRef}
          className="h-4 flex justify-center items-center"
          aria-hidden="true"
        >
          {loadingComponent || <div className="text-center text-gray-500 animate-pulse">加载中...</div>}
        </div>
      )}
    </>
  );
});

// 优化的信息卡片组件 - 使用memo避免重渲染
const OptimizedInfoCard = memo(({ title, children, className = "" }) => (
  <div className={`bg-white p-3 border border-gray-200 ${className}`}>
    <h4 className="font-semibold text-gray-800 mb-2 text-sm">{title}</h4>
    {children}
  </div>
));

// 基础信息组件 - 使用memo和useMemo优化
const BasicInfoSection = memo(({ birthInfo }) => {
  // 优化kin计算，确保不会出现undefined
  const kinNumber = useMemo(() => {
    try {
      if (!birthInfo || !birthInfo.maya_kin) return '1';
      const kinStr = String(birthInfo.maya_kin);
      return kinStr.replace('KIN ', '').trim() || '1';
    } catch (error) {
      console.warn('Kin计算错误:', error);
      return '1';
    }
  }, [birthInfo?.maya_kin]);
  
  return (
    <OptimizedInfoCard title="基本信息" className="text-center">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full text-white flex items-center justify-center mr-3">
            <div className="text-center">
              <div className="text-lg font-bold">{kinNumber}</div>
              <div className="text-xs opacity-90">KIN</div>
            </div>
          </div>
          <div>
            <h2 className="text-md font-bold text-gray-800">{birthInfo?.maya_seal_desc || '未知印记'}</h2>
            <div className="text-xs text-gray-600">{birthInfo?.date || '未知日期'}</div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
          {birthInfo?.maya_seal || '未知印记'}
        </span>
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
          {birthInfo?.maya_tone_info?.数字 || '1'}号音
        </span>
      </div>
    </OptimizedInfoCard>
  );
});

// 印记信息组件 - 使用memo和useMemo
const SealInfoSection = memo(({ birthInfo }) => {
  return (
    <OptimizedInfoCard title="印记信息">
      <div className="space-y-2">
        <div>
          <div className="text-xs text-gray-800 font-medium mb-1">特质</div>
          <div className="text-gray-600 text-xs leading-relaxed">{birthInfo?.maya_seal_info?.特质 || ''}</div>
        </div>
        <div>
          <div className="text-xs text-gray-800 font-medium mb-1">能量</div>
          <div className="text-gray-600 text-xs leading-relaxed">{birthInfo?.maya_seal_info?.能量 || ''}</div>
        </div>
        <div>
          <div className="text-xs text-gray-800 font-medium mb-1">启示</div>
          <div className="text-gray-600 text-xs leading-relaxed">{birthInfo?.maya_seal_info?.启示 || ''}</div>
        </div>
      </div>
    </OptimizedInfoCard>
  );
});

// 音调信息组件 - 使用memo和useMemo
const ToneInfoSection = memo(({ birthInfo }) => {
  return (
    <OptimizedInfoCard title="音调信息">
      <div className="space-y-2">
        <div>
          <div className="text-xs text-gray-800 font-medium mb-1">数字能量</div>
          <div className="text-gray-600 text-xs leading-relaxed">
            第{birthInfo.maya_tone_info?.数字 || '1'}号音调代表着独特的宇宙振动频率
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-800 font-medium mb-1">行动</div>
          <div className="text-gray-600 text-xs leading-relaxed">{birthInfo.maya_tone_info?.行动 || ''}</div>
        </div>
        <div>
          <div className="text-xs text-gray-800 font-medium mb-1">启示</div>
          <div className="text-gray-600 text-xs leading-relaxed">{birthInfo.maya_tone_info?.启示 || ''}</div>
        </div>
      </div>
    </OptimizedInfoCard>
  );
});

// 每日启示组件 - 已迁移至玛雅日历页面
// 此组件在玛雅出生图中已不再使用

// 生命使命组件 - 使用memo和useMemo
const LifePurposeSection = memo(({ birthInfo }) => {
  return (
    <OptimizedInfoCard title="生命使命">
      <div className="space-y-2">
        <div>
          <div className="text-xs text-gray-600 leading-relaxed">{birthInfo.life_purpose?.summary || ''}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 leading-relaxed">{birthInfo.life_purpose?.details || ''}</div>
        </div>
        <div className="bg-blue-50 p-2 rounded">
          <div className="text-xs text-blue-700 font-medium mb-1">行动指南</div>
          <div className="text-xs text-blue-600">{birthInfo.life_purpose?.action_guide || ''}</div>
        </div>
      </div>
    </OptimizedInfoCard>
  );
});

// 个人特质组件 - 优化长列表渲染
const PersonalTraitsSection = memo(({ birthInfo }) => {
  const traits = useMemo(() => ({
    strengths: birthInfo.personal_traits?.strengths || [],
    challenges: birthInfo.personal_traits?.challenges || []
  }), [birthInfo.personal_traits]);

  // 优化渲染函数，简化样式
  const renderTraitItem = useCallback((trait, index, isStrength = true) => (
    <li key={`${isStrength ? 'strength' : 'challenge'}-${index}`} className="flex items-center text-gray-700 text-xs mb-1">
      <div className={`w-4 h-4 ${isStrength ? 'bg-green-400' : 'bg-red-400'} rounded-full flex items-center justify-center text-white text-xs font-bold mr-2`}>
        {index + 1}
      </div>
      <span className="text-gray-600">{trait}</span>
    </li>
  ), []);

  return (
    <OptimizedInfoCard title="个人特质">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-green-600 font-medium mb-2">优势</div>
          <ul className="space-y-1">
            {traits.strengths.slice(0, 3).map((trait, index) => renderTraitItem(trait, index, true))}
          </ul>
        </div>
        <div>
          <div className="text-xs text-red-600 font-medium mb-2">挑战</div>
          <ul className="space-y-1">
            {traits.challenges.slice(0, 3).map((trait, index) => renderTraitItem(trait, index, false))}
          </ul>
        </div>
      </div>
    </OptimizedInfoCard>
  );
});

// 能量场信息组件 - 使用memo和useMemo
const EnergyFieldSection = memo(({ birthInfo }) => {
  return (
    <OptimizedInfoCard title="出生能量场">
      <div className="space-y-2">
        <div>
          <div className="text-xs text-indigo-600 font-medium mb-1">主要能量场</div>
          <div className="text-xs text-gray-600 mb-1">{birthInfo.birth_energy_field?.primary?.type || ''}</div>
          <div className="text-xs text-gray-500">{birthInfo.birth_energy_field?.primary?.info?.描述 || ''}</div>
        </div>
        <div>
          <div className="text-xs text-purple-600 font-medium mb-1">次要能量场</div>
          <div className="text-xs text-gray-600 mb-1">{birthInfo.birth_energy_field?.secondary?.type || ''}</div>
          <div className="text-xs text-gray-500">{birthInfo.birth_energy_field?.secondary?.info?.描述 || ''}</div>
        </div>
        <div className="bg-blue-50 p-2 rounded">
          <div className="text-xs text-blue-700 font-medium mb-1">平衡建议</div>
          <div className="text-xs text-blue-600">{birthInfo.birth_energy_field?.balance_suggestion || ''}</div>
        </div>
      </div>
    </OptimizedInfoCard>
  );
});

// 主组件 - 优化渲染和性能
const ResultsSection = memo(({ birthInfo, showResults }) => {
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameRef = React.useRef(null);
  const timeoutRef = React.useRef(null);

  // 按渲染优先级排序的组件列表，关键内容优先渲染
  const sections = useMemo(() => [
    { component: BasicInfoSection, key: 'basic' },
    { component: SealInfoSection, key: 'seal' },
    { component: ToneInfoSection, key: 'tone' },
    { component: LifePurposeSection, key: 'purpose' },
    { component: PersonalTraitsSection, key: 'traits' },
    { component: EnergyFieldSection, key: 'energy' }
    // 今日启示模块已迁移至玛雅日历页面
  ], []);

  // 优化渲染函数
  const renderSection = useCallback((section, index) => {
    const Component = section.component;
    return (
      <div key={section.key} className="fade-in-section">
        <Component birthInfo={birthInfo} />
      </div>
    );
  }, [birthInfo]);

  useEffect(() => {
    // 清理之前的定时器和动画帧
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (showResults && birthInfo) {
      // 使用requestAnimationFrame + setTimeout双重优化，确保不阻塞主线程
      animationFrameRef.current = requestAnimationFrame(() => {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(true);
        }, 50); // 减少延迟时间，提升响应速度
      });
    } else {
      setIsVisible(false);
    }
    
    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showResults, birthInfo]);

  if (!showResults || !birthInfo || !isVisible) {
    return null;
  }

  return (
    <div className="birth-chart-results">
      <h3 className="text-lg font-bold text-center text-gray-800 mb-4">玛雅出生图结果</h3>
      
      <div className="birth-info space-y-4">
        <ChunkedRenderer
          items={sections}
          chunkSize={2} // 每次渲染2个区块，平衡性能和用户体验
          renderItem={renderSection}
          loadingComponent={
            <div className="flex justify-center py-4">
              <div className="animate-pulse bg-gray-200 rounded h-4 w-24"></div>
            </div>
          }
        />
      </div>
    </div>
  );
});

// 添加显示名称，便于调试
ResultsSection.displayName = 'ResultsSection';

export default ResultsSection;