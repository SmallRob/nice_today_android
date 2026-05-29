import React, { useState, useEffect } from 'react';
import { healthService } from '../services/healthService';
import type { HealthDashboard, BodyMetrics, MoodEntry } from '../types';

interface HealthDashboardPageProps {
  onBack?: () => void;
}

const HealthDashboardPage: React.FC<HealthDashboardPageProps> = ({ onBack }) => {
  const [dashboard, setDashboard] = useState<HealthDashboard | null>(null);
  const [todayMetrics, setTodayMetrics] = useState<BodyMetrics | null>(null);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    
    // Load or generate dashboard
    let dash = healthService.getHealthDashboard();
    if (!dash) {
      dash = generateDefaultDashboard();
      healthService.saveHealthDashboard(dash);
    }
    setDashboard(dash);

    // Load today's mood
    const mood = healthService.getMoodEntry(today);
    setTodayMood(mood);

    // Load today's body metrics
    const metrics = healthService.getBodyMetrics(today);
    setTodayMetrics(metrics);

    setLoading(false);
  };

  const generateDefaultDashboard = (): HealthDashboard => {
    return {
      overallScore: 75,
      physicalHealth: 80,
      mentalHealth: 70,
      sleepQuality: 65,
      energyLevel: 72,
      stressLevel: 45,
      recommendations: [
        '建议每天保持30分钟运动',
        '注意保持充足睡眠',
        '适当放松，减少压力',
      ],
      alerts: [],
    };
  };

  const ScoreCard = ({ title, score, icon, color }: { title: string; score: number; icon: string; color: string }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
        <span className={`text-2xl font-bold ${color}`}>{score}</span>
      </div>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${getScoreBgColor(score)}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '一般';
    return '需改善';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="text-blue-500 text-sm">← 返回</button>
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">健康仪表盘</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Overall score */}
        {dashboard && (
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-center">
              <div className="text-6xl font-black">{dashboard.overallScore}</div>
              <div className="text-sm opacity-80 mt-1">综合健康评分</div>
              <div className="text-lg font-medium mt-2">{getScoreLabel(dashboard.overallScore)}</div>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="flex gap-2">
                {dashboard.alerts.length > 0 ? (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs">
                    {dashboard.alerts.length} 条提醒
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs">状态良好</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Score breakdown */}
        {dashboard && (
          <div className="grid grid-cols-2 gap-3">
            <ScoreCard title="身体健康" score={dashboard.physicalHealth} icon="💪" color={getScoreColor(dashboard.physicalHealth)} />
            <ScoreCard title="心理健康" score={dashboard.mentalHealth} icon="🧠" color={getScoreColor(dashboard.mentalHealth)} />
            <ScoreCard title="睡眠质量" score={dashboard.sleepQuality} icon="😴" color={getScoreColor(dashboard.sleepQuality)} />
            <ScoreCard title="能量水平" score={dashboard.energyLevel} icon="⚡" color={getScoreColor(dashboard.energyLevel)} />
          </div>
        )}

        {/* Stress level */}
        {dashboard && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">压力指数</span>
              <span className={`text-lg font-bold ${dashboard.stressLevel < 40 ? 'text-green-500' : dashboard.stressLevel < 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                {dashboard.stressLevel}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  dashboard.stressLevel < 40 ? 'bg-green-500' : dashboard.stressLevel < 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${dashboard.stressLevel}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">低压力</span>
              <span className="text-[10px] text-gray-400">高压力</span>
            </div>
          </div>
        )}

        {/* Today's mood */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">今日心情</h3>
          {todayMood ? (
            <div className="flex items-center gap-4">
              <span className="text-4xl">{getMoodEmoji(todayMood.mood)}</span>
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  心情: {todayMood.mood}/5
                </div>
                <div className="text-xs text-gray-500">
                  能量: {todayMood.energy}/5 | 压力: {todayMood.stress}/5
                </div>
                {todayMood.notes && (
                  <p className="text-xs text-gray-400 mt-1">{todayMood.notes}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">今天还没有记录心情</p>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          <button className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <span className="text-2xl">📊</span>
            <div className="text-xs text-gray-500 mt-2">记录指标</div>
          </button>
          <button className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <span className="text-2xl">😴</span>
            <div className="text-xs text-gray-500 mt-2">睡眠记录</div>
          </button>
          <button className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <span className="text-2xl">🎯</span>
            <div className="text-xs text-gray-500 mt-2">健康目标</div>
          </button>
        </div>

        {/* Recommendations */}
        {dashboard && dashboard.recommendations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">健康建议</h3>
            <div className="space-y-2">
              {dashboard.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">💡</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly trend placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">本周趋势</h3>
          <div className="flex items-end justify-between h-20 gap-1">
            {['一', '二', '三', '四', '五', '六', '日'].map((day, idx) => {
              const score = 60 + Math.floor(Math.random() * 30);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t" style={{ height: `${score}%` }}>
                    <div className={`w-full h-full rounded-t ${getScoreBgColor(score)}`} />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">周{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const getMoodEmoji = (mood: number): string => {
  switch (mood) {
    case 5: return '😄';
    case 4: return '😊';
    case 3: return '😐';
    case 2: return '😫';
    case 1: return '😩';
    default: return '😐';
  }
};

export default HealthDashboardPage;