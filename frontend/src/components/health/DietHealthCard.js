import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HealthFoodIcon } from '../icons';
import styles from './HealthCard.module.css';

const DietHealthCard = () => {
  const [userAge] = useState('adult'); 
  
  // 获取当前季节
  const season = useMemo(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }, []);

  // 根据年龄和季节推荐不同饮食结构
  const ageBasedRecommendation = useMemo(() => {
    let base = {
      main: { name: '糙米', amount: '100g', alternatives: ['燕麦', '玉米', '红薯'] },
      protein: { name: '鸡胸肉', amount: '100g', alternatives: ['三文鱼', '鸡蛋', '豆腐'] },
      vegetables: { name: '西兰花', amount: '150g', alternatives: ['菠菜', '胡萝卜', '黄瓜'] },
      fruits: { name: '苹果', amount: '1个', alternatives: ['橙子', '蓝莓', '香蕉'] },
      nuts: { name: '杏仁', amount: '10颗', alternatives: ['核桃', '腰果', '花生'] },
      tips: '均衡饮食，遵循「主食 1/2 全谷物 + 蛋白质 1/4 + 蔬菜 1/4+1 份水果 + 1 把坚果」核心原则'
    };

    // 季节性调整逻辑简化
    const seasonalAdjustments = {
      spring: { main: '小米', veg: '韭菜', fruit: '草莓', tip: '春季宜疏肝理气，多食时令蔬果，少酸多甘。' },
      summer: { main: '绿豆粥', veg: '苦瓜', fruit: '西瓜', tip: '夏季宜清热解暑，多食瓜果，注意补充水分。' },
      autumn: { main: '百合粥', veg: '莲藕', fruit: '梨', tip: '秋季宜滋阴润燥，多食滋阴润肺食物，少吃辛辣。' },
      winter: { main: '黑米粥', veg: '萝卜', fruit: '橘子', tip: '冬季宜温补藏精，多食温热食物，适当进补。' }
    };

    const adj = seasonalAdjustments[season];
    if (adj) {
      base.main.name = adj.main;
      base.vegetables.name = adj.veg;
      base.fruits.name = adj.fruit;
      base.tips += adj.tip;
    }

    return base;
  }, [season]);

  const nutrientAlerts = useMemo(() => [
    { name: '维生素D', suggestion: '多晒太阳，食用富含维生素D的食物' },
    { name: '钙', suggestion: '每日摄入800mg钙，保护骨骼健康' }
  ], []);

  return (
    <div className={`${styles.card} ${styles.gradientDiet}`}>
      <div className={styles.header}>
        <div className="flex items-center">
          <div className={styles.iconWrapper}>
            <HealthFoodIcon size={20} color="#ea580c" />
          </div>
          <h3 className={styles.title}>饮食健康</h3>
        </div>
      </div>

      <div className={styles.content}>
        <div className="grid grid-cols-2 gap-2">
          <div className={styles.statItem}>
            <div className={`${styles.statValue} ${styles.dietValue}`}>{ageBasedRecommendation.main.amount}</div>
            <div className={styles.statLabel}>{ageBasedRecommendation.main.name}</div>
            <div className="text-[10px] text-gray-400 mt-1">主食</div>
          </div>
          <div className={styles.statItem}>
            <div className={`${styles.statValue} ${styles.dietValue}`}>{ageBasedRecommendation.protein.amount}</div>
            <div className={styles.statLabel}>{ageBasedRecommendation.protein.name}</div>
            <div className="text-[10px] text-gray-400 mt-1">蛋白质</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className={styles.statItem}>
            <div className={`${styles.statValue} ${styles.dietValue} text-base`}>{ageBasedRecommendation.vegetables.amount}</div>
            <div className={styles.statLabel}>{ageBasedRecommendation.vegetables.name}</div>
          </div>
          <div className={styles.statItem}>
            <div className={`${styles.statValue} ${styles.dietValue} text-base`}>{ageBasedRecommendation.fruits.amount}</div>
            <div className={styles.statLabel}>{ageBasedRecommendation.fruits.name}</div>
          </div>
          <div className={styles.statItem}>
            <div className={`${styles.statValue} ${styles.dietValue} text-base`}>{ageBasedRecommendation.nuts.amount}</div>
            <div className={styles.statLabel}>{ageBasedRecommendation.nuts.name}</div>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 italic line-clamp-2">
            {ageBasedRecommendation.tips}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          {nutrientAlerts.map((n, i) => (
            <div key={i} className="flex-1 bg-white/40 dark:bg-black/10 p-2 rounded-lg border border-white/20">
              <div className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{n.name}</div>
              <div className="text-[9px] text-gray-500 dark:text-gray-400 truncate">{n.suggestion}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <Link to="/diet-health-detail" className={styles.actionButton}>
          查看详细建议
        </Link>
      </div>
    </div>
  );
};

export default DietHealthCard;
