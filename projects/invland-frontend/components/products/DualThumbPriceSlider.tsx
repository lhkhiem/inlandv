"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

interface DualThumbPriceSliderProps {
  min?: number
  max?: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatter?: (n: number) => string
  minGap?: number // Minimum gap between thumbs (defaults to 2% of range or 2M for price sliders)
  showQuickPresets?: boolean // Whether to show quick preset buttons (default: true for large ranges)
}

export default function DualThumbPriceSlider({
  min = 0,
  max = 50000000,
  step = 100000,
  value,
  onChange,
  formatter,
  minGap,
  showQuickPresets: showQuickPresetsProp,
}: DualThumbPriceSliderProps) {
  // Calculate minimum gap: use provided minGap, or 2% of range, or 2M for large ranges
  const MIN_GAP = minGap ?? (max >= 10000000 ? 2000000 : Math.max(step * 20, (max - min) * 0.02))
  
  const [localValue, setLocalValue] = useState<[number, number]>(value)
  const [activeThumb, setActiveThumb] = useState<'left' | 'right' | null>(null)
  const [leftThumbReleased, setLeftThumbReleased] = useState(0) // Amount released by left thumb
  const [rightThumbReleased, setRightThumbReleased] = useState(0) // Amount released by right thumb
  const sliderRef = useRef<HTMLDivElement>(null)
  const leftInputRef = useRef<HTMLInputElement>(null)
  const rightInputRef = useRef<HTMLInputElement>(null)

  // Sync with external value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Clamp value to ensure minimum gap
  const clampWithGap = useCallback((left: number, right: number): [number, number] => {
    // Ensure minimum gap
    if (right - left < MIN_GAP) {
      if (activeThumb === 'left') {
        // Left thumb is being dragged - limit it
        left = Math.max(min, right - MIN_GAP)
      } else if (activeThumb === 'right') {
        // Right thumb is being dragged - limit it
        right = Math.min(max, left + MIN_GAP)
      } else {
        // Initial state or no active thumb - maintain gap
        if (right - left < MIN_GAP) {
          const mid = (left + right) / 2
          left = Math.max(min, mid - MIN_GAP / 2)
          right = Math.min(max, mid + MIN_GAP / 2)
        }
      }
    }
    return [Math.max(min, Math.min(max, left)), Math.max(min, Math.min(max, right))]
  }, [activeThumb, min, max, MIN_GAP])

  // Track previous values to detect backward movement
  const prevValueRef = useRef<[number, number]>(value)

  // Handle left thumb movement
  const handleLeftChange = useCallback((newLeft: number) => {
    const [currentLeft, currentRight] = localValue
    const [prevLeft, prevRight] = prevValueRef.current
    
    // Rule: When dragging left thumb right, right thumb can only move left until (leftThumbValue + 2M)
    const maxLeft = currentRight - MIN_GAP
    
    // Check if left thumb is moving backward (decreasing)
    if (newLeft < prevLeft) {
      // Left thumb moving backward - track release amount
      const released = prevLeft - newLeft
      setLeftThumbReleased(prev => prev + released)
      // Allow movement
      const clamped = clampWithGap(newLeft, currentRight)
      setLocalValue(clamped)
      onChange(clamped)
      prevValueRef.current = clamped
      return
    }
    
    // Left thumb moving forward (increasing)
    if (newLeft > maxLeft) {
      // Blocked - check if right thumb has been released backward
      if (rightThumbReleased > 0) {
        // Right thumb was released, allow left to move by released amount
        const allowedLeft = Math.min(newLeft, currentLeft + rightThumbReleased)
        const newRight = Math.max(currentRight, allowedLeft + MIN_GAP)
        const clamped = clampWithGap(allowedLeft, newRight)
        setLocalValue(clamped)
        onChange(clamped)
        setRightThumbReleased(0) // Reset after using
        prevValueRef.current = clamped
      } else {
        // Still blocked - clamp to max allowed
        const clamped = clampWithGap(maxLeft, currentRight)
        setLocalValue(clamped)
        onChange(clamped)
        prevValueRef.current = clamped
      }
    } else {
      // Normal movement allowed
      const clamped = clampWithGap(newLeft, currentRight)
      setLocalValue(clamped)
      onChange(clamped)
      prevValueRef.current = clamped
    }
  }, [localValue, rightThumbReleased, clampWithGap, onChange, MIN_GAP])

  // Handle right thumb movement
  const handleRightChange = useCallback((newRight: number) => {
    const [currentLeft, currentRight] = localValue
    const [prevLeft, prevRight] = prevValueRef.current
    
    // Rule: When dragging right thumb left, left thumb can only move right until (rightThumbValue - 2M)
    const minRight = currentLeft + MIN_GAP
    
    // Check if right thumb is moving backward (increasing)
    if (newRight > prevRight) {
      // Right thumb moving backward - track release amount
      const released = newRight - prevRight
      setRightThumbReleased(prev => prev + released)
      // Allow movement
      const clamped = clampWithGap(currentLeft, newRight)
      setLocalValue(clamped)
      onChange(clamped)
      prevValueRef.current = clamped
      return
    }
    
    // Right thumb moving forward (decreasing)
    if (newRight < minRight) {
      // Blocked - check if left thumb has been released backward
      if (leftThumbReleased > 0) {
        // Left thumb was released, allow right to move by released amount
        const allowedRight = Math.max(newRight, currentRight - leftThumbReleased)
        const newLeft = Math.min(currentLeft, allowedRight - MIN_GAP)
        const clamped = clampWithGap(newLeft, allowedRight)
        setLocalValue(clamped)
        onChange(clamped)
        setLeftThumbReleased(0) // Reset after using
        prevValueRef.current = clamped
      } else {
        // Still blocked - clamp to min allowed
        const clamped = clampWithGap(currentLeft, minRight)
        setLocalValue(clamped)
        onChange(clamped)
        prevValueRef.current = clamped
      }
    } else {
      // Normal movement allowed
      const clamped = clampWithGap(currentLeft, newRight)
      setLocalValue(clamped)
      onChange(clamped)
      prevValueRef.current = clamped
    }
  }, [localValue, leftThumbReleased, clampWithGap, onChange, MIN_GAP])

  // Handle pointer events - only allow thumb dragging, not track clicking
  const handleLeftPointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    // Only allow interaction if clicking near the thumb
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const thumbPosition = ((localValue[0] - min) / (max - min)) * rect.width
    
    // Allow if clicking within 20px of thumb position
    if (Math.abs(clickX - thumbPosition) > 20) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    setActiveThumb('left')
    prevValueRef.current = localValue // Store current value when starting drag
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleRightPointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    // Only allow interaction if clicking near the thumb
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const thumbPosition = ((localValue[1] - min) / (max - min)) * rect.width
    
    // Allow if clicking within 20px of thumb position
    if (Math.abs(clickX - thumbPosition) > 20) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    
    setActiveThumb('right')
    prevValueRef.current = localValue // Store current value when starting drag
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLInputElement>) => {
    setActiveThumb(null)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
  }

  // Prevent clicking on track (not on thumb)
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent any clicks on the track container
    if (e.target === sliderRef.current || (e.target as HTMLElement).classList.contains('slider-track')) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Prevent scroll when dragging
  useEffect(() => {
    if (!activeThumb) return

    const preventScroll = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }

    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })
    document.body.style.userSelect = 'none'

    return () => {
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      document.body.style.userSelect = ''
    }
  }, [activeThumb])

  // Quick select presets (only show for price sliders with max >= 20M, unless explicitly disabled)
  const showQuickPresets = showQuickPresetsProp !== undefined ? showQuickPresetsProp : max >= 20000000
  const quickPresets = showQuickPresets ? [
    { label: 'Dưới 5 triệu', range: [min, Math.min(max, 5000000)] as [number, number] },
    { label: '5–10 triệu', range: [5000000, Math.min(max, 10000000)] as [number, number] },
    { label: '10–20 triệu', range: [10000000, Math.min(max, 20000000)] as [number, number] },
    { label: 'Trên 20 triệu', range: [20000000, max] as [number, number] },
  ] : []

  const handleQuickSelect = (preset: [number, number]) => {
    // Ensure minimum gap
    const [presetLeft, presetRight] = preset
    if (presetRight - presetLeft < MIN_GAP) {
      const mid = (presetLeft + presetRight) / 2
      const clamped: [number, number] = [
        Math.max(min, mid - MIN_GAP / 2),
        Math.min(max, mid + MIN_GAP / 2)
      ]
      setLocalValue(clamped)
      onChange(clamped)
    } else {
      setLocalValue(preset)
      onChange(preset)
    }
  }

  // Calculate percentages
  const getPercent = (val: number) => ((val - min) / (max - min)) * 100
  const leftPercent = getPercent(localValue[0])
  const rightPercent = getPercent(localValue[1])

  const formatValue = formatter || ((n: number) => 
    new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND', 
      maximumFractionDigits: 0 
    }).format(n)
  )

  return (
    <div className="w-full">
      {/* Slider Track */}
      <div ref={sliderRef} className="relative h-6" onClick={handleTrackClick} style={{ pointerEvents: 'auto' }}>
        {/* Background track - not clickable */}
        <div 
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full pointer-events-none"
          style={{ zIndex: 1 }}
        />
        
        {/* Active range track - not clickable */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-1 bg-goldDark rounded-full pointer-events-none"
          style={{
            left: `${leftPercent}%`,
            width: `${rightPercent - leftPercent}%`,
            zIndex: 2
          }}
        />

        {/* Left thumb input - only thumb is clickable, not track */}
        <input
          ref={leftInputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={(e) => handleLeftChange(Number(e.target.value))}
          onPointerDown={handleLeftPointerDown}
          onPointerUp={handlePointerUp}
          className="slider-thumb slider-thumb-min"
          style={{ 
            zIndex: activeThumb === 'left' ? 10 : (localValue[0] > (max - min) * 0.5 + min ? 5 : 4),
            pointerEvents: 'auto' // Only the input itself is interactive
          }}
        />

        {/* Right thumb input - only thumb is clickable, not track */}
        <input
          ref={rightInputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={(e) => handleRightChange(Number(e.target.value))}
          onPointerDown={handleRightPointerDown}
          onPointerUp={handlePointerUp}
          className="slider-thumb slider-thumb-max"
          style={{ 
            zIndex: activeThumb === 'right' ? 10 : (localValue[1] < (max - min) * 0.5 + min ? 5 : 3),
            pointerEvents: 'auto' // Only the input itself is interactive
          }}
        />
      </div>

      {/* Value display */}
      <div className="mt-2 flex justify-between text-sm text-gray-600">
        <span>{formatValue(localValue[0])}</span>
        <span>{formatValue(localValue[1])}</span>
      </div>

      {/* Quick select buttons - only show for price sliders */}
      {showQuickPresets && quickPresets.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {quickPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickSelect(preset.range)}
              className="px-3 py-1.5 rounded-full text-sm bg-gray-50 border border-gray-200 hover:border-goldDark/50 hover:bg-goldLight/10 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

