import React from 'react'
import { DollarSign } from 'lucide-react'
import InfoCard from './InfoCard'

interface PriceCardProps {
  type: 'property' | 'industrialPark'
  price?: number
  pricePerSqm?: number
  rentalPriceMin?: number
  rentalPriceMax?: number
  negotiable?: boolean
}

export const PriceCard: React.FC<PriceCardProps> = ({
  type,
  price,
  pricePerSqm,
  rentalPriceMin,
  rentalPriceMax,
  negotiable
}) => {
  return (
    <InfoCard title="Tầm giá" icon={DollarSign}>
      <div className="space-y-2 text-sm">
        {type === 'property' && (
          <>
            {price && (
              <div className="flex justify-between">
                <span className="text-gray-600">Giá bán:</span>
                <span className="font-semibold text-[#358b4e]">{price.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            {pricePerSqm && (
              <div className="flex justify-between">
                <span className="text-gray-600">Giá/m²:</span>
                <span className="font-medium">{pricePerSqm.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            {negotiable && (
              <div className="mt-2 text-xs text-amber-600 font-medium">* Giá có thể thương lượng</div>
            )}
          </>
        )}
        {type === 'industrialPark' && (
          <>
            {rentalPriceMin && rentalPriceMax && (
              <div className="flex justify-between">
                <span className="text-gray-600">Giá thuê:</span>
                <span className="font-semibold text-[#358b4e]">
                  {rentalPriceMin.toLocaleString('vi-VN')} - {rentalPriceMax.toLocaleString('vi-VN')}₫/m²/tháng
                </span>
              </div>
            )}
            {rentalPriceMin && !rentalPriceMax && (
              <div className="flex justify-between">
                <span className="text-gray-600">Giá thuê:</span>
                <span className="font-semibold text-[#358b4e]">Từ {rentalPriceMin.toLocaleString('vi-VN')}₫/m²/tháng</span>
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">* Giá tham khảo, liên hệ để biết thêm chi tiết</div>
          </>
        )}
        {!price && !rentalPriceMin && (
          <div className="text-sm text-gray-500">Liên hệ để biết giá</div>
        )}
      </div>
    </InfoCard>
  )
}

export default PriceCard
