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
  <div className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm ${className}`}>
    <h4 className="font-semibold text-gray-800 mb-3 text-base">{title}</h4>
    {children}
  </div>
));

// 基础信息组件 - 使用memo和useMemo优化
const BasicInfoSection = memo(({ birthInfo }) => {
  const kinNumber = useMemo(() => {
    return birthInfo.maya_kin?.replace('KIN ', '') || '1';
  }, [birthInfo.maya_kin]);
  
  const sealBadge = useMemo(() => (
    <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
      {birthInfo.maya_seal || ''}
    </span>
  ), [birthInfo.maya_seal]);
  
  const toneBadge = useMemo(() => (
    <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium">
      {birthInfo.maya_tone_info?.数字 || '1'}号音
    </span>
  ), [birthInfo.maya_tone_info?.数字]);
  
  return (
    <OptimizedInfoCard title="基本信息" className="text-center">
      <div className="mb-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full text-white mb-3">
          <div className="text-center">
            <div className="text-lg font-bold">{kinNumber}</div>
            <div className="text-xs opacity-90">KIN</div>
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{birthInfo.maya_seal_desc}</h2>
        <div className="flex justify-center space-x-2 mb-3">
          {sealBadge}
          {toneBadge}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600">日期</div>
          <div className="font-medium">{birthInfo.date}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm text-gray-600">星期</div>
          <div className="font-medium">{birthInfo.weekday}</div>
        </div>
      </div>
    </OptimizedInfoCard>
  );
});

// 印记信息组件 - 使用memo和useMemo
const SealInfoSection = memo(({ birthInfo }) => {
  const traitsInfo = useMemo(() => (
    <div className="bg-blue-50 p-3 rounded">
      <div className="text-sm text-blue-800 font-medium mb-1">特质</div>
      <div className="text-gray-700">{birthInfo.maya_seal_info?.特质 || ''}</div>
    </div>
  ), [birthInfo.maya_seal_info?.特质]);
  
  const energyInfo = useMemo(() => (
    <div className="bg-green-50 p-3 rounded">
      <div className="text-sm text-green-800 font-medium mb-1">能量</div>
      <div className="text-gray-700">{birthInfo.maya_seal_info?.能量 || ''}</div>
    </div>
  ), [birthInfo.maya_seal_info?.能量]);
  
  const revelationInfo = useMemo(() => (
    <div className="bg-purple-50 p-3 rounded">
      <div className="text-sm text-purple-800 font-medium mb-1">启示</div>
      <div className="text-gray-700">{birthInfo.maya_seal_info?.启示 || ''}</div>
    </div>
  ), [birthInfo.maya_seal_info?.启示]);

  return (
    <OptimizedInfoCard title="印记信息">
      <div className="space-y-3">
        {traitsInfo}
        {energyInfo}
        {revelationInfo}
      </div>
    </OptimizedInfoCard>
  );
});

// 音调信息组件 - 使用memo和useMemo
const ToneInfoSection = memo(({ birthInfo }) => {
  const digitalEnergyInfo = useMemo(() => (
    <div className="bg-yellow-50 p-3 rounded">
      <div className="text-sm text-yellow-800 font-medium mb-1">数字能量</div>
      <div className="text-gray-700">
        第{birthInfo.maya_tone_info?.数字 || '1'}号音调代表着独特的宇宙振动频率
      </div>
    </div>
  ), [birthInfo.maya_tone_info?.数字]);
  
  const actionInfo = useMemo(() => (
    <div className="bg-red-50 p-3 rounded">
      <div className="text-sm text-red-800 font-medium mb-1">行动</div>
      <div className="text-gray-700">{birthInfo.maya_tone_info?.行动 || ''}</div>
    </div>
  ), [birthInfo.maya_tone_info?.行动]);
  
  const toneRevelationInfo = useMemo(() => (
    <div className="bg-indigo-50 p-3 rounded">
      <div className="text-sm text-indigo-800 font-medium mb-1">启示</div>
      <div className="text-gray-700">{birthInfo.maya_tone_info?.启示 || ''}</div>
    </div>
  ), [birthInfo.maya_tone_info?.启示]);

  return (
    <OptimizedInfoCard title="音调信息">
      <div className="space-y-3">
        {digitalEnergyInfo}
        {actionInfo}
        {toneRevelationInfo}
      </div>
    </OptimizedInfoCard>
  );
});

// 每日启示组件 - 使用memo和条件渲染
const DailyQuoteSection = memo(({ birthInfo }) => {
  const quoteContent = useMemo(() => (
    <blockquote className="italic text-gray-700 border-l-4 border-blue-400 pl-4 py-2">
      "{birthInfo.daily_quote.content}"
      <footer className="text-right mt-2 text-gray-600 text-sm">— {birthInfo.daily_quote.author}</footer>
    </blockquote>
  ), [birthInfo.daily_quote]);
  
  if (!birthInfo.daily_quote) return null;
  
  return (
    <OptimizedInfoCard title="今日启示">
      {quoteContent}
    </OptimizedInfoCard>
  );
});

// 生命使命组件 - 使用memo和useMemo
const LifePurposeSection = memo(({ birthInfo }) => {
  const summary = useMemo(() => (
    <p className="text-gray-700">{birthInfo.life_purpose?.summary || ''}</p>
  ), [birthInfo.life_purpose?.summary]);
  
  const details = useMemo(() => (
    <p className="text-gray-600 text-sm">{birthInfo.life_purpose?.details || ''}</p>
  ), [birthInfo.life_purpose?.details]);
  
  const actionGuide = useMemo(() => (
    <div className="bg-blue-50 p-3 rounded">
      <div className="text-sm text-blue-800 font-medium mb-1">行动指南</div>
      <div className="text-gray-700">{birthInfo.life_purpose?.action_guide || ''}</div>
    </div>
  ), [birthInfo.life_purpose?.action_guide]);

  return (
    <OptimizedInfoCard title="生命使命">
      <div className="space-y-3">
        {summary}
        {details}
        {actionGuide}
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

  // 优化渲染函数，使用useCallback避免重复创建
  const renderTraitItem = useCallback((trait, index, isStrength = true) => (
    <li key={`${isStrength ? 'strength' : 'challenge'}-${index}`} className="flex items-center text-gray-700">
      <div className={`w-6 h-6 ${isStrength ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center text-white text-xs font-bold mr-2`}>
        {index + 1}
      </div>
      {trait}
    </li>
  ), []);

  // 为优势和挑战创建独立的组件以减少重渲染
  const StrengthsList = memo(() => (
    <OptimizedInfoCard title="个人优势">
      <ul className="space-y-2">
        <ChunkedRenderer
          items={traits.strengths}
          chunkSize={2}
          renderItem={(trait, index) => renderTraitItem(trait, index, true)}
          loadingComponent={<div className="text-center text-gray-400 animate-pulse">加载优势...</div>}
        />
      </ul>
    </OptimizedInfoCard>
  ));
  
  const ChallengesList = memo(() => (
    <OptimizedInfoCard title="个人挑战">
      <ul className="space-y-2">
        <ChunkedRenderer
          items={traits.challenges}
          chunkSize={2}
          renderItem={(trait, index) => renderTraitItem(trait, index, false)}
          loadingComponent={<div className="text-center text-gray-400 animate-pulse">加载挑战...</div>}
        />
      </ul>
    </OptimizedInfoCard>
  ));

  return (
    <div className="grid grid-cols-1 gap-4">
      <StrengthsList />
      <ChallengesList />
    </div>
  );
});

// 能量场信息组件 - 使用memo和useMemo
const EnergyFieldSection = memo(({ birthInfo }) => {
  const primaryEnergyInfo = useMemo(() => (
    <div className="bg-indigo-50 p-3 rounded">
      <div className="text-sm text-indigo-800 font-medium mb-2">主要能量场</div>
      <div className="text-gray-700 mb-1">{birthInfo.birth_energy_field?.primary?.type || ''}</div>
      <div className="text-xs text-gray-600">{birthInfo.birth_energy_field?.primary?.info?.描述 || ''}</div>
    </div>
  ), [birthInfo.birth_energy_field?.primary]);
  
  const secondaryEnergyInfo = useMemo(() => (
    <div className="bg-purple-50 p-3 rounded">
      <div className="text-sm text-purple-800 font-medium mb-2">次要能量场</div>
      <div className="text-gray-700 mb-1">{birthInfo.birth_energy_field?.secondary?.type || ''}</div>
      <div className="text-xs text-gray-600">{birthInfo.birth_energy_field?.secondary?.info?.描述 || ''}</div>
    </div>
  ), [birthInfo.birth_energy_field?.secondary]);
  
  const balanceSuggestionInfo = useMemo(() => (
    <div className="bg-blue-50 p-3 rounded">
      <div className="text-sm text-blue-800 font-medium mb-1">平衡建议</div>
      <div className="text-gray-700 text-sm">{birthInfo.birth_energy_field?.balance_suggestion || ''}</div>
    </div>
  ), [birthInfo.birth_energy_field?.balance_suggestion]);

  return (
    <OptimizedInfoCard title="出生能量场">
      <div className="grid grid-cols-1 gap-4">
        {primaryEnergyInfo}
        {secondaryEnergyInfo}
        {balanceSuggestionInfo}
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
    { component: EnergyFieldSection, key: 'energy' },
    { component: DailyQuoteSection, key: 'quote' }
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