-- Seed Data for Products Table
-- Sample data for development and testing
-- Date: 2025-01-28

BEGIN;

-- Helper function to generate slug (if not exists)
CREATE OR REPLACE FUNCTION generate_slug(text TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
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
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  result := regexp_replace(result, '^-+|-+$', '', 'g');
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert products data
INSERT INTO products (
  code,
  name,
  slug,
  scope,
  has_rental,
  has_transfer,
  has_factory,
  province,
  district,
  ward,
  address,
  latitude,
  longitude,
  google_maps_link,
  total_area,
  available_area,
  occupancy_rate,
  rental_price_min,
  rental_price_max,
  transfer_price_min,
  transfer_price_max,
  land_price,
  infrastructure,
  description,
  description_full,
  advantages,
  thumbnail_url,
  video_url,
  contact_name,
  contact_phone,
  contact_email,
  website_url,
  meta_title,
  meta_description,
  meta_keywords,
  product_types,
  transaction_types,
  location_types,
  allowed_industries,
  images,
  documents,
  tenants,
  published_at
) VALUES

-- 1. KCN Tân Bình - Đất + Nhà xưởng, Cho thuê + Chuyển nhượng
(
  'PRD-001',
  'KCN Tân Bình',
  generate_slug('KCN Tân Bình'),
  'trong-kcn',
  true,
  true,
  true,
  'Hồ Chí Minh',
  'Tân Bình',
  'Phường Tây Thạnh',
  'Khu công nghiệp Tân Bình, Phường Tây Thạnh, Quận Tân Bình, TP. Hồ Chí Minh',
  10.762622,
  106.660172,
  'https://maps.google.com/?q=10.762622,106.660172',
  500.00, -- 500 ha
  150.00, -- 150 ha còn trống
  70.00, -- 70% lấp đầy
  50000, -- 50,000 đ/m²/tháng
  100000, -- 100,000 đ/m²/tháng
  4500000, -- 4.5 tỷ VND
  5000000, -- 5 tỷ VND
  50000000, -- 50 triệu đ/m²
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  'KCN hiện đại, hạ tầng hoàn chỉnh, gần cảng biển',
  'Khu công nghiệp Tân Bình là một trong những KCN hiện đại nhất tại TP. Hồ Chí Minh. Với vị trí chiến lược gần cảng biển và hệ thống hạ tầng hoàn chỉnh, KCN Tân Bình là lựa chọn lý tưởng cho các doanh nghiệp hoạt động trong lĩnh vực sản xuất, logistics và xuất khẩu. KCN có đầy đủ hạ tầng điện, nước, xử lý nước thải, internet tốc độ cao, đường giao thông rộng rãi và hệ thống an ninh 24/7.',
  'Vị trí đắc địa, hạ tầng hoàn chỉnh, giá cả hợp lý, hỗ trợ pháp lý, gần cảng biển',
  'https://example.com/images/kcn-tan-binh-thumbnail.jpg',
  'https://example.com/videos/kcn-tan-binh-intro.mp4',
  'Nguyễn Văn A',
  '0901234567',
  'contact@kcn-tan-binh.com',
  'https://kcn-tan-binh.com',
  'KCN Tân Bình - Cho Thuê Đất, Nhà Xưởng, Chuyển Nhượng',
  'KCN Tân Bình với diện tích 500ha, hạ tầng hoàn chỉnh, giá cả hợp lý. Cho thuê đất từ 50,000 - 100,000 đ/m²/tháng, chuyển nhượng từ 4.5 - 5 tỷ VND.',
  'khu công nghiệp, cho thuê đất, nhà xưởng, chuyển nhượng, quận tân bình, hồ chí minh',
  ARRAY['dat', 'nha-xuong', 'dat-co-nha-xuong']::TEXT[],
  ARRAY['cho-thue', 'chuyen-nhuong']::TEXT[],
  ARRAY['trong-kcn']::TEXT[],
  ARRAY['co-khi', 'dien-tu', 'thuc-pham', 'hoa-chat', 'det-may', 'logistics']::TEXT[],
  '[
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "url": "https://example.com/images/kcn-tan-binh-1.jpg",
      "caption": "Cổng chính KCN Tân Bình",
      "display_order": 0,
      "is_primary": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "url": "https://example.com/images/kcn-tan-binh-2.jpg",
      "caption": "Hạ tầng đường giao thông",
      "display_order": 1,
      "is_primary": false
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "url": "https://example.com/images/kcn-tan-binh-3.jpg",
      "caption": "Nhà xưởng mẫu",
      "display_order": 2,
      "is_primary": false
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "url": "https://example.com/images/kcn-tan-binh-4.jpg",
      "caption": "Hệ thống xử lý nước thải",
      "display_order": 3,
      "is_primary": false
    }
  ]'::jsonb,
  '[
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Giấy phép hoạt động KCN",
      "file_url": "https://example.com/documents/kcn-tan-binh-giay-phep.pdf",
      "file_type": "PDF",
      "file_size": 2048000,
      "category": "phap-ly",
      "display_order": 0,
      "is_public": true
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Quy hoạch chi tiết KCN",
      "file_url": "https://example.com/documents/kcn-tan-binh-quy-hoach.pdf",
      "file_type": "PDF",
      "file_size": 5120000,
      "category": "quy-hoach",
      "display_order": 1,
      "is_public": true
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "title": "Thuyết minh dự án",
      "file_url": "https://example.com/documents/kcn-tan-binh-thuyet-minh.pdf",
      "file_type": "PDF",
      "file_size": 1024000,
      "category": "thuyet-minh",
      "display_order": 2,
      "is_public": true
    }
  ]'::jsonb,
  '[
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "company_name": "Công ty Cơ Khí XYZ",
      "industry": "co-khi",
      "logo_url": "https://example.com/logos/xyz-logo.png",
      "website": "https://xyz-company.com",
      "contact_email": "info@xyz-company.com",
      "contact_phone": "0901111111"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "company_name": "Công ty Điện Tử ABC",
      "industry": "dien-tu",
      "logo_url": "https://example.com/logos/abc-logo.png",
      "website": "https://abc-electronics.com",
      "contact_email": "contact@abc-electronics.com",
      "contact_phone": "0902222222"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "company_name": "Công ty Thực Phẩm DEF",
      "industry": "thuc-pham",
      "logo_url": "https://example.com/logos/def-logo.png",
      "website": "https://def-food.com",
      "contact_email": "info@def-food.com",
      "contact_phone": "0903333333"
    }
  ]'::jsonb,
  CURRENT_TIMESTAMP
),

