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
import type { TicketTableProps } from './types';

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
          <TableHead className="w-[120px]">日期</TableHead>
          <TableHead>早班车票</TableHead>
          <TableHead>晚班车票</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workDays.map((date) => (
          <TicketRow
            key={date.toISOString()}
            date={date}
            morningTicket={morningTickets[formatDate(date)]}
            eveningTicket={eveningTickets[formatDate(date)]}
            onPurchase={onPurchase}
          />
        ))}
      </TableBody>
    </Table>
  );
}; 