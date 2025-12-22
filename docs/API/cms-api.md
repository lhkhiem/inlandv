# CMS API Documentation

API documentation cho CMS Backend (Port 4001).

Base URL: `http://localhost:4001/api`

**All endpoints require authentication except `/auth/login` and `/auth/register`**

## Authentication

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "jwt-token-here"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

## Projects (Protected - Admin Only)

### List Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

### Get Project by ID
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Project Name",
  "slug": "project-slug",
  "description": "...",
  "location": "...",
  "price_min": 1000000000,
  "price_max": 5000000000,
  "area_min": 50,
  "area_max": 120,
  "status": "dang-mo-ban",
  "thumbnail_url": "...",
  "gallery": []
}
```

### Update Project
```http
PUT /api/projects/:id
Authorization: Bearer <token>
```

### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

## Leads (Protected - Admin Only)

### List Leads
```http
GET /api/leads?page=1&limit=20&source=homepage
Authorization: Bearer <token>
```

## Dashboard (Protected - Admin Only)

### Get Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "counts": {
      "projects": 10,
      "posts": 5,
      "leads": 20,
      "jobs": 3
    },
    "recentLeads": 5,
    "projectsByStatus": [...]
  }
}
```

