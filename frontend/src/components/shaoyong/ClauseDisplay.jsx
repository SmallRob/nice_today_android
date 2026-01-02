import React, { useState, useEffect } from 'react';
import './ClauseDisplay.css';

const ClauseDisplay = ({ calculationResult, onClauseSelect, selectedClause }) => {
  const [clauses, setClauses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 模拟铁板神数条文库
  const clauseDatabase = [
    // 父母相关
    {
      id: 125, number: 1024, category: '父母', title: '父先母后',
      content: '父在母先亡，椿庭早谢，萱堂独守。',
      interpretation: '父亲会比母亲早去世，母亲会守寡或独居较长一段时间。',
      details: '此条文暗示父亲寿命不如母亲，家庭中母亲承担更多责任。'
    },

    {
      id: 126, number: 1568, category: '父母', title: '双亲俱庆',
      content: '父母双全，椿萱并茂，寿考维祺。',
      interpretation: '父母都健在，且健康长寿，家庭和睦。',
      details: '命主父母缘分深厚，能得到父母的关爱和支持。'
    },

    // 兄弟姐妹
    {
      id: 127, number: 2345, category: '兄弟', title: '兄弟三人',
      content: '昆玉三人，雁行有序，手足情深。',
      interpretation: '共有兄弟姐妹三人，排行有序，关系和睦。',
      details: '命中有三个兄弟姐妹，彼此关系融洽，能互相帮助。'
    },

    {
      id: 128, number: 2789, category: '兄弟', title: '独子之命',
      content: '孤雁单飞，独木难支，六亲少靠。',
      interpretation: '独生子女，缺少兄弟姐妹的帮助和支持。',
      details: '命中无兄弟姐妹，凡事需自力更生，亲缘较淡。'
    },

    // 婚姻
    {
      id: 129, number: 3456, category: '婚姻', title: '早婚之象',
      content: '红鸾早动，二十及笄，即可于归。',
      interpretation: '早婚的征兆，可能在20岁左右结婚。',
      details: '夫妻宫早动，适合早婚，婚姻稳定。'
    },

    {
      id: 130, number: 3890, category: '婚姻', title: '晚婚为宜',
      content: '凤冠霞帔，三十方遂，琴瑟和鸣。',
      interpretation: '适合晚婚，30岁左右婚姻才能稳定幸福。',
      details: '夫妻宫较晚发挥作用，晚婚更有利婚姻稳定。'
    },

    // 子女
    {
      id: 131, number: 4567, category: '子女', title: '子女双全',
      content: '弄璋弄瓦，儿女成双，兰桂齐芳。',
      interpretation: '会有儿子和女儿，子女都有出息。',
      details: '命中子女运佳，会有至少一子一女，子女孝顺有成就。'
    },

    {
      id: 132, number: 4789, category: '子女', title: '一子送终',
      content: '麒麟送子，独子承欢，养老送终。',
      interpretation: '只有一个儿子，但能孝顺送终。',
      details: '子息较薄，但儿子孝顺，晚年有靠。'
    },

    // 事业财运
    {
      id: 133, number: 5123, category: '事业', title: '官运亨通',
      content: '朱衣点头，官至七品，光耀门楣。',
      interpretation: '有官职在身，能当到七品官，为家族争光。',
      details: '命带官星，适合公务员或管理工作，有一定职位。'
    },

    {
      id: 134, number: 5678, category: '财运', title: '财源广进',
      content: '金玉满堂，财源滚滚，富甲一方。',
      interpretation: '财运很好，能积累大量财富。',
      details: '财星得地，一生不缺钱财，适合经商或投资。'
    },

    // 健康寿命
    {
      id: 135, number: 6234, category: '健康', title: '寿至古稀',
      content: '寿比南山，七旬有余，福寿双全。',
      interpretation: '能活到70岁以上，福气长寿兼备。',
      details: '寿命较长，晚年健康，享受天伦之乐。'
    },

    {
      id: 136, number: 6789, category: '健康', title: '中年有坎',
      content: '四旬有厄，病符侵扰，谨慎为宜。',
      interpretation: '40岁左右会有健康方面的挑战。',
      details: '中年时期要注意身体健康，特别是消化系统。'
    },

    // 特殊命格
    {
      id: 137, number: 7890, category: '命格', title: '文昌入命',
      content: '文曲照命，才高八斗，学富五车。',
      interpretation: '有文采，学识渊博，适合文化教育行业。',
      details: '命带文昌星，聪明好学，在文化学术方面有成就。'
    },

    {
      id: 138, number: 8234, category: '命格', title: '将星护体',
      content: '将星在命，武职显达，威震四方。',
      interpretation: '有领导才能，适合军警或管理工作。',
      details: '命带将星，有权威和领导力，能担当重任。'
    }
  ];

  // 模拟抽取条文
  useEffect(() => {
    if (calculationResult?.clauseNumbers) {
      setIsLoading(true);

      // 模拟网络延迟
      setTimeout(() => {
        // 从数据库中匹配条文
        const matchedClauses = calculationResult.clauseNumbers.map(num => {
          // 找对应的条文，如果找不到则随机选一个
          const found = clauseDatabase.find(c => c.number === num);
          if (found) return found;

          // 没找到就随机选一个，但保持编号
          const randomClause = clauseDatabase[Math.floor(Math.random() * clauseDatabase.length)];
          return {
            ...randomClause,
            number: num,
            isRandomMatch: true
          };
        });

        setClauses(matchedClauses);
        setIsLoading(false);

        // 默认选择第一条
        if (matchedClauses.length > 0 && !selectedClause) {
          onClauseSelect(matchedClauses[0]);
        }
      }, 1500);
    }
  }, [calculationResult]);

  // 过滤条文
  const filteredClauses = clauses.filter(clause => {
    const matchesCategory = activeTab === 'all' || clause.category === activeTab;
    const matchesSearch = searchQuery === '' ||
      clause.content.includes(searchQuery) ||
      clause.interpretation.includes(searchQuery) ||
      clause.title.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // 分类统计
  const categoryStats = clauses.reduce((stats, clause) => {
    stats[clause.category] = (stats[clause.category] || 0) + 1;
    return stats;
  }, {});

  const categories = ['all', '父母', '兄弟', '婚姻', '子女', '事业', '财运', '健康', '命格'];

  return (
    <div className="clause-display">
      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>正在从万条文库中抽取神数条文...</p>
          <p className="loading-details">已定位 {calculationResult?.clauseNumbers?.length || 0} 条编号</p>
        </div>
      ) : clauses.length === 0 ? (
        <div className="no-clauses">
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h4>等待抽取条文</h4>
            <p>完成皇极起数计算后，将显示抽取的铁板神数条文</p>
          </div>
        </div>
      ) : (
        <>
          <div className="clause-header-section">
            <div className="clause-summary">
              <h3>神数条文抽取结果</h3>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-value">{filteredClauses.length}</span>
                  <span className="stat-label">条文数量</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{Object.keys(categoryStats).length}</span>
                  <span className="stat-label">分类数</span>
                </div>
              </div>
            </div>

            <div className="clause-controls">
              <div className="tab-navigation">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`tab-btn ${activeTab === category ? 'active' : ''}`}
                    onClick={() => setActiveTab(category)}
                  >
                    {category === 'all' ? '全部' : category}
                    {categoryStats[category] && (
                      <span className="tab-count">{categoryStats[category]}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="search-and-filter">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="搜索条文内容..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="search-icon">🔍</span>
                </div>
                
                <div className="clause-confidence">
                  <label>置信度</label>
                  <select>
                    <option value="all">全部</option>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="clauses-container">
            <div className="clause-list-section">
              <div className="clause-filters">
                <div className="filter-controls">
                  <button className="filter-btn active">最新</button>
                  <button className="filter-btn">相关性</button>
                  <button className="filter-btn">分类</button>
                </div>
              </div>
              
              <div className="clause-list">
                {filteredClauses.map((clause, index) => (
                  <div
                    key={clause.id || index}
                    className={`clause-item ${selectedClause?.id === clause.id ? 'selected' : ''}`}
                    onClick={() => onClauseSelect(clause)}
                  >
                    <div className="clause-header">
                      <div className="clause-id-info">
                        <span className="clause-number">第{clause.number}条</span>
                        <span className="clause-category">{clause.category}</span>
                      </div>
                      <div className="clause-confidence-indicator high">高信度</div>
                    </div>
                    <div className="clause-title">{clause.title}</div>
                    <div className="clause-content">{clause.content}</div>
                    <div className="clause-interpretation">{clause.interpretation}</div>
                    <div className="clause-actions">
                      <button className="action-btn">关联</button>
                      <button className="action-btn">收藏</button>
                      <button className="action-btn">分享</button>
                    </div>
                    {clause.isRandomMatch && (
                      <div className="random-match-tag">模拟匹配</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="clause-detail-panel">
              {selectedClause ? (
                <div className="detail-container">
                  <div className="detail-header">
                    <div className="detail-title">{selectedClause.title}</div>
                    <div className="detail-meta">
                      <span className="meta-item">编号: {selectedClause.number}</span>
                      <span className="meta-item">分类: {selectedClause.category}</span>
                      <span className="meta-item confidence high">高信度</span>
                    </div>
                  </div>

                  <div className="detail-content">
                    <div className="detail-section">
                      <h5>神数原文</h5>
                      <p className="original-text">{selectedClause.content}</p>
                    </div>

                    <div className="detail-section">
                      <h5>条文解读</h5>
                      <p className="interpretation-text">{selectedClause.interpretation}</p>
                    </div>

                    <div className="detail-section">
                      <h5>详细解析</h5>
                      <p className="detailed-text">{selectedClause.details}</p>
                    </div>

                    <div className="detail-section related-clauses">
                      <h5>相关条文</h5>
                      <div className="related-list">
                        {clauses
                          .filter(c => c.category === selectedClause.category && c.id !== selectedClause.id)
                          .slice(0, 3)
                          .map(related => (
                            <div 
                              key={related.id} 
                              className="related-item"
                              onClick={(e) => {
                                e.stopPropagation();
                                onClauseSelect(related);
                              }}
                            >
                              <span className="related-number">{related.number}</span>
                              <span className="related-title">{related.title}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    <div className="detail-section interpretation-context">
                      <h5>八字关联分析</h5>
                      <div className="context-analysis">
                        <p>根据您的八字信息，此条文与您的命局具有较高相关性，特别是在{selectedClause.category}方面有显著体现。</p>
                      </div>
                    </div>
                  </div>

                  <div className="detail-actions">
                    <button className="action-btn primary">深度解读</button>
                    <button className="action-btn secondary">添加笔记</button>
                    <button className="action-btn secondary">分享结果</button>
                  </div>
                </div>
              ) : (
                <div className="no-clause-selected">
                  <div className="icon">📖</div>
                  <h4>选择条文查看详情</h4>
                  <p>点击左侧条文卡片查看详细解读和分析</p>
                  <div className="selection-tips">
                    <p>💡 提示：可按分类筛选或使用搜索功能快速定位相关条文</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="clause-insights-section">
            <h4>铁板神数解读指南</h4>
            <div className="insights-grid">
              <div className="insight-card">
                <div className="card-icon">🔍</div>
                <h6>条文特点</h6>
                <p>铁板神数条文语言精炼，信息量大，往往一句包含多层含义。</p>
              </div>
              <div className="insight-card">
                <div className="card-icon">📋</div>
                <h6>查条方法</h6>
                <p>传统查条需用算盘计算，现代可用计算机辅助，但原理不变。</p>
              </div>
              <div className="insight-card">
                <div className="card-icon">✅</div>
                <h6>验证方法</h6>
                <p>可通过已知事实验证前几条条文，确认计算准确后再看未来。</p>
              </div>
              <div className="insight-card">
                <div className="card-icon">🌟</div>
                <h6>应用原则</h6>
                <p>知命而不认命，了解命运是为了更好地把握和改善人生。</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClauseDisplay;