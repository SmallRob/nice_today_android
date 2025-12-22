import { Lunar, Solar } from 'lunar-javascript';

/**
 * 获取当前日期的节气状态
 * 包括：是否在节气期间（前后3天）、当前/临近节气名称、日期、距离天数
 * @param {Date} date 
 */
export const getSolarTermState = (date = new Date()) => {
    const lunar = Lunar.fromDate(date);
    const currentTerm = lunar.getJieQi();

    // 计算日期差 (date - target)
    const getDiffDays = (targetSolar) => {
        // 构造无时间的日期对象进行比较
        const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        // targetSolar.getMonth() 返回 1-12
        const d2 = new Date(targetSolar.getYear(), targetSolar.getMonth() - 1, targetSolar.getDay());

        const diffTime = d1 - d2;
        return Math.round(diffTime / (1000 * 60 * 60 * 24));
    };

    // 1. 今天就是节气
    if (currentTerm) {
        return {
            active: true,
            name: currentTerm,
            date: Solar.fromDate(date).toYmd(),
            diff: 0,
            type: 'today'
        };
    }

    // 2. 检查前一个节气 (是否在后3天内)
    // getPrevJieQi(boolean wholeDay) - false: 按交节时刻? 
    // 既然我们只关心日期，直接用默认即可。lunar-javascript 默认按天？
    // 经查，getPrevJieQi() 返回 JieQi 对象
    const prevJieQi = lunar.getPrevJieQi();
    if (prevJieQi) {
        const prevSolar = prevJieQi.getSolar();
        const diff = getDiffDays(prevSolar); // 正数，表示过去多少天
        // console.log('Prev:', prevJieQi.getName(), diff);
        if (diff > 0 && diff <= 3) {
            return {
                active: true,
                name: prevJieQi.getName(),
                date: prevSolar.toYmd(),
                diff: diff,
                type: 'after'
            };
        }
    }

    // 3. 检查下一个节气 (是否在前3天内，或者作为预告)
    const nextJieQi = lunar.getNextJieQi();
    if (nextJieQi) {
        const nextSolar = nextJieQi.getSolar();
        const diff = getDiffDays(nextSolar); // 负数，表示还有多少天 (e.g. -1 表示明天)
        // console.log('Next:', nextJieQi.getName(), diff);

        if (diff >= -3 && diff < 0) {
            return {
                active: true,
                name: nextJieQi.getName(),
                date: nextSolar.toYmd(),
                diff: diff,
                type: 'before'
            };
        }

        // 4. 不在节气窗口期，返回下一个节气预告
        return {
            active: false,
            name: nextJieQi.getName(),
            date: nextSolar.toYmd(),
            diff: diff,
            type: 'reminder'
        };
    }

    return null;
};