-- 2. KCN Long Thành - Đất, Chuyển nhượng
(
  'PRD-002',
  'KCN Long Thành',
  generate_slug('KCN Long Thành'),
  'trong-kcn',
  false,
  true,
  false,
  'Đồng Nai',
  'Long Thành',
  'Xã Long An',
  'Khu công nghiệp Long Thành, Xã Long An, Huyện Long Thành, Đồng Nai',
  10.7769,
  106.7009,
  'https://maps.google.com/?q=10.7769,106.7009',
  800.00, -- 800 ha
  250.00, -- 250 ha còn trống
  68.75, -- 68.75% lấp đầy
  NULL, -- Không cho thuê
  NULL,
  4200000, -- 4.2 tỷ VND
  4700000, -- 4.7 tỷ VND
  42000000, -- 42 triệu đ/m²
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  'KCN quy mô lớn, gần sân bay Long Thành',
  'Khu công nghiệp Long Thành là KCN quy mô lớn với diện tích 800ha, nằm gần sân bay quốc tế Long Thành. Với vị trí đắc địa và hạ tầng giao thông thuận lợi, KCN Long Thành là điểm đến lý tưởng cho các doanh nghiệp cần tiếp cận sân bay và cảng biển.',
  'Gần sân bay, quy mô lớn, hạ tầng hiện đại, giá cả hợp lý',
  'https://example.com/images/kcn-long-thanh-thumbnail.jpg',
  NULL,
  'Trần Thị B',
  '0902345678',
  'contact@kcn-long-thanh.com',
  'https://kcn-long-thanh.com',
  'KCN Long Thành - Chuyển Nhượng Đất Trong KCN',
  'KCN Long Thành - KCN quy mô lớn, gần sân bay Long Thành. Giá chuyển nhượng từ 4.2 - 4.7 tỷ VND.',
  'khu công nghiệp, chuyển nhượng đất, long thành, đồng nai, gần sân bay',
  ARRAY['dat']::TEXT[],
  ARRAY['chuyen-nhuong']::TEXT[],
  ARRAY['trong-kcn']::TEXT[],
  ARRAY['co-khi', 'dien-tu', 'o-to', 'logistics', 'hang-khong']::TEXT[],
  '[
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "url": "https://example.com/images/kcn-long-thanh-1.jpg",
      "caption": "Tổng quan KCN Long Thành",
      "display_order": 0,
      "is_primary": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "url": "https://example.com/images/kcn-long-thanh-2.jpg",
      "caption": "Vị trí gần sân bay",
      "display_order": 1,
      "is_primary": false
    }
  ]'::jsonb,
  '[
    {
      "id": "660e8400-e29b-41d4-a716-446655440010",
      "title": "Giấy phép hoạt động",
      "file_url": "https://example.com/documents/kcn-long-thanh-giay-phep.pdf",
      "file_type": "PDF",
      "file_size": 2048000,
      "category": "phap-ly",
      "display_order": 0,
      "is_public": true
    }
  ]'::jsonb,
  '[
    {
      "id": "770e8400-e29b-41d4-a716-446655440010",
      "company_name": "Công ty Ô tô GHI",
      "industry": "o-to",
      "logo_url": "https://example.com/logos/ghi-logo.png",
      "website": "https://ghi-auto.com",
      "contact_email": "info@ghi-auto.com",
      "contact_phone": "0904444444"
    }
  ]'::jsonb,
  CURRENT_TIMESTAMP
),

