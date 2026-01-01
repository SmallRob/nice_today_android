import { useState, useEffect, useCallback, useMemo } from 'react';
import './FishingGamePage.css';

/**
 * 游戏配置数据
 */
const LAKES = [
  { id: 'lake1', name: '太湖', description: '中国五大淡水湖之一，鱼产丰富，适合新手', cost: 0, fish: ['crucian', 'carp', 'silver_carp'], color: '#60a5fa', levelReq: 1 },
  { id: 'lake2', name: '西湖', description: '淡妆浓抹总相宜，水质清澈，多锦鲤与鲈鱼', cost: 50, fish: ['crucian', 'carp', 'perch', 'bass'], color: '#34d399', levelReq: 2 },
  { id: 'lake3', name: '贝加尔湖', description: '世界最深湖泊，拥有独特的淡水海豹与哲罗鲑', cost: 150, fish: ['carp', 'taimen', 'bass', 'pike'], color: '#3b82f6', levelReq: 3 },
  { id: 'lake4', name: '苏必利尔湖', description: '世界面积最大淡水湖，多大尺寸北美鱼类', cost: 300, fish: ['perch', 'salmon', 'pike', 'sturgeon'], color: '#6366f1', levelReq: 4 },
  { id: 'lake5', name: '维多利亚湖', description: '非洲最大湖泊，出产巨大的尼罗河鲈鱼', cost: 600, fish: ['bass', 'pike', 'sturgeon', 'nile_perch'], color: '#f59e0b', levelReq: 5 },
  { id: 'lake6', name: '青海湖', description: '中国最大内陆湖，特产高原裸鲤', cost: 1200, fish: ['naked_carp', 'pike', 'sturgeon'], color: '#22d3ee', levelReq: 6 },
  { id: 'lake7', name: '尼斯湖', description: '苏格兰神秘湖泊，或许能钓到传说中的生物', cost: 2500, fish: ['salmon', 'sturgeon', 'nessie_eel'], color: '#4b5563', levelReq: 7 },
  { id: 'lake8', name: '里海', description: '世界最大咸水湖，盛产顶级鲟鱼与鱼子酱', cost: 6000, fish: ['kaluga', 'chinese_sturgeon', 'sturgeon'], color: '#1e3a8a', levelReq: 8 },
  { id: 'lake9', name: '伊利亚特里海', description: '非洲大裂谷系统，出产珍稀的维多利亚鲈鱼', cost: 4500, fish: ['nile_perch', 'victoria_perch', 'tanzania_perch'], color: '#f472b6', levelReq: 9 },
  { id: 'lake10', name: '马拉维湖', description: '马拉维湖国家公园，野生动物天堂，湖鲈鱼资源丰富', cost: 3500, fish: ['small_mouth_bass', 'catfish', 'walleye'], color: '#e879f9', levelReq: 10 }
];

// 垃圾物品
const TRASH_ITEMS = [
  { id: 'trash1', name: '破旧的鞋子', description: '一只破旧的鞋子', emoji: '👞' },
  { id: 'trash2', name: '空罐头', description: '一个生锈的空罐头', emoji: '🥫' },
  { id: 'trash3', name: '塑料瓶', description: '被丢弃的塑料瓶', emoji: '🍾' },
  { id: 'trash4', name: '破渔网', description: '一缕破渔网', emoji: '🕸️' },
  { id: 'trash5', name: '枯树枝', description: '一根枯死的树枝', emoji: '🪵' }
];

// 奇怪物品
const STRANGE_ITEMS = [
  { id: 'strange1', name: '生锈的硬币', description: '一枚生锈的古老硬币', emoji: '🪙', basePrice: 5 },
  { id: 'strange2', name: '玻璃珠', description: '一颗漂亮的玻璃珠', emoji: '🔮', basePrice: 8 },
  { id: 'strange3', name: '奇怪的贝壳', description: '一个形状奇特的贝壳', emoji: '🐚', basePrice: 12 },
  { id: 'strange4', name: '旧地图碎片', description: '一张古老的地图碎片', emoji: '📜', basePrice: 15 },
  { id: 'strange5', name: '神秘的水晶', description: '在水中闪耀的神秘水晶', emoji: '💎', basePrice: 20 }
];

const RODS = [
  { id: 'rod1', name: '竹竿', power: 10, price: 0, color: '#9ca3af' },
  { id: 'rod2', name: '碳素竿', power: 25, price: 200, color: '#6b7280' },
  { id: 'rod3', name: '钛合金竿', power: 50, price: 500, color: '#4b5563' },
  { id: 'rod4', name: '传奇神竿', power: 80, price: 1200, color: '#f59e0b' },
  { id: 'rod5', name: '虚空之握', power: 95, price: 3000, color: '#6366f1' },
  { id: 'rod6', name: '因果律之丝', power: 100, price: 10000, color: '#ec4899' },
  { id: 'rod7', name: '星河之辉', power: 70, price: 800, color: '#22d3ee' },
  { id: 'rod8', name: '时空之渊', power: 85, price: 1800, color: '#10b981' },
  { id: 'rod9', name: '混沌之息', power: 110, price: 5000, color: '#8b5cf6' }
];

const BAIT = [
  { id: 'bait1', name: '蚯蚓', power: 10, price: 5, color: '#78716c' },
  { id: 'bait2', name: '面团', power: 20, price: 10, color: '#fef3c7' },
  { id: 'bait3', name: '玉米', power: 35, price: 20, color: '#fcd34d' },
  { id: 'bait4', name: '虾米', power: 50, price: 50, color: '#fb923c' },
  { id: 'bait5', name: '金珠', power: 80, price: 100, color: '#fbbf24' },
  { id: 'bait6', name: '荧光虫', power: 65, price: 30, color: '#4ade80' },
  { id: 'bait7', name: '鸣蝉', power: 85, price: 70, color: '#fb7185' },
  { id: 'bait8', name: '时光碎片', power: 98, price: 250, color: '#22d3ee' }
];

