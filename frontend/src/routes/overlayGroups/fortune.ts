import { lazy } from 'react';
import { OverlayGroup } from '../overlayRegistry.types';

/**
 * 运势分析域路由配置
 * 包含：星座运势、八字分析、紫微斗数、黄历、塔罗等
 */
export const fortuneGroup: OverlayGroup = {
  domain: 'fortune',
  entries: [
    {
      id: 'horoscope',
      component: lazy(() => import('../../pages/HoroscopePage')),
      hidesNav: true,
    },
    {
      id: 'bazi',
      component: lazy(() => import('../../pages/BaziPage')),
      hidesNav: true,
    },
    {
      id: 'ziwei',
      component: lazy(() => import('../../pages/ZiWeiPage')),
      hidesNav: true,
    },
    {
      id: 'huangli',
      component: lazy(() => import('../../pages/HuangliPage')),
      hidesNav: true,
    },
    {
      id: 'tarot',
      component: lazy(() => import('../../pages/TarotPage')),
      hidesNav: true,
    },
    {
      id: 'tarot_garden',
      component: lazy(() => import('../../pages/TarotGardenPage')),
      hidesNav: true,
    },
    {
      id: 'maya',
      component: lazy(() => import('../../pages/MayaPage')),
      hidesNav: true,
    },
    {
      id: 'chinese_zodiac',
      component: lazy(() => import('../../pages/horoscope/ChineseZodiacPage')),
      hidesNav: true,
    },
    {
      id: 'numerology',
      component: lazy(() => import('../../pages/NumerologyPage')),
      hidesNav: true,
    },
    {
      id: 'qimen_dunjia',
      component: lazy(() => import('../../pages/QimenDunjiaPage')),
      hidesNav: true,
    },
    {
      id: 'takashima',
      component: lazy(() => import('../../pages/TakashimaAdvice')),
      hidesNav: true,
    },
    {
      id: 'tiebanshenshu',
      component: lazy(() => import('../../pages/TiebanshenshuPage')),
      hidesNav: true,
    },
    {
      id: 'plum_blossom',
      component: lazy(() => import('../../pages/PlumBlossomDivination')),
      hidesNav: true,
    },
    {
      id: 'six_yao',
      component: lazy(() => import('../../pages/SixYaoDivination')),
      hidesNav: true,
    },
    {
      id: 'simple_iching',
      component: lazy(() => import('../../pages/SimpleIChingPage')),
      hidesNav: true,
    },
  ],
};
