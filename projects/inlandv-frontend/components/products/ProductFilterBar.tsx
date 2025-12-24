"use client"

import { useMemo, useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import ProductFilterDropdown from './ProductFilterDropdown'
import DualThumbPriceSlider from './DualThumbPriceSlider'
import MultiSelectDropdown from './MultiSelectDropdown'
import { api } from '@/lib/api'
import { getProvinces, getWardsByProvince, type Province, type Ward } from '@/lib/provinces-api'

const tpHcmDistricts = ['Quận 1','Quận 2','Quận 3','Quận 4','Quận 5','Quận 6','Quận 7','Quận 8','Quận 9','Quận 10','Quận 11','Quận 12','Bình Thạnh','Gò Vấp','Phú Nhuận','Tân Bình','Tân Phú','Thủ Đức','Bình Tân']

export type ProductFilters = {
  q: string
  type?: string
  provinces: string[]
  wards: string[]
  price: [number, number]
  area: [number, number]
}

type Option = { label:string; value:string }

export default function ProductFilterBar({
  defaultType,
  onChange,
  typeOptions: typeOptionsProp,
  priceConfig,
  initialQ = '',
}:{
  defaultType?: string
  onChange: (filters: ProductFilters)=>void
  typeOptions?: Option[]
  priceConfig?: { min:number; max:number; step:number }
  initialQ?: string
}){
  const [filters, setFilters] = useState<ProductFilters>({ q: initialQ, type: defaultType, provinces: [], wards: [], price:[priceConfig?.min ?? 0, priceConfig?.max ?? 1000000000], area:[0, 100000] })
  
  // State for loading data from APIs
  const [typeOptions, setTypeOptions] = useState<Option[]>(typeOptionsProp ?? [])
  const [provinceOptions, setProvinceOptions] = useState<Option[]>([])
  const [wardOptions, setWardOptions] = useState<Option[]>([])
  const [loadingTypes, setLoadingTypes] = useState(false)
  const [loadingProvinces, setLoadingProvinces] = useState(false)

  // Load property types from database
  useEffect(() => {
    if (typeOptionsProp) return // Use provided options if available
    
    const loadTypes = async () => {
      try {
        setLoadingTypes(true)
        const response = await api.getPropertyTypes()
        if (response.success && response.data) {
          const options = response.data.map(item => ({
            label: item.label,
            value: item.value,
          }))
          setTypeOptions(options)
        }
      } catch (err) {
        console.error('Error loading property types:', err)
        // Fallback to default options
        setTypeOptions([
          { label:'Nhà phố', value:'nha-pho' },
          { label:'Căn hộ', value:'can-ho' },
          { label:'Đất nền', value:'dat-nen' },
          { label:'Biệt thự', value:'biet-thu' },
          { label:'Shophouse', value:'shophouse' },
          { label:'Nhà xưởng', value:'nha-xuong' },
        ])
      } finally {
        setLoadingTypes(false)
      }
    }
    
    loadTypes()
  }, [typeOptionsProp])

  // Load provinces from API
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true)
        const provinces = await getProvinces()
        const options = provinces.map(p => ({
          label: p.name,
          value: p.code.toString(), // Use code as value for API lookup
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

  const emit = (next: Partial<ProductFilters>) => {
    const merged = { ...filters, ...next }
    setFilters(merged)
    onChange(merged)
  }

  const priceButtons: Array<{label:string;range:[number,number]}> = [
    { label:'Dưới 60 triệu', range:[0, 60000000] },
    { label:'60–100 triệu', range:[60000000, 100000000] },
    { label:'100–200 triệu', range:[100000000, 200000000] },
    { label:'200–500 triệu', range:[200000000, 500000000] },
    { label:'500–1 tỷ', range:[500000000, 1000000000] },
    { label:'Trên 1 tỷ', range:[1000000000, 5000000000] },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6">
      <div className="text-sm font-semibold text-gray-900 mb-2">Tìm kiếm</div>
      {/* Row 1: Search + selects in one line */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 md:gap-4 mt-2">
        <div className="lg:col-span-2 relative">
          <input
            value={filters.q}
            onChange={(e)=>emit({ q: e.target.value })}
            placeholder="Nhập từ khóa tìm kiếm"
            className="w-full h-12 md:h-14 px-4 md:px-5 pr-12 rounded-xl border border-gray-200 focus:border-goldDark outline-none text-gray-900 placeholder:text-gray-400"
          />
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-goldDark" />
        </div>
        <ProductFilterDropdown label="Loại hình" options={typeOptions} value={filters.type} onChange={(v)=>emit({ type:v })} />
        <MultiSelectDropdown showLabel={false} display="summary" label="Tỉnh/Thành" options={provinceOptions} values={filters.provinces} onChange={(vals)=>emit({ provinces: vals, wards: [] })} />
        <div className="lg:col-span-2">
          <MultiSelectDropdown showLabel={false} display="summary" label="Xã/Phường" options={wardOptions} values={filters.wards} onChange={(vals)=>emit({ wards: vals })} disabled={filters.provinces.length === 0} />
        </div>
      </div>

      {/* Row 2: Sliders in same line (two halves) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-3">
        <div>
          <div className="text-sm text-gray-500 mb-1">Khoảng giá</div>
          <DualThumbPriceSlider min={priceConfig?.min ?? 0} max={priceConfig?.max ?? 1000000000} step={priceConfig?.step ?? 1000000} value={filters.price} onChange={(v)=>emit({ price:v })} />
        </div>
        <div>
          <div className="text-sm text-gray-500 mb-1">Diện tích (m²)</div>
          <DualThumbPriceSlider min={0} max={100000} step={10} value={filters.area} onChange={(v)=>emit({ area:v })} formatter={(n)=> `${n.toLocaleString('vi-VN')} m²`} />
        </div>
      </div>

      {/* Price quick ranges */}
      {/* Optional quick ranges retained (can be removed if not needed) */}
      <div className="flex flex-wrap gap-2 mt-3">
        {priceButtons.map((b)=> (
          <button key={b.label} onClick={()=>emit({ price:b.range })} className="px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-50 border border-gray-200 hover:border-goldDark/50 hover:bg-goldLight/10 text-gray-800">
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}
