"use client"

import ProductCard from './ProductCard'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { api } from '@/lib/api'
import type { Property } from '@/lib/types'
import { getAssetUrl } from '@/lib/api'
import { getProvinces, getWardsByProvince, type Province, type Ward } from '@/lib/provinces-api'

// Map Property to Product format for ProductCard
function mapPropertyToProduct(property: Property, provinces: Province[], wardsMap: Map<number, Ward[]>) {
  // Convert province code to name
  let provinceName = property.province || ''
  if (provinceName && provinces.length > 0) {
    const provinceCode = typeof property.province === 'string' ? parseInt(property.province, 10) : property.province
    if (!isNaN(provinceCode)) {
      const province = provinces.find(p => p.code === provinceCode)
      if (province) {
        provinceName = province.name
      } else {
        // If not found, keep the original value (might be a name already or code)
        provinceName = String(property.province)
      }
    } else {
      // If can't parse as number, assume it's already a name
      provinceName = String(property.province)
    }
  } else if (provinceName) {
    // If provinces not loaded yet, use original value
    provinceName = String(property.province)
  }

  // Convert ward code to name
  let districtName = property.district || property.ward || ''
  if (districtName && property.province) {
    const provinceCode = typeof property.province === 'string' ? parseInt(property.province, 10) : property.province
    if (!isNaN(provinceCode)) {
      const wards = wardsMap.get(provinceCode) || []
      if (wards.length > 0) {
        const wardCode = typeof districtName === 'string' ? parseInt(districtName, 10) : districtName
        if (!isNaN(wardCode)) {
          const ward = wards.find(w => w.code === wardCode)
          if (ward) {
            districtName = ward.name
          }
        }
      }
    }
  }

  return {
    id: property.id,
    slug: property.slug,
    name: property.name,
    code: property.code,
    type: (property.property_type || property.type) as any,
    category: property.property_type || property.type,
    main_category: property.main_category, // Add main_category to determine route
    location: {
      province: provinceName,
      district: districtName,
    },
    price: property.price || property.sale_price || property.rental_price || 0,
    area: property.area || property.total_area || 0,
    thumbnail: property.thumbnail_url ? getAssetUrl(property.thumbnail_url) : '',
    gallery: property.images?.map(img => getAssetUrl(img.url)) || [],
    description: {
      short: property.description || property.description_full || '',
      long: property.description_full || property.description || '',
    }
  }
}

