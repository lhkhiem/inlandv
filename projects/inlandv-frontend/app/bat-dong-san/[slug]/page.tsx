import React from 'react'
import DetailLayout from '../../../components/products/detail/DetailLayout'
import { Property, SimilarItemCardData } from '../../../lib/types'
import { api, getAssetUrl } from '../../../lib/api'
import { notFound } from 'next/navigation'

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  try {
    // Fetch property data from API
    const response = await api.getPropertyBySlug(slug)
    
    if (!response.success || !response.data) {
      notFound()
    }

    const property = response.data as Property

    // Fetch similar properties
    let similarItems: SimilarItemCardData[] = []
    try {
      const similarResponse = await api.getProperties(
        {
          main_category: property.main_category || 'bds',
          property_type: property.property_type,
          province: property.province,
        },
        1,
        4
      )
      
      if (similarResponse.success && similarResponse.data) {
        similarItems = similarResponse.data
          .filter((p: Property) => p.id !== property.id && p.slug !== slug)
          .slice(0, 3)
          .map((p: Property) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            thumbnail_url: getAssetUrl(p.thumbnail_url),
            area: p.total_area || p.area,
            price: p.price || p.sale_price,
            province: p.province,
          }))
      }
    } catch (error) {
      console.error('Error fetching similar properties:', error)
      // Continue without similar items
    }

    return (
      <DetailLayout
        entity={{ kind: 'property', item: property }}
        similarItems={similarItems}
      />
    )
  } catch (error) {
    console.error('Error fetching property:', error)
    notFound()
  }
}
