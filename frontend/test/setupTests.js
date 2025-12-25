/**
 * Jest 测试设置文件
 * 配置测试环境、全局变量和模拟
 */

// 设置全局测试环境变量
global.__DEV__ = true;
global.__TEST__ = true;

// 模拟 localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

// 模拟 sessionStorage
class SessionStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.sessionStorage = new SessionStorageMock();

// 模拟 IndexedDB
class IndexedDBMock {
  constructor() {
    this.databases = new Map();
  }

  open(name, version) {
    return Promise.resolve({
      result: {
        objectStoreNames: []
      },
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null
    });
  }
}

global.indexedDB = new IndexedDBMock();

// 模拟 window 对象
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 模拟 IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模拟 ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模拟 performance API
global.performance = {
  now: jest.fn().mockReturnValue(0),
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  getEntriesByName: jest.fn().mockReturnValue([]),
  getEntriesByType: jest.fn().mockReturnValue([]),
  memory: {
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0
  }
};

// 模拟 console 方法（可选，用于测试时静音）
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    // 静音某些 console 方法
    debug: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// 模拟 fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
);

// 模拟 URL.createObjectURL
global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');

// 模拟 URL.revokeObjectURL
global.URL.revokeObjectURL = jest.fn();

// 设置 Jest 超时时间
jest.setTimeout(30000);

// 测试前清理
beforeEach(() => {
  // 清理 localStorage
  localStorage.clear();
  
  // 清理 sessionStorage
  sessionStorage.clear();
  
  // 重置所有模拟
  jest.clearAllMocks();
  
  // 重置 fetch 模拟
  fetch.mockClear();
});

// 测试后清理
afterEach(() => {
  // 确保所有定时器被清理
  jest.clearAllTimers();
});

// 全局测试辅助函数
const TestUtils = {
  // 等待异步操作完成
  waitFor: (callback, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        try {
          const result = callback();
          if (result) {
            resolve(result);
            return;
          }
          
          if (Date.now() - startTime > timeout) {
            reject(new Error('waitFor timeout'));
            return;
          }
          
          setTimeout(check, 10);
        } catch (error) {
          reject(error);
        }
      };
      
      check();
    });
  },
  
  // 模拟用户输入
  simulateInput: (element, value) => {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },
  
  // 模拟点击事件
  simulateClick: (element) => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  },
  
  // 生成测试数据
  generateTestData: (type, count = 1) => {
    const data = [];
    
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'userConfig':
          data.push({
            nickname: `测试用户${i}`,
            realName: `测试真实姓名${i}`,
            birthDate: `199${i % 10}-01-01`,
            birthTime: `${i % 24}:00`,
            birthLocation: {
              lng: 116.40 + (i * 0.1),
              lat: 39.90 + (i * 0.1)
            }
          });
          break;
          
        case 'baziInput':
          data.push({
            birthDate: `199${i % 10}-01-01`,
            birthTime: `${i % 24}:30`,
            longitude: 116.40 + (i * 0.1)
          });
          break;
          
        default:
          data.push({ id: i, name: `测试数据${i}` });
      }
    }
    
    return count === 1 ? data[0] : data;
  }
};

// 将辅助函数挂载到全局
global.TestUtils = TestUtils;