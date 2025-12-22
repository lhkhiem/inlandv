# Giải thích các Thư mục Ẩn

## 📁 `.git/` - Git Repository

**Status:** ❌ Không có (chưa khởi tạo Git)

**Mục đích:**
- Lưu trữ Git repository metadata
- Cần thiết nếu muốn dùng version control

**Nên làm gì:**
```bash
# Nếu muốn dùng Git:
git init
git add .
git commit -m "Initial commit"
```

**Lưu ý:** Đã có `.gitignore` sẵn, nên commit vào Git.

---

## 📁 `.next/` - Next.js Build Folder

**Status:** ✅ Có (ở root level)

**Mục đích:**
- Build output của Next.js
- Được tạo tự động khi chạy `npm run dev` hoặc `npm run build`
- Chứa compiled code, static assets

**Nên làm gì:**
- ✅ **Đã ignore trong .gitignore** - Không commit vào Git
- ✅ **Có thể xóa** - Sẽ được tạo lại khi build
- ⚠️ **Không nên có ở root** - Chỉ nên có trong `projects/public-frontend/` và `projects/cms-frontend/`

**Xóa:**
```bash
# Xóa .next ở root (không cần thiết)
Remove-Item -Recurse -Force .next
```

---

## 📁 `.vscode/` - VS Code Settings

**Status:** ✅ Có

**Mục đích:**
- Cấu hình VS Code cho project
- Có thể chứa: settings, extensions, launch configs
- Hữu ích để team có cùng settings

**Nên làm gì:**
- ✅ **Nên giữ lại** - Để team có cùng settings
- ⚠️ **Hiện tại đã ignore** - Có thể bỏ ignore nếu muốn share settings
- ✅ **Nên commit** - Nếu muốn team có cùng config

**Cập nhật .gitignore:**
```gitignore
# Nếu muốn share .vscode settings, bỏ dòng này:
# .vscode/
```

**Hoặc tạo `.vscode/settings.json` chung:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## 📋 Tóm tắt

| Thư mục | Có/Không | Cần thiết? | Nên commit? | Hành động |
|---------|----------|------------|-------------|-----------|
| `.git/` | ❌ Không | ✅ Có (nếu dùng Git) | ✅ Có | `git init` nếu cần |
| `.next/` | ✅ Có (root) | ❌ Không (ở root) | ❌ Không | Xóa ở root |
| `.vscode/` | ✅ Có | ⚠️ Tùy chọn | ⚠️ Nên commit | Giữ lại, có thể bỏ ignore |

---

## 🎯 Khuyến nghị

1. **Xóa `.next/` ở root** - Không cần thiết
2. **Giữ `.vscode/`** - Hữu ích cho team
3. **Khởi tạo `.git/`** - Nếu chưa có và muốn dùng Git

