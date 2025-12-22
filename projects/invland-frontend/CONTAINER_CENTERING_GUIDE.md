# Hướng Dẫn: Container Căn Giữa Viewport và Max-Width

## Tổng Quan

Tài liệu này mô tả cách tạo container căn giữa viewport thiết bị ở cả 2 chiều (ngang và dọc), tính toán max-width động để đảm bảo không đè lên timeline, và áp dụng cùng z-index với timeline.

## Mục Tiêu

1. ✅ Đóng nội dung section vào một container
2. ✅ Căn giữa container trên màn hình thiết bị ở cả 2 chiều
3. ✅ Tính toán max-width động dựa trên timeline position
4. ✅ Đưa container về cùng z-index với timeline (z-[90])
5. ✅ Đảm bảo container cách timeline tối thiểu 15px ở mọi kích thước màn

---

## Kiến Trúc

### 1. Cấu Trúc Component

```
<section> (h-screen, relative)
  ├─ Background (absolute, z-0)
  ├─ Overlay (absolute, z-10)
  └─ Wrapper Container (absolute, z-[90], căn giữa viewport)
      └─ Content Container (max-width động, scale như canvas)
          └─ Nội dung section
```

### 2. Z-Index Hierarchy

- **Background**: `z-0`
- **Overlay**: `z-10`
- **Timeline**: `z-[90]`
- **Container Wrapper**: `z-[90]` (cùng với timeline)
- **Content Container**: `z-[90]` (kế thừa từ wrapper)

---

## Implementation Guide

### Bước 1: Import Dependencies

```tsx
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'
```

### Bước 2: Khai Báo State và Hooks

```tsx
export default function YourSection() {
  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  
  // Uniform scaling hook
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.0)
  
  // State cho scale và max-width
  const [adjustedScale, setAdjustedScale] = useState(1)
  const [maxContainerWidth, setMaxContainerWidth] = useState<number | undefined>(undefined)
  
  const [isPortrait, setIsPortrait] = useState(false)
  
  useEffect(() => {
    setIsPortrait(!isLandscape)
  }, [isLandscape])
  
  // ... rest of component
}
```

### Bước 3: Tính Toán Max-Width và Scale

```tsx
useEffect(() => {
  if (typeof window === 'undefined' || !isLandscape) {
    setAdjustedScale(1)
    setMaxContainerWidth(undefined)
    return
  }
  
  const viewportWidth = viewport.width || window.innerWidth
  const viewportHeight = viewport.height || window.innerHeight
  
  // Timeline right padding: md:right-10 (40px) hoặc right-6 (24px)
  const timelineRightPadding = viewportWidth >= 768 ? 40 : 24
  
  // Timeline left edge = viewportWidth - timelineRightPadding - timelineWidth
  const timelineLeftEdge = viewportWidth - timelineRightPadding - timelineWidth
  
  // Nội dung căn giữa viewport thiết bị
  const centerX = viewportWidth / 2
  
  // Max content width (sau scale) để không chạm timeline
  // Content right edge sau scale phải <= timelineLeftEdge - 15px (buffer tối thiểu)
  // Content right edge = centerX + (scaledWidth / 2)
  // => scaledWidth <= 2 * (timelineLeftEdge - 15 - centerX)
  const maxScaledContentWidth = Math.max(0, 2 * (timelineLeftEdge - 15 - centerX))
  
  // Reference content width at FullHD (1920px)
  const referenceContentWidth = 1920
  
  // Calculate scale based on timeline constraint
  const scaleByTimeline = maxScaledContentWidth > 0 
    ? maxScaledContentWidth / referenceContentWidth 
    : uniformScale
  
  // Use the smaller of uniform scale and timeline-constrained scale
  const finalScale = Math.min(uniformScale, scaleByTimeline)
  
  // Clamp scale between 0.5 and 1.0
  const clampedScale = Math.max(0.5, Math.min(1.0, finalScale))
  
  // Tính max-width theo công thức:
  // Max-width = Ngang màn hình - 2x(Ngang bộ timeline + khoảng cách từ mép màn hình đến mép phải timeline + 15px)
  const maxWidthBeforeScale = viewportWidth - 2 * (timelineWidth + timelineRightPadding + 15)
  
  setAdjustedScale(clampedScale)
  setMaxContainerWidth(maxWidthBeforeScale)
}, [uniformScale, isLandscape, timelineWidth, viewport])
```

### Bước 4: Render Structure

