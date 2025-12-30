'use client'

import { motion } from 'framer-motion'
import { useSectionReveal } from '@/hooks/useSectionReveal'
import { useRef, useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'
import { getAssetUrl } from '@/lib/api'
import 'swiper/css'
import 'swiper/css/navigation'

interface KeyTeamProps {
  section?: {
    content?: string;
    images?: string[];
  };
}

export default function KeyTeam({ section }: KeyTeamProps = {}) {
  const revealed = useSectionReveal(2) // Section index: Đội ngũ lãnh đạo
  const swiperRef = useRef<SwiperType | null>(null)
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

  // Parse content from CMS (JSON string) or use defaults
  let teamMembers: Array<{
    id: number;
    name: string;
    position: string;
    description: string;
    image: string | null;
  }> = [
    {
      id: 1,
      name: 'Ms Lisa Nghia',
      position: 'CEO & Founder',
      description: 'Giới thiệu:....',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=800&fit=crop&q=85'
    },
    {
      id: 2,
      name: 'Ms Oanh Hoang',
      position: 'COO',
      description: 'Giới thiệu:....',
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=800&fit=crop&q=85'
    },
    {
      id: 3,
      name: 'Ms Anna Tran',
      position: 'CFO',
      description: 'Giới thiệu:....',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&q=85'
    },
    {
      id: 4,
      name: 'Ms Sarah Le',
      position: 'CMO',
      description: 'Giới thiệu:....',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&q=85'
    }
  ];

  if (section?.content) {
    try {
      const parsed = JSON.parse(section.content);
      if (parsed.members && Array.isArray(parsed.members)) {
        teamMembers = parsed.members.map((member: any, index: number) => {
          // Get image from member.image, section.images array, or use default
          let imageUrl = member.image || (section.images && section.images[index]) || '';
          // Resolve asset URL if it's an ID or relative path
          if (imageUrl && imageUrl.trim()) {
            imageUrl = getAssetUrl(imageUrl);
          } else {
            imageUrl = null;
          }
          return {
            id: member.id || index + 1,
            name: member.name || '',
            position: member.position || '',
            description: member.description || '',
            image: imageUrl,
          };
        });
      }
    } catch (e) {
      // If not JSON, ignore
    }
  }

  // Use images from section if provided
  if (section?.images && section.images.length > 0) {
    teamMembers = teamMembers.map((member, index) => {
      const imageUrl = section.images![index] || member.image;
      // Resolve asset URL if it's an ID or relative path
      const resolvedUrl = (imageUrl && imageUrl.trim()) ? getAssetUrl(imageUrl) : null;
      return {
        ...member,
        image: resolvedUrl,
      };
    });
  }

  return (
    <section 
      className={`relative w-full flex items-center justify-center overflow-hidden bg-[#F5F5F5] ${
        isPortrait ? 'min-h-0 py-4' : 'h-screen'
      }`}
    >
      {/* Wrapper container - Căn giữa viewport (cả ngang và dọc) */}
      <div
        className={`relative z-[90] ${
          isPortrait 
            ? 'w-full flex flex-col justify-start px-4 sm:px-6 md:px-8' 
            : 'absolute inset-0 flex items-center justify-center'
        }`}
        style={isPortrait ? {
          paddingTop: `${headerHeight + 15}px`
        } : {}}
      >
        {/* Content Container - Max-width động, scale như canvas */}
        {/* Max-width cần trừ thêm không gian cho navigation buttons (mỗi button ~48px + margin 8px = ~56px mỗi bên) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className={isPortrait ? 'w-full py-4' : 'w-full'}
          style={!isPortrait ? {
            // Max-width động để đảm bảo không chạm timeline
            // Trừ thêm ~56px mỗi bên cho navigation buttons (48px button + 8px margin)
            maxWidth: maxContainerWidth ? `${maxContainerWidth - 112}px` : '1168px',
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
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-6 md:mb-8"
            >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#2E8C4F] mb-2">
                Đội ngũ <span className="text-[#2E8C4F]">lãnh đạo</span>
              </h2>
            </motion.div>

            {/* Slider Container with Navigation Inside - Đặt navigation trong container đã scale */}
            <div className="relative w-full">
              {/* Navigation Buttons - Positioned relative to slider container, đảm bảo không vượt quá container */}
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={!isPortrait ? { 
                  transform: 'translate(-100%, -50%)',
                  marginRight: '8px'
                } : {
                  transform: 'translateY(-50%)',
                  left: '-16px'
                }}
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-[#2E8C4F]" />
              </button>
              
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={!isPortrait ? { 
                  transform: 'translate(100%, -50%)',
                  marginLeft: '8px'
                } : {
                  transform: 'translateY(-50%)',
                  right: '-16px'
                }}
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-[#2E8C4F]" />
              </button>

          {/* Swiper Slider */}
          <Swiper
            onSwiper={(swiper) => { swiperRef.current = swiper }}
            modules={[Navigation]}
            loop={true}
            loopAdditionalSlides={2}
            spaceBetween={isPortrait ? 16 : 8}
            slidesPerView={isPortrait ? 1 : 2}
            slidesPerGroup={isPortrait ? 1 : 2}
            breakpoints={{
              0: {
                slidesPerView: 1,
                slidesPerGroup: 1,
                spaceBetween: 16,
              },
              640: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 8,
              },
              1024: {
                slidesPerView: 2,
                slidesPerGroup: 2,
                spaceBetween: 12,
              },
            }}
            className="!pb-4"
          >
            {teamMembers.map((member) => (
              <SwiperSlide key={member.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: revealed ? 0.2 : 0 }}
                  className="flex flex-col items-center px-2"
                >
                  {/* Image */}
                  <div className="w-full max-w-[340px] aspect-[3/4] bg-gray-700 border-2 border-white rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                    {member.image && member.image.trim() ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent && !parent.querySelector('.error-placeholder')) {
                            const placeholder = document.createElement('div')
                            placeholder.className = 'error-placeholder w-full h-full flex items-center justify-center text-[#2E8C4F] text-sm'
                            placeholder.textContent = 'Image Placeholder'
                            parent.appendChild(placeholder)
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#2E8C4F] text-sm">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Member Info */}
                  <div className="text-center space-y-1">
                    <h3 className="text-lg md:text-xl font-bold text-[#2E8C4F]">
                      {member.name}
                    </h3>
                    <p className="text-base md:text-lg text-[#2E8C4F] font-semibold">
                      {member.position}
                    </p>
                    <p className="text-xs md:text-sm text-[#2E8C4F]">
                      {member.description}
                    </p>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
