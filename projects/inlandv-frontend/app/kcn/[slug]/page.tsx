import React from 'react'
import DetailLayout from '../../../components/products/detail/DetailLayout'
import { IndustrialPark, SimilarItemCardData } from '../../../lib/types'
import { api, getAssetUrl } from '../../../lib/api'
import { notFound } from 'next/navigation'

/**
 * KCN Detail Page - Chỉ fetch từ bảng industrial_parks
 * 
 * Phân biệt rõ ràng:
 * - Khu công nghiệp (IndustrialPark) = bảng industrial_parks → route /kcn/[slug]
 * - Bất động sản (Property) = bảng properties → route /bat-dong-san/[slug] hoặc /san-pham/[slug]
 * 
 * KCN properties (main_category='kcn') vẫn là Property, không phải IndustrialPark
 */
export default async function KCNDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  try {
    // Chỉ fetch từ bảng industrial_parks (Khu công nghiệp)
    const response = await api.getIndustrialParkBySlug(slug)
    
    if (!response.success || !response.data) {
      console.error('[Page] Failed to fetch industrial park:', response.error || response.message)
      notFound()
    }

    const industrialPark = response.data as IndustrialPark
    
    console.log('[Page] Industrial Park data:', {
      id: industrialPark.id,
      name: industrialPark.name,
      thumbnail_url: industrialPark.thumbnail_url,
      images_count: industrialPark.images?.length || 0,
    })

    // Fetch similar industrial parks (chỉ từ bảng industrial_parks)
    let similarItems: SimilarItemCardData[] = []
    try {
      const similarResponse = await api.getIndustrialParks(
        {
          province: industrialPark.province,
        },
        1,
        4
      )
      
      if (similarResponse.success && similarResponse.data) {
        similarItems = similarResponse.data
          .filter((ip: IndustrialPark) => ip.id !== industrialPark.id && ip.slug !== slug)
          .slice(0, 3)
          .map((ip: IndustrialPark) => ({
            id: ip.id,
            slug: ip.slug,
            name: ip.name,
            thumbnail_url: getAssetUrl(ip.thumbnail_url),
            total_area: ip.total_area,
            rental_price_min: ip.rental_price_min,
            rental_price_max: ip.rental_price_max,
            province: ip.province,
          }))
      }
    } catch (error) {
      console.error('Error fetching similar industrial parks:', error)
      // Continue without similar items
    }

    return (
      <DetailLayout
        entity={{ kind: 'industrialPark', item: industrialPark }}
        similarItems={similarItems}
      />
    )
  } catch (error: any) {
    console.error('[Page] Error fetching industrial park:', error)
    // If it's a connection error, show more details
    if (error?.cause?.code === 'ECONNREFUSED' || error?.message?.includes('fetch failed')) {
      console.error('[Page] Backend connection failed. Make sure backend is running on port 4000')
    }
    // If it's a 404, show not found
    if (error?.status === 404) {
      notFound()
    }
    // For other errors, rethrow to show error page
    throw error
  }
}
