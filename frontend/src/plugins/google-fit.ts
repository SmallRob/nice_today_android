/**
 * Google Fit Capacitor 插件接口定义
 * 用于与原生Android Google Fit API交互
 */

import { registerPlugin } from '@capacitor/core';

export interface GoogleFitPlugin {
  checkPermissions(): Promise<any>;
  requestPermissions(): Promise<any>;
  connect(): Promise<any>;
  getStepCount(options: { startDate?: string; endDate?: string }): Promise<any>;
}

const GoogleFit = registerPlugin<GoogleFitPlugin>('GoogleFit', {
  web: () => import('./google-fit-web').then(m => new m.GoogleFitWeb()),
});

export { GoogleFit };