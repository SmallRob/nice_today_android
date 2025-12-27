import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUserConfig } from '../contexts/UserConfigContext';

/**
 * 十二生肖数据
 */
const CHINESE_ZODIAC_DATA = [
  {
    name: '鼠',
    icon: '🐭',
    yearRange: '2008, 1996, 1984, 1972',
    element: '水',
    traits: ['聪明机灵', '反应敏捷', '善于交际'],
    strengths: ['机智灵活', '适应力强', '善于理财'],
    weaknesses: ['有时优柔寡断', '过于谨慎'],
    luckyColor: '蓝色、金色',
    luckyNumber: [1, 4, 9],
    compatible: ['牛', '龙', '猴'],
    description: '鼠年出生的人机智聪明，反应敏捷，善于交际。他们适应能力强，理财有方，但有时会过于谨慎。'
  },
  {
    name: '牛',
    icon: '🐮',
    yearRange: '2009, 1997, 1985, 1973',
    element: '土',
    traits: ['稳重踏实', '勤奋努力', '诚实可靠'],
    strengths: ['稳重可靠', '勤奋努力', '有耐心'],
    weaknesses: ['固执己见', '不善表达'],
    luckyColor: '黄色、绿色',
    luckyNumber: [2, 5, 8],
    compatible: ['鼠', '蛇', '鸡'],
    description: '牛年出生的人稳重踏实，勤奋努力，诚实可靠。他们做事认真，有耐心，但有时会固执己见。'
  },
  {
    name: '虎',
    icon: '🐯',
    yearRange: '2010, 1998, 1986, 1974',
    element: '木',
    traits: ['勇敢无畏', '热情豪爽', '富有冒险精神'],
    strengths: ['勇敢自信', '热情豪爽', '有领导力'],
    weaknesses: ['脾气急躁', '冲动鲁莽'],
    luckyColor: '蓝色、橙色',
    luckyNumber: [1, 3, 9],
    compatible: ['马', '狗', '猪'],
    description: '虎年出生的人勇敢无畏，热情豪爽，富有冒险精神。他们天生有领导力，但有时会冲动鲁莽。'
  },
  {
    name: '兔',
    icon: '🐰',
    yearRange: '2011, 1999, 1987, 1975',
    element: '木',
    traits: ['温和善良', '聪明谨慎', '善于观察'],
    strengths: ['温和友善', '聪明机智', '善于沟通'],
    weaknesses: ['过于敏感', '优柔寡断'],
    luckyColor: '粉色、紫色',
    luckyNumber: [3, 4, 9],
    compatible: ['羊', '猴', '猪'],
    description: '兔年出生的人温和善良，聪明谨慎，善于观察。他们善于沟通，但有时过于敏感。'
  },
  {
    name: '龙',
    icon: '🐲',
    yearRange: '2012, 2000, 1988, 1976',
    element: '土',
    traits: ['气宇轩昂', '自信满满', '富有创造力'],
    strengths: ['自信豪爽', '有创造力', '天生的领导者'],
    weaknesses: ['过于自负', '不易接受意见'],
    luckyColor: '金色、银色',
    luckyNumber: [1, 6, 7],
    compatible: ['鼠', '猴', '鸡'],
    description: '龙年出生的人气宇轩昂，自信满满，富有创造力。他们是天生的领导者，但有时会过于自负。'
  },
  {
    name: '蛇',
    icon: '🐍',
    yearRange: '2013, 2001, 1989, 1977',
    element: '火',
    traits: ['冷静理智', '敏锐洞察', '善于思考'],
    strengths: ['冷静睿智', '观察敏锐', '理财有道'],
    weaknesses: ['多疑敏感', '不易信任他人'],
    luckyColor: '黑色、红色',
    luckyNumber: [2, 8, 9],
    compatible: ['牛', '鸡'],
    description: '蛇年出生的人冷静理智，敏锐洞察，善于思考。他们观察敏锐，理财有道，但有时会多疑敏感。'
  },
  {
    name: '马',
    icon: '🐴',
    yearRange: '2014, 2002, 1990, 1978',
    element: '火',
    traits: ['热情奔放', '积极乐观', '充满活力'],
    strengths: ['热情开朗', '积极进取', '善于表达'],
    weaknesses: ['急躁易怒', '缺乏耐心'],
    luckyColor: '红色、紫色',
    luckyNumber: [2, 3, 7],
    compatible: ['虎', '羊', '狗'],
    description: '马年出生的人热情奔放，积极乐观，充满活力。他们善于表达，积极进取，但有时会急躁易怒。'
  },
  {
    name: '羊',
    icon: '🐑',
    yearRange: '2015, 2003, 1991, 1979',
    element: '土',
    traits: ['温柔善良', '富有同情心', '追求和平'],
    strengths: ['温柔体贴', '富有同情心', '艺术天赋'],
    weaknesses: ['过于敏感', '缺乏自信'],
    luckyColor: '绿色、棕色',
    luckyNumber: [2, 7],
    compatible: ['兔', '马', '猪'],
    description: '羊年出生的人温柔善良，富有同情心，追求和平。他们有艺术天赋，但有时会缺乏自信。'
  },
  {
    name: '猴',
    icon: '🐵',
    yearRange: '2016, 2004, 1992, 1980',
    element: '金',
    traits: ['聪明机灵', '活泼好动', '善于交际'],
    strengths: ['聪明机智', '活泼开朗', '适应力强'],
    weaknesses: ['注意力分散', '不够专注'],
    luckyColor: '白色、金色',
    luckyNumber: [1, 7, 8],
    compatible: ['鼠', '龙'],
    description: '猴年出生的人聪明机灵，活泼好动，善于交际。他们适应力强，但有时会注意力分散。'
  },
  {
    name: '鸡',
    icon: '🐔',
    yearRange: '2017, 2005, 1993, 1981',
    element: '金',
    traits: ['勤奋努力', '认真负责', '善于理财'],
    strengths: ['勤奋认真', '有责任心', '善于规划'],
    weaknesses: ['过于挑剔', '爱钻牛角尖'],
    luckyColor: '黄色、棕色',
    luckyNumber: [5, 7, 8],
    compatible: ['龙', '蛇', '牛'],
    description: '鸡年出生的人勤奋努力，认真负责，善于理财。他们有责任心，善于规划，但有时会过于挑剔。'
  },
  {
    name: '狗',
    icon: '🐶',
    yearRange: '2018, 2006, 1994, 1982',
    element: '土',
    traits: ['忠诚正直', '勤奋可靠', '富有正义感'],
    strengths: ['忠诚可靠', '正直诚实', '有责任心'],
    weaknesses: ['过于敏感', '不易敞开心扉'],
    luckyColor: '红色、绿色',
    luckyNumber: [3, 4, 9],
    compatible: ['虎', '马', '兔'],
    description: '狗年出生的人忠诚正直，勤奋可靠，富有正义感。他们有责任心，但有时不易敞开心扉。'
  },
  {
    name: '猪',
    icon: '🐷',
    yearRange: '2019, 2007, 1995, 1983',
    element: '水',
    traits: ['善良真诚', '豁达大方', '富有同情心'],
    strengths: ['善良豁达', '诚实可靠', '知足常乐'],
    weaknesses: ['过于轻信', '缺乏主见'],
    luckyColor: '黄色、灰色',
    luckyNumber: [2, 5, 8],
    compatible: ['兔', '羊', '虎'],
    description: '猪年出生的人善良真诚，豁达大方，富有同情心。他们诚实可靠，知足常乐，但有时会缺乏主见。'
  }
];

