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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          school_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          school_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          school_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      blackout_dates: {
        Row: {
          created_at: string
          date: string
          id: string
          reason: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          reason?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          reason?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          actioned_at: string | null
          activity_booked: string
          amount: number | null
          booking_code: string | null
          booking_date: string
          booking_status: Database["public"]["Enums"]["booking_status"] | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          deposit_claimed_at: string | null
          id: string
          meta: Json | null
          notes: string | null
          participants: number
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          school_id: string
          special_requests: string | null
          sport_id: string | null
          status: Database["public"]["Enums"]["deposit_booking_status"] | null
          time_slot: string
          time_slot_id: string | null
          total_price: number | null
          updated_at: string
          user_id: string | null
          verification_expires_at: string | null
          viewed_at: string | null
        }
        Insert: {
          actioned_at?: string | null
          activity_booked: string
          amount?: number | null
          booking_code?: string | null
          booking_date: string
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          deposit_claimed_at?: string | null
          id?: string
          meta?: Json | null
          notes?: string | null
          participants?: number
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          school_id: string
          special_requests?: string | null
          sport_id?: string | null
          status?: Database["public"]["Enums"]["deposit_booking_status"] | null
          time_slot: string
          time_slot_id?: string | null
          total_price?: number | null
          updated_at?: string
          user_id?: string | null
          verification_expires_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          actioned_at?: string | null
          activity_booked?: string
          amount?: number | null
          booking_code?: string | null
          booking_date?: string
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          deposit_claimed_at?: string | null
          id?: string
          meta?: Json | null
          notes?: string | null
          participants?: number
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          school_id?: string
          special_requests?: string | null
          sport_id?: string | null
          status?: Database["public"]["Enums"]["deposit_booking_status"] | null
          time_slot?: string
          time_slot_id?: string | null
          total_price?: number | null
          updated_at?: string
          user_id?: string | null
          verification_expires_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      holds: {
        Row: {
          booking_id: string
          created_at: string
          expires_at: string
          id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          expires_at: string
          id?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          expires_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "holds_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_ledger: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          entry_date: string
          entry_type: string
          id: string
          reference_id: string | null
          school_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          entry_date?: string
          entry_type: string
          id?: string
          reference_id?: string | null
          school_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          entry_date?: string
          entry_type?: string
          id?: string
          reference_id?: string | null
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_ledger_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          intent_id: string | null
          is_verified: boolean
          payer_name: string | null
          provider: string
          screenshot_url: string | null
          status: Database["public"]["Enums"]["deposit_payment_status"]
          utr: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          intent_id?: string | null
          is_verified?: boolean
          payer_name?: string | null
          provider?: string
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["deposit_payment_status"]
          utr?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          intent_id?: string | null
          is_verified?: boolean
          payer_name?: string | null
          provider?: string
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["deposit_payment_status"]
          utr?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          id: string
          updated_at: string
          upi_qr_url: string | null
          upi_vpa: string | null
        }
        Insert: {
          id?: string
          updated_at?: string
          upi_qr_url?: string | null
          upi_vpa?: string | null
        }
        Update: {
          id?: string
          updated_at?: string
          upi_qr_url?: string | null
          upi_vpa?: string | null
        }
        Relationships: []
      }
      school_sports: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          eligibility: string | null
          id: string
          languages: string[] | null
          price_per_person: number
          school_id: string
          sport_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          eligibility?: string | null
          id?: string
          languages?: string[] | null
          price_per_person: number
          school_id: string
          sport_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          eligibility?: string | null
          id?: string
          languages?: string[] | null
          price_per_person?: number
          school_id?: string
          sport_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_sports_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_sports_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          city: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          display_name: string | null
          email: string | null
          gstin: string | null
          id: string
          instagram: string | null
          invoicing_contact_email: string | null
          invoicing_contact_name: string | null
          invoicing_contact_phone: string | null
          is_active: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          max_capacity_per_slot: number | null
          name: string
          pan: string | null
          phone: string | null
          photo_urls: string[] | null
          pincode: string | null
          primary_beach: string | null
          timezone: string | null
          updated_at: string
          upi_vpa: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          instagram?: string | null
          invoicing_contact_email?: string | null
          invoicing_contact_name?: string | null
          invoicing_contact_phone?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          max_capacity_per_slot?: number | null
          name: string
          pan?: string | null
          phone?: string | null
          photo_urls?: string[] | null
          pincode?: string | null
          primary_beach?: string | null
          timezone?: string | null
          updated_at?: string
          upi_vpa?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          instagram?: string | null
          invoicing_contact_email?: string | null
          invoicing_contact_name?: string | null
          invoicing_contact_phone?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          max_capacity_per_slot?: number | null
          name?: string
          pan?: string | null
          phone?: string | null
          photo_urls?: string[] | null
          pincode?: string | null
          primary_beach?: string | null
          timezone?: string | null
          updated_at?: string
          upi_vpa?: string | null
          website?: string | null
        }
        Relationships: []
      }
      sports: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          activity_type: string | null
          created_at: string
          customer_location: string | null
          customer_name: string
          id: string
          rating: number | null
          testimonial_text: string
        }
        Insert: {
          activity_type?: string | null
          created_at?: string
          customer_location?: string | null
          customer_name: string
          id?: string
          rating?: number | null
          testimonial_text: string
        }
        Update: {
          activity_type?: string | null
          created_at?: string
          customer_location?: string | null
          customer_name?: string
          id?: string
          rating?: number | null
          testimonial_text?: string
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          capacity: number
          created_at: string
          date: string
          end_time: string
          id: string
          school_id: string
          seats_left: number
          sport_id: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          date: string
          end_time: string
          id?: string
          school_id: string
          seats_left?: number
          sport_id: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          school_id?: string
          seats_left?: number
          sport_id?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_slots_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          school_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      water_sports_providers: {
        Row: {
          availability_status: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          latitude: number
          location_name: string
          longitude: number
          name: string
          price_per_hour: number | null
          rating: number | null
          sport_type: string
          updated_at: string
        }
        Insert: {
          availability_status?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude: number
          location_name: string
          longitude: number
          name: string
          price_per_hour?: number | null
          rating?: number | null
          sport_type: string
          updated_at?: string
        }
        Update: {
          availability_status?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number
          location_name?: string
          longitude?: number
          name?: string
          price_per_hour?: number | null
          rating?: number | null
          sport_type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_test_admin_user: {
        Args: {
          first_name?: string
          last_name?: string
          user_email: string
          user_password: string
          user_role?: string
          user_school_id?: string
        }
        Returns: string
      }
      generate_booking_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_booking_metrics: {
        Args: {
          p_end_date?: string
          p_school_id?: string
          p_start_date?: string
        }
        Returns: {
          bookings_30d: number
          bookings_7d: number
          bookings_today: number
          cancellations_today: number
          refunds_today: number
          revenue_30d: number
          revenue_7d: number
          revenue_today: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_live_bookings: {
        Args: { p_date_filter?: string; p_school_id?: string }
        Returns: {
          activity_booked: string
          amount: number
          booking_code: string
          booking_date: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          participants: number
          payment_status: string
          school_name: string
          sport_name: string
          status: string
          time_slot: string
          updated_at: string
        }[]
      }
      log_audit_entry: {
        Args: {
          p_action: string
          p_new_values?: Json
          p_old_values?: Json
          p_resource_id?: string
          p_resource_type: string
        }
        Returns: undefined
      }
      rpc_claim_payment: {
        Args: {
          p_booking_id: string
          p_payer_name: string
          p_screenshot_url: string
          p_utr: string
        }
        Returns: boolean
      }
      rpc_confirm_deposit: {
        Args: { p_booking_id: string }
        Returns: boolean
      }
      rpc_create_hold: {
        Args: {
          p_amount: number
          p_school_id: string
          p_sport_id: string
          p_time_slot_id: string
          p_user_id: string
        }
        Returns: {
          booking_code: string
          booking_id: string
          expires_at: string
        }[]
      }
      rpc_expire_holds: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      rpc_expire_verifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      rpc_extend_hold: {
        Args: { p_booking_id: string; p_minutes: number }
        Returns: string
      }
      rpc_generate_time_slots: {
        Args: {
          p_capacity: number
          p_end_date: string
          p_end_time: string
          p_school_id: string
          p_sport_id: string
          p_start_date: string
          p_start_time: string
          p_weekdays: number[]
        }
        Returns: number
      }
      rpc_get_school_sports: {
        Args: { p_school_id: string }
        Returns: {
          currency: string
          price_per_person: number
          sport_id: string
          sport_name: string
        }[]
      }
      rpc_public_available_schools: {
        Args: Record<PropertyKey, never>
        Returns: {
          city: string
          cover_url: string
          display_name: string
          id: string
          name: string
          sport_names: string[]
        }[]
      }
      rpc_reject_deposit: {
        Args: { p_booking_id: string; p_note: string }
        Returns: boolean
      }
      update_user_profile_role: {
        Args: { new_role: string; new_school_id?: string; user_email: string }
        Returns: string
      }
    }
    Enums: {
      booking_status: "new" | "viewed" | "actioned"
      deposit_booking_status:
        | "held"
        | "awaiting_verification"
        | "paid_deposit"
        | "consumed"
        | "expired"
        | "cancelled_by_user"
        | "cancelled_by_school"
        | "refunded_deposit"
      deposit_payment_status:
        | "initiated"
        | "succeeded"
        | "failed"
        | "refunded"
        | "cancelled"
      payment_status: "paid" | "unpaid" | "pending"
      user_role:
        | "super_admin"
        | "school_partner"
        | "regular_user"
        | "admin"
        | "passholder"
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
      booking_status: ["new", "viewed", "actioned"],
      deposit_booking_status: [
        "held",
        "awaiting_verification",
        "paid_deposit",
        "consumed",
        "expired",
        "cancelled_by_user",
        "cancelled_by_school",
        "refunded_deposit",
      ],
      deposit_payment_status: [
        "initiated",
        "succeeded",
        "failed",
        "refunded",
        "cancelled",
      ],
      payment_status: ["paid", "unpaid", "pending"],
      user_role: [
        "super_admin",
        "school_partner",
        "regular_user",
        "admin",
        "passholder",
      ],
    },
  },
} as const
