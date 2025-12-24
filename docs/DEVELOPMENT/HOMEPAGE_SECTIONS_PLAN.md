# Kế Hoạch Xử Lý 6 Sections Trang Chủ

## Tổng Quan

Trang chủ có 6 sections chính:
1. **Hero Section** (hero) - Section trang chủ
2. **Chuyển nhượng đất trong KCN** (chuyen-nhuong-kcn)
3. **Chuyển nhượng đất ngoài KCN** (chuyen-nhuong-ngoai-kcn)
4. **Cho Thuê** (cho-thue)
5. **Tin Tức** (tin-tuc)
6. **Báo giá ngay** (bao-gia-ngay)

---

## Section 1: Hero Section (hero)

### Trạng thái hiện tại
✅ **Đã hoàn thành**
- Component: `components/sections/HeroSection.tsx`
- Có search form với tabs (Chuyển nhượng / Cho thuê)
- Có parallax background effect
- Responsive (portrait/landscape)
- Uniform scaling với timeline

### Cần xử lý
- [ ] **Kiểm tra API integration**: Đảm bảo search form redirect đúng đến trang listing
- [ ] **Tối ưu hình ảnh**: Kiểm tra và tối ưu background image
- [ ] **SEO**: Thêm meta tags cho section
- [ ] **Accessibility**: Kiểm tra ARIA labels và keyboard navigation

### Tasks
1. Kiểm tra routing từ search form
2. Tối ưu performance (lazy load background image)
3. Thêm loading states nếu cần
4. Test responsive trên nhiều devices

---

## Section 2: Chuyển nhượng đất trong KCN (chuyen-nhuong-kcn)

### Trạng thái hiện tại
✅ **Component đã có**
- Component: `components/sections/IndustrialLandTransferKCNSection.tsx`
- Đang dùng dữ liệu mẫu: `sampleIndustrialParks` từ `@/lib/realEstateData`
- Filter: `park.land_price && park.code.startsWith('INL-KCN')`
- Hiển thị 6 cards đầu tiên
- Layout: Grid 3 cột (landscape) / 1 cột (portrait)

### Cần xử lý
- [ ] **Kết nối API thực tế**: Thay thế dữ liệu mẫu bằng API call
- [ ] **API Endpoint**: Tạo/kiểm tra endpoint `/api/properties?main_category=kcn&sub_category=trong-kcn&transaction_type=chuyen-nhuong`
- [ ] **Loading states**: Thêm skeleton/loading khi fetch data
- [ ] **Error handling**: Xử lý lỗi khi API fail
- [ ] **Empty state**: Hiển thị message khi không có data
- [ ] **Pagination**: Nút "Xem tất cả" link đến trang listing đầy đủ

### Tasks
1. **Backend**: Kiểm tra/tạo API endpoint cho properties
   - Filter: `main_category='kcn'`, `sub_category='trong-kcn'`, `transaction_type='chuyen-nhuong'`
   - Limit: 6 items
   - Sort: `created_at DESC` hoặc `featured` first
2. **Frontend**: Tạo API service function
   - File: `lib/api.ts` hoặc `lib/properties-api.ts`
   - Function: `getPropertiesChuyenNhuongTrongKCN(limit: number)`
3. **Component**: Update component để fetch từ API
   - Thêm `useState` cho data, loading, error
   - Thêm `useEffect` để fetch data
   - Thêm loading skeleton
   - Thêm error boundary
4. **Testing**: Test với data thực tế từ database

### API Specification
```typescript
GET /api/properties?main_category=kcn&sub_category=trong-kcn&transaction_type=chuyen-nhuong&limit=6&status=available

Response:
{
  success: true,
  data: Property[],
  pagination?: {...}
}
```

---

## Section 3: Chuyển nhượng đất ngoài KCN (chuyen-nhuong-ngoai-kcn)

### Trạng thái hiện tại
✅ **Component đã có**
- Component: `components/sections/ProjectsSection.tsx` (export name: `IndustrialLandTransferOutsideKCNSection`)
- Đang dùng dữ liệu mẫu: `sampleIndustrialParks`
- Filter: `park.land_price && park.code.startsWith('INL-CCN')`
- Hiển thị 6 cards đầu tiên

### Cần xử lý
- [ ] **Kết nối API thực tế**: Tương tự section 2
- [ ] **API Endpoint**: `/api/properties?main_category=kcn&sub_category=ngoai-kcn&transaction_type=chuyen-nhuong`
- [ ] **Loading states**: Skeleton/loading
- [ ] **Error handling**: Xử lý lỗi
- [ ] **Empty state**: Message khi không có data

