import versionData from '../version.json';

/**
 * 炫彩版（完整版）配置文件
 */

export const versionConfig = {
    // 版本标识
    isLiteVersion: false,

    // 版本名称和版本号
    versionName: '炫彩版',
    appVersion: versionData.versionName,
    versionCode: versionData.versionCode,

    // 可用功能模块
    availableFeatures: {
        biorhythm: true,
        mayaCalendar: true,
        dressGuide: true,
        horoscope: true,
        mbti: true,
        zodiac: true
    },

    // 性能优化设置
    performance: {
        animations: true,
        lazyLoad: true,
        virtualScroll: true,
        imageOptimization: false
    }
};

export default versionConfig;
