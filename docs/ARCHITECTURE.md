# System Architecture

## Overview

Hệ thống được thiết kế với kiến trúc tách biệt 4 components:

```
┌─────────────────┐         ┌─────────────────┐
│ Public Frontend │────────▶│ Public Backend  │
│   (Port 4002)   │         │   (Port 4000)   │
└─────────────────┘         └────────┬────────┘
                                     │
┌─────────────────┐         ┌────────┴────────┐
│  CMS Frontend   │────────▶│  CMS Backend   │
│   (Port 4003)   │         │   (Port 4001)  │
└─────────────────┘         └────────┬────────┘
                                     │
                              ┌──────┴──────┐
                              │  PostgreSQL  │
                              │  Database   │
                              └─────────────┘
```

## Components

### 1. Public Backend (Port 4000)
- **Purpose**: API công khai cho website
- **Endpoints**: GET routes only (public access)
- **Features**:
  - Project listings
  - Post listings
  - Lead form submission
  - Job listings
- **No Authentication**: Tất cả endpoints đều public

### 2. Public Frontend (Port 4002)
- **Purpose**: Website công khai
- **Framework**: Next.js 14 (App Router)
- **Features**:
  - Homepage với fullpage scroll
  - Project listings
  - News/Blog
  - Contact form
  - Job listings

### 3. CMS Backend (Port 4001)
- **Purpose**: API cho CMS dashboard
- **Endpoints**: Full CRUD operations
- **Features**:
  - JWT Authentication
  - Admin-only endpoints
  - Project management
  - Lead management
  - Dashboard statistics
- **Authentication**: Required for all endpoints except login/register

### 4. CMS Frontend (Port 4003)
- **Purpose**: Admin dashboard
- **Framework**: Next.js 14 (App Router)
- **Features**:
  - Admin login
  - Dashboard overview
  - Project management (CRUD)
  - Post management
  - Lead management
  - Job management

## Database

### Shared Database
- Cả 2 backend dùng chung 1 PostgreSQL database
- Schema được quản lý trong `shared/database/schema.sql`
- Tables:
  - users
  - projects
  - listings
  - posts
  - leads
  - jobs

## Technology Stack

### Backend
- Node.js 18+
- Express.js
- PostgreSQL
- TypeScript
- JWT (CMS only)
- Bcrypt (CMS only)

### Frontend
- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Framer Motion

## Security

### Public Backend
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

### CMS Backend
- JWT authentication
- Admin role check
- Rate limiting (stricter)
- CORS protection
- Helmet security headers

## Deployment

### Production Architecture
```
┌──────────────┐      ┌──────────────┐
│   Nginx      │      │   Nginx      │
│  (Public)    │      │   (CMS)      │
└──────┬───────┘      └──────┬───────┘
       │                      │
┌──────┴───────┐      ┌──────┴───────┐
│Public Backend│      │ CMS Backend  │
│   (PM2)      │      │   (PM2)      │
└──────┬───────┘      └──────┬───────┘
       │                      │
       └──────────┬───────────┘
                  │
           ┌──────┴──────┐
           │ PostgreSQL  │
           └─────────────┘
```

