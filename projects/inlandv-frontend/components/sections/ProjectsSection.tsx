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

// Hardcoded fallback data for "Chuyển nhượng đất ngoài KCN"
const FALLBACK_DATA_NGOAI_KCN: IndustrialPark[] = [
  {
    id: 'hardcoded-ngoai-1',
    code: 'INL-NGOAI-001',
    name: 'Đất công nghiệp Bình Dương',
    slug: 'dat-cong-nghiep-binh-duong',
    scope: 'ngoai-kcn',
    has_rental: false,
    has_transfer: true,
    has_factory: false,
    province: 'Bình Dương',
    district: 'Dầu Tiếng',
    total_area: 350,
    available_area: 120,
    transfer_price_min: 28,
    transfer_price_max: 35,
    description: 'Quỹ đất công nghiệp liền kề KCN, thuận lợi mở rộng sản xuất và logistics. Đất có sổ đỏ, pháp lý minh bạch.',
    description_full: 'Quỹ đất công nghiệp liền kề KCN, thuận lợi mở rộng sản xuất và logistics. Đất có đầy đủ sổ đỏ, pháp lý minh bạch, sẵn sàng đầu tư.',
    thumbnail_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['co-khi', 'may-mac', 'go-do-go'],
    contact_phone: '0274 3856 789',
    contact_email: 'dat.binhduong@inland.vn',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'hardcoded-ngoai-2',
    code: 'INL-NGOAI-002',
    name: 'Đất công nghiệp Hải Phòng',
    slug: 'dat-cong-nghiep-hai-phong',
    scope: 'ngoai-kcn',
    has_rental: false,
    has_transfer: true,
    has_factory: false,
    province: 'Hải Phòng',
    district: 'An Dương',
    total_area: 600,
    available_area: 180,
    transfer_price_min: 35,
    transfer_price_max: 45,
    description: 'Đất công nghiệp gần cảng biển, logistics thuận lợi, phù hợp xuất khẩu. Đất có sổ đỏ, vị trí đẹp.',
    description_full: 'Đất công nghiệp gần cảng biển Hải Phòng, thuận lợi cho các doanh nghiệp xuất nhập khẩu. Đất có đầy đủ sổ đỏ, vị trí đẹp, thuận tiện giao thông.',
    thumbnail_url: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['dien-tu', 'co-khi', 'logistics', 'kho-bai'],
    contact_phone: '0225 3847 123',
    contact_email: 'dat.haiphong@inland.vn',
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
  {
    id: 'hardcoded-ngoai-3',
    code: 'INL-NGOAI-003',
    name: 'Đất công nghiệp Hưng Yên',
    slug: 'dat-cong-nghiep-hung-yen',
    scope: 'ngoai-kcn',
    has_rental: false,
    has_transfer: true,
    has_factory: false,
    province: 'Hưng Yên',
    district: 'Mỹ Hào',
    total_area: 420,
    available_area: 95,
    transfer_price_min: 32,
    transfer_price_max: 40,
    description: 'Đất công nghiệp phù hợp ngành thực phẩm, nông sản, may mặc. Đất có sổ đỏ, pháp lý rõ ràng.',
    description_full: 'Đất công nghiệp được thiết kế chuyên biệt cho các ngành công nghiệp nhẹ, đặc biệt là thực phẩm và nông sản. Đất có đầy đủ sổ đỏ, pháp lý rõ ràng.',
    thumbnail_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: false, internet: true, road: true, security: true },
    allowed_industries: ['thuc-pham', 'nong-san', 'may-mac'],
    contact_phone: '0221 3856 456',
    contact_email: 'dat.hungyen@inland.vn',
    created_at: '2025-01-03T00:00:00Z',
    updated_at: '2025-01-03T00:00:00Z',
  },
  {
    id: 'hardcoded-ngoai-4',
    code: 'INL-NGOAI-004',
    name: 'Đất công nghiệp Vĩnh Phúc',
    slug: 'dat-cong-nghiep-vinh-phuc',
    scope: 'ngoai-kcn',
    has_rental: false,
    has_transfer: true,
    has_factory: false,
    province: 'Vĩnh Phúc',
    district: 'Tam Dương',
    total_area: 550,
    available_area: 195,
    transfer_price_min: 41,
    transfer_price_max: 52,
    description: 'Đất công nghiệp đa ngành, hạ tầng tốt, giá cạnh tranh. Đất có sổ đỏ, pháp lý minh bạch.',
    description_full: 'Đất công nghiệp được quy hoạch đa ngành với hạ tầng kỹ thuật tốt. Đất có đầy đủ sổ đỏ, pháp lý minh bạch.',
    thumbnail_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['co-khi', 'dien-tu', 'thuc-pham', 'nong-san'],
    contact_phone: '0211 3856 678',
    contact_email: 'dat.vinhphuc@inland.vn',
    created_at: '2025-01-04T00:00:00Z',
    updated_at: '2025-01-04T00:00:00Z',
  },
  {
    id: 'hardcoded-ngoai-5',
    code: 'INL-NGOAI-005',
    name: 'Đất công nghiệp Bà Rịa - Vũng Tàu',
    slug: 'dat-cong-nghiep-ba-ria-vung-tau',
    scope: 'ngoai-kcn',
    has_rental: false,
    has_transfer: true,
    has_factory: false,
    province: 'Bà Rịa - Vũng Tàu',
    district: 'Tân Thành',
    total_area: 220,
    available_area: 68,
    transfer_price_min: 29,
    transfer_price_max: 38,
    description: 'Đất công nghiệp gần cảng biển, phù hợp logistics và kho bãi. Đất có sổ đỏ, vị trí đẹp.',
    description_full: 'Đất công nghiệp nằm gần cảng biển và các khu công nghiệp lớn, phù hợp cho các doanh nghiệp logistics, kho bãi. Đất có đầy đủ sổ đỏ, vị trí đẹp.',
    thumbnail_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: false, internet: true, road: true, security: true },
    allowed_industries: ['logistics', 'kho-bai', 'thuc-pham'],
    contact_phone: '0254 3847 567',
    contact_email: 'dat.baria@inland.vn',
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2025-01-05T00:00:00Z',
  },
  {
    id: 'hardcoded-ngoai-6',
    code: 'INL-NGOAI-006',
    name: 'Đất công nghiệp Quảng Ninh',
    slug: 'dat-cong-nghiep-quang-ninh',
    scope: 'ngoai-kcn',
    has_rental: false,
    has_transfer: true,
    has_factory: false,
    province: 'Quảng Ninh',
    district: 'Đông Triều',
    total_area: 750,
    available_area: 280,
    transfer_price_min: 50,
    transfer_price_max: 65,
    description: 'Đất công nghiệp quy mô lớn, hạ tầng cao cấp, gần cảng biển. Đất có giấy phép xây dựng, vị trí đẹp.',
    description_full: 'Đất công nghiệp quy mô lớn với hạ tầng kỹ thuật đẳng cấp. Gần cảng biển Cái Lân, thuận lợi cho xuất nhập khẩu. Đất có đầy đủ giấy phép xây dựng, vị trí đẹp.',
    thumbnail_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200',
    infrastructure: { power: true, water: true, drainage: true, waste: true, internet: true, road: true, security: true },
    allowed_industries: ['dien-tu', 'co-khi', 'logistics', 'kho-bai'],
    contact_phone: '0203 3856 890',
    contact_email: 'dat.quangninh@inland.vn',
    created_at: '2025-01-06T00:00:00Z',
    updated_at: '2025-01-06T00:00:00Z',
  },
]