-- 3. KCN Hiệp Phước - Đất + Nhà xưởng, Cho thuê
(
  'PRD-003',
  'KCN Hiệp Phước',
  generate_slug('KCN Hiệp Phước'),
  'trong-kcn',
  true,
  false,
  true,
  'Hồ Chí Minh',
  'Nhà Bè',
  'Xã Hiệp Phước',
  'Khu công nghiệp Hiệp Phước, Xã Hiệp Phước, Huyện Nhà Bè, TP. Hồ Chí Minh',
  10.6833,
  106.7500,
  'https://maps.google.com/?q=10.6833,106.7500',
  400.00, -- 400 ha
  120.00, -- 120 ha còn trống
  70.00, -- 70% lấp đầy
  60000, -- 60,000 đ/m²/tháng
  120000, -- 120,000 đ/m²/tháng
  NULL, -- Không chuyển nhượng
  NULL,
  NULL,
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  'KCN sát cảng Hiệp Phước, logistics thuận lợi',
  'Khu công nghiệp Hiệp Phước nằm sát cảng Hiệp Phước, tạo điều kiện thuận lợi tối đa cho hoạt động logistics và xuất nhập khẩu. Với hệ thống hạ tầng hoàn chỉnh và vị trí chiến lược, KCN Hiệp Phước là lựa chọn hàng đầu cho các doanh nghiệp hoạt động trong lĩnh vực logistics.',
  'Sát cảng, logistics thuận lợi, hạ tầng hoàn chỉnh',
  'https://example.com/images/kcn-hiep-phuoc-thumbnail.jpg',
  NULL,
  'Lê Văn C',
  '0903456789',
  'contact@kcn-hiep-phuoc.com',
  'https://kcn-hiep-phuoc.com',
  'KCN Hiệp Phước - Cho Thuê Đất, Nhà Xưởng',
  'KCN Hiệp Phước - KCN sát cảng Hiệp Phước, logistics thuận lợi. Cho thuê đất từ 60,000 - 120,000 đ/m²/tháng.',
  'khu công nghiệp, cho thuê đất, nhà xưởng, hiệp phước, nhà bè, gần cảng',
  ARRAY['dat', 'nha-xuong']::TEXT[],
  ARRAY['cho-thue']::TEXT[],
  ARRAY['trong-kcn']::TEXT[],
  ARRAY['logistics', 'kho-bai', 'xuat-nhap-khau', 'co-khi']::TEXT[],
  '[
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "url": "https://example.com/images/kcn-hiep-phuoc-1.jpg",
      "caption": "KCN Hiệp Phước nhìn từ trên cao",
      "display_order": 0,
      "is_primary": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440021",
      "url": "https://example.com/images/kcn-hiep-phuoc-2.jpg",
      "caption": "Cảng Hiệp Phước",
      "display_order": 1,
      "is_primary": false
    }
  ]'::jsonb,
  '[]'::jsonb,
  '[
    {
      "id": "770e8400-e29b-41d4-a716-446655440020",
      "company_name": "Công ty Logistics JKL",
      "industry": "logistics",
      "logo_url": "https://example.com/logos/jkl-logo.png",
      "website": "https://jkl-logistics.com",
      "contact_email": "info@jkl-logistics.com",
      "contact_phone": "0905555555"
    }
  ]'::jsonb,
  CURRENT_TIMESTAMP
),

