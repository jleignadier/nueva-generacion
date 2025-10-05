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
      donations: {
        Row: {
          amount: number
          created_at: string | null
          donation_method: Database["public"]["Enums"]["donation_method"]
          donation_type: Database["public"]["Enums"]["donation_type"]
          event_id: string | null
          id: string
          note: string | null
          organization_id: string | null
          receipt_path: string
          receipt_url: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["donation_status"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          donation_method?: Database["public"]["Enums"]["donation_method"]
          donation_type?: Database["public"]["Enums"]["donation_type"]
          event_id?: string | null
          id?: string
          note?: string | null
          organization_id?: string | null
          receipt_path: string
          receipt_url: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          donation_method?: Database["public"]["Enums"]["donation_method"]
          donation_type?: Database["public"]["Enums"]["donation_type"]
          event_id?: string | null
          id?: string
          note?: string | null
          organization_id?: string | null
          receipt_path?: string
          receipt_url?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendance: {
        Row: {
          attended_at: string | null
          check_in_method: Database["public"]["Enums"]["check_in_method"] | null
          event_id: string
          hours_credited: number | null
          id: string
          points_awarded: number | null
          user_id: string
        }
        Insert: {
          attended_at?: string | null
          check_in_method?:
            | Database["public"]["Enums"]["check_in_method"]
            | null
          event_id: string
          hours_credited?: number | null
          id?: string
          points_awarded?: number | null
          user_id: string
        }
        Update: {
          attended_at?: string | null
          check_in_method?:
            | Database["public"]["Enums"]["check_in_method"]
            | null
          event_id?: string
          hours_credited?: number | null
          id?: string
          points_awarded?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_funding: number | null
          date: string
          description: string | null
          end_time: string | null
          funding_required: number | null
          id: string
          image_url: string | null
          location: string
          points_earned: number | null
          status: Database["public"]["Enums"]["event_status"] | null
          time: string
          title: string
          updated_at: string | null
          volunteer_hours: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_funding?: number | null
          date: string
          description?: string | null
          end_time?: string | null
          funding_required?: number | null
          id?: string
          image_url?: string | null
          location: string
          points_earned?: number | null
          status?: Database["public"]["Enums"]["event_status"] | null
          time: string
          title: string
          updated_at?: string | null
          volunteer_hours?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_funding?: number | null
          date?: string
          description?: string | null
          end_time?: string | null
          funding_required?: number | null
          id?: string
          image_url?: string | null
          location?: string
          points_earned?: number | null
          status?: Database["public"]["Enums"]["event_status"] | null
          time?: string
          title?: string
          updated_at?: string | null
          volunteer_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_url: string
          id: string
          is_current: boolean | null
          uploaded_at: string | null
          uploaded_by: string | null
          version: number
        }
        Insert: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_url: string
          id?: string
          is_current?: boolean | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version: number
        }
        Update: {
          document_type?: Database["public"]["Enums"]["document_type"]
          file_url?: string
          id?: string
          is_current?: boolean | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_points: {
        Row: {
          id: string
          organization_id: string
          points: number | null
          total_members: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          points?: number | null
          total_members?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          points?: number | null
          total_members?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_points_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_points_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations_public"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["app_role"]
          avatar_url: string | null
          birthdate: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          organization_id: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["app_role"]
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["app_role"]
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_legal_acceptance: {
        Row: {
          accepted_at: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id: string
          user_id: string
          version_accepted: number
        }
        Insert: {
          accepted_at?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id?: string
          user_id: string
          version_accepted: number
        }
        Update: {
          accepted_at?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          user_id?: string
          version_accepted?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_legal_acceptance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          events_attended: number | null
          id: string
          points: number | null
          total_hours: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          events_attended?: number | null
          id?: string
          points?: number | null
          total_hours?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          events_attended?: number | null
          id?: string
          points?: number | null
          total_hours?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      organizations_public: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_event_points: {
        Args: {
          p_check_in_method: Database["public"]["Enums"]["check_in_method"]
          p_event_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      can_view_organization_contact: {
        Args: { org_id: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_organization_contact: {
        Args: { org_id: string }
        Returns: {
          address: string
          contact_email: string
          created_at: string
          description: string
          id: string
          name: string
          phone: string
          updated_at: string
        }[]
      }
      get_organization_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          logo_url: string
          name: string
          organization_id: string
          points: number
          rank: number
          total_members: number
        }[]
      }
      get_public_organizations: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          description: string
          id: string
          name: string
        }[]
      }
      get_user_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          avatar_url: string
          events_attended: number
          first_name: string
          last_name: string
          organization_name: string
          points: number
          rank: number
          total_hours: number
          user_id: string
        }[]
      }
      has_accepted_legal_docs: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "volunteer" | "organization" | "admin"
      check_in_method: "qr_scan" | "manual"
      document_type:
        | "terms_of_service"
        | "privacy_policy"
        | "volunteering_rules"
      donation_method: "qrcode" | "yappy"
      donation_status: "pending" | "approved" | "rejected"
      donation_type: "individual" | "organization"
      event_status: "upcoming" | "completed" | "cancelled"
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
      app_role: ["volunteer", "organization", "admin"],
      check_in_method: ["qr_scan", "manual"],
      document_type: [
        "terms_of_service",
        "privacy_policy",
        "volunteering_rules",
      ],
      donation_method: ["qrcode", "yappy"],
      donation_status: ["pending", "approved", "rejected"],
      donation_type: ["individual", "organization"],
      event_status: ["upcoming", "completed", "cancelled"],
    },
  },
} as const
