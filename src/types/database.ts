export interface Profile {
  id: string;
  id_card_number: string | null;
  train_account: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainPreference {
  id: string;
  user_id: string;
  departure_station: string;
  arrival_station: string;
  train_number: string;
  departure_time: string;
  preferred_seat_type: string;
  direction: string;
  created_at: string;
  updated_at: string;
}

export interface TicketStatus {
  id: string;
  user_id: string;
  travel_date: string;
  direction: string;
  train_number: string;
  first_class_available: boolean;
  second_class_available: boolean;
  ticket_purchased: boolean;
  created_at: string;
  updated_at: string;
}