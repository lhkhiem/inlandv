-- Seed Data for Properties (Bất động sản)
-- Data extracted from homepage
-- Date: 2025-01-28

-- Helper function to generate slug (if not exists)
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

-- Insert properties data
INSERT INTO properties (
  code,
  name,
  slug,
  type,
  province,
  district,
  address,
  area,
  bedrooms,
  bathrooms,
  floors,
  has_transfer,
  sale_price,
  sale_price_per_sqm,
  description,
  description_full,
  status,
  published_at,
  meta_title,
  meta_description
) VALUES
-- 1. Shophouse The Manor
(
  'INL-BDS-001',
  'Shophouse The Manor',
  generate_slug('Shophouse The Manor'),
  'shophouse',
  '79', -- TP.HCM
  'Bình Thạnh',
  'Shophouse The Manor, Bình Thạnh, TP. Hồ Chí Minh',
  180.00,
  3,
  3,
  4, -- 1 trệt 3 lầu
  true,
  8500000000, -- 8.5 tỷ VND
  47000000, -- 47 triệu/m²
  'Shophouse 1 trệt 3 lầu, kinh doanh tốt',
  'Shophouse The Manor là một trong những shophouse cao cấp tại Bình Thạnh. Với thiết kế 1 trệt 3 lầu, không gian rộng rãi 180m², phù hợp cho cả mục đích ở và kinh doanh. Vị trí đắc địa, giao thông thuận tiện, là lựa chọn lý tưởng cho các gia đình muốn kết hợp ở và kinh doanh.',
  'available',
  CURRENT_TIMESTAMP,
  'Shophouse The Manor - Bình Thạnh - 8.5 tỷ',
  'Shophouse The Manor tại Bình Thạnh, TP.HCM. 1 trệt 3 lầu, 180m², 3 PN, 3 WC. Giá 8.5 tỷ (47 triệu/m²). Phù hợp ở và kinh doanh.'
),

-- 2. Đất nền Bình Chánh
(
  'INL-BDS-002',
  'Đất nền Bình Chánh',
  generate_slug('Đất nền Bình Chánh'),
  'dat-nen',
  '79', -- TP.HCM
  'Bình Chánh',
  'Đất nền Bình Chánh, TP. Hồ Chí Minh',
  150.00,
  NULL,
  NULL,
  NULL,
  true,
  3000000000, -- 3.0 tỷ VND
  20000000, -- 20 triệu/m²
  'Đất nền mặt tiền đường lớn, vị trí đẹp',
  'Đất nền Bình Chánh với diện tích 150m², mặt tiền đường lớn, vị trí đẹp và thuận tiện. Phù hợp để xây dựng nhà ở hoặc đầu tư. Khu vực đang phát triển mạnh với nhiều tiện ích xung quanh.',
  'available',
  CURRENT_TIMESTAMP,
  'Đất nền Bình Chánh - 3.0 tỷ',
  'Đất nền Bình Chánh, TP.HCM. Diện tích 150m², mặt tiền đường lớn. Giá 3.0 tỷ (20 triệu/m²). Vị trí đẹp, phù hợp xây dựng nhà ở.'
),

-- 3. Nhà xưởng KCN Tân Bình
(
  'INL-BDS-003',
  'Nhà xưởng KCN Tân Bình',
  generate_slug('Nhà xưởng KCN Tân Bình'),
  'nha-xuong',
  '79', -- TP.HCM
  'Tân Bình',
  'Nhà xưởng KCN Tân Bình, Tân Bình, TP. Hồ Chí Minh',
  500.00,
  NULL,
  NULL,
  NULL,
  true,
  8000000000, -- 8.0 tỷ VND
  16000000, -- 16 triệu/m²
  'Nhà xưởng khu công nghiệp, hạ tầng hoàn chỉnh',
  'Nhà xưởng trong KCN Tân Bình với diện tích 500m², hạ tầng hoàn chỉnh. Phù hợp cho các doanh nghiệp sản xuất, kho bãi, logistics. Vị trí chiến lược gần cảng biển và sân bay, thuận tiện cho hoạt động xuất nhập khẩu.',
  'available',
  CURRENT_TIMESTAMP,
  'Nhà xưởng KCN Tân Bình - 8.0 tỷ',
  'Nhà xưởng KCN Tân Bình, TP.HCM. Diện tích 500m², hạ tầng hoàn chỉnh. Giá 8.0 tỷ (16 triệu/m²). Phù hợp sản xuất, kho bãi, logistics.'
),

