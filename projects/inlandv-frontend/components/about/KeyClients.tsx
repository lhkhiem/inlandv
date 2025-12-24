'use client'

import { motion } from 'framer-motion'
import React from 'react'
import { Building2, Factory, MapPin, Users, Award, Star } from 'lucide-react'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useSectionReveal } from '@/hooks/useSectionReveal'
import { useState, useEffect } from 'react'
import { useCanvasScale } from '@/hooks/useCanvasScale'
import { getAssetUrl } from '@/lib/api'

interface KeyClientsProps {
  section?: {
    content?: string;
    images?: string[];
  };
}

export default function KeyClients({ section }: KeyClientsProps = {}) {
  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  
  // Uniform Canvas Scaler: Scale content uniformly based on viewport dimensions
  // Reference: 1920×1080 (FullHD 23") = scale 1.0
  // Portrait: no scaling (scale = 1)
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.0)
  
  // Calculate adjusted scale and max-width to ensure content doesn't touch timeline
  // Content is centered on viewport, but scale must account for timeline
  const [adjustedScale, setAdjustedScale] = useState(1)
  const [maxContainerWidth, setMaxContainerWidth] = useState<number | undefined>(undefined)
  
  const revealed = useSectionReveal(4) // Section index: Khách hàng & Đối tác tiêu biểu
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
  let sectionData: {
    badge?: string;
    title?: string;
    subtitle?: string;
    stats?: Array<{ icon?: string; value: string; label: string }>;
    clients?: Array<{ name: string; description: string; projects: string }>;
    backgroundImage?: string;
    footerNote?: string;
  } = {
    badge: 'Khách hàng & Đối tác',
    title: 'Khách hàng Tiêu biểu',
    subtitle: 'Hợp tác cùng các công ty FDI hàng đầu và KCN lớn trên toàn quốc',
    stats: [
      { icon: 'Building2', value: '50+', label: 'KCN hợp tác' },
      { icon: 'Users', value: '100+', label: 'Khách hàng FDI' },
      { icon: 'Award', value: '20+', label: 'Đối tác chiến lược' },
      { icon: 'Star', value: '98%', label: 'Hài lòng' },
    ],
    clients: [
      {
        name: 'Logo các công ty',
        description: 'Logo công ty FDI tiêu biểu',
        projects: '15+'
      },
      {
        name: 'Logo các KCN lớn',
        description: 'KCN đối tác tiêu biểu',
        projects: '50+'
      },
      {
        name: 'Đối tác thiết kế',
        description: 'Đối tác thi công & Xây dựng',
        projects: '20+'
      }
    ],
    backgroundImage: '/images/PressUp - SOoMBKcIfH-2.webp',
    footerNote: '* Logo các đối tác sẽ được cập nhật trong phiên bản chính thức',
  };

  if (section?.content) {
    try {
      const parsed = JSON.parse(section.content);
      sectionData = { ...sectionData, ...parsed };
      
      // Resolve logo URLs for clients if they exist
      if (parsed.clients && Array.isArray(parsed.clients)) {
        sectionData.clients = parsed.clients.map((client: any) => ({
          ...client,
          logo_urls: (client.logo_urls || []).map((urlOrId: string) => getAssetUrl(urlOrId)),
        }));
      }
      
      // Resolve background image URL if it exists
      if (parsed.backgroundImage) {
        sectionData.backgroundImage = getAssetUrl(parsed.backgroundImage);
      }
    } catch (e) {
      // If not JSON, ignore
    }
  }

  // Use first image as background if provided
  if (section?.images && section.images.length > 0) {
    sectionData.backgroundImage = getAssetUrl(section.images[0]);
  }

  // Map icon names to components
  const iconMap: Record<string, React.ComponentType<any>> = {
    Building2,
    Factory,
    MapPin,
    Users,
    Award,
    Star,
  };

  const stats = sectionData.stats?.map(stat => ({
    ...stat,
    icon: iconMap[stat.icon || 'Building2'] || Building2,
  })) || [];

  const clients = sectionData.clients || []

  return (
    <section className={`relative w-full flex items-center justify-center overflow-hidden bg-[#151313] ${
      isPortrait ? 'min-h-0 py-4' : 'h-screen'
    }`}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url(${encodeURI(sectionData.backgroundImage || '/images/PressUp - SOoMBKcIfH-2.webp')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100%'
          }}
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-10 bg-black/70" />

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
          className="text-center mb-5"
        >
          {sectionData.badge && (
            <div className="inline-block px-4 py-2 bg-[#2E8C4F]/20 rounded-full mb-3">
              <span className="text-[#2E8C4F] text-sm font-semibold tracking-wide uppercase">
                {sectionData.badge}
              </span>
            </div>
          )}
          {sectionData.title && (
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              {sectionData.title.includes('Tiêu biểu') ? (
                <>
                  {sectionData.title.split('Tiêu biểu')[0]}
                  <span className="text-[#2E8C4F]">Tiêu biểu</span>
                  {sectionData.title.split('Tiêu biểu')[1]}
                </>
              ) : (
                sectionData.title
              )}
            </h2>
          )}
          {sectionData.subtitle && (
            <p className="text-sm md:text-base text-white/80 max-w-3xl mx-auto">
              {sectionData.subtitle}
            </p>
          )}
        </motion.div>

        {/* Stats */}
        {stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: revealed ? 0.2 : 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3"
          >
            {stats.map((stat, index) => (
              <div key={index} className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 text-center">
                {React.createElement(stat.icon, { className: 'w-8 h-8 text-[#2E8C4F] mx-auto mb-2' })}
                <div className="text-3xl font-bold text-[#2E8C4F] mb-1">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Client Categories */}
        <div className="grid md:grid-cols-3 gap-4">
          {clients.map((client: any, index) => {
            const logoUrls = client.logo_urls || [];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: revealed ? 0.3 + index * 0.1 : 0 }}
                className="bg-[#1a1a1a] rounded-2xl p-6 shadow-lg border-2 border-white/10 hover:border-[#2E8C4F]/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-video bg-[#151313] rounded-xl mb-4 flex items-center justify-center border border-white/10 overflow-hidden">
                  {logoUrls.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 p-2 w-full h-full">
                      {logoUrls.slice(0, 4).map((logoUrl: string, logoIndex: number) => (
                        <img
                          key={logoIndex}
                          src={logoUrl}
                          alt={`${client.name} logo ${logoIndex + 1}`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Building2 className="w-12 h-12 text-white/30 mx-auto mb-2" />
                      <p className="text-sm text-white/50">{client.name}</p>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-white mb-2">{client.description}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Dự án thành công</span>
                  <span className="text-2xl font-bold text-[#2E8C4F]">{client.projects}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {sectionData.footerNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={revealed ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: revealed ? 0.6 : 0 }}
            className="text-center mt-8"
          >
            <p className="text-white/60 italic">
              {sectionData.footerNote}
            </p>
          </motion.div>
        )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
