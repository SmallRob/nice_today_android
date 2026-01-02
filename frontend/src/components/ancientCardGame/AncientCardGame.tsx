// AncientCardGame.tsx
import React, { useState, useReducer, useCallback, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext'; // Using existing theme context
import { Card, Player, GamePhase, ActionType } from './cardtype.ts';
import { gameReducer, initialState } from './gameReducer.ts';
import CardDeck from './CardDeck.tsx';
import PlayerArea from './PlayerArea.tsx';
import ControlPanel from './ControlPanel.tsx';
import GameLog from './GameLog.tsx';

export default function AncientCardGame() {
  const { theme } = useTheme();
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // 初始化游戏
  useEffect(() => {
    dispatch({ type: ActionType.INIT_GAME });
  }, []);

  // 自动保存游戏状态
  useEffect(() => {
    if (state.gamePhase !== 'idle') {
      localStorage.setItem('maDiaoGameState', JSON.stringify(state));
    }
  }, [state]);

  // 加载游戏
  const loadGame = useCallback(() => {
    const saved = localStorage.getItem('maDiaoGameState');
    if (saved) {
      dispatch({ type: ActionType.LOAD_GAME, payload: JSON.parse(saved) });
    }
  }, []);

  // 玩家出牌
  const handlePlayCard = useCallback((cardId: string) => {
    if (selectedCard === cardId) {
      dispatch({ type: ActionType.PLAY_CARD, payload: { cardId } });
      setSelectedCard(null);
    } else {
      setSelectedCard(cardId);
    }
  }, [selectedCard]);

  // 摸牌
  const handleDrawCard = useCallback(() => {
    dispatch({ type: ActionType.DRAW_CARD });
  }, []);

  // 机器人回合
  const handleBotTurn = useCallback(() => {
    dispatch({ type: ActionType.BOT_TURN });
  }, []);

  return (
    <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-amber-50 to-amber-100 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 标题区 */}
        <header className="text-center py-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-wider bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
            古风马吊
          </h1>
          <p className={`${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>离线纸牌游戏</p>
          
          {/* 游戏状态显示 */}
          <div className={`mt-4 inline-block rounded-xl p-4 shadow-lg ${
            theme === 'dark' ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/80 border border-gray-200'
          }`}>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="text-center">
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>当前玩家</div>
                <div className={`font-bold text-lg ${
                  state.currentPlayer === 0 
                    ? (theme === 'dark' ? 'text-red-400' : 'text-red-600') 
                    : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')
                }`}>
                  {state.players[state.currentPlayer]?.name}
                </div>
              </div>
              <div className={`w-1 h-8 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className="text-center">
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>游戏阶段</div>
                <div className={`font-bold text-lg ${
                  state.gamePhase === 'drawing' ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600') :
                  state.gamePhase === 'playing' ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') :
                  (theme === 'dark' ? 'text-gray-400' : 'text-gray-600')
                }`}>
                  {state.gamePhase === 'drawing' ? '摸牌阶段' : 
                   state.gamePhase === 'playing' ? '出牌阶段' : 
                   '准备阶段'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：牌堆和出牌区 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 牌堆和出牌区 */}
            <div className={`rounded-2xl p-6 shadow-xl ${
              theme === 'dark' ? 'bg-gradient-to-br from-emerald-900/20 to-emerald-800/30 border border-emerald-800/50' : 'bg-gradient-to-br from-emerald-100/50 to-emerald-200/30 border border-emerald-200'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 牌堆 */}
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'
                  }`}>牌堆</h3>
                  <CardDeck 
                    cards={state.deck} 
                    onDrawCard={handleDrawCard}
                    disabled={state.gamePhase !== 'drawing' || state.currentPlayer !== 0}
                    theme={theme}
                  />
                </div>
                
                {/* 弃牌堆 */}
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-800'
                  }`}>出牌区</h3>
                  <div className={`mt-4 min-h-40 rounded-xl p-4 ${
                    theme === 'dark' ? 'bg-gradient-to-br from-amber-900/20 to-amber-800/30 border border-amber-700/50' : 'bg-gradient-to-br from-amber-100/50 to-amber-200/30 border border-amber-300'
                  }`}>
                    {state.discardPile.slice(-3).map((card, index) => (
                      <div key={index} className="inline-block -ml-8 first:ml-0 transform hover:-translate-y-2 transition-transform">
                        <div className={`rounded-lg w-16 h-24 shadow-lg flex items-center justify-center ${
                          theme === 'dark' ? 'bg-gray-800 border border-amber-700/50' : 'bg-white border border-amber-200'
                        }`}>
                          <div className="text-center">
                            <div className={`text-xl font-bold ${
                              card.suit === '文' ? (theme === 'dark' ? 'text-red-400' : 'text-red-600') : (theme === 'dark' ? 'text-gray-300' : 'text-gray-800')
                            }`}>{card.rank}</div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{card.suit}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 玩家区域 */}
            <div className={`rounded-2xl p-6 shadow-xl ${
              theme === 'dark' ? 'bg-gradient-to-br from-amber-900/20 to-amber-800/30 border border-amber-800/50' : 'bg-gradient-to-br from-amber-100/50 to-amber-200/30 border border-amber-200'
            }`}>
              {state.players && state.players[0] ? (
                <PlayerArea
                  player={state.players[0]}
                  isCurrent={state.currentPlayer === 0}
                  onPlayCard={handlePlayCard}
                  selectedCard={selectedCard}
                  isHuman={true}
                  theme={theme}
                />
              ) : (
                <div className="rounded-xl p-6">
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    正在初始化游戏...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：控制面板和日志 */}
          <div className="space-y-6">
            {/* 控制面板 */}
            <div className={`rounded-2xl p-6 shadow-xl ${
              theme === 'dark' ? 'bg-gradient-to-br from-stone-900/20 to-stone-800/30 border border-stone-700/50' : 'bg-gradient-to-br from-stone-100/50 to-stone-200/30 border border-stone-200'
            }`}>
              <ControlPanel
                gamePhase={state.gamePhase}
                currentPlayer={state.currentPlayer}
                onBotTurn={handleBotTurn}
                onReset={() => dispatch({ type: ActionType.RESET_GAME })}
                onLoadGame={loadGame}
                theme={theme}
              />
            </div>

            {/* 游戏日志 */}
            <div className={`rounded-2xl p-6 shadow-xl ${
              theme === 'dark' ? 'bg-gradient-to-br from-slate-900/20 to-slate-800/30 border border-slate-700/50' : 'bg-gradient-to-br from-slate-100/50 to-slate-200/30 border border-slate-200'
            } h-96`}>
              <GameLog logs={state.gameLog} theme={theme} />
            </div>

            {/* 机器人玩家状态 */}
            <div className={`rounded-2xl p-6 shadow-xl ${
              theme === 'dark' ? 'bg-gradient-to-br from-rose-900/20 to-rose-800/30 border border-rose-700/50' : 'bg-gradient-to-br from-rose-100/50 to-rose-200/30 border border-rose-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-rose-400' : 'text-rose-800'
              }`}>对手</h3>
              <div className="space-y-4">
                {state.players.slice(1).map((player, index) => (
                  <div key={player.id} className={`flex items-center justify-between rounded-lg p-3 ${
                    theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
                  }`}>
                    <div>
                      <div className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{player.name}</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>手牌: {player.hand.length}张</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      state.currentPlayer === player.id 
                        ? (theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700') 
                        : (theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                    }`}>
                      {state.currentPlayer === player.id ? '行动中' : '等待'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}