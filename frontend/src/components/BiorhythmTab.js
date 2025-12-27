import { useState, useEffect, useCallback, useMemo } from 'react';
import BiorhythmChart from './BiorhythmChart';
import { getBiorhythmRange } from '../services/localDataService';
import elementConfig from '../config/elementConfig.json';
import { initDataMigration } from '../utils/dataMigration';
import { useCurrentConfig } from '../contexts/UserConfigContext';

// 导入优化后的子组件
import BiorhythmBanner from './biorhythm/BiorhythmBanner';
import UserInfoCard from './biorhythm/UserInfoCard';
import DailySummaryCard from './biorhythm/DailySummaryCard';
import MindfulnessActivities from './biorhythm/MindfulnessActivities';

import '../styles/dashboard-layout.css';
import '../styles/mobile-optimization.css';

// 每日正念活动数据 - 优化为正能量导向
const MINDFULNESS_ACTIVITIES = [
  { id: 1, title: "10分钟正念冥想", description: "专注呼吸，感受当下，平静思绪", energy: "medium", duration: "10分钟", type: "all", icon: "🧘", positive: "提升专注力，缓解压力" },
  { id: 2, title: "感恩三件事", description: "写下今天最感恩的三件事", energy: "low", duration: "3分钟", type: "emotional", icon: "🙏", positive: "培养积极心态，提升幸福感" },
  { id: 3, title: "晨间伸展", description: "简单的全身拉伸唤醒身体", energy: "medium", duration: "8分钟", type: "physical", icon: "🌅", positive: "促进血液循环，唤醒身体" },
  { id: 4, title: "深呼吸练习", description: "4-7-8呼吸法，放松身心", energy: "low", duration: "5分钟", type: "all", icon: "🌬️", positive: "降低焦虑，改善睡眠质量" },
  { id: 5, title: "欣赏美景", description: "观察身边的美，拍照或记录", energy: "low", duration: "10分钟", type: "emotional", icon: "🌸", positive: "发现美好，提升情绪" },
  { id: 6, title: "积极肯定语", description: "对自己说三句积极的话", energy: "low", duration: "2分钟", type: "emotional", icon: "✨", positive: "增强自信，改善自我认知" },
  { id: 7, title: "喝一杯温水", description: "清晨喝温水，滋养身体", energy: "low", duration: "1分钟", type: "all", icon: "💧", positive: "促进新陈代谢，温暖身体" },
  { id: 8, title: "听治愈音乐", description: "选择一首让人平静的音乐", energy: "low", duration: "5分钟", type: "emotional", icon: "🎵", positive: "舒缓情绪，改善心情" },
  { id: 9, title: "整理桌面", description: "整理工作或学习区域", energy: "low", duration: "10分钟", type: "all", icon: "📚", positive: "提升专注，减少干扰" },
  { id: 10, title: "微笑练习", description: "对着镜子真诚微笑1分钟", energy: "low", duration: "2分钟", type: "emotional", icon: "😊", positive: "提升积极情绪，改善心情" },
  { id: 11, title: "感恩联系", description: "给一位朋友或家人发感谢信息", energy: "low", duration: "3分钟", type: "emotional", icon: "💕", positive: "增强人际关系，提升幸福感" },
  { id: 12, title: "自然连接", description: "走到户外，呼吸新鲜空气", energy: "medium", duration: "10分钟", type: "physical", icon: "🌿", positive: "提升能量，改善心情" }
];

