import { useState, useEffect, useCallback, useMemo } from 'react';
import './FishingGamePage.css';

/**
 * 游戏配置数据
 */
const LAKES = [
  { id: 'lake1', name: '太湖', description: '中国五大淡水湖之一，鱼产丰富，适合新手', cost: 0, fish: ['crucian', 'carp', 'silver_carp'], color: '#60a5fa' },
  { id: 'lake2', name: '西湖', description: '淡妆浓抹总相宜，水质清澈，多锦鲤与鲈鱼', cost: 50, fish: ['crucian', 'carp', 'perch', 'bass'], color: '#34d399' },
  { id: 'lake3', name: '贝加尔湖', description: '世界最深湖泊，拥有独特的淡水海豹与哲罗鲑', cost: 150, fish: ['carp', 'taimen', 'bass', 'pike'], color: '#3b82f6' },
  { id: 'lake4', name: '苏必利尔湖', description: '世界面积最大淡水湖，多大尺寸北美鱼类', cost: 300, fish: ['perch', 'salmon', 'pike', 'sturgeon'], color: '#6366f1' },
  { id: 'lake5', name: '维多利亚湖', description: '非洲最大湖泊，出产巨大的尼罗河鲈鱼', cost: 600, fish: ['bass', 'pike', 'sturgeon', 'nile_perch'], color: '#f59e0b' },
  { id: 'lake6', name: '青海湖', description: '中国最大内陆湖，特产高原湟鱼', cost: 1200, fish: ['naked_carp', 'pike', 'sturgeon'], color: '#22d3ee' },
  { id: 'lake7', name: '尼斯湖', description: '苏格兰神秘湖泊，或许能钓到传说中的生物', cost: 2500, fish: ['salmon', 'sturgeon', 'nessie_eel'], color: '#4b5563' },
  { id: 'lake8', name: '里海', description: '世界最大咸水湖，盛产顶级鲟鱼与鱼子酱', cost: 6000, fish: ['kaluga', 'chinese_sturgeon', 'sturgeon'], color: '#1e3a8a' }
];

const RODS = [
  { id: 'rod1', name: '竹竿', power: 10, price: 0, color: '#9ca3af' },
  { id: 'rod2', name: '碳素竿', power: 25, price: 200, color: '#6b7280' },
  { id: 'rod3', name: '钛合金竿', power: 50, price: 500, color: '#4b5563' },
  { id: 'rod4', name: '传奇神竿', power: 80, price: 1200, color: '#f59e0b' },
  { id: 'rod5', name: '虚空之握', power: 95, price: 3000, color: '#6366f1' },
  { id: 'rod6', name: '因果律之丝', power: 100, price: 10000, color: '#ec4899' }
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

const FISH_TYPES = {
  crucian: { name: '鲫鱼', rarity: 'common', basePrice: 15, exp: 5, emoji: '🐟' },
  carp: { name: '鲤鱼', rarity: 'common', basePrice: 20, exp: 8, emoji: '🐠' },
  silver_carp: { name: '白鲢', rarity: 'common', basePrice: 25, exp: 10, emoji: '🐟' },
  perch: { name: '鲈鱼', rarity: 'rare', basePrice: 50, exp: 20, emoji: '🐟' },
  bass: { name: '大口黑鲈', rarity: 'rare', basePrice: 65, exp: 25, emoji: '🐠' },
  pike: { name: '白斑狗鱼', rarity: 'epic', basePrice: 120, exp: 50, emoji: '🐊' },
  taimen: { name: '哲罗鲑', rarity: 'epic', basePrice: 180, exp: 80, emoji: '🐟' },
  salmon: { name: '大西洋鲑', rarity: 'epic', basePrice: 220, exp: 100, emoji: '🍣' },
  sturgeon: { name: '施氏鲟', rarity: 'legendary', basePrice: 400, exp: 200, emoji: '🌟' },
  nile_perch: { name: '尼罗河鲈鱼', rarity: 'legendary', basePrice: 550, exp: 300, emoji: '🦈' },
  naked_carp: { name: '青海湖湟鱼', rarity: 'epic', basePrice: 350, exp: 180, emoji: '🐡' },
  nessie_eel: { name: '尼斯湖巨型鳗', rarity: 'legendary', basePrice: 900, exp: 500, emoji: '🐉' },
  kaluga: { name: '达氏鳇', rarity: 'legendary', basePrice: 1500, exp: 800, emoji: '🐋' },
  chinese_sturgeon: { name: '中华鲟', rarity: 'legendary', basePrice: 2000, exp: 1200, emoji: '🐲' }
};

const RARITY_COLORS = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b'
};