-- 4. Cụm công nghiệp Bình Minh - Đất, Chuyển nhượng
(
  'PRD-004',
  'Cụm công nghiệp Bình Minh',
  generate_slug('Cụm công nghiệp Bình Minh'),
  'trong-kcn',
  false,
  true,
  false,
  'Bình Dương',
  'Dầu Tiếng',
  'Xã Bình Minh',
  'Cụm công nghiệp Bình Minh, Xã Bình Minh, Huyện Dầu Tiếng, Bình Dương',
  11.2667,
  106.3667,
  'https://maps.google.com/?q=11.2667,106.3667',
  200.00, -- 200 ha
  80.00, -- 80 ha còn trống
  60.00, -- 60% lấp đầy
  NULL,
  NULL,
  2800000, -- 2.8 tỷ VND
  3200000, -- 3.2 tỷ VND
  28000000, -- 28 triệu đ/m²
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  'Cụm công nghiệp quy mô vừa, hạ tầng đầy đủ, giá thuê hợp lý',
  'Cụm công nghiệp Bình Minh là cụm công nghiệp quy mô vừa với hạ tầng đầy đủ và giá cả hợp lý. Phù hợp cho các doanh nghiệp vừa và nhỏ cần không gian sản xuất với chi phí hợp lý.',
  'Giá cả hợp lý, hạ tầng đầy đủ, phù hợp doanh nghiệp vừa và nhỏ',
  'https://example.com/images/ccn-binh-minh-thumbnail.jpg',
  NULL,
  'Phạm Thị D',
  '0904567890',
  'contact@ccn-binh-minh.com',
  'https://ccn-binh-minh.com',
  'Cụm công nghiệp Bình Minh - Chuyển Nhượng Đất',
  'Cụm công nghiệp Bình Minh - Cụm công nghiệp quy mô vừa, hạ tầng đầy đủ, giá thuê hợp lý. Giá chuyển nhượng từ 2.8 - 3.2 tỷ VND.',
  'cụm công nghiệp, chuyển nhượng đất, bình minh, dầu tiếng, bình dương',
  ARRAY['dat']::TEXT[],
  ARRAY['chuyen-nhuong']::TEXT[],
  ARRAY['trong-kcn']::TEXT[],
  ARRAY['co-khi', 'thuc-pham', 'bao-bi', 'noi-that']::TEXT[],
  '[
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "url": "https://example.com/images/ccn-binh-minh-1.jpg",
      "caption": "Cụm công nghiệp Bình Minh",
      "display_order": 0,
      "is_primary": true
    }
  ]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  CURRENT_TIMESTAMP
),

