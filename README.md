# Inland Real Estate - Sàn Bất Động Sản

Website bất động sản full-stack với kiến trúc tách biệt 4 components.

## 🏗️ Kiến trúc

Dự án được chia thành 4 projects độc lập:

| Project | Port | Mô tả |
|---------|------|-------|
| **public-backend** | 4000 | API công khai cho website |
| **public-frontend** | 4002 | Website công khai (Next.js) |
| **cms-backend** | 4001 | API cho CMS dashboard |
| **cms-frontend** | 4003 | CMS Dashboard (Next.js) |

## 📁 Cấu trúc Dự án

```
san-moi-gioi-bds/
├── 📁 projects/              # Source code chính
│   ├── public-backend/       # Port 4000
│   ├── public-frontend/      # Port 4002
│   ├── cms-backend/           # Port 4001
│   └── cms-frontend/          # Port 4003
│
├── 📁 shared/                 # Shared resources
│   ├── database/             # Schema, migrations, seeds
│   ├── types/                # Shared TypeScript types
│   └── utils/                # Shared utilities
│
├── 📁 docs/                   # Documentation
│   ├── API/                  # API documentation
│   ├── DATABASE/             # Database docs
│   └── DEVELOPMENT/          # Development guides
│
├── 📁 scripts/                # Automation scripts
│   ├── setup/                # Setup scripts
│   ├── deployment/           # Deployment scripts
│   └── development/           # Development scripts
│
├── 📁 configs/                # Configuration files
│   ├── nginx/                # Nginx configs
│   ├── docker/                # Docker configs
│   └── pm2/                   # PM2 configs
│
└── 📁 delivery/               # Delivery package
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# All projects
./scripts/setup/install.sh

# Or individually
cd projects/public-backend && npm install
cd ../public-frontend && npm install
cd ../cms-backend && npm install
cd ../cms-frontend && npm install
```

### 2. Setup Database

```bash
# Create database
createdb inland_realestate

# Run migrations
./scripts/setup/setup-database.sh
```

### 3. Setup Environment

```bash
# Create .env files
./scripts/setup/setup-env.sh

# Update DATABASE_URL and JWT_SECRET in .env files
```

### 4. Start Development

```bash
# Start all servers
./scripts/development/start-dev.sh

# Or individually:
# Terminal 1
cd projects/public-backend && npm run dev

# Terminal 2
cd projects/public-frontend && npm run dev

# Terminal 3
cd projects/cms-backend && npm run dev

# Terminal 4
cd projects/cms-frontend && npm run dev
```

## 📚 Documentation

Xem [docs/README.md](./docs/README.md) để biết thêm chi tiết:

- [Setup Guide](./docs/SETUP.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API/)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication

## 📝 Scripts

### Setup
- `scripts/setup/install.sh` - Install all dependencies
- `scripts/setup/setup-database.sh` - Setup database
- `scripts/setup/setup-env.sh` - Setup environment files

### Development
- `scripts/development/start-dev.sh` - Start all dev servers
- `scripts/development/stop-dev.sh` - Stop all servers

### Deployment
- `scripts/deployment/build.sh` - Build all projects
- `scripts/deployment/deploy.sh` - Deploy to production
- `scripts/deployment/migrate.sh` - Run database migrations

## 🔧 Configuration

### Environment Variables

Mỗi project có file `.env` riêng. File `.env.example` ở root là **template chung** cho tất cả projects (backend và frontend).

**Cách sử dụng:**
1. Copy từ `.env.example` vào từng project
2. Tạo file `.env` hoặc `.env.local` trong project
3. Copy các biến cần thiết và update values

Xem [docs/DEVELOPMENT/environment-variables.md](./docs/DEVELOPMENT/environment-variables.md) để biết chi tiết.

### Ports

- **4000** - Public Backend API
- **4001** - CMS Backend API
- **4002** - Public Frontend
- **4003** - CMS Frontend

## 📦 Delivery

Package bàn giao khách hàng nằm trong `delivery/`. Xem [delivery/README.md](./delivery/README.md).

## 📄 License

MIT License - Xem [LICENSE](./LICENSE)

## 👥 Contributors

Inland Real Estate Team

---

**Version:** 1.0.0  
**Last Updated:** 2024
