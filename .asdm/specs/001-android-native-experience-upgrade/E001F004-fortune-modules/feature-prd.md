# Feature PRD: 运势分析模块UI升级

**Epic**: Android原生体验架构升级  
**Feature ID**: E001F004  
**Date**: 2026-05-27  
**Status**: Draft

## 1. Feature Overview

### 1.1 Feature Description
对运势分析模块进行全面UI升级，包括星座运势、八字分析、紫微斗数、黄历等功能页面。采用现代化的数据可视化、卡片式布局、流畅动画和原生交互，提升运势分析模块的专业感和用户体验。

### 1.2 Business Context
运势分析是应用的核心功能，当前存在以下问题：
- 页面设计较为传统，缺乏现代感
- 数据展示方式单一，可读性一般
- 页面切换和加载体验不佳
- 缺乏个性化和互动性

升级运势分析模块可以：
- 提升核心功能的用户体验
- 增加用户粘性和使用时长
- 提升应用的专业形象
- 为后续功能扩展打下基础

## 2. User Stories

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|-------------------|
| US-001 | 作为用户，我希望星座运势页面设计现代美观，以便获得愉悦的阅读体验 | High | 1. 页面符合Material Design 3规范 2. 数据展示清晰易读 3. 有动画效果 |
| US-002 | 作为用户，我希望八字分析有专业的数据可视化，以便更好地理解分析结果 | High | 1. 有图表展示五行分布 2. 有天干地支可视化 3. 有运势趋势图 |
| US-003 | 作为用户，我希望运势页面有流畅的切换动画，以便获得原生体验 | High | 1. 页面进入有动画 2. 数据加载有过渡 3. 切换无卡顿 |
| US-004 | 作为用户，我希望有运势分享功能，以便与朋友分享有趣的运势 | Medium | 1. 支持生成运势卡片 2. 支持保存到相册 3. 支持分享到社交平台 |
| US-005 | 作为用户，我希望有运势提醒功能，以便及时了解重要运势变化 | Medium | 1. 支持每日运势推送 2. 支持重要节点提醒 3. 支持自定义提醒 |

## 3. Technical Design

### 3.1 星座运势页面设计

```javascript
// pages/HoroscopePage.js
import React from 'react';
import { motion } from 'framer-motion';
import { useHoroscope } from '../hooks/useHoroscope';

export const HoroscopePage = () => {
  const { horoscope, loading } = useHoroscope();

  return (
    <div className="min-h-screen bg-surface">
      {/* 顶部星座展示区 */}
      <motion.div 
        className="relative h-64 bg-gradient-to-b from-primary-container to-surface"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Icon name={horoscope.sign} size={48} className="text-on-primary" />
            </motion.div>
            <h1 className="text-2xl font-bold text-on-surface">{horoscope.name}</h1>
            <p className="text-on-surface-variant">{horoscope.dateRange}</p>
          </div>
        </div>
      </motion.div>

      {/* 运势概览卡片 */}
      <motion.div 
        className="mx-4 -mt-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-surface-container-low rounded-2xl p-6 shadow-lg">
          <div className="grid grid-cols-4 gap-4">
            <ScoreItem label="综合" value={horoscope.overall} />
            <ScoreItem label="爱情" value={horoscope.love} />
            <ScoreItem label="事业" value={horoscope.career} />
            <ScoreItem label="财运" value={horoscope.finance} />
          </div>
        </div>
      </motion.div>

      {/* 详细运势 */}
      <motion.div 
        className="mt-6 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Section title="今日运势" icon="star">
          <p className="text-on-surface-variant leading-relaxed">
            {horoscope.today}
          </p>
        </Section>

        <Section title="爱情运势" icon="heart">
          <div className="flex items-center gap-4 mb-3">
            <ProgressBar value={horoscope.loveScore} max={100} color="#B3261E" />
            <span className="text-on-surface font-medium">{horoscope.loveScore}%</span>
          </div>
          <p className="text-on-surface-variant">{horoscope.loveDetail}</p>
        </Section>

        <Section title="事业运势" icon="briefcase">
          <div className="flex items-center gap-4 mb-3">
            <ProgressBar value={horoscope.careerScore} max={100} color="#386A20" />
            <span className="text-on-surface font-medium">{horoscope.careerScore}%</span>
          </div>
          <p className="text-on-surface-variant">{horoscope.careerDetail}</p>
        </Section>

        <Section title="财运运势" icon="coins">
          <div className="flex items-center gap-4 mb-3">
            <ProgressBar value={horoscope.financeScore} max={100} color="#7C5800" />
            <span className="text-on-surface font-medium">{horoscope.financeScore}%</span>
          </div>
          <p className="text-on-surface-variant">{horoscope.financeDetail}</p>
        </Section>
      </motion.div>

      {/* 幸运提示 */}
      <motion.div 
        className="mt-6 px-4 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="bg-tertiary-container rounded-2xl p-4">
          <h3 className="text-on-tertiary-container font-medium mb-2">今日幸运提示</h3>
          <div className="grid grid-cols-2 gap-3">
            <LuckyItem label="幸运颜色" value={horoscope.luckyColor} />
            <LuckyItem label="幸运数字" value={horoscope.luckyNumber} />
            <LuckyItem label="幸运方位" value={horoscope.luckyDirection} />
            <LuckyItem label="贵人星座" value={horoscope贵人星座} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
```

