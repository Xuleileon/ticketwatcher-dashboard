export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rpa_tasks: {
        Row: {
          created_at: string | null
          end_time: string | null
          enterprise_id: string | null
          error_message: string | null
          flow_id: string | null
          flow_process_no: string | null
          id: string
          result: Json | null
          rpa_machine_id: string | null
          start_time: string | null
          status: string
          updated_at: string | null
          watch_task_id: string
        }
        Insert: {
          created_at?: string | null
          end_time?: string | null
          enterprise_id?: string | null
          error_message?: string | null
          flow_id?: string | null
          flow_process_no?: string | null
          id?: string
          result?: Json | null
          rpa_machine_id?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string | null
          watch_task_id: string
        }
        Update: {
          created_at?: string | null
          end_time?: string | null
          enterprise_id?: string | null
          error_message?: string | null
          flow_id?: string | null
          flow_process_no?: string | null
          id?: string
          result?: Json | null
          rpa_machine_id?: string | null
          start_time?: string | null
          status?: string
          updated_at?: string | null
          watch_task_id?: string
        }
        Relationships: []
      }
      stations: {
        Row: {
          acronym: string | null
          code: string
          created_at: string
          id: string
          name: string
          pinyin: string | null
          updated_at: string
        }
        Insert: {
          acronym?: string | null
          code: string
          created_at?: string
          id?: string
          name: string
          pinyin?: string | null
          updated_at?: string
        }
        Update: {
          acronym?: string | null
          code?: string
          created_at?: string
          id?: string
          name?: string
          pinyin?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ticket_purchases: {
        Row: {
          created_at: string | null
          id: string
          purchase_status: string
          rpa_result: Json | null
          train_number: string
          travel_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          purchase_status?: string
          rpa_result?: Json | null
          train_number: string
          travel_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          purchase_status?: string
          rpa_result?: Json | null
          train_number?: string
          travel_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_status: {
        Row: {
          created_at: string
          direction: string
          first_class_available: boolean | null
          id: string
          second_class_available: boolean | null
          ticket_purchased: boolean | null
          train_number: string
          travel_date: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          direction: string
          first_class_available?: boolean | null
          id?: string
          second_class_available?: boolean | null
          ticket_purchased?: boolean | null
          train_number: string
          travel_date: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          direction?: string
          first_class_available?: boolean | null
          id?: string
          second_class_available?: boolean | null
          ticket_purchased?: boolean | null
          train_number?: string
          travel_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      train_preferences: {
        Row: {
          arrival_station: string
          created_at: string
          departure_station: string
          departure_time: string
          direction: string
          evening_train_number: string | null
          id: string
          morning_train_number: string | null
          preferred_seat_type: string
          train_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          arrival_station: string
          created_at?: string
          departure_station: string
          departure_time: string
          direction: string
          evening_train_number?: string | null
          id?: string
          morning_train_number?: string | null
          preferred_seat_type?: string
          train_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          arrival_station?: string
          created_at?: string
          departure_station?: string
          departure_time?: string
          direction?: string
          evening_train_number?: string | null
          id?: string
          morning_train_number?: string | null
          preferred_seat_type?: string
          train_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "train_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_tasks: {
        Row: {
          created_at: string | null
          from_station: string
          id: string
          passenger_ids: string[] | null
          preferred_trains: string[] | null
          rpa_callback_url: string | null
          rpa_webhook_url: string | null
          seat_types: string[] | null
          status: string
          to_station: string
          travel_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          from_station: string
          id?: string
          passenger_ids?: string[] | null
          preferred_trains?: string[] | null
          rpa_callback_url?: string | null
          rpa_webhook_url?: string | null
          seat_types?: string[] | null
          status?: string
          to_station: string
          travel_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          from_station?: string
          id?: string
          passenger_ids?: string[] | null
          preferred_trains?: string[] | null
          rpa_callback_url?: string | null
          rpa_webhook_url?: string | null
          seat_types?: string[] | null
          status?: string
          to_station?: string
          travel_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
