-- Migration: Add news_categories table and update news table
-- This migration creates a news_categories table and updates the news table
-- to use category_id instead of hardcoded category values

-- Create news_categories table
CREATE TABLE IF NOT EXISTS news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_news_categories_slug ON news_categories(slug);
CREATE INDEX idx_news_categories_display_order ON news_categories(display_order);
CREATE INDEX idx_news_categories_is_active ON news_categories(is_active);

COMMENT ON TABLE news_categories IS 'Danh mục tin tức';
COMMENT ON COLUMN news_categories.display_order IS 'Thứ tự hiển thị';
COMMENT ON COLUMN news_categories.is_active IS 'Trạng thái hoạt động';

-- Insert default categories based on existing CHECK constraint values
INSERT INTO news_categories (name, slug, description, display_order) VALUES
  ('Tin thị trường', 'tin-thi-truong', 'Tin tức về thị trường bất động sản', 1),
  ('Tin quy hoạch – Chính sách', 'quy-hoach-chinh-sach', 'Tin tức về quy hoạch và chính sách', 2),
  ('Tư vấn hỏi đáp', 'tu-van-hoi-dap', 'Tư vấn và hỏi đáp', 3),
  ('Tuyển dụng', 'tuyen-dung', 'Tin tức tuyển dụng', 4)
ON CONFLICT (slug) DO NOTHING;

-- Add category_id column to news table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE news ADD COLUMN category_id UUID REFERENCES news_categories(id) ON DELETE SET NULL;
    CREATE INDEX idx_news_category_id ON news(category_id);
    
    -- Migrate existing category values to category_id
    UPDATE news n
    SET category_id = (
      SELECT id FROM news_categories 
      WHERE slug = CASE 
        WHEN n.category = 'tin-thi-truong' THEN 'tin-thi-truong'
        WHEN n.category = 'quy-hoach-chinh-sach' THEN 'quy-hoach-chinh-sach'
        WHEN n.category = 'tu-van-hoi-dap' THEN 'tu-van-hoi-dap'
        WHEN n.category = 'tuyen-dung' THEN 'tuyen-dung'
        ELSE NULL
      END
    )
    WHERE n.category IS NOT NULL;
  END IF;
END $$;

-- Add SEO fields to news table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news' AND column_name = 'meta_title'
  ) THEN
    ALTER TABLE news ADD COLUMN meta_title VARCHAR(255);
    ALTER TABLE news ADD COLUMN meta_description TEXT;
    ALTER TABLE news ADD COLUMN meta_keywords TEXT;
  END IF;
END $$;


