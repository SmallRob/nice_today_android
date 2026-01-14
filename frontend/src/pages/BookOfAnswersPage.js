import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDailyMoodData } from '../utils/moodAlgorithm';

const BookOfAnswersPage = () => {
    const navigate = useNavigate();
    const [currentAnswer, setCurrentAnswer] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);

    // 答案之书的智慧语录数组
    const wisdomAnswers = [
        "相信自己的内心，答案就在那里。",
        "每一步都是成长，每一次跌倒都是为了更好的站起来。",
        "真正的力量来自内心的平静。",
        "当你专注于解决问题而不是抱怨问题时，奇迹就会发生。",
        "你的直觉比你想象的更强大。",
        "耐心是一种美德，也是通往成功的钥匙。",
        "每个人都有独特的价值，包括你在内。",
        "改变是生命的一部分，拥抱它而不是抗拒它。",
        "爱自己是一切美好关系的开始。",
        "今天的努力是明天成功的基石。",
        "每一个挑战都是一个隐藏的机会。",
        "信任宇宙的安排，一切都会在合适的时间发生。",
        "你的感受很重要，倾听它们的智慧。",
        "宽容是治愈痛苦的良药。",
        "活在当下，这是你唯一真正拥有的时刻。",
        "勇气不是没有恐惧，而是带着恐惧前行。",
        "你的想法创造了你的现实，选择积极的想法。",
        "真正的财富在于你给予他人的爱和善意。",
        "困难时期是暂时的，但你的坚韧是永恒的。",
        "你是自己命运的创造者。",
        "每一次呼吸都是一个新的开始。",
        "学会感恩，你会发现生活中更多的美好。",
        "不要害怕犯错，错误是学习的必经之路。",
        "你值得拥有所有的美好。",
        "静下心来，你会听到内心的声音。",
        "每个人都值得第二次机会，包括你自己。",
        "快乐来自接受现状并努力改善未来。",
        "你的价值不由别人的意见决定。",
        "生活是一场旅程，享受沿途的风景。",
        "善良是世界上最强大的力量之一。",
        "你的梦想是现实的蓝图。",
        "相信过程，即使你看不到终点。",
        "每一天都是一个新的机会。",
        "真正的智慧在于知道自己不知道。",
        "接受过去，专注现在，期待未来。",
        "你有能力改变任何你不满意的情况。",
        "微笑是最简单的魔法。",
        "内在的力量比外在的环境更强大。",
        "勇敢做自己，因为其他人已经有了角色。",
        "每一个结束都是新开始的序幕。",
        "你的潜力是无限的。",
        "同情心能治愈伤痛。",
        "真诚是最好的策略。",
        "时间会证明一切，保持耐心。",
        "诚实是建立信任的基础。",
        "希望是黑暗中的明灯。",
        "谦逊是智慧的开始。",
        "尊重他人，也尊重自己。",
        "真理具有强大的治愈力量。",
        "宽恕是释放自己的礼物。"
    ];

    const dailyData = useMemo(() => getDailyMoodData(), []);

    // 随机获取一个答案
    const getRandomAnswer = () => {
        const randomIndex = Math.floor(Math.random() * wisdomAnswers.length);
        return wisdomAnswers[randomIndex];
    };

    // 显示新答案
    const handleShowAnswer = () => {
        const newAnswer = getRandomAnswer();
        setCurrentAnswer(newAnswer);
        setShowAnswer(true);
    };

    // 获取新答案
    const handleGetNewAnswer = () => {
        const newAnswer = getRandomAnswer();
        setCurrentAnswer(newAnswer);
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
                <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-fadeIn">
                    <div className="mb-12">
                        <h1 className="text-3xl font-black text-white mb-4 drop-shadow-md">答案之书</h1>
                        <p className="text-white/80 text-sm tracking-widest font-medium">心灵启发式答案</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 w-full max-w-xs border border-white/20 shadow-2xl mx-auto">
                        <p className="text-white text-base font-bold mb-6">请默念你的问题</p>

                        {/* 答案显示区域 */}
                        {!showAnswer ? (
                            <div className="prompt-section">
                                <button 
                                    className="show-answer-btn w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handleShowAnswer}
                                >
                                    查看答案
                                </button>
                            </div>
                        ) : (
                            <div className="answer-section">
                                <p className="answer-text text-white text-lg font-black leading-relaxed tracking-wider">"{currentAnswer}"</p>
                                <div className="answer-actions mt-4">
                                    <button 
                                        className="new-answer-btn w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                        onClick={handleGetNewAnswer}
                                    >
                                        换一个答案
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 彩虹心情功能入口 - 跳转到彩虹心情页面 */}
                    <div className="mt-8 w-full max-w-xs">
                        <button 
                            onClick={() => navigate('/rainbow-mood')}
                            className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <span className="mr-2">🌈</span>
                            彩虹心情 - 随机选择颜色
                        </button>
                    </div>

                    <p className="mt-12 text-white/50 text-[10px] italic">每日五行能量：{dailyData.dayWuXing}</p>
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
        </div>
    );
};

export default BookOfAnswersPage;