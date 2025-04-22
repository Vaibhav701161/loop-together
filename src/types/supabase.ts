
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
      profiles: {
        Row: {
          id: string
          created_at: string
          name: string
          avatar_url: string | null
          user_type: 'user_a' | 'user_b' | null
        }
        Insert: {
          id: string
          created_at?: string
          name: string
          avatar_url?: string | null
          user_type?: 'user_a' | 'user_b' | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          avatar_url?: string | null
          user_type?: 'user_a' | 'user_b' | null
        }
      }
      pacts: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          frequency: 'daily' | 'weekly' | 'one-time'
          assigned_to: 'user_a' | 'user_b' | 'both'
          proof_type: 'text' | 'checkbox' | 'image'
          deadline: string
          max_fail_count: number
          punishment: string
          reward: string
          start_date: string
          color: string | null
          is_verified: boolean
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          frequency: 'daily' | 'weekly' | 'one-time'
          assigned_to: 'user_a' | 'user_b' | 'both'
          proof_type: 'text' | 'checkbox' | 'image'
          deadline: string
          max_fail_count: number
          punishment: string
          reward: string
          start_date: string
          color?: string | null
          is_verified?: boolean
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          frequency?: 'daily' | 'weekly' | 'one-time'
          assigned_to?: 'user_a' | 'user_b' | 'both'
          proof_type?: 'text' | 'checkbox' | 'image'
          deadline?: string
          max_fail_count?: number
          punishment?: string
          reward?: string
          start_date?: string
          color?: string | null
          is_verified?: boolean
          created_by?: string
        }
      }
      pact_logs: {
        Row: {
          id: string
          created_at: string
          pact_id: string
          user_id: string
          date: string
          status: 'completed' | 'failed' | 'pending'
          completed_at: string
          note: string | null
          proof_type: 'text' | 'checkbox' | 'image' | null
          proof_url: string | null
          verified_by: string | null
          verified_at: string | null
          comment: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          pact_id: string
          user_id: string
          date: string
          status: 'completed' | 'failed' | 'pending'
          completed_at: string
          note?: string | null
          proof_type?: 'text' | 'checkbox' | 'image' | null
          proof_url?: string | null
          verified_by?: string | null
          verified_at?: string | null
          comment?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          pact_id?: string
          user_id?: string
          date?: string
          status?: 'completed' | 'failed' | 'pending'
          completed_at?: string
          note?: string | null
          proof_type?: 'text' | 'checkbox' | 'image' | null
          proof_url?: string | null
          verified_by?: string | null
          verified_at?: string | null
          comment?: string | null
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
  }
}