```tsx
return (
  <section 
    className={`relative w-full flex items-center justify-center overflow-hidden ${
      isPortrait ? 'min-h-0 py-4' : 'h-screen'
    }`}
  >
    {/* Background */}
    <div className="absolute inset-0 z-0">
      {/* Background content */}
    </div>
    
    {/* Overlay */}
    <div className="absolute inset-0 z-10 bg-black/70" />
    
    {/* Wrapper Container - Căn giữa viewport hoàn toàn */}
    {/* Cùng z-index với timeline (z-[90]) */}
    <div 
      className={`relative z-[90] ${
        isPortrait 
          ? 'w-full flex flex-col justify-start px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20' 
          : 'absolute inset-0 flex items-center justify-center'
      }`}
      style={isPortrait ? { 
        paddingTop: `${headerHeight + 15}px` 
      } : {}}
    >
      {/* Content Container - Max-width động, scale như canvas */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={isPortrait ? 'w-full' : 'w-full'}
        style={!isPortrait ? {
          // Max-width động để đảm bảo không chạm timeline
          maxWidth: maxContainerWidth ? `${maxContainerWidth}px` : '1280px', // fallback
          // Padding đối xứng 15px mỗi bên (theo layout ảnh)
          paddingLeft: '15px',
          paddingRight: '15px',
          // Scale toàn bộ content container như canvas
          transform: `scale(${adjustedScale})`,
          transformOrigin: 'center center',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        } : {}}
      >
        {/* Nội dung section - Tất cả căn giữa */}
        <div className="flex flex-col items-center text-center">
          {/* Your content here */}
        </div>
      </motion.div>
    </div>
  </section>
)
```

---

## Công Thức Tính Max-Width

### Công Thức

```
Max-width = Ngang màn hình - 2x(Ngang bộ timeline + khoảng cách từ mép màn hình đến mép phải timeline + 15px)
```

### Code Implementation

```typescript
const maxWidth = viewportWidth - 2 * (timelineWidth + timelineRightPadding + 15)
```

### Giải Thích

- **viewportWidth**: Chiều ngang màn hình thiết bị
- **timelineWidth**: Chiều ngang bộ timeline (đo động từ `useLayoutMeasurements`)
- **timelineRightPadding**: 
  - `40px` nếu viewport >= 768px (md:right-10)
  - `24px` nếu viewport < 768px (right-6)
- **15px**: Buffer tối thiểu giữa container và timeline

### Ví Dụ Tính Toán

**Màn hình 1920px (FullHD):**
- `timelineWidth` = 200px
- `timelineRightPadding` = 40px
- `maxWidth` = 1920 - 2 * (200 + 40 + 15) = 1920 - 510 = **1410px**

**Màn hình 1366px (Laptop):**
- `timelineWidth` = 180px
- `timelineRightPadding` = 40px
- `maxWidth` = 1366 - 2 * (180 + 40 + 15) = 1366 - 470 = **896px**

---

## Căn Giữa Container

### Horizontal Centering

```tsx
// Wrapper container
className="absolute inset-0 flex items-center justify-center"
```

- `absolute inset-0`: Chiếm toàn bộ viewport
- `flex items-center justify-center`: Căn giữa cả ngang và dọc

### Vertical Centering

Container tự động căn giữa nhờ flexbox của wrapper. Không cần thêm padding top/bottom để tránh làm lệch vị trí.

---

## Z-Index Management

### Timeline Z-Index

Timeline có `z-[90]` (từ `TimelineNav.tsx`):

```tsx
<nav className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-[90] ...">
```

### Container Z-Index

Container wrapper cũng dùng `z-[90]` để cùng layer với timeline:

```tsx
<div className="relative z-[90] ...">
```

### Lý Do

- Container và timeline cùng z-index cho phép xử lý overlap đúng cách
- Container có max-width đảm bảo không đè lên timeline
- Nếu có overlap, timeline sẽ hiển thị trên container (do thứ tự DOM)

---

## Scale và Transform

### Uniform Scaling

Container được scale theo uniform scale algorithm:

```tsx
transform: `scale(${adjustedScale})`,
transformOrigin: 'center center',
```

### Scale Calculation

1. **Uniform Scale**: `min(viewportWidth / 1920, viewportHeight / 1080)`
2. **Timeline Constraint**: Tính scale dựa trên không gian còn lại
3. **Final Scale**: `min(uniformScale, scaleByTimeline)`

### Transform Origin

- `transformOrigin: 'center center'`: Scale từ tâm container
- Đảm bảo container vẫn căn giữa sau khi scale

---

## Checklist Áp Dụng Cho Section Mới

### ✅ Bước 1: Setup Hooks và State

- [ ] Import `useLayoutMeasurements`
- [ ] Import `useCanvasScale`
- [ ] Khai báo state: `adjustedScale`, `maxContainerWidth`
- [ ] Detect portrait/landscape

### ✅ Bước 2: Tính Toán Max-Width và Scale

- [ ] Tính `timelineRightPadding` (40px hoặc 24px)
- [ ] Tính `timelineLeftEdge`
- [ ] Tính `maxScaledContentWidth`
- [ ] Tính `scaleByTimeline`
- [ ] Tính `finalScale` (clamped)
- [ ] Tính `maxWidthBeforeScale` theo công thức

### ✅ Bước 3: Render Structure

