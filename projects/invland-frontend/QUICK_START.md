# QUICK REFERENCE GUIDE - Inland Real Estate

## 🚀 Quick Start (3 Steps)

### 1. Install Everything
```powershell
.\install.ps1
```

### 2. Start Development
```powershell
.\start.ps1
```

### 3. Open Browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

---

## 📁 Project Structure Quick Map

```
Homepage = app/page.tsx
Header = components/layout/Header.tsx
Footer = components/layout/Footer.tsx
API Client = lib/api.ts
Backend = backend/src/server.ts
Database = backend/src/database/schema.sql
```

---

## 🔑 Key Files to Know

### Frontend
- **Homepage:** `app/page.tsx` - Main fullpage scroll
- **Project List:** `app/mua-ban/page.tsx` - Buy/Sell listings
- **Project Detail:** `app/mua-ban/[slug]/page.tsx` - Single project
- **About:** `app/gioi-thieu/page.tsx` - About company
- **Contact:** Lead form in `components/sections/ContactSection.tsx`
- **API Calls:** `lib/api.ts` - All backend communication
- **Types:** `lib/types.ts` - TypeScript interfaces
- **Utils:** `lib/utils.ts` - Helper functions

### Backend
- **Server:** `backend/src/server.ts` - Express setup
- **Projects API:** `backend/src/routes/projects.ts` - CRUD operations
- **Leads API:** `backend/src/routes/leads.ts` - Form submissions
- **Database:** `backend/src/database/db.ts` - PostgreSQL connection
- **Schema:** `backend/src/database/schema.sql` - Table definitions

---

## 🎨 Customization Guide

### Change Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    600: '#0284c7',  // Change this
  }
}
```

### Modify Homepage Sections
Edit files in `components/sections/`:
- `HeroSection.tsx` - Hero banner
- `AboutSection.tsx` - Company info
- `ProjectsSection.tsx` - Featured projects
- `NewsSection.tsx` - Latest news
- `ContactSection.tsx` - Lead form

### Add New Page
1. Create file: `app/new-page/page.tsx`
2. Add link in Header: `components/layout/Header.tsx`
3. Add link in Footer: `components/layout/Footer.tsx`

### Add New API Endpoint
1. Create route file: `backend/src/routes/newroute.ts`
2. Import in: `backend/src/server.ts`
3. Add to: `app.use('/api/newroute', newRouteRouter)`

---

## 🗄️ Database Quick Commands

### View All Tables
```sql
\dt
```

### View Projects
```sql
SELECT * FROM projects;
```

### View Leads
```sql
SELECT * FROM leads ORDER BY created_at DESC;
```

### Add Sample Project
```sql
INSERT INTO projects (title, slug, location, price_min, status, thumbnail_url)
VALUES ('Test Project', 'test-project', 'Hanoi', 1000000000, 'dang-mo-ban', 'https://example.com/image.jpg');
```

---

## 🔧 Common Tasks

### Install New npm Package
```bash
# Frontend
npm install package-name

# Backend
cd backend
npm install package-name
```

### Update Environment Variable
Edit `.env.local` (frontend) or `backend/.env` (backend)

### Restart Servers
Press `Ctrl+C` in terminal, then run `npm run dev` again

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### Reset Database
```bash
cd backend
npm run migrate  # Runs schema.sql again
```

---

## 🐛 Troubleshooting

### "Cannot connect to database"
1. Check PostgreSQL is running
2. Verify `DATABASE_URL` in `backend/.env`
3. Ensure database exists: `createdb inland_realestate`

### "Port already in use"
Kill process on port:
```powershell
# Frontend (port 3000)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Backend (port 4000)
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### "Module not found"
```bash
npm install  # Re-install dependencies
```

### TypeScript Errors
These are expected until dependencies are installed. Run:
```bash
npm install
```

---

## 📞 API Testing

### Test Backend Health
```bash
curl http://localhost:4000/health
```

### Get Projects
```bash
curl http://localhost:4000/api/projects
```

### Submit Lead
```bash
curl -X POST http://localhost:4000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "0901234567",
    "email": "john@example.com",
    "message": "I am interested",
    "source": "homepage"
  }'
```

---

## 📊 Project Stats

- **Total Files:** 70+
- **Lines of Code:** 5,000+
- **Components:** 15+
- **API Endpoints:** 20+
- **Database Tables:** 6
- **Pages:** 10+

---

## 🎯 What's Where

### Want to change...
- **Logo:** `components/layout/Header.tsx` line 73
- **Hero background:** `components/sections/HeroSection.tsx` line 16
- **Contact info:** `components/layout/Footer.tsx` line 99
- **Company stats:** `components/sections/HeroSection.tsx` line 64
- **Featured projects count:** `components/sections/ProjectsSection.tsx` line 27
- **Meta tags:** Each page's `metadata` export
- **Colors:** `tailwind.config.ts`
- **Fonts:** `app/layout.tsx` line 5

---

## 🔐 Security Notes

- **Never commit** `.env` files
- **Change** `JWT_SECRET` before production
- **Update** database credentials for production
- **Enable** HTTPS in production
- **Configure** firewall rules

---

## 📚 Documentation Links

- **Next.js:** https://nextjs.org/docs
- **TailwindCSS:** https://tailwindcss.com/docs
- **Framer Motion:** https://www.framer.com/motion
- **Express:** https://expressjs.com
- **PostgreSQL:** https://www.postgresql.org/docs

---

## 💡 Pro Tips

1. Use `console.log()` for debugging
2. Check browser Console (F12) for frontend errors
3. Check terminal for backend errors
4. Use React DevTools for component inspection
5. Test on mobile using Chrome DevTools (F12 > Toggle device toolbar)

---

## 🎓 Learning Resources

- **React:** https://react.dev/learn
- **TypeScript:** https://www.typescriptlang.org/docs
- **SQL:** https://www.postgresql.org/docs/tutorial

---

**Need Help?** Check README.md and PROJECT_SUMMARY.md for detailed information.
