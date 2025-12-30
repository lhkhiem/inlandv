"use client"

import IndustrialParkCard from './IndustrialParkCard'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import type { IndustrialPark } from '@/lib/types'

export type IndustrialParkFilters = {
  q?: string
  province?: string
  scope?: 'trong-kcn' | 'trong-ccn' | 'ngoai-kcn-ccn'
  has_transfer?: boolean
  has_rental?: boolean
  has_factory?: boolean
  rental_price_min?: number
  rental_price_max?: number
  available_area_min?: number
  available_area_max?: number
}

export default function IndustrialParkGrid({
  filters,
  pageSize = 12,
}: {
  filters: IndustrialParkFilters
  pageSize?: number
}) {
  const [items, setItems] = useState<IndustrialPark[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Helper function to map scope to location_types (using database codes)
  const mapScopeToLocationTypes = (scope?: string): string[] | undefined => {
    if (!scope) return undefined
    
    const mapping: Record<string, string[]> = {
      'trong-kcn': ['trong-kcn'],
      'trong-ccn': ['trong-ccn'],
      'ngoai-kcn-ccn': ['ngoai-kcn', 'ngoai-kcn-ccn'], // Can be either
    }
    
    return mapping[scope]
  }

  // Helper function to map Product to IndustrialPark format
  const mapProductToIndustrialPark = (product: any): IndustrialPark => {
    // Extract infrastructure from JSONB if it exists
    const infrastructure = product.infrastructure || {}
    
    return {
      id: product.id,
      name: product.name || '',
      slug: product.slug || '',
      code: product.code || '',
      description: product.description || product.description_full || '',
      province: product.province || '', // Already mapped to name by backend
      district: product.district || '',
      total_area: product.total_area || product.area || 0,
      available_area: product.available_area || 0,
      rental_price_min: product.rental_price_min || undefined,
      rental_price_max: product.rental_price_max || undefined,
      transfer_price_min: product.transfer_price_min || undefined,
      transfer_price_max: product.transfer_price_max || undefined,
      thumbnail_url: product.thumbnail_url || '',
      contact_phone: product.contact_phone || '',
      allowed_industries: product.allowed_industries || [],
      infrastructure_power: infrastructure.power || false,
      infrastructure_water: infrastructure.water || false,
      infrastructure_drainage: infrastructure.drainage || false,
      infrastructure_waste: infrastructure.waste || false,
      infrastructure_internet: infrastructure.internet || false,
      infrastructure_road: infrastructure.road || false,
      infrastructure_security: infrastructure.security || false,
      created_at: product.created_at || new Date().toISOString(),
      updated_at: product.updated_at || new Date().toISOString(),
    }
  }

  // Fetch Products from API (using products table)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)

        // Map filters to API params for Products
        const apiFilters: any = {}

        // Map scope to location_types
        const locationTypes = mapScopeToLocationTypes(filters.scope)
        if (locationTypes && locationTypes.length > 0) {
          apiFilters.location_types = locationTypes
        }

        // Has transfer filter (for chuyen-nhuong)
        if (filters.has_transfer !== undefined) {
          apiFilters.has_transfer = filters.has_transfer
        }

        // Has rental filter (for cho-thue)
        if (filters.has_rental !== undefined) {
          apiFilters.has_rental = filters.has_rental
        }

        // Has factory filter
        if (filters.has_factory !== undefined) {
          apiFilters.has_factory = filters.has_factory
        }

        // Province filter
        if (filters.province) {
          apiFilters.province = filters.province
        }

        // District filter
        if (filters.district) {
          apiFilters.district = filters.district
        }

        // Price range - map to rental_price or transfer_price based on has_transfer/has_rental
        if (filters.has_transfer) {
          // For chuyen-nhuong, use transfer_price
          if (filters.rental_price_min !== undefined && filters.rental_price_min > 0) {
            apiFilters.transfer_price_min = filters.rental_price_min
          }
          if (filters.rental_price_max !== undefined && filters.rental_price_max < Infinity) {
            apiFilters.transfer_price_max = filters.rental_price_max
          }
        } else if (filters.has_rental) {
          // For cho-thue, use rental_price
          if (filters.rental_price_min !== undefined && filters.rental_price_min > 0) {
            apiFilters.rental_price_min = filters.rental_price_min
          }
          if (filters.rental_price_max !== undefined && filters.rental_price_max < Infinity) {
            apiFilters.rental_price_max = filters.rental_price_max
          }
        }

        // Area range - map to available_area
        if (filters.available_area_min !== undefined && filters.available_area_min > 0) {
          apiFilters.available_area_min = filters.available_area_min
        }
        if (filters.available_area_max !== undefined && filters.available_area_max < Infinity) {
          apiFilters.available_area_max = filters.available_area_max
        }

        // Search query
        if (filters.q && filters.q.trim()) {
          apiFilters.q = filters.q.trim()
        }

        const response = await api.getProducts(apiFilters, currentPage, pageSize)
        const products = response.data || []

        // Map Products to IndustrialPark format
        const parks = products.map(mapProductToIndustrialPark)

        if (currentPage === 1) {
          setItems(parks)
        } else {
          setItems(prev => [...prev, ...parks])
        }

        // Check if there are more pages
        const totalPages = response.pagination?.totalPages || 1
        setHasMore(currentPage < totalPages && parks.length > 0)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters, currentPage, pageSize])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
    setItems([])
  }, [filters])

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || loading || !hasMore) return

    const io = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore && !loading) {
          setCurrentPage(prev => prev + 1)
        }
      },
      { rootMargin: '200px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, loading])

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-goldDark border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#2E8C4F] text-lg">Không tìm thấy khu công nghiệp nào</p>
        <p className="text-[#2E8C4F] text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {items.map((park, i) => (
          <motion.div
            key={park.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 12) * 0.05 }}
          >
            <IndustrialParkCard park={park} />
          </motion.div>
        ))}
      </motion.div>
      <div ref={sentinelRef} className="h-14" />
      {loading && items.length > 0 && (
        <div className="flex justify-center items-center py-6">
          <div className="w-8 h-8 border-4 border-goldDark border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </>
  )
}
