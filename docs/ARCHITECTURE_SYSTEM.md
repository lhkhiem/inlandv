# Kiến trúc hệ thống - System Architecture

## 📋 Tổng quan

Hệ thống được **tách biệt hoàn toàn** thành 2 phần:

1. **CMS System** - Hệ thống quản trị (Admin)
2. **InlandV System** - Hệ thống công khai (Public)

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    CMS SYSTEM (Admin)                        │
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │ CMS Frontend │ ──────► │ CMS Backend  │                  │
│  │  (Port 4003) │         │  (Port 4001) │                  │
│  │  Admin UI    │         │  Admin API   │                  │
│  └──────────────┘         └──────────────┘                  │
│         │                         │                          │
│         └─────────┬───────────────┘                          │
│                   │                                          │
│                   ▼                                          │
│         ┌──────────────────┐                                │
│         │   PostgreSQL DB   │                                │
│         │ inlandv_realestate │                                │
│         └──────────────────┘                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 INLANDV SYSTEM (Public)                     │
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │InlandV Frontend│ ─────► │InlandV Backend│                 │
│  │  (Port 4002)  │         │  (Port 4000) │                 │
│  │  Public UI   │         │  Public API  │                 │
│  └──────────────┘         └──────────────┘                  │
│         │                         │                          │
│         └─────────┬───────────────┘                          │
│                   │                                          │
│                   ▼                                          │
│         ┌──────────────────┐                                │
│         │   PostgreSQL DB   │                                │
│         │ inlandv_realestate │                                │
│         └──────────────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Ports và Connections

| Component | Port | URL | Mục đích |
|-----------|------|-----|----------|
| **CMS Backend** | 4001 | `http://localhost:4001` | Admin API - Phục vụ CMS Frontend |
| **CMS Frontend** | 4003 | `http://localhost:4003` | Admin Dashboard - Kết nối CMS Backend |
| **InlandV Backend** | 4000 | `http://localhost:4000` | Public API - Phục vụ InlandV Frontend |
| **InlandV Frontend** | 4002 | `http://localhost:4002` | Public Website - Kết nối InlandV Backend |

---

## 🔐 Phân biệt CMS và InlandV

### CMS System (Admin)

**Mục đích:** Quản trị nội dung, quản lý website

**Đặc điểm:**
- ✅ Yêu cầu **authentication** (JWT)
- ✅ Chỉ admin mới truy cập được
- ✅ Có đầy đủ CRUD operations
- ✅ Quản lý: Settings, Menus, Pages, Assets, FAQ, Tracking Scripts, Newsletter
- ✅ Activity Logs để theo dõi thay đổi

**API Endpoints:**
- `/api/auth/*` - Authentication
- `/api/settings/*` - CMS Settings
- `/api/menu-*/*` - Menu Management
- `/api/page-metadata/*` - SEO Metadata
- `/api/assets/*` - Media Library
- `/api/faq/*` - FAQ Management
- `/api/tracking-scripts/*` - Analytics Scripts
- `/api/newsletter/*` - Newsletter Subscriptions
- `/api/activity-logs/*` - Activity Tracking

### InlandV System (Public)

**Mục đích:** Hiển thị nội dung cho người dùng cuối

**Đặc điểm:**
- ✅ **Không cần authentication** (public API)
- ✅ Chỉ đọc dữ liệu (read-only)
- ✅ Hiển thị: Projects, Listings, Posts, Jobs
- ✅ Nhận Leads từ form liên hệ

**API Endpoints:**
- `/api/projects/*` - Public Projects
- `/api/listings/*` - Public Listings
- `/api/posts/*` - Public Posts/News
- `/api/jobs/*` - Public Jobs
- `/api/leads/*` - Submit Leads (POST only)

---

## 🔄 Luồng dữ liệu

### CMS Flow (Admin)

```
Admin User
    │
    ▼
CMS Frontend (4003)
    │
    │ HTTP Request + JWT Token
    ▼
CMS Backend (4001)
    │
    │ Authenticate & Authorize
    │
    ▼
PostgreSQL Database
    │
    │ CRUD Operations
    ▼
CMS Backend (4001)
    │
    │ JSON Response
    ▼
CMS Frontend (4003)
    │
    ▼
Admin User
```

### InlandV Flow (Public)

```
Public User
    │
    ▼
InlandV Frontend (4002)
    │
    │ HTTP Request (No Auth)
    ▼
InlandV Backend (4000)
    │
    │ Read Data
    ▼
PostgreSQL Database
    │
    │ Data Response
    ▼
InlandV Backend (4000)
    │
    │ JSON Response
    ▼
InlandV Frontend (4002)
    │
    ▼
Public User
```

---

## 📁 Cấu trúc Projects

```
projects/
├── cms-backend/          # Admin API (Port 4001)
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # Admin controllers
│   │   ├── routes/       # Admin routes
│   │   ├── models/       # Sequelize models
│   │   └── middleware/   # Auth middleware
│   └── env.local.example # Environment template
│
├── cms-frontend/         # Admin Dashboard (Port 4003)
│   ├── app/             # Next.js pages
│   ├── components/       # Admin components
│   ├── lib/             # API client (→ CMS Backend)
│   └── env.local.example # Environment template
│
├── inlandv-backend/      # Public API (Port 4000)
│   ├── src/
│   │   ├── routes/      # Public routes
│   │   └── database/   # Database connection
│   └── env.local.example # Environment template
│
└── inlandv-frontend/     # Public Website (Port 4002)
    ├── app/             # Next.js pages
    ├── components/      # Public components
    ├── lib/            # API client (→ InlandV Backend)
    └── env.local.example # Environment template
```

