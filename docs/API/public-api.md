# Public API Documentation

API documentation cho Public Backend (Port 4000).

Base URL: `http://localhost:4000/api`

## Projects

### List Projects
```http
GET /api/projects
```

**Query Parameters:**
- `location` (string, optional) - Filter by location
- `status` (string, optional) - Filter by status
- `price_min` (number, optional) - Minimum price
- `price_max` (number, optional) - Maximum price
- `page` (number, default: 1) - Page number
- `limit` (number, default: 12) - Items per page

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "totalPages": 9
  }
}
```

### Get Featured Projects
```http
GET /api/projects/featured?limit=6
```

### Get Project by Slug
```http
GET /api/projects/:slug
```

## Posts

### List Posts
```http
GET /api/posts?category=Tin%20thị%20trường&page=1&limit=12
```

### Get Featured Posts
```http
GET /api/posts/featured?limit=3
```

### Get Post by Slug
```http
GET /api/posts/:slug
```

## Leads

### Submit Lead Form
```http
POST /api/leads
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "phone": "0912345678",
  "email": "email@example.com",
  "message": "Tôi muốn tư vấn",
  "source": "homepage"
}
```

## Jobs

### List Jobs
```http
GET /api/jobs?page=1&limit=10
```

### Get Job by Slug
```http
GET /api/jobs/:slug
```

## Health Check

```http
GET /health
```