/**
 * 根据出生年份计算生肖
 */
const getChineseZodiac = (year) => {
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const index = (year - 4) % 12;
  return zodiacs[index >= 0 ? index : index + 12];
};

const ChineseZodiacPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentConfig } = useUserConfig();
  
  // 从用户配置中获取生肖
  const [userZodiac, setUserZodiac] = useState(() => {
    if (currentConfig?.birthDate) {
      const year = new Date(currentConfig.birthDate).getFullYear();
      return getChineseZodiac(year);
    }
    return '鼠'; // 默认生肖
  });

  // 获取当前生肖数据
  const zodiacData = CHINESE_ZODIAC_DATA.find(z => z.name === userZodiac);

  // 获取元素颜色
  const getElementColor = (element) => {
    const colors = {
      '水': { text: 'text-blue-600 dark:text-blue-400', bg: 'from-blue-500', to: 'to-cyan-500' },
      '木': { text: 'text-green-600 dark:text-green-400', bg: 'from-green-500', to: 'to-emerald-500' },
      '火': { text: 'text-red-600 dark:text-red-400', bg: 'from-red-500', to: 'to-orange-500' },
      '土': { text: 'text-yellow-600 dark:text-yellow-400', bg: 'from-yellow-500', to: 'to-amber-500' },
      '金': { text: 'text-gray-600 dark:text-gray-400', bg: 'from-gray-500', to: 'to-slate-500' }
    };
    return colors[element] || { text: 'text-gray-600 dark:text-gray-100', bg: 'from-gray-500', to: 'to-gray-600' };
  };

  const elementColors = zodiacData ? getElementColor(zodiacData.element) : getElementColor('水');

  if (!zodiacData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">生肖数据加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme}`}>
      {/* 顶部标题栏 */}
      <div className={`bg-gradient-to-r ${elementColors.bg} ${elementColors.to} text-white sticky top-0 z-40 shadow-lg`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:text-white/90 flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
            <h1 className="text-xl font-bold">生肖运势</h1>
            <button
              onClick={() => navigate('/settings')}
              className="text-white hover:text-white/90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 生肖卡片 */}
        <div className={`bg-gradient-to-br ${elementColors.bg} ${elementColors.to} text-white rounded-xl shadow-lg p-6 mb-6`}>
          <div className="text-center mb-4">
            <div className="text-7xl mb-3">{zodiacData.icon}</div>
            <h2 className="text-3xl font-bold mb-2">您的生肖：{zodiacData.name}</h2>
            <div className="text-lg opacity-90">
              属{zodiacData.element}
            </div>
          </div>
        </div>

        {/* 详细描述 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">📖</span> 生肖概述
          </h3>
          <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
            {zodiacData.description}
          </p>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            出生年份：{zodiacData.yearRange}
          </div>
        </div>

        {/* 个性特质 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🌟</span> 性格特征
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {zodiacData.traits.map((trait, index) => (
              <div key={index} className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                <span className="text-gray-700 dark:text-gray-200">{trait}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 优点与缺点 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 优点 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4 flex items-center">
              <span className="mr-2">✨</span> 优点
            </h3>
            <div className="space-y-3">
              {zodiacData.strengths.map((strength, index) => (
                <div key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 dark:text-gray-200">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 需注意 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-4 flex items-center">
              <span className="mr-2">⚠️</span> 需注意
            </h3>
            <div className="space-y-3">
              {zodiacData.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 dark:text-gray-200">{weakness}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 幸运信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center">
            <span className="mr-2">🍀</span> 幸运信息
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">幸运色</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                {zodiacData.luckyColor}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">幸运数字</div>
              <div className="flex flex-wrap justify-center gap-2">
                {zodiacData.luckyNumber.map((num, index) => (
                  <span key={index} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full text-xl font-bold text-purple-600 dark:text-purple-400">
                    {num}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-2">速配生肖</div>
              <div className="flex flex-wrap justify-center gap-2">
                {zodiacData.compatible.map((sign, index) => (
                  <span key={index} className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-200">
                    {sign}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 其他生肖入口 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🔮</span> 查看其他生肖
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {CHINESE_ZODIAC_DATA.map((zodiac) => (
              <button
                key={zodiac.name}
                onClick={() => setUserZodiac(zodiac.name)}
                className={`p-3 rounded-lg transition-all ${
                  userZodiac === zodiac.name
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                }`}
              >
                <div className="text-2xl mb-1">{zodiac.icon}</div>
                <div className="text-xs font-bold">{zodiac.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChineseZodiacPage;
