/**
 * Android原生通知服务
 * 封装Capacitor通知插件，支持Android系统原生推送通知
 */

class AndroidNotificationService {
  constructor() {
    this.permissionGranted = false;
    this.notificationEnabled = false;
    this.morningTime = '07:00';
    this.eveningTime = '21:00';
    this.isNativeApp = false;
    this.init();
  }

  // 初始化通知服务
  async init() {
    try {
      // 检查是否为Capacitor原生应用
      this.isNativeApp = this.checkIsNativeApp();
      
      if (this.isNativeApp) {
        // 原生应用：使用Capacitor通知
        try {
          await this.initCapacitorNotifications();
        } catch (capacitorError) {
          console.warn('Capacitor通知初始化失败，降级到Web通知:', capacitorError);
          this.isNativeApp = false;
          await this.initWebNotifications();
        }
      } else {
        // Web应用：使用浏览器通知（兼容模式）
        await this.initWebNotifications();
      }
      
      // 从本地存储加载用户设置
      this.loadSettings();
      
      console.log('通知服务初始化完成，模式:', this.isNativeApp ? 'Android原生' : 'Web浏览器');
    } catch (error) {
      console.error('通知服务初始化失败:', error);
      // 确保即使初始化失败也不会影响应用其他功能
      try {
        // 最后的降级措施
        this.isNativeApp = false;
        this.permissionGranted = false;
        this.notificationEnabled = false;
      } catch (fallbackError) {
        console.error('通知服务降级措施失败:', fallbackError);
      }
    }
  }

  // 检查是否为Capacitor原生应用
  checkIsNativeApp() {
    try {
      return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    } catch (error) {
      console.warn('检查Capacitor原生应用状态失败:', error);
      return false;
    }
  }

  // 初始化Capacitor通知
  async initCapacitorNotifications() {
    try {
      // 动态导入Capacitor通知插件
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      this.LocalNotifications = LocalNotifications;
      
      // 检查插件是否可用
      if (!LocalNotifications || typeof LocalNotifications.requestPermissions !== 'function') {
        throw new Error('LocalNotifications插件不可用');
      }
      
      // 请求通知权限
      const permission = await LocalNotifications.requestPermissions();
      this.permissionGranted = permission.display === 'granted';
      
      // 监听通知点击事件
      try {
        await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          console.log('通知被点击:', notification);
          this.handleNotificationClick(notification);
        });
      } catch (listenerError) {
        console.warn('添加通知点击监听器失败:', listenerError);
      }
      
