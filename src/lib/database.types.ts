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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_history: {
        Row: {
          created_at: string | null
          description: string
          id: string
          opportunity_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          opportunity_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          opportunity_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_history_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      client_segments: {
        Row: {
          client_id: string
          segment_id: string
        }
        Insert: {
          client_id: string
          segment_id: string
        }
        Update: {
          client_id?: string
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_segments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_segments_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          contracts: number | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          onde_esta: string | null
          phone: string | null
          status: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          address?: string | null
          contracts?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          onde_esta?: string | null
          phone?: string | null
          status?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          address?: string | null
          contracts?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          onde_esta?: string | null
          phone?: string | null
          status?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: []
      }
      comarcas: {
        Row: {
          address: string | null
          created_at: string
          document_url: string | null
          id: string
          name: string
          shipping_option: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          name: string
          shipping_option?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          name?: string
          shipping_option?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lead_origins: {
        Row: {
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          client_id: string | null
          corporate_email: string | null
          created_at: string | null
          expected_date: string | null
          id: string
          notes: string | null
          owner_name: string | null
          primary_contact_name: string | null
          stage: string | null
          updated_at: string | null
          user_id: string | null
          value: number | null
        }
        Insert: {
          client_id?: string | null
          corporate_email?: string | null
          created_at?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          owner_name?: string | null
          primary_contact_name?: string | null
          stage?: string | null
          updated_at?: string | null
          user_id?: string | null
          value?: number | null
        }
        Update: {
          client_id?: string | null
          corporate_email?: string | null
          created_at?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          owner_name?: string | null
          primary_contact_name?: string | null
          stage?: string | null
          updated_at?: string | null
          user_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_comarcas: {
        Row: {
          comarca_id: string
          created_at: string
          opportunity_id: string
        }
        Insert: {
          comarca_id: string
          created_at?: string
          opportunity_id: string
        }
        Update: {
          comarca_id?: string
          created_at?: string
          opportunity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_comarcas_comarca_id_fkey"
            columns: ["comarca_id"]
            isOneToOne: false
            referencedRelation: "comarcas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_comarcas_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_date: string | null
          file_url: string | null
          id: string
          name: string
          opportunity_id: string | null
          responsible_name: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_date?: string | null
          file_url?: string | null
          id?: string
          name: string
          opportunity_id?: string | null
          responsible_name?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_date?: string | null
          file_url?: string | null
          id?: string
          name?: string
          opportunity_id?: string | null
          responsible_name?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_documents_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_origins: {
        Row: {
          opportunity_id: string
          origin_id: string
        }
        Insert: {
          opportunity_id: string
          origin_id: string
        }
        Update: {
          opportunity_id?: string
          origin_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_origins_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_origins_origin_id_fkey"
            columns: ["origin_id"]
            isOneToOne: false
            referencedRelation: "lead_origins"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_tags: {
        Row: {
          opportunity_id: string
          tag_id: string
        }
        Insert: {
          opportunity_id: string
          tag_id: string
        }
        Update: {
          opportunity_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_tags_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      segments: {
        Row: {
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_emails: {
        Row: {
          attachments: Json | null
          cc: string | null
          cco: string | null
          content: string | null
          created_at: string | null
          google_message_id: string | null
          id: string
          received_at: string | null
          recipient: string | null
          sender: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          cc?: string | null
          cco?: string | null
          content?: string | null
          created_at?: string | null
          google_message_id?: string | null
          id?: string
          received_at?: string | null
          recipient?: string | null
          sender?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          cc?: string | null
          cco?: string | null
          content?: string | null
          created_at?: string | null
          google_message_id?: string | null
          id?: string
          received_at?: string | null
          recipient?: string | null
          sender?: string | null
          subject?: string | null
          user_id?: string
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
    Enums: {},
  },
} as const
