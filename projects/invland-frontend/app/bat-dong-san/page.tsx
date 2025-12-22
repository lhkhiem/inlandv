"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Grid3x3, List, MapIcon } from 'lucide-react'
import PropertyFilterBar from '@/components/products/PropertyFilterBar'
import PropertyCard from '@/components/products/PropertyCard'
import { sampleProperties, filterProperties } from '@/lib/realEstateData'
import { PropertyFilter } from '@/lib/types'

export default function PropertiesListPage() {
  const [filters, setFilters] = useState<PropertyFilter>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<string>('newest')

  const filteredProperties = filterProperties(sampleProperties, filters)

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'area-asc':
        return a.area - b.area
      case 'area-desc':
        return b.area - a.area
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return (
    <div className="min-h-screen bg-[#151313] pt-20">
      {/* Hero Section */}
      <div className="relative text-white bg-[#151313] border-b border-gray-800">
        <div className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Bất động sản</h1>
              <p className="text-lg md:text-xl text-gray-300">
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
          className="bg-[#1f1b1b] rounded-xl shadow-md border border-gray-700 p-4 mb-8 text-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Results Count */}
            <div className="text-sm text-gray-300">
              Tìm thấy <span className="font-semibold text-white">{sortedProperties.length}</span> bất động sản
            </div>

            {/* View Mode & Sort */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-600 bg-[#151313] text-gray-100 rounded-lg text-sm focus:outline-none focus:border-goldDark"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
                <option value="area-asc">Diện tích nhỏ → lớn</option>
                <option value="area-desc">Diện tích lớn → nhỏ</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-[#151313] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-goldDark shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  title="Xem dạng lưới"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-goldDark shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
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
        {sortedProperties.length === 0 ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="bg-[#1f1b1b] rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="text-gray-500 mb-4">
              <SlidersHorizontal className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-300">Vui lòng thử điều chỉnh bộ lọc để xem nhiều bất động sản hơn.</p>
          </motion.div>
        ) : (
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
        )}

        {/* Load More Button (for future pagination) */}
        {sortedProperties.length > 0 && sortedProperties.length >= 12 && (
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-goldDark text-white font-semibold rounded-lg hover:bg-goldDark/90 transition-colors">
              Xem thêm bất động sản
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
