"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Grid3x3, MapIcon } from 'lucide-react'
import IndustrialParkFilterBar from '@/components/products/IndustrialParkFilterBar'
import IndustrialParkCard from '@/components/products/IndustrialParkCard'
import { sampleIndustrialParks, filterIndustrialParks } from '@/lib/realEstateData'
import { IndustrialParkFilter } from '@/lib/types'
import ProductFilterDropdown from '@/components/products/ProductFilterDropdown'

function IndustrialParksPageContent() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<IndustrialParkFilter>({})
  const [sortBy, setSortBy] = useState<string>('newest')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  // Lấy filter từ query params
  useEffect(() => {
    const scope = searchParams.get('scope') || undefined
    const nx = searchParams.get('nx') || undefined
    const type = searchParams.get('type') || undefined
    const category = searchParams.get('category') || undefined
    
    if (scope || nx || type || category) {
      let filterValue = ''
      if (type === 'cho-thue') {
        if (scope === 'trong-kcn' && category === 'nha-xuong') filterValue = 'cho-thue-nx-trong-kcn'
        else if (scope === 'trong-ccn' && category === 'nha-xuong') filterValue = 'cho-thue-nx-trong-ccn'
        else if (scope === 'ngoai-kcn-ccn' && category === 'nha-xuong') filterValue = 'cho-thue-nx-ngoai-kcn-ccn'
        else if (scope === 'trong-kcn' && category === 'dat') filterValue = 'cho-thue-dat-trong-kcn'
        else if (scope === 'trong-ccn' && category === 'dat') filterValue = 'cho-thue-dat-trong-ccn'
        else if (scope === 'ngoai-kcn-ccn' && category === 'dat') filterValue = 'cho-thue-dat-ngoai-kcn-ccn'
      } else if (scope === 'trong-kcn') {
        filterValue = nx === 'co' ? 'chuyen-nhuong-co-nx-trong-kcn' : 'chuyen-nhuong-trong-kcn'
      } else if (scope === 'trong-ccn') {
        filterValue = nx === 'co' ? 'chuyen-nhuong-co-nx-trong-ccn' : 'chuyen-nhuong-trong-ccn'
      } else if (scope === 'ngoai-kcn-ccn') {
        filterValue = nx === 'co' ? 'chuyen-nhuong-co-nx-ngoai-kcn-ccn' : 'chuyen-nhuong-ngoai-kcn-ccn'
      }
      
      setCategoryFilter(filterValue)
      setFilters(prev => ({ ...prev, scope, nx, type, category }))
    }
  }, [searchParams])

  // Tất cả sub 2 options
  const allSub2Options = [
    { label: 'Tất cả', value: '' },
    // Chuyển nhượng trong KCN
    { label: 'Chuyển nhượng đất trong KCN', value: 'chuyen-nhuong-trong-kcn' },
    { label: 'Chuyển nhượng đất có NX trong KCN', value: 'chuyen-nhuong-co-nx-trong-kcn' },
    // Chuyển nhượng ngoài KCN
    { label: 'Chuyển nhượng đất trong CCN', value: 'chuyen-nhuong-trong-ccn' },
    { label: 'Chuyển nhượng đất có NX trong CCN', value: 'chuyen-nhuong-co-nx-trong-ccn' },
    { label: 'Chuyển nhượng đất ngoài KCN / CCN', value: 'chuyen-nhuong-ngoai-kcn-ccn' },
    { label: 'Chuyển nhượng đất có NX ngoài KCN / CCN', value: 'chuyen-nhuong-co-nx-ngoai-kcn-ccn' },
    // Cho thuê
    { label: 'Cho thuê NX trong KCN', value: 'cho-thue-nx-trong-kcn' },
    { label: 'Cho thuê NX trong CCN', value: 'cho-thue-nx-trong-ccn' },
    { label: 'Cho thuê NX ngoài KCN / CCN', value: 'cho-thue-nx-ngoai-kcn-ccn' },
    { label: 'Cho thuê đất trong KCN', value: 'cho-thue-dat-trong-kcn' },
    { label: 'Cho thuê đất trong CCN', value: 'cho-thue-dat-trong-ccn' },
    { label: 'Cho thuê đất ngoài KCN / CCN', value: 'cho-thue-dat-ngoai-kcn-ccn' },
  ]

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    if (value === '') {
      setFilters(prev => ({ ...prev, scope: undefined, nx: undefined, type: undefined, category: undefined }))
      window.history.pushState({}, '', '/kcn')
    } else if (value.startsWith('chuyen-nhuong-trong-kcn')) {
      const nx = value.includes('co-nx') ? 'co' : undefined
      setFilters(prev => ({ ...prev, scope: 'trong-kcn', nx, type: undefined, category: undefined }))
      window.history.pushState({}, '', nx ? '/kcn?scope=trong-kcn&nx=co' : '/kcn?scope=trong-kcn')
    } else if (value.startsWith('chuyen-nhuong-trong-ccn')) {
      const nx = value.includes('co-nx') ? 'co' : undefined
      setFilters(prev => ({ ...prev, scope: 'trong-ccn', nx, type: undefined, category: undefined }))
      window.history.pushState({}, '', nx ? '/kcn?scope=trong-ccn&nx=co' : '/kcn?scope=trong-ccn')
    } else if (value.startsWith('chuyen-nhuong-ngoai-kcn-ccn')) {
      const nx = value.includes('co-nx') ? 'co' : undefined
      setFilters(prev => ({ ...prev, scope: 'ngoai-kcn-ccn', nx, type: undefined, category: undefined }))
      window.history.pushState({}, '', nx ? '/kcn?scope=ngoai-kcn-ccn&nx=co' : '/kcn?scope=ngoai-kcn-ccn')
    } else if (value.startsWith('cho-thue-nx-trong-kcn')) {
      setFilters(prev => ({ ...prev, scope: 'trong-kcn', category: 'nha-xuong', type: 'cho-thue', nx: undefined }))
      window.history.pushState({}, '', '/kcn?type=cho-thue&scope=trong-kcn&category=nha-xuong')
    } else if (value.startsWith('cho-thue-nx-trong-ccn')) {
      setFilters(prev => ({ ...prev, scope: 'trong-ccn', category: 'nha-xuong', type: 'cho-thue', nx: undefined }))
      window.history.pushState({}, '', '/kcn?type=cho-thue&scope=trong-ccn&category=nha-xuong')
    } else if (value.startsWith('cho-thue-nx-ngoai-kcn-ccn')) {
      setFilters(prev => ({ ...prev, scope: 'ngoai-kcn-ccn', category: 'nha-xuong', type: 'cho-thue', nx: undefined }))
      window.history.pushState({}, '', '/kcn?type=cho-thue&scope=ngoai-kcn-ccn&category=nha-xuong')
    } else if (value.startsWith('cho-thue-dat-trong-kcn')) {
      setFilters(prev => ({ ...prev, scope: 'trong-kcn', category: 'dat', type: 'cho-thue', nx: undefined }))
      window.history.pushState({}, '', '/kcn?type=cho-thue&scope=trong-kcn&category=dat')
    } else if (value.startsWith('cho-thue-dat-trong-ccn')) {
      setFilters(prev => ({ ...prev, scope: 'trong-ccn', category: 'dat', type: 'cho-thue', nx: undefined }))
      window.history.pushState({}, '', '/kcn?type=cho-thue&scope=trong-ccn&category=dat')
    } else if (value.startsWith('cho-thue-dat-ngoai-kcn-ccn')) {
      setFilters(prev => ({ ...prev, scope: 'ngoai-kcn-ccn', category: 'dat', type: 'cho-thue', nx: undefined }))
      window.history.pushState({}, '', '/kcn?type=cho-thue&scope=ngoai-kcn-ccn&category=dat')
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2E8C4F]">Khu công nghiệp</h1>
              <p className="text-lg md:text-xl text-[#2E8C4F]">
                Tìm kiếm khu công nghiệp phù hợp cho doanh nghiệp của bạn
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Filter Dropdown */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl shadow-md border border-gray-300 p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-[#2E8C4F] whitespace-nowrap">
                Loại bất động sản:
              </label>
              <div className="flex-1 max-w-md">
                <ProductFilterDropdown
                  label="Chọn loại"
                  options={allSub2Options}
                  value={categoryFilter}
                  onChange={handleCategoryChange}
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
          <IndustrialParkFilterBar onChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))} />
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
              Tìm thấy <span className="font-semibold text-[#2E8C4F]">{sortedParks.length}</span> khu công nghiệp
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 bg-white text-[#2E8C4F] rounded-lg text-sm focus:outline-none focus:border-goldDark"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thuê thấp → cao</option>
                <option value="price-desc">Giá thuê cao → thấp</option>
                <option value="area-desc">Diện tích lớn → nhỏ</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Industrial Parks Grid */}
        {sortedParks.length === 0 ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="text-[#2E8C4F] mb-4">
              <SlidersHorizontal className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-[#2E8C4F] mb-2">Không tìm thấy kết quả</h3>
            <p className="text-[#2E8C4F]">Vui lòng thử điều chỉnh bộ lọc để xem nhiều khu công nghiệp hơn.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedParks.map(park => (
              <IndustrialParkCard key={park.id} park={park} />
            ))}
          </div>
        )}

        {/* Load More Button (for future pagination) */}
        {sortedParks.length > 0 && sortedParks.length >= 12 && (
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-goldDark text-white font-semibold rounded-lg hover:bg-goldDark/90 transition-colors">
              Xem thêm khu công nghiệp
            </button>
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 rounded-2xl bg-white border border-gray-300 text-[#2E8C4F] text-center p-8 md:p-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#2E8C4F]">Cần tư vấn về khu công nghiệp?</h2>
          <p className="text-lg text-[#2E8C4F] mb-6">
            Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn tìm kiếm khu công nghiệp phù hợp nhất
          </p>
          <a
            href="/lien-he"
            className="inline-block px-8 py-3 bg-goldDark text-white font-semibold rounded-lg hover:bg-goldDark/90 transition-colors"
          >
            Liên hệ tư vấn
          </a>
        </motion.div>
      </div>
    </div>
  )
}

export default function IndustrialParksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center"><div className="text-[#2E8C4F]">Loading...</div></div>}>
      <IndustrialParksPageContent />
    </Suspense>
  )
}
