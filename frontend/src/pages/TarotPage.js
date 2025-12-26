import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import PageLayout, { Card, Button } from '../components/PageLayout';
import '../index.css';

// 塔罗牌数据 - 大阿卡纳牌（22张）
const MAJOR_ARCANA = [
  { id: 0, name: '愚者', nameEn: 'The Fool', keywords: ['新的开始', '冒险', '纯真', '自由'], meaning: '现在是冒险和尝试新事物的好时机，不要害怕未知。', reversed: '可能表示鲁莽或缺乏计划，需要谨慎行事。' },
  { id: 1, name: '魔术师', nameEn: 'The Magician', keywords: ['创造力', '能力', '行动', '技能'], meaning: '你拥有实现目标所需的资源和能力，行动起来吧。', reversed: '能力被滥用或计划不周，需要反思。' },
  { id: 2, name: '女祭司', nameEn: 'The High Priestess', keywords: ['直觉', '神秘', '潜意识', '智慧'], meaning: '相信你的直觉，答案就在内心深处。', reversed: '忽视直觉或被情绪困扰，需要冷静思考。' },
  { id: 3, name: '皇后', nameEn: 'The Empress', keywords: ['富饶', '母性', '自然', '创造力'], meaning: '繁荣与丰盛即将到来，享受生活的美好。', reversed: '可能表示创造力受阻或情感空虚。' },
  { id: 4, name: '皇帝', nameEn: 'The Emperor', keywords: ['权威', '秩序', '控制', '结构'], meaning: '建立秩序和规则，用理性的方式解决问题。', reversed: '滥用权力或缺乏灵活性。' },
  { id: 5, name: '教皇', nameEn: 'The Hierophant', keywords: ['传统', '信仰', '学习', '指导'], meaning: '寻求传统智慧和导师的指引。', reversed: '挑战传统或盲目信仰，需要独立思考。' },
  { id: 6, name: '恋人', nameEn: 'The Lovers', keywords: ['爱情', '选择', '和谐', '关系'], meaning: '重要的选择即将来临，跟随内心的真实想法。', reversed: '关系问题或选择困难。' },
  { id: 7, name: '战车', nameEn: 'The Chariot', keywords: ['胜利', '意志', '控制', '决心'], meaning: '通过坚定的意志力实现目标，继续前进。', reversed: '失控或缺乏方向。' },
  { id: 8, name: '力量', nameEn: 'Strength', keywords: ['勇气', '耐心', '同情心', '内在力量'], meaning: '以柔克刚，内在的力量比外在的力量更重要。', reversed: '软弱或缺乏信心。' },
  { id: 9, name: '隐士', nameEn: 'The Hermit', keywords: ['内省', '孤独', '智慧', '寻求'], meaning: '花时间独处思考，寻找内在的智慧。', reversed: '孤立或逃避现实。' },
  { id: 10, name: '命运之轮', nameEn: 'Wheel of Fortune', keywords: ['命运', '变化', '周期', '机会'], meaning: '命运的转盘正在转动，迎接新的变化和机会。', reversed: '运气不佳或计划受阻。' },
  { id: 11, name: '正义', nameEn: 'Justice', keywords: ['公平', '真理', '法律', '因果'], meaning: '公正和真理将得到体现，为你的行为负责。', reversed: '不公正或欺骗。' },
  { id: 12, name: '倒吊人', nameEn: 'The Hanged Man', keywords: ['牺牲', '等待', '新视角', '放下'], meaning: '从不同角度看待问题，有时候牺牲是必要的。', reversed: '不愿改变或拖延。' },
  { id: 13, name: '死神', nameEn: 'Death', keywords: ['转变', '结束', '重生', '改变'], meaning: '旧的结束，新的开始，拥抱变化。', reversed: '抗拒改变或停滞不前。' },
  { id: 14, name: '节制', nameEn: 'Temperance', keywords: ['平衡', '调和', '耐心', '适度'], meaning: '在生活中找到平衡，保持耐心和适度。', reversed: '失衡或缺乏耐心。' },
  { id: 15, name: '恶魔', nameEn: 'The Devil', keywords: ['束缚', '诱惑', '物质主义', '执念'], meaning: '打破束缚，克服内心的恐惧和执念。', reversed: '挣脱束缚或获得自由。' },
  { id: 16, name: '高塔', nameEn: 'The Tower', keywords: ['突然变化', '启示', '混乱', '解放'], meaning: '突然的变化带来启示，虽然痛苦但必要。', reversed: '避免灾难或延缓改变。' },
  { id: 17, name: '星星', nameEn: 'The Star', keywords: ['希望', '灵感', '和平', '更新'], meaning: '希望之星闪耀，新的灵感和机遇即将到来。', reversed: '失去希望或缺乏信心。' },
  { id: 18, name: '月亮', nameEn: 'The Moon', keywords: ['幻觉', '不安', '直觉', '隐藏'], meaning: '面对内心的恐惧和不安，相信直觉。', reversed: '真相显现或消除恐惧。' },
  { id: 19, name: '太阳', nameEn: 'The Sun', keywords: ['快乐', '成功', '活力', '乐观'], meaning: '阳光普照，幸福和成功就在眼前。', reversed: '短暂的快乐或过度乐观。' },
  { id: 20, name: '审判', nameEn: 'Judgement', keywords: ['觉醒', '重生', '召唤', '决定'], meaning: '内心的觉醒，做出重要的决定。', reversed: '自我怀疑或逃避责任。' },
  { id: 21, name: '世界', nameEn: 'The World', keywords: ['完成', '成就', '整合', '圆满'], meaning: '一个周期的圆满完成，享受成就的喜悦。', reversed: '未完成或缺乏成就感。' }
];

