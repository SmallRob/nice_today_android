import React, { useState, useEffect, useCallback } from 'react';
import { fortuneService } from '../services/fortuneService';
import type { HoroscopeData, ZodiacSign } from '../types';

interface HoroscopePageProps {
  onBack?: () => void;
}

const ZODIAC_LIST: { sign: ZodiacSign; name: string; emoji: string; dateRange: string }[] = [
  { sign: 'aries', name: '白羊座', emoji: '♈', dateRange: '3.21-4.19' },
  { sign: 'taurus', name: '金牛座', emoji: '♉', dateRange: '4.20-5.20' },
  { sign: 'gemini', name: '双子座', emoji: '♊', dateRange: '5.21-6.21' },
  { sign: 'cancer', name: '巨蟹座', emoji: '♋', dateRange: '6.22-7.22' },
  { sign: 'leo', name: '狮子座', emoji: '♌', dateRange: '7.23-8.22' },
  { sign: 'virgo', name: '处女座', emoji: '♍', dateRange: '8.23-9.22' },
  { sign: 'libra', name: '天秤座', emoji: '♎', dateRange: '9.23-10.23' },
  { sign: 'scorpio', name: '天蝎座', emoji: '♏', dateRange: '10.24-11.22' },
  { sign: 'sagittarius', name: '射手座', emoji: '♐', dateRange: '11.23-12.21' },
  { sign: 'capricorn', name: '摩羯座', emoji: '♑', dateRange: '12.22-1.19' },
  { sign: 'aquarius', name: '水瓶座', emoji: '♒', dateRange: '1.20-2.18' },
  { sign: 'pisces', name: '双鱼座', emoji: '♓', dateRange: '2.19-3.20' },
];

const VIEW_MODES = [
  { key: 'daily', label: '今日' },
  { key: 'weekly', label: '本周' },
  { key: 'monthly', label: '本月' },
];

const HoroscopePage: React.FC<HoroscopePageProps> = ({ onBack }) => {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>('aries');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSignSelector, setShowSignSelector] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  useEffect(() => {
    loadHoroscopeData();
  }, [selectedSign, selectedDate, viewMode]);

  const loadHoroscopeData = useCallback(() => {
    setLoading(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Try to get cached data
    let data = fortuneService.getHoroscopeData(selectedSign, dateStr);
    
    if (!data) {
      // Generate mock data for demonstration
      data = generateMockHoroscope(selectedSign, dateStr);
      fortuneService.saveHoroscopeData(data);
    }
    
    setHoroscopeData(data);
    setLoading(false);
  }, [selectedSign, selectedDate]);

  const generateMockHoroscope = (sign: ZodiacSign, date: string): HoroscopeData => {
    const seed = date.split('-').reduce((acc, v) => acc + parseInt(v), 0) + sign.length;
    const rand = (min: number, max: number) => Math.floor(((seed * 9301 + 49297) % 233280) / 233280 * (max - min + 1)) + min;
    
    return {
      sign,
      date,
      overall: rand(1, 5),
      love: rand(1, 5),
      career: rand(1, 5),
      wealth: rand(1, 5),
      health: rand(1, 5),
      luckyNumber: rand(1, 99),
      luckyColor: ['红色', '蓝色', '绿色', '紫色', '金色'][rand(0, 4)],
      summary: '今天适合把握机遇，保持积极心态迎接挑战。',
      details: {
        loveDescription: '感情运势平稳，适合与伴侣沟通交流。',
        careerDescription: '工作上可能有新的机会，注意把握。',
        wealthDescription: '财运一般，避免冲动消费。',
        healthDescription: '注意休息，保持良好的作息习惯。',
      },
    };
  };

  const getSignName = (sign: ZodiacSign) => {
    return ZODIAC_LIST.find(z => z.sign === sign)?.name || sign;
  };

  const getSignEmoji = (sign: ZodiacSign) => {
    return ZODIAC_LIST.find(z => z.sign === sign)?.emoji || '⭐';
  };

  const ScoreBar = ({ score, label, color }: { score: number; label: string; color: string }) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-12">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-6 text-right">{score}</span>
    </div>
  );

  const StarRating = ({ score }: { score: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-lg ${i <= score ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}`}>
          ★
        </span>
      ))}
    </div>
  );

  // Generate date list for selector
  const dateList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i - 3);
    return d;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="text-blue-500 text-sm">← 返回</button>
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {getSignEmoji(selectedSign)} {getSignName(selectedSign)}运势
          </h1>
          <button
            onClick={() => setShowSignSelector(!showSignSelector)}
            className="text-blue-500 text-sm"
          >
            切换
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* View mode selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {VIEW_MODES.map(mode => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key as any)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode.key
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

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
        ) : horoscopeData ? (
          <>
            {/* Overall score */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="text-center mb-4">
                <div className="text-5xl font-black text-gray-900 dark:text-white">
                  {horoscopeData.overall}
                </div>
                <div className="text-sm text-gray-500 mt-1">综合运势</div>
                <StarRating score={horoscopeData.overall} />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                {horoscopeData.summary}
              </p>
            </div>

            {/* Score breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">运势详情</h3>
              <ScoreBar score={horoscopeData.love} label="爱情" color="bg-pink-500" />
              <ScoreBar score={horoscopeData.career} label="事业" color="bg-blue-500" />
              <ScoreBar score={horoscopeData.wealth} label="财富" color="bg-yellow-500" />
              <ScoreBar score={horoscopeData.health} label="健康" color="bg-green-500" />
            </div>

            {/* Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-pink-500 text-lg">💕</span>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">爱情运势</div>
                  <p className="text-xs text-gray-500 mt-1">{horoscopeData.details.loveDescription}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 text-lg">💼</span>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">事业运势</div>
                  <p className="text-xs text-gray-500 mt-1">{horoscopeData.details.careerDescription}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 text-lg">💰</span>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">财富运势</div>
                  <p className="text-xs text-gray-500 mt-1">{horoscopeData.details.wealthDescription}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-lg">🏥</span>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">健康运势</div>
                  <p className="text-xs text-gray-500 mt-1">{horoscopeData.details.healthDescription}</p>
                </div>
              </div>
            </div>

            {/* Lucky info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500">幸运数字</div>
                  <div className="text-2xl font-bold text-blue-500 mt-1">{horoscopeData.luckyNumber}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">幸运颜色</div>
                  <div className="text-lg font-bold text-purple-500 mt-1">{horoscopeData.luckyColor}</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-10">暂无数据</div>
        )}

        {/* Zodiac selector */}
        {showSignSelector && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">选择星座</h3>
            <div className="grid grid-cols-4 gap-2">
              {ZODIAC_LIST.map(zodiac => (
                <button
                  key={zodiac.sign}
                  onClick={() => {
                    setSelectedSign(zodiac.sign);
                    setShowSignSelector(false);
                  }}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                    selectedSign === zodiac.sign
                      ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{zodiac.emoji}</span>
                  <span className="text-xs mt-1 text-gray-700 dark:text-gray-300">{zodiac.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoroscopePage;