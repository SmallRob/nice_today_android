/**
 * Jest 测试配置文件
 * 配置测试环境、路径映射和覆盖率设置
 */

module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/__tests__/**/*.test.js',
    '<rootDir>/__tests__/**/*.test.jsx',
    '<rootDir>/src/**/__tests__/**/*.test.js',
    '<rootDir>/src/**/__tests__/**/*.test.jsx'
  ],
  
  // 测试文件忽略模式
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
    '/test/results/',
    '/test/reports/'
  ],
  
  // 模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 
      '<rootDir>/__mocks__/fileMock.js'
  },
  
  // 模块文件扩展名
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  
  // 覆盖率设置
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 测试超时时间
  testTimeout: 30000,
  
  // 显示测试结果
  verbose: true,
  
  // 全局变量
  globals: {
    __DEV__: true,
    __TEST__: true
  }
};