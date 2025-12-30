"use client"

import { useState } from 'react'
import ProductCategorySidebar from '@/components/products/ProductCategorySidebar'
import ProductFilterBar, { type ProductFilters } from '@/components/products/ProductFilterBar'
import ProductGrid from '@/components/products/ProductGrid'

export default function ProductsPage(){
  const [filters, setFilters] = useState<ProductFilters>({ q: '', type: undefined, locationTypes: [], provinces: [], wards: [], price: [0, 1000000000], area: [0, 100000] })

  return (
    <div className="min-h-screen bg-[#151313]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-6">Danh mục sản phẩm</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <ProductCategorySidebar active={filters.type} onChange={(key)=> setFilters(prev=>({ ...prev, type:key }))} />
          </div>
          <div className="lg:col-span-9">
            <ProductFilterBar defaultType={filters.type} onChange={(f)=> setFilters(f)} />
            <ProductGrid filters={filters} />
          </div>
        </div>
      </div>
    </div>
  )
}