// Section: Chuyển nhượng đất ngoài KCN
export default function IndustrialLandTransferOutsideKCNSection() {
  const revealed = useSectionReveal(2) // section index 2 trên homepage
  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  const { settings: contactSettings, loading: settingsLoading } = useContactSettings()
  
  // Uniform scaling hook
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.0)
  
  // State cho scale và max-width
  const [adjustedScale, setAdjustedScale] = useState(1)
  const [maxContainerWidth, setMaxContainerWidth] = useState<number | undefined>(undefined)

  // State cho data, loading, error
  // Initialize with hardcoded data as fallback
  const [parks, setParks] = useState<IndustrialPark[]>(FALLBACK_DATA_NGOAI_KCN)
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
          api.getPropertiesChuyenNhuongNgoaiKCN(6),
          timeoutPromise
        ]) as IndustrialPark[]
        
        if (isMounted) {
          // Use API data if available, otherwise use hardcoded data
          if (data && Array.isArray(data) && data.length > 0) {
            setParks(data)
          } else {
            console.warn('[Component] No data from API, using hardcoded data')
            setParks(FALLBACK_DATA_NGOAI_KCN)
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching chuyen nhuong ngoai KCN:', err)
          console.log('[Component] Using hardcoded data as fallback')
          // Use hardcoded data when API fails
          setParks(FALLBACK_DATA_NGOAI_KCN)
          setError(null) // Don't show error, use hardcoded data instead
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Small delay to stagger requests
    const timeoutId = setTimeout(fetchData, 100)
    
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
    // Convert transfer_price từ tỷ VND sang USD/m²
    let priceUSD = '0'
    if (park.transfer_price_min && park.available_area && park.available_area > 0) {
      const priceVND = park.transfer_price_min * 1000000000
      const areaM2 = park.available_area * 10000
      const pricePerSqm = priceVND / areaM2
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
      : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800"
    
    return {
      id: park.id,
      slug: park.slug,
      title: 'Chuyển nhượng đất ngoài KCN',
      price: `$ ${priceUSD} USD/m²`,
      code: park.code,
      park: park.name,
      desc: park.description || park.description_full || 'Quỹ đất công nghiệp liền kề KCN, thuận lợi mở rộng sản xuất và logistics…',
      advantage: 'Loại: Chuyển nhượng đất ngoài KCN / CCN',
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
    <section className={`relative w-full flex items-center justify-center overflow-hidden bg-[#F5F5F5] ${
      isPortrait ? 'min-h-0 py-4' : 'h-screen'
    }`}>
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
            Chuyển nhượng đất ngoài KCN
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
                    if (target.src !== "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800") {
                      target.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800"
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
                href="/kcn/chuyen-nhuong-ngoai-kcn"
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
