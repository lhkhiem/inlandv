# Database Tables Audit - Tổng hợp các bảng hiện tại

**Ngày cập nhật:** 2025-01-28  
**Mục đích:** Tài liệu tổng hợp tất cả các bảng trong database hiện tại, dựa trên migrations và models

## 📊 Tổng quan

Database hiện tại sử dụng PostgreSQL với các bảng được tổ chức theo các nhóm chức năng:

- **Core Entities**: Bất động sản, Khu công nghiệp
- **CMS Tables**: Quản lý nội dung, menu, settings
- **Content Tables**: Tin tức, tuyển dụng, case studies
- **Business Tables**: Leads, job applications
- **Lookup Tables**: Product types, transaction types, location types
- **Supporting Tables**: Images, documents, tenants

## 📋 Danh sách đầy đủ các bảng

### 1. Core Entities (Bảng chính)

#### `users`
**Mục đích:** Quản lý người dùng hệ thống (admin, sale)  
**Migration:** `001_initial_schema.sql`, `045_update_users_table.sql`  
**Model:** `projects/cms-backend/src/models/User.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `name`, `email`, `password_hash`
- `role` ('admin', 'sale')
- `phone`, `avatar_url`
- `is_active`, `last_login_at`
- `created_at`, `updated_at`

#### `properties`
**Mục đích:** Bất động sản (nhà phố, căn hộ, đất nền, biệt thự, shophouse, nhà xưởng)  
**Migration:** `047_create_properties.sql`  
**Model:** `projects/cms-backend/src/models/RealEstate.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `code`, `name`, `slug`
- `province`, `district`, `ward`, `address`
- `latitude`, `longitude`
- `type` (nha-pho, can-ho, dat-nen, biet-thu, shophouse, nha-xuong)
- `status` (available, sold, reserved)
- `area`, `land_area`, `construction_area`
- `bedrooms`, `bathrooms`, `floors`
- `has_rental`, `has_transfer`
- `sale_price`, `sale_price_min`, `sale_price_max`
- `rental_price`, `rental_price_min`, `rental_price_max`
- `description`, `description_full`
- `thumbnail_url`, `video_url`
- `meta_title`, `meta_description`, `meta_keywords`
- `published_at`, `created_at`, `updated_at`
- `search_vector` (tsvector)

**Indexes:** code, slug, type, status, province, district, price, area, location, search_vector

#### `industrial_parks`
**Mục đích:** Khu công nghiệp và cụm công nghiệp  
**Migration:** `046_create_industrial_parks.sql`, `060_add_has_factory_to_industrial_parks.sql`  
**Model:** `projects/cms-backend/src/models/IndustrialPark.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `code`, `name`, `slug`
- `scope` (trong-kcn, ngoai-kcn)
- `has_rental`, `has_transfer`, `has_factory`
- `province`, `district`, `ward`, `address`
- `latitude`, `longitude`, `google_maps_link`
- `total_area`, `available_area`, `occupancy_rate`
- `rental_price_min`, `rental_price_max`
- `transfer_price_min`, `transfer_price_max`
- `land_price`
- `infrastructure` (JSONB)
- `allowed_industries` (TEXT[])
- `description`, `description_full`, `advantages`
- `thumbnail_url`, `video_url`
- `contact_name`, `contact_phone`, `contact_email`, `website_url`
- `meta_title`, `meta_description`, `meta_keywords`
- `published_at`, `created_at`, `updated_at`
- `search_vector` (tsvector)

**Indexes:** code, slug, scope, province, district, rental_price, transfer_price, available_area, search_vector

#### `products`
**Mục đích:** Bảng sản phẩm - Copy từ industrial_parks, gộp tất cả bảng vệ tinh vào array/JSONB  
**Migration:** `068_create_products_table.sql`

**Các cột chính:**
- Tương tự `industrial_parks` nhưng gộp các bảng vệ tinh vào:
  - `product_types` (TEXT[])
  - `transaction_types` (TEXT[])
  - `location_types` (TEXT[])
  - `allowed_industries` (TEXT[])
  - `images` (JSONB)
  - `documents` (JSONB)
  - `tenants` (JSONB)

**Lưu ý:** Bảng này có thể thay thế `industrial_parks` trong tương lai

### 2. CMS Tables (Quản lý nội dung)

#### `settings`
**Mục đích:** CMS configuration với namespace-based organization  
**Migration:** `044_cms_integration.sql`

**Các cột chính:**
- `id` (UUID, PK)
- `namespace` (general, seo, appearance, security, advanced, email, social)
- `value` (JSONB)
- `updated_at`

#### `menu_locations`
**Mục đích:** Menu locations (header, footer, mobile)  
**Migration:** `044_cms_integration.sql`  
**Model:** `projects/cms-backend/src/models/MenuLocation.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `name`, `slug`, `description`
- `is_active`
- `created_at`, `updated_at`

