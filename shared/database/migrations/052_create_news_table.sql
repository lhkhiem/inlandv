-- Migration 052: Create news table with category_id
-- Date: 2025-01-28

-- Create news table if it doesn't exist
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id UUID REFERENCES news_categories(id) ON DELETE SET NULL,
  thumbnail TEXT,
  excerpt TEXT,
  content TEXT NOT NULL,
  author VARCHAR(255),
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_category_id ON news(category_id);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_created_by ON news(created_by);

-- Comments
COMMENT ON TABLE news IS 'Tin tức về thị trường bất động sản, quy hoạch, chính sách, tư vấn';
COMMENT ON COLUMN news.category_id IS 'ID của danh mục tin tức';
COMMENT ON COLUMN news.featured IS 'Tin nổi bật hiển thị ở đầu trang';
COMMENT ON COLUMN news.published_at IS 'Ngày xuất bản (NULL = nháp)';
COMMENT ON COLUMN news.author IS 'Tên tác giả';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


