-- 4. Biệt thự Phú Mỹ Hưng
(
  'INL-BDS-004',
  'Biệt thự Phú Mỹ Hưng',
  generate_slug('Biệt thự Phú Mỹ Hưng'),
  'biet-thu',
  '79', -- TP.HCM
  'Quận 7',
  'Biệt thự Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh',
  250.00,
  5,
  4,
  3,
  true,
  12500000000, -- 12.5 tỷ VND
  50000000, -- 50 triệu/m²
  'Biệt thự đơn lập, sân vườn rộng, hồ bơi riêng',
  'Biệt thự đơn lập tại Phú Mỹ Hưng với diện tích 250m², 5 phòng ngủ, 4 phòng tắm, 3 tầng. Sân vườn rộng rãi, hồ bơi riêng, thiết kế sang trọng và hiện đại. Khu vực an ninh cao, tiện ích đầy đủ, phù hợp cho gia đình đa thế hệ.',
  'available',
  CURRENT_TIMESTAMP,
  'Biệt thự Phú Mỹ Hưng - Quận 7 - 12.5 tỷ',
  'Biệt thự Phú Mỹ Hưng, Quận 7, TP.HCM. 5 PN, 4 WC, 250m². Giá 12.5 tỷ (50 triệu/m²). Đơn lập, sân vườn rộng, hồ bơi riêng.'
),

-- 5. Căn hộ Skyline Riverside
(
  'INL-BDS-005',
  'Căn hộ Skyline Riverside',
  generate_slug('Căn hộ Skyline Riverside'),
  'can-ho',
  '79', -- TP.HCM
  'Bình Thạnh',
  'Căn hộ Skyline Riverside, Bình Thạnh, TP. Hồ Chí Minh',
  72.00,
  2,
  2,
  NULL, -- Căn hộ không có floors
  true,
  2200000000, -- 2.2 tỷ VND
  31000000, -- 31 triệu/m²
  'Căn hộ 2PN view sông, tiện ích 5 sao, an ninh 24/7',
  'Căn hộ Skyline Riverside với view sông đẹp, 2 phòng ngủ, 2 phòng tắm, diện tích 72m². Tiện ích 5 sao đầy đủ: hồ bơi, gym, spa, khu vui chơi trẻ em. An ninh 24/7, bảo vệ chuyên nghiệp. Vị trí đắc địa tại Bình Thạnh, gần trung tâm thành phố.',
  'available',
  CURRENT_TIMESTAMP,
  'Căn hộ Skyline Riverside - Bình Thạnh - 2.2 tỷ',
  'Căn hộ Skyline Riverside, Bình Thạnh, TP.HCM. 2 PN, 2 WC, 72m², view sông. Giá 2.2 tỷ (31 triệu/m²). Tiện ích 5 sao, an ninh 24/7.'
),

-- 6. Nhà phố cao cấp Quận 7
(
  'INL-BDS-006',
  'Nhà phố cao cấp Quận 7',
  generate_slug('Nhà phố cao cấp Quận 7'),
  'nha-pho',
  '79', -- TP.HCM
  'Quận 7',
  'Nhà phố cao cấp Quận 7, TP. Hồ Chí Minh',
  120.00,
  4,
  3,
  3, -- 1 trệt 2 lầu
  true,
  4800000000, -- 4.8 tỷ VND
  40000000, -- 40 triệu/m²
  'Nhà phố 1 trệt 2 lầu, thiết kế hiện đại, nội thất cao cấp, khu dân cư an ninh',
  'Nhà phố cao cấp tại Quận 7 với thiết kế 1 trệt 2 lầu, 4 phòng ngủ, 3 phòng tắm, diện tích 120m². Thiết kế hiện đại, nội thất cao cấp, không gian sống tiện nghi. Nằm trong khu dân cư an ninh, tiện ích đầy đủ, giao thông thuận tiện.',
  'available',
  CURRENT_TIMESTAMP,
  'Nhà phố cao cấp Quận 7 - 4.8 tỷ',
  'Nhà phố cao cấp Quận 7, TP.HCM. 1 trệt 2 lầu, 4 PN, 3 WC, 120m². Giá 4.8 tỷ (40 triệu/m²). Thiết kế hiện đại, nội thất cao cấp, khu dân cư an ninh.'
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  description_full = EXCLUDED.description_full,
  sale_price = EXCLUDED.sale_price,
  sale_price_per_sqm = EXCLUDED.sale_price_per_sqm,
  updated_at = CURRENT_TIMESTAMP;

-- Clean up helper function
DROP FUNCTION IF EXISTS generate_slug(TEXT);