#### `menu_items`
**Mục đích:** Menu items với nested structure  
**Migration:** `044_cms_integration.sql`  
**Model:** `projects/cms-backend/src/models/MenuItem.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `menu_location_id` (FK → menu_locations)
- `parent_id` (FK → menu_items, self-reference)
- `title`, `url`, `icon`
- `type` (custom, property, industrial_park, news, page)
- `entity_id` (UUID)
- `target`, `rel`, `css_classes`
- `sort_order`, `is_active`
- `created_at`, `updated_at`

#### `page_metadata`
**Mục đích:** SEO metadata cho từng page  
**Migration:** `044_cms_integration.sql`  
**Model:** `projects/cms-backend/src/models/PageMetadata.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `path` (unique)
- `title`, `description`, `og_image`
- `keywords` (TEXT[])
- `enabled`, `auto_generated`
- `created_at`, `updated_at`

#### `activity_logs`
**Mục đích:** Activity tracking và audit trail  
**Migration:** `044_cms_integration.sql`  
**Model:** `projects/cms-backend/src/models/ActivityLog.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `user_id` (FK → users)
- `action`, `entity_type`, `entity_id`, `entity_name`
- `description`, `metadata` (JSONB)
- `ip_address`, `user_agent`
- `created_at`

#### `asset_folders`
**Mục đích:** Media folders với nested structure  
**Migration:** `044_cms_integration.sql`  
**Model:** `projects/cms-backend/src/models/AssetFolder.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `name`, `parent_id` (FK → asset_folders, self-reference)
- `path`
- `created_at`, `updated_at`

#### `assets`
**Mục đích:** Unified media library  
**Migration:** `044_cms_integration.sql`  
**Model:** `projects/cms-backend/src/models/Asset.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `folder_id` (FK → asset_folders)
- `type` (image, video, document, audio, other)
- `provider` (local, s3, cloudinary, cdn)
- `url`, `cdn_url`, `filename`
- `mime_type`, `file_size`
- `width`, `height`, `format`
- `sizes` (JSONB)
- `alt_text`, `caption`, `metadata` (JSONB)
- `created_at`, `updated_at`

#### `faq_categories`
**Mục đích:** FAQ categories  
**Migration:** `044_cms_integration.sql`  
**Model:** `projects/cms-backend/src/models/FAQCategory.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `name`, `slug`
- `sort_order`, `is_active`
- `created_at`, `updated_at`

#### `faq_questions`
**Mục đích:** FAQ questions và answers  
**Migration:** `044_cms_integration.sql`  
**Model:** `projects/cms-backend/src/models/FAQQuestion.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `category_id` (FK → faq_categories)
- `question`, `answer`
- `sort_order`, `is_active`
- `created_at`, `updated_at`

#### `tracking_scripts`
**Mục đích:** Quản lý tracking scripts (Google Analytics, Facebook Pixel, etc.)  
**Migration:** `044_cms_integration.sql`  
**Model:** `projects/cms-backend/src/models/TrackingScript.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `name`, `type` (analytics, pixel, custom, tag-manager, heatmap, live-chat)
- `provider`, `position` (head, body)
- `script_code`
- `is_active`, `load_strategy` (sync, async, defer)
- `pages` (JSONB)
- `priority`, `description`
- `created_at`, `updated_at`

