import React, { useState, useEffect, useCallback } from 'react';
import { healthService } from '../services/healthService';
import type { BiorhythmData } from '../types';

interface BiorhythmPageProps {
  onBack?: () => void;
}

const BiorhythmPage: React.FC<BiorhythmPageProps> = ({ onBack }) => {
  const [birthDate, setBirthDate] = useState('');
  const [biorhythmData, setBiorhythmData] = useState<BiorhythmData[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  useEffect(() => {
    const profile = healthService.getUserProfile();
    if (profile.birthDate) {
      setBirthDate(profile.birthDate);
    }
  }, []);

  useEffect(() => {
    if (birthDate) {
      calculateBiorhythm();
    }
  }, [birthDate, selectedDate]);

  const calculateBiorhythm = useCallback(() => {
    if (!birthDate) return;

    setLoading(true);
    setError(null);

    try {
      // Calculate biorhythm based on birth date
      const birth = new Date(birthDate);
      const target = new Date(selectedDate);
      const daysSinceBirth = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

      // Biorhythm cycles: Physical (23 days), Emotional (28 days), Intellectual (33 days)
      const physical = Math.sin((2 * Math.PI * daysSinceBirth) / 23) * 100;
      const emotional = Math.sin((2 * Math.PI * daysSinceBirth) / 28) * 100;
      const intellectual = Math.sin((2 * Math.PI * daysSinceBirth) / 33) * 100;

      const data: BiorhythmData = {
        date: selectedDate.toISOString().split('T')[0],
        physical: Math.round(physical),
        emotional: Math.round(emotional),
        intellectual: Math.round(intellectual),
        summary: getBiorhythmSummary(physical, emotional, intellectual),
        advice: getBiorhythmAdvice(physical, emotional, intellectual),
      };

      // Generate 7-day range
      const rangeData: BiorhythmData[] = [];
      for (let i = -3; i <= 3; i++) {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + i);
        const days = Math.floor((d.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
        
        rangeData.push({
          date: d.toISOString().split('T')[0],
          physical: Math.round(Math.sin((2 * Math.PI * days) / 23) * 100),
          emotional: Math.round(Math.sin((2 * Math.PI * days) / 28) * 100),
          intellectual: Math.round(Math.sin((2 * Math.PI * days) / 33) * 100),
          summary: '',
          advice: '',
        });
      }

      setBiorhythmData(rangeData);
    } catch (err: any) {
      setError('计算生物节律失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [birthDate, selectedDate]);

  const getBiorhythmSummary = (physical: number, emotional: number, intellectual: number): string => {
    const avg = (physical + emotional + intellectual) / 3;
    if (avg > 50) return '状态极佳，精力充沛，适合挑战高难度任务。';
    if (avg > 20) return '状态良好，适合日常工作和学习。';
    if (avg > -20) return '状态平稳，注意劳逸结合。';
    if (avg > -50) return '状态一般，建议适当休息。';
    return '状态较低，注意休息和调整。';
  };

  const getBiorhythmAdvice = (physical: number, emotional: number, intellectual: number): string => {
    const advice: string[] = [];
    if (physical > 50) advice.push('体力充沛，适合运动');
    else if (physical < -50) advice.push('注意休息，避免剧烈运动');
    
    if (emotional > 50) advice.push('心情愉悦，适合社交');
    else if (emotional < -50) advice.push('情绪低落，注意调节');
    
    if (intellectual > 50) advice.push('思维敏捷，适合学习');
    else if (intellectual < -50) advice.push('注意力分散，避免复杂决策');
    
    return advice.join('；') || '保持平常心，顺其自然。';
  };

  const getScoreColor = (score: number): string => {
    if (score > 50) return 'text-green-500';
    if (score > 0) return 'text-blue-500';
    if (score > -50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number): string => {
    if (score > 50) return 'bg-green-500';
    if (score > 0) return 'bg-blue-500';
    if (score > -50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const GaugeChart = ({ score, label, color }: { score: number; label: string; color: string }) => {
    const normalizedScore = (score + 100) / 200 * 100;
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-10 overflow-hidden">
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-t-full" />
          <div
            className={`absolute bottom-0 left-0 right-0 ${color} rounded-t-full transition-all duration-500`}
            style={{ height: `${normalizedScore}%` }}
          />
        </div>
        <div className={`text-lg font-bold mt-1 ${getScoreColor(score)}`}>{score}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    );
  };

  // Date list for selector
  const dateList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + i - 3);
    return d;
  });

  const currentData = biorhythmData.find(d => d.date === selectedDate.toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="text-blue-500 text-sm">← 返回</button>
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">生物节律</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Birth date input */}
        {!birthDate && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">请输入出生日期</h3>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        )}

        {/* Date selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dateList.map((date, idx) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
            
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center min-w-[48px] py-2 px-3 rounded-xl transition-all ${
                  isSelected ? 'bg-blue-500 text-white shadow-md' :
                  isToday ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                  'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                <span className="text-[10px]">{isToday ? '今天' : `周${dayNames[date.getDay()]}`}</span>
                <span className="text-sm font-bold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* Main content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 text-center text-red-500 text-sm">
            {error}
          </div>
        ) : currentData ? (
          <>
            {/* Gauge charts */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">
                {selectedDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <div className="flex justify-around">
                <GaugeChart score={currentData.physical} label="体力" color="bg-green-500" />
                <GaugeChart score={currentData.emotional} label="情绪" color="bg-blue-500" />
                <GaugeChart score={currentData.intellectual} label="智力" color="bg-purple-500" />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">状态分析</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{currentData.summary}</p>
              <p className="text-xs text-gray-500 mt-2">💡 {currentData.advice}</p>
            </div>

            {/* Trend chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">7天趋势</h3>
              <div className="space-y-2">
                {biorhythmData.map((data, idx) => {
                  const date = new Date(data.date);
                  const isToday = data.date === todayStr;
                  const isSelected = data.date === selectedDate.toISOString().split('T')[0];
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className={`text-xs w-10 ${isToday ? 'font-bold text-blue-500' : 'text-gray-500'}`}>
                        {isToday ? '今天' : `${date.getMonth() + 1}/${date.getDate()}`}
                      </span>
                      <div className="flex-1 flex gap-1">
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${getScoreBgColor(data.physical)} rounded-full`} style={{ width: `${(data.physical + 100) / 2}%` }} />
                        </div>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${getScoreBgColor(data.emotional)} rounded-full`} style={{ width: `${(data.emotional + 100) / 2}%` }} />
                        </div>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${getScoreBgColor(data.intellectual)} rounded-full`} style={{ width: `${(data.intellectual + 100) / 2}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 justify-center">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" /> 体力
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" /> 情绪
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full" /> 智力
                </span>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm text-sm text-gray-500">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">什么是生物节律？</p>
              <p>生物节律理论认为，人体存在三个固定的周期：</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>体力周期：23天，影响体力和耐力</li>
                <li>情绪周期：28天，影响情感和创造力</li>
                <li>智力周期：33天，影响思维和记忆力</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-10">请先设置出生日期</div>
        )}
      </div>
    </div>
  );
};

export default BiorhythmPage;