# ĐẶC TẢ DỰ ÁN WEBSITE BẤT ĐỘNG SẢN (NextJS / NodeJS / PostgreSQL)

## 1. Mô tả tổng quan dự án
Website bất động sản dạng **fullpage timeline** dành cho sàn giao dịch quy mô vừa. Giao diện tập trung vào trải nghiệm hình ảnh, dễ dùng, tối ưu SEO, tốc độ và khả năng mở rộng.

Hệ thống gồm:
- **Frontend:** NextJS (App Router)
- **Backend:** NodeJS (Express hoặc NestJS)
- **Database:** PostgreSQL
- **Storage:** Object Storage (Vietnix/S3)
- **Triển khai:** VPS (Ubuntu + Nginx)
- **Style:** TailwindCSS + Motion/Framer cho animation

---

## 2. Mục tiêu sản phẩm
- Trình bày thương hiệu sàn BĐS chuyên nghiệp.
- Hiển thị dự án/nguồn hàng mua bán – cho thuê.
- Thu lead khách hàng hiệu quả.
- Quản trị dễ dàng qua CMS nội bộ.

---

## 3. Cấu trúc trang chủ (Fullpage Sections)
Trang chủ gồm **5–6 section**, mỗi section chiếm 100% chiều cao màn hình.

### **Section 1 — Hero**
- Background hình/video.
- Logo, slogan.
- Menu.
- Indicator timeline (01 → 05).
- CTA: "Liên hệ tư vấn".

### **Section 2 — Giới thiệu sàn**
- Nội dung: Tầm nhìn – sứ mệnh – lợi thế.
- Hình ảnh minh hoạ.

### **Section 3 — Mua bán / Cho thuê**
- Tile card dự án.
- Bộ lọc cơ bản (giá, khu vực, loại hình).
- CTA xem chi tiết dự án.

### **Section 4 — Tin tức**
- 3 bài nổi bật.
- Categories.

### **Section 5 — Liên hệ / Form thu lead**
- Form gồm: Tên, SĐT, Email, Nhu cầu.
- Gửi vào backend.
- Lưu dữ liệu trong PostgreSQL.

### **Footer**
- Thông tin doanh nghiệp.
- Map.
- Social links.

---

## 4. Cấu trúc trang nội bộ

### **/gioi-thieu**
- Bài giới thiệu dài.

### **/mua-ban** (mega-menu)
- Danh sách dự án.
- Bộ lọc đầy đủ.

### **/cho-thue**
- Tương tự mục mua bán.

### **/tin-tuc**
- Danh sách bài viết.
- Phân trang.

### **/tuyen-dung**
- Danh sách vị trí.
- Chi tiết job.
- Form ứng tuyển.

### **/lien-he**
- Form liên hệ.

---

## 5. Kiến trúc hệ thống
```
Frontend (NextJS) → Backend API (NodeJS) → PostgreSQL
                         ↓
               Object Storage (Media)
```

---

## 6. Mô hình dữ liệu (PostgreSQL Schema)

### **Bảng users**
- id (uuid)
- name
- email
- password_hash
- role (admin/sale)
- created_at

### **Bảng projects (dự án)**
- id (uuid)
- title
- slug
- description
- location
- price_min
- price_max
- area_min
- area_max
- status (dang-mo-ban / sap-mo-ban / da-ban)
- thumbnail_url
- gallery (JSONB)
- created_at
- updated_at

### **Bảng listings (sản phẩm/căn hộ)**
- id (uuid)
- project_id (fk)
- type (can-ho / nha-pho / dat-nen ...)
- price
- area
- bedrooms
- bathrooms
- thumbnail_url
- gallery (JSONB)
- description
- created_at

### **Bảng posts (tin tức)**
- id (uuid)
- title
- slug
- category
- thumbnail_url
- content (HTML/Markdown)
- created_at

### **Bảng leads (khách hàng)**
- id (uuid)
- name
- phone
- email
- message
- source (homepage/project/contact)
- created_at

### **Bảng jobs (tuyển dụng)**
- id (uuid)
- title
- slug
- location
- salary_range
- description
- requirements
- created_at

---

## 7. API Backend (NodeJS)
### **Auth**
- POST /auth/login
- POST /auth/register

### **Projects**
- GET /projects
- GET /projects/:slug
- POST /projects (admin)
- PUT /projects/:id (admin)
- DELETE /projects/:id (admin)

### **Listings**
- GET /listings
- GET /listings/:id
- CRUD (admin)

### **Posts**
- GET /posts
- GET /posts/:slug
- CRUD (admin)

### **Leads**
- POST /leads
- GET /leads (admin)

### **Jobs**
- GET /jobs
- GET /jobs/:slug
- CRUD (admin)

---

## 8. Frontend (NextJS) – Cấu trúc thư mục
```
/app
  /layout.tsx
  /page.tsx (Home)
  /gioi-thieu/page.tsx
  /mua-ban/page.tsx
  /mua-ban/[slug]/page.tsx
  /cho-thue/page.tsx
  /tin-tuc/page.tsx
  /tin-tuc/[slug]/page.tsx
  /tuyen-dung/page.tsx
  /tuyen-dung/[slug]/page.tsx
  /lien-he/page.tsx
/components
/lib/api.ts
```

---

## 9. Yêu cầu kỹ thuật
- SSR + SEO meta sinh động.
- Tối ưu ảnh bằng next/image.
- Tạo component Fullpage Scroll.
- Tự động sinh sitemap.xml + robots.txt.
- Tối ưu Core Web Vitals.
- Tách API server riêng để dễ scale.

---

## 10. Bảo mật
- JWT auth.
- Rate limit cho form lead.
- Validate input backend.
- CORS bảo vệ API.
- Hash password bằng bcrypt.

---

## 11. Triển khai
- Ubuntu 22.04
- Nginx reverse proxy
- PM2 cho backend
- Node v18+
- PostgreSQL 15
- Object Storage cho ảnh

---

## 12. Roadmap triển khai
### **Phase 1 – Core**
- Thiết kế UI/UX
- NextJS frontend (Home + Listing + Detail)
- Backend CRUD Projects + Listings

### **Phase 2 – CMS nội bộ**
- Quản lý bài viết, dự án, căn hộ
- Upload media

### **Phase 3 – Tối ưu + SEO**
- Sitemap
- SEO content
- Tối ưu ảnh

### **Phase 4 – Mở rộng**
- So sánh sản phẩm
- Công cụ tính vay ngân hàng
- Export PDF bảng giá

---

## 13. Kết luận
Tài liệu này là đặc tả chuẩn dành cho đội phát triển hoặc Copilot, đảm bảo đồng bộ giữa frontend – backend – database và giúp quá trình code nhanh, chính xác, ít sai sót.

