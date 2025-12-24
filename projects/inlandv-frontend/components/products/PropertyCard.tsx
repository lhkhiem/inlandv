"use client"

import Link from 'next/link'
import { Property } from '@/lib/types'
import { Bed, Bath, Ruler, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PropertyCard({ property }: { property: Property }) {
  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)} tỷ`
    } else if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)} triệu`
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'nha-pho': 'Nhà phố',
      'can-ho': 'Căn hộ',
      'biet-thu': 'Biệt thự',
      'dat-nen': 'Đất nền',
      'shophouse': 'Shophouse',
      'nha-xuong': 'Nhà xưởng',
    }
    return labels[type] || type
  }

  return (
    <motion.div
      initial={{ y: 20 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group h-full"
    >
      <Link href={`/bat-dong-san/${property.slug}`}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
          {/* Image */}
          <div className="relative h-56 overflow-hidden">
            <div
              className="absolute inset-0 bg-center bg-cover transform group-hover:scale-110 transition-transform duration-500"
              style={{ backgroundImage: `url(${property.thumbnail_url})` }}
            />
            {/* Type Badge */}
            <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-semibold bg-goldDark text-white">
              {getTypeLabel(property.type)}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            {/* Title */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-goldDark transition-colors line-clamp-2 flex-1">
                {property.name}
              </h3>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">
                {property.district ? `${property.district}, ` : ''}{property.province}
              </span>
            </div>

            {/* Features */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-700">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-goldDark" />
                  <span>{property.bedrooms} PN</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-goldDark" />
                  <span>{property.bathrooms} WC</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Ruler className="w-4 h-4 text-goldDark" />
                <span>{property.area} m²</span>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{property.description}</p>
            )}

            {/* Price */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <div className="text-2xl font-bold text-goldDark">{formatPrice(property.price)}</div>
                {property.price_per_sqm && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {formatPrice(property.price_per_sqm)}/m²
                  </div>
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
