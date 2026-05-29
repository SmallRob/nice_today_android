import React, { useState, useEffect } from 'react';
import { growthService } from '../services/growthService';
import { userCenterService } from '../../user-center/services/userCenterService';
import type { LifeTrend } from '../types';

interface LifeTrendPageProps {
  onBack?: () => void;
}

const LifeTrendPage: React.FC<LifeTrendPageProps> = ({ onBack }) => {
  const [profile, setProfile] = useState<any>(null);
  const [trend, setTrend] = useState<LifeTrend | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('overall');

  useEffect(() => {
    const p = userCenterService.getUserProfile();
    setProfile(p);
    generateTrend(p);
  }, []);

  const generateTrend = (userProfile: any) => {
    const now = new Date();
    const birthDate = userProfile?.birthDate ? new Date(userProfile.birthDate) : null;
    const age = birthDate ? Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 30;
    
    // Generate life trend based on age
    const baseScore = Math.min(90, 50 + age * 0.5);
    const variance = () => Math.floor(Math.random() * 20) - 10;
    
    const lifeTrend: LifeTrend = {
      date: now.toISOString().split('T')[0],
      overall: Math.max(1, Math.min(5, Math.round(baseScore / 20 + variance() / 20))),
      career: Math.max(1, Math.min(5, Math.round((baseScore + variance()) / 20))),
      relationships: Math.max(1, Math.min(5, Math.round((baseScore + variance()) / 20))),
      health: Math.max(1, Math.min(5, Math.round((baseScore + variance()) / 20))),
      wealth: Math.max(1, Math.min(5, Math.round((baseScore + variance()) / 20))),
      personalGrowth: Math.max(1, Math.min(5, Math.round((baseScore + variance()) / 20))),
      events: [
        { date: now.toISOString().split('T')[0], type: 'personal', description: '自我提升的关键时期', impact: 'positive', significance: 4 },
        { date: now.toISOString().split('T')[0], type: 'career', description: '事业上有新的机遇', impact: 'positive', significance: 3 },
      ],
      predictions: [
        { period: '本月', area: '事业', prediction: '工作上会有新的突破', confidence: 75, advice: '保持积极主动的态度' },
        { period: '本季', area: '感情', prediction: '人际关系更加和谐', confidence: 70, advice: '多与朋友交流' },
        { period: '本年', area: '健康', prediction: '身体状况良好', confidence: 80, advice: '坚持运动习惯' },
      ],
    };
    
    setTrend(lifeTrend);
  };

  const areas = [
    { key: 'overall', label: '综合', emoji: '🌟', color: 'from-yellow-400 to-orange-500' },
    { key: 'career', label: '事业', emoji: '💼', color: 'from-blue-400 to-indigo-500' },
    { key: 'relationships', label: '感情', emoji: '💕', color: 'from-pink-400 to-red-500' },
    { key: 'health', label: '健康', emoji: '💪', color: 'from-green-400 to-teal-500' },
    { key: 'wealth', label: '财富', emoji: '💰', color: 'from-yellow-400 to-amber-500' },
    { key: 'personalGrowth', label: '成长', emoji: '🌱', color: 'from-purple-400 to-indigo-500' },
  ];

  const getScore = (area: string) => {
    if (!trend) return 0;
    return trend[area as keyof LifeTrend] as number || 0;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4) return '极佳';
    if (score >= 3) return '良好';
    if (score >= 2) return '平稳';
    return '需注意';
  };

  const StarRating = ({ score }: { score: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-lg ${i <= score ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>
          ★
        </span>
      ))}
    </div>
  );

  if (!trend) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const selectedAreaData = areas.find(a => a.key === selectedArea);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && <button onClick={onBack} className="text-blue-500 text-sm">← 返回</button>}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">人生趋势</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* User info */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="text-center">
            <div className="text-sm opacity-80">人生运势分析</div>
            <div className="text-2xl font-black mt-1">{profile?.nickname || '用户'}</div>
            {profile?.zodiac && (
              <div className="text-sm opacity-80 mt-1">{profile.zodiac}</div>
            )}
          </div>
        </div>

        {/* Area selector */}
        <div className="grid grid-cols-3 gap-2">
          {areas.map(area => (
            <button
              key={area.key}
              onClick={() => setSelectedArea(area.key)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                selectedArea === area.key
                  ? 'bg-white dark:bg-gray-800 shadow-md ring-2 ring-blue-500'
                  : 'bg-white dark:bg-gray-800 shadow-sm'
              }`}
            >
              <span className="text-2xl">{area.emoji}</span>
              <span className="text-xs text-gray-500 mt-1">{area.label}</span>
              <StarRating score={getScore(area.key)} />
            </button>
          ))}
        </div>

        {/* Selected area detail */}
        <div className={`bg-gradient-to-br ${selectedAreaData?.color} rounded-2xl p-6 text-white`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{selectedAreaData?.emoji}</span>
            <div>
              <div className="text-2xl font-bold">{selectedAreaData?.label}运势</div>
              <div className="text-sm opacity-80">{getScoreLabel(getScore(selectedArea))}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StarRating score={getScore(selectedArea)} />
            <span className="text-lg font-bold">{getScore(selectedArea)}/5</span>
          </div>
        </div>

        {/* Predictions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">🔮 运势预测</h3>
          <div className="space-y-3">
            {trend.predictions.map((pred, idx) => (
              <div key={idx} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{pred.period} · {pred.area}</span>
                  <span className="text-xs text-gray-400">置信度 {pred.confidence}%</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{pred.prediction}</p>
                <p className="text-xs text-blue-500 mt-1">💡 {pred.advice}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Life events */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">📌 重要事件</h3>
          <div className="space-y-3">
            {trend.events.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className={`text-lg ${event.impact === 'positive' ? 'text-green-500' : event.impact === 'negative' ? 'text-red-500' : 'text-gray-400'}`}>
                  {event.impact === 'positive' ? '✨' : event.impact === 'negative' ? '⚠️' : '📌'}
                </span>
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{event.description}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{event.type} · 重要性 {event.significance}/5</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advice */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">💡 人生建议</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              保持积极乐观的心态，面对挑战时坚持不懈
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              注重身心健康，定期运动和休息
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              维护好人际关系，珍惜身边的人
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              持续学习和成长，把握每一个机会
            </li>
          </ul>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-xs text-gray-400 py-4">
          人生趋势分析仅供参考，请理性看待
        </div>
      </div>
    </div>
  );
};

export default LifeTrendPage;