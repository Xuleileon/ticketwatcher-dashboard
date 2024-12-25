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
      refresh_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          status: string
          token_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          status: string
          token_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string
          token_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_logs_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string
          id: string
          purchase_status: string
          train_number: string
          travel_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          purchase_status?: string
          train_number: string
          travel_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          purchase_status?: string
          train_number?: string
          travel_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tokens: {
        Row: {
          access_token: string | null
          advertiser_id: string | null
          app_id: string
          app_secret: string
          auth_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          raw_auth_response: Json | null
          refresh_token: string | null
          updated_at: string
          user_id: string
          view_tokens: boolean | null
        }
        Insert: {
          access_token?: string | null
          advertiser_id?: string | null
          app_id: string
          app_secret: string
          auth_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          raw_auth_response?: Json | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
          view_tokens?: boolean | null
        }
        Update: {
          access_token?: string | null
          advertiser_id?: string | null
          app_id?: string
          app_secret?: string
          auth_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          raw_auth_response?: Json | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
          view_tokens?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          evening_train_number: string
          from_station: string
          id: string
          morning_train_number: string
          seat_type: string
          to_station: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evening_train_number: string
          from_station: string
          id?: string
          morning_train_number: string
          seat_type: string
          to_station: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          evening_train_number?: string
          from_station?: string
          id?: string
          morning_train_number?: string
          seat_type?: string
          to_station?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
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
