# 八字数据标准模式（Schema）文档

## 概述

本文档描述了完美的八字存储JSON对象，该对象统一了所有八字计算和存储的数据格式，兼容所有取值计算的地方。

## 数据结构

### 完整八字数据对象 (StandardBaziData)

```typescript
{
  // === 元数据 ===
  meta: {
    version: string,          // 数据版本号（如 "1.0.0"）
    calculatedAt: string,     // 计算时间（ISO 8601格式）
    dataSource: string,      // 数据来源（'calculate'|'cache'|'storage'|'converted'）
    nickname?: string         // 用户昵称
  },

  // === 出生信息 ===
  birth: {
    // 公历信息
    solar: {
      year: number,              // 公历年份
      month: number,             // 公历月份（1-12）
      day: number,               // 公历日期（1-31）
      hour: number,              // 公历小时（0-23）
      minute: number,            // 公历分钟（0-59）
      weekday: number,           // 星期（0-6，0=周日）
      zodiac: string,           // 西方星座
      text: string,             // 公历日期文本（如：1991年4月30日）
      fullDate: string,         // 完整公历日期（YYYY-MM-DD）
      fullTime: string,         // 完整公历时间（HH:mm:ss）
      fullDateTime: string      // 完整公历日期时间（YYYY-MM-DD HH:mm:ss）
    },

    // 农历信息
    lunar: {
      year: number,               // 农历年份数字（如1991）
      yearInChinese: string,       // 农历年份中文（如辛未年）
      yearGanZhi: string,        // 年柱干支（如辛未）
      month: number,              // 农历月份数字（1-12）
      monthInChinese: string,     // 农历月份中文（如三月）
      monthGanZhi: string,      // 月柱干支（如壬辰）
      isLeapMonth: boolean,       // 是否闰月
      day: number,               // 农历日期数字（1-30）
      dayInChinese: string,      // 农历日期中文（如初七）
      dayGanZhi: string,        // 日柱干支（如乙巳）
      zodiacAnimal: string,       // 生肖（如羊）
      text: string,              // 农历日期文本（如辛未年三月初七）
      fullText: string,          // 完整农历文本（如辛未年三月初七 羊）
      shortText: string           // 简短农历文本（如三月初七）
    },

    // 出生地点
    location: {
      longitude: number,          // 经度（-180到180）
      latitude: number,           // 纬度（-90到90）
      province?: string,         // 省份
      city?: string,            // 城市
      district?: string,         // 区县
      text: string              // 地点文本（如：北京市东城区）
    },

    // 出生时间
    time: {
      original: string,           // 原始出生时间（HH:mm）
      solarTime: string,         // 真太阳时（HH:mm）
      shichen: string,           // 时辰（如：申时）
      shichenGanZhi: string,    // 时辰干支（如：壬申）
      shichenIndex: number,       // 时辰索引（0-11）
      text: string               // 时间文本（如：12:30 申时）
    }
  },

  // === 八字四柱 ===
  bazi: {
    year: {
      ganZhi: string,      // 年柱干支（如辛未）
      gan: string,         // 天干（如辛）
      zhi: string,         // 地支（如未）
      wuXing: string,      // 五行（如土）
      naYin: string        // 纳音（如壁上土）
    },
    month: { ... },
    day: { ... },
    hour: { ... },
    text: string            // 八字文本（如辛未 壬辰 乙巳 壬申）
  },

  // === 五行信息 ===
  wuXing: {
    year: string,              // 年柱五行（如土）
    month: string,            // 月柱五行（如水）
    day: string,              // 日柱五行（如火）
    hour: string,             // 时柱五行（如金）
    text: string,             // 五行文本（如土 水 火 金）
    counts: {                 // 五行计数
      木: number,
      火: number,
      土: number,
      金: number,
      水: number
    },
    elementArray: string[],    // 五行数组（按数量排序）
    dominantElement: string,   // 主导五行
    missingElements: string[] // 缺失五行（数组）
  },

  // === 纳音信息 ===
  naYin: {
    year: string,              // 年柱纳音（如壁上土）
    month: string,            // 月柱纳音（如长流水）
    day: string,              // 日柱纳音（如覆灯火）
    hour: string,             // 时柱纳音（如剑锋金）
    text: string              // 纳音文本（如壁上土 长流水 覆灯火 剑锋金）
  },

  // === 日主信息 ===
  dayMaster: {
    gan: string,               // 日干（如乙）
    zhi: string,              // 日支（如巳）
    ganZhi: string,           // 日柱干支（如乙巳）
    element: string,           // 日主五行（如火）
    yangYin: string,           // 日主阴阳（阳或阴）
    strength: {                // 日主强弱
      type: string,          // 强弱类型（如'偏强'）
      score: number           // 强弱分数（0-100）
    },
    luckyElement?: string,      // 喜用神
    unluckyElement?: string     // 忌神
  },

  // === 八字分析 ===
  analysis: {
    fortuneType: string,       // 命格类型（如八字偏强、八字偏弱）
    luckyElement: string,      // 喜用神
    description: string        // 命格描述
    advice?: string[]          // 命理建议
  },

  // === 完整对象 ===
  lunar: Object,              // 完整农历对象（lunar-javascript库的原始对象）
  solar: Object,              // 完整公历对象（lunar-javascript库的原始对象）
}
```

### 兼容旧版的字段（为了向后兼容）

为了兼容旧版本的代码，标准数据对象也包含以下字段：

