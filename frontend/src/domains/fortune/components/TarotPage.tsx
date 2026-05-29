import React, { useState, useEffect, useCallback } from 'react';
import { fortuneService } from '../services/fortuneService';
import type { TarotCard, TarotReading } from '../types';

interface TarotPageProps {
  onBack?: () => void;
}

const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, name: '愚者', arcana: 'major', number: 0, image: '🃏', upright: '新的开始，冒险精神', reversed: '鲁莽，冲动', meaning: '代表新的开始和无限可能', keywords: ['开始', '冒险', '自由'] },
  { id: 1, name: '魔术师', arcana: 'major', number: 1, image: '🧙', upright: '创造力，技能', reversed: '欺骗，缺乏自信', meaning: '代表创造力和实现目标的能力', keywords: ['创造', '技能', '意志'] },
  { id: 2, name: '女祭司', arcana: 'major', number: 2, image: '🌙', upright: '直觉，智慧', reversed: '隐藏的真相', meaning: '代表直觉和内在智慧', keywords: ['直觉', '智慧', '神秘'] },
  { id: 3, name: '女皇', arcana: 'major', number: 3, image: '👑', upright: '丰收，母性', reversed: '依赖，过度保护', meaning: '代表丰收和创造力', keywords: ['丰收', '母性', '自然'] },
  { id: 4, name: '皇帝', arcana: 'major', number: 4, image: '🏛️', upright: '权威，稳定', reversed: '专制，固执', meaning: '代表权威和稳定', keywords: ['权威', '稳定', '领导'] },
  { id: 5, name: '教皇', arcana: 'major', number: 5, image: '⛪', upright: '传统，教育', reversed: '叛逆，非传统', meaning: '代表传统和精神指导', keywords: ['传统', '教育', '信仰'] },
  { id: 6, name: '恋人', arcana: 'major', number: 6, image: '💕', upright: '爱情，和谐', reversed: '不和谐，选择困难', meaning: '代表爱情和关系', keywords: ['爱情', '选择', '和谐'] },
  { id: 7, name: '战车', arcana: 'major', number: 7, image: '🏎️', upright: '胜利，意志力', reversed: '失控，失败', meaning: '代表胜利和决心', keywords: ['胜利', '意志', '行动'] },
  { id: 8, name: '力量', arcana: 'major', number: 8, image: '🦁', upright: '勇气，内在力量', reversed: '软弱，自我怀疑', meaning: '代表勇气和内在力量', keywords: ['勇气', '力量', '耐心'] },
  { id: 9, name: '隐士', arcana: 'major', number: 9, image: '🏔️', upright: '内省，智慧', reversed: '孤独，逃避', meaning: '代表内省和寻求真理', keywords: ['内省', '智慧', '独处'] },
  { id: 10, name: '命运之轮', arcana: 'major', number: 10, image: '🎡', upright: '转变，机遇', reversed: '厄运，抗拒改变', meaning: '代表命运的转变', keywords: ['命运', '转变', '机遇'] },
  { id: 11, name: '正义', arcana: 'major', number: 11, image: '⚖️', upright: '公正，真理', reversed: '不公，偏见', meaning: '代表公正和平衡', keywords: ['公正', '真理', '平衡'] },
  { id: 12, name: '倒吊人', arcana: 'major', number: 12, image: '🔄', upright: '牺牲，新视角', reversed: '拖延，抗拒', meaning: '代表牺牲和新的视角', keywords: ['牺牲', '等待', '领悟'] },
  { id: 13, name: '死神', arcana: 'major', number: 13, image: '💀', upright: '结束，转变', reversed: '停滞，恐惧改变', meaning: '代表结束和新的开始', keywords: ['结束', '转变', '重生'] },
  { id: 14, name: '节制', arcana: 'major', number: 14, image: '🏺', upright: '平衡，耐心', reversed: '失衡，过度', meaning: '代表平衡和节制', keywords: ['平衡', '耐心', '调和'] },
  { id: 15, name: '恶魔', arcana: 'major', number: 15, image: '😈', upright: '束缚，欲望', reversed: '解脱，自由', meaning: '代表束缚和诱惑', keywords: ['束缚', '欲望', '物质'] },
  { id: 16, name: '塔', arcana: 'major', number: 16, image: '🗼', upright: '突变，启示', reversed: '逃避灾难', meaning: '代表突变和觉醒', keywords: ['突变', '启示', '解放'] },
  { id: 17, name: '星星', arcana: 'major', number: 17, image: '⭐', upright: '希望，灵感', reversed: '失望，缺乏信心', meaning: '代表希望和灵感', keywords: ['希望', '灵感', '宁静'] },
  { id: 18, name: '月亮', arcana: 'major', number: 18, image: '🌙', upright: '幻象，直觉', reversed: '恐惧，焦虑', meaning: '代表幻象和潜意识', keywords: ['幻象', '直觉', '潜意识'] },
  { id: 19, name: '太阳', arcana: 'major', number: 19, image: '☀️', upright: '成功，快乐', reversed: '暂时的困难', meaning: '代表成功和快乐', keywords: ['成功', '快乐', '活力'] },
  { id: 20, name: '审判', arcana: 'major', number: 20, image: '📯', upright: '觉醒，更新', reversed: '自我怀疑', meaning: '代表觉醒和重生', keywords: ['觉醒', '更新', '召唤'] },
  { id: 21, name: '世界', arcana: 'major', number: 21, image: '🌍', upright: '完成，成就', reversed: '未完成', meaning: '代表完成和成就', keywords: ['完成', '成就', '圆满'] },
];

