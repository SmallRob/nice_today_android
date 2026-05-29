import React, { useState, useEffect } from 'react';
import { userCenterService } from '../../user-center/services/userCenterService';
import { fortuneService } from '../../fortune/services/fortuneService';
import { healthService } from '../../health/services/healthService';
import { toolsService } from '../../tools/services/toolsService';

interface DashboardPageProps {
  onNavigate?: (page: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [profile, setProfile] = useState<any>(null);
  const [todayFortune, setTodayFortune] = useState<any>(null);
  const [moodEntry, setMoodEntry] = useState<any>(null);
  const [todoStats, setTodoStats] = useState({ total: 0, active: 0, completed: 0 });
  const [greeting, setGreeting] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Profile
    const p = userCenterService.getUserProfile();
    setProfile(p);

    // Greeting
    const hour = new Date().getHours();
    if (hour < 6) setGreeting('夜深了');
    else if (hour < 9) setGreeting('早上好');
    else if (hour < 12) setGreeting('上午好');
    else if (hour < 14) setGreeting('中午好');
    else if (hour < 18) setGreeting('下午好');
    else if (hour < 22) setGreeting('晚上好');
    else setGreeting('夜深了');

    // Fortune
    if (p.zodiac) {
      const zodiacMap: Record<string, string> = {
        '白羊座': 'aries', '金牛座': 'taurus', '双子座': 'gemini',
        '巨蟹座': 'cancer', '狮子座': 'leo', '处女座': 'virgo',
        '天秤座': 'libra', '天蝎座': 'scorpio', '射手座': 'sagittarius',
        '摩羯座': 'capricorn', '水瓶座': 'aquarius', '双鱼座': 'pisces',
      };
      const sign = zodiacMap[p.zodiac];
      if (sign) {
        let fortune = fortuneService.getHoroscopeData(sign as any, today);
        setTodayFortune(fortune);
      }
    }

    // Mood
    const mood = healthService.getMoodEntry(today);
    setMoodEntry(mood);

    // Todo stats
    const stats = toolsService.getTodoStats();
    setTodoStats(stats);
  };

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 5: return '😄';
      case 4: return '😊';
      case 3: return '😐';
      case 2: return '😫';
      case 1: return '😩';
      default: return '❓';
    }
  };

  const quickActions = [
    { icon: '🔮', label: '星座运势', page: 'horoscope' },
    { icon: '📿', label: '塔罗牌', page: 'tarot' },
    { icon: '📅', label: '黄历', page: 'huangli' },
    { icon: '🧠', label: 'MBTI', page: 'mbti' },
    { icon: '💪', label: '健康', page: 'health-dashboard' },
    { icon: '📝', label: '待办', page: 'todo-list' },
    { icon: '🎯', label: '习惯', page: 'habit-tracker' },
    { icon: '⚙️', label: '设置', page: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header with greeting */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 pt-12 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl">
              {profile?.nickname ? profile.nickname[0] : '👤'}
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">{greeting}，{profile?.nickname || '朋友'}</h1>
              <p className="text-white/70 text-sm">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
            </div>
          </div>

          {/* Today's fortune preview */}
          {todayFortune && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white/70 text-xs">今日运势</span>
                  <div className="text-white text-lg font-bold">{profile?.zodiac}</div>
                </div>
                <div className="flex gap-3">
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">{todayFortune.overall}</div>
                    <div className="text-white/60 text-[10px]">综合</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">{todayFortune.love}</div>
                    <div className="text-white/60 text-[10px]">爱情</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white text-xl font-bold">{todayFortune.career}</div>
                    <div className="text-white/60 text-[10px]">事业</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
            <span className="text-2xl">{moodEntry ? getMoodEmoji(moodEntry.mood) : '😊'}</span>
            <div className="text-xs text-gray-500 mt-1">今日心情</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-500">{todoStats.active}</div>
            <div className="text-xs text-gray-500">待办事项</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-500">{todoStats.completed}</div>
            <div className="text-xs text-gray-500">已完成</div>
          </div>
        </div>

        {/* Quick actions grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">快捷功能</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate?.(action.page)}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs text-gray-600 dark:text-gray-300 mt-2">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily tip */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">💡 每日提示</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {todayFortune?.summary || '记录每日心情，了解自己的情绪变化规律，有助于保持身心健康。'}
          </p>
        </div>

        {/* Recent activity placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">最近动态</h3>
          <div className="space-y-3">
            {moodEntry && (
              <div className="flex items-center gap-3">
                <span className="text-xl">{getMoodEmoji(moodEntry.mood)}</span>
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">记录了今日心情</div>
                  <div className="text-xs text-gray-400">今天</div>
                </div>
              </div>
            )}
            {todoStats.completed > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">完成了 {todoStats.completed} 个待办事项</div>
                  <div className="text-xs text-gray-400">今天</div>
                </div>
              </div>
            )}
            {!moodEntry && todoStats.completed === 0 && (
              <div className="text-center text-gray-400 py-4">
                <span className="text-3xl">🌟</span>
                <p className="text-sm mt-2">开始记录你的每一天吧</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;