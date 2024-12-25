export interface WatchTask {
  id: string;
  user_id: string;
  from_station: string;
  to_station: string;
  travel_date: string;
  preferred_trains: string[];
  seat_types: string[];
  passenger_ids: string[];
  status: 'active' | 'completed' | 'failed' | 'stopped';
  rpa_webhook_url: string | null;
  rpa_callback_url: string | null;
  created_at: string;
  updated_at: string;
}