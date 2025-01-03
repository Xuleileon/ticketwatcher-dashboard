export interface Database {
  public: {
    Tables: {
      watch_tasks: {
        Row: {
          id: string;
          user_id: string;
          from_station: string;
          to_station: string;
          travel_date: string;
          preferred_trains: string[];
          seat_types: string[];
          passenger_ids: string[];
          status: string;
          rpa_webhook_url: string | null;
          rpa_callback_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          from_station: string;
          to_station: string;
          travel_date: string;
          preferred_trains?: string[];
          seat_types?: string[];
          passenger_ids?: string[];
          status?: string;
          rpa_webhook_url?: string | null;
          rpa_callback_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          from_station?: string;
          to_station?: string;
          travel_date?: string;
          preferred_trains?: string[];
          seat_types?: string[];
          passenger_ids?: string[];
          status?: string;
          rpa_webhook_url?: string | null;
          rpa_callback_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rpa_tasks: {
        Row: {
          id: string;
          watch_task_id: string;
          status: string;
          rpa_machine_id: string | null;
          enterprise_id: string | null;
          flow_id: string | null;
          flow_process_no: string | null;
          start_time: string | null;
          end_time: string | null;
          result: any | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          watch_task_id: string;
          status?: string;
          rpa_machine_id?: string | null;
          enterprise_id?: string | null;
          flow_id?: string | null;
          flow_process_no?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          result?: any | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          watch_task_id?: string;
          status?: string;
          rpa_machine_id?: string | null;
          enterprise_id?: string | null;
          flow_id?: string | null;
          flow_process_no?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          result?: any | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 