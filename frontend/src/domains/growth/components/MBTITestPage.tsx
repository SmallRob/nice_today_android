import React, { useState } from 'react';
import { growthService } from '../services/growthService';
import type { MBTIResult } from '../types';

interface MBTITestPageProps {
  onBack?: () => void;
}

const MBTI_QUESTIONS = [
  { id: 1, text: '在社交场合中，你通常：', optionA: '主动与人交谈，享受热闹', optionB: '等待别人来搭话，喜欢安静', dimension: 'EI' as const },
  { id: 2, text: '你更倾向于：', optionA: '关注具体的事实和细节', optionB: '关注整体的模式和可能性', dimension: 'SN' as const },
  { id: 3, text: '做决定时，你更看重：', optionA: '逻辑分析和客观标准', optionB: '个人价值观和他人感受', dimension: 'TF' as const },
  { id: 4, text: '你更喜欢的生活方式是：', optionA: '有计划、有条理', optionB: '灵活、随性', dimension: 'JP' as const },
  { id: 5, text: '周末你更愿意：', optionA: '参加聚会或社交活动', optionB: '在家看书或独处', dimension: 'EI' as const },
  { id: 6, text: '你更容易记住：', optionA: '具体的事实和数据', optionB: '概念和理论', dimension: 'SN' as const },
  { id: 7, text: '当朋友向你倾诉时，你倾向于：', optionA: '提供解决方案和建议', optionB: '给予情感支持和理解', dimension: 'TF' as const },
  { id: 8, text: '你的工作空间通常是：', optionA: '整洁有序', optionB: '创意性的混乱', dimension: 'JP' as const },
  { id: 9, text: '你获取能量的方式是：', optionA: '与他人互动', optionB: '独处充电', dimension: 'EI' as const },
  { id: 10, text: '你更相信：', optionA: '亲身经历', optionB: '直觉预感', dimension: 'SN' as const },
  { id: 11, text: '在争论中，你更看重：', optionA: '真理和逻辑', optionB: '和谐和理解', dimension: 'TF' as const },
  { id: 12, text: '你做旅行计划时：', optionA: '提前规划好行程', optionB: '随机应变', dimension: 'JP' as const },
];

const MBTI_TYPES: Record<string, { name: string; emoji: string; description: string; strengths: string[]; careers: string[] }> = {
  'INTJ': { name: '建筑师', emoji: '🏗️', description: '具有创造力的战略思想家', strengths: ['战略性思维', '独立', '有远见'], careers: ['科学家', '工程师', '投资分析师'] },
  'INTP': { name: '逻辑学家', emoji: '🔬', description: '具有创造力的发明家', strengths: ['逻辑性强', '创新', '客观'], careers: ['程序员', '数学家', '哲学家'] },
  'ENTJ': { name: '指挥官', emoji: '👑', description: '大胆的领导者', strengths: ['领导力', '高效', '有远见'], careers: ['CEO', '律师', '企业家'] },
  'ENTP': { name: '辩论家', emoji: '🎭', description: '聪明好奇的思想家', strengths: ['创新', '适应性强', '聪明'], careers: ['创业者', '律师', '创意总监'] },
  'INFJ': { name: '提倡者', emoji: '🌟', description: '安静而有神秘感的理想主义者', strengths: ['有同理心', '有远见', '坚定'], careers: ['咨询师', '作家', '心理学家'] },
  'INFP': { name: '调停者', emoji: '🦋', description: '诗意的理想主义者', strengths: ['有同理心', '创意', '忠诚'], careers: ['作家', '设计师', '社工'] },
  'ENFJ': { name: '主人公', emoji: '🦸', description: '富有魅力的领导者', strengths: ['有同理心', '有说服力', '组织能力强'], careers: ['教师', '销售经理', '政治家'] },
  'ENFP': { name: '竞选者', emoji: '🎉', description: '热情有创造力的社交者', strengths: ['热情', '创意', '社交能力强'], careers: ['记者', '演员', '创意总监'] },
  'ISTJ': { name: '物流师', emoji: '📋', description: '实际且注重事实的个人', strengths: ['负责任', '有条理', '忠诚'], careers: ['会计', '军人', '项目经理'] },
  'ISFJ': { name: '守卫者', emoji: '🛡️', description: '非常专注且温暖的守护者', strengths: ['忠诚', '有耐心', '负责'], careers: ['护士', '教师', '行政助理'] },
  'ESTJ': { name: '总经理', emoji: '💼', description: '出色的管理者', strengths: ['组织能力强', '可靠', '务实'], careers: ['经理', '法官', '财务主管'] },
  'ESFJ': { name: '执政官', emoji: '🤝', description: '非常关心他人的人', strengths: ['有同理心', '可靠', '社交能力强'], careers: ['护士', '销售', '公关'] },
  'ISTP': { name: '鉴赏家', emoji: '🔧', description: '大胆而实际的实验家', strengths: ['灵活', '冷静', '实用'], careers: ['工程师', '飞行员', '侦探'] },
  'ISFP': { name: '探险家', emoji: '🎨', description: '灵活而有魅力的艺术家', strengths: ['有艺术感', '灵活', '有同理心'], careers: ['艺术家', '设计师', '厨师'] },
  'ESTP': { name: '企业家', emoji: '🚀', description: '聪明精力充沛的感知者', strengths: ['精力充沛', '实际', '灵活'], careers: ['创业者', '运动员', '销售'] },
  'ESFP': { name: '表演者', emoji: '🎤', description: '自发的精力充沛的表演者', strengths: ['热情', '有创意', '社交能力强'], careers: ['演员', '设计师', '销售'] },
};

