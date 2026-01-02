import React, { useState, useEffect, useMemo } from 'react';
import { getSolarTermState } from '../../utils/solarTerms';
import LunarCalendar from '../../utils/lunarCalendar';
import { solarTermHealthTips, chineseFestivals } from '../../config/healthTipsConfig';
import './FestivalCard.css';

/**
 * 节日节气卡片组件
 * 显示当前节日/节气信息，适配多种节日主题
 */
const FestivalCard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  // 扩展的节日配置
  const extendedFestivals = {
    // 中国传统节日
    "春节": { emoji: "🧧", color: "from-red-600 to-red-800", date: "农历正月初一", desc: "万象更新，岁启华章", advice: "合家团圆，守岁迎新，共享天伦之乐", action: "贴春联，放鞭炮，辞旧迎新" },
    "元宵节": { emoji: "🏮", color: "from-yellow-500 to-amber-600", date: "农历正月十五" },
    "端午节": { emoji: "🎏", color: "from-green-500 to-teal-600", date: "农历五月初五" },
    "七夕节": { emoji: "💝", color: "from-pink-500 to-purple-600", date: "农历七月初七" },
    "中元节": { emoji: "🕯️", color: "from-gray-500 to-blue-600", date: "农历七月十五" },
    "中秋节": { emoji: "🌕", color: "from-yellow-400 to-orange-500", date: "农历八月十五" },
    "重阳节": { emoji: "🍂", color: "from-orange-500 to-red-600", date: "农历九月初九" },
    "腊八节": { emoji: "🍲", color: "from-amber-500 to-yellow-600", date: "农历腊月初八" },
    "除夕": { emoji: "🎆", color: "from-red-700 to-red-900", date: "农历腊月最后一天", desc: "除旧布新，阖家守岁", advice: "阖家围炉团聚，共享丰盛年夜饭", action: "辞旧灵鸡歌日丽，迎新瑞犬报年丰" },

    // 国际节日
    "元旦节": { emoji: "🎉", color: "from-red-500 to-red-700", date: "1月1日", desc: "元启新程，旦旦有福", advice: "总结过去，展望未来，设定新一年的目标", action: "焕然一新，迎接新年第一缕阳光" },
    "元旦前夜": { emoji: "🎆", color: "from-red-500 to-yellow-500", date: "12月31日", desc: "辞旧迎新，展望未来", advice: "整理旧年回忆，规划新年目标", action: "准备跨年庆祝，迎接新年开始" },
    "情人节": { emoji: "💖", color: "from-pink-400 to-red-500", date: "2月14日" },
    "植树节": { emoji: "🌳", color: "from-green-400 to-emerald-600", date: "3月12日" },
    "愚人节": { emoji: "🤪", color: "from-yellow-400 to-orange-400", date: "4月1日" },
    "劳动节": { emoji: "🔧", color: "from-red-400 to-orange-500", date: "5月1日" },
    "儿童节": { emoji: "🧒", color: "from-yellow-300 to-pink-400", date: "6月1日" },
    "国庆节": { emoji: "🇨🇳", color: "from-red-500 to-yellow-500", date: "10月1日" },
    "圣诞节": { emoji: "🎄", color: "from-green-500 to-red-500", date: "12月25日" },
    "圣诞前夜": { emoji: "🎅", color: "from-green-500 to-red-500", date: "12月24日", desc: "平安夜快乐，温暖祥和", advice: "与亲友共度温馨时光，传递爱与祝福", action: "准备圣诞礼物，装饰圣诞树" },

    // 新增节日
    "母亲节": { emoji: "👩", color: "from-pink-300 to-purple-400", date: "5月第二个星期日" },
    "父亲节": { emoji: "👨", color: "from-blue-300 to-cyan-400", date: "6月第三个星期日" },
    "万圣节": { emoji: "🎃", color: "from-orange-500 to-purple-500", date: "10月31日" },
    "感恩节": { emoji: "🦃", color: "from-brown-500 to-orange-500", date: "11月第四个星期四" },
  };

  // 计算节日倒计时
  const calculateFestivalCountdown = (festivalDate) => {
    const now = currentTime;
    const festivalDateTime = new Date(festivalDate);
    const diffMs = festivalDateTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      diffMs,
      diffHours,
      diffMinutes,
      isWithin3Hours: diffMs > 0 && diffMs <= 3 * 60 * 60 * 1000, // 3小时内
      isToday: festivalDateTime.toDateString() === now.toDateString()
    };
  };

  // 获取节日状态
  const getFestivalState = useMemo(() => {
    const now = currentTime;
    const solarYear = currentTime.getFullYear();
    const solarMonth = currentTime.getMonth() + 1;
    const solarDay = currentTime.getDate();
    const solarHour = currentTime.getHours();
    const solarMinute = currentTime.getMinutes();

    // 检查公历节日
    const solarFestivals = {
      "1-1": "元旦节",
      "2-14": "情人节",
      "3-12": "植树节",
      "4-1": "愚人节",
      "5-1": "劳动节",
      "6-1": "儿童节",
      "10-1": "国庆节",
      "12-24": "圣诞前夜",
      "12-25": "圣诞节",
      "12-31": "元旦前夜",
      "10-31": "万圣节",
    };

    // 特殊节日计算（母亲节、父亲节、感恩节）
    const specialFestivals = {
      "母亲节": getMotherDay(solarYear),
      "父亲节": getFatherDay(solarYear),
      "感恩节": getThanksgivingDay(solarYear)
    };

    // 检查特殊节日
    for (const [festivalName, festivalDate] of Object.entries(specialFestivals)) {
      if (festivalDate.getMonth() + 1 === solarMonth && festivalDate.getDate() === solarDay) {
        const countdown = calculateFestivalCountdown(festivalDate);
        return {
          name: festivalName,
          active: true,
          diff: countdown.diffHours * 60 + countdown.diffMinutes,
          date: `${solarMonth}月${solarDay}日`,
          isFestival: true,
          isCountdown: countdown.isWithin3Hours,
          countdownHours: countdown.diffHours,
          countdownMinutes: countdown.diffMinutes,
          festivalData: extendedFestivals[festivalName]
        };
      }
    }

    // 检查公历节日
    const dateKey = `${solarMonth}-${solarDay}`;
    const festivalName = solarFestivals[dateKey];
    if (festivalName) {
      // 创建节日的完整日期对象
      const festivalDate = new Date(solarYear, solarMonth - 1, solarDay, 0, 0, 0);
      const countdown = calculateFestivalCountdown(festivalDate);
      
      return {
        name: festivalName,
        active: true,
        diff: countdown.diffHours * 60 + countdown.diffMinutes,
        date: `${solarMonth}月${solarDay}日`,
        isFestival: true,
        isCountdown: countdown.isWithin3Hours,
        countdownHours: countdown.diffHours,
        countdownMinutes: countdown.diffMinutes,
        festivalData: extendedFestivals[festivalName]
      };
    }

    // 检查未来3小时内即将到来的节日
    for (const [dateKey, festivalName] of Object.entries(solarFestivals)) {
      const [month, day] = dateKey.split('-').map(Number);
      let festivalDate = new Date(solarYear, month - 1, day, 0, 0, 0);
      
      // 如果节日已经过了 this year, check next year
      if (festivalDate < now) {
        festivalDate = new Date(solarYear + 1, month - 1, day, 0, 0, 0);
      }
      
      const countdown = calculateFestivalCountdown(festivalDate);
      if (countdown.isWithin3Hours) {
        return {
          name: festivalName,
          active: true,
          diff: countdown.diffHours * 60 + countdown.diffMinutes,
          date: `${festivalDate.getMonth() + 1}月${festivalDate.getDate()}日`,
          isFestival: true,
          isCountdown: true,
          countdownHours: countdown.diffHours,
          countdownMinutes: countdown.diffMinutes,
          festivalData: extendedFestivals[festivalName]
        };
      }
    }

    // 检查特殊节日（未来3小时内）
    for (const [festivalName, originalFestivalDate] of Object.entries(specialFestivals)) {
      let festivalDate = new Date(originalFestivalDate);
      festivalDate.setHours(0, 0, 0, 0); // 重置时间为午夜
      
      // 如果节日已经过了 this year, check next year
      if (festivalDate < now) {
        const nextYear = solarYear + 1;
        let nextFestivalDate;
        switch(festivalName) {
          case "母亲节":
            nextFestivalDate = getMotherDay(nextYear);
            break;
          case "父亲节":
            nextFestivalDate = getFatherDay(nextYear);
            break;
          case "感恩节":
            nextFestivalDate = getThanksgivingDay(nextYear);
            break;
          default:
            nextFestivalDate = originalFestivalDate;
        }
        festivalDate = new Date(nextFestivalDate);
        festivalDate.setHours(0, 0, 0, 0);
      }
      
      const countdown = calculateFestivalCountdown(festivalDate);
      if (countdown.isWithin3Hours) {
        return {
          name: festivalName,
          active: true,
          diff: countdown.diffHours * 60 + countdown.diffMinutes,
          date: `${festivalDate.getMonth() + 1}月${festivalDate.getDate()}日`,
          isFestival: true,
          isCountdown: true,
          countdownHours: countdown.diffHours,
          countdownMinutes: countdown.diffMinutes,
          festivalData: extendedFestivals[festivalName]
        };
      }
    }

    // 转换为农历日期
    const lunarData = LunarCalendar.solarToLunar(solarYear, solarMonth, solarDay);
    const { lunarMonth, lunarDay } = lunarData;

    // 农历节日映射
    const lunarFestivalMap = {
      "1-1": "春节",
      "1-15": "元宵节",
      "5-5": "端午节",
      "7-7": "七夕节",
      "7-15": "中元节",
      "8-15": "中秋节",
      "9-9": "重阳节",
      "12-8": "腊八节",
    };

    // 除夕特殊处理
    if (lunarMonth === 12 && lunarDay >= 29) {
      const lunarDate = LunarCalendar.lunarToSolar(solarYear, lunarMonth, lunarDay);
      const festivalDate = new Date(lunarDate.solarYear, lunarDate.solarMonth - 1, lunarDate.solarDay, 0, 0, 0);
      const countdown = calculateFestivalCountdown(festivalDate);
      
      return {
        name: "除夕",
        active: true,
        diff: countdown.diffHours * 60 + countdown.diffMinutes,
        date: "农历腊月最后一天",
        isFestival: true,
        isCountdown: countdown.isWithin3Hours,
        countdownHours: countdown.diffHours,
        countdownMinutes: countdown.diffMinutes,
        festivalData: extendedFestivals["除夕"],
        lunarDate: `农历${lunarData.lunarMonthStr}${lunarData.lunarDayStr}`
      };
    }

    // 检查其他农历节日
    const lunarKey = `${lunarMonth}-${lunarDay}`;
    const lunarFestival = lunarFestivalMap[lunarKey];
    if (lunarFestival) {
      const lunarDate = LunarCalendar.lunarToSolar(solarYear, lunarMonth, lunarDay);
      const festivalDate = new Date(lunarDate.solarYear, lunarDate.solarMonth - 1, lunarDate.solarDay, 0, 0, 0);
      const countdown = calculateFestivalCountdown(festivalDate);
      
      return {
        name: lunarFestival,
        active: true,
        diff: countdown.diffHours * 60 + countdown.diffMinutes,
        date: extendedFestivals[lunarFestival]?.date || "",
        isFestival: true,
        isCountdown: countdown.isWithin3Hours,
        countdownHours: countdown.diffHours,
        countdownMinutes: countdown.diffMinutes,
        festivalData: extendedFestivals[lunarFestival],
        lunarDate: `农历${lunarData.lunarMonthStr}${lunarData.lunarDayStr}`
      };
    }

    return null;
  }, [currentTime]);

  // 获取节气状态
  const solarTermState = useMemo(() => {
    return getSolarTermState(currentTime);
  }, [currentTime]);

  // 获取当前事件状态（优先显示节日）
  const currentEvent = getFestivalState || solarTermState;

  // 是否是新年类节日（元旦、春节、除夕、元旦前夜）
  const isNewYear = useMemo(() => {
    return currentEvent && ["元旦节", "春节", "除夕", "元旦前夜"].includes(currentEvent.name);
  }, [currentEvent]);

  if (!currentEvent || (currentEvent.diff !== 0 && !currentEvent.isCountdown)) {
    return null;
  }

  const isFestival = currentEvent.isFestival;
  const festivalData = currentEvent.festivalData;

  const tip = isFestival && festivalData && !currentEvent.isCountdown
    ? {
      ... (extendedFestivals[currentEvent.name] || { emoji: "🎉", desc: "节日快乐", advice: "享受节日时光", action: "与家人朋友团聚" }),
      ...festivalData // 优先使用 festivalData 中的动态数据
    }
    : solarTermHealthTips[currentEvent.name] || { desc: "节气更替，顺时养生", advice: "注意起居规律，调养身心。", action: "保持心情舒畅。" };

  return (
    <div className={`festival-card-newyear rounded-2xl overflow-hidden shadow-lg border-2 ${isNewYear
      ? 'new-year-red-theme border-yellow-400'
      : (isFestival ? 'border-red-200 dark:border-red-800' : 'border-amber-200 dark:border-amber-800')
      } animate-fade-in-down`}>

      {/* 新年装饰组件 */}
      {isNewYear && (
        <>
          <div className="firework-container">
            <div className="firework"></div>
            <div className="firework"></div>
            <div className="firework"></div>
            <div className="firework"></div>
          </div>
          <div className="lantern-decoration lantern-left">
            <div className="lantern-body"></div>
            <div className="lantern-tassel"></div>
          </div>
          <div className="lantern-decoration lantern-right">
            <div className="lantern-body"></div>
            <div className="lantern-tassel"></div>
          </div>
          <div className="cloud-decoration"></div>
        </>
      )}

      <div className={`bg-gradient-to-r ${isFestival
        ? (festivalData?.color || "from-red-500 to-orange-600")
        : "from-amber-500 to-orange-600"
        } p-3 text-white relative z-10`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{isFestival ? (festivalData?.emoji || "🎉") : "📅"}</span>
            <div>
              <span className={`font-bold text-sm ${isNewYear ? 'new-year-glow-text' : ''}`}>
                {currentEvent.name === "圣诞前夜" ? "平安夜" : 
                 currentEvent.name === "元旦前夜" ? "跨年夜" : currentEvent.name}
              </span>
              {currentEvent.lunarDate && (
                <span className="text-xs opacity-90 block">{currentEvent.lunarDate}</span>
              )}
              {/* 显示倒计时信息 */}
              {currentEvent.isCountdown && (
                <span className="text-xs opacity-90 block">
                  距离节日还有 {currentEvent.countdownHours}小时{currentEvent.countdownMinutes}分钟
                </span>
              )}
            </div>
          </div>
          {isFestival && (
            <span className={`text-xs ${isNewYear ? 'bg-yellow-400/30 text-yellow-100' : 'bg-white/20 text-white'} px-2 py-1 rounded-full backdrop-blur-sm`}>
              {currentEvent.isCountdown ? '倒计时' : '节日'}
            </span>
          )}
        </div>
      </div>

      <div className={`${isNewYear ? 'bg-red-800/20 dark:bg-black/40' : 'bg-white dark:bg-gray-800'} p-3 relative z-10`}>
        <div className="text-center mb-2">
          <h3 className={`text-sm font-bold ${isNewYear ? 'text-yellow-100' : 'text-gray-800 dark:text-white'}`}>
            {currentEvent.isCountdown 
              ? currentEvent.name === "圣诞前夜" 
                ? "平安夜快乐！" 
                : currentEvent.name === "元旦前夜" 
                  ? `迎${currentTime.getFullYear() + 1}新年！` 
                  : `即将迎来${currentEvent.name}！`
              : tip.desc}
          </h3>
        </div>
        <div className="text-xs space-y-1">
          <div className={`p-2 rounded-lg ${isNewYear
            ? 'bg-red-900/40 text-yellow-100/90 border border-yellow-500/30'
            : (isFestival ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400')
            }`}>
            <span className={`font-bold ${isNewYear ? 'text-yellow-400' : ''}`}>宜:</span> {
              currentEvent.isCountdown 
                ? currentEvent.name === "圣诞前夜" 
                  ? "与亲友共度温馨时光，传递爱与祝福" 
                  : currentEvent.name === "元旦前夜" 
                    ? "整理旧年回忆，规划新年目标" 
                    : '准备庆祝，期待节日到来'
                : tip.advice
            }
          </div>
          <div className={`p-2 rounded-lg ${isNewYear
            ? 'bg-orange-900/40 text-yellow-100/90 border border-yellow-500/30'
            : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            }`}>
            <span className={`font-bold ${isNewYear ? 'text-yellow-400' : ''}`}>行:</span> {
              currentEvent.isCountdown 
                ? currentEvent.name === "圣诞前夜" 
                  ? "准备圣诞礼物，装饰圣诞树" 
                  : currentEvent.name === "元旦前夜" 
                    ? "准备跨年庆祝，迎接新年开始" 
                    : '提前准备节日用品，安排庆祝活动'
                : tip.action
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// 辅助函数：计算母亲节（5月第二个星期日）
function getMotherDay(year) {
  const firstDay = new Date(year, 4, 1); // 5月1日
  const firstSunday = new Date(firstDay);
  firstSunday.setDate(1 + (7 - firstDay.getDay()) % 7);
  const motherDay = new Date(firstSunday);
  motherDay.setDate(firstSunday.getDate() + 7); // 第二个星期日
  return motherDay;
}

// 辅助函数：计算父亲节（6月第三个星期日）
function getFatherDay(year) {
  const firstDay = new Date(year, 5, 1); // 6月1日
  const firstSunday = new Date(firstDay);
  firstSunday.setDate(1 + (7 - firstDay.getDay()) % 7);
  const fatherDay = new Date(firstSunday);
  fatherDay.setDate(firstSunday.getDate() + 14); // 第三个星期日
  return fatherDay;
}

// 辅助函数：计算感恩节（11月第四个星期四）
function getThanksgivingDay(year) {
  const firstDay = new Date(year, 10, 1); // 11月1日
  const firstThursday = new Date(firstDay);
  firstThursday.setDate(1 + (4 - firstDay.getDay() + 7) % 7);
  const thanksgivingDay = new Date(firstThursday);
  thanksgivingDay.setDate(firstThursday.getDate() + 21); // 第四个星期四
  return thanksgivingDay;
}

export default FestivalCard;