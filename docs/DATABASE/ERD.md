# Entity Relationship Diagram (ERD)

Mô tả quan hệ giữa các bảng trong database (Thiết kế v2 - Final).

## ERD Overview

```
┌──────────────────┐
│  industrial_     │
│     parks        │ (KCN độc lập)
└────────┬─────────┘
         │ 1:N
         │
┌────────┴─────────────────────────┐
│                                  │
│         properties               │ (Bảng cơ sở)
│    (Base table - Core fields)    │
└────────┬─────────────────────────┘
         │
         ├── 1:0..1 ── property_residential (Nhà ở)
         ├── 1:0..1 ── property_land (Đất)
         └── 1:0..1 ── property_factory (Nhà xưởng)

properties ──1:N── property_images
properties ──1:N── property_documents

industrial_parks ──N:M── industries (via industrial_park_allowed_industries)

┌─────────────┐
│   users     │
└──────┬──────┘
       │ 1:N
       │
       ├── news (created_by)
       ├── news_activities (created_by)
       └── jobs (created_by)

┌─────────────┐      ┌─────────────┐
│    news     │      │news_        │
│             │      │activities   │
└─────────────┘      └─────────────┘

┌─────────────┐
│ case_       │
│ studies     │
└──────┬──────┘
       │ 1:N
       │
       └── case_study_images

┌─────────────┐      ┌─────────────┐
│    jobs     │      │ job_        │
│             │──1:N─│applications │
└─────────────┘      └─────────────┘

┌─────────────┐
│   leads     │
│             │
│ reference_id│──→ properties (optional)
│ reference_id│──→ industrial_parks (optional)
│ assigned_to │──→ users (optional)
└─────────────┘
```

## Core Relationships

### 1. Industrial Parks → Properties (1:N)
- Một KCN có thể có nhiều properties
- Foreign key: `properties.industrial_park_id` → `industrial_parks.id`
- ON DELETE SET NULL: Nếu xóa KCN, properties vẫn giữ nhưng mất reference

### 2. Properties → Extension Tables (1:0..1)
- `properties` → `property_residential` (nhà ở: nhà phố, căn hộ, biệt thự, shophouse)
- `properties` → `property_land` (đất: đất nền, đất trong/ngoài KCN)
- `properties` → `property_factory` (nhà xưởng: nhà xưởng, đất có nhà xưởng)
- Mỗi property chỉ có 1 trong 3 extension tables tùy loại

### 3. Properties → Images/Documents (1:N)
- `properties` → `property_images` (N hình ảnh)
- `properties` → `property_documents` (N tài liệu)
- ON DELETE CASCADE: Xóa property → xóa tất cả images/documents

### 4. Amenities
- Amenities được lưu trong `properties.features.amenities` (JSONB array)
- Không cần bảng riêng, vì đã có JSONB `features` linh hoạt
- Một amenity có thể dùng cho nhiều properties

### 5. Industrial Parks ↔ Industries (N:M)
- Qua bảng `industrial_park_allowed_industries`
- Một KCN cho phép nhiều ngành nghề
- Một ngành nghề có thể áp dụng cho nhiều KCN

### 6. Users → Content (1:N)
- `users` → `news` (created_by)
- `users` → `news_activities` (created_by)
- `users` → `jobs` (created_by)
- ON DELETE SET NULL: Xóa user → content vẫn giữ nhưng mất created_by

### 7. Jobs → Job Applications (1:N)
- `jobs` → `job_applications`
- ON DELETE CASCADE: Xóa job → xóa tất cả applications

### 8. Case Studies → Images (1:N)
- `case_studies` → `case_study_images`
- ON DELETE CASCADE: Xóa case study → xóa tất cả images

### 9. Leads (Polymorphic References)
- `leads.reference_id` + `leads.reference_type` → có thể reference đến:
  - `properties` (reference_type = 'property')
  - `industrial_parks` (reference_type = 'industrial_park')
- `leads.assigned_to` → `users.id` (nhân viên được phân công)

## Key Design Decisions

### Hybrid Approach (Base + Extension Tables)
- **Base Table** (`properties`): Chứa thông tin chung (~40 fields)
- **Extension Tables**: Chỉ khi cần → Form nhập liệu gọn
- **Benefits**: Query cơ bản nhanh, form không quá dài, storage hiệu quả

### Industrial Parks Independence
- KCN là entity độc lập
- Properties trong KCN reference đến KCN qua `industrial_park_id`
- Cho phép query KCN riêng và properties riêng

### Classification System
- **Main Category**: `'kcn'` hoặc `'bds'`
- **Sub Category**: `'trong-kcn'`, `'ngoai-kcn'` (chỉ cho KCN)
- **Property Type**: Cụ thể theo từng loại
- **Transaction Type**: `'chuyen-nhuong'` (bán) hoặc `'cho-thue'` (thuê)

## Indexes Strategy

### Primary Indexes
- UUID primary keys trên tất cả bảng
- Unique indexes: `slug`, `code`, `email`

### Foreign Key Indexes
- Tất cả foreign keys đều có index
- Composite indexes cho filter thường dùng

### Full-text Search
- `search_vector` (tsvector) trên `properties` và `industrial_parks`
- GIN indexes cho full-text search

### Spatial Indexes
- GIST indexes cho `latitude/longitude` (point geometry)
- Hỗ trợ tìm kiếm theo vị trí, distance queries

## Tham khảo

- Chi tiết đầy đủ: `database-design-final.md`
- SQL Schema: `shared/database/schema-v2.sql`
- README: `README.md`
