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

  // 根据年龄推荐不同饮食结构
  const getAgeBasedRecommendation = (age) => {
    if (age === 'young') {
      return {
        main: { name: '燕麦', amount: '50g', alternatives: ['糙米', '玉米', '红薯', '藜麦'] },
        protein: { name: '鸡蛋', amount: '1个 + 鸡胸肉100g', alternatives: ['三文鱼', '瘦牛肉', '豆腐', '牛奶'] },
        vegetables: { name: '菠菜', amount: '200g', alternatives: ['西兰花', '胡萝卜', '豆角', '生菜'] },
        fruits: { name: '香蕉', amount: '1根', alternatives: ['苹果', '橙子', '蓝莓', '猕猴桃'] },
        nuts: { name: '核桃', amount: '2个', alternatives: ['杏仁', '腰果', '花生', '开心果'] },
        tips: '青年期代谢旺盛，需足量蛋白质和维生素支持身体发育和工作压力'
      };
    } else if (age === 'middle') {
      return {
        main: { name: '藜麦', amount: '80g', alternatives: ['糙米', '燕麦', '玉米', '红薯'] },
        protein: { name: '三文鱼', amount: '100g', alternatives: ['鸡胸肉', '瘦牛肉', '豆腐', '鸡蛋'] },
        vegetables: { name: '西兰花', amount: '150g', alternatives: ['胡萝卜', '菠菜', '豆角', '生菜'] },
        fruits: { name: '蓝莓', amount: '1小盒', alternatives: ['苹果', '橙子', '猕猴桃', '草莓'] },
        nuts: { name: '杏仁', amount: '10颗', alternatives: ['核桃', '腰果', '花生', '开心果'] },
        tips: '中年期需控制热量摄入，增加抗氧化食物，预防慢性疾病'
      };
    } else if (age === 'elderly') {
      return {
        main: { name: '小米粥', amount: '1碗', alternatives: ['糙米', '燕麦', '山药', '紫薯'] },
        protein: { name: '豆腐', amount: '100g', alternatives: ['鸡蛋', '鱼肉', '瘦肉', '牛奶'] },
        vegetables: { name: '胡萝卜', amount: '150g', alternatives: ['菠菜', '西兰花', '冬瓜', '白菜'] },
        fruits: { name: '橙子', amount: '1个', alternatives: ['苹果', '香蕉', '猕猴桃', '柚子'] },
        nuts: { name: '核桃', amount: '1个', alternatives: ['杏仁', '花生', '松子', '瓜子'] },
        tips: '老年期需易消化食物，补充钙质和维生素D，保护骨骼健康'
      };
    } else {
      return {
        main: { name: '糙米', amount: '100g', alternatives: ['燕麦', '玉米', '红薯', '藜麦'] },
        protein: { name: '鸡胸肉', amount: '100g', alternatives: ['三文鱼', '鸡蛋', '豆腐', '瘦牛肉'] },
        vegetables: { name: '西兰花', amount: '150g', alternatives: ['菠菜', '胡萝卜', '黄瓜', '豆角'] },
        fruits: { name: '苹果', amount: '1个', alternatives: ['橙子', '蓝莓', '香蕉', '猕猴桃'] },
        nuts: { name: '杏仁', amount: '10颗', alternatives: ['核桃', '腰果', '花生', '开心果'] },
        tips: '均衡饮食，遵循「主食 1/2 全谷物 + 蛋白质 1/4 + 蔬菜 1/4+1 份水果 + 1 把坚果」核心原则'
      };
    }
  };

  // 检测可能缺乏的营养素
  const getNutrientDeficiencyAlert = (age) => {
    if (age === 'young') {
      return [
        { name: '维生素D', suggestion: '多晒太阳，食用富含维生素D的食物如蛋黄、鱼类' },
        { name: '钙', suggestion: '每日摄入800mg钙，可选择牛奶、豆腐、芝麻' },
        { name: '膳食纤维', suggestion: '每日摄入25-30g，多吃全谷物、蔬菜水果' }
      ];
    } else if (age === 'middle') {
      return [
        { name: 'Omega-3脂肪酸', suggestion: '每周吃2-3次深海鱼，如三文鱼、沙丁鱼' },
        { name: '抗氧化物质', suggestion: '多食蓝莓、西兰花、坚果等抗氧化食物' },
        { name: '膳食纤维', suggestion: '每日摄入25-30g，有助控糖控脂' }
      ];
    } else if (age === 'elderly') {
      return [
        { name: '钙', suggestion: '每日摄入1000mg钙，选择易吸收的钙源如牛奶、豆腐' },
        { name: '维生素B12', suggestion: '老年人吸收能力下降，可适当补充或食用动物性食品' },
        { name: '优质蛋白', suggestion: '适量增加蛋白质摄入，预防肌肉流失' }
      ];
    } else {
      return [
        { name: '维生素D', suggestion: '多晒太阳，食用富含维生素D的食物' },
        { name: '钙', suggestion: '每日摄入800mg钙，保护骨骼健康' },
        { name: '膳食纤维', suggestion: '每日摄入25-30g，促进肠道健康' }
      ];
    }
  };

  const ageBasedRecommendation = getAgeBasedRecommendation(userAge);
  const nutrientAlerts = getNutrientDeficiencyAlert(userAge);

  return (
    <div className="diet-health-card rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-xl font-bold text-white">饮食健康卡片</h3>
        <span className="text-sm bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">
          {userAge === 'young' ? '青年' : userAge === 'middle' ? '中年' : userAge === 'elderly' ? '老年' : '成年'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100 relative">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-blue"></div>
          <div className="relative z-10">
            <div className="text-2xl font-bold text-blue-600">{ageBasedRecommendation.main.amount}</div>
            <div className="text-sm font-medium text-blue-800">{ageBasedRecommendation.main.name}</div>
            <div className="text-xs text-blue-600 mt-1">主食</div>
          </div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100 relative">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-green"></div>
          <div className="relative z-10">
            <div className="text-2xl font-bold text-green-600">{ageBasedRecommendation.protein.amount}</div>
            <div className="text-sm font-medium text-green-800">{ageBasedRecommendation.protein.name}</div>
            <div className="text-xs text-green-600 mt-1">蛋白质</div>
          </div>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100 relative">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-red"></div>
          <div className="relative z-10">
            <div className="text-2xl font-bold text-red-600">{ageBasedRecommendation.vegetables.amount}</div>
            <div className="text-sm font-medium text-red-800">{ageBasedRecommendation.vegetables.name}</div>
            <div className="text-xs text-red-600 mt-1">蔬菜</div>
          </div>
        </div>
        
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100 relative">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-orange"></div>
          <div className="relative z-10">
            <div className="text-2xl font-bold text-yellow-600">{ageBasedRecommendation.fruits.amount}</div>
            <div className="text-sm font-medium text-yellow-800">{ageBasedRecommendation.fruits.name}</div>
            <div className="text-xs text-yellow-600 mt-1">水果</div>
          </div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100 relative">
          <div className="absolute top-0 left-0 w-full h-full highlight-gradient-purple"></div>
          <div className="relative z-10">
            <div className="text-2xl font-bold text-purple-600">{ageBasedRecommendation.nuts.amount}</div>
            <div className="text-sm font-medium text-purple-800">{ageBasedRecommendation.nuts.name}</div>
            <div className="text-xs text-purple-600 mt-1">坚果</div>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-white/80 italic">{ageBasedRecommendation.tips}</p>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-white mb-2">可替换同类食物:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium text-white">主食替换:</span>
            <span className="text-white/80 ml-2">{ageBasedRecommendation.main.alternatives.join(', ')}</span>
          </div>
          <div>
            <span className="font-medium text-white">蛋白替换:</span>
            <span className="text-white/80 ml-2">{ageBasedRecommendation.protein.alternatives.join(', ')}</span>
          </div>
          <div>
            <span className="font-medium text-white">蔬菜替换:</span>
            <span className="text-white/80 ml-2">{ageBasedRecommendation.vegetables.alternatives.join(', ')}</span>
          </div>
          <div>
            <span className="font-medium text-white">水果替换:</span>
            <span className="text-white/80 ml-2">{ageBasedRecommendation.fruits.alternatives.join(', ')}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-white mb-2">可能缺乏的营养素:</h4>
        <div className="space-y-2">
          {nutrientAlerts.map((nutrient, index) => (
            <div key={index} className="flex items-start p-2 bg-white/20 rounded border border-white/30 backdrop-blur-sm">
              <span className="text-white/90 mr-2">⚠️</span>
              <div>
                <div className="font-medium text-white">{nutrient.name}</div>
                <div className="text-xs text-white/80">{nutrient.suggestion}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm">
          <span className="font-semibold text-white">热量估算:</span> 
          <span className="ml-1 text-white/80">1200-1500 kcal</span>
        </div>
        <div className="text-sm">
          <span className="font-semibold text-white">营养均衡评分:</span> 
          <span className="ml-1 text-green-300 font-bold">8.5/10</span>
        </div>
      </div>
      
      <div className="mt-4">
        <Link 
          to="/diet-health-detail" 
          className="w-full bg-gradient-to-r from-white/30 to-white/40 text-white text-center py-2 px-4 rounded-lg hover:from-white/40 hover:to-white/50 transition-all duration-300 backdrop-blur-sm border border-white/30"
        >
          查看详细建议
        </Link>
      </div>
    </div>
  );
};

export default DietHealthCard;