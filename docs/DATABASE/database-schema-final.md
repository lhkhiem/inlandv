# Database Schema - Final Design
## Tổng hợp đầy đủ các bảng và trường

**Ngày tạo**: 2025-01-28  
**Phiên bản**: Final (v2 - với CMS Integration)  
**Tổng số bảng**: 26 bảng

---

## 📋 TỔNG QUAN

Database schema cho hệ thống Inland Real Estate Platform, bao gồm:
- **Core Business**: KCN, BDS, Users, Leads
- **Content Management**: News, News Activities, Insights, Case Studies
- **Jobs & HR**: Jobs, Job Applications
- **Pages & Sections**: Quản lý trang tĩnh và sections
- **CMS Core**: Settings, Menus, Page Metadata, Activity Logs
- **Media Management**: Assets, Asset Folders
- **Features**: FAQ, Newsletter, Tracking Scripts
- **Supporting**: Images

---

## 📊 DANH SÁCH BẢNG

### 1. Core Business (4 bảng)

| STT | Tên bảng | Mục đích |
|-----|----------|----------|
| 1 | `users` | Người dùng hệ thống (Admin, Sales) |
| 2 | `industrial_parks` | Khu công nghiệp - Có thể cho thuê và/hoặc chuyển nhượng |
| 3 | `properties` | Bất động sản thông thường - Có thể cho thuê và/hoặc chuyển nhượng |
| 4 | `leads` | Khách hàng tiềm năng - Form liên hệ |

---

### 2. Images/Media (3 bảng)

| STT | Tên bảng | Mục đích |
|-----|----------|----------|
| 5 | `industrial_park_images` | Hình ảnh của KCN |
| 6 | `property_images` | Hình ảnh của BDS |
| 7 | `case_study_images` | Hình ảnh của case study |

---

### 3. Content Articles (4 bảng)

| STT | Tên bảng | Mục đích |
|-----|----------|----------|
| 8 | `news` | Tin tức - Categories: tin-thi-truong, quy-hoach-chinh-sach, tu-van-hoi-dap, tuyen-dung |
| 9 | `news_activities` | Tin hoạt động - Categories: thi-truong-bds-cong-nghiep, tin-tuc-fdi, su-kien-tham-gia, du-an-moi, hoat-dong-csr |
| 10 | `insights` | Góc nhìn chuyên gia - Categories: phan-tich-thi-truong, cam-nang-dau-tu, tin-tuc-fdi |
| 11 | `case_studies` | Nghiên cứu tình huống khách hàng |

---

### 4. Jobs/HR (2 bảng)

| STT | Tên bảng | Mục đích |
|-----|----------|----------|
| 12 | `jobs` | Tuyển dụng - Vị trí tuyển dụng |
| 13 | `job_applications` | Đơn ứng tuyển - Ứng viên nộp đơn |

---

### 5. Pages & Sections (2 bảng)

| STT | Tên bảng | Mục đích |
|-----|----------|----------|
| 14 | `pages` | Trang tĩnh/Homepage - About, Services, Contact, etc. |
| 15 | `page_sections` | Sections của mỗi trang - Quản lý text và images |

---

### 6. CMS Core (4 bảng)

| STT | Tên bảng | Mục đích |
|-----|----------|----------|
| 16 | `settings` | CMS configuration (namespace-based) |
| 17 | `menu_locations` | Menu locations (header, footer, mobile) |
| 18 | `menu_items` | Menu items (nested structure) |
| 19 | `page_metadata` | SEO metadata cho từng page |
| 20 | `activity_logs` | Activity tracking và audit trail |

---

### 7. Media Management (2 bảng)

| STT | Tên bảng | Mục đích |
|-----|----------|----------|
| 21 | `asset_folders` | Media folders (nested structure) |
| 22 | `assets` | Unified media library |

---

### 8. Features (4 bảng)

| STT | Tên bảng | Mục đích |
|-----|----------|----------|
| 23 | `faq_categories` | FAQ categories |
| 24 | `faq_questions` | FAQ questions và answers |
| 25 | `tracking_scripts` | Analytics & tracking scripts |
| 26 | `newsletter_subscriptions` | Newsletter email subscriptions |

---

