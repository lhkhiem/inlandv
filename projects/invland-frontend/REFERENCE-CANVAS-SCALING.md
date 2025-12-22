# Reference Canvas Scaling Model - NextJS 16.0.7

## Giới Thiệu

**Reference Canvas Scaling Model** là thuật toán scaling chuẩn được sử dụng trong:
- 🎮 **Unity Game Engine** (Canvas Scaler component)
- 🎮 **Unreal Engine** (UMG Scaling)
- 🎮 **Godot Engine** (Viewport Scaling)
- 🎨 **Adobe XD** (Responsive Resize)
- 🎨 **Figma** (Constraints & Auto Layout)
- 📺 **Digital Signage Systems**

---

## Core Concept

```
┌─────────────────────────────────────────┐
│   REFERENCE CANVAS (1920x1080)         │  ← Design base
│                                         │
│   ┌─────┐     ┌─────┐     ┌─────┐     │
│   │  A  │     │  B  │     │  C  │     │  ← Elements
│   └─────┘     └─────┘     └─────┘     │
│                                         │
└─────────────────────────────────────────┘
            ↓ Scale Factor = ViewportWidth / 1920
┌──────────────────────────────────┐
│  ACTUAL VIEWPORT (1280x720)     │
│                                  │
│  ┌──┐   ┌──┐   ┌──┐            │  ← Elements scaled
│  │A │   │B │   │C │            │     (tâm giữ nguyên)
│  └──┘   └──┘   └──┘            │
│                                  │
└──────────────────────────────────┘
```

**Key Points**:
- Background/sections: 100vw (không scale)
- Content elements: Scale theo tỷ lệ viewport width
- Tâm elements: Tự động preserve
- Giống game engines handle resolutions

---

## Lý Thuyết Toán Học

### 1. Affine Transformation

```
Scale Transform Matrix:
┌          ┐   ┌     ┐
│ s  0  0  │   │  x  │
│ 0  s  0  │ × │  y  │
│ 0  0  1  │   │  1  │
└          ┘   └     ┘

Where s = scaleFactor = currentWidth / referenceWidth

Result:
x' = x × s
y' = y × s
```

### 2. Center Preservation

```
Element: (x, y, width, height)
Center: (cx, cy) = (x + width/2, y + height/2)

After scaling:
x' = x × s
y' = y × s
width' = width × s
height' = height × s

New center:
cx' = x' + width'/2
    = (x × s) + (width × s)/2
    = (x + width/2) × s
    = cx × s ✓

→ Center scales proportionally!
```

### 3. Unity Match Width or Height

Unity uses logarithmic interpolation:

```typescript
function unityScale(
  screenW: number, screenH: number,
  refW: number, refH: number,
  match: number  // 0-1
): number {
  const logW = Math.log(screenW / refW) / Math.log(2);
  const logH = Math.log(screenH / refH) / Math.log(2);
  const logAvg = logW * (1 - match) + logH * match;
  return Math.pow(2, logAvg);
}
```

---

## Implementation

### Setup Files

```
src/
├── lib/
│   └── canvasScaler.ts      # Core algorithm
├── hooks/
│   └── useCanvasScale.ts    # React hook
├── components/
│   ├── CanvasLayout.tsx     # Main wrapper
│   └── CanvasElement.tsx    # Positioned element
├── types/
│   └── canvas.ts            # TypeScript types
└── app/
    └── globals.css          # Canvas CSS
```

### Core Algorithm

**File**: `src/lib/canvasScaler.ts`

```typescript
export class CanvasScaler {
  /**
   * Calculate scale factor based on viewport width
   */
  static calculateScale(
    viewportWidth: number,
    referenceWidth: number,
    minScale: number = 0.5,
    maxScale: number = 2.0
  ): number {
    const scale = viewportWidth / referenceWidth;
    return Math.max(minScale, Math.min(maxScale, scale));
  }

  /**
   * Scale element dimensions and position
   */
  static scaleElement(
    x: number,
    y: number,
    width: number,
    height: number,
    scaleFactor: number
  ) {
    return {
      x: x * scaleFactor,
      y: y * scaleFactor,
      width: width * scaleFactor,
      height: height * scaleFactor,
      // Center automatically preserved
      centerX: (x + width / 2) * scaleFactor,
      centerY: (y + height / 2) * scaleFactor,
    };
  }
}
```

### React Hook