---

## 🔧 Environment Variables

### Sử dụng `.env.local`

**Tất cả projects sử dụng `.env.local` làm file cấu hình chính.**

#### Setup Steps:

1. **Copy file mẫu:**
   ```bash
   # CMS Backend
   cd projects/cms-backend
   cp env.local.example .env.local
   
   # CMS Frontend
   cd projects/cms-frontend
   cp env.local.example .env.local
   
   # InlandV Backend
   cd projects/inlandv-backend
   cp env.local.example .env.local
   
   # InlandV Frontend
   cd projects/inlandv-frontend
   cp env.local.example .env.local
   ```

2. **Cập nhật giá trị trong `.env.local`** (database URL, ports, secrets, etc.)

3. **Không commit `.env.local` vào Git** (đã được ignore)

---

## 📝 Environment Variables Details

### CMS Backend (`.env.local`)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=inlandv_realestate

# Server
PORT=4001
NODE_ENV=development

# CORS (CMS Frontend)
ADMIN_ORIGIN=http://localhost:4003

# JWT Authentication
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
```

### CMS Frontend (`.env.local`)

```env
# API URL (CMS Backend)
NEXT_PUBLIC_API_URL=http://localhost:4001/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:4001
```

### InlandV Backend (`.env.local`)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inlandv_realestate

# Server
PORT=4000
NODE_ENV=development

# CORS (InlandV Frontend)
CORS_ORIGIN=http://localhost:4002
```

### InlandV Frontend (`.env.local`)

```env
# API URL (InlandV Backend)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 🚀 Development Workflow

### 1. Start Database
```bash
# Ensure PostgreSQL is running
pg_ctl start
```

### 2. Start CMS System
```bash
# Terminal 1: CMS Backend
cd projects/cms-backend
npm install
npm run dev  # Runs on port 4001

# Terminal 2: CMS Frontend
cd projects/cms-frontend
npm install
npm run dev  # Runs on port 4003
```

### 3. Start InlandV System
```bash
# Terminal 3: InlandV Backend
cd projects/inlandv-backend
npm install
npm run dev  # Runs on port 4000

# Terminal 4: InlandV Frontend
cd projects/inlandv-frontend
npm install
npm run dev  # Runs on port 4002
```

---

## 🔒 Security

### CMS Backend
- ✅ JWT Authentication required
- ✅ CORS chỉ cho phép CMS Frontend
- ✅ Rate limiting nghiêm ngặt hơn
- ✅ Admin-only endpoints

### InlandV Backend
- ✅ Public API (no auth required)
- ✅ CORS chỉ cho phép InlandV Frontend
- ✅ Rate limiting cho public
- ✅ Read-only operations (trừ POST /api/leads)

---

## 📊 Database

**Cả 2 systems dùng chung 1 database:**
- Database: `inlandv_realestate`
- Shared tables: `projects`, `listings`, `posts`, `jobs`, `leads`, etc.
- CMS-only tables: `settings`, `menu_*`, `page_metadata`, `activity_logs`, `assets`, `faq_*`, `tracking_scripts`, `newsletter_subscriptions`

---

## ✅ Checklist

### Setup mới
- [ ] Copy `env.local.example` → `.env.local` cho tất cả 4 projects
- [ ] Cập nhật database credentials trong `.env.local`
- [ ] Cập nhật JWT_SECRET trong CMS Backend `.env.local`
- [ ] Chạy database migrations
- [ ] Test kết nối từ CMS Frontend → CMS Backend
- [ ] Test kết nối từ InlandV Frontend → InlandV Backend

### Development
- [ ] CMS Backend chạy trên port 4001
- [ ] CMS Frontend chạy trên port 4003
- [ ] InlandV Backend chạy trên port 4000
- [ ] InlandV Frontend chạy trên port 4002
- [ ] Tất cả đều đọc từ `.env.local`

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra `DATABASE_URL` hoặc `DB_*` trong `.env.local`
- Kiểm tra database `inlandv_realestate` đã tồn tại

### "CORS error"
- Kiểm tra `CORS_ORIGIN` trong backend `.env.local` match với frontend URL
- CMS Backend: `ADMIN_ORIGIN=http://localhost:4003`
- InlandV Backend: `CORS_ORIGIN=http://localhost:4002`

### "JWT Authentication failed"
- Kiểm tra `JWT_SECRET` trong CMS Backend `.env.local`
- Đảm bảo token được gửi trong header: `Authorization: Bearer <token>`

### "Environment variable not found"
- Đảm bảo file `.env.local` tồn tại (không phải `.env`)
- Kiểm tra tên biến đúng với file mẫu
- Restart server sau khi thay đổi `.env.local`

---

## 📚 Tài liệu liên quan

- [Environment Variables Guide](./DEVELOPMENT/environment-variables.md)
- [Database Setup Guide](./DATABASE/setup-guide.md)
- [API Documentation](./API/)

