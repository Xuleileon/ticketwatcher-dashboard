import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate, getWeekDay } from './DateUtils';
import { isHoliday } from '@/lib/holidays';
import type { TicketInfo } from '@/types/components';
import { useToast } from '@/components/ui/use-toast';

interface TicketRowProps {
  date: Date;
  morningTicket?: TicketInfo;
  eveningTicket?: TicketInfo;
  onPurchase: (date: string, trainNumber: string) => Promise<void>;
}

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
    setIsPurchasing(true);
    
    const purchasePromise = onPurchase(formattedDate, trainNumber);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Purchase timeout')), 50000)
    );

    try {
      await Promise.race([purchasePromise, timeoutPromise]);
      toast({
        title: "购票成功",
        description: `已成功预订 ${trainNumber} 次列车票`,
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
    const statusText = hasTickets ? `余票: ${ticket.remainingTickets}` : '无票';
    const statusClass = hasTickets ? 'text-green-600' : 'text-red-600';

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
          <Button
            variant="outline"
            size="sm"
            disabled={isPurchasing}
            onClick={() => handlePurchase(ticket.trainNumber)}
          >
            {isPurchasing ? '购票中...' : '购票'}
          </Button>
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