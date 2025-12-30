# Database Design Documentation

## Tổng quan

Database design cho hệ thống Inland Real Estate Platform, hỗ trợ quản lý:
- Bất động sản (Properties) với thiết kế Hybrid Approach
- Khu công nghiệp (Industrial Parks)
- Tin tức và hoạt động
- Tuyển dụng
- Leads (khách hàng tiềm năng)
- Case studies

## 📚 Tài liệu chính (Nên đọc trước)

### 1. **[database-tables-audit.md](./database-tables-audit.md)** ⭐ **MỚI NHẤT - Khuyến nghị**
**Tổng hợp tất cả các bảng hiện tại:**
- Danh sách đầy đủ ~35 bảng
- Mô tả từng bảng với các cột chính
- Relationships giữa các bảng
- Bảng đã deprecated
- **Đây là tài liệu chính thức nên dùng để tra cứu**

### 2. **[database-schema-final.md](./database-schema-final.md)** ⭐ **Khuyến nghị**
**Schema cuối cùng đã chốt:**
- Tổng hợp đầy đủ 17 bảng
- Chi tiết tất cả các trường
- Ví dụ dữ liệu
- **Đây là tài liệu chính thức nên dùng**

### 3. **[database-design-final.md](./database-design-final.md)** ⭐
**Thiết kế chi tiết cuối cùng (Final Design)**
- ERD (Entity Relationship Diagram)
- Mô tả từng bảng với chú thích chi tiết
- Relationships và constraints
- Indexes và triggers
- Ví dụ dữ liệu
- **Đây là tài liệu chính thức nên dùng**

### 4. **[schema.md](./schema.md)**
**Tóm tắt schema nhanh:**
- Overview các bảng chính
- Columns summary
- Relationships summary
- **Dùng để tra cứu nhanh**

### 5. **[ERD.md](./ERD.md)**
**Entity Relationship Diagram:**
- ERD diagram chi tiết
- Relationships giải thích
- Key design decisions
- **Dùng để hiểu cấu trúc tổng thể**

### 6. **[INDEX.md](./INDEX.md)**
**Index tất cả tài liệu:**
- Danh sách đầy đủ các files
- Quick start guide
- **Dùng để tìm tài liệu cần thiết**

## 🔧 Setup & Migration

### 7. **[setup-guide.md](./setup-guide.md)**
**Hướng dẫn setup database:**
- Cách setup PostgreSQL
- Cấu hình DATABASE_URL
- Scripts tự động

### 8. **[CMS_INTEGRATION.md](./CMS_INTEGRATION.md)** ⭐ **MỚI**
**CMS Integration Guide:**
- Hướng dẫn tích hợp CMS vào Inland Platform
- Chi tiết các bảng CMS mới
- Usage examples và best practices
- **Đọc để hiểu cách sử dụng CMS tables**

### 9. **[migrations.md](./migrations.md)**
**Hướng dẫn migrations:**
- Cách chạy migrations
- Best practices
- Tạo migrations mới

## 📝 SQL Schema Files

### 7. **`shared/database/schema-v2.sql`** ⭐
**SQL schema v2 đầy đủ (Khuyến nghị):**
- Hybrid approach: Base table + Extension tables
- 19 bảng chính
- Full indexes và triggers
- **File này để triển khai database**

### 8. **`shared/database/full-schema.sql`**
**SQL schema cũ (tham khảo)**
- Schema cũ, không khuyến nghị dùng

### 9. **`shared/database/schema.sql`**
**SQL schema cũ (tham khảo)**
- Schema cũ, không khuyến khích dùng

## Các bảng chính (26 bảng - với CMS Integration)

### Core Entities
- `users` - Người dùng hệ thống
- `properties` - Bất động sản (base table - chứa thông tin chung)
- `property_residential` - Thông tin nhà ở (extension)
- `property_land` - Thông tin đất (extension)
- `property_factory` - Thông tin nhà xưởng (extension)
- `industrial_parks` - Khu công nghiệp (độc lập)

### Related Tables
- `property_images` - Hình ảnh bất động sản
- `property_documents` - Tài liệu bất động sản
- Amenities được lưu trong `properties.features.amenities` (JSONB array)

**CMS Tables (9 bảng mới):**
- `settings` - CMS configuration
- `menu_locations` & `menu_items` - Menu system
- `page_metadata` - SEO metadata
- `activity_logs` - Activity tracking
- `asset_folders` & `assets` - Media management
- `faq_categories` & `faq_questions` - FAQ
- `tracking_scripts` - Analytics & tracking
- `newsletter_subscriptions` - Newsletter
- `industries` - Lookup table ngành nghề
- `industrial_park_allowed_industries` - Ngành nghề được phép trong KCN

