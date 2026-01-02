// components/CardDeck.tsx
interface CardDeckProps {
  cards: any[];
  onDrawCard: () => void;
  disabled: boolean;
  theme?: string;
}

export default function CardDeck({ cards, onDrawCard, disabled, theme = 'light' }: CardDeckProps) {
  return (
    <div className="relative">
      <div className="relative w-32 h-40 mx-auto">
        {/* 牌堆装饰效果 */}
        <div className={`absolute inset-0 rounded-xl shadow-lg ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-emerald-800/40 to-emerald-900/50' 
            : 'bg-gradient-to-br from-emerald-600/20 to-emerald-800/30'
        }`}></div>
        <div className={`absolute inset-0 rounded-xl shadow-inner ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-emerald-900/30 to-emerald-800/40 border border-emerald-700/50' 
            : 'bg-gradient-to-br from-emerald-500/10 to-emerald-700/20 border border-emerald-400/30'
        }`}></div>
        
        {/* 牌堆数量显示 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'
            }`}>{cards.length}</div>
            <div className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-emerald-500' : 'text-emerald-700'
            }`}>剩余牌数</div>
          </div>
        </div>
        
        {/* 摸牌按钮 */}
        <button
          onClick={onDrawCard}
          disabled={disabled}
          className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2
            px-6 py-2 rounded-full text-white font-medium shadow-lg transition-all duration-200
            ${disabled 
              ? 'bg-gray-400 cursor-not-allowed' 
              : `${theme === 'dark' 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800' 
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'} hover:shadow-xl active:scale-95`
            }`}
        >
          摸牌
        </button>
      </div>
    </div>
  );
}