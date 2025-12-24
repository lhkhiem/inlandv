'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'
import { cleanObjectStrings, cleanText } from '@/lib/utils/content'
import { getAssetUrl } from '@/lib/api' // Import asset URL resolver

// Counter animation hook
function useCounter(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start)

  const animate = () => {
    const startTime = Date.now()
    const endTime = startTime + duration

    const timer = setInterval(() => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = Math.floor(start + (end - start) * easeOutQuart)
      
      setCount(currentCount)

      if (now >= endTime) {
        setCount(end)
        clearInterval(timer)
      }
    }, 16)

    return () => clearInterval(timer)
  }

  return { count, animate }
}

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

interface AboutHeroProps {
  section?: {
    content?: string;
    images?: string[];
  };
}

export default function AboutHero({ section }: AboutHeroProps = {}) {
  // Debug: Log section data
  if (section) {
    console.log('AboutHero received section:', {
      hasContent: !!section.content,
      hasImages: !!section.images,
      contentLength: section.content?.length || 0
    })
  } else {
    console.log('AboutHero: No section data, using defaults')
  }

  // Parse content from CMS (JSON string) or use defaults
  let heroData: {
    logo?: string;
    description?: string;
    stats?: Array<{ value: number; suffix: string; label: string }>;
    backgroundImage?: string;
  } = {
    logo: '/logo-1.png',
    description: 'Với hơn 15 năm kinh nghiệm trong lĩnh vực bất động sản, chúng tôi tự hào là đối tác đáng tin cậy của hàng nghìn khách hàng trên khắp cả nước. Sự hài lòng của bạn chính là thành công của chúng tôi.',
    stats: [
      { value: 15, suffix: '+', label: 'Năm Kinh Nghiệm' },
      { value: 200, suffix: '+', label: 'Dự Án' },
      { value: 5000, suffix: '+', label: 'Khách Hàng' },
      { value: 50, suffix: '+', label: 'Đối Tác' },
    ],
    backgroundImage: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=2000&q=80',
  };

  if (section?.content) {
    try {
      const parsed = JSON.parse(section.content);
      // Clean all string fields to remove HTML tags
      const cleaned = cleanObjectStrings(parsed);
      heroData = { ...heroData, ...cleaned };
      
      // Resolve logo URL if it exists
      if (heroData.logo) {
        heroData.logo = getAssetUrl(heroData.logo);
      }
      
      // Resolve background image URL if it exists
      if (heroData.backgroundImage) {
        heroData.backgroundImage = getAssetUrl(heroData.backgroundImage);
      }
      
      console.log('AboutHero: Parsed content successfully', { 
        hasDescription: !!parsed.description,
        hasStats: !!parsed.stats,
        statsCount: parsed.stats?.length || 0,
        logoUrl: heroData.logo,
        backgroundImageUrl: heroData.backgroundImage
      })
    } catch (e) {
      // If not JSON, use as plain text description (strip HTML)
      console.warn('AboutHero: Failed to parse JSON, using as plain text', e)
      heroData.description = cleanText(section.content);
    }
  } else {
    console.log('AboutHero: No section content, using defaults')
  }

  // Use first image as background if provided (and not already set from JSON)
  if (!heroData.backgroundImage && section?.images && section.images.length > 0) {
    heroData.backgroundImage = getAssetUrl(section.images[0]);
  }
  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  
  // Uniform Canvas Scaler: Scale content uniformly based on viewport dimensions
  // Reference: 1920×1080 (FullHD 23") = scale 1.0
  // Portrait: no scaling (scale = 1)
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.0)
  
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
    
    // Max-width = Ngang màn hình - 2x(Ngang bộ timeline + khoảng cách từ mép màn hình đến mép phải timeline + 15px)
    const maxWidthBeforeScale = viewportWidth - 2 * (timelineWidth + timelineRightPadding + 15)
    
    setAdjustedScale(clampedScale)
    setMaxContainerWidth(maxWidthBeforeScale)
  }, [uniformScale, isLandscape, timelineWidth, viewport])

  return (
    <section className={`relative w-full flex items-center justify-center overflow-hidden ${
      isPortrait ? 'min-h-0 py-4' : 'h-screen'
    }`}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-goldDark/30 z-[5]" />
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${heroData.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>

      {/* Wrapper container - Căn giữa viewport (cả ngang và dọc) */}
      <div
        className={`relative z-[90] ${
          isPortrait 
            ? 'w-full flex flex-col justify-start px-4 sm:px-6 md:px-12' 
            : 'absolute inset-0 flex items-center justify-center'
        }`}
        style={isPortrait ? {
          paddingTop: `${headerHeight + 15}px`
        } : {}}
      >
        {/* Content Container - Max-width động, scale như canvas */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={isPortrait ? 'w-full' : 'w-full'}
          style={!isPortrait ? {
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
          } : {}}
        >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8 flex justify-center"
          >
            <img
              src={heroData.logo || '/logo-1.png'}
              alt="INLANDV Logo"
              className={`w-auto ${isPortrait ? 'h-[120px]' : 'h-[200px] md:h-[250px] lg:h-[300px]'}`}
            />
          </motion.div>
          
          {heroData.description && (
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              {heroData.description}
            </p>
          )}
        </motion.div>

        {/* Stats with counter animation */}
        {heroData.stats && heroData.stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto"
          >
            {heroData.stats.map((stat, index) => (
              <div key={index} className="text-center backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-goldLight/10">
                <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} duration={2000 + index * 200} />
                <div className="text-sm md:text-base text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}
        </motion.div>
      </div>
    </section>
  )
}
