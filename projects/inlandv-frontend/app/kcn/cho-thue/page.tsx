"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import IndustrialParkFilterBar from '@/components/products/IndustrialParkFilterBar'
import IndustrialParkCard from '@/components/products/IndustrialParkCard'
import { sampleIndustrialParks, filterIndustrialParks } from '@/lib/realEstateData'
import { IndustrialParkFilter } from '@/lib/types'
import ProductFilterDropdown from '@/components/products/ProductFilterDropdown'

function ChoThuePageContent() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<IndustrialParkFilter>({
    type: 'cho-thue',
  })
  const [sortBy, setSortBy] = useState<string>('newest')
  const [sub2Filter, setSub2Filter] = useState<string>('')

  // Lấy filter từ query params
  useEffect(() => {
    const scope = searchParams.get('scope')
    const category = searchParams.get('category')
    
    if (scope && category) {
      let filterValue = ''
      if (scope === 'trong-kcn' && category === 'nha-xuong') {
        filterValue = 'nx-trong-kcn'
      } else if (scope === 'trong-ccn' && category === 'nha-xuong') {
        filterValue = 'nx-trong-ccn'
      } else if (scope === 'ngoai-kcn-ccn' && category === 'nha-xuong') {
        filterValue = 'nx-ngoai-kcn-ccn'
      } else if (scope === 'trong-kcn' && category === 'dat') {
        filterValue = 'dat-trong-kcn'
      } else if (scope === 'trong-ccn' && category === 'dat') {
        filterValue = 'dat-trong-ccn'
      } else if (scope === 'ngoai-kcn-ccn' && category === 'dat') {
        filterValue = 'dat-ngoai-kcn-ccn'
      }
      
      setSub2Filter(filterValue)
      setFilters(prev => ({ ...prev, scope, category, type: 'cho-thue' }))
    }
  }, [searchParams])

  // Sub 2 options cho dropdown
  const sub2Options = [
    { label: 'Tất cả', value: '' },
    { label: 'Cho thuê NX trong KCN', value: 'nx-trong-kcn' },
    { label: 'Cho thuê NX trong CCN', value: 'nx-trong-ccn' },
    { label: 'Cho thuê NX ngoài KCN / CCN', value: 'nx-ngoai-kcn-ccn' },
    { label: 'Cho thuê đất trong KCN', value: 'dat-trong-kcn' },
    { label: 'Cho thuê đất trong CCN', value: 'dat-trong-ccn' },
    { label: 'Cho thuê đất ngoài KCN / CCN', value: 'dat-ngoai-kcn-ccn' },
  ]

  const handleSub2Change = (value: string) => {
    setSub2Filter(value)
    if (value === 'nx-trong-kcn') {
      setFilters(prev => ({ ...prev, scope: 'trong-kcn', category: 'nha-xuong', type: 'cho-thue' }))
    } else if (value === 'nx-trong-ccn') {
      setFilters(prev => ({ ...prev, scope: 'trong-ccn', category: 'nha-xuong', type: 'cho-thue' }))
    } else if (value === 'nx-ngoai-kcn-ccn') {
      setFilters(prev => ({ ...prev, scope: 'ngoai-kcn-ccn', category: 'nha-xuong', type: 'cho-thue' }))
    } else if (value === 'dat-trong-kcn') {
      setFilters(prev => ({ ...prev, scope: 'trong-kcn', category: 'dat', type: 'cho-thue' }))
    } else if (value === 'dat-trong-ccn') {
      setFilters(prev => ({ ...prev, scope: 'trong-ccn', category: 'dat', type: 'cho-thue' }))
    } else if (value === 'dat-ngoai-kcn-ccn') {
      setFilters(prev => ({ ...prev, scope: 'ngoai-kcn-ccn', category: 'dat', type: 'cho-thue' }))
    } else {
      setFilters(prev => ({ ...prev, type: 'cho-thue', scope: undefined, category: undefined }))
    }
  }

  const filteredParks = filterIndustrialParks(sampleIndustrialParks, filters)

  const sortedParks = [...filteredParks].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.rental_price_min || 0) - (b.rental_price_min || 0)
      case 'price-desc':
        return (b.rental_price_max || 0) - (a.rental_price_max || 0)
      case 'area-desc':
        return b.total_area - a.total_area
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Cho Thuê</h1>
              <p className="text-lg md:text-xl text-gray-300">
                Tìm kiếm nhà xưởng và đất cho thuê phù hợp
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Sub 2 Filter Dropdown */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-[#1f1b1b] rounded-xl shadow-md border border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <label className="text-sm font-semibold text-white whitespace-nowrap flex-shrink-0">
                Loại cho thuê:
              </label>
              <div className="flex-1 min-w-0 sm:max-w-md">
                <ProductFilterDropdown
                  label="Chọn loại"
                  options={sub2Options}
                  value={sub2Filter}
                  onChange={handleSub2Change}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <IndustrialParkFilterBar 
            mode="cho-thue"
            onChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters, type: 'cho-thue' }))} 
          />
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-[#1f1b1b] rounded-xl shadow-md border border-gray-700 p-4 mb-8 text-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-300">
              Tìm thấy <span className="font-semibold text-white">{sortedParks.length}</span> kết quả
            </div>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-600 bg-[#151313] text-gray-100 rounded-lg text-sm focus:outline-none focus:border-goldDark"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thấp → cao</option>
                <option value="price-desc">Giá cao → thấp</option>
                <option value="area-desc">Diện tích lớn → nhỏ</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results Grid */}
        {sortedParks.length === 0 ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="bg-[#1f1b1b] rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="text-gray-500 mb-4">
              <SlidersHorizontal className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-300">Vui lòng thử điều chỉnh bộ lọc để xem nhiều kết quả hơn.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedParks.map(park => (
              <IndustrialParkCard key={park.id} park={park} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChoThuePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#151313] pt-20 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <ChoThuePageContent />
    </Suspense>
  )
}