const SPREAD_TYPES = [
  { key: 'single', label: '单牌占卜', count: 1, desc: '快速获得指引' },
  { key: 'three', label: '三牌阵', count: 3, desc: '过去、现在、未来' },
  { key: 'celtic', label: '凯尔特十字', count: 10, desc: '深度全面分析' },
];

const TarotPage: React.FC<TarotPageProps> = ({ onBack }) => {
  const [selectedSpread, setSelectedSpread] = useState('single');
  const [drawnCards, setDrawnCards] = useState<TarotCard[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [question, setQuestion] = useState('');
  const [cardPositions, setCardPositions] = useState<string[]>([]);

  const drawCards = useCallback(() => {
    setIsDrawing(true);
    setShowResult(false);
    
    const spread = SPREAD_TYPES.find(s => s.key === selectedSpread)!;
    const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
    const cards = shuffled.slice(0, spread.count).map(card => ({
      ...card,
      reversed: Math.random() > 0.5,
    }));
    
    // Set positions based on spread type
    let positions: string[] = [];
    if (selectedSpread === 'single') {
      positions = ['指引'];
    } else if (selectedSpread === 'three') {
      positions = ['过去', '现在', '未来'];
    } else {
      positions = ['当前情况', '挑战', '过去基础', '近期过去', '可能结果', '近期未来', '自我认知', '环境影响', '希望与恐惧', '最终结果'];
    }
    
    setTimeout(() => {
      setDrawnCards(cards);
      setCardPositions(positions);
      setIsDrawing(false);
      setShowResult(true);
    }, 1500);
  }, [selectedSpread]);

  const resetReading = () => {
    setDrawnCards([]);
    setShowResult(false);
    setQuestion('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-purple-900/80 backdrop-blur">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="text-white/70 text-sm">← 返回</button>
          )}
          <h1 className="text-lg font-bold text-white">塔罗牌占卜</h1>
          <button onClick={resetReading} className="text-white/70 text-sm">重置</button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Question input */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
          <label className="text-white/70 text-sm mb-2 block">你想问什么？</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="输入你的问题..."
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 outline-none"
          />
        </div>

        {/* Spread selection */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
          <h3 className="text-white text-sm font-bold mb-3">选择牌阵</h3>
          <div className="space-y-2">
            {SPREAD_TYPES.map(spread => (
              <button
                key={spread.key}
                onClick={() => setSelectedSpread(spread.key)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  selectedSpread === spread.key
                    ? 'bg-purple-500/50 border border-purple-400'
                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{spread.label}</div>
                    <div className="text-white/50 text-xs">{spread.desc}</div>
                  </div>
                  <span className="text-white/40 text-sm">{spread.count}张</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Draw button */}
        {!showResult && (
          <button
            onClick={drawCards}
            disabled={isDrawing}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isDrawing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                抽牌中...
              </div>
            ) : (
              '🔮 开始抽牌'
            )}
          </button>
        )}

        {/* Cards result */}
        {showResult && drawnCards.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3">🃏 你的牌</h3>
              <div className={`grid gap-3 ${
                drawnCards.length === 1 ? 'grid-cols-1' :
                drawnCards.length <= 3 ? 'grid-cols-3' :
                'grid-cols-2'
              }`}>
                {drawnCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-white/10 rounded-xl p-4 text-center animate-fade-in"
                    style={{ animationDelay: `${idx * 200}ms` }}
                  >
                    <div className="text-xs text-white/50 mb-2">{cardPositions[idx]}</div>
                    <div className="text-4xl mb-2">{card.image}</div>
                    <div className="text-white font-bold text-sm">{card.name}</div>
                    <div className={`text-xs mt-1 ${card.reversed ? 'text-red-400' : 'text-green-400'}`}>
                      {card.reversed ? '逆位' : '正位'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3">📖 牌面解读</h3>
              <div className="space-y-4">
                {drawnCards.map((card, idx) => (
                  <div key={idx} className="border-t border-white/10 pt-3 first:border-0 first:pt-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{card.image}</span>
                      <span className="text-white font-medium">{card.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${card.reversed ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {card.reversed ? '逆位' : '正位'}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm">
                      {card.reversed ? card.reversed : card.upright}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {card.keywords.map((kw, kidx) => (
                        <span key={kidx} className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-white/50">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall reading */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <h3 className="text-white font-bold mb-2">✨ 综合解读</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {drawnCards.length === 1
                  ? `${drawnCards[0].name}提醒你：${drawnCards[0].reversed ? drawnCards[0].reversed : drawnCards[0].upright}。保持开放的心态，迎接新的可能性。`
                  : `这次占卜揭示了你当前处境的多个层面。${drawnCards[0].name}代表你的基础，${drawnCards[1].name}反映当前状况，${drawnCards[2]?.name ? `${drawnCards[2].name}指向未来的方向` : ''}。整体来看，牌面建议你保持耐心和信心。`
                }
              </p>
            </div>

            {/* Draw again button */}
            <button
              onClick={resetReading}
              className="w-full py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
            >
              重新占卜
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center text-white/30 text-xs py-4">
          塔罗牌占卜仅供参考，请理性看待结果
        </div>
      </div>
    </div>
  );
};

export default TarotPage;