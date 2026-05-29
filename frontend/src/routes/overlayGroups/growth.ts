import { lazy } from 'react';
import { OverlayGroup } from '../overlayRegistry.types';

/**
 * 成长管理域路由配置
 * 包含：MBTI测试、性格测试、气质测试、人生趋势等
 */
export const growthGroup: OverlayGroup = {
  domain: 'growth',
  entries: [
    {
      id: 'mbti_test',
      component: lazy(() => import('../../pages/MBTITestPage')),
      hidesNav: true,
    },
    {
      id: 'personality_test',
      component: lazy(() => import('../../pages/PersonalityTestPage')),
      hidesNav: true,
    },
    {
      id: 'temperament_test',
      component: lazy(() => import('../../pages/ChenTemperamentTestPage')),
      hidesNav: true,
    },
    {
      id: 'temperament_detail',
      component: lazy(() => import('../../pages/TemperamentDetailPage')),
      hidesNav: true,
    },
    {
      id: 'life_trend',
      component: lazy(() => import('../../pages/LifeTrendPage')),
      hidesNav: true,
    },
    {
      id: 'age_analysis',
      component: lazy(() => import('../../pages/AgeAnalysisPage')),
      hidesNav: true,
    },
    {
      id: 'birth_chart',
      component: lazy(() => import('../../pages/BirthChart')),
      hidesNav: true,
    },
  ],
};