```javascript
{
  // 顶层属性（旧版格式）
  birthDate: string,        // 公历出生日期（YYYY-MM-DD）
  birthTime: string,        // 公历出生时间（HH:mm）
  lunarBirthDate: string,  // 农历出生日期
  trueSolarTime: string,   // 真太阳时

  // 旧版数据结构
  solar: { ... },
  lunar: { ... },
  bazi: { ... },
  wuxing: { ... },
  nayin: { ... },
  shichen: { ... },

  // 顶层属性（用于避免访问错误）
  year: string,
  month: string,
  day: string,
  hour: string
}
```

## 数据访问方式

### 八字四柱

```javascript
// 标准格式（推荐）
baziData.bazi.year.ganZhi      // 年柱干支
baziData.bazi.month.ganZhi     // 月柱干支
baziData.bazi.day.ganZhi       // 日柱干支
baziData.bazi.hour.ganZhi      // 时柱干支

// 旧版格式（兼容）
baziData.bazi.year               // 年柱干支
baziData.bazi.month             // 月柱干支
baziData.bazi.day               // 日柱干支
baziData.bazi.hour              // 时柱干支

// 顶层属性（兼容）
baziData.year
baziData.month
baziData.day
baziData.hour
```

### 五行信息

```javascript
baziData.wuXing.year
baziData.wuXing.month
baziData.wuXing.day
baziData.wuXing.hour
baziData.wuXing.text
baziData.wuXing.counts        // 五行计数
baziData.wuXing.dominantElement  // 主导五行
baziData.wuXing.missingElements  // 缺失五行
```

### 时辰信息

```javascript
baziData.birth.time.shichen
baziData.birth.time.shichenGanZhi
baziData.birth.time.solarTime

// 旧版格式（兼容）
baziData.shichen.ganzhi
baziData.trueSolarTime
```

### 农历信息

```javascript
baziData.birth.lunar.text
baziData.birth.lunar.fullText
baziData.birth.lunar.zodiacAnimal

// 旧版格式（兼容）
baziData.lunar.text
baziData.lunarBirthDate
```

### 日主信息

```javascript
baziData.dayMaster.gan
baziData.dayMaster.element
baziData.dayMaster.yangYin
baziData.dayMaster.strength.type
baziData.dayMaster.strength.score
```

## 辅助函数

`baziSchema.js` 提供了以下辅助函数：

- `createStandardBaziData(params)` - 从参数创建标准八字数据
- `createBaziFromConfig(config)` - 从用户配置创建标准八字数据
- `validateBaziData(baziData)` - 验证八字数据
- `convertLegacyBaziToStandard(oldBaziData)` - 从旧版数据转换到标准格式
- `getBaziFromConfig(config)` - 从配置中提取八字信息（兼容多种格式）
- `getDisplayBaziInfo(baziData)` - 获取显示用的八字信息（兼容多种格式）
- `getBaziPillars(baziData)` - 获取八字四柱（兼容多种格式）
- `getShichenFromBazi(baziData)` - 获取时辰（兼容多种格式）
- `getLunarDateFromBazi(baziData)` - 获取农历日期（兼容多种格式）
- `getTrueSolarTimeFromBazi(baziData)` - 获取真太阳时（兼容多种格式）

## 兼容性策略

### 1. 向前兼容

标准数据结构包含了所有旧版字段，确保现有代码无需修改即可正常工作。

### 2. 向前兼容

旧版代码通过兼容层可以访问标准格式的新数据。

### 3. 数据迁移

旧版数据可以通过 `convertLegacyBaziToStandard()` 函数自动转换为新格式。

## 使用示例

### 创建标准八字数据

```javascript
import { createStandardBaziData } from './utils/baziSchema';

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
```

### 从配置创建八字数据

```javascript
import { createBaziFromConfig } from './utils/baziSchema';

const baziData = createBaziFromConfig(userConfig);
```

### 获取八字四柱（兼容多种格式）

```javascript
import { getBaziPillars } from './utils/baziSchema';

const pillars = getBaziPillars(baziData);
console.log(pillars.year);    // 年柱干支
console.log(pillars.month);   // 月柱干支
console.log(pillars.day);     // 日柱干支
console.log(pillars.hour);    // 时柱干支
```

### 获取时辰（兼容多种格式）

```javascript
import { getShichenFromBazi } from './utils/baziSchema';

const shichen = getShichenFromBazi(baziData);
console.log(shichen);  // 如：申时
```

## 数据版本控制

- **版本 1.0.0** - 初始版本，包含完整的八字数据结构
- 版本号存储在 `meta.version` 字段中
- 数据格式变更时需要递增版本号
- 提供数据迁移函数处理旧版本数据

## 注意事项

1. **数据完整性**：所有计算都必须使用 `createStandardBaziData()` 函数来生成标准数据
2. **向后兼容**：确保旧版代码仍然可以正常工作
3. **验证机制**：使用 `validateBaziData()` 函数在保存前验证数据
4. **错误处理**：当数据不完整时，返回友好的错误提示
5. **性能优化**：缓存计算结果，避免重复计算
6. **一致性**：确保所有模块使用相同的计算逻辑

## 修改日志

- 2025-12-25: 创建标准八字Schema，统一所有八字数据格式
- 2025-12-25: 修改 `baziHelper.js` 使用标准Schema
- 2025-12-25: 修改 `calculateLiuNianDaYun` 和 `calculateDailyEnergy` 兼容标准Schema
- 2025-12-25: 修改 `LifeTrendPage.js` 使用标准Schema