**Lưu ý**: 
- Amenities (tiện ích) được lưu trực tiếp trong `properties.features.amenities` dạng JSONB array: `["ho-boi", "gym", "thang-may", ...]`
- Không cần bảng riêng vì đã có JSONB `features` linh hoạt

---

## 📝 CHI TIẾT CÁC BẢNG

### 1. `users` - Người dùng hệ thống

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Tên người dùng |
| email | VARCHAR(255) | Email (unique) |
| password_hash | VARCHAR(255) | Mật khẩu đã hash |
| role | VARCHAR(50) | 'admin' hoặc 'sale' |
| phone | VARCHAR(20) | Số điện thoại |
| avatar_url | TEXT | URL avatar |
| is_active | BOOLEAN | Trạng thái active |
| last_login_at | TIMESTAMP WITH TIME ZONE | Lần đăng nhập cuối |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

### 2. `industrial_parks` - Khu công nghiệp

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| code | VARCHAR(50) | Mã KCN (unique) |
| name | VARCHAR(255) | Tên KCN |
| slug | VARCHAR(255) | Slug URL (unique) |
| scope | VARCHAR(50) | 'trong-kcn' hoặc 'ngoai-kcn' |
| has_rental | BOOLEAN | Có dịch vụ cho thuê |
| has_transfer | BOOLEAN | Có dịch vụ chuyển nhượng |
| province | VARCHAR(100) | Tỉnh/Thành |
| district | VARCHAR(100) | Quận/Huyện |
| address | TEXT | Địa chỉ |
| latitude | DECIMAL(10,8) | Vĩ độ |
| longitude | DECIMAL(11,8) | Kinh độ |
| google_maps_link | TEXT | Link Google Maps (optional) |
| total_area | NUMERIC(12,2) | Tổng diện tích (ha) |
| available_area | NUMERIC(12,2) | Diện tích còn trống (ha) |
| rental_price_min | BIGINT | Giá thuê tối thiểu (đ/m²/tháng) |
| rental_price_max | BIGINT | Giá thuê tối đa |
| transfer_price_min | BIGINT | Giá chuyển nhượng tối thiểu (tỷ VND) |
| transfer_price_max | BIGINT | Giá chuyển nhượng tối đa |
| infrastructure | JSONB | Hạ tầng: {"power": true, "water": true, "drainage": true, "waste": true, "internet": true, "road": true, "security": true} |
| allowed_industries | TEXT[] | Ngành nghề: ['co-khi', 'dien-tu', 'thuc-pham'] |
| description | TEXT | Mô tả ngắn |
| description_full | TEXT | Mô tả chi tiết |
| thumbnail_url | TEXT | Ảnh đại diện |
| meta_title | VARCHAR(255) | SEO title |
| meta_description | TEXT | SEO description |
| published_at | TIMESTAMP WITH TIME ZONE | Ngày xuất bản |
| search_vector | tsvector | Full-text search |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

**Constraint**: `has_rental = true OR has_transfer = true` (phải có ít nhất 1 dịch vụ)

---

