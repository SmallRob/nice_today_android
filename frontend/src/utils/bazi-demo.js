import {
    createStandardBaziData,
    getBaziPillars,
    getShichenFromBazi,
    getLunarDateFromBazi
} from './utils/baziSchema';

// 从参数创建标准八字数据
const baziData = createStandardBaziData({
    birthDate: '1991-04-30',
    birthTime: '12:30',
    birthLocation: {
        lng: 116.40,
        lat: 39.90,
        province: '北京市',
        city: '北京市',
        district: '东城区'
    },
    nickname: '张三'
});

// 获取八字四柱
const pillars = getBaziPillars(baziData);
// => { year: '辛未', month: '壬辰', day: '乙巳', hour: '癸酉' }

// 获取时辰
const shichen = getShichenFromBazi(baziData);
// => '申时'

// 获取农历日期
const lunarDate = getLunarDateFromBazi(baziData);
// => '辛未年三月初七 羊'
