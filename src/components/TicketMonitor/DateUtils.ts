import { isHoliday } from '@/lib/holidays';

export const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function getNext15WorkDays(): Date[] {
  const workDays: Date[] = [];
  const currentDate = new Date();
  
  while (workDays.length < 15) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const isPublicHoliday = isHoliday(currentDate);
    
    if (!isWeekend && !isPublicHoliday) {
      workDays.push(new Date(currentDate));
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workDays;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  });
}

export function getWeekDay(date: Date): string {
  return WEEKDAYS[date.getDay()];
} 