### 3. `properties` - Bất động sản thông thường

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| code | VARCHAR(50) | Mã BDS (unique) |
| name | VARCHAR(255) | Tên BDS |
| slug | VARCHAR(255) | Slug URL (unique) |
| property_type | VARCHAR(100) | 'nha-pho', 'can-ho', 'biet-thu', 'dat-nen', 'shophouse', 'nha-xuong' |
| has_rental | BOOLEAN | Có dịch vụ cho thuê |
| has_transfer | BOOLEAN | Có dịch vụ chuyển nhượng |
| status | VARCHAR(50) | 'available', 'sold', 'rented', 'reserved' |
| province | VARCHAR(100) | Tỉnh/Thành |
| district | VARCHAR(100) | Quận/Huyện |
| ward | VARCHAR(100) | Phường/Xã |
| address | TEXT | Địa chỉ |
| latitude | DECIMAL(10,8) | Vĩ độ |
| longitude | DECIMAL(11,8) | Kinh độ |
| google_maps_link | TEXT | Link Google Maps (optional) |
| total_area | NUMERIC(12,2) | Diện tích tổng (m²) |
| rental_price_min | BIGINT | Giá thuê tối thiểu (VND/tháng) |
| rental_price_max | BIGINT | Giá thuê tối đa |
| transfer_price_min | BIGINT | Giá chuyển nhượng tối thiểu (VND) |
| transfer_price_max | BIGINT | Giá chuyển nhượng tối đa |
| legal_status | VARCHAR(100) | Tình trạng pháp lý |
| features | JSONB | Đặc điểm: {"bedrooms": 4, "bathrooms": 3, "orientation": "Đông Nam", "furniture": "full", "amenities": ["ho-boi", "gym", "thang-may"]} (cho nhà ở) hoặc {"width": 10, "length": 20, "corner_lot": true} (cho đất) hoặc {"factory_height": 8, "has_crane": true} (cho nhà xưởng) |
| description | TEXT | Mô tả ngắn |
| description_full | TEXT | Mô tả chi tiết |
| thumbnail_url | TEXT | Ảnh đại diện |
| meta_title | VARCHAR(255) | SEO title |
| meta_description | TEXT | SEO description |
| published_at | TIMESTAMP WITH TIME ZONE | Ngày xuất bản |
| search_vector | tsvector | Full-text search |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

**Constraint**: `has_rental = true OR has_transfer = true` (phải có ít nhất 1 dịch vụ)

---

### 4. `leads` - Khách hàng tiềm năng

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Tên khách hàng |
| phone | VARCHAR(20) | Số điện thoại |
| email | VARCHAR(255) | Email |
| message | TEXT | Tin nhắn |
| source | VARCHAR(100) | 'homepage', 'property', 'industrial_park', 'contact' |
| reference_type | VARCHAR(50) | 'property' hoặc 'industrial_park' |
| reference_id | UUID | ID của property hoặc park (optional) |
| assigned_to | UUID | FK to users (optional) |
| status | VARCHAR(50) | 'new', 'contacted', 'qualified', 'converted', 'lost' |
| notes | TEXT | Ghi chú nội bộ |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

### 5. `industrial_park_images` - Hình ảnh KCN

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| industrial_park_id | UUID | FK to industrial_parks (CASCADE DELETE) |
| url | TEXT | URL hình ảnh |
| caption | VARCHAR(500) | Chú thích |
| display_order | INTEGER | Thứ tự hiển thị |
| is_primary | BOOLEAN | Ảnh chính |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |

---

### 6. `property_images` - Hình ảnh BDS

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| property_id | UUID | FK to properties (CASCADE DELETE) |
| url | TEXT | URL hình ảnh |
| caption | VARCHAR(500) | Chú thích |
| display_order | INTEGER | Thứ tự hiển thị |
| is_primary | BOOLEAN | Ảnh chính |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |

---

### 7. `case_study_images` - Hình ảnh case study

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| case_study_id | UUID | FK to case_studies (CASCADE DELETE) |
| url | TEXT | URL hình ảnh |
| caption | VARCHAR(500) | Chú thích |
| display_order | INTEGER | Thứ tự hiển thị |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |

---

### 8. `news` - Tin tức

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Tiêu đề |
| slug | VARCHAR(255) | Slug URL (unique) |
| category | VARCHAR(100) | 'tin-thi-truong', 'quy-hoach-chinh-sach', 'tu-van-hoi-dap', 'tuyen-dung' |
| thumbnail_url | TEXT | Ảnh đại diện |
| excerpt | TEXT | Tóm tắt |
| content | TEXT | Nội dung (HTML) |
| author | VARCHAR(255) | Tác giả |
| featured | BOOLEAN | Tin nổi bật |
| date | DATE | Ngày đăng |
| meta_title | VARCHAR(255) | SEO title |
| meta_description | TEXT | SEO description |
| published_at | TIMESTAMP WITH TIME ZONE | Ngày xuất bản |
| search_vector | tsvector | Full-text search |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |
| created_by | UUID | FK to users |

---

