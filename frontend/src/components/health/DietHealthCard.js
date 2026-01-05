import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DietHealthCard = () => {
  const [userAge] = useState('adult'); // 默认成年，可以根据实际用户信息调整
  const [recommendedFoods, setRecommendedFoods] = useState({
    main: { name: '糙米', amount: '100g', alternatives: ['燕麦', '玉米', '红薯', '藜麦'] },
    protein: { name: '鸡胸肉', amount: '100g', alternatives: ['三文鱼', '鸡蛋', '豆腐', '瘦牛肉'] },
    vegetables: { name: '西兰花', amount: '150g', alternatives: ['菠菜', '胡萝卜', '黄瓜', '豆角'] },
    fruits: { name: '苹果', amount: '1个', alternatives: ['橙子', '蓝莓', '香蕉', '猕猴桃'] },
    nuts: { name: '杏仁', amount: '10颗', alternatives: ['核桃', '腰果', '花生', '开心果'] }
  });

  // 获取当前季节
  const getCurrentSeason = () => {
    const month = new Date().getMonth(); // 0-11 对应 1-12月
    
    // 根据月份判断季节 (北半球)
    if (month >= 2 && month <= 4) return 'spring'; // 春季 3-5月
    if (month >= 5 && month <= 7) return 'summer'; // 夏季 6-8月
    if (month >= 8 && month <= 10) return 'autumn'; // 秋季 9-11月
    return 'winter'; // 冬季 12-2月
  };
  
  // 根据年龄和季节推荐不同饮食结构
  const getAgeAndSeasonBasedRecommendation = (age) => {
    const season = getCurrentSeason();
    
    // 获取基础年龄推荐
    let baseRecommendation = {};
    if (age === 'young') {
      baseRecommendation = {
        main: { name: '燕麦', amount: '50g', alternatives: ['糙米', '玉米', '红薯', '藜麦'] },
        protein: { name: '鸡蛋', amount: '1个 + 鸡胸肉100g', alternatives: ['三文鱼', '瘦牛肉', '豆腐', '牛奶'] },
        vegetables: { name: '菠菜', amount: '200g', alternatives: ['西兰花', '胡萝卜', '豆角', '生菜'] },
        fruits: { name: '香蕉', amount: '1根', alternatives: ['苹果', '橙子', '蓝莓', '猕猴桃'] },
        nuts: { name: '核桃', amount: '2个', alternatives: ['杏仁', '腰果', '花生', '开心果'] },
        tips: '青年期代谢旺盛，需足量蛋白质和维生素支持身体发育和工作压力'
      };
    } else if (age === 'middle') {
      baseRecommendation = {
        main: { name: '藜麦', amount: '80g', alternatives: ['糙米', '燕麦', '玉米', '红薯'] },
        protein: { name: '三文鱼', amount: '100g', alternatives: ['鸡胸肉', '瘦牛肉', '豆腐', '鸡蛋'] },
        vegetables: { name: '西兰花', amount: '150g', alternatives: ['胡萝卜', '菠菜', '豆角', '生菜'] },
        fruits: { name: '蓝莓', amount: '1小盒', alternatives: ['苹果', '橙子', '猕猴桃', '草莓'] },
        nuts: { name: '杏仁', amount: '10颗', alternatives: ['核桃', '腰果', '花生', '开心果'] },
        tips: '中年期需控制热量摄入，增加抗氧化食物，预防慢性疾病'
      };
    } else if (age === 'elderly') {
      baseRecommendation = {
        main: { name: '小米粥', amount: '1碗', alternatives: ['糙米', '燕麦', '山药', '紫薯'] },
        protein: { name: '豆腐', amount: '100g', alternatives: ['鸡蛋', '鱼肉', '瘦肉', '牛奶'] },
        vegetables: { name: '胡萝卜', amount: '150g', alternatives: ['菠菜', '西兰花', '冬瓜', '白菜'] },
        fruits: { name: '橙子', amount: '1个', alternatives: ['苹果', '香蕉', '猕猴桃', '柚子'] },
        nuts: { name: '核桃', amount: '1个', alternatives: ['杏仁', '花生', '松子', '瓜子'] },
        tips: '老年期需易消化食物，补充钙质和维生素D，保护骨骼健康'
      };
    } else {
      baseRecommendation = {
        main: { name: '糙米', amount: '100g', alternatives: ['燕麦', '玉米', '红薯', '藜麦'] },
        protein: { name: '鸡胸肉', amount: '100g', alternatives: ['三文鱼', '鸡蛋', '豆腐', '瘦牛肉'] },
        vegetables: { name: '西兰花', amount: '150g', alternatives: ['菠菜', '胡萝卜', '黄瓜', '豆角'] },
        fruits: { name: '苹果', amount: '1个', alternatives: ['橙子', '蓝莓', '香蕉', '猕猴桃'] },
        nuts: { name: '杏仁', amount: '10颗', alternatives: ['核桃', '腰果', '花生', '开心果'] },
        tips: '均衡饮食，遵循「主食 1/2 全谷物 + 蛋白质 1/4 + 蔬菜 1/4+1 份水果 + 1 把坚果」核心原则'
      };
    }
    
    // 根据季节调整推荐
    if (season === 'spring') {
      // 春季推荐：疏肝理气，清淡饮食
      baseRecommendation.main = { 
        ...baseRecommendation.main, 
        name: age === 'young' ? '小米' : age === 'middle' ? '薏米' : '小米粥', 
        alternatives: ['糙米', '燕麦', '薏米', '藜麦'] 
      };
      baseRecommendation.vegetables = { 
        ...baseRecommendation.vegetables, 
        name: age === 'young' ? '韭菜' : age === 'middle' ? '香椿' : '菠菜', 
        alternatives: ['菠菜', '香椿', '韭菜', '豆苗', '豌豆苗'] 
      };
      baseRecommendation.fruits = { 
        ...baseRecommendation.fruits, 
        name: age === 'young' ? '草莓' : age === 'middle' ? '樱桃' : '樱桃', 
        alternatives: ['草莓', '樱桃', '桑葚', '青枣', '枇杷'] 
      };
      baseRecommendation.tips = baseRecommendation.tips + '，春季宜疏肝理气，多食时令蔬果，少酸多甘。';
    } else if (season === 'summer') {
      // 夏季推荐：清热解暑，清淡饮食
      baseRecommendation.main = { 
        ...baseRecommendation.main, 
        name: age === 'young' ? '绿豆粥' : age === 'middle' ? '薏米粥' : '绿豆粥', 
        alternatives: ['薏米', '小米', '糙米', '燕麦'] 
      };
      baseRecommendation.vegetables = { 
        ...baseRecommendation.vegetables, 
        name: age === 'young' ? '苦瓜' : age === 'middle' ? '冬瓜' : '丝瓜', 
        alternatives: ['冬瓜', '丝瓜', '苦瓜', '黄瓜', '西红柿'] 
      };
      baseRecommendation.fruits = { 
        ...baseRecommendation.fruits, 
        name: age === 'young' ? '西瓜' : age === 'middle' ? '桃子' : '桃子', 
        alternatives: ['西瓜', '桃子', '李子', '葡萄', '哈密瓜'] 
      };
      baseRecommendation.tips = baseRecommendation.tips + '，夏季宜清热解暑，多食瓜果，注意补充水分。';
    } else if (season === 'autumn') {
      // 秋季推荐：滋阴润燥，养肺为主
      baseRecommendation.main = { 
        ...baseRecommendation.main, 
        name: age === 'young' ? '银耳莲子粥' : age === 'middle' ? '百合粥' : '银耳莲子粥', 
        alternatives: ['百合', '银耳', '山药', '莲子'] 
      };
      baseRecommendation.vegetables = { 
        ...baseRecommendation.vegetables, 
        name: age === 'young' ? '白萝卜' : age === 'middle' ? '莲藕' : '莲藕', 
        alternatives: ['莲藕', '白萝卜', '银耳', '百合', '山药'] 
      };
      baseRecommendation.fruits = { 
        ...baseRecommendation.fruits, 
        name: age === 'young' ? '梨' : age === 'middle' ? '柿子' : '梨', 
        alternatives: ['梨', '柿子', '柚子', '石榴', '苹果'] 
      };
      baseRecommendation.tips = baseRecommendation.tips + '，秋季宜滋阴润燥，多食滋阴润肺食物，少吃辛辣。';
    } else if (season === 'winter') {
      // 冬季推荐：温补为主，藏精养肾
      baseRecommendation.main = { 
        ...baseRecommendation.main, 
        name: age === 'young' ? '黑米粥' : age === 'middle' ? '栗子粥' : '黑米粥', 
        alternatives: ['黑米', '小米', '栗子', '红豆'] 
      };
      baseRecommendation.vegetables = { 
        ...baseRecommendation.vegetables, 
        name: age === 'young' ? '羊肉' : age === 'middle' ? '牛肉' : '萝卜', 
        alternatives: ['羊肉', '牛肉', '萝卜', '白菜', '山药'] 
      };
      baseRecommendation.fruits = { 
        ...baseRecommendation.fruits, 
        name: age === 'young' ? '橘子' : age === 'middle' ? '冬枣' : '橘子', 
        alternatives: ['橘子', '冬枣', '山楂', '甘蔗', '桂圆'] 
      };
      baseRecommendation.tips = baseRecommendation.tips + '，冬季宜温补藏精，多食温热食物，适当进补。';
    }
    
    return baseRecommendation;
  };

  // 检测可能缺乏的营养素
  const getNutrientDeficiencyAlert = (age) => {
    const season = getCurrentSeason();
    
    if (age === 'young') {
      let nutrients = [
        { name: '维生素D', suggestion: '多晒太阳，食用富含维生素D的食物如蛋黄、鱼类' },
        { name: '钙', suggestion: '每日摄入800mg钙，可选择牛奶、豆腐、芝麻' },
        { name: '膳食纤维', suggestion: '每日摄入25-30g，多吃全谷物、蔬菜水果' }
      ];
      
      // 根据季节添加特定营养素提醒
      if (season === 'winter') {
        nutrients.push({ name: '维生素C', suggestion: '冬季易感冒，多食柑橘类水果增强免疫力' });
      } else if (season === 'summer') {
        nutrients.push({ name: '维生素B群', suggestion: '夏季出汗多，补充B族维生素，如全谷物、绿叶蔬菜' });
      }
      
      return nutrients;
    } else if (age === 'middle') {
      let nutrients = [
        { name: 'Omega-3脂肪酸', suggestion: '每周吃2-3次深海鱼，如三文鱼、沙丁鱼' },
        { name: '抗氧化物质', suggestion: '多食蓝莓、西兰花、坚果等抗氧化食物' },
        { name: '膳食纤维', suggestion: '每日摄入25-30g，有助控糖控脂' }
      ];
      
      // 根据季节添加特定营养素提醒
      if (season === 'winter') {
        nutrients.push({ name: '维生素D', suggestion: '冬季日照少，需额外补充维生素D或增加户外活动' });
      } else if (season === 'summer') {
        nutrients.push({ name: '镁元素', suggestion: '夏季出汗多，补充坚果、绿叶蔬菜等富含镁的食物' });
      }
      
      return nutrients;
    } else if (age === 'elderly') {
      let nutrients = [
        { name: '钙', suggestion: '每日摄入1000mg钙，选择易吸收的钙源如牛奶、豆腐' },
        { name: '维生素B12', suggestion: '老年人吸收能力下降，可适当补充或食用动物性食品' },
        { name: '优质蛋白', suggestion: '适量增加蛋白质摄入，预防肌肉流失' }
      ];
      
      // 根据季节添加特定营养素提醒
      if (season === 'winter') {
        nutrients.push({ name: '维生素D', suggestion: '冬季日照不足，老年人更需补充维生素D以助钙吸收' });
      } else if (season === 'summer') {
        nutrients.push({ name: '钾元素', suggestion: '夏季易脱水，多食香蕉、土豆等富含钾的食物维持电解质平衡' });
      }
      
      return nutrients;
    } else {
      let nutrients = [
        { name: '维生素D', suggestion: '多晒太阳，食用富含维生素D的食物' },
        { name: '钙', suggestion: '每日摄入800mg钙，保护骨骼健康' },
        { name: '膳食纤维', suggestion: '每日摄入25-30g，促进肠道健康' }
      ];
      
      // 根据季节添加特定营养素提醒
      if (season === 'winter') {
        nutrients.push({ name: '维生素C', suggestion: '冬季增强免疫力，多食柑橘类、红色蔬果' });
      } else if (season === 'summer') {
        nutrients.push({ name: '水分', suggestion: '夏季需大量补水，每日饮水1.5-2L，多吃瓜果' });
      }
      
      return nutrients;
    }
  };

  const ageBasedRecommendation = getAgeAndSeasonBasedRecommendation(userAge);
  const nutrientAlerts = getNutrientDeficiencyAlert(userAge);

  return (
    <div className="diet-health-card rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-center mb-3 relative z-10">
        <h3 className="text-lg font-bold text-white" style={{ whiteSpace: 'nowrap' }}>饮食健康</h3>
        <div className="flex gap-1" style={{ justifyContent: 'flex-end' }}>
          <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
            {getCurrentSeason() === 'spring' ? '🌸春季' : getCurrentSeason() === 'summer' ? '🌞夏季' : getCurrentSeason() === 'autumn' ? '🍂秋季' : '❄️冬季'}
          </span>
          <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
            {userAge === 'young' ? '青年' : userAge === 'middle' ? '中年' : userAge === 'elderly' ? '老年' : '成年'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* 主食和蛋白质并排显示 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100 relative">
            <div className="absolute top-0 left-0 w-full h-full highlight-gradient-blue"></div>
            <div className="relative z-10">
              <div className="text-xl font-bold text-blue-600">{ageBasedRecommendation.main.amount}</div>
              <div className="text-xs font-medium text-blue-800 truncate">{ageBasedRecommendation.main.name}</div>
              <div className="text-xs text-blue-600 mt-1">主食</div>
            </div>
          </div>
          
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100 relative">
            <div className="absolute top-0 left-0 w-full h-full highlight-gradient-green"></div>
            <div className="relative z-10">
              <div className="text-xl font-bold text-green-600">{ageBasedRecommendation.protein.amount}</div>
              <div className="text-xs font-medium text-green-800 truncate">{ageBasedRecommendation.protein.name}</div>
              <div className="text-xs text-green-600 mt-1">蛋白质</div>
            </div>
          </div>
        </div>
        
        {/* 蔬菜、水果和坚果并排显示 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-red-50 rounded-lg border border-red-100 relative">
            <div className="absolute top-0 left-0 w-full h-full highlight-gradient-red"></div>
            <div className="relative z-10">
              <div className="text-xl font-bold text-red-600">{ageBasedRecommendation.vegetables.amount}</div>
              <div className="text-xs font-medium text-red-800 truncate">{ageBasedRecommendation.vegetables.name}</div>
              <div className="text-xs text-red-600 mt-1">蔬菜</div>
            </div>
          </div>
          
          <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-100 relative">
            <div className="absolute top-0 left-0 w-full h-full highlight-gradient-orange"></div>
            <div className="relative z-10">
              <div className="text-xl font-bold text-yellow-600">{ageBasedRecommendation.fruits.amount}</div>
              <div className="text-xs font-medium text-yellow-800 truncate">{ageBasedRecommendation.fruits.name}</div>
              <div className="text-xs text-yellow-600 mt-1">水果</div>
            </div>
          </div>
          
          <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-100 relative">
            <div className="absolute top-0 left-0 w-full h-full highlight-gradient-purple"></div>
            <div className="relative z-10">
              <div className="text-xl font-bold text-purple-600">{ageBasedRecommendation.nuts.amount}</div>
              <div className="text-xs font-medium text-purple-800 truncate">{ageBasedRecommendation.nuts.name}</div>
              <div className="text-xs text-purple-600 mt-1">坚果</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-xs text-white/80 italic">{ageBasedRecommendation.tips}</p>
      </div>
      
      <div className="mb-3">
        <h4 className="font-semibold text-white mb-1 text-sm">可替换同类食物:</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>
            <span className="font-medium text-white">主食替换:</span>
            <span className="text-white/80 ml-1">{ageBasedRecommendation.main.alternatives.join(', ')}</span>
          </div>
          <div>
            <span className="font-medium text-white">蛋白替换:</span>
            <span className="text-white/80 ml-1">{ageBasedRecommendation.protein.alternatives.join(', ')}</span>
          </div>
          <div>
            <span className="font-medium text-white">蔬菜替换:</span>
            <span className="text-white/80 ml-1">{ageBasedRecommendation.vegetables.alternatives.join(', ')}</span>
          </div>
          <div>
            <span className="font-medium text-white">水果替换:</span>
            <span className="text-white/80 ml-1">{ageBasedRecommendation.fruits.alternatives.join(', ')}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-3">
        <h4 className="font-semibold text-white mb-1 text-sm">可能缺乏的营养素:</h4>
        <div className="space-y-1">
          {nutrientAlerts.map((nutrient, index) => (
            <div key={index} className="flex items-start p-1 bg-white/20 rounded border border-white/30 backdrop-blur-sm">
              <span className="text-white/90 mr-1 text-sm">⚠️</span>
              <div>
                <div className="font-medium text-white text-xs">{nutrient.name}</div>
                <div className="text-xs text-white/80">{nutrient.suggestion}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs">
        <div>
          <span className="font-semibold text-white">热量:</span> 
          <span className="ml-1 text-white/80">1200-1500kcal</span>
        </div>
        <div>
          <span className="font-semibold text-white">评分:</span> 
          <span className="ml-1 text-green-300 font-bold">8.5/10</span>
        </div>
      </div>
      
      <div className="mt-2">
        <Link 
          to="/diet-health-detail" 
          className="w-full bg-gradient-to-r from-white/30 to-white/40 text-white text-center py-1.5 px-3 rounded-lg hover:from-white/40 hover:to-white/50 transition-all duration-300 backdrop-blur-sm border border-white/30 text-sm"
        >
          详细建议
        </Link>
      </div>
    </div>
  );
};

export default DietHealthCard;