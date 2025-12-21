import React, { useState, useEffect, useMemo, useCallback } from 'react';
import IconLibrary from './IconLibrary';
import { fetchDressInfoRange, fetchSpecificDateDressInfo, formatDateString } from '../services/apiServiceRefactored';

const WuxingEnergyTrend = ({ dailyElement }) => {
  const relationships = {
    '木': { generates: '火', restricts: '土', generatedBy: '水', restrictedBy: '金', color: 'bg-green-500' },
    '火': { generates: '土', restricts: '金', generatedBy: '木', restrictedBy: '水', color: 'bg-red-500' },
    '土': { generates: '金', restricts: '水', generatedBy: '火', restrictedBy: '木', color: 'bg-yellow-600' },
    '金': { generates: '水', restricts: '木', generatedBy: '土', restrictedBy: '火', color: 'bg-gray-400' },
    '水': { generates: '木', restricts: '火', generatedBy: '金', restrictedBy: '土', color: 'bg-blue-500' }
  };

  const current = relationships[dailyElement] || relationships['木'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <IconLibrary.Icon name="energy" size={20} className="mr-2 text-yellow-500" />
        五行能量趋势与关系
      </h3>

      <div className="relative h-48 mb-6 flex items-center justify-center">
        {/* 五行环形图 */}
        <div className="relative w-40 h-40">
          {Object.entries(relationships).map(([el, data], i) => {
            const angle = (i * 72 - 90) * (Math.PI / 180);
            const x = 50 + 40 * Math.cos(angle);
            const y = 50 + 40 * Math.sin(angle);
            const isActive = el === dailyElement;
            return (
              <div
                key={el}
                className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500 ${data.color} ${isActive ? 'ring-4 ring-offset-2 ring-purple-500 scale-125 z-10' : 'opacity-60'}`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {el}
              </div>
            );
          })}
          {/* 中心说明 */}
          <div className="absolute inset-0 flex flex-center items-center justify-center">
            <div className="text-[10px] text-gray-400 dark:text-gray-400 text-center leading-tight">
              相生相克<br />能量流动
            </div>
          </div>
          {/* 简易箭头指示 (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="text-gray-300 dark:text-gray-600" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1 flex items-center">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
            能量相生 (生)
          </p>
          <p className="text-[11px] text-blue-700 dark:text-blue-100">
            {dailyElement}生{current.generates}，{current.generatedBy}生{dailyElement}。相生如母子，助力能量稳步提升。
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg border border-orange-100 dark:border-orange-800">
          <p className="text-xs font-semibold text-orange-800 dark:text-orange-200 mb-1 flex items-center">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-1.5"></span>
            能量相克 (克)
          </p>
          <p className="text-[11px] text-orange-700 dark:text-orange-100">
            {dailyElement}克{current.restricts}，{current.restrictedBy}克{dailyElement}。相克如制约，平衡过旺或过弱的能量。
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-[11px] text-gray-600 dark:text-gray-200 leading-relaxed">
        <strong className="text-gray-800 dark:text-white">逻辑说明：</strong>
        五行本无好坏，重在平衡。今日「{dailyElement}」气旺，穿着「{current.generatedBy}」或「{dailyElement}」色系可顺应天时；若感压力大，可尝试「{current.restricts}」色系以泄化平衡。
      </div>
    </div>
  );
};

const DressInfo = ({ apiBaseUrl, serviceStatus, isDesktop }) => {
  const [dressInfoList, setDressInfoList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDressInfo, setSelectedDressInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentSeason = useMemo(() => {
    const month = selectedDate.getMonth() + 1;
    if (month >= 3 && month <= 5) return '春';
    if (month >= 6 && month <= 8) return '夏';
    if (month >= 9 && month <= 11) return '秋';
    return '冬';
  }, [selectedDate]);

  const seasonalStyles = useMemo(() => {
    const styles = {
      '春': { style: '清新灵动', category: '薄款风衣、束口裤、针织开衫', icon: '🍃' },
      '夏': { style: '轻盈透气', category: '亚麻衬衫、百慕大短裤、凉拖', icon: '☀️' },
      '秋': { style: '复古叠穿', category: '休闲西装、直筒牛仔裤、薄卫衣', icon: '🍂' },
      '冬': { style: '温暖质感', category: '毛呢大衣、羊绒衫、工装靴', icon: '❄️' }
    };
    return styles[currentSeason];
  }, [currentSeason]);

  const luckyColors = useMemo(() => {
    return selectedDressInfo?.color_suggestions?.filter(cs => cs.吉凶 === "吉") || [];
  }, [selectedDressInfo]);

  const unluckyColors = useMemo(() => {
    return selectedDressInfo?.color_suggestions?.filter(cs => cs.吉凶 === "不吉") || [];
  }, [selectedDressInfo]);

  const loadDressInfoRange = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDressInfoRange(apiBaseUrl);
      if (result.success) {
        setDressInfoList(result.dressInfoList);
        const today = new Date().toISOString().split('T')[0];
        const todayInfo = result.dressInfoList.find(info => info.date === today);
        setSelectedDressInfo(todayInfo || result.dressInfoList[0]);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('加载穿衣指南数据失败');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  const handleDateChange = useCallback(async (date) => {
    setSelectedDate(date);
    const dateStr = formatDateString(date);
    const dateInfo = dressInfoList.find(info => info.date === dateStr);
    if (dateInfo) {
      setSelectedDressInfo(dateInfo);
    } else {
      try {
        const result = await fetchSpecificDateDressInfo(apiBaseUrl, dateStr);
        if (result.success) {
          setSelectedDressInfo(result.dressInfo);
          setDressInfoList(prev => [...prev.filter(i => i.date !== dateStr), result.dressInfo].sort((a, b) => a.date.localeCompare(b.date)));
        }
      } catch (err) { }
    }
  }, [dressInfoList, apiBaseUrl]);

  const formatDate = useCallback((dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }, []);

  const getDateTabClass = useCallback((dateStr) => {
    const isSelected = selectedDressInfo && selectedDressInfo.date === dateStr;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    let className = "flex flex-col items-center justify-center cursor-pointer transition-all duration-300 py-2 border-r last:border-r-0 dark:border-gray-700 ";
    if (isSelected) className += "bg-indigo-600 text-white font-bold scale-100 shadow-inner ";
    else if (isToday) className += "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-b-2 border-indigo-500 ";
    else className += "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 ";
    return className;
  }, [selectedDressInfo]);

  useEffect(() => {
    loadDressInfoRange();
  }, [loadDressInfoRange]);

  const getColorHex = (systemName) => {
    if (systemName.includes('红')) return 'bg-red-500';
    if (systemName.includes('绿')) return 'bg-green-500';
    if (systemName.includes('蓝')) return 'bg-blue-500';
    if (systemName.includes('黄')) return 'bg-yellow-500';
    if (systemName.includes('白')) return 'bg-white border-gray-200';
    if (systemName.includes('黑')) return 'bg-black';
    if (systemName.includes('灰')) return 'bg-gray-500';
    if (systemName.includes('紫')) return 'bg-purple-500';
    if (systemName.includes('金')) return 'bg-amber-400';
    if (systemName.includes('土') || systemName.includes('咖')) return 'bg-amber-800';
    if (systemName.includes('青')) return 'bg-teal-500';
    return 'bg-indigo-500';
  };

  if (loading && !selectedDressInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">正在解析五行能量...</p>
      </div>
    );
  }

  if (error && !selectedDressInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
        <IconLibrary.Icon name="error" size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">数据加载失败</h3>
        <button onClick={loadDressInfoRange} className="px-6 py-2 bg-indigo-600 text-white rounded-full">重试</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 performance-optimized pb-12">
      {/* 顶部综合卡片 */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-2xl">{seasonalStyles.icon}</span>
              <h2 className="text-2xl font-black tracking-tight">{selectedDressInfo.weekday}</h2>
            </div>
            <p className="text-indigo-100 text-sm font-medium opacity-90">{selectedDressInfo.date}</p>
          </div>
          <div className="text-right">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
              <span className="text-xs font-bold">每日能量：{selectedDressInfo.daily_element}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <p className="text-[10px] uppercase tracking-wider text-indigo-200 mb-1">本季风格</p>
            <p className="text-sm font-bold">{seasonalStyles.style}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <p className="text-[10px] uppercase tracking-wider text-indigo-200 mb-1">推荐品类</p>
            <p className="text-sm font-bold truncate">{seasonalStyles.category}</p>
          </div>
        </div>
      </div>

      {/* 日期选择 */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex overflow-x-auto scroll-smooth">
          {dressInfoList.slice(0, 10).map((info, index) => (
            <div
              key={index}
              className={getDateTabClass(info.date)}
              onClick={() => handleDateChange(new Date(info.date))}
              style={{ minWidth: '20%', flexShrink: 0 }}
            >
              <div className="text-[10px] opacity-70 mb-0.5">{info.weekday.replace('星期', '')}</div>
              <div className="text-sm font-bold">{formatDate(info.date)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 五行能量可视化 */}
      <WuxingEnergyTrend dailyElement={selectedDressInfo.daily_element} />

      {/* 色彩推荐 */}
      <div className="grid grid-cols-1 gap-4">
        {/* 吉祥色 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-bold mb-4 flex items-center text-green-600 dark:text-green-400">
            <IconLibrary.Icon name="color" size={18} className="mr-2" />
            推荐吉祥配色
          </h3>
          <div className="space-y-3">
            {luckyColors.map((colorItem, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl group transition-all">
                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-600 ${getColorHex(colorItem.颜色系统)}`}>
                  <IconLibrary.Icon name="stylish" size={20} className={colorItem.颜色系统.includes('白') ? 'text-gray-400' : 'text-white'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-800 dark:text-white">{colorItem.颜色系统}</span>
                    <span className="text-[10px] bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200 px-2 py-0.5 rounded-full">宜</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {colorItem.具体颜色.map((c, ci) => (
                      <span key={ci} className="text-[11px] px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-200 shadow-sm">{c}</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-300 leading-tight">{colorItem.描述}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 不宜色 */}
        {unluckyColors.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm opacity-80">
            <h3 className="text-base font-bold mb-3 flex items-center text-red-500 dark:text-red-400">
              <IconLibrary.Icon name="close" size={18} className="mr-2" />
              今日避开颜色
            </h3>
            <div className="flex flex-wrap gap-3">
              {unluckyColors.map((colorItem, i) => (
                <div key={i} className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800/30">
                  <div className={`w-4 h-4 rounded-full ${getColorHex(colorItem.颜色系统)}`}></div>
                  <span className="text-xs text-red-800 dark:text-red-200">{colorItem.颜色系统}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 饮食养生 - 左右并列 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-bold mb-4 flex items-center text-gray-900 dark:text-white">
            <IconLibrary.Icon name="food" size={18} className="mr-2 text-orange-500" />
            饮食宜忌指南
          </h3>
          <div className="flex space-x-3">
            <div className="flex-1 bg-green-50/50 dark:bg-green-900/10 p-3 rounded-xl border border-green-100/50 dark:border-green-800/30">
              <div className="flex items-center mb-3">
                <IconLibrary.Icon name="success" size={14} className="text-green-500 mr-1.5" />
                <span className="text-xs font-bold text-green-800 dark:text-green-200">宜食清补</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedDressInfo.food_suggestions?.宜.map((f, i) => (
                  <span key={i} className="text-[11px] px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-white rounded-lg shadow-sm border border-green-50 dark:border-green-900/50">{f}</span>
                ))}
              </div>
            </div>
            <div className="flex-1 bg-red-50/50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100/50 dark:border-red-800/30">
              <div className="flex items-center mb-3">
                <IconLibrary.Icon name="error" size={14} className="text-red-500 mr-1.5" />
                <span className="text-xs font-bold text-red-800 dark:text-red-200">少食油腻</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedDressInfo.food_suggestions?.忌.map((f, i) => (
                  <span key={i} className="text-[11px] px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-white rounded-lg shadow-sm border border-red-50 dark:border-red-900/50">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 说明卡片 */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800 mb-6">
        <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-1 flex items-center">
          <IconLibrary.Icon name="info" size={14} className="mr-1.5" />
          五行穿衣逻辑
        </h4>
        <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400 leading-relaxed">
          由于天干地支形成的每日五行能量场不同，选择与当日五行「相生」或「相同」的色系，能产生正向共鸣，有助于平复心境、提升办事效率。
        </p>
      </div>
    </div>
  );
};

export default DressInfo;