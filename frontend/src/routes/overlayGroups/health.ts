import { lazy } from 'react';
import { OverlayGroup } from '../overlayRegistry.types';

/**
 * 健康管理域路由配置
 * 包含：生物节律、情绪日历、身体指标、健康仪表盘等
 */
export const healthGroup: OverlayGroup = {
  domain: 'health',
  entries: [
    {
      id: 'biorhythm',
      component: lazy(() => import('../../pages/BiorhythmPage')),
      hidesNav: true,
    },
    {
      id: 'mood_calendar',
      component: lazy(() => import('../../pages/MoodCalendarPage')),
      hidesNav: true,
    },
    {
      id: 'health_dashboard',
      component: lazy(() => import('../../pages/HealthDashboardPage')),
      hidesNav: true,
    },
    {
      id: 'body_metrics',
      component: lazy(() => import('../../pages/BodyMetricsPage')),
      hidesNav: true,
    },
    {
      id: 'period_tracker',
      component: lazy(() => import('../../pages/PeriodTrackerPage')),
      hidesNav: true,
    },
    {
      id: 'sleep_health',
      component: lazy(() => import('../../pages/SleepHealthDashboardPage')),
      hidesNav: true,
    },
    {
      id: 'emo_health',
      component: lazy(() => import('../../pages/EmoHealthDashboardPage')),
      hidesNav: true,
    },
    {
      id: 'agile_health',
      component: lazy(() => import('../../pages/AgileHealthPage')),
      hidesNav: true,
    },
    {
      id: 'stage_health',
      component: lazy(() => import('../../pages/StageHealthPage')),
      hidesNav: true,
    },
    {
      id: 'organ_rhythm',
      component: lazy(() => import('../../pages/OrganRhythmPage')),
      hidesNav: true,
    },
    {
      id: 'wuxing_health',
      component: lazy(() => import('../../pages/WuxingHealthPage')),
      hidesNav: true,
    },
    {
      id: 'energy_boost',
      component: lazy(() => import('../../pages/EnergyBoostPage')),
      hidesNav: true,
    },
    {
      id: 'energy_tree',
      component: lazy(() => import('../../pages/EnergyTreePage')),
      hidesNav: true,
    },
  ],
};
