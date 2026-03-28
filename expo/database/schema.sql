-- SocialStoryAI Database Schema
-- This file contains the complete database structure for the application

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    is_premium INTEGER DEFAULT 0,
    stories_generated INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    subscription_end_date TEXT,
    last_login_at TEXT,
    google_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    CONSTRAINT email_unique UNIQUE (email)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    child_name TEXT NOT NULL,
    situation TEXT NOT NULL,
    complexity TEXT NOT NULL,
    tone TEXT NOT NULL,
    image_style TEXT NOT NULL,
    content TEXT NOT NULL,
    images TEXT NOT NULL,
    video_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on user_id for faster user story lookups
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- Contact requests table
CREATE TABLE IF NOT EXISTS contact_requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'in-progress', 'resolved')) DEFAULT 'pending',
    created_at TEXT NOT NULL,
    replied_at TEXT,
    admin_reply TEXT,
    user_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_requests(created_at DESC);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    is_published INTEGER DEFAULT 1,
    show_in_menu INTEGER DEFAULT 1,
    menu_order INTEGER DEFAULT 0,
    show_header INTEGER DEFAULT 1,
    show_footer INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);

-- Page contents table
CREATE TABLE IF NOT EXISTS page_contents (
    id TEXT PRIMARY KEY,
    page_id TEXT NOT NULL,
    section_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('text', 'heading', 'html', 'image', 'button')) NOT NULL,
    content TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    styles TEXT,
    metadata TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_page_contents_page_id ON page_contents(page_id);

-- Theme settings table
CREATE TABLE IF NOT EXISTS theme_settings (
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
    updated_at TEXT NOT NULL
);

-- Header/Footer content table
CREATE TABLE IF NOT EXISTS header_footer_contents (
    id TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('header', 'footer')) NOT NULL,
    content TEXT NOT NULL,
    logo TEXT,
    links TEXT,
    show_search INTEGER DEFAULT 0,
    show_user_menu INTEGER DEFAULT 1,
    custom_html TEXT,
    updated_at TEXT NOT NULL
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    free_story_limit INTEGER DEFAULT 3,
    enable_registration INTEGER DEFAULT 1,
    maintenance_mode INTEGER DEFAULT 0,
    premium_price REAL DEFAULT 9.99,
    updated_at TEXT NOT NULL
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    action TEXT NOT NULL,
    user_id TEXT NOT NULL,
    details TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- API keys table (encrypted values only)
CREATE TABLE IF NOT EXISTS api_keys (
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
    updated_at TEXT NOT NULL
);

-- Session tokens table for JWT management
CREATE TABLE IF NOT EXISTS session_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_tokens_user_id ON session_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_session_tokens_token ON session_tokens(token);
CREATE INDEX IF NOT EXISTS idx_session_tokens_expires_at ON session_tokens(expires_at);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    reset_at INTEGER NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);
