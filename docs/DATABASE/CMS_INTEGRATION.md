# CMS Integration Guide
## Hướng dẫn tích hợp CMS vào Inland Real Estate Platform

**Ngày tạo**: 2025-01-28  
**Phiên bản**: 1.0

---

## 📋 TỔNG QUAN

Tài liệu này mô tả việc tích hợp các bảng CMS từ Banyco CMS vào Inland Real Estate Platform, tạo ra một hệ thống quản lý nội dung hoàn chỉnh cho cả CMS (admin) và Public (frontend).

---

## 🎯 MỤC TIÊU TÍCH HỢP

Tích hợp các tính năng CMS cần thiết:
1. **CMS Configuration** - Quản lý cấu hình hệ thống
2. **Navigation Management** - Quản lý menu/navigation
3. **SEO Management** - Quản lý SEO metadata
4. **Activity Tracking** - Audit trail và activity logs
5. **Media Management** - Unified media library
6. **FAQ Management** - Quản lý FAQ
7. **Analytics & Tracking** - Tracking scripts
8. **Newsletter** - Quản lý newsletter subscriptions

---

## 📊 CÁC BẢNG ĐÃ THÊM (9 bảng)

### 1. Core CMS (5 bảng)

| Bảng | Mục đích | Key Features |
|------|----------|--------------|
| `settings` | CMS configuration | Namespace-based, JSONB values |
| `menu_locations` | Menu locations | Header, Footer, Mobile, etc. |
| `menu_items` | Menu items | Nested structure, drag-drop ordering |
| `page_metadata` | SEO metadata | Per-page SEO configuration |
| `activity_logs` | Activity tracking | Audit trail, user actions |

### 2. Media Management (2 bảng)

| Bảng | Mục đích | Key Features |
|------|----------|--------------|
| `asset_folders` | Media folders | Nested folder structure |
| `assets` | Unified media library | Images, videos, documents, etc. |

### 3. Features (2 bảng)

| Bảng | Mục đích | Key Features |
|------|----------|--------------|
| `faq_categories` | FAQ categories | Organize FAQ questions |
| `faq_questions` | FAQ questions | Q&A management |
| `tracking_scripts` | Analytics scripts | Google Analytics, Facebook Pixel, etc. |
| `newsletter_subscriptions` | Newsletter | Email subscription management |

---

## 🔄 MIGRATION

### Chạy Migration

```bash
# Chạy migration CMS integration
psql -U your_user -d your_database -f shared/database/migrations/044_cms_integration.sql

# Hoặc nếu dùng schema-simplified.sql (đã bao gồm CMS tables)
psql -U your_user -d your_database -f shared/database/schema-simplified.sql
```

---

## 📝 CHI TIẾT CÁC BẢNG

### 1. `settings` - CMS Configuration

**Mục đích**: Lưu trữ cấu hình CMS với namespace-based organization.

**Namespaces phổ biến**:
- `general`: Site name, description, URL, contact info
- `seo`: Default SEO settings
- `appearance`: Logo, favicon, theme settings
- `security`: Security settings
- `email`: SMTP configuration
- `social`: Social media links

**Ví dụ**:
```json
{
  "namespace": "general",
  "value": {
    "site_name": "INLANDV",
    "site_description": "Nền tảng bất động sản công nghiệp",
    "site_url": "https://inlandv.vn",
    "contact_email": "info@inlandv.vn",
    "contact_phone": "+84 123 456 789"
  }
}
```

---

### 2. `menu_locations` & `menu_items` - Menu System

**Mục đích**: Quản lý navigation menu với nested structure.

**Menu Locations mặc định**:
- `header`: Main navigation menu
- `footer`: Footer links
- `mobile`: Mobile navigation

**Menu Items**:
- Hỗ trợ nested structure (parent-child)
- Drag-drop ordering với `sort_order`
- Link types: `custom`, `property`, `industrial_park`, `news`, `page`, etc.
- Entity reference: `entity_id` để link đến entities cụ thể

**Ví dụ**:
```
Header Menu
├── Trang chủ (/)
├── Bất động sản (/bat-dong-san)
│   ├── Nhà phố (/bat-dong-san/nha-pho)
│   └── Căn hộ (/bat-dong-san/can-ho)
├── Khu công nghiệp (/khu-cong-nghiep)
└── Tin tức (/tin-tuc)
```

---

### 3. `page_metadata` - SEO Metadata

**Mục đích**: SEO metadata cho từng page (static pages, properties, news, etc.).

**Path format**:
- Static pages: `/about`, `/gioi-thieu`, `/contact`
- Dynamic pages: `/properties/property-slug`, `/news/news-slug`

**Auto-generated vs Custom**:
- `auto_generated = TRUE`: Tự động generate từ properties/news metadata
- `auto_generated = FALSE`: Custom SEO settings (override)

---

### 4. `activity_logs` - Activity Tracking

**Mục đích**: Audit trail và tracking user actions.

**Entity Types**:
- `property`, `industrial_park`
- `news`, `news_activity`, `insight`, `case_study`
- `job`, `user`, `page`, `menu_item`, etc.

**Actions**:
- `create`, `update`, `delete`
- `publish`, `unpublish`
- `login`, `logout`

**Metadata**: JSONB chứa old/new values, additional context