### Tasks
1. **Backend**: API endpoint
   - Filter: `main_category='kcn'`, `sub_category='ngoai-kcn'`, `transaction_type='chuyen-nhuong'`
2. **Frontend**: API service function
   - Function: `getPropertiesChuyenNhuongNgoaiKCN(limit: number)`
3. **Component**: Update để fetch từ API
4. **Testing**: Test với data thực tế

### API Specification
```typescript
GET /api/properties?main_category=kcn&sub_category=ngoai-kcn&transaction_type=chuyen-nhuong&limit=6&status=available
```

---

## Section 4: Cho Thuê (cho-thue)

### Trạng thái hiện tại
✅ **Component đã có**
- Component: `components/sections/PortfolioSection.tsx` (export name: `IndustrialLeaseSection`)
- Đang dùng dữ liệu mẫu: `sampleIndustrialParks`
- Filter: `park.rental_price_min && park.rental_price_max`
- Hiển thị 6 cards đầu tiên
- Có background image với overlay

### Cần xử lý
- [ ] **Kết nối API thực tế**: Tương tự section 2, 3
- [ ] **API Endpoint**: `/api/properties?transaction_type=cho-thue`
- [ ] **Loading states**: Skeleton/loading
- [ ] **Error handling**: Xử lý lỗi
- [ ] **Empty state**: Message khi không có data
- [ ] **Price display**: Format giá thuê đúng (VND/tháng hoặc USD/m²/tháng)

### Tasks
1. **Backend**: API endpoint
   - Filter: `transaction_type='cho-thue'`
   - Có thể filter thêm: `main_category='kcn'` hoặc cả KCN và BDS
2. **Frontend**: API service function
   - Function: `getPropertiesChoThue(limit: number)`
3. **Component**: Update để fetch từ API
4. **Testing**: Test với data thực tế

### API Specification
```typescript
GET /api/properties?transaction_type=cho-thue&limit=6&status=available
```

---

## Section 5: Tin Tức (tin-tuc)

### Trạng thái hiện tại
✅ **Component đã có**
- Component: `components/sections/NewsSection.tsx`
- Đang dùng dữ liệu mẫu: `newsArticles` và `jobPostings` từ `@/lib/newsData` và `@/lib/careersData`
- Có tabs để filter theo category
- Layout: 2 cột, mỗi cột 3 bài viết

### Cần xử lý
- [ ] **Kết nối API thực tế**: Thay thế dữ liệu mẫu bằng API call
- [ ] **API Endpoint**: `/api/posts?category=...&limit=6`
- [ ] **Loading states**: Skeleton/loading khi fetch
- [ ] **Error handling**: Xử lý lỗi
- [ ] **Category tabs**: Đảm bảo tabs hoạt động với API
- [ ] **Job postings**: Tách riêng hoặc tích hợp vào posts API

### Tasks
1. **Backend**: Kiểm tra/tạo API endpoint cho posts
   - Endpoint: `GET /api/posts?category=...&limit=6`
   - Support categories: `tin-thi-truong`, `quy-hoach-chinh-sach`, `tu-van-hoi-dap`
   - Job postings: `GET /api/jobs?limit=6` (hoặc tích hợp vào posts)
2. **Frontend**: API service function
   - Function: `getPosts(category: string, limit: number)`
   - Function: `getJobs(limit: number)` (nếu tách riêng)
3. **Component**: Update để fetch từ API
   - Fetch data khi `activeCategory` thay đổi
   - Loading state khi switching category
4. **Testing**: Test với data thực tế

### API Specification
```typescript
GET /api/posts?category=tin-thi-truong&limit=6&status=published
GET /api/jobs?limit=6&status=active
```

---

## Section 6: Báo giá ngay (bao-gia-ngay)

### Trạng thái hiện tại
✅ **Component đã có**
- Component: `components/sections/ContactSection.tsx`
- Đã tích hợp API: `api.createLead(leadData)`
- Form fields: name, phone, need, location, otherRequest
- Có validation và success/error states

### Cần xử lý
- [ ] **Kiểm tra API integration**: Đảm bảo API endpoint hoạt động
- [ ] **Form validation**: Kiểm tra lại validation rules
- [ ] **Success feedback**: Cải thiện UX sau khi submit thành công
- [ ] **Error handling**: Xử lý lỗi tốt hơn
- [ ] **Loading states**: Đảm bảo loading state rõ ràng
- [ ] **Accessibility**: Kiểm tra ARIA labels

