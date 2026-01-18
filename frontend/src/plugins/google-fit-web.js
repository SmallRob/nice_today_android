/**
 * Google Fit Web 模拟实现
 * 在Web环境中提供模拟的Google Fit功能
 */

class GoogleFitWeb {
  async checkPermissions() {
    // Web环境模拟权限检查
    return {
      permissions: {
        activity: 'granted',
        steps: 'granted'
      }
    };
  }

  async requestPermissions() {
    // Web环境模拟权限请求
    return {
      permissions: {
        activity: 'granted',
        steps: 'granted'
      }
    };
  }

  async connect() {
    // Web环境模拟连接
    return {
      connected: true
    };
  }

  async getStepCount(options) {
    // Web环境模拟获取步数
    const startDate = options.startDate ? new Date(options.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    
    // 生成模拟数据
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const stepData = [];
    
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      stepData.push({
        date: date.toISOString().split('T')[0],
        steps: Math.floor(Math.random() * 10000) + 2000  // 模拟每天2000-12000步
      });
    }
    
    return {
      steps: stepData.reduce((sum, day) => sum + day.steps, 0),
      data: stepData
    };
  }
}

export { GoogleFitWeb };