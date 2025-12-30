# Demo User Setup - Hướng dẫn sử dụng Demo User

## 📋 Tổng quan

Demo user được tạo để test CMS Dashboard. User này sẽ được **xóa trước khi deploy production**.

## 🚀 Tạo Demo User

### Cách 1: Qua API (Khuyến nghị - cần CMS Backend chạy)

```powershell
# Đảm bảo CMS Backend đang chạy (port 4001)
cd projects\cms-backend
npm run dev

# Trong terminal khác, chạy script
.\scripts\setup\create-demo-user-simple.ps1
```

### Cách 2: Qua Database (nếu API không chạy)

```powershell
.\scripts\setup\create-demo-user.ps1
```

## 🔑 Demo Credentials

Sau khi tạo demo user, sử dụng thông tin sau để đăng nhập:

- **Email:** `demo@inland.com`
- **Password:** `demo123`
- **Role:** `admin`

## 🎨 Hiển thị trên Login Page

Demo credentials được hiển thị trên trang login với:
- Box màu xanh với thông tin demo
- Nút "Fill Demo Credentials" để tự động điền
- Cảnh báo sẽ xóa trước production

## 🗑️ Xóa Demo User

### Trước khi deploy production:

```powershell
# Xóa demo user từ database
.\scripts\setup\delete-demo-user-api.ps1
```

### Xóa khỏi Login Page:

1. Mở file: `projects/cms-frontend/app/login/page.tsx`
2. Tìm dòng:
   ```typescript
   const DEMO_CREDENTIALS = {
     email: 'demo@inland.com',
     password: 'demo123',
     enabled: true, // Set to false to hide demo credentials
   };
   ```
3. Đổi `enabled: true` thành `enabled: false`
4. Hoặc xóa toàn bộ section `DEMO_CREDENTIALS` và code liên quan

## ⚠️ Lưu ý

- Demo user chỉ dùng cho **development/testing**
- **KHÔNG** deploy với demo user trong production
- **PHẢI** xóa demo user và disable hiển thị trước khi deploy
- Demo user có quyền `admin` - không dùng cho production

## 📝 Checklist trước Production

- [ ] Xóa demo user từ database
- [ ] Set `DEMO_CREDENTIALS.enabled = false` trong login page
- [ ] Hoặc xóa toàn bộ demo credentials section
- [ ] Test lại login page không hiển thị demo info
- [ ] Commit changes

## 🔧 Customize Demo User

Bạn có thể thay đổi thông tin demo user:

```powershell
# Tạo với thông tin khác
.\scripts\setup\create-demo-user-simple.ps1 `
    -DemoEmail "test@example.com" `
    -DemoPassword "test123" `
    -DemoName "Test User"
```

## 🐛 Troubleshooting

### "CMS Backend is not running"
- Start CMS Backend: `cd projects\cms-backend && npm run dev`
- Đảm bảo chạy trên port 4001

### "Email already exists"
- Demo user đã tồn tại
- Xóa và tạo lại: `.\scripts\setup\delete-demo-user-api.ps1` rồi chạy lại create script

### Demo credentials không hiển thị trên login
- Kiểm tra `DEMO_CREDENTIALS.enabled = true`
- Kiểm tra file `projects/cms-frontend/app/login/page.tsx`
- Restart frontend server





















