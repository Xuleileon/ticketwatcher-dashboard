import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TicketMonitorProps, TicketInfo } from '@/types/components';
import { Railway12306 } from '@/lib/railway';
import { isHoliday, Holidays } from '@/lib/holidays';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 获取未来15天
const getNext15Days = () => {
  const days: Date[] = [];
  const startDate = new Date();
  let currentDate = new Date(startDate);
  
  while (days.length < 15) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

// 获取日期状态
const getDateStatus = (date: Date): { isHoliday: boolean; message: string } => {
  const dateStr = date.toISOString().split('T')[0];
  const dayOfWeek = date.getDay();
  
  // 检查是否是法定节假日
  if (Holidays.HOLIDAYS_2024[dateStr] || Holidays.HOLIDAYS_2025[dateStr] || Holidays.HOLIDAYS_2026[dateStr]) {
    return { isHoliday: true, message: '法定节假日' };
  }
  
  // 检查是否是调休工作日
  if (Holidays.WORKDAYS_2024[dateStr] || Holidays.WORKDAYS_2025[dateStr] || Holidays.WORKDAYS_2026[dateStr]) {
    return { isHoliday: false, message: '调休工作日' };
  }
  
  // 检查是否是周末
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { isHoliday: true, message: '周末' };
  }
  
  return { isHoliday: false, message: '' };
};

export const TicketMonitor: React.FC<TicketMonitorProps> = ({
  preferences,
  onPurchase
}) => {
  const [ticketData, setTicketData] = useState<{[key: string]: TicketInfo[]}>({});
  const [days, setDays] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const railway = Railway12306.getInstance();

  useEffect(() => {
    const initDays = () => {
      const nextDays = getNext15Days();
      setDays(nextDays);
      setIsLoading(false);
    };
    initDays();
  }, []);

  useEffect(() => {
    if (!preferences || days.length === 0) return;

    const fetchTicketInfo = async () => {
      const newTicketData: {[key: string]: TicketInfo[]} = {};
      
      for (const date of days) {
        const dateStr = date.toISOString().split('T')[0];
        try {
          const tickets = await railway.queryTickets(
            dateStr,
            preferences.fromStation,
            preferences.toStation
          );

          // 过滤出早晚班车次
          const relevantTickets = tickets.filter(ticket => 
            ticket.trainNumber === preferences.morningTrainNumber || 
            ticket.trainNumber === preferences.eveningTrainNumber
          );

          newTicketData[dateStr] = relevantTickets;
        } catch (error) {
          console.error('Error fetching ticket info:', error);
        }
      }

      setTicketData(newTicketData);
    };

    fetchTicketInfo();
    // 每分钟刷新一次
    const interval = setInterval(fetchTicketInfo, 60000);
    return () => clearInterval(interval);
  }, [preferences, days]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>余票监控</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>余票监控</CardTitle>
          <CardDescription>请先设置通勤偏好</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>余票监控</CardTitle>
        <CardDescription>
          {preferences.fromStation} → {preferences.toStation} 近15天余票情况
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>星期</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>早班车次</TableHead>
              <TableHead>早班余票</TableHead>
              <TableHead>早班价格</TableHead>
              <TableHead>操作</TableHead>
              <TableHead>晚班车次</TableHead>
              <TableHead>晚班余票</TableHead>
              <TableHead>晚班价格</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {days.map(date => {
              const dateStr = date.toISOString().split('T')[0];
              const tickets = ticketData[dateStr] || [];
              const morningTicket = tickets.find(t => t.trainNumber === preferences.morningTrainNumber);
              const eveningTicket = tickets.find(t => t.trainNumber === preferences.eveningTrainNumber);
              const dateStatus = getDateStatus(date);

              return (
                <TableRow key={dateStr} className={dateStatus.isHoliday ? 'bg-red-50' : ''}>
                  <TableCell>{dateStr}</TableCell>
                  <TableCell>周{WEEKDAYS[date.getDay()]}</TableCell>
                  <TableCell>
                    {dateStatus.message && (
                      <Badge variant={dateStatus.isHoliday ? "destructive" : "secondary"}>
                        {dateStatus.message}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{preferences.morningTrainNumber}</TableCell>
                  <TableCell>{morningTicket?.remainingTickets || '查询中'}</TableCell>
                  <TableCell>¥{morningTicket?.price || '--'}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      disabled={!morningTicket || morningTicket.remainingTickets === 0}
                      onClick={() => onPurchase(dateStr, preferences.morningTrainNumber)}
                      variant={dateStatus.isHoliday ? "outline" : "default"}
                    >
                      购票
                    </Button>
                  </TableCell>
                  <TableCell>{preferences.eveningTrainNumber}</TableCell>
                  <TableCell>{eveningTicket?.remainingTickets || '查询中'}</TableCell>
                  <TableCell>¥{eveningTicket?.price || '--'}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      disabled={!eveningTicket || eveningTicket.remainingTickets === 0}
                      onClick={() => onPurchase(dateStr, preferences.eveningTrainNumber)}
                      variant={dateStatus.isHoliday ? "outline" : "default"}
                    >
                      购票
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};