-- 5. KCN Hải Long - Đất + Nhà xưởng, Cho thuê + Chuyển nhượng
(
  'PRD-005',
  'KCN Hải Long',
  generate_slug('KCN Hải Long'),
  'trong-kcn',
  true,
  true,
  true,
  'Hải Phòng',
  'Thủy Nguyên',
  'Xã Hải Long',
  'Khu công nghiệp Hải Long, Xã Hải Long, Huyện Thủy Nguyên, Hải Phòng',
  20.8167,
  106.7333,
  'https://maps.google.com/?q=20.8167,106.7333',
  350.00, -- 350 ha
  100.00, -- 100 ha còn trống
  71.43, -- 71.43% lấp đầy
  45000, -- 45,000 đ/m²/tháng
  90000, -- 90,000 đ/m²/tháng
  3500000, -- 3.5 tỷ VND
  4000000, -- 4 tỷ VND
  35000000, -- 35 triệu đ/m²
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  'KCN gần cảng biển, logistics thuận lợi, phù hợp xuất khẩu',
  'Khu công nghiệp Hải Long nằm gần cảng biển Hải Phòng, tạo điều kiện thuận lợi cho hoạt động logistics và xuất khẩu. Với hệ thống hạ tầng hiện đại và vị trí chiến lược, KCN Hải Long là lựa chọn lý tưởng cho các doanh nghiệp hoạt động trong lĩnh vực xuất khẩu.',
  'Gần cảng biển, logistics thuận lợi, phù hợp xuất khẩu, hạ tầng hiện đại',
  'https://example.com/images/kcn-hai-long-thumbnail.jpg',
  NULL,
  'Hoàng Văn E',
  '0905678901',
  'contact@kcn-hai-long.com',
  'https://kcn-hai-long.com',
  'KCN Hải Long - Cho Thuê Đất, Nhà Xưởng, Chuyển Nhượng',
  'KCN Hải Long - KCN gần cảng biển, logistics thuận lợi, phù hợp xuất khẩu. Cho thuê từ 45,000 - 90,000 đ/m²/tháng, chuyển nhượng từ 3.5 - 4 tỷ VND.',
  'khu công nghiệp, cho thuê đất, nhà xưởng, chuyển nhượng, hải long, hải phòng, gần cảng',
  ARRAY['dat', 'nha-xuong', 'dat-co-nha-xuong']::TEXT[],
  ARRAY['cho-thue', 'chuyen-nhuong']::TEXT[],
  ARRAY['trong-kcn']::TEXT[],
  ARRAY['logistics', 'xuat-nhap-khau', 'co-khi', 'thuc-pham']::TEXT[],
  '[
    {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "url": "https://example.com/images/kcn-hai-long-1.jpg",
      "caption": "KCN Hải Long",
      "display_order": 0,
      "is_primary": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440041",
      "url": "https://example.com/images/kcn-hai-long-2.jpg",
      "caption": "Gần cảng biển Hải Phòng",
      "display_order": 1,
      "is_primary": false
    }
  ]'::jsonb,
  '[
    {
      "id": "660e8400-e29b-41d4-a716-446655440040",
      "title": "Giấy phép hoạt động",
      "file_url": "https://example.com/documents/kcn-hai-long-giay-phep.pdf",
      "file_type": "PDF",
      "file_size": 2048000,
      "category": "phap-ly",
      "display_order": 0,
      "is_public": true
    }
  ]'::jsonb,
  '[
    {
      "id": "770e8400-e29b-41d4-a716-446655440040",
      "company_name": "Công ty Xuất Nhập Khẩu MNO",
      "industry": "xuat-nhap-khau",
      "logo_url": "https://example.com/logos/mno-logo.png",
      "website": "https://mno-export.com",
      "contact_email": "info@mno-export.com",
      "contact_phone": "0906666666"
    }
  ]'::jsonb,
  CURRENT_TIMESTAMP
),