**File**: `src/hooks/useCanvasScale.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { CanvasScaler } from '@/lib/canvasScaler';

export function useCanvasScale(
  referenceWidth: number = 1920,
  referenceHeight: number = 1080
) {
  const [scale, setScale] = useState(1);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateScale() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({ width, height });

      // Only scale in landscape
      if (height > width) {
        setScale(1);
        document.documentElement.style.setProperty('--canvas-scale', '1');
        return;
      }

      // Calculate scale based on width
      const scaleFactor = CanvasScaler.calculateScale(width, referenceWidth);
      setScale(scaleFactor);

      // Update CSS variables
      document.documentElement.style.setProperty('--canvas-scale', scaleFactor.toString());
      document.documentElement.style.setProperty('--reference-width', `${referenceWidth}px`);
      document.documentElement.style.setProperty('--reference-height', `${referenceHeight}px`);
    }

    updateScale();

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScale, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [referenceWidth, referenceHeight]);

  return {
    scale,
    viewport,
    isLandscape: viewport.width > viewport.height,
    scaleElement: (x: number, y: number, w: number, h: number) =>
      CanvasScaler.scaleElement(x, y, w, h, scale),
  };
}
```

### Global CSS

**File**: `src/app/globals.css`

```css
:root {
  --reference-width: 1920;
  --reference-height: 1080;
  --canvas-scale: 1;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

/* Background không scale */
.canvas-background {
  width: 100vw;
  min-height: 100vh;
  position: relative;
}

/* Content area cho scaled elements */
.canvas-content {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Typography scaled */
.canvas-text-xs { font-size: calc(12px * var(--canvas-scale)); }
.canvas-text-sm { font-size: calc(14px * var(--canvas-scale)); }
.canvas-text-base { font-size: calc(16px * var(--canvas-scale)); }
.canvas-text-lg { font-size: calc(18px * var(--canvas-scale)); }
.canvas-text-xl { font-size: calc(20px * var(--canvas-scale)); }
.canvas-text-2xl { font-size: calc(24px * var(--canvas-scale)); }
.canvas-text-3xl { font-size: calc(30px * var(--canvas-scale)); }
.canvas-text-4xl { font-size: calc(36px * var(--canvas-scale)); }
.canvas-text-5xl { font-size: calc(48px * var(--canvas-scale)); }
.canvas-text-6xl { font-size: calc(60px * var(--canvas-scale)); }
.canvas-text-7xl { font-size: calc(72px * var(--canvas-scale)); }

/* Spacing scaled */
.canvas-p-sm { padding: calc(8px * var(--canvas-scale)); }
.canvas-p-md { padding: calc(16px * var(--canvas-scale)); }
.canvas-p-lg { padding: calc(24px * var(--canvas-scale)); }
.canvas-p-xl { padding: calc(32px * var(--canvas-scale)); }

.canvas-m-sm { margin: calc(8px * var(--canvas-scale)); }
.canvas-m-md { margin: calc(16px * var(--canvas-scale)); }
.canvas-m-lg { margin: calc(24px * var(--canvas-scale)); }
.canvas-m-xl { margin: calc(32px * var(--canvas-scale)); }

.canvas-gap-sm { gap: calc(8px * var(--canvas-scale)); }
.canvas-gap-md { gap: calc(16px * var(--canvas-scale)); }
.canvas-gap-lg { gap: calc(24px * var(--canvas-scale)); }
.canvas-gap-xl { gap: calc(32px * var(--canvas-scale)); }

/* Portrait mode */
@media (orientation: portrait) {
  :root { --canvas-scale: 1; }
}
```

### Components

**File**: `src/components/CanvasLayout.tsx`

```typescript
'use client';

import { ReactNode } from 'react';
import { useCanvasScale } from '@/hooks/useCanvasScale';

interface CanvasLayoutProps {
  children: ReactNode;
  referenceWidth?: number;
  referenceHeight?: number;
}

export function CanvasLayout({
  children,
  referenceWidth = 1920,
  referenceHeight = 1080,
}: CanvasLayoutProps) {
  const { scale, isLandscape } = useCanvasScale(referenceWidth, referenceHeight);

  return (
    <div
      className={isLandscape ? 'landscape-mode' : 'portrait-mode'}
      data-scale={scale.toFixed(3)}
    >
      {children}
    </div>
  );
}
```

**File**: `src/components/CanvasElement.tsx`

```typescript
'use client';

import { CSSProperties, ReactNode } from 'react';
import { useCanvasScale } from '@/hooks/useCanvasScale';

interface CanvasElementProps {
  children: ReactNode;
  x: number;        // Position in reference canvas (1920x1080)
  y: number;
  width: number;
  height: number;
  className?: string;
}

export function CanvasElement({
  children,
  x,
  y,
  width,
  height,
  className = '',
}: CanvasElementProps) {
  const { scaleElement } = useCanvasScale();
  const scaled = scaleElement(x, y, width, height);

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        left: `${scaled.x}px`,
        top: `${scaled.y}px`,
        width: `${scaled.width}px`,
        height: `${scaled.height}px`,
      }}
    >
      {children}
    </div>
  );
}
```

