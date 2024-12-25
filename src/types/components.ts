export interface CommutePreference {
  fromStation: string;
  toStation: string;
  morningTrainNumber: string;
  eveningTrainNumber: string;
  seatType: string;
}

export interface TicketInfo {
  trainNumber: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  remainingTickets: number;
  price: number;
  purchased?: boolean;
}

export interface CommutePreferencesProps {
  onPreferencesChange: (preferences: CommutePreference) => void;
  initialPreferences?: CommutePreference;
}

export interface UserProfileProps {
  userId?: string;
}

export interface TicketMonitorProps {
  preferences?: CommutePreference;
  onPurchase: (date: string, trainNumber: string) => Promise<void>;
}