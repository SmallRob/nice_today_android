import { Card } from '../components/PageLayout.js';
import '../index.css';

function TarotGardenPage() {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* 顶部标题区域 - 现代化设计 */}
      {/* 顶部标题区域 - 现代化设计 */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-purple-100 dark:border-purple-800">
        <div className="container mx-auto px-4 py-3 relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-2 right-6 text-4xl md:text-6xl">✨</div>
            <div className="absolute bottom-2 left-6 text-3xl md:text-4xl">🌟</div>
          </div>
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 rounded-2xl shadow-lg mb-2 md:mb-3">
              <span className="text-3xl md:text-4xl">🔮</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 bg-clip-text text-transparent">
              塔罗花园
            </h1>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1.5 md:mt-2 font-medium">
              探索神秘的塔罗世界，聆听命运的指引
            </p>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="space-y-4">
            {/* 神秘塔罗卡片 */}
            <Card className="group">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600 dark:from-purple-700 dark:via-pink-700 dark:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                {/* 装饰图案 */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-24 translate-x-24"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
                </div>

                <div className="relative p-4 md:p-5 text-white h-full flex flex-col">
                  <div className="flex flex-col items-center justify-center flex-1">
                    <div className="text-4xl md:text-5xl mb-2 md:mb-3 transform group-hover:scale-110 transition-transform duration-300">🔮</div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-wide text-center">神秘塔罗</h2>
                    <p className="text-purple-100 text-sm md:text-base font-light text-center">聆听命运的指引，探索未知的奥秘</p>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button
                      onClick={() => window.location.href = '/tarot'}
                      className="inline-flex items-center space-x-1.5 md:space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
                    >
                      <span>进入探索</span>
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 玛雅图腾卡片 */}
            <Card className="group">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 dark:from-amber-700 dark:via-orange-700 dark:to-yellow-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                {/* 装饰图案 */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-48 h-48 bg-white rounded-full -translate-y-24 -translate-x-24"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-y-16 translate-x-16"></div>
                </div>

                <div className="relative p-4 md:p-5 text-white h-full flex flex-col">
                  <div className="flex flex-col items-center justify-center flex-1">
                    <div className="text-4xl md:text-5xl mb-2 md:mb-3 transform group-hover:scale-110 transition-transform duration-300">🌟</div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-wide text-center">玛雅图腾</h2>
                    <p className="text-amber-100 text-sm md:text-base font-light text-center">探索古老的玛雅智慧，发现生命的密码</p>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button
                      onClick={() => window.location.href = '/maya'}
                      className="inline-flex items-center space-x-1.5 md:space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
                    >
                      <span>进入探索</span>
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 数字之灵卡片 */}
            <Card className="group">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                {/* 装饰图案 */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="relative p-4 md:p-5 text-white h-full flex flex-col">
                  <div className="flex flex-col items-center justify-center flex-1">
                    <div className="text-4xl md:text-5xl mb-2 md:mb-3 transform group-hover:scale-110 transition-transform duration-300">🔢</div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-wide text-center">数字之灵</h2>
                    <p className="text-blue-100 text-sm md:text-base font-light text-center">探索生命密码的奥秘，解读数字的智慧</p>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button
                      onClick={() => window.location.href = '/numerology'}
                      className="inline-flex items-center space-x-1.5 md:space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
                    >
                      <span>进入探索</span>
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 生命矩阵卡片 */}
            {/* <Card className="group"> */}
            {/* <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 dark:from-green-700 dark:via-emerald-700 dark:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"> */}
            {/* 装饰图案 */}
            {/* <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white rounded-full"></div>
                </div>

                <div className="relative p-4 md:p-5 text-white h-full flex flex-col">
                  <div className="flex flex-col items-center justify-center flex-1">
                    <div className="text-4xl md:text-5xl mb-2 md:mb-3 transform group-hover:scale-110 transition-transform duration-300">🌐</div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-wide text-center">生命矩阵</h2>
                    <p className="text-green-100 text-sm md:text-base font-light text-center">构建你的意义能量图谱，探索生命维度</p>
                  </div>
                  <div className="flex justify-end mt-auto">
                    <button
                      onClick={() => window.location.href = '/life-matrix'}
                      className="inline-flex items-center space-x-1.5 md:space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
                    >
                      <span>进入探索</span>
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div> */}
            {/* </Card> */}

            {/* 开发中功能卡片 */}
            <Card>
              <div className="text-center py-6 md:py-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg">
                <div className="mb-4 md:mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl mb-3 md:mb-4">
                    <span className="text-3xl md:text-4xl">🎯</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    即将推出
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    更多神秘功能正在精心打磨中，敬请期待...
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 p-3 md:p-4 rounded-lg border border-purple-100 dark:border-purple-800 hover:shadow-md transition-shadow duration-300">
                    <div className="text-3xl md:text-4xl mb-2 md:mb-3">🎴</div>
                    <h4 className="font-bold text-purple-900 dark:text-purple-100 mb-1 md:mb-2 text-sm md:text-base">塔罗牌占卜</h4>
                    <p className="text-xs md:text-sm text-purple-700 dark:text-purple-300">多种牌阵选择，深度解读命运指引</p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/50 dark:to-blue-900/50 p-3 md:p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 hover:shadow-md transition-shadow duration-300">
                    <div className="text-3xl md:text-4xl mb-2 md:mb-3">🔮</div>
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-1 md:mb-2 text-sm md:text-base">每日指引</h4>
                    <p className="text-xs md:text-sm text-indigo-700 dark:text-indigo-300">每日塔罗运势，陪伴您的生活旅程</p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/50 dark:to-rose-900/50 p-3 md:p-4 rounded-lg border border-pink-100 dark:border-pink-800 hover:shadow-md transition-shadow duration-300">
                    <div className="text-3xl md:text-4xl mb-2 md:mb-3">📚</div>
                    <h4 className="font-bold text-pink-900 dark:text-pink-100 mb-1 md:mb-2 text-sm md:text-base">塔罗知识</h4>
                    <p className="text-xs md:text-sm text-pink-700 dark:text-pink-300">学习塔罗牌义，掌握占卜技巧</p>
                  </div>
                </div>

                <div className="mt-4 md:mt-6">
                  <div className="inline-flex items-center space-x-2 md:space-x-3 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full">
                    <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-purple-500 dark:border-purple-400"></div>
                    <span className="text-xs md:text-sm font-medium text-purple-700 dark:text-purple-300">
                      功能开发中，敬请期待...
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TarotGardenPage;
