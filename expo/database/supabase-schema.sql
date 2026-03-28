-- Supabase Database Schema for SocialStoryAI
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT false,
    stories_generated INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    stripe_customer_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Service role can insert users" ON public.users
    FOR INSERT WITH CHECK (true);

-- Stories table
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    child_name TEXT NOT NULL,
    situation TEXT NOT NULL,
    complexity TEXT NOT NULL,
    tone TEXT NOT NULL,
    image_style TEXT NOT NULL,
    content TEXT NOT NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stories
CREATE POLICY "Users can view own stories" ON public.stories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own stories" ON public.stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON public.stories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" ON public.stories
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stories" ON public.stories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);

-- Contact requests table
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'in-progress', 'resolved')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    replied_at TIMESTAMP WITH TIME ZONE,
    admin_reply TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact requests
CREATE POLICY "Anyone can create contact requests" ON public.contact_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own contact requests" ON public.contact_requests
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view all contact requests" ON public.contact_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON public.contact_requests(created_at DESC);

-- Pages table
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    is_published BOOLEAN DEFAULT true,
    show_in_menu BOOLEAN DEFAULT true,
    menu_order INTEGER DEFAULT 0,
    show_header BOOLEAN DEFAULT true,
    show_footer BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pages
CREATE POLICY "Anyone can view published pages" ON public.pages
    FOR SELECT USING (is_published = true OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
    ));

CREATE POLICY "Admins can manage pages" ON public.pages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);

-- Page contents table
CREATE TABLE IF NOT EXISTS public.page_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    section_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('text', 'heading', 'html', 'image', 'button')) NOT NULL,
    content TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    styles JSONB,
    metadata JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page contents
CREATE POLICY "Anyone can view page contents" ON public.page_contents
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage page contents" ON public.page_contents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE INDEX IF NOT EXISTS idx_page_contents_page_id ON public.page_contents(page_id);

-- Theme settings table
CREATE TABLE IF NOT EXISTS public.theme_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    primary_color TEXT DEFAULT '#6366F1',
    secondary_color TEXT DEFAULT '#8B5CF6',
    accent_color TEXT DEFAULT '#EC4899',
    background_color TEXT DEFAULT '#FFFFFF',
    text_color TEXT DEFAULT '#1F2937',
    header_background_color TEXT DEFAULT '#FFFFFF',
    header_text_color TEXT DEFAULT '#1F2937',
    footer_background_color TEXT DEFAULT '#F9FAFB',
    footer_text_color TEXT DEFAULT '#6B7280',
    button_background_color TEXT DEFAULT '#6366F1',
    button_text_color TEXT DEFAULT '#FFFFFF',
    border_radius INTEGER DEFAULT 12,
    font_size INTEGER DEFAULT 16,
    font_family TEXT DEFAULT 'System',
    header_height INTEGER DEFAULT 60,
    footer_height INTEGER DEFAULT 80,
    custom_css TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for theme settings
CREATE POLICY "Anyone can view theme settings" ON public.theme_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage theme settings" ON public.theme_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Header/Footer content table
CREATE TABLE IF NOT EXISTS public.header_footer_contents (
    id TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('header', 'footer')) NOT NULL,
    content TEXT NOT NULL,
    logo TEXT,
    links JSONB,
    show_search BOOLEAN DEFAULT false,
    show_user_menu BOOLEAN DEFAULT true,
    custom_html TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.header_footer_contents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for header/footer contents
CREATE POLICY "Anyone can view header/footer" ON public.header_footer_contents
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage header/footer" ON public.header_footer_contents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    free_story_limit INTEGER DEFAULT 3,
    enable_registration BOOLEAN DEFAULT true,
    maintenance_mode BOOLEAN DEFAULT false,
    premium_price DECIMAL DEFAULT 9.99,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin settings
CREATE POLICY "Anyone can view admin settings" ON public.admin_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage admin settings" ON public.admin_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp BIGINT NOT NULL,
    action TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    details TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity logs
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "System can insert activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- API keys table (stored encrypted in Supabase Vault or as secrets)
CREATE TABLE IF NOT EXISTS public.api_keys (
    id TEXT PRIMARY KEY DEFAULT 'default',
    openai_key TEXT,
    gemini_key TEXT,
    stripe_secret_key TEXT,
    stripe_publishable_key TEXT,
    google_oauth_web_client_id TEXT,
    google_oauth_ios_client_id TEXT,
    google_oauth_android_client_id TEXT,
    mail_host TEXT,
    mail_port INTEGER,
    mail_user TEXT,
    mail_password TEXT,
    mail_from TEXT,
    jwt_secret TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api keys
CREATE POLICY "Admins can manage api keys" ON public.api_keys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Insert default settings
INSERT INTO public.admin_settings (id, free_story_limit, enable_registration, maintenance_mode, premium_price, updated_at)
VALUES ('default', 3, true, false, 9.99, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.theme_settings (id, updated_at)
VALUES ('default', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.api_keys (id, updated_at)
VALUES ('default', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert default header/footer
INSERT INTO public.header_footer_contents (id, type, content, links, show_search, show_user_menu, updated_at)
VALUES (
    'header',
    'header',
    'SocialStoryAI',
    '[{"label": "Home", "url": "/home"}, {"label": "About", "url": "/about"}, {"label": "Pricing", "url": "/pricing"}, {"label": "FAQ", "url": "/faq"}, {"label": "Contact", "url": "/contact"}]'::jsonb,
    false,
    true,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.header_footer_contents (id, type, content, links, show_search, show_user_menu, updated_at)
VALUES (
    'footer',
    'footer',
    '© 2025 SocialStoryAI. All rights reserved.',
    '[{"label": "Privacy Policy", "url": "/privacy"}, {"label": "Terms of Service", "url": "/terms"}, {"label": "Contact Us", "url": "/contact"}]'::jsonb,
    false,
    false,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON public.stories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create default admin user (password will be set via Supabase Auth)
-- You'll need to manually create this in Supabase Dashboard
-- Email: admin@socialstoryai.com
-- Password: Set a secure password
-- Then run this to make them admin:
-- UPDATE public.users SET is_admin = true, is_premium = true WHERE email = 'admin@socialstoryai.com';
