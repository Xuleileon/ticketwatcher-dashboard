import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatDate, getWeekDay } from './DateUtils';
import type { TicketInfo } from '@/types/components';

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
  const formattedDate = formatDate(date);
  const weekDay = getWeekDay(date);

  const renderTicketCell = (ticket?: TicketInfo) => {
    if (!ticket) {
      return <TableCell className="text-gray-500">暂无数据</TableCell>;
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
            disabled={!hasTickets}
            onClick={() => onPurchase(formattedDate, ticket.trainNumber)}
          >
            {hasTickets ? '购票' : '候补'}
          </Button>
        </div>
      </TableCell>
    );
  };

  return (
    <TableRow>
      <TableCell>
        <div className="whitespace-nowrap">
          {formattedDate}
          <span className="ml-2 text-gray-500">{weekDay}</span>
        </div>
      </TableCell>
      {renderTicketCell(morningTicket)}
      {renderTicketCell(eveningTicket)}
    </TableRow>
  );
}; 