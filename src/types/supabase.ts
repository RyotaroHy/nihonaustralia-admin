export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          message: string;
          name: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          message: string;
          name: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      employment_types: {
        Row: {
          code: string;
          id: number;
        };
        Insert: {
          code: string;
          id?: number;
        };
        Update: {
          code?: string;
          id?: number;
        };
        Relationships: [];
      };
      job_categories: {
        Row: {
          code: string;
          id: number;
        };
        Insert: {
          code: string;
          id?: number;
        };
        Update: {
          code?: string;
          id?: number;
        };
        Relationships: [];
      };
      job_post_categories: {
        Row: {
          job_category_id: number;
          job_post_id: string;
        };
        Insert: {
          job_category_id: number;
          job_post_id: string;
        };
        Update: {
          job_category_id?: number;
          job_post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'job_post_categories_job_category_id_fkey';
            columns: ['job_category_id'];
            isOneToOne: false;
            referencedRelation: 'job_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'job_post_categories_job_post_id_fkey';
            columns: ['job_post_id'];
            isOneToOne: false;
            referencedRelation: 'job_posts';
            referencedColumns: ['post_id'];
          },
          {
            foreignKeyName: 'job_post_categories_job_post_id_fkey';
            columns: ['job_post_id'];
            isOneToOne: false;
            referencedRelation: 'job_posts_view';
            referencedColumns: ['post_id'];
          },
        ];
      };
      job_post_employment_types: {
        Row: {
          employment_type_id: number;
          job_post_id: string;
        };
        Insert: {
          employment_type_id: number;
          job_post_id: string;
        };
        Update: {
          employment_type_id?: number;
          job_post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'job_post_employment_types_employment_type_id_fkey';
            columns: ['employment_type_id'];
            isOneToOne: false;
            referencedRelation: 'employment_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'job_post_employment_types_job_post_id_fkey';
            columns: ['job_post_id'];
            isOneToOne: false;
            referencedRelation: 'job_posts';
            referencedColumns: ['post_id'];
          },
          {
            foreignKeyName: 'job_post_employment_types_job_post_id_fkey';
            columns: ['job_post_id'];
            isOneToOne: false;
            referencedRelation: 'job_posts_view';
            referencedColumns: ['post_id'];
          },
        ];
      };
      job_post_required_english_levels: {
        Row: {
          english_level_id: number;
          job_post_id: string;
        };
        Insert: {
          english_level_id: number;
          job_post_id: string;
        };
        Update: {
          english_level_id?: number;
          job_post_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'job_post_required_english_levels_english_level_id_fkey';
            columns: ['english_level_id'];
            isOneToOne: false;
            referencedRelation: 'required_english_levels';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'job_post_required_english_levels_job_post_id_fkey';
            columns: ['job_post_id'];
            isOneToOne: false;
            referencedRelation: 'job_posts';
            referencedColumns: ['post_id'];
          },
          {
            foreignKeyName: 'job_post_required_english_levels_job_post_id_fkey';
            columns: ['job_post_id'];
            isOneToOne: false;
            referencedRelation: 'job_posts_view';
            referencedColumns: ['post_id'];
          },
        ];
      };
      job_post_visa_types: {
        Row: {
          job_post_id: string;
          visa_type_id: number;
        };
        Insert: {
          job_post_id: string;
          visa_type_id: number;
        };
        Update: {
          job_post_id?: string;
          visa_type_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'job_post_visa_types_job_post_id_fkey';
            columns: ['job_post_id'];
            isOneToOne: false;
            referencedRelation: 'job_posts';
            referencedColumns: ['post_id'];
          },
          {
            foreignKeyName: 'job_post_visa_types_job_post_id_fkey';
            columns: ['job_post_id'];
            isOneToOne: false;
            referencedRelation: 'job_posts_view';
            referencedColumns: ['post_id'];
          },
          {
            foreignKeyName: 'job_post_visa_types_visa_type_id_fkey';
            columns: ['visa_type_id'];
            isOneToOne: false;
            referencedRelation: 'visa_types';
            referencedColumns: ['id'];
          },
        ];
      };
      job_post_working_periods: {
        Row: {
          job_post_id: string;
          working_period_id: number;
        };
        Insert: {
          job_post_id: string;
          working_period_id: number;
        };
        Update: {
          job_post_id?: string;
          working_period_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'job_post_working_periods_job_post_id_fkey';
            columns: ['job_post_id'];
            isOneToOne: false;
            referencedRelation: 'job_posts';
            referencedColumns: ['post_id'];
          },
          {
            foreignKeyName: 'job_post_working_periods_job_post_id_fkey';
            columns: ['job_post_id'];
            isOneToOne: false;
            referencedRelation: 'job_posts_view';
            referencedColumns: ['post_id'];
          },
          {
            foreignKeyName: 'job_post_working_periods_working_period_id_fkey';
            columns: ['working_period_id'];
            isOneToOne: false;
            referencedRelation: 'working_periods';
            referencedColumns: ['id'];
          },
        ];
      };
      job_posts: {
        Row: {
          address_detail: string | null;
          can_get_second: boolean | null;
          company_name: string | null;
          company_url: string | null;
          description: string;
          employer_email: string | null;
          employer_name: string | null;
          employer_phone: string | null;
          post_id: string;
          postal_code: string | null;
          salary: string | null;
          salary_max: number | null;
          salary_min: number | null;
          salary_type: string | null;
          state: Database['public']['Enums']['au_state_enum'] | null;
          suburb: string | null;
          title: string;
        };
        Insert: {
          address_detail?: string | null;
          can_get_second?: boolean | null;
          company_name?: string | null;
          company_url?: string | null;
          description: string;
          employer_email?: string | null;
          employer_name?: string | null;
          employer_phone?: string | null;
          post_id: string;
          postal_code?: string | null;
          salary?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          salary_type?: string | null;
          state?: Database['public']['Enums']['au_state_enum'] | null;
          suburb?: string | null;
          title: string;
        };
        Update: {
          address_detail?: string | null;
          can_get_second?: boolean | null;
          company_name?: string | null;
          company_url?: string | null;
          description?: string;
          employer_email?: string | null;
          employer_name?: string | null;
          employer_phone?: string | null;
          post_id?: string;
          postal_code?: string | null;
          salary?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          salary_type?: string | null;
          state?: Database['public']['Enums']['au_state_enum'] | null;
          suburb?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'job_posts_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: true;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'job_posts_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: true;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      mypage_profiles: {
        Row: {
          admin_verified: boolean;
          au_state: Database['public']['Enums']['au_state_enum'] | null;
          bio: string | null;
          birthday: string | null;
          created_at: string;
          deleted_at: string | null;
          full_name: string | null;
          gender: Database['public']['Enums']['gender_enum'] | null;
          id: string;
          image_url: string | null;
          origin_country: number | null;
          phone: string | null;
          updated_at: string;
          verified_at: string | null;
          verified_by: string | null;
          verification_notes: string | null;
          visa: number | null;
        };
        Insert: {
          admin_verified?: boolean;
          au_state?: Database['public']['Enums']['au_state_enum'] | null;
          bio?: string | null;
          birthday?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          full_name?: string | null;
          gender?: Database['public']['Enums']['gender_enum'] | null;
          id: string;
          image_url?: string | null;
          origin_country?: number | null;
          phone?: string | null;
          updated_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          verification_notes?: string | null;
          visa?: number | null;
        };
        Update: {
          admin_verified?: boolean;
          au_state?: Database['public']['Enums']['au_state_enum'] | null;
          bio?: string | null;
          birthday?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          full_name?: string | null;
          gender?: Database['public']['Enums']['gender_enum'] | null;
          id?: string;
          image_url?: string | null;
          origin_country?: number | null;
          phone?: string | null;
          updated_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
          verification_notes?: string | null;
          visa?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mypage_profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'mypage_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mypage_profiles_origin_country_fkey';
            columns: ['origin_country'];
            isOneToOne: false;
            referencedRelation: 'origin_countries';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mypage_profiles_visa_fkey';
            columns: ['visa'];
            isOneToOne: false;
            referencedRelation: 'visa_types';
            referencedColumns: ['id'];
          },
        ];
      };
      notices: {
        Row: {
          created_at: string | null;
          created_by: string;
          id: string;
          message_en: string | null;
          message_ja: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by: string;
          id?: string;
          message_en?: string | null;
          message_ja: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          id?: string;
          message_en?: string | null;
          message_ja?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      origin_countries: {
        Row: {
          code: string;
          id: number;
        };
        Insert: {
          code: string;
          id?: number;
        };
        Update: {
          code?: string;
          id?: number;
        };
        Relationships: [];
      };
      post_bookmarks: {
        Row: {
          created_at: string | null;
          id: string;
          post_id: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          post_id: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          post_id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'post_bookmarks_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_bookmarks_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_bookmarks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'mypage_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      post_images: {
        Row: {
          created_at: string | null;
          id: string;
          post_id: string;
          sort_order: number | null;
          url: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          post_id: string;
          sort_order?: number | null;
          url: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          post_id?: string;
          sort_order?: number | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'post_images_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_images_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
        ];
      };
      post_likes: {
        Row: {
          created_at: string | null;
          id: string;
          post_id: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          post_id: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          post_id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'post_likes_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_likes_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'mypage_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      post_statuses: {
        Row: {
          code: string;
        };
        Insert: {
          code: string;
        };
        Update: {
          code?: string;
        };
        Relationships: [];
      };
      post_views: {
        Row: {
          guest_id: string | null;
          id: string;
          post_id: string;
          user_id: string | null;
          viewed_at: string | null;
        };
        Insert: {
          guest_id?: string | null;
          id?: string;
          post_id: string;
          user_id?: string | null;
          viewed_at?: string | null;
        };
        Update: {
          guest_id?: string | null;
          id?: string;
          post_id?: string;
          user_id?: string | null;
          viewed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'post_views_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_views_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'post_views_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'mypage_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      postcodes: {
        Row: {
          id: number;
          postal_code: string;
          state: string;
          suburb: string;
        };
        Insert: {
          id?: number;
          postal_code: string;
          state: string;
          suburb: string;
        };
        Update: {
          id?: number;
          postal_code?: string;
          state?: string;
          suburb?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          status: string;
          type: string;
          updated_at: string;
          view_count: number | null;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          status?: string;
          type: string;
          updated_at?: string;
          view_count?: number | null;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          status?: string;
          type?: string;
          updated_at?: string;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'mypage_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_status_fkey';
            columns: ['status'];
            isOneToOne: false;
            referencedRelation: 'post_statuses';
            referencedColumns: ['code'];
          },
        ];
      };
      required_english_levels: {
        Row: {
          code: string;
          id: number;
        };
        Insert: {
          code: string;
          id?: number;
        };
        Update: {
          code?: string;
          id?: number;
        };
        Relationships: [];
      };
      visa_types: {
        Row: {
          code: string;
          id: number;
        };
        Insert: {
          code: string;
          id?: number;
        };
        Update: {
          code?: string;
          id?: number;
        };
        Relationships: [];
      };
      working_periods: {
        Row: {
          code: string;
          id: number;
        };
        Insert: {
          code: string;
          id?: number;
        };
        Update: {
          code?: string;
          id?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      job_posts_view: {
        Row: {
          address_detail: string | null;
          can_get_second: boolean | null;
          company_name: string | null;
          company_url: string | null;
          created_by: string | null;
          description: string | null;
          employer_email: string | null;
          employer_name: string | null;
          employer_phone: string | null;
          employment_type_ids: number[] | null;
          full_name: string | null;
          job_category_ids: number[] | null;
          job_category_names: string[] | null;
          likes_count: number | null;
          post_created_at: string | null;
          post_id: string | null;
          post_image_url: string | null;
          postal_code: string | null;
          profile_image_url: string | null;
          required_english_level_ids: number[] | null;
          salary: string | null;
          salary_max: number | null;
          salary_min: number | null;
          salary_type: string | null;
          state: Database['public']['Enums']['au_state_enum'] | null;
          status: string | null;
          suburb: string | null;
          title: string | null;
          visa_type_ids: number[] | null;
          working_period_ids: number[] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'job_posts_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: true;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'job_posts_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: true;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'mypage_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_status_fkey';
            columns: ['status'];
            isOneToOne: false;
            referencedRelation: 'post_statuses';
            referencedColumns: ['code'];
          },
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      au_state_enum: 'ACT' | 'NSW' | 'NT' | 'QLD' | 'SA' | 'TAS' | 'VIC' | 'WA';
      gender_enum: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      au_state_enum: ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'],
      gender_enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
  },
} as const;
