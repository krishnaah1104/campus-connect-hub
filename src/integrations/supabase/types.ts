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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      anonymous_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_p1: boolean
          sender_alias: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_p1: boolean
          sender_alias: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_p1?: boolean
          sender_alias?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "anonymous_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_queue: {
        Row: {
          alias: string
          avatar: string
          created_at: string
          id: string
          topic_tag: string
          user_id: string
        }
        Insert: {
          alias?: string
          avatar?: string
          created_at?: string
          id?: string
          topic_tag?: string
          user_id: string
        }
        Update: {
          alias?: string
          avatar?: string
          created_at?: string
          id?: string
          topic_tag?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_sessions: {
        Row: {
          alias_1: string
          alias_2: string
          avatar_1: string
          avatar_2: string
          created_at: string
          dm_conversation_id: string | null
          ended_at: string | null
          id: string
          participant_1: string
          participant_2: string
          reported: boolean
          reveal_p1: boolean
          reveal_p2: boolean
          status: string
        }
        Insert: {
          alias_1: string
          alias_2: string
          avatar_1?: string
          avatar_2?: string
          created_at?: string
          dm_conversation_id?: string | null
          ended_at?: string | null
          id?: string
          participant_1: string
          participant_2: string
          reported?: boolean
          reveal_p1?: boolean
          reveal_p2?: boolean
          status?: string
        }
        Update: {
          alias_1?: string
          alias_2?: string
          avatar_1?: string
          avatar_2?: string
          created_at?: string
          dm_conversation_id?: string | null
          ended_at?: string | null
          id?: string
          participant_1?: string
          participant_2?: string
          reported?: boolean
          reveal_p1?: boolean
          reveal_p2?: boolean
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_sessions_dm_conversation_id_fkey"
            columns: ["dm_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anonymous_sessions_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anonymous_sessions_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          channel_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          reactions: Json
          sender_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          reactions?: Json
          sender_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          reactions?: Json
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      channels: {
        Row: {
          batch_filter: string | null
          category: string
          category_label: string
          club_filter: string | null
          created_at: string
          description: string | null
          hostel_filter: string | null
          icon: string | null
          id: string
          is_auto_enrolled: boolean
          name: string
          pinned_notice: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          batch_filter?: string | null
          category: string
          category_label: string
          club_filter?: string | null
          created_at?: string
          description?: string | null
          hostel_filter?: string | null
          icon?: string | null
          id: string
          is_auto_enrolled?: boolean
          name: string
          pinned_notice?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          batch_filter?: string | null
          category?: string
          category_label?: string
          club_filter?: string | null
          created_at?: string
          description?: string | null
          hostel_filter?: string | null
          icon?: string | null
          id?: string
          is_auto_enrolled?: boolean
          name?: string
          pinned_notice?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          last_message_text: string | null
          participant_1: string
          participant_2: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          last_message_text?: string | null
          participant_1: string
          participant_2: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          last_message_text?: string | null
          participant_1?: string
          participant_2?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          achievements: string[]
          avatar_url: string | null
          batch: string | null
          bio: string | null
          bus_opted: boolean
          cgpa: number | null
          cgpa_public: boolean
          clubs: string[]
          course: string | null
          created_at: string
          degree: string | null
          email: string | null
          full_name: string | null
          github_url: string | null
          home_state: string | null
          hostel: string | null
          id: string
          interests: string[]
          life_status: string | null
          linkedin_url: string | null
          onboarding_complete: boolean
          portfolio_url: string | null
          roles: string[]
          skills: string[]
          title: string | null
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          achievements?: string[]
          avatar_url?: string | null
          batch?: string | null
          bio?: string | null
          bus_opted?: boolean
          cgpa?: number | null
          cgpa_public?: boolean
          clubs?: string[]
          course?: string | null
          created_at?: string
          degree?: string | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          home_state?: string | null
          hostel?: string | null
          id: string
          interests?: string[]
          life_status?: string | null
          linkedin_url?: string | null
          onboarding_complete?: boolean
          portfolio_url?: string | null
          roles?: string[]
          skills?: string[]
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          achievements?: string[]
          avatar_url?: string | null
          batch?: string | null
          bio?: string | null
          bus_opted?: boolean
          cgpa?: number | null
          cgpa_public?: boolean
          clubs?: string[]
          course?: string | null
          created_at?: string
          degree?: string | null
          email?: string | null
          full_name?: string | null
          github_url?: string | null
          home_state?: string | null
          hostel?: string | null
          id?: string
          interests?: string[]
          life_status?: string | null
          linkedin_url?: string | null
          onboarding_complete?: boolean
          portfolio_url?: string | null
          roles?: string[]
          skills?: string[]
          title?: string | null
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_anonymous_queue: { Args: never; Returns: Json }
      find_or_join_anonymous_match: {
        Args: { p_alias: string; p_avatar: string; p_topic?: string }
        Returns: Json
      }
      get_or_create_conversation: {
        Args: { user_a: string; user_b: string }
        Returns: string
      }
      is_admin: { Args: { uid?: string }; Returns: boolean }
      leave_anonymous_session: { Args: { p_session_id: string }; Returns: Json }
      reveal_anonymous_identity: {
        Args: { p_session_id: string }
        Returns: Json
      }
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
