import React from 'react'
import DetailLayout from '../../../components/products/detail/DetailLayout'
import { Property, SimilarItemCardData } from '../../../lib/types'
import { api, getAssetUrl } from '../../../lib/api'
import { notFound } from 'next/navigation'

// Helper function to map product (from products table) to Property format
function mapProductToProperty(product: any): Property {
  // Extract infrastructure from JSONB
  const infrastructure = product.infrastructure || {}
  
  // Extract images from JSONB array
  let images: any[] = []
  if (product.images && Array.isArray(product.images)) {
    images = product.images.map((img: any) => {
      if (typeof img === 'string') {
        return { url: img, display_order: 0, is_primary: false }
      }
      return {
        id: img.id || '',
        url: img.url || img,
        caption: img.caption || '',
        display_order: img.display_order || 0,
        is_primary: img.is_primary || false,
      }
    })
  }
  
  // Calculate price_per_sqm if not provided
  let pricePerSqm = product.price_per_sqm
  if (!pricePerSqm && product.transfer_price_min && product.available_area) {
    // transfer_price_min is in tỷ VND, convert to VND and divide by area in m²
    const priceVND = product.transfer_price_min * 1000000000
    const areaM2 = product.available_area * 10000 // Convert ha to m²
    pricePerSqm = areaM2 > 0 ? priceVND / areaM2 : undefined
  }
  
  // Map to Property format
  return {
    id: product.id,
    code: product.code || '',
    name: product.name || '',
    slug: product.slug || '',
    
    // Phân loại
    main_category: 'kcn' as const, // Products are always KCN related
    sub_category: product.scope === 'trong-kcn' ? 'trong-kcn' : 'ngoai-kcn',
    property_type: product.product_types?.[0] || 'dat-trong-kcn',
    transaction_type: product.transaction_types?.includes('chuyen-nhuong') ? 'chuyen-nhuong' : 'cho-thue',
    
    // Status
    status: 'available' as const,
    
    // Location
    province: product.province || '',
    district: product.district || '',
    ward: product.ward || '',
    address: product.address || '',
    latitude: product.latitude ? Number(product.latitude) : undefined,
    longitude: product.longitude ? Number(product.longitude) : undefined,
    google_maps_link: product.google_maps_link || '',
    
    // Dimensions
    total_area: product.total_area ? Number(product.total_area) : undefined,
    area: product.total_area ? Number(product.total_area) * 10000 : undefined, // Convert ha to m² for display
    area_unit: 'ha' as const,
    available_area: product.available_area ? Number(product.available_area) : undefined,
    
    // Pricing
    // Keep transfer prices in tỷ VND for display in PriceCard
    price: product.transfer_price_min ? product.transfer_price_min * 1000000000 : undefined, // Convert tỷ VND to VND for general price
    price_per_sqm: pricePerSqm,
    price_range_min: product.transfer_price_min ? product.transfer_price_min * 1000000000 : undefined, // In VND
    price_range_max: product.transfer_price_max ? product.transfer_price_max * 1000000000 : undefined, // In VND
    sale_price: product.transfer_price_min ? product.transfer_price_min * 1000000000 : undefined,
    sale_price_min: product.transfer_price_min ? product.transfer_price_min * 1000000000 : undefined,
    sale_price_max: product.transfer_price_max ? product.transfer_price_max * 1000000000 : undefined,
    rental_price: product.rental_price_min || undefined,
    rental_price_min: product.rental_price_min ? Number(product.rental_price_min) : undefined,
    rental_price_max: product.rental_price_max ? Number(product.rental_price_max) : undefined,
    rental_price_per_sqm: product.rental_price_min || undefined,
    // Store original transfer prices in tỷ VND for PriceCard
    transfer_price_min: product.transfer_price_min ? Number(product.transfer_price_min) : undefined, // Keep in tỷ VND
    transfer_price_max: product.transfer_price_max ? Number(product.transfer_price_max) : undefined, // Keep in tỷ VND
    
    // Features
    has_rental: product.has_rental || false,
    has_transfer: product.has_transfer || false,
    description: product.description || '',
    description_full: product.description_full || product.description || '',
    
    // Media
    thumbnail_url: product.thumbnail_url || '',
    video_url: product.video_url || '',
    images: images,
    
    // Infrastructure (map from JSONB to separate fields for backward compatibility)
    infrastructure_power: infrastructure.power || false,
    infrastructure_water: infrastructure.water || false,
    infrastructure_drainage: infrastructure.drainage || false,
    infrastructure_waste: infrastructure.waste || false,
    infrastructure_internet: infrastructure.internet || false,
    infrastructure_road: infrastructure.road || false,
    infrastructure_security: infrastructure.security || false,
    
    // Contact
    contact_name: product.contact_name || '',
    contact_phone: product.contact_phone || '',
    contact_email: product.contact_email || '',
    
    // SEO
    meta_title: product.meta_title || '',
    meta_description: product.meta_description || '',
    meta_keywords: product.meta_keywords || '',
    
    // Timestamps
    created_at: product.created_at || new Date().toISOString(),
    updated_at: product.updated_at || new Date().toISOString(),
    published_at: product.published_at || undefined,
    
    // Additional fields for compatibility
    allowed_industries: product.allowed_industries || [],
    amenities: product.product_types || [],
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  try {
    // Try to fetch product first, then fall back to property
    let response = await api.getProductBySlug(slug)
    let isProduct = true
    let property: Property
    
    if (response.success && response.data) {
      // Map product to Property format
      property = mapProductToProperty(response.data)
    } else {
      // Fall back to property
      response = await api.getPropertyBySlug(slug)
      isProduct = false
      
      if (!response.success || !response.data) {
        console.error('[Page] Failed to fetch product/property:', response.error || response.message)
        notFound()
      }
      
      property = response.data as Property
    }

    console.log('[Page] Product/Property data:', {
      id: property.id,
      name: property.name,
      isProduct,
      main_category: property.main_category,
      property_type: property.property_type,
      thumbnail_url: property.thumbnail_url,
      images_count: property.images?.length || 0,
      has_rental: property.has_rental,
      has_transfer: property.has_transfer,
      total_area: property.total_area,
      available_area: property.available_area,
      infrastructure: {
        power: property.infrastructure_power,
        water: property.infrastructure_water,
        road: property.infrastructure_road,
      },
    })

    // Fetch similar items (products or properties)
    let similarItems: SimilarItemCardData[] = []
    try {
      if (isProduct) {
        // Fetch similar products
        const similarResponse = await api.getProducts(
          {
            location_types: property.sub_category === 'trong-kcn' ? ['trong-kcn'] : ['ngoai-kcn', 'ngoai-kcn-ccn'],
            has_transfer: property.has_transfer,
            province: property.province,
          },
          1,
          4
        )
        
        if (similarResponse.success && similarResponse.data) {
          similarItems = similarResponse.data
            .filter((p: any) => p.id !== property.id && p.slug !== slug)
            .slice(0, 3)
            .map((p: any) => {
              const mappedP = mapProductToProperty(p)
              return {
                id: mappedP.id,
                slug: mappedP.slug,
                name: mappedP.name,
                thumbnail_url: getAssetUrl(mappedP.thumbnail_url),
                area: mappedP.total_area || mappedP.area,
                price: mappedP.price || mappedP.sale_price || mappedP.rental_price,
                province: mappedP.province,
              }
            })
        }
      } else {
        // Fetch similar properties
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
              price: p.price || p.sale_price || p.rental_price,
              province: p.province,
            }))
        }
      }
    } catch (error) {
      console.error('Error fetching similar items:', error)
      // Continue without similar items
    }

    // Determine if this is an industrial park (product) or regular property
    // Products from products table are treated as industrial parks
    const isIndustrialPark = isProduct || property.main_category === 'kcn'
    
    // Get transfer prices (already in tỷ VND from mapProductToProperty)
    const transferPriceMin = (property as any).transfer_price_min
    const transferPriceMax = (property as any).transfer_price_max
    
    return (
      <DetailLayout
        entity={{ 
          kind: isIndustrialPark ? 'industrialPark' : 'property', 
          item: isIndustrialPark ? {
            ...property,
            // Add IndustrialPark specific fields
            scope: property.sub_category === 'trong-kcn' ? 'trong-kcn' : 'ngoai-kcn',
            has_rental: property.has_rental || false,
            has_transfer: property.has_transfer || false,
            has_factory: false, // Can be enhanced later if needed
            total_area: property.total_area || 0,
            available_area: property.available_area,
            rental_price_min: property.rental_price_min,
            rental_price_max: property.rental_price_max,
            transfer_price_min: transferPriceMin,
            transfer_price_max: transferPriceMax,
            infrastructure: {
              power: property.infrastructure_power,
              water: property.infrastructure_water,
              drainage: property.infrastructure_drainage,
              waste: property.infrastructure_waste,
              internet: property.infrastructure_internet,
              road: property.infrastructure_road,
              security: property.infrastructure_security,
            },
            allowed_industries: property.allowed_industries || [],
          } as any : property
        }}
        similarItems={similarItems}
      />
    )
  } catch (error: any) {
    console.error('[Page] Error fetching property:', error)
    // If it's a connection error, show more details
    if (error?.cause?.code === 'ECONNREFUSED' || error?.message?.includes('fetch failed')) {
      console.error('[Page] Backend connection failed. Make sure backend is running on port 4000')
    }
    notFound()
  }
}







