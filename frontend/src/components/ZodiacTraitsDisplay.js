import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOROSCOPE_DATA_ENHANCED, getZodiacNumber } from '../utils/horoscopeAlgorithm';

/**
 * 星座综合特质和人性特点展示组件
 * 显示星座的个性特征、优点、缺点等详细信息
 */
const ZodiacTraitsDisplay = memo(({ currentHoroscope }) => {
  const navigate = useNavigate();

  if (!currentHoroscope) return null;

  // 跳转到详细页面
  const handleViewDetails = () => {
    // 使用数字编码作为URL参数，避免中文编码问题
    const zodiacNumber = getZodiacNumber(currentHoroscope);
    navigate('/horoscope-traits/' + zodiacNumber, {
      state: { userZodiac: currentHoroscope }
    });
  };

  // 获取当前星座数据
  const zodiac = HOROSCOPE_DATA_ENHANCED.find(h => h.name === currentHoroscope);
  if (!zodiac) return null;

  // 获取元素颜色
  const getElementColor = (element) => {
    const colors = {
      '火象': 'text-red-600 dark:text-red-400',
      '土象': 'text-green-600 dark:text-green-400',
      '风象': 'text-blue-600 dark:text-blue-400',
      '水象': 'text-purple-600 dark:text-purple-400'
    };
    return colors[element] || 'text-gray-600 dark:text-gray-300';
  };

  // 获取元素背景色
  const getElementBgColor = (element) => {
    const colors = {
      '火象': 'bg-red-100 dark:bg-red-900/20',
      '土象': 'bg-green-100 dark:bg-green-900/20',
      '风象': 'bg-blue-100 dark:bg-blue-900/20',
      '水象': 'bg-purple-100 dark:bg-purple-900/20'
    };
    return colors[element] || 'bg-gray-100 dark:bg-gray-900/20';
  };

  // 获取颜色中文名称
  const getColorName = (hexColor) => {
    const colorMap = {
      '#FF6B6B': '浅红',
      '#FF8E53': '橙红',
      '#FFD700': '金色',
      '#FFA500': '橙色',
      '#4ECDC4': '青绿',
      '#44A08D': '深绿',
      '#64B3F4': '浅蓝',
      '#4A90E2': '蓝色',
      '#96CEB4': '浅绿',
      '#FFEAA7': '淡黄',
      '#DA70D6': '兰紫',
      '#BA55D3': '紫色',
      '#808080': '灰色',
      '#A9A9A9': '浅灰',
      '#00BFFF': '深蓝',
      '#1E90FF': '天蓝',
      '#9370DB': '紫红',
      '#8A2BE2': '深紫'
    };
    return colorMap[hexColor] || '红色';
  };

  // 获取星座详细描述
  const getZodiacDescription = (zodiacName) => {
    const descriptions = {
      '白羊座': '白羊座是十二星座中的第一个星座，象征着新生和开始。他们充满活力、勇敢无畏，是天生的领导者和冒险家。',
      '金牛座': '金牛座代表着稳定和物质享受。他们务实、耐心，注重生活质量，是可靠的朋友和合作伙伴。',
      '双子座': '双子座是沟通和学习的代表。他们机智、好奇，善于交际，永远保持着对世界的好奇心。',
      '巨蟹座': '巨蟹座象征着家庭和情感。他们敏感、体贴，重视家庭关系，具有强烈的保护欲和同理心。',
      '狮子座': '狮子座代表着自信和创造力。他们热情、慷慨，喜欢成为焦点，具有天生的领导魅力。',
      '处女座': '处女座象征着完美和服务。他们细致、务实，注重细节，追求完美和秩序。',
      '天秤座': '天秤座代表着平衡和和谐。他们优雅、公正，重视人际关系，追求美和平衡。',
      '天蝎座': '天蝎座象征着深度和神秘。他们强烈、直觉敏锐，具有深刻的洞察力和强大的意志力。',
      '射手座': '射手座代表着自由和探索。他们乐观、爱冒险，追求知识和真理，具有哲学思维。',
      '摩羯座': '摩羯座象征着责任和成就。他们实际、有耐心，目标明确，具有强烈的责任感。',
      '水瓶座': '水瓶座代表着创新和独立。他们思想前卫、人道主义，重视自由和进步。',
      '双鱼座': '双鱼座象征着梦想和同情心。他们富有想象力、直觉强，具有艺术天赋和同理心。'
    };
    return descriptions[zodiacName] || `${zodiacName}具有独特的个性和魅力。`;
  };

  // 获取星座名人例子
  const getFamousExamples = (zodiacName) => {
    const examples = {
      '白羊座': ['Lady Gaga', '成龙', '梵高'],
      '金牛座': ['奥黛丽·赫本', '马克思', '莎士比亚'],
      '双子座': ['玛丽莲·梦露', '肯尼迪', '安吉丽娜·朱莉'],
      '巨蟹座': ['汤姆·汉克斯', '戴安娜王妃', '海明威'],
      '狮子座': ['奥巴马', '麦当娜', '拿破仑'],
      '处女座': ['迈克尔·杰克逊', '巴菲特', '托尔斯泰'],
      '天秤座': ['刘德华', '马云', '甘地'],
      '天蝎座': ['比尔·盖茨', '居里夫人', '毕加索'],
      '射手座': ['泰勒·斯威夫特', '丘吉尔', '贝多芬'],
      '摩羯座': ['牛顿', '马丁·路德·金', '毛泽东'],
      '水瓶座': ['爱迪生', '达尔文', '林肯'],
      '双鱼座': ['爱因斯坦', '乔布斯', '雨果']
    };
    return examples[zodiacName] || ['知名人物'];
  };

  return (
    <div
      onClick={handleViewDetails}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-800 mt-6 cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-2 text-2xl">{zodiac.icon}</span>
          {zodiac.name} 综合特质
        </h3>
        <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold flex items-center">
          查看详情
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>

      {/* 基本属性 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-3 rounded-lg ${getElementBgColor(zodiac.element)}`}>
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">元素属性</div>
          <div className={`font-semibold ${getElementColor(zodiac.element)}`}>
            {zodiac.element}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">日期范围</div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {zodiac.dateRange}
          </div>
        </div>
      </div>

      {/* 详细描述 */}
      <div className="mb-4">
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {getZodiacDescription(zodiac.name)}
        </div>
      </div>

      {/* 个性特质网格 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* 性格特征 */}
        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
            <span className="mr-1">🌟</span> 性格特征
          </h4>
          <div className="space-y-1">
            {zodiac.personalityTraits?.map((trait, index) => (
              <div key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                {trait}
              </div>
            )) || zodiac.traits?.split('、').map((trait, index) => (
              <div key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                {trait}
              </div>
            ))}
          </div>
        </div>

        {/* 优点 */}
        <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
          <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center">
            <span className="mr-1">✨</span> 优点
          </h4>
          <div className="space-y-1">
            {zodiac.strengths?.map((strength, index) => (
              <div key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                {strength}
              </div>
            )) || ['待补充']}
          </div>
        </div>

        {/* 缺点 */}
        <div className="bg-orange-50 dark:bg-orange-900/10 p-3 rounded-lg">
          <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center">
            <span className="mr-1">⚠️</span> 需注意
          </h4>
          <div className="space-y-1">
            {zodiac.weaknesses?.map((weakness, index) => (
              <div key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-center">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                {weakness}
              </div>
            )) || ['待补充']}
          </div>
        </div>
      </div>

      {/* 幸运信息 */}
      <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg mb-4">
        <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center">
          <span className="mr-1">🍀</span> 幸运信息
        </h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-100">幸运色</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {zodiac.luckyColor?.map(c => getColorName(c)).join('、') || '红色'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-100">幸运数字</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {zodiac.luckyNumber?.join('、') || '7'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-100">速配星座</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {zodiac.compatible?.slice(0, 2).join('、') || '待补充'}
            </div>
          </div>
        </div>
      </div>

      {/* 名人例子 */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2 flex items-center">
          <span className="mr-1">⭐</span> 知名{currentHoroscope}
        </h4>
        <div className="flex flex-wrap gap-2">
          {getFamousExamples(zodiac.name).map((name, index) => (
            <span key={index} className="px-2 py-1 bg-white dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-100 rounded">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

ZodiacTraitsDisplay.displayName = 'ZodiacTraitsDisplay';

export default ZodiacTraitsDisplay;