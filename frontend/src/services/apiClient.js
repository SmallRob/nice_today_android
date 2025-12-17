import axios from 'axios';

// API客户端配置
class ApiClient {
  constructor() {
    // 基础配置
    this.baseConfig = {
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };
    
    // 创建axios实例
    this.client = axios.create(this.baseConfig);
    
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 可以在这里添加认证token等
        console.log(`API请求: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('请求错误:', error);
        return Promise.reject(error);
      }
    );
    
    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        // 对响应数据做点什么
        return response.data;
      },
      (error) => {
        // 对响应错误做点什么
        console.error('响应错误:', error);
        return this.handleError(error);
      }
    );
  }
  
  // 统一错误处理
  handleError(error) {
    if (error.response) {
      // 服务器响应了错误状态码
      const { status, data } = error.response;
      switch (status) {
        case 400:
          return Promise.reject(new Error(data?.message || '请求参数错误'));
        case 401:
          return Promise.reject(new Error('未授权访问'));
        case 403:
          return Promise.reject(new Error('禁止访问'));
        case 404:
          return Promise.reject(new Error('请求资源不存在'));
        case 500:
          return Promise.reject(new Error('服务器内部错误'));
        default:
          return Promise.reject(new Error(data?.message || `请求失败 (${status})`));
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      return Promise.reject(new Error('网络连接失败，请检查网络设置'));
    } else {
      // 其他错误
      return Promise.reject(new Error(error.message || '未知错误'));
    }
  }
  
  // GET请求
  async get(url, params = {}, config = {}) {
    try {
      const response = await this.client.get(url, {
        params,
        ...config
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  // POST请求
  async post(url, data = {}, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  // PUT请求
  async put(url, data = {}, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  // DELETE请求
  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// 创建API客户端实例
const apiClient = new ApiClient();

// 导出API客户端实例
export default apiClient;