"use client"

import { useEffect, useState, useRef } from 'react'

export default function PriceRangeSlider({
  min=0,
  max=1000000000,
  step=1000000,
  value,
  onChange,
  formatter,
}: {
  min?: number
  max?: number
  step?: number
  value: [number, number]
  onChange: (v: [number, number]) => void
  formatter?: (n:number)=>string
}) {
  const [local, setLocal] = useState<[number, number]>(value)
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null)
  const minInputRef = useRef<HTMLInputElement>(null)
  const maxInputRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{ setLocal(value) }, [value])

  // Prevent scroll when dragging - but DON'T block mousemove!
  useEffect(() => {
    if (!activeThumb) return

    const preventScroll = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }

    // Only prevent scroll-related events, NOT mousemove (needed for dragging)
    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })
    document.body.style.userSelect = 'none'

    return () => {
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
      document.body.style.userSelect = ''
    }
  }, [activeThumb])

  const handle = (idx: 0|1, v: number) => {
    let next: [number, number]
    if (idx === 0) {
      next = [Math.min(v, local[1]), local[1]]
    } else {
      next = [local[0], Math.max(v, local[0])]
    }
    setLocal(next)
    onChange(next)
  }

  const handlePointerDownMin = (e: React.PointerEvent<HTMLInputElement>) => {
    setActiveThumb('min')
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerDownMax = (e: React.PointerEvent<HTMLInputElement>) => {
    setActiveThumb('max')
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerUpMin = (e: React.PointerEvent<HTMLInputElement>) => {
    setActiveThumb(null)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
    if (minInputRef.current) minInputRef.current.blur()
  }

  const handlePointerUpMax = (e: React.PointerEvent<HTMLInputElement>) => {
    setActiveThumb(null)
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
    if (maxInputRef.current) maxInputRef.current.blur()
  }

  // Simple percentage calculation
  const getPercent = (val: number) => ((val - min) / (max - min)) * 100

  const minPercent = getPercent(local[0])
  const maxPercent = getPercent(local[1])

  return (
    <div className="w-full">
      <div 
        className="relative h-6"
      >
        {/* Background track - centered vertically */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 rounded-full" style={{ zIndex: 1 }}></div>
        
        {/* Highlight track - same centering as background */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-1 bg-goldDark rounded-full pointer-events-none"
          style={{
            left: `calc(${minPercent}%)`,
            right: `calc(${100 - maxPercent}%)`,
            zIndex: 2
          }}
        ></div>

        {/* Min range input */}
        <input
          ref={minInputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={local[0]}
          onChange={(e) => handle(0, Number(e.target.value))}
          onPointerDown={handlePointerDownMin}
          onPointerUp={handlePointerUpMin}
          className="slider-thumb slider-thumb-min"
          style={{ zIndex: activeThumb === 'min' ? 10 : (local[0] > max - (max - min) * 0.5 ? 5 : 4) }}
        />

        {/* Max range input */}
        <input
          ref={maxInputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={local[1]}
          onChange={(e) => handle(1, Number(e.target.value))}
          onPointerDown={handlePointerDownMax}
          onPointerUp={handlePointerUpMax}
          className="slider-thumb slider-thumb-max"
          style={{ zIndex: activeThumb === 'max' ? 10 : (local[1] < (max - min) * 0.5 ? 5 : 3) }}
        />
      </div>

      <div className="mt-2 flex justify-between text-sm text-gray-600">
        <span>{(formatter||formatCurrency)(local[0])}</span>
        <span>{(formatter||formatCurrency)(local[1])}</span>
      </div>
    </div>
  )
}

const formatCurrency = (n:number) => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND', maximumFractionDigits:0 }).format(n)
