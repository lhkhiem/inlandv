# Hệ Thống Fullpage Scroll - Hướng Dẫn Sử Dụng

## Tổng quan

Hệ thống fullpage scrolling được thiết kế theo mẫu của **khaihoanland.vn** với các tính năng:

- ✅ Mỗi scroll chuột = chuyển 1 section (không scroll từng pixel)
- ✅ Animation mượt mà với Framer Motion
- ✅ Timeline navigation bên phải (01, 02, 03...)
- ✅ Hỗ trợ keyboard (Arrow Up/Down, Page Up/Down, Home, End)
- ✅ Touch/swipe trên mobile
- ✅ Debounced scroll để tránh spam
- ✅ Tooltip hiển thị tên section khi hover
- ✅ SSR-friendly với Next.js App Router

---

## Các Component Chính

### 1. `<FullpageScroll />`

Component wrapper chính quản lý toàn bộ logic scroll.

**Props:**
```typescript
interface FullpageScrollProps {
  children: React.ReactNode[]      // Mảng các section
  sections: SectionData[]          // Metadata của các section
  showIndicators?: boolean         // Hiển thị timeline nav (default: true)
}

interface SectionData {
  id: string                       // ID unique
  index: number                    // Thứ tự (0-based)
  title: string                    // Tiêu đề hiển thị trong tooltip
}
```

**Features:**
- Mouse wheel navigation với debounce
- Keyboard navigation (Arrow keys, Page Up/Down, Home, End)
- Touch events cho mobile (swipe up/down)
- Scroll locking trong khi transition
- Auto-detect active section

---

### 2. `<Section />` 

Component container cho mỗi section fullscreen.

**Props:**
```typescript
interface SectionProps {
  id: string                       // Section ID
  index: number                    // Thứ tự section
  title: string                    // Tiêu đề
  children: ReactNode              // Nội dung
  className?: string               // Custom classes
  isActive?: boolean               // Section đang active (auto-injected)
  background?: string              // Background class (default: 'bg-white')
}
```

**Features:**
- Full-screen height (min-h-screen)
- Fade + slide animation khi active
- Hỗ trợ custom background

---

### 3. `<TimelineNav />`

Navigation bar dọc bên phải màn hình (như khaihoanland.vn).

**Features:**
- Numbered indicators (01, 02, 03...)
- Active section highlighted (trắng + to hơn)
- Tooltip hiển thị tên section khi hover
- Click để jump đến section
- Responsive (ẩn trên mobile nhỏ)

---

## Cách Sử Dụng

### Cơ Bản

```tsx
// app/page.tsx
import FullpageScroll, { SectionData } from '@/components/FullpageScroll'
import HeroSection from '@/components/sections/HeroSection'
import AboutSection from '@/components/sections/AboutSection'
import ProjectsSection from '@/components/sections/ProjectsSection'
import NewsSection from '@/components/sections/NewsSection'
import ContactSection from '@/components/sections/ContactSection'

const sections: SectionData[] = [
  { id: 'hero', index: 0, title: 'Trang chủ' },
  { id: 'gioi-thieu', index: 1, title: 'Giới thiệu' },
  { id: 'du-an', index: 2, title: 'Dự án' },
  { id: 'tin-tuc', index: 3, title: 'Tin tức' },
  { id: 'lien-he', index: 4, title: 'Liên hệ' },
]

export default function HomePage() {
  return (
    <FullpageScroll sections={sections}>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <NewsSection />
      <ContactSection />
    </FullpageScroll>
  )
}
```

### Tạo Section Mới

```tsx
// components/sections/MySection.tsx
'use client'

import { motion } from 'framer-motion'

export default function MySection() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container-custom"
      >
        <h2 className="text-4xl font-bold">My Section Content</h2>
      </motion.div>
    </section>
  )
}
```

**Lưu ý:**
- Section phải có `height: 100vh` hoặc class `h-screen`
- Nên sử dụng Framer Motion cho animations
- Đảm bảo content responsive trên mobile

---

## Tùy Chỉnh Timeline Navigation

### Thay đổi vị trí

```tsx
// components/FullpageScroll.tsx - Line ~160
<nav className="fixed right-6 md:right-12 top-1/2 -translate-y-1/2 z-50">
  {/* ... */}
</nav>
```

### Thay đổi style indicators

```tsx
// Trong TimelineNav component
<div className={`
  text-sm font-bold transition-all duration-300 text-right
  ${isActive 
    ? 'text-blue-500 text-base scale-110'  // Custom active style
    : 'text-gray-400 hover:text-gray-600'
  }
`}>
  {String(index + 1).padStart(2, '0')}
</div>
```

### Ẩn timeline nav

```tsx
<FullpageScroll sections={sections} showIndicators={false}>
  {/* ... */}
</FullpageScroll>
```

---

## Scroll Behavior

### Cấu hình thời gian transition

```tsx
// components/FullpageScroll.tsx - Line ~36
scrollTimeoutRef.current = setTimeout(() => {
  setIsScrolling(false)
}, 1000)  // Thay đổi thời gian lock (ms)
```

### Thay đổi độ nhạy scroll

```tsx
// components/FullpageScroll.tsx - Line ~50
if (Math.abs(deltaY) < 10) return  // Tăng giá trị = ít nhạy hơn
```

