# Database Schema Documentation
## Schema v2 (Final Design)

## Overview

Database schema v2 cho Inland Real Estate Platform với thiết kế Hybrid Approach:
- Base table (`properties`) chứa thông tin chung
- Extension tables cho từng loại cụ thể
- Industrial Parks là entity độc lập

## Core Tables

### users
Quản lý admin và sales users.

**Columns:**
- `id` (UUID) - Primary key
- `name` (VARCHAR) - User name
- `email` (VARCHAR) - Unique email
- `password_hash` (VARCHAR) - Hashed password
- `role` (VARCHAR) - 'admin' or 'sale'
- `phone` (VARCHAR) - Phone number
- `avatar_url` (TEXT) - Avatar image URL
- `is_active` (BOOLEAN) - Account active status
- `last_login_at` (TIMESTAMP) - Last login time
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Update timestamp

### industrial_parks
Khu công nghiệp độc lập.

**Columns:**
- `id` (UUID) - Primary key
- `code` (VARCHAR) - Unique code (VD: IP-001)
- `name` (VARCHAR) - Tên KCN
- `slug` (VARCHAR) - Unique slug
- `province` (VARCHAR) - Tỉnh/Thành
- `district` (VARCHAR) - Quận/Huyện
- `address` (TEXT) - Địa chỉ
- `latitude` (DECIMAL) - Vĩ độ
- `longitude` (DECIMAL) - Kinh độ
- `google_maps_link` (TEXT) - Link Google Maps (optional)
- `total_area` (NUMERIC) - Tổng diện tích (ha)
- `available_area` (NUMERIC) - Diện tích còn trống (ha)
- `infrastructure_*` (BOOLEAN) - Các hạ tầng (7 loại)
- `rental_price_min` (BIGINT) - Giá thuê tối thiểu
- `rental_price_max` (BIGINT) - Giá thuê tối đa
- `description` (TEXT) - Mô tả
- `description_full` (TEXT) - Mô tả chi tiết
- `thumbnail_url` (TEXT) - Hình ảnh đại diện
- `published_at` (TIMESTAMP) - Ngày xuất bản
- `search_vector` (tsvector) - Full-text search

### properties (Base Table)
Bất động sản - bảng cơ sở chứa thông tin chung.

**Columns:**
- `id` (UUID) - Primary key
- `code` (VARCHAR) - Mã sản phẩm (VD: INL-BDS-001)
- `name` (VARCHAR) - Tên bất động sản
- `slug` (VARCHAR) - Unique slug
- `main_category` (VARCHAR) - 'kcn' hoặc 'bds'
- `sub_category` (VARCHAR) - 'trong-kcn', 'ngoai-kcn' (cho KCN)
- `property_type` (VARCHAR) - Loại cụ thể
- `transaction_type` (VARCHAR) - 'chuyen-nhuong' hoặc 'cho-thue'
- `status` (VARCHAR) - 'available', 'sold', 'rented', 'reserved'
- `industrial_park_id` (UUID) - FK to industrial_parks (nếu thuộc KCN)
- `province` (VARCHAR) - Tỉnh/Thành
- `district` (VARCHAR) - Quận/Huyện
- `ward` (VARCHAR) - Phường/Xã
- `address` (TEXT) - Địa chỉ
- `latitude` (DECIMAL) - Vĩ độ
- `longitude` (DECIMAL) - Kinh độ
- `google_maps_link` (TEXT) - Link Google Maps (optional)
- `total_area` (NUMERIC) - Diện tích tổng
- `area_unit` (VARCHAR) - 'm2' hoặc 'ha'
- `land_area` (NUMERIC) - Diện tích đất
- `construction_area` (NUMERIC) - Diện tích xây dựng
- `price` (BIGINT) - Giá (bán hoặc thuê/tháng)
- `price_per_sqm` (BIGINT) - Giá/m²
- `price_range_min` (BIGINT) - Giá tối thiểu (cho KCN)
- `price_range_max` (BIGINT) - Giá tối đa (cho KCN)
- `negotiable` (BOOLEAN) - Có thể thương lượng
- `legal_status` (VARCHAR) - Tình trạng pháp lý
- `description` (TEXT) - Mô tả ngắn
- `description_full` (TEXT) - Mô tả chi tiết
- `thumbnail_url` (TEXT) - Hình ảnh đại diện
- `video_url` (TEXT) - Video URL
- `contact_name` (VARCHAR) - Tên người liên hệ
- `contact_phone` (VARCHAR) - SĐT liên hệ
- `contact_email` (VARCHAR) - Email liên hệ
- `meta_title` (VARCHAR) - SEO title
- `meta_description` (TEXT) - SEO description
- `meta_keywords` (TEXT) - SEO keywords
- `published_at` (TIMESTAMP) - Ngày xuất bản
- `search_vector` (tsvector) - Full-text search