// 塔罗牌数据 - 小阿卡纳牌（56张）
const MINOR_ARCANA = [
  // 权杖
  {
    suit: '权杖',
    suitEn: 'Wands',
    element: '火',
    color: 'red',
    cards: [
      { id: 0, name: '权杖首牌', keywords: ['新的开始', '灵感', '行动力'], meaning: '新的创意和机会即将到来，抓住它！' },
      { id: 1, name: '权杖二', keywords: ['规划', '决定', '选择'], meaning: '你已经做出了选择，现在需要仔细规划。' },
      { id: 2, name: '权杖三', keywords: ['远见', '开拓', '机会'], meaning: '把握眼前的发展机会，勇敢向前。' },
      { id: 3, name: '权杖四', keywords: ['庆祝', '和谐', '稳定'], meaning: '享受稳定的成果，庆祝成功的时刻。' },
      { id: 4, name: '权杖五', keywords: ['冲突', '竞争', '挑战'], meaning: '面对竞争和冲突，保持冷静和勇气。' },
      { id: 5, name: '权杖六', keywords: ['荣誉', '成功', '认可'], meaning: '你的成就将得到认可和荣誉。' },
      { id: 6, name: '权杖七', keywords: ['勇气', '挑战', '坚持'], meaning: '勇敢面对挑战，坚持下去就能成功。' },
      { id: 7, name: '权杖八', keywords: ['速度', '行动', '进展'], meaning: '快速行动，把握机遇，不要犹豫。' },
      { id: 8, name: '权杖九', keywords: ['韧性', '防御', '坚持'], meaning: '你已经准备好了，继续坚持就能成功。' },
      { id: 9, name: '权杖十', keywords: ['负担', '责任', '压力'], meaning: '承担了太多责任，需要学会放手。' },
      { id: 10, name: '权杖侍从', keywords: ['热情', '创造力', '消息'], meaning: '新的创意和灵感正在到来。' },
      { id: 11, name: '权杖骑士', keywords: ['冲动', '冒险', '激情'], meaning: '充满激情地追求目标，但要注意控制情绪。' },
      { id: 12, name: '权杖皇后', keywords: ['自信', '热情', '领导力'], meaning: '发挥你的领导力和热情，积极行动。' },
      { id: 13, name: '权杖国王', keywords: ['权威', '领导', '行动'], meaning: '以积极的方式领导，展现你的权威。' }
    ]
  },
  // 圣杯
  {
    suit: '圣杯',
    suitEn: 'Cups',
    element: '水',
    color: 'blue',
    cards: [
      { id: 0, name: '圣杯首牌', keywords: ['新的情感', '喜悦', '爱心'], meaning: '新的情感关系或精神觉醒即将开始。' },
      { id: 1, name: '圣杯二', keywords: ['伙伴关系', '爱情', '和谐'], meaning: '关系和谐，彼此支持和理解。' },
      { id: 2, name: '圣杯三', keywords: ['庆祝', '友谊', '欢乐'], meaning: '享受友谊带来的欢乐，与他人一起庆祝。' },
      { id: 3, name: '圣杯四', keywords: ['不满', '厌倦', '机会'], meaning: '不要只盯着失去的，眼前有更好的机会。' },
      { id: 4, name: '圣杯五', keywords: ['悲伤', '失望', '悲伤'], meaning: '接受失去，继续前行，光明在前面。' },
      { id: 5, name: '圣杯六', keywords: ['怀旧', '童年', '记忆'], meaning: '回顾过去，但不要让它影响你的未来。' },
      { id: 6, name: '圣杯七', keywords: ['幻觉', '选择', '困惑'], meaning: '认清现实，不要被幻想迷惑。' },
      { id: 7, name: '圣杯八', keywords: ['离开', '放弃', '新开始'], meaning: '离开过去的阴影，重新开始。' },
      { id: 8, name: '圣杯九', keywords: ['满足', '愿望', '幸福'], meaning: '你的愿望正在实现，享受当前的幸福。' },
      { id: 9, name: '圣杯十', keywords: ['幸福', '家庭', '圆满'], meaning: '生活充满幸福，家庭和谐美满。' },
      { id: 10, name: '圣杯侍从', keywords: ['新情感', '直觉', '敏感性'], meaning: '新的情感或机会正在萌发。' },
      { id: 11, name: '圣杯骑士', keywords: ['浪漫', '魅力', '想象力'], meaning: '展现你的魅力，追求浪漫的梦想。' },
      { id: 12, name: '圣杯皇后', keywords: ['直觉', '同情心', '情感'], meaning: '发挥你的同理心和直觉能力。' },
      { id: 13, name: '圣杯国王', keywords: ['情感智慧', '平衡', '平静'], meaning: '保持情感平衡，展现成熟的一面。' }
    ]
  },
  // 宝剑
  {
    suit: '宝剑',
    suitEn: 'Swords',
    element: '风',
    color: 'gray',
    cards: [
      { id: 0, name: '宝剑首牌', keywords: ['清晰的思维', '新的开始', '洞察力'], meaning: '思维的清晰和突破，做出明智的决定。' },
      { id: 1, name: '宝剑二', keywords: ['优柔寡断', '选择', '困境'], meaning: '面对两难选择，需要冷静分析。' },
      { id: 2, name: '宝剑三', keywords: ['心碎', '悲伤', '失落'], meaning: '经历痛苦，但要学会从中成长。' },
      { id: 3, name: '宝剑四', keywords: ['休息', '恢复', '安静'], meaning: '需要休息和恢复，给自己一些时间。' },
      { id: 4, name: '宝剑五', keywords: ['冲突', '背叛', '失败'], meaning: '学会从失败中汲取教训。' },
      { id: 5, name: '宝剑六', keywords: ['过渡', '改变', '旅行'], meaning: '即将经历一场重要的转变。' },
      { id: 6, name: '宝剑七', keywords: ['欺骗', '诡计', '策略'], meaning: '小心他人的欺骗行为，谨慎行事。' },
      { id: 7, name: '宝剑八', keywords: ['束缚', '限制', '困境'], meaning: '感觉被困住，需要寻找出路。' },
      { id: 8, name: '宝剑九', keywords: ['焦虑', '担忧', '失眠'], meaning: '面对内心的恐惧，学会放下焦虑。' },
      { id: 9, name: '宝剑十', keywords: ['痛苦', '结束', '重生'], meaning: '痛苦的终点，新生的起点。' },
      { id: 10, name: '宝剑侍从', keywords: ['好奇心', '新思想', '消息'], meaning: '新的思想和消息即将到来。' },
      { id: 11, name: '宝剑骑士', keywords: ['行动', '野心', '速度'], meaning: '快速行动，但要注意方式方法。' },
      { id: 12, name: '宝剑皇后', keywords: ['独立', '智慧', '判断力'], meaning: '发挥你的判断力和独立思考能力。' },
      { id: 13, name: '宝剑国王', keywords: ['权威', '理智', '判断'], meaning: '用理性和权威做出正确的判断。' }
    ]
  },
  // 星币
  {
    suit: '星币',
    suitEn: 'Pentacles',
    element: '土',
    color: 'yellow',
    cards: [
      { id: 0, name: '星币首牌', keywords: ['新的开始', '繁荣', '机会'], meaning: '物质和精神上的新机遇即将到来。' },
      { id: 1, name: '星币二', keywords: ['平衡', '灵活性', '适应'], meaning: '在工作与生活之间找到平衡。' },
      { id: 2, name: '星币三', keywords: ['合作', '团队', '成功'], meaning: '与团队合作，共同实现目标。' },
      { id: 3, name: '星币四', keywords: ['保守', '固执', '不改变'], meaning: '过于保守可能会错失机会。' },
      { id: 4, name: '星币五', keywords: ['贫困', '孤独', '困难'], meaning: '经历困境，但不要失去希望。' },
      { id: 5, name: '星币六', keywords: ['成功', '帮助他人', '慷慨'], meaning: '享受成功的同时，帮助他人。' },
      { id: 6, name: '星币七', keywords: ['耐心', '评估', '等待'], meaning: '耐心等待，仔细评估后再行动。' },
      { id: 7, name: '星币八', keywords: ['学徒', '技能', '勤奋'], meaning: '通过努力工作提升自己的技能。' },
      { id: 8, name: '星币九', keywords: ['独立', '财富', '成就'], meaning: '享受你的财富和成就，保持独立。' },
      { id: 9, name: '星币十', keywords: ['财富', '家庭', '繁荣'], meaning: '物质和精神的丰盛与和谐。' },
      { id: 10, name: '星币侍从', keywords: ['学习', '勤奋', '务实'], meaning: '勤奋学习，积累知识和经验。' },
      { id: 11, name: '星币骑士', keywords: ['勤奋', '稳定', '务实'], meaning: '稳步前进，实现你的目标。' },
      { id: 12, name: '星币皇后', keywords: ['慷慨', '滋养', '务实'], meaning: '展现你的慷慨和务实精神。' },
      { id: 13, name: '星币国王', keywords: ['成功', '稳定', '财富'], meaning: '你已经取得了成功，继续保持稳定。' }
    ]
  }
];

