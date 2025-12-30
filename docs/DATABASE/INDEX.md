# Database Documentation Index

Tài liệu database được tổ chức như sau:

## 📚 Tài liệu chính (Nên đọc)

### 1. **[database-schema-final.md](./database-schema-final.md)** ⭐ **MỚI NHẤT**
**Schema cuối cùng đã chốt:**
- Tổng hợp đầy đủ 17 bảng
- Chi tiết tất cả các trường
- Ví dụ dữ liệu
- **Đây là tài liệu chính thức nên dùng**

### 2. **[database-design-final.md](./database-design-final.md)** ⭐
**Tài liệu thiết kế chi tiết cuối cùng (Final Design)**
- ERD đầy đủ
- Mô tả từng bảng với chú thích chi tiết
- Ví dụ dữ liệu
- Relationships và constraints
- Indexes và triggers
- **Đây là tài liệu chính thức nên dùng**

### 3. **[schema.md](./schema.md)**
**Tóm tắt schema nhanh**
- Overview các bảng chính
- Columns summary
- Relationships summary
- Indexes strategy
- **Dùng để tra cứu nhanh**

### 4. **[ERD.md](./ERD.md)**
**Entity Relationship Diagram**
- ERD diagram chi tiết
- Relationships giải thích
- Key design decisions
- **Dùng để hiểu cấu trúc tổng thể**

### 5. **[README.md](./README.md)**
**Hướng dẫn sử dụng**
- Tổng quan về database
- Hướng dẫn xem tài liệu
- Hướng dẫn triển khai
- Features chính

## 🔧 Setup & Migration

### 5. **[setup-guide.md](./setup-guide.md)**
**Hướng dẫn setup database**
- Cách setup PostgreSQL
- Cấu hình DATABASE_URL
- Scripts tự động

### 6. **[migrations.md](./migrations.md)**
**Hướng dẫn migrations**
- Cách chạy migrations
- Best practices
- Tạo migrations mới

## 📝 SQL Schema Files

### 7. **`shared/database/schema-v2.sql`** ⭐
**SQL schema v2 đầy đủ (Khuyến nghị)**
- Thiết kế Hybrid Approach
- 19 bảng
- Indexes và triggers đầy đủ
- **File này để triển khai database**

### 8. **`shared/database/full-schema.sql`**
**SQL schema cũ (tham khảo)**
- Schema cũ, không khuyến nghị dùng

### 9. **`shared/database/schema.sql`**
**SQL schema cũ (tham khảo)**
- Schema cũ, không khuyến nghị dùng

## 🎯 Quick Start

1. **Muốn xem schema cuối cùng đã chốt?**
   → Đọc `database-schema-final.md` ⭐
   
2. **Muốn hiểu thiết kế tổng thể?**
   → Đọc `database-design-final.md` và `ERD.md`

3. **Muốn tra cứu nhanh schema?**
   → Đọc `schema.md`

4. **Muốn triển khai database?**
   → Chạy `shared/database/schema-v2.sql`

5. **Muốn setup môi trường?**
   → Đọc `setup-guide.md`

## 📊 Cấu trúc Database

### Core Tables (26 bảng - với CMS Integration)

**Base & Extensions:**
- `properties` (base table)
- `property_residential` (extension)
- `property_land` (extension)
- `property_factory` (extension)

**Industrial Parks:**
- `industrial_parks`
- `industries`
- `industrial_park_allowed_industries`

**Supporting:**
- `property_images`
- `property_documents`
- `amenities`
- `property_amenities`

**Content:**
- `news`
- `news_activities`
- `case_studies`
- `case_study_images`
- `jobs`
- `job_applications`

**Business:**
- `leads`
- `users`

**Pages & Sections:**
- `pages`
- `page_sections`

## 🔑 Key Design Points

1. **Hybrid Approach**: Base table + Extension tables
2. **Industrial Parks**: Entity độc lập
3. **Google Maps**: Chỉ cần lat/lng
4. **Full-text Search**: PostgreSQL tsvector
5. **Spatial Indexes**: GIST cho location queries

## 📖 Tham khảo thêm

- Frontend Types: `projects/invland-frontend/lib/types.ts`
- API Documentation: `docs/API/`
- Architecture: `docs/ARCHITECTURE.md`

