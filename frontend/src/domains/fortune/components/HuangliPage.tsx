import React, { useState, useEffect, useCallback } from 'react';
import { fortuneService } from '../services/fortuneService';
import type { HuangliData } from '../types';

interface HuangliPageProps {
  onBack?: () => void;
}

const HuangliPage: React.FC<HuangliPageProps> = ({ onBack }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [huangliData, setHuangliData] = useState<HuangliData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHuangliData();
  }, [selectedDate]);

  const loadHuangliData = useCallback(() => {
    setLoading(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    let data = fortuneService.getHuangliData(dateStr);
    if (!data) {
      data = generateMockHuangli(dateStr);
      fortuneService.saveHuangliData(data);
    }
    
    setHuangliData(data);
    setLoading(false);
  }, [selectedDate]);

  const generateMockHuangli = (date: string): HuangliData => {
    const [year, month, day] = date.split('-').map(Number);
    const seed = year * 10000 + month * 100 + day;
    
    const yiPool = ['嫁娶', '开市', '交易', '立券', '纳财', '出行', '祈福', '求嗣', '解除', '修造', '动土', '竖柱', '上梁', '安床', '纳畜', '安葬', '启钻', '入殓', '移徙', '栽种'];
    const jiPool = ['破土', '安葬', '行丧', '开光', '伐木', '作梁', '造桥', '词讼', '针灸', '出师', '求医', '赴任', '置产'];
    
    const getYi = (count: number) => {
      const result: string[] = [];
      for (let i = 0; i < count; i++) {
        const idx = (seed * (i + 1) * 7) % yiPool.length;
        result.push(yiPool[idx]);
      }
      return [...new Set(result)];
    };
    
    const getJi = (count: number) => {
      const result: string[] = [];
      for (let i = 0; i < count; i++) {
        const idx = (seed * (i + 1) * 13) % jiPool.length;
        result.push(jiPool[idx]);
      }
      return [...new Set(result)];
    };

    const ganZhiYear = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉'][(year - 4) % 10];
    const ganZhiMonth = ['甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'][(month + 1) % 10];
    const ganZhiDay = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉'][(day + 5) % 10];

    return {
      date,
      lunarDate: `农历${['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'][month - 1]}月${['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'][day - 1]}`,
      ganZhi: `${ganZhiYear}年 ${ganZhiMonth}月 ${ganZhiDay}日`,
      yi: getYi(6),
      ji: getJi(4),
      auspicious: ['天德', '月德', '天恩', '母仓'],
      inauspicious: ['劫煞', '天火', '灾煞'],
      gods: ['喜神东北', '财神正南', '福神正北'],
      directions: {
        wealth: '正南',
        happiness: '东南',
        evil: '正西',
      },
    };
  };

  const dateList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i - 3);
    return d;
  });

  const today = new Date();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-red-600 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="text-white/70 text-sm">← 返回</button>
          )}
          <h1 className="text-lg font-bold text-white">📅 黄历查询</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Date selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dateList.map((date, idx) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate.toISOString().split('T')[0];
            const isToday = dateStr === today.toISOString().split('T')[0];
            
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center min-w-[56px] py-2 px-3 rounded-xl transition-all ${
                  isSelected ? 'bg-red-500 text-white shadow-md' :
                  isToday ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                  'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                <span className="text-[10px]">{isToday ? '今天' : `${date.getMonth() + 1}/${date.getDate()}`}</span>
                <span className="text-sm font-bold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* Huangli content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
          </div>
        ) : huangliData ? (
          <>
            {/* Date info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {selectedDate.getDate()}
              </div>
              <div className="text-sm text-gray-500">
                {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
              </div>
              <div className="mt-2 text-lg font-bold text-red-500">{huangliData.lunarDate}</div>
              <div className="text-sm text-gray-500 mt-1">{huangliData.ganZhi}</div>
            </div>

            {/* Yi (宜) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">宜</span>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">今日宜</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {huangliData.yi.map((item, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Ji (忌) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">忌</span>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">今日忌</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {huangliData.ji.map((item, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Gods and directions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">神煞方位</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500">财神方位</div>
                  <div className="text-lg font-bold text-yellow-500">{huangliData.directions.wealth}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-xs text-gray-500">喜神方位</div>
                  <div className="text-lg font-bold text-pink-500">{huangliData.directions.happiness}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {huangliData.gods.map((god, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded">
                    {god}
                  </span>
                ))}
              </div>
            </div>

            {/* Auspicious and inauspicious */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-bold text-green-500 mb-2">吉神</h3>
                <div className="space-y-1">
                  {huangliData.auspicious.map((god, idx) => (
                    <div key={idx} className="text-xs text-gray-600 dark:text-gray-300">{god}</div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-bold text-red-500 mb-2">凶煞</h3>
                <div className="space-y-1">
                  {huangliData.inauspicious.map((god, idx) => (
                    <div key={idx} className="text-xs text-gray-600 dark:text-gray-300">{god}</div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-10">暂无数据</div>
        )}

        {/* Disclaimer */}
        <div className="text-center text-xs text-gray-400 py-4">
          黄历信息仅供参考，请结合实际情况判断
        </div>
      </div>
    </div>
  );
};

export default HuangliPage;