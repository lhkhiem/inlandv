"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import IndustrialParkFilterBar from '@/components/products/IndustrialParkFilterBar'
import IndustrialParkGrid, { type IndustrialParkFilters } from '@/components/products/IndustrialParkGrid'
import { IndustrialParkFilter } from '@/lib/types'

function ChuyenNhuongNgoaiKCNPageContent() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  const scopeParam = searchParams.get('scope') as 'trong-ccn' | 'ngoai-kcn-ccn' | null
  const nxParam = searchParams.get('nx')
  
  // Determine title based on URL params
  const getTitle = () => {
    if (scopeParam === 'trong-ccn') {
      return nxParam === 'co' 
        ? 'Chuyển nhượng đất có NX trong CCN'
        : 'Chuyển nhượng đất trong CCN'
    } else if (scopeParam === 'ngoai-kcn-ccn') {
      return nxParam === 'co'
        ? 'Chuyển nhượng đất có NX ngoài KCN / CCN'
        : 'Chuyển nhượng đất ngoài KCN / CCN'
    }
    return 'Chuyển nhượng đất ngoài KCN'
  }

  const getDescription = () => {
    if (scopeParam === 'trong-ccn') {
      return nxParam === 'co'
        ? 'Tìm kiếm đất có nhà xưởng chuyển nhượng trong cụm công nghiệp phù hợp'
        : 'Tìm kiếm đất chuyển nhượng trong cụm công nghiệp phù hợp'
    } else if (scopeParam === 'ngoai-kcn-ccn') {
      return nxParam === 'co'
        ? 'Tìm kiếm đất có nhà xưởng chuyển nhượng ngoài khu công nghiệp và cụm công nghiệp phù hợp'
        : 'Tìm kiếm đất chuyển nhượng ngoài khu công nghiệp và cụm công nghiệp phù hợp'
    }
    return 'Tìm kiếm đất chuyển nhượng ngoài khu công nghiệp phù hợp'
  }
  
  // Determine scope from URL params
  const getScope = (): 'trong-ccn' | 'ngoai-kcn-ccn' | undefined => {
    if (scopeParam === 'trong-ccn') {
      return 'trong-ccn'
    } else if (scopeParam === 'ngoai-kcn-ccn') {
      return 'ngoai-kcn-ccn'
    }
    // Default to ngoai-kcn-ccn if no scope param
    return 'ngoai-kcn-ccn'
  }

  const [filters, setFilters] = useState<IndustrialParkFilters>({
    q: initialQ,
    scope: getScope(), // Filter based on URL params
    has_transfer: true, // Filter for chuyen-nhuong
    has_factory: nxParam === 'co', // Filter for has factory if nx=co
  })

  // Update filters when URL params change
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const nx = searchParams.get('nx')
    const scope = getScope()
    setFilters(prev => ({ 
      ...prev, 
      q,
      scope, // Filter based on URL params
      has_transfer: true, // Always filter for chuyen-nhuong on this page
      has_factory: nx === 'co', // Filter for has factory if nx=co
    }))
  }, [searchParams])

  // Get current title and description
  const title = getTitle()
  const description = getDescription()

  // Handle filter changes from IndustrialParkFilterBar
  const handleFilterChange = (newFilters: IndustrialParkFilter) => {
    const scope = getScope()
    setFilters({
      q: newFilters.q || '',
      scope, // Preserve scope from URL params
      has_transfer: true, // Always filter for chuyen-nhuong on this page
      has_factory: nxParam === 'co', // Filter for has factory if nx=co
      province: newFilters.province,
      district: newFilters.district,
      rental_price_min: newFilters.rental_price_min,
      rental_price_max: newFilters.rental_price_max,
      available_area_min: newFilters.available_area_min,
      available_area_max: newFilters.available_area_max,
    })
  }

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
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2E8C4F]">{title}</h1>
              <p className="text-lg md:text-xl text-[#2E8C4F]">
                {description}
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
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <IndustrialParkFilterBar
            onChange={handleFilterChange}
          />
        </motion.div>

        {/* Results Grid */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <IndustrialParkGrid
            filters={filters}
            pageSize={12}
          />
        </motion.div>
      </div>
    </div>
  )
}

export default function ChuyenNhuongNgoaiKCNPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center"><div className="text-[#2E8C4F]">Loading...</div></div>}>
      <ChuyenNhuongNgoaiKCNPageContent />
    </Suspense>
  )
}

