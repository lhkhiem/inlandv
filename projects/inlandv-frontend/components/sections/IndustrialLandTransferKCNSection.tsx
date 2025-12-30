"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { useSectionReveal } from '@/hooks/useSectionReveal'
import { api } from '@/lib/api'
import type { IndustrialPark } from '@/lib/types'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'
import { getAssetUrl } from '@/lib/api'
import { useContactSettings } from '@/hooks/useContactSettings'

// Hardcoded fallback data for "Chuyển nhượng đất trong KCN"
const FALLBACK_DATA: IndustrialPark[] = [
  {
    id: 'hardcoded-1',
    code: 'INL-KCN-TRANSFER-001',
    name: 'KCN Tân Bình',
    slug: 'kcn-tan-binh-chuyen-nhuong',
    scope: 'trong-kcn',
    has_rental: true,
    has_transfer: true,
    has_factory: false,
    province: 'TP.HCM',
    district: 'Tân Bình',
    total_area: 500,
    available_area: 120,
    transfer_price_min: 45,
    transfer_price_max: 60,
    rental_price_min: 80000,
    rental_price_max: 150000,
    description: 'KCN hiện đại, hạ tầng hoàn chỉnh, gần cảng biển. Đất chuyển nhượng có giấy phép xây dựng, pháp lý minh bạch.',
    description_full: 'Khu công nghiệp Tân Bình là một trong những KCN hiện đại nhất khu vực, với hạ tầng kỹ thuật hoàn chỉnh, gần các cảng biển lớn, thuận tiện cho xuất nhập khẩu. Đất chuyển nhượng có đầy đủ giấy phép xây dựng, pháp lý minh bạch, sẵn sàng đầu tư.',
    thumbnail_url: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['dien-tu', 'co-khi', 'hoa-chat'],
    contact_phone: '0901234567',
    contact_email: 'kcn.tanbinh@inland.vn',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'hardcoded-2',
    code: 'INL-KCN-TRANSFER-002',
    name: 'KCN Long Thành',
    slug: 'kcn-long-thanh-chuyen-nhuong',
    scope: 'trong-kcn',
    has_rental: true,
    has_transfer: true,
    has_factory: false,
    province: 'Đồng Nai',
    district: 'Long Thành',
    total_area: 1200,
    available_area: 450,
    transfer_price_min: 42,
    transfer_price_max: 55,
    rental_price_min: 70000,
    rental_price_max: 120000,
    description: 'KCN quy mô lớn, gần sân bay Long Thành. Đất chuyển nhượng có sổ đỏ, vị trí đẹp, thuận tiện giao thông.',
    description_full: 'Khu công nghiệp Long Thành nằm tại vị trí chiến lược, cách sân bay quốc tế Long Thành chỉ 5km, thuận lợi cho các doanh nghiệp logistics và sản xuất. Đất chuyển nhượng có đầy đủ sổ đỏ, vị trí đẹp, thuận tiện giao thông.',
    thumbnail_url: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: false, internet: true, road: true, security: true },
    allowed_industries: ['may-mac', 'co-khi', 'nong-san'],
    contact_phone: '0909876543',
    contact_email: 'kcn.longthanh@inland.vn',
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
  {
    id: 'hardcoded-3',
    code: 'INL-KCN-TRANSFER-003',
    name: 'KCN Hiệp Phước',
    slug: 'kcn-hiep-phuoc-chuyen-nhuong',
    scope: 'trong-kcn',
    has_rental: true,
    has_transfer: true,
    has_factory: false,
    province: 'TP.HCM',
    district: 'Nhà Bè',
    total_area: 800,
    available_area: 200,
    transfer_price_min: 48,
    transfer_price_max: 65,
    rental_price_min: 90000,
    rental_price_max: 160000,
    description: 'KCN sát cảng Hiệp Phước, logistics thuận lợi. Đất chuyển nhượng có giấy phép xây dựng, phù hợp nhiều ngành.',
    description_full: 'Khu công nghiệp Hiệp Phước nằm sát cảng Hiệp Phước, thuận lợi cho logistics và xuất nhập khẩu. Đất chuyển nhượng có đầy đủ giấy phép xây dựng, phù hợp cho nhiều ngành công nghiệp.',
    thumbnail_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['dien-tu', 'duoc-pham', 'thuc-pham'],
    contact_phone: '0903456789',
    contact_email: 'kcn.hiepphuoc@inland.vn',
    created_at: '2025-01-03T00:00:00Z',
    updated_at: '2025-01-03T00:00:00Z',
  },
  {
    id: 'hardcoded-4',
    code: 'INL-KCN-TRANSFER-004',
    name: 'Khu công nghiệp số 5 Hưng Yên',
    slug: 'khu-cong-nghiep-so-5-hung-yen-chuyen-nhuong',
    scope: 'trong-kcn',
    has_rental: true,
    has_transfer: true,
    has_factory: false,
    province: 'Hưng Yên',
    district: 'Văn Lâm',
    total_area: 580,
    available_area: 220,
    transfer_price_min: 46,
    transfer_price_max: 62,
    rental_price_min: 50000,
    rental_price_max: 85000,
    description: 'KCN hiện đại, hạ tầng cao cấp, phù hợp công nghiệp công nghệ cao. Đất chuyển nhượng có sổ đỏ, pháp lý rõ ràng.',
    description_full: 'Khu công nghiệp số 5 Hưng Yên là một trong những KCN hiện đại nhất khu vực phía Bắc. Hạ tầng kỹ thuật cao cấp với hệ thống điện dự phòng, nước sạch chất lượng cao, internet tốc độ cao. Đất chuyển nhượng có đầy đủ sổ đỏ, pháp lý rõ ràng.',
    thumbnail_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['dien-tu', 'co-khi', 'hoa-chat', 'duoc-pham'],
    contact_phone: '0221 3847 789',
    contact_email: 'kcn5.hungyen@inland.vn',
    created_at: '2025-01-07T00:00:00Z',
    updated_at: '2025-01-07T00:00:00Z',
  },
  {
    id: 'hardcoded-5',
    code: 'INL-KCN-TRANSFER-005',
    name: 'Khu công nghiệp Amata Sông Khoai',
    slug: 'khu-cong-nghiep-amata-song-khoai-chuyen-nhuong',
    scope: 'trong-kcn',
    has_rental: true,
    has_transfer: true,
    has_factory: false,
    province: 'Quảng Ninh',
    district: 'Đông Triều',
    total_area: 750,
    available_area: 280,
    transfer_price_min: 50,
    transfer_price_max: 68,
    rental_price_min: 60000,
    rental_price_max: 100000,
    description: 'KCN quy mô lớn, hạ tầng cao cấp, gần cảng biển. Đất chuyển nhượng có giấy phép xây dựng, vị trí đẹp.',
    description_full: 'Khu công nghiệp Amata Sông Khoai là dự án liên doanh với tập đoàn Amata (Thái Lan), quy mô lớn với hạ tầng kỹ thuật đẳng cấp quốc tế. Gần cảng biển Cái Lân, thuận lợi cho xuất nhập khẩu. Đất chuyển nhượng có đầy đủ giấy phép xây dựng, vị trí đẹp.',
    thumbnail_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['dien-tu', 'co-khi', 'logistics', 'kho-bai'],
    contact_phone: '0203 3856 890',
    contact_email: 'kcn.amata@inland.vn',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
  },
  {
    id: 'hardcoded-6',
    code: 'INL-KCN-TRANSFER-006',
    name: 'Khu công nghiệp Sông Lô 2',
    slug: 'khu-cong-nghiep-song-lo-2-chuyen-nhuong',
    scope: 'trong-kcn',
    has_rental: true,
    has_transfer: true,
    has_factory: false,
    province: 'Vĩnh Phúc',
    district: 'Bình Xuyên',
    total_area: 480,
    available_area: 150,
    transfer_price_min: 44,
    transfer_price_max: 58,
    rental_price_min: 52000,
    rental_price_max: 88000,
    description: 'KCN hiện đại, gần Hà Nội, phù hợp nhiều ngành công nghiệp. Đất chuyển nhượng có sổ đỏ, pháp lý minh bạch.',
    description_full: 'Khu công nghiệp Sông Lô 2 nằm tại vị trí chiến lược gần Hà Nội, thuận tiện cho các doanh nghiệp cần tiếp cận thị trường miền Bắc. Hạ tầng kỹ thuật hoàn chỉnh, phù hợp cho nhiều ngành công nghiệp. Đất chuyển nhượng có đầy đủ sổ đỏ, pháp lý minh bạch.',
    thumbnail_url: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['dien-tu', 'co-khi', 'thuc-pham', 'duoc-pham'],
    contact_phone: '0211 3847 345',
    contact_email: 'kcn.songlo2@inland.vn',
    created_at: '2025-01-11T00:00:00Z',
    updated_at: '2025-01-11T00:00:00Z',
  },
]