      // 配置通知渠道（Android 8.0+）
      try {
        await LocalNotifications.createChannel({
          id: 'biorhythm_channel',
          name: '生物节律提醒',
          description: '生物节律应用的通知频道',
          importance: 4, // IMPORTANCE_HIGH
          visibility: 1, // VISIBILITY_PUBLIC
          sound: 'default',
          vibration: true
        });
      } catch (channelError) {
        console.warn('创建通知渠道失败:', channelError);
      }
      
    } catch (error) {
      console.error('Capacitor通知初始化失败:', error);
      // 降级到Web通知
      this.isNativeApp = false;
      await this.initWebNotifications();
    }
  }

  // 初始化Web通知（兼容模式）
  async initWebNotifications() {
    try {
      if ('Notification' in window) {
        this.permissionGranted = Notification.permission === 'granted';
        
        if (!this.permissionGranted && Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          this.permissionGranted = permission === 'granted';
        }
      }
    } catch (error) {
      console.warn('Web通知初始化失败:', error);
      this.permissionGranted = false;
    }
  }

  // 加载用户设置
  loadSettings() {
    try {
      const settings = localStorage.getItem('notificationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.notificationEnabled = parsed.enabled || false;
        this.morningTime = parsed.morningTime || '07:00';
        this.eveningTime = parsed.eveningTime || '21:00';
      }
    } catch (error) {
      console.error('加载通知设置失败:', error);
    }
  }

  // 保存用户设置
  saveSettings() {
    try {
      const settings = {
        enabled: this.notificationEnabled,
        morningTime: this.morningTime,
        eveningTime: this.eveningTime
      };
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('保存通知设置失败:', error);
    }
  }

  // 更新通知设置
  updateSettings({ enabled, morningTime, eveningTime }) {
    if (enabled !== undefined) this.notificationEnabled = enabled;
    if (morningTime) this.morningTime = morningTime;
    if (eveningTime) this.eveningTime = eveningTime;
    
    this.saveSettings();
    
    // 如果启用了通知，重新安排定时器
    if (this.notificationEnabled && this.permissionGranted) {
      this.scheduleNotifications();
    }
  }

  // 安排定时通知
  scheduleNotifications() {
    // 清除现有定时器
    if (this.morningTimer) clearTimeout(this.morningTimer);
    if (this.eveningTimer) clearTimeout(this.eveningTimer);

    if (!this.notificationEnabled || !this.permissionGranted) {
      return;
    }

    if (this.isNativeApp && this.LocalNotifications) {
      // Android原生应用：使用精确的定时通知
      this.scheduleAndroidNotifications();
    } else {
      // Web应用：使用JavaScript定时器
      this.scheduleWebNotifications();
    }
  }

  // 安排Android原生定时通知
  async scheduleAndroidNotifications() {
    try {
      // 安全地取消所有现有通知（避免空指针异常）
      try {
        await this.LocalNotifications.cancel({
          notifications: [] // 明确传入空数组而不是null
        });
      } catch (cancelError) {
        console.warn('取消通知时出现警告:', cancelError);
        // 继续执行，不中断后续安排
      }
      
      // 安排早上通知
      await this.scheduleAndroidSingleNotification(
        this.morningTime, 
        '生物节律提醒', 
        '早上好！来看看今天的生物节律吧~',
        1001 // 早上通知ID
      );
      
      // 安排晚上通知
      await this.scheduleAndroidSingleNotification(
        this.eveningTime, 
        '生物节律提醒', 
        '晚上好！回顾一下今天的节律状态吧~',
        1002 // 晚上通知ID
      );
      
      console.log('Android定时通知已安排');
    } catch (error) {
      console.error('安排Android通知失败:', error);
      // 降级到Web定时器
      this.scheduleWebNotifications();
    }
  }

  // 安排单个Android通知
  async scheduleAndroidSingleNotification(timeString, title, message, notificationId) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    // 如果目标时间已经过去，安排到明天
    if (targetTime <= new Date()) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    await this.LocalNotifications.schedule({
      notifications: [{
        id: notificationId,
        title: title,
        body: message,
        schedule: { 
          at: targetTime,
          repeats: true, // 每天重复
          every: 'day'
        },
        sound: 'default',
        channelId: 'biorhythm_channel',
        smallIcon: 'ic_stat_icon',
        largeIcon: 'ic_launcher'
      }]
    });
  }

  // 安排Web定时通知
  scheduleWebNotifications() {
    // 安排早上通知
    this.scheduleWebSingleNotification(this.morningTime, '早上好！来看看今天的生物节律吧~');
    
    // 安排晚上通知
    this.scheduleWebSingleNotification(this.eveningTime, '晚上好！回顾一下今天的节律状态吧~');
  }

  // 安排单个Web通知
  scheduleWebSingleNotification(timeString, message) {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    // 如果目标时间已经过去，安排到明天
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const timeDiff = targetTime.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      this.sendNotification('生物节律提醒', message);
      // 安排明天的通知
      this.scheduleWebSingleNotification(timeString, message);
    }, timeDiff);

    if (timeString === this.morningTime) {
      this.morningTimer = timer;
    } else {
      this.eveningTimer = timer;
    }
  }

  // 发送节律极值提醒
  sendCriticalAlert(biorhythmType, value, advice) {
    if (!this.permissionGranted || !this.notificationEnabled) {
      return;
    }

    const title = `${biorhythmType}节律预警`;
    const body = `当前${biorhythmType}节律值: ${value.toFixed(1)}。${advice}`;
    
    this.sendNotification(title, body);
  }

  // 发送通用通知
  async sendNotification(title, body, options = {}) {
    if (!this.permissionGranted) {
      console.warn('没有通知权限，无法发送通知');
      return;
    }

    try {
      if (this.isNativeApp && this.LocalNotifications) {
        // Android原生通知
        await this.sendAndroidNotification(title, body, options);
      } else {
        // Web浏览器通知
        this.sendWebNotification(title, body, options);
      }
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  }

  // 发送Android原生通知
  async sendAndroidNotification(title, body, options = {}) {
    // 安全检查
    if (!this.LocalNotifications) {
      console.warn('LocalNotifications插件未初始化，降级到Web通知');
      this.sendWebNotification(title, body, options);
      return Date.now();
    }
    
    // 检查schedule方法是否存在
    if (typeof this.LocalNotifications.schedule !== 'function') {
      console.warn('LocalNotifications.schedule方法不可用，降级到Web通知');
      this.sendWebNotification(title, body, options);
      return Date.now();
    }
    
    const notificationId = Date.now();
    
    try {
      // 构建通知对象
      const notification = {
        id: notificationId,
        title: title,
        body: body,
        schedule: { at: new Date(Date.now() + 100) }, // 立即发送
        sound: 'default',
        attachments: null,
        actionTypeId: '',
        extra: {
          ...options,
          timestamp: Date.now()
        },
        channelId: 'biorhythm_channel',
        smallIcon: 'ic_stat_icon',
        largeIcon: 'ic_launcher'
      };
      
      // 发送通知
      await this.LocalNotifications.schedule({
        notifications: [notification]
      });
      
      return notificationId;
    } catch (error) {
      console.error('发送Android通知失败:', error);
      // 降级到Web通知
      this.sendWebNotification(title, body, options);
      return notificationId;
    }
  }

  // 发送Web浏览器通知
  sendWebNotification(title, body, options = {}) {
    const notification = new Notification(title, {
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'biorhythm-notification',
      requireInteraction: false,
      silent: false,
      ...options
    });

    // 通知点击事件
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // 自动关闭通知（5秒后）
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  // 处理通知点击事件
  handleNotificationClick(notification) {
    console.log('通知被点击:', notification);
    // 可以在这里处理通知点击后的逻辑
    // 例如：跳转到特定页面、执行特定操作等
  }

  // 检查节律极值并发送提醒
  checkBiorhythmCritical(biorhythms) {
    if (!biorhythms || !this.notificationEnabled || !this.permissionGranted) {
      return;
    }

    const criticalPoints = [
      { type: '体力', value: biorhythms.physical, threshold: -90, advice: '今日体力极差，建议充分休息，避免剧烈运动' },
      { type: '情绪', value: biorhythms.emotional, threshold: -90, advice: '今日情绪极差，建议保持平和心态，减少社交压力' },
      { type: '智力', value: biorhythms.intellectual, threshold: -90, advice: '今日智力极差，建议暂停学习/决策，让大脑休息' },
      { type: '体力', value: biorhythms.physical, threshold: 90, advice: '今日体力极佳，适合挑战性运动和锻炼' },
      { type: '情绪', value: biorhythms.emotional, threshold: 90, advice: '今日情绪极佳，适合社交活动和创意表达' },
      { type: '智力', value: biorhythms.intellectual, threshold: 90, advice: '今日智力极佳，适合学习思考和重要决策' }
    ];

    criticalPoints.forEach(point => {
      if (Math.abs(point.value) >= Math.abs(point.threshold)) {
        this.sendCriticalAlert(point.type, point.value, point.advice);
      }
    });
  }

  // 获取当前设置
  getSettings() {
    return {
      enabled: this.notificationEnabled,
      morningTime: this.morningTime,
      eveningTime: this.eveningTime,
      permissionGranted: this.permissionGranted
    };
  }

  // 检查权限状态
  async checkPermission() {
    if ('Notification' in window) {
      this.permissionGranted = Notification.permission === 'granted';
      return this.permissionGranted;
    }
    return false;
  }

  // 手动请求权限
  async requestPermission() {
    try {
      // 检查浏览器是否支持通知功能
      if (!('Notification' in window)) {
        console.warn('浏览器不支持通知功能');
        return false;
      }

      // 在原生应用中使用Capacitor权限请求
      if (this.isNativeApp && this.LocalNotifications) {
        try {
          const permission = await this.LocalNotifications.requestPermissions();
          this.permissionGranted = permission.display === 'granted';
          return this.permissionGranted;
        } catch (nativeError) {
          console.warn('原生通知权限请求失败，降级到Web通知:', nativeError);
        }
      }

      // Web通知权限请求
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('请求通知权限失败:', error);
      // 确保即使出错也不会导致应用崩溃
      this.permissionGranted = false;
      return false;
    }
  }
}

// 创建全局通知服务实例
const notificationService = new AndroidNotificationService();

export default notificationService;