"use client"

import Link from 'next/link'
import { IndustrialPark } from '@/lib/types'
import { MapPin, Factory, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function IndustrialParkCard({ park }: { park: IndustrialPark }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(price) + ' đ/m²/tháng'
  }

  const formatArea = (area: number) => {
    return `${area.toFixed(1)} ha`
  }

  const getInfrastructureCount = () => {
    let count = 0
    if (park.infrastructure_power) count++
    if (park.infrastructure_water) count++
    if (park.infrastructure_drainage) count++
    if (park.infrastructure_waste) count++
    if (park.infrastructure_internet) count++
    if (park.infrastructure_road) count++
    if (park.infrastructure_security) count++
    return count
  }

  const infraCount = getInfrastructureCount()

  return (
    <motion.div
      initial={{ y: 20 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group h-full"
    >
      <Link href={`/kcn/${park.slug}`}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
          {/* Image */}
          <div className="relative h-56 overflow-hidden">
            <div
              className="absolute inset-0 bg-center bg-cover transform group-hover:scale-110 transition-transform duration-500"
              style={{ backgroundImage: `url(${park.thumbnail_url})` }}
            />
            {/* IIP Code Badge */}
            {park.code && (
              <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                {park.code}
              </div>
            )}
            {/* Infrastructure Badge */}
            <div className="absolute bottom-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-semibold bg-goldDark text-white flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {infraCount}/7 hạ tầng
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            {/* Title */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-goldDark transition-colors line-clamp-2 flex-1">
                {park.name}
              </h3>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">
                {park.district ? `${park.district}, ` : ''}{park.province}
              </span>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Factory className="w-4 h-4 text-goldDark shrink-0" />
                <div>
                  <div className="text-gray-500 text-xs">Tổng diện tích</div>
                  <div className="font-semibold text-gray-900">{formatArea(park.total_area)}</div>
                </div>
              </div>
              {park.available_area !== undefined && park.available_area > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 shrink-0" />
                  <div>
                    <div className="text-gray-500 text-xs">Còn trống</div>
                    <div className="font-semibold text-gray-900">{formatArea(park.available_area)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Industries */}
            {park.allowed_industries && park.allowed_industries.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Ngành nghề:</div>
                <div className="flex flex-wrap gap-1">
                  {park.allowed_industries.slice(0, 3).map(industry => (
                    <span
                      key={industry}
                      className="text-xs px-2 py-0.5 bg-goldLight/10 text-goldDark rounded-full"
                    >
                      {industry.replace('-', ' ')}
                    </span>
                  ))}
                  {park.allowed_industries.length > 3 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      +{park.allowed_industries.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {park.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{park.description}</p>
            )}

            {/* Price */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                {park.rental_price_min && park.rental_price_max && (
                  <>
                    <div className="text-xl font-bold text-goldDark">
                      {new Intl.NumberFormat('vi-VN').format(park.rental_price_min)} - {new Intl.NumberFormat('vi-VN').format(park.rental_price_max)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">đ/m²/tháng</div>
                  </>
                )}
                {(!park.rental_price_min || !park.rental_price_max) && (
                  <div className="text-sm text-gray-500">Liên hệ để biết giá</div>
                )}
              </div>
              <button className="px-4 py-2 bg-goldDark text-white text-sm font-semibold rounded-lg hover:bg-goldDark/90 transition-colors">
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