---

### 5. `asset_folders` & `assets` - Media Management

**Mục đích**: Unified media library với folder organization.

**Asset Types**:
- `image`: Images (JPG, PNG, WebP, etc.)
- `video`: Videos (MP4, WebM, etc.)
- `document`: PDFs, Word docs, etc.
- `audio`: Audio files
- `other`: Other file types

**Providers**:
- `local`: Local storage
- `s3`: AWS S3
- `cloudinary`: Cloudinary CDN
- `cdn`: Custom CDN

**Features**:
- Nested folder structure
- Responsive image sizes (JSONB)
- Metadata support (JSONB)
- CDN URL support

---

### 6. `faq_categories` & `faq_questions` - FAQ Management

**Mục đích**: Quản lý FAQ với categories.

**Features**:
- Category organization
- Sort order
- Active/inactive status
- Q&A pairs

---

### 7. `tracking_scripts` - Analytics & Tracking

**Mục đích**: Quản lý tracking scripts (Google Analytics, Facebook Pixel, etc.).

**Types**:
- `analytics`: Google Analytics, etc.
- `pixel`: Facebook Pixel, etc.
- `custom`: Custom scripts
- `tag-manager`: Google Tag Manager
- `heatmap`: Heatmap tools
- `live-chat`: Live chat widgets

**Features**:
- Position: `head` hoặc `body`
- Load strategy: `sync`, `async`, `defer`
- Page targeting: `["all"]` hoặc `["home", "properties", "news"]`
- Priority: Thứ tự load

---

### 8. `newsletter_subscriptions` - Newsletter

**Mục đích**: Quản lý newsletter email subscriptions.

**Status**:
- `active`: Đang đăng ký
- `unsubscribed`: Đã hủy đăng ký
- `bounced`: Email bounced

**Tracking**:
- Source: Nơi đăng ký (footer, homepage, etc.)
- IP address
- User agent

---

## 🔗 INTEGRATION VỚI BẢNG HIỆN CÓ

### Users
- `activity_logs.user_id` → `users.id`
- Tất cả content tables có `created_by` → `users.id`

### Pages & Content
- `page_metadata.path` có thể reference đến:
  - Static pages: `/about` (từ `pages.slug`)
  - Properties: `/properties/{slug}` (từ `properties.slug`)
  - News: `/news/{slug}` (từ `news.slug`)
  - Industrial Parks: `/khu-cong-nghiep/{slug}` (từ `industrial_parks.slug`)

### Menu Items
- `menu_items.entity_id` có thể reference đến:
  - Properties: `properties.id`
  - Industrial Parks: `industrial_parks.id`
  - News: `news.id`
  - Pages: `pages.id`

---

## 🚀 USAGE EXAMPLES

### Settings

```sql
-- Get general settings
SELECT value FROM settings WHERE namespace = 'general';

-- Update SEO settings
UPDATE settings 
SET value = '{"default_title": "INLANDV", "default_description": "..."}'::jsonb
WHERE namespace = 'seo';
```

### Menu System

```sql
-- Get header menu items (nested)
WITH RECURSIVE menu_tree AS (
  SELECT * FROM menu_items 
  WHERE menu_location_id = (SELECT id FROM menu_locations WHERE slug = 'header')
    AND parent_id IS NULL
  
  UNION ALL
  
  SELECT mi.* FROM menu_items mi
  INNER JOIN menu_tree mt ON mi.parent_id = mt.id
)
SELECT * FROM menu_tree ORDER BY sort_order;
```

### Activity Logs

```sql
-- Get recent activities
SELECT * FROM activity_logs 
ORDER BY created_at DESC 
LIMIT 50;

-- Get activities for a specific entity
SELECT * FROM activity_logs 
WHERE entity_type = 'property' AND entity_id = '...'
ORDER BY created_at DESC;
```

### Page Metadata

```sql
-- Get SEO metadata for a page
SELECT * FROM page_metadata WHERE path = '/about';

-- Auto-generate metadata for a property
INSERT INTO page_metadata (path, title, description, auto_generated)
VALUES (
  '/properties/' || slug,
  name,
  description,
  TRUE
)
FROM properties WHERE id = '...';
```

---

## ✅ BEST PRACTICES

1. **Settings**: Luôn dùng namespace để organize settings
2. **Menu Items**: Dùng `sort_order` cho ordering, không dựa vào created_at
3. **Page Metadata**: Auto-generate cho dynamic content, custom cho static pages
4. **Activity Logs**: Log tất cả important actions (create, update, delete, publish)
5. **Assets**: Organize bằng folders, dùng CDN URL khi có thể
6. **Tracking Scripts**: Dùng `pages` array để target specific pages

---

## 📚 THAM KHẢO

- Full Schema: `docs/DATABASE/database-schema-final.md`
- SQL Migration: `shared/database/migrations/044_cms_integration.sql`
- Complete Schema: `shared/database/schema-simplified.sql`

---

## 🔄 NEXT STEPS

1. ✅ Migration đã được tạo
2. ⏭️ Backend API cần implement cho các bảng CMS mới
3. ⏭️ Frontend CMS cần UI để quản lý settings, menus, etc.
4. ⏭️ Frontend Public cần consume menu data và tracking scripts

