### 9. `news_activities` - Tin hoạt động

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| slug | VARCHAR(255) | Slug URL (unique) |
| title | VARCHAR(255) | Tiêu đề |
| category | VARCHAR(100) | 'thi-truong-bds-cong-nghiep', 'tin-tuc-fdi', 'su-kien-tham-gia', 'du-an-moi', 'hoat-dong-csr' |
| thumbnail | TEXT | Ảnh đại diện |
| excerpt | TEXT | Tóm tắt |
| content | TEXT | Nội dung (HTML) |
| date | DATE | Ngày đăng |
| author | VARCHAR(255) | Tác giả |
| featured | BOOLEAN | Tin nổi bật |
| read_time | VARCHAR(50) | Thời gian đọc (VD: "5 phút đọc") |
| meta_title | VARCHAR(255) | SEO title |
| meta_description | TEXT | SEO description |
| published_at | TIMESTAMP WITH TIME ZONE | Ngày xuất bản |
| search_vector | tsvector | Full-text search |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |
| created_by | UUID | FK to users |

---

### 10. `insights` - Góc nhìn chuyên gia

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| slug | VARCHAR(255) | Slug URL (unique) |
| title | VARCHAR(255) | Tiêu đề |
| category | VARCHAR(100) | 'phan-tich-thi-truong', 'cam-nang-dau-tu', 'tin-tuc-fdi' |
| thumbnail | TEXT | Ảnh đại diện |
| excerpt | TEXT | Tóm tắt |
| content | TEXT | Nội dung (HTML) |
| date | DATE | Ngày đăng |
| author | VARCHAR(255) | Tác giả (bắt buộc) |
| featured | BOOLEAN | Bài nổi bật |
| read_time | VARCHAR(50) | Thời gian đọc |
| meta_title | VARCHAR(255) | SEO title |
| meta_description | TEXT | SEO description |
| published_at | TIMESTAMP WITH TIME ZONE | Ngày xuất bản |
| search_vector | tsvector | Full-text search |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |
| created_by | UUID | FK to users |

---

### 11. `case_studies` - Nghiên cứu tình huống

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| slug | VARCHAR(255) | Slug URL (unique) |
| project_name | VARCHAR(255) | Tên dự án |
| client | VARCHAR(255) | Khách hàng |
| industry | VARCHAR(255) | Ngành nghề |
| location | VARCHAR(255) | Địa điểm |
| year | INTEGER | Năm |
| challenge | TEXT | Thách thức |
| solution | TEXT | Giải pháp |
| results | JSONB | Array: [{"metric": "...", "value": "...", "description": "..."}] |
| testimonial | JSONB | Object: {"quote": "...", "author": "...", "role": "...", "company": "..."} |
| video | TEXT | URL video (optional) |
| tags | TEXT[] | Tags |
| meta_title | VARCHAR(255) | SEO title |
| meta_description | TEXT | SEO description |
| published_at | TIMESTAMP WITH TIME ZONE | Ngày xuất bản |
| search_vector | tsvector | Full-text search |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |
| created_by | UUID | FK to users |

---

### 12. `jobs` - Tuyển dụng

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| slug | VARCHAR(255) | Slug URL (unique) |
| title | VARCHAR(255) | Tiêu đề vị trí |
| quantity | INTEGER | Số lượng tuyển |
| deadline | DATE | Hạn nộp hồ sơ |
| description | JSONB | {overview: string, responsibilities: string[], requirements: string[], benefits: string[]} |
| meta_title | VARCHAR(255) | SEO title |
| meta_description | TEXT | SEO description |
| published_at | TIMESTAMP WITH TIME ZONE | Ngày xuất bản |
| search_vector | tsvector | Full-text search |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |
| created_by | UUID | FK to users |

---

### 13. `job_applications` - Đơn ứng tuyển

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| job_id | UUID | FK to jobs (CASCADE DELETE) |
| name | VARCHAR(255) | Tên ứng viên |
| email | VARCHAR(255) | Email |
| phone | VARCHAR(20) | Số điện thoại |
| cv_url | TEXT | URL file CV |
| cover_letter | TEXT | Thư xin việc |
| status | VARCHAR(50) | 'pending', 'reviewing', 'interviewed', 'accepted', 'rejected' |
| notes | TEXT | Ghi chú nội bộ |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

