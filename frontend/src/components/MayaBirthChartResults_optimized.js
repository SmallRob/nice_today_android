import React, { useState, useMemo, useCallback, memo } from 'react';

// 优化的分块渲染组件 - 使用IntersectionObserver进行懒加载
const ChunkedRenderer = memo(({ items, chunkSize = 3, renderItem, loadingComponent }) => {
  const [visibleChunks, setVisibleChunks] = useState(1);
  const observerRef = React.useRef(null);
  const sentinelRef = React.useRef(null);
  
  // 优化chunks计算，避免不必要的重新计算
  const chunks = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      result.push(items.slice(i, i + chunkSize));
    }
    return result;
  }, [items, chunkSize]);

  React.useEffect(() => {
    // 清理之前的观察者
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // 如果所有内容都已显示，不需要观察器
    if (visibleChunks >= chunks.length) {
      return;
    }
    
    // 创建新的观察者
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && visibleChunks < chunks.length) {
          // 使用requestIdleCallback推迟非紧急更新
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
              setVisibleChunks(prev => Math.min(prev + 1, chunks.length));
            }, { timeout: 500 });
          } else {
            // 降级到setTimeout
            setTimeout(() => {
              setVisibleChunks(prev => Math.min(prev + 1, chunks.length));
            }, 0);
          }
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '100px' // 减少提前加载距离，节省资源
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

// 优化的信息卡片组件 - 紧凑设计，增强选择指示
const OptimizedInfoCard = memo(({ title, children, className = "", isActive = false }) => (
  <div className={`bg-white dark:bg-gray-800 p-3 border ${
    isActive 
      ? 'border-purple-500 shadow-md shadow-purple-100 dark:shadow-purple-900/20' 
      : 'border-gray-200 dark:border-gray-600'
  } rounded-lg transition-all ${className}`}>
    {title && (
      <h4 className={`font-semibold mb-2 text-sm ${
        isActive 
          ? 'text-purple-700 dark:text-purple-400' 
          : 'text-gray-800 dark:text-white'
      }`}>{title}</h4>
    )}
    {children}
  </div>
));

