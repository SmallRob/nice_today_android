/**
 * FeatureCard 组件使用示例
 *
 * 本文件展示如何使用优化后的 FeatureCard 组件
 */

import React from 'react';
import FeatureCard from './FeatureCard';

/**
 * 基础用法示例
 */
export const BasicExample = () => {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <FeatureCard
        title="每日运势"
        description="查看今日运势详情"
        icon="star"
        color="#6366f1"
        route="/daily-fortune"
      />
      <FeatureCard
        title="八字分析"
        description="全面分析八字命理"
        icon="dragon"
        color="#ef4444"
        route="/bazi"
      />
    </div>
  );
};

/**
 * 自定义点击事件示例
 */
export const CustomClickExample = () => {
  const handleCardClick = () => {
    console.log('卡片被点击了!');
    // 执行自定义逻辑
  };

  return (
    <FeatureCard
      title="自定义点击"
      description="使用自定义点击事件"
      icon="check-circle"
      color="#10b981"
      onClick={handleCardClick}
    />
  );
};

/**
 * 禁用状态示例
 */
export const DisabledExample = () => {
  return (
    <FeatureCard
      title="禁用的卡片"
      description="此卡片暂时不可用"
      icon="lock"
      color="#9ca3af"
      disabled
    />
  );
};

/**
 * 拖拽排序示例
 */
export const DraggableExample = () => {
  const [cards, setCards] = React.useState([
    { id: '1', title: '卡片 1', icon: 'star', color: '#6366f1' },
    { id: '2', title: '卡片 2', icon: 'heart', color: '#ef4444' },
    { id: '3', title: '卡片 3', icon: 'dragon', color: '#10b981' }
  ]);

  const handleDrop = ({ draggedId, targetId, type }) => {
    if (type === 'drop') {
      const draggedIndex = cards.findIndex(card => card.id === draggedId);
      const targetIndex = cards.findIndex(card => card.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newCards = [...cards];
        const [draggedCard] = newCards.splice(draggedIndex, 1);
        newCards.splice(targetIndex, 0, draggedCard);
        setCards(newCards);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {cards.map((card, index) => (
        <FeatureCard
          key={card.id}
          id={card.id}
          index={index}
          title={card.title}
          description="可以拖拽排序"
          icon={card.icon}
          color={card.color}
          draggable
          onDragEnd={handleDrop}
        />
      ))}
    </div>
  );
};

/**
 * 使用自定义图标示例
 */
export const CustomIconExample = () => {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {/* 使用预定义图标名称 */}
      <FeatureCard
        title="预定义图标"
        description="使用图标名称"
        icon="brain"
        color="#8b5cf6"
      />

      {/* 直接使用 emoji */}
      <FeatureCard
        title="直接使用 Emoji"
        description="直接使用 emoji"
        icon="🎯"
        color="#f59e0b"
      />
    </div>
  );
};

/**
 * 响应式网格布局示例
 */
export const ResponsiveGridExample = () => {
  const features = [
    { title: '每日运势', desc: '查看今日运势', icon: 'star', color: '#6366f1', route: '/daily-fortune' },
    { title: '八字分析', desc: '全面分析八字', icon: 'dragon', color: '#ef4444', route: '/bazi' },
    { title: '穿衣建议', desc: '今日穿衣推荐', icon: 'sparkles', color: '#10b981', route: '/dress' },
    { title: '玛雅历法', desc: '探索玛雅日历', icon: 'calendar', color: '#f59e0b', route: '/maya' },
    { title: '财运分析', desc: '财运运势分析', icon: 'money', color: '#8b5cf6', route: '/wealth' },
    { title: '健康养生', desc: '健康养生建议', icon: 'heart', color: '#ec4899', route: '/health' }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1rem',
      padding: '1rem'
    }}>
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          id={`feature-${index}`}
          index={index}
          title={feature.title}
          description={feature.desc}
          icon={feature.icon}
          color={feature.color}
          route={feature.route}
        />
      ))}
    </div>
  );
};

/**
 * 完整示例:功能卡片网格
 */
export const CompleteExample = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>功能卡片示例</h2>
      <ResponsiveGridExample />
    </div>
  );
};

export default CompleteExample;
