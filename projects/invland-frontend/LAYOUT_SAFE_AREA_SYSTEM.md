# Layout Safe-Area System Documentation

## Overview
This document describes the **dynamic measurement system** that prevents header and timeline overlap with section content in the fullpage scroll layout.

## Problem Solved
1. ✅ Fixed header overlapping section titles and content
2. ✅ Dynamic spacing under header for all fullpage sections
3. ✅ Content respects TimelineNav safe-area on the right
4. ✅ Responsive behavior (mobile/desktop)
5. ✅ No hardcoded values - all measurements are dynamic

---

## Architecture

### Components Updated

#### 1. **LayoutMeasurementsContext.tsx** (NEW)
- **Purpose**: Central context for sharing header height and timeline width measurements
- **State**:
  - `headerHeight`: Current header height in pixels (default: 80px)
  - `timelineWidth`: Current timeline width in pixels (default: 200px, 0px on mobile)
- **API**:
  - `setHeaderHeight(height)`: Update header height
  - `setTimelineWidth(width)`: Update timeline width
  - `useLayoutMeasurements()`: Hook to access measurements

#### 2. **Header.tsx** (UPDATED)
- **Changes**:
  - Added `useRef` to measure header element
  - Added `useLayoutMeasurements` hook
  - Measures header height on mount and window resize
  - Reports height to context via `setHeaderHeight()`
- **Measurement Logic**:
  ```typescript
  const headerRef = useRef<HTMLDivElement>(null)
  const { setHeaderHeight } = useLayoutMeasurements()
  
  useEffect(() => {
    const measureHeader = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight
        setHeaderHeight(height)
      }
    }
    measureHeader()
    window.addEventListener('resize', measureHeader)
    return () => window.removeEventListener('resize', measureHeader)
  }, [setHeaderHeight])
  ```

#### 3. **TimelineNav.tsx** (UPDATED)
- **Changes**:
  - Added `useRef` to measure nav element
  - Added `useLayoutMeasurements` hook
  - Measures timeline width on mount and window resize
  - Reports width to context via `setTimelineWidth()`
  - **Responsive**: Returns 0px when hidden (mobile)
- **Measurement Logic**:
  ```typescript
  const navRef = useRef<HTMLDivElement>(null)
  const { setTimelineWidth } = useLayoutMeasurements()
  
  useEffect(() => {
    const measureTimeline = () => {
      if (navRef.current) {
        const isVisible = window.getComputedStyle(navRef.current).display !== 'none'
        const width = isVisible ? navRef.current.offsetWidth : 0
        setTimelineWidth(width)
      }
    }
    measureTimeline()
    window.addEventListener('resize', measureTimeline)
    return () => window.removeEventListener('resize', measureTimeline)
  }, [setTimelineWidth])
  ```

#### 4. **Section.tsx** (UPDATED)
- **Changes**:
  - Added `useLayoutMeasurements` hook
  - Calculates dynamic padding based on measurements
  - Added `.section-inner` wrapper with safe-area padding
  - Responsive padding-right (collapses on mobile)
- **Padding Calculation**:
  ```typescript
  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  
  // Header safe-area: header height + 24px breathing room
  const paddingTop = headerHeight + 24
  
  // Timeline safe-area: timeline width + 32px margin (or 24px base on mobile)
  const paddingRight = timelineWidth > 0 ? timelineWidth + 32 : 24
  ```
- **Structure**:
  ```
  <section> (100vh, overflow:hidden)
    └─ <div.section-content-wrapper> (scrollable)
        └─ <div.section-inner max-w-[1400px]> (safe padding applied)
            └─ {children}
  ```

#### 5. **layout.tsx** (UPDATED)
- **Changes**:
  - Wrapped app with `<LayoutMeasurementsProvider>`
  - Provider placed outside `<FullpageProvider>` to be available globally
- **Structure**:
  ```tsx
  <LayoutMeasurementsProvider>
    <FullpageProvider>
      <Header />
      <main>{children}</main>
      <BackToTopButton />
    </FullpageProvider>
  </LayoutMeasurementsProvider>
  ```

---

## How It Works

### Measurement Flow
1. **On mount**:
   - Header measures its height → reports to context
   - TimelineNav measures its width → reports to context
   - All Section components receive measurements via context

2. **On resize**:
   - Header re-measures and updates context
   - TimelineNav re-measures and updates context
   - Sections automatically re-render with new padding

3. **Responsive behavior**:
   - Desktop: Timeline visible → width ~200px → sections get right padding
   - Mobile: Timeline hidden (`display:none`) → width = 0px → sections use base padding (24px)

