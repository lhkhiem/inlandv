"use client"

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import ProductFilterDropdown from './ProductFilterDropdown'
import DualThumbPriceSlider from './DualThumbPriceSlider'
import MultiSelectDropdown from './MultiSelectDropdown'
import { provinces as vnProvinces, wardsByProvince } from '@/lib/vietnam'
import { IndustrialParkFilter } from '@/lib/types'

type Option = { label: string; value: string }

type FilterMode = 'cho-thue' | 'chuyen-nhuong' | 'default'

export default function IndustrialParkFilterBar({
  onChange,
  mode = 'default',
}: {
  onChange: (filters: IndustrialParkFilter) => void
  mode?: FilterMode
}) {
  // Configuration based on mode
  const config = {
    'cho-thue': {
      priceMax: 10000000000, // 10 tỷ
      areaMax: 10000000, // 1.000 ha (in m²)
      pricePresets: [
        { label: 'Dưới 30 triệu', min: 0, max: 30000000 },
        { label: '30-100 triệu', min: 30000000, max: 100000000 },
        { label: '100-500 triệu', min: 100000000, max: 500000000 },
        { label: 'Trên 500 triệu', min: 500000000, max: 10000000000 },
      ],
      areaPresets: [
        { label: 'Dưới 1 ha', min: 0, max: 10000 },
        { label: '1-5 ha', min: 10000, max: 50000 },
        { label: '5-10 ha', min: 50000, max: 100000 },
        { label: 'Trên 10 ha', min: 100000, max: 10000000 },
      ],
    },
    'chuyen-nhuong': {
      priceMax: 500000000000, // 500 tỷ
      areaMax: 10000000, // 1.000 ha (in m²)
      pricePresets: [
        { label: 'Dưới 10 tỷ', min: 0, max: 10000000000 },
        { label: '10-50 tỷ', min: 10000000000, max: 50000000000 },
        { label: '50-200 tỷ', min: 50000000000, max: 200000000000 },
        { label: 'Trên 200 tỷ', min: 200000000000, max: 500000000000 },
      ],
      areaPresets: [
        { label: 'Dưới 1 ha', min: 0, max: 10000 },
        { label: '1-5 ha', min: 10000, max: 50000 },
        { label: '5-10 ha', min: 50000, max: 100000 },
        { label: 'Trên 10 ha', min: 100000, max: 10000000 },
      ],
    },
    'default': {
      priceMax: 500000,
      areaMax: 5000000,
      pricePresets: [
        { label: 'Dưới 50k', min: 0, max: 50000 },
        { label: '50k - 100k', min: 50000, max: 100000 },
        { label: '100k - 150k', min: 100000, max: 150000 },
        { label: '150k - 200k', min: 150000, max: 200000 },
        { label: 'Trên 200k', min: 200000, max: 500000 },
      ],
      areaPresets: [
        { label: 'Tối thiểu 10 ha', min: 100000, max: undefined },
        { label: 'Tối thiểu 50 ha', min: 500000, max: undefined },
        { label: 'Tối thiểu 100 ha', min: 1000000, max: undefined },
        { label: 'Tối thiểu 200 ha', min: 2000000, max: undefined },
      ],
    },
  }

  const currentConfig = config[mode]

  const [filters, setFilters] = useState<IndustrialParkFilter>({
    q: '',
    demand: undefined,
    province: undefined,
    district: undefined,
    rental_price_min: 0,
    rental_price_max: currentConfig.priceMax,
    available_area_min: 0,
    available_area_max: currentConfig.areaMax,
    industries: [],
    infrastructure: [],
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const emit = (next: Partial<IndustrialParkFilter>) => {
    const merged = { ...filters, ...next }
    setFilters(merged)
    onChange(merged)
  }

  // Options
  const demandOptions: Option[] = [
    { label: 'Thuê', value: 'rent' },
    { label: 'Mua sở hữu', value: 'buy' },
  ]

  const provinceOptions = useMemo(() => vnProvinces.map(p => ({ label: p, value: p })), [])
  const districtOptions = useMemo(() => {
    if (!filters.province) return []
    const districts = wardsByProvince[filters.province] || []
    return districts.map(d => ({ label: d, value: d }))
  }, [filters.province])

  const industryOptions: Option[] = [
    { label: 'Điện tử', value: 'dien-tu' },
    { label: 'Cơ khí', value: 'co-khi' },
    { label: 'May mặc', value: 'may-mac' },
    { label: 'Hóa chất', value: 'hoa-chat' },
    { label: 'Thực phẩm', value: 'thuc-pham' },
    { label: 'Dược phẩm', value: 'duoc-pham' },
    { label: 'Nông sản', value: 'nong-san' },
    { label: 'Gỗ & Đồ gỗ', value: 'go-do-go' },
    { label: 'Nhựa', value: 'nhua' },
    { label: 'Da giày', value: 'da-giay' },
    { label: 'Logistics', value: 'logistics' },
    { label: 'Kho bãi', value: 'kho-bai' },
  ]

  const infrastructureOptions: Option[] = [
    { label: 'Điện', value: 'power' },
    { label: 'Nước', value: 'water' },
    { label: 'Thoát nước', value: 'drainage' },
    { label: 'Xử lý chất thải', value: 'waste' },
    { label: 'Internet', value: 'internet' },
    { label: 'Đường nội bộ', value: 'road' },
    { label: 'An ninh 24/7', value: 'security' },
  ]

  const rentalPricePresets = currentConfig.pricePresets
  const areaPresets = currentConfig.areaPresets

  // Check if a price preset is active
  const isPricePresetActive = (preset: { min: number; max: number }) => {
    return filters.rental_price_min === preset.min && filters.rental_price_max === preset.max
  }

  // Check if an area preset is active (for range presets)
  const isAreaPresetActive = (preset: { min: number; max?: number }) => {
    if (preset.max !== undefined) {
      // Range preset
      return filters.available_area_min === preset.min && filters.available_area_max === preset.max
    } else {
      // Minimum only preset
      return filters.available_area_min === preset.min
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-[#2E8C4F]">Tìm kiếm khu công nghiệp</div>
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
        <div className="lg:col-span-4 relative">
          <input
            value={filters.q || ''}
            onChange={e => emit({ q: e.target.value })}
            placeholder="Nhập tên KCN, mã IIP hoặc từ khóa..."
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
        <div className="lg:col-span-3">
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
          <div className="text-sm text-[#2E8C4F] mb-1">
            {mode === 'cho-thue' ? 'Giá thuê' : mode === 'chuyen-nhuong' ? 'Giá chuyển nhượng' : 'Khoảng giá'}
          </div>
          <DualThumbPriceSlider
            min={0}
            max={currentConfig.priceMax}
            step={mode === 'cho-thue' ? 1000000 : mode === 'chuyen-nhuong' ? 1000000000 : 10000}
            value={[filters.rental_price_min || 0, filters.rental_price_max || currentConfig.priceMax]}
            onChange={v => emit({ rental_price_min: v[0], rental_price_max: v[1] })}
            formatter={n => {
              if (mode === 'chuyen-nhuong') {
                // Always show in tỷ for chuyen-nhuong (even 0)
                return `${(n / 1000000000).toFixed(1)} tỷ`
              }
              return `${n.toLocaleString('vi-VN')} đ`
            }}
            showQuickPresets={false}
          />
        </div>
        <div>
          <div className="text-sm text-[#2E8C4F] mb-1">Diện tích còn trống</div>
          <DualThumbPriceSlider
            min={0}
            max={currentConfig.areaMax}
            step={10000}
            value={[filters.available_area_min || 0, filters.available_area_max || currentConfig.areaMax]}
            onChange={v => emit({ available_area_min: v[0], available_area_max: v[1] })}
            formatter={n => `${(n / 10000).toFixed(1)} ha`}
            showQuickPresets={false}
          />
        </div>
      </div>

      {/* Price Quick Presets - Show based on mode */}
      {(mode === 'cho-thue' || mode === 'chuyen-nhuong') && (
        <div className="mt-3">
          <div className="text-xs text-gray-500 mb-2">
            {mode === 'cho-thue' ? 'Giá thuê phổ biến:' : 'Giá chuyển nhượng phổ biến:'}
          </div>
          <div className="flex flex-wrap gap-2">
            {rentalPricePresets.map(preset => {
              const isActive = isPricePresetActive(preset)
              return (
                <button
                  key={preset.label}
                  onClick={() => emit({ rental_price_min: preset.min, rental_price_max: preset.max })}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isActive
                      ? 'bg-white border-[#2E8C4F] text-[#2E8C4F]'
                      : 'bg-white border-gray-300 text-[#2E8C4F] hover:border-gray-400'
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Area Quick Presets - Always show */}
      <div className="mt-3">
        <div className="text-xs text-[#2E8C4F] mb-2">Diện tích còn trống:</div>
        <div className="flex flex-wrap gap-2">
          {areaPresets.map(preset => {
            const isActive = isAreaPresetActive(preset)
            return (
              <button
                key={preset.label}
                onClick={() => {
                  if (preset.max !== undefined) {
                    // Range preset
                    emit({ available_area_min: preset.min, available_area_max: preset.max })
                  } else {
                    // Minimum only preset
                    emit({ available_area_min: preset.min })
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  isActive
                    ? 'bg-white border-[#2E8C4F] text-[#2E8C4F]'
                    : 'bg-white border-gray-300 text-[#2E8C4F] hover:border-gray-400'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <MultiSelectDropdown
              label="Ngành nghề được phép"
              options={industryOptions}
              values={filters.industries || []}
              onChange={vals => emit({ industries: vals })}
              display="summary"
              showLabel={false}
              isOpen={activeDropdown === 'industries'}
              onOpen={() => setActiveDropdown('industries')}
              onClose={() => setActiveDropdown(null)}
            />
            <MultiSelectDropdown
              label="Hạ tầng"
              options={infrastructureOptions}
              values={filters.infrastructure || []}
              onChange={vals => emit({ infrastructure: vals })}
              display="summary"
              showLabel={false}
              isOpen={activeDropdown === 'infrastructure'}
              onOpen={() => setActiveDropdown('infrastructure')}
              onClose={() => setActiveDropdown(null)}
            />
          </div>

          {/* Reset Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                const reset: IndustrialParkFilter = {
                  q: '',
                  province: undefined,
                  district: undefined,
                  rental_price_min: 0,
                  rental_price_max: currentConfig.priceMax,
                  available_area_min: 0,
                  available_area_max: currentConfig.areaMax,
                  industries: [],
                  infrastructure: [],
                }
                setFilters(reset)
                onChange(reset)
              }}
              className="px-4 py-2 text-sm text-[#2E8C4F] hover:text-[#2E8C4F] border border-gray-200 rounded-lg hover:border-goldDark/50 transition-colors"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
