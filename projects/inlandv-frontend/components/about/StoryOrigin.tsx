'use client'

import { motion } from 'framer-motion'
import { useSectionReveal } from '@/hooks/useSectionReveal'
import { Eye, Rocket, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'

interface StoryOriginProps {
  section?: {
    content?: string;
    images?: string[];
  };
}

export default function StoryOrigin({ section }: StoryOriginProps = {}) {
  // Parse content from CMS (JSON string) or use defaults
  let storyData: {
    paragraphs?: string[];
    vision?: { title: string; content: string };
    mission?: { title: string; content: string };
    coreValues?: { title: string; content: string };
  } = {
    paragraphs: [
      'INLANDV được chính thức thành lập vào năm 2022, được quản lý bởi Hội đồng quản trị với hơn 15 năm kinh nghiệm trong lĩnh vực bất động sản. Chúng tôi nhanh chóng thiết lập vị thế trong Bất động sản Công nghiệp - Thương mại, cung cấp giải pháp toàn diện cho việc thuê kho, đất công nghiệp và tòa nhà văn phòng tại TP.HCM và các tỉnh trọng điểm như Long An, Bình Dương, Bình Phước và Tây Ninh.',
      'Mạng lưới đối tác chiến lược của chúng tôi, với những người mà chúng tôi hợp tác để cung cấp giải pháp bất động sản được điều chỉnh cho sự phát triển sản xuất và kinh doanh. Một số đối tác đáng chú ý: Công ty Vật Liệu Hút Chân Không Cách Nhiệt, Khách Sạn Huazhu, Dự Án Eaton Park, và Global City.',
      'Với kinh nghiệm thực tế và khả năng đã được chứng minh, INLANDV sẵn sàng hợp tác với khách hàng để tạo ra giá trị lâu dài và thúc đẩy thành công bền vững.',
    ],
    vision: {
      title: 'Tầm nhìn',
      content: 'INLANDV hướng đến vị thế dẫn đầu trong lĩnh vực Bất động sản, đặc biệt là bất động sản công nghiệp, đồng thời xây dựng hệ sinh thái bất động sản đột phá và bền vững.',
    },
    mission: {
      title: 'Sứ mệnh',
      content: 'INLANDV cam kết mang đến giải pháp bất động sản toàn diện, tối ưu chi phí – gia tăng giá trị đầu tư. Chúng tôi đồng hành cùng doanh nghiệp mở rộng kết nối toàn cầu, nâng cao vị thế trên thị trường quốc tế.',
    },
    coreValues: {
      title: 'Giá trị cốt lõi',
      content: 'Tận tâm - Chuyên nghiệp - Minh bạch – Bền vững.',
    },
  };

  if (section?.content) {
    try {
      const parsed = JSON.parse(section.content);
      storyData = { ...storyData, ...parsed };
    } catch (e) {
      // If not JSON, split by newlines for paragraphs
      const lines = section.content.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        storyData.paragraphs = lines;
      }
    }
  }
  const revealed = useSectionReveal(1) // Section index: Câu chuyện Inlandv
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
    <section className={`relative w-full flex items-center justify-center overflow-hidden bg-[#151313] ${
      isPortrait ? 'min-h-0 py-4' : 'h-screen'
    }`}>
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
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className={isPortrait ? 'w-full py-4' : 'w-full max-h-[85vh] overflow-y-auto scrollbar-hide'}
          style={!isPortrait ? {
            // Max-width động để đảm bảo không chạm timeline
            maxWidth: maxContainerWidth ? `${maxContainerWidth}px` : '1600px',
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
          <div className="flex flex-col gap-8 md:gap-12 font-serif">
            {/* Top Section: 3 paragraphs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-white"
            >
              {storyData.paragraphs?.map((paragraph, index) => (
                <p key={index} className="text-base md:text-lg leading-relaxed italic font-semibold text-justify">
                  {paragraph}
                </p>
              ))}
            </motion.div>

            {/* Bottom Section: 3 columns - Vision, Mission, Core Values */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid md:grid-cols-3 gap-6 md:gap-8"
            >
              {/* Vision */}
              {storyData.vision && (
                <div className="text-center p-6 rounded-xl border-2 border-[#2E8C4F] bg-gray-800/30">
                  <div className="flex justify-center mb-4">
                    <Eye className="w-8 h-8 text-[#2E8C4F]" />
                  </div>
                  <h3 className="text-base md:text-lg text-white leading-relaxed italic font-semibold">
                    <span className="font-semibold italic">{storyData.vision.title}:</span> {storyData.vision.content}
                  </h3>
                </div>
              )}

              {/* Mission */}
              {storyData.mission && (
                <div className="text-center p-6 rounded-xl border-2 border-[#2E8C4F] bg-gray-800/30">
                  <div className="flex justify-center mb-4">
                    <Rocket className="w-8 h-8 text-[#2E8C4F]" />
                  </div>
                  <h3 className="text-base md:text-lg text-white leading-relaxed italic font-semibold">
                    <span className="font-semibold italic">{storyData.mission.title}:</span> {storyData.mission.content}
                  </h3>
                </div>
              )}

              {/* Core Values */}
              {storyData.coreValues && (
                <div className="text-center p-6 rounded-xl border-2 border-[#2E8C4F] bg-gray-800/30">
                  <div className="flex justify-center mb-4">
                    <Heart className="w-8 h-8 text-[#2E8C4F]" />
                  </div>
                  <h3 className="text-base md:text-lg text-white leading-relaxed italic font-semibold">
                    <span className="font-semibold italic">{storyData.coreValues.title}:</span> {storyData.coreValues.content}
                  </h3>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