#### `newsletter_subscriptions`
**Mục đích:** Newsletter email subscriptions  
**Migration:** `044_cms_integration.sql`  
**Model:** `projects/cms-backend/src/models/NewsletterSubscription.ts`

**Các cột chính:**
- `id` (UUID, PK)
- `email` (unique)
- `status` (active, unsubscribed, bounced)
- `subscribed_at`, `unsubscribed_at`
- `source`, `ip_address`, `user_agent`
- `created_at`, `updated_at`

### 3. Content Tables (Nội dung)

#### `pages`
**Mục đích:** Trang tĩnh/Homepage  
**Migration:** `055_create_pages_and_sections.sql`

**Các cột chính:**
- `id` (UUID, PK)
- `slug` (unique)
- `title`, `page_type` (static, homepage)
- `published`
- `meta_title`, `meta_description`
- `created_at`, `updated_at`
- `created_by` (FK → users)

#### `page_sections`
**Mục đích:** Sections của mỗi trang (text + images)  
**Migration:** `055_create_pages_and_sections.sql`

**Các cột chính:**
- `id` (UUID, PK)
- `page_id` (FK → pages)
- `section_key`, `name`
- `section_type` (hero, content, team, clients, service, form, info)
- `display_order`
- `content` (TEXT)
- `images` (TEXT[])
- `published`
- `created_at`, `updated_at`
- `created_by` (FK → users)

#### `news`
**Mục đích:** Tin tức về thị trường bất động sản, quy hoạch, chính sách  
**Migration:** `052_create_news_table.sql`, `add_news_categories.sql`

**Các cột chính:**
- `id` (UUID, PK)
- `title`, `slug` (unique)
- `category_id` (FK → news_categories)
- `thumbnail`, `excerpt`, `content`
- `author`, `featured`
- `view_count`
- `published_at`
- `meta_title`, `meta_description`, `meta_keywords`
- `created_at`, `updated_at`
- `created_by` (FK → users)

#### `news_categories`
**Mục đích:** Danh mục tin tức  
**Migration:** `add_news_categories.sql`

**Các cột chính:**
- `id` (UUID, PK)
- `name`, `slug` (unique)
- `description`
- `display_order`, `is_active`
- `created_at`, `updated_at`
- `created_by` (FK → users)

#### `jobs`
**Mục đích:** Các vị trí tuyển dụng  
**Migration:** `001_initial_schema.sql`, `053_update_jobs_table.sql`

**Các cột chính:**
- `id` (UUID, PK)
- `title`, `slug` (unique)
- `location`, `salary_range`
- `quantity`, `deadline`
- `description_overview`, `description_responsibilities`
- `description_requirements`, `description_benefits`
- `status` (active, closed, draft)
- `view_count`
- `created_at`, `updated_at`
- `created_by` (FK → users)

#### `job_applications`
**Mục đích:** Đơn ứng tuyển  
**Migration:** `054_create_job_applications_table.sql`

**Các cột chính:**
- `id` (UUID, PK)
- `job_id` (FK → jobs)
- `full_name`, `email`, `phone`
- `cv_url`, `cover_letter`
- `status` (pending, reviewing, interviewed, accepted, rejected)
- `notes`
- `created_at`, `updated_at`

### 4. Business Tables (Kinh doanh)

#### `leads`
**Mục đích:** Form liên hệ, yêu cầu tư vấn từ khách hàng  
**Migration:** `001_initial_schema.sql`, `056_update_leads_email_nullable.sql`

