import React from 'react';

/**
 * 错误边界组件
 * 捕获子组件中的错误并显示友好的错误信息
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary 捕获到错误:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 m-4">
          <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">出现错误</h2>
          <p className="text-sm text-red-600 dark:text-red-300 mb-2">
            组件渲染时出现问题，请刷新页面重试。
          </p>
          <details className="text-xs text-red-500 dark:text-red-400">
            <summary>查看错误详情</summary>
            <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded overflow-auto">
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