### 3.2 八字分析页面设计

```javascript
// pages/BaziPage.js
import React from 'react';
import { motion } from 'framer-motion';
import { useBazi } from '../hooks/useBazi';

export const BaziPage = () => {
  const { bazi, analysis } = useBazi();

  return (
    <div className="min-h-screen bg-surface">
      {/* 八字展示区 */}
      <motion.div 
        className="bg-gradient-to-b from-primary-container to-surface p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center text-on-primary-container text-lg mb-4">您的八字命盘</h2>
        <div className="grid grid-cols-4 gap-3">
          <PillarCard title="年柱" heavenly={bazi.year.heavenly} earthly={bazi.year.earthly} />
          <PillarCard title="月柱" heavenly={bazi.month.heavenly} earthly={bazi.month.earthly} />
          <PillarCard title="日柱" heavenly={bazi.day.heavenly} earthly={bazi.day.earthly} />
          <PillarCard title="时柱" heavenly={bazi.hour.heavenly} earthly={bazi.hour.earthly} />
        </div>
      </motion.div>

      {/* 五行分布 */}
      <motion.div 
        className="mx-4 -mt-6 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-surface-container-low rounded-2xl p-6 shadow-lg">
          <h3 className="text-on-surface font-medium mb-4">五行分布</h3>
          <div className="h-48">
            <WuxingChart data={analysis.wuxingDistribution} />
          </div>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {Object.entries(analysis.wuxingDistribution).map(([element, count]) => (
              <WuxingBadge key={element} element={element} count={count} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* 命格分析 */}
      <motion.div 
        className="mt-6 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Section title="命格分析" icon="user">
          <div className="space-y-3">
            <InfoItem label="日主" value={analysis.dayMaster} />
            <InfoItem label="命格" value={analysis格局} />
            <InfoItem label="喜用神" value={analysis.favorableElements} />
            <InfoItem label="忌神" value={analysis.unfavorableElements} />
          </div>
        </Section>

        <Section title="性格特点" icon="personality">
          <div className="flex flex-wrap gap-2">
            {analysis.personalityTraits.map((trait, index) => (
              <Chip key={index} label={trait} variant="outlined" />
            ))}
          </div>
        </Section>

        <Section title="运势建议" icon="lightbulb">
          <div className="space-y-4">
            {analysis.suggestions.map((suggestion, index) => (
              <SuggestionCard key={index} {...suggestion} />
            ))}
          </div>
        </Section>
      </motion.div>

      {/* 大运流年 */}
      <motion.div 
        className="mt-6 px-4 pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Section title="大运流年" icon="chart">
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-4">
              {analysis.majorLuckPeriods.map((period, index) => (
                <LuckPeriodCard key={index} {...period} />
              ))}
            </div>
          </div>
        </Section>
      </motion.div>
    </div>
  );
};
```

### 3.3 数据可视化组件

