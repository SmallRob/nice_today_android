import { useState, useEffect } from 'react';
import { Button } from './PageLayout';
import { calculateFiveGrids, getCharStrokes, getMeaning } from '../utils/nameScoring';

// 将五格评分转换为100分制综合评分
const calculateTotalScore = (scoreResult) => {
  if (!scoreResult) return 0;

  const calculateGridScore = (gridValue) => {
    const meaning = getMeaning(gridValue);
    if (meaning.type === '吉') return 20;
    if (meaning.type === '半吉') return 15;
    return 5;
  };

  const tianScore = calculateGridScore(scoreResult.tian);
  const renScore = calculateGridScore(scoreResult.ren);
  const diScore = calculateGridScore(scoreResult.di);
  const waiScore = calculateGridScore(scoreResult.wai);
  const zongScore = calculateGridScore(scoreResult.zong);

  const totalScore = tianScore + renScore + diScore + waiScore + zongScore;

  return Math.round(totalScore);
};

// 姓名评分模态框组件
export const NameScoringModal = ({ isOpen, onClose, name, isPersonal = false, onSaveScore, showMessage }) => {
  const [step, setStep] = useState('input'); // input, result
  const [tempName, setTempName] = useState(''); // 临时输入的姓名
  const [splitName, setSplitName] = useState({ surname: '', firstName: '' });
  const [strokes, setStrokes] = useState({ surname: [], firstName: [] });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasCalculatedBefore, setHasCalculatedBefore] = useState(false); // 是否已经计算过

  // 智能拆分中文姓名
  const smartSplitName = (fullName) => {
    if (!fullName) return { surname: '', firstName: '' };

    // 常见复姓列表
    const compoundSurnames = [
      '欧阳', '太史', '端木', '上官', '司马', '东方', '独孤', '南宫', '万俟', '闻人',
      '夏侯', '诸葛', '尉迟', '公羊', '赫连', '澹台', '皇甫', '宗政', '濮阳', '公冶',
      '太叔', '申屠', '公孙', '慕容', '仲孙', '钟离', '长孙', '宇文', '司徒', '鲜于',
      '司空', '闾丘', '子车', '亓官', '司寇', '巫马', '公西', '颛孙', '壤驷', '公良',
      '漆雕', '乐正', '宰父', '谷梁', '拓跋', '夹谷', '轩辕', '令狐', '段干', '百里',
      '呼延', '东郭', '南门', '羊舌', '微生', '公户', '公玉', '公仪', '梁丘', '公仲',
      '公上', '公门', '公山', '公坚', '左丘', '公伯', '西门', '公祖', '第五', '公乘',
      '贯丘', '公皙', '南荣', '东里', '东宫', '仲长', '子书', '子桑', '即墨', '达奚',
      '褚师'
    ];

    // 检查是否包含中文圆点（少数民族姓名分隔符）
    if (fullName.includes('·') || fullName.includes('•')) {
      const parts = fullName.split(/[·•]/);
      return {
        surname: parts[0] || '',
        firstName: parts.slice(1).join('') || ''
      };
    }

    // 检查是否是复姓
    for (const compoundSurname of compoundSurnames) {
      if (fullName.startsWith(compoundSurname)) {
        return {
          surname: compoundSurname,
          firstName: fullName.substring(compoundSurname.length)
        };
      }
    }

    // 根据姓名长度判断
    const nameLength = fullName.length;
    if (nameLength === 2) {
      // 两个字：第一个是姓
      return {
        surname: fullName.substring(0, 1),
        firstName: fullName.substring(1)
      };
    } else if (nameLength === 3) {
      // 三个字：第一个是姓，后两个是名
      return {
        surname: fullName.substring(0, 1),
        firstName: fullName.substring(1)
      };
    } else if (nameLength >= 4) {
      // 四个字及以上：默认前两个是姓（可能是复姓）
      return {
        surname: fullName.substring(0, 2),
        firstName: fullName.substring(2)
      };
    }

    // 默认情况
    return {
      surname: fullName.substring(0, 1),
      firstName: fullName.substring(1) || ''
    };
  };

  // 初始化拆解姓名 - 打开弹窗时直接将姓名填入输入框
  useEffect(() => {
    if (isOpen) {
      if (isPersonal && name) {
        // 个人评分：将姓名填入临时输入框
        setTempName(name);
        // 自动拆分
        const split = smartSplitName(name);
        setSplitName(split);

        const surnameChars = split.surname.split('').filter(c => c);
        const firstNameChars = split.firstName.split('').filter(c => c);

        const surnameStrokes = surnameChars.map(c => getCharStrokes(c));
        const firstNameStrokes = firstNameChars.map(c => getCharStrokes(c));

        setStrokes({
          surname: surnameStrokes,
          firstName: firstNameStrokes
        });
        setStep('input');
      } else {
        // 为他人评分或没有姓名：清空所有状态
        setSplitName({ surname: '', firstName: '' });
        setStrokes({ surname: [], firstName: [] });
        setAnalysisResult(null);
        setStep('input');
        setTempName('');
      }
    }
  }, [isOpen, name, isPersonal]);

  // 处理姓名输入变化
  const handleNameChange = (newName) => {
    setTempName(newName);

    if (newName && newName.trim()) {
      // 自动拆分
      const split = smartSplitName(newName.trim());
      setSplitName(split);

      const surnameChars = split.surname.split('').filter(c => c);
      const firstNameChars = split.firstName.split('').filter(c => c);

      setStrokes({
        surname: surnameChars.map(c => getCharStrokes(c)),
        firstName: firstNameChars.map(c => getCharStrokes(c))
      });
    }
  };

  // 手动重新拆分
  const handleReSplit = () => {
    const nameToSplit = tempName || name || '';
    if (nameToSplit && nameToSplit.trim()) {
      const split = smartSplitName(nameToSplit.trim());
      setSplitName(split);

      const surnameChars = split.surname.split('').filter(c => c);
      const firstNameChars = split.firstName.split('').filter(c => c);

      setStrokes({
        surname: surnameChars.map(c => getCharStrokes(c)),
        firstName: firstNameChars.map(c => getCharStrokes(c))
      });
    }
  };

  const handleCalculate = () => {
    try {
      const res = calculateFiveGrids(
        splitName.surname,
        splitName.firstName,
        strokes.surname.map(s => parseInt(s) || 1),
        strokes.firstName.map(s => parseInt(s) || 1)
      );

      if (res && res.tian !== undefined && res.ren !== undefined && res.di !== undefined && res.wai !== undefined && res.zong !== undefined) {
        setAnalysisResult(res);
        setHasCalculatedBefore(true);

        setStep('result');
      } else {
        setErrorMessage('姓名评分计算失败，请检查输入信息');
      }
    } catch (error) {
      console.error('姓名评分计算出错:', error);
      setErrorMessage('姓名评分计算失败: ' + error.message);
    }
  };



  // 将五格评分转换为100分制综合评分
  const convertTo100PointScore = (analysisResult) => {
    if (!analysisResult) return 0;
    
    // 计算每个格子的分数：吉=20分，半吉=15分，凶=5分
    const calculateGridScore = (gridValue) => {
      const meaning = getMeaning(gridValue);
      if (meaning.type === '吉') return 20;
      if (meaning.type === '半吉') return 15;
      return 5; // 凶
    };
    
    const tianScore = calculateGridScore(analysisResult.tian);
    const renScore = calculateGridScore(analysisResult.ren); // 人格最重要，可考虑权重
    const diScore = calculateGridScore(analysisResult.di);
    const waiScore = calculateGridScore(analysisResult.wai);
    const zongScore = calculateGridScore(analysisResult.zong);
    
    // 计算总分 (满分100分)
    const totalScore = tianScore + renScore + diScore + waiScore + zongScore;
    
    return Math.round(totalScore);
  };

  // 根据100分制分数获取等级评价
  const getScoreLevel = (score) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    if (score >= 60) return '需改进';
    return '待提升';
  };

  // 根据100分制分数获取等级颜色
  const getScoreLevelColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ touchAction: 'none' }}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-2">🔮</span> 姓名五格剖象评分
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {errorMessage}
            </div>
          )}
          {step === 'input' && (
            <div className="space-y-4">
              {/* 姓名输入框 - 允许临时输入他人姓名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isPersonal ? '您的姓名' : '输入姓名'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempName || name || ''}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="输入中文姓名"
                  />
                  <button
                    onClick={handleReSplit}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap text-sm"
                  >
                    重新拆分
                  </button>
                </div>
                {!isPersonal && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    可为他人临时评分，结果不会保存
                  </p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                系统已智能拆分姓名和笔画数。如有错误，可手动调整或点击"重新拆分"。
              </div>

              {/* 姓氏设置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">姓氏 (Surname)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={splitName.surname}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSplitName(prev => ({ ...prev, surname: val }));
                      setStrokes(prev => ({ ...prev, surname: val.split('').map(c => getCharStrokes(c)) }));
                    }}
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="输入姓"
                  />
                  {splitName.surname.split('').map((_, idx) => (
                    <input
                      key={`s-${idx}`}
                      type="number"
                      value={strokes.surname[idx] || ''}
                      onChange={(e) => {
                        const newStrokes = [...strokes.surname];
                        newStrokes[idx] = e.target.value;
                        setStrokes(prev => ({ ...prev, surname: newStrokes }));
                      }}
                      className="w-16 px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center"
                      placeholder="笔画"
                    />
                  ))}
                </div>
              </div>

              {/* 名字设置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">名字 (Name)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={splitName.firstName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSplitName(prev => ({ ...prev, firstName: val }));
                      setStrokes(prev => ({ ...prev, firstName: val.split('').map(c => getCharStrokes(c)) }));
                    }}
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="输入名"
                  />
                  {splitName.firstName.split('').map((_, idx) => (
                    <input
                      key={`n-${idx}`}
                      type="number"
                      value={strokes.firstName[idx] || ''}
                      onChange={(e) => {
                        const newStrokes = [...strokes.firstName];
                        newStrokes[idx] = e.target.value;
                        setStrokes(prev => ({ ...prev, firstName: newStrokes }));
                      }}
                      className="w-16 px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center"
                      placeholder="笔画"
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button variant="primary" onClick={handleCalculate} className="w-full">
                  {hasCalculatedBefore ? '重新评分' : '开始评分'}
                </Button>
              </div>
            </div>
          )}

          {step === 'result' && analysisResult ? (
            <div className="space-y-6">
              {/* 综合评分卡片 */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xl font-bold">{splitName.surname}{splitName.firstName}</h4>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded">五格剖象</span>
                </div>

                {/* 100分制总评分 */}
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold mb-1">{convertTo100PointScore(analysisResult)}<span className="text-lg">分</span></div>
                  <div className={`text-lg font-semibold ${getScoreLevelColor(convertTo100PointScore(analysisResult))}`}>
                    {getScoreLevel(convertTo100PointScore(analysisResult))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center bg-white/10 rounded p-2">
                    <div className="text-xs opacity-80">总格 (后运)</div>
                    <div className="text-2xl font-bold">{analysisResult.zong}</div>
                    <div className="text-sm font-medium">{getMeaning(analysisResult.zong).type}</div>
                  </div>
                  <div className="text-center bg-white/10 rounded p-2">
                    <div className="text-xs opacity-80">人格 (主运)</div>
                    <div className="text-2xl font-bold">{analysisResult.ren}</div>
                    <div className="text-sm font-medium">{getMeaning(analysisResult.ren).type}</div>
                  </div>
                </div>
              </div>

              {/* 详细列表 */}
              <div className="space-y-3">
                {[
                  { label: '天格 (祖运)', score: analysisResult.tian, desc: '代表祖先、长辈运势' },
                  { label: '人格 (主运)', score: analysisResult.ren, desc: '代表性格与核心运势' },
                  { label: '地格 (前运)', score: analysisResult.di, desc: '代表青年时期运势' },
                  { label: '外格 (副运)', score: analysisResult.wai, desc: '代表社交与外部关系' },
                  { label: '总格 (后运)', score: analysisResult.zong, desc: '代表一生整体运势' },
                ].map((item, idx) => {
                  const meaning = getMeaning(item.score);
                  return (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{item.label}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{item.desc}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-lg font-mono font-bold mr-2 text-gray-700 dark:text-gray-300">{item.score}</span>
                          <span className={`px-2 py-0.5 text-xs rounded font-bold ${meaning.type === '吉' ? 'bg-green-100 text-green-700' :
                            meaning.type === '半吉' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {meaning.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 pl-1 border-l-2 border-gray-300 dark:border-gray-600">
                        {meaning.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 space-y-2">
                {isPersonal && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (onSaveScore) {
                        onSaveScore(analysisResult);
                        showMessage && showMessage('评分已保存', 'success');
                        // 自动关闭评分弹窗
                        onClose();
                      }
                    }}
                    className="w-full"
                  >
                    保存评分
                  </Button>
                )}
                <Button variant="outline" onClick={() => setStep('input')} className="w-full">
                  重新调整
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// 同时支持命名导出和默认导出
export default NameScoringModal;