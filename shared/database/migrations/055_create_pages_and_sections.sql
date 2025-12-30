-- Migration 055: Create pages and page_sections tables
-- Date: 2025-01-28

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  page_type VARCHAR(100) NOT NULL DEFAULT 'static' CHECK (page_type IN ('static', 'homepage')),
  published BOOLEAN DEFAULT true,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create page_sections table
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_key VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  section_type VARCHAR(100) NOT NULL CHECK (section_type IN ('hero', 'content', 'team', 'clients', 'service', 'form', 'info')),
  display_order INTEGER NOT NULL DEFAULT 0,
  content TEXT,
  images TEXT[],
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT unique_page_section_key UNIQUE (page_id, section_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_page_type ON pages(page_type);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(published);
CREATE INDEX IF NOT EXISTS idx_pages_created_by ON pages(created_by);

CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_order ON page_sections(page_id, display_order);
CREATE INDEX IF NOT EXISTS idx_page_sections_published ON page_sections(published);
CREATE INDEX IF NOT EXISTS idx_page_sections_section_key ON page_sections(page_id, section_key);

-- Comments
COMMENT ON TABLE pages IS 'Trang tĩnh/Homepage: gioi-thieu, dich-vu, lien-he, etc.';
COMMENT ON COLUMN pages.page_type IS 'static: trang tĩnh, homepage: trang chủ';
COMMENT ON TABLE page_sections IS 'Sections của mỗi trang - quản lý text và images cho CMS';
COMMENT ON COLUMN page_sections.section_key IS 'Key của section: hero, cau-chuyen, doi-ngu, etc.';
COMMENT ON COLUMN page_sections.section_type IS 'hero, content, team, clients, service, form, info';
COMMENT ON COLUMN page_sections.content IS 'Nội dung text (HTML hoặc plain text)';
COMMENT ON COLUMN page_sections.images IS 'Mảng URL hình ảnh';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


