### 14. `pages` - Trang tĩnh/Homepage

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| slug | VARCHAR(255) | Slug URL (unique) - VD: 'gioi-thieu', 'dich-vu', 'lien-he' |
| title | VARCHAR(255) | Tên trang |
| page_type | VARCHAR(100) | 'static' hoặc 'homepage' |
| published | BOOLEAN | Trạng thái xuất bản |
| meta_title | VARCHAR(255) | SEO title |
| meta_description | TEXT | SEO description |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |
| created_by | UUID | FK to users |

---

### 15. `page_sections` - Sections của mỗi trang

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| page_id | UUID | FK to pages (CASCADE DELETE) |
| section_key | VARCHAR(100) | Key của section - VD: 'hero', 'cau-chuyen', 'doi-ngu' (unique trong page) |
| name | VARCHAR(255) | Tên section (để hiển thị trong CMS) - VD: 'Hero Section', 'Câu chuyện Inlandv' |
| section_type | VARCHAR(100) | 'hero', 'content', 'team', 'clients', 'service', 'form', 'info' |
| display_order | INTEGER | Thứ tự hiển thị (0, 1, 2, ...) |
| content | TEXT | Nội dung text (HTML hoặc plain text) - Có thể NULL nếu chỉ có images |
| images | TEXT[] | Mảng URL hình ảnh - VD: ['/images/section1.jpg', '/images/section2.jpg'] - Có thể NULL nếu chỉ có content |
| published | BOOLEAN | Trạng thái xuất bản |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |
| created_by | UUID | FK to users |

**Constraint**: `UNIQUE (page_id, section_key)` - Mỗi page chỉ có 1 section với section_key

---

### 16. `settings` - CMS Configuration

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| namespace | VARCHAR(100) | Namespace (unique): 'general', 'seo', 'appearance', 'security', 'advanced', 'email', 'social' |
| value | JSONB | Settings data dạng JSON: {"site_name": "...", "site_description": "..."} |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

### 17. `menu_locations` - Menu Locations

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Tên location: 'Header Menu', 'Footer Menu', 'Mobile Menu' |
| slug | VARCHAR(100) | Slug (unique): 'header', 'footer', 'mobile' |
| description | TEXT | Mô tả |
| is_active | BOOLEAN | Trạng thái active |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

### 18. `menu_items` - Menu Items

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| menu_location_id | UUID | FK to menu_locations (CASCADE DELETE) |
| parent_id | UUID | FK to menu_items (nested structure) |
| title | VARCHAR(255) | Tiêu đề menu item |
| url | VARCHAR(500) | URL hoặc path |
| icon | VARCHAR(100) | Icon name |
| type | VARCHAR(50) | 'custom', 'property', 'industrial_park', 'news', 'insight', 'case_study', 'page' |
| entity_id | UUID | ID của entity nếu type không phải 'custom' |
| target | VARCHAR(20) | '_self' hoặc '_blank' |
| rel | VARCHAR(100) | 'nofollow', 'noopener', etc. |
| css_classes | TEXT | CSS classes |
| sort_order | INTEGER | Thứ tự hiển thị |
| is_active | BOOLEAN | Trạng thái active |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

### 19. `page_metadata` - SEO Metadata

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| path | VARCHAR(500) | Path (unique): '/about', '/properties/slug', '/news/slug' |
| title | VARCHAR(500) | SEO title |
| description | TEXT | SEO description |
| og_image | VARCHAR(1000) | OG image URL |
| keywords | TEXT[] | Keywords array |
| enabled | BOOLEAN | Trạng thái enabled |
| auto_generated | BOOLEAN | TRUE cho auto-generated (properties/news), FALSE cho custom |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

### 20. `activity_logs` - Activity Tracking

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users (SET NULL) |
| action | VARCHAR(100) | 'create', 'update', 'delete', 'publish', 'login', etc. |
| entity_type | VARCHAR(50) | 'property', 'industrial_park', 'news', 'user', 'page', etc. |
| entity_id | UUID | ID của entity |
| entity_name | VARCHAR(255) | Tên entity để hiển thị |
| description | TEXT | Mô tả action |
| metadata | JSONB | Additional data (old values, new values, etc.) |
| ip_address | VARCHAR(45) | IP address |
| user_agent | TEXT | User agent |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |

---

