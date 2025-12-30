# Database Schema

## Overview
Shared database schema for Inland Real Estate project. Used by both `inlandv-backend` and `cms-backend`.

**Database Name:** `inlandv_realestate` (hoặc `inland_realestate` tùy cấu hình)

## 📚 Tài liệu Database

**Xem tài liệu đầy đủ tại:** [`docs/DATABASE/`](../../docs/DATABASE/)

### Tài liệu chính:
- **[database-tables-audit.md](../../docs/DATABASE/database-tables-audit.md)** ⭐ **MỚI** - Tổng hợp tất cả các bảng hiện tại
- **[database-schema-final.md](../../docs/DATABASE/database-schema-final.md)** - Schema chi tiết
- **[README.md](../../docs/DATABASE/README.md)** - Index tất cả tài liệu database

## Setup

### 1. Create Database
```bash
createdb inlandv_realestate
# hoặc
createdb inland_realestate
```

### 2. Run Migrations
```bash
# Chạy tất cả migrations theo thứ tự
cd shared/database/migrations
psql -d inlandv_realestate -f 001_initial_schema.sql
psql -d inlandv_realestate -f 002_add_indexes.sql
# ... (chạy tất cả migrations theo thứ tự số)

# Hoặc từ backend project
cd projects/cms-backend
npm run migrate
```

## Schema Structure

### Core Tables (Bảng chính)
- **users** - Admin and sales users
- **properties** - Bất động sản (nhà phố, căn hộ, đất nền, biệt thự, shophouse, nhà xưởng)
- **industrial_parks** - Khu công nghiệp và cụm công nghiệp
- **products** - Bảng sản phẩm (có thể thay thế industrial_parks trong tương lai)

### CMS Tables (Quản lý nội dung)
- **settings** - CMS configuration
- **menu_locations** & **menu_items** - Menu system
- **page_metadata** - SEO metadata
- **activity_logs** - Activity tracking
- **asset_folders** & **assets** - Media management
- **faq_categories** & **faq_questions** - FAQ
- **tracking_scripts** - Analytics & tracking
- **newsletter_subscriptions** - Newsletter

### Content Tables (Nội dung)
- **pages** & **page_sections** - Trang tĩnh và sections
- **news** & **news_categories** - Tin tức
- **jobs** & **job_applications** - Tuyển dụng

### Business Tables (Kinh doanh)
- **leads** - Khách hàng tiềm năng

### Lookup Tables (Bảng tra cứu)
- **product_types** - Loại sản phẩm
- **transaction_types** - Loại giao dịch
- **location_types** - Loại vị trí

### Supporting Tables (Bảng hỗ trợ)
- **industrial_park_product_types** - Kết nối KCN với product types
- **industrial_park_transaction_types** - Kết nối KCN với transaction types
- **industrial_park_location_types** - Kết nối KCN với location types

### Views
- **v_industrial_parks_filter** - View filter industrial parks

**Tổng số bảng:** ~35 bảng

### ⚠️ Bảng đã deprecated
- **projects** - Đã xóa (migration 067)
- **listings** - Đã xóa (migration 067)

## Indexes
All tables have appropriate indexes for performance optimization, including:
- Primary keys (UUID)
- Foreign keys
- Search indexes (full-text search với tsvector)
- JSONB indexes (GIN indexes)
- Array indexes (GIN indexes)

## Migration Files
Migration files are located in `shared/database/migrations/` for version control.

**Thứ tự migrations:**
1. `001_initial_schema.sql` - Schema ban đầu
2. `002_add_indexes.sql` - Thêm indexes
3. `044_cms_integration.sql` - Tích hợp CMS
4. `045_update_users_table.sql` - Cập nhật users
5. `046_create_industrial_parks.sql` - Tạo industrial_parks
6. `047_create_properties.sql` - Tạo properties
7. `052_create_news_table.sql` - Tạo news
8. `053_update_jobs_table.sql` - Cập nhật jobs
9. `054_create_job_applications_table.sql` - Tạo job_applications
10. `055_create_pages_and_sections.sql` - Tạo pages và page_sections
11. `061_kcn_redesign_lookup_tables.sql` - Tạo lookup tables
12. `064_industrial_park_satellite_tables.sql` - Tạo satellite tables
13. `067_drop_projects_and_listings_tables.sql` - Xóa projects và listings
14. `068_create_products_table.sql` - Tạo products

## Sample Data
Schema includes sample data for testing in `shared/database/seeds/`.

## Audit Database

Để thống kê các bảng và số lượng records, sử dụng script audit:

```powershell
# Windows
.\scripts\database\audit-database.ps1

# Hoặc với TypeScript
cd projects/cms-backend
npx ts-node ../../scripts/database/audit-database.ts
```

Script sẽ hiển thị:
- Danh sách tất cả các bảng
- Số lượng records mỗi bảng
- Kích thước bảng và indexes
- Bảng có nhiều dữ liệu nhất
- Bảng trống (có thể không sử dụng)