### property_residential
Thông tin nhà ở (extension table).

**Columns:**
- `property_id` (UUID) - PK, FK to properties
- `bedrooms` (INTEGER) - Số phòng ngủ
- `bathrooms` (INTEGER) - Số phòng tắm
- `floors` (INTEGER) - Số tầng
- `orientation` (VARCHAR) - Hướng nhà
- `furniture` (VARCHAR) - 'full', 'basic', 'empty'
- `building_name` (VARCHAR) - Tên tòa nhà (cho căn hộ)
- `floor_number` (INTEGER) - Số tầng (cho căn hộ)
- `unit_number` (VARCHAR) - Số căn hộ
- `balcony_area` (NUMERIC) - Diện tích ban công
- `garden_area` (NUMERIC) - Diện tích sân vườn (cho biệt thự)
- `swimming_pool` (BOOLEAN) - Có hồ bơi (cho biệt thự)
- `garage_capacity` (INTEGER) - Số chỗ đỗ xe (cho biệt thự)
- `shop_area` (NUMERIC) - Diện tích cửa hàng (cho shophouse)
- `living_area` (NUMERIC) - Diện tích ở (cho shophouse)

**Cho:** nhà phố, căn hộ, biệt thự, shophouse

### property_land
Thông tin đất (extension table).

**Columns:**
- `property_id` (UUID) - PK, FK to properties
- `width` (NUMERIC) - Mặt tiền (m)
- `length` (NUMERIC) - Chiều dài (m)
- `frontage_width` (NUMERIC) - Mặt tiền đường (m)
- `depth` (NUMERIC) - Chiều sâu (m)
- `corner_lot` (BOOLEAN) - Đất góc
- `main_road_access` (BOOLEAN) - Mặt tiền đường chính
- `road_width` (NUMERIC) - Độ rộng đường (m)

**Cho:** đất nền, đất trong/ngoài KCN

### property_factory
Thông tin nhà xưởng (extension table).

**Columns:**
- `property_id` (UUID) - PK, FK to properties
- `factory_height` (NUMERIC) - Chiều cao (m)
- `factory_structure` (VARCHAR) - Kết cấu
- `loading_capacity` (NUMERIC) - Tải trọng (tấn/m²)
- `crane_capacity` (NUMERIC) - Tải trọng cầu trục (tấn)
- `has_office` (BOOLEAN) - Có văn phòng
- `office_area` (NUMERIC) - Diện tích văn phòng (m²)
- `has_crane` (BOOLEAN) - Có cầu trục
- `has_fire_system` (BOOLEAN) - Có PCCC
- `has_parking` (BOOLEAN) - Có chỗ đỗ xe
- `parking_capacity` (INTEGER) - Số chỗ đỗ xe

**Cho:** nhà xưởng, đất có nhà xưởng

## Supporting Tables

### property_images
Hình ảnh của properties.

### property_documents
Tài liệu của properties (PDF, giấy tờ pháp lý).

**Lưu ý**: Amenities (tiện ích) được lưu trực tiếp trong `properties.features.amenities` dạng JSONB array, không cần bảng riêng.

### industries
Lookup table cho ngành nghề.

### industrial_park_allowed_industries
Junction table: industrial_parks ↔ industries (N:M).

## Content Tables

### news
Tin tức về thị trường, quy hoạch, chính sách.

### news_activities
Tin hoạt động: FDI, sự kiện, dự án mới, CSR.

### case_studies
Nghiên cứu tình huống khách hàng.

### case_study_images
Hình ảnh cho case studies.

### jobs
Tuyển dụng.

### job_applications
Đơn ứng tuyển.

## Business Tables

### leads
Khách hàng tiềm năng (form liên hệ).

## Indexes

### Primary Indexes
- UUID primary keys trên tất cả bảng
- Unique: `slug`, `code`, `email`

### Foreign Key Indexes
- Tất cả foreign keys đều có index

### Composite Indexes
- `(main_category, sub_category, property_type)`
- `(property_type, transaction_type, status)`
- `(province, district, price, status)`

### Full-text Search
- GIN indexes trên `search_vector`

### Spatial Indexes
- GIST indexes trên `point(longitude, latitude)`

## Relationships Summary

1. `industrial_parks` → `properties` (1:N)
2. `properties` → `property_residential/land/factory` (1:0..1)
3. `properties` → `property_images/documents` (1:N)
5. `industrial_parks` ↔ `industries` (N:M)
6. `users` → `news/news_activities/jobs` (1:N)
7. `jobs` → `job_applications` (1:N)
8. `case_studies` → `case_study_images` (1:N)
9. `leads` → `properties/industrial_parks/users` (N:1, optional)

## Tham khảo

- Chi tiết đầy đủ: `database-design-final.md`
- SQL Schema: `shared/database/schema-v2.sql`
- ERD: `ERD.md`
- README: `README.md`
