"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Grid3x3, List, MapIcon, Loader2 } from 'lucide-react'
import PropertyFilterBar from '@/components/products/PropertyFilterBar'
import PropertyCard from '@/components/products/PropertyCard'
import { PropertyFilter, Property } from '@/lib/types'
import { api } from '@/lib/api'
import { getProvinces, getWardsByProvince, type Province, type Ward } from '@/lib/provinces-api'

export default function PropertiesListPage() {
  const [filters, setFilters] = useState<PropertyFilter>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [wardsMap, setWardsMap] = useState<Map<number, Ward[]>>(new Map())
  const pageSize = 12

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

  // Load wards for properties' provinces
  useEffect(() => {
    const loadWards = async () => {
      if (properties.length === 0 || provinces.length === 0) return

      const provinceCodes = new Set<number>()
      properties.forEach((p: Property) => {
        const provinceCode = typeof p.province === 'string' ? parseInt(p.province, 10) : p.province
        if (!isNaN(provinceCode)) {
          provinceCodes.add(provinceCode)
        }
      })

      const newWardsMap = new Map(wardsMap)
      for (const code of provinceCodes) {
        if (!newWardsMap.has(code)) {
          try {
            const wards = await getWardsByProvince(code)
            newWardsMap.set(code, wards)
          } catch (error) {
            console.error(`Failed to load wards for province ${code}:`, error)
          }
        }
      }
      setWardsMap(newWardsMap)
    }

    loadWards()
  }, [properties, provinces])

  // Map PropertyFilter to API format
  const mapFiltersToAPI = useCallback((filters: PropertyFilter) => {
    const apiFilters: any = {
      main_category: 'bds', // Bất động sản
      status: 'available', // Only show available properties
    }

    // Map demand to transaction_type
    if (filters.demand === 'rent') {
      apiFilters.transaction_type = 'cho-thue'
    } else if (filters.demand === 'buy') {
      apiFilters.transaction_type = 'chuyen-nhuong'
    }

    // Map type/property_type
    if (filters.type || filters.property_type) {
      apiFilters.property_type = filters.type || filters.property_type
    }

    // Map province (PropertyFilterBar now uses province names)
    if (filters.province) {
      // PropertyFilterBar uses province names, so use it directly
      apiFilters.province = filters.province
    }

    // Map price range
    if (filters.price_min !== undefined) {
      apiFilters.price_min = filters.price_min
    }
    if (filters.price_max !== undefined) {
      apiFilters.price_max = filters.price_max
    }

    // Map area range
    if (filters.area_min !== undefined) {
      apiFilters.area_min = filters.area_min
    }
    if (filters.area_max !== undefined) {
      apiFilters.area_max = filters.area_max
    }

    // Map search query
    if (filters.q) {
      apiFilters.q = filters.q
    }

    return apiFilters
  }, [provinces])

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        setError(null)

        const apiFilters = mapFiltersToAPI(filters)
        const response = await api.getProperties(apiFilters, currentPage, pageSize)

        if (response.success && response.data) {
          let fetchedProperties = response.data || []

          // Filter by district/ward if specified (client-side since API doesn't support it yet)
          if (filters.district || filters.ward) {
            fetchedProperties = fetchedProperties.filter((p: Property) => {
              if (filters.district && p.district !== filters.district && p.ward !== filters.district) {
                return false
              }
              if (filters.ward && p.ward !== filters.ward) {
                return false
              }
              return true
            })
          }

          setProperties(fetchedProperties)
          setTotalPages(response.pagination?.totalPages || 1)
          setTotal(response.pagination?.total || 0)
        } else {
          setProperties([])
          setTotalPages(1)
          setTotal(0)
        }
      } catch (err) {
        console.error('Failed to fetch properties:', err)
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.')
        setProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [filters, currentPage, mapFiltersToAPI])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Sort properties
  const sortedProperties = [...properties].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.price || a.sale_price || a.rental_price || 0) - (b.price || b.sale_price || b.rental_price || 0)
      case 'price-desc':
        return (b.price || b.sale_price || b.rental_price || 0) - (a.price || a.sale_price || a.rental_price || 0)
      case 'area-asc':
        return (a.area || a.total_area || 0) - (b.area || b.total_area || 0)
      case 'area-desc':
        return (b.area || b.total_area || 0) - (a.area || a.total_area || 0)
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-20">
      {/* Hero Section */}
      <div className="relative text-[#2E8C4F] bg-white border-b border-gray-300">
        <div className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2E8C4F]">Bất động sản</h1>
              <p className="text-lg md:text-xl text-[#2E8C4F]">
                Khám phá hàng nghìn bất động sản chất lượng cao tại Việt Nam
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Section */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <PropertyFilterBar onChange={setFilters} />
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-xl shadow-md border border-gray-300 p-4 mb-8 text-[#2E8C4F]"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Results Count */}
            <div className="text-sm text-[#2E8C4F]">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải...
                </span>
              ) : (
                <>
                  Tìm thấy <span className="font-semibold text-[#2E8C4F]">{total}</span> bất động sản
                </>
              )}
            </div>

            {/* View Mode & Sort */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 bg-white text-[#2E8C4F] rounded-lg text-sm focus:outline-none focus:border-goldDark"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
                <option value="area-asc">Diện tích nhỏ → lớn</option>
                <option value="area-desc">Diện tích lớn → nhỏ</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-300">
                <button
                  onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#2E8C4F] text-white shadow-sm'
                      : 'text-[#2E8C4F] hover:text-[#2E8C4F]'
                  }`}
                  title="Xem dạng lưới"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#2E8C4F] text-white shadow-sm'
                      : 'text-[#2E8C4F] hover:text-[#2E8C4F]'
                  }`}
                  title="Xem dạng danh sách"
                >
                  <List className="w-5 h-5" />
                </button>
                {/* Future: Map View */}
                {/* <button
                  className="p-2 rounded-md text-gray-400"
                  title="Xem trên bản đồ (Sắp ra mắt)"
                  disabled
                >
                  <MapIcon className="w-5 h-5" />
                </button> */}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Properties Grid */}
        {loading ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <Loader2 className="w-16 h-16 mx-auto text-[#2E8C4F] animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-[#2E8C4F] mb-2">Đang tải dữ liệu...</h3>
            <p className="text-[#2E8C4F]">Vui lòng đợi trong giây lát.</p>
          </motion.div>
        ) : error ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="text-red-500 mb-4">
              <SlidersHorizontal className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-[#2E8C4F] mb-2">Có lỗi xảy ra</h3>
            <p className="text-[#2E8C4F] mb-4">{error}</p>
            <button
              onClick={() => {
                setCurrentPage(1)
                setError(null)
              }}
              className="px-6 py-2 bg-goldDark text-white font-semibold rounded-lg hover:bg-goldDark/90 transition-colors"
            >
              Thử lại
            </button>
          </motion.div>
        ) : sortedProperties.length === 0 ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="text-[#2E8C4F] mb-4">
              <SlidersHorizontal className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-[#2E8C4F] mb-2">Không tìm thấy kết quả</h3>
            <p className="text-[#2E8C4F]">Vui lòng thử điều chỉnh bộ lọc để xem nhiều bất động sản hơn.</p>
          </motion.div>
        ) : (
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'flex flex-col gap-6'
              }
            >
              {sortedProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 bg-white text-[#2E8C4F] font-semibold rounded-lg hover:bg-[#2E8C4F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                >
                  Trước
                </button>
                <div className="px-4 py-2 bg-white text-[#2E8C4F] rounded-lg border border-gray-300">
                  Trang {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 bg-goldDark text-white font-semibold rounded-lg hover:bg-goldDark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