// 抽卡模式
const DRAW_MODES = {
  SINGLE: 'single',
  TRIPLE: 'triple'
};

// 三张牌阵位置
const CARD_POSITIONS = ['过去', '现在', '未来'];

function TarotPage() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('daily');
  const [drawMode, setDrawMode] = useState(DRAW_MODES.SINGLE);
  const [drawnCards, setDrawnCards] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [wish, setWish] = useState('');
  const [wishHistory, setWishHistory] = useState([]);
  const [expandedSuit, setExpandedSuit] = useState(null);
  const [showDetailedReading, setShowDetailedReading] = useState(false);
  const scrollContainerRef = useRef(null);

  // 获取塔罗牌元素对应的颜色
  const getSuitColor = (color) => {
    const colors = {
      'red': 'from-red-400 to-pink-600',
      'blue': 'from-blue-400 to-cyan-600',
      'gray': 'from-gray-400 to-slate-600',
      'yellow': 'from-yellow-400 to-orange-600',
      'purple': 'from-purple-400 to-indigo-600',
      'green': 'from-green-400 to-teal-600'
    };
    return colors[color] || 'from-gray-400 to-gray-600';
  };

  // 切换抽卡模式
  const switchDrawMode = (mode) => {
    setDrawMode(mode);
    setDrawnCards(null);
    setShowDetailedReading(false);
    setWish('');
  };

  // 随机抽取塔罗牌
  const drawCards = () => {
    setIsDrawing(true);
    setTimeout(() => {
      const allCards = [...MAJOR_ARCANA];

      if (drawMode === DRAW_MODES.SINGLE) {
        // 单张抽卡
        const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
        setDrawnCards({
          mode: DRAW_MODES.SINGLE,
          cards: [randomCard]
        });
      } else {
        // 三张抽卡
        const shuffled = [...allCards].sort(() => Math.random() - 0.5);
        const selectedCards = shuffled.slice(0, 3);
        setDrawnCards({
          mode: DRAW_MODES.TRIPLE,
          cards: selectedCards
        });
      }

      setIsDrawing(false);
    }, 1000);
  };

  // 生成单张牌解读
  const generateSingleReading = (card) => {
    return {
      type: 'instant',
      immediateAnswer: card.meaning,
      warning: card.reversed ? `⚠️ ${card.reversed}` : null,
      keyThemes: card.keywords,
      advice: `这是今日的核心指引：${card.meaning.substring(0, 20)}...`
    };
  };

  // 生成三张牌解读 - 时间线分析
  const generateTripleReadingTimeLine = (cards) => {
    const [past, present, future] = cards;

    return {
      type: 'timeline',
      past: {
        card: past,
        meaning: '这代表过去的背景和已经发生的事情，为你当前状况提供了基础。建议回顾：' + past.meaning.substring(0, 30) + '...',
        keywords: past.keywords
      },
      present: {
        card: present,
        meaning: '这是当前的状况和你正在经历的事情，需要你现在的关注和行动。' + present.meaning.substring(0, 30) + '...',
        keywords: present.keywords
      },
      future: {
        card: future,
        meaning: '这是可能的发展方向和结果，基于你当前的选择和行动。' + future.meaning.substring(0, 30) + '...',
        keywords: future.keywords
      },
      overallInsight: `这三张牌共同提示：从${past.keywords[0]}的过去，经历${present.keywords[0]}的现在，向着${future.keywords[0]}的未来发展。保持积极的心态，顺应变化，相信自己的直觉。`
    };
  };

  // 生成三张牌解读 - 关联性分析
  const generateTripleReadingRelational = (cards) => {
    const [card1, card2, card3] = cards;

    // 问题分析
    const problemAnalysis = `第一张牌(${card1.name})揭示了核心问题：${card1.meaning.substring(0, 25)}...`;

    // 阻碍分析
    const obstacleAnalysis = `第二张牌(${card2.name})指出了可能的阻碍：${card2.meaning.substring(0, 25)}...`;

    // 建议分析
    const suggestionAnalysis = `第三张牌(${card3.name})提供了解决建议：${card3.meaning.substring(0, 25)}...`;

    return {
      type: 'relational',
      problem: {
        card: card1,
        analysis: problemAnalysis
      },
      obstacle: {
        card: card2,
        analysis: obstacleAnalysis
      },
      suggestion: {
        card: card3,
        analysis: suggestionAnalysis
      },
      overallAdvice: `综合三张牌的指引，建议你：首先${card1.keywords[0]}面对问题，同时注意${card2.keywords[0]}的阻碍，最后采纳${card3.keywords[0]}的建议。保持耐心和信心，逐步解决问题。`
    };
  };

  // 许愿功能
  const makeWish = () => {
    if (wish.trim() && drawnCards) {
      const newWish = {
        id: Date.now(),
        content: wish,
        date: new Date().toLocaleDateString(),
        drawMode: drawnCards.mode,
        cards: drawnCards.cards.map(c => c.name).join('、')
      };
      setWishHistory([newWish, ...wishHistory.slice(0, 9)]);
      setWish('');
      alert('愿望已许下，愿它早日实现！✨');
    }
  };

  // 滚动到顶部
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  return (
    <PageLayout title="神秘塔罗">
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* 标签导航 */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex space-x-2">
              <button
                onClick={() => { setActiveTab('daily'); scrollToTop(); }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'daily'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🎴 每日抽卡
              </button>
              <button
                onClick={() => { setActiveTab('library'); scrollToTop(); }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                  activeTab === 'library'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                📚 塔罗大全
              </button>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorY: 'contain'
            }}
          >
            <div className="max-w-4xl mx-auto p-4 pb-20">
              {activeTab === 'daily' && (
                <div className="space-y-6">
                  {/* 欢迎卡片 */}
                  <Card>
                    <div className="text-center p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 rounded-lg text-white">
                      <div className="text-5xl mb-3">🔮</div>
                      <h2 className="text-2xl font-bold mb-2">神秘塔罗</h2>
                      <p className="text-purple-100">每日抽卡，聆听命运的指引</p>
                    </div>
                  </Card>

                  {/* 抽卡模式选择 */}
                  <Card>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-center">🎴 选择抽卡模式</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => switchDrawMode(DRAW_MODES.SINGLE)}
                        className={`p-6 rounded-xl text-center transition-all ${
                          drawMode === DRAW_MODES.SINGLE
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl scale-105'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="text-4xl mb-2">🃏</div>
                        <div className="font-bold text-lg mb-1">单张抽卡</div>
                        <div className="text-sm opacity-80">
                          简明扼要<br/>即时解答
                        </div>
                      </Button>
                      <Button
                        onClick={() => switchDrawMode(DRAW_MODES.TRIPLE)}
                        className={`p-6 rounded-xl text-center transition-all ${
                          drawMode === DRAW_MODES.TRIPLE
                            ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-xl scale-105'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="text-4xl mb-2">🃏🃏🃏</div>
                        <div className="font-bold text-lg mb-1">三张抽卡</div>
                        <div className="text-sm opacity-80">
                          时间线分析<br/>深度解读
                        </div>
                      </Button>
                    </div>
                  </Card>

                  {/* 抽卡区域 */}
                  <Card>
                    <div className="text-center">
                      {!drawnCards ? (
                        <div className="py-12">
                          <div className={`mb-6 ${isDrawing ? 'animate-bounce' : ''}`}>
                            <div className="text-8xl">
                              {drawMode === DRAW_MODES.SINGLE ? '🎴' : '🎴🎴🎴'}
                            </div>
                          </div>
                          <Button
                            onClick={drawCards}
                            disabled={isDrawing}
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8 py-3 rounded-full text-lg font-medium shadow-lg transition-all transform hover:scale-105"
                          >
                            {isDrawing ? '正在抽牌中...' : drawMode === DRAW_MODES.SINGLE ? '开始单张抽卡' : '开始三张抽卡'}
                          </Button>
                          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">
                            {drawMode === DRAW_MODES.SINGLE
                              ? '深呼吸，放松身心，点击抽取今日的核心指引'
                              : '深呼吸，放松身心，点击抽取三张牌进行深度解读'}
                          </p>
                        </div>
                      ) : (
                        <div className="py-6 space-y-6">
                          {/* 卡片展示区域 */}
                          <div className="space-y-6">
                            {/* 单张牌展示 */}
                            {drawnCards.mode === DRAW_MODES.SINGLE && drawnCards.cards[0] && (
                              <>
                                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-lg p-6 shadow-lg">
                                  <div className="text-center">
                                    <div className="text-7xl mb-4">🃏</div>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                      {drawnCards.cards[0].name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                      {drawnCards.cards[0].nameEn}
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                                      {drawnCards.cards[0].keywords.map((keyword, index) => (
                                        <span
                                          key={index}
                                          className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-purple-600 dark:text-purple-300"
                                        >
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* 单张牌解读 */}
                                <Card>
                                  <div className="space-y-4">
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
                                      <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                                        <span className="mr-2">⚡</span>
                                        即时解答
                                      </h4>
                                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {drawnCards.cards[0].meaning}
                                      </p>
                                    </div>

                                    {drawnCards.cards[0].reversed && (
                                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 rounded-lg">
                                        <h4 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                                          <span className="mr-2">⚠️</span>
                                          逆位警示
                                        </h4>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                          {drawnCards.cards[0].reversed}
                                        </p>
                                      </div>
                                    )}

                                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-lg">
                                      <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-2 flex items-center">
                                        <span className="mr-2">💡</span>
                                        今日建议
                                      </h4>
                                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        这是今日的核心指引，请铭记于心并付诸行动。相信你的直觉，勇敢面对挑战。
                                      </p>
                                    </div>
                                  </div>
                                </Card>

                                {/* 重新抽卡 */}
                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => { setDrawnCards(null); drawCards(); }}
                                    className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-lg text-sm font-medium transition-all"
                                  >
                                    🔄 重新抽卡
                                  </Button>
                                  <Button
                                    onClick={() => switchDrawMode(DRAW_MODES.TRIPLE)}
                                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all"
                                  >
                                    📊 尝试三张抽卡
                                  </Button>
                                </div>
                              </>
                            )}

                            {/* 三张牌展示 */}
                            {drawnCards.mode === DRAW_MODES.TRIPLE && (
                              <>
                                <div className="grid grid-cols-3 gap-4">
                                  {drawnCards.cards.map((card, index) => (
                                    <div key={index} className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-lg p-4 shadow-lg">
                                      <div className="text-center">
                                        <div className="text-5xl mb-2">🃏</div>
                                        <div className="bg-white dark:bg-gray-800 rounded-lg px-2 py-1 mb-2">
                                          <h4 className="font-bold text-sm text-gray-800 dark:text-white">{CARD_POSITIONS[index]}</h4>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">
                                          {card.name}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-xs mb-2">
                                          {card.nameEn}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* 三张牌解读模式选择 */}
                                <Card>
                                  <h4 className="font-bold text-gray-800 dark:text-white mb-4 text-center">📖 选择解读方式</h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    <Button
                                      onClick={() => setShowDetailedReading(!showDetailedReading)}
                                      className={`p-4 rounded-lg text-center transition-all ${
                                        !showDetailedReading
                                          ? 'bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg'
                                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                      }`}
                                    >
                                      <div className="text-2xl mb-1">🕐</div>
                                      <div className="font-bold text-sm mb-1">时间线分析</div>
                                      <div className="text-xs opacity-80">
                                        过去·现在·未来
                                      </div>
                                    </Button>
                                    <Button
                                      onClick={() => setShowDetailedReading(showDetailedReading)}
                                      className={`p-4 rounded-lg text-center transition-all ${
                                        showDetailedReading
                                          ? 'bg-gradient-to-br from-orange-400 to-red-600 text-white shadow-lg'
                                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                      }`}
                                    >
                                      <div className="text-2xl mb-1">🎯</div>
                                      <div className="font-bold text-sm mb-1">关联性分析</div>
                                      <div className="text-xs opacity-80">
                                        问题·阻碍·建议
                                      </div>
                                    </Button>
                                  </div>
                                </Card>

                                {/* 时间线解读 */}
                                {!showDetailedReading && drawnCards.mode === DRAW_MODES.TRIPLE && (
                                  <Card>
                                    <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                                      <span className="mr-2">🕐</span>
                                      时间线解读（过去-现在-未来）
                                    </h4>
                                    <div className="space-y-4">
                                      {drawnCards.cards.map((card, index) => (
                                        <div
                                          key={index}
                                          className={`p-4 rounded-lg border-l-4 ${
                                            index === 0 ? 'bg-blue-50 dark:bg-blue-900 border-blue-400' :
                                            index === 1 ? 'bg-purple-50 dark:bg-purple-900 border-purple-400' :
                                            'bg-pink-50 dark:bg-pink-900 border-pink-400'
                                          }`}
                                        >
                                          <div className="flex items-center mb-2">
                                            <span className="text-2xl mr-3">
                                              {index === 0 ? '↩️' : index === 1 ? '📍' : '➡️'}
                                            </span>
                                            <div>
                                              <h5 className="font-bold text-lg text-gray-800 dark:text-white">
                                                {CARD_POSITIONS[index]} - {card.name}
                                              </h5>
                                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                                {card.nameEn}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <div className="flex flex-wrap gap-1">
                                              {card.keywords.map((keyword, kIndex) => (
                                                <span
                                                  key={kIndex}
                                                  className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300"
                                                >
                                                  {keyword}
                                                </span>
                                              ))}
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                              {index === 0 ? `过去的背景：${card.meaning.substring(0, 40)}...` :
                                                index === 1 ? `当前的状况：${card.meaning.substring(0, 40)}...` :
                                                `未来的走向：${card.meaning.substring(0, 40)}...`}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900 dark:to-purple-900 rounded-lg">
                                      <h5 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center">
                                        <span className="mr-2">💫</span>
                                        综合启示
                                      </h5>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        从{drawnCards.cards[0].keywords[0]}的过去，经历{drawnCards.cards[1].keywords[0]}的现在，向着{drawnCards.cards[2].keywords[0]}的未来发展。保持积极的心态，顺应变化，相信自己的直觉。每一步都是命运的指引，勇敢前行。
                                      </p>
                                    </div>
                                  </Card>
                                )}

                                {/* 关联性解读 */}
                                {showDetailedReading && drawnCards.mode === DRAW_MODES.TRIPLE && (
                                  <Card>
                                    <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                                      <span className="mr-2">🎯</span>
                                      关联性解读（问题-阻碍-建议）
                                    </h4>
                                    <div className="space-y-4">
                                      {/* 问题 */}
                                      <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900 dark:to-orange-900 rounded-lg">
                                        <div className="flex items-center mb-3">
                                          <span className="text-3xl mr-3">❓</span>
                                          <div>
                                            <h5 className="font-bold text-lg text-red-800 dark:text-red-200">
                                              第一张牌 - 核心问题
                                            </h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                              {drawnCards.cards[0].nameEn}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex flex-wrap gap-1">
                                            {drawnCards.cards[0].keywords.map((keyword, index) => (
                                              <span
                                                key={index}
                                                className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300"
                                              >
                                                {keyword}
                                              </span>
                                            ))}
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            这张牌揭示了当前面临的<strong>核心问题</strong>：{drawnCards.cards[0].meaning.substring(0, 50)}...
                                          </p>
                                        </div>
                                      </div>

                                      {/* 阻碍 */}
                                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900 rounded-lg">
                                        <div className="flex items-center mb-3">
                                          <span className="text-3xl mr-3">⚠️</span>
                                          <div>
                                            <h5 className="font-bold text-lg text-yellow-800 dark:text-yellow-200">
                                              第二张牌 - 可能阻碍
                                            </h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                              {drawnCards.cards[1].nameEn}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex flex-wrap gap-1">
                                            {drawnCards.cards[1].keywords.map((keyword, index) => (
                                              <span
                                                key={index}
                                                className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300"
                                              >
                                                {keyword}
                                              </span>
                                            ))}
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            这张牌指出了<strong>可能的阻碍</strong>：{drawnCards.cards[1].meaning.substring(0, 50)}...
                                          </p>
                                        </div>
                                      </div>

                                      {/* 建议 */}
                                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg">
                                        <div className="flex items-center mb-3">
                                          <span className="text-3xl mr-3">💡</span>
                                          <div>
                                            <h5 className="font-bold text-lg text-green-800 dark:text-green-200">
                                              第三张牌 - 解决建议
                                            </h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                              {drawnCards.cards[2].nameEn}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex flex-wrap gap-1">
                                            {drawnCards.cards[2].keywords.map((keyword, index) => (
                                              <span
                                                key={index}
                                                className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300"
                                              >
                                                {keyword}
                                              </span>
                                            ))}
                                          </div>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            这张牌提供了<strong>解决方案</strong>：{drawnCards.cards[2].meaning.substring(0, 50)}...
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 rounded-lg">
                                      <h5 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center">
                                        <span className="mr-2">🌟</span>
                                        综合指引
                                      </h5>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        <strong>核心问题：</strong>{drawnCards.cards[0].keywords[0]} · <strong>潜在阻碍：</strong>{drawnCards.cards[1].keywords[0]} · <strong>解决建议：</strong>{drawnCards.cards[2].keywords[0]}
                                      </p>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                                        综合三张牌的指引，建议你：首先{drawnCards.cards[0].keywords[0]}面对问题，同时注意{drawnCards.cards[1].keywords[0]}的阻碍，最后采纳{drawnCards.cards[2].keywords[0]}的建议。保持耐心和信心，逐步解决问题。
                                      </p>
                                    </div>
                                  </Card>
                                )}

                                {/* 重新抽卡按钮 */}
                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => { setDrawnCards(null); setShowDetailedReading(false); drawCards(); }}
                                    className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-lg text-sm font-medium transition-all"
                                  >
                                    🔄 重新抽卡
                                  </Button>
                                  <Button
                                    onClick={() => switchDrawMode(DRAW_MODES.SINGLE)}
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all"
                                  >
                                    🎴 尝试单张抽卡
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* 许愿区域 */}
                  {drawnCards && (
                    <Card>
                      <h3 className="font-bold text-gray-800 dark:text-white mb-4">🌟 许下心愿</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        借助今日抽到的卡牌能量，许下你的心愿
                      </p>
                      <textarea
                        value={wish}
                        onChange={(e) => setWish(e.target.value)}
                        placeholder="在这里写下你的心愿..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                        rows={3}
                      />
                      <Button
                        onClick={makeWish}
                        className="mt-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all"
                      >
                        ✨ 许下心愿
                      </Button>
                    </Card>
                  )}

                  {/* 许愿历史 */}
                  {wishHistory.length > 0 && (
                    <Card>
                      <h3 className="font-bold text-gray-800 dark:text-white mb-4">📝 许愿记录</h3>
                      <div className="space-y-3">
                        {wishHistory.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                {item.drawMode === DRAW_MODES.SINGLE ? '🎴 单张' : '🃏🃏🃏 三张'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.date}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              抽到：{item.cards}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {item.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* 其他实用功能 */}
                  <Card>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">🛠️ 更多功能</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all">
                        <div className="text-2xl mb-1">🎯</div>
                        <div>命运指引</div>
                        <div className="text-xs opacity-80">查看近期运势</div>
                      </Button>
                      <Button className="p-4 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-lg text-sm font-medium transition-all">
                        <div className="text-2xl mb-1">💎</div>
                        <div>能量清理</div>
                        <div className="text-xs opacity-80">清理负面能量</div>
                      </Button>
                      <Button className="p-4 bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-all">
                        <div className="text-2xl mb-1">🔥</div>
                        <div>星象祝福</div>
                        <div className="text-xs opacity-80">获取星辰祝福</div>
                      </Button>
                      <Button className="p-4 bg-gradient-to-br from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white rounded-lg text-sm font-medium transition-all">
                        <div className="text-2xl mb-1">🌙</div>
                        <div>月相记录</div>
                        <div className="text-xs opacity-80">记录月相变化</div>
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'library' && (
                <div className="space-y-4">
                  {/* 大阿卡纳牌 */}
                  <Card>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                      <span className="mr-2">👑</span>
                      大阿卡纳牌（22张）
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      大阿卡纳牌代表重要的人生课题和精神层面的启示
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {MAJOR_ARCANA.map((card) => (
                        <div
                          key={card.id}
                          className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-lg text-sm"
                        >
                          <div className="font-bold text-gray-800 dark:text-white mb-1">
                            {card.id}. {card.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                            {card.nameEn}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {card.keywords.slice(0, 2).map((keyword, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-xs text-purple-600 dark:text-purple-300"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* 小阿卡纳牌 */}
                  {MINOR_ARCANA.map((suit) => (
                    <Card key={suit.suit}>
                      <button
                        onClick={() => setExpandedSuit(expandedSuit === suit.suit ? null : suit.suit)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getSuitColor(suit.color)} flex items-center justify-center text-white text-xl font-bold mr-3`}
                          >
                            {suit.element[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                              {suit.suit}（{suit.suitEn}）
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {suit.element} · {suit.cards.length}张牌
                            </p>
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${expandedSuit === suit.suit ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {expandedSuit === suit.suit && (
                        <div className="px-4 pb-4 space-y-2">
                          {suit.cards.map((card) => (
                            <div
                              key={`${suit.suit}-${card.id}`}
                              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-gray-800 dark:text-white">
                                  {card.name}
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {card.keywords.slice(0, 2).map((keyword, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded text-xs"
                                    >
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {card.meaning}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}

                  {/* 塔罗使用指南 */}
                  <Card>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                      <span className="mr-2">📖</span>
                      塔罗使用指南
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-start">
                        <span className="mr-2">1️⃣</span>
                        <p><strong>静心准备：</strong>在抽牌前，深呼吸，放松身心，专注于你的问题。</p>
                      </div>
                      <div className="flex items-start">
                        <span className="mr-2">2️⃣</span>
                        <p><strong>明确问题：</strong>在心中默念你的问题或困惑，越具体越好。</p>
                      </div>
                      <div className="flex items-start">
                        <span className="mr-2">3️⃣</span>
                        <p><strong>抽取卡牌：</strong>凭直觉选择或随机抽取一张牌。</p>
                      </div>
                      <div className="flex items-start">
                        <span className="mr-2">4️⃣</span>
                        <p><strong>解读牌意：</strong>结合你的问题，仔细阅读牌义和关键词。</p>
                      </div>
                      <div className="flex items-start">
                        <span className="mr-2">5️⃣</span>
                        <p><strong>反思内省：</strong>思考牌面传达的信息，寻找解决问题的线索。</p>
                      </div>
                    </div>
                  </Card>

                  {/* 牌阵介绍 */}
                  <Card>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                      <span className="mr-2">🎴</span>
                      常用牌阵介绍
                    </h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                          单张牌阵
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          适合快速回答简单问题，提供即时的指引和启示。
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                          三张牌阵（过去-现在-未来）
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          展示问题的发展历程，帮助你理解因果和趋势。
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                          凯尔特十字牌阵
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          最全面的牌阵之一，深入分析问题的各个方面。
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default TarotPage;
