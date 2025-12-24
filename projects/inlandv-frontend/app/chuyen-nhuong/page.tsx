"use client"

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductFilterBar, { type ProductFilters } from '@/components/products/ProductFilterBar'
import ProductGrid from '@/components/products/ProductGrid'

function ChuyenNhuongPageContent(){
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  const [filters, setFilters] = useState<ProductFilters>({ q: initialQ, type: undefined, provinces: [], wards: [], price: [0, 500_000_000_000], area: [0, 100000] })

  return (
    <div className="min-h-screen bg-[#151313]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-6">Chuyển nhượng</h1>
        <div className="space-y-6">
          <ProductFilterBar
            defaultType={filters.type}
            onChange={(f)=> setFilters(f)}
            initialQ={initialQ}
            priceConfig={{ min: 0, max: 500_000_000_000, step: 100_000_000 }}
          />
          <ProductGrid filters={filters} transactionType="chuyen-nhuong" />
        </div>
      </div>
    </div>
  )
}

export default function ChuyenNhuongPage(){
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#151313] flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <ChuyenNhuongPageContent />
    </Suspense>
  )
}

