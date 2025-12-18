import React, { useState, useEffect, useMemo } from 'react';

// 分块渲染组件
const ChunkedRenderer = ({ items, chunkSize = 3, renderItem, loadingComponent }) => {
  const [visibleChunks, setVisibleChunks] = useState(1);
  
  const chunks = useMemo(() => {
    const result = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      result.push(items.slice(i, i + chunkSize));
    }
    return result;
  }, [items, chunkSize]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && visibleChunks < chunks.length) {
          setVisibleChunks(prev => Math.min(prev + 1, chunks.length));
        }
      });
    }, { threshold: 0.1 });

    const sentinel = document.getElementById('render-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [visibleChunks, chunks.length]);

  return (
    <>
      {chunks.slice(0, visibleChunks).map((chunk, chunkIndex) => (
        <div key={chunkIndex} className="chunk-container">
          {chunk.map((item, index) => renderItem(item, chunkIndex * chunkSize + index))}
        </div>
      ))}
      {visibleChunks < chunks.length && (
        <div id="render-sentinel" className="h-4">
          {loadingComponent || <div className="text-center text-gray-500">加载中...</div>}
        </div>
      )}
    </>
  );
};

// 优化的信息卡片组件
const OptimizedInfoCard = React.memo(({ title, children, className = "" }) => (
  <div className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm ${className}`}>
    <h4 className="font-semibold text-gray-800 mb-3 text-base">{title}</h4>
    {children}
  </div>
));

// 基础信息组件
const BasicInfoSection = React.memo(({ birthInfo }) => (
  <OptimizedInfoCard title="基本信息" className="text-center">
    <div className="mb-4">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full text-white mb-3">
        <div className="text-center">
          <div className="text-lg font-bold">{birthInfo.maya_kin}</div>
          <div className="text-xs opacity-90">KIN</div>
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{birthInfo.maya_seal_desc}</h2>
      <div className="flex justify-center space-x-2 mb-3">
        <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
          {birthInfo.maya_seal}
        </span>
        <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium">
          {birthInfo.maya_tone_info?.数字 || '1'}号音
        </span>
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
));

// 印记信息组件
const SealInfoSection = React.memo(({ birthInfo }) => (
  <OptimizedInfoCard title="印记信息">
    <div className="space-y-3">
      <div className="bg-blue-50 p-3 rounded">
        <div className="text-sm text-blue-800 font-medium mb-1">特质</div>
        <div className="text-gray-700">{birthInfo.maya_seal_info.特质}</div>
      </div>
      <div className="bg-green-50 p-3 rounded">
        <div className="text-sm text-green-800 font-medium mb-1">能量</div>
        <div className="text-gray-700">{birthInfo.maya_seal_info.能量}</div>
      </div>
      <div className="bg-purple-50 p-3 rounded">
        <div className="text-sm text-purple-800 font-medium mb-1">启示</div>
        <div className="text-gray-700">{birthInfo.maya_seal_info.启示}</div>
      </div>
    </div>
  </OptimizedInfoCard>
));

// 音调信息组件
const ToneInfoSection = React.memo(({ birthInfo }) => (
  <OptimizedInfoCard title="音调信息">
    <div className="space-y-3">
      <div className="bg-yellow-50 p-3 rounded">
        <div className="text-sm text-yellow-800 font-medium mb-1">数字能量</div>
        <div className="text-gray-700">第{birthInfo.maya_tone_info?.数字 || '1'}号音调代表着独特的宇宙振动频率</div>
      </div>
      <div className="bg-red-50 p-3 rounded">
        <div className="text-sm text-red-800 font-medium mb-1">行动</div>
        <div className="text-gray-700">{birthInfo.maya_tone_info.行动}</div>
      </div>
      <div className="bg-indigo-50 p-3 rounded">
        <div className="text-sm text-indigo-800 font-medium mb-1">启示</div>
        <div className="text-gray-700">{birthInfo.maya_tone_info.启示}</div>
      </div>
    </div>
  </OptimizedInfoCard>
));

// 每日启示组件
const DailyQuoteSection = React.memo(({ birthInfo }) => {
  if (!birthInfo.daily_quote) return null;
  
  return (
    <OptimizedInfoCard title="今日启示">
      <blockquote className="italic text-gray-700 border-l-4 border-blue-400 pl-4 py-2">
        "{birthInfo.daily_quote.content}"
        <footer className="text-right mt-2 text-gray-600 text-sm">— {birthInfo.daily_quote.author}</footer>
      </blockquote>
    </OptimizedInfoCard>
  );
});

// 生命使命组件
const LifePurposeSection = React.memo(({ birthInfo }) => (
  <OptimizedInfoCard title="生命使命">
    <div className="space-y-3">
      <p className="text-gray-700">{birthInfo.life_purpose.summary}</p>
      <p className="text-gray-600 text-sm">{birthInfo.life_purpose.details}</p>
      <div className="bg-blue-50 p-3 rounded">
        <div className="text-sm text-blue-800 font-medium mb-1">行动指南</div>
        <div className="text-gray-700">{birthInfo.life_purpose.action_guide}</div>
      </div>
    </div>
  </OptimizedInfoCard>
));

// 个人特质组件
const PersonalTraitsSection = React.memo(({ birthInfo }) => {
  const traits = useMemo(() => ({
    strengths: birthInfo.personal_traits.strengths || [],
    challenges: birthInfo.personal_traits.challenges || []
  }), [birthInfo.personal_traits]);

  const renderTraitItem = (trait, index, isStrength = true) => (
    <li key={index} className="flex items-center text-gray-700">
      <div className={`w-6 h-6 ${isStrength ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center text-white text-xs font-bold mr-2`}>
        {index + 1}
      </div>
      {trait}
    </li>
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      <OptimizedInfoCard title="个人优势">
        <ul className="space-y-2">
          <ChunkedRenderer
            items={traits.strengths}
            chunkSize={2}
            renderItem={renderTraitItem}
            loadingComponent={<div className="text-center text-gray-400">加载优势...</div>}
          />
        </ul>
      </OptimizedInfoCard>

      <OptimizedInfoCard title="个人挑战">
        <ul className="space-y-2">
          <ChunkedRenderer
            items={traits.challenges}
            chunkSize={2}
            renderItem={(trait, index) => renderTraitItem(trait, index, false)}
            loadingComponent={<div className="text-center text-gray-400">加载挑战...</div>}
          />
        </ul>
      </OptimizedInfoCard>
    </div>
  );
});

// 能量场信息组件
const EnergyFieldSection = React.memo(({ birthInfo }) => (
  <OptimizedInfoCard title="出生能量场">
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-indigo-50 p-3 rounded">
        <div className="text-sm text-indigo-800 font-medium mb-2">主要能量场</div>
        <div className="text-gray-700 mb-1">{birthInfo.birth_energy_field.primary.type}</div>
        <div className="text-xs text-gray-600">{birthInfo.birth_energy_field.primary.info.描述}</div>
      </div>
      
      <div className="bg-purple-50 p-3 rounded">
        <div className="text-sm text-purple-800 font-medium mb-2">次要能量场</div>
        <div className="text-gray-700 mb-1">{birthInfo.birth_energy_field.secondary.type}</div>
        <div className="text-xs text-gray-600">{birthInfo.birth_energy_field.secondary.info.描述}</div>
      </div>
      
      <div className="bg-blue-50 p-3 rounded">
        <div className="text-sm text-blue-800 font-medium mb-1">平衡建议</div>
        <div className="text-gray-700 text-sm">{birthInfo.birth_energy_field.balance_suggestion}</div>
      </div>
    </div>
  </OptimizedInfoCard>
));

// 主组件
const ResultsSection = ({ birthInfo, showResults }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showResults && birthInfo) {
      // 延迟显示，避免阻塞主线程
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showResults, birthInfo]);

  if (!showResults || !birthInfo || !isVisible) {
    return null;
  }

  // 分块渲染的配置
  const sections = [
    { component: BasicInfoSection, key: 'basic' },
    { component: SealInfoSection, key: 'seal' },
    { component: ToneInfoSection, key: 'tone' },
    { component: DailyQuoteSection, key: 'quote' },
    { component: LifePurposeSection, key: 'purpose' },
    { component: PersonalTraitsSection, key: 'traits' },
    { component: EnergyFieldSection, key: 'energy' }
  ];

  const renderSection = (section, index) => {
    const Component = section.component;
    return (
      <div key={section.key} className="fade-in-section">
        <Component birthInfo={birthInfo} />
      </div>
    );
  };

  return (
    <div className="birth-chart-results">
      <h3 className="text-lg font-bold text-center text-gray-800 mb-4">玛雅出生图结果</h3>
      
      <div className="birth-info space-y-4">
        <ChunkedRenderer
          items={sections}
          chunkSize={2}
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
};

export default ResultsSection;