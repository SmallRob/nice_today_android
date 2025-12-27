import { useState, useEffect } from 'react';
import { calculateDetailedBazi } from '../../utils/baziHelper';
import BaziCalculator from '../../utils/baziCalculator';
import '../styles/birthChartLiteStyles.css';

const BirthChartLitePage = ({ userInfo }) => {
  const [baziData, setBaziData] = useState(() => {
    // 初始化时直接计算，避免异步加载
    return calculateBaziData(userInfo);
  });
  const [showDecadeFortune, setShowDecadeFortune] = useState(false);

  // 同步计算八字数据
  function calculateBaziData(userInfo) {
    try {
      const birthDate = userInfo?.birthDate || '1990-01-01';
      const birthTime = userInfo?.birthTime || '午';
      const gender = userInfo?.gender || 'secret';

      // 使用时辰映射到小时
      const timeMap = {
        '子': 0, '丑': 2, '寅': 4, '卯': 6,
        '辰': 8, '巳': 10, '午': 12, '未': 14,
        '申': 16, '酉': 18, '戌': 20, '亥': 22
      };

      const hour = timeMap[birthTime] ?? 12;

      const dateParts = birthDate.split('-');
      const [year, month, day] = dateParts.length === 3
        ? dateParts.map(Number)
        : [1990, 1, 1];

      // 使用baziCalculator计算八字
      const bazi = BaziCalculator.calculateBazi(
        !isNaN(year) ? year : 1990,
        !isNaN(month) ? month : 1,
        !isNaN(day) ? day : 1,
        hour, 30, 110
      );

      // 获取更详细的八字信息
      let detailedBazi = null;
      try {
        detailedBazi = calculateDetailedBazi(birthDate, '12:30', 110);
      } catch (detailError) {
        console.warn('获取详细八字信息失败:', detailError);
      }

      return {
        bazi,
        detailed: detailedBazi,
        birthInfo: { birthDate, birthTime, gender }
      };
    } catch (error) {
      console.error('八字计算失败，使用默认值:', error);
      return {
        bazi: BaziCalculator.calculateBazi(1990, 1, 1, 12, 30, 110),
        detailed: null,
        birthInfo: {
          birthDate: '1990-01-01',
          birthTime: '午',
          gender: 'secret'
        }
      };
    }
  }

  // 当userInfo变化时重新计算
  useEffect(() => {
    setBaziData(calculateBaziData(userInfo));
  }, [userInfo]);

  // 计算五行能量分布（简化版）
  const calculateWuxing = (bazi) => {
    const elements = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
    const wuxingMap = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水',
      '子': '水', '亥': '水',
      '寅': '木', '卯': '木',
      '辰': '土', '戌': '土', '丑': '土', '未': '土',
      '巳': '火', '午': '火',
      '申': '金', '酉': '金'
    };

    const allChars = bazi.year + bazi.month + bazi.day + bazi.hour;
    for (const char of allChars) {
      if (wuxingMap[char]) {
        elements[wuxingMap[char]]++;
      }
    }

    const total = Object.values(elements).reduce((a, b) => a + b, 0);
    const result = [];
    for (const [name, count] of Object.entries(elements)) {
      result.push({ name, percentage: Math.round((count / total) * 100), count });
    }
    return result.sort((a, b) => b.count - a.count);
  };

  // 生成流年运势（未来三年）
  const generateYearlyFortune = (currentYear, dayGan) => {
    const fortune = [];
    for (let i = 0; i < 3; i++) {
      const year = currentYear + i;
      const yearGanIndex = (year - 4) % 10;
      const yearZhiIndex = (year - 4) % 12;

      const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][yearGanIndex];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][yearZhiIndex];

      fortune.push({
        year,
        ganzhi: gan + zhi,
        description: generateFortuneDescription(gan, zhi, dayGan)
      });
    }
    return fortune;
  };

  // 生成运势描述（简化版）
  const generateFortuneDescription = (_gan, _zhi, _dayGan) => {
    const descriptions = [
      '今年财运有起色，适合投资理财，但需谨慎行事。',
      '事业运旺盛，有晋升机会，宜主动出击。',
      '贵人运强，易得贵人相助，适合拓展人脉。',
      '感情运势平稳，单身者有桃花运。',
      '健康方面注意，多休息，少熬夜。'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  // 生成十年大运
  const generateDecadeFortune = (birthYear) => {
    const decades = [];
    const startAge = 5;
    for (let i = 0; i < 8; i++) {
      const age = startAge + i * 10;
      const endAge = age + 9;
      const yearPillarIndex = (birthYear - 4 + i + 1) % 10;
      const yearZhiIndex = (birthYear - 4 + i + 1) % 12;

      const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][yearPillarIndex];
      const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][yearZhiIndex];

      decades.push({
        age: `${age}-${endAge}岁`,
        ganzhi: gan + zhi,
        fortune: generateFortuneDescription(gan, zhi, '辛')
      });
    }
    return decades;
  };

  const { bazi, birthInfo } = baziData || {};
  const wuxingData = bazi ? calculateWuxing(bazi) : [];
  const dayGan = bazi?.details?.day?.gan || '辛';

  // 计算当前年份和运势数据
  const currentYear = new Date().getFullYear();
  const birthYear = birthInfo?.birthDate ? new Date(birthInfo.birthDate).getFullYear() : 1990;
  const yearlyFortune = generateYearlyFortune(currentYear, dayGan);
  const decadeFortune = generateDecadeFortune(birthYear);

  return (
    <div className="lite-birthchart-container">
      <div className="lite-page-header">
        <h2 className="lite-page-title">八字分析</h2>
      </div>

      {/* 八字信息卡片 */}
      <div className="lite-card">
        <div className="lite-card-title">
          <span className="lite-card-icon">🎯</span>
          <h3>八字排盘</h3>
        </div>
        {bazi && (
          <>
            <div className="lite-bazi-info">
              <div className="lite-info-row">
                <span className="lite-info-label">出生日期：</span>
                <span className="lite-info-value">{birthInfo.birthDate}</span>
              </div>
              <div className="lite-info-row">
                <span className="lite-info-label">出生时辰：</span>
                <span className="lite-info-value">{birthInfo.birthTime || '未知'}</span>
              </div>
              <div className="lite-bazi-pillars">
                <div className="lite-pillar">
                  <div className="lite-pillar-label">年柱</div>
                  <div className="lite-pillar-value">{bazi.year}</div>
                </div>
                <div className="lite-pillar">
                  <div className="lite-pillar-label">月柱</div>
                  <div className="lite-pillar-value">{bazi.month}</div>
                </div>
                <div className="lite-pillar">
                  <div className="lite-pillar-label">日柱</div>
                  <div className="lite-pillar-value">{bazi.day}</div>
                </div>
                <div className="lite-pillar">
                  <div className="lite-pillar-label">时柱</div>
                  <div className="lite-pillar-value">{bazi.hour}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 五行能量卡片 */}
      <div className="lite-card">
        <div className="lite-card-title">
          <span className="lite-card-icon">⚖️</span>
          <h3>五行能量</h3>
        </div>
        {wuxingData.length > 0 && (
          <div className="lite-wuxing-container">
            {wuxingData.map((element, index) => (
              <div key={index} className="lite-wuxing-item">
                <div className="lite-wuxing-header">
                  <span className="lite-wuxing-name">{element.name}</span>
                  <span className="lite-wuxing-percentage">{element.percentage}%</span>
                </div>
                <div className="lite-wuxing-bar">
                  <div
                    className="lite-wuxing-fill"
                    style={{
                      width: `${element.percentage}%`,
                      backgroundColor: getWuxingColor(element.name)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 流年运势卡片 */}
      <div className="lite-card">
        <div className="lite-card-title">
          <span className="lite-card-icon">📈</span>
          <h3>流年运势</h3>
        </div>
        {yearlyFortune.map((fortune, index) => (
          <div key={index} className="lite-yearly-fortune">
            <div className="lite-year-header">
              <span className="lite-year-title">{fortune.year}年</span>
              <span className="lite-year-ganzhi">{fortune.ganzhi}</span>
            </div>
            <p className="lite-year-description">{fortune.description}</p>
          </div>
        ))}
      </div>

      {/* 十年大运卡片 */}
      <div className="lite-card">
        <div className="lite-card-title">
          <span className="lite-card-icon">📊</span>
          <h3>十年大运</h3>
        </div>
        <div className="lite-decade-list">
          {decadeFortune.slice(0, 4).map((decade, index) => (
            <div key={index} className="lite-decade-item">
              <div className="lite-decade-header">
                <span className="lite-decade-age">{decade.age}</span>
                <span className="lite-decade-ganzhi">{decade.ganzhi}</span>
              </div>
              <p className="lite-decade-description">{decade.fortune}</p>
            </div>
          ))}
        </div>
        {!showDecadeFortune && (
          <button
            className="lite-button lite-button-outline"
            onClick={() => setShowDecadeFortune(true)}
          >
            查看全部大运
          </button>
        )}
        {showDecadeFortune && (
          <div className="lite-decade-list">
            {decadeFortune.slice(4).map((decade, index) => (
              <div key={index + 4} className="lite-decade-item">
                <div className="lite-decade-header">
                  <span className="lite-decade-age">{decade.age}</span>
                  <span className="lite-decade-ganzhi">{decade.ganzhi}</span>
                </div>
                <p className="lite-decade-description">{decade.fortune}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 提示信息 */}
      <div className="lite-card lite-notice-card">
        <p className="lite-notice-text">
          本分析基于传统八字排盘，仅供娱乐参考。
          命理如镜，照见趋势；人生如舟，舵在手中。
        </p>
      </div>
    </div>
  );
};

// 获取五行颜色
const getWuxingColor = (element) => {
  const colors = {
    '金': '#D4AF37',
    '木': '#4CAF50',
    '水': '#2196F3',
    '火': '#F44336',
    '土': '#8D6E63'
  };
  return colors[element] || '#999';
};

export default BirthChartLitePage;
