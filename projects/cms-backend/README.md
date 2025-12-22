# CMS Backend API

Backend API for CMS Dashboard (Port 4001).

## Features
- Full CRUD operations
- JWT Authentication
- Admin-only endpoints
- Dashboard statistics

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/inland_realestate
PORT=4001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4003
```

### 3. Database Migration
```bash
npm run migrate
```

### 4. Start Development
```bash
npm run dev
```

Server runs on `http://localhost:4001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register admin user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Projects (Protected - Admin Only)
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Leads (Protected - Admin Only)
- `GET /api/leads` - Get all leads

### Dashboard (Protected - Admin Only)
- `GET /api/dashboard/stats` - Get dashboard statistics

## Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

