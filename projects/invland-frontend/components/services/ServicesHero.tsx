'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { useFullpage } from '@/components/FullpageContext'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'

export default function ServicesHero() {
  const sectionRef = useRef(null)
  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  
  // Uniform Canvas Scaler: Scale content uniformly based on viewport dimensions
  // Reference: 1920×1080 (FullHD 23") = scale 1.0
  // Portrait: no scaling (scale = 1)
  // Tăng scale max lên 1.15 để hiển thị to hơn ở fullHD
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.15)
  
  // Calculate adjusted scale and max-width to ensure content doesn't touch timeline
  // Content is centered on viewport, but scale must account for timeline
  const [adjustedScale, setAdjustedScale] = useState(1)
  const [maxContainerWidth, setMaxContainerWidth] = useState<number | undefined>(undefined)
  
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    setIsPortrait(!isLandscape)
  }, [isLandscape])

  // Calculate max-width and scale for landscape mode
  useEffect(() => {
    if (typeof window === 'undefined' || !isLandscape) {
      setAdjustedScale(1)
      setMaxContainerWidth(undefined)
      return
    }
    
    const viewportWidth = viewport.width || window.innerWidth
    
    // Timeline right padding: md:right-10 (40px) hoặc right-6 (24px)
    const timelineRightPadding = viewportWidth >= 768 ? 40 : 24
    // Timeline left edge = viewportWidth - timelineRightPadding - timelineWidth
    const timelineLeftEdge = viewportWidth - timelineRightPadding - timelineWidth
    
    // Nội dung căn giữa viewport thiết bị (centerX = viewportWidth / 2)
    const centerX = viewportWidth / 2
    
    // Max content width (sau scale) để không chạm timeline
    // Tăng buffer space lên 30px (thay vì 15px) để đảm bảo không chạm ở màn hình lớn
    // Content right edge sau scale phải <= timelineLeftEdge - buffer
    // Content right edge = centerX + (scaledWidth / 2)
    // => scaledWidth <= 2 * (timelineLeftEdge - buffer - centerX)
    const bufferSpace = 30 // Tăng buffer để tránh chạm timeline ở màn hình lớn
    const maxScaledContentWidth = Math.max(0, 2 * (timelineLeftEdge - bufferSpace - centerX))
    
    // Reference content width - giảm xuống để scale to hơn ở fullHD
    // Ở fullHD (1920px), nếu dùng 1600px làm reference thì scale sẽ lớn hơn (~1.2x)
    const referenceContentWidth = 1600
    
    // Calculate scale based on timeline constraint
    const scaleByTimeline = maxScaledContentWidth > 0
      ? maxScaledContentWidth / referenceContentWidth
      : uniformScale
    
    // Use the smaller of uniform scale and timeline-constrained scale
    // Đảm bảo không vượt quá timeline constraint
    const finalScale = Math.min(uniformScale, scaleByTimeline)
    
    // Clamp scale between 0.5 and 1.15 (cho phép scale to hơn ở fullHD)
    const clampedScale = Math.max(0.5, Math.min(1.15, finalScale))
    
    // Max-width = Ngang màn hình - 2x(Ngang bộ timeline + khoảng cách từ mép màn hình đến mép phải timeline + buffer)
    // Tăng buffer để đảm bảo không chạm timeline ở màn hình lớn
    const maxWidthBeforeScale = viewportWidth - 2 * (timelineWidth + timelineRightPadding + bufferSpace)
    
    setAdjustedScale(clampedScale)
    setMaxContainerWidth(maxWidthBeforeScale)
  }, [uniformScale, isLandscape, timelineWidth, viewport])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6])
  const { currentSection } = useFullpage()

  return (
    <section 
      ref={sectionRef} 
      className={`relative w-full flex items-center justify-center overflow-hidden bg-[#151313] bg-cover bg-center bg-no-repeat ${
        isPortrait ? 'min-h-screen py-8' : 'h-screen'
      }`}
      style={{ backgroundImage: 'url(/images/processed-image-7-8.webp)' }}
    >
      {/* Dark overlay - 70% (giảm 20% so với 90%) */}
      <div className="absolute inset-0 bg-black/70 z-10" />
      
      {/* Wrapper container - Căn giữa viewport (cả ngang và dọc) */}
      <div
        className={`relative z-[90] ${
          isPortrait 
            ? 'w-full flex flex-col justify-start px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20' 
            : 'absolute inset-0 flex items-center justify-center'
        }`}
        style={isPortrait ? {
          paddingTop: `${headerHeight + 15}px`
        } : {}}
      >
        {/* Content Container - Max-width động, scale như canvas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={!isPortrait ? {
            opacity,
            // Max-width động để đảm bảo không chạm timeline
            maxWidth: maxContainerWidth ? `${maxContainerWidth}px` : '1280px',
            // Padding đối xứng 15px mỗi bên (theo layout ảnh)
            paddingLeft: '15px',
            paddingRight: '15px',
            // Scale toàn bộ content container như canvas
            transform: `scale(${adjustedScale})`,
            transformOrigin: 'center center',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          } : {
            opacity
          }}
          className={isPortrait ? 'w-full py-8 text-center' : 'w-full text-center'}
        >
          <div className="max-w-5xl mx-auto">
          <div className="inline-block mb-6 px-6 py-2 bg-goldDark/30 backdrop-blur-sm border border-goldLight/30 rounded-full">
            <span className="text-goldLight text-sm md:text-base font-medium tracking-wider uppercase">
              Giải pháp toàn diện
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Giải Pháp Bất Động Sản Công Nghiệp
            <br />
            <span className="text-goldLight">Toàn Diện Cho Doanh Nghiệp FDI.</span>
          </h1>
          
          <p className="text-base md:text-lg text-gray-200 mb-6 max-w-3xl mx-auto leading-relaxed">
            Đồng hành trên mọi chặng đường, từ tìm kiếm đến xây dựng và phát triển.
          </p>
          <a
            href="/brochures/dich-vu.pdf"
            download
            className="inline-flex items-center gap-2 px-7 py-3 bg-goldLight text-white font-semibold rounded-lg hover:bg-white hover:text-[#2E8C4F] transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            aria-label="Tải Brochure dịch vụ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Tải Brochure
          </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
