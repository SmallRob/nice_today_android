// components/PlayerArea.tsx
import React from 'react';
import { Player as PlayerType } from './cardtype';

interface PlayerAreaProps {
  player: PlayerType;
  isCurrent: boolean;
  onPlayCard: (cardId: string) => void;
  selectedCard: string | null;
  isHuman: boolean;
  theme?: string;
}

export default function PlayerArea({ 
  player, 
  isCurrent, 
  onPlayCard, 
  selectedCard,
  isHuman,
  theme = 'light'
}: PlayerAreaProps) {
  return (
    <div className={`rounded-xl p-6 transition-all duration-300 ${
      isCurrent 
        ? (theme === 'dark' 
            ? 'bg-gradient-to-r from-amber-900/30 to-amber-800/30 border-2 border-amber-600' 
            : 'bg-gradient-to-r from-amber-200/30 to-amber-100/30 border-2 border-amber-400')
        : (theme === 'dark' 
            ? 'bg-gray-800/30' 
            : 'bg-white/20')
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
          }`}>
            {player.name}
            {isHuman && <span className={`text-xs ${
              theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
            } px-2 py-1 rounded-full`}>你</span>}
          </h2>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            得分: {player.score} | 手牌: {player.hand.length}张
          </p>
        </div>
        {isCurrent && (
          <div className={`px-4 py-2 rounded-lg animate-pulse ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' 
              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
          }`}>
            轮到你了
          </div>
        )}
      </div>

      {isHuman ? (
        <div className="mt-6">
          <div className={`text-sm mb-3 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>点击选择牌，再点击出牌</div>
          <div className="flex flex-wrap gap-2 min-h-32">
            {player.hand.map(card => (
              <button
                key={card.id}
                onClick={() => onPlayCard(card.id)}
                className={`transform transition-all duration-200 hover:-translate-y-2 active:scale-95
                  ${selectedCard === card.id ? '-translate-y-3 ring-2 ring-amber-500 shadow-lg' : ''}
                  ${isCurrent ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                disabled={!isCurrent}
              >
                <div className={`w-16 h-24 rounded-lg shadow-md flex flex-col items-center justify-center p-2 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-gray-700 to-gray-600 border border-gray-500' 
                    : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
                }`}>
                  <div className={`text-2xl font-bold ${
                    card.suit === '文' 
                      ? (theme === 'dark' ? 'text-red-400' : 'text-red-600') 
                      : (theme === 'dark' ? 'text-gray-300' : 'text-gray-800')
                  }`}>
                    {card.rank}
                  </div>
                  <div className={`text-sm mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>{card.suit}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={`mt-6 p-4 rounded-lg ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-gray-800/50 to-gray-700/50' 
            : 'bg-gradient-to-r from-gray-100/50 to-gray-200/30'
        }`}>
          <div className="flex gap-2">
            {Array.from({ length: player.hand.length }).map((_, i) => (
              <div 
                key={i} 
                className={`w-12 h-20 rounded-md shadow-inner ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-gray-600 to-gray-500 border border-gray-400' 
                    : 'bg-gradient-to-br from-gray-300 to-gray-400 border border-gray-400'
                }`}
              ></div>
            ))}
          </div>
          <p className={`text-center mt-3 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>对手手牌已隐藏</p>
        </div>
      )}
    </div>
  );
}