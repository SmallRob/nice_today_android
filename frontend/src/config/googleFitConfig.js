/**
 * Google Fit API 配置文件
 * 包含Google Fit集成所需的所有配置信息
 */

export const GOOGLE_FIT_CONFIG = {
  // 客户端ID
  clientId: '599370866503-rbddtdoa9guh6nelb3nt498kh2bkh79a.apps.googleusercontent.com',
  
  // 项目ID
  projectId: 'robust-team-414005',
  
  // OAuth 2.0 端点
  authUri: 'https://accounts.google.com/o/oauth2/auth',
  tokenUri: 'https://oauth2.googleapis.com/token',
  authProviderX509CertUrl: 'https://www.googleapis.com/oauth2/v1/certs',
  
  // 健康数据权限范围
  scopes: [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.activity.write',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.body.write',
    'https://www.googleapis.com/auth/fitness.location.read',
    'https://www.googleapis.com/auth/fitness.location.write',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.sleep.write'
  ],
  
  // 数据类型配置
  dataTypes: {
    steps: 'com.google.step_count.delta',
    distance: 'com.google.distance.delta',
    calories: 'com.google.calories.expended',
    heartRate: 'com.google.heart_rate.bpm',
    weight: 'com.google.weight',
    height: 'com.google.height'
  },
  
  // 读取权限配置
  readPermissions: [
    'steps',
    'distance',
    'calories',
    'heartRate',
    'weight',
    'height'
  ],
  
  // 写入权限配置
  writePermissions: [
    'steps',
    'distance',
    'calories'
  ],
  
  // 默认查询参数
  defaultQueryParams: {
    bucketUnit: 'DAY',
    bucketSize: 1,
    limit: 1000
  }
};

// 导出辅助函数
export const getGoogleFitScopes = () => {
  return GOOGLE_FIT_CONFIG.scopes;
};

export const getDataTypes = () => {
  return GOOGLE_FIT_CONFIG.dataTypes;
};

export const getClientId = () => {
  return GOOGLE_FIT_CONFIG.clientId;
};