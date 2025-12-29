import { Card } from '../components/PageLayout';
import '../index.css';

function TarotGardenPage() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* 顶部标题区域 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">🔮 塔罗花园</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">探索神秘的塔罗世界</p>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="space-y-6">
            <Card>
              <div className="text-center p-6 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 rounded-lg text-white relative">
                <div className="text-5xl mb-3">🔮</div>
                <h2 className="text-2xl font-bold mb-2">神秘塔罗</h2>
                <p className="text-purple-100">聆听命运的指引</p>
                <button
                  onClick={() => window.location.href = '/tarot'}
                  className="absolute bottom-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md text-sm transition-all"
                >
                  进入 →
                </button>
              </div>
            </Card>

            <Card>
              <div className="text-center p-6 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-600 rounded-lg text-white relative">
                <div className="text-5xl mb-3">🔢</div>
                <h2 className="text-2xl font-bold mb-2">数字之灵</h2>
                <p className="text-blue-100">探索生命密码的奥秘</p>
                <button
                  onClick={() => window.location.href = '/numerology'}
                  className="absolute bottom-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md text-sm transition-all"
                >
                  进入 →
                </button>
              </div>
            </Card>

            <Card>
              <div className="text-center p-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 rounded-lg text-white relative">
                <div className="text-5xl mb-3">🌐</div>
                <h2 className="text-2xl font-bold mb-2">生命矩阵</h2>
                <p className="text-green-100">构建你的意义能量图谱</p>
                <button
                  onClick={() => window.location.href = '/life-matrix'}
                  className="absolute bottom-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md text-sm transition-all"
                >
                  进入 →
                </button>
              </div>
            </Card>

            <Card>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  神秘塔罗功能正在建设中...
                </p>
                <div className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 p-4 rounded-lg">
                    <div className="text-3xl mb-2">🎴</div>
                    <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">塔罗牌占卜</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">多种牌阵选择，深度解读命运指引</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900 dark:bg-opacity-20 p-4 rounded-lg">
                    <div className="text-3xl mb-2">🔮</div>
                    <h3 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">每日指引</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">每日塔罗运势，陪伴您的生活旅程</p>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900 dark:bg-opacity-20 p-4 rounded-lg">
                    <div className="text-3xl mb-2">📚</div>
                    <h3 className="font-medium text-pink-900 dark:text-pink-100 mb-2">塔罗知识</h3>
                    <p className="text-sm text-pink-700 dark:text-pink-300">学习塔罗牌义，掌握占卜技巧</p>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="inline-flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span>功能开发中，敬请期待...</span>
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
