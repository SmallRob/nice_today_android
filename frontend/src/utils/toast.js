/**
 * 简单的Toast通知工具
 * 提供轻量级的消息提示功能
 */

class ToastService {
  constructor() {
    this.container = null;
    this.toastCount = 0;
    this.init();
  }

  /**
   * 初始化Toast容器
   */
  init() {
    if (typeof document === 'undefined') return;
    
    // 创建容器
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center space-y-2 pointer-events-none';
    document.body.appendChild(this.container);
  }

  /**
   * 显示Toast消息
   * @param {string} message - 要显示的消息
   * @param {Object} options - 选项
   * @param {string} options.type - 消息类型: 'info', 'success', 'warning', 'error'
   * @param {number} options.duration - 显示时长(毫秒)，默认3000
   */
  show(message, options = {}) {
    if (!this.container) this.init();
    if (!this.container) return;

    const {
      type = 'info',
      duration = 3000
    } = options;

    const toastId = `toast-${Date.now()}-${this.toastCount++}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `px-4 py-3 rounded-lg shadow-lg pointer-events-auto transform transition-all duration-300 ease-out ${this.getTypeClasses(type)}`;
    toast.textContent = message;
    
    // 添加动画类
    toast.classList.add('opacity-0', '-translate-y-2');
    
    this.container.appendChild(toast);
    
    // 触发重排以应用初始样式
    void toast.offsetWidth;
    
    // 显示动画
    toast.classList.remove('opacity-0', '-translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
    
    // 自动消失
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-2');
        
        setTimeout(() => {
          if (toast.parentNode) {
            this.container.removeChild(toast);
          }
        }, 300);
      }
    }, duration);
  }

  /**
   * 根据类型获取对应的CSS类
   */
  getTypeClasses(type) {
    const classes = {
      info: 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700',
      success: 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700',
      warning: 'bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700',
      error: 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
    };
    return classes[type] || classes.info;
  }

  /**
   * 快捷方法：显示信息消息
   */
  info(message, duration = 3000) {
    this.show(message, { type: 'info', duration });
  }

  /**
   * 快捷方法：显示成功消息
   */
  success(message, duration = 3000) {
    this.show(message, { type: 'success', duration });
  }

  /**
   * 快捷方法：显示警告消息
   */
  warning(message, duration = 3000) {
    this.show(message, { type: 'warning', duration });
  }

  /**
   * 快捷方法：显示错误消息
   */
  error(message, duration = 3000) {
    this.show(message, { type: 'error', duration });
  }

  /**
   * 显示确认对话框
   * @param {string} message - 要显示的消息
   * @param {Object} options - 选项
   * @param {string} options.title - 对话框标题
   * @param {string} options.confirmText - 确认按钮文字
   * @param {string} options.cancelText - 取消按钮文字
   * @returns {Promise<boolean>} 用户确认结果（true为确认，false为取消）
   */
  confirm(message, options = {}) {
    return new Promise((resolve) => {
      const {
        title = '确认',
        confirmText = '确认',
        cancelText = '取消'
      } = options;

      // 创建遮罩层
      const mask = document.createElement('div');
      mask.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
      mask.style.backdropFilter = 'blur(2px)';
      
      // 创建对话框
      const dialog = document.createElement('div');
      dialog.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden';
      
      // 标题
      const titleEl = document.createElement('div');
      titleEl.className = 'px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700';
      titleEl.innerHTML = `<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">${title}</h3>`;
      
      // 内容
      const contentEl = document.createElement('div');
      contentEl.className = 'px-6 py-5';
      contentEl.innerHTML = `<p class="text-gray-700 dark:text-gray-300">${message}</p>`;
      
      // 按钮容器
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'px-6 py-5 bg-gray-50 dark:bg-gray-900 flex gap-3';
      
      // 取消按钮
      const cancelButton = document.createElement('button');
      cancelButton.className = 'flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium';
      cancelButton.textContent = cancelText;
      cancelButton.addEventListener('click', () => {
        mask.remove();
        resolve(false);
      });
      
      // 确认按钮
      const confirmButton = document.createElement('button');
      confirmButton.className = 'flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-md hover:shadow-lg';
      confirmButton.textContent = confirmText;
      confirmButton.addEventListener('click', () => {
        mask.remove();
        resolve(true);
      });
      
      // 组装
      buttonContainer.appendChild(cancelButton);
      buttonContainer.appendChild(confirmButton);
      
      dialog.appendChild(titleEl);
      dialog.appendChild(contentEl);
      dialog.appendChild(buttonContainer);
      
      mask.appendChild(dialog);
      document.body.appendChild(mask);
      
      // 添加淡入动画
      setTimeout(() => {
        dialog.classList.add('opacity-100', 'scale-100');
      }, 10);
    });
  }
}

// 创建单例实例
const toast = new ToastService();

// 导出单例
export default toast;

// 导出快捷方法
export const showToast = (message, options) => toast.show(message, options);
export const showInfo = (message, duration) => toast.info(message, duration);
export const showSuccess = (message, duration) => toast.success(message, duration);
export const showWarning = (message, duration) => toast.warning(message, duration);
export const showError = (message, duration) => toast.error(message, duration);