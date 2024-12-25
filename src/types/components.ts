export interface CommutePreference {
  fromStation: string;
  toStation: string;
  morningTrainNumber: string;
  eveningTrainNumber: string;
  seatType: string;
}

export interface TicketInfo {
  date: string;
  trainNumber: string;
  remainingTickets: number;
  price: number;
}

export interface CommutePreferencesProps {
  onPreferencesChange: (preferences: CommutePreference) => void;
}

export interface UserProfileProps {
  userId?: string;
}

export interface TicketMonitorProps {
  preferences?: CommutePreference;
  onPurchase: (date: string, trainNumber: string) => Promise<void>;
} 