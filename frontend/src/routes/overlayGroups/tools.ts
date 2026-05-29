import { lazy } from 'react';
import { OverlayGroup } from '../overlayRegistry.types';

/**
 * 工具集域路由配置
 * 包含：待办、记事、习惯追踪、设置等
 */
export const toolsGroup: OverlayGroup = {
  domain: 'tools',
  entries: [
    {
      id: 'todo_list',
      component: lazy(() => import('../../pages/TodoListPage')),
      hidesNav: true,
    },
    {
      id: 'habit_tracker',
      component: lazy(() => import('../../pages/HabitTrackerPage')),
      hidesNav: true,
    },
    {
      id: 'habit_stats',
      component: lazy(() => import('../../pages/HabitStatsPage')),
      hidesNav: true,
    },
    {
      id: 'password_vault',
      component: lazy(() => import('../../pages/PasswordVaultPage')),
      hidesNav: true,
    },
    {
      id: 'user_config',
      component: lazy(() => import('../../pages/UserConfigPage')),
      hidesNav: true,
    },
    {
      id: 'user_profile',
      component: lazy(() => import('../../pages/UserProfilePage')),
      hidesNav: true,
    },
    {
      id: 'settings',
      component: lazy(() => import('../../pages/SettingsPage')),
      hidesNav: true,
    },
    {
      id: 'document_history',
      component: lazy(() => import('../../pages/DocumentHistoryPage')),
      hidesNav: true,
    },
    {
      id: 'document_viewer',
      component: lazy(() => import('../../pages/DocumentViewerPage')),
      hidesNav: true,
    },
    {
      id: 'lifestyle_guide',
      component: lazy(() => import('../../pages/LifestyleGuide')),
      hidesNav: true,
    },
    {
      id: 'dress_guide',
      component: lazy(() => import('../../pages/DressGuidePage')),
      hidesNav: true,
    },
    {
      id: 'fengshui_compass',
      component: lazy(() => import('../../pages/FengShuiCompassPage')),
      hidesNav: true,
    },
    {
      id: 'daily_card',
      component: lazy(() => import('../../pages/DailyCardPage')),
      hidesNav: true,
    },
    {
      id: 'finance',
      component: lazy(() => import('../../pages/FinancePage')),
      hidesNav: true,
    },
    {
      id: 'cultural_cap',
      component: lazy(() => import('../../pages/CulturalCapPage')),
      hidesNav: true,
    },
    {
      id: 'fishing_game',
      component: lazy(() => import('../../pages/FishingGamePage')),
      hidesNav: true,
    },
    {
      id: 'book_of_answers',
      component: lazy(() => import('../../pages/BookOfAnswersPage')),
      hidesNav: true,
    },
    {
      id: 'rainbow_mood',
      component: lazy(() => import('../../pages/RainbowMoodPage')),
      hidesNav: true,
    },
    {
      id: 'ancient_card_game',
      component: lazy(() => import('../../pages/AncientCardGamePage')),
      hidesNav: true,
    },
    {
      id: 'more_features',
      component: lazy(() => import('../../pages/MoreFeaturesPage')),
      hidesNav: true,
    },
  ],
};
