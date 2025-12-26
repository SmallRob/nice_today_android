import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';

// 优化的分块渲染组件 - 使用IntersectionObserver进行懒加载
const ChunkedRenderer = memo(({ items, chunkSize = 3, renderItem, loadingComponent }) => {
  const [visibleChunks, setVisibleChunks] = useState(1);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // 优化chunks计算，避免不必要的重新计算
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
  <div className={`bg-white dark:bg-gray-800 p-4 border ${isActive
    ? 'border-purple-200 dark:border-purple-800 shadow-lg shadow-purple-50 dark:shadow-purple-900/10'
    : 'border-gray-100 dark:border-gray-700 shadow-sm'
    } rounded-2xl transition-all duration-300 ${className}`}>
    {title && (
      <div className="flex items-center mb-3">
        <div className={`w-1.5 h-4 rounded-full mr-2 ${isActive ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}></div>
        <h4 className={`font-bold tracking-wide text-sm ${isActive
          ? 'text-purple-800 dark:text-purple-300'
          : 'text-gray-800 dark:text-gray-200'
          }`}>{title}</h4>
      </div>
    )}
    <div className="tracking-wide leading-relaxed">
      {children}
    </div>
  </div>
));


// 基础信息组件 - 紧凑设计，增强高亮效果
const BasicInfoSection = memo(({ birthInfo }) => {
  // 简化kin计算，直接从birthInfo中提取
  const kinNumber = useMemo(() => {
    try {
      if (!birthInfo || !birthInfo.maya_kin) return '1';
      const kinStr = String(birthInfo.maya_kin);
      const match = kinStr.match(/KIN\s*(\d+)/i);
      return match ? match[1] : '1';
    } catch (error) {
      return '1';
    }
  }, [birthInfo]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-900 rounded-2xl p-5 text-white shadow-lg shadow-purple-200 dark:shadow-none mb-2">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
      <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-purple-400 opacity-20 rounded-full blur-2xl"></div>

      <div className="relative flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex flex-col items-center justify-center shadow-inner">
            <span className="text-[10px] font-bold opacity-80 leading-none mb-1 uppercase">Kin</span>
            <span className="text-xl font-black leading-none">{kinNumber}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {birthInfo?.maya_seal_desc || birthInfo?.fullName || '未知印记'}
            </h2>
            <p className="text-xs text-white/70 font-medium tracking-wider flex items-center mt-0.5">
              <span className="mr-1.5 opacity-60">📅</span>
              {birthInfo?.date || '未知日期'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-[11px] font-bold tracking-wider border border-white/20">
          {birthInfo?.maya_seal || '印记'}
        </span>
        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-[11px] font-bold tracking-wider border border-white/20">
          {birthInfo?.maya_tone_info?.数字 || '1'}号音调
        </span>
      </div>
    </div>
  );
});


// 印记信息组件 - 使用memo和useMemo
const SealInfoSection = memo(({ birthInfo }) => {
  return (
    <OptimizedInfoCard title="印记能量">
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-orange-50/50 dark:bg-orange-950/20 p-3 rounded-xl border border-orange-100/50 dark:border-orange-800/30">
          <div className="flex items-center text-orange-700 dark:text-orange-300 font-bold text-xs mb-1.5">
            <span className="mr-1.5 opacity-80">✨</span> 特质
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{birthInfo?.maya_seal_info?.特质 || '连接宇宙能量的通道'}</p>
        </div>
        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
          <div className="flex items-center text-blue-700 dark:text-blue-300 font-bold text-xs mb-1.5">
            <span className="mr-1.5 opacity-80">🌀</span> 能量
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{birthInfo?.maya_seal_info?.能量 || '激活内在潜能的力量'}</p>
        </div>
        <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100/50 dark:border-purple-800/30">
          <div className="flex items-center text-purple-700 dark:text-purple-300 font-bold text-xs mb-1.5">
            <span className="mr-1.5 opacity-80">📖</span> 启示
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{birthInfo?.maya_seal_info?.启示 || '开启灵性成长的大门'}</p>
        </div>
      </div>
    </OptimizedInfoCard>
  );
});

// 音调信息组件 - 使用memo和useMemo
const ToneInfoSection = memo(({ birthInfo }) => {
  return (
    <OptimizedInfoCard title="音调振动">
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            {birthInfo.maya_tone_info?.数字 || '1'}
          </div>
          <div>
            <div className="text-xs text-gray-800 dark:text-gray-200 font-bold mb-1">数字能量</div>
            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
              第{birthInfo.maya_tone_info?.数字 || '1'}号音调代表着独特的宇宙振动频率，指引您的行动基调。
            </p>
          </div>
        </div>
        <div className="pl-11 border-l border-gray-100 dark:border-gray-700 ml-4 space-y-3">
          <div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-1 flex items-center">
              <span className="w-1 h-1 bg-indigo-400 rounded-full mr-2"></span> 行动
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{birthInfo.maya_tone_info?.行动 || '和谐共振，创造平衡'}</p>
          </div>
          <div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold mb-1 flex items-center">
              <span className="w-1 h-1 bg-indigo-400 rounded-full mr-2"></span> 启示
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{birthInfo.maya_tone_info?.启示 || '聆听内在智慧的声音'}</p>
          </div>
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
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-3 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">{birthInfo.life_purpose?.summary || '探索你的生命使命...'}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-2 border-blue-200 dark:border-blue-800 pl-2 mt-2">
            {birthInfo.life_purpose?.details || '发现你独特的人生道路 and 目标'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mb-1.5 flex items-center">
            <span className="mr-1.5">🚀</span> 行动指南
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{birthInfo.life_purpose?.action_guide || '跟随内心指引，实践你的天赋'}</p>
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

  const renderTraitItem = useCallback((trait, index, isStrength = true) => (
    <li key={`${isStrength ? 'strength' : 'challenge'}-${index}`} className="flex items-start group">
      <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 mr-2 transition-transform group-hover:scale-125 ${isStrength ? 'bg-emerald-400' : 'bg-rose-400'
        }`}></div>
      <span className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight">{trait || (isStrength ? '积极主动' : '需要平衡')}</span>
    </li>
  ), []);

  return (
    <OptimizedInfoCard title="特质潜力">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50/30 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20">
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mb-2.5 flex items-center">
            <span className="mr-1.5 opacity-80">💎</span> 优势
          </div>
          <ul className="space-y-2">
            {traits.strengths.slice(0, 3).map((trait, index) => renderTraitItem(trait, index, true))}
          </ul>
        </div>
        <div className="bg-rose-50/30 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100/50 dark:border-rose-900/20">
          <div className="text-[11px] text-rose-700 dark:text-rose-400 font-bold mb-2.5 flex items-center">
            <span className="mr-1.5 opacity-80">⚖️</span> 挑战
          </div>
          <ul className="space-y-2">
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
    <OptimizedInfoCard title="能量场态">
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-xl shadow-inner">
            🌌
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-bold">主能量场</div>
            <div className="text-xs text-gray-800 dark:text-white font-medium mt-0.5 tracking-wide">{birthInfo.birth_energy_field?.primary?.type || '个人能量场'}</div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">{birthInfo.birth_energy_field?.primary?.info?.描述 || '反映个人状态的能场'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100/50 dark:border-purple-900/30">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-xl shadow-inner">
            🎨
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-purple-700 dark:text-purple-300 font-bold">次要能量场</div>
            <div className="text-xs text-gray-800 dark:text-white font-medium mt-0.5 tracking-wide">{birthInfo.birth_energy_field?.secondary?.type || '创造能量场'}</div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-normal">{birthInfo.birth_energy_field?.secondary?.info?.描述 || '与创造力相关的能场'}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3.5 rounded-xl text-white shadow-md shadow-purple-100 dark:shadow-none">
          <div className="flex items-center font-bold text-xs mb-1.5 tracking-wider">
            <span className="mr-1.5 opacity-90">🧘</span> 平衡建议
          </div>
          <p className="text-[11px] text-white/90 leading-relaxed font-medium tracking-wide">
            {birthInfo.birth_energy_field?.balance_suggestion || '深度链接内在频率，保持身心和谐'}
          </p>
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