// 动态暖心提示库
const DAILY_TIPS = {
  // 早晨提示 (6:00-11:00)
  morning: {
    goodPhysical: [
      "美好的早晨！喝一杯温水开启活力满满的一天吧！",
      "清晨阳光正好，趁着体力充沛，快起来伸展一下身体！",
      "早安！今天的体力状态不错，适合晨练或快走哦！"
    ],
    moderatePhysical: [
      "早起的鸟儿有虫吃，喝杯热牛奶暖暖身体，慢慢来。",
      "早上好！先做几个简单的伸展动作，唤醒身体吧！",
      "美好的早晨开始了，深呼吸几次，感受今天的到来！"
    ],
    lowPhysical: [
      "早安~ 今天身体可能有点累，多给自己一点时间苏醒吧。",
      "早起的身体还在休息呢，喝杯温水，慢慢开始新的一天。",
      "早上好！不妨先赖个床，等身体准备好了再起来也没关系。"
    ],
    goodEmotional: [
      "清晨的好心情！今天是个美好的开始，保持这份愉悦吧！",
      "早安！心情不错呢，可以哼首歌给自己听！",
      "美好的早晨从好心情开始，今天会有好事发生哦！"
    ],
    moderateEmotional: [
      "早安！新的一天，给自己一个微笑吧！",
      "早晨的时光很珍贵，不妨深呼吸，感受当下！",
      "早上好！今天也可以成为不错的一天，相信自己！"
    ],
    lowEmotional: [
      "早安~ 今天可能有点低落，没关系，允许自己慢慢来。",
      "早上好！情绪低落时，喝杯热饮，抱抱自己吧。",
      "新的一天开始了，给自己一点耐心，一切都会好起来的。"
    ],
    goodIntellectual: [
      "清晨思维清晰！适合安排一些需要专注的工作哦！",
      "早安！头脑清醒的状态下，可以规划一下今天的目标！",
      "美好的早晨，脑子特别清楚，是个学习的好时机！"
    ],
    moderateIntellectual: [
      "早安！先理一理今天的待办事项吧！",
      "早上好！用几分钟思考一下今天要完成的任务！",
      "新的一天开始了，写下今天的小目标吧！"
    ],
    lowIntellectual: [
      "早安~ 今天思维可能有点迟钝，先做一些简单的事情吧！",
      "早上好！思考累的时候，不妨先做些机械性的工作！",
      "早安，今天可能不太适合做复杂的决策，保持简单就好。"
    ]
  },
  // 中午提示 (11:00-14:00)
  noon: {
    goodPhysical: [
      "午饭时间到了！吃饱后可以散散步，保持充沛精力！",
      "午休时间，体力不错的话可以做个小运动！",
      "中午了！利用午休时间活动活动身体吧！"
    ],
    moderatePhysical: [
      "午饭过后散散步，适当休息保存精力才有动力工作。",
      "中午啦！吃顿营养的午餐，给身体补充能量吧！",
      "午休时间到了，短暂休息一下，下午继续加油！"
    ],
    lowPhysical: [
      "中午了，身体有点累吧？午休时小睡一会儿吧！",
      "午饭时间，先让自己好好休息一下，别勉强！",
      "中午啦！今天有点辛苦，午休时好好充电！"
    ],
    goodEmotional: [
      "午间好！心情不错的话，和同事朋友聊聊吧！",
      "中午了！趁着心情好，和身边人分享快乐吧！",
      "午饭时光愉快！保持这份好心情到下午！"
    ],
    moderateEmotional: [
      "午休时间到了，放空一下，调整情绪吧！",
      "中午啦！给自己一点喘息的空间！",
      "午间小憩，让心情放松一下！"
    ],
    lowEmotional: [
      "午休时间到了，偶尔摆烂一下也挺好，不要被他人评价左右。",
      "中午啦！情绪不好时，找个人聊聊或者自己静静！",
      "午休时间，给自己一个独处的空间，整理一下心情！"
    ],
    goodIntellectual: [
      "午饭时光，思维清晰！可以规划下午的工作！",
      "中午了！趁着头脑清醒，整理一下下午的安排！",
      "午休时间！思考一下今天还没完成的事项！"
    ],
    moderateIntellectual: [
      "中午啦！整理一下上午的思路，准备下午的工作！",
      "午休时，简单回顾一下上午的内容！",
      "中午了，给大脑也放个假吧！"
    ],
    lowIntellectual: [
      "中午了！思考累的时候，就休息一下吧！",
      "午休时间到了，别让大脑过度劳累！",
      "午饭时间！今天不适合高强度思考，轻松一点吧！"
    ]
  },
  // 下午提示 (14:00-18:00)
  afternoon: {
    goodPhysical: [
      "下午好！体力充沛，可以处理一些需要体力的任务！",
      "下午时光！状态不错，动起来吧！",
      "下午好！趁着精力充足，完成一些体力活吧！"
    ],
    moderatePhysical: [
      "下午了！适当休息保存精力才有动力工作。",
      "下午好！累了就站起来活动一下！",
      "下午时光，注意节奏，别让自己太累！"
    ],
    lowPhysical: [
      "下午啦！今天挺辛苦的，注意休息哦！",
      "下午好！身体有点累，不如做点轻松的事！",
      "下午了！可以适当放慢节奏，照顾好自己！"
    ],
    goodEmotional: [
      "下午好！心情不错，可以和朋友同事聊聊天！",
      "下午时光！保持这份好心情！",
      "下午好！趁着心情好，完成一些愉快的任务吧！"
    ],
    moderateEmotional: [
      "下午了！累了就休息一下，调整心情！",
      "下午好！保持平和的心态！",
      "下午时光，给自己一些放松的时间！"
    ],
    lowEmotional: [
      "下午啦！情绪不好时，允许自己暂停一下，没关系。",
      "下午好！偶尔摆烂一下也挺好，不要被他人评价左右。",
      "下午了！心情不好就找点让自己开心的事情做！"
    ],
    goodIntellectual: [
      "下午好！思维清晰，是处理复杂任务的好时机！",
      "下午时光！头脑清醒，抓紧时间工作吧！",
      "下午好！趁着思维活跃，完成重要的工作吧！"
    ],
    moderateIntellectual: [
      "下午了！整理一下今天的工作进度吧！",
      "下午好！合理安排时间，提高效率！",
      "下午时光！给大脑一些挑战！"
    ],
    lowIntellectual: [
      "下午啦！思考累的时候，就处理一些简单的事情吧！",
      "下午好！今天不太适合做复杂决策，保持简单就好！",
      "下午了！大脑有点累，就别勉强自己思考太难的问题！"
    ]
  },
  // 晚上提示 (18:00-22:00)
  evening: {
    goodPhysical: [
      "晚上好！体力不错，可以去做点喜欢的运动！",
      "晚上时光！状态好就动起来吧！",
      "晚上好！趁着精力不错，做点让自己开心的事！"
    ],
    moderatePhysical: [
      "晚上啦！适当休息保存精力，为明天做准备！",
      "晚上好！放松一下身体，准备迎接美好的夜晚！",
      "晚上时光，做一些轻松的活动吧！"
    ],
    lowPhysical: [
      "晚上啦！今天辛苦了，早点休息吧！",
      "晚上好！身体有点累，不如早点休息！",
      "晚上了！好好休息，明天又是新的一天！"
    ],
    goodEmotional: [
      "晚上好！心情不错，可以和亲友分享今天的快乐！",
      "晚上时光！保持这份好心情！",
      "晚上好！趁着心情好，和家人朋友多聊聊！"
    ],
    moderateEmotional: [
      "晚上啦！给自己一些放松的时间！",
      "晚上好！整理一下今天的心情，准备迎接明天！",
      "晚上时光，做一些让自己开心的事情吧！"
    ],
    lowEmotional: [
      "晚上啦！情绪不好时，允许自己休息，一切都会好起来的。",
      "晚上好！偶尔摆烂一下也挺好，不要被他人评价左右，好好休息吧！",
      "晚上了！心情不好就早点休息，明天又是新的一天！"
    ],
    goodIntellectual: [
      "晚上好！思维清晰，可以规划明天的事情！",
      "晚上时光！整理一下今天的收获吧！",
      "晚上好！趁着头脑清醒，为明天做好准备！"
    ],
    moderateIntellectual: [
      "晚上啦！总结一下今天的事情吧！",
      "晚上好！放松大脑，准备休息！",
      "晚上时光！做一些轻松的阅读或思考！"
    ],
    lowIntellectual: [
      "晚上啦！思考累了就早点休息吧！",
      "晚上好！今天不太适合思考复杂的事情，放松一下！",
      "晚上了！别让大脑太累，早点休息！"
    ]
  },
  // 深夜提示 (22:00-6:00)
  lateNight: {
    goodPhysical: [
      "还在熬夜吗？虽然体力不错，但还是早点休息吧！",
      "深夜时光！如果还不困，可以做点放松的事！",
      "凌晨了！身体状态不错，但还是要早睡哦！"
    ],
    moderatePhysical: [
      "深夜啦！身体需要休息了，早点睡吧！",
      "凌晨了！该休息了，身体会感谢你的！",
      "深夜时光！照顾好自己，早点休息！"
    ],
    lowPhysical: [
      "深夜啦！今天辛苦了，快去休息吧！",
      "凌晨了！身体已经累了吧，好好睡一觉！",
      "深夜了！别熬夜了，好好休息才能恢复体力！"
    ],
    goodEmotional: [
      "深夜时光！心情不错的话，可以写写今天的收获！",
      "凌晨了！保持这份好心情，明天会更好！",
      "深夜啦！心情好的时候，可以和自己好好聊聊天！"
    ],
    moderateEmotional: [
      "深夜啦！放松心情，准备休息吧！",
      "凌晨了！整理一下思绪，好好睡一觉！",
      "深夜时光！给自己一些温暖！"
    ],
    lowEmotional: [
      "深夜啦！情绪不好时，早点休息吧，明天会更好的！",
      "凌晨了！偶尔摆烂一下也挺好，不要被他人评价左右，好好休息吧！",
      "深夜了！心情不好就早点睡，一切都会好的！"
    ],
    goodIntellectual: [
      "深夜时光！思维清晰的话，可以规划明天！",
      "凌晨了！整理一下今天的想法吧！",
      "深夜啦！思考完就早点休息，别熬夜！"
    ],
    moderateIntellectual: [
      "深夜啦！给大脑也放个假吧！",
      "凌晨了！休息之前简单回顾一下今天！",
      "深夜时光！放松大脑，准备睡觉！"
    ],
    lowIntellectual: [
      "深夜啦！思考累了就早点休息吧！",
      "凌晨了！今天不适合思考了，好好休息！",
      "深夜了！别让大脑太累，早点睡觉！"
    ]
  }
};

