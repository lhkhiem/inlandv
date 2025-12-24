-- ============================================
-- CMS Integration Migration
-- Tích hợp các bảng CMS vào Inland Real Estate Platform
-- ============================================
-- Ngày tạo: 2025-01-28
-- Mục đích: Thêm các bảng cần thiết cho CMS functionality

-- ============================================
-- 0. HELPER FUNCTION - Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1. SETTINGS - CMS Configuration
-- ============================================

CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace VARCHAR(100) NOT NULL UNIQUE,
    -- Namespaces: 'general', 'seo', 'appearance', 'security', 'advanced', 'email', 'social'
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_namespace ON settings(namespace);

COMMENT ON TABLE settings IS 'CMS settings với namespace-based organization';
COMMENT ON COLUMN settings.namespace IS 'Namespace: general, seo, appearance, security, advanced, email, social';
COMMENT ON COLUMN settings.value IS 'JSONB chứa các settings: {"site_name": "...", "site_description": "..."}';

-- ============================================
-- 2. MENU SYSTEM - Navigation Management
-- ============================================

-- Menu Locations
CREATE TABLE IF NOT EXISTS menu_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items (Nested structure)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_location_id UUID NOT NULL REFERENCES menu_locations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  
  -- Display info
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  icon VARCHAR(100),
  
  -- Link type and reference
  type VARCHAR(50) NOT NULL DEFAULT 'custom',
  -- 'custom', 'property', 'industrial_park', 'news', 'insight', 'case_study', 'page'
  entity_id UUID, -- Reference to entity if applicable
  
  -- Link attributes
  target VARCHAR(20) DEFAULT '_self', -- '_self', '_blank'
  rel VARCHAR(100), -- 'nofollow', 'noopener', etc.
  css_classes TEXT,
  
  -- Ordering and display
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_items_location ON menu_items(menu_location_id);
CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX idx_menu_items_sort ON menu_items(menu_location_id, sort_order);
CREATE INDEX idx_menu_items_type ON menu_items(type);

COMMENT ON TABLE menu_locations IS 'Menu locations: header, footer, mobile, etc.';
COMMENT ON TABLE menu_items IS 'Menu items với nested structure và drag-drop ordering';

