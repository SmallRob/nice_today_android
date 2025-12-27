import React from 'react';

const ErrorPage = ({ error }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900 p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          加载失败
        </h1>
        <p className="text-gray-600 dark:text-white mb-6">
          页面加载时出现错误，请刷新页面重试
        </p>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400 text-sm">
              {error.message || '未知错误'}
            </p>
          </div>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          刷新页面
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
