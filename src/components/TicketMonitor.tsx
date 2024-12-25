import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { TicketMonitorProps, TicketInfo } from '@/types/components';
import { RPATask } from '@/types/database';

// 获取未来15个工作日
const getNext15WorkDays = () => {
  const workDays: Date[] = [];
  let currentDate = new Date();
  
  while (workDays.length < 15) {
    // 跳过周末（0是周日，6是周六）
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      workDays.push(new Date(currentDate));
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
  const workDays = getNext15WorkDays();

  useEffect(() => {
    const fetchTicketInfo = async () => {
      if (!preferences) return;

      const newTicketData: {[key: string]: TicketInfo[]} = {};
      
      for (const date of workDays) {
        const dateStr = date.toISOString().split('T')[0];
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/query-tickets`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              date: dateStr,
              fromStation: preferences.fromStation,
              toStation: preferences.toStation,
              trainNumbers: [preferences.morningTrainNumber, preferences.eveningTrainNumber]
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          newTicketData[dateStr] = data;
        }
      }

      setTicketData(newTicketData);
    };

    fetchTicketInfo();
    // 每分钟刷新一次
    const interval = setInterval(fetchTicketInfo, 60000);
    return () => clearInterval(interval);
  }, [preferences]);

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
