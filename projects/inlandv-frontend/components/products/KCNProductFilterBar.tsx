"use client"

import { useMemo, useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import ProductFilterDropdown from './ProductFilterDropdown'
import DualThumbPriceSlider from './DualThumbPriceSlider'
import MultiSelectDropdown from './MultiSelectDropdown'
import { getProvinces, getWardsByProvince, type Province, type Ward } from '@/lib/provinces-api'

export type KCNProductFilters = {
  q: string
  scope?: 'trong-kcn' | 'trong-ccn' | 'ngoai-kcn-ccn'
  category?: 'nha-xuong' | 'dat'
  nx?: 'co' | 'khong'
  provinces: string[]
  wards: string[]
  price: [number, number]
  area: [number, number]
}

type Option = { label: string; value: string }

export default function KCNProductFilterBar({
  mode, // 'chuyen-nhuong' | 'cho-thue'
  defaultScope,
  defaultCategory,
  defaultNx,
  onChange,
  priceConfig,
  initialQ = '',
}: {
  mode: 'chuyen-nhuong' | 'cho-thue'
  defaultScope?: 'trong-kcn' | 'trong-ccn' | 'ngoai-kcn-ccn'
  defaultCategory?: 'nha-xuong' | 'dat'
  defaultNx?: 'co' | 'khong'
  onChange: (filters: KCNProductFilters) => void
  priceConfig?: { min: number; max: number; step: number }
  initialQ?: string
}) {
  const defaultPriceMax = mode === 'cho-thue' ? 10_000_000_000 : 500_000_000_000
  const defaultPriceStep = mode === 'cho-thue' ? 5_000_000 : 100_000_000
  
  const [filters, setFilters] = useState<KCNProductFilters>({
    q: initialQ,
    scope: defaultScope,
    category: defaultCategory,
    nx: defaultNx,
    provinces: [],
    wards: [],
    price: [priceConfig?.min ?? 0, priceConfig?.max ?? defaultPriceMax],
    area: [0, 100000],
  })

  // State for loading data from APIs
  const [provinceOptions, setProvinceOptions] = useState<Option[]>([])
  const [wardOptions, setWardOptions] = useState<Option[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)

  // Load provinces from API
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true)
        const provinces = await getProvinces()
        const options = provinces.map(p => ({
          label: p.name,
          value: p.code.toString(),
        }))
        setProvinceOptions(options)
      } catch (err) {
        console.error('Error loading provinces:', err)
        setProvinceOptions([])
      } finally {
        setLoadingProvinces(false)
      }
    }

    loadProvinces()
  }, [])

  // Load wards when provinces are selected
  useEffect(() => {
    const loadWards = async () => {
      if (filters.provinces.length === 0) {
        setWardOptions([])
        return
      }

      try {
        const allWards: Ward[] = []
        for (const provinceCode of filters.provinces) {
          const code = parseInt(provinceCode)
          if (!isNaN(code)) {
            const wards = await getWardsByProvince(code)
            allWards.push(...wards)
          }
        }

        // Remove duplicates and create options
        const uniqueWards = Array.from(
          new Map(allWards.map(w => [w.code, w])).values()
        )
        const options = uniqueWards.map(w => ({
          label: w.name,
          value: w.code.toString(),
        }))
        setWardOptions(options)
      } catch (err) {
        console.error('Error loading wards:', err)
        setWardOptions([])
      }
    }

    loadWards()
  }, [filters.provinces])

  const emit = (next: Partial<KCNProductFilters>) => {
    const merged = { ...filters, ...next }
    setFilters(merged)
    onChange(merged)
  }

  // Scope options
  const scopeOptions: Option[] = [
    { label: 'Tất cả', value: '' },
    { label: 'Trong KCN', value: 'trong-kcn' },
    { label: 'Trong CCN', value: 'trong-ccn' },
    { label: 'Ngoài KCN / CCN', value: 'ngoai-kcn-ccn' },
  ]

  // Category options (only for cho-thue)
  const categoryOptions: Option[] = [
    { label: 'Tất cả', value: '' },
    { label: 'Nhà xưởng', value: 'nha-xuong' },
    { label: 'Đất', value: 'dat' },
  ]

  // NX options (only for chuyen-nhuong)
  const nxOptions: Option[] = [
    { label: 'Tất cả', value: '' },
    { label: 'Có nhà xưởng', value: 'co' },
    { label: 'Không có nhà xưởng', value: 'khong' },
  ]

  // Price quick buttons based on mode
  const priceButtons: Array<{ label: string; range: [number, number] }> = mode === 'cho-thue' ? [
    { label: 'Dưới 30 triệu', range: [0, 30_000_000] },
    { label: '30–100 triệu', range: [30_000_000, 100_000_000] },
    { label: '100–500 triệu', range: [100_000_000, 500_000_000] },
    { label: 'Trên 500 triệu', range: [500_000_000, 10_000_000_000] },
  ] : [
    { label: 'Dưới 10 tỷ', range: [0, 10_000_000_000] },
    { label: '10–50 tỷ', range: [10_000_000_000, 50_000_000_000] },
    { label: '50–200 tỷ', range: [50_000_000_000, 200_000_000_000] },
    { label: 'Trên 200 tỷ', range: [200_000_000_000, 500_000_000_000] },
  ]

  const formatPrice = (n: number) => {
    if (mode === 'chuyen-nhuong') {
      return `${(n / 1_000_000_000).toFixed(1)} tỷ`
    }
    return `${n.toLocaleString('vi-VN')} đ`
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6">
      <div className="text-sm font-semibold text-gray-900 mb-2">Tìm kiếm</div>
      
      {/* Row 1: Search + Scope/Category/NX + Location */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 md:gap-4 mt-2">
        <div className="lg:col-span-2 relative">
          <input
            value={filters.q}
            onChange={(e) => emit({ q: e.target.value })}
            placeholder="Nhập từ khóa tìm kiếm"
            className="w-full h-12 md:h-14 px-4 md:px-5 pr-12 rounded-xl border border-gray-200 focus:border-goldDark outline-none text-gray-900 placeholder:text-gray-400"
          />
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-goldDark" />
        </div>
        
        {/* Scope filter */}
        <ProductFilterDropdown
          label="Phạm vi"
          options={scopeOptions}
          value={filters.scope || ''}
          onChange={(v) => emit({ scope: v as any || undefined })}
        />
        
        {/* Category (cho-thue) or NX (chuyen-nhuong) */}
        {mode === 'cho-thue' ? (
          <ProductFilterDropdown
            label="Loại"
            options={categoryOptions}
            value={filters.category || ''}
            onChange={(v) => emit({ category: v as any || undefined })}
          />
        ) : (
          <ProductFilterDropdown
            label="Nhà xưởng"
            options={nxOptions}
            value={filters.nx || ''}
            onChange={(v) => emit({ nx: v as any || undefined })}
          />
        )}
        
        <MultiSelectDropdown
          showLabel={false}
          display="summary"
          label="Tỉnh/Thành"
          options={provinceOptions}
          values={filters.provinces}
          onChange={(vals) => emit({ provinces: vals, wards: [] })}
        />
        <div className="lg:col-span-2">
          <MultiSelectDropdown
            showLabel={false}
            display="summary"
            label="Xã/Phường"
            options={wardOptions}
            values={filters.wards}
            onChange={(vals) => emit({ wards: vals })}
            disabled={filters.provinces.length === 0}
          />
        </div>
      </div>

      {/* Row 2: Sliders in same line (two halves) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-3">
        <div>
          <div className="text-sm text-gray-500 mb-1">
            {mode === 'cho-thue' ? 'Giá thuê/tháng' : 'Giá chuyển nhượng'}
          </div>
          <DualThumbPriceSlider
            min={priceConfig?.min ?? 0}
            max={priceConfig?.max ?? defaultPriceMax}
            step={priceConfig?.step ?? defaultPriceStep}
            value={filters.price}
            onChange={(v) => emit({ price: v })}
            formatter={formatPrice}
            showQuickPresets={false}
          />
        </div>
        <div>
          <div className="text-sm text-gray-500 mb-1">Diện tích (m²)</div>
          <DualThumbPriceSlider
            min={0}
            max={100000}
            step={10}
            value={filters.area}
            onChange={(v) => emit({ area: v })}
            formatter={(n) => `${n.toLocaleString('vi-VN')} m²`}
            showQuickPresets={false}
          />
        </div>
      </div>

      {/* Price quick ranges */}
      <div className="flex flex-wrap gap-2 mt-3">
        {priceButtons.map((b) => (
          <button
            key={b.label}
            onClick={() => emit({ price: b.range })}
            className="px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-50 border border-gray-200 hover:border-goldDark/50 hover:bg-goldLight/10 text-gray-800"
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}

