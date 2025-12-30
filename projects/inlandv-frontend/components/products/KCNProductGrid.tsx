"use client"

import ProductCard from './ProductCard'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import type { Property } from '@/lib/types'
import { getAssetUrl } from '@/lib/api'
import { getProvinces, getWardsByProvince, type Province, type Ward } from '@/lib/provinces-api'
import type { KCNProductFilters } from './KCNProductFilterBar'

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
        provinceName = String(property.province)
      }
    } else {
      provinceName = String(property.province)
    }
  } else if (provinceName) {
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
    main_category: property.main_category || 'kcn', // KCN products always have main_category='kcn'
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

export default function KCNProductGrid({
  filters,
  pageSize = 12,
  transactionType,
}: {
  filters: KCNProductFilters
  pageSize?: number
  transactionType: 'chuyen-nhuong' | 'cho-thue'
}) {
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

  // Fetch KCN properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      // Wait for provinces to load first
      if (provinces.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Map filters to API params for KCN products
        const apiFilters: any = {
          main_category: 'kcn',
          transaction_type: transactionType,
          status: 'available', // Only show available properties
        }

        // Map scope to sub_category
        // Note: trong-ccn (cụm công nghiệp) might be stored as 'trong-kcn' in sub_category
        // or we might need backend to handle it separately
        if (filters.scope) {
          if (filters.scope === 'trong-kcn' || filters.scope === 'trong-ccn') {
            apiFilters.sub_category = 'trong-kcn'
          } else if (filters.scope === 'ngoai-kcn-ccn') {
            apiFilters.sub_category = 'ngoai-kcn'
          }
        }

        // Map category and nx to property_type for more specific filtering
        // For cho-thue: category can be 'nha-xuong' or 'dat'
        // For chuyen-nhuong: nx can be 'co' (có nhà xưởng) or 'khong' (không có nhà xưởng)
        if (transactionType === 'cho-thue' && filters.category) {
          if (filters.category === 'nha-xuong') {
            // Nhà xưởng cho thuê
            apiFilters.property_type = 'nha-xuong'
          } else if (filters.category === 'dat') {
            // Đất cho thuê - specify based on scope
            if (filters.scope === 'trong-kcn' || filters.scope === 'trong-ccn') {
              apiFilters.property_type = 'dat-trong-kcn'
            } else if (filters.scope === 'ngoai-kcn-ccn') {
              apiFilters.property_type = 'dat-ngoai-kcn'
            }
          }
        } else if (transactionType === 'chuyen-nhuong') {
          // For chuyen-nhuong, map based on nx (có nhà xưởng hay không)
          if (filters.nx === 'co') {
            // Đất có nhà xưởng
            if (filters.scope === 'trong-kcn' || filters.scope === 'trong-ccn') {
              apiFilters.property_type = 'dat-co-nha-xuong-trong-kcn'
            } else if (filters.scope === 'ngoai-kcn-ccn') {
              apiFilters.property_type = 'dat-co-nha-xuong-ngoai-kcn'
            }
          } else if (filters.nx === 'khong') {
            // Đất không có nhà xưởng
            if (filters.scope === 'trong-kcn' || filters.scope === 'trong-ccn') {
              apiFilters.property_type = 'dat-trong-kcn'
            } else if (filters.scope === 'ngoai-kcn-ccn') {
              apiFilters.property_type = 'dat-ngoai-kcn'
            }
          }
        }

        // Map province filter
        if (filters.provinces && filters.provinces.length > 0) {
          apiFilters.province = filters.provinces[0] // API supports single province for now
        }

        // Map price range
        if (filters.price) {
          const [min, max] = filters.price
          if (min > 0) apiFilters.price_min = min
          if (max < Infinity && max < (transactionType === 'cho-thue' ? 10_000_000_000 : 500_000_000_000)) {
            apiFilters.price_max = max
          }
        }

        // Map area range
        if (filters.area) {
          const [min, max] = filters.area
          if (min > 0) apiFilters.area_min = min
          if (max < Infinity && max < 100000) {
            apiFilters.area_max = max
          }
        }

        // Search query
        if (filters.q && filters.q.trim()) {
          apiFilters.q = filters.q.trim()
        }

        const response = await api.getProperties(apiFilters, currentPage, pageSize)
        let properties = response.data || []

        // Filter by ward if specified (client-side filtering)
        if (filters.wards && filters.wards.length > 0) {
          properties = properties.filter((p: Property) =>
            filters.wards!.includes(String(p.ward || ''))
          )
        }

        // Load wards for properties' provinces
        const provinceCodes = new Set<number>()
        properties.forEach((p: Property) => {
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

        // Map to Product format with location names
        const mappedItems = properties.map((prop: Property) => mapPropertyToProduct(prop, provinces, newWardsMap))

        if (currentPage === 1) {
          setItems(mappedItems)
        } else {
          setItems(prev => [...prev, ...mappedItems])
        }

        // Check if there are more pages
        const totalPages = response.pagination?.totalPages || 1
        setHasMore(currentPage < totalPages)
      } catch (error) {
        console.error('Failed to fetch KCN properties:', error)
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
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 12) * 0.05 }}
          >
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

