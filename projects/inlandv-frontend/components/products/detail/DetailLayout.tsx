"use client"
import React, { useState } from 'react'
import MediaSlider from './MediaSlider'
import InfoCard from './InfoCard'
import IconListCard from './IconListCard'
import MapSection from './MapSection'
import ContactSection from './ContactSection'
import PriceCard from './PriceCard'
import SimilarItemsSection from './SimilarItemsSection'
import ConsultationFormModal from './ConsultationFormModal'
import IIPMapModal from './IIPMapModal'
import { DetailEntity, SimilarItemCardData, Property, IndustrialPark } from '../../../lib/types'
import { MapPin, BadgeInfo, Building2 } from 'lucide-react'
import { getAssetUrl } from '../../../lib/api'

// Industry code to Vietnamese name mapping
// This is a fallback if industries table doesn't have the name
const INDUSTRY_NAMES: Record<string, string> = {
  'co-khi': 'Cơ khí',
  'thuc-pham': 'Thực phẩm',
  'hoa-chat': 'Hóa chất',
  'dien-tu': 'Điện tử',
  'xay-dung': 'Xây dựng',
  'bao-bi': 'Bao bì',
  'noi-that': 'Nội thất',
  'logistics': 'Logistics',
  'kho-bai': 'Kho bãi',
  'xuat-nhap-khau': 'Xuất nhập khẩu',
  'nong-san': 'Nông sản',
  'may-mac': 'May mặc',
  'o-to': 'Ô tô',
  'hang-khong': 'Hàng không',
  'nang-luong': 'Năng lượng',
  'cong-nghe': 'Công nghệ',
  'dau-tu': 'Đầu tư',
  'dien': 'Điện',
  'nuoc': 'Nước',
  'giao-thong': 'Giao thông',
  'thong-tin-lien-lac': 'Thông tin liên lạc',
  'thoat-nuoc': 'Thoát nước',
  'xu-ly-nuoc-thai': 'Xử lý nước thải',
  'an-ninh': 'An ninh',
}

// Helper function to get Vietnamese name for industry code
// Priority: 1. Name from database, 2. Mapping from code, 3. Code itself
const getIndustryName = (code: string, name?: string): string => {
  if (!code) return code || ''
  // If name is provided from database, use it
  if (name) return name
  // Otherwise, try to map from code
  const mappedName = INDUSTRY_NAMES[code.toLowerCase()]
  if (mappedName) return mappedName
  // If no mapping, return code (could be formatted better)
  return code
}

interface DetailLayoutProps {
  entity: DetailEntity
  similarItems?: SimilarItemCardData[]
}