**Các cột chính:**
- `id` (UUID, PK)
- `name`, `phone`, `email` (nullable)
- `message`
- `source` (homepage, property, industrial_park, contact, news, job)
- `reference_id`, `reference_type` (property, industrial_park)
- `status` (new, contacted, qualified, closed, lost)
- `assigned_to` (FK → users)
- `notes`
- `created_at`, `updated_at`
- `contacted_at`

### 5. Lookup Tables (Bảng tra cứu)

#### `product_types`
**Mục đích:** Loại sản phẩm (đất, nhà xưởng, đất có nhà xưởng)  
**Migration:** `061_kcn_redesign_lookup_tables.sql`

**Các cột chính:**
- `code` (VARCHAR(100), PK)
- `name_vi`, `name_en`
- `description`
- `display_order`, `is_active`
- `created_at`

#### `transaction_types`
**Mục đích:** Loại giao dịch (chuyển nhượng, cho thuê)  
**Migration:** `061_kcn_redesign_lookup_tables.sql`

**Các cột chính:**
- `code` (VARCHAR(100), PK)
- `name_vi`, `name_en`
- `description`
- `display_order`, `is_active`
- `created_at`

#### `location_types`
**Mục đích:** Loại vị trí (trong KCN, ngoài KCN, trong CCN, ngoài CCN)  
**Migration:** `061_kcn_redesign_lookup_tables.sql`

**Các cột chính:**
- `code` (VARCHAR(100), PK)
- `name_vi`, `name_en`
- `description`
- `zone_type` (kcn, ccn, ngoai)
- `location_position` (trong, ngoai)
- `display_order`, `is_active`
- `created_at`

### 6. Supporting Tables (Bảng hỗ trợ)

#### `industrial_park_product_types`
**Mục đích:** Kết nối industrial_parks với product_types  
**Migration:** `064_industrial_park_satellite_tables.sql`

**Các cột chính:**
- `industrial_park_id` (FK → industrial_parks)
- `product_type_code` (FK → product_types)
- `created_at`
- **PK:** (industrial_park_id, product_type_code)

#### `industrial_park_transaction_types`
**Mục đích:** Kết nối industrial_parks với transaction_types  
**Migration:** `064_industrial_park_satellite_tables.sql`

**Các cột chính:**
- `industrial_park_id` (FK → industrial_parks)
- `transaction_type_code` (FK → transaction_types)
- `created_at`
- **PK:** (industrial_park_id, transaction_type_code)

#### `industrial_park_location_types`
**Mục đích:** Kết nối industrial_parks với location_types  
**Migration:** `064_industrial_park_satellite_tables.sql`

**Các cột chính:**
- `industrial_park_id` (FK → industrial_parks)
- `location_type_code` (FK → location_types)
- `created_at`
- **PK:** (industrial_park_id, location_type_code)

### 7. Views (View hỗ trợ query)

#### `v_industrial_parks_filter`
**Mục đích:** View để filter industrial parks theo product_types, transaction_types, location_types  
**Migration:** `064_industrial_park_satellite_tables.sql`

**Các cột:**
- Tất cả cột từ `industrial_parks`
- `product_types` (TEXT[]) - aggregated
- `transaction_types` (TEXT[]) - aggregated
- `location_types` (TEXT[]) - aggregated

## 📊 Thống kê

### Tổng số bảng: ~35 bảng

**Phân loại:**
- Core Entities: 4 bảng (users, properties, industrial_parks, products)
- CMS Tables: 10 bảng
- Content Tables: 6 bảng
- Business Tables: 1 bảng
- Lookup Tables: 3 bảng
- Supporting Tables: 3 bảng
- Views: 1 view

### Bảng đã deprecated (không còn sử dụng)

#### `projects`
**Trạng thái:** Đã xóa  
**Migration:** `067_drop_projects_and_listings_tables.sql`  
**Lý do:** Thay thế bằng `properties` và `industrial_parks`

