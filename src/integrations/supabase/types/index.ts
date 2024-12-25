import type { Station } from './stations';
import type { UserPreference } from './user-preferences';
import type { TicketPurchase } from './ticket-purchases';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
      }
      stations: {
        Row: Station
        Insert: Omit<Station, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Station>
      }
      ticket_purchases: {
        Row: TicketPurchase
        Insert: Omit<TicketPurchase, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<TicketPurchase>
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
      }
      user_preferences: {
        Row: UserPreference
        Insert: Omit<UserPreference, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<UserPreference>
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