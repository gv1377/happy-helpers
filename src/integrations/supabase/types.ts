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
      ai_recommendations: {
        Row: {
          created_at: string
          id: string
          kind: string
          outfit_id: string | null
          prompt: string | null
          response: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          outfit_id?: string | null
          prompt?: string | null
          response?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          outfit_id?: string | null
          prompt?: string | null
          response?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      clothing_items: {
        Row: {
          brand: string | null
          category: string
          color: string | null
          created_at: string
          id: string
          image_url: string | null
          is_archived: boolean
          is_favorite: boolean
          last_used_at: string | null
          material: string | null
          name: string
          notes: string | null
          occasion: string | null
          original_image_url: string | null
          price: number | null
          purchase_date: string | null
          season: string | null
          secondary_color: string | null
          size: string | null
          subcategory: string | null
          tags: string[]
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          brand?: string | null
          category: string
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_archived?: boolean
          is_favorite?: boolean
          last_used_at?: string | null
          material?: string | null
          name: string
          notes?: string | null
          occasion?: string | null
          original_image_url?: string | null
          price?: number | null
          purchase_date?: string | null
          season?: string | null
          secondary_color?: string | null
          size?: string | null
          subcategory?: string | null
          tags?: string[]
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_archived?: boolean
          is_favorite?: boolean
          last_used_at?: string | null
          material?: string | null
          name?: string
          notes?: string | null
          occasion?: string | null
          original_image_url?: string | null
          price?: number | null
          purchase_date?: string | null
          season?: string | null
          secondary_color?: string | null
          size?: string | null
          subcategory?: string | null
          tags?: string[]
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          clothing_item_id: string
          collection_id: string
          created_at: string
          id: string
        }
        Insert: {
          clothing_item_id: string
          collection_id: string
          created_at?: string
          id?: string
        }
        Update: {
          clothing_item_id?: string
          collection_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_clothing_item_id_fkey"
            columns: ["clothing_item_id"]
            isOneToOne: false
            referencedRelation: "clothing_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      detected_clothing: {
        Row: {
          bounding_box: Json | null
          clothing_item_id: string | null
          confidence: number | null
          created_at: string
          cropped_image_url: string | null
          detected_category: string | null
          detected_color: string | null
          id: string
          source_image_url: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bounding_box?: Json | null
          clothing_item_id?: string | null
          confidence?: number | null
          created_at?: string
          cropped_image_url?: string | null
          detected_category?: string | null
          detected_color?: string | null
          id?: string
          source_image_url: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bounding_box?: Json | null
          clothing_item_id?: string | null
          confidence?: number | null
          created_at?: string
          cropped_image_url?: string | null
          detected_category?: string | null
          detected_color?: string | null
          id?: string
          source_image_url?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "detected_clothing_clothing_item_id_fkey"
            columns: ["clothing_item_id"]
            isOneToOne: false
            referencedRelation: "clothing_items"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          dress_code: string | null
          ends_at: string | null
          event_type: string | null
          id: string
          location: string | null
          outfit_id: string | null
          starts_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dress_code?: string | null
          ends_at?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          outfit_id?: string | null
          starts_at: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dress_code?: string | null
          ends_at?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          outfit_id?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_items: {
        Row: {
          clothing_item_id: string
          created_at: string
          id: string
          outfit_id: string
          position: number
        }
        Insert: {
          clothing_item_id: string
          created_at?: string
          id?: string
          outfit_id: string
          position?: number
        }
        Update: {
          clothing_item_id?: string
          created_at?: string
          id?: string
          outfit_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "outfit_items_clothing_item_id_fkey"
            columns: ["clothing_item_id"]
            isOneToOne: false
            referencedRelation: "clothing_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_items_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfits: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_favorite: boolean
          last_used_at: string | null
          name: string
          occasion: string | null
          season: string | null
          source: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean
          last_used_at?: string | null
          name: string
          occasion?: string | null
          season?: string | null
          source?: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean
          last_used_at?: string | null
          name?: string
          occasion?: string | null
          season?: string | null
          source?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          bottom_size: string | null
          city: string | null
          created_at: string
          display_name: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          preferred_style: string | null
          shoe_size: string | null
          top_size: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          bottom_size?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          preferred_style?: string | null
          shoe_size?: string | null
          top_size?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          bottom_size?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          preferred_style?: string | null
          shoe_size?: string | null
          top_size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trip_items: {
        Row: {
          clothing_item_id: string | null
          created_at: string
          id: string
          outfit_id: string | null
          packed: boolean
          trip_id: string
        }
        Insert: {
          clothing_item_id?: string | null
          created_at?: string
          id?: string
          outfit_id?: string | null
          packed?: boolean
          trip_id: string
        }
        Update: {
          clothing_item_id?: string | null
          created_at?: string
          id?: string
          outfit_id?: string | null
          packed?: boolean
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_items_clothing_item_id_fkey"
            columns: ["clothing_item_id"]
            isOneToOne: false
            referencedRelation: "clothing_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_items_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          destination: string | null
          ends_on: string | null
          id: string
          name: string
          notes: string | null
          starts_on: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination?: string | null
          ends_on?: string | null
          id?: string
          name: string
          notes?: string | null
          starts_on: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string | null
          ends_on?: string | null
          id?: string
          name?: string
          notes?: string | null
          starts_on?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reference_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_primary: boolean
          label: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean
          label?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean
          label?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      virtual_tryons: {
        Row: {
          clothing_item_id: string | null
          created_at: string
          error_message: string | null
          id: string
          outfit_id: string | null
          reference_image_id: string | null
          result_image_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clothing_item_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          outfit_id?: string | null
          reference_image_id?: string | null
          result_image_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clothing_item_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          outfit_id?: string | null
          reference_image_id?: string | null
          result_image_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "virtual_tryons_clothing_item_id_fkey"
            columns: ["clothing_item_id"]
            isOneToOne: false
            referencedRelation: "clothing_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virtual_tryons_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virtual_tryons_reference_image_id_fkey"
            columns: ["reference_image_id"]
            isOneToOne: false
            referencedRelation: "user_reference_images"
            referencedColumns: ["id"]
          },
        ]
      }
      wear_history: {
        Row: {
          clothing_item_id: string | null
          created_at: string
          id: string
          notes: string | null
          occasion: string | null
          outfit_id: string | null
          updated_at: string
          user_id: string
          weather: string | null
          worn_on: string
        }
        Insert: {
          clothing_item_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          occasion?: string | null
          outfit_id?: string | null
          updated_at?: string
          user_id: string
          weather?: string | null
          worn_on?: string
        }
        Update: {
          clothing_item_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          occasion?: string | null
          outfit_id?: string | null
          updated_at?: string
          user_id?: string
          weather?: string | null
          worn_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "wear_history_clothing_item_id_fkey"
            columns: ["clothing_item_id"]
            isOneToOne: false
            referencedRelation: "clothing_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wear_history_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          brand: string | null
          category: string | null
          color: string | null
          created_at: string
          currency: string
          id: string
          image_url: string | null
          name: string
          notes: string | null
          price: number | null
          priority: string
          status: string
          store_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          color?: string | null
          created_at?: string
          currency?: string
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          price?: number | null
          priority?: string
          status?: string
          store_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          color?: string | null
          created_at?: string
          currency?: string
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          price?: number | null
          priority?: string
          status?: string
          store_url?: string | null
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