### 21. `asset_folders` - Media Folders

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Tên folder |
| parent_id | UUID | FK to asset_folders (nested structure) |
| path | TEXT | Cached path: "/properties/industrial-parks" |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

### 22. `assets` - Unified Media Library

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| folder_id | UUID | FK to asset_folders |
| type | VARCHAR(50) | 'image', 'video', 'document', 'audio', 'other' |
| provider | VARCHAR(50) | 'local', 's3', 'cloudinary', 'cdn' |
| url | VARCHAR(1024) | URL file |
| cdn_url | VARCHAR(1024) | CDN URL (optional) |
| filename | VARCHAR(255) | Tên file |
| mime_type | VARCHAR(100) | MIME type |
| file_size | BIGINT | Kích thước file (bytes) |
| width | INTEGER | Width (images/videos) |
| height | INTEGER | Height (images/videos) |
| format | VARCHAR(50) | 'jpg', 'png', 'pdf', 'mp4', etc. |
| sizes | JSONB | Responsive sizes: {"thumbnail": "...", "medium": "...", "large": "..."} |
| alt_text | TEXT | Alt text |
| caption | TEXT | Caption |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

### 23. `faq_categories` - FAQ Categories

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Tên category |
| slug | VARCHAR(255) | Slug (unique) |
| sort_order | INTEGER | Thứ tự hiển thị |
| is_active | BOOLEAN | Trạng thái active |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

### 24. `faq_questions` - FAQ Questions

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| category_id | UUID | FK to faq_categories (CASCADE DELETE) |
| question | TEXT | Câu hỏi |
| answer | TEXT | Câu trả lời |
| sort_order | INTEGER | Thứ tự hiển thị |
| is_active | BOOLEAN | Trạng thái active |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

### 25. `tracking_scripts` - Tracking Scripts

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Tên script: 'Google Analytics', 'Facebook Pixel', etc. |
| type | VARCHAR(50) | 'analytics', 'pixel', 'custom', 'tag-manager', 'heatmap', 'live-chat' |
| provider | VARCHAR(100) | 'google', 'facebook', 'microsoft', 'custom' |
| position | VARCHAR(10) | 'head' hoặc 'body' |
| script_code | TEXT | HTML/JavaScript code |
| is_active | BOOLEAN | Trạng thái active |
| load_strategy | VARCHAR(20) | 'sync', 'async', 'defer' |
| pages | JSONB | ['all'] hoặc ['home', 'properties', 'news'] - Pages sẽ load |
| priority | INTEGER | Thứ tự load (số nhỏ load trước) |
| description | TEXT | Mô tả |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

### 26. `newsletter_subscriptions` - Newsletter Subscriptions

| Trường | Type | Giải thích |
|--------|------|------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Email (unique) |
| status | VARCHAR(50) | 'active', 'unsubscribed', 'bounced' |
| subscribed_at | TIMESTAMP WITH TIME ZONE | Ngày đăng ký |
| unsubscribed_at | TIMESTAMP WITH TIME ZONE | Ngày hủy đăng ký |
| source | VARCHAR(255) | Nguồn đăng ký: 'footer', 'homepage', 'contact' |
| ip_address | VARCHAR(45) | IP address |
| user_agent | TEXT | User agent |
| created_at | TIMESTAMP WITH TIME ZONE | Ngày tạo |
| updated_at | TIMESTAMP WITH TIME ZONE | Ngày cập nhật |

---

## 🔗 RELATIONSHIPS

### Core Relationships:

```
users (1) ──── (N) news/news_activities/insights/case_studies/jobs/pages/page_sections (created_by)
users (1) ──── (N) leads (assigned_to)
users (1) ──── (N) activity_logs

industrial_parks (1) ──── (N) industrial_park_images
properties (1) ──── (N) property_images
case_studies (1) ──── (N) case_study_images

jobs (1) ──── (N) job_applications

pages (1) ──── (N) page_sections

menu_locations (1) ──── (N) menu_items
menu_items (1) ──── (N) menu_items (parent-child, nested)

asset_folders (1) ──── (N) asset_folders (parent-child, nested)
asset_folders (1) ──── (N) assets

faq_categories (1) ──── (N) faq_questions

```

---