// Pure layout/structure: assumes data is already provided.
export const DetailLayout: React.FC<DetailLayoutProps> = ({ entity, similarItems = [] }) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const isProperty = entity.kind === 'property'
  const data = entity.item as Property | IndustrialPark
  const isIndustrialPark = !isProperty
  const industrialPark = isIndustrialPark ? (data as IndustrialPark) : null

  // Extract images with proper URL handling
  const extractImages = () => {
    const imgData = (data as any).images
    const thumbnailUrl = (data as any).thumbnail_url ? getAssetUrl((data as any).thumbnail_url) : null
    const images: string[] = []
    
    // First, try to get images from images array
    if (imgData && Array.isArray(imgData) && imgData.length > 0) {
      imgData.forEach((img: any) => {
        if (typeof img === 'string') {
          const url = getAssetUrl(img)
          if (url && url !== '' && !images.includes(url)) images.push(url)
        } else if (img?.url) {
          const url = getAssetUrl(img.url)
          if (url && url !== '' && !images.includes(url)) images.push(url)
        }
      })
      
      // Sort by display_order if available
      if (images.length > 1) {
        images.sort((a: string, b: string) => {
          const imgA = imgData.find((img: any) => {
            const imgUrl = typeof img === 'string' ? img : img?.url
            return getAssetUrl(imgUrl) === a
          })
          const imgB = imgData.find((img: any) => {
            const imgUrl = typeof img === 'string' ? img : img?.url
            return getAssetUrl(imgUrl) === b
          })
          const orderA = imgA?.display_order ?? 999
          const orderB = imgB?.display_order ?? 999
          return orderA - orderB
        })
      }
    }
    
    // Always add thumbnail_url if it exists and not already in images
    // Put it at the beginning if images array is empty, or at position based on is_primary
    if (thumbnailUrl && thumbnailUrl !== '' && !images.includes(thumbnailUrl)) {
      // Check if any image in array is marked as primary
      const hasPrimary = imgData?.some((img: any) => img?.is_primary)
      if (hasPrimary) {
        // If there's a primary image, add thumbnail after it
        const primaryIndex = images.findIndex((url: string) => {
          const img = imgData?.find((i: any) => {
            const imgUrl = typeof i === 'string' ? i : i?.url
            return getAssetUrl(imgUrl) === url && i?.is_primary
          })
          return img !== undefined
        })
        if (primaryIndex >= 0) {
          images.splice(primaryIndex + 1, 0, thumbnailUrl)
        } else {
          images.unshift(thumbnailUrl)
        }
      } else {
        // No primary image, add thumbnail at the beginning
        images.unshift(thumbnailUrl)
      }
    }
    
    return images
  }
  
  const images = extractImages()
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[DetailLayout] Entity:', entity.kind)
    console.log('[DetailLayout] Data name:', data.name)
    console.log('[DetailLayout] Thumbnail URL (raw):', (data as any).thumbnail_url)
    console.log('[DetailLayout] Images array (raw):', (data as any).images)
    console.log('[DetailLayout] Final images:', images)
    console.log('[DetailLayout] Allowed industries:', (data as any).allowed_industries)
    console.log('[DetailLayout] Infrastructure (raw):', (data as any).infrastructure)
    console.log('[DetailLayout] Infrastructure fields (separate columns):', {
      infrastructure_road: (data as any).infrastructure_road,
      infrastructure_power: (data as any).infrastructure_power,
      infrastructure_water: (data as any).infrastructure_water,
      infrastructure_internet: (data as any).infrastructure_internet,
      infrastructure_drainage: (data as any).infrastructure_drainage,
      infrastructure_waste: (data as any).infrastructure_waste,
      infrastructure_security: (data as any).infrastructure_security,
    })
  }
  
  const videoUrl = (data as any).video_url ? getAssetUrl((data as any).video_url) : undefined
  
  // Debug logging for video
  if (process.env.NODE_ENV === 'development' && videoUrl) {
    console.log('[DetailLayout] Video URL (raw):', (data as any).video_url)
    console.log('[DetailLayout] Video URL (processed):', videoUrl)
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-6 md:py-10" data-bg-type="light">
      {/* Hero Media */}
      <MediaSlider images={images} videoUrl={videoUrl} aspect="4:3" />

      {/* Header Title */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {data.name || 'Tên sản phẩm / dự án'}
            </h1>
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">
              {(data as any).description || 'Mô tả ngắn gọn sẽ hiển thị ở đây.'}
            </p>
          </div>
          {/* IIP Code Button - Only for Industrial Parks */}
          {isIndustrialPark && industrialPark?.code && (
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="px-4 py-2 bg-goldDark text-white font-semibold rounded-lg hover:bg-goldDark/90 transition-colors whitespace-nowrap"
            >
              {industrialPark.code}
            </button>
          )}
        </div>
      </header>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Conditional Info Blocks */}
          {isProperty ? (
            <InfoCard title="Thông tin Bất động sản" icon={BadgeInfo}>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                <li><span className="font-medium">Diện tích:</span> {(data as any).area || '--'} m²</li>
                <li><span className="font-medium">Giá:</span> {(data as any).price ? (data as any).price.toLocaleString('vi-VN') + '₫' : '--'}</li>
                <li><span className="font-medium">Vị trí:</span> {(data as any).province || '--'}</li>
                <li><span className="font-medium">Pháp lý:</span> {(data as any).legal_status || '--'}</li>
              </ul>
            </InfoCard>
          ) : (
            <InfoCard title="Thông tin Khu công nghiệp" icon={Building2}>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                <li><span className="font-medium">Tổng diện tích:</span> {(data as any).total_area ? `${(data as any).total_area.toLocaleString('vi-VN')} ha` : '--'}</li>
                <li><span className="font-medium">Diện tích trống:</span> {(data as any).available_area ? `${(data as any).available_area.toLocaleString('vi-VN')} ha` : '--'}</li>
                <li><span className="font-medium">Ngành nghề ưu đãi:</span> {
                  (() => {
                    const industries = (data as any).allowed_industries
                    if (!industries || !Array.isArray(industries) || industries.length === 0) return '--'
                    // Database now stores Vietnamese names directly (strings)
                    // Handle both formats: strings (Vietnamese names) or objects (backward compatibility)
                    const industryNames = industries
                      .map((ind: any) => {
                        // If it's already a string (Vietnamese name), use it directly
                        if (typeof ind === 'string') {
                          return ind
                        }
                        // If it's an object, extract name or code
                        if (ind && typeof ind === 'object') {
                          const name = ind?.name || ind?.label // Vietnamese name from database
                          const code = ind?.industry_code || ind?.code || ind
                          // If name exists, use it; otherwise map from code
                          return name || getIndustryName(code)
                        }
                        // Fallback: treat as string
                        return String(ind)
                      })
                      .filter(Boolean)
                      .slice(0, 3)
                    return industryNames.length > 0 ? industryNames.join(', ') : '--'
                  })()
                }</li>
                <li className="sm:col-span-2">
                  <span className="font-medium">Dịch vụ có sẵn:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(data as any).has_rental && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Cho thuê
                      </span>
                    )}
                    {(data as any).has_transfer && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Chuyển nhượng
                      </span>
                    )}
                    {(data as any).has_factory && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Nhà xưởng
                      </span>
                    )}
                    {!(data as any).has_rental && !(data as any).has_transfer && !(data as any).has_factory && (
                      <span className="text-gray-500 text-xs">--</span>
                    )}
                  </div>
                </li>
              </ul>
            </InfoCard>
          )}

          {/* Amenity / Infrastructure List */}
          {isProperty ? (
            <IconListCard
              title="Tiện ích"
              items={(data as any).amenities?.map((a: string) => ({ label: a })) || []}
              columns={3}
            />
          ) : (
            <IconListCard
              title="Hạ tầng"
              items={(() => {
                const infra = data as any
                // Check if infrastructure is a JSONB object or separate columns
                const infraObj = infra.infrastructure || {}
                const mapping: { key: string; dbKey: string; label: string }[] = [
                  { key: 'road', dbKey: 'infrastructure_road', label: 'Giao thông' },
                  { key: 'power', dbKey: 'infrastructure_power', label: 'Điện' },
                  { key: 'water', dbKey: 'infrastructure_water', label: 'Nước' },
                  { key: 'internet', dbKey: 'infrastructure_internet', label: 'Thông tin liên lạc' },
                  { key: 'drainage', dbKey: 'infrastructure_drainage', label: 'Thoát nước' },
                  { key: 'waste', dbKey: 'infrastructure_waste', label: 'Xử lý nước thải' },
                  { key: 'security', dbKey: 'infrastructure_security', label: 'An ninh' }
                ]
                // Show all infrastructure items with their status
                // Try JSONB object first, then fallback to separate columns
                return mapping.map(m => {
                  const value = infraObj[m.key] !== undefined 
                    ? infraObj[m.key] 
                    : infra[m.dbKey]
                  return {
                    label: m.label,
                    value: value === true ? 'Có' : value === false ? 'Không' : '—'
                  }
                })
              })()}
              columns={3}
            />
          )}

          {/* Long Description replaces previous map position */}
          <InfoCard title="Mô tả chi tiết" icon={BadgeInfo}>
            <div className="prose max-w-none prose-sm">
              <p className="whitespace-pre-wrap">
                {(() => {
                  const description = (data as any).description_full || (data as any).description || 'Đang cập nhật mô tả chi tiết...'
                  // Strip HTML tags and decode HTML entities
                  if (typeof description !== 'string') return description
                  
                  // Create a temporary element to decode HTML entities (client-side)
                  // For server-side, use regex fallback
                  if (typeof window !== 'undefined') {
                    const tempDiv = document.createElement('div')
                    tempDiv.innerHTML = description
                    const text = tempDiv.textContent || tempDiv.innerText || description
                    return text.trim()
                  } else {
                    // Server-side: Remove HTML tags and decode common entities
                    let text = description.replace(/<[^>]*>/g, '')
                    // Decode HTML entities
                    text = text
                      .replace(/&nbsp;/g, ' ')
                      .replace(/&amp;/g, '&')
                      .replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .replace(/&quot;/g, '"')
                      .replace(/&#39;/g, "'")
                      .replace(/&apos;/g, "'")
                      .replace(/&#x27;/g, "'")
                      .replace(/&#x2F;/g, '/')
                      .replace(/&#x60;/g, '`')
                    return text.trim()
                  }
                })()}
              </p>
            </div>
          </InfoCard>
        </div>

        <div className="space-y-8">
          <PriceCard
            type={isProperty ? 'property' : 'industrialPark'}
            price={(data as any).price}
            pricePerSqm={(data as any).price_per_sqm}
            rentalPriceMin={(data as any).rental_price_min}
            rentalPriceMax={(data as any).rental_price_max}
            transferPriceMin={(data as any).transfer_price_min}
            transferPriceMax={(data as any).transfer_price_max}
            negotiable={(data as any).negotiable}
            hasRental={(data as any).has_rental}
            hasTransfer={(data as any).has_transfer}
          />
          <ContactSection
            type={isProperty ? 'property' : 'industrialPark'}
            // Don't pass phoneNumber - ContactSection will use businessInfo.phone from settings
            onOpenForm={() => setIsFormOpen(true)}
          />
          <InfoCard title="Địa điểm" icon={MapPin}>
            <div className="text-sm">
              {(() => {
                const address = (data as any).address
                const ward = (data as any).ward
                const province = (data as any).province
                const district = (data as any).district
                
                // Helper function to remove codes (standalone numbers that might be postal codes or ward codes)
                const removeCodes = (text: string): string => {
                  if (!text || typeof text !== 'string') return text
                  // Remove standalone numbers (likely codes) that are separated by commas or spaces
                  // Pattern: matches numbers that are standalone (preceded/followed by comma, space, or start/end)
                  let cleaned = text
                    .replace(/,\s*\d+\s*,/g, ',') // Remove numbers between commas: ", 12052,"
                    .replace(/,\s*\d+\s*$/g, '') // Remove numbers at the end after comma: ", 12052"
                    .replace(/^\d+\s*,/g, '') // Remove numbers at the start before comma: "12052,"
                    .replace(/\s+\d+\s*$/g, '') // Remove numbers at the end with space: " 12052"
                    .replace(/^\d+\s+/g, '') // Remove numbers at the start with space: "12052 "
                    .replace(/,\s*\d+$/g, '') // Remove trailing numbers after comma: ", 33"
                    .trim()
                    .replace(/,\s*,/g, ',') // Clean up double commas
                    .replace(/^,|,$/g, '') // Remove leading/trailing commas
                    .trim()
                  
                  // Also remove if the entire field is just a number (likely a code)
                  if (/^\d+$/.test(cleaned)) {
                    return ''
                  }
                  
                  return cleaned
                }
                
                // Build full address
                const addressParts: string[] = []
                if (address) {
                  const cleanAddress = removeCodes(address)
                  if (cleanAddress) addressParts.push(cleanAddress)
                }
                if (ward) {
                  const cleanWard = removeCodes(ward)
                  if (cleanWard) addressParts.push(cleanWard)
                }
                if (district) {
                  const cleanDistrict = removeCodes(district)
                  if (cleanDistrict) addressParts.push(cleanDistrict)
                }
                if (province) {
                  const cleanProvince = removeCodes(province)
                  if (cleanProvince) addressParts.push(cleanProvince)
                }
                
                return addressParts.length > 0 
                  ? addressParts.join(', ') 
                  : 'Chưa cập nhật'
              })()}
            </div>
          </InfoCard>
          <MapSection
            latitude={(data as any).latitude}
            longitude={(data as any).longitude}
            address={(data as any).address || (data as any).province}
          />
        </div>
      </div>

      {/* Similar Items */}
      <SimilarItemsSection
        items={similarItems}
        title={isProperty ? 'Bất động sản tương tự' : 'Khu công nghiệp tương tự'}
        basePath={isProperty ? '/bat-dong-san' : '/kcn'}
      />

      {/* Consultation Form Modal */}
      <ConsultationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        productName={data.name}
      />

      {/* IIP Map Modal - Only for Industrial Parks */}
      {isIndustrialPark && industrialPark?.code && (
        <IIPMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          iipCode={industrialPark.code}
          mapEmbedUrl={
            industrialPark.latitude && industrialPark.longitude
              ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31357.24401795471!2d${industrialPark.longitude}!3d${industrialPark.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752e9747f2686b%3A0xd9b909a86e926ccb!2zxJDhuqdtIFNlbg!5e0!3m2!1svi!2s!4v1765870839337!5m2!1svi!2s`
              : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31357.24401795471!2d106.6261431!3d10.7610112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752e9747f2686b%3A0xd9b909a86e926ccb!2zxJDhuqdtIFNlbg!5e0!3m2!1svi!2s!4v1765870839337!5m2!1svi!2s'
          }
        />
      )}
    </div>
  )
}

export default DetailLayout
