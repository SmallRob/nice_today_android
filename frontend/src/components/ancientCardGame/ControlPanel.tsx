// components/ControlPanel.tsx
import React from 'react';

interface ControlPanelProps {
  gamePhase: string;
  currentPlayer: number;
  onBotTurn: () => void;
  onReset: () => void;
  onLoadGame: () => void;
  theme?: string;
}

export default function ControlPanel({ 
  gamePhase, 
  currentPlayer, 
  onBotTurn, 
  onReset, 
  onLoadGame,
  theme = 'light'
}: ControlPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
      }`}>
        <span className={`w-2 h-6 rounded-full ${
          theme === 'dark' ? 'bg-amber-500' : 'bg-amber-500'
        }`}></span>
        游戏控制
      </h3>
      
      <div className="space-y-3">
        <button
          onClick={onBotTurn}
          disabled={currentPlayer === 0}
          className={`w-full px-4 py-3 text-white rounded-lg
                   transition-all duration-200 flex items-center justify-center gap-2 ${
                     currentPlayer === 0
                       ? 'bg-gray-400 cursor-not-allowed'
                       : theme === 'dark'
                         ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                         : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                   }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          机器人行动
        </button>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onReset}
            className={`px-4 py-3 text-white rounded-lg flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800'
                : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            新游戏
          </button>
          
          <button
            onClick={onLoadGame}
            className={`px-4 py-3 text-white rounded-lg flex items-center justify-center gap-2 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            加载存档
          </button>
        </div>
        
        <div className={`mt-6 pt-4 ${
          theme === 'dark' ? 'border-t border-gray-700' : 'border-t border-gray-200'
        }`}>
          <h4 className={`font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>游戏说明</h4>
          <ul className={`text-sm space-y-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <li>• 古代马吊牌简化规则</li>
            <li>• 四人游戏，一人为玩家，三人为AI</li>
            <li>• 轮流摸牌、出牌</li>
            <li>• 游戏状态自动保存</li>
            <li>• 点击"机器人行动"按钮让AI出牌</li>
          </ul>
        </div>
      </div>
    </div>
  );
}