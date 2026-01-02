// components/GameLog.tsx
import React, { useRef, useEffect } from 'react';

interface GameLogProps {
  logs: string[];
  theme?: string;
}

export default function GameLog({ logs, theme = 'light' }: GameLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full flex flex-col">
      <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
      }`}>
        <span className={`w-2 h-6 rounded-full ${
          theme === 'dark' ? 'bg-green-500' : 'bg-green-500'
        }`}></span>
        游戏日志
      </h3>
      
      <div className={`flex-1 rounded-lg p-4 overflow-y-auto ${
        theme === 'dark' ? 'bg-gradient-to-b from-gray-800/30 to-gray-900/30' : 'bg-gradient-to-b from-white/30 to-white/10'
      }`}>
        {logs.length === 0 ? (
          <div className={`h-full flex items-center justify-center ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            <p>游戏日志将显示在这里</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg shadow-sm border-l-4 border-green-500 ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-sm`}>{index + 1}.</span>
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{log}</span>
                </div>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
      
      <div className={`mt-4 text-sm text-center ${
        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
      }`}>
        日志自动保存，刷新页面不丢失
      </div>
    </div>
  );
}