import React, { memo, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import '../styles/traditional-zodiac-background.css';

const TraditionalZodiacBackground = memo(({ children, className = '' }) => {
  const { theme } = useTheme();

  // 十二生肖数据
  const zodiacAnimals = useMemo(() => [
    { name: '鼠', position: 0 },
    { name: '牛', position: 30 },
    { name: '虎', position: 60 },
    { name: '兔', position: 90 },
    { name: '龙', position: 120 },
    { name: '蛇', position: 150 },
    { name: '马', position: 180 },
    { name: '羊', position: 210 },
    { name: '猴', position: 240 },
    { name: '鸡', position: 270 },
    { name: '狗', position: 300 },
    { name: '猪', position: 330 }
  ], []);

  // 八字命盘数据
  const baziPillars = useMemo(() => [
    { character: '甲', element: '木' },
    { character: '乙', element: '木' },
    { character: '丙', element: '火' },
    { character: '丁', element: '火' },
    { character: '戊', element: '土' },
    { character: '己', element: '土' },
    { character: '庚', element: '金' },
    { character: '辛', element: '金' },
    { character: '壬', element: '水' },
    { character: '癸', element: '水' }
  ], []);

  // 渲染十二生肖环绕
  const renderZodiacRing = () => {
    return zodiacAnimals.map((animal, index) => {
      const angle = animal.position;
      const radius = 140; // 半径
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      
      return (
        <div
          key={animal.name}
          className="zodiac-animal"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            animationDelay: `${index * 0.5}s`
          }}
          title={`生肖${animal.name}`}
        >
          {animal.name}
        </div>
      );
    });
  };

  // 渲染五行元素
  const renderWuxingElements = () => (
    <div className="wuxing-diagram">
      <div className="wuxing-element wuxing-wood" title="木元素">木</div>
      <div className="wuxing-element wuxing-fire" title="火元素">火</div>
      <div className="wuxing-element wuxing-earth" title="土元素">土</div>
      <div className="wuxing-element wuxing-metal" title="金元素">金</div>
      <div className="wuxing-element wuxing-water" title="水元素">水</div>
    </div>
  );

  // 渲染方位指示
  const renderDirectionIndicators = () => (
    <div className="fortune-directions">
      <div className="direction-indicator direction-north" title="北方">北</div>
      <div className="direction-indicator direction-east" title="东方">东</div>
      <div className="direction-indicator direction-south" title="南方">南</div>
      <div className="direction-indicator direction-west" title="西方">西</div>
    </div>
  );

  // 渲染八字命盘
  const renderBaziChart = () => (
    <div className="bazi-chart">
      {baziPillars.slice(0, 8).map((pillar, index) => (
        <div
          key={index}
          className="bazi-pillar"
          title={`天干${pillar.character} - ${pillar.element}元素`}
          style={{ animationDelay: `${index * 0.5}s` }}
        >
          {pillar.character}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`traditional-zodiac-background ${className} ${theme === 'dark' ? 'dark' : ''}`}>
      {/* 背景纹样 */}
      <div className="auspicious-clouds"></div>
      <div className="coin-pattern"></div>
      <div className="bagua-diagram"></div>
      
      {/* 十二生肖环绕 */}
      <div className="zodiac-ring">
        {renderZodiacRing()}
      </div>
      
      {/* 五行相生相克关系图 */}
      {renderWuxingElements()}
      
      {/* 流年运势方位指示 */}
      {renderDirectionIndicators()}
      
      {/* 八字命盘布局 */}
      {renderBaziChart()}
      
      {/* 传统装饰边框 */}
      <div className="traditional-border"></div>
      
      {/* 子内容 */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  );
});

TraditionalZodiacBackground.displayName = 'TraditionalZodiacBackground';

export default TraditionalZodiacBackground;