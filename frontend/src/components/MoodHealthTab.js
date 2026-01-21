import React, { useState } from 'react';
import { moodHealthData, checkTips } from '../data/moodHealthData';
import './MoodHealthTab.css';

const MoodHealthTab = ({ onError }) => {
    const [selectedMood, setSelectedMood] = useState(null);

    return (
        <div className="mood-health-container animate-fade-in">
            {/* 头部标题区 */}
            <div className="mood-header mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">情绪身心自查</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    基于中医理论与现代身心医学，识别情绪通过身体发出的信号
                </p>
            </div>

            {/* 情绪垂直列表布局 */}
            <div className="mood-grid">
                {moodHealthData.map((item, index) => (
                    <div
                        key={index}
                        className={`mood-card relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-sm ${selectedMood === index ? 'ring-2 ring-indigo-500 shadow-lg' : 'bg-white dark:bg-gray-800'
                            }`}
                        onClick={() => setSelectedMood(selectedMood === index ? null : index)}
                    >
                        {/* 渐变装饰条 */}
                        <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${item.color}`}></div>

                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-xl">{item.icon}</span>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{item.mood}</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="theory-tag inline-block px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                                        {item.tcmTheory}
                                    </div>

                                    {/* 主要显示 - 信号 */}
                                    <div className="signal-box">
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium italic">自查信号：</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-semibold">
                                            {item.signals}
                                        </p>
                                    </div>

                                    {/* 详情展开 */}
                                    {selectedMood === index && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-slide-down">
                                            <div className="bg-gray-50/50 dark:bg-gray-900/40 p-3 rounded-xl">
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5 font-bold uppercase tracking-wider">现代医学常见表现</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                                    {item.modernMedicine}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={`transition-transform duration-300 ${selectedMood === index ? 'rotate-180' : ''}`}>
                                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 自查小提示 */}
            <div className="mt-8 p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100">身心觉察贴士</h4>
                </div>
                <ul className="space-y-3">
                    {checkTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                            <span className="w-5 h-5 flex items-center justify-center bg-indigo-500 text-white rounded-full text-[10px] mr-2 flex-shrink-0 mt-0.5">{idx + 1}</span>
                            {tip}
                        </li>
                    ))}
                </ul>
            </div>

            {/* 底部备注 */}
            <div className="mt-6 text-center text-[10px] text-gray-400 dark:text-gray-500 pb-10">
                * 本内容仅供自查参考，若身体出现持续不适，请务必咨询专业医疗机构
            </div>
        </div>
    );
};

export default MoodHealthTab;
