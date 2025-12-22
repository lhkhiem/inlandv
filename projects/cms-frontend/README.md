# CMS Frontend

Frontend cho CMS Dashboard (Port 4003).

## Features
- Admin login
- Dashboard overview
- Project management (CRUD)
- Lead management
- Statistics

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4001/api
```

### 3. Start Development
```bash
npm run dev
```

App runs on `http://localhost:4003`

## Authentication

All pages except `/login` require authentication. Token is stored in localStorage.

## Project Structure

```
cms-frontend/
├── app/              # Next.js App Router pages
│   ├── login/        # Login page
│   └── dashboard/    # Dashboard page
├── components/       # React components (to be created)
└── lib/              # Utilities and API client
```

## API Integration

Frontend gọi API từ CMS Backend (Port 4001):
- Authentication API
- Projects API (CRUD)
- Leads API
- Dashboard API

## Build

```bash
npm run build
npm start
```

