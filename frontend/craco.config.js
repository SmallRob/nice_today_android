const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@lite': path.resolve(__dirname, 'src/lite'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/styles'),
    },
    configure: (webpackConfig, { env, paths }) => {
      // 检查是否构建轻量版
      const isLiteBuild = process.env.BUILD_LITE_VERSION === 'true';

      if (isLiteBuild) {
        // 修改入口文件以使用轻量版
        paths.appIndexJs = path.resolve(__dirname, 'src/index.js');

        // 可以在这里添加其他轻量版特定的webpack配置
        console.log('Building Lite Version');
      } else {
        console.log('Building Full Version');
      }

      // 添加针对Android WebView的优化配置
      if (env === 'production') {
        // 优化代码分割以减少chunk数量
        webpackConfig.optimization.splitChunks = {
          ...webpackConfig.optimization.splitChunks,
          chunks: 'async',
          minChunks: 2,
          maxSize: 244 * 1024, // 限制chunk大小为244KB，适合移动网络
          cacheGroups: {
            default: false,
            vendors: false,
            common: {
              name: 'common',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true
            }
          }
        };

        // 启用生产环境source map以帮助调试
        webpackConfig.devtool = 'source-map';
      }

      return webpackConfig;
    }
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@lite/(.*)$': '<rootDir>/src/lite/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@pages/(.*)$': '<rootDir>/src/pages/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@styles/(.*)$': '<rootDir>/src/styles/$1',
      }
    }
  }
};