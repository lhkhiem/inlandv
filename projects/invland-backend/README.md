# Public Backend API

Backend API for public website (Port 4000).

## Features
- Public endpoints only (GET routes)
- No authentication required
- Lead form submission (POST /api/leads)

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and update values:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/inland_realestate
PORT=4000
CORS_ORIGIN=http://localhost:4002
```

### 3. Database Migration
```bash
npm run migrate
```

### 4. Start Development
```bash
npm run dev
```

Server runs on `http://localhost:4000`

## API Endpoints

### Projects
- `GET /api/projects` - List projects (with filters)
- `GET /api/projects/featured` - Featured projects
- `GET /api/projects/:slug` - Project detail

### Listings
- `GET /api/listings` - List listings
- `GET /api/listings/:id` - Listing detail

### Posts
- `GET /api/posts` - List posts
- `GET /api/posts/featured` - Featured posts
- `GET /api/posts/:slug` - Post detail

### Leads
- `POST /api/leads` - Submit lead form

### Jobs
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:slug` - Job detail

### Health Check
- `GET /health` - Health check with database status