---

## Example Usage

### IPD8 Hero với Absolute Positioning

```typescript
'use client';

import { CanvasLayout } from '@/components/CanvasLayout';
import { CanvasElement } from '@/components/CanvasElement';
import Image from 'next/image';

export default function IPD8Hero() {
  return (
    <CanvasLayout referenceWidth={1920} referenceHeight={1080}>
      {/* Background - Full viewport, không scale */}
      <div className="canvas-background bg-gradient-to-r from-pink-500 to-red-500">
        
        {/* Content - Elements scale theo reference canvas */}
        <div className="canvas-content">
          
          {/* Title - Tọa độ trong canvas 1920x1080 */}
          <CanvasElement
            x={960}   // Center X (1920/2)
            y={200}   // 200px from top
            width={1200}
            height={100}
            className="flex items-center justify-center"
          >
            <h1 className="canvas-text-7xl font-bold text-white text-center">
              TRUNG TÂM 1.000 NGÀY VÒNG ĐẦU ĐỜI
            </h1>
          </CanvasElement>

          {/* Subtitle */}
          <CanvasElement x={960} y={320} width={1200} height={80}>
            <h2 className="canvas-text-5xl font-bold text-yellow-300 text-center">
              VIỆT NAM - NEW ZEALAND IPD8
            </h2>
          </CanvasElement>

          {/* Description */}
          <CanvasElement x={960} y={420} width={1000} height={50}>
            <p className="canvas-text-2xl text-white text-center">
              Đồng hành cùng mẹ và bé từ thai kỳ đến 12 tuổi
            </p>
          </CanvasElement>

          {/* Card 1 - Tọa độ chính xác */}
          <CanvasElement x={260} y={550} width={400} height={480}>
            <CourseCard
              image="/course1.jpg"
              title="DÀNH CHO MẸ BẦU/ CÓ CON TỪ 0 – 12 THÁNG"
              duration="12 tháng"
            />
          </CanvasElement>

          {/* Card 2 */}
          <CanvasElement x={760} y={550} width={400} height={480}>
            <CourseCard
              image="/course2.jpg"
              title="DÀNH CHO MẸ CÓ CON TỪ 13 – 24 THÁNG"
              duration="12 tháng"
            />
          </CanvasElement>

          {/* Card 3 */}
          <CanvasElement x={1260} y={550} width={400} height={480}>
            <CourseCard
              image="/course3.jpg"
              title="GÓI HỌC THỬ 01 BUỔI 99K"
              duration="1 buổi"
            />
          </CanvasElement>

        </div>
      </div>
    </CanvasLayout>
  );
}

function CourseCard({ 
  image, 
  title, 
  duration 
}: { 
  image: string; 
  title: string; 
  duration: string;
}) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg h-full flex flex-col">
      {/* Image - 60% height */}
      <div className="relative h-3/5">
        <Image src={image} alt={title} fill style={{ objectFit: 'cover' }} />
      </div>
      
      {/* Content - 40% height */}
      <div className="canvas-p-lg flex-1 flex flex-col">
        <h3 className="canvas-text-xl font-bold canvas-m-sm">{title}</h3>
        <p className="canvas-text-sm text-gray-600 canvas-m-sm">
          ⏱️ Thời lượng: {duration}
        </p>
        <p className="canvas-text-sm text-gray-600 canvas-m-sm">
          👨‍🏫 Giáo viên: Đội ngũ chuyên gia IPD8
        </p>
        <button className="mt-auto w-full canvas-p-md bg-pink-500 text-white rounded hover:bg-pink-600">
          Chi tiết gói học
        </button>
      </div>
    </div>
  );
}
```

### Kết Quả

```
Màn 1920px (base):
┌────────────────────────────────────┐
│         Title (960, 200)           │
│                                    │
│  Card1      Card2      Card3      │
│ (260,550)  (760,550)  (1260,550)  │
└────────────────────────────────────┘

Màn 1280px (scale 0.67x):
┌──────────────────────────┐
│    Title (640, 133)      │  ← Tâm giữ nguyên!
│                          │
│ C1    C2    C3          │  ← 3 cards vẫn ngang
│(173) (507) (840)        │     nhỏ hơn 33%
└──────────────────────────┘
```

---

## Ưu Điểm

### 1. Academic Foundation

