import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { TicketMonitorProps, TicketInfo } from '@/types/components';
import { Railway12306 } from '@/lib/railway';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 获取未来15个工作日（排除周末和节假日）
const getNext15WorkDays = async () => {
  const workDays: Date[] = [];
  const startDate = new Date();
  let currentDate = new Date(startDate);
  const holidayCache = new Map<string, boolean>();
  
  const isHoliday = async (date: Date): Promise<boolean> => {
    const dateStr = date.toISOString().split('T')[0];
    if (holidayCache.has(dateStr)) {
      return holidayCache.get(dateStr)!;
    }

    try {
      // 调用节假日API
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/proxy/holiday/info/${dateStr}`
      );
      if (!response.ok) throw new Error('节假日查询失败');
      const data = await response.json();
      const isHoliday = data.holiday || data.workday === false;
      holidayCache.set(dateStr, isHoliday);
      return isHoliday;
    } catch (error) {
      console.error('Error checking holiday:', error);
      return false;
    }
  };
  
  while (workDays.length < 15) {
    // 跳过周末
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // 检查是否是节假日
      const holiday = await isHoliday(currentDate);
      if (!holiday) {
        workDays.push(new Date(currentDate));
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workDays;
};

export const TicketMonitor: React.FC<TicketMonitorProps> = ({
  preferences,
  onPurchase
}) => {
  const [ticketData, setTicketData] = useState<{[key: string]: TicketInfo[]}>({});
  const [workDays, setWorkDays] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const railway = Railway12306.getInstance();

  useEffect(() => {
    const initWorkDays = async () => {
      const days = await getNext15WorkDays();
      setWorkDays(days);
      setIsLoading(false);
    };
    initWorkDays();
  }, []);

  useEffect(() => {
    if (!preferences || workDays.length === 0) return;

    const fetchTicketInfo = async () => {
      const newTicketData: {[key: string]: TicketInfo[]} = {};
      
      for (const date of workDays) {
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
  }, [preferences, workDays]);

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
          {preferences.fromStation} → {preferences.toStation} 近15个工作日余票情况
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日期</TableHead>
              <TableHead>星期</TableHead>
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
            {workDays.map(date => {
              const dateStr = date.toISOString().split('T')[0];
              const tickets = ticketData[dateStr] || [];
              const morningTicket = tickets.find(t => t.trainNumber === preferences.morningTrainNumber);
              const eveningTicket = tickets.find(t => t.trainNumber === preferences.eveningTrainNumber);

              return (
                <TableRow key={dateStr}>
                  <TableCell>{dateStr}</TableCell>
                  <TableCell>周{WEEKDAYS[date.getDay()]}</TableCell>
                  <TableCell>{preferences.morningTrainNumber}</TableCell>
                  <TableCell>{morningTicket?.remainingTickets || '查询中'}</TableCell>
                  <TableCell>¥{morningTicket?.price || '--'}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      disabled={!morningTicket || morningTicket.remainingTickets === 0}
                      onClick={() => onPurchase(dateStr, preferences.morningTrainNumber)}
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