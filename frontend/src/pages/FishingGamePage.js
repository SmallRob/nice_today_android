import { useState, useEffect, useCallback } from 'react';
import './FishingGamePage.css';

/**
 * 游戏配置数据
 */
const LAKES = [
  { id: 'lake1', name: '宁静湖', description: '适合新手，鱼种丰富', cost: 0, fish: ['goldfish', 'carp', 'catfish'], color: '#60a5fa' },
  { id: 'lake2', name: '翡翠湖', description: '水质清澈，鱼种稀有', cost: 50, fish: ['goldfish', 'carp', 'perch', 'bass'], color: '#34d399' },
  { id: 'lake3', name: '深蓝湖', description: '深度较深，大鱼出没', cost: 100, fish: ['carp', 'catfish', 'bass', 'pike'], color: '#3b82f6' },
  { id: 'lake4', name: '神秘湖', description: '传说之地，稀有鱼类', cost: 200, fish: ['perch', 'bass', 'pike', 'golden_fish'], color: '#a855f7' },
  { id: 'lake5', name: '龙潭', description: '顶级钓场，传说级鱼类', cost: 500, fish: ['bass', 'pike', 'golden_fish', 'dragon_fish'], color: '#f59e0b' }
];

const RODS = [
  { id: 'rod1', name: '竹竿', power: 10, price: 0, color: '#9ca3af' },
  { id: 'rod2', name: '碳素竿', power: 25, price: 200, color: '#6b7280' },
  { id: 'rod3', name: '钛合金竿', power: 50, price: 500, color: '#4b5563' },
  { id: 'rod4', name: '传奇神竿', power: 80, price: 1000, color: '#f59e0b' }
];

const BAIT = [
  { id: 'bait1', name: '蚯蚓', power: 10, price: 5, color: '#78716c' },
  { id: 'bait2', name: '面团', power: 20, price: 10, color: '#fef3c7' },
  { id: 'bait3', name: '玉米', power: 35, price: 20, color: '#fcd34d' },
  { id: 'bait4', name: '虾米', power: 50, price: 50, color: '#fb923c' },
  { id: 'bait5', name: '金珠', power: 80, price: 100, color: '#fbbf24' }
];

