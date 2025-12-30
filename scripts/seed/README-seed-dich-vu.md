# Seed Dich-vu Page Script

Script này để seed trang `dich-vu` với dữ liệu hardcode từ components vào database.

## Cách sử dụng

### Option 1: Chạy bằng PowerShell script (Khuyên dùng)

```powershell
cd scripts/seed
.\run-seed-dich-vu.ps1
```

Script sẽ tự động:
- Đọc file `seed-dich-vu-page.sql`
- Kết nối database từ biến môi trường hoặc giá trị mặc định
- Chạy SQL và seed dữ liệu

### Option 2: Chạy SQL trực tiếp

Nếu bạn có `psql` command line:

```bash
psql -h localhost -p 5432 -U inlandv_user -d inlandv_db -f seed-dich-vu-page.sql
```

Hoặc nếu dùng các công cụ GUI như pgAdmin, DBeaver:
1. Mở file `seed-dich-vu-page.sql`
2. Copy toàn bộ nội dung
3. Paste và chạy trong SQL editor

### Option 3: Từ CMS Backend

Nếu bạn muốn import qua CMS API, có thể sử dụng script Node.js hoặc curl.

## Dữ liệu được seed

Script sẽ tạo/cập nhật:

1. **Page**: `dich-vu` (Dịch vụ)
   - Title: "Dịch vụ"
   - Meta title và description
   - Published: true

2. **Sections** (5 sections):
   - `hero`: Hero Section với badge, title, subtitle, button
   - `moi-gioi`: Môi giới BĐS Công nghiệp với advantages, process, diverse areas, categories
   - `phap-ly`: Tư vấn Pháp lý & Đầu tư với services, benefits, stats
   - `fdi`: Hỗ trợ FDI với pillars, services, outcomes, stats
   - `thiet-ke-thi-cong`: Thiết kế & Thi công với phases, advantages, quality stats

## Lưu ý

- Script sử dụng `ON CONFLICT` nên có thể chạy nhiều lần an toàn
- Nếu page hoặc section đã tồn tại, script sẽ UPDATE thay vì tạo mới
- Tất cả dữ liệu được lấy từ hardcode trong các components:
  - `ServicesHero.tsx`
  - `BrokerageSection.tsx`
  - `LegalInvestmentSection.tsx`
  - `FDISupportSection.tsx`
  - `DesignConstructionSection.tsx`

## Sau khi seed

Sau khi chạy script thành công:

1. Mở CMS: `http://localhost:3001/dashboard/pages`
2. Tìm và mở trang "Dịch vụ" (slug: `dich-vu`)
3. Bạn sẽ thấy 5 sections đã được tạo với nội dung từ hardcode
4. Có thể chỉnh sửa bất kỳ section nào qua CMS

## Troubleshooting

Nếu gặp lỗi:

1. **Database connection failed**: Kiểm tra biến môi trường hoặc thông tin kết nối
2. **Permission denied**: Đảm bảo user có quyền INSERT/UPDATE trên tables `pages` và `page_sections`
3. **Table not found**: Chạy migrations trước khi seed

```bash
# Chạy migrations trước
cd scripts/setup
.\run-all-migrations.ps1
```

