### Thay đổi độ nhạy swipe mobile

```tsx
// components/FullpageScroll.tsx - Line ~103
if (Math.abs(deltaY) > 50) {  // Tăng = cần swipe mạnh hơn
  // ...
}
```

---

## Animation Options

### Thay đổi animation sections

```tsx
// components/FullpageScroll.tsx - Line ~140
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -50 }}
  transition={{ 
    duration: 0.8,                    // Thời gian animation
    ease: [0.22, 1, 0.36, 1]         // Cubic bezier curve
  }}
>
```

### Các animation styles khác

```tsx
// Fade only
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}

// Slide from right
initial={{ opacity: 0, x: 100 }}
animate={{ opacity: 1, x: 0 }}

// Scale + fade
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}

// Rotate + fade
initial={{ opacity: 0, rotate: -5 }}
animate={{ opacity: 1, rotate: 0 }}
```

---

## Responsive Design

### Mobile optimization

Timeline navigation tự động ẩn trên màn hình < 768px:

```tsx
// Trong TimelineNav component
<nav className="fixed right-6 md:right-8 ... hidden md:flex">
```

### Section height mobile

```css
/* globals.css */
.fullpage-section {
  min-height: 100vh;
  min-height: 100dvh;  /* Dynamic viewport height cho mobile */
}
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ↓ Arrow Down | Scroll đến section tiếp theo |
| ↑ Arrow Up | Scroll về section trước |
| Page Down | Scroll đến section tiếp theo |
| Page Up | Scroll về section trước |
| Home | Jump về section đầu tiên |
| End | Jump đến section cuối cùng |

---

## Troubleshooting

### Scroll bị lag/jerk

**Nguyên nhân:** Animation quá nặng trong sections

**Giải pháp:**
- Giảm số lượng Framer Motion animations
- Sử dụng CSS transforms thay vì thuộc tính layout
- Optimize images với next/image

### Timeline nav không hiển thị

**Kiểm tra:**
- `showIndicators={true}` trong props
- z-index đủ cao (hiện tại: z-50)
- Màu sắc text phù hợp với background

### Section không đúng height

**Giải pháp:**
```tsx
// Đảm bảo section có:
className="h-screen min-h-screen"

// Hoặc trong CSS:
.fullpage-section {
  min-height: 100vh;
}
```

### Touch scroll không hoạt động mobile

**Kiểm tra:**
- Event listeners được add đúng cách
- `{ passive: false }` cho touchmove
- Minimum swipe distance (hiện tại: 50px)

---

## Best Practices

### 1. Section Content Structure

```tsx
export default function Section() {
  return (
    <section className="relative h-screen flex items-center justify-center">
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        {/* Background image/gradient */}
      </div>

      {/* Content layer */}
      <div className="relative z-10 container-custom">
        <motion.div {...animationProps}>
          {/* Your content */}
        </motion.div>
      </div>
    </section>
  )
}
```

### 2. Performance Optimization

- Lazy load images outside viewport
- Use `next/image` cho tự động optimization
- Minimize số lượng animations per section
- Sử dụng `will-change` cho animated elements

### 3. Accessibility

```tsx
// Thêm ARIA labels
<button aria-label="Chuyển đến Giới thiệu">
<nav aria-label="Section navigation">

// Screen reader support
<span className="sr-only">Tên section</span>
```

---

## So Sánh với Khaihoanland.vn

| Feature | Khaihoanland | Implementation này |
|---------|--------------|-------------------|
| Fullpage scroll | ✅ | ✅ |
| Timeline navigation | ✅ | ✅ |
| Numbered indicators | ✅ | ✅ |
| Smooth transitions | ✅ | ✅ |
| Mobile swipe | ✅ | ✅ |
| Keyboard support | ✅ | ✅ |
| Tooltip on hover | ✅ | ✅ |
| Scroll hint | ✅ | ✅ |

---

## Files Structure

```
components/
├── FullpageScroll.tsx      # Main wrapper với scroll logic
├── Section.tsx             # Section container component
└── sections/
    ├── HeroSection.tsx     # Section 1
    ├── AboutSection.tsx    # Section 2
    ├── ProjectsSection.tsx # Section 3
    ├── NewsSection.tsx     # Section 4
    └── ContactSection.tsx  # Section 5

app/
└── page.tsx               # Homepage sử dụng FullpageScroll
```

---

## Technologies Used

- **Next.js 14** - React framework với App Router
- **Framer Motion 11** - Animation library
- **TypeScript** - Type safety
- **TailwindCSS 3** - Utility-first CSS
- **React Hooks** - useState, useEffect, useCallback, useRef

---

## Next Steps

1. **Add more sections** - Mở rộng số lượng sections
2. **Custom animations** - Tạo animations độc đáo cho từng section
3. **Progress bar** - Thêm progress indicator ở top
4. **Section anchors** - Thêm URL hash navigation (#section-2)
5. **Horizontal scroll** - Implement scroll ngang trong một section
6. **Video backgrounds** - Thêm video background cho Hero section

---

## Support

Nếu cần hỗ trợ hoặc có câu hỏi:
- Xem lại code trong `components/FullpageScroll.tsx`
- Tham khảo Framer Motion docs: https://www.framer.com/motion/
- Next.js docs: https://nextjs.org/docs

---

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** November 2025