```javascript
// components/charts/WuxingChart.js
import React from 'react';
import { motion } from 'framer-motion';

export const WuxingChart = ({ data }) => {
  const elements = ['金', '木', '水', '火', '土'];
  const colors = ['#FFD700', '#4CAF50', '#2196F3', '#F44336', '#8B4513'];
  const maxCount = Math.max(...Object.values(data));

  return (
    <div className="flex items-end justify-around h-full">
      {elements.map((element, index) => {
        const count = data[element] || 0;
        const height = (count / maxCount) * 100;
        
        return (
          <div key={element} className="flex flex-col items-center gap-2">
            <motion.div
              className="w-12 rounded-t-lg"
              style={{ backgroundColor: colors[index] }}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            />
            <span className="text-sm text-on-surface-variant">{element}</span>
            <span className="text-xs text-on-surface-variant">{count}</span>
          </div>
        );
      })}
    </div>
  );
};

// components/charts/LuckPeriodChart.js
export const LuckPeriodChart = ({ periods }) => {
  return (
    <div className="relative h-32">
      <svg className="w-full h-full">
        <motion.path
          d={generatePath(periods)}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />
        {periods.map((period, index) => (
          <motion.circle
            key={index}
            cx={getX(index, periods.length)}
            cy={getY(period.score)}
            r="4"
            fill="var(--primary)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
          />
        ))}
      </svg>
    </div>
  );
};
```

### 3.4 分享功能实现

```javascript
// components/share/ShareCard.js
import React from 'react';
import { toPng } from 'html-to-image';
import { Share } from '@capacitor/share';

export const ShareCard = ({ data, type }) => {
  const cardRef = React.useRef(null);

  const generateImage = async () => {
    if (!cardRef.current) return null;
    
    const dataUrl = await toPng(cardRef.current, {
      quality: 1,
      pixelRatio: 2,
    });
    
    return dataUrl;
  };

  const handleShare = async () => {
    try {
      const imageUrl = await generateImage();
      if (!imageUrl) return;

      await Share.share({
        title: `${data.title} - Nice Today`,
        text: data.shareText,
        url: imageUrl,
        dialogTitle: '分享运势',
      });
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  const handleSave = async () => {
    try {
      const imageUrl = await generateImage();
      if (!imageUrl) return;

      // 保存到相册
      await Filesystem.writeFile({
        path: `nice_today_${type}_${Date.now()}.png`,
        data: imageUrl,
        directory: Directory.Documents,
      });

      showToast('已保存到相册');
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  return (
    <div>
      {/* 分享卡片预览 */}
      <div ref={cardRef} className="bg-gradient-to-br from-primary-container to-tertiary-container p-6 rounded-2xl">
        <div className="text-center">
          <h2 className="text-on-primary-container text-xl font-bold mb-2">{data.title}</h2>
          <p className="text-on-primary-container/80 text-sm mb-4">{data.date}</p>
          <div className="bg-surface/90 rounded-xl p-4">
            <p className="text-on-surface">{data.content}</p>
          </div>
          <p className="text-on-primary-container/60 text-xs mt-4">- Nice Today 生物节律助手 -</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 mt-4">
        <Button onClick={handleSave} variant="outlined" className="flex-1">
          保存图片
        </Button>
        <Button onClick={handleShare} variant="filled" className="flex-1">
          分享好友
        </Button>
      </div>
    </div>
  );
};
```

## 4. Implementation Plan

### 4.1 Phase 1: 星座运势页面
- 设计现代化的页面布局
- 实现运势评分展示
- 添加运势详情卡片

### 4.2 Phase 2: 八字分析页面
- 设计八字命盘展示
- 实现五行分布图表
- 添加命格分析内容

### 4.3 Phase 3: 其他运势模块
- 升级紫微斗数页面
- 升级黄历页面
- 升级塔罗牌页面

### 4.4 Phase 4: 互动功能
- 实现运势分享功能
- 添加运势提醒功能
- 实现运势收藏功能

## 5. Acceptance Criteria

- [ ] 星座运势页面设计现代美观
- [ ] 八字分析有专业的数据可视化
- [ ] 所有运势页面有流畅的动画效果
- [ ] 数据展示清晰易读
- [ ] 支持运势分享功能
- [ ] 深色模式下显示正常
- [ ] 页面加载时间<1秒

## 6. Technical Dependencies

- Framer Motion（动画）
- Chart.js（图表）
- html-to-image（分享图片生成）
- @capacitor/share（分享功能）
- @capacitor/filesystem（保存功能）

## 7. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| 数据可视化性能问题 | 中 | 中 | 使用Canvas渲染，优化动画 |
| 分享图片生成失败 | 低 | 中 | 提供降级方案，支持文字分享 |
| 运势数据不准确 | 低 | 高 | 加强数据验证和错误处理 |
| 页面复杂度增加 | 中 | 中 | 模块化设计，按需加载 |
