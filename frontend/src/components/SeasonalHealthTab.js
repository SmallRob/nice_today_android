import React, { useState, useEffect, useMemo } from 'react';
import { getSolarTermState } from '../utils/solarTerms';
import LunarCalendar from '../utils/lunarCalendar';
import { solarTermHealthTips, seasonHealthTips, organRhythmTips, seasonGeneralTips, chineseFestivals } from '../config/healthTipsConfig';

// 时令养生标签页组件
const SeasonalHealthTab = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('season'); // 'season' 或 'organ'
  const [selectedOrganIndex, setSelectedOrganIndex] = useState(null); // 用于临时点击查看

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  // 获取节气状态
  const solarTermState = useMemo(() => {
    return getSolarTermState(currentTime);
  }, [currentTime]);

  // 获取当前节日状态（使用准确的农历计算）
  const getFestivalState = useMemo(() => {
    const solarYear = currentTime.getFullYear();
    const solarMonth = currentTime.getMonth() + 1;
    const solarDay = currentTime.getDate();

    // 简单映射公历节日日期
    const festivalMap = {
      "1-1": "元旦节",
      "2-14": "情人节",
      "3-12": "植树节",
      "4-1": "愚人节",
      "5-1": "劳动节",
      "6-1": "儿童节",
      "10-1": "国庆节",
      "12-25": "圣诞节"
    };

    // 检查今日是否为公历节日
    const dateKey = `${solarMonth}-${solarDay}`;
    const festivalName = festivalMap[dateKey];

    if (festivalName) {
      return {
        name: festivalName,
        active: true,
        diff: 0,
        date: `${solarMonth}月${solarDay}日`,
        isFestival: true
      };
    }

    // 转换为农历日期
    const lunarData = LunarCalendar.solarToLunar(solarYear, solarMonth, solarDay);

    // 基于农历日期判断传统节日
    let lunarFestival = null;
    const { lunarMonth, lunarDay } = lunarData;

    // 农历正月初一 - 春节
    if (lunarMonth === 1 && lunarDay === 1) {
      lunarFestival = chineseFestivals["春节"];
    }
    // 农历正月十五 - 元宵节
    else if (lunarMonth === 1 && lunarDay === 15) {
      lunarFestival = chineseFestivals["元宵节"];
    }
    // 农历五月初五 - 端午节
    else if (lunarMonth === 5 && lunarDay === 5) {
      lunarFestival = chineseFestivals["端午节"];
    }
    // 农历七月初七 - 七夕节
    else if (lunarMonth === 7 && lunarDay === 7) {
      lunarFestival = chineseFestivals["七夕节"];
    }
    // 农历七月十五 - 中元节
    else if (lunarMonth === 7 && lunarDay === 15) {
      lunarFestival = chineseFestivals["中元节"];
    }
    // 农历八月十五 - 中秋节
    else if (lunarMonth === 8 && lunarDay === 15) {
      lunarFestival = chineseFestivals["中秋节"];
    }
    // 农历九月初九 - 重阳节
    else if (lunarMonth === 9 && lunarDay === 9) {
      lunarFestival = chineseFestivals["重阳节"];
    }
    // 农历腊月初八 - 腊八节
    else if (lunarMonth === 12 && lunarDay === 8) {
      lunarFestival = chineseFestivals["腊八节"];
    }
    // 农历腊月三十 - 除夕（考虑有闰月的情况，取腊月最后一天）
    else if (lunarMonth === 12 && lunarDay >= 29) {
      lunarFestival = chineseFestivals["除夕"];
    }

    if (lunarFestival) {
      return {
        name: lunarFestival.name,
        active: true,
        diff: 0,
        date: lunarFestival.date,
        isFestival: true,
        festivalData: lunarFestival,
        lunarDate: `农历${lunarData.lunarMonthStr}${lunarData.lunarDayStr}`
      };
    }

    // 计算距离下一个农历节日的天数
    const nextFestivals = [
      { month: 1, day: 1, name: "春节", data: chineseFestivals["春节"] },
      { month: 1, day: 15, name: "元宵节", data: chineseFestivals["元宵节"] },
      { month: 5, day: 5, name: "端午节", data: chineseFestivals["端午节"] },
      { month: 7, day: 7, name: "七夕节", data: chineseFestivals["七夕节"] },
      { month: 7, day: 15, name: "中元节", data: chineseFestivals["中元节"] },
      { month: 8, day: 15, name: "中秋节", data: chineseFestivals["中秋节"] },
      { month: 9, day: 9, name: "重阳节", data: chineseFestivals["重阳节"] },
      { month: 12, day: 8, name: "腊八节", data: chineseFestivals["腊八节"] }
    ];

    // 找到下一个农历节日
    for (const fest of nextFestivals) {
      let festivalSolarDate;
      try {
        festivalSolarDate = LunarCalendar.lunarToSolar(solarYear, fest.month, fest.day);
      } catch (e) {
        // 如果转换失败（如腊月30可能不存在），跳过
        continue;
      }

      if (festivalSolarDate) {
        const festivalDate = new Date(festivalSolarDate.year, festivalSolarDate.month - 1, festivalSolarDate.day);
        const currentDate = new Date(solarYear, solarMonth - 1, solarDay);
        const diffDays = Math.ceil((festivalDate - currentDate) / (1000 * 60 * 60 * 24));

        if (diffDays > 0 && diffDays <= 365) {
          return {
            name: fest.name,
            active: false,
            diff: diffDays,
            date: fest.data.date,
            isFestival: true,
            festivalData: fest.data,
            lunarDate: `农历${['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'][fest.month - 1]}月${LunarCalendar.formatLunarDate({ lunarDay: fest.day, lunarDayStr: String(fest.day) })}`
          };
        }
      }
    }

    return null;
  }, [currentTime]);

  // 获取节日/节气配色
  const getEventColor = (state) => {
    if (!state) return "from-gray-500 to-gray-600";
    // 节日使用其专属配色
    if (state.isFestival && state.festivalData) {
      return state.festivalData.color || "from-red-500 to-orange-600";
    }
    // 节气使用通用高亮色
    return "from-amber-500 to-orange-600";
  };

  // 渲染节日/节气Banner
  const renderEventBanner = () => {
    // 只有当天是节日才显示节日提醒，否则都显示节气提醒/预告
    const isTodayFestival = getFestivalState?.active && getFestivalState?.diff === 0;

    let eventState;
    if (isTodayFestival) {
      // 当天是节日：显示节日提醒
      eventState = getFestivalState;
    } else {
      // 其他情况：显示节气提醒/预告
      eventState = solarTermState;
    }

    if (!eventState) return null;

    const tip = eventState.isFestival && eventState.festivalData
      ? eventState.festivalData
      : solarTermHealthTips[eventState.name] || {
          desc: "节气更替，顺时养生",
          advice: "注意起居规律，调养身心。",
          action: "保持心情舒畅。"
        };

    // 活跃状态 (前后3天)
    if (eventState.active) {
      let dayText = "";
      if (eventState.diff === 0) dayText = "今日";
      else if (eventState.diff === -1) dayText = "明日";
      else if (eventState.diff === 1) dayText = "昨日";
      else if (eventState.diff < 0) dayText = `${Math.abs(eventState.diff)}天后`;
      else dayText = `${eventState.diff}天前`;

      const isFestival = eventState.isFestival;

      return (
        <div className={`mb-4 rounded-2xl overflow-hidden shadow-md bg-white dark:bg-gray-800 border-2 ${isFestival ? 'border-red-200 dark:border-red-800' : 'border-amber-200 dark:border-amber-800'} animate-fade-in-down`}>
          <div className={`bg-gradient-to-r ${getEventColor(eventState)} p-3 text-white flex justify-between items-center`}>
            <div className="flex items-center space-x-2">
              <span className="text-xl">{isFestival && tip.emoji ? tip.emoji : "📅"}</span>
              <div className="flex flex-col">
                <span className="font-bold text-lg">{eventState.name} · {dayText}</span>
                {eventState.lunarDate && (
                  <span className="text-xs opacity-90">{eventState.lunarDate}</span>
                )}
              </div>
              {isFestival && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">节日</span>
              )}
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              {eventState.date}
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{tip.desc}</h3>
            </div>
            <div className="flex flex-col space-y-2 text-sm">
              <div className={`p-2 rounded-lg border ${isFestival
                ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
              }`}>
                <span className={`font-bold ${isFestival
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
                }`}>宜:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{tip.advice}</span>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-100 dark:border-green-800">
                <span className="font-bold text-green-600 dark:text-green-400">行:</span>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{tip.action}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 提醒状态 (下一个事件预告)
    else {
      return (
        <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-3 rounded-2xl flex justify-between items-center shadow-sm border border-blue-100 dark:border-slate-700">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">{eventState.isFestival ? "下一个节日" : "下一个节气"}</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">{eventState.name}</span>
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">
                {eventState.date}
              </span>
            </div>
            {eventState.lunarDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{eventState.lunarDate}</span>
            )}
          </div>
          <div className="flex items-center text-indigo-600 dark:text-indigo-400">
            <span className="text-xs mr-1">还有</span>
            <span className="text-xl font-bold font-mono">{Math.abs(eventState.diff)}</span>
            <span className="text-xs ml-1">天</span>
          </div>
        </div>
      );
    }
  };

  // 获取当前季节信息
  const getCurrentSeason = useMemo(() => {
    const month = currentTime.getMonth() + 1;
    const day = currentTime.getDate();

    if ((month === 2 && day >= 4) || month === 3 || month === 4 || (month === 5 && day < 5)) {
      return seasonHealthTips["春"];
    } else if ((month === 5 && day >= 5) || month === 6 || month === 7 || (month === 8 && day < 7)) {
      return seasonHealthTips["夏"];
    } else if ((month === 8 && day >= 7) || (month === 9 && day < 7)) {
      return seasonHealthTips["长夏"];
    } else if ((month === 9 && day >= 7) || month === 10 || (month === 11 && day < 7)) {
      return seasonHealthTips["秋"];
    } else {
      return seasonHealthTips["冬"];
    }
  }, [currentTime]);

  // 获取当前器官节律信息
  const getCurrentOrganInfo = useMemo(() => {
    const hour = currentTime.getHours();
    // 修正器官节律计算逻辑
    let index;
    if (hour >= 1 && hour < 3) index = 0;  // 01:00-03:00
    else if (hour >= 3 && hour < 5) index = 1;  // 03:00-05:00
    else if (hour >= 5 && hour < 7) index = 2;  // 05:00-07:00
    else if (hour >= 7 && hour < 9) index = 3;  // 07:00-09:00
    else if (hour >= 9 && hour < 11) index = 4;  // 09:00-11:00
    else if (hour >= 11 && hour < 13) index = 5;  // 11:00-13:00
    else if (hour >= 13 && hour < 15) index = 6;  // 13:00-15:00
    else if (hour >= 15 && hour < 17) index = 7;  // 15:00-17:00
    else if (hour >= 17 && hour < 19) index = 8;  // 17:00-19:00
    else if (hour >= 19 && hour < 21) index = 9;  // 19:00-21:00
    else if (hour >= 21 && hour < 23) index = 10; // 21:00-23:00
    else index = 11; // 23:00-01:00

    return {
      time: organRhythmTips.organTimes[index],
      organ: organRhythmTips.organs[index],
      description: organRhythmTips.organDescriptions[organRhythmTips.organs[index]] || "",
      suggestion: organRhythmTips.organSuggestions[organRhythmTips.organs[index]] || "",
      healthTip: organRhythmTips.organHealthTips[organRhythmTips.organs[index]] || ""
    };
  }, [currentTime]);

  // 获取选定的器官节律信息（用于临时查看）
  const getSelectedOrganInfo = useMemo(() => {
    if (selectedOrganIndex === null) return null;

    return {
      time: organRhythmTips.organTimes[selectedOrganIndex],
      organ: organRhythmTips.organs[selectedOrganIndex],
      description: organRhythmTips.organDescriptions[organRhythmTips.organs[selectedOrganIndex]] || "",
      suggestion: organRhythmTips.organSuggestions[organRhythmTips.organs[selectedOrganIndex]] || "",
      healthTip: organRhythmTips.organHealthTips[organRhythmTips.organs[selectedOrganIndex]] || ""
    };
  }, [selectedOrganIndex]);

  // 季节颜色映射 - 增强暗黑模式对比度
  const seasonColors = {
    "春": { bg: "bg-green-50 dark:bg-green-950/40", border: "border-green-200 dark:border-green-800", text: "text-green-800 dark:text-green-50" },
    "夏": { bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-800", text: "text-red-800 dark:text-red-50" },
    "长夏": { bg: "bg-yellow-50 dark:bg-yellow-950/40", border: "border-yellow-200 dark:border-yellow-800", text: "text-yellow-800 dark:text-yellow-50" },
    "秋": { bg: "bg-gray-50 dark:bg-slate-900/40", border: "border-gray-200 dark:border-slate-800", text: "text-gray-800 dark:text-gray-50" },
    "冬": { bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-800", text: "text-blue-800 dark:text-blue-50" }
  };

  // 五行颜色映射
  const elementColors = {
    "木": "bg-green-500",
    "火": "bg-red-500",
    "土": "bg-yellow-500",
    "金": "bg-slate-400",
    "水": "bg-blue-500"
  };

  return (
    <div className="space-y-4 performance-optimized pb-8 shadow-inner">
      {/* 页面标题 - 移动端优化 */}
      <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-2xl p-4 shadow-lg dark:from-teal-800 dark:to-green-900">
        <h2 className="text-lg md:text-xl font-bold mb-1">时令养生指南</h2>
        <p className="text-teal-100 text-xs md:text-sm dark:text-teal-200 opacity-90">
          五行相应·天人合一·顺时守中
        </p>
      </div>

      {/* 24节气/节日提醒Banner */}
      {renderEventBanner()}

      {/* 标签切换 - 移动端优化 */}

      {/* 标签切换 - 移动端优化 */}
      <div className="flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 p-1">
        <button
          onClick={() => setActiveTab('season')}
          className={`flex-1 py-3 px-4 text-center rounded-xl transition-all duration-300 touch-manipulation ${activeTab === 'season'
            ? 'bg-teal-500 text-white shadow-md font-bold'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
        >
          <span className="text-sm md:text-base">四季养生</span>
        </button>
        <button
          onClick={() => setActiveTab('organ')}
          className={`flex-1 py-3 px-4 text-center rounded-xl transition-all duration-300 touch-manipulation ${activeTab === 'organ'
            ? 'bg-purple-500 text-white shadow-md font-bold'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
        >
          <span className="text-sm md:text-base">器官节律</span>
        </button>
      </div>

      {/* 四季养生内容 */}
      {activeTab === 'season' && (
        <div className="space-y-6">
          {/* 当前季节信息卡片 */}
          <div className={`${seasonColors[getCurrentSeason.name].bg} ${seasonColors[getCurrentSeason.name].border} border-l-4 border-teal-500 dark:border-teal-400 rounded-2xl p-5 shadow-sm border`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${seasonColors[getCurrentSeason.name].text} flex items-center`}>
                <span className={`w-3 h-3 ${elementColors[getCurrentSeason.element]} rounded-full mr-2 shadow-sm`}></span>
                {getCurrentSeason.name}季指南
              </h3>
              <span className="px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-xs font-bold text-teal-700 dark:text-teal-200 backdrop-blur-sm shadow-sm">
                {getCurrentSeason.element}行能量
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/30 dark:bg-black/10 p-3 rounded-xl">
                <h4 className="text-xs font-bold opacity-70 mb-1 dark:text-gray-400">特点</h4>
                <p className="text-sm leading-relaxed dark:text-white">{getCurrentSeason.characteristics}</p>
              </div>
              <div className="bg-white/30 dark:bg-black/10 p-3 rounded-xl">
                <h4 className="text-xs font-bold opacity-70 mb-1">主令脏腑</h4>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{getCurrentSeason.organs}</p>
              </div>
              <div className="bg-teal-500/10 dark:bg-teal-400/10 p-4 rounded-xl border border-teal-500/20">
                <h4 className="text-sm font-bold mb-2 flex items-center">
                  <span className="mr-2">🌱</span>养生建议
                </h4>
                <div className="space-y-2">
                  {getCurrentSeason.advice.split('\n').map((line, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-teal-500 mr-2 mt-1">•</span>
                      <span className="text-sm opacity-90 dark:text-white">{line.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 通用养生贴士 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="text-base font-bold mb-3">养生要领</h4>
            <div className="grid grid-cols-1 gap-2">
              {seasonGeneralTips.map((tip, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span className="text-lg">✨</span>
                  <span className="text-sm font-medium dark:text-white">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 器官节律内容 */}
      {activeTab === 'organ' && (
        <div className="space-y-6">
          {/* 当前/选择的器官信息 */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 rounded-2xl p-5 shadow-sm border border-purple-100 dark:border-purple-800">
            {/* 标题和时间标签 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200 flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full mr-2 shadow-sm"></span>
                {selectedOrganIndex !== null ? '节律详情' : '当前节律'}
              </h3>
              <span className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-xs font-bold text-purple-700 dark:text-purple-200 shadow-sm">
                {(selectedOrganIndex !== null ? getSelectedOrganInfo : getCurrentOrganInfo).time}
              </span>
            </div>

            {/* 活跃脏腑 */}
            <div className="flex items-center justify-between mb-4 bg-white/40 dark:bg-black/20 p-3 rounded-xl">
              <span className="text-sm opacity-70">活跃脏腑:</span>
              <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-serif">
                {(selectedOrganIndex !== null ? getSelectedOrganInfo : getCurrentOrganInfo).organ}
              </span>
            </div>

            {/* 能量流转说明 */}
            <div className="bg-purple-500/5 p-3 rounded-xl mb-4">
              <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-1">能量流转</h4>
              <p className="text-sm leading-relaxed dark:text-gray-200">{(selectedOrganIndex !== null ? getSelectedOrganInfo : getCurrentOrganInfo).description}</p>
            </div>

            {/* 建议行为 */}
            <div className="bg-purple-500/5 p-3 rounded-xl mb-4">
              <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-1">建议行为</h4>
              <p className="text-sm leading-relaxed dark:text-gray-200">{(selectedOrganIndex !== null ? getSelectedOrganInfo : getCurrentOrganInfo).suggestion}</p>
            </div>

            {/* 养生秘诀 */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl shadow-md">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">💡</span>
                <p className="text-xs font-bold opacity-80">养生秘诀</p>
              </div>
              <p className="text-sm font-medium leading-relaxed">{(selectedOrganIndex !== null ? getSelectedOrganInfo : getCurrentOrganInfo).healthTip}</p>
            </div>

            {/* 返回按钮 */}
            {selectedOrganIndex !== null && (
              <button
                onClick={() => setSelectedOrganIndex(null)}
                className="w-full mt-4 py-2.5 text-xs text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
              >
                ← 返回当前时间
              </button>
            )}
          </div>

          {/* 24小时表格 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-bold mb-4">子午流注·十二时辰</h3>
            <div className="grid grid-cols-3 gap-2">
              {organRhythmTips.organTimes.map((time, index) => {
                const isCurrent = getCurrentOrganInfo.organ === organRhythmTips.organs[index];
                const isSelected = selectedOrganIndex === index;
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedOrganIndex(index)}
                    className={`p-3 rounded-xl text-center transition-all duration-300 cursor-pointer border ${isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-lg scale-105 z-10'
                      : isCurrent
                        ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 ring-2 ring-purple-500/50'
                        : 'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-600 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                  >
                    <div className="text-[10px] font-medium opacity-60 truncate">{time}</div>
                    <div className={`text-xs font-black ${isSelected ? 'text-white' : 'dark:text-white'}`}>{organRhythmTips.organs[index]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 底部温馨提示 */}
      <div className="bg-amber-400 dark:bg-amber-600 text-amber-950 dark:text-amber-50 rounded-2xl p-4 shadow-md flex items-start space-x-3">
        <span className="text-2xl mt-1">💡</span>
        <div>
          <h4 className="text-sm font-bold mb-1">天理养生</h4>
          <p className="text-xs opacity-90 leading-tight">
            顺天应时，动静结合。养生不仅是身体的调理，更是心性的修养。
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeasonalHealthTab;