'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useSectionReveal } from '@/hooks/useSectionReveal'
import { api } from '@/lib/api'
import type { IndustrialPark } from '@/lib/types'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'
import { getAssetUrl } from '@/lib/api'
import { useContactSettings } from '@/hooks/useContactSettings'

// Hardcoded fallback data for "Cho Thuê"
const FALLBACK_DATA_CHO_THUE: IndustrialPark[] = [
  {
    id: 'hardcoded-thue-1',
    code: 'INL-THUE-001',
    name: 'Nhà xưởng KCN Tân Bình',
    slug: 'nha-xuong-kcn-tan-binh',
    scope: 'trong-kcn',
    has_rental: true,
    has_transfer: false,
    has_factory: true,
    province: 'TP.HCM',
    district: 'Tân Bình',
    total_area: 500,
    available_area: 120,
    rental_price_min: 80000,
    rental_price_max: 150000,
    description: 'Nhà xưởng tiêu chuẩn, hạ tầng hoàn thiện, phù hợp DN FDI và logistics. Cho thuê dài hạn, giá cạnh tranh.',
    description_full: 'Nhà xưởng tiêu chuẩn trong KCN Tân Bình, hạ tầng hoàn thiện, phù hợp cho các doanh nghiệp FDI và logistics. Cho thuê dài hạn, giá cạnh tranh.',
    thumbnail_url: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['dien-tu', 'co-khi', 'hoa-chat'],
    contact_phone: '0901234567',
    contact_email: 'thue.tanbinh@inland.vn',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'hardcoded-thue-2',
    code: 'INL-THUE-002',
    name: 'Nhà xưởng KCN Long Thành',
    slug: 'nha-xuong-kcn-long-thanh',
    scope: 'trong-kcn',
    has_rental: true,
    has_transfer: false,
    has_factory: true,
    province: 'Đồng Nai',
    district: 'Long Thành',
    total_area: 1200,
    available_area: 450,
    rental_price_min: 70000,
    rental_price_max: 120000,
    description: 'Nhà xưởng quy mô lớn, gần sân bay Long Thành. Cho thuê linh hoạt, phù hợp logistics và sản xuất.',
    description_full: 'Nhà xưởng quy mô lớn trong KCN Long Thành, gần sân bay quốc tế Long Thành. Cho thuê linh hoạt, phù hợp cho các doanh nghiệp logistics và sản xuất.',
    thumbnail_url: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: false, internet: true, road: true, security: true },
    allowed_industries: ['may-mac', 'co-khi', 'nong-san'],
    contact_phone: '0909876543',
    contact_email: 'thue.longthanh@inland.vn',
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
  {
    id: 'hardcoded-thue-3',
    code: 'INL-THUE-003',
    name: 'Kho bãi KCN Hiệp Phước',
    slug: 'kho-bai-kcn-hiep-phuoc',
    scope: 'trong-kcn',
    has_rental: true,
    has_transfer: false,
    has_factory: true,
    province: 'TP.HCM',
    district: 'Nhà Bè',
    total_area: 800,
    available_area: 200,
    rental_price_min: 90000,
    rental_price_max: 160000,
    description: 'Kho bãi sát cảng Hiệp Phước, logistics thuận lợi. Cho thuê kho lạnh, kho thường, phù hợp nhiều ngành.',
    description_full: 'Kho bãi trong KCN Hiệp Phước, sát cảng Hiệp Phước, thuận lợi cho logistics và xuất nhập khẩu. Cho thuê kho lạnh, kho thường, phù hợp cho nhiều ngành công nghiệp.',
    thumbnail_url: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['dien-tu', 'duoc-pham', 'thuc-pham'],
    contact_phone: '0903456789',
    contact_email: 'thue.hiepphuoc@inland.vn',
    created_at: '2025-01-03T00:00:00Z',
    updated_at: '2025-01-03T00:00:00Z',
  },
  {
    id: 'hardcoded-thue-4',
    code: 'INL-THUE-004',
    name: 'Nhà xưởng KCN số 5 Hưng Yên',
    slug: 'nha-xuong-kcn-so-5-hung-yen',
    scope: 'trong-kcn',
    has_rental: true,
    has_transfer: false,
    has_factory: true,
    province: 'Hưng Yên',
    district: 'Văn Lâm',
    total_area: 580,
    available_area: 220,
    rental_price_min: 50000,
    rental_price_max: 85000,
    description: 'Nhà xưởng hiện đại, hạ tầng cao cấp, phù hợp công nghiệp công nghệ cao. Cho thuê dài hạn.',
    description_full: 'Nhà xưởng hiện đại trong KCN số 5 Hưng Yên, hạ tầng kỹ thuật cao cấp. Phù hợp cho các doanh nghiệp công nghệ cao, điện tử, dược phẩm. Cho thuê dài hạn.',
    thumbnail_url: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['dien-tu', 'co-khi', 'hoa-chat', 'duoc-pham'],
    contact_phone: '0221 3847 789',
    contact_email: 'thue.hungyen@inland.vn',
    created_at: '2025-01-04T00:00:00Z',
    updated_at: '2025-01-04T00:00:00Z',
  },
  {
    id: 'hardcoded-thue-5',
    code: 'INL-THUE-005',
    name: 'Kho bãi KCN Amata Sông Khoai',
    slug: 'kho-bai-kcn-amata-song-khoai',
    scope: 'trong-kcn',
    has_rental: true,
    has_transfer: false,
    has_factory: true,
    province: 'Quảng Ninh',
    district: 'Đông Triều',
    total_area: 750,
    available_area: 280,
    rental_price_min: 60000,
    rental_price_max: 100000,
    description: 'Kho bãi quy mô lớn, hạ tầng cao cấp, gần cảng biển. Cho thuê kho logistics, kho container.',
    description_full: 'Kho bãi trong KCN Amata Sông Khoai, quy mô lớn với hạ tầng kỹ thuật đẳng cấp quốc tế. Gần cảng biển Cái Lân, thuận lợi cho xuất nhập khẩu. Cho thuê kho logistics, kho container.',
    thumbnail_url: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['dien-tu', 'co-khi', 'logistics', 'kho-bai'],
    contact_phone: '0203 3856 890',
    contact_email: 'thue.amata@inland.vn',
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2025-01-05T00:00:00Z',
  },
  {
    id: 'hardcoded-thue-6',
    code: 'INL-THUE-006',
    name: 'Nhà xưởng KCN Sông Lô 2',
    slug: 'nha-xuong-kcn-song-lo-2',
    scope: 'trong-kcn',
    has_rental: true,
    has_transfer: false,
    has_factory: true,
    province: 'Vĩnh Phúc',
    district: 'Bình Xuyên',
    total_area: 480,
    available_area: 150,
    rental_price_min: 52000,
    rental_price_max: 88000,
    description: 'Nhà xưởng hiện đại, gần Hà Nội, phù hợp nhiều ngành công nghiệp. Cho thuê linh hoạt.',
    description_full: 'Nhà xưởng trong KCN Sông Lô 2, gần Hà Nội, thuận tiện cho các doanh nghiệp cần tiếp cận thị trường miền Bắc. Hạ tầng kỹ thuật hoàn chỉnh, phù hợp cho nhiều ngành công nghiệp. Cho thuê linh hoạt.',
    thumbnail_url: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['dien-tu', 'co-khi', 'thuc-pham', 'duoc-pham'],
    contact_phone: '0211 3847 345',
    contact_email: 'thue.songlo2@inland.vn',
    created_at: '2025-01-06T00:00:00Z',
    updated_at: '2025-01-06T00:00:00Z',
  },
]

// Section: Cho Thuê
export default function IndustrialLeaseSection() {
  const revealed = useSectionReveal(3) // section index 3 trên homepage
  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  const { settings: contactSettings, loading: settingsLoading } = useContactSettings()
  
  // Uniform scaling hook
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.0)
  
  // State cho scale và max-width
  const [adjustedScale, setAdjustedScale] = useState(1)
  const [maxContainerWidth, setMaxContainerWidth] = useState<number | undefined>(undefined)

  // State cho data, loading, error
  // Initialize with hardcoded data as fallback
  const [parks, setParks] = useState<IndustrialPark[]>(FALLBACK_DATA_CHO_THUE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from API - only once
  useEffect(() => {
    let isMounted = true
    let hasFetched = false
    
    const fetchData = async () => {
      if (hasFetched) return
      hasFetched = true
      
      try {
        setLoading(true)
        setError(null)
        
        // Add timeout to prevent waiting too long
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        })
        
        const data = await Promise.race([
          api.getPropertiesChoThue(6),
          timeoutPromise
        ]) as IndustrialPark[]
        
        if (isMounted) {
          // Use API data if available, otherwise use hardcoded data
          if (data && Array.isArray(data) && data.length > 0) {
            setParks(data)
          } else {
            console.warn('[Component] No data from API, using hardcoded data')
            setParks(FALLBACK_DATA_CHO_THUE)
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching cho thue:', err)
          console.log('[Component] Using hardcoded data as fallback')
          // Use hardcoded data when API fails
          setParks(FALLBACK_DATA_CHO_THUE)
          setError(null) // Don't show error, use hardcoded data instead
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Small delay to stagger requests
    const timeoutId = setTimeout(fetchData, 50)
    
    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  // Helper function to get province name
  // Backend should already map province code to name, but we'll clean it up just in case
  const getProvinceName = (province: string | undefined): string => {
    if (!province) return ''
    
    const trimmed = province.trim()
    
    // If province is just a number (code), don't display it (backend should have mapped it)
    if (/^\d+$/.test(trimmed)) {
      return ''
    }
    
    // If it contains text, return it (backend should have mapped code to name)
    return trimmed
  }
  
  // Map industrial parks to cards format
  // Use useMemo to re-compute when parks or contactSettings change
  const cards = useMemo(() => parks.map((park) => {
    // Convert rental price từ VND/m²/tháng sang USD/m²/tháng
    const priceMinUSD = park.rental_price_min ? (park.rental_price_min / 24000).toFixed(2) : '0'
    const priceMaxUSD = park.rental_price_max ? (park.rental_price_max / 24000).toFixed(2) : '0'
    const priceDisplay = priceMinUSD === priceMaxUSD 
      ? `$ ${priceMinUSD} USD/m²/tháng`
      : `$ ${priceMinUSD} - ${priceMaxUSD} USD/m²/tháng`
    
    // Convert area từ ha sang m²
    const areaM2 = park.available_area 
      ? (park.available_area * 10000).toLocaleString('vi-VN')
      : park.total_area 
        ? (park.total_area * 10000).toLocaleString('vi-VN')
        : '0'
    
    // Get thumbnail URL with proper fallback
    const thumbnailUrl = park.thumbnail_url 
      ? getAssetUrl(park.thumbnail_url) 
      : "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=800"
    
    return {
      id: park.id,
      slug: park.slug,
      title: 'Cho thuê',
      price: priceDisplay,
      code: park.code,
      park: park.name,
      desc: park.description || park.description_full || 'Nhà xưởng tiêu chuẩn, hạ tầng hoàn thiện, phù hợp DN FDI và logistics…',
      advantage: 'Loại: Cho thuê nhà xưởng / kho bãi',
      location: (() => {
        const provinceName = getProvinceName(park.province)
        return provinceName || 'Chưa cập nhật'
      })(),
      area: `Diện tích: ${areaM2} m²`,
      contact: (() => {
        // Priority: contactSettings.hotline (from businessInfo.phone) > default
        // Always use businessInfo.phone from settings, ignore park.contact_phone
        const phoneNumber = contactSettings?.hotline || '0896 686 645'
        return `Liên hệ: ${phoneNumber}`
      })(),
      thumbnail: thumbnailUrl,
    }
  }), [parks, contactSettings])

  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    setIsPortrait(!isLandscape)
  }, [isLandscape])

  // Tính toán max-width và scale
  useEffect(() => {
    if (typeof window === 'undefined' || !isLandscape) {
      setAdjustedScale(1)
      setMaxContainerWidth(undefined)
      return
    }
    
    const viewportWidth = viewport.width || window.innerWidth
    const timelineRightPadding = viewportWidth >= 768 ? 40 : 24
    const timelineLeftEdge = viewportWidth - timelineRightPadding - timelineWidth
    const centerX = viewportWidth / 2
    const maxScaledContentWidth = Math.max(0, 2 * (timelineLeftEdge - 15 - centerX))
    const referenceContentWidth = 1920
    const scaleByTimeline = maxScaledContentWidth > 0 
      ? maxScaledContentWidth / referenceContentWidth 
      : uniformScale
    const finalScale = Math.min(uniformScale, scaleByTimeline)
    const clampedScale = Math.max(0.5, Math.min(1.0, finalScale))
    const maxWidthBeforeScale = viewportWidth - 2 * (timelineWidth + timelineRightPadding + 15)
    
    setAdjustedScale(clampedScale)
    setMaxContainerWidth(maxWidthBeforeScale)
  }, [uniformScale, isLandscape, timelineWidth, viewport])

  return (
    <section className={`relative w-full flex items-center justify-center overflow-hidden ${
      isPortrait ? 'min-h-0 py-4' : 'h-screen'
    }`}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <div 
          className="w-full h-full"
          style={{ 
            backgroundImage: `url(${encodeURI('/images/processed-image-13-14.webp')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100%'
          }}
        />
      </div>
      
      {/* White Overlay */}
      <div className="absolute inset-0 z-10 bg-white/70" />
      
      {/* Wrapper Container - Căn giữa viewport hoàn toàn */}
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
          transition={{ duration: 0.8, delay: 0.2 }}
          className={isPortrait ? 'w-full' : 'w-full'}
          style={!isPortrait ? {
            maxWidth: maxContainerWidth ? `${maxContainerWidth}px` : '1280px',
            paddingLeft: '15px',
            paddingRight: '15px',
            transform: `scale(${adjustedScale})`,
            transformOrigin: 'center center',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          } : {}}
        >
          {/* Section header */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-xl md:text-2xl lg:text-3xl font-heading font-bold text-goldLight mb-6 text-center"
          >
            Cho Thuê
          </motion.h2>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-goldLight border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[#2E8C4F]/70">Đang tải dữ liệu...</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && cards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#2E8C4F]/70">Hiện chưa có sản phẩm nào.</p>
            </div>
          )}

          {/* Grid 3 cards mỗi hàng - Tất cả cards cùng height */}
          {!loading && !error && cards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`grid gap-4 sm:gap-6 md:gap-8 ${
                isPortrait ? 'grid-cols-1' : 'grid-cols-3 gap-x-6 gap-y-8'
              }`}
              style={!isPortrait ? { gridAutoRows: '1fr' } : {}}
            >
              {cards.map((card, idx) => {
            return (
            <Link key={card.id} href={`/kcn/${card.slug}`} className={!isPortrait ? 'h-full' : ''}>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.15 + idx * 0.05 }}
                className={`bg-white rounded-md border border-black overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  isPortrait 
                    ? 'flex flex-col' 
                    : 'flex flex-row h-full'
                }`}
            >
              {/* Hình + tag - Bên trái, tỷ lệ 4:3, chiều cao chạm mép trên hàng cuối */}
              <div className={`relative flex-shrink-0 ${isPortrait ? 'w-full' : ''}`} style={!isPortrait ? { 
                width: '40%',
                // Chiều cao ảnh = chiều cao card - chiều cao hàng cuối
                height: 'calc(100% - 33px)',
                aspectRatio: '4/3'
              } : {}}>
                <img
                  src={card.thumbnail}
                  onError={(e) => {
                    // Fallback to default image if load fails
                    const target = e.target as HTMLImageElement
                    if (target.src !== "https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=800") {
                      target.src = "https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=800"
                    }
                  }}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 bg-[#0050C8] text-white px-3 py-2 leading-snug inline-block">
                  <span className="block text-[8px] md:text-[9px] whitespace-nowrap">
                    {card.title}
                  </span>
                </div>
              </div>

              {/* Nội dung chính - Bên phải, flex column */}
              <div className="flex flex-col flex-1 min-w-0">
                {/* Phần nội dung trên - flex-1 để chiếm phần còn lại */}
                <div className="px-3 py-2 text-[10px] md:text-xs text-[#2E8C4F] flex flex-col justify-between flex-1">
                  <div>
                    {/* Giá + mã */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-semibold text-[11px] md:text-[12px]">
                        {card.price}
                      </div>
                      <div className="text-[11px] md:text-[12px] text-[#2E8C4F] font-semibold">
                        {card.code}
                      </div>
                    </div>

                    {/* Text block */}
                    <div className="mt-2 space-y-2">
                      <div className="font-semibold text-[10px] md:text-[11px]">
                        {card.park}
                      </div>
                      <p className="text-[9px] md:text-[10px] text-[#2E8C4F] leading-snug italic line-clamp-2">
                        {card.desc}
                      </p>
                      <p className="text-[9px] md:text-[10px] text-red-500 leading-snug font-semibold">
                        {card.advantage}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hàng dưới cùng: rải đều 3 cột, không bị ảnh che */}
                <div className="flex items-center justify-between border-t border-gray-300 px-3 py-1.5 text-[9px] md:text-[10px] text-[#2E8C4F] font-semibold flex-shrink-0">
                  <span className="flex-1 text-left truncate">{card.location}</span>
                  <span className="flex-1 text-center truncate">{card.area}</span>
                  <span className="flex-1 text-right text-red-500 truncate">{card.contact}</span>
                </div>
              </div>
            </motion.article>
            </Link>
            )
          })}
            </motion.div>
          )}

          {/* Nút "Xem tất cả" - căn phải, chỉ hiển thị khi có đủ 6 card */}
          {!loading && !error && cards.length >= 6 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex justify-end mt-6"
            >
              <Link
                href="/kcn/cho-thue"
                className="px-6 py-2 bg-goldLight text-white font-heading font-semibold text-sm md:text-base rounded hover:bg-goldLight/90 transition-colors"
              >
                Xem tất cả
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