// 根据节律缓解的食物/物品推荐
const REMEDY_RECOMMENDATIONS = {
  physicalLow: [
    "喝一杯热牛奶或蜂蜜水，温暖身体！",
    "吃点香蕉补充钾元素，缓解疲劳！",
    "来一杯姜茶，驱寒暖身！",
    "泡个热水澡或泡脚，放松身体！",
    "吃点坚果补充能量！"
  ],
  emotionalLow: [
    "听听喜欢的音乐，放松心情！",
    "吃点巧克力，甜食能让人心情变好！",
    "泡一杯玫瑰花茶，舒缓情绪！",
    "看一部轻松的喜剧或动漫！",
    "和信任的朋友聊聊天！"
  ],
  intellectualLow: [
    "喝一杯绿茶或乌龙茶，提神醒脑！",
    "吃点核桃或蓝莓，补充脑力！",
    "深呼吸几次，放松大脑！",
    "做个简单的冥想，清空思绪！",
    "听白噪音或轻音乐，帮助专注！"
  ],
  allLow: [
    "今天状态不太好，好好休息最重要！",
    "允许自己放松一下，明天会更好！",
    "做点简单的事情，别给自己压力！",
    "好好吃一顿，睡个好觉，明天重新开始！"
  ]
};

const BiorhythmTab = ({ isDesktop }) => {

  // 初始化数据迁移
  useEffect(() => {
    initDataMigration();
  }, []);

  // 使用全局配置上下文（降级处理）
  // 移除未使用的configManagerReady变量以消除ESLint警告
  // useCurrentConfig() 直接返回配置对象，不需要再解构
  const currentConfig = useCurrentConfig() || {};

  // 从全局配置获取用户信息
  const [birthDate, setBirthDate] = useState(null);
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    birthDate: ''
  });
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [tempBirthDate, setTempBirthDate] = useState('');
  const [tempNickname, setTempNickname] = useState('');

  // 加载状态和数据状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rhythmData, setRhythmData] = useState(null);
  const [todayData, setTodayData] = useState(null);

  // 每日任务状态
  const [completedTasks, setCompletedTasks] = useState([]);

  // 动态提示相关状态
  const [dailyTip, setDailyTip] = useState('');
  // 移除未使用的lastTipRefresh变量以消除ESLint警告

  // 正念活动状态
  const [mindfulnessActivities, setMindfulnessActivities] = useState([]);
  const [energyGuidance, setEnergyGuidance] = useState('');

  // 本地日期格式化方法 - 必须在 loadBiorhythmData 之前定义
  const formatDateLocal = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 本地日期解析方法 - 必须在 loadBiorhythmData 之前定义
  const parseDateLocal = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  // 加载生物节律数据 - 本地化版本
  // 注意：这个函数必须在所有使用它的代码之前定义，避免"Cannot access before initialization"错误
  const loadBiorhythmData = useCallback(async (selectedDate = null) => {
    const dateToUse = selectedDate || birthDate;

    if (!dateToUse) {
      setError("请选择出生日期");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const birthDateStr = typeof dateToUse === 'string'
        ? dateToUse
        : formatDateLocal(dateToUse);

      // 使用本地数据服务
      const result = await getBiorhythmRange(birthDateStr, 10, 20);

      if (result.success) {
        setRhythmData(result.rhythmData);

        // 查找今日数据
        const today = formatDateLocal(new Date());
        const todayData = result.rhythmData.find(item => item.date === today);
        setTodayData(todayData);

        // 如果是字符串日期，转换为Date对象并更新birthDate
        if (typeof dateToUse === 'string') {
          const dateObj = parseDateLocal(dateToUse);
          setBirthDate(dateObj);
        }
      } else {
        setError(result.error || "获取数据失败");
      }
    } catch (error) {
      setError("计算生物节律数据时出错");
      console.error('加载生物节律数据失败:', error);
    }

    setLoading(false);
  }, [formatDateLocal, parseDateLocal]);

  // 初始化用户信息和加载数据 - 简化逻辑，参考MayaBirthChart_optimized.js
  useEffect(() => {
    try {
      let birthDate = null;
      let nickname = '用户';

      // 从全局配置获取用户信息
      if (currentConfig && currentConfig.birthDate) {
        birthDate = currentConfig.birthDate;
        nickname = currentConfig.nickname || '用户';
      }

      // 更新用户信息状态
      setUserInfo({
        nickname: nickname,
        birthDate: birthDate || ''
      });
      setTempBirthDate(birthDate || '');
      setTempNickname(nickname);

      // 如果有出生日期，加载生物节律数据
      if (birthDate) {
        const newBirthDate = new Date(birthDate);
        if (!isNaN(newBirthDate.getTime())) {
          setBirthDate(newBirthDate);
          loadBiorhythmData(newBirthDate);
        }
      }
    } catch (error) {
      console.error('初始化用户信息失败:', error);
    }
  }, [currentConfig, loadBiorhythmData]);

  // 监听配置变化 - 当配置更新时重新加载数据
  useEffect(() => {
    if (!currentConfig || !currentConfig.birthDate) return;

    const { nickname, birthDate } = currentConfig;

    // 更新用户信息
    setUserInfo({
      nickname: nickname || '用户',
      birthDate: birthDate
    });

    setTempBirthDate(birthDate);
    setTempNickname(nickname || '');

    // 重新加载生物节律数据
    const newBirthDate = new Date(birthDate);
    if (!isNaN(newBirthDate.getTime())) {
      setBirthDate(newBirthDate);
      loadBiorhythmData(newBirthDate);
    }
  }, [currentConfig, loadBiorhythmData]);

  // 保存用户信息到全局配置
  const saveUserInfo = useCallback(async () => {
    if (!tempBirthDate) {
      alert('请选择出生日期');
      return;
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(tempBirthDate)) {
      alert('请选择有效的出生日期');
      return;
    }

    try {
      // 计算星座
      const calculateZodiac = (birthDate) => {
        const date = new Date(birthDate);
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const zodiacDates = [
          { name: '水瓶座', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
          { name: '双鱼座', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
          { name: '白羊座', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
          { name: '金牛座', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
          { name: '双子座', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
          { name: '巨蟹座', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
          { name: '狮子座', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
          { name: '处女座', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
          { name: '天秤座', startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
          { name: '天蝎座', startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
          { name: '射手座', startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
          { name: '摩羯座', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 }
        ];

        for (const zodiac of zodiacDates) {
          if ((month === zodiac.startMonth && day >= zodiac.startDay) ||
              (month === zodiac.endMonth && day <= zodiac.endDay)) {
            return zodiac.name;
          }
        }
        return '摩羯座';
      };

      const zodiac = calculateZodiac(tempBirthDate);

      // 导入userConfigManager来更新配置
      const { userConfigManager } = await import('../utils/userConfigManager');

      // 检查管理器是否初始化
      if (!userConfigManager.initialized) {
        await userConfigManager.initialize();
      }

      // 更新当前配置
      await userConfigManager.updateCurrentConfig({
        birthDate: tempBirthDate,
        nickname: tempNickname,
        zodiac: zodiac
      });

      // 更新本地状态
      const newBirthDate = new Date(tempBirthDate);
      setBirthDate(newBirthDate);
      setUserInfo({
        nickname: tempNickname,
        birthDate: tempBirthDate
      });

      // 关闭模态框
      setShowUserInfoModal(false);

      // 重新加载生物节律数据 - 延迟执行以避免状态冲突
      setTimeout(() => {
        loadBiorhythmData(newBirthDate);
      }, 100);
    } catch (error) {
      console.error('保存用户信息失败:', error);
      alert('保存失败：' + error.message);
    }
  }, [tempBirthDate, tempNickname, loadBiorhythmData]);

  // 每日任务存储键
  const DAILY_TASKS_KEY = 'biorhythm_daily_tasks';

  // 保存任务完成状态到localStorage
  const saveCompletedTasks = useCallback((completedIds) => {
    try {
      const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const today = getTodayString();
      const data = localStorage.getItem(DAILY_TASKS_KEY);
      const tasksData = data ? JSON.parse(data) : {};

      // 保存今日任务
      tasksData[today] = completedIds;

      // 清理7天前的数据
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const cutoffDate = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`;

      Object.keys(tasksData).forEach(date => {
        if (date < cutoffDate) {
          delete tasksData[date];
        }
      });

      localStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(tasksData));
      setCompletedTasks(completedIds);
    } catch (error) {
      console.error('保存任务完成状态失败:', error);
    }
  }, [DAILY_TASKS_KEY]);

  // 标记任务完成/取消完成
  const toggleTaskCompletion = useCallback((taskId) => {
    const newCompleted = completedTasks.includes(taskId) 
      ? completedTasks.filter(id => id !== taskId) // 取消完成
      : [...completedTasks, taskId]; // 标记完成
    saveCompletedTasks(newCompleted);
  }, [completedTasks, saveCompletedTasks]);

  // 生成能量指引文本
  const generateEnergyGuidance = useCallback((physical, emotional, intellectual) => {
    let guidance = '';

    // 综合能量判断
    const averageEnergy = (physical + emotional + intellectual) / 3;

    if (averageEnergy < -10) {
      guidance = '今日能量较低，建议选择轻松的活动，给自己多一点耐心和关怀。每一个小进步都值得庆祝！💪';
    } else if (physical < -15) {
      guidance = '今日体力偏低，身体需要更多休息。建议选择温和的活动，如冥想、深呼吸或听音乐。保重身体！🛡️';
    } else if (emotional < -15) {
      guidance = '今日情绪波动较大，建议选择能安抚心灵的活动。感恩练习和欣赏美景可以帮助你恢复平衡。抱抱自己！🤗';
    } else if (intellectual < -15) {
      guidance = '今日思维可能不够清晰，建议选择不需要复杂思考的活动。整理环境、感恩记录等简单任务会很有帮助。放轻松！🌿';
    } else {
      guidance = '今日状态还不错，建议选择一项喜欢的活动，保持这份美好。每个小行动都是成长的积累！✨';
    }

    return guidance;
  }, []);

  // 智能推荐正念活动 - 根据节律动态推荐
  const getMindfulnessActivities = useCallback((physical, emotional, intellectual) => {
    let filteredActivities = [];

    // 如果体力低，优先推荐低能量活动
    if (physical < -15) {
      filteredActivities = MINDFULNESS_ACTIVITIES.filter(a => a.energy === 'low');
    }
    // 如果情绪低，优先推荐情绪相关活动
    else if (emotional < -15) {
      filteredActivities = MINDFULNESS_ACTIVITIES.filter(a => a.type === 'emotional' || a.energy === 'low');
    }
    // 如果智力低，优先推荐简单活动
    else if (intellectual < -15) {
      filteredActivities = MINDFULNESS_ACTIVITIES.filter(a => a.energy === 'low');
    }
    // 如果体力好，可以推荐中高能量活动
    else if (physical > 20) {
      filteredActivities = MINDFULNESS_ACTIVITIES.filter(a => a.type === 'physical' || a.energy === 'medium');
    }
    // 否则选择所有活动
    else {
      filteredActivities = [...MINDFULNESS_ACTIVITIES];
    }

    // 随机打乱并取前4个
    const shuffled = filteredActivities.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, []);

  // 刷新活动
  const refreshActivities = useCallback(() => {
    if (todayData) {
      setMindfulnessActivities(
        getMindfulnessActivities(todayData.physical, todayData.emotional, todayData.intellectual)
      );
      setEnergyGuidance(
        generateEnergyGuidance(todayData.physical, todayData.emotional, todayData.intellectual)
      );
    }
  }, [todayData, getMindfulnessActivities, generateEnergyGuidance]);

  // 初始化任务完成状态 - 只在组件挂载时执行一次
  useEffect(() => {
    const loadTasks = () => {
      try {
        const data = localStorage.getItem(DAILY_TASKS_KEY);
        if (data) {
          const tasksData = JSON.parse(data);
          const getTodayString = () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };
          const today = getTodayString();
          setCompletedTasks(tasksData[today] || []);
        }
      } catch (error) {
        console.error('加载任务完成状态失败:', error);
      }
    };
    
    loadTasks();
  }, []);

  // 生成动态暖心提示
  const generateDailyTip = useCallback(() => {
    if (!todayData) return '';

    const timeOfDay = getTimeOfDay();
    const season = getSeason();
    const physicalStatus = getPhysicalStatusLevel(todayData.physical);
    const emotionalStatus = getEmotionalStatusLevel(todayData.emotional);
    const intellectualStatus = getIntellectualStatusLevel(todayData.intellectual);

    // 获取该时间段的所有提示
    const tips = DAILY_TIPS[timeOfDay] || {};

    // 优先显示最低状态对应的提示
    let allTips = [];
    if (physicalStatus === 'lowPhysical') {
      allTips = allTips.concat(tips[physicalStatus] || []);
      // 添加缓解推荐
      const remedy = REMEDY_RECOMMENDATIONS.physicalLow[
        Math.floor(Math.random() * REMEDY_RECOMMENDATIONS.physicalLow.length)
      ];
      if (remedy) allTips.push(remedy);
    }
    if (emotionalStatus === 'lowEmotional') {
      allTips = allTips.concat(tips[emotionalStatus] || []);
      const remedy = REMEDY_RECOMMENDATIONS.emotionalLow[
        Math.floor(Math.random() * REMEDY_RECOMMENDATIONS.emotionalLow.length)
      ];
      if (remedy) allTips.push(remedy);
    }
    if (intellectualStatus === 'lowIntellectual') {
      allTips = allTips.concat(tips[intellectualStatus] || []);
      const remedy = REMEDY_RECOMMENDATIONS.intellectualLow[
        Math.floor(Math.random() * REMEDY_RECOMMENDATIONS.intellectualLow.length)
      ];
      if (remedy) allTips.push(remedy);
    }

    // 如果没有低状态，随机选择一个状态的提示
    if (allTips.length === 0) {
      const randomStatus = [physicalStatus, emotionalStatus, intellectualStatus][
        Math.floor(Math.random() * 3)
      ];
      allTips = tips[randomStatus] || [];
    }

    // 如果所有状态都很低，添加综合提示
    if (physicalStatus === 'lowPhysical' && emotionalStatus === 'lowEmotional' && intellectualStatus === 'lowIntellectual') {
      const allLowTip = REMEDY_RECOMMENDATIONS.allLow[
        Math.floor(Math.random() * REMEDY_RECOMMENDATIONS.allLow.length)
      ];
      if (allLowTip) allTips.push(allLowTip);
    }

    // 添加季节特色提示
    const seasonalTips = {
      spring: ['春暖花开，出去踏青吧！', '春天到了，感受万物复苏！', '春日阳光正好，不妨出去走走！'],
      summer: ['夏天炎热，注意多喝水！', '夏日炎炎，记得避暑！', '夏夜凉爽，可以出去纳凉！'],
      autumn: ['秋高气爽，适合户外活动！', '秋天来了，注意保暖！', '秋日美景，别错过！'],
      winter: ['冬天寒冷，注意保暖！', '冬日暖阳，晒晒太阳吧！', '冬夜漫长，早点休息！']
    };
    if (Math.random() < 0.3) {
      const seasonTip = seasonalTips[season] || seasonalTips.winter;
      allTips.push(seasonTip[Math.floor(Math.random() * seasonTip.length)]);
    }

    // 随机选择一条提示
    const randomIndex = Math.floor(Math.random() * allTips.length);
    return allTips[randomIndex] || '今天也要保持好心情哦！';
  }, [todayData]);

  // 初始化活动列表和能量指引 - 只在组件挂载和todayData变化时执行一次
  useEffect(() => {
    if (todayData && mindfulnessActivities.length === 0) {
      setMindfulnessActivities(
        getMindfulnessActivities(todayData.physical, todayData.emotional, todayData.intellectual)
      );
      setEnergyGuidance(
        generateEnergyGuidance(todayData.physical, todayData.emotional, todayData.intellectual)
      );
      
      // 初始化每日提示
      setDailyTip(generateDailyTip());
    }
  }, [todayData, mindfulnessActivities.length, getMindfulnessActivities, generateEnergyGuidance, generateDailyTip]);

  // 获取当前时间段
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 14) return 'noon';
    if (hour >= 14 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'lateNight';
  };

  // 获取季节
  const getSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  // 获取体力状态等级
  const getPhysicalStatusLevel = (physical) => {
    if (physical > 20) return 'goodPhysical';
    if (physical >= -10) return 'moderatePhysical';
    return 'lowPhysical';
  };

  // 获取情绪状态等级
  const getEmotionalStatusLevel = (emotional) => {
    if (emotional > 20) return 'goodEmotional';
    if (emotional >= -10) return 'moderateEmotional';
    return 'lowEmotional';
  };

  // 获取智力状态等级
  const getIntellectualStatusLevel = (intellectual) => {
    if (intellectual > 20) return 'goodIntellectual';
    if (intellectual >= -10) return 'moderateIntellectual';
    return 'lowIntellectual';
  };

  // 刷新提示
  const refreshTip = useCallback(() => {
    setDailyTip(generateDailyTip());
  }, [generateDailyTip]);

  // 计算未来7天趋势
  const futureTrends = useMemo(() => {
    if (!rhythmData || !todayData) return [];

    const todayIndex = rhythmData.findIndex(item => item.date === todayData.date);
    if (todayIndex === -1) return [];

    const trends = [];
    for (let i = 1; i <= 7; i++) {
      const futureItem = rhythmData[todayIndex + i];
      if (!futureItem) break;

      // 计算趋势符号
      const getTrendSymbol = (currentValue, futureValue) => {
        const diff = futureValue - currentValue;
        if (diff > 2) return '↑↑';
        if (diff > 0.5) return '↑';
        if (diff < -2) return '↓↓';
        if (diff < -0.5) return '↓';
        return '→';
      };

      // 计算趋势颜色类
      const getTrendColorClass = (symbol) => {
        if (symbol === '↑↑') return 'text-green-600 dark:text-green-300 font-bold';
        if (symbol === '↑') return 'text-green-500 dark:text-green-400';
        if (symbol === '↓↓') return 'text-rose-600 dark:text-rose-300 font-bold';
        if (symbol === '↓') return 'text-rose-500 dark:text-rose-400';
        return 'text-gray-400 dark:text-gray-100';
      };

      trends.push({
        day: i === 1 ? '明天' : `${i}天后`,
        date: futureItem.date,
        physical: getTrendSymbol(todayData.physical, futureItem.physical),
        emotional: getTrendSymbol(todayData.emotional, futureItem.emotional),
        intellectual: getTrendSymbol(todayData.intellectual, futureItem.intellectual)
      });
    }
    return trends;
  }, [rhythmData, todayData]);

  // 获取趋势颜色类 - 在渲染时使用
  const getTrendColorClass = (symbol) => {
    if (symbol === '↑↑') return 'text-green-600 dark:text-green-300 font-bold';
    if (symbol === '↑') return 'text-green-500 dark:text-green-400';
    if (symbol === '↓↓') return 'text-rose-600 dark:text-rose-300 font-bold';
    if (symbol === '↓') return 'text-rose-500 dark:text-rose-400';
    return 'text-gray-400 dark:text-gray-100';
  };

  // 计算综合分数
  const totalScore = useMemo(() => {
    if (!todayData || todayData.physical === undefined || todayData.emotional === undefined || todayData.intellectual === undefined) {
      return undefined;
    }
    return todayData.physical + todayData.emotional + todayData.intellectual;
  }, [todayData]);

  if (loading && !rhythmData) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
        <div className="flex-1 overflow-y-auto hide-scrollbar scroll-performance-optimized taoist-content-scroll bg-white dark:bg-black">
          <div className="container mx-auto px-4 py-4 md:px-4 md:py-6 bg-white dark:bg-black">
            <div className="mb-4 mx-auto max-w-2xl">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-600 dark:text-gray-100 text-sm">正在计算生物节律...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !rhythmData) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
        <div className="flex-1 overflow-y-auto hide-scrollbar scroll-performance-optimized taoist-content-scroll bg-white dark:bg-black">
          <div className="container mx-auto px-4 py-4 md:px-4 md:py-6 bg-white dark:bg-black">
            <div className="mb-4 mx-auto max-w-2xl">
              <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-center">
                <div className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-red-800 dark:text-red-300 text-sm font-medium mb-1">加载失败</h3>
                <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>
                <button
                  onClick={() => loadBiorhythmData()}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                >
                  重新加载
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!rhythmData) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
        <div className="flex-1 overflow-y-auto hide-scrollbar scroll-performance-optimized taoist-content-scroll bg-white dark:bg-black">
          <div className="container mx-auto px-4 py-4 md:px-4 md:py-6 bg-white dark:bg-black">
            <div className="mb-4 mx-auto max-w-2xl">
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-100" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-gray-800 dark:text-gray-100 text-sm font-medium mb-1">暂无数据</h3>
                <p className="text-gray-600 dark:text-gray-100 text-xs">暂时无法获取生物节律数据</p>
                <button
                  onClick={() => loadBiorhythmData()}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  重新加载
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
      <div className="flex-1 overflow-y-auto hide-scrollbar scroll-performance-optimized taoist-content-scroll bg-white dark:bg-black -webkit-overflow-scrolling-touch">
        {/* 简化的Banner组件 */}
        <BiorhythmBanner />

        <div className="container mx-auto px-4 py-4 md:px-4 md:py-6 bg-white dark:bg-black flex-1">
          <div className="mb-4 space-y-4 h-full dashboard-content">
            {/* 简化的用户信息卡片 */}
            <UserInfoCard 
              userInfo={userInfo}
              todayData={todayData}
              onEditInfo={() => setShowUserInfoModal(true)}
            />

            {/* 简化的今日节律总结 */}
            <DailySummaryCard 
              totalScore={totalScore}
              dailyTip={dailyTip}
              onRefreshTip={refreshTip}
            />

            {/* 简化的正念活动组件 */}
            <MindfulnessActivities 
              activities={mindfulnessActivities}
              completedTasks={completedTasks}
              onToggleTask={toggleTaskCompletion}
              onRefreshActivities={refreshActivities}
              energyGuidance={energyGuidance}
            />

            {/* 生物节律曲线图 - 优化间距 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                趋势图表
              </h3>

              {rhythmData && rhythmData.length > 0 ? (
                <div className="h-64 mb-4">
                  <BiorhythmChart
                    data={rhythmData}
                    isMobile={!isDesktop}
                  />
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-100 text-sm">
                  暂无图表数据
                </div>
              )}

              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-100">体力</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-100">情绪</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-100">智力</span>
                </div>
              </div>
            </div>

            {/* 未来7天节律趋势 - 新增 */}
            {futureTrends.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  未来7天趋势预测
                </h3>

                <div className="overflow-hidden rounded-lg border dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-opacity-50">
                      <tr>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider">日期</th>
                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-green-600 dark:text-green-200 uppercase tracking-wider">体力</th>
                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-blue-600 dark:text-blue-200 uppercase tracking-wider">情绪</th>
                        <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-purple-600 dark:text-purple-200 uppercase tracking-wider">智力</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                      {futureTrends.map((trend, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{trend.day}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-100">{trend.date.substring(5)}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <span className={`text-base ${getTrendColorClass(trend.physical)}`}>{trend.physical}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <span className={`text-base ${getTrendColorClass(trend.emotional)}`}>{trend.emotional}</span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <span className={`text-base ${getTrendColorClass(trend.intellectual)}`}>{trend.intellectual}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-100">
                  <span>↑↑: 大幅上升</span>
                  <span>↑: 上升</span>
                  <span>→: 平稳</span>
                  <span>↓: 下降</span>
                  <span>↓↓: 大幅下降</span>
                </div>
              </div>
            )}

            {/* 节律说明 - 优化间距 */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-700/50 rounded-lg p-4">
              <h4 className="text-base font-semibold text-blue-800 dark:text-blue-200 mb-3">
                节律知识
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                生物节律理论包含23天体力周期、28天情绪周期和33天智力周期。正值表示能量充沛，负值表示能量偏低。每日节律状态可作为参考，帮助您合理安排活动。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 用户信息编辑模态框 */}
      {showUserInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">编辑个人信息</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  昵称
                </label>
                <input
                  type="text"
                  value={tempNickname}
                  onChange={(e) => setTempNickname(e.target.value)}
                  placeholder="请输入昵称"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                  出生日期
                </label>
                <input
                  type="date"
                  value={tempBirthDate}
                  onChange={(e) => setTempBirthDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  max={new Date().toISOString().split('T')[0]} // 限制最大日期为今天
                />
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowUserInfoModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveUserInfo}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg transition-colors shadow-md"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiorhythmTab;