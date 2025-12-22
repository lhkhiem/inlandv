# Inland Real Estate - Full-Stack Website

A modern, full-featured real estate website built with **Next.js 14**, **Node.js**, **Express**, and **PostgreSQL**. Features fullpage scrolling, animations, and comprehensive real estate management functionality.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Express Validator** - Input validation

### Features
- ✅ Fullpage scroll with smooth transitions
- ✅ Responsive design (mobile-first)
- ✅ SEO optimized (SSR, metadata, sitemap)
- ✅ Real-time form validation
- ✅ Project listings with filters
- ✅ Blog/News system
- ✅ Job board
- ✅ Lead management
- ✅ Admin authentication
- ✅ Image optimization
- ✅ Rate limiting & security headers

## 📁 Project Structure

```
Inlandv/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   ├── globals.css              # Global styles
│   ├── sitemap.ts               # Auto-generated sitemap
│   ├── robots.ts                # SEO robots file
│   ├── gioi-thieu/             # About page
│   ├── mua-ban/                # Buy/Sell listings
│   │   └── [slug]/             # Project detail pages
│   ├── cho-thue/               # Rental listings
│   ├── tin-tuc/                # News/Blog
│   ├── tuyen-dung/             # Jobs
│   └── lien-he/                # Contact
├── components/
│   ├── sections/               # Homepage sections
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── NewsSection.tsx
│   │   └── ContactSection.tsx
│   ├── layout/                 # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── FullpageScroll.tsx     # Scroll system
├── lib/
│   ├── api.ts                  # API client
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Utility functions
├── backend/
│   ├── src/
│   │   ├── server.ts           # Express server
│   │   ├── database/
│   │   │   ├── db.ts           # PostgreSQL connection
│   │   │   ├── schema.sql      # Database schema
│   │   │   └── migrate.ts      # Migration script
│   │   └── routes/             # API routes
│   │       ├── projects.ts
│   │       ├── listings.ts
│   │       ├── posts.ts
│   │       ├── leads.ts
│   │       ├── jobs.ts
│   │       └── auth.ts
│   ├── package.json
│   └── tsconfig.json
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

### 1. Clone & Install Dependencies

```bash
cd "d:\Client Website Frontend\Inlandv"

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb inland_realestate

# Or using psql
psql -U postgres
CREATE DATABASE inland_realestate;
\q
```

### 3. Environment Configuration

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

**Backend (backend/.env):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/inland_realestate
PORT=4000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### 4. Run Database Migration

```bash
cd backend
npm run migrate
```

This will create all tables and insert sample data.

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# App runs on http://localhost:3000
```

## 📡 API Endpoints

### Projects
- `GET /api/projects` - List all projects (with filters & pagination)
- `GET /api/projects/featured` - Get featured projects
- `GET /api/projects/:slug` - Get project by slug
- `POST /api/projects` - Create project (admin)
- `PUT /api/projects/:id` - Update project (admin)
- `DELETE /api/projects/:id` - Delete project (admin)

### Listings
- `GET /api/listings` - List all listings
- `GET /api/listings/:id` - Get listing by ID

### Posts
- `GET /api/posts` - List all posts
- `GET /api/posts/featured` - Get featured posts
- `GET /api/posts/:slug` - Get post by slug

### Leads
- `POST /api/leads` - Submit lead form
- `GET /api/leads` - Get all leads (admin)

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:slug` - Get job by slug

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

## 🎨 Key Features Implementation

### Fullpage Scroll System
Located in `components/FullpageScroll.tsx`, supports:
- Mouse wheel navigation
- Keyboard navigation (Arrow keys, Page Up/Down)
- Smooth section transitions
- Numbered indicators (01, 02, 03...)
- Mobile-friendly

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Hamburger menu on mobile
- Touch-optimized interactions

### SEO Optimization
- Server-side rendering (SSR)
- Dynamic meta tags per page
- Auto-generated sitemap (`/sitemap.xml`)
- Robots.txt configuration
- Open Graph tags
- Structured data ready

## 🔒 Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting
- JWT authentication
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- XSS protection
- Input validation

## 🚢 Production Deployment

### Build Frontend
```bash
npm run build
npm start
```

### Build Backend
```bash
cd backend
npm run build
npm start
```

### Environment Variables (Production)
Update all `.env` files with production values:
- Change `DATABASE_URL` to production database
- Update `NEXT_PUBLIC_API_URL` to production API
- Change `JWT_SECRET` to strong secret
- Set `NODE_ENV=production`
- Configure `CORS_ORIGIN` to production domain

### Deployment Options
- **Frontend:** Vercel, Netlify, or VPS with Nginx
- **Backend:** VPS (Ubuntu + PM2), Docker, or cloud platforms
- **Database:** Managed PostgreSQL (AWS RDS, DigitalOcean, etc.)

## 📝 Database Schema

### Tables
- **users** - Admin & sales users
- **projects** - Real estate projects
- **listings** - Individual properties
- **posts** - News & blog articles
- **leads** - Customer inquiries
- **jobs** - Job postings

All tables include timestamps and use UUID as primary keys.

## 🎯 Future Enhancements

- [ ] Advanced search with Elasticsearch
- [ ] Virtual tour integration (360° photos)
- [ ] Mortgage calculator
- [ ] Property comparison tool
- [ ] Email notifications
- [ ] Admin dashboard (CMS)
- [ ] Social media integration
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] PDF export for price lists

## 📄 License

This project is private and proprietary.

## 👥 Support

For questions or issues, contact the development team.

---

**Built with ❤️ for Inland Real Estate**