### Content Tables
- `news` - Tin tức
- `news_activities` - Tin hoạt động
- `case_studies` - Nghiên cứu tình huống
- `case_study_images` - Hình ảnh case study
- `jobs` - Tuyển dụng
- `job_applications` - Đơn ứng tuyển

### Business Tables
- `leads` - Khách hàng tiềm năng

### Pages & Sections
- `pages` - Trang tĩnh/Homepage
- `page_sections` - Sections của mỗi trang (text + images)

## Sử dụng

### 1. Xem thiết kế chi tiết

```bash
# Xem tài liệu thiết kế mới nhất (khuyến nghị)
cat docs/DATABASE/database-design-final.md

# Hoặc xem ERD
cat docs/DATABASE/ERD.md

# Hoặc xem schema summary
cat docs/DATABASE/schema.md
```

### 2. Triển khai database

```bash
# Chạy schema simplified (thiết kế mới nhất - khuyến nghị)
psql -U your_user -d your_database -f shared/database/schema-simplified.sql

# Hoặc schema v2 (thiết kế cũ - không khuyến nghị)
# psql -U your_user -d your_database -f shared/database/schema-v2.sql
```

### 3. Xem ERD

```bash
# Xem ERD diagram
cat docs/DATABASE/ERD.md
```

## Features chính (Simplified Design)

1. **Đơn giản hóa**: Chỉ 2 bảng chính, không cần extension tables
   - `industrial_parks`: KCN với cả 2 dịch vụ (cho thuê/chuyển nhượng)
   - `properties`: BDS với cả 2 dịch vụ (cho thuê/chuyển nhượng)
   
2. **JSONB linh hoạt**: 
   - `infrastructure` (KCN): Hạ tầng dạng JSONB key-value
   - `features` (BDS): Đặc điểm dạng JSONB key-value
   - Dễ thêm/bớt attributes mà không cần migration
   
3. **Filter-ready**: Tất cả fields cần thiết cho filter đều có index

4. **UUID Primary Keys**: Tất cả bảng sử dụng UUID

5. **Full-text Search**: PostgreSQL `tsvector` cho tìm kiếm nhanh

6. **Auto-update Timestamps**: Triggers tự động cập nhật `updated_at`

7. **Comprehensive Indexes**: 
   - Filter operations (scope, type, price, area)
   - JSONB indexes (GIN) cho infrastructure và features
   - Full-text search
   - Location queries

7. **Google Maps Integration**: Chỉ cần `latitude`, `longitude`, optional `google_maps_link`

## Relationships chính

```
industrial_parks ──1:N── industrial_park_images
properties ──1:N── property_images

leads ──N:1── properties (optional reference)
leads ──N:1── industrial_parks (optional reference)
leads ──N:1── users (assigned_to)
```

## Thiết kế Simplified (Mới)

**Ưu điểm:**
- Đơn giản: Chỉ 2 bảng chính, không cần extension tables
- Linh hoạt: JSONB cho hạ tầng/đặc điểm, dễ thêm/bớt
- Query đơn giản: Filter trực tiếp trên 1 bảng
- Phù hợp: Đáp ứng đúng yêu cầu filter và hiển thị
- Dễ maintain: Ít bảng, logic rõ ràng

**Cấu trúc:**
- **KCN**: `scope` ('trong-kcn'/'ngoai-kcn'), `has_rental`/`has_transfer`
- **BDS**: `property_type` (nha-pho, can-ho, ...), `has_rental`/`has_transfer`
- **Hạ tầng/Đặc điểm**: JSONB fields linh hoạt

## Notes quan trọng

1. **Soft Delete**: Hiện tại chưa có soft delete, có thể thêm `deleted_at` field nếu cần

2. **Multilingual**: Hiện tại chưa hỗ trợ đa ngôn ngữ, có thể mở rộng với bảng translations

3. **Audit Trail**: Chưa có audit log, có thể thêm nếu cần tracking thay đổi

4. **File Storage**: URLs trong database, file storage có thể dùng S3/Object Storage

5. **Google Maps**: Chỉ cần `latitude`, `longitude`. Optional `google_maps_link`. Frontend tự tạo link từ lat/lng nếu không có link.

## Migration từ schema hiện tại

Nếu đã có database schema cũ, cần migrate:
1. Backup database hiện tại
2. Review các thay đổi trong `schema-simplified.sql`
3. Tạo migration scripts nếu cần (từ schema cũ sang simplified)
4. Test trên staging trước khi deploy production

**Lưu ý:** Thiết kế simplified khác hoàn toàn với thiết kế hybrid cũ, cần migration plan cẩn thận.

## Tham khảo

- File types TypeScript: `projects/invland-frontend/lib/types.ts`
- API documentation: `docs/API/`
- Architecture: `docs/ARCHITECTURE.md`
- Index tất cả tài liệu: `INDEX.md`
- Index tất cả tài liệu: `INDEX.md`