-- Insert default menu locations
INSERT INTO menu_locations (name, slug, description, is_active) VALUES
  ('Header Menu', 'header', 'Main navigation menu displayed in the header', true),
  ('Footer Menu', 'footer', 'Links displayed in the footer', true),
  ('Mobile Menu', 'mobile', 'Mobile navigation menu', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. PAGE_METADATA - SEO Metadata
-- ============================================

CREATE TABLE IF NOT EXISTS page_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path VARCHAR(500) NOT NULL UNIQUE,
    -- e.g., '/about', '/gioi-thieu', '/properties/property-slug', '/news/news-slug'
    title VARCHAR(500),
    description TEXT,
    og_image VARCHAR(1000),
    keywords TEXT[],
    enabled BOOLEAN DEFAULT TRUE,
    auto_generated BOOLEAN DEFAULT FALSE,
    -- TRUE for auto-generated (properties, news, etc.), FALSE for custom
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_metadata_path ON page_metadata(path);
CREATE INDEX idx_page_metadata_auto_generated ON page_metadata(auto_generated);

COMMENT ON TABLE page_metadata IS 'SEO metadata cho từng page (static pages, properties, news, etc.)';
COMMENT ON COLUMN page_metadata.path IS 'Unique path identifier: /about, /properties/slug, /news/slug';
COMMENT ON COLUMN page_metadata.auto_generated IS 'TRUE cho auto-generated (properties/news), FALSE cho custom';

-- ============================================
-- 4. ACTIVITY_LOGS - Activity Tracking
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    -- 'create', 'update', 'delete', 'publish', 'unpublish', 'login', 'logout', etc.
    entity_type VARCHAR(50) NOT NULL,
    -- 'property', 'industrial_park', 'news', 'news_activity', 'insight', 'case_study', 'job', 'user', 'page', 'menu_item', etc.
    entity_id UUID,
    entity_name VARCHAR(255),
    description TEXT,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_recent ON activity_logs(created_at DESC, user_id);

COMMENT ON TABLE activity_logs IS 'Activity tracking và audit trail cho CMS';

-- ============================================
-- 5. MEDIA MANAGEMENT - Assets & Folders
-- ============================================

-- Asset Folders (Nested structure)
CREATE TABLE IF NOT EXISTS asset_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES asset_folders(id) ON DELETE SET NULL,
    path TEXT, -- Cached path like "/properties/industrial-parks"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assets (Unified Media Library)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID REFERENCES asset_folders(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    -- 'image', 'video', 'document', 'audio', 'other'
    provider VARCHAR(50) DEFAULT 'local',
    -- 'local', 's3', 'cloudinary', 'cdn'
    url VARCHAR(1024) NOT NULL,
    cdn_url VARCHAR(1024),
    filename VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT, -- bytes
    width INTEGER, -- For images/videos
    height INTEGER, -- For images/videos
    format VARCHAR(50), -- 'jpg', 'png', 'pdf', 'mp4', etc.
    sizes JSONB, -- For responsive images: {"thumbnail": "...", "medium": "...", "large": "..."}
    alt_text TEXT,
    caption TEXT,
    metadata JSONB, -- Additional metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asset_folders_parent_id ON asset_folders(parent_id);
CREATE INDEX idx_assets_folder_id ON assets(folder_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_provider ON assets(provider);

COMMENT ON TABLE asset_folders IS 'Media folders với nested structure';
COMMENT ON TABLE assets IS 'Unified media library - có thể dùng cho tất cả entities';

-- ============================================
-- 6. FAQ - FAQ Management
-- ============================================

CREATE TABLE IF NOT EXISTS faq_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES faq_categories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faq_categories_slug ON faq_categories(slug);
CREATE INDEX idx_faq_categories_sort_order ON faq_categories(sort_order);
CREATE INDEX idx_faq_categories_is_active ON faq_categories(is_active);
CREATE INDEX idx_faq_questions_category_id ON faq_questions(category_id);
CREATE INDEX idx_faq_questions_sort_order ON faq_questions(sort_order);
CREATE INDEX idx_faq_questions_is_active ON faq_questions(is_active);

COMMENT ON TABLE faq_categories IS 'FAQ categories để tổ chức questions';
COMMENT ON TABLE faq_questions IS 'FAQ questions và answers';

-- ============================================
-- 7. TRACKING_SCRIPTS - Analytics & Tracking
-- ============================================

CREATE TABLE IF NOT EXISTS tracking_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'custom',
  -- 'analytics', 'pixel', 'custom', 'tag-manager', 'heatmap', 'live-chat'
  provider VARCHAR(100),
  -- 'google', 'facebook', 'microsoft', 'custom', etc.
  position VARCHAR(10) NOT NULL DEFAULT 'head',
  -- 'head' hoặc 'body'
  script_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  load_strategy VARCHAR(20) DEFAULT 'sync',
  -- 'sync', 'async', 'defer'
  pages JSONB DEFAULT '["all"]'::jsonb,
  -- ['all'] hoặc ['home', 'properties', 'news', 'contact'] - Pages nào sẽ load
  priority INTEGER DEFAULT 0,
  -- Thứ tự load (số nhỏ load trước)
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CHECK (position IN ('head', 'body')),
  CHECK (load_strategy IN ('sync', 'async', 'defer')),
  CHECK (type IN ('analytics', 'pixel', 'custom', 'tag-manager', 'heatmap', 'live-chat'))
);

CREATE INDEX idx_tracking_scripts_active ON tracking_scripts(is_active);
CREATE INDEX idx_tracking_scripts_position ON tracking_scripts(position);
CREATE INDEX idx_tracking_scripts_pages ON tracking_scripts USING GIN(pages);
CREATE INDEX idx_tracking_scripts_priority ON tracking_scripts(priority);

COMMENT ON TABLE tracking_scripts IS 'Quản lý tracking scripts (Google Analytics, Facebook Pixel, etc.)';
COMMENT ON COLUMN tracking_scripts.pages IS 'JSON array: ["all"] hoặc ["home", "properties", "news"]';

-- ============================================
-- 8. NEWSLETTER_SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  -- 'active', 'unsubscribed', 'bounced'
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
  source VARCHAR(255),
  -- Where they subscribed from (footer, homepage, contact, etc.)
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);
CREATE INDEX idx_newsletter_subscriptions_subscribed_at ON newsletter_subscriptions(subscribed_at DESC);

COMMENT ON TABLE newsletter_subscriptions IS 'Newsletter email subscriptions từ website visitors';

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================

CREATE TRIGGER trigger_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_menu_locations_updated_at
  BEFORE UPDATE ON menu_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_page_metadata_updated_at
  BEFORE UPDATE ON page_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_asset_folders_updated_at
  BEFORE UPDATE ON asset_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_faq_categories_updated_at
  BEFORE UPDATE ON faq_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_faq_questions_updated_at
  BEFORE UPDATE ON faq_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_tracking_scripts_updated_at
  BEFORE UPDATE ON tracking_scripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();





