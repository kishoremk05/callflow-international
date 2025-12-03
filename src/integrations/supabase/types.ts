export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      call_logs: {
        Row: {
          billed_amount: number | null
          caller_id_number: string
          caller_id_type: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          enterprise_id: string | null
          from_number: string
          id: string
          profit_margin: number | null
          started_at: string
          status: Database["public"]["Enums"]["call_status"]
          to_country_code: string
          to_number: string
          twilio_call_sid: string | null
          twilio_cost: number | null
          user_id: string
        }
        Insert: {
          billed_amount?: number | null
          caller_id_number: string
          caller_id_type: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          enterprise_id?: string | null
          from_number: string
          id?: string
          profit_margin?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["call_status"]
          to_country_code: string
          to_number: string
          twilio_call_sid?: string | null
          twilio_cost?: number | null
          user_id: string
        }
        Update: {
          billed_amount?: number | null
          caller_id_number?: string
          caller_id_type?: string
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          enterprise_id?: string | null
          from_number?: string
          id?: string
          profit_margin?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["call_status"]
          to_country_code?: string
          to_number?: string
          twilio_call_sid?: string | null
          twilio_cost?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprise_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      enterprise_accounts: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          max_members: number | null
          name: string
          shared_balance: number
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          max_members?: number | null
          name: string
          shared_balance?: number
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          max_members?: number | null
          name?: string
          shared_balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      enterprise_members: {
        Row: {
          can_make_calls: boolean | null
          can_purchase_numbers: boolean | null
          credit_limit: number | null
          enterprise_id: string
          id: string
          joined_at: string
          used_credits: number | null
          user_id: string
        }
        Insert: {
          can_make_calls?: boolean | null
          can_purchase_numbers?: boolean | null
          credit_limit?: number | null
          enterprise_id: string
          id?: string
          joined_at?: string
          used_credits?: number | null
          user_id: string
        }
        Update: {
          can_make_calls?: boolean | null
          can_purchase_numbers?: boolean | null
          credit_limit?: number | null
          enterprise_id?: string
          id?: string
          joined_at?: string
          used_credits?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_members_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprise_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          credits_added: number | null
          currency: string
          enterprise_id: string | null
          id: string
          metadata: Json | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credits_added?: number | null
          currency?: string
          enterprise_id?: string | null
          id?: string
          metadata?: Json | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credits_added?: number | null
          currency?: string
          enterprise_id?: string | null
          id?: string
          metadata?: Json | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprise_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country_code: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country_code?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country_code?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      public_numbers: {
        Row: {
          country_code: string
          created_at: string
          id: string
          is_active: boolean | null
          phone_number: string
          twilio_sid: string
          usage_count: number | null
        }
        Insert: {
          country_code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          phone_number: string
          twilio_sid: string
          usage_count?: number | null
        }
        Update: {
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          phone_number?: string
          twilio_sid?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      purchased_numbers: {
        Row: {
          country_code: string
          enterprise_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          monthly_cost: number
          phone_number: string
          purchased_at: string
          twilio_sid: string
          user_id: string | null
        }
        Insert: {
          country_code: string
          enterprise_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_cost: number
          phone_number: string
          purchased_at?: string
          twilio_sid: string
          user_id?: string | null
        }
        Update: {
          country_code?: string
          enterprise_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_cost?: number
          phone_number?: string
          purchased_at?: string
          twilio_sid?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchased_numbers_enterprise_id_fkey"
            columns: ["enterprise_id"]
            isOneToOne: false
            referencedRelation: "enterprise_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_settings: {
        Row: {
          cost_per_minute: number
          country_code: string
          country_name: string
          created_at: string
          id: string
          is_active: boolean | null
          sell_rate_per_minute: number
          updated_at: string
        }
        Insert: {
          cost_per_minute: number
          country_code: string
          country_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          sell_rate_per_minute: number
          updated_at?: string
        }
        Update: {
          cost_per_minute?: number
          country_code?: string
          country_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          sell_rate_per_minute?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      call_status:
        | "initiated"
        | "ringing"
        | "in_progress"
        | "completed"
        | "failed"
        | "busy"
        | "no_answer"
      payment_provider: "stripe" | "razorpay"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      user_role: "user" | "enterprise_admin" | "enterprise_member" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      call_status: [
        "initiated",
        "ringing",
        "in_progress",
        "completed",
        "failed",
        "busy",
        "no_answer",
      ],
      payment_provider: ["stripe", "razorpay"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      user_role: ["user", "enterprise_admin", "enterprise_member", "admin"],
    },
  },
} as const