✅ Dựa trên **Affine Transformation** (computer graphics)  
✅ **Unity Canvas Scaler** - industry standard  
✅ **Viewport Transformation** theory  

### 2. Predictable Behavior

✅ Tọa độ scale **proportionally**  
✅ Tâm elements tự động **preserve**  
✅ Aspect ratios **maintained**  

### 3. Designer-Friendly

✅ Design tại **1920x1080** chuẩn  
✅ Export tọa độ từ **Figma/Adobe XD**  
✅ Absolute positioning → **no layout shift**  

### 4. Game-Like

✅ Giống **Unity UI system**  
✅ Giống **game resolution scaling**  
✅ Professional behavior  

---

## So Sánh

| Approach | Background | Elements | Position | Center | Academic |
|----------|-----------|----------|----------|---------|----------|
| **Reference Canvas** | 100vw ✅ | Scale ✅ | Absolute ✅ | Auto ✅ | Unity ✅ |
| Height-Based | 100vw ✅ | Scale ✅ | Flow | Calc | Custom |
| Transform Scale | Fixed | Scale ✅ | Flow | Auto ✅ | Custom |

---

## Unity Canvas Scaler Modes

Unity cung cấp 3 modes:

### Mode 1: Constant Pixel Size

```typescript
// Size cố định, không scale
scaleFactor = 1;
```

### Mode 2: Scale With Screen Size

```typescript
// Scale theo screen (mode này chúng ta đang dùng)
scaleFactor = screenWidth / referenceWidth;
```

### Mode 3: Constant Physical Size

```typescript
// Scale theo DPI (cho mobile)
scaleFactor = Screen.dpi / referenceDpi;
```

---

## Best Practices

### 1. Design at Reference Resolution

```
✅ Design tại 1920x1080 (Full HD)
✅ Export coordinates từ Figma
✅ Use absolute positioning
```

### 2. Test Multiple Scales

```typescript
Test at:
- 1280px → scale 0.67x
- 1366px → scale 0.71x  
- 1600px → scale 0.83x
- 1920px → scale 1.00x (base)
- 2560px → scale 1.33x
```

### 3. Maintain Aspect Ratios

```tsx
<CanvasElement x={100} y={100} width={400} height={300}>
  <Image fill style={{ objectFit: 'cover' }} />
</CanvasElement>
```

### 4. Use for Precise Layouts

```
Perfect for:
✅ Dashboard UI
✅ Game interfaces
✅ Digital signage
✅ Kiosk applications
✅ Presentation tools
```

---

## Troubleshooting

### Problem: Elements không scale

**Solution**: Check CSS variable được set

```typescript
console.log(
  getComputedStyle(document.documentElement)
    .getPropertyValue('--canvas-scale')
);
```

### Problem: Tâm elements bị lệch

**Solution**: Sử dụng `CanvasElement` component, không dùng manual positioning

```tsx
// ✅ GOOD
<CanvasElement x={960} y={540} width={200} height={100}>

// ❌ BAD - Center may shift
<div style={{ left: 960, top: 540 }}>
```

### Problem: Portrait mode bị vỡ

**Solution**: Portrait tự động fallback về responsive

```css
@media (orientation: portrait) {
  :root { --canvas-scale: 1; }
}
```

---

## References

### Game Engines
- [Unity Canvas Scaler](https://docs.unity3d.com/Manual/script-CanvasScaler.html)
- [Unreal Engine UMG](https://docs.unrealengine.com/5.0/en-US/umg-ui-designer/)
- [Godot Multiple Resolutions](https://docs.godotengine.org/en/stable/tutorials/rendering/multiple_resolutions.html)

### Theory
- Foley & van Dam - "Computer Graphics" (Affine Transformations)
- Real-Time Rendering - Akenine-Möller (Viewport Transform)

---

## Summary

**Reference Canvas Scaling** = Unity Canvas Scaler cho Web

**Công thức**:
```
scaleFactor = viewportWidth / referenceWidth
position' = position × scaleFactor
size' = size × scaleFactor
center' = center × scaleFactor (automatic!)
```

**Use when**:
- Need precise positioning
- Game-like UI behavior
- Designer exports from Figma/XD
- Dashboard/kiosk applications

**Result**:
- ✅ Background 100vw
- ✅ Elements scale proportionally
- ✅ Centers preserved
- ✅ 3 cards ALWAYS horizontal
- ✅ Academic foundation (Unity/Unreal)

---

**Version**: 1.0.0  
**Based on**: Unity Canvas Scaler Algorithm  
**License**: MIT  
**Compatible**: Next.js 16.0.7
