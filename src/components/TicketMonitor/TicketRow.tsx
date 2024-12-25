import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, getWeekDay } from './DateUtils';
import { isHoliday } from '@/lib/holidays';
import type { TicketRowProps } from './types';

export const TicketRow: React.FC<TicketRowProps> = ({
  date,
  morningTicket,
  eveningTicket,
  onPurchase
}) => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { toast } = useToast();
  const formattedDate = formatDate(date);
  const weekDay = getWeekDay(date);
  const isHolidayDate = isHoliday(date);

  const handlePurchase = async (trainNumber: string) => {
    if (isPurchasing) return;
    
    setIsPurchasing(true);
    try {
      await onPurchase(formattedDate, trainNumber);
      toast({
        title: "购票请求已发送",
        description: `正在为您预订 ${trainNumber} 次列车票`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "购票失败",
        description: error instanceof Error ? error.message : "请稍后重试",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const renderTicketCell = (ticket?: TicketInfo) => {
    if (!ticket) {
      return <TableCell className="text-gray-500">查询中...</TableCell>;
    }

    const hasTickets = ticket.remainingTickets > 0;
    const statusText = ticket.purchased 
      ? '已购票' 
      : hasTickets 
        ? `余票: ${ticket.remainingTickets}` 
        : '无票';
    const statusClass = ticket.purchased 
      ? 'text-green-600' 
      : hasTickets 
        ? 'text-blue-600' 
        : 'text-red-600';

    return (
      <TableCell>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <span>{ticket.trainNumber}</span>
            <span className={statusClass}>{statusText}</span>
          </div>
          <div className="text-sm text-gray-500">
            {ticket.departureTime} - {ticket.arrivalTime}
          </div>
          {!ticket.purchased && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPurchasing || !hasTickets}
              onClick={() => handlePurchase(ticket.trainNumber)}
            >
              {isPurchasing ? '购票中...' : hasTickets ? '购票' : '候补'}
            </Button>
          )}
        </div>
      </TableCell>
    );
  };

  return (
    <TableRow className={isHolidayDate ? 'bg-green-50' : ''}>
      <TableCell>
        <div className="whitespace-nowrap">
          {formattedDate}
          <span className="ml-2 text-gray-500">{weekDay}</span>
          {isHolidayDate && (
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
              节假日
            </Badge>
          )}
        </div>
      </TableCell>
      {renderTicketCell(morningTicket)}
      {renderTicketCell(eveningTicket)}
    </TableRow>
  );
};