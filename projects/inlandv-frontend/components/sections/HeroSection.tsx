'use client'

import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'

// Counter animation hook
function useCounter(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start)
  const [isAnimating, setIsAnimating] = useState(false)

  const animate = () => {
    setIsAnimating(true)
    const startTime = Date.now()
    const endTime = startTime + duration

    const timer = setInterval(() => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(start + (end - start) * easeOutQuart)
      
      setCount(currentCount)

      if (now >= endTime) {
        setCount(end)
        clearInterval(timer)
        setIsAnimating(false)
      }
    }, 16) // ~60fps

    return () => clearInterval(timer)
  }

  return { count, animate, isAnimating }
}

// Animated counter component
function AnimatedCounter({ value, suffix = '', duration = 2000 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { count, animate } = useCounter(value, duration)

  useEffect(() => {
    if (isInView) {
      animate()
    }
  }, [isInView])

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-goldLight mb-2">
      {count.toLocaleString()}{suffix}
    </div>
  )
}

export default function HeroSection() {
  const router = useRouter()
  const [mode, setMode] = useState<'mua-ban' | 'cho-thue'>('cho-thue')
  const [keyword, setKeyword] = useState('')
  const sectionRef = useRef<HTMLElement>(null)
  const { headerHeight, safeAreaLeft, safeAreaRight, timelineWidth } = useLayoutMeasurements()
  
  // Uniform Canvas Scaler: Scale content uniformly based on viewport dimensions
  // Reference: 1920×1080 (FullHD 23") = scale 1.0
  // Portrait: no scaling (scale = 1)
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.0)
  
  // Calculate adjusted scale and max-width to ensure content doesn't touch timeline
  // Content is centered on viewport, but scale must account for timeline
  const [adjustedScale, setAdjustedScale] = useState(1)
  const [maxContainerWidth, setMaxContainerWidth] = useState<number | undefined>(undefined)
  
  useEffect(() => {
    if (typeof window === 'undefined' || !isLandscape) {
      setAdjustedScale(1)
      setMaxContainerWidth(undefined)
      return
    }
    
    const viewportWidth = viewport.width || window.innerWidth
    const viewportHeight = viewport.height || window.innerHeight
    
    // Layout theo ảnh: padding 15px mỗi bên
    const sidePadding = 15
    
    // Timeline nằm trong lề phải 15px
    // Timeline right padding: md:right-10 (40px) hoặc right-6 (24px)
    const timelineRightPadding = viewportWidth >= 768 ? 40 : 24
    // Timeline left edge = viewportWidth - timelineRightPadding - timelineWidth
    const timelineLeftEdge = viewportWidth - timelineRightPadding - timelineWidth
    
    // Nội dung căn giữa viewport thiết bị (centerX = viewportWidth / 2)
    const centerX = viewportWidth / 2
    
    // Max content width (sau scale) để không chạm timeline
    // Content right edge sau scale phải <= timelineLeftEdge - 15px (buffer tối thiểu)
    // Content right edge = centerX + (scaledWidth / 2)
    // Vậy: centerX + (scaledWidth / 2) <= timelineLeftEdge - 15
    // => scaledWidth <= 2 * (timelineLeftEdge - 15 - centerX)
    const maxScaledContentWidth = Math.max(0, 2 * (timelineLeftEdge - 15 - centerX))
    
    // Reference content width at FullHD (1920px)
    // max-w-5xl = 1280px, nhưng tính theo reference canvas width
    const referenceContentWidth = 1920 // Reference canvas width
    
    // Calculate scale based on timeline constraint
    const scaleByTimeline = maxScaledContentWidth > 0 
      ? maxScaledContentWidth / referenceContentWidth 
      : uniformScale
    
    // Use the smaller of uniform scale and timeline-constrained scale
    // This ensures content scales uniformly AND doesn't touch timeline
    const finalScale = Math.min(uniformScale, scaleByTimeline)
    
    // Clamp scale between 0.5 and 1.0
    const clampedScale = Math.max(0.5, Math.min(1.0, finalScale))
    
    // Calculate max-width for container theo công thức:
    // Max-width = Ngang màn hình - 2x(Ngang bộ timeline + khoảng cách từ mép màn hình đến mép phải timeline + 15px)
    // maxWidth = viewportWidth - 2 * (timelineWidth + timelineRightPadding + 15)
    const maxWidthBeforeScale = viewportWidth - 2 * (timelineWidth + timelineRightPadding + 15)
    
    // Debug log
    if (process.env.NODE_ENV === 'development') {
      console.log('HeroSection Uniform Scale Calculation:', {
        viewportWidth,
        viewportHeight,
        sidePadding,
        timelineRightPadding,
        timelineWidth,
        timelineLeftEdge,
        centerX,
        maxScaledContentWidth,
        referenceContentWidth,
        uniformScale,
        scaleByTimeline,
        finalScale: clampedScale,
        maxWidthBeforeScale
      })
    }
    
    setAdjustedScale(clampedScale)
    setMaxContainerWidth(maxWidthBeforeScale)
  }, [uniformScale, isLandscape, timelineWidth, viewport])

  // Parallax scroll effect for background image
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  })
  
  // Transform background image with parallax effect (moves slower than scroll)
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    // Map mode to route: 'mua-ban' -> '/chuyen-nhuong', 'cho-thue' -> '/cho-thue'
    const base = mode === 'mua-ban' ? '/chuyen-nhuong' : '/cho-thue'
    const url = keyword.trim() ? `${base}?q=${encodeURIComponent(keyword.trim())}` : base
    router.push(url)
  }

  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    setIsPortrait(!isLandscape)
  }, [isLandscape])

  return (
    <section 
      ref={sectionRef}
      className={`relative w-full flex items-center justify-center overflow-hidden ${
        isPortrait ? 'min-h-0 py-4' : 'h-screen'
      }`}
    >
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0 w-full h-full"
        style={{ 
          y: backgroundY,
          scale: backgroundScale
        }}
      >
        <div 
          className="w-full h-full"
          style={{ 
            backgroundImage: `url(${encodeURI('/images/PressUp - Ol0PCd8hlw-13.webp')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '120%' // Extra height for parallax movement
          }}
        />
      </motion.div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 z-10 bg-black/70" />
      
      {/* Wrapper container - Căn giữa viewport hoàn toàn (cả ngang và dọc) */}
      {/* Cùng z-index với timeline (z-[90]) để xử lý overlap */}
      <div 
        className={`relative z-[90] ${
          isPortrait ? 'w-full flex flex-col justify-start px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20' : 'absolute inset-0 flex items-center justify-center'
        }`}
        style={isPortrait ? { 
          paddingTop: `${headerHeight + 15}px` 
        } : {
          // Căn giữa viewport hoàn toàn, không có top/bottom để đảm bảo căn giữa chính xác
        }}
      >
        {/* Content container - Chứa toàn bộ nội dung, scale như canvas */}
        {/* Layout theo ảnh: padding 15px mỗi bên, căn giữa viewport */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={isPortrait ? 'w-full' : 'w-full'}
          style={!isPortrait ? {
            // Max-width động để đảm bảo không chạm timeline ở mọi tỷ lệ màn
            maxWidth: maxContainerWidth ? `${maxContainerWidth}px` : '1280px', // fallback to max-w-5xl
            // Layout theo ảnh: padding đối xứng 15px mỗi bên
            paddingLeft: '15px',
            paddingRight: '15px',
            // Không dùng padding top/bottom để container căn giữa hoàn toàn theo chiều dọc
            // Wrapper container sẽ xử lý việc căn giữa
            // Scale toàn bộ content container như canvas
            transform: `scale(${adjustedScale})`,
            transformOrigin: 'center center',
            // Ensure transform applies to all children
            willChange: 'transform',
            // Force hardware acceleration
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          } : {}}
        >
          {/* Tất cả nội dung căn giữa */}
          <div className="flex flex-col items-center text-center">
            <h1 className="font-heading font-bold text-goldLight tracking-normal text-[64px] md:text-[96px] lg:text-[150px] leading-[120%]">
              INLANDV
            </h1>
            
            <p className="font-bold text-white text-[20px] md:text-[32px] lg:text-[50px] leading-[140%] mb-4 lg:whitespace-nowrap">
              Cầu Nối Thịnh Vượng – Dẫn Bước Thành Công
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-10 flex flex-col items-stretch font-serifUi w-[320px] sm:w-[460px] md:w-[620px] lg:w-[720px]"
            >
            {/* Tabs nhỏ phía trên, bám trái */}
            <div className="flex text-[12px] md:text-[16px] leading-none font-heading font-bold">
              <button
                type="button"
                onClick={() => setMode('mua-ban')}
                className={`px-4 py-1.5 border border-[#e5e5e5] ${
                  mode === 'mua-ban'
                    ? 'bg-goldLight text-white border-goldLight'
                    : 'bg-[#e5e5e5] text-black/80'
                }`}
              >
                Chuyển nhượng
              </button>
              <button
                type="button"
                onClick={() => setMode('cho-thue')}
                className={`px-6 py-1.5 border border-[#e5e5e5] border-l-0 ${
                  mode === 'cho-thue'
                    ? 'bg-goldLight text-white border-goldLight'
                    : 'bg-[#e5e5e5] text-black/80'
                }`}
              >
                Cho thuê
              </button>
            </div>

            {/* Thanh search dưới, viền trắng, nút xanh */}
            <div className="mt-0 flex h-12 md:h-14">
              <div className="flex-1 flex items-center bg-[#151313] border border-white px-4">
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm kiếm địa điểm, khu vực"
                  className="w-full bg-transparent text-xs md:text-sm text-white outline-none placeholder:text-white/70"
                />
              </div>
              <button
                type="submit"
                className="-ml-[1px] px-6 md:px-8 bg-goldLight border border-goldLight text-white font-heading font-bold text-[14px] md:text-[16px] lg:text-[20px] leading-[170%] flex items-center justify-center gap-2"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
