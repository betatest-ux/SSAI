import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

const storage = Platform.select({
  web: {
    getItem: async (key: string) => {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
      return null;
    },
    setItem: async (key: string, value: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    },
    removeItem: async (key: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    },
  },
  default: {
    getItem: async (key: string) => {
      return await AsyncStorage.getItem(key);
    },
    setItem: async (key: string, value: string) => {
      await AsyncStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
      await AsyncStorage.removeItem(key);
    },
  },
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          is_premium: boolean;
          stories_generated: number;
          is_admin: boolean;
          created_at: string;
          subscription_end_date: string | null;
          last_login_at: string | null;
          stripe_customer_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          is_premium?: boolean;
          stories_generated?: number;
          is_admin?: boolean;
          created_at?: string;
          subscription_end_date?: string | null;
          last_login_at?: string | null;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          is_premium?: boolean;
          stories_generated?: number;
          is_admin?: boolean;
          subscription_end_date?: string | null;
          last_login_at?: string | null;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          child_name: string;
          situation: string;
          complexity: string;
          tone: string;
          image_style: string;
          content: string;
          images: string[];
          video_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          child_name: string;
          situation: string;
          complexity: string;
          tone: string;
          image_style: string;
          content: string;
          images: string[];
          video_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          child_name?: string;
          situation?: string;
          complexity?: string;
          tone?: string;
          image_style?: string;
          content?: string;
          images?: string[];
          video_url?: string | null;
          updated_at?: string;
        };
      };
      contact_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status: 'pending' | 'in-progress' | 'resolved';
          created_at: string;
          replied_at: string | null;
          admin_reply: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status?: 'pending' | 'in-progress' | 'resolved';
          created_at?: string;
          replied_at?: string | null;
          admin_reply?: string | null;
          user_id?: string | null;
        };
        Update: {
          status?: 'pending' | 'in-progress' | 'resolved';
          replied_at?: string | null;
          admin_reply?: string | null;
        };
      };
      admin_settings: {
        Row: {
          id: string;
          free_story_limit: number;
          enable_registration: boolean;
          maintenance_mode: boolean;
          premium_price: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          free_story_limit?: number;
          enable_registration?: boolean;
          maintenance_mode?: boolean;
          premium_price?: number;
          updated_at?: string;
        };
        Update: {
          free_story_limit?: number;
          enable_registration?: boolean;
          maintenance_mode?: boolean;
          premium_price?: number;
          updated_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          openai_key: string | null;
          gemini_key: string | null;
          stripe_secret_key: string | null;
          stripe_publishable_key: string | null;
          google_oauth_web_client_id: string | null;
          google_oauth_ios_client_id: string | null;
          google_oauth_android_client_id: string | null;
          mail_host: string | null;
          mail_port: number | null;
          mail_user: string | null;
          mail_password: string | null;
          mail_from: string | null;
          jwt_secret: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          openai_key?: string | null;
          gemini_key?: string | null;
          stripe_secret_key?: string | null;
          stripe_publishable_key?: string | null;
          google_oauth_web_client_id?: string | null;
          google_oauth_ios_client_id?: string | null;
          google_oauth_android_client_id?: string | null;
          mail_host?: string | null;
          mail_port?: number | null;
          mail_user?: string | null;
          mail_password?: string | null;
          mail_from?: string | null;
          jwt_secret?: string | null;
          updated_at?: string;
        };
        Update: {
          openai_key?: string | null;
          gemini_key?: string | null;
          stripe_secret_key?: string | null;
          stripe_publishable_key?: string | null;
          google_oauth_web_client_id?: string | null;
          google_oauth_ios_client_id?: string | null;
          google_oauth_android_client_id?: string | null;
          mail_host?: string | null;
          mail_port?: number | null;
          mail_user?: string | null;
          mail_password?: string | null;
          mail_from?: string | null;
          jwt_secret?: string | null;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          timestamp: number;
          action: string;
          user_id: string;
          details: string;
        };
        Insert: {
          id?: string;
          timestamp: number;
          action: string;
          user_id: string;
          details: string;
        };
        Update: {
          action?: string;
          details?: string;
        };
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          is_published: boolean;
          show_in_menu: boolean;
          menu_order: number;
          show_header: boolean;
          show_footer: boolean;
          created_at: string;
          updated_at: string;
          metadata: any | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          is_published?: boolean;
          show_in_menu?: boolean;
          menu_order?: number;
          show_header?: boolean;
          show_footer?: boolean;
          created_at?: string;
          updated_at?: string;
          metadata?: any | null;
        };
        Update: {
          slug?: string;
          title?: string;
          is_published?: boolean;
          show_in_menu?: boolean;
          menu_order?: number;
          show_header?: boolean;
          show_footer?: boolean;
          updated_at?: string;
          metadata?: any | null;
        };
      };
      page_contents: {
        Row: {
          id: string;
          page_id: string;
          section_id: string;
          type: 'text' | 'heading' | 'html' | 'image' | 'button';
          content: string;
          order_num: number;
          styles: any | null;
          metadata: any | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          section_id: string;
          type: 'text' | 'heading' | 'html' | 'image' | 'button';
          content: string;
          order_num?: number;
          styles?: any | null;
          metadata?: any | null;
          updated_at?: string;
        };
        Update: {
          content?: string;
          order_num?: number;
          styles?: any | null;
          metadata?: any | null;
          updated_at?: string;
        };
      };
      theme_settings: {
        Row: {
          id: string;
          primary_color: string;
          secondary_color: string;
          accent_color: string;
          background_color: string;
          text_color: string;
          header_background_color: string;
          header_text_color: string;
          footer_background_color: string;
          footer_text_color: string;
          button_background_color: string;
          button_text_color: string;
          border_radius: number;
          font_size: number;
          font_family: string;
          header_height: number;
          footer_height: number;
          custom_css: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          primary_color?: string;
          secondary_color?: string;
          accent_color?: string;
          background_color?: string;
          text_color?: string;
          header_background_color?: string;
          header_text_color?: string;
          footer_background_color?: string;
          footer_text_color?: string;
          button_background_color?: string;
          button_text_color?: string;
          border_radius?: number;
          font_size?: number;
          font_family?: string;
          header_height?: number;
          footer_height?: number;
          custom_css?: string | null;
          updated_at?: string;
        };
        Update: {
          primary_color?: string;
          secondary_color?: string;
          accent_color?: string;
          background_color?: string;
          text_color?: string;
          header_background_color?: string;
          header_text_color?: string;
          footer_background_color?: string;
          footer_text_color?: string;
          button_background_color?: string;
          button_text_color?: string;
          border_radius?: number;
          font_size?: number;
          font_family?: string;
          header_height?: number;
          footer_height?: number;
          custom_css?: string | null;
          updated_at?: string;
        };
      };
      header_footer_contents: {
        Row: {
          id: string;
          type: 'header' | 'footer';
          content: string;
          logo: string | null;
          links: any | null;
          show_search: boolean;
          show_user_menu: boolean;
          custom_html: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: 'header' | 'footer';
          content: string;
          logo?: string | null;
          links?: any | null;
          show_search?: boolean;
          show_user_menu?: boolean;
          custom_html?: string | null;
          updated_at?: string;
        };
        Update: {
          content?: string;
          logo?: string | null;
          links?: any | null;
          show_search?: boolean;
          show_user_menu?: boolean;
          custom_html?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