### Tasks
1. **Backend**: Kiểm tra API endpoint `/api/leads`
   - Đảm bảo endpoint hoạt động
   - Kiểm tra validation
   - Kiểm tra response format
2. **Frontend**: Cải thiện component
   - Thêm better error messages
   - Cải thiện success feedback (có thể thêm animation)
   - Thêm form reset sau success
3. **Testing**: Test form submission
   - Test với valid data
   - Test với invalid data
   - Test với network errors

### API Specification
```typescript
POST /api/leads
Body: {
  name: string,
  phone: string,
  email?: string,
  message: string,
  source: 'homepage'
}
```

---

## Tổng Hợp Tasks Chung

### 1. Backend API Development
- [ ] **Properties API**: Tạo/kiểm tra endpoints cho properties
  - `GET /api/properties` với filters
  - Support pagination
  - Support sorting (featured, newest, price)
- [ ] **Posts API**: Kiểm tra/tạo endpoints cho posts
  - `GET /api/posts` với category filter
  - Support pagination
- [ ] **Leads API**: Kiểm tra endpoint `/api/leads`
  - Validation
  - Error handling
  - Response format

### 2. Frontend API Integration
- [ ] **API Service Layer**: Tạo/update API service functions
  - File: `lib/api.ts` hoặc tách riêng `lib/properties-api.ts`, `lib/posts-api.ts`
  - Functions cho mỗi section
  - Error handling
  - Type definitions
- [ ] **Type Definitions**: Đảm bảo types đầy đủ
  - Property type
  - Post type
  - Lead type
  - API response types

### 3. Component Updates
- [ ] **Loading States**: Thêm skeleton/loading cho tất cả sections
- [ ] **Error Boundaries**: Xử lý lỗi gracefully
- [ ] **Empty States**: Hiển thị message khi không có data
- [ ] **Performance**: Optimize re-renders, lazy loading

### 4. Testing
- [ ] **Unit Tests**: Test API functions
- [ ] **Integration Tests**: Test component với API
- [ ] **E2E Tests**: Test user flows
- [ ] **Performance Tests**: Test loading times

### 5. Documentation
- [ ] **API Documentation**: Update API docs
- [ ] **Component Documentation**: JSDoc comments
- [ ] **Usage Examples**: Examples cho mỗi section

---

## Thứ Tự Ưu Tiên

### Phase 1: Core Functionality (Ưu tiên cao)
1. ✅ Hero Section - Kiểm tra và tối ưu
2. ✅ Báo giá ngay - Kiểm tra API integration
3. ⚠️ Chuyển nhượng đất trong KCN - Kết nối API
4. ⚠️ Chuyển nhượng đất ngoài KCN - Kết nối API
5. ⚠️ Cho Thuê - Kết nối API
6. ⚠️ Tin Tức - Kết nối API

### Phase 2: Enhancements (Ưu tiên trung bình)
- Loading states
- Error handling
- Empty states
- Performance optimization

### Phase 3: Polish (Ưu tiên thấp)
- Animations
- Accessibility improvements
- SEO optimization
- Analytics integration

---

## Notes

- Tất cả sections đều sử dụng uniform scaling với timeline
- Responsive design: portrait và landscape modes
- Cần đảm bảo consistency giữa các sections
- API endpoints cần support filtering và pagination
- Cần handle edge cases (no data, errors, loading)

---

## Files Cần Tạo/Update

### Backend
- `projects/inlandv-backend/src/routes/properties.ts` (nếu chưa có)
- `projects/inlandv-backend/src/controllers/propertiesController.ts` (nếu chưa có)

### Frontend
- `projects/inlandv-frontend/lib/properties-api.ts` (mới)
- `projects/inlandv-frontend/lib/posts-api.ts` (nếu cần)
- `projects/inlandv-frontend/components/sections/IndustrialLandTransferKCNSection.tsx` (update)
- `projects/inlandv-frontend/components/sections/ProjectsSection.tsx` (update)
- `projects/inlandv-frontend/components/sections/PortfolioSection.tsx` (update)
- `projects/inlandv-frontend/components/sections/NewsSection.tsx` (update)
- `projects/inlandv-frontend/components/sections/ContactSection.tsx` (kiểm tra)

### Types
- `shared/types/index.ts` (update với Property, Post types)

