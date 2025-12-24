-- Seed script: Create About and Services pages with default sections
-- Date: 2025-01-28

-- Insert About page
INSERT INTO pages (id, slug, title, page_type, published, meta_title, meta_description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'about',
  'Giới thiệu',
  'static',
  true,
  'Giới thiệu - Inland Real Estate',
  'Giới thiệu về công ty Inland Real Estate',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Insert Services page
INSERT INTO pages (id, slug, title, page_type, published, meta_title, meta_description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'services',
  'Dịch vụ',
  'static',
  true,
  'Dịch vụ - Inland Real Estate',
  'Các dịch vụ của Inland Real Estate',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Insert sections for About page
DO $$
DECLARE
  about_page_id UUID;
BEGIN
  SELECT id INTO about_page_id FROM pages WHERE slug = 'about';
  
  IF about_page_id IS NOT NULL THEN
    -- Hero section
    INSERT INTO page_sections (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      about_page_id,
      'hero',
      'Hero Section',
      'hero',
      0,
      '<h1>Về Chúng Tôi</h1><p>Giới thiệu về công ty Inland Real Estate</p>',
      ARRAY[]::TEXT[],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (page_id, section_key) DO NOTHING;

    -- Story section
    INSERT INTO page_sections (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      about_page_id,
      'cau-chuyen',
      'Câu chuyện',
      'content',
      1,
      '<h2>Câu Chuyện Của Chúng Tôi</h2><p>Nội dung về câu chuyện thành lập và phát triển công ty...</p>',
      ARRAY[]::TEXT[],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (page_id, section_key) DO NOTHING;

    -- Team section
    INSERT INTO page_sections (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      about_page_id,
      'doi-ngu',
      'Đội ngũ',
      'team',
      2,
      '<h2>Đội Ngũ Của Chúng Tôi</h2><p>Giới thiệu về đội ngũ nhân viên...</p>',
      ARRAY[]::TEXT[],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (page_id, section_key) DO NOTHING;

    -- Values section
    INSERT INTO page_sections (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      about_page_id,
      'gia-tri',
      'Giá trị cốt lõi',
      'content',
      3,
      '<h2>Giá Trị Cốt Lõi</h2><p>Những giá trị mà chúng tôi theo đuổi...</p>',
      ARRAY[]::TEXT[],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (page_id, section_key) DO NOTHING;
  END IF;
END $$;

-- Insert sections for Services page
DO $$
DECLARE
  services_page_id UUID;
BEGIN
  SELECT id INTO services_page_id FROM pages WHERE slug = 'services';
  
  IF services_page_id IS NOT NULL THEN
    -- Hero section
    INSERT INTO page_sections (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      services_page_id,
      'hero',
      'Hero Section',
      'hero',
      0,
      '<h1>Dịch Vụ Của Chúng Tôi</h1><p>Chúng tôi cung cấp các dịch vụ bất động sản chuyên nghiệp</p>',
      ARRAY[]::TEXT[],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (page_id, section_key) DO NOTHING;

    -- Service 1
    INSERT INTO page_sections (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      services_page_id,
      'dich-vu-1',
      'Tư vấn Bất động sản',
      'service',
      1,
      '<h2>Tư vấn Bất động sản</h2><p>Dịch vụ tư vấn chuyên nghiệp về bất động sản...</p>',
      ARRAY[]::TEXT[],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (page_id, section_key) DO NOTHING;

    -- Service 2
    INSERT INTO page_sections (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      services_page_id,
      'dich-vu-2',
      'Quản lý Khu công nghiệp',
      'service',
      2,
      '<h2>Quản lý Khu công nghiệp</h2><p>Dịch vụ quản lý và vận hành khu công nghiệp...</p>',
      ARRAY[]::TEXT[],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (page_id, section_key) DO NOTHING;

    -- Service 3
    INSERT INTO page_sections (id, page_id, section_key, name, section_type, display_order, content, images, published, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      services_page_id,
      'dich-vu-3',
      'Đầu tư Bất động sản',
      'service',
      3,
      '<h2>Đầu tư Bất động sản</h2><p>Dịch vụ tư vấn đầu tư bất động sản...</p>',
      ARRAY[]::TEXT[],
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (page_id, section_key) DO NOTHING;
  END IF;
END $$;