## 📝 VÍ DỤ DỮ LIỆU

### Ví dụ: Trang About (`gioi-thieu`)

**Bảng `pages`:**
| slug | title | page_type |
|------|-------|-----------|
| gioi-thieu | Giới thiệu | static |

**Bảng `page_sections`:**
| section_key | name | section_type | display_order | content | images |
|-------------|------|--------------|---------------|---------|--------|
| hero | Hero Section | hero | 0 | Chào mừng đến với INLANDV | ['/images/about-hero.jpg'] |
| cau-chuyen | Câu chuyện Inlandv | content | 1 | INLANDV được thành lập năm 2022... | NULL |
| doi-ngu | Đội ngũ lãnh đạo | team | 2 | NULL | ['/images/team/member1.jpg', '/images/team/member2.jpg'] |
| tai-sao | Tại sao chọn Inlandv | content | 3 | Uy tín - Chuyên nghiệp... | NULL |
| khach-hang | Khách hàng & Đối tác | clients | 4 | NULL | ['/images/clients/logo1.png', '/images/clients/logo2.png'] |

### Ví dụ: Settings Configuration

**Bảng `settings`:**
| namespace | value |
|-----------|-------|
| general | {"site_name": "INLANDV", "site_description": "...", "site_url": "https://inlandv.vn"} |
| seo | {"default_title": "...", "default_description": "...", "default_keywords": [...]} |
| appearance | {"logo": "/images/logo.png", "favicon": "/images/favicon.ico", "theme": "light"} |
| email | {"smtp_host": "...", "smtp_port": 587, "from_email": "..."} |

### Ví dụ: Menu System

**Bảng `menu_locations`:**
| slug | name | is_active |
|------|------|-----------|
| header | Header Menu | true |
| footer | Footer Menu | true |
| mobile | Mobile Menu | true |

**Bảng `menu_items` (Header Menu):**
| title | url | type | parent_id | sort_order |
|-------|-----|------|-----------|------------|
| Trang chủ | / | custom | NULL | 0 |
| Bất động sản | /bat-dong-san | custom | NULL | 1 |
| Khu công nghiệp | /khu-cong-nghiep | custom | NULL | 2 |
| Nhà phố | /bat-dong-san/nha-pho | property | (parent_id của "Bất động sản") | 0 |
| Tin tức | /tin-tuc | custom | NULL | 3 |

---

## 🎯 KEY FEATURES

1. **JSONB cho linh hoạt**: 
   - `infrastructure` (KCN): Hạ tầng
   - `features` (BDS): Đặc điểm + amenities (array)
   - `description` (Jobs): Mô tả công việc
   - `results`, `testimonial` (Case Studies): Kết quả và testimonial
   - `value` (Settings): CMS configuration
   - `metadata` (Activity Logs, Assets): Additional metadata
   - `pages` (Tracking Scripts): Pages array
   - `sizes` (Assets): Responsive image sizes

2. **Full-text Search**: `search_vector` (tsvector) cho properties, industrial_parks, news, news_activities, insights, case_studies, jobs

3. **Auto-update Timestamps**: Triggers tự động cập nhật `updated_at`

4. **UUID Primary Keys**: Tất cả bảng dùng UUID

5. **Cascade Delete**: Images và related tables tự động xóa khi parent bị xóa

---

## 📚 THAM KHẢO

- SQL Schema: `shared/database/schema-simplified.sql`
- CMS Migration: `shared/database/migrations/044_cms_integration.sql`
- ERD: `docs/DATABASE/ERD.md`
- README: `docs/DATABASE/README.md`

## 📋 TỔNG KẾT BẢNG

**Tổng số: 26 bảng**

**Core Business (4):** users, industrial_parks, properties, leads  
**Images/Media (3):** industrial_park_images, property_images, case_study_images  
**Content Articles (4):** news, news_activities, insights, case_studies  
**Jobs/HR (2):** jobs, job_applications  
**Pages & Sections (2):** pages, page_sections  
**CMS Core (5):** settings, menu_locations, menu_items, page_metadata, activity_logs  
**Media Management (2):** asset_folders, assets  
**Features (4):** faq_categories, faq_questions, tracking_scripts, newsletter_subscriptions




