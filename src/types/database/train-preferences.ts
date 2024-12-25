export interface TrainPreference {
  id: string;
  user_id: string;
  departure_station: string;
  arrival_station: string;
  train_number: string;
  departure_time: string;
  preferred_seat_type: string;
  direction: string;
  morning_train_number: string | null;
  evening_train_number: string | null;
  created_at: string;
  updated_at: string;
}