const FISH_TYPES = {
  goldfish: { name: '金鱼', rarity: 'common', basePrice: 10, exp: 5, emoji: '🐟' },
  carp: { name: '鲤鱼', rarity: 'common', basePrice: 15, exp: 8, emoji: '🐠' },
  catfish: { name: '鲶鱼', rarity: 'rare', basePrice: 30, exp: 15, emoji: '🐡' },
  perch: { name: '鲈鱼', rarity: 'rare', basePrice: 40, exp: 20, emoji: '🐟' },
  bass: { name: '黑鲈', rarity: 'epic', basePrice: 80, exp: 40, emoji: '🦈' },
  pike: { name: '狗鱼', rarity: 'epic', basePrice: 100, exp: 50, emoji: '🐊' },
  golden_fish: { name: '金鳞鱼', rarity: 'legendary', basePrice: 200, exp: 100, emoji: '🌟' },
  dragon_fish: { name: '龙纹鱼', rarity: 'legendary', basePrice: 500, exp: 250, emoji: '🐉' }
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

  // 钓鱼状态
  const [isFishing, setIsFishing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastCatch, setLastCatch] = useState(null);
  const [activeTab, setActiveTab] = useState('fish');

  // 从本地存储加载游戏数据
  useEffect(() => {
    const savedData = localStorage.getItem('fishingGameSave');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setGameState(parsed);
      } catch (error) {
        console.error('加载游戏数据失败:', error);
      }
    } else {
      // 新游戏，显示欢迎消息
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          messages: [
            '🎮 欢迎来到钓了么！初始资金：300金币，蚯蚓×10',
            '💡 提示：先选择湖泊，装备钓竿和饵料，然后开始钓鱼！'
          ]
        }));
      }, 500);
    }
  }, []);

  // 自动保存游戏数据
  useEffect(() => {
    if (gameState.money !== 300 || gameState.level !== 1 || gameState.messages.length > 2) {
      localStorage.setItem('fishingGameSave', JSON.stringify(gameState));
    }
  }, [gameState]);

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
    const newState = { ...gameState };
    newState.inventory.bait[gameState.currentBait]--;
    
    setTimeout(() => {
      setIsFishing(false);
      
      if (isSuccess) {
        // 随机选择鱼种
        const lake = LAKES.find(l => l.id === gameState.currentLake);
        const fishType = lake.fish[Math.floor(Math.random() * lake.fish.length)];
        const fish = FISH_TYPES[fishType];
        
        // 计算价值（受稀有度影响）
        const rarityMultipliers = { common: 1, rare: 1.5, epic: 2.5, legendary: 4 };
        const price = Math.floor(fish.basePrice * rarityMultipliers[fish.rarity]);
        
        // 添加到库存
        newState.caughtFish.push({ ...fish, id: Date.now(), date: new Date().toISOString() });
        newState.money += price;
        newState.exp += fish.exp;
        
        // 检查升级
        const expForLevel = getExpForLevel(newState.level);
        while (newState.exp >= expForLevel) {
          newState.exp -= expForLevel;
          newState.level++;
          addMessage(`🎉 恭喜升级！当前等级：${newState.level}`);
        }
        
        setLastCatch({ ...fish, price });
        setShowResult(true);
        addMessage(`🎉 钓到了${fish.emoji}${fish.name}！获得 ${price} 金币，${fish.exp} 经验`);
      } else {
        addMessage('😞 这次运气不太好，没有钓到鱼...');
        setLastCatch(null);
      }
      
      setGameState(newState);
    }, 2000);
  };

  // 卖鱼
  const sellFish = (fishId, price) => {
    const newState = { ...gameState };
    newState.caughtFish = newState.caughtFish.filter(f => f.id !== fishId);
    newState.money += price;
    addMessage(`💰 卖出鱼获得 ${price} 金币`);
    setGameState(newState);
  };

  // 批量卖鱼
  const sellAllFish = () => {
    if (gameState.caughtFish.length === 0) {
      addMessage('📦 库存中没有鱼');
      return;
    }
    
    const totalMoney = gameState.caughtFish.reduce((sum, fish) => sum + fish.basePrice, 0);
    const newState = { ...gameState };
    newState.money += totalMoney;
    newState.caughtFish = [];
    addMessage(`💰 批量卖出所有鱼，获得 ${totalMoney} 金币`);
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
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'fish' ? 'active' : ''}`}
          onClick={() => setActiveTab('fish')}
        >
          🐟 鱼类
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rod' ? 'active' : ''}`}
          onClick={() => setActiveTab('rod')}
        >
          🎣 钓竿
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bait' ? 'active' : ''}`}
          onClick={() => setActiveTab('bait')}
        >
          🪱 饵料
        </button>
        <button 
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          📦 库存
        </button>
      </div>

      {/* 湖泊选择 */}
      {activeTab === 'fish' && (
        <div className="tab-content">
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
        <div className="tab-content">
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
        <div className="tab-content">
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
        <div className="tab-content">
          <div className="inventory-header">
            <h3 className="tab-title">📦 我的库存</h3>
            {gameState.caughtFish.length > 0 && (
              <button className="sell-all-btn" onClick={sellAllFish}>
                全部出售
              </button>
            )}
          </div>
          {gameState.caughtFish.length === 0 ? (
            <div className="empty-inventory">库存为空</div>
          ) : (
            <div className="inventory-grid">
              {gameState.caughtFish.map(fish => (
                <div key={fish.id} className="fish-item">
                  <div className="fish-emoji-large">{fish.emoji}</div>
                  <div className="fish-item-name" style={{ color: RARITY_COLORS[fish.rarity] }}>
                    {fish.name}
                  </div>
                  <div className="fish-item-rarity">{RARITY_NAMES[fish.rarity]}</div>
                  <button 
                    className="sell-btn"
                    onClick={() => sellFish(fish.id, fish.basePrice)}
                  >
                    出售 ({fish.basePrice} 💰)
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