export default function ProductGrid({ 
  filters, 
  pageSize = 12,
  transactionType = 'chuyen-nhuong' // 'chuyen-nhuong' | 'cho-thue'
}: { 
  filters: { q?: string; type?: string; locationTypes?: string[]; provinces?: string[]; wards?: string[]; price?: [number, number]; area?: [number, number] }
  pageSize?: number
  transactionType?: 'chuyen-nhuong' | 'cho-thue'
}){
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [wardsMap, setWardsMap] = useState<Map<number, Ward[]>>(new Map())

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await getProvinces()
        setProvinces(data)
      } catch (error) {
        console.error('Failed to load provinces:', error)
      }
    }
    loadProvinces()
  }, [])

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      // Wait for provinces to load first
      if (provinces.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Map filters to API params for products
        const apiFilters: any = {}

        // Map transaction type to has_rental/has_transfer
        if (transactionType === 'cho-thue') {
          apiFilters.has_rental = true
        } else if (transactionType === 'chuyen-nhuong') {
          apiFilters.has_transfer = true
        }

        // Map location_types filter
        if (filters.locationTypes && filters.locationTypes.length > 0) {
          apiFilters.location_types = filters.locationTypes
        }

        // Map province filter
        if (filters.provinces && filters.provinces.length > 0) {
          apiFilters.province = filters.provinces[0] // API supports single province for now
        }

        // Map price range - products use rental_price or transfer_price
        if (filters.price) {
          const [min, max] = filters.price
          if (transactionType === 'cho-thue') {
            if (min > 0) apiFilters.rental_price_min = min
            if (max < Infinity) apiFilters.rental_price_max = max
          } else if (transactionType === 'chuyen-nhuong') {
            if (min > 0) apiFilters.transfer_price_min = min
            if (max < Infinity) apiFilters.transfer_price_max = max
          }
        }

        // Map area range - products use available_area
        if (filters.area) {
          const [min, max] = filters.area
          if (min > 0) apiFilters.available_area_min = min
          if (max < Infinity) apiFilters.available_area_max = max
        }

        // Search query - pass to backend API
        if (filters.q && filters.q.trim()) {
          apiFilters.q = filters.q.trim()
        }
        
        const response = await api.getProducts(apiFilters, currentPage, pageSize)
        let products = response.data || []

        // Filter by ward if specified
        if (filters.wards && filters.wards.length > 0) {
          products = products.filter((p: any) => 
            filters.wards!.includes(p.ward || '')
          )
        }

        // Load wards for products' provinces
        const provinceCodes = new Set<number>()
        products.forEach((p: any) => {
          if (p.province) {
            const code = typeof p.province === 'string' ? parseInt(p.province, 10) : p.province
            if (!isNaN(code)) {
              provinceCodes.add(code)
            }
          }
        })

        // Load wards for all unique provinces
        const newWardsMap = new Map<number, Ward[]>(wardsMap)
        await Promise.all(
          Array.from(provinceCodes).map(async (provinceCode) => {
            if (!newWardsMap.has(provinceCode)) {
              try {
                const wards = await getWardsByProvince(provinceCode)
                newWardsMap.set(provinceCode, wards)
              } catch (error) {
                console.error(`Failed to load wards for province ${provinceCode}:`, error)
                newWardsMap.set(provinceCode, [])
              }
            }
          })
        )
        setWardsMap(newWardsMap)

        // Map products to Product format with location names
        const mappedItems = products.map((product: any) => {
          // Convert product to Product format
          let provinceName = product.province || ''
          if (provinceName && provinces.length > 0) {
            const provinceCode = typeof product.province === 'string' ? parseInt(product.province, 10) : product.province
            if (!isNaN(provinceCode)) {
              const province = provinces.find(p => p.code === provinceCode)
              if (province) {
                provinceName = province.name
              } else {
                provinceName = String(product.province)
              }
            } else {
              provinceName = String(product.province)
            }
          } else if (provinceName) {
            provinceName = String(product.province)
          }

          let districtName = product.district || product.ward || ''
          if (districtName && product.province) {
            const provinceCode = typeof product.province === 'string' ? parseInt(product.province, 10) : product.province
            if (!isNaN(provinceCode)) {
              const wards = newWardsMap.get(provinceCode) || []
              if (wards.length > 0) {
                const wardCode = typeof districtName === 'string' ? parseInt(districtName, 10) : districtName
                if (!isNaN(wardCode)) {
                  const ward = wards.find(w => w.code === wardCode)
                  if (ward) {
                    districtName = ward.name
                  }
                }
              }
            }
          }

          return {
            id: product.id,
            slug: product.slug,
            name: product.name,
            code: product.code,
            type: 'nha-xuong' as any, // Products are typically industrial
            category: 'kcn',
            main_category: 'kcn' as const,
            location: {
              province: provinceName,
              district: districtName,
            },
            price: product.transfer_price_min || product.rental_price_min || 0,
            area: product.available_area || product.total_area || 0,
            thumbnail: product.thumbnail_url ? getAssetUrl(product.thumbnail_url) : '',
            gallery: (product.images || []).map((img: any) => getAssetUrl(img.url || img)).filter(Boolean),
            description: {
              short: product.description || product.description_full || '',
              long: product.description_full || product.description || '',
            }
          }
        })
        
        if (currentPage === 1) {
          setItems(mappedItems)
        } else {
          setItems(prev => [...prev, ...mappedItems])
        }
        
        // Check if there are more pages
        const totalPages = response.pagination?.totalPages || 1
        setHasMore(currentPage < totalPages)
      } catch (error) {
        console.error('Failed to fetch properties:', error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [filters, currentPage, pageSize, transactionType, provinces])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
    setItems([])
  }, [filters, transactionType])

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || loading || !hasMore) return
    
    const io = new IntersectionObserver(entries => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMore && !loading) {
        setCurrentPage(prev => prev + 1)
      }
    }, { rootMargin: '200px' })
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
        <p className="text-white/70 text-lg">Không tìm thấy kết quả nào</p>
        <p className="text-white/50 text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {items.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 12) * 0.05 }}>
            <ProductCard item={p} />
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
