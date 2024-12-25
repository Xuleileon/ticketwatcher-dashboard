export interface UserPreference {
  id: string;
  user_id: string;
  from_station: string;
  to_station: string;
  morning_train_number: string;
  evening_train_number: string;
  seat_type: string;
  created_at: string;
  updated_at: string;
}