- [ ] Section wrapper với `h-screen` (landscape)
- [ ] Background layer (`z-0`)
- [ ] Overlay layer (`z-10`)
- [ ] Wrapper container (`z-[90]`, `absolute inset-0 flex items-center justify-center`)
- [ ] Content container với `maxWidth` động và `transform: scale()`
- [ ] Nội dung bên trong căn giữa

### ✅ Bước 4: Testing

- [ ] Container căn giữa viewport ở cả 2 chiều
- [ ] Max-width đúng theo công thức
- [ ] Container cách timeline tối thiểu 15px
- [ ] Scale hoạt động đúng trên các màn hình khác nhau
- [ ] Portrait mode không bị ảnh hưởng

---

## Template Code

### Full Template

```tsx
'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'

export default function YourSection() {
  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.0)
  
  const [adjustedScale, setAdjustedScale] = useState(1)
  const [maxContainerWidth, setMaxContainerWidth] = useState<number | undefined>(undefined)
  const [isPortrait, setIsPortrait] = useState(false)
  
  useEffect(() => {
    setIsPortrait(!isLandscape)
  }, [isLandscape])
  
  useEffect(() => {
    if (typeof window === 'undefined' || !isLandscape) {
      setAdjustedScale(1)
      setMaxContainerWidth(undefined)
      return
    }
    
    const viewportWidth = viewport.width || window.innerWidth
    const timelineRightPadding = viewportWidth >= 768 ? 40 : 24
    const timelineLeftEdge = viewportWidth - timelineRightPadding - timelineWidth
    const centerX = viewportWidth / 2
    const maxScaledContentWidth = Math.max(0, 2 * (timelineLeftEdge - 15 - centerX))
    const referenceContentWidth = 1920
    const scaleByTimeline = maxScaledContentWidth > 0 
      ? maxScaledContentWidth / referenceContentWidth 
      : uniformScale
    const finalScale = Math.min(uniformScale, scaleByTimeline)
    const clampedScale = Math.max(0.5, Math.min(1.0, finalScale))
    const maxWidthBeforeScale = viewportWidth - 2 * (timelineWidth + timelineRightPadding + 15)
    
    setAdjustedScale(clampedScale)
    setMaxContainerWidth(maxWidthBeforeScale)
  }, [uniformScale, isLandscape, timelineWidth, viewport])
  
  return (
    <section 
      className={`relative w-full flex items-center justify-center overflow-hidden ${
        isPortrait ? 'min-h-0 py-4' : 'h-screen'
      }`}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {/* Your background */}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 z-10 bg-black/70" />
      
      {/* Wrapper Container */}
      <div 
        className={`relative z-[90] ${
          isPortrait 
            ? 'w-full flex flex-col justify-start px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20' 
            : 'absolute inset-0 flex items-center justify-center'
        }`}
        style={isPortrait ? { 
          paddingTop: `${headerHeight + 15}px` 
        } : {}}
      >
        {/* Content Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={isPortrait ? 'w-full' : 'w-full'}
          style={!isPortrait ? {
            maxWidth: maxContainerWidth ? `${maxContainerWidth}px` : '1280px',
            paddingLeft: '15px',
            paddingRight: '15px',
            transform: `scale(${adjustedScale})`,
            transformOrigin: 'center center',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          } : {}}
        >
          {/* Nội dung căn giữa */}
          <div className="flex flex-col items-center text-center">
            {/* Your content here */}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

---

## Troubleshooting

### Container không căn giữa

**Nguyên nhân:**
- Wrapper không có `absolute inset-0 flex items-center justify-center`
- Container có padding top/bottom làm lệch

**Giải pháp:**
- Đảm bảo wrapper có đầy đủ classes căn giữa
- Loại bỏ padding top/bottom khỏi container

### Container đè lên timeline

**Nguyên nhân:**
- Max-width tính sai
- Scale quá lớn

**Giải pháp:**
- Kiểm tra công thức max-width
- Đảm bảo scale constraint hoạt động đúng

### Container bị lệch theo chiều dọc

**Nguyên nhân:**
- Wrapper có `top` hoặc `bottom` style
- Container có padding top/bottom

**Giải pháp:**
- Loại bỏ `top`/`bottom` khỏi wrapper
- Để flexbox xử lý căn giữa

---

## Best Practices

1. **Luôn dùng cùng z-index với timeline** (`z-[90]`)
2. **Tính max-width trước scale** để đảm bảo chính xác
3. **Không dùng padding top/bottom** trên container để tránh lệch
4. **Dùng flexbox** để căn giữa thay vì position absolute với translate
5. **Test trên nhiều kích thước màn** để đảm bảo responsive

---

## Kết Luận

Hệ thống này đảm bảo:
- ✅ Container căn giữa viewport ở cả 2 chiều
- ✅ Max-width động dựa trên timeline position
- ✅ Cách timeline tối thiểu 15px ở mọi kích thước màn
- ✅ Scale đều và không bị méo
- ✅ Áp dụng được cho nhiều section khác nhau

**Reference Implementation:** `components/sections/HeroSection.tsx`