const RARITY_NAMES = {
  common: '普通',
  rare: '稀有',
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
      bait: { bait1: 10 }
    },
    caughtFish: [],
    messages: []
  });

  // 钓鱼状态
  const [isFishing, setIsFishing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastCatch, setLastCatch] = useState(null);
  const [activeTab, setActiveTab] = useState('fish');

  // 从本地存储加载游戏数据
  useEffect(() => {
    const savedData = localStorage.getItem('fishingGameSave');
    let currentGameState = gameState;

    if (savedData) {
      try {
        currentGameState = JSON.parse(savedData);
        setGameState(currentGameState);
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
        setGameState(prev => ({
          ...prev,
          money: prev.money + 100
        }));
        addMessage('🎁 每日登录奖励：获得 100 金币！');
      }, 1000);
    }
  }, []);

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
      const rarityMultipliers = { common: 1, rare: 1.5, epic: 2.5, legendary: 4 };
      const currentPrice = Math.floor(fish.basePrice * rarityMultipliers[fish.rarity]);
      groups[fish.name].totalValue += currentPrice;
      groups[fish.name].ids.push(fish.id);
    });
    return Object.values(groups);
  }, [gameState.caughtFish]);

  // 添加消息
  const addMessage = useCallback((text) => {
    setGameState(prev => ({
      ...prev,
      messages: [text, ...prev.messages].slice(0, 10)
    }));
  }, []);

  // 选择湖泊
  const selectLake = (lake) => {
    if (gameState.money < lake.cost) {
      addMessage(`💰 金钱不足！需要 ${lake.cost} 金币`);
      return;
    }

    const newState = { ...gameState };
    if (lake.cost > 0) {
      newState.money -= lake.cost;
      addMessage(`🚣 已到达${lake.name}，花费 ${lake.cost} 金币`);
    } else {
      addMessage(`🚣 已到达${lake.name}`);
    }
    newState.currentLake = lake.id;
    setGameState(newState);
  };

  // 购买钓竿
  const buyRod = (rod) => {
    if (gameState.money < rod.price) {
      addMessage(`💰 金钱不足！需要 ${rod.price} 金币`);
      return;
    }

    if (gameState.inventory.rods.includes(rod.id)) {
      addMessage(`🎣 你已经拥有${rod.name}了`);
      return;
    }

    const newState = { ...gameState };
    newState.money -= rod.price;
    newState.inventory.rods.push(rod.id);
    newState.currentRod = rod.id;
    addMessage(`✅ 购买${rod.name}成功！`);
    setGameState(newState);
  };

  // 购买饵料
  const buyBait = (baitType, amount = 10) => {
    const bait = BAIT.find(b => b.id === baitType);
    if (!bait) return;

    const totalCost = bait.price * amount;
    if (gameState.money < totalCost) {
      addMessage(`💰 金钱不足！需要 ${totalCost} 金币`);
      return;
    }

    const newState = { ...gameState };
    newState.money -= totalCost;
    newState.inventory.bait[baitType] = (newState.inventory.bait[baitType] || 0) + amount;
    newState.currentBait = baitType;
    addMessage(`✅ 购买${bait.name}×${amount}成功！`);
    setGameState(newState);
  };

  // 装备钓竿
  const equipRod = (rodId) => {
    if (!gameState.inventory.rods.includes(rodId)) return;
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

  // 计算钓鱼成功率
  const calculateSuccessRate = () => {
    const rod = RODS.find(r => r.id === gameState.currentRod);
    const bait = BAIT.find(b => b.id === gameState.currentBait);

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

    if (!gameState.currentBait || !gameState.inventory.bait[gameState.currentBait] ||
      gameState.inventory.bait[gameState.currentBait] <= 0) {
      addMessage('⚠️ 饵料不足，请先购买');
      return;
    }

    const successRate = calculateSuccessRate();
    const isSuccess = Math.random() < successRate;

    setIsFishing(true);
    setShowResult(false);

    // 消耗饵料
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        bait: {
          ...prev.inventory.bait,
          [prev.currentBait]: prev.inventory.bait[prev.currentBait] - 1
        }
      }
    }));

    setTimeout(() => {
      setIsFishing(false);

      if (isSuccess) {
        // 随机选择鱼种
        const currentLakeId = gameState.currentLake;
        const lake = LAKES.find(l => l.id === currentLakeId);
        const fishType = lake.fish[Math.floor(Math.random() * lake.fish.length)];
        const fish = FISH_TYPES[fishType];

        // 计算价值（受稀有度影响）
        const rarityMultipliers = { common: 1, rare: 1.5, epic: 2.5, legendary: 4 };
        const price = Math.floor(fish.basePrice * rarityMultipliers[fish.rarity]);

        setGameState(prev => {
          const newCaughtFish = [
            ...prev.caughtFish,
            { ...fish, id: Date.now(), date: new Date().toISOString() }
          ];

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
        addMessage('😞 这次运气不太好，没有钓到鱼...');
        setLastCatch(null);
      }
    }, 2000);
  };

  // 卖出单种鱼（全部数量）
  const sellFishGroup = (fishName) => {
    const group = groupedInventory.find(g => g.name === fishName);
    if (!group) return;

    const newState = { ...gameState };
    newState.caughtFish = newState.caughtFish.filter(f => f.name !== fishName);
    newState.money += group.totalValue;
    addMessage(`💰 卖出 ${group.name} ×${group.count}，获得 ${group.totalValue} 金币`);
    setGameState(newState);
  };

  // 批量卖鱼（清空库存）
  const sellAllFish = () => {
    if (gameState.caughtFish.length === 0) {
      addMessage('📦 库存中没有鱼');
      return;
    }

    // 计算当前所有鱼的总实际价值
    const totalValue = groupedInventory.reduce((sum, group) => sum + group.totalValue, 0);
    const newState = { ...gameState };
    newState.money += totalValue;
    newState.caughtFish = [];
    addMessage(`💰 卖出所有库存，获得 ${totalValue} 金币`);
    setGameState(newState);
  };

  // 重置游戏
  const resetGame = () => {
    if (window.confirm('确定要重置游戏吗？所有进度将丢失！')) {
      localStorage.removeItem('fishingGameSave');
      setGameState({
        money: 300,
        level: 1,
        exp: 0,
        currentLake: null,
        currentRod: null,
        currentBait: null,
        inventory: {
          rods: ['rod1'],
          bait: { bait1: 10 }
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

        {!isFishing && !showResult && (
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
                className={`lake-card ${gameState.currentLake === lake.id ? 'selected' : ''}`}
                onClick={() => selectLake(lake)}
              >
                <div className="lake-icon">🏞️</div>
                <div className="lake-name">{lake.name}</div>
                <div className="lake-desc">{lake.description}</div>
                <div className="lake-cost">
                  {lake.cost === 0 ? '免费' : `${lake.cost} 💰`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 钓竿购买 */}
      {activeTab === 'rod' && (
        <div className="fishing-tab-content">
          <h3 className="tab-title">🎣 钓竿商店</h3>
          <div className="rods-grid">
            {RODS.map(rod => (
              <div key={rod.id} className="rod-card">
                <div className="rod-header">
                  <div className="rod-icon" style={{ backgroundColor: rod.color }}>🎣</div>
                  <div className="rod-info">
                    <div className="rod-name">{rod.name}</div>
                    <div className="rod-power">威力: {rod.power}</div>
                  </div>
                </div>
                {gameState.inventory.rods.includes(rod.id) ? (
                  <button
                    className={`equip-btn ${gameState.currentRod === rod.id ? 'active' : ''}`}
                    onClick={() => equipRod(rod.id)}
                  >
                    {gameState.currentRod === rod.id ? '已装备' : '装备'}
                  </button>
                ) : (
                  <button
                    className="buy-btn"
                    onClick={() => buyRod(rod)}
                  >
                    购买 ({rod.price} 💰)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 饵料购买 */}
      {activeTab === 'bait' && (
        <div className="fishing-tab-content">
          <h3 className="tab-title">🪱 饵料商店</h3>
          <div className="bait-grid">
            {BAIT.map(bait => (
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
                  拥有: {gameState.inventory.bait[bait.id] || 0}
                </div>
                <button
                  className="buy-btn"
                  onClick={() => buyBait(bait.id)}
                >
                  购买×10 ({bait.price * 10} 💰)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 库存管理 */}
      {activeTab === 'inventory' && (
        <div className="fishing-tab-content">
          <div className="inventory-header">
            <h3 className="tab-title">📦 我的库存</h3>
            {gameState.caughtFish.length > 0 && (
              <button className="sell-all-btn" onClick={sellAllFish}>
                全部出售
              </button>
            )}
          </div>
          {groupedInventory.length === 0 ? (
            <div className="empty-inventory">库存为空</div>
          ) : (
            <div className="inventory-grid">
              {groupedInventory.map(group => (
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
                    出售此种 ({group.totalValue} 💰)
                  </button>
                </div>
              ))}
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