// 基础信息组件 - 紧凑设计，增强高亮效果
const BasicInfoSection = memo(({ birthInfo }) => {
  // 简化kin计算，直接从birthInfo中提取
  const kinNumber = useMemo(() => {
    try {
      if (!birthInfo || !birthInfo.maya_kin) return '1';
      // 直接从maya_kin字段提取数字，例如"KIN 123" -> "123"
      const kinStr = String(birthInfo.maya_kin);
      const match = kinStr.match(/KIN\s*(\d+)/i);
      return match ? match[1] : '1';
    } catch (error) {
      console.warn('Kin提取错误:', error);
      return '1';
    }
  }, [birthInfo]);
  
  return (
    <OptimizedInfoCard title="基本信息" className="text-center" isActive={true}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-full text-white flex items-center justify-center mr-3 shadow-md">
            <div className="text-center">
              <div className="text-base font-bold">{kinNumber || '1'}</div>
              <div className="text-xs opacity-90">KIN</div>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800 dark:text-white">
              {birthInfo?.maya_seal_desc || birthInfo?.fullName || '未知印记'}
            </h2>
            <div className="text-xs text-gray-600 dark:text-gray-400">{birthInfo?.date || '未知日期'}</div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-2 justify-center">
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium shadow-sm">
          {birthInfo?.maya_seal || '未知印记'}
        </span>
        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium shadow-sm">
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
          <div className="text-xs text-gray-800 dark:text-gray-200 font-medium mb-1">特质</div>
          <div className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{birthInfo?.maya_seal_info?.特质 || '连接宇宙能量的通道'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-800 dark:text-gray-200 font-medium mb-1">能量</div>
          <div className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{birthInfo?.maya_seal_info?.能量 || '激活内在潜能的力量'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-800 dark:text-gray-200 font-medium mb-1">启示</div>
          <div className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{birthInfo?.maya_seal_info?.启示 || '开启灵性成长的大门'}</div>
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
          <div className="text-xs text-gray-800 dark:text-gray-200 font-medium mb-1">数字能量</div>
          <div className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
            第{birthInfo.maya_tone_info?.数字 || '1'}号音调代表着独特的宇宙振动频率
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-800 dark:text-gray-200 font-medium mb-1">行动</div>
          <div className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{birthInfo.maya_tone_info?.行动 || '和谐共振，创造平衡'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-800 dark:text-gray-200 font-medium mb-1">启示</div>
          <div className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{birthInfo.maya_tone_info?.启示 || '聆听内在智慧的声音'}</div>
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
          <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{birthInfo.life_purpose?.summary || '探索你的生命使命...'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{birthInfo.life_purpose?.details || '发现你独特的人生道路和目标'}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
          <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">行动指南</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">{birthInfo.life_purpose?.action_guide || '跟随内心指引，实践你的天赋'}</div>
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

  // 优化渲染函数，简化样式，适配主题
  const renderTraitItem = useCallback((trait, index, isStrength = true) => (
    <li key={`${isStrength ? 'strength' : 'challenge'}-${index}`} className="flex items-center text-gray-700 dark:text-gray-300 text-xs mb-1">
      <div className={`w-4 h-4 ${isStrength ? 'bg-green-400 dark:bg-green-500' : 'bg-red-400 dark:bg-red-500'} rounded-full flex items-center justify-center text-white text-xs font-bold mr-2`}>
        {index + 1}
      </div>
      <span className="text-gray-600 dark:text-gray-400">{trait || (isStrength ? '积极主动' : '需要平衡')}</span>
    </li>
  ), []);

  return (
    <OptimizedInfoCard title="个人特质">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-2">优势</div>
          <ul className="space-y-1">
            {traits.strengths.slice(0, 3).map((trait, index) => renderTraitItem(trait, index, true))}
          </ul>
        </div>
        <div>
          <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-2">挑战</div>
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
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">主要能量场</div>
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">{birthInfo.birth_energy_field?.primary?.type || '个人能量场'}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{birthInfo.birth_energy_field?.primary?.info?.描述 || '反映个人状态的能场'}</div>
        </div>
        <div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">次要能量场</div>
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">{birthInfo.birth_energy_field?.secondary?.type || '创造能量场'}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{birthInfo.birth_energy_field?.secondary?.info?.描述 || '与创造力相关的能场'}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
          <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">平衡建议</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">{birthInfo.birth_energy_field?.balance_suggestion || '平衡能量发挥潜能'}</div>
        </div>
      </div>
    </OptimizedInfoCard>
  );
});

// 主组件 - 紧凑设计版本
const ResultsSection = memo(({ birthInfo, showResults }) => {
  // 按渲染优先级排序的组件列表
  const sections = useMemo(() => [
    { component: BasicInfoSection, key: 'basic', isActive: true },
    { component: SealInfoSection, key: 'seal' },
    { component: ToneInfoSection, key: 'tone' },
    { component: LifePurposeSection, key: 'purpose' },
    { component: PersonalTraitsSection, key: 'traits' },
    { component: EnergyFieldSection, key: 'energy' }
  ], []);

  // 简化渲染函数 - 增强选择指示
  const renderSection = useCallback((section) => {
    const Component = section.component;
    return (
      <div key={section.key} className="transition-all hover:shadow-md">
        <Component birthInfo={birthInfo} isActive={section.isActive} />
      </div>
    );
  }, [birthInfo]);

  if (!showResults || !birthInfo) {
    return null;
  }

  return (
    <div className="space-y-2">
      <ChunkedRenderer
        items={sections}
        chunkSize={3}
        renderItem={renderSection}
        loadingComponent={
          <div className="flex justify-center py-2">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-2 w-20"></div>
          </div>
        }
      />
    </div>
  );
});

// 添加显示名称，便于调试
ResultsSection.displayName = 'ResultsSection';

export default ResultsSection;