-- 6. KCN số 3 Hưng Yên - Đất, Chuyển nhượng
(
  'PRD-006',
  'KCN số 3 Hưng Yên',
  generate_slug('KCN số 3 Hưng Yên'),
  'trong-kcn',
  false,
  true,
  false,
  'Hưng Yên',
  'Yên Mỹ',
  'Xã Yên Mỹ',
  'Khu công nghiệp số 3 Hưng Yên, Xã Yên Mỹ, Huyện Yên Mỹ, Hưng Yên',
  20.9167,
  106.0167,
  'https://maps.google.com/?q=20.9167,106.0167',
  300.00, -- 300 ha
  90.00, -- 90 ha còn trống
  70.00, -- 70% lấp đầy
  NULL,
  NULL,
  3200000, -- 3.2 tỷ VND
  3700000, -- 3.7 tỷ VND
  32000000, -- 32 triệu đ/m²
  '{"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true}'::jsonb,
  'KCN phù hợp ngành thực phẩm, nông sản, may mặc',
  'Khu công nghiệp số 3 Hưng Yên được thiết kế đặc biệt phù hợp cho các ngành công nghiệp thực phẩm, nông sản và may mặc. Với hệ thống hạ tầng chuyên biệt và vị trí gần các vùng nguyên liệu, KCN số 3 Hưng Yên là lựa chọn lý tưởng cho các doanh nghiệp trong các ngành này.',
  'Phù hợp ngành thực phẩm, nông sản, may mặc, gần vùng nguyên liệu',
  'https://example.com/images/kcn-hung-yen-thumbnail.jpg',
  NULL,
  'Vũ Thị F',
  '0906789012',
  'contact@kcn-hung-yen.com',
  'https://kcn-hung-yen.com',
  'KCN số 3 Hưng Yên - Chuyển Nhượng Đất',
  'KCN số 3 Hưng Yên - KCN phù hợp ngành thực phẩm, nông sản, may mặc. Giá chuyển nhượng từ 3.2 - 3.7 tỷ VND.',
  'khu công nghiệp, chuyển nhượng đất, hưng yên, yên mỹ, thực phẩm, nông sản',
  ARRAY['dat']::TEXT[],
  ARRAY['chuyen-nhuong']::TEXT[],
  ARRAY['trong-kcn']::TEXT[],
  ARRAY['thuc-pham', 'nong-san', 'may-mac', 'bao-bi']::TEXT[],
  '[
    {
      "id": "550e8400-e29b-41d4-a716-446655440050",
      "url": "https://example.com/images/kcn-hung-yen-1.jpg",
      "caption": "KCN số 3 Hưng Yên",
      "display_order": 0,
      "is_primary": true
    }
  ]'::jsonb,
  '[]'::jsonb,
  '[
    {
      "id": "770e8400-e29b-41d4-a716-446655440050",
      "company_name": "Công ty Thực Phẩm PQR",
      "industry": "thuc-pham",
      "logo_url": "https://example.com/logos/pqr-logo.png",
      "website": "https://pqr-food.com",
      "contact_email": "info@pqr-food.com",
      "contact_phone": "0907777777"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440051",
      "company_name": "Công ty May Mặc STU",
      "industry": "may-mac",
      "logo_url": "https://example.com/logos/stu-logo.png",
      "website": "https://stu-garment.com",
      "contact_email": "info@stu-garment.com",
      "contact_phone": "0908888888"
    }
  ]'::jsonb,
  CURRENT_TIMESTAMP
)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  description_full = EXCLUDED.description_full,
  updated_at = CURRENT_TIMESTAMP;

-- Clean up helper function
DROP FUNCTION IF EXISTS generate_slug(TEXT);

COMMIT;
















