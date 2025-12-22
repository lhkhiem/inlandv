'use client'

import { motion } from 'framer-motion'
import { Award, Users, Network, Shield } from 'lucide-react'
import { useSectionReveal } from '@/hooks/useSectionReveal'
import { useState, useEffect } from 'react'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'

export default function MissionVision() {
  const revealed = useSectionReveal(3) // Section index: Tại sao nên chọn Inlandv
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
  const items = [
    {
      icon: Award,
      title: 'Kinh nghiệm dày dặn',
      subtitle: 'Hơn 15 năm trong lĩnh vực BĐS',
      description: 'Với hơn 15 năm kinh nghiệm trong lĩnh vực bất động sản công nghiệp, INLANDV đã tích lũy kiến thức sâu rộng về thị trường, quy trình và xu hướng đầu tư. Chúng tôi hiểu rõ từng chi tiết pháp lý, quy hoạch và thực tiễn triển khai dự án.'
    },
    {
      icon: Users,
      title: 'Đội ngũ chuyên nghiệp',
      subtitle: 'Chuyên gia hàng đầu',
      description: 'Đội ngũ của chúng tôi bao gồm các chuyên gia có trình độ cao, am hiểu sâu về bất động sản công nghiệp, pháp lý và đầu tư. Mỗi thành viên đều được đào tạo bài bản và có kinh nghiệm thực tế trong việc hỗ trợ các dự án FDI thành công.'
    },
    {
      icon: Network,
      title: 'Mạng lưới đối tác rộng lớn',
      subtitle: 'Kết nối toàn diện',
      description: 'INLANDV sở hữu mạng lưới đối tác chiến lược rộng khắp, từ các chủ đầu tư KCN uy tín, nhà cung cấp dịch vụ chuyên nghiệp đến các tổ chức tài chính. Mạng lưới này giúp chúng tôi cung cấp giải pháp toàn diện và tối ưu cho khách hàng.'
    },
    {
      icon: Shield,
      title: 'Cam kết minh bạch',
      subtitle: 'Uy tín được đảm bảo',
      description: 'Minh bạch trong mọi giao dịch là nguyên tắc hàng đầu của INLANDV. Chúng tôi cam kết cung cấp thông tin chính xác, rõ ràng và đầy đủ, đảm bảo khách hàng có đầy đủ cơ sở để đưa ra quyết định đầu tư đúng đắn.'
    }
  ]

  return (
    <section className={`relative w-full flex items-center justify-center overflow-hidden bg-[#151313] ${
      isPortrait ? 'min-h-0 py-4' : 'h-screen'
    }`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/processed-image-12-13.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 z-[1] bg-black/75" />
      {/* Wrapper container - Căn giữa viewport (cả ngang và dọc) */}
      <div
        className={`relative z-[10] ${
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
          initial={{ opacity: 0, y: 30 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
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
          <div className="flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-block px-4 py-2 bg-[#2E8C4F]/20 rounded-full mb-3">
            <span className="text-[#2E8C4F] text-sm font-semibold tracking-wide uppercase">
              Uy tín & Chất lượng
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            Tại sao nên chọn <span className="text-[#2E8C4F]">Inlandv</span>
          </h2>
          <p className="text-sm md:text-base text-white/80 max-w-3xl mx-auto">
            Những điểm mạnh tạo nên uy tín và sự tin cậy của INLANDV trong lĩnh vực bất động sản công nghiệp
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: revealed ? 0.1 + index * 0.1 : 0 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 border-2 border-white/10 hover:border-[#2E8C4F]/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#2E8C4F]/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-7 h-7 text-[#2E8C4F]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm font-medium text-[#2E8C4F] mb-2">
                    {item.subtitle}
                  </p>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
