"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import IndustrialParkFilterBar from '@/components/products/IndustrialParkFilterBar'
import IndustrialParkGrid, { type IndustrialParkFilters } from '@/components/products/IndustrialParkGrid'
import { IndustrialParkFilter } from '@/lib/types'

function ChoThuePageContent() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  const scopeParam = searchParams.get('scope') as 'trong-kcn' | 'trong-ccn' | 'ngoai-kcn-ccn' | null
  const categoryParam = searchParams.get('category') as 'nha-xuong' | 'dat' | null
  
  // Determine title based on URL params
  const getTitle = () => {
    if (scopeParam === 'trong-kcn' && categoryParam === 'nha-xuong') {
      return 'Cho thuê NX trong KCN'
    } else if (scopeParam === 'trong-ccn' && categoryParam === 'nha-xuong') {
      return 'Cho thuê NX trong CCN'
    } else if (scopeParam === 'ngoai-kcn-ccn' && categoryParam === 'nha-xuong') {
      return 'Cho thuê NX ngoài KCN / CCN'
    } else if (scopeParam === 'trong-kcn' && categoryParam === 'dat') {
      return 'Cho thuê đất trong KCN'
    } else if (scopeParam === 'trong-ccn' && categoryParam === 'dat') {
      return 'Cho thuê đất trong CCN'
    } else if (scopeParam === 'ngoai-kcn-ccn' && categoryParam === 'dat') {
      return 'Cho thuê đất ngoài KCN / CCN'
    }
    return 'Cho Thuê'
  }

  const getDescription = () => {
    if (scopeParam === 'trong-kcn' && categoryParam === 'nha-xuong') {
      return 'Tìm kiếm nhà xưởng cho thuê trong khu công nghiệp phù hợp'
    } else if (scopeParam === 'trong-ccn' && categoryParam === 'nha-xuong') {
      return 'Tìm kiếm nhà xưởng cho thuê trong cụm công nghiệp phù hợp'
    } else if (scopeParam === 'ngoai-kcn-ccn' && categoryParam === 'nha-xuong') {
      return 'Tìm kiếm nhà xưởng cho thuê ngoài khu công nghiệp và cụm công nghiệp phù hợp'
    } else if (scopeParam === 'trong-kcn' && categoryParam === 'dat') {
      return 'Tìm kiếm đất cho thuê trong khu công nghiệp phù hợp'
    } else if (scopeParam === 'trong-ccn' && categoryParam === 'dat') {
      return 'Tìm kiếm đất cho thuê trong cụm công nghiệp phù hợp'
    } else if (scopeParam === 'ngoai-kcn-ccn' && categoryParam === 'dat') {
      return 'Tìm kiếm đất cho thuê ngoài khu công nghiệp và cụm công nghiệp phù hợp'
    }
    return 'Tìm kiếm nhà xưởng và đất cho thuê phù hợp'
  }
  
  // Determine scope from URL params
  const getScope = (): 'trong-kcn' | 'trong-ccn' | 'ngoai-kcn-ccn' | undefined => {
    if (scopeParam === 'trong-kcn') {
      return 'trong-kcn'
    } else if (scopeParam === 'trong-ccn') {
      return 'trong-ccn'
    } else if (scopeParam === 'ngoai-kcn-ccn') {
      return 'ngoai-kcn-ccn'
    }
    return undefined
  }

  const initialScope = getScope()

  const [filters, setFilters] = useState<IndustrialParkFilters>({
    q: initialQ,
    scope: initialScope,
    has_rental: true, // Filter for cho-thue
  })

  // Update filters when URL params change
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const scope = getScope()
    setFilters(prev => ({ 
      ...prev, 
      q,
      scope, // Set scope based on URL params
      has_rental: true, // Always filter for cho-thue on this page
    }))
  }, [searchParams, scopeParam])

  // Get current title and description
  const title = getTitle()
  const description = getDescription()

  // Handle filter changes from IndustrialParkFilterBar
  const handleFilterChange = (newFilters: IndustrialParkFilter) => {
    const scope = getScope()
    setFilters({
      q: newFilters.q || '',
      scope, // Preserve scope from URL params
      has_rental: true, // Always filter for cho-thue on this page
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

export default function ChoThuePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5] pt-20 flex items-center justify-center"><div className="text-[#2E8C4F]">Loading...</div></div>}>
      <ChoThuePageContent />
    </Suspense>
  )
}

