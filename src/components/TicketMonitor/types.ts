import type { CommutePreference, TicketInfo } from '@/types/components';

export interface TicketMonitorProps {
  preferences?: CommutePreference;
  onPurchase: (date: string, trainNumber: string) => Promise<void>;
}

export interface TicketTableProps {
  morningTickets: Record<string, TicketInfo>;
  eveningTickets: Record<string, TicketInfo>;
  onPurchase: (date: string, trainNumber: string) => Promise<void>;
}

export interface TicketRowProps {
  date: Date;
  morningTicket?: TicketInfo;
  eveningTicket?: TicketInfo;
  onPurchase: (date: string, trainNumber: string) => Promise<void>;
} 