interface HolidayMap {
  [key: string]: boolean;
}

// 2024年法定节假日安排（已官方公布）
const HOLIDAYS_2024: HolidayMap = {
  // 元旦（1天）
  '2024-01-01': true,
  
  // 春节（6天）
  '2024-02-10': true,
  '2024-02-11': true,
  '2024-02-12': true,
  '2024-02-13': true,
  '2024-02-14': true,
  '2024-02-15': true,
  '2024-02-16': true,
  '2024-02-17': true,
  
  // 清明节（3天）
  '2024-04-04': true,
  '2024-04-05': true,
  '2024-04-06': true,
  
  // 劳动节（5天）
  '2024-05-01': true,
  '2024-05-02': true,
  '2024-05-03': true,
  '2024-05-04': true,
  '2024-05-05': true,
  
  // 端午节（1天）
  '2024-06-10': true,
  
  // 中秋节（3天）
  '2024-09-15': true,
  '2024-09-16': true,
  '2024-09-17': true,
  
  // 国庆节（7天）
  '2024-10-01': true,
  '2024-10-02': true,
  '2024-10-03': true,
  '2024-10-04': true,
  '2024-10-05': true,
  '2024-10-06': true,
  '2024-10-07': true,
};

// 2025年法定节假日安排（预估）
const HOLIDAYS_2025: HolidayMap = {
  // 元旦
  '2025-01-01': true,
  // 春节
  '2025-01-29': true,
  '2025-01-30': true,
  '2025-01-31': true,
  '2025-02-01': true,
  '2025-02-02': true,
  '2025-02-03': true,
  '2025-02-04': true,
  // 清明节
  '2025-04-05': true,
  '2025-04-06': true,
  '2025-04-07': true,
  // 劳动节
  '2025-05-01': true,
  '2025-05-02': true,
  '2025-05-03': true,
  // 端午节
  '2025-05-31': true,
  '2025-06-01': true,
  '2025-06-02': true,
  // 中秋节
  '2025-09-04': true,
  '2025-09-05': true,
  '2025-09-06': true,
  // 国庆节
  '2025-10-01': true,
  '2025-10-02': true,
  '2025-10-03': true,
  '2025-10-04': true,
  '2025-10-05': true,
  '2025-10-06': true,
  '2025-10-07': true,
};

// 2026年法定节假日安排（预估）
const HOLIDAYS_2026: HolidayMap = {
  // 元旦
  '2026-01-01': true,
  // 春节
  '2026-02-17': true,
  '2026-02-18': true,
  '2026-02-19': true,
  '2026-02-20': true,
  '2026-02-21': true,
  '2026-02-22': true,
  '2026-02-23': true,
  // 清明节
  '2026-04-04': true,
  '2026-04-05': true,
  '2026-04-06': true,
  // 劳动节
  '2026-05-01': true,
  '2026-05-02': true,
  '2026-05-03': true,
  // 端午节
  '2026-06-20': true,
  '2026-06-21': true,
  '2026-06-22': true,
  // 中秋节
  '2026-09-24': true,
  '2026-09-25': true,
  '2026-09-26': true,
  // 国庆节
  '2026-10-01': true,
  '2026-10-02': true,
  '2026-10-03': true,
  '2026-10-04': true,
  '2026-10-05': true,
  '2026-10-06': true,
  '2026-10-07': true,
};

// 2024年调休上班日期（已官方公布）
const WORKDAYS_2024: HolidayMap = {
  '2024-02-04': true,  // 春节调休（周日）
  '2024-02-18': true,  // 春节调休（周日）
  '2024-04-07': true,  // 清明节调休（周日）
  '2024-04-28': true,  // 劳动节调休（周日）
  '2024-05-11': true,  // 劳动节调休（周六）
  '2024-09-14': true,  // 中秋节调休（周六）
  '2024-09-29': true,  // 国庆节调休（周日）
  '2024-10-12': true,  // 国庆节调休（周六）
};

// 2025年调休上班日期（预估）
const WORKDAYS_2025: HolidayMap = {
  '2025-01-26': true, // 春节调休
  '2025-02-08': true,
  '2025-04-06': true, // 清明调休
  '2025-04-27': true, // 劳动节调休
  '2025-05-04': true,
  '2025-09-07': true, // 中秋调休
  '2025-09-28': true, // 国庆调休
  '2025-10-11': true,
};

// 2026年调休上班日期（预估）
const WORKDAYS_2026: HolidayMap = {
  '2026-02-15': true, // 春节调休
  '2026-02-28': true,
  '2026-04-05': true, // 清明调休
  '2026-04-26': true, // 劳动节调休
  '2026-05-09': true,
  '2026-09-26': true, // 中秋调休
  '2026-09-27': true, // 国庆调休
  '2026-10-10': true,
};

// 合并所有节假日和调休数据
const ALL_HOLIDAYS = {
  ...HOLIDAYS_2024,
  ...HOLIDAYS_2025,
  ...HOLIDAYS_2026
};

const ALL_WORKDAYS = {
  ...WORKDAYS_2024,
  ...WORKDAYS_2025,
  ...WORKDAYS_2026
};

export function isHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  
  // 如果是法定节假日，返回true
  if (ALL_HOLIDAYS[dateStr]) {
    return true;
  }
  
  // 如果是调休工作日，返回false
  if (ALL_WORKDAYS[dateStr]) {
    return false;
  }
  
  // 如果是周末（0是周日，6是周六）
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

// 导出节假日数据供其他地方使用
export const Holidays = {
  HOLIDAYS_2024,
  HOLIDAYS_2025,
  HOLIDAYS_2026,
  WORKDAYS_2024,
  WORKDAYS_2025,
  WORKDAYS_2026
}; 