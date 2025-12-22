# Cleanup Checklist - Files cần xóa sau khi verify

Sau khi verify tất cả projects hoạt động đúng, có thể xóa các file/folder sau ở root level:

## Files/Folders có thể xóa

### Frontend Code (đã di chuyển vào projects/public-frontend/)
- [ ] `app/` - Đã di chuyển
- [ ] `components/` - Đã di chuyển
- [ ] `lib/` - Đã di chuyển
- [ ] `hooks/` - Đã di chuyển
- [ ] `public/` - Đã di chuyển
- [ ] `cypress/` - Đã di chuyển
- [ ] `next.config.js` - Đã copy
- [ ] `tailwind.config.ts` - Đã copy
- [ ] `postcss.config.js` - Đã copy
- [ ] `tsconfig.json` - Đã copy
- [ ] `.eslintrc.json` - Đã copy
- [ ] `next-env.d.ts` - Đã copy
- [ ] `package.json` - Đã copy (nhưng có thể giữ để reference)
- [ ] `package-lock.json` - Có thể xóa (sẽ tạo lại khi npm install trong project)

### Backend Code (đã di chuyển vào projects/)
- [ ] `backend/` - Đã tách thành public-backend và cms-backend

### Documentation (có thể giữ hoặc di chuyển vào docs/)
- [ ] `CHECKLIST.md` - Có thể giữ hoặc move vào docs/
- [ ] `QUICK_START.md` - Có thể giữ hoặc move vào docs/
- [ ] `PROJECT_SUMMARY.md` - Có thể giữ hoặc move vào docs/
- [ ] `PHAN_TICH_DU_AN.md` - Có thể giữ hoặc move vào docs/
- [ ] `FULLPAGE_SCROLL_GUIDE.md` - Có thể move vào docs/DEVELOPMENT/
- [ ] `FOOTER_SCROLL_FIX.md` - Có thể move vào docs/DEVELOPMENT/
- [ ] `FULLPAGE_DEBUG_NOTES.md` - Có thể move vào docs/DEVELOPMENT/
- [ ] `LAYOUT_FIX_SUMMARY.md` - Có thể move vào docs/DEVELOPMENT/

### Scripts (có thể giữ hoặc di chuyển)
- [ ] `install.ps1` - Có thể giữ hoặc move vào scripts/
- [ ] `start.ps1` - Có thể giữ hoặc move vào scripts/

### Specs
- [ ] `dac_ta_du_an_web_bds.md` - Có thể move vào docs/

## Files/Folders NÊN GIỮ

- ✅ `README.md` - Main README
- ✅ `CHANGELOG.md` - Changelog
- ✅ `PROJECT_STRUCTURE.md` - Project structure doc
- ✅ `MIGRATION_SUMMARY.md` - Migration summary
- ✅ `.gitignore` - Git ignore
- ✅ `projects/` - All projects
- ✅ `shared/` - Shared resources
- ✅ `docs/` - Documentation
- ✅ `scripts/` - Automation scripts
- ✅ `delivery/` - Delivery package
- ✅ `configs/` - Configuration files

## Lưu ý

**KHÔNG XÓA** cho đến khi:
1. ✅ Tất cả projects đã được test và hoạt động đúng
2. ✅ Verify không có broken imports
3. ✅ Verify API calls hoạt động
4. ✅ Verify build thành công

## Verification Steps

1. Test Public Frontend:
   ```bash
   cd projects/public-frontend
   npm install
   npm run dev
   ```

2. Test Public Backend:
   ```bash
   cd projects/public-backend
   npm install
   npm run dev
   ```

3. Test CMS Backend:
   ```bash
   cd projects/cms-backend
   npm install
   npm run dev
   ```

4. Test CMS Frontend:
   ```bash
   cd projects/cms-frontend
   npm install
   npm run dev
   ```

Sau khi tất cả đều hoạt động, mới xóa code cũ.

