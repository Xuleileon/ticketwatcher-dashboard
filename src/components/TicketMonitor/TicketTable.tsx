import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { TicketRow } from './TicketRow';
import { getNext15WorkDays } from './DateUtils';
import type { TicketInfo } from '@/types/components';

interface TicketTableProps {
  morningTickets: Record<string, TicketInfo>;
  eveningTickets: Record<string, TicketInfo>;
  onPurchase: (date: string, trainNumber: string) => Promise<void>;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  morningTickets,
  eveningTickets,
  onPurchase
}) => {
  const workDays = getNext15WorkDays();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">日期</TableHead>
          <TableHead>早班车票</TableHead>
          <TableHead>晚班车票</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workDays.map((date) => {
          const dateStr = date.toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit'
          });
          
          return (
            <TicketRow
              key={dateStr}
              date={date}
              morningTicket={morningTickets[dateStr]}
              eveningTicket={eveningTickets[dateStr]}
              onPurchase={onPurchase}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}; 