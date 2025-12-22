# Root Files Guide - Hướng dẫn các File ở Root

## ✅ Files Nên Giữ ở Root (Chuẩn)

### 1. `.gitignore`
- **Mục đích:** Git ignore rules
- **Vị trí:** ✅ Root (bắt buộc)
- **Lý do:** File chuẩn của Git, phải ở root để Git nhận diện

### 2. `README.md`
- **Mục đích:** Tài liệu chính của project
- **Vị trí:** ✅ Root (bắt buộc)
- **Lý do:** File chuẩn, hiển thị tự động trên GitHub/GitLab

### 3. `LICENSE`
- **Mục đích:** License file
- **Vị trí:** ✅ Root (bắt buộc)
- **Lý do:** File chuẩn, GitHub/GitLab tự động nhận diện

### 4. `CHANGELOG.md`
- **Mục đích:** Lịch sử thay đổi
- **Vị trí:** ✅ Root (khuyến nghị)
- **Lý do:** File chuẩn, dễ tìm cho developers

### 5. `.env.example`
- **Mục đích:** Template cho environment variables
- **Vị trí:** ✅ Root
- **Lý do:** Template chung cho tất cả projects

---

## 📋 Tóm tắt

| File | Vị trí | Lý do |
|------|--------|-------|
| `.gitignore` | ✅ Root | Chuẩn Git (bắt buộc) |
| `README.md` | ✅ Root | Chuẩn GitHub/GitLab (bắt buộc) |
| `LICENSE` | ✅ Root | Chuẩn (bắt buộc) |
| `CHANGELOG.md` | ✅ Root | Chuẩn (khuyến nghị) |
| `.env.example` | ✅ Root | Template chung |

**Tất cả documentation khác** → `docs/`

