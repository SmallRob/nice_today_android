import { lazy } from 'react';
import { OverlayGroup } from '../overlayRegistry.types';

/**
 * 用户中心域路由配置
 * 包含：设置、用户资料、用户配置、仪表盘等
 */
export const userCenterGroup: OverlayGroup = {
  domain: 'user-center',
  entries: [
    {
      id: 'settings',
      component: lazy(() => import('../../pages/SettingsPage')),
      hidesNav: false,
    },
    {
      id: 'user_profile',
      component: lazy(() => import('../../pages/UserProfilePage')),
      hidesNav: false,
    },
    {
      id: 'user_config',
      component: lazy(() => import('../../pages/UserConfigPage')),
      hidesNav: false,
    },
    {
      id: 'dashboard',
      component: lazy(() => import('../../pages/DashboardPage')),
      hidesNav: false,
    },
  ],
};