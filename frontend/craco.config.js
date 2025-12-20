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