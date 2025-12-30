# Database Quick Reference

Tài liệu tra cứu nhanh về database Inland Real Estate Platform.

## 📊 Tổng quan nhanh

- **Database:** PostgreSQL
- **Tổng số bảng:** ~35 bảng
- **Core Entities:** 4 bảng (users, properties, industrial_parks, products)
- **CMS Tables:** 10 bảng
- **Content Tables:** 6 bảng
- **Business Tables:** 1 bảng
- **Lookup Tables:** 3 bảng
- **Supporting Tables:** 3 bảng

## 🔍 Tra cứu nhanh

### Bảng chính

| Bảng | Mục đích | Model | Migration |
|------|----------|-------|-----------|
| `users` | Người dùng hệ thống | `User.ts` | `001`, `045` |
| `properties` | Bất động sản | `RealEstate.ts` | `047` |
| `industrial_parks` | Khu công nghiệp | `IndustrialPark.ts` | `046`, `060` |
| `products` | Sản phẩm (mới) | - | `068` |

### CMS Tables

| Bảng | Mục đích | Model | Migration |
|------|----------|-------|-----------|
| `settings` | CMS config | - | `044` |
| `menu_locations` | Menu locations | `MenuLocation.ts` | `044` |
| `menu_items` | Menu items | `MenuItem.ts` | `044` |
| `page_metadata` | SEO metadata | `PageMetadata.ts` | `044` |
| `activity_logs` | Activity tracking | `ActivityLog.ts` | `044` |
| `asset_folders` | Media folders | `AssetFolder.ts` | `044` |
| `assets` | Media files | `Asset.ts` | `044` |
| `faq_categories` | FAQ categories | `FAQCategory.ts` | `044` |
| `faq_questions` | FAQ questions | `FAQQuestion.ts` | `044` |
| `tracking_scripts` | Analytics scripts | `TrackingScript.ts` | `044` |
| `newsletter_subscriptions` | Newsletter | `NewsletterSubscription.ts` | `044` |

### Content Tables

| Bảng | Mục đích | Migration |
|------|----------|-----------|
| `pages` | Trang tĩnh | `055` |
| `page_sections` | Sections của trang | `055` |
| `news` | Tin tức | `052` |
| `news_categories` | Danh mục tin | `add_news_categories` |
| `jobs` | Tuyển dụng | `001`, `053` |
| `job_applications` | Đơn ứng tuyển | `054` |

### Business Tables

| Bảng | Mục đích | Migration |
|------|----------|-----------|
| `leads` | Khách hàng tiềm năng | `001`, `056` |

### Lookup Tables

| Bảng | Mục đích | Migration |
|------|----------|-----------|
| `product_types` | Loại sản phẩm | `061` |
| `transaction_types` | Loại giao dịch | `061` |
| `location_types` | Loại vị trí | `061` |

### Supporting Tables

| Bảng | Mục đích | Migration |
|------|----------|-----------|
| `industrial_park_product_types` | KCN ↔ Product types | `064` |
| `industrial_park_transaction_types` | KCN ↔ Transaction types | `064` |
| `industrial_park_location_types` | KCN ↔ Location types | `064` |

## 🔗 Relationships chính

```
users
  ├── 1:N → news, jobs, pages, page_sections (created_by)
  ├── 1:N → activity_logs (user_id)
  └── 1:N → leads (assigned_to)

properties
  └── N:1 → industrial_parks (industrial_park_id, optional)

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
```

## 📝 Common Queries

### Lấy tất cả properties
```sql
SELECT * FROM properties WHERE published_at IS NOT NULL;
```

### Lấy industrial parks với filters
```sql
SELECT * FROM v_industrial_parks_filter 
WHERE has_rental = true 
  AND 'dat' = ANY(product_types);
```

### Lấy news với category
```sql
SELECT n.*, nc.name as category_name 
FROM news n
LEFT JOIN news_categories nc ON n.category_id = nc.id
WHERE n.published_at IS NOT NULL;
```

### Lấy leads chưa xử lý
```sql
SELECT * FROM leads 
WHERE status = 'new' 
ORDER BY created_at DESC;
```

## 🛠️ Tools

### Audit Database
```powershell
# Windows
.\scripts\database\audit-database.ps1

# TypeScript
cd projects/cms-backend
npx ts-node ../../scripts/database/audit-database.ts
```

### Connect to Database
```bash
psql -U postgres -d inlandv_realestate
```

### List all tables
```sql
\dt
```

### Describe table
```sql
\d table_name
```

### Count records
```sql
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = tablename) as column_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## ⚠️ Lưu ý

1. **Bảng deprecated:** `projects`, `listings` đã bị xóa (migration 067)
2. **Bảng mới:** `products` được tạo trong migration 068, có thể thay thế `industrial_parks`
3. **Full-text search:** `properties` và `industrial_parks` có `search_vector` (tsvector)
4. **JSONB fields:** Nhiều bảng sử dụng JSONB cho dữ liệu linh hoạt

## 📚 Tài liệu đầy đủ

- **[database-tables-audit.md](./database-tables-audit.md)** - Tổng hợp tất cả các bảng
- **[database-schema-final.md](./database-schema-final.md)** - Schema chi tiết
- **[ERD.md](./ERD.md)** - Entity Relationship Diagram
- **[README.md](./README.md)** - Index tất cả tài liệu












