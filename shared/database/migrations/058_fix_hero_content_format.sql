-- Migration 058: Fix hero section content format from HTML to JSON
-- Date: 2025-01-28
-- Fixes the hero section content to be proper JSON instead of HTML

DO $$
DECLARE
  page_id_var UUID;
  hero_section_id UUID;
BEGIN
  -- Get page_id
  SELECT id INTO page_id_var FROM pages WHERE slug = 'gioi-thieu';
  
  IF page_id_var IS NULL THEN
    RAISE EXCEPTION 'Page not found';
  END IF;
  
  -- Get hero section id
  SELECT id INTO hero_section_id 
  FROM page_sections 
  WHERE page_id = page_id_var AND section_key = 'hero';
  
  IF hero_section_id IS NULL THEN
    RAISE EXCEPTION 'Hero section not found';
  END IF;
  
  -- Update hero section with proper JSON format
  UPDATE page_sections
  SET 
    content = '{"logo": "/logo-1.png", "description": "Với hơn 15 năm kinh nghiệm trong lĩnh vực bất động sản, chúng tôi tự hào là đối tác đáng tin cậy của hàng nghìn khách hàng trên khắp cả nước. Sự hài lòng của bạn chính là thành công của chúng tôi.", "stats": [{"value": 15, "suffix": "+", "label": "Năm Kinh Nghiệm"}, {"value": 200, "suffix": "+", "label": "Dự Án"}, {"value": 5000, "suffix": "+", "label": "Khách Hàng"}, {"value": 50, "suffix": "+", "label": "Đối Tác"}], "backgroundImage": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=2000&q=80"}',
    images = ARRAY['https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=2000&q=80'],
    updated_at = CURRENT_TIMESTAMP
  WHERE id = hero_section_id;
  
  RAISE NOTICE 'Hero section content updated successfully';
END $$;

