const GEAR = [
  { id: 'basket1', name: '简易鱼篓', type: 'basket', effect: 50, price: 300, description: '增加50条鱼的储存上限', emoji: '🧺' },
  { id: 'hat1', name: '防晒渔夫帽', type: 'hat', effect: 0.02, price: 500, description: '增加2%的钓鱼成功率', emoji: '👒' }
];

const FISH_TYPES = {
  // 普通
  crucian: { name: '鲫鱼', rarity: 'common', basePrice: 15, exp: 5, emoji: '🐟' },
  carp: { name: '鲤鱼', rarity: 'common', basePrice: 20, exp: 8, emoji: '🐠' },
  silver_carp: { name: '白鲢', rarity: 'common', basePrice: 25, exp: 10, emoji: '🐟' },
  // 稀有
  perch: { name: '鲈鱼', rarity: 'rare', basePrice: 50, exp: 20, emoji: '🐟' },
  bass: { name: '大口黑鲈', rarity: 'rare', basePrice: 65, exp: 25, emoji: '🐠' },
  // 罕见（稀有和史诗之间）
  victoria_perch: { name: '维多利亚鲈鱼', rarity: 'ultra_rare', basePrice: 100, exp: 40, emoji: '🐠' },
  tanzania_perch: { name: '坦噶尼喀鲈鱼', rarity: 'ultra_rare', basePrice: 120, exp: 50, emoji: '🐟' },
  small_mouth_bass: { name: '小口鲈鱼', rarity: 'ultra_rare', basePrice: 80, exp: 35, emoji: '🐠' },
  catfish: { name: '巨鲶鱼', rarity: 'ultra_rare', basePrice: 90, exp: 38, emoji: '🐟' },
  walleye: { name: '大眼鱼', rarity: 'ultra_rare', basePrice: 85, exp: 36, emoji: '🐟' },
  // 史诗
  pike: { name: '白斑狗鱼', rarity: 'epic', basePrice: 120, exp: 50, emoji: '🐊' },
  taimen: { name: '哲罗鲑', rarity: 'epic', basePrice: 180, exp: 80, emoji: '🐟' },
  salmon: { name: '大西洋鲑', rarity: 'epic', basePrice: 220, exp: 100, emoji: '🍣' },
  naked_carp: { name: '青海湖湟鱼', rarity: 'epic', basePrice: 350, exp: 180, emoji: '🐡' },
  // 传说
  sturgeon: { name: '施氏鲟', rarity: 'legendary', basePrice: 400, exp: 200, emoji: '🌟' },
  nile_perch: { name: '尼罗河鲈鱼', rarity: 'legendary', basePrice: 550, exp: 300, emoji: '🦈' },
  nessie_eel: { name: '尼斯湖巨型鳗', rarity: 'legendary', basePrice: 900, exp: 500, emoji: '🐉' },
  kaluga: { name: '达氏鳇', rarity: 'legendary', basePrice: 1500, exp: 800, emoji: '🐋' },
  chinese_sturgeon: { name: '中华鲟', rarity: 'legendary', basePrice: 2000, exp: 1200, emoji: '🐲' }
};

const RARITY_COLORS = {
  common: '#9ca3af',
  rare: '#3b82f6',
  ultra_rare: '#8b5cf6',
  epic: '#a855f7',
  legendary: '#f59e0b'
};

const RARITY_NAMES = {
  common: '普通',
  rare: '稀有',
  ultra_rare: '罕见',
  epic: '史诗',
  legendary: '传说'
};

/**
 * 计算升级所需经验
 */
const getExpForLevel = (level) => Math.floor(100 * Math.pow(1.5, level - 1));

/**
 * 钓了么 - 钓鱼游戏主页面
 */
