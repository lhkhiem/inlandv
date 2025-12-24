"use client"

import { useMemo, useState, useEffect } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import ProductFilterDropdown from './ProductFilterDropdown'
import DualThumbPriceSlider from './DualThumbPriceSlider'
import MultiSelectDropdown from './MultiSelectDropdown'
import { provinces as vnProvinces, wardsByProvince } from '@/lib/vietnam'
import { PropertyFilter } from '@/lib/types'

type Option = { label: string; value: string }

export default function PropertyFilterBar({
  defaultType,
  onChange,
}: {
  defaultType?: string
  onChange: (filters: PropertyFilter) => void
}) {
  const [filters, setFilters] = useState<PropertyFilter>({
    q: '',
    demand: undefined,
    type: defaultType,
    province: undefined,
    district: undefined,
    price_min: 0,
    price_max: 50000000000,
    area_min: 0,
    area_max: 1000,
    legal_status: undefined,
    bedrooms: undefined,
    orientation: undefined,
    furniture: undefined,
    amenities: [],
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const emit = (next: Partial<PropertyFilter>) => {
    const merged = { ...filters, ...next }
    setFilters(merged)
    onChange(merged)
  }

  // Reset price range when demand changes
  useEffect(() => {
    if (filters.demand === 'rent') {
      // Reset to rent range if current max exceeds rent max
      if ((filters.price_max || 50000000000) > 100000000) {
        emit({ price_min: 0, price_max: 100000000 })
      }
    } else if (filters.demand === 'buy') {
      // Reset to buy range if current max is too low
      if ((filters.price_max || 0) < 1000000000) {
        emit({ price_min: 0, price_max: 50000000000 })
      }
    }
  }, [filters.demand])

  // Options
  const demandOptions: Option[] = [
    { label: 'Thuê', value: 'rent' },
    { label: 'Mua sở hữu', value: 'buy' },
  ]

  const typeOptions: Option[] = [
    { label: 'Nhà phố', value: 'nha-pho' },
    { label: 'Căn hộ', value: 'can-ho' },
    { label: 'Biệt thự', value: 'biet-thu' },
    { label: 'Đất nền', value: 'dat-nen' },
    { label: 'Shophouse', value: 'shophouse' },
    { label: 'Nhà xưởng', value: 'nha-xuong' },
  ]

  const legalStatusOptions: Option[] = [
    { label: 'Sổ hồng riêng', value: 'so-hong-rieng' },
    { label: 'Sổ đỏ', value: 'so-do' },
    { label: 'Đang làm sổ', value: 'dang-lam-so' },
    { label: 'Giấy tờ hợp lệ', value: 'hop-le' },
  ]

  const orientationOptions: Option[] = [
    { label: 'Đông', value: 'dong' },
    { label: 'Tây', value: 'tay' },
    { label: 'Nam', value: 'nam' },
    { label: 'Bắc', value: 'bac' },
    { label: 'Đông Nam', value: 'dong-nam' },
    { label: 'Đông Bắc', value: 'dong-bac' },
    { label: 'Tây Nam', value: 'tay-nam' },
    { label: 'Tây Bắc', value: 'tay-bac' },
  ]

  const furnitureOptions: Option[] = [
    { label: 'Đầy đủ', value: 'full' },
    { label: 'Cơ bản', value: 'basic' },
    { label: 'Không nội thất', value: 'empty' },
  ]

  const bedroomOptions: Option[] = [
    { label: '1 PN', value: '1' },
    { label: '2 PN', value: '2' },
    { label: '3 PN', value: '3' },
    { label: '4+ PN', value: '4' },
  ]

  const amenityOptions: Option[] = [
    { label: 'Hồ bơi', value: 'ho-boi' },
    { label: 'Gym', value: 'gym' },
    { label: 'Công viên', value: 'cong-vien' },
    { label: 'Chỗ đậu xe', value: 'cho-dau-xe' },
    { label: 'An ninh 24/7', value: 'an-ninh-24-7' },
    { label: 'Thang máy', value: 'thang-may' },
    { label: 'Sân thượng', value: 'san-thuong' },
    { label: 'Ban công', value: 'ban-cong' },
    { label: 'Sân vườn', value: 'san-vuon' },
    { label: 'Gara ô tô', value: 'gara-oto' },
  ]

  const provinceOptions = useMemo(() => vnProvinces.map(p => ({ label: p, value: p })), [])
  const districtOptions = useMemo(() => {
    if (!filters.province) return []
    const districts = wardsByProvince[filters.province] || []
    return districts.map(d => ({ label: d, value: d }))
  }, [filters.province])

  // Price presets based on demand type
  const pricePresetsForRent: Array<{ label: string; min: number; max: number }> = [
    { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
    { label: '5-10 triệu', min: 5000000, max: 10000000 },
    { label: '10-20 triệu', min: 10000000, max: 20000000 },
    { label: 'Trên 20 triệu', min: 20000000, max: 100000000 },
  ]

  const pricePresetsForBuy: Array<{ label: string; min: number; max: number }> = [
    { label: 'Dưới 1 tỷ', min: 0, max: 1000000000 },
    { label: '1-3 tỷ', min: 1000000000, max: 3000000000 },
    { label: '3-5 tỷ', min: 3000000000, max: 5000000000 },
    { label: '5-10 tỷ', min: 5000000000, max: 10000000000 },
    { label: 'Trên 10 tỷ', min: 10000000000, max: 50000000000 },
  ]

  // Get price presets based on demand
  const pricePresets = filters.demand === 'rent' 
    ? pricePresetsForRent 
    : filters.demand === 'buy' 
    ? pricePresetsForBuy 
    : []

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-900">Tìm kiếm bất động sản</div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-goldDark hover:text-goldDark/80"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showAdvanced ? 'Ẩn bộ lọc' : 'Bộ lọc nâng cao'}
        </button>
      </div>

      {/* Row 1: Basic Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 mt-2">
        <div className="lg:col-span-3 relative">
          <input
            value={filters.q || ''}
            onChange={e => emit({ q: e.target.value })}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="w-full h-12 md:h-14 px-4 md:px-5 pr-12 rounded-xl border border-gray-200 focus:border-goldDark outline-none"
          />
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-goldDark" />
        </div>
        <div className="lg:col-span-2">
          <ProductFilterDropdown
            label="Nhu cầu"
            options={demandOptions}
            value={filters.demand || ''}
            onChange={v => emit({ demand: v || undefined })}
            isOpen={activeDropdown === 'demand'}
            onOpen={() => setActiveDropdown('demand')}
            onClose={() => setActiveDropdown(null)}
          />
        </div>
        <div className="lg:col-span-2">
          <ProductFilterDropdown
            label="Loại hình"
            options={typeOptions}
            value={filters.type || ''}
            onChange={v => emit({ type: v || undefined })}
            isOpen={activeDropdown === 'type'}
            onOpen={() => setActiveDropdown('type')}
            onClose={() => setActiveDropdown(null)}
          />
        </div>
        <div className="lg:col-span-2">
          <ProductFilterDropdown
            label="Tỉnh/Thành"
            options={provinceOptions}
            value={filters.province || ''}
            onChange={v => emit({ province: v || undefined, district: undefined })}
            isOpen={activeDropdown === 'province'}
            onOpen={() => setActiveDropdown('province')}
            onClose={() => setActiveDropdown(null)}
          />
        </div>
        <div className="lg:col-span-3">
          <ProductFilterDropdown
            label="Quận/Huyện"
            options={districtOptions}
            value={filters.district || ''}
            onChange={v => emit({ district: v || undefined })}
            isOpen={activeDropdown === 'district'}
            onOpen={() => setActiveDropdown('district')}
            onClose={() => setActiveDropdown(null)}
          />
        </div>
      </div>

      {/* Row 2: Price & Area Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-3">
        <div>
          <div className="text-sm text-gray-500 mb-1">
            {filters.demand === 'rent' ? 'Giá thuê' : filters.demand === 'buy' ? 'Giá mua' : 'Khoảng giá'}
          </div>
          <DualThumbPriceSlider
            min={0}
            max={filters.demand === 'rent' ? 100000000 : filters.demand === 'buy' ? 50000000000 : 50000000000}
            step={filters.demand === 'rent' ? 1000000 : 100000000}
            value={[
              filters.price_min || 0, 
              filters.price_max || (filters.demand === 'rent' ? 100000000 : 50000000000)
            ]}
            onChange={v => emit({ price_min: v[0], price_max: v[1] })}
            formatter={n => {
              if (filters.demand === 'rent') {
                return `${n.toLocaleString('vi-VN')} đ`
              }
              if (n >= 1000000000) {
                return `${(n / 1000000000).toFixed(1)} tỷ`
              }
              return `${(n / 1000000).toFixed(0)} triệu`
            }}
            minGap={filters.demand === 'rent' ? 1000000 : undefined}
            showQuickPresets={false}
          />
        </div>
        <div>
          <div className="text-sm text-gray-500 mb-1">Diện tích</div>
          <DualThumbPriceSlider
            min={0}
            max={1000}
            step={10}
            value={[filters.area_min || 0, filters.area_max || 1000]}
            onChange={v => emit({ area_min: v[0], area_max: v[1] })}
            formatter={n => `${n.toLocaleString('vi-VN')} m²`}
            showQuickPresets={false}
          />
        </div>
      </div>

      {/* Price Quick Presets - Only show when demand is selected */}
      {filters.demand && pricePresets.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-2">
            {filters.demand === 'rent' ? 'Giá thuê phổ biến:' : 'Giá mua phổ biến:'}
          </div>
          <div className="flex flex-wrap gap-2">
            {pricePresets.map(preset => {
              const isActive = filters.price_min === preset.min && filters.price_max === preset.max
              return (
                <button
                  key={preset.label}
                  onClick={() => emit({ price_min: preset.min, price_max: preset.max })}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isActive
                      ? 'bg-white border-[#2E8C4F] text-[#2E8C4F]'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                  style={{
                    color: isActive ? '#2E8C4F' : '#4B5563'
                  }}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <ProductFilterDropdown
              label="Pháp lý"
              options={legalStatusOptions}
              value={filters.legal_status || ''}
              onChange={v => emit({ legal_status: v || undefined })}
              isOpen={activeDropdown === 'legal'}
              onOpen={() => setActiveDropdown('legal')}
              onClose={() => setActiveDropdown(null)}
            />
            <ProductFilterDropdown
              label="Số phòng ngủ"
              options={bedroomOptions}
              value={filters.bedrooms?.toString() || ''}
              onChange={v => emit({ bedrooms: v ? parseInt(v) : undefined })}
              isOpen={activeDropdown === 'bedrooms'}
              onOpen={() => setActiveDropdown('bedrooms')}
              onClose={() => setActiveDropdown(null)}
            />
            <ProductFilterDropdown
              label="Hướng nhà"
              options={orientationOptions}
              value={filters.orientation || ''}
              onChange={v => emit({ orientation: v || undefined })}
              isOpen={activeDropdown === 'orientation'}
              onOpen={() => setActiveDropdown('orientation')}
              onClose={() => setActiveDropdown(null)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-3">
            <ProductFilterDropdown
              label="Nội thất"
              options={furnitureOptions}
              value={filters.furniture || ''}
              onChange={v => emit({ furniture: v || undefined })}
              isOpen={activeDropdown === 'furniture'}
              onOpen={() => setActiveDropdown('furniture')}
              onClose={() => setActiveDropdown(null)}
            />
            <MultiSelectDropdown
              label="Tiện ích"
              options={amenityOptions}
              values={filters.amenities || []}
              onChange={vals => emit({ amenities: vals })}
              display="summary"
              showLabel={false}
              isOpen={activeDropdown === 'amenities'}
              onOpen={() => setActiveDropdown('amenities')}
              onClose={() => setActiveDropdown(null)}
            />
          </div>

          {/* Reset Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                const reset: PropertyFilter = {
                  q: '',
                  type: undefined,
                  province: undefined,
                  district: undefined,
                  price_min: 0,
                  price_max: 50000000000,
                  area_min: 0,
                  area_max: 1000,
                  legal_status: undefined,
                  bedrooms: undefined,
                  orientation: undefined,
                  furniture: undefined,
                  amenities: [],
                }
                setFilters(reset)
                onChange(reset)
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:border-goldDark/50 transition-colors"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