export default function IndustrialLandTransferKCNSection() {
  const revealed = useSectionReveal(1) // Section index in homepage
  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  const { settings: contactSettings, loading: settingsLoading } = useContactSettings()
  
  // Uniform scaling hook
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.0)
  
  // State cho scale và max-width
  const [adjustedScale, setAdjustedScale] = useState(1)
  const [maxContainerWidth, setMaxContainerWidth] = useState<number | undefined>(undefined)

  // State cho data, loading, error
  // Initialize with hardcoded data as fallback
  const [parks, setParks] = useState<IndustrialPark[]>(FALLBACK_DATA)
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
        console.log('[Component] Fetching chuyen nhuong trong KCN...')
        
        // Add timeout to prevent waiting too long
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 5000) // 5 second timeout
        })
        
        const data = await Promise.race([
          api.getPropertiesChuyenNhuongTrongKCN(6),
          timeoutPromise
        ]) as IndustrialPark[]
        
        console.log('[Component] Received data:', data)
        if (isMounted) {
          // Use API data if available, otherwise use hardcoded data
          if (data && Array.isArray(data) && data.length > 0) {
            setParks(data)
          } else {
            console.warn('[Component] No data from API, using hardcoded data')
            setParks(FALLBACK_DATA)
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('[Component] Error fetching chuyen nhuong trong KCN:', err)
          console.log('[Component] Using hardcoded data as fallback')
          // Use hardcoded data when API fails
          setParks(FALLBACK_DATA)
          setError(null) // Don't show error, use hardcoded data instead
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Small delay to stagger requests
    const timeoutId = setTimeout(fetchData, 0)
    
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
    // Convert transfer_price từ tỷ VND sang USD/m² (giả sử tính theo available_area)
    // transfer_price_min/max là tỷ VND, cần convert sang USD và chia cho diện tích
    let priceUSD = '0'
    if (park.transfer_price_min && park.available_area && park.available_area > 0) {
      // Convert tỷ VND sang VND (x 1,000,000,000)
      const priceVND = park.transfer_price_min * 1000000000
      // Tính giá/m² (available_area đang là ha, cần x 10000 để ra m²)
      const areaM2 = park.available_area * 10000
      const pricePerSqm = priceVND / areaM2
      // Convert sang USD (tỷ giá ~24,000 VND/USD)
      priceUSD = (pricePerSqm / 24000).toFixed(2)
    }
    
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
      title: 'Chuyển nhượng đất trong KCN',
      price: `$ ${priceUSD} USD/m²`,
      code: park.code,
      park: park.name,
      desc: park.description || park.description_full || `${park.name} thu hút nhiều doanh nghiệp đầu tư công nghiệp FDI…`,
      advantage: 'Loại: Chuyển nhượng đất có XN trong KCN',
      location: (() => {
        const provinceName = getProvinceName(park.province)
        // Show province name if available, otherwise show "Chưa cập nhật"
        const result = provinceName || 'Chưa cập nhật'
        
        // Debug log
        if (process.env.NODE_ENV === 'development') {
          console.log('[IndustrialLandTransferKCNSection] Location mapping:', {
            original: park.province,
            cleaned: provinceName,
            result,
          })
        }
        
        return result
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
    <section className={`relative w-full flex items-center justify-center overflow-hidden bg-[#F5F5F5] ${
      isPortrait ? 'min-h-0 py-4' : 'h-screen'
    }`}>
      {/* Wrapper Container - Căn giữa viewport hoàn toàn */}
      {/* Cùng z-index với timeline (z-[90]) */}
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
            Chuyển nhượng đất trong KCN
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
            <Link key={card.id} href={`/san-pham/${card.slug}`} className={!isPortrait ? 'h-full' : ''}>
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
                // Hàng cuối có padding py-1.5 (12px) + border (1px) + text height (~20px) = ~33px
                height: 'calc(100% - 33px)',
                aspectRatio: '4/3'
              } : {}}>
                <img
                  src={card.thumbnail}
                  alt={card.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to default image if load fails
                    const target = e.target as HTMLImageElement
                    if (target.src !== "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=800") {
                      target.src = "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=800"
                    }
                  }}
                />
                <div className="absolute top-0 left-0 bg-[#0050C8] text-white px-2 py-2 leading-snug w-1/2">
                  <span className="block text-[8px] md:text-[9px] whitespace-normal">
                    {card.title}
                  </span>
                </div>
              </div>

              {/* Nội dung chính - Bên phải, flex column */}
              <div className="flex flex-col flex-1 min-w-0">
                {/* Phần nội dung trên - flex-1 để chiếm phần còn lại */}
                <div className="px-3 py-2 text-[10px] md:text-xs text-[#2E8C4F] flex flex-col justify-between flex-1">
                  <div>
                    {/* Hàng giá thuê + mã đối diện nhau */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-semibold text-[11px] md:text-[12px]">
                        {card.price}
                      </div>
                      <div className="text-[11px] md:text-[12px] text-[#2E8C4F] font-semibold">
                        {card.code}
                      </div>
                    </div>

                    {/* Middle text block */}
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
                href="/kcn/chuyen-nhuong-trong-kcn"
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