const FishingGamePage = () => {
  // 游戏状态
  const [gameState, setGameState] = useState({
    money: 500,
    level: 1,
    exp: 0,
    currentLake: null,
    currentRod: null,
    currentBait: null,
    inventory: {
      rods: ['rod1'],
      bait: { bait1: 10 },
      gear: []
    },
    caughtFish: [],
    messages: []
  });

  // 钓鱼状态
  const [isFishing, setIsFishing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showMiss, setShowMiss] = useState(false);
  const [lastCatch, setLastCatch] = useState(null);
  const [lastMiss, setLastMiss] = useState(null);
  const [activeTab, setActiveTab] = useState('fish');
  const [inventoryTab, setInventoryTab] = useState('fish');

  // 添加消息
  const addMessage = useCallback((text) => {
    setGameState(prev => ({
      ...prev,
      messages: [text, ...prev.messages].slice(0, 10)
    }));
  }, []);

  // 检查金钱是否有效
  const isValidMoney = useCallback((value) => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value) && value >= 0;
  }, []);

  // 从本地存储加载游戏数据
  useEffect(() => {
    const savedData = localStorage.getItem('fishingGameSave');

    if (savedData) {
      try {
        const loadedState = JSON.parse(savedData);

        // 验证金钱是否有效
        if (!isValidMoney(loadedState.money)) {
          console.warn('加载的金钱数据无效，重置为默认值');
          loadedState.money = 500;
        }

        // 深度合并逻辑，确保新字段（如 inventory.gear）存在
        setGameState(prev => ({
          ...prev,
          ...loadedState,
          inventory: {
            ...prev.inventory,
            ...(loadedState.inventory || {}),
            rods: loadedState.inventory?.rods || prev.inventory.rods,
            bait: loadedState.inventory?.bait || prev.inventory.bait,
            gear: loadedState.inventory?.gear || []
          },
          caughtFish: loadedState.caughtFish || [],
          messages: loadedState.messages || []
        }));
      } catch (error) {
        console.error('加载游戏数据失败:', error);
      }
    } else {
      // 新游戏，显示欢迎消息
      setTimeout(() => {
        addMessage('🎮 欢迎来到钓了么！初始金金：500金币，蚯蚓×10');
        addMessage('💡 提示：先选择湖泊，装备钓竿和饵料，然后开始钓鱼！');
      }, 500);
    }

    // 每日上线奖赏：100金币
    const today = new Date().toDateString();
    const lastLoginDay = localStorage.getItem('fishingLastLoginDate');

    if (lastLoginDay !== today) {
      localStorage.setItem('fishingLastLoginDate', today);
      setTimeout(() => {
        setGameState(prev => {
          const newMoney = prev.money + 100;
          if (!isValidMoney(newMoney)) {
            console.warn('每日登录奖励计算错误，金钱重置为500');
            return { ...prev, money: 500 };
          }
          return { ...prev, money: newMoney };
        });
        addMessage('🎁 每日登录奖励：获得 100 金币！');
      }, 1000);
    }
  }, [addMessage, isValidMoney]);

  // 自动保存游戏数据
  useEffect(() => {
    if (gameState.money !== 500 || gameState.level !== 1 || gameState.messages.length > 2) {
      localStorage.setItem('fishingGameSave', JSON.stringify(gameState));
    }
  }, [gameState]);

  // 按鱼种进行库存分组
  const groupedInventory = useMemo(() => {
    const groups = {};
    gameState.caughtFish.forEach(fish => {
      if (!groups[fish.name]) {
        groups[fish.name] = {
          ...fish,
          count: 0,
          totalValue: 0,
          ids: []
        };
      }
      groups[fish.name].count += 1;
      // 计算其实际估值（包含稀有度乘数）
      const rarityMultipliers = { common: 1, rare: 1.5, ultra_rare: 2, epic: 2.5, legendary: 4, strange: 0.65 };
      const multiplier = rarityMultipliers[fish.rarity] || 0;
      const currentPrice = Math.floor((fish.basePrice || 0) * multiplier);
      groups[fish.name].totalValue += (isNaN(currentPrice) ? 0 : currentPrice);
      groups[fish.name].ids.push(fish.id);
    });
    return Object.values(groups);
  }, [gameState.caughtFish]);


  // 选择湖泊（直接前往）
  const selectLake = (lake) => {
    if (gameState.level < lake.levelReq) {
      addMessage(`⚠️ 等级不足！需要达到 ${lake.levelReq} 级才能前往${lake.name}`);
      return;
    }
    if (!isValidMoney(gameState.money) || gameState.money < lake.cost) {
      addMessage(`💰 金钱不足！需要 ${lake.cost} 金币，当前余额: ${gameState.money}`);
      return;
    }

    // 如果已经是当前湖泊，提示用户
    if (gameState.currentLake === lake.id) {
      addMessage(`🚣 当前已在${lake.name}`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      money: lake.cost > 0 ? prev.money - lake.cost : prev.money,
      currentLake: lake.id
    }));

    if (lake.cost > 0) {
      addMessage(`🚣 已到达${lake.name}，花费 ${lake.cost} 金币`);
    } else {
      addMessage(`🚣 已到达${lake.name}`);
    }
  };

  // 购买钓竿
  const buyRod = (rod) => {
    if (!isValidMoney(gameState.money) || gameState.money < rod.price) {
      addMessage(`💰 金钱不足！需要 ${rod.price} 金币，当前余额: ${gameState.money}`);
      return;
    }

    if ((gameState.inventory.rods || []).includes(rod.id)) {
      addMessage(`🎣 你已经拥有${rod.name}了`);
      return;
    }

    const newMoney = gameState.money - rod.price;
    if (!isValidMoney(newMoney)) {
      addMessage(`⚠️ 金钱计算错误，购买失败`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      money: newMoney,
      currentRod: rod.id,
      inventory: {
        ...prev.inventory,
        rods: [...prev.inventory.rods, rod.id]
      }
    }));
    addMessage(`✅ 购买${rod.name}成功！`);
  };

  // 购买饵料
  const buyBait = (baitType, amount = 10) => {
    const bait = BAIT.find(b => b.id === baitType);
    if (!bait) return;

    const totalCost = bait.price * amount;
    if (!isValidMoney(gameState.money) || gameState.money < totalCost) {
      addMessage(`💰 金钱不足！需要 ${totalCost} 金币，当前余额: ${gameState.money}`);
      return;
    }

    const newMoney = gameState.money - totalCost;
    if (!isValidMoney(newMoney)) {
      addMessage(`⚠️ 金钱计算错误，购买失败`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      money: newMoney,
      currentBait: baitType,
      inventory: {
        ...prev.inventory,
        bait: {
          ...prev.inventory.bait,
          [baitType]: (prev.inventory.bait[baitType] || 0) + amount
        }
      }
    }));
    addMessage(`✅ 购买${bait.name}×${amount}成功！`);
  };

  // 装备钓竿
  const equipRod = (rodId) => {
    if (!(gameState.inventory.rods || []).includes(rodId)) return;
    setGameState(prev => ({ ...prev, currentRod: rodId }));
    const rod = RODS.find(r => r.id === rodId);
    addMessage(`🎣 已装备${rod.name}`);
  };

  // 选择饵料
  const selectBait = (baitId) => {
    if (!gameState.inventory.bait[baitId] || gameState.inventory.bait[baitId] <= 0) {
      addMessage(`🪱 饵料不足，请先购买`);
      return;
    }
    setGameState(prev => ({ ...prev, currentBait: baitId }));
    const bait = BAIT.find(b => b.id === baitId);
    addMessage(`🪱 已选择${bait.name}`);
  };

  // 获取最高级可用饵料
  const getBestAvailableBait = useCallback(() => {
    // 获取所有拥有数量 > 0 的饵料
    const availableBaits = BAIT.filter(b => gameState.inventory.bait[b.id] > 0);
    if (availableBaits.length === 0) return null;

    // 按威力从高到低排序
    return availableBaits.sort((a, b) => b.power - a.power)[0];
  }, [gameState.inventory.bait]);

  // 计算钓鱼成功率
  const calculateSuccessRate = () => {
    const rod = RODS.find(r => r.id === gameState.currentRod);
    // 优先使用当前选择的，如果当前选择的没了，使用最好的
    let baitId = gameState.currentBait;
    if (!gameState.inventory.bait[baitId] || gameState.inventory.bait[baitId] <= 0) {
      const bestBait = getBestAvailableBait();
      baitId = bestBait?.id;
    }

    const bait = BAIT.find(b => b.id === baitId);

    if (!rod || !bait || !gameState.currentLake) return 0;

    // 基础成功率 30% + 钓竿加成 + 饵料加成
    const baseSuccess = 0.3;
    const rodBonus = (rod.power / 100) * 0.4;
    const baitBonus = (bait.power / 100) * 0.3;

    return Math.min(0.95, baseSuccess + rodBonus + baitBonus);
  };

  // 执行钓鱼
  const startFishing = () => {
    if (!gameState.currentLake) {
      addMessage('⚠️ 请先选择湖泊');
      return;
    }

    if (!gameState.currentRod) {
      addMessage('⚠️ 请先装备钓竿');
      return;
    }

    // 自动寻找可用饵料
    let baitToUse = gameState.currentBait;
    if (!gameState.inventory.bait[baitToUse] || gameState.inventory.bait[baitToUse] <= 0) {
      const bestBait = getBestAvailableBait();
      if (!bestBait) {
        addMessage('⚠️ 饵料不足，请先购买');
        return;
      }
      baitToUse = bestBait.id;
      // 自动切换饵料
      setGameState(prev => ({ ...prev, currentBait: baitToUse }));
    }

    const successRate = calculateSuccessRate();
    const isSuccess = Math.random() < successRate;

    setIsFishing(true);
    setShowResult(false);
    setShowMiss(false);

    // 消耗饵料
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        bait: {
          ...prev.inventory.bait,
          [baitToUse]: prev.inventory.bait[baitToUse] - 1
        }
      }
    }));

    setTimeout(() => {
      setIsFishing(false);

      // 10%概率钓到垃圾或奇怪物品
      const randomRoll = Math.random();
      if (randomRoll < 0.05) {
        // 5%概率钓到垃圾
        const trash = TRASH_ITEMS[Math.floor(Math.random() * TRASH_ITEMS.length)];
        setLastMiss({
          emoji: trash.emoji,
          title: '哎呀...',
          message: `竟然钓到了${trash.name}`,
          encourage: trash.description
        });
        setShowMiss(true);
        addMessage(`😞 钓到了${trash.emoji}${trash.name}... ${trash.description}`);
        setLastCatch(null);
      } else if (randomRoll < 0.10) {
        // 5%概率钓到奇怪物品
        const strangeItem = STRANGE_ITEMS[Math.floor(Math.random() * STRANGE_ITEMS.length)];
        const price = Math.floor(strangeItem.basePrice * 0.65); // 奇怪物品按65%价值出售

        setLastCatch({
          ...strangeItem,
          rarity: 'strange',
          price,
          exp: 5
        });
        setShowResult(true);

        setGameState(prev => {
          let newCaughtFish = [
            ...prev.caughtFish,
            { ...strangeItem, id: Date.now(), rarity: 'strange', basePrice: strangeItem.basePrice, price, date: new Date().toISOString() }
          ];

          // 检查库存上限
          const baseCapacity = 50;
          const gearCapacity = (prev.inventory.gear || []).reduce((acc, id) => {
            const item = GEAR.find(g => g.id === id);
            return acc + (item?.type === 'basket' ? item.effect : 0);
          }, 0);
          const totalCapacity = baseCapacity + gearCapacity;

          if (newCaughtFish.length > totalCapacity) {
            let lowestValueFishIndex = -1;
            let lowestValue = Infinity;

            newCaughtFish.forEach((f, index) => {
              const fPrice = f.price || 0;
              if (fPrice < lowestValue) {
                lowestValue = fPrice;
                lowestValueFishIndex = index;
              }
            });

            if (lowestValueFishIndex !== -1) {
              const abandonedFish = newCaughtFish[lowestValueFishIndex];
              newCaughtFish.splice(lowestValueFishIndex, 1);
              addMessage(`⚠️ 背包已满（上限${totalCapacity}），自动放弃价值最低的${abandonedFish.name}`);
            }
          }

          return {
            ...prev,
            caughtFish: newCaughtFish
          };
        });
        addMessage(`🎯 钓到了${strangeItem.emoji}${strangeItem.name}！出售价值 ${price} 金币`);
      } else if (isSuccess) {
        // 随机选择鱼种
        const currentLakeId = gameState.currentLake;
        const lake = LAKES.find(l => l.id === currentLakeId);
        const fishType = lake.fish[Math.floor(Math.random() * lake.fish.length)];
        const fish = FISH_TYPES[fishType];

        // 计算价值（受稀有度影响）
        const rarityMultipliers = { common: 1, rare: 1.5, ultra_rare: 2, epic: 2.5, legendary: 4 };
        const price = Math.floor(fish.basePrice * rarityMultipliers[fish.rarity]);

        setGameState(prev => {
          let newCaughtFish = [
            ...prev.caughtFish,
            { ...fish, id: Date.now(), date: new Date().toISOString(), price }
          ];

          // 检查库存上限
          const baseCapacity = 50;
          const gearCapacity = (prev.inventory.gear || []).reduce((acc, id) => {
            const item = GEAR.find(g => g.id === id);
            return acc + (item?.type === 'basket' ? item.effect : 0);
          }, 0);
          const totalCapacity = baseCapacity + gearCapacity;

          if (newCaughtFish.length > totalCapacity) {
            // 找出价值最低的鱼
            let lowestValueFishIndex = -1;
            let lowestValue = Infinity;

            newCaughtFish.forEach((f, index) => {
              const fPrice = f.price || 0;
              if (fPrice < lowestValue) {
                lowestValue = fPrice;
                lowestValueFishIndex = index;
              }
            });

            if (lowestValueFishIndex !== -1) {
              const abandonedFish = newCaughtFish[lowestValueFishIndex];
              newCaughtFish.splice(lowestValueFishIndex, 1);
              addMessage(`⚠️ 背包已满（上限${totalCapacity}），自动放弃价值最低的${abandonedFish.name}`);
            }
          }

          let newLevel = prev.level;
          let newExp = prev.exp + fish.exp;

          // 检查升级
          let expForLevel = getExpForLevel(newLevel);
          while (newExp >= expForLevel) {
            newExp -= expForLevel;
            newLevel++;
            addMessage(`🎉 恭喜升级！当前等级：${newLevel}`);
            expForLevel = getExpForLevel(newLevel);
          }

          return {
            ...prev,
            caughtFish: newCaughtFish,
            level: newLevel,
            exp: newExp
          };
        });

        setLastCatch({ ...fish, price });
        setShowResult(true);
        addMessage(`🎉 钓到了${fish.emoji}${fish.name}！价值 ${price} 金币，获得 ${fish.exp} 经验`);
      } else {
        const missReasons = [
          { emoji: '🍃', title: '起风了...', message: '水面泛起细碎的涟漪，鱼儿被吓跑了...', encourage: '静待下次呼吸，好运在路上 🌊' },
          { emoji: '🌊', title: '湖面静谧', message: '湖面波光粼粼，看样子鱼儿们正在水下休息呢...', encourage: '别急，美好的事物值得等待 ✨' },
          { emoji: '🐟', title: '鱼儿调皮', message: '有条鱼好奇地碰了碰鱼钩，摆摆尾巴游走了...', encourage: '换个姿势，再来一次！💪' },
          { emoji: '✨', title: '飞鸟惊鱼', message: '远处的飞鸟掠过水面，惊扰了这一刻的宁静...', encourage: '保持耐心，鱼儿会回来的 🕊️' },
          { emoji: '🌾', title: '捉迷藏', message: '岸边的芦苇随风轻轻摇曳，鱼儿似乎在和你捉迷藏...', encourage: '这就是钓鱼的乐趣，不是吗？😊' },
          { emoji: '☁️', title: '云影掠过', message: '一片云彩遮住了阳光，鱼群似乎游向了深水区...', encourage: '阳光总会再次照亮湖面 ☀️' }
        ];
        const reason = missReasons[Math.floor(Math.random() * missReasons.length)];
        setLastMiss(reason);
        setShowMiss(true);
        addMessage(reason.message);
        setLastCatch(null);
      }
    }, 2000);
  };

  // 卖出单种鱼（全部数量）
  const sellFishGroup = (fishName) => {
    const group = groupedInventory.find(g => g.name === fishName);
    if (!group) return;

    const newMoney = gameState.money + group.totalValue;
    if (!isValidMoney(newMoney)) {
      addMessage('⚠️ 金钱计算错误，出售失败');
      return;
    }

    setGameState(prev => ({
      ...prev,
      money: newMoney,
      caughtFish: prev.caughtFish.filter(f => f.name !== fishName)
    }));
    addMessage(`💰 卖出 ${group.name} ×${group.count}，获得 ${group.totalValue} 金币`);
  };

  // 批量卖鱼（清空库存）
  const sellAllFish = () => {
    if (gameState.caughtFish.length === 0) {
      addMessage('📦 库存中没有鱼');
      return;
    }

    // 计算当前所有鱼的总实际价值
    const totalValue = groupedInventory.reduce((sum, group) => sum + group.totalValue, 0);
    const newMoney = gameState.money + totalValue;
    if (!isValidMoney(newMoney)) {
      addMessage('⚠️ 金钱计算错误，出售失败');
      return;
    }

    setGameState(prev => ({
      ...prev,
      money: newMoney,
      caughtFish: []
    }));
    addMessage(`💰 卖出所有库存，获得 ${totalValue} 金币`);
  };

  // 出售钓竿
  const sellRod = (rodId) => {
    const rod = RODS.find(r => r.id === rodId);
    if (!rod) return;

    // 不能出售当前装备的钓竿
    if (gameState.currentRod === rodId) {
      addMessage('⚠️ 不能出售当前装备的钓竿');
      return;
    }

    // 计算出售价值（6.5折）
    const sellPrice = Math.floor(rod.price * 0.65);
    const newMoney = gameState.money + sellPrice;
    if (!isValidMoney(newMoney)) {
      addMessage('⚠️ 金钱计算错误，出售失败');
      return;
    }

    setGameState(prev => ({
      ...prev,
      money: newMoney,
      inventory: {
        ...prev.inventory,
        rods: prev.inventory.rods.filter(id => id !== rodId)
      }
    }));
    addMessage(`💰 出售${rod.name}，获得 ${sellPrice} 金币`);
  };

  // 出售饵料
  const sellBait = (baitId, amount) => {
    const bait = BAIT.find(b => b.id === baitId);
    if (!bait) return;

    const currentAmount = gameState.inventory.bait[baitId] || 0;
    if (currentAmount <= 0) {
      addMessage('⚠️ 没有可出售的饵料');
      return;
    }

    // 计算出售价值（6.5折）
    const sellPrice = Math.floor(bait.price * 0.65 * amount);
    const newMoney = gameState.money + sellPrice;
    if (!isValidMoney(newMoney)) {
      addMessage('⚠️ 金钱计算错误，出售失败');
      return;
    }

    setGameState(prev => {
      const newBaitAmount = (prev.inventory.bait[baitId] || 0) - amount;
      const newBait = { ...prev.inventory.bait };
      if (newBaitAmount <= 0) {
        delete newBait[baitId];
      } else {
        newBait[baitId] = newBaitAmount;
      }
      return {
        ...prev,
        money: newMoney,
        inventory: {
          ...prev.inventory,
          bait: newBait
        }
      };
    });
    addMessage(`💰 出售${bait.name}×${amount}，获得 ${sellPrice} 金币`);
  };

  // 购买装备
  const buyGear = (item) => {
    if (gameState.money < item.price) {
      addMessage(`💰 金钱不足！需要 ${item.price} 金币`);
      return;
    }

    if ((gameState.inventory.gear || []).includes(item.id)) {
      addMessage(`📦 你已经拥有${item.name}了`);
      return;
    }

    const newMoney = gameState.money - item.price;
    if (!isValidMoney(newMoney)) {
      addMessage(`⚠️ 金钱计算错误，购买失败`);
      return;
    }

    setGameState(prev => ({
      ...prev,
      money: newMoney,
      inventory: {
        ...prev.inventory,
        gear: [...prev.inventory.gear, item.id]
      }
    }));
    addMessage(`✅ 购买${item.name}成功！`);
  };

  // 出售装备
  const sellGear = (itemId) => {
    const item = GEAR.find(g => g.id === itemId);
    if (!item) return;

    // 计算出售价值（6.5折）
    const sellPrice = Math.floor(item.price * 0.65);
    const newMoney = gameState.money + sellPrice;

    if (!isValidMoney(newMoney)) {
      addMessage('⚠️ 金钱计算错误，出售失败');
      return;
    }

    setGameState(prev => ({
      ...prev,
      money: newMoney,
      inventory: {
        ...prev.inventory,
        gear: prev.inventory.gear.filter(id => id !== itemId)
      }
    }));
    addMessage(`💰 出售${item.name}，获得 ${sellPrice} 金币`);
  };

  // 重置游戏
  const resetGame = () => {
    if (window.confirm('确定要重置游戏吗？所有进度将丢失！')) {
      localStorage.removeItem('fishingGameSave');
      localStorage.removeItem('fishingLastLoginDate');
      setGameState({
        money: 500,
        level: 1,
        exp: 0,
        currentLake: null,
        currentRod: null,
        currentBait: null,
        inventory: {
          rods: ['rod1'],
          bait: { bait1: 10 },
          gear: []
        },
        caughtFish: [],
        messages: []
      });
      addMessage('🔄 游戏已重置');
    }
  };

  // 获取当前湖泊信息
  const currentLake = LAKES.find(l => l.id === gameState.currentLake);
  const currentRod = RODS.find(r => r.id === gameState.currentRod);
  const currentBait = BAIT.find(b => b.id === gameState.currentBait);
  const expForNextLevel = getExpForLevel(gameState.level);
  const expPercentage = (gameState.exp / expForNextLevel) * 100;

  return (
    <div className="fishing-game-container">
      {/* 顶部信息栏 */}
      <div className="game-header">
        <div className="level-badge">
          <span className="level-label">Lv.{gameState.level}</span>
        </div>
        <div className="exp-bar">
          <div className="exp-fill" style={{ width: `${expPercentage}%` }}></div>
        </div>
        <div className="money-badge">
          <span className="money-icon">💰</span>
          <span className="money-value">{gameState.money}</span>
        </div>
      </div>

      {/* 当前装备状态 */}
      <div className="equipment-status">
        <div className="status-item">
          <span className="status-label">湖泊:</span>
          <span className="status-value" style={{ color: currentLake?.color || '#666' }}>
            {currentLake ? currentLake.name : '未选择'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">钓竿:</span>
          <span className="status-value" style={{ color: currentRod?.color || '#666' }}>
            {currentRod ? currentRod.name : '未装备'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">饵料:</span>
          <span className="status-value" style={{ color: currentBait?.color || '#666' }}>
            {currentBait ? `${currentBait.name} (${gameState.inventory.bait[gameState.currentBait] || 0})` : '未选择'}
          </span>
        </div>
      </div>

      {/* 钓鱼按钮区域 */}
      <div className="fishing-area">
        {isFishing && (
          <div className="fishing-animation">
            <div className="fishing-icon">🎣</div>
            <div className="fishing-text">钓鱼中...</div>
          </div>
        )}

        {!isFishing && showResult && lastCatch && (
          <div className="catch-result">
            <div className="fish-emoji">{lastCatch.emoji}</div>
            <div className="fish-name" style={{ color: RARITY_COLORS[lastCatch.rarity] }}>
              {lastCatch.name}
            </div>
            <div className="fish-rarity">{RARITY_NAMES[lastCatch.rarity]}</div>
            <div className="fish-reward">+{lastCatch.price} 💰 +{lastCatch.exp} EXP</div>
          </div>
        )}

        {!isFishing && showMiss && lastMiss && (
          <div className="miss-result">
            <div className="miss-emoji">{lastMiss.emoji}</div>
            <div className="miss-title">{lastMiss.title}</div>
            <div className="miss-message">{lastMiss.message}</div>
            <div className="miss-encourage">{lastMiss.encourage}</div>
          </div>
        )}

        {!isFishing && !showResult && !showMiss && (
          <div className="waiting-text">
            选择湖泊和装备后开始钓鱼
          </div>
        )}
      </div>

      {/* 开始钓鱼按钮 */}
      <button
        className={`start-fishing-btn ${isFishing ? 'disabled' : ''}`}
        onClick={startFishing}
        disabled={isFishing}
      >
        {isFishing ? '🎣 钓鱼中...' : '开始钓鱼'}
      </button>

      {/* 功能标签页 */}
      <div className="fishing-tabs-container">
        <button
          className={`fishing-tab-btn ${activeTab === 'fish' ? 'active' : ''}`}
          onClick={() => setActiveTab('fish')}
        >
          🐟 鱼类
        </button>
        <button
          className={`fishing-tab-btn ${activeTab === 'rod' ? 'active' : ''}`}
          onClick={() => setActiveTab('rod')}
        >
          🎣 钓竿
        </button>
        <button
          className={`fishing-tab-btn ${activeTab === 'bait' ? 'active' : ''}`}
          onClick={() => setActiveTab('bait')}
        >
          🪱 饵料
        </button>
        <button
          className={`fishing-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 库存
        </button>
      </div>

      {/* 湖泊选择 */}
      {activeTab === 'fish' && (
        <div className="fishing-tab-content">
          <h3 className="tab-title">🌊 选择湖泊</h3>
          <div className="lakes-grid">
            {LAKES.map(lake => (
              <div
                key={lake.id}
                className={`lake-card ${gameState.level < lake.levelReq ? 'locked' : ''} ${gameState.currentLake === lake.id ? 'selected' : ''}`}
                onClick={() => selectLake(lake)}
              >
                <div className="lake-icon">🏞️</div>
                {gameState.currentLake === lake.id && (
                  <div className="lake-check-mark">✓</div>
                )}
                <div className="lake-name">{lake.name}</div>
                <div className="lake-desc">{lake.description}</div>
                <div className="lake-info">
                  <div className="lake-level">Lv.{lake.levelReq}</div>
                  <div className="lake-cost">
                    {lake.cost === 0 ? '免费' : `${lake.cost} 💰`}
                  </div>
                </div>
                {gameState.level < lake.levelReq && (
                  <div className="lake-lock">🔒 需要Lv.{lake.levelReq}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 渔具商店 */}
      {activeTab === 'rod' && (
        <div className="fishing-tab-content">
          <h3 className="tab-title">🎣 渔具商店</h3>

          <div className="shop-section">
            <h4 className="shop-subtitle">钓竿</h4>
            <div className="rods-grid">
              {RODS.map(rod => {
                const isOwned = (gameState.inventory.rods || []).includes(rod.id);
                const sellPrice = Math.floor(rod.price * 0.65);
                return (
                  <div key={rod.id} className="rod-card">
                    <div className="rod-header">
                      <div className="rod-icon" style={{ backgroundColor: rod.color }}>🎣</div>
                      <div className="rod-info">
                        <div className="rod-name">{rod.name}</div>
                        <div className="rod-power">威力: {rod.power}</div>
                      </div>
                    </div>
                    {isOwned ? (
                      <div className="owned-actions">
                        {gameState.currentRod === rod.id ? (
                          <button className="equip-btn active">已装备</button>
                        ) : (
                          <button
                            className="equip-btn"
                            onClick={() => equipRod(rod.id)}
                          >
                            装备
                          </button>
                        )}
                        <button
                          className="sell-btn-small"
                          onClick={() => sellRod(rod.id)}
                        >
                          出售 ({sellPrice} 💰)
                        </button>
                      </div>
                    ) : (
                      <button
                        className="buy-btn"
                        onClick={() => buyRod(rod)}
                      >
                        购买 ({rod.price} 💰)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="shop-section" style={{ marginTop: '20px' }}>
            <h4 className="shop-subtitle">功能装备</h4>
            <div className="rods-grid">
              {GEAR.map(item => {
                const isOwned = (gameState.inventory.gear || []).includes(item.id);
                const sellPrice = Math.floor(item.price * 0.65);
                return (
                  <div key={item.id} className="rod-card" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' }}>
                    <div className="rod-header">
                      <div className="rod-icon" style={{ backgroundColor: '#6366f1' }}>{item.emoji}</div>
                      <div className="rod-info">
                        <div className="rod-name">{item.name}</div>
                        <div className="rod-power">{item.description}</div>
                      </div>
                    </div>
                    {isOwned ? (
                      <button
                        className="sell-btn-small"
                        onClick={() => sellGear(item.id)}
                      >
                        已拥有 (出售: {sellPrice} 💰)
                      </button>
                    ) : (
                      <button
                        className="buy-btn"
                        onClick={() => buyGear(item)}
                      >
                        购买 ({item.price} 💰)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 饵料购买 */}
      {activeTab === 'bait' && (
        <div className="fishing-tab-content">
          <h3 className="tab-title">🪱 饵料商店</h3>
          <div className="bait-grid">
            {BAIT.map(bait => {
              const amount = (gameState.inventory.bait || {})[bait.id] || 0;
              const sellPrice = Math.floor(bait.price * 0.65);
              return (
                <div key={bait.id} className="bait-card">
                  <div
                    className={`bait-icon ${gameState.currentBait === bait.id ? 'selected' : ''}`}
                    onClick={() => selectBait(bait.id)}
                    style={{ backgroundColor: bait.color }}
                  >
                    🪱
                  </div>
                  <div className="bait-name">{bait.name}</div>
                  <div className="bait-power">吸引力: {bait.power}</div>
                  <div className="bait-quantity">
                    拥有: {amount}
                  </div>
                  <div className="bait-actions">
                    <button
                      className="buy-btn"
                      onClick={() => buyBait(bait.id)}
                    >
                      购买×10 ({bait.price * 10} 💰)
                    </button>
                    {amount > 0 && (
                      <button
                        className="sell-bait-btn"
                        onClick={() => sellBait(bait.id, 10)}
                      >
                        出售×10 ({sellPrice * 10} 💰)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 库存管理 */}
      {activeTab === 'inventory' && (
        <div className="fishing-tab-content">
          <div className="inventory-header">
            <h3 className="tab-title">📦 我的库存</h3>
            {gameState.caughtFish.length > 0 && inventoryTab === 'fish' && (
              <button className="sell-all-btn" onClick={sellAllFish}>
                全部出售
              </button>
            )}
          </div>

          {/* 库存子标签页 */}
          <div className="inventory-sub-tabs">
            <button
              className={`inventory-sub-tab ${inventoryTab === 'fish' ? 'active' : ''}`}
              onClick={() => setInventoryTab('fish')}
            >
              🐟 鱼类
            </button>
            <button
              className={`inventory-sub-tab ${inventoryTab === 'gear' ? 'active' : ''}`}
              onClick={() => setInventoryTab('gear')}
            >
              🎣 渔具
            </button>
            <button
              className={`inventory-sub-tab ${inventoryTab === 'items' ? 'active' : ''}`}
              onClick={() => setInventoryTab('items')}
            >
              📦 物品
            </button>
          </div>

          {/* 鱼类库存 */}
          {inventoryTab === 'fish' && (
            <>
              {gameState.caughtFish.length === 0 ? (
                <div className="empty-inventory">当前没有鱼类，快去钓鱼吧！</div>
              ) : (
                <div className="inventory-grid">
                  {groupedInventory.filter(g => g.rarity !== 'strange').map(group => (
                    <div key={group.name} className="fish-item group-item">
                      <div className="fish-item-badge">×{group.count}</div>
                      <div className="fish-emoji-large">{group.emoji}</div>
                      <div className="fish-item-name" style={{ color: RARITY_COLORS[group.rarity] }}>
                        {group.name}
                      </div>
                      <div className="fish-item-rarity">{RARITY_NAMES[group.rarity]}</div>
                      <button
                        className="sell-btn"
                        onClick={() => sellFishGroup(group.name)}
                      >
                        出售 ({group.totalValue} 💰)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* 渔具库存 (钓具, 饵料, 钓竿) */}
          {inventoryTab === 'gear' && (
            <div className="inventory-grid">
              {/* 1. 钓竿 (Rods) */}
              {(gameState.inventory.rods || []).map(rodId => {
                const rod = RODS.find(r => r.id === rodId);
                if (!rod) return null;
                const sellPrice = Math.floor(rod.price * 0.65);
                return (
                  <div key={rodId} className="fish-item rod-item">
                    <div className="fish-emoji-large" style={{ backgroundColor: rod.color }}>
                      🎣
                    </div>
                    <div className="fish-item-name" style={{ color: rod.color }}>
                      {rod.name}
                    </div>
                    <div className="fish-item-rarity">威力: {rod.power}</div>
                    {gameState.currentRod === rodId ? (
                      <button className="equip-btn active">已装备</button>
                    ) : (
                      <button
                        className="sell-btn"
                        onClick={() => sellRod(rodId)}
                      >
                        出售 ({sellPrice} 💰)
                      </button>
                    )}
                  </div>
                );
              })}

              {/* 2. 饵料 (Bait) */}
              {Object.entries(gameState.inventory.bait || {})
                .filter(([_, amount]) => amount > 0)
                .map(([baitId, amount]) => {
                  const bait = BAIT.find(b => b.id === baitId);
                  if (!bait) return null;
                  const sellPrice = Math.floor(bait.price * 0.65);
                  const sellAmount = Math.min(amount, 10);
                  return (
                    <div key={baitId} className="fish-item bait-item">
                      <div className="fish-item-badge">×{amount}</div>
                      <div className="fish-emoji-large" style={{ backgroundColor: bait.color }}>
                        🪱
                      </div>
                      <div className="fish-item-name" style={{ color: bait.color }}>
                        {bait.name}
                      </div>
                      <div className="fish-item-rarity">吸引力: {bait.power}</div>
                      <button
                        className="sell-btn"
                        onClick={() => sellBait(baitId, sellAmount)}
                      >
                        出售×{sellAmount} ({sellPrice * sellAmount} 💰)
                      </button>
                    </div>
                  );
                })}

              {/* 3. 功能装备 (Gear) */}
              {(gameState.inventory.gear || []).map(itemId => {
                const item = GEAR.find(g => g.id === itemId);
                if (!item) return null;
                const sellPrice = Math.floor(item.price * 0.65);
                return (
                  <div key={itemId} className="fish-item rod-item" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' }}>
                    <div className="fish-emoji-large">
                      {item.emoji}
                    </div>
                    <div className="fish-item-name" style={{ color: '#6366f1' }}>
                      {item.name}
                    </div>
                    <div className="fish-item-rarity">{item.description}</div>
                    <button
                      className="sell-btn"
                      onClick={() => sellGear(itemId)}
                    >
                      出售 ({sellPrice} 💰)
                    </button>
                  </div>
                );
              })}

              {/* 如果所有渔具都为空 */}
              {(gameState.inventory.rods || []).length === 0 &&
                Object.values(gameState.inventory.bait || {}).every(a => a <= 0) &&
                (gameState.inventory.gear || []).length === 0 && (
                  <div className="empty-inventory" style={{ gridColumn: '1/-1' }}>渔具库存为空</div>
                )}
            </div>
          )}

          {/* 物品库存 (奇怪物品) */}
          {inventoryTab === 'items' && (
            <div className="inventory-grid">
              {groupedInventory.filter(g => g.rarity === 'strange').length === 0 ? (
                <div className="empty-inventory" style={{ gridColumn: '1/-1' }}>物品库存为空</div>
              ) : (
                groupedInventory.filter(g => g.rarity === 'strange').map(group => (
                  <div key={group.name} className="fish-item group-item" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                    <div className="fish-item-badge">×{group.count}</div>
                    <div className="fish-emoji-large">{group.emoji}</div>
                    <div className="fish-item-name" style={{ color: '#d97706' }}>
                      {group.name}
                    </div>
                    <div className="fish-item-rarity">奇怪物品</div>
                    <button
                      className="sell-btn"
                      onClick={() => sellFishGroup(group.name)}
                    >
                      出售 ({group.totalValue} 💰)
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* 消息区域 */}
      <div className="messages-container">
        <h4 className="messages-title">📢 消息</h4>
        <div className="messages-list">
          {gameState.messages.length === 0 ? (
            <div className="no-messages">暂无消息</div>
          ) : (
            gameState.messages.map((msg, index) => (
              <div key={index} className="message-item">
                {msg}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 重置按钮 */}
      <button className="reset-btn" onClick={resetGame}>
        🔄 重置游戏
      </button>
    </div>
  );
};

export default FishingGamePage;
