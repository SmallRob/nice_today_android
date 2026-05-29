import React, { useState, useEffect, useCallback } from 'react';
import { fortuneService } from '../services/fortuneService';
import type { BaziData } from '../types';

interface BaziPageProps {
  onBack?: () => void;
}

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const FIVE_ELEMENTS = ['木', '火', '土', '金', '水'];
const ELEMENT_COLORS: Record<string, string> = {
  '木': 'bg-green-500',
  '火': 'bg-red-500',
  '土': 'bg-yellow-500',
  '金': 'bg-gray-400',
  '水': 'bg-blue-500',
};

const BaziPage: React.FC<BaziPageProps> = ({ onBack }) => {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [baziData, setBaziData] = useState<BaziData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to load saved profile
    const profile = fortuneService.getUserProfile();
    if (profile.birthDate) {
      setBirthDate(profile.birthDate);
      setBirthTime(profile.birthTime || '12:00');
    }
  }, []);

  const calculateBazi = useCallback(() => {
    if (!birthDate) {
      setError('请输入出生日期');
      return;
    }

    setLoading(true);
    setError(null);

    // Check cache first
    let data = fortuneService.getBaziData(birthDate, birthTime);
    
    if (!data) {
      // Generate mock Bazi data for demonstration
      data = generateMockBazi(birthDate, birthTime);
      fortuneService.saveBaziData(data, birthDate, birthTime);
    }

    setBaziData(data);
    setLoading(false);
  }, [birthDate, birthTime]);

  const generateMockBazi = (date: string, time: string): BaziData => {
    const [year, month, day] = date.split('-').map(Number);
    const yearIdx = (year - 4) % 10;
    const yearBranchIdx = (year - 4) % 12;
    const monthIdx = (month + yearIdx) % 10;
    const monthBranchIdx = (month + 1) % 12;
    const dayIdx = (day + yearIdx + monthIdx) % 10;
    const dayBranchIdx = (day + yearBranchIdx) % 12;
    const hourIdx = time ? Math.floor(parseInt(time.split(':')[0]) / 2) % 12 : 0;
    const hourStemIdx = (dayIdx * 2 + hourIdx) % 10;

    const getElement = (stemIdx: number) => FIVE_ELEMENTS[Math.floor(stemIdx / 2)];

    return {
      yearPillar: {
        heavenlyStem: HEAVENLY_STEMS[yearIdx],
        earthlyBranch: EARTHLY_BRANCHES[yearBranchIdx],
        hiddenStems: [HEAVENLY_STEMS[(yearBranchIdx + 8) % 10]],
        nayin: '海中金',
      },
      monthPillar: {
        heavenlyStem: HEAVENLY_STEMS[monthIdx],
        earthlyBranch: EARTHLY_BRANCHES[monthBranchIdx],
        hiddenStems: [HEAVENLY_STEMS[(monthBranchIdx + 8) % 10]],
        nayin: '炉中火',
      },
      dayPillar: {
        heavenlyStem: HEAVENLY_STEMS[dayIdx],
        earthlyBranch: EARTHLY_BRANCHES[dayBranchIdx],
        hiddenStems: [HEAVENLY_STEMS[(dayBranchIdx + 8) % 10]],
        nayin: '大林木',
      },
      hourPillar: {
        heavenlyStem: HEAVENLY_STEMS[hourStemIdx],
        earthlyBranch: EARTHLY_BRANCHES[hourIdx],
        hiddenStems: [HEAVENLY_STEMS[(hourIdx + 8) % 10]],
        nayin: '路旁土',
      },
      fiveElements: {
        wood: 2,
        fire: 2,
        earth: 2,
        metal: 1,
        water: 1,
      },
      dayMaster: HEAVENLY_STEMS[dayIdx],
      analysis: {
        strength: '日主偏弱',
        favorableElements: ['水', '木'],
        unfavorableElements: ['金', '土'],
        personality: '性格温和，善于思考，有较强的直觉力和洞察力。',
        career: '适合从事文职、教育、艺术等需要创造力的工作。',
        health: '注意肝胆和眼睛的保养，避免过度劳累。',
        relationships: '感情细腻，重视精神交流，适合与性格互补的人相处。',
      },
    };
  };

  const PillarCard = ({ label, pillar }: { label: string; pillar: any }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex-1 min-w-0">
      <div className="text-xs text-gray-500 text-center mb-2">{label}</div>
      <div className="text-center">
        <div className="text-xl font-bold text-gray-900 dark:text-white">{pillar.heavenlyStem}</div>
        <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{pillar.earthlyBranch}</div>
      </div>
      <div className="text-[10px] text-gray-400 text-center mt-2">{pillar.nayin}</div>
    </div>
  );

  const ElementBar = ({ element, count, total }: { element: string; count: number; total: number }) => (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">{element}</span>
      <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${ELEMENT_COLORS[element]} transition-all duration-500`}
          style={{ width: `${(count / total) * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-4 text-right">{count}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="text-blue-500 text-sm">← 返回</button>
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">八字排盘</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Input form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">请输入出生信息</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">出生日期</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">出生时辰</label>
              <select
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">请选择</option>
                <option value="00:00">子时 (23:00-01:00)</option>
                <option value="02:00">丑时 (01:00-03:00)</option>
                <option value="04:00">寅时 (03:00-05:00)</option>
                <option value="06:00">卯时 (05:00-07:00)</option>
                <option value="08:00">辰时 (07:00-09:00)</option>
                <option value="10:00">巳时 (09:00-11:00)</option>
                <option value="12:00">午时 (11:00-13:00)</option>
                <option value="14:00">未时 (13:00-15:00)</option>
                <option value="16:00">申时 (15:00-17:00)</option>
                <option value="18:00">酉时 (17:00-19:00)</option>
                <option value="20:00">戌时 (19:00-21:00)</option>
                <option value="22:00">亥时 (21:00-23:00)</option>
              </select>
            </div>
            <button
              onClick={calculateBazi}
              disabled={loading || !birthDate}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? '计算中...' : '开始排盘'}
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* Result */}
        {baziData && (
          <>
            {/* Four Pillars */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">四柱八字</h3>
              <div className="grid grid-cols-4 gap-2">
                <PillarCard label="年柱" pillar={baziData.yearPillar} />
                <PillarCard label="月柱" pillar={baziData.monthPillar} />
                <PillarCard label="日柱" pillar={baziData.dayPillar} />
                <PillarCard label="时柱" pillar={baziData.hourPillar} />
              </div>
              <div className="text-center mt-3">
                <span className="text-xs text-gray-500">日主：</span>
                <span className="text-lg font-bold text-blue-500">{baziData.dayMaster}</span>
              </div>
            </div>

            {/* Five Elements */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">五行分布</h3>
              <div className="space-y-2">
                {FIVE_ELEMENTS.map(element => (
                  <ElementBar
                    key={element}
                    element={element}
                    count={baziData.fiveElements[element.toLowerCase() as keyof typeof baziData.fiveElements] || 0}
                    total={10}
                  />
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  喜用：{baziData.analysis.favorableElements.join(' ')}
                </span>
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  忌用：{baziData.analysis.unfavorableElements.join(' ')}
                </span>
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">命理分析</h3>
              
              <div className="flex items-start gap-3">
                <span className="text-blue-500 text-lg">🧠</span>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">性格特点</div>
                  <p className="text-xs text-gray-500 mt-1">{baziData.analysis.personality}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-purple-500 text-lg">💼</span>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">事业方向</div>
                  <p className="text-xs text-gray-500 mt-1">{baziData.analysis.career}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-lg">🏥</span>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">健康提醒</div>
                  <p className="text-xs text-gray-500 mt-1">{baziData.analysis.health}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-pink-500 text-lg">💕</span>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">感情婚姻</div>
                  <p className="text-xs text-gray-500 mt-1">{baziData.analysis.relationships}</p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-xs text-gray-400 py-4">
              八字命理仅供参考，请理性看待
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BaziPage;