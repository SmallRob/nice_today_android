import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyMoodData } from '../utils/moodAlgorithm';

const RainbowMoodPage = () => {
    const navigate = useNavigate();
    const [selectedColor, setSelectedColor] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    // 获取今日数据
    const dailyData = useMemo(() => getDailyMoodData(), []);

    // 渲染选择界面
    const renderSelection = () => (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-fadeIn">
            <div className="mb-12">
                <h1 className="text-3xl font-black text-white mb-4 drop-shadow-md">彩虹心情</h1>
                <p className="text-white/80 text-sm tracking-widest font-medium">倾听色彩的语言 · 觉知当下的能量</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 w-full max-w-xs border border-white/20 shadow-2xl mx-auto">
                <p className="text-white text-base font-bold mb-6">请凭直觉，随机选择一个颜色</p>

                <div className="grid grid-cols-3 gap-3">
                    {dailyData.availableColors.map((color) => (
                        <button
                            key={color.id}
                            onClick={() => {
                                setSelectedColor(color);
                                setShowDetail(true);
                            }}
                            className="group flex flex-col items-center gap-2 transition-transform active:scale-90 min-w-[90px]"
                        >
                            <div
                                className="w-14 h-14 rounded-full shadow-lg border-2 border-white group-hover:scale-110 transition-all duration-300"
                                style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-white/90 text-xs font-bold text-center leading-tight px-1 truncate">{color.name}</span>
                        </button>
                    ))}
                    {/* 随机选择按钮 */}
                    <button
                        onClick={() => {
                            const randomIndex = Math.floor(Math.random() * dailyData.availableColors.length);
                            const randomColor = dailyData.availableColors[randomIndex];
                            setSelectedColor(randomColor);
                            setShowDetail(true);
                        }}
                        className="group flex flex-col items-center gap-2 transition-transform active:scale-90 min-w-[90px]"
                    >
                        <div
                            className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-lg border-2 border-white group-hover:scale-110 transition-all duration-300 flex items-center justify-center"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <span className="text-white/90 text-xs font-bold text-center leading-tight px-1">随机</span>
                    </button>
                </div>
            </div>

            {/* 答案之书功能入口 - 跳转到答案之书页面 */}
            <div className="mt-8 w-full max-w-xs">
                <button 
                    onClick={() => navigate('/book-of-answers')}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span className="mr-2">📖</span>
                    答案之书 - 获取心灵启发
                </button>
            </div>

            <p className="mt-12 text-white/50 text-[10px] italic">每日五行能量：{dailyData.dayWuXing}</p>
        </div>
    );

    // 渲染详情界面 (仿截图)
    const renderDetail = () => {
        // 确保selectedColor不为null，使用第一个颜色作为默认值
        const colorToUse = selectedColor || dailyData.availableColors[0] || { name: '未知', tone: '未知', chakra: '未知', element: '未知', parts: '未知', symbol: '未知', hex: '#000000' };
        const interpretation = dailyData.generateInterpretation(colorToUse);

        return (
            <div className="min-h-screen bg-transparent p-4 animate-slideUp">
                {/* 顶部标题栏 */}
                <div className="flex items-center justify-center relative px-2 py-4 mb-4">
                    <button onClick={() => setShowDetail(false)} className="absolute left-4 text-white p-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-white font-bold text-lg">彩虹心情</span>
                </div>

                {/* 能量语区域 */}
                <div className="relative mb-10 mt-6">
                    <div className="mx-auto w-[90%] bg-emerald-400/80 backdrop-blur-md rounded-2xl p-6 border-2 border-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.3)] relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-100/90 text-emerald-700 px-4 py-0.5 rounded-full text-xs font-bold border border-emerald-300">
                            · 能量语 ·
                        </div>
                        <p className="text-white text-xl font-black text-center leading-relaxed tracking-wider mt-2">
                            {dailyData.energyQuote}
                        </p>
                    </div>
                    <p className="text-center text-red-500 text-[10px] font-bold mt-3 drop-shadow-sm">
                        ＊ 建议可自行<span className="underline">默念3遍</span> ＊
                    </p>
                </div>

                {/* 属性列表卡片 */}
                <div className="bg-white/95 rounded-[2rem] p-8 shadow-2xl relative">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm font-medium">今日色：</span>
                                <span className="text-cyan-500 font-black">{colorToUse.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm font-medium">颜色属性：</span>
                                <span className="text-gray-800 font-bold">{colorToUse.tone}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm font-medium">对应脉轮：</span>
                                <span className="text-gray-800 font-bold">{colorToUse.chakra}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm font-medium">所属元素：</span>
                                <span className="text-gray-800 font-bold">{colorToUse.element}</span>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <span className="text-gray-500 text-sm font-medium">对应身体部位：</span>
                            <span className="text-gray-800 font-bold ml-2">{colorToUse.parts}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-gray-500 text-sm font-medium">象征意义：</span>
                            <span className="text-gray-800 font-bold ml-2">{colorToUse.symbol}</span>
                        </div>
                    </div>

                    {/* 解读部分 */}
                    <div className="border-t border-gray-100 pt-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-6 bg-cyan-400 rounded-full" />
                            <h3 className="text-2xl font-black text-gray-900 italic">今日解读</h3>
                        </div>
                        <div className="text-gray-700 leading-relaxed text-lg font-medium space-y-4 text-justify">
                            {interpretation.split('\n').map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                    </div>

                    {/* 装饰物 */}
                    <div className="absolute top-10 right-10 opacity-5">
                        <div className="w-24 h-24 rounded-full" style={{ backgroundColor: colorToUse.hex }} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#d4fc79] via-[#96e6a1] to-[#84fab0] dark:from-indigo-900 dark:to-purple-900">
            {/* 动态渐变背景动画 */}
            <div className="absolute inset-0 opacity-30 blur-3xl pointer-events-none">
                <div className="absolute top-0 -left-10 w-72 h-72 bg-purple-300 rounded-full animate-pulse" />
                <div className="absolute bottom-10 -right-10 w-80 h-80 bg-blue-300 rounded-full animate-float" />
                <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-yellow-200 rounded-full animate-pulse-slow" />
            </div>

            <div className="relative z-10 w-full max-w-lg mx-auto">
                {!showDetail ? renderSelection() : renderDetail()}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }
        .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
        .animate-fadeIn { animation: fadeIn 0.8s ease-in; }
        .animate-pulse-slow { animation: pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}} />
        </div>
    );
};

export default RainbowMoodPage;