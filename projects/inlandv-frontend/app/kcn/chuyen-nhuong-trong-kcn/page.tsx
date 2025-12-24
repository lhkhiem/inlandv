"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import IndustrialParkFilterBar from '@/components/products/IndustrialParkFilterBar'
import IndustrialParkCard from '@/components/products/IndustrialParkCard'
import { sampleIndustrialParks, filterIndustrialParks } from '@/lib/realEstateData'
import { IndustrialParkFilter } from '@/lib/types'
import ProductFilterDropdown from '@/components/products/ProductFilterDropdown'

function ChuyenNhuongTrongKCNPageContent() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<IndustrialParkFilter>({
    scope: 'trong-kcn',
  })
  const [sortBy, setSortBy] = useState<string>('newest')
  const [sub2Filter, setSub2Filter] = useState<string>('')
  const initializedRef = useRef(false)

  // Lấy filter từ query params - chỉ chạy một lần khi mount hoặc khi query params thay đổi từ bên ngoài
  useEffect(() => {
    const nx = searchParams.get('nx')
    if (nx === 'co') {
      setSub2Filter('co-nx')
      setFilters(prev => ({ ...prev, nx: 'co', scope: 'trong-kcn' }))
      initializedRef.current = true
    } else if (!initializedRef.current) {
      // Chỉ set default một lần khi mount, không có query params
      setSub2Filter('trong-kcn')
      setFilters(prev => ({ ...prev, nx: undefined, scope: 'trong-kcn' }))
      initializedRef.current = true
    }
  }, [searchParams])

  // Sub 2 options cho dropdown
  const sub2Options = [
    { label: 'Tất cả', value: '' },
    { label: 'Chuyển nhượng đất trong KCN', value: 'trong-kcn' },
    { label: 'Chuyển nhượng đất có NX trong KCN', value: 'co-nx' },
  ]

  const handleSub2Change = (value: string) => {
    setSub2Filter(value)
    if (value === 'co-nx') {
      setFilters(prev => ({ ...prev, nx: 'co', scope: 'trong-kcn' }))
      // Update URL without reload
      window.history.pushState({}, '', '/kcn/chuyen-nhuong-trong-kcn?nx=co')
    } else if (value === 'trong-kcn') {
      setFilters(prev => ({ ...prev, nx: undefined, scope: 'trong-kcn' }))
      window.history.pushState({}, '', '/kcn/chuyen-nhuong-trong-kcn')
    } else if (value === '') {
      // "Tất cả" - xóa filter nx nhưng giữ scope
      setFilters(prev => ({ ...prev, nx: undefined, scope: 'trong-kcn' }))
      window.history.pushState({}, '', '/kcn/chuyen-nhuong-trong-kcn')
    } else {
      setFilters(prev => ({ ...prev, nx: undefined, scope: 'trong-kcn' }))
      window.history.pushState({}, '', '/kcn/chuyen-nhuong-trong-kcn')
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Chuyển nhượng đất trong KCN</h1>
              <p className="text-lg md:text-xl text-gray-300">
                Tìm kiếm đất chuyển nhượng trong khu công nghiệp phù hợp
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
                Loại chuyển nhượng:
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
            mode="chuyen-nhuong"
            onChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters, scope: 'trong-kcn' }))} 
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

export default function ChuyenNhuongTrongKCNPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#151313] flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <ChuyenNhuongTrongKCNPageContent />
    </Suspense>
  )
}