### Safe-Area Calculation

#### Header Safe-Area (Top)
```
paddingTop = headerHeight + 24px
```
- **headerHeight**: Dynamic measurement (typically 80px desktop, may vary)
- **24px**: Additional breathing room to prevent visual collision

#### Timeline Safe-Area (Right)
```
paddingRight = timelineWidth > 0 ? (timelineWidth + 32px) : 24px
```
- **timelineWidth**: Dynamic measurement (typically 200px desktop, 0px mobile)
- **32px**: Additional margin to keep content away from timeline
- **24px**: Fallback base padding on mobile

---

## Responsive Breakpoints

### Desktop (md: ≥768px)
- Header: ~80px height
- Timeline: ~200px width (visible)
- Section padding-top: ~104px (80 + 24)
- Section padding-right: ~232px (200 + 32)

### Mobile (<768px)
- Header: ~80px height (may shrink)
- Timeline: 0px width (hidden with `display:none`)
- Section padding-top: ~104px (80 + 24)
- Section padding-right: 24px (base padding only)

---

## Testing Scenarios

### ✅ Verified Behavior
1. **Section titles not covered by header**: 
   - Top padding ensures minimum 24px clearance below header
   
2. **Grids/cards don't hit timeline**:
   - Right padding creates safe zone wider than timeline
   
3. **Responsive transitions work**:
   - Measurements update on window resize
   - Timeline width becomes 0 when hidden
   
4. **No animation jumps**:
   - Transform-based scroll system not affected by padding
   - Padding only affects internal content wrapper
   
5. **Works across viewports**:
   - 1920px: Full width with timeline safe-area
   - 1440px: Full width with timeline safe-area
   - 1280px: Full width with timeline safe-area
   - 1024px: Full width with timeline safe-area
   - 768px: Mobile layout, no timeline collision
   - 375px: Mobile layout, no timeline collision

---

## Content Width Handling

### Max-Width Strategy
```typescript
className="section-inner max-w-[1400px] mx-auto px-6"
```
- **max-w-[1400px]**: Prevents content from becoming too wide
- **mx-auto**: Centers content horizontally
- **px-6**: Base horizontal padding (24px total)
- **Dynamic padding-right**: Adds timeline safe-area on top of base

### Wide Content Behavior
- Content can expand horizontally up to `max-w-[1400px]`
- Right safe-area always maintained regardless of content width
- Content never overflows into timeline zone
- Content never shifts behind header

---

## No Breaking Changes

### FullpageScroll System Intact
- ✅ Transform-based positioning unchanged
- ✅ Animation locking preserved
- ✅ Scroll event handling unaffected
- ✅ Section height enforcement (100vh) maintained
- ✅ Anti-bleed architecture preserved

### What Changed
- Only **internal padding** of sections modified
- No changes to section positioning or dimensions
- No changes to scroll mechanics
- No changes to animation system

---

## Future-Proof Design

### Dynamic Measurements
- No hardcoded pixel values for header/timeline
- Automatically adapts if header design changes
- Automatically adapts if timeline design changes
- Responsive to device orientation changes

### Maintainability
- Central context for all measurements
- Single source of truth for spacing logic
- Easy to adjust safe-area margins (24px, 32px constants)
- Clear separation of concerns

---

## Implementation Checklist

- [x] Created `LayoutMeasurementsContext.tsx` with measurement state
- [x] Updated `Header.tsx` to measure and report height
- [x] Updated `TimelineNav.tsx` to measure and report width
- [x] Updated `Section.tsx` to consume measurements and apply padding
- [x] Updated `HeroSection` variant with same logic
- [x] Wrapped app layout with `LayoutMeasurementsProvider`
- [x] Added responsive behavior (timeline width = 0 on mobile)
- [x] Added max-width container for content
- [x] Verified TypeScript compilation (no errors)
- [x] Tested measurement flow on mount
- [x] Tested measurement updates on resize
- [x] Verified no breaking changes to scroll system

---

## Summary

The layout safe-area system provides:

1. **Dynamic header clearance**: Sections automatically adjust to header height
2. **Dynamic timeline safe-area**: Content respects timeline width with margin
3. **Responsive adaptation**: Mobile gets base padding, desktop gets full safe-area
4. **Future-proof**: No hardcoded values, automatically adapts to design changes
5. **Zero breaking changes**: Fullpage scroll system remains completely intact
6. **Clean architecture**: Central context, clear measurement flow, maintainable code

**Result**: Header never overlaps content. Timeline never collides with content. All spacing is dynamic and responsive.
