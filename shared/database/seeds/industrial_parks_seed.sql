-- Seed Data for Industrial Parks (Khu công nghiệp)
-- Data extracted from homepage
-- Date: 2025-01-28

-- Helper function to generate slug (if not exists)
-- Simple slug generation without unaccent extension
CREATE OR REPLACE FUNCTION generate_slug(text TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- Convert to lowercase and replace Vietnamese characters
  result := lower(text);
  result := replace(result, 'á', 'a');
  result := replace(result, 'à', 'a');
  result := replace(result, 'ả', 'a');
  result := replace(result, 'ã', 'a');
  result := replace(result, 'ạ', 'a');
  result := replace(result, 'ă', 'a');
  result := replace(result, 'ắ', 'a');
  result := replace(result, 'ằ', 'a');
  result := replace(result, 'ẳ', 'a');
  result := replace(result, 'ẵ', 'a');
  result := replace(result, 'ặ', 'a');
  result := replace(result, 'â', 'a');
  result := replace(result, 'ấ', 'a');
  result := replace(result, 'ầ', 'a');
  result := replace(result, 'ẩ', 'a');
  result := replace(result, 'ẫ', 'a');
  result := replace(result, 'ậ', 'a');
  result := replace(result, 'é', 'e');
  result := replace(result, 'è', 'e');
  result := replace(result, 'ẻ', 'e');
  result := replace(result, 'ẽ', 'e');
  result := replace(result, 'ẹ', 'e');
  result := replace(result, 'ê', 'e');
  result := replace(result, 'ế', 'e');
  result := replace(result, 'ề', 'e');
  result := replace(result, 'ể', 'e');
  result := replace(result, 'ễ', 'e');
  result := replace(result, 'ệ', 'e');
  result := replace(result, 'í', 'i');
  result := replace(result, 'ì', 'i');
  result := replace(result, 'ỉ', 'i');
  result := replace(result, 'ĩ', 'i');
  result := replace(result, 'ị', 'i');
  result := replace(result, 'ó', 'o');
  result := replace(result, 'ò', 'o');
  result := replace(result, 'ỏ', 'o');
  result := replace(result, 'õ', 'o');
  result := replace(result, 'ọ', 'o');
  result := replace(result, 'ô', 'o');
  result := replace(result, 'ố', 'o');
  result := replace(result, 'ồ', 'o');
  result := replace(result, 'ổ', 'o');
  result := replace(result, 'ỗ', 'o');
  result := replace(result, 'ộ', 'o');
  result := replace(result, 'ơ', 'o');
  result := replace(result, 'ớ', 'o');
  result := replace(result, 'ờ', 'o');
  result := replace(result, 'ở', 'o');
  result := replace(result, 'ỡ', 'o');
  result := replace(result, 'ợ', 'o');
  result := replace(result, 'ú', 'u');
  result := replace(result, 'ù', 'u');
  result := replace(result, 'ủ', 'u');
  result := replace(result, 'ũ', 'u');
  result := replace(result, 'ụ', 'u');
  result := replace(result, 'ư', 'u');
  result := replace(result, 'ứ', 'u');
  result := replace(result, 'ừ', 'u');
  result := replace(result, 'ử', 'u');
  result := replace(result, 'ữ', 'u');
  result := replace(result, 'ự', 'u');
  result := replace(result, 'ý', 'y');
  result := replace(result, 'ỳ', 'y');
  result := replace(result, 'ỷ', 'y');
  result := replace(result, 'ỹ', 'y');
  result := replace(result, 'ỵ', 'y');
  result := replace(result, 'đ', 'd');
  
  -- Replace non-alphanumeric with dash
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  -- Remove leading/trailing dashes
  result := regexp_replace(result, '^-+|-+$', '', 'g');
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert industrial parks data
INSERT INTO industrial_parks (
  code,
  name,
  slug,
  scope,
  has_rental,
  has_transfer,
  province,
  district,
  address,
  total_area,
  available_area,
  transfer_price_min,
  transfer_price_max,
  infrastructure,
  allowed_industries,
  description,
  description_full,
  thumbnail_url,
  meta_title,
  meta_description,
  published_at
) VALUES
-- 1. KCN Tân Bình
(
  'INL-KCN-001',
  'KCN Tân Bình',
  generate_slug('KCN Tân Bình'),
  'trong-kcn',
  false,
  true,
  '79', -- TP.HCM
  'Tân Bình',
  'Khu công nghiệp Tân Bình, TP. Hồ Chí Minh',
  500.00, -- ha
  150.00, -- ha (estimated available)
  4500000, -- VND/m² (187.50 USD/m² * 24000 VND/USD)
  5000000, -- VND/m²
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  ARRAY['co-khi', 'dien-tu', 'bao-bi', 'logistics'],
  'KCN hiện đại, hạ tầng hoàn chỉnh, gần cảng biển',
  'Khu công nghiệp Tân Bình là một trong những KCN hiện đại nhất tại TP. Hồ Chí Minh. Với vị trí chiến lược gần cảng biển và hệ thống hạ tầng hoàn chỉnh, KCN Tân Bình là lựa chọn lý tưởng cho các doanh nghiệp hoạt động trong lĩnh vực sản xuất, logistics và xuất khẩu.',
  NULL, -- thumbnail_url (có thể thêm sau)
  'KCN Tân Bình - Chuyển nhượng đất trong KCN',
  'KCN Tân Bình - Khu công nghiệp hiện đại, hạ tầng hoàn chỉnh, gần cảng biển. Giá chuyển nhượng từ 4.5 - 5 triệu VND/m².',
  CURRENT_TIMESTAMP
),

-- 2. KCN Long Thành
(
  'INL-KCN-002',
  'KCN Long Thành',
  generate_slug('KCN Long Thành'),
  'trong-kcn',
  false,
  true,
  '75', -- Đồng Nai
  'Long Thành',
  'Khu công nghiệp Long Thành, Đồng Nai',
  800.00, -- ha
  250.00, -- ha
  4200000, -- VND/m² (175.00 USD/m² * 24000)
  4700000, -- VND/m²
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  ARRAY['co-khi', 'dien-tu', 'o-to', 'logistics', 'hang-khong'],
  'KCN quy mô lớn, gần sân bay Long Thành',
  'Khu công nghiệp Long Thành là KCN quy mô lớn với diện tích 800ha, nằm gần sân bay quốc tế Long Thành. Với vị trí đắc địa và hạ tầng giao thông thuận lợi, KCN Long Thành là điểm đến lý tưởng cho các doanh nghiệp cần tiếp cận sân bay và cảng biển.',
  NULL,
  'KCN Long Thành - Chuyển nhượng đất trong KCN',
  'KCN Long Thành - KCN quy mô lớn, gần sân bay Long Thành. Giá chuyển nhượng từ 4.2 - 4.7 triệu VND/m².',
  CURRENT_TIMESTAMP
),

-- 3. KCN Hiệp Phước
(
  'INL-KCN-003',
  'KCN Hiệp Phước',
  generate_slug('KCN Hiệp Phước'),
  'trong-kcn',
  false,
  true,
  '79', -- TP.HCM
  'Nhà Bè',
  'Khu công nghiệp Hiệp Phước, Nhà Bè, TP. Hồ Chí Minh',
  400.00, -- ha
  120.00, -- ha
  4800000, -- VND/m² (200.00 USD/m² * 24000)
  5300000, -- VND/m²
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  ARRAY['logistics', 'kho-bai', 'xuat-nhap-khau', 'co-khi'],
  'KCN sát cảng Hiệp Phước, logistics thuận lợi',
  'Khu công nghiệp Hiệp Phước nằm sát cảng Hiệp Phước, tạo điều kiện thuận lợi tối đa cho hoạt động logistics và xuất nhập khẩu. Với hệ thống hạ tầng hoàn chỉnh và vị trí chiến lược, KCN Hiệp Phước là lựa chọn hàng đầu cho các doanh nghiệp hoạt động trong lĩnh vực logistics.',
  NULL,
  'KCN Hiệp Phước - Chuyển nhượng đất trong KCN',
  'KCN Hiệp Phước - KCN sát cảng Hiệp Phước, logistics thuận lợi. Giá chuyển nhượng từ 4.8 - 5.3 triệu VND/m².',
  CURRENT_TIMESTAMP
),

-- 4. Cụm công nghiệp Bình Minh
(
  'INL-KCN-004',
  'Cụm công nghiệp Bình Minh',
  generate_slug('Cụm công nghiệp Bình Minh'),
  'trong-kcn',
  false,
  true,
  '74', -- Bình Dương
  'Dầu Tiếng',
  'Cụm công nghiệp Bình Minh, Dầu Tiếng, Bình Dương',
  200.00, -- ha
  80.00, -- ha
  2800000, -- VND/m² (116.67 USD/m² * 24000)
  3200000, -- VND/m²
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  ARRAY['co-khi', 'thuc-pham', 'bao-bi', 'noi-that'],
  'Cụm công nghiệp quy mô vừa, hạ tầng đầy đủ, giá thuê hợp lý',
  'Cụm công nghiệp Bình Minh là cụm công nghiệp quy mô vừa với hạ tầng đầy đủ và giá cả hợp lý. Phù hợp cho các doanh nghiệp vừa và nhỏ cần không gian sản xuất với chi phí hợp lý.',
  NULL,
  'Cụm công nghiệp Bình Minh - Chuyển nhượng đất trong KCN',
  'Cụm công nghiệp Bình Minh - Cụm công nghiệp quy mô vừa, hạ tầng đầy đủ, giá thuê hợp lý. Giá chuyển nhượng từ 2.8 - 3.2 triệu VND/m².',
  CURRENT_TIMESTAMP
),

-- 5. Khu công nghiệp Hải Long
(
  'INL-KCN-005',
  'Khu công nghiệp Hải Long',
  generate_slug('Khu công nghiệp Hải Long'),
  'trong-kcn',
  false,
  true,
  '31', -- Hải Phòng
  'Thủy Nguyên',
  'Khu công nghiệp Hải Long, Thủy Nguyên, Hải Phòng',
  350.00, -- ha
  100.00, -- ha
  3500000, -- VND/m² (145.83 USD/m² * 24000)
  4000000, -- VND/m²
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  ARRAY['logistics', 'xuat-nhap-khau', 'co-khi', 'thuc-pham'],
  'KCN gần cảng biển, logistics thuận lợi, phù hợp xuất khẩu',
  'Khu công nghiệp Hải Long nằm gần cảng biển Hải Phòng, tạo điều kiện thuận lợi cho hoạt động logistics và xuất khẩu. Với hệ thống hạ tầng hiện đại và vị trí chiến lược, KCN Hải Long là lựa chọn lý tưởng cho các doanh nghiệp hoạt động trong lĩnh vực xuất khẩu.',
  NULL,
  'Khu công nghiệp Hải Long - Chuyển nhượng đất trong KCN',
  'Khu công nghiệp Hải Long - KCN gần cảng biển, logistics thuận lợi, phù hợp xuất khẩu. Giá chuyển nhượng từ 3.5 - 4 triệu VND/m².',
  CURRENT_TIMESTAMP
),

-- 6. Khu công nghiệp số 3 Hưng Yên
(
  'INL-KCN-006',
  'Khu công nghiệp số 3 Hưng Yên',
  generate_slug('Khu công nghiệp số 3 Hưng Yên'),
  'trong-kcn',
  false,
  true,
  '33', -- Hưng Yên
  'Yên Mỹ',
  'Khu công nghiệp số 3 Hưng Yên, Yên Mỹ, Hưng Yên',
  300.00, -- ha
  90.00, -- ha
  3200000, -- VND/m² (133.33 USD/m² * 24000)
  3700000, -- VND/m²
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  ARRAY['thuc-pham', 'nong-san', 'may-mac', 'bao-bi'],
  'KCN phù hợp ngành thực phẩm, nông sản, may mặc',
  'Khu công nghiệp số 3 Hưng Yên được thiết kế đặc biệt phù hợp cho các ngành công nghiệp thực phẩm, nông sản và may mặc. Với hệ thống hạ tầng chuyên biệt và vị trí gần các vùng nguyên liệu, KCN số 3 Hưng Yên là lựa chọn lý tưởng cho các doanh nghiệp trong các ngành này.',
  NULL,
  'Khu công nghiệp số 3 Hưng Yên - Chuyển nhượng đất trong KCN',
  'Khu công nghiệp số 3 Hưng Yên - KCN phù hợp ngành thực phẩm, nông sản, may mặc. Giá chuyển nhượng từ 3.2 - 3.7 triệu VND/m².',
  CURRENT_TIMESTAMP
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  description_full = EXCLUDED.description_full,
  transfer_price_min = EXCLUDED.transfer_price_min,
  transfer_price_max = EXCLUDED.transfer_price_max,
  updated_at = CURRENT_TIMESTAMP;

-- Clean up helper function
DROP FUNCTION IF EXISTS generate_slug(TEXT);

