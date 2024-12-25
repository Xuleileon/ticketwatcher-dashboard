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
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

export function getWeekDay(date: Date): string {
  return WEEKDAYS[date.getDay()];
}

export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
} 