const MBTITestPage: React.FC<MBTITestPageProps> = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  const [result, setResult] = useState<MBTIResult | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  const savedResult = growthService.getMBTIResult();

  const handleAnswer = (dimension: string, isFirst: boolean) => {
    const newAnswers = { ...answers };
    if (dimension === 'EI') {
      if (isFirst) newAnswers.E++; else newAnswers.I++;
    } else if (dimension === 'SN') {
      if (isFirst) newAnswers.S++; else newAnswers.N++;
    } else if (dimension === 'TF') {
      if (isFirst) newAnswers.T++; else newAnswers.F++;
    } else if (dimension === 'JP') {
      if (isFirst) newAnswers.J++; else newAnswers.P++;
    }
    setAnswers(newAnswers);

    if (currentQuestion < MBTI_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: Record<string, number>) => {
    const type = [
      finalAnswers.E > finalAnswers.I ? 'E' : 'I',
      finalAnswers.S > finalAnswers.N ? 'S' : 'N',
      finalAnswers.T > finalAnswers.F ? 'T' : 'F',
      finalAnswers.J > finalAnswers.P ? 'J' : 'P',
    ].join('');

    const mbtiResult: MBTIResult = {
      type,
      dimensions: {
        E: finalAnswers.E, I: finalAnswers.I,
        S: finalAnswers.S, N: finalAnswers.N,
        T: finalAnswers.T, F: finalAnswers.F,
        J: finalAnswers.J, P: finalAnswers.P,
      },
      percentages: {
        E: Math.round((finalAnswers.E / (finalAnswers.E + finalAnswers.I)) * 100),
        I: Math.round((finalAnswers.I / (finalAnswers.E + finalAnswers.I)) * 100),
        S: Math.round((finalAnswers.S / (finalAnswers.S + finalAnswers.N)) * 100),
        N: Math.round((finalAnswers.N / (finalAnswers.S + finalAnswers.N)) * 100),
        T: Math.round((finalAnswers.T / (finalAnswers.T + finalAnswers.F)) * 100),
        F: Math.round((finalAnswers.F / (finalAnswers.T + finalAnswers.F)) * 100),
        J: Math.round((finalAnswers.J / (finalAnswers.J + finalAnswers.P)) * 100),
        P: Math.round((finalAnswers.P / (finalAnswers.J + finalAnswers.P)) * 100),
      },
      description: MBTI_TYPES[type]?.description || '',
      strengths: MBTI_TYPES[type]?.strengths || [],
      weaknesses: [],
      careers: MBTI_TYPES[type]?.careers || [],
      relationships: '',
      famousPeople: [],
    };

    growthService.saveMBTIResult(mbtiResult);
    setResult(mbtiResult);
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setResult(null);
    setShowIntro(false);
  };

  const DimensionBar = ({ left, right, leftValue, rightValue }: { left: string; right: string; leftValue: number; rightValue: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{left} {leftValue}%</span>
        <span>{right} {rightValue}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
        <div className="h-full bg-blue-500 rounded-l-full" style={{ width: `${leftValue}%` }} />
        <div className="h-full bg-purple-500 rounded-r-full" style={{ width: `${rightValue}%` }} />
      </div>
    </div>
  );

  // Show saved result if available
  if (savedResult && !result && showIntro) {
    const typeInfo = MBTI_TYPES[savedResult.type];
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            {onBack && <button onClick={onBack} className="text-blue-500 text-sm">← 返回</button>}
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">MBTI 性格测试</h1>
            <button onClick={resetTest} className="text-blue-500 text-sm">重新测试</button>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-white text-center">
            <span className="text-5xl">{typeInfo?.emoji}</span>
            <div className="text-3xl font-black mt-2">{savedResult.type}</div>
            <div className="text-lg mt-1">{typeInfo?.name}</div>
            <div className="text-sm opacity-80 mt-2">{savedResult.description}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
            <DimensionBar left="E 外向" right="I 内向" leftValue={savedResult.percentages.E} rightValue={savedResult.percentages.I} />
            <DimensionBar left="S 实感" right="N 直觉" leftValue={savedResult.percentages.S} rightValue={savedResult.percentages.N} />
            <DimensionBar left="T 思考" right="F 情感" leftValue={savedResult.percentages.T} rightValue={savedResult.percentages.F} />
            <DimensionBar left="J 判断" right="P 感知" leftValue={savedResult.percentages.J} rightValue={savedResult.percentages.P} />
          </div>
        </div>
      </div>
    );
  }

  // Show intro
  if (showIntro && !result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            {onBack && <button onClick={onBack} className="text-blue-500 text-sm">← 返回</button>}
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">MBTI 性格测试</h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 mt-8 text-center">
          <span className="text-6xl">🧠</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">MBTI 性格测试</h2>
          <p className="text-gray-500 mt-2">
            通过 {MBTI_QUESTIONS.length} 道问题，发现你的性格类型
          </p>
          <button
            onClick={() => setShowIntro(false)}
            className="mt-8 px-8 py-3 bg-blue-500 text-white rounded-xl font-medium"
          >
            开始测试
          </button>
        </div>
      </div>
    );
  }

  // Show result
  if (result) {
    const typeInfo = MBTI_TYPES[result.type];
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <div />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">测试结果</h1>
            <button onClick={resetTest} className="text-blue-500 text-sm">重新测试</button>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-white text-center">
            <span className="text-5xl">{typeInfo?.emoji}</span>
            <div className="text-3xl font-black mt-2">{result.type}</div>
            <div className="text-lg mt-1">{typeInfo?.name}</div>
            <div className="text-sm opacity-80 mt-2">{result.description}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-gray-700 dark:text-gray-300">维度分析</h3>
            <DimensionBar left="E 外向" right="I 内向" leftValue={result.percentages.E} rightValue={result.percentages.I} />
            <DimensionBar left="S 实感" right="N 直觉" leftValue={result.percentages.S} rightValue={result.percentages.N} />
            <DimensionBar left="T 思考" right="F 情感" leftValue={result.percentages.T} rightValue={result.percentages.F} />
            <DimensionBar left="J 判断" right="P 感知" leftValue={result.percentages.J} rightValue={result.percentages.P} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">优势</h3>
            <div className="flex flex-wrap gap-2">
              {result.strengths.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full text-sm">{s}</span>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">适合职业</h3>
            <div className="flex flex-wrap gap-2">
              {result.careers.map((c, i) => (
                <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full text-sm">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show questions
  const question = MBTI_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / MBTI_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => currentQuestion > 0 && setCurrentQuestion(prev => prev - 1)} className="text-blue-500 text-sm">
              {currentQuestion > 0 ? '上一题' : ''}
            </button>
            <span className="text-sm text-gray-500">{currentQuestion + 1} / {MBTI_QUESTIONS.length}</span>
            <div className="w-10" />
          </div>
          <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 text-center">
            {question.text}
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => handleAnswer(question.dimension, true)}
              className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-left hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <span className="text-blue-500 font-medium">A.</span> <span className="text-gray-700 dark:text-gray-300">{question.optionA}</span>
            </button>
            <button
              onClick={() => handleAnswer(question.dimension, false)}
              className="w-full p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-left hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
            >
              <span className="text-purple-500 font-medium">B.</span> <span className="text-gray-700 dark:text-gray-300">{question.optionB}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MBTITestPage;