#### `listings`
**Trạng thái:** Đã xóa  
**Migration:** `067_drop_projects_and_listings_tables.sql`  
**Lý do:** Thay thế bằng `properties`

## 🔗 Relationships chính

```
users
  ├── 1:N → news (created_by)
  ├── 1:N → news_activities (created_by)
  ├── 1:N → jobs (created_by)
  ├── 1:N → pages (created_by)
  ├── 1:N → page_sections (created_by)
  ├── 1:N → activity_logs (user_id)
  └── 1:N → leads (assigned_to)

properties
  ├── N:1 → industrial_parks (industrial_park_id, optional)
  └── 1:N → (có thể có images, documents trong tương lai)

industrial_parks
  ├── N:M → product_types (via industrial_park_product_types)
  ├── N:M → transaction_types (via industrial_park_transaction_types)
  └── N:M → location_types (via industrial_park_location_types)

pages
  └── 1:N → page_sections

news
  └── N:1 → news_categories

jobs
  └── 1:N → job_applications

leads
  ├── N:1 → properties (reference_id, optional)
  ├── N:1 → industrial_parks (reference_id, optional)
  └── N:1 → users (assigned_to, optional)

menu_locations
  └── 1:N → menu_items

menu_items
  └── N:1 → menu_items (parent_id, self-reference)

asset_folders
  ├── N:1 → asset_folders (parent_id, self-reference)
  └── 1:N → assets

faq_categories
  └── 1:N → faq_questions
```

## 📝 Ghi chú quan trọng

1. **Bảng `products`**: Được tạo mới trong migration 068, có thể thay thế `industrial_parks` trong tương lai. Hiện tại cả 2 bảng đều tồn tại.

2. **Bảng `projects` và `listings`**: Đã bị xóa trong migration 067. Không còn sử dụng.

3. **Lookup Tables**: Các bảng `product_types`, `transaction_types`, `location_types` được tạo trong migration 061 để hỗ trợ filter linh hoạt.

4. **Satellite Tables**: Các bảng vệ tinh cho `industrial_parks` được tạo trong migration 064. Các bảng vệ tinh cho `properties` đã bị xóa.

5. **Full-text Search**: `properties` và `industrial_parks` có `search_vector` (tsvector) để hỗ trợ tìm kiếm nhanh.

6. **JSONB Fields**: Nhiều bảng sử dụng JSONB để lưu trữ dữ liệu linh hoạt:
   - `industrial_parks.infrastructure`
   - `industrial_parks.allowed_industries` (TEXT[])
   - `products.images`, `products.documents`, `products.tenants`
   - `assets.sizes`, `assets.metadata`
   - `settings.value`
   - `activity_logs.metadata`
   - `tracking_scripts.pages`

## 🔧 Cách sử dụng tài liệu này

1. **Xem danh sách bảng**: Sử dụng phần "Danh sách đầy đủ các bảng" để tra cứu nhanh.

2. **Xem relationships**: Sử dụng phần "Relationships chính" để hiểu cách các bảng liên kết với nhau.

3. **Kiểm tra migration**: Mỗi bảng có ghi rõ migration file tạo ra nó.

4. **Kiểm tra model**: Các bảng có model tương ứng được ghi rõ trong phần mô tả.

5. **Chạy audit script**: Sử dụng script `scripts/database/audit-database.ps1` để lấy số liệu thực tế từ database.

## 📚 Tài liệu liên quan

- [Database Schema Final](./database-schema-final.md) - Schema chi tiết
- [Database Design Final](./database-design-final.md) - Thiết kế chi tiết
- [ERD](./ERD.md) - Entity Relationship Diagram
- [Setup Guide](./setup-guide.md) - Hướng dẫn setup database
- [Migrations](./migrations.md) - Hướng dẫn migrations



