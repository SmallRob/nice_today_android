import { lazy } from 'react';
import { OverlayGroup } from '../overlayRegistry.types';

/**
 * 娱乐休闲域路由配置
 * 包含：游戏、趣味测试、互动内容等
 */
export const entertainmentGroup: OverlayGroup = {
  domain: 'entertainment',
  entries: [
    {
      id: 'ancient_card_game',
      component: lazy(() => import('../../pages/AncientCardGamePage')),
      hidesNav: true,
    },
    {
      id: 'book_of_answers',
      component: lazy(() => import('../../pages/BookOfAnswersPage')),
      hidesNav: true,
    },
    {
      id: 'daily_card',
      component: lazy(() => import('../../pages/DailyCardPage')),
      hidesNav: true,
    },
    {
      id: 'fishing_game',
      component: lazy(() => import('../../pages/FishingGamePage')),
      hidesNav: true,
    },
    {
      id: 'rainbow_mood',
      component: lazy(() => import('../../pages/RainbowMoodPage')),
      hidesNav: true,
    },
    {
      id: 'cultural_cap',
      component: lazy(() => import('../../pages/CulturalCapPage')),
      hidesNav: true,
    },
    {
      id: 'feng_shui_compass',
      component: lazy(() => import('../../pages/FengShuiCompassPage')),
      hidesNav: true,
